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

async function getAuthenticatedChampion() {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized');

    const { data: membership } = await supabase
        .from('pilot_team_members')
        .select('id, pilot_request_id, is_champion, tab_permissions_jsonb')
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
                    });

                if (memberError) throw memberError;

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
            });

        if (memberError) throw memberError;

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

// ─── Update Member Permissions ─────────────────────────────

export async function updateMemberPermissions(
    memberId: string,
    tabPermissions: Record<string, string>
) {
    try {
        const { supabase, membership } = await getAuthenticatedChampion();

        if (!membership.is_champion) {
            throw new Error('Only the Champion can update permissions.');
        }

        const { error } = await supabase
            .from('pilot_team_members')
            .update({ tab_permissions_jsonb: tabPermissions })
            .eq('id', memberId)
            .eq('pilot_request_id', membership.pilot_request_id);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error('updateMemberPermissions Error:', err);
        return { error: err.message || 'Failed to update permissions.' };
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

        const { error } = await supabase
            .from('pilot_team_members')
            .delete()
            .eq('id', memberId)
            .eq('pilot_request_id', membership.pilot_request_id);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error('removeTeamMember Error:', err);
        return { error: err.message || 'Failed to remove team member.' };
    }
}
