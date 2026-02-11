
import { createClient } from "@schologic/database";
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function debugInsert() {
    console.log("🚀 Testing DB Insert for 'draft' status...");

    const supabase = createClient();

    // 1. Get a valid practicum ID (any)
    const { data: pracs } = await supabase.from('practicums').select('id').limit(1);
    if (!pracs || pracs.length === 0) {
        console.error("No practicums found to test with.");
        return;
    }
    const pracId = pracs[0].id;

    // 2. Get a valid student ID
    const { data: user } = await supabase.auth.getUser();
    // Since we are server-side script, we might not have a logged in user easily unless we use service role or login.
    // Actually, for this test we need a valid user. 
    // Let's just try to update an existing enrollment if possible, or insert with a random UUID if RLS allows (unlikely).
    // Better strategy: Just check the check_constraint definition if possible via RPC or inspection? No.

    // Plan B: Just try to insert with a dummy UUID. RLS might fail, but if it fails on STATUS constraint, that error will bubble up first usually.
    // Or we rely on the fact that we ran this script with access to env vars.

    const dummyStudentId = "00000000-0000-0000-0000-000000000000";

    console.log(`Attempting insert with practicum_id=${pracId} and status='draft'`);

    const { error } = await supabase
        .from('practicum_enrollments')
        .insert([{
            practicum_id: pracId,
            student_id: dummyStudentId,
            status: 'draft'
        }]);

    if (error) {
        console.error("\n❌ Insert Failed!");
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        console.error("Details:", error.details);

        if (error.code === '23514') { // Check violation
            console.log("\n⚠️  CONFIRMED: Check Constraint Violation. 'draft' is not accepted.");
        }
    } else {
        console.log("\n✅ Insert Success! (or RLS swallowed it silently, but no constraint error)");
        // Cleanup
        await supabase.from('practicum_enrollments').delete().eq('student_id', dummyStudentId);
    }
}

debugInsert();
