'use server';

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';
import { redis } from '@/lib/redis';
import { draftProspectEmail, type ProspectProfile } from '@schologic/ai-bridge';

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

        await invalidateEmailCache('sent');
        await invalidateEmailCache('inbox');
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
    scheduledAt?: string | null;
    prospectId?: string | null;
    aiTemplateId?: string | null;
}

export async function saveDraft(data: DraftData) {
    try {
        await ensureSuperadmin();

        const draftPayload: any = {
            direction: 'outbound' as const,
            from_email: data.from,
            to_emails: data.to,
            cc_emails: data.cc || [],
            bcc_emails: data.bcc || [],
            subject: data.subject,
            body_html: data.html,
            status: data.scheduledAt ? 'scheduled' : 'draft', // Support immediate queuing
            thread_id: data.threadId || null,
            is_read: true,
            scheduled_at: data.scheduledAt || null,
            prospect_id: data.prospectId || null,
            ai_generated_from_template_id: data.aiTemplateId || null,
        };

        if (data.id) {
            // Update existing draft
            const { error } = await supabaseAdmin
                .from('platform_emails')
                .update(draftPayload)
                .eq('id', data.id)
                .eq('status', 'draft'); // safety: only update drafts

            if (error) throw error;
            await invalidateEmailCache('drafts');
            return { success: true, id: data.id };
        } else {
            // Create new draft
            const { data: inserted, error } = await supabaseAdmin
                .from('platform_emails')
                .insert(draftPayload)
                .select('id')
                .single();

            if (error) throw error;
            await invalidateEmailCache('drafts');
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
            .in('status', ['draft', 'scheduled']);

        if (error) throw error;
        await invalidateEmailCache('drafts');
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
                query = query.in('status', ['draft', 'scheduled']);
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

// ─── Search Emails (Server-Side, Redis-Cached) ─────────────────────

export async function searchEmails(
    query: string,
    folder: EmailFolder,
    filterStatus = '',
    page = 1,
    pageSize = 25
) {
    try {
        await ensureSuperadmin();

        // Build cache key
        const cacheKey = `emails:${folder}:${filterStatus}:${query.toLowerCase().trim()}:p${page}`;

        // Check Redis cache
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return typeof cached === 'string' ? JSON.parse(cached) : cached;
            }
        } catch (cacheErr) {
            console.warn('[searchEmails] Redis read failed, falling through to DB:', cacheErr);
        }

        // Build Supabase query
        let dbQuery = supabaseAdmin
            .from('platform_emails')
            .select('*', { count: 'exact' });

        // Folder filter
        switch (folder) {
            case 'inbox':
                dbQuery = dbQuery.eq('direction', 'inbound');
                break;
            case 'sent':
                dbQuery = dbQuery.eq('direction', 'outbound').neq('status', 'draft');
                break;
            case 'drafts':
                dbQuery = dbQuery.in('status', ['draft', 'scheduled']);
                break;
        }

        // Status filter
        if (filterStatus) {
            if (filterStatus === 'unread') {
                dbQuery = dbQuery.eq('is_read', false);
            } else if (filterStatus === 'read') {
                dbQuery = dbQuery.eq('is_read', true);
            } else {
                dbQuery = dbQuery.eq('status', filterStatus);
            }
        }

        // Text search
        if (query.trim()) {
            const q = `%${query.trim()}%`;
            dbQuery = dbQuery.or(`subject.ilike.${q},from_email.ilike.${q},body_text.ilike.${q}`);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await dbQuery
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        const result = { data: data || [], total: count || 0 };

        // Cache the result for 60s
        try {
            await redis.setex(cacheKey, 60, JSON.stringify(result));
        } catch (cacheErr) {
            console.warn('[searchEmails] Redis write failed:', cacheErr);
        }

        return result;
    } catch (error: any) {
        console.error('[searchEmails] Error:', error);
        return { data: [], total: 0, error: error.message };
    }
}

// ─── Global Search (All Folders) ────────────────────────────────────

export async function searchEmailsGlobal(query: string) {
    try {
        await ensureSuperadmin();
        if (!query.trim()) return { inbox: [], sent: [], drafts: [] };

        const cacheKey = `emails:global:${query.toLowerCase().trim()}`;

        // Check Redis cache
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return typeof cached === 'string' ? JSON.parse(cached) : cached;
            }
        } catch (cacheErr) {
            console.warn('[searchEmailsGlobal] Redis read failed:', cacheErr);
        }

        const q = `%${query.trim()}%`;
        const searchFilter = `subject.ilike.${q},from_email.ilike.${q},body_text.ilike.${q}`;

        // Search all three folders in parallel
        const [inboxRes, sentRes, draftsRes] = await Promise.all([
            supabaseAdmin
                .from('platform_emails')
                .select('id, from_email, to_emails, subject, status, is_read, created_at')
                .eq('direction', 'inbound')
                .or(searchFilter)
                .order('created_at', { ascending: false })
                .limit(10),
            supabaseAdmin
                .from('platform_emails')
                .select('id, from_email, to_emails, subject, status, is_read, created_at')
                .eq('direction', 'outbound')
                .neq('status', 'draft')
                .or(searchFilter)
                .order('created_at', { ascending: false })
                .limit(10),
            supabaseAdmin
                .from('platform_emails')
                .select('id, from_email, to_emails, subject, created_at')
                .eq('status', 'draft')
                .or(searchFilter)
                .order('created_at', { ascending: false })
                .limit(10),
        ]);

        const result = {
            inbox: inboxRes.data || [],
            sent: sentRes.data || [],
            drafts: draftsRes.data || [],
        };

        // Cache for 60s
        try {
            await redis.setex(cacheKey, 60, JSON.stringify(result));
        } catch (cacheErr) {
            console.warn('[searchEmailsGlobal] Redis write failed:', cacheErr);
        }

        return result;
    } catch (error: any) {
        console.error('[searchEmailsGlobal] Error:', error);
        return { inbox: [], sent: [], drafts: [], error: error.message };
    }
}

// ─── Cache Invalidation Helper ─────────────────────────────────────

async function invalidateEmailCache(folder?: string) {
    try {
        // Simple approach: delete known cache patterns
        // In production you might use redis.keys() + pipeline, but
        // for a small admin panel, selective invalidation is fine.
        const patterns = folder
            ? [`emails:${folder}:*`, 'emails:global:*']
            : ['emails:inbox:*', 'emails:sent:*', 'emails:drafts:*', 'emails:global:*'];

        for (const pattern of patterns) {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        }
    } catch (err) {
        console.warn('[invalidateEmailCache] Redis error (non-blocking):', err);
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
        await invalidateEmailCache('inbox');
        return { success: true };
    } catch (error: any) {
        console.error('[markEmailAsRead] Error:', error);
        return { error: error.message };
    }
}

// ─── Bulk Email Action ─────────────────────────────────────────────

export async function bulkEmailAction(
    emailIds: string[],
    action: 'markRead' | 'markUnread' | 'delete'
) {
    try {
        await ensureSuperadmin();
        if (!emailIds.length) return { success: true };

        if (action === 'markRead') {
            const { error } = await supabaseAdmin
                .from('platform_emails')
                .update({ is_read: true })
                .in('id', emailIds);
            if (error) throw error;
        } else if (action === 'markUnread') {
            const { error } = await supabaseAdmin
                .from('platform_emails')
                .update({ is_read: false })
                .in('id', emailIds);
            if (error) throw error;
        } else if (action === 'delete') {
            const { error } = await supabaseAdmin
                .from('platform_emails')
                .delete()
                .in('id', emailIds);
            if (error) throw error;
        }

        await invalidateEmailCache();
        return { success: true };
    } catch (error: any) {
        console.error('[bulkEmailAction] Error:', error);
        return { error: error.message || 'Bulk action failed' };
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

// ─── AI Regeneration & Scheduling ──────────────────────────────────────

export async function regenerateDraft(draftId: string, note: string) {
    try {
        await ensureSuperadmin();

        const { data: draft, error: draftErr } = await supabaseAdmin
            .from('platform_emails')
            .select('*')
            .eq('id', draftId)
            .single();

        if (draftErr || !draft) throw new Error('Draft not found.');

        if (!draft.ai_generated_from_template_id || !draft.prospect_id) {
            throw new Error('Not an AI generated draft.');
        }

        const { data: template } = await supabaseAdmin
            .from('platform_templates')
            .select('*')
            .eq('id', draft.ai_generated_from_template_id)
            .single();

        const { data: prospect } = await supabaseAdmin
            .from('prospects')
            .select('*')
            .eq('id', draft.prospect_id)
            .single();

        if (!template || !prospect) throw new Error('Missing template or prospect data.');

        const prospectProfile: ProspectProfile = {
            institution_name: prospect.institution_name,
            location: prospect.location,
            type: prospect.type,
            website: prospect.website,
            contact_name: prospect.contact_name,
            job_title: prospect.job_title
        };

        const result = await draftProspectEmail(prospectProfile, template.subject, template.body_html, note);

        const { error: updateErr } = await supabaseAdmin
            .from('platform_emails')
            .update({
                subject: result.subject,
                body_html: result.html,
                updated_at: new Date().toISOString()
            })
            .eq('id', draftId);

        if (updateErr) throw updateErr;

        await invalidateEmailCache('drafts');
        return { success: true };
    } catch (e: any) {
        console.error('[regenerateDraft] Error:', e);
        return { error: e.message || 'Failed to regenerate draft.' };
    }
}

export async function approveAndScheduleDrafts(ids: string[], startDate: string, staggerMinutes: number = 0) {
    try {
        await ensureSuperadmin();
        let currentSendTime = new Date(startDate);

        // Process sequentially to stagger correctly
        for (const id of ids) {
            const { error } = await supabaseAdmin
                .from('platform_emails')
                .update({
                    status: 'scheduled',
                    scheduled_at: currentSendTime.toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .in('status', ['draft', 'scheduled']);

            if (error) throw error;

            if (staggerMinutes > 0) {
                currentSendTime = new Date(currentSendTime.getTime() + staggerMinutes * 60000);
            }
        }
        await invalidateEmailCache('drafts');
        return { success: true };
    } catch (e: any) {
        console.error('[approveAndScheduleDrafts] Error:', e);
        return { error: e.message || 'Failed to schedule drafts.' };
    }
}
