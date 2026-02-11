/// <reference types="node" />
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Assumes we run this from apps/portal/ or apps/portal/scripts/
const envPath = path.resolve(process.cwd(), '.env.local');

console.log("Loading .env.local from:", envPath);

const envVars: Record<string, string> = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line: string) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"]|['"]$/g, '');
            envVars[key] = value;
        }
    });
} else {
    console.warn("Warning: .env.local not found at", envPath);
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const servicedKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !servicedKey) {
    console.error("Missing Environment Variables!");
    console.error("URL:", supabaseUrl);
    console.error("KEY:", servicedKey ? "Found" : "Missing");
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, servicedKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function testFetch() {
    console.log("Testing Admin Client Connection...");

    // 1. Simple count to verify connection
    const { count, error: countError } = await supabaseAdmin.from('practicum_logs').select('*', { count: 'exact', head: true });

    if (countError) {
        console.error("Connection Failed:", countError.message);
        return;
    }
    console.log(`Connection Successful. Log Count: ${count}`);

    // 2. Fetch a sample log to use for the relational query test
    const { data: logs, error: simpleError } = await supabaseAdmin
        .from('practicum_logs')
        .select('id')
        .limit(1);

    if (simpleError) {
        console.error("❌ Simple Select Failed:", simpleError.message);
        process.exit(1);
    }

    if (!logs || logs.length === 0) {
        console.warn("⚠️ No logs found in database. Cannot test joins.");
        process.exit(0);
    }

    const sampleLogId = logs[0].id;

    // 3. Test the relational query that was failing in the app
    console.log("Testing Relationship Query for Log ID:", sampleLogId);

    const { data: log, error: logError } = await supabaseAdmin
        .from('practicum_logs')
        .select(`
            id,
            profiles:student_id ( id, full_name, email ),
            practicums:practicum_id ( title )
        `)
        .eq('id', sampleLogId)
        .single();

    if (logError) {
        console.error("Query Failed:", logError.message);
        console.error("Hint:", logError.hint);
        // Common issue: "profiles" might be ambiguous if multiple FKs exist
    } else {
        console.log("Query Successful!");
        console.log("Student Profile:", log?.profiles ? "✅ Found" : "❌ Missing");
        console.log("Practicum Title:", log?.practicums ? "✅ Found" : "❌ Missing");
    }
}

testFetch();
