'use server';

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Auth Helper ───────────────────────────────────────────────────

async function ensureSuperadmin() {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized');

    const role = user.app_metadata?.role || user.user_metadata?.role;
    if (role !== 'superadmin') throw new Error('Unauthorized: Superadmin access required');
    return user;
}

// Removed SENDER_IDENTITIES to avoid non-function export in use server file


// ─── Send Email ────────────────────────────────────────────────────

export interface SendEmailData {
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    replyTo?: string;
    subject: string;
    html: string;
    threadId?: string;
}

export async function sendEmail(data: SendEmailData) {
    try {
        await ensureSuperadmin();

        // 1. Send via Resend
        const { data: resendData, error: resendError } = await resend.emails.send({
            from: data.from,
            to: data.to,
            cc: data.cc || undefined,
            bcc: data.bcc || undefined,
            replyTo: data.replyTo || undefined,
            subject: data.subject,
            html: data.html,
        });

        if (resendError) {
            console.error('[sendEmail] Resend error:', resendError);
            throw new Error(`Failed to send email: ${resendError.message}`);
        }

        // 2. Store in platform_emails
        const { error: dbError } = await supabaseAdmin.from('platform_emails').insert({
            resend_id: resendData?.id || null,
            direction: 'outbound',
            from_email: data.from,
            to_emails: data.to,
            cc_emails: data.cc || [],
            bcc_emails: data.bcc || [],
            reply_to: data.replyTo || null,
            subject: data.subject,
            body_html: data.html,
            status: 'sent',
            thread_id: data.threadId || null,
            is_read: true, // outbound emails are always "read"
        });

        if (dbError) {
            console.error('[sendEmail] DB insert error:', dbError);
            // Don't throw — email was already sent
        }

        return { success: true, id: resendData?.id };
    } catch (error: any) {
        console.error('[sendEmail] Error:', error);
        return { error: error.message || 'Failed to send email' };
    }
}

// ─── Save Draft ────────────────────────────────────────────────────

export interface DraftData {
    id?: string;         // existing draft id for update
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    html: string;
    threadId?: string;
}

export async function saveDraft(data: DraftData) {
    try {
        await ensureSuperadmin();

        const draftPayload = {
            direction: 'outbound' as const,
            from_email: data.from,
            to_emails: data.to,
            cc_emails: data.cc || [],
            bcc_emails: data.bcc || [],
            subject: data.subject,
            body_html: data.html,
            status: 'draft',
            thread_id: data.threadId || null,
            is_read: true,
        };

        if (data.id) {
            // Update existing draft
            const { error } = await supabaseAdmin
                .from('platform_emails')
                .update(draftPayload)
                .eq('id', data.id)
                .eq('status', 'draft'); // safety: only update drafts

            if (error) throw error;
            return { success: true, id: data.id };
        } else {
            // Create new draft
            const { data: inserted, error } = await supabaseAdmin
                .from('platform_emails')
                .insert(draftPayload)
                .select('id')
                .single();

            if (error) throw error;
            return { success: true, id: inserted?.id };
        }
    } catch (error: any) {
        console.error('[saveDraft] Error:', error);
        return { error: error.message || 'Failed to save draft' };
    }
}

// ─── Delete Draft ──────────────────────────────────────────────────

export async function deleteDraft(draftId: string) {
    try {
        await ensureSuperadmin();

        const { error } = await supabaseAdmin
            .from('platform_emails')
            .delete()
            .eq('id', draftId)
            .eq('status', 'draft');

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('[deleteDraft] Error:', error);
        return { error: error.message || 'Failed to delete draft' };
    }
}

// ─── Get Emails ────────────────────────────────────────────────────

export type EmailFolder = 'inbox' | 'sent' | 'drafts';

export async function getEmails(folder: EmailFolder, page = 1, pageSize = 25) {
    try {
        await ensureSuperadmin();

        let query = supabaseAdmin
            .from('platform_emails')
            .select('*', { count: 'exact' });

        switch (folder) {
            case 'inbox':
                query = query.eq('direction', 'inbound');
                break;
            case 'sent':
                query = query.eq('direction', 'outbound').neq('status', 'draft');
                break;
            case 'drafts':
                query = query.eq('status', 'draft');
                break;
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return { data: data || [], total: count || 0 };
    } catch (error: any) {
        console.error('[getEmails] Error:', error);
        return { data: [], total: 0, error: error.message };
    }
}

// ─── Get Single Email ──────────────────────────────────────────────

export async function getEmailById(emailId: string) {
    try {
        await ensureSuperadmin();

        const { data, error } = await supabaseAdmin
            .from('platform_emails')
            .select('*')
            .eq('id', emailId)
            .single();

        if (error) throw error;
        return { data };
    } catch (error: any) {
        console.error('[getEmailById] Error:', error);
        return { error: error.message };
    }
}

// ─── Get Thread ────────────────────────────────────────────────────

export async function getThread(threadId: string) {
    try {
        await ensureSuperadmin();

        // Get the root email + all emails in the thread
        const { data, error } = await supabaseAdmin
            .from('platform_emails')
            .select('*')
            .or(`id.eq.${threadId},thread_id.eq.${threadId}`)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return { data: data || [] };
    } catch (error: any) {
        console.error('[getThread] Error:', error);
        return { data: [], error: error.message };
    }
}

// ─── Mark as Read ──────────────────────────────────────────────────

export async function markEmailAsRead(emailId: string) {
    try {
        await ensureSuperadmin();

        const { error } = await supabaseAdmin
            .from('platform_emails')
            .update({ is_read: true })
            .eq('id', emailId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('[markEmailAsRead] Error:', error);
        return { error: error.message };
    }
}

// ─── Render Template ───────────────────────────────────────────────

export async function renderTemplate(templateId: string, variables: Record<string, string>) {
    try {
        await ensureSuperadmin();

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(templateId);

        const { data: template, error } = await supabaseAdmin
            .from('platform_templates')
            .select('subject, content_html')
            .eq(isUuid ? 'id' : 'name', templateId)
            .single();

        if (error || !template) throw new Error(`Template not found: ${templateId}`);

        // Simple {{variable}} interpolation
        let renderedSubject = template.subject;
        let renderedHtml = template.content_html;

        for (const [key, value] of Object.entries(variables)) {
            const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            renderedSubject = renderedSubject.replace(pattern, value);
            renderedHtml = renderedHtml.replace(pattern, value);
        }

        return { subject: renderedSubject, html: renderedHtml };
    } catch (error: any) {
        console.error('[renderTemplate] Error:', error);
        return { error: error.message };
    }
}

// ─── Template CRUD ─────────────────────────────────────────────────

export async function getTemplates() {
    try {
        await ensureSuperadmin();

        const { data, error } = await supabaseAdmin
            .from('platform_templates')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return { data: data || [] };
    } catch (error: any) {
        console.error('[getTemplates] Error:', error);
        return { data: [], error: error.message };
    }
}

export interface TemplateData {
    name: string;
    subject: string;
    content_html: string;
    variables: string[];
    category?: string;
}

export async function createTemplate(data: TemplateData) {
    try {
        await ensureSuperadmin();

        const { data: created, error } = await supabaseAdmin
            .from('platform_templates')
            .insert(data)
            .select('id')
            .single();

        if (error) throw error;
        return { success: true, id: created?.id };
    } catch (error: any) {
        console.error('[createTemplate] Error:', error);
        return { error: error.message };
    }
}

export async function updateTemplate(id: string, data: Partial<TemplateData>) {
    try {
        await ensureSuperadmin();

        const { error } = await supabaseAdmin
            .from('platform_templates')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('[updateTemplate] Error:', error);
        return { error: error.message };
    }
}

export async function deleteTemplate(id: string) {
    try {
        await ensureSuperadmin();

        const { error } = await supabaseAdmin
            .from('platform_templates')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('[deleteTemplate] Error:', error);
        return { error: error.message };
    }
}
