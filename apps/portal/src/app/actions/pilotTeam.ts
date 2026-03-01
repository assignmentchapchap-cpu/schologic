'use server';

import { createSessionClient } from '@schologic/database';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Helpers ───────────────────────────────────────────────

async function syncTaskAssignments(
    supabase: any,
    pilotRequestId: string,
    userId: string,
    tabPermissions: Record<string, string> | null // null means clear all
) {
    const { data: pilot, error: fetchError } = await (supabase
        .from('pilot_requests')
        .select('*')
        .eq('id', pilotRequestId)
        .single() as any);

    if (fetchError || !pilot) return;

    const tasks = (pilot.tasks_jsonb || []) as any[];

    const updatedTasks = tasks.map(task => {
        const currentAssignments = task.assignments || {};
        let newAssignments = { ...currentAssignments };

        if (tabPermissions === null) {
            // Remove user from assignments
            const { [userId]: _, ...rest } = newAssignments;
            newAssignments = rest;
        } else {
            // Apply permission from tab (normalized key)
            const permission = tabPermissions[task.tab] || 'none';
            newAssignments[userId] = permission as "none" | "read" | "write";
        }

        // Remove the legacy assigned_to field if it exists
        const { assigned_to, ...taskWithoutLegacy } = task;
        return { ...taskWithoutLegacy, assignments: newAssignments };
    });

    await (supabase
        .from('pilot_requests')
        .update({ tasks_jsonb: updatedTasks } as any)
        .eq('id', pilotRequestId) as any);
}

async function syncMemberPermissionFromTasks(
    supabase: any,
    pilotRequestId: string,
    userId: string,
    tab: string
) {
    // Fetch all tasks for this pilot to check user's total assignments in this tab
    const { data: pilot } = await (supabase
        .from('pilot_requests')
        .select('*')
        .eq('id', pilotRequestId)
        .single() as any);

    if (!pilot) return;

    const tasks = (pilot.tasks_jsonb || []) as any[];

    // Determine highest permission level across all tasks in this tab for this user
    let maxPermission: 'none' | 'read' | 'write' = 'none';
    tasks.forEach(t => {
        if (t.tab === tab) {
            const perm = t.assignments?.[userId] || 'none';
            if (perm === 'write') maxPermission = 'write';
            else if (perm === 'read' && maxPermission === 'none') maxPermission = 'read';
        }
    });

    // Fetch current member record
    const { data: member } = await supabase
        .from('pilot_team_members')
        .select('id, tab_permissions_jsonb')
        .eq('pilot_request_id', pilotRequestId)
        .eq('user_id', userId)
        .single();

    if (!member) return;

    const currentPerms = member.tab_permissions_jsonb || {};
    const newPerms = { ...currentPerms };

    // Update tab permission to match highest task assignment
    newPerms[tab] = maxPermission;

    if (JSON.stringify(newPerms) !== JSON.stringify(currentPerms)) {
        await supabase
            .from('pilot_team_members')
            .update({ tab_permissions_jsonb: newPerms })
            .eq('id', member.id);

        // Invalidate identity cache
        const { invalidateUserIdentity } = require('@/lib/identity-server');
        await invalidateUserIdentity(userId);
    }
}

async function getAuthenticatedChampion() {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized');

    const { data: membership } = await supabase
        .from('pilot_team_members')
        .select('id, user_id, pilot_request_id, is_champion, tab_permissions_jsonb')
        .eq('user_id', user.id)
        .limit(1)
        .single();

    if (!membership) throw new Error('No pilot access found.');
    return { supabase, user, membership };
}

// ─── Get Team Members ──────────────────────────────────────

export async function getTeamMembers() {
    try {
        const { supabase, membership } = await getAuthenticatedChampion();

        const { data: members, error } = await supabase
            .from('pilot_team_members')
            .select(`
                id,
                user_id,
                is_champion,
                tab_permissions_jsonb,
                status,
                joined_at,
                last_active_at,
                created_at,
                profiles:user_id (
                    first_name,
                    last_name,
                    email
                )
            `)
            .eq('pilot_request_id', membership.pilot_request_id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return { data: members || [] };
    } catch (err: any) {
        console.error('getTeamMembers Error:', err);
        return { error: err.message || 'Failed to fetch team members.' };
    }
}

// ─── Invite Team Member ────────────────────────────────────

export async function inviteTeamMember({
    firstName,
    lastName,
    email,
    tabPermissions,
}: {
    firstName: string;
    lastName: string;
    email: string;
    tabPermissions: Record<string, string>;
}) {
    try {
        const { supabase, membership } = await getAuthenticatedChampion();

        if (!membership.is_champion) {
            throw new Error('Only the Champion can invite team members.');
        }

        // Check current member count (max 5)
        const { count } = await supabase
            .from('pilot_team_members')
            .select('id', { count: 'exact', head: true })
            .eq('pilot_request_id', membership.pilot_request_id);

        if ((count || 0) >= 5) {
            throw new Error('Maximum of 5 team members reached.');
        }

        // Generate a random password for initial account
        const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 16) + '!A1';

        // Create auth user with instructor role
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { role: 'instructor', first_name: firstName, last_name: lastName },
            app_metadata: { role: 'instructor' },
        });

        if (authError) {
            // If user already exists, try to find them
            if (authError.message?.includes('already been registered')) {
                const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
                const existingUser = users?.find(u => u.email === email);
                if (!existingUser) throw new Error('User exists but could not be found.');

                // Add them to the team
                const { error: memberError } = await supabase
                    .from('pilot_team_members')
                    .insert({
                        pilot_request_id: membership.pilot_request_id,
                        user_id: existingUser.id,
                        is_champion: false,
                        tab_permissions_jsonb: tabPermissions,
                        status: 'invited'
                    });

                if (memberError) throw memberError;

                // Sync assignments
                await syncTaskAssignments(supabase, membership.pilot_request_id, existingUser.id, tabPermissions);

                return { success: true, userId: existingUser.id };
            }
            throw authError;
        }

        const newUserId = authData.user.id;

        // Upsert profile
        await supabaseAdmin.from('profiles').upsert({
            id: newUserId,
            first_name: firstName,
            last_name: lastName,
            email,
            role: 'instructor',
        });

        // Add to pilot team
        const { error: memberError } = await supabase
            .from('pilot_team_members')
            .insert({
                pilot_request_id: membership.pilot_request_id,
                user_id: newUserId,
                is_champion: false,
                tab_permissions_jsonb: tabPermissions,
                status: 'invited'
            });

        if (memberError) throw memberError;

        // Sync assignments
        await syncTaskAssignments(supabase, membership.pilot_request_id, newUserId, tabPermissions);

        // Send invite email
        try {
            await resend.emails.send({
                from: 'Schologic Pilots <pilots@schologic.com>',
                to: email,
                subject: 'You\'ve been invited to a Schologic Pilot',
                html: `
                    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
                        <h2 style="color: #1e293b;">Welcome to the Pilot Team!</h2>
                        <p style="color: #475569;">Hi ${firstName},</p>
                        <p style="color: #475569;">You've been invited to join a Schologic pilot program. Visit the link below to set up your account:</p>
                        <a href="${process.env.NEXT_PUBLIC_PILOT_URL || 'https://pilot.schologic.com'}/setup"
                           style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                            Set Up Your Account
                        </a>
                        <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">— The Schologic Team</p>
                    </div>
                `,
            });
        } catch (emailErr) {
            console.error('Invite email failed (non-blocking):', emailErr);
        }

        return { success: true, userId: newUserId };
    } catch (err: any) {
        console.error('inviteTeamMember Error:', err);
        return { error: err.message || 'Failed to invite team member.' };
    }
}

// ─── Update Member ─────────────────────────────────────────

export async function updateMember(
    memberId: string,
    firstName: string,
    lastName: string,
    tabPermissions: Record<string, string>
) {
    try {
        const { supabase, membership } = await getAuthenticatedChampion();

        if (!membership.is_champion) {
            throw new Error('Only the Champion can update team members.');
        }

        // 1. Get user_id for this member
        const { data: memberRecord, error: fetchError } = await supabase
            .from('pilot_team_members')
            .select('user_id')
            .eq('id', memberId)
            .single();

        if (fetchError || !memberRecord) throw new Error('Member not found.');

        // 2. Update Pilot Team Member permissions
        const { error: memberError } = await supabase
            .from('pilot_team_members')
            .update({ tab_permissions_jsonb: tabPermissions })
            .eq('id', memberId)
            .eq('pilot_request_id', membership.pilot_request_id);

        if (memberError) throw memberError;

        // 3. Update Profile (firstName/lastName)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ first_name: firstName, last_name: lastName })
            .eq('id', memberRecord.user_id);

        if (profileError) throw profileError;

        // 4. Sync assignments
        await syncTaskAssignments(supabase, membership.pilot_request_id, memberRecord.user_id, tabPermissions);

        return { success: true };
    } catch (err: any) {
        console.error('updateMember Error:', err);
        return { error: err.message || 'Failed to update member.' };
    }
}

// ─── Remove Team Member ────────────────────────────────────

export async function removeTeamMember(memberId: string) {
    try {
        const { supabase, membership } = await getAuthenticatedChampion();

        if (!membership.is_champion) {
            throw new Error('Only the Champion can remove members.');
        }

        // Prevent self-removal
        if (memberId === membership.id) {
            throw new Error('The Champion cannot remove themselves.');
        }

        // 1. Get user_id before deletion
        const { data: member } = await supabase
            .from('pilot_team_members')
            .select('user_id')
            .eq('id', memberId)
            .single();

        if (member) {
            // 2. Clear assignments
            await syncTaskAssignments(supabase, membership.pilot_request_id, member.user_id, null);
        }

        // 3. Delete member
        const { error: deleteError } = await supabase
            .from('pilot_team_members')
            .delete()
            .eq('id', memberId)
            .eq('pilot_request_id', membership.pilot_request_id);

        if (deleteError) throw deleteError;

        return { success: true };
    } catch (err: any) {
        console.error('removeTeamMember Error:', err);
        return { error: err.message || 'Failed to remove team member.' };
    }
}

// ─── Update Task Assignment ────────────────────────────────

export async function updateTaskAssignment(
    taskId: string,
    userId: string | null,
    tab: string
) {
    try {
        const { supabase, membership } = await getAuthenticatedChampion();
        if (!membership.is_champion) throw new Error('Unauthorized');

        const { data: pilot } = await (supabase
            .from('pilot_requests')
            .select('*')
            .eq('id', membership.pilot_request_id)
            .single() as any);

        if (!pilot) throw new Error('Pilot not found');

        const tasks = (pilot.tasks_jsonb || []) as any[];
        let targetUserId = userId;
        const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
                // Find current user with 'write' access
                const currentUserId = Object.entries(t.assignments || {})
                    .find(([_, level]) => level === 'write')?.[0];

                // If we are reassigning or unassigning, we need to know who WAS assigned to sync them
                if (!userId || userId !== currentUserId) {
                    targetUserId = currentUserId || null;
                }

                const newAssignments = { ...(t.assignments || {}) };
                if (userId) {
                    newAssignments[userId] = "write";
                }

                // If there was a previous write assignee and they are NOT the new one, demote them in THIS task
                if (currentUserId && currentUserId !== userId) {
                    newAssignments[currentUserId] = "none";
                }

                return { ...t, assignments: newAssignments };
            }
            return t;
        });

        // 1. Update Tasks
        const { error: updateError } = await (supabase
            .from('pilot_requests')
            .update({ tasks_jsonb: updatedTasks } as any)
            .eq('id', membership.pilot_request_id) as any);

        if (updateError) throw updateError;

        // 2. Propagate to Tab Permissions (Reverse Sync)
        if (userId) {
            await syncMemberPermissionFromTasks(supabase, membership.pilot_request_id, userId, tab);
        }
        if (targetUserId && targetUserId !== userId) {
            await syncMemberPermissionFromTasks(supabase, membership.pilot_request_id, targetUserId, tab);
        }

        return { success: true };
    } catch (err: any) {
        console.error('updateTaskAssignment Error:', err);
        return { error: err.message || 'Failed to update task assignment.' };
    }
}

/**
 * Tracks user activity and transitions status from 'invited' to 'joined'.
 * Called automatically from the PilotPortalLayout on every server-side render.
 */
export async function recordMemberPresence() {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return { error: 'Unauthorized' };

        // Fetch current membership to check status
        const { data: membership, error: fetchError } = await (supabase
            .from('pilot_team_members')
            .select('id, status, joined_at')
            .eq('user_id', user.id)
            .limit(1)
            .single() as any);

        if (fetchError || !membership) return { error: 'Not a pilot member' };

        const updates: any = {
            last_active_at: new Date().toISOString()
        };

        // Transition to joined if still invited
        if (membership.status === 'invited') {
            updates.status = 'joined';
            if (!membership.joined_at) {
                updates.joined_at = new Date().toISOString();
            }

            // Invalidate identity cache to reflect the joined state
            const { invalidateUserIdentity } = require('@/lib/identity-server');
            await invalidateUserIdentity(user.id);
        }

        const { error: updateError } = await supabaseAdmin
            .from('pilot_team_members')
            .update(updates)
            .eq('id', membership.id);

        if (updateError) throw updateError;

        return { success: true };
    } catch (err: any) {
        console.error('[recordMemberPresence] Error:', err);
        return { error: 'Failed' };
    }
}
