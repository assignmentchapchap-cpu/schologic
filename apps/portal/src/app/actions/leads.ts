'use server';

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { logSystemError } from '@/lib/logSystemError';
import { invalidateCache } from '@/lib/cache';

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export interface PilotRequestData {
  firstName: string;
  lastName: string;
  institution: string;
  jobTitle: string;
  email: string;
  phone: string;
  institutionSize: string;
  currentLms: string;
  primaryInterest: string[];
  virtualLearning: boolean;
  otherInfo?: string;
  note?: string;
}

export async function submitPilotRequest(data: PilotRequestData) {
  try {
    // 1. Insert into database
    const { error: dbError } = await supabaseAdmin
      .from('pilot_requests')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        institution: data.institution,
        job_title: data.jobTitle,
        email: data.email,
        phone: data.phone,
        institution_size: data.institutionSize,
        current_lms: data.currentLms,
        primary_interest: data.primaryInterest,
        virtual_learning: data.virtualLearning,
        other_info: data.otherInfo || null,
        note: data.note || null,
      });

    if (dbError) {
      console.error('DB Insert Error:', dbError);
      throw new Error('Failed to save request');
    }

    // Clear the active cache for pilots
    await invalidateCache('admin:leads:pilots');

    // 2. Send Admin Notification
    const { error: resendError } = await resend.emails.send({
      from: 'Schologic System <onboarding@schologic.com>',
      to: 'info@schologic.com',
      subject: `[LEAD] ${data.institution} - Pilot Request`,
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #1e293b; background: white; border: 1px solid #e2e8f0; border-top: 4px solid #4f46e5;">
  <div style="padding: 30px;">
    <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">New Institutional Lead</h2>
    
    <div style="margin-bottom: 30px;">
      <p style="font-size: 13px; color: #64748b; margin-bottom: 20px; font-weight: 500;">INSTITUTIONAL PARTNERSHIP PILOT INQUIRY</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #64748b; width: 140px;">Stakeholder</td>
          <td style="padding: 10px 0; font-size: 14px; font-weight: 600;">${data.firstName} ${data.lastName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #64748b;">Position</td>
          <td style="padding: 10px 0; font-size: 14px;">${data.jobTitle}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #64748b;">Email</td>
          <td style="padding: 10px 0; font-size: 14px;"><a href="mailto:${data.email}" style="color: #4f46e5; text-decoration: none;">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #64748b;">Phone</td>
          <td style="padding: 10px 0; font-size: 14px;">${data.phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #64748b;">Institution</td>
          <td style="padding: 10px 0; font-size: 14px; font-weight: 600;">${data.institution}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #64748b;">Scale</td>
          <td style="padding: 10px 0; font-size: 14px;">${data.institutionSize} students</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #64748b;">Current LMS</td>
          <td style="padding: 10px 0; font-size: 14px;">${data.currentLms}</td>
        </tr>
      </table>
    </div>

    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold; color: #475569;">PRIMARY INTERESTS</p>
      <p style="margin: 0; font-size: 14px; color: #1e293b;">${data.primaryInterest.join(', ')}</p>
      
      ${data.virtualLearning ? '<p style="margin: 10px 0 0 0; font-size: 12px; color: #4f46e5; font-weight: 600;">✓ HAS VIRTUAL LEARNING PROGRAM</p>' : ''}
    </div>

    ${data.otherInfo || data.note ? `
    <div style="margin-bottom: 30px;">
      <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold; color: #475569;">STRATEGIC CONTEXT / NOTES</p>
      <p style="margin: 0; font-size: 14px; color: #334155; font-style: italic;">"${data.otherInfo || ''} ${data.note || ''}"</p>
    </div>
    ` : ''}

    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 11px; color: #94a3b8; text-align: center;">
      <p>This lead was generated via the Schologic Institutional Pilot Form.</p>
    </div>
  </div>
</div>
      `
    });

    // 3. Send Customer Confirmation
    await resend.emails.send({
      from: 'Schologic Partnership Team <onboarding@schologic.com>',
      to: data.email,
      subject: 'Pilot Request Acknowledged - Schologic Institutional Partnership',
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">SCHOLOGIC LMS</h1>
    <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Custom LMS Provider</p>
  </div>

  <div style="padding: 40px 30px;">
    <p style="font-size: 16px; margin-top: 0;">Hello ${data.firstName},</p>
    
    <p style="font-size: 15px;">Your inquiry regarding a <strong>Schologic Institutional Pilot</strong> at <strong>${data.institution}</strong> has been secured by our priority system.</p>
    
    <p style="font-size: 15px;">We understand the critical nature of maintaining academic integrity and excellence at scale. Below is your engagement roadmap:</p>

    <!-- ROAMAP -->
    <div style="margin: 40px 0;">
      <div style="display: flex; align-items: flex-start; margin-bottom: 25px;">
        <div style="background: #4f46e5; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 15px; flex-shrink: 0;">1</div>
        <div>
          <p style="margin: 0; font-weight: bold; color: #0f172a;">Request Logged</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Your inquiry is currenty being processed by our regional lead coordinator.</p>
        </div>
      </div>
      <div style="display: flex; align-items: flex-start; margin-bottom: 25px;">
        <div style="background: #f1f5f9; color: #475569; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 15px; flex-shrink: 0;">2</div>
        <div>
          <p style="margin: 0; font-weight: bold; color: #0f172a;">Institutional Alignment</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">A strategist will review your institution's specific requirements (<strong>${data.institutionSize} students, ${data.currentLms}</strong>).</p>
        </div>
      </div>
      <div style="display: flex; align-items: flex-start;">
        <div style="background: #f1f5f9; color: #475569; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 15px; flex-shrink: 0;">3</div>
        <div>
          <p style="margin: 0; font-weight: bold; color: #0f172a;">Strategic Briefing</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Our team will contact you within 2 business days to schedule a consultation.</p>
        </div>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 25px; margin-top: 30px;">
      <p style="margin: 0 0 15px 0; font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Engagement Summary</p>
      <p style="margin: 5px 0; font-size: 13px;"><strong>Lead Stakeholder:</strong> ${data.firstName} ${data.lastName}</p>
      <p style="margin: 5px 0; font-size: 13px;"><strong>Institutional Focus:</strong> ${data.primaryInterest.join(', ')}</p>
    </div>

    <p style="font-size: 14px; margin-top: 30px;">Sincerely,<br/><span style="font-weight: bold; color: #0f172a;">Schologic Partnership Team</span></p>
  </div>

  <div style="background: #f8fafc; padding: 30px; border-top: 1px solid #f1f5f9;">
    <p style="font-size: 12px; color: #64748b; margin-bottom: 20px; text-align: center;">If you did not request this pilot or have enquiries, contact us at <a href="mailto:info@schologic.com" style="color: #4f46e5; text-decoration: none;">info@schologic.com</a></p>
    <div style="text-align: center; color: #94a3b8; font-size: 11px;">
      <p style="margin-bottom: 5px;"><strong>Schologic LMS & Integrity Hub</strong></p>
      <p style="margin-bottom: 5px;">Regional HQ: Mang'u Road, Nairobi, Kenya</p>
      <p style="margin-bottom: 5px;">For Queries Contact +254 108289977</p>
      <p>Credible, Flexible, & Intelligent Learning.</p>
    </div>
  </div>
</div>
      `
    });

    if (resendError) {
      console.error('Resend API Error (Pilot):', resendError);
      await logSystemError({ path: '/actions/leads/submitPilotRequest/resend', errorMessage: resendError.message });
      throw new Error(`Email sending failed: ${resendError.message}`);
    }

    return { success: true };

  } catch (error: unknown) {
    console.error('Pilot Request Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit request';
    await logSystemError({ path: '/actions/leads/submitPilotRequest', errorMessage: message, stackTrace: error instanceof Error ? error.stack : undefined });
    return { error: message };
  }
}

export interface ShareDemoData {
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  message?: string;
}

export async function submitDemoInvite(data: ShareDemoData) {
  try {
    // 1. Insert into database
    const { error: dbError } = await supabaseAdmin
      .from('instructor_invites')
      .insert({
        sender_name: data.senderName,
        sender_email: data.senderEmail,
        recipient_name: data.recipientName,
        recipient_email: data.recipientEmail,
        recipient_phone: data.recipientPhone,
        message: data.message || null,
      });

    if (dbError) {
      console.error('DB Insert Error (Instructor Invite):', dbError);
      throw new Error(`Failed to log invitation: ${dbError.message} (${dbError.code})`);
    }

    // Clear the active cache for invites
    await invalidateCache('admin:leads:invites');

    // 2. Send Invitation to Recipient
    const { error: inviteEmailError } = await resend.emails.send({
      from: 'Schologic Team <onboarding@schologic.com>',
      to: data.recipientEmail,
      subject: `Private Invitation: Join ${data.senderName} on Schologic`,
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">SCHOLOGIC LMS</h1>
    <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Operating System for Academic Success</p>
  </div>

  <div style="padding: 40px 30px; background: #ffffff;">
    <p style="font-size: 16px; margin-top: 0;">Hello ${data.recipientName},</p>
    
    <p style="font-size: 15px;">Your colleague, <strong>${data.senderName}</strong>, has shared Schologic with you to explore for your department's grading and academic integrity needs.</p>

    <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 15px 20px; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase;">Shared By</p>
      <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Name:</strong> ${data.senderName}</p>
      <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Email:</strong> <a href="mailto:${data.senderEmail}" style="color: #4f46e5; text-decoration: none;">${data.senderEmail}</a></p>
      ${data.recipientPhone ? `<p style="margin: 0; font-size: 14px; color: #334155;"><strong>Phone:</strong> ${data.recipientPhone}</p>` : ''}
    </div>

    ${data.message ? `
    <div style="margin: 25px 0; font-style: italic; color: #475569;">
      "${data.message}"
    </div>
    ` : ''}

    <div style="margin: 30px 0;">
      <p style="font-size: 15px; color: #475569; margin-bottom: 20px;">
        To review the platform and access your demo account, please follow the link below:
      </p>
      <p style="font-size: 14px; margin-bottom: 0;">
        <a href="https://schologic.com/?mode=demo" style="color: #4f46e5; font-weight: 600; text-decoration: underline;">Access Demo Account &rarr;</a>
      </p>
    </div>

    <p style="font-size: 14px; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">Sincerely,<br/><span style="font-weight: bold; color: #0f172a;">The Schologic Team</span></p>
  </div>
  
  <div style="background: #f8fafc; padding: 25px 30px; border-top: 1px solid #f1f5f9; text-align: center;">
    <p style="font-size: 13px; color: #475569; margin-bottom: 20px;">You received this message because ${data.senderEmail} shared Schologic with you.</p>
    <div style="color: #94a3b8; font-size: 11px;">
      <p style="margin-bottom: 5px; font-weight: 600; font-size: 12px; color: #64748b;">Schologic LMS & Integrity Hub</p>
      <p style="margin-bottom: 5px;">Headquarters: Mang'u Road, Nairobi, Kenya</p>
      <p style="margin-bottom: 5px;">Support: +254 108 289 977</p>
      <p style="margin-bottom: 15px;">Credible, Flexible, & Intelligent Learning.</p>
      <p style="margin-top: 20px; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-family: monospace; color: #cbd5e1;">SEC-REF: ${Math.random().toString(36).substring(2, 8).toUpperCase()} &copy; ${new Date().getFullYear()}</p>
    </div>
  </div>
</div>
      `
    });

    if (inviteEmailError) {
      console.error('Resend API Error (Recipient Invite):', inviteEmailError);
      await logSystemError({ path: '/actions/leads/submitDemoInvite/resend_recipient', errorMessage: inviteEmailError.message });
      throw new Error(`Failed to send email to ${data.recipientEmail}: ${inviteEmailError.message}`);
    }

    // 3. Send Lead Notification to Admin
    // Delay 5 seconds to avoid Resend rate limit (2 req/sec)
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const { error: adminAuthError } = await resend.emails.send({
      from: 'Schologic System <onboarding@schologic.com>',
      to: 'info@schologic.com',
      subject: `[REFERRAL] New Lead Referred by ${data.senderName}`,
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #1e293b; background: white; border: 1px solid #e2e8f0; border-top: 4px solid #4f46e5;">
  <div style="padding: 30px;">
    <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">New Referral Lead</h2>
    
    <div style="margin-bottom: 30px;">
      <p style="font-size: 13px; color: #64748b; margin-bottom: 20px; font-weight: 500;">REFERRER DETAILS</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #64748b; width: 120px;">Name</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 600;">${data.senderName}</td>
        </tr>
         <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Email</td>
          <td style="padding: 8px 0; font-size: 14px;">${data.senderEmail}</td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #64748b; margin-bottom: 20px; font-weight: 500; border-top: 1px dashed #e2e8f0; padding-top: 20px;">RECIPIENT (LEAD) DETAILS</p>
      <table style="width: 100%; border-collapse: collapse;">
         <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #64748b; width: 120px;">Name</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 600;">${data.recipientName}</td>
        </tr>
         <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Email</td>
          <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${data.recipientEmail}" style="color: #4f46e5; text-decoration: none;">${data.recipientEmail}</a></td>
        </tr>
         <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Phone</td>
          <td style="padding: 8px 0; font-size: 14px;">${data.recipientPhone}</td>
        </tr>
      </table>
    </div>

    ${data.message ? `
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
      <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold; color: #475569; text-transform: uppercase;">Sender's Message</p>
      <p style="margin: 0; font-size: 14px; color: #334155; font-style: italic;">"${data.message}"</p>
    </div>
    ` : ''}
    
    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px;">
      <p>Lead generated via Schologic Share Demo Feature.</p>
    </div>
  </div>
</div>
      `
    });

    if (adminAuthError) {
      console.error('Resend API Error (Admin Notification):', adminAuthError);
    }

    // 4. Send Confirmation to Sender (CC)
    // Delay 5 seconds to avoid Resend rate limit
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const { error: senderAuthError } = await resend.emails.send({
      from: 'Schologic Team <onboarding@schologic.com>',
      to: data.senderEmail,
      subject: `You invited ${data.recipientName} to Schologic`,
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #0f172a; padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 300; letter-spacing: 2px;">SCHOLOGIC LMS</h1>
  </div>

  <div style="padding: 40px 30px;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${data.senderName},</p>
    
    <p style="font-size: 15px;">Thanks for sharing Schologic! We've successfully sent an invitation to <strong>${data.recipientName}</strong> (${data.recipientEmail}) on your behalf.</p>
    
    <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
       <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold; color: #64748b;">YOU SHARED:</p>
       <p style="margin: 0; font-size: 14px; color: #334155;">"Schologic is the operating system for modern faculty..."</p>
       ${data.message ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #334155; font-style: italic; border-top: 1px solid #cbd5e1; padding-top: 10px;">"${data.message}"</p>` : ''}
    </div>

    <p style="font-size: 14px;">We appreciate you advocating for better academic technology.</p>
  </div>
</div>
      `
    });

    if (senderAuthError) {
      console.error('Resend API Error (Sender Confirmation):', senderAuthError);
    }

    return { success: true };

  } catch (error: unknown) {
    console.error('Share Demo Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send invitation';
    await logSystemError({ path: '/actions/leads/submitDemoInvite', errorMessage: message, stackTrace: error instanceof Error ? error.stack : undefined });
    return { error: message };
  }
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactForm(data: ContactFormData) {
  try {
    // 1. Insert into database
    const { error: dbError } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });

    if (dbError) {
      console.error('DB Insert Error (Contact Form):', dbError);
      throw new Error('Failed to log contact submission');
    }

    // Clear the active cache for contacts
    await invalidateCache('admin:leads:contacts');

    // 2. Send notification to admin
    const { error: adminContactError } = await resend.emails.send({
      from: 'Schologic Contact <onboarding@schologic.com>',
      to: 'info@schologic.com',
      subject: `[CONTACT] ${data.subject}`,
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #1e293b; background: white; border: 1px solid #e2e8f0; border-top: 4px solid #4f46e5;">
  <div style="padding: 30px;">
    <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">New Contact Form Submission</h2>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
      <tr>
        <td style="padding: 10px 0; font-size: 14px; color: #64748b; width: 100px;">Name</td>
        <td style="padding: 10px 0; font-size: 14px; font-weight: 600;">${data.name}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-size: 14px; color: #64748b;">Email</td>
        <td style="padding: 10px 0; font-size: 14px;"><a href="mailto:${data.email}" style="color: #4f46e5; text-decoration: none;">${data.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-size: 14px; color: #64748b;">Subject</td>
        <td style="padding: 10px 0; font-size: 14px; font-weight: 600;">${data.subject}</td>
      </tr>
    </table>

    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold; color: #475569;">MESSAGE</p>
      <p style="margin: 0; font-size: 14px; color: #1e293b; white-space: pre-wrap;">${data.message}</p>
    </div>

    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 11px; color: #94a3b8; text-align: center;">
      <p>Submitted via the Schologic Contact Form.</p>
    </div>
  </div>
</div>
      `
    });

    if (adminContactError) {
      console.error('Resend API Error (Contact Admin):', adminContactError);
      await logSystemError({ path: '/actions/leads/submitContactForm/resend_admin', errorMessage: adminContactError.message });
      throw new Error(`Email sending to Admin failed: ${adminContactError.message}`);
    }

    // 3. Send acknowledgement to sender
    const { error: senderContactError } = await resend.emails.send({
      from: 'Schologic Team <onboarding@schologic.com>',
      to: data.email,
      subject: 'We received your message - Schologic',
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
    <h1 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 700;">SCHOLOGIC LMS</h1>
    <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 12px;">Credible, Flexible, & Intelligent Learning.</p>
  </div>

  <div style="padding: 40px 30px;">
    <p style="font-size: 16px; margin-top: 0;">Hello ${data.name},</p>
    
    <p style="font-size: 15px;">Thank you for reaching out. We've received your message regarding "<strong>${data.subject}</strong>" and our team will get back to you within 2 business days.</p>
    
    <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Your Message</p>
      <p style="margin: 0; font-size: 13px; color: #475569; white-space: pre-wrap;">${data.message}</p>
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
    });

    if (senderContactError) {
      console.error('Resend API Error (Contact Sender):', senderContactError);
      await logSystemError({ path: '/actions/leads/submitContactForm/resend_sender', errorMessage: senderContactError.message });
      // We won't throw here, since the admin already got it, but we log the failure.
    }

    return { success: true };

  } catch (error: unknown) {
    console.error('Contact Form Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send message';
    await logSystemError({ path: '/actions/leads/submitContactForm', errorMessage: message, stackTrace: error instanceof Error ? error.stack : undefined });
    return { error: message };
  }
}

