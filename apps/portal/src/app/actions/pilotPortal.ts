'use server';

import { createSessionClient } from '@schologic/database';
import { cookies } from 'next/headers';

export async function getCurrentPilotRequest() {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Unauthorized');

        // First find their pilot team membership to get the pilot_request_id
        const { data: membership, error: membershipError } = await supabase
            .from('pilot_team_members')
            .select('pilot_request_id, is_champion, tab_permissions_jsonb')
            .eq('user_id', user.id)
            .limit(1)
            .single();

        if (membershipError || !membership) {
            console.error('Membership error:', membershipError);
            throw new Error('No pilot access found for this user.');
        }

        // Now fetch the actual pilot request
        const { data: pilot, error: pilotError } = await supabase
            .from('pilot_requests')
            .select('*')
            .eq('id', membership.pilot_request_id)
            .single();

        if (pilotError || !pilot) {
            console.error('Pilot fetch error:', pilotError);
            throw new Error('Pilot request data not found.');
        }

        return { data: { pilot, membership } };

    } catch (err: any) {
        console.error('getCurrentPilotRequest Error:', err);
        return { error: err.message || 'Failed to fetch pilot context' };
    }
}
