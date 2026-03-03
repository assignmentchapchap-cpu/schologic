'use server';

import { createSessionClient } from '@schologic/database';
import { cookies } from 'next/headers';
import { getUserIdentity } from '@/lib/identity-server';

export async function getCurrentPilotRequest() {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Unauthorized');

        // Fetch the unified identity (cached in Redis via proxy)
        const identity = await getUserIdentity(user.id);

        if (!identity || !identity.pilot_permissions) {
            throw new Error('No pilot access found for this user.');
        }

        const { pilot_request_id } = identity.pilot_permissions;

        // Fetch the actual pilot request
        const { data: pilot, error: pilotError } = await supabase
            .from('pilot_requests')
            .select('*')
            .eq('id', pilot_request_id)
            .single();

        if (pilotError || !pilot) {
            console.error('Pilot fetch error:', pilotError);
            throw new Error('Pilot request data not found.');
        }

        return { data: { pilot, identity } };

    } catch (err: any) {
        console.error('getCurrentPilotRequest Error:', err);
        return { error: err.message || 'Failed to fetch pilot context' };
    }
}

export async function updatePilotData(updates: any) {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Unauthorized');

        // Verify membership and get pilot ID
        const { data: membership, error: membershipError } = await supabase
            .from('pilot_team_members')
            .select('pilot_request_id, tab_permissions_jsonb')
            .eq('user_id', user.id)
            .limit(1)
            .single();

        if (membershipError || !membership) throw new Error('No pilot access found.');

        // Proceed to update
        const { data: updatedPilot, error: updateError } = await supabase
            .from('pilot_requests')
            .update(updates)
            .eq('id', membership.pilot_request_id)
            .select('id')
            .single();

        if (updateError || !updatedPilot) {
            throw new Error(updateError?.message || 'Update rejected by database policies. Are you authorized?');
        }

        return { success: true };
    } catch (err: any) {
        console.error('updatePilotData Error:', err);
        return { error: err.message || 'Failed to update pilot data.' };
    }
}

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function uploadBrandingAsset(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Unauthorized');

        const { data: membership } = await supabase
            .from('pilot_team_members')
            .select('pilot_request_id')
            .eq('user_id', user.id)
            .limit(1)
            .single();

        if (!membership) throw new Error('No pilot access found.');

        const file = formData.get('file') as File;
        const assetType = formData.get('type') as string; // 'logo' or 'hero'

        if (!file) throw new Error('No file provided.');
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error('Invalid file type. Use PNG, JPG, SVG, or WebP.');
        if (file.size > MAX_FILE_SIZE) throw new Error('File too large. Maximum 2MB.');

        const ext = file.name.split('.').pop() || 'png';
        const path = `${membership.pilot_request_id}/${assetType}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from('pilot-branding')
            .upload(path, file, { upsert: true, contentType: file.type });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('pilot-branding')
            .getPublicUrl(path);

        return { success: true, url: urlData.publicUrl };
    } catch (err: any) {
        console.error('uploadBrandingAsset Error:', err);
        return { error: err.message || 'Failed to upload asset.' };
    }
}
