'use server';

import { createSessionClient } from '@schologic/database';
import { cookies } from 'next/headers';
import { fetchWithCache } from '@/lib/cache';

export async function getInstructorDashboardData() {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized', data: null };
    }

    const userId = user.id;

    try {
        const cacheKey = `inst:dash:${userId}`;

        const data = await fetchWithCache(cacheKey, async () => {
            // Fetch Profile Name
            const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name, full_name')
                .eq('id', userId)
                .single();

            let firstName = 'Instructor';
            if (profile) {
                if (profile.first_name) {
                    firstName = profile.first_name;
                } else if (profile.full_name) {
                    firstName = profile.full_name.split(' ')[0];
                }
            } else if (user.user_metadata?.first_name) {
                firstName = user.user_metadata.first_name;
            } else if (user.user_metadata?.full_name) {
                firstName = user.user_metadata.full_name.split(' ')[0];
            }

            // Fetch Classes for Instructor
            const { data: classes } = await supabase
                .from('classes')
                .select('*')
                .eq('instructor_id', userId);

            if (!classes || classes.length === 0) {
                return {
                    firstName,
                    classes: [],
                    allSubmissions: [],
                    allAssignments: [],
                    allEnrollments: [],
                    allResources: [],
                    allEvents: []
                };
            }

            const classIds = classes.map((c: any) => c.id);

            // Parallel aggregate queries inside classes scope
            const [
                submissionsRes,
                assignmentsRes,
                enrollmentsRes,
                resourcesRes,
                eventsRes
            ] = await Promise.all([
                supabase.from('submissions').select('*').in('class_id', classIds),
                supabase.from('assignments').select('*').in('class_id', classIds),
                supabase.from('enrollments').select('*, profiles:student_id(*)').in('class_id', classIds),
                supabase.from('class_assets').select('*, assets(*)').in('class_id', classIds),
                supabase.from('instructor_events').select('*').eq('user_id', userId)
            ]);

            return {
                firstName,
                classes,
                allSubmissions: submissionsRes.data || [],
                allAssignments: assignmentsRes.data || [],
                allEnrollments: enrollmentsRes.data || [],
                allResources: resourcesRes.data || [],
                allEvents: eventsRes.data || []
            };

        }, 300); // 5 minutes TTL

        return { data, error: null };
    } catch (err: any) {
        console.error('getInstructorDashboardData Error:', err);
        return { error: err.message, data: null };
    }
}
