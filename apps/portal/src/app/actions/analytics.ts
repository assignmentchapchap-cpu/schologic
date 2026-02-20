'use server';

import { createClient } from '@supabase/supabase-js';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export interface AnalyticsData {
    period: { start: string; end: string };
    summary: {
        totalActiveUsers: number;
        newSignups: number;
        conversions: number;
        activeInstructors: number;
        activeStudents: number;
    };
    chartData: Array<{
        date: string;
        activeUsers: number;
        newSignups: number;
        conversions: number;
    }>;
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function getUserAnalytics(
    startDateStr: string | Date,
    endDateStr: string | Date
): Promise<{ data?: AnalyticsData; error?: string }> {
    try {
        const start = startOfDay(new Date(startDateStr));
        const end = endOfDay(new Date(endDateStr));

        const { data: profiles, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, role, is_demo, demo_converted_at, created_at, is_active');
        if (profileError) throw profileError;

        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 1000,
        });
        if (authError) throw authError;

        const signInMap = new Map<string, Date>();
        users.forEach(u => {
            if (u.last_sign_in_at) {
                signInMap.set(u.id, new Date(u.last_sign_in_at));
            }
        });

        const dailyStats = new Map<string, { active: number, new: number, conv: number }>();
        const getBucket = (date: Date) => {
            const dayKey = format(date, 'yyyy-MM-dd');
            if (!dailyStats.has(dayKey)) dailyStats.set(dayKey, { active: 0, new: 0, conv: 0 });
            return dailyStats.get(dayKey)!;
        };

        let totalActiveUsers = 0, newSignups = 0, conversions = 0, activeInstructors = 0, activeStudents = 0;

        profiles?.forEach(p => {
            const createdAt = new Date(p.created_at || '');
            const convertedAt = p.demo_converted_at ? new Date(p.demo_converted_at) : null;
            const lastSignIn = signInMap.get(p.id);

            if (isWithinInterval(createdAt, { start, end })) {
                newSignups++;
                getBucket(createdAt).new++;
            }
            if (convertedAt && isWithinInterval(convertedAt, { start, end })) {
                conversions++;
                getBucket(convertedAt).conv++;
            }
            if (lastSignIn && lastSignIn >= start && lastSignIn <= end) {
                totalActiveUsers++;
                if (p.role === 'instructor') activeInstructors++;
                if (p.role === 'student') activeStudents++;
                getBucket(lastSignIn).active++;
            }
        });

        const chartData = Array.from(dailyStats.entries())
            .map(([date, stats]) => ({
                date,
                activeUsers: stats.active,
                newSignups: stats.new,
                conversions: stats.conv
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            data: {
                period: { start: format(start, 'MMM d'), end: format(end, 'MMM d') },
                summary: { totalActiveUsers, newSignups, conversions, activeInstructors, activeStudents },
                chartData
            }
        };

    } catch (err: any) {
        console.error("Analytics Error:", err);
        return { error: err.message };
    }
}
