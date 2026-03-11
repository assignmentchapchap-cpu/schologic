const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
    const templates = [
        {
            name: 'New Referral Lead',
            subject: '[REFERRAL] New Lead Referred by {{senderName}}',
            category: 'admin',
            content_html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #1e293b; background: white; border: 1px solid #e2e8f0; border-top: 4px solid #4f46e5;">
  <div style="padding: 30px;">
    <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">New Referral Lead</h2>
    
    <div style="margin-bottom: 30px;">
      <p style="font-size: 13px; color: #64748b; margin-bottom: 20px; font-weight: 500;">REFERRER DETAILS</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #64748b; width: 120px;">Name</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 600;">{{senderName}}</td>
        </tr>
         <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Email</td>
          <td style="padding: 8px 0; font-size: 14px;">{{senderEmail}}</td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #64748b; margin-bottom: 20px; font-weight: 500; border-top: 1px dashed #e2e8f0; padding-top: 20px;">RECIPIENT (LEAD) DETAILS</p>
      <table style="width: 100%; border-collapse: collapse;">
         <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #64748b; width: 120px;">Name</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 600;">{{recipientName}}</td>
        </tr>
         <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Email</td>
          <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:{{recipientEmail}}" style="color: #4f46e5; text-decoration: none;">{{recipientEmail}}</a></td>
        </tr>
         <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Phone</td>
          <td style="padding: 8px 0; font-size: 14px;">{{recipientPhone}}</td>
        </tr>
      </table>
    </div>

    {{messageHtml}}
    
    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px;">
      <p>Lead generated via Schologic Share Demo Feature.</p>
    </div>
  </div>
</div>
      `
        },
        {
            name: 'Private Invitation',
            subject: 'You have been invited to Schologic LMS',
            category: 'onboarding',
            content_html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">SCHOLOGIC LMS</h1>
    <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Private Invitation</p>
  </div>

  <div style="padding: 40px 30px;">
    <p style="font-size: 16px; margin-top: 0;">Hi {{recipientName}},</p>
    
    <p style="font-size: 15px;"><strong>{{senderName}}</strong> has invited you to explore Schologic LMS.</p>
    
    <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 20px; margin: 25px 0;">
      <p style="margin: 0; font-size: 14px; color: #334155; font-style: italic;">"Schologic is the operating system for modern faculty. I thought you'd be interested in seeing how it handles academic integrity and workflow."</p>
      {{messageHtml}}
    </div>

    <p style="font-size: 15px; margin-bottom: 25px;">You can view the interactive demo below:</p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="https://schologic.com" style="background-color: #4f46e5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">Explore Schologic Demo</a>
    </div>

    <p style="font-size: 14px; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">Sincerely,<br/><span style="font-weight: bold; color: #0f172a;">The Schologic Team</span></p>
  </div>
  
  <div style="background: #f8fafc; padding: 25px 30px; border-top: 1px solid #f1f5f9; text-align: center;">
    <p style="font-size: 13px; color: #475569; margin-bottom: 20px;">You received this message because {{senderEmail}} shared Schologic with you.</p>
    <div style="color: #94a3b8; font-size: 11px;">
      <p style="margin-bottom: 5px; font-weight: 600; font-size: 12px; color: #64748b;">Schologic LMS & Integrity Hub</p>
      <p style="margin-bottom: 5px;">Headquarters: Mang'u Road, Nairobi, Kenya</p>
      <p style="margin-bottom: 5px;">Support: +254 108 289 977</p>
      <p style="margin-bottom: 15px;">Credible, Flexible, & Intelligent Learning.</p>
      <p style="margin-top: 20px; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-family: monospace; color: #cbd5e1;">SEC-REF: {{secRef}} &copy; {{year}}</p>
    </div>
  </div>
</div>
      `
        },
        {
            name: 'Referral Confirmation',
            subject: 'You invited {{recipientName}} to Schologic',
            category: 'onboarding',
            content_html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #0f172a; padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 300; letter-spacing: 2px;">SCHOLOGIC LMS</h1>
  </div>

  <div style="padding: 40px 30px;">
    <p style="font-size: 16px; margin-top: 0;">Hi {{senderName}},</p>
    
    <p style="font-size: 15px;">Thanks for sharing Schologic! We've successfully sent an invitation to <strong>{{recipientName}}</strong> ({{recipientEmail}}) on your behalf.</p>
    
    <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
       <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold; color: #64748b;">YOU SHARED:</p>
       <p style="margin: 0; font-size: 14px; color: #334155;">"Schologic is the operating system for modern faculty..."</p>
       {{messageHtml}}
    </div>

    <p style="font-size: 14px;">We appreciate you advocating for better academic technology.</p>
  </div>
</div>
      `
        },
        {
            name: 'New Contact Form Submission',
            subject: '[CONTACT] {{contactSubject}}',
            category: 'admin',
            content_html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #1e293b; background: white; border: 1px solid #e2e8f0; border-top: 4px solid #4f46e5;">
  <div style="padding: 30px;">
    <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">New Contact Form Submission</h2>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
      <tr>
        <td style="padding: 10px 0; font-size: 14px; color: #64748b; width: 100px;">Name</td>
        <td style="padding: 10px 0; font-size: 14px; font-weight: 600;">{{name}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-size: 14px; color: #64748b;">Email</td>
        <td style="padding: 10px 0; font-size: 14px;"><a href="mailto:{{email}}" style="color: #4f46e5; text-decoration: none;">{{email}}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-size: 14px; color: #64748b;">Subject</td>
        <td style="padding: 10px 0; font-size: 14px; font-weight: 600;">{{contactSubject}}</td>
      </tr>
    </table>

    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold; color: #475569;">MESSAGE</p>
      <p style="margin: 0; font-size: 14px; color: #1e293b; white-space: pre-wrap;">{{message}}</p>
    </div>

    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 11px; color: #94a3b8; text-align: center;">
      <p>Submitted via the Schologic Contact Form.</p>
    </div>
  </div>
</div>
      `
        },
        {
            name: 'Contact Acknowledged',
            subject: 'We received your message - Schologic',
            category: 'onboarding',
            content_html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
    <h1 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 700;">SCHOLOGIC LMS</h1>
    <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 12px;">Credible, Flexible, & Intelligent Learning.</p>
  </div>

  <div style="padding: 40px 30px;">
    <p style="font-size: 16px; margin-top: 0;">Hello {{name}},</p>
    
    <p style="font-size: 15px;">Thank you for reaching out. We've received your message regarding "<strong>{{contactSubject}}</strong>" and our team will get back to you within 2 business days.</p>
    
    <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Your Message</p>
      <p style="margin: 0; font-size: 13px; color: #475569; white-space: pre-wrap;">{{message}}</p>
    </div>

    <p style="font-size: 14px; margin-top: 30px;">Sincerely,<br/><span style="font-weight: bold; color: #0f172a;">The Schologic Team</span></p>
  </div>

  <div style="background: #f8fafc; padding: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
    <div style="color: #94a3b8; font-size: 11px;">
      <p style="margin-bottom: 5px;"><strong>Schologic LMS</strong></p>
      <p style="margin-bottom: 5px;">For Queries Contact +254 108289977</p>
      <p>Credible, Flexible, & Intelligent Learning.</p>
    </div>
  </div>
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
