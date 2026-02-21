'use server';

import { createSessionClient } from '@schologic/database';
import { cookies } from 'next/headers';
import { fetchWithCache, invalidateCache } from '@/lib/cache';

export async function getInstructorPracticumDetails(practicumId: string) {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized', data: null };
    }

    try {
        const cacheKey = `inst:practicum_details:${practicumId}`;

        const data = await fetchWithCache(cacheKey, async () => {
            const [pracRes, enrollRes] = await Promise.all([
                supabase.from('practicums').select('*').eq('id', practicumId).single(),
                supabase.from('practicum_enrollments')
                    .select('*, profiles:student_id(*)')
                    .eq('practicum_id', practicumId)
                    .neq('status', 'draft')
            ]);

            if (pracRes.error) throw pracRes.error;

            return {
                practicum: pracRes.data,
                enrollments: enrollRes.data || []
            };
        }, 300); // 5 mins TTL

        return { data, error: null };
    } catch (err: any) {
        console.error('getInstructorPracticumDetails Error:', err);
        return { error: err.message, data: null };
    }
}

export async function invalidateInstructorPracticumDetails(practicumId: string) {
    if (!practicumId) return;
    await invalidateCache(`inst:practicum_details:${practicumId}`);
}
