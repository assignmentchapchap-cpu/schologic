const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
    const templates = [
        {
            name: 'Verify Practicum Log',
            subject: 'Action Required: Verify Practicum Log for {{studentName}}',
            category: 'academic',
            content_html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p style="font-size: 11px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">SCHOLOGIC PRACTICUM // VERIFICATION</p>
  <p>Dear {{supervisorName}},</p>
  <p><strong>{{studentName}}</strong> has submitted a log entry for <strong>{{practicumTitle}}</strong>.</p>
  <p>Your verification is required to confirm these activities.</p>
  <div style="margin: 30px 0;">
    <a href="{{verificationLink}}" style="background: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review & Verify Log</a>
  </div>
  <p style="font-size: 12px; color: #64748b;">Link: <a href="{{verificationLink}}">{{verificationLink}}</a></p>
</div>
      `
        },
        {
            name: 'Final Report Request',
            subject: 'Final Report Request: {{studentName}}',
            category: 'academic',
            content_html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p style="font-size: 11px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">SCHOLOGIC PRACTICUM // FINAL REPORT</p>
  <p>Dear {{supervisorName}},</p>
  <p>You are supervising <strong>{{studentName}}</strong> for <strong>{{practicumTitle}}</strong>.</p>
  <p>As the practicum period concludes, we kindly request you to complete the <strong>Final Evaluation Report</strong>.</p>
  <p>Your assessment accounts for <strong>50%</strong> of the student's final grade.</p>
  
  <div style="margin: 30px 0;">
    <a href="{{reportLink}}" style="background: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Final Report</a>
  </div>
  
  <p style="font-size: 12px; color: #64748b;">
    This link is valid for 14 days.<br>
    Link: <a href="{{reportLink}}">{{reportLink}}</a>
  </p>
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
