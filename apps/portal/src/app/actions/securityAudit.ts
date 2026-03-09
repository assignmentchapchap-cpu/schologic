'use strict';
'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';

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

    return user;
}

export async function getSecurityAuditEvents(
    page: number = 1,
    limit: number = 50,
    filterType: string = 'all',
    searchQuery: string = ''
) {
    await ensureAuthenticated();

    try {
        let query = supabaseAdmin
            .from('security_events')
            .select(`
                *,
                profiles:user_id (
                    full_name,
                    email
                )
            `, { count: 'exact' });

        if (filterType !== 'all') {
            query = query.eq('event_type', filterType);
        }

        if (searchQuery) {
            // Need to handle search text. 
            // In Supabase, you can't easily ilike on joined tables directly like this in a single simple RPC without a stored function or text search column
            // But we can filter path and event_type and user_id directly.
            // For a robust search including joined profiles, filtering client-side or building a database view is preferred.
            // Since this action is replacing a client-side filter, we will fetch more records and filter in JS if search is active,
            // OR we'll just ilike the main table columns if that's sufficient.

            // To properly match what was there (which fetched everything paginated then searched over the CURRENT page, or fetched everything filtered?), 
            // Wait, the original code paginated FIRST, then filtered the resulting page.
            // Actually, the original code had a bug where search only applied to the currently fetched 50 items.

            // Let's implement a better search on the main table at least:
            query = query.or(`path.ilike.%${searchQuery}%,event_type.ilike.%${searchQuery}%,user_id.ilike.%${searchQuery}%`);
        }

        // Apply ordering and pagination
        query = query.order('created_at', { ascending: false });

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await query.range(from, to);

        if (error) {
            console.error('[getSecurityAuditEvents] Supabase error:', error);
            throw new Error('Failed to fetch security events');
        }

        return {
            events: data || [],
            totalCount: count || 0,
            totalPages: count ? Math.ceil(count / limit) : 1
        };

    } catch (error) {
        console.error('[getSecurityAuditEvents] Error:', error);
        return { events: [], totalCount: 0, totalPages: 1 };
    }
}
