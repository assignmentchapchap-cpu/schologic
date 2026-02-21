'use server';

import { createClient } from '@supabase/supabase-js';
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

export async function getPilotRequests() {
    try {
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
