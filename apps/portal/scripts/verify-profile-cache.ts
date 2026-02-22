import { getUserIdentity, invalidateUserIdentity } from '../src/lib/identity-server';

async function test() {
    const userId = "7eadb5b4-ab43-4fdd-a0cf-97a9db2c583d";

    console.log("DEBUG: Script Start");

    try {
        // 1. Initial State: Invalidate
        console.log("DEBUG: 1. Invalidating...");
        await invalidateUserIdentity(userId);
        console.log("DEBUG: 1. Success");

        // 2. Initial Fetch (Cache Miss)
        console.log("DEBUG: 2. Fetching (Cache Miss expected)...");
        const t1 = Date.now();
        const id1 = await getUserIdentity(userId);
        const d1 = Date.now() - t1;
        console.log(`DEBUG: Result: ${id1?.email}, Duration: ${d1}ms`);

        // 3. Second Fetch (Cache Hit)
        console.log("DEBUG: 3. Fetching (Cache Hit expected)...");
        const t2 = Date.now();
        const id2 = await getUserIdentity(userId);
        const d2 = Date.now() - t2;
        console.log(`DEBUG: Result: ${id2?.email}, Duration: ${d2}ms`);

        // 4. Invalidation Test
        console.log("DEBUG: 4. Triggering direct invalidation...");
        await invalidateUserIdentity(userId);
        console.log("DEBUG: 4. Success");

        // 5. Post-Invalidation Fetch (Cache Miss)
        console.log("DEBUG: 5. Fetching after invalidation (Cache Miss expected)...");
        const t3 = Date.now();
        const id3 = await getUserIdentity(userId);
        const d3 = Date.now() - t3;
        console.log(`DEBUG: Result: ${id3?.email}, Duration: ${d3}ms`);

        console.log("DEBUG: Script End");
    } catch (err) {
        console.error("DEBUG ERROR:", err);
    }
}

test().catch(console.error);
