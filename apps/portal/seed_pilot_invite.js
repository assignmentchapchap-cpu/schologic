const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
    const templates = [
        {
            name: 'Pilot Team Invite',
            subject: "You've been invited to a Schologic Pilot",
            category: 'onboarding',
            content_html: `
<div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
    <h2 style="color: #1e293b;">Welcome to the Pilot Team!</h2>
    <p style="color: #475569;">Hi {{firstName}},</p>
    <p style="color: #475569;">You've been invited to join a Schologic pilot program. Visit the link below to set up your account:</p>
    <a href="{{pilotUrl}}/setup"
       style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Set Up Your Account
    </a>
    <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">— The Schologic Team</p>
</div>
      `
        }
    ];

    for (const template of templates) {
        const { data: existing } = await supabase
            .from('platform_templates')
            .select('id')
            .eq('name', template.name)
            .single();

        if (existing) {
            console.log(`Updating template: ${template.name}`);
            await supabase.from('platform_templates').update({ subject: template.subject, content_html: template.content_html }).eq('id', existing.id);
        } else {
            console.log(`Inserting template: ${template.name}`);
            await supabase.from('platform_templates').insert([template]);
        }
    }
}
seed().catch(console.error);
