'use server';

import { createSessionClient } from '@schologic/database';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { fetchWithCache, invalidateCache } from '@/lib/cache';

// Admin client bypasses RLS — needed for discussion messages visible to all team members
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Returns the superadmin's user ID and name for the "Support" channel.
 * The superadmin role lives in auth app_metadata (not profiles.role),
 * so we must check auth users via admin API.
 */
export async function getSuperadminId(): Promise<{ data: { id: string; name: string } | null; error: string | null }> {
    try {
        // No authentication required to look up who the admin is

        console.log('[getSuperadminId] Starting lookup in DB...');

        // Strategy 1: Search auth users for app_metadata.role = 'superadmin'
        let page = 1;
        const perPage = 50;
        let authAdminId = null;
        let authAdminName = 'Support';

        while (page <= 20) { // safety cap at 1000 users
            const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
                page,
                perPage,
            });
            if (listError) {
                console.error('[getSuperadminId] Auth list error:', listError);
                break;
            }
            if (!users || users.length === 0) break;

            const adminUser = users.find(u =>
                u.app_metadata?.role === 'superadmin' ||
                u.user_metadata?.role === 'superadmin'
            );

            if (adminUser) {
                authAdminId = adminUser.id;
                console.log(`[getSuperadminId] Found superadmin in auth users: ${authAdminId}`);

                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('full_name')
                    .eq('id', authAdminId)
                    .single();

                authAdminName = (profile?.full_name as string) || adminUser.email || 'Support';
                break;
            }

            if (users.length < perPage) break; // last page
            page++;
        }

        if (authAdminId) {
            console.log(`[getSuperadminId] Returning from auth strategy: ${authAdminId}`);
            return { data: { id: authAdminId, name: authAdminName }, error: null };
        }

        console.log('[getSuperadminId] Auth strategy failed, trying profiles strategy...');

        // Strategy 2: Fallback — profiles.role (in case it was synced)
        const { data: admins, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'superadmin')
            .limit(1);

        if (profileError) {
            console.error('[getSuperadminId] Profile query error:', profileError);
        }

        if (admins && admins.length > 0) {
            console.log(`[getSuperadminId] Found superadmin in profiles: ${admins[0].id}`);
            return { data: { id: admins[0].id as string, name: (admins[0].full_name as string) || 'Support' }, error: null };
        }

        console.log('[getSuperadminId] No superadmin found in DB at all.');
        return { data: null, error: 'No superadmin found' };
    } catch (err: any) {
        console.error('[getSuperadminId] Exception:', err);
        return { data: null, error: err.message };
    }
}

/**
 * Fetches all discussion board messages for a pilot.
 * Uses admin client to bypass RLS — discussion messages are visible to all team members.
 */
export async function getPilotDiscussionMessages(pilotRequestId: string, _t?: number) {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);

        // Verify auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return { data: null, error: 'Unauthorized' };

        // Verify the user is a member of this pilot
        const { data: membership } = await supabase
            .from('pilot_team_members')
            .select('id')
            .eq('user_id', user.id)
            .eq('pilot_request_id', pilotRequestId)
            .limit(1)
            .single();

        if (!membership) return { data: null, error: 'Not a team member' };

        const cacheKey = `pilot:discussion:${pilotRequestId}:${user.id}`;

        const data = await fetchWithCache(cacheKey, async () => {
            // Use admin client to bypass RLS and fetch ALL discussion messages
            const { data: messages, error } = await supabaseAdmin
                .from('messages')
                .select('*')
                .eq('broadcast_id', pilotRequestId)
                .order('created_at', { ascending: true })
                .limit(200);

            if (error) throw error;
            return messages;
        }, 10); // 10s TTL — short enough for polling to pick up new messages

        return { data, error: null };
    } catch (err: any) {
        console.error('getPilotDiscussionMessages Error:', err);
        return { data: null, error: err.message };
    }
}

/**
 * Sends a discussion message visible to all team members.
 * Uses admin client to insert (bypasses RLS).
 * receiver_id is set to pilotRequestId as a group identifier.
 */
export async function sendPilotDiscussionMessage(pilotRequestId: string, content: string) {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);

        // Verify auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return { data: null, error: 'Unauthorized' };

        // Verify membership
        const { data: membership } = await (supabase
            .from('pilot_team_members')
            .select('id, status')
            .eq('user_id', user.id)
            .eq('pilot_request_id', pilotRequestId)
            .limit(1)
            .single() as any);

        if (!membership || membership.status !== 'joined') {
            return { data: null, error: 'Not a joined team member' };
        }

        // Insert via admin client (bypasses RLS)
        const { data, error } = await supabaseAdmin
            .from('messages')
            .insert({
                sender_id: user.id,
                receiver_id: user.id, // Must be a valid user UUID (FK constraint); admin-client fetch ensures all members see it
                subject: null,
                content: content.trim(),
                parent_id: null,
                broadcast_id: pilotRequestId,
                is_read: false,
            })
            .select()
            .single();

        if (error) throw error;

        // Invalidate discussion cache for all members
        const { data: members } = await supabaseAdmin
            .from('pilot_team_members')
            .select('user_id')
            .eq('pilot_request_id', pilotRequestId)
            .eq('status', 'joined');

        if (members) {
            await Promise.all(
                members.map(m => invalidateCache(`pilot:discussion:${pilotRequestId}:${m.user_id}`))
            );
        }

        // Fire a broadcast event so active clients refetch instantly without polling
        // Guarantee the serverless function stays alive until the websocket broadcast completes
        if (data) {
            const channel = supabaseAdmin.channel(`pilot-messages-${pilotRequestId}`);
            await new Promise((resolve) => {
                channel.subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.send({
                            type: 'broadcast',
                            event: 'new_discussion_message',
                            payload: { message: data, messageId: data.id, senderId: user.id }
                        });
                        supabaseAdmin.removeChannel(channel);
                        resolve(true);
                    } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
                        resolve(false);
                    }
                });
                setTimeout(() => resolve(false), 2000); // Failsafe
            });
        }

        return { data, error: null };
    } catch (err: any) {
        console.error('sendPilotDiscussionMessage Error:', err);
        return { data: null, error: err.message };
    }
}

/**
 * Invalidates discussion cache for a specific user.
 */
export async function invalidatePilotDiscussion(pilotRequestId: string, userId?: string) {
    if (userId) {
        await invalidateCache(`pilot:discussion:${pilotRequestId}:${userId}`);
    }
    // Also invalidate with a wildcard-like approach for any cached entries
    // Since we can't truly wildcard, we rely on the per-user invalidation in sendPilotDiscussionMessage
}
