'use server';

import { createClient } from "@schologic/database";
import { logSystemError } from '@/lib/logSystemError';

/**
 * Server action to log errors from Client Components.
 * This acts as a secure bridge to the system_errors table.
 */
export async function logClientError(message: string, stack?: string, path?: string) {
    let userId: string | undefined;

    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;
    } catch (e) {
        // Ignore auth errors during error logging to prevent loops
    }

    await logSystemError({
        path: path || 'client-side',
        errorMessage: message,
        stackTrace: stack,
        userId: userId
    });
}
