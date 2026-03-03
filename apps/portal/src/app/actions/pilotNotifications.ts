'use server';

import { createClient } from '@supabase/supabase-js';
import { getSuperadminId } from './pilotMessaging';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Core Insert ───────────────────────────────────────────

/**
 * Inserts a single notification row.
 */
export async function createNotification({
    userId,
    message,
    type,
    link,
}: {
    userId: string;
    message: string;
    type: string;
    link?: string;
}) {
    const { error } = await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        message,
        type,
        link: link || null,
    });
    if (error) console.error('[Notification] Insert failed:', error.message);
}

// ─── Bulk Helpers ──────────────────────────────────────────

/**
 * Notifies all members of a pilot request (optionally excluding one user).
 */
export async function notifyTeamMembers({
    pilotRequestId,
    message,
    type,
    link,
    excludeUserId,
}: {
    pilotRequestId: string;
    message: string;
    type: string;
    link?: string;
    excludeUserId?: string;
}) {
    const { data: members } = await supabaseAdmin
        .from('pilot_team_members')
        .select('user_id')
        .eq('pilot_request_id', pilotRequestId);

    if (!members) return;

    const rows = members
        .filter(m => m.user_id !== excludeUserId)
        .map(m => ({
            user_id: m.user_id,
            message,
            type,
            link: link || null,
        }));

    if (rows.length === 0) return;

    const { error } = await supabaseAdmin.from('notifications').insert(rows);
    if (error) console.error('[Notification] Bulk insert failed:', error.message);
}

/**
 * Sends a notification to the superadmin.
 */
export async function notifySuperadmin({
    message,
    type,
    link,
}: {
    message: string;
    type: string;
    link?: string;
}) {
    const { data } = await getSuperadminId();
    if (!data) {
        console.warn('[Notification] Cannot notify superadmin — not found');
        return;
    }

    await createNotification({ userId: data.id, message, type, link });
}
