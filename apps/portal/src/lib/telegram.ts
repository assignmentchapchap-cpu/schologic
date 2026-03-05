/**
 * Telegram Bot API integration for Superadmin notifications.
 * Sends formatted messages to the Superadmin's Telegram chat.
 *
 * Required env vars:
 *   TELEGRAM_API_TOKEN  — Bot token from @BotFather
 *   TELEGRAM_CHAT_ID    — Superadmin's Telegram chat ID
 */

// ─── Emoji mapping by notification type ────────────────────

const TYPE_EMOJI: Record<string, string> = {
    admin_new_pilot: '🚀',
    pilot_submitted_admin: '✅',
    admin_new_demo: '🎯',
    admin_referral: '🔗',
    security_event: '🔒',
    dm_received: '💬',
    pilot_tab_finalized: '📋',
    pilot_tab_reactivated: '🔄',
    pilot_submitted: '📦',
};

// ─── Core Send Function ────────────────────────────────────

export async function sendTelegramNotification({
    message,
    type,
    link,
}: {
    message: string;
    type: string;
    link?: string;
}) {
    const token = process.env.TELEGRAM_API_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn('[Telegram] Missing TELEGRAM_API_TOKEN or TELEGRAM_CHAT_ID — skipping');
        return;
    }

    try {
        const emoji = TYPE_EMOJI[type] || '📢';
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL
            || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

        let text = `${emoji} *${formatTypeLabel(type)}*\n\n${escapeMarkdown(message)}`;

        if (link) {
            const fullUrl = link.startsWith('http') ? link : `${baseUrl}${link}`;
            text += `\n\n[Open in Dashboard](${fullUrl})`;
        }

        const url = `https://api.telegram.org/bot${token}/sendMessage`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            console.error('[Telegram] API error:', response.status, body);
        } else {
            console.log('[Telegram] Notification sent successfully:', type);
        }
    } catch (err: any) {
        console.error('[Telegram] Failed to send notification:', err.message);
    }
}

// ─── Helpers ───────────────────────────────────────────────

function formatTypeLabel(type: string): string {
    return type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

function escapeMarkdown(text: string): string {
    // Escape special Markdown characters that could break formatting
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}
