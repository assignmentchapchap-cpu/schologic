'use server';

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

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

    // 2. Send Admin Notification
    await resend.emails.send({
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
    
    <p style="font-size: 15px;">We understand the critical nature of maintaining academic integrity and sovereignty at scale. Below is your engagement roadmap:</p>

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
      <p>Data Sovereignty Guaranteed | Zero-Training Implementation</p>
    </div>
  </div>
</div>
      `
    });

    return { success: true };

  } catch (error: unknown) {
    console.error('Pilot Request Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit request';
    return { error: message };
  }
}
