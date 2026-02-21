import { redis } from './redis';

/**
 * A generic function to fetch data from Redis, or execute a query to DB and cache it.
 * This implements the Cache-Aside pattern.
 *
 * @param key The unique Redis key for storing the cached data
 * @param fetcher A function returning a Promise with the raw database data
 * @param ttl Time-to-live in seconds (e.g., 60 = 1 minute). Defaults to 60.
 */
export async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 60
): Promise<T> {
    try {
        // 1. Try to get data from Redis
        const cachedData = await redis.get<T>(key);
        if (cachedData !== null && cachedData !== undefined) {
            return cachedData;
        }

        // 2. On cache miss, fetch from the database
        const targetData = await fetcher();

        // 3. Store the result in Redis asynchronously (fire and forget for latency)
        if (targetData !== null && targetData !== undefined) {
            // Background cache setting
            redis.set(key, targetData, { ex: ttl }).catch(err => {
                console.error(`[Redis] Failed to set cache for key ${key}:`, err);
            });
        }

        return targetData;
    } catch (error) {
        console.error(`[Redis] Error in fetchWithCache for key ${key}:`, error);
        // If Redis fails, gracefully degrade by hitting the database directly
        return fetcher();
    }
}

/**
 * Actively invalidates a cached key.
 *
 * @param key The unique Redis key to delete
 */
export async function invalidateCache(key: string): Promise<void> {
    try {
        await redis.del(key);
    } catch (error) {
        console.error(`[Redis] Failed to invalidate cache for key ${key}:`, error);
    }
}
