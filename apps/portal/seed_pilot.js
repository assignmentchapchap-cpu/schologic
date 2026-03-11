
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
    const template = {
        name: 'Pilot Environment Approved',
        subject: 'Pilot Environment Approved & Ready - Schologic LMS',
        category: 'onboarding',
        content_html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #ffffff; padding: 15px 30px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
    <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Portal Access Notice</p>
    <p style="margin: 0; font-size: 11px; color: #94a3b8;">ID: {{securityId}}</p>
  </div>
  
  <div style="padding: 30px;">
    <p style="font-size: 12px; color: #64748b; margin: 0 0 25px 0; background: #f8fafc; padding: 12px 16px; border-radius: 6px; border-left: 3px solid #cbd5e1;">
      <strong>Why are you receiving this?</strong> You recently submitted a pilot request for Schologic LMS on behalf of {{institution}}. This email confirms your request has been approved and your environment is ready.
    </p>

    <h2 style="margin: 0 0 20px 0; font-size: 22px; color: #0f172a;">Your Pilot Environment is Ready</h2>
    
    <p style="font-size: 15px; margin-bottom: 25px;">Hi {{first_name}},</p>
    
    <p style="font-size: 15px; margin-bottom: 25px;">
      We are pleased to inform you that your institutional pilot request for <strong>{{institution}}</strong> has been fully approved and your initial sandbox environment has been provisioned.
    </p>
    
    <p style="font-size: 15px; margin-bottom: 30px;">
      As the designated Pilot Champion, you now have exclusive access to the Pilot Management Portal where you will configure your brand, scope, and modules before inviting your team.
    </p>

    <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #4f46e5;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: bold; color: #0f172a;">Access Instructions:</p>
      
      <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569;">
        <li style="margin-bottom: 15px;">Navigate to the secure portal setup page using the link below.</li>
        <li style="margin-bottom: 15px;">Enter your institutional email (<strong>{{email}}</strong>).</li>
        <li style="margin-bottom: 15px;">Verify your identity using the one-time code sent to your inbox.</li>
        <li>Set your permanent administrative password to enter the portal.</li>
      </ol>

      <p style="margin: 25px 0 0 0; font-size: 15px; font-weight: 600;">
        Access Link: <a href="https://pilot.schologic.com/setup" style="color: #4f46e5; text-decoration: underline;">https://pilot.schologic.com/setup</a>
      </p>
    </div>

    <p style="font-size: 14px; margin-top: 40px;">Sincerely,<br/><span style="font-weight: bold; color: #0f172a;">Schologic Partnership Team</span></p>
  </div>

  <div style="background: #f8fafc; padding: 30px; border-top: 1px solid #f1f5f9;">
    <p style="font-size: 12px; color: #64748b; margin-bottom: 20px; text-align: center;">If you require technical assistance during setup, please contact us at <a href="mailto:support@schologic.com" style="color: #4f46e5; text-decoration: none;">support@schologic.com</a></p>
    <div style="text-align: center; color: #94a3b8; font-size: 11px;">
      <p style="margin-bottom: 5px;"><strong>Schologic LMS & Integrity Hub</strong></p>
      <p style="margin-bottom: 5px;">Regional HQ: Mang'u Road, Nairobi, Kenya</p>
      <p style="margin-bottom: 5px;">For Queries Contact +254 108289977</p>
      <p>Credible, Flexible, & Intelligent Learning.</p>
    </div>
  </div>
</div>
    `
    };

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
seed().catch(console.error);
