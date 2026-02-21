import { Redis } from '@upstash/redis';

// Initialize the Upstash Redis client
// It automatically picks up UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
// from the environment variables (e.g., .env.local)
export const redis = Redis.fromEnv();
