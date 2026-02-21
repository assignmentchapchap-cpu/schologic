'use server';

import { createSessionClient } from '@schologic/database';
import { cookies } from 'next/headers';
import { fetchWithCache, invalidateCache } from '@/lib/cache';

export async function getStudentPracticumDetails(practicumId: string) {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized', data: null };
    }

    try {
        const cacheKey = `student:practicum_details:${practicumId}:${user.id}`;

        const data = await fetchWithCache(cacheKey, async () => {
            const [enrollRes, logsRes, resourcesRes] = await Promise.all([
                supabase.from('practicum_enrollments')
                    .select('*, practicums(*)')
                    .eq('student_id', user.id)
                    .eq('practicum_id', practicumId)
                    .single(),
                supabase.from('practicum_logs')
                    .select('*')
                    .eq('practicum_id', practicumId)
                    .eq('student_id', user.id)
                    .order('log_date', { ascending: false }),
                supabase.from('practicum_resources')
                    .select('*')
                    .eq('practicum_id', practicumId)
            ]);

            if (enrollRes.error) throw enrollRes.error;

            return {
                enrollment: enrollRes.data,
                practicum: enrollRes.data.practicums,
                logs: logsRes.data || [],
                resources: resourcesRes.data || []
            };
        }, 300); // 5 mins TTL

        return { data, error: null };
    } catch (err: any) {
        console.error('getStudentPracticumDetails Error:', err);
        return { error: err.message, data: null };
    }
}

export async function invalidateStudentPracticumDetails(practicumId: string) {
    if (!practicumId) return;
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await invalidateCache(`student:practicum_details:${practicumId}:${user.id}`);
    }
}
