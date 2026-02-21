'use server';

import { createSessionClient } from '@schologic/database';
import { cookies } from 'next/headers';
import { fetchWithCache, invalidateCache } from '@/lib/cache';

export async function getInstructorPracticums() {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized', data: null };
    }

    try {
        const cacheKey = `inst:practicums:${user.id}`;

        const data = await fetchWithCache(cacheKey, async () => {
            const { data, error } = await supabase
                .from('practicums')
                .select('*, practicum_enrollments(id)')
                .eq('instructor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }, 600); // 10 mins TTL

        return { data, error: null };
    } catch (err: any) {
        console.error('getInstructorPracticums Error:', err);
        return { error: err.message, data: null };
    }
}

export async function invalidateInstructorPracticums(userId: string) {
    if (!userId) return;
    await invalidateCache(`inst:practicums:${userId}`);
}
