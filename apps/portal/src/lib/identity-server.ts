import { createClient } from '@supabase/supabase-js';
import { fetchWithCache, invalidateCache } from './cache';

/**
 * Server-only utility for fetching and caching user profiles.
 * This is designed to be used in middleware (proxy.ts) and server actions.
 */

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

export type UserIdentity = {
    id: string;
    email: string | null;
    full_name: string | null;
    role: string | null;
    is_active: boolean;
    is_demo: boolean;
};

/**
 * Fetches a user's identity from Redis cache or Supabase.
 * @param userId The unique UUID of the user
 * @returns The user's profile data or null if not found
 */
export async function getUserIdentity(userId: string): Promise<UserIdentity | null> {
    if (!userId) return null;

    const cacheKey = `profile:${userId}`;
    const TTL_SECONDS = 3600; // 1 hour for profiles (actively invalidated)

    try {
        return await fetchWithCache(cacheKey, async () => {
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('id, email, full_name, role, is_active, is_demo')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return data as UserIdentity;
        }, TTL_SECONDS);
    } catch (error) {
        console.error(`[IdentityServer] Error fetching identity for ${userId}:`, error);
        return null;
    }
}

/**
 * Actively invalidates a user's identity cache.
 * @param userId The unique UUID of the user
 */
export async function invalidateUserIdentity(userId: string): Promise<void> {
    if (!userId) return;
    await invalidateCache(`profile:${userId}`);
}
