'use server';

import { createSessionClient } from '@schologic/database';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { fetchWithCache, invalidateCache } from '@/lib/cache';
import { sendTelegramNotification } from '@/lib/telegram';
import { getSuperadminId } from './pilotMessaging';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function getInboxMessages(_t?: number) {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized', data: null };
    }

    try {
        const cacheKey = `messages:inbox:${user.id}`;

        const data = await fetchWithCache(cacheKey, async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            return data;
        }, 300); // 5 mins TTL

        return { data, error: null };
    } catch (err: any) {
        console.error('getInboxMessages Error:', err);
        return { error: err.message, data: null };
    }
}

export async function invalidateInboxMessages(userIds: string[]) {
    if (!userIds || userIds.length === 0) return;

    // Invalidate caches concurrently
    await Promise.all(
        userIds.map(id => invalidateCache(`messages:inbox:${id}`))
    );
}

export async function sendDirectMessageAction(
    receiverId: string,
    content: string,
    subject: string | null = null,
    parentId: string | null = null,
    broadcastId: string | null = null
) {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return { data: null, error: 'Unauthorized' };

        // Insert via regular authenticated client to ensure RLS policies apply appropriately
        const { data, error } = await supabase
            .from('messages')
            .insert({
                sender_id: user.id,
                receiver_id: receiverId,
                subject: user.role === 'student' ? null : subject,
                content,
                parent_id: parentId,
                broadcast_id: user.role === 'student' ? null : broadcastId,
                is_read: false
            })
            .select()
            .single();

        if (error) throw error;

        if (data) {
            await invalidateInboxMessages([user.id, receiverId]);

            // Notify Superadmin via Telegram if they're the receiver
            const { data: adminData } = await getSuperadminId();
            if (adminData && receiverId === adminData.id) {
                sendTelegramNotification({
                    message: `New DM from ${user.email || 'a user'}: ${content.substring(0, 200)}`,
                    type: 'dm_received',
                    link: '/admin/messages',
                }).catch(() => { });
            }

            // Fire broadcast event securely via Admin client so we don't have to subscribe on the client side
            // Guarantee the serverless function stays alive until the websocket broadcast completes
            const channel = supabaseAdmin.channel(`messages-${receiverId}`);
            await new Promise((resolve) => {
                channel.subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.send({
                            type: 'broadcast',
                            event: 'new_dm',
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
        console.error('sendDirectMessageAction Error:', err);
        return { data: null, error: err.message };
    }
}
