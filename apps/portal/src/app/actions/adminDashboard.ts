'use strict';
'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';
import { fetchWithCache } from '@/lib/cache';

// Admin client for bypass RLS on aggregate global data
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Ensure only authenticated users can trigger this action
async function ensureAuthenticated() {
    const cookieStore = await cookies();
    const supabaseSession = createSessionClient(cookieStore);

    const { data: { user }, error: authError } = await supabaseSession.auth.getUser();

    if (authError || !user) {
        throw new Error('Unauthorized');
    }

    // Optionally check if user is admin/superadmin 
    // The middleware already protects /admin routes, but we add defense-in-depth here.
    return user;
}

export async function getAdminDashboardData() {
    await ensureAuthenticated();

    const cacheKey = `admin:dashboard:stats:overall`;
    const TTL_SECONDS = 300; // 5 minutes

    return fetchWithCache(cacheKey, async () => {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

        // Run all queries using supabaseAdmin to collect global stats
        const [
            profilesRes,
            classesRes,
            enrollmentsRes,
            assignmentsRes,
            submissionsRes,
            practicumsRes,
            practicumEnrollRes,
            tokensRes,
            errorsRes,
            securityRes,
            recentUsersRes,
            recentSecurityRes,
        ] = await Promise.all([
            // 1. Profiles breakdown
            supabaseAdmin.from('profiles').select('role, is_active, is_demo, demo_converted_at'),
            // 2. Classes
            supabaseAdmin.from('classes').select('id', { count: 'exact', head: true }),
            // 3. Enrollments
            supabaseAdmin.from('enrollments').select('id', { count: 'exact', head: true }),
            // 4. Assignments
            supabaseAdmin.from('assignments').select('id', { count: 'exact', head: true }),
            // 5. Submissions (with grade status)
            supabaseAdmin.from('submissions').select('grade'),
            // 6. Practicums
            supabaseAdmin.from('practicums').select('id', { count: 'exact', head: true }),
            // 7. Practicum Enrollments
            supabaseAdmin.from('practicum_enrollments').select('id', { count: 'exact', head: true }),
            // 8. Token burn
            supabaseAdmin.from('api_usage_logs').select('total_tokens, is_demo'),
            // 9. Recent errors (24h)
            supabaseAdmin.from('system_errors').select('id', { count: 'exact', head: true }).gte('created_at', twentyFourHoursAgo),
            // 10. Recent security events (24h)
            supabaseAdmin.from('security_events').select('id', { count: 'exact', head: true }).gte('created_at', twentyFourHoursAgo),
            // 11. Recent users (last 10)
            supabaseAdmin.from('profiles').select('id, full_name, email, role, is_demo').order('created_at', { ascending: false }).limit(10),
            // 12. Recent security events (last 10)
            supabaseAdmin.from('security_events').select('id, event_type, path, user_role, created_at').order('created_at', { ascending: false }).limit(10),
        ]);

        // Process profiles
        const profiles = (profilesRes.data || []) as any[];
        const instructors = profiles.filter((p: any) => p.role === 'instructor').length;
        const students = profiles.filter((p: any) => p.role === 'student').length;
        const activeUsers = profiles.filter((p: any) => p.is_active !== false).length;
        const suspendedUsers = profiles.filter((p: any) => p.is_active === false).length;
        const demoSignups = profiles.filter((p: any) => p.is_demo === true).length;
        const demoConversions = profiles.filter((p: any) => p.demo_converted_at != null).length;
        const totalDemoEver = demoSignups + demoConversions;
        const conversionRate = totalDemoEver > 0 ? Math.round((demoConversions / totalDemoEver) * 100) : 0;

        // Process submissions
        const submissions = (submissionsRes.data || []) as any[];
        const gradedSubmissions = submissions.filter((s: any) => s.grade != null).length;
        const ungradedSubmissions = submissions.length - gradedSubmissions;

        // Process tokens
        const tokenLogs = (tokensRes.data || []) as any[];
        const totalTokensBurned = tokenLogs.reduce((sum: number, l: any) => sum + (l.total_tokens || 0), 0);
        const demoTokens = tokenLogs.filter((l: any) => l.is_demo).reduce((sum: number, l: any) => sum + (l.total_tokens || 0), 0);
        const standardTokens = totalTokensBurned - demoTokens;

        // Avg students per class
        const totalClasses = classesRes.count || 0;
        const totalEnrollments = enrollmentsRes.count || 0;
        const avgStudentsPerClass = totalClasses > 0 ? Math.round((totalEnrollments / totalClasses) * 10) / 10 : 0;

        return {
            kpis: {
                totalUsers: profiles.length,
                instructors,
                students,
                activeUsers,
                suspendedUsers,
                demoSignups,
                demoConversions,
                conversionRate,
                totalClasses,
                totalEnrollments,
                avgStudentsPerClass,
                totalAssignments: assignmentsRes.count || 0,
                totalSubmissions: submissions.length,
                gradedSubmissions,
                ungradedSubmissions,
                totalPracticums: practicumsRes.count || 0,
                practicumEnrollments: practicumEnrollRes.count || 0,
                totalTokensBurned,
                demoTokens,
                standardTokens,
                recentErrors: errorsRes.count || 0,
                recentSecurityEvents: securityRes.count || 0,
            },
            recentUsers: recentUsersRes.data || [],
            recentSecurity: recentSecurityRes.data || []
        };
    }, TTL_SECONDS);
}
