import { inngest } from "@/lib/inngest/client";
import { draftProspectEmail, ProspectProfile } from '@schologic/ai-bridge';
import { saveDraft } from "@/app/actions/adminEmails";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

const resend = new Resend(process.env.RESEND_API_KEY!);

// ───────────────────────────────────────────────────────────────────
// Job 1: AI Drafting (Strict Concurrency = 1)
// ───────────────────────────────────────────────────────────────────
export const generateAiDrafts = inngest.createFunction(
    {
        id: "generate-ai-drafts",
        concurrency: {
            // Strictly limit to 1 concurrent generation per environment to protect Gemini rate limits
            limit: 1,
            key: "'global'",
        }
    },
    { event: "campaigns/generate.drafts" },
    async ({ event, step }) => {
        const { prospectId, templateId, regenerationNote } = event.data;

        // 1. Fetch Prospect Profile
        const prospect = await step.run("fetch-prospect", async () => {
            const { data, error } = await supabaseAdmin
                .from('prospects')
                .select('*')
                .eq('id', prospectId)
                .single();
            if (error || !data) throw new Error(`Prospect not found: ${prospectId}`);
            return data;
        });

        // 2. Fetch Assigned Template
        const template = await step.run("fetch-template", async () => {
            const { data, error } = await supabaseAdmin
                .from('platform_templates')
                .select('*')
                .eq('id', templateId)
                .single();
            if (error || !data) throw new Error(`Template not found: ${templateId}`);
            return data;
        });

        const profile: ProspectProfile = {
            institution_name: prospect.institution_name,
            location: prospect.location,
            type: prospect.type,
            website: prospect.website,
            contact_name: prospect.contact_name,
            job_title: prospect.job_title
        };

        // 3. Delegate to AI Bridge (Research + Draft)
        const draftResult = await step.run("ai-bridge-generate", async () => {
            return await draftProspectEmail(
                profile,
                template.subject,
                template.content_html,
                regenerationNote
            );
        });

        // 4. Update the Prospect with Research Data and mark 'drafted'
        await step.run("update-prospect-research", async () => {
            await supabaseAdmin.from('prospects').update({
                research_data: draftResult.researchData,
                status: 'drafted'
            }).eq('id', prospectId);
        });

        // 5. Save as a strictly UNSCHEDULED Draft
        const savedDraft = await step.run("save-draft-record", async () => {
            // Generate a pseudo-from address based strictly on the prospect's reply needs, or inject proper auth context later
            // Note: In a real system, the exact 'From' address would be passed in the event data.
            const fromAddress = event.data.fromEmail || "hello@schologic.com";

            const result = await saveDraft({
                from: fromAddress,
                to: prospect.email ? [prospect.email] : [],
                subject: draftResult.subject,
                html: draftResult.html,
                prospectId: prospectId,
                aiTemplateId: templateId
            });
            return result;
        });

        return { success: true, draftId: savedDraft.id };
    }
);

// ───────────────────────────────────────────────────────────────────
// Job 2: Process Scheduled Emails
// ───────────────────────────────────────────────────────────────────
export const processScheduledEmails = inngest.createFunction(
    { id: "process-scheduled-emails" },
    { cron: "* * * * *" }, // Runs every minute
    async ({ step }) => {

        const dueEmails = await step.run("fetch-due-emails", async () => {
            const { data, error } = await supabaseAdmin
                .from('platform_emails')
                .select('*')
                .eq('status', 'scheduled')
                .lte('scheduled_at', new Date().toISOString());

            if (error) throw error;
            return data || [];
        });

        if (dueEmails.length === 0) return { processed: 0 };

        // Process sequentially to be safe with Resend rate limits
        let processedCount = 0;
        for (const email of dueEmails) {
            await step.run(`send-email-${email.id}`, async () => {
                try {
                    // 1. Send via Resend
                    const { data: resendData, error: resendError } = await resend.emails.send({
                        from: email.from_email,
                        to: email.to_emails,
                        cc: email.cc_emails || undefined,
                        bcc: email.bcc_emails || undefined,
                        replyTo: email.reply_to || undefined,
                        subject: email.subject,
                        html: email.body_html || '',
                    });

                    if (resendError) throw resendError;

                    // 2. Mark as sent and store resend_id
                    await supabaseAdmin.from('platform_emails').update({
                        status: 'sent',
                        resend_id: resendData?.id
                    }).eq('id', email.id);

                    // 3. Update prospect status
                    if (email.prospect_id) {
                        await supabaseAdmin.from('prospects').update({
                            status: 'contacted'
                        }).eq('id', email.prospect_id);
                    }
                } catch (err) {
                    console.error(`Failed to execute scheduled send for ${email.id}:`, err);
                    // Could implement retry logic or mark as 'failed' here
                }
            });
            processedCount++;
        }

        return { processed: processedCount };
    }
);
