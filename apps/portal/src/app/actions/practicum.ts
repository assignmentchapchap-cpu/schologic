'use server';

import { createSessionClient } from "@schologic/database";
import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from "next/headers";
import { Resend } from 'resend';
import { Database } from "@schologic/database";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Admin client for privileged operations (bypassing RLS for supervisor actions)
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

/**
 * Sends a verification email to the supervisor linked to this log's student/practicum.
 * Does NOT update database status; pure side-effect.
 */
export async function sendSupervisorVerificationEmail(logId: string) {
    try {
        const headerStore = await headers();

        // 1. Fetch Log & Student Info
        // We use admin client to ensure we can read even if RLS somehow restricts (though usually student owns it)
        const { data: log, error: logError } = await supabaseAdmin
            .from('practicum_logs')
            .select(`
                *,
                profiles:student_id ( id, first_name, last_name, full_name, email ),
                practicums:practicum_id ( title )
            `)
            .eq('id', logId)
            .single();

        if (logError || !log) {
            console.error("Fetch Log Error Details:", { logId, logError, log });
            throw new Error(`Could not fetch log details for ID: ${logId}. DB Error: ${logError?.message}`);
        }

        const studentName = log.profiles?.full_name || log.profiles?.first_name || 'Student';
        const practicumTitle = log.practicums?.title || 'Practicum';

        // 2. Fetch Enrollment to get Supervisor Data
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
