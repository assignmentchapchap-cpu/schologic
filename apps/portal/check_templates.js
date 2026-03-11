const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTemplates() {
    console.log('Fetching templates from Supabase...');
    const { data, error } = await supabase
        .from('platform_templates')
        .select('name');

    if (error) {
        console.error('Error fetching templates:', error);
        return;
    }

    console.log(`\nFound ${data.length} templates:`);
    data.forEach((t, i) => console.log(`${i + 1}. ${t.name}`));
}

checkTemplates().catch(console.error);
