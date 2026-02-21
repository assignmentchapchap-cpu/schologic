import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkSchema() {
    const { data: cols, error: colError } = await supabaseAdmin
        .from('instructor_invites')
        .select('*')
        .limit(1);

    console.log("Error querying instructor_invites:", colError?.message || "None");

    if (cols && cols.length > 0) {
        console.log("Columns present in existing row:", Object.keys(cols[0]));
    } else {
        console.log("No rows in table to infer layout, attempting basic insert test...");
        const { error: insertError } = await supabaseAdmin
            .from('instructor_invites')
            .insert({
                sender_name: 'Test',
                sender_email: 'test@example.com',
                recipient_name: 'Test Req',
                recipient_email: 'req@example.com',
                recipient_phone: '123',
                message: 'Hello'
            });
        console.log("Insert Error:", insertError);
    }
}

checkSchema();
