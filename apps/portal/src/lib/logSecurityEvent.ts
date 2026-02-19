import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

type SecurityEventType =
    | 'unauthorized_access'
    | 'deactivated_access'
    | 'role_mismatch'
    | 'demo_restricted';

interface SecurityEventPayload {
    eventType: SecurityEventType;
    path: string;
    userId?: string;
    userRole?: string;
    targetRole?: string;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Fire-and-forget: Logs security events (unauthorized access, role mismatch, etc.)
 * to the `security_events` table. Never blocks the redirect flow.
 */
export async function logSecurityEvent(payload: SecurityEventPayload): Promise<void> {
    try {
        await supabaseAdmin.from('security_events').insert({
            event_type: payload.eventType,
            path: payload.path,
            user_id: payload.userId ?? null,
            user_role: payload.userRole ?? null,
            target_role: payload.targetRole ?? null,
            ip_address: payload.ipAddress ?? null,
            user_agent: payload.userAgent ?? null,
        });
    } catch (err) {
        console.error('[logSecurityEvent] Failed to log event:', err);
    }
}
