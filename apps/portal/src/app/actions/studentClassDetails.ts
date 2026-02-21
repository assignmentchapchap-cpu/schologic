'use server';

import { createSessionClient } from '@schologic/database';
import { cookies } from 'next/headers';
import { fetchWithCache, invalidateCache } from '@/lib/cache';

export async function getStudentClassDetails(classId: string) {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized', data: null };
    }

    try {
        const cacheKey = `student:class_details:${classId}:${user.id}`;

        const data = await fetchWithCache(cacheKey, async () => {
            const clsQuery = supabase.from('classes').select('*, profiles:instructor_id(full_name, title)').eq('id', classId).single();
            const assignQuery = supabase.from('assignments').select('*').eq('class_id', classId).order('due_date', { ascending: true });
            const resQuery = supabase.from('class_assets').select('*, assets(*)').eq('class_id', classId).order('added_at', { ascending: false });
            const enrollQuery = supabase.from('enrollments').select(`id, student_id, joined_at, profiles:student_id (full_name, email, avatar_url, registration_number)`).eq('class_id', classId);
            const subQuery = supabase.from('submissions').select('assignment_id, grade').eq('class_id', classId).eq('student_id', user.id);

            const [clsRes, assignRes, resRes, enrollRes, subRes] = await Promise.all([
                clsQuery,
                assignQuery,
                resQuery,
                enrollQuery,
                subQuery
            ]);

            if (clsRes.error) throw clsRes.error;

            return {
                classData: {
                    ...clsRes.data,
                    instructor_profile: clsRes.data.profiles
                },
                assignments: assignRes.data || [],
                resources: resRes.data || [],
                enrollments: enrollRes.data || [],
                submissions: subRes.data || []
            };
        }, 300); // 5 mins TTL

        return { data, error: null };
    } catch (err: any) {
        console.error('getStudentClassDetails Error:', err);
        return { error: err.message, data: null };
    }
}

export async function invalidateStudentClassDetails(classId: string, studentId: string) {
    if (!classId || !studentId) return;
    await invalidateCache(`student:class_details:${classId}:${studentId}`);
}
