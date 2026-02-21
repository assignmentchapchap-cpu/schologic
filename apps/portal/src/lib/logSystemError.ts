import { createClient } from '@supabase/supabase-js';
import { redis } from './redis';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

interface SystemErrorPayload {
    path: string;
    errorMessage: string;
    stackTrace?: string;
    userId?: string;
}

/**
 * Fire-and-forget: Logs server errors to the `system_errors` table.
 */
export async function logSystemError(payload: SystemErrorPayload): Promise<void> {
    try {
        await supabaseAdmin.from('system_errors').insert({
            path: payload.path,
            error_message: payload.errorMessage,
            stack_trace: payload.stackTrace ?? null,
            user_id: payload.userId ?? null,
        });

        // Invalidate all admin error caches (they are paginated and searchable, so we match the pattern)
        const keys = await redis.keys('admin:errors:*');
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (err) {
        console.error('[logSystemError] Failed to log error:', err);
    }
}
