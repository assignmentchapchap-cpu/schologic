
import { createClient } from "../packages/database/src/index";
import * as fs from 'fs';
import * as path from 'path';

// Manually load env vars to avoid dotenv dependency
const envPath = path.resolve(__dirname, '../apps/portal/.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
        }
    });
} else {
    console.warn("⚠️ No .env.local found at", envPath);
}

async function verifyDraftStatus() {
    console.log("🚀 Verifying 'draft' status support...");
    const supabase = createClient();

    // 1. Get a valid user & practicum (Reuse logic from debug script)
    // We need a real user ID. 
    // Hack: Fetch a log that exists and use its user_id/practicum_id, or just fail if empty.
    const { data: logs, error: userError } = await supabase.from('practicum_logs').select('student_id, practicum_id').limit(1);

    if (userError) {
        console.error("❌ Error connecting to DB:", userError.message);
        return;
    }

    if (!logs || logs.length === 0) {
        console.warn("⚠️ No logs found. Cannot verify insert without valid FKs.");
        return;
    }

    const { student_id, practicum_id } = logs[0];

    // 2. Attempt Insert with 'draft'
    console.log(`Attempting insert with status='draft' for Student: ${student_id}`);

    // Create a unique-ish log date to avoid conflict with existing daily logs
    // But since we delete immediately, should be fine.
    const testDate = new Date();
    testDate.setFullYear(2099); // Future date

    const { data, error } = await supabase
        .from('practicum_logs')
        .insert({
            student_id,
            practicum_id,
            log_date: testDate.toISOString().split('T')[0], // YYYY-MM-DD
            supervisor_status: 'draft', // <--- THE TEST
            entries: { note: "test draft verification" }
        })
        .select()
        .single();

    if (error) {
        console.error("\n❌ Insert Failed!");
        console.error(`Code: ${error.code}`);
        console.error(`Message: ${error.message}`);

        if (error.code === '23514') { // check_violation
            console.error("🔴 CONCLUSION: 'draft' status is REJECTED by DB. Migration NOT applied.");
        } else {
            console.error("🔴 CONCLUSION: Indeterminate error (FK or Auth).");
        }
    } else {
        console.log("\n✅ Insert Success! 'draft' status is ACCEPTED.");
        // Clean up
        if (data) {
            await supabase.from('practicum_logs').delete().eq('id', data.id);
            console.log("Cleanup complete.");
        }
    }
}

verifyDraftStatus();
