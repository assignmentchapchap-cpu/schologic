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
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return { data: null, error: 'Unauthorized' };

        // Check cache first
        const cached = await fetchWithCache('pilot:superadmin_info', async () => {
            // Strategy 1: env var (instant)
            const envAdminId = process.env.SUPERADMIN_USER_ID;
            if (envAdminId) {
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('full_name')
                    .eq('id', envAdminId)
                    .single();
                return { id: envAdminId, name: (profile?.full_name as string) || 'Support' };
            }

            // Strategy 2: Search auth users for app_metadata.role = 'superadmin'
            let page = 1;
            const perPage = 50;
            while (page <= 20) { // safety cap at 1000 users
                const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
                    page,
                    perPage,
                });
                if (listError || !users || users.length === 0) break;

                const adminUser = users.find(u =>
                    u.app_metadata?.role === 'superadmin' ||
                    u.user_metadata?.role === 'superadmin'
                );

                if (adminUser) {
                    const { data: profile } = await supabaseAdmin
                        .from('profiles')
                        .select('full_name')
                        .eq('id', adminUser.id)
                        .single();
                    return { id: adminUser.id, name: (profile?.full_name as string) || adminUser.email || 'Support' };
                }

                if (users.length < perPage) break; // last page
                page++;
            }

            // Strategy 3: Fallback — profiles.role (in case it was synced)
            const { data: admins } = await supabaseAdmin
                .from('profiles')
                .select('id, full_name')
                .eq('role', 'superadmin')
                .limit(1);
            if (admins && admins.length > 0) {
                return { id: admins[0].id as string, name: (admins[0].full_name as string) || 'Support' };
            }

            return null;
        }, 600); // 10 min cache

        return { data: cached, error: cached ? null : 'No superadmin found' };
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
