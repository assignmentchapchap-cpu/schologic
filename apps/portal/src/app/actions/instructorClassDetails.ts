'use server';

import { createSessionClient } from '@schologic/database';
import { cookies } from 'next/headers';
import { fetchWithCache, invalidateCache } from '@/lib/cache';

export async function getInstructorClassDetails(classId: string) {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized', data: null };
    }

    try {
        const cacheKey = `inst:class_details:${classId}`;

        const data = await fetchWithCache(cacheKey, async () => {
            const clsQuery = supabase.from('classes').select('*').eq('id', classId).single();
            const assignQuery = supabase.from('assignments').select('*, short_code').eq('class_id', classId).order('due_date', { ascending: true });
            const enrollQuery = supabase.from('enrollments').select(`id, student_id, joined_at, profiles:student_id (full_name, email, avatar_url, registration_number)`).eq('class_id', classId);
            const resQuery = supabase.from('class_assets').select('*, assets(*)').eq('class_id', classId).order('added_at', { ascending: false });
            const profileQuery = supabase.from('profiles').select('settings').eq('id', user.id).single();
            const subQuery = supabase.from('submissions').select('*').eq('class_id', classId);

            const [clsRes, assignRes, enrollRes, resRes, profileRes, subRes] = await Promise.all([
                clsQuery,
                assignQuery,
                enrollQuery,
                resQuery,
                profileQuery,
                subQuery
            ]);

            if (clsRes.error) throw clsRes.error;

            return {
                classData: clsRes.data,
                assignments: assignRes.data || [],
                enrollments: enrollRes.data || [],
                resources: resRes.data || [],
                profileSettings: profileRes.data?.settings || null,
                submissions: subRes.data || []
            };
        }, 300); // 5 mins TTL

        return { data, error: null };
    } catch (err: any) {
        console.error('getInstructorClassDetails Error:', err);
        return { error: err.message, data: null };
    }
}

export async function invalidateInstructorClassDetails(classId: string) {
    if (!classId) return;
    await invalidateCache(`inst:class_details:${classId}`);
}
