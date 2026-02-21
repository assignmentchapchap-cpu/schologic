import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function testQuery() {
    const { data, error } = await supabaseAdmin
        .from('system_errors')
        .select(`
            id, user_id,
            error_message,
            users:profiles(email, full_name),
            profiles(email, full_name)
        `)
        .limit(5);

    console.log("Error:", error);
    console.log("Data:", JSON.stringify(data, null, 2));
}

testQuery();
