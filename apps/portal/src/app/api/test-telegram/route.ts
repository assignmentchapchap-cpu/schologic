import { NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/telegram';

/**
 * GET /api/test-telegram
 * Quick test endpoint — hit this in your browser to verify the Telegram integration.
 * Delete this file after testing.
 */
export async function GET() {
    console.log('[TestTelegram] API route hit — calling sendTelegramNotification...');

    try {
        await sendTelegramNotification({
            message: 'This is a test from the Next.js API route!',
            type: 'admin_new_pilot',
            link: '/admin/leads',
        });

        return NextResponse.json({ ok: true, message: 'Check your Telegram!' });
    } catch (err: any) {
        console.error('[TestTelegram] Error:', err);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}
