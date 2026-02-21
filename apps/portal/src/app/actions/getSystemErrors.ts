'use server';

import { createSessionClient } from "@schologic/database";
import { cookies } from "next/headers";
import { fetchWithCache } from "@/lib/cache";

export type SystemErrorLog = {
    id: string;
    created_at: string;
    path: string;
    error_message: string;
    stack_trace: string | null;
    user_id: string | null;
    users?: {
        email: string | null;
    } | null;
};

export async function getSystemErrors(
    page: number = 1,
    limit: number = 20,
    search?: string
): Promise<{ data: SystemErrorLog[], total: number, error?: string }> {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { data: [], total: 0, error: "Unauthorized" };
        }

        let userRole = user.app_metadata?.role || user.user_metadata?.role;

        if (!userRole) {
            // Get user profile to check role fallback
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            userRole = profile?.role;
        }

        if (!userRole || !['superadmin', 'admin'].includes(userRole as string)) {
            return { data: [], total: 0, error: "Forbidden: Insufficient permissions" };
        }

        // Calculate range
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Use service role client to bypass RLS for system error logs
        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const cacheKey = `admin:errors:p${page}:l${limit}:s${search || 'none'}`;

        return fetchWithCache(cacheKey, async () => {
            let query = supabaseAdmin
                .from('system_errors')
                .select(`
                    *,
                    users:profiles(email)
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (search) {
                query = query.or(`error_message.ilike.%${search}%,path.ilike.%${search}%`);
            }

            const { data, error, count } = await query;

            if (error) {
                console.error("Error fetching system errors:", error);
                throw new Error(error.message);
            }

            return {
                data: data as unknown as SystemErrorLog[],
                total: count || 0
            };
        }, 600); // 10 minutes cache

    } catch (err: any) {
        console.error("Unexpected error in getSystemErrors:", err);
        return { data: [], total: 0, error: err.message };
    }
}
