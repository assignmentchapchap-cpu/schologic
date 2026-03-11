import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

// Service-role client bypasses RLS — used by the webhook handler only
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET!;

// ─── Types ─────────────────────────────────────────────────────────

interface ResendEmailPayload {
    type: string;
    created_at: string;
    data: {
        email_id: string;
        from: string;
        to: string[];
        cc?: string[];
        bcc?: string[];
        subject: string;
        text?: string;
        html?: string;
        reply_to?: string[];
        // Inbound-specific fields
        message_id?: string;
        attachments?: Array<{
            id: string;
            filename: string;
            content_type: string;
            content?: string; // base64 content, if delivered inline
        }>;
    };
}

// ─── POST Handler ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        // 1. Read raw body and headers for verification
        const body = await request.text();
        const svixId = request.headers.get('svix-id');
        const svixTimestamp = request.headers.get('svix-timestamp');
        const svixSignature = request.headers.get('svix-signature');

        if (!svixId || !svixTimestamp || !svixSignature) {
            console.error('[Webhook] Missing svix headers');
            return NextResponse.json({ error: 'Missing verification headers' }, { status: 401 });
        }

        // 2. Verify webhook signature
        const wh = new Webhook(WEBHOOK_SECRET);
        let payload: ResendEmailPayload;
        try {
            payload = wh.verify(body, {
                'svix-id': svixId,
                'svix-timestamp': svixTimestamp,
                'svix-signature': svixSignature,
            }) as ResendEmailPayload;
        } catch (err) {
            console.error('[Webhook] Signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 3. Route by event type
        const { type } = payload;
        const data = payload.data as any; // Cast to any to support both email and contact schemas
        console.log(`[Webhook] Received event: ${type}`);

        if (type.startsWith('contact.')) {
            await handleContactEvent(data, type);
        } else if (type === 'email.received') {
            await handleInboundEmail(data);
        } else if (type === 'email.opened' || type === 'email.clicked') {
            await handleTrackingEvent(data.email_id, type);
        } else if (type.startsWith('email.')) {
            // Treat all other email.* events as delivery status updates
            await handleStatusUpdate(data.email_id, type);
        } else {
            console.log(`[Webhook] Unhandled event type: ${type}`);
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error: any) {
        console.error('[Webhook] Handler error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// ─── Event Handlers ────────────────────────────────────────────────

async function handleInboundEmail(data: ResendEmailPayload['data']) {
    // Determine thread_id by looking for an existing conversation
    const thread = await findOrCreateThread(data.subject, data.from, data.to);

    // Process attachments if they exist
    const attachmentsMeta: any[] = [];
    if (data.attachments && data.attachments.length > 0) {
        for (const att of data.attachments) {
            if (att.content) {
                // Store in Supabase Storage
                const storagePath = `email-attachments/${data.email_id}/${att.filename}`;
                const buffer = Buffer.from(att.content, 'base64');
                const { error: uploadError } = await supabaseAdmin.storage
                    .from('platform-files')
                    .upload(storagePath, buffer, {
                        contentType: att.content_type,
                        upsert: false,
                    });

                if (uploadError) {
                    console.error(`[Webhook] Attachment upload failed: ${att.filename}`, uploadError);
                } else {
                    attachmentsMeta.push({
                        id: att.id,
                        filename: att.filename,
                        content_type: att.content_type,
                        storage_path: storagePath,
                    });
                }
            } else {
                // No inline content — store reference only
                attachmentsMeta.push({
                    id: att.id,
                    filename: att.filename,
                    content_type: att.content_type,
                    storage_path: null,
                });
            }
        }
    }

    const { error } = await supabaseAdmin.from('platform_emails').insert({
        resend_id: data.email_id,
        message_id: data.message_id || null,
        direction: 'inbound',
        from_email: data.from,
        to_emails: data.to || [],
        cc_emails: data.cc || [],
        bcc_emails: data.bcc || [],
        reply_to: data.reply_to?.[0] || null,
        subject: data.subject || '(no subject)',
        body_text: data.text || null,
        body_html: data.html || null,
        status: 'delivered',
        thread_id: thread.threadId,
        in_reply_to: thread.originalMessageId || null,
        is_read: false,
        attachments_jsonb: attachmentsMeta,
    });

    if (error) {
        console.error('[Webhook] Failed to insert inbound email:', error);
        throw error;
    }

    // If this inbound email is definitively a reply to an outbound prospect campaign
    if (thread.prospectId) {
        const { error: prospectErr } = await supabaseAdmin.rpc('increment_prospect_reply', { p_id: thread.prospectId });
        if (prospectErr) {
            console.error('[Webhook] Failed to increment prospect reply count:', prospectErr);
        }
    }
}

async function handleStatusUpdate(emailId: string, eventType: string) {
    if (!emailId) return;

    // Strip "email." prefix for the database status
    // Examples: "email.delivered" -> "delivered", "email.bounced" -> "bounced", "email.delivery_delayed" -> "delivery_delayed"
    let newStatus = eventType.replace('email.', '');
    if (newStatus === 'delivery_delayed') newStatus = 'delayed';

    const { data: emailData, error } = await supabaseAdmin
        .from('platform_emails')
        .update({ status: newStatus })
        .eq('resend_id', emailId)
        .select('prospect_id')
        .single();

    if (error) {
        console.error(`[Webhook] Status update failed for ${emailId}:`, error);
    } else if (emailData?.prospect_id && (newStatus === 'bounced' || newStatus === 'complained')) {
        // Mark prospect as bounced if the email bounced
        await supabaseAdmin
            .from('prospects')
            .update({ status: 'bounced' })
            .eq('id', emailData.prospect_id);
    }
}

async function handleTrackingEvent(emailId: string, eventType: string) {
    // Fetch current metadata, then merge tracking info
    const { data: email, error: fetchError } = await supabaseAdmin
        .from('platform_emails')
        .select('metadata_jsonb')
        .eq('resend_id', emailId)
        .single();

    if (fetchError || !email) {
        console.error(`[Webhook] Could not find email ${emailId} for tracking`);
        return;
    }

    const metadata = (email.metadata_jsonb || {}) as Record<string, any>;
    const trackingKey = eventType === 'email.opened' ? 'opened_at' : 'clicked_at';

    // Only record the first occurrence
    if (!metadata[trackingKey]) {
        metadata[trackingKey] = new Date().toISOString();
    }

    // Increment count
    const countKey = eventType === 'email.opened' ? 'open_count' : 'click_count';
    metadata[countKey] = (metadata[countKey] || 0) + 1;

    const { error } = await supabaseAdmin
        .from('platform_emails')
        .update({ metadata_jsonb: metadata })
        .eq('resend_id', emailId);

    if (error) {
        console.error(`[Webhook] Tracking update failed for ${emailId}:`, error);
    }
}

// ─── Threading ─────────────────────────────────────────────────────

async function findOrCreateThread(
    subject: string,
    from: string,
    to: string[]
): Promise<{ threadId: string | null, prospectId: string | null, originalMessageId: string | null }> {
    // Normalize subject by stripping Re:/Fwd: prefixes
    const normalized = subject.replace(/^(re:\s*|fwd?:\s*)+/i, '').trim();

    if (!normalized) return { threadId: null, prospectId: null, originalMessageId: null };

    // Look for an existing email with a matching normalized subject involving the same parties
    const { data: existing } = await supabaseAdmin
        .from('platform_emails')
        .select('id, thread_id, prospect_id, message_id')
        .or(`from_email.eq.${from},to_emails.cs.{${from}}`)
        .ilike('subject', `%${normalized}%`)
        .order('created_at', { ascending: false })
        .limit(1);

    if (existing && existing.length > 0) {
        // Return the existing thread_id, or the email's own id if it was a root message
        return {
            threadId: existing[0].thread_id || existing[0].id,
            prospectId: existing[0].prospect_id,
            originalMessageId: existing[0].message_id
        };
    }

    // No existing thread found — this is a new conversation
    return { threadId: null, prospectId: null, originalMessageId: null };
}

// ─── Contact Sync ──────────────────────────────────────────────────

async function handleContactEvent(data: any, eventType: string) {
    if (!data.id) return;

    if (eventType === 'contact.created' || eventType === 'contact.updated') {
        // Resolve the local audience UUID from the Resend audience string ID
        const { data: audience } = await supabaseAdmin
            .from('platform_audiences')
            .select('id')
            .eq('resend_audience_id', data.audience_id)
            .single();

        if (!audience) {
            console.error(`[Webhook] Could not find local audience for resend_audience_id ${data.audience_id}`);
            return;
        }

        const payload = {
            resend_contact_id: data.id,
            audience_id: audience.id,
            email: data.email,
            first_name: data.first_name || null,
            last_name: data.last_name || null,
            unsubscribed: data.unsubscribed || false,
        };

        if (eventType === 'contact.created') {
            const { error } = await supabaseAdmin
                .from('platform_contacts')
                .upsert(payload, { onConflict: 'resend_contact_id' });
            if (error) console.error(`[Webhook] Failed to insert contact ${data.id}:`, error);
        } else {
            // updated
            const { error } = await supabaseAdmin
                .from('platform_contacts')
                .update(payload)
                .eq('resend_contact_id', data.id);
            if (error) console.error(`[Webhook] Failed to update contact ${data.id}:`, error);
        }
    } else if (eventType === 'contact.deleted') {
        const { error } = await supabaseAdmin
            .from('platform_contacts')
            .delete()
            .eq('resend_contact_id', data.id);
        if (error) console.error(`[Webhook] Failed to delete contact ${data.id}:`, error);
    }
}
