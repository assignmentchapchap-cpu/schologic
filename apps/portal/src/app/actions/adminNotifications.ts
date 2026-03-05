'use server';

import { createClient } from '@supabase/supabase-js';
import { getSuperadminId } from './pilotMessaging';
import { sendTelegramNotification } from '@/lib/telegram';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Creates a notification for the superadmin.
 * Used by public-facing forms and system triggers.
 */
export async function createAdminNotification({
    message,
    type,
    link,
}: {
    message: string;
    type: string;
    link?: string;
}) {
    try {
        const { data } = await getSuperadminId();
        if (!data) {
            console.warn('[AdminNotification] Superadmin not found');
            return;
        }

        const { error } = await supabaseAdmin.from('notifications').insert({
            user_id: data.id,
            message,
            type,
            link: link || null,
        });

        if (error) console.error('[AdminNotification] Insert failed:', error.message);

        // Fire-and-forget Telegram notification
        sendTelegramNotification({ message, type, link }).catch(() => { });
    } catch (err: any) {
        console.error('[AdminNotification] Error:', err.message);
    }
}
