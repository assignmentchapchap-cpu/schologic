'use server';

import { createClient } from "@schologic/database";

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
    const supabase = createClient();

    try {
        // Calculate range
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from('system_errors')
            .select(`
                *,
                users:user_id (email)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (search) {
            query = query.or(`error_message.ilike.%${search}%,path.ilike.%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error("Error fetching system errors:", error);
            return { data: [], total: 0, error: error.message };
        }

        return {
            data: data as unknown as SystemErrorLog[],
            total: count || 0
        };

    } catch (err: any) {
        console.error("Unexpected error in getSystemErrors:", err);
        return { data: [], total: 0, error: err.message };
    }
}
