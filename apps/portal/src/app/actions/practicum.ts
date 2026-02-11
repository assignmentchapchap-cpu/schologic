'use server';

import { createSessionClient } from "@schologic/database";
import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from "next/headers";
import { Resend } from 'resend';
import { Database } from "@schologic/database";
import crypto from 'crypto';
import { SupervisorReport } from '@/types/practicum';

const resend = new Resend(process.env.RESEND_API_KEY!);

// Helper for admin operations
function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error("Missing Supabase Admin credentials");
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

/**
 * Sends a verification email to the supervisor linked to this log's student/practicum.
 * Does NOT update database status; pure side-effect.
 */
export async function sendSupervisorVerificationEmail(logId: string) {
    try {
        const headerStore = await headers();

        // 1. Fetch Log Details (Raw)
        // We use admin client to ensure we can read even if RLS somehow restricts
        const supabaseAdmin = getAdminClient();
        const { data: log, error: logError } = await supabaseAdmin
            .from('practicum_logs')
            .select('*')
            .eq('id', logId)
            .single();

        if (logError || !log) {
            console.error("Fetch Log Error Details:", { logId, logError, log });
            throw new Error(`Could not fetch log details for ID: ${logId}. DB Error: ${logError?.message}`);
        }

        // 2. Fetch Student Profile
        const { data: studentProfile, error: studentError } = await supabaseAdmin
            .from('profiles')
            .select('full_name, first_name, email')
            .eq('id', log.student_id)
            .single();

        // 3. Fetch Practicum Details
        const { data: practicumData, error: practicumError } = await supabaseAdmin
            .from('practicums')
            .select('title')
            .eq('id', log.practicum_id)
            .single();

        const studentName = studentProfile?.full_name || studentProfile?.first_name || 'Student';
        const practicumTitle = practicumData?.title || 'Practicum';

        // 4. Fetch Enrollment to get Supervisor Data
        const { data: enrollment, error: enrollError } = await supabaseAdmin
            .from('practicum_enrollments')
            .select('supervisor_data')
            .eq('student_id', log.student_id)
            .eq('practicum_id', log.practicum_id)
            .single();

        if (enrollError || !enrollment) {
            return { success: false, error: "Enrollment/Supervisor not found" };
        }

        const supervisorData = enrollment.supervisor_data as any;
        const supervisorEmail = supervisorData?.email;
        const supervisorName = supervisorData?.name || 'Supervisor';

        if (!supervisorEmail) {
            return { success: false, error: "No supervisor email configured" };
        }

        // 3. Generate Link
        const token = log.verification_token;
        if (!token) throw new Error("Verification token missing on log entry");

        // Determine Origin
        let origin = headerStore.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        if (process.env.NODE_ENV === 'development' && origin.includes('schologic.com')) {
            origin = 'http://localhost:3000'; // Fallback for local tunnel issues
        }

        const verificationLink = `${origin}/verify/${token}`;

        // 4. Send Email
        const { error: resendError } = await resend.emails.send({
            from: 'Schologic Practicum <onboarding@schologic.com>',
            to: supervisorEmail,
            subject: `Action Required: Verify Practicum Log for ${studentName}`,
            html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p style="font-size: 11px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">SCHOLOGIC PRACTICUM // VERIFICATION</p>
  <p>Dear ${supervisorName},</p>
  <p><strong>${studentName}</strong> has submitted a log entry for <strong>${practicumTitle}</strong>.</p>
  <p>Your verification is required to confirm these activities.</p>
  <div style="margin: 30px 0;">
    <a href="${verificationLink}" style="background: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review & Verify Log</a>
  </div>
  <p style="font-size: 12px; color: #64748b;">Link: <a href="${verificationLink}">${verificationLink}</a></p>
</div>
            `
        });

        if (resendError) throw new Error("Email dispatch failed: " + resendError.message);

        return { success: true };

    } catch (error: any) {
        console.error("Supervisor Email Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Securely updates a log's supervisor status using a verification token.
 * Used by the public verification page (unauthenticated).
 */
export async function verifyLogAction(
    token: string,
    decision: 'verified' | 'rejected',
    comment: string
) {
    try {
        if (!token) throw new Error("Token required");

        // 1. Find Log by Token (Using Admin Client to bypass RLS)
        const supabaseAdmin = getAdminClient();
        const { data: log, error: findError } = await supabaseAdmin
            .from('practicum_logs')
            .select('id, supervisor_status')
            .eq('verification_token', token)
            .single();

        if (findError || !log) throw new Error("Invalid or expired verification token");

        if (log.supervisor_status !== 'pending') {
            // Idempotency: success if already matching, error if trying to flip?
            // Let's allow strictly updates or simple overwrites.
        }

        // 2. Update Status
        const { error: updateError } = await supabaseAdmin
            .from('practicum_logs')
            .update({
                supervisor_status: decision,
                supervisor_comment: comment,
                supervisor_verified_at: new Date().toISOString()
            })
            .eq('id', log.id);

        if (updateError) throw updateError;

        return { success: true };

    } catch (error: any) {
        console.error("Verification Action Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updatePracticumRubric(
    practicumId: string,
    rubricType: 'logs' | 'supervisor' | 'report',
    rubricData: any
) {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);

        // 1. Verify User
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("Auth Error:", authError);
            throw new Error('Unauthorized');
        }

        // 2. Map type to column
        const columnMap = {
            'logs': 'logs_rubric',
            'supervisor': 'supervisor_report_template',
            'report': 'student_report_template'
        };

        const column = columnMap[rubricType];
        if (!column) throw new Error('Invalid rubric type');

        // 3. Update Database
        const { error } = await supabase
            .from('practicums')
            .update({ [column]: rubricData })
            .eq('id', practicumId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error updating rubric:', error);
        return { success: false, error: error.message };
    }
}

// --- SUPERVISOR FINAL REPORT ACTIONS ---

/**
 * Generates a secure HMAC signature for the report link.
 * Link validity depends on enrollment ID, expiration timestamp, and server secret.
 */
function signReportLink(enrollmentId: string, expiresAt: number) {
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const data = `${enrollmentId}:${expiresAt}`;
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verifies the signature of a report link.
 */
function verifyReportLink(enrollmentId: string, expiresAt: number, signature: string) {
    const expected = signReportLink(enrollmentId, expiresAt);
    return signature === expected;
}

/**
 * Sends "Final Report Request" emails to supervisors for selected students.
 * Generates a unique, signed link for each supervisor.
 */
export async function requestSupervisorReports(practicumId: string, studentIds: string[]) {
    try {
        const headerStore = await headers();
        const supabaseAdmin = getAdminClient();

        // 1. Fetch Enrollments with Supervisor Data
        const { data: enrollments, error: fetchError } = await supabaseAdmin
            .from('practicum_enrollments')
            .select(`
                id, student_id, supervisor_data,
                practicums:practicum_id ( title )
            `)
            .eq('practicum_id', practicumId)
            .in('student_id', studentIds);

        if (fetchError) throw fetchError;

        // 2. Fetch Profiles Manually (Avoids FK join issues if student_id -> auth.users vs profiles)
        const userIds = enrollments.map(e => e.student_id);
        const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, first_name')
            .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]));

        let sentCount = 0;
        let errorCount = 0;

        // Determine Origin
        let origin = headerStore.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        if (process.env.NODE_ENV === 'development' && origin.includes('schologic.com')) {
            origin = 'http://localhost:3000';
        }

        // 3. Iterate and Send
        for (const enrollment of enrollments || []) {
            const supervisor = enrollment.supervisor_data as any;
            const profile = profileMap.get(enrollment.student_id);

            if (!supervisor?.email) {
                console.warn(`No supervisor email for student ${profile?.full_name || 'unknown'}`);
                errorCount++;
                continue;
            }

            // Generate Link (Valid for 14 days)
            const expiresAt = Date.now() + (14 * 24 * 60 * 60 * 1000);
            const signature = signReportLink(enrollment.id, expiresAt);
            const reportLink = `${origin}/verify/report/${enrollment.id}?sig=${signature}&expires=${expiresAt}`;

            const studentName = profile?.full_name || 'Student';

            const practicumData = Array.isArray(enrollment.practicums) ? enrollment.practicums[0] : enrollment.practicums;
            const practicumTitle = (practicumData as any)?.title || 'Practicum';

            const { error: sendError } = await resend.emails.send({
                from: 'Schologic Practicum <onboarding@schologic.com>',
                to: supervisor.email,
                subject: `Final Report Request: ${studentName}`,
                html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p style="font-size: 11px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">SCHOLOGIC PRACTICUM // FINAL REPORT</p>
  <p>Dear ${supervisor.name || 'Supervisor'},</p>
  <p>You are supervising <strong>${studentName}</strong> for <strong>${practicumTitle}</strong>.</p>
  <p>As the practicum period concludes, we kindly request you to complete the <strong>Final Evaluation Report</strong>.</p>
  <p>Your assessment accounts for <strong>50%</strong> of the student's final grade.</p>
  
  <div style="margin: 30px 0;">
    <a href="${reportLink}" style="background: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Final Report</a>
  </div>
  
  <p style="font-size: 12px; color: #64748b;">
    This link is valid for 14 days.<br>
    Link: <a href="${reportLink}">${reportLink}</a>
  </p>
</div>
                `
            });

            if (sendError) {
                console.error(`Failed to email ${supervisor.email}`, sendError);
                errorCount++;
            } else {
                sentCount++;
            }
        }

        return { success: true, sent: sentCount, errors: errorCount };

    } catch (error: any) {
        console.error("Request Report Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Validates and saves a submitted Supervisor Final Report.
 * Publicly accessible but protected by HMAC signature.
 */
export async function submitSupervisorReport(
    enrollmentId: string,
    report: SupervisorReport,
    signature: string,
    expiresAt: number
) {
    try {
        // 1. Verify Signature
        if (Date.now() > expiresAt) throw new Error("This link has expired.");
        if (!verifyReportLink(enrollmentId, expiresAt, signature)) throw new Error("Invalid signature link.");

        // 2. Calculate Score (0-50 based on 50% weight)
        // Trust the report.total_score passed from frontend, but we should validate max.
        // For now, simplicity.

        // 3. Save to DB
        const supabaseAdmin = getAdminClient();
        const { error } = await supabaseAdmin
            .from('practicum_enrollments')
            .update({
                supervisor_report: report as any,
                // We DO NOT update final_grade yet.
            })
            .eq('id', enrollmentId);

        if (error) throw error;

        return { success: true };

    } catch (error: any) {
        console.error("Submit Report Error:", error);
        return { success: false, error: error.message };
    }
}
