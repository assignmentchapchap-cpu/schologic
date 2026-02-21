'use server';

import { createSessionClient } from '@schologic/database';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { logSystemError } from '@/lib/logSystemError';

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

/**
 * Ensures the API is only invoked by an authenticated user.
 * The Admin Layout relies on client-side routing protection,
 * but this adds a backend layer before we fetch with the Admin key.
 */
async function ensureAuthenticated() {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('getLeads authentication failed:', authError?.message || 'No user session');
        throw new Error('Unauthorized');
    }

    return user;
}

export async function getPilotRequests() {
    try {
        await ensureAuthenticated();

        const { data, error } = await supabaseAdmin
            .from('pilot_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('Error fetching pilot requests:', error);
        await logSystemError({ path: '/actions/getLeads/getPilotRequests', errorMessage: error.message, stackTrace: error.stack });
        return { data: null, error: error.message };
    }
}

export async function getInstructorInvites() {
    try {
        await ensureAuthenticated();

        const { data, error } = await supabaseAdmin
            .from('instructor_invites')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('Error fetching instructor invites:', error);
        await logSystemError({ path: '/actions/getLeads/getInstructorInvites', errorMessage: error.message, stackTrace: error.stack });
        return { data: null, error: error.message };
    }
}

export async function getContactSubmissions() {
    try {
        await ensureAuthenticated();

        const { data, error } = await supabaseAdmin
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('Error fetching contact submissions:', error);
        await logSystemError({ path: '/actions/getLeads/getContactSubmissions', errorMessage: error.message, stackTrace: error.stack });
        return { data: null, error: error.message };
    }
}
