'use server';

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { logSystemError } from '@/lib/logSystemError';
import { invalidateCache } from '@/lib/cache';
import { createAdminNotification } from './adminNotifications';
import { renderTemplate, sendEmail } from '@/app/actions/adminEmails';

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
  institutionType: string;
  jobTitle: string;
  email: string;
  phone: string;
  institutionSize: string;
  currentLms: string;
  coreModules: string[];
  valueModules: string[];
  virtualLearning: boolean;
  otherInfo?: string;
  note?: string;
}

export async function submitPilotRequest(data: PilotRequestData) {
  try {
    // 1. Dual-Write Strategy for Database Insert
    // Combine for legacy Admin Leads dashboard compatibility
    const combinedInterests = [...data.coreModules, ...data.valueModules];

    // Structure for modern Pilot Portal (Tab 1) pre-population
    const modulesJsonb = {
      core: data.coreModules,
      add_ons: data.valueModules
    };

    const { error: dbError } = await supabaseAdmin
      .from('pilot_requests')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        institution: data.institution,
        institution_type: data.institutionType,
        job_title: data.jobTitle,
        email: data.email,
        phone: data.phone,
        institution_size: data.institutionSize,
        current_lms: data.currentLms,
        primary_interest: combinedInterests,
        modules_jsonb: modulesJsonb,
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

    // In-app admin notification (fire-and-forget but awaited for Vercel)
    await createAdminNotification({
      message: `New pilot request from ${data.firstName} ${data.lastName} at ${data.institution}`,
      type: 'admin_new_pilot',
      link: '/admin/leads',
    }).catch(() => { });

    // 2. Send Admin Notification
    const notesHtml = data.otherInfo || data.note ? `
    <div style="margin-bottom: 30px;">
      <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold; color: #475569;">STRATEGIC CONTEXT / NOTES</p>
      <p style="margin: 0; font-size: 14px; color: #334155; font-style: italic;">"${data.otherInfo || ''} ${data.note || ''}"</p>
    </div>
    ` : '';

    const virtualBadge = data.virtualLearning
      ? '<p style="margin: 10px 0 0 0; font-size: 12px; color: #4f46e5; font-weight: 600;">✓ HAS VIRTUAL LEARNING PROGRAM</p>'
      : '';

    const { subject: adminSubject, html: adminHtml } = await renderTemplate('New Institutional Lead Notification', {
      firstName: data.firstName,
      lastName: data.lastName,
      jobTitle: data.jobTitle,
      email: data.email,
      phone: data.phone,
      institution: data.institution,
      institutionSize: data.institutionSize,
      currentLms: data.currentLms,
      coreModules: data.coreModules.join(', '),
      valueModules: data.valueModules.join(', '),
      virtualBadge,
      notesHtml
    });

    const { error: resendError } = await sendEmail({
      from: 'Schologic System <onboarding@schologic.com>',
      to: ['info@schologic.com'],
      subject: adminSubject || `[LEAD] ${data.institution} - Pilot Request`,
      html: adminHtml!
    });

    // 3. Send Customer Confirmation
    const { subject: ackSubject, html: ackHtml } = await renderTemplate('Pilot Request Acknowledged', {
      firstName: data.firstName,
      lastName: data.lastName,
      institution: data.institution,
      institutionSize: data.institutionSize,
      currentLms: data.currentLms,
      coreModules: data.coreModules.join(', '),
      valueModules: data.valueModules.join(', ')
    });

    await sendEmail({
      from: 'Schologic Partnership Team <onboarding@schologic.com>',
      to: [data.email],
      subject: ackSubject || 'Pilot Request Acknowledged - Schologic Institutional Partnership',
      html: ackHtml!
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

    // In-app admin notification (fire-and-forget but awaited for Vercel)
    await createAdminNotification({
      message: `New instructor invite: ${data.recipientName} referred by ${data.senderName}`,
      type: 'admin_invite',
      link: '/admin/leads',
    }).catch(() => { });

    // 2. Send Invitation to Recipient
    const recipientMessageHtml = data.message ? `
    <div style="margin: 25px 0; font-style: italic; color: #475569;">
      "${data.message}"
    </div>
    ` : '';
    const { subject: inviteSubject, html: inviteHtml } = await renderTemplate('Private Invitation', {
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      secRef: Math.random().toString(36).substring(2, 8).toUpperCase(),
      year: new Date().getFullYear().toString(),
      messageHtml: recipientMessageHtml
    });

    const { error: inviteEmailError } = await sendEmail({
      from: 'Schologic Team <onboarding@schologic.com>',
      to: [data.recipientEmail],
      subject: inviteSubject || `Private Invitation: Join ${data.senderName} on Schologic`,
      html: inviteHtml!
    });

    if (inviteEmailError) {
      console.error('Resend API Error (Recipient Invite):', inviteEmailError);
      await logSystemError({ path: '/actions/leads/submitDemoInvite/resend_recipient', errorMessage: inviteEmailError.message });
      throw new Error(`Failed to send email to ${data.recipientEmail}: ${inviteEmailError.message}`);
    }

    // 3. Send Lead Notification to Admin
    // Delay 5 seconds to avoid Resend rate limit (2 req/sec)
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const adminMessageHtml = data.message ? `
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
      <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold; color: #475569; text-transform: uppercase;">Sender's Message</p>
      <p style="margin: 0; font-size: 14px; color: #334155; font-style: italic;">"${data.message}"</p>
    </div>
    ` : '';
    const { subject: referralSubject, html: referralHtml } = await renderTemplate('New Referral Lead', {
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      recipientPhone: data.recipientPhone || '',
      messageHtml: adminMessageHtml
    });

    const { error: adminAuthError } = await sendEmail({
      from: 'Schologic System <onboarding@schologic.com>',
      to: ['info@schologic.com'],
      subject: referralSubject || `[REFERRAL] New Lead Referred by ${data.senderName}`,
      html: referralHtml!
    });

    if (adminAuthError) {
      console.error('Resend API Error (Admin Notification):', adminAuthError);
    }

    // 4. Send Confirmation to Sender (CC)
    // Delay 5 seconds to avoid Resend rate limit
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const senderMessageHtml = data.message ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #334155; font-style: italic; border-top: 1px solid #cbd5e1; padding-top: 10px;">"${data.message}"</p>` : '';
    const { subject: confSubject, html: confHtml } = await renderTemplate('Referral Confirmation', {
      senderName: data.senderName,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      messageHtml: senderMessageHtml
    });

    const { error: senderAuthError } = await sendEmail({
      from: 'Schologic Team <onboarding@schologic.com>',
      to: [data.senderEmail],
      subject: confSubject || `You invited ${data.recipientName} to Schologic`,
      html: confHtml!
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

    // In-app admin notification (fire-and-forget but awaited for Vercel)
    await createAdminNotification({
      message: `New contact message: "${data.subject}" from ${data.name}`,
      type: 'admin_feedback',
      link: '/admin/leads',
    }).catch(() => { });

    // 2. Send notification to admin
    const { subject: adminContactSubject, html: adminContactHtml } = await renderTemplate('New Contact Form Submission', {
      name: data.name,
      email: data.email,
      contactSubject: data.subject,
      message: data.message
    });

    const { error: adminContactError } = await sendEmail({
      from: 'Schologic Contact <onboarding@schologic.com>',
      to: ['info@schologic.com'],
      subject: adminContactSubject || `[CONTACT] ${data.subject}`,
      html: adminContactHtml!
    });

    if (adminContactError) {
      console.error('Resend API Error (Contact Admin):', adminContactError);
      await logSystemError({ path: '/actions/leads/submitContactForm/resend_admin', errorMessage: adminContactError.message });
      throw new Error(`Email sending to Admin failed: ${adminContactError.message}`);
    }

    // 3. Send acknowledgement to sender
    const { subject: ackContactSubject, html: ackContactHtml } = await renderTemplate('Contact Acknowledged', {
      name: data.name,
      contactSubject: data.subject,
      message: data.message
    });

    const { error: senderContactError } = await sendEmail({
      from: 'Schologic Team <onboarding@schologic.com>',
      to: [data.email],
      subject: ackContactSubject || 'We received your message - Schologic',
      html: ackContactHtml!
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

