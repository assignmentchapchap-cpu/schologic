'use server';

import { createSessionClient } from '@schologic/database';
import { cookies } from 'next/headers';
import { fetchWithCache, invalidateCache } from '@/lib/cache';

export async function getInboxMessages() {
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
