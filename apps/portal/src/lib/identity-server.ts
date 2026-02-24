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
    pilot_permissions?: {
        pilot_request_id: string;
        is_champion: boolean;
        tab_permissions_jsonb: any;
    } | null;
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
            // Fetch profile and their pilot team membership (if any)
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select(`
                    id, email, full_name, role, is_active, is_demo,
                    pilot_team_members (
                        pilot_request_id,
                        is_champion,
                        tab_permissions_jsonb
                    )
                `)
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            // Extract the first active pilot membership if they have one
            const rawData = data as any;
            let pilot_permissions = null;
            if (rawData.pilot_team_members && rawData.pilot_team_members.length > 0) {
                pilot_permissions = {
                    pilot_request_id: rawData.pilot_team_members[0].pilot_request_id,
                    is_champion: rawData.pilot_team_members[0].is_champion,
                    tab_permissions_jsonb: rawData.pilot_team_members[0].tab_permissions_jsonb
                };
            }

            return {
                id: rawData.id,
                email: rawData.email,
                full_name: rawData.full_name,
                role: rawData.role,
                is_active: rawData.is_active,
                is_demo: rawData.is_demo,
                pilot_permissions: pilot_permissions
            } as UserIdentity;
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
