'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';
import { subDays, format, startOfDay } from 'date-fns';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function ensureSuperadmin() {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized');

    const role = user.app_metadata?.role || user.user_metadata?.role;
    if (role !== 'superadmin') throw new Error('Unauthorized: Superadmin access required');
    return user;
}

export interface PerformanceMetrics {
    totals: {
        sent: number;
        delivered: number;
        bounced: number;
        complained: number;
        opened: number;
        clicked: number;
    };
    dailyVolume: Array<{ date: string; sent: number; opened: number }>;
    templateBreakdown: Array<{
        templateId: string;
        templateName: string;
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
    }>;
    recentAlerts: Array<{
        id: string;
        subject: string;
        to: string;
        status: string;
        date: string;
    }>;
}

export async function getPerformanceMetrics(days: number = 30): Promise<{ data?: PerformanceMetrics; error?: string }> {
    try {
        await ensureSuperadmin();

        const thresholdDate = startOfDay(subDays(new Date(), days)).toISOString();

        // 1. Fetch Outbound Emails
        const { data: emails, error: emailError } = await supabaseAdmin
            .from('platform_emails')
            .select('id, to_emails, subject, status, created_at, metadata_jsonb, ai_generated_from_template_id')
            .eq('direction', 'outbound')
            .neq('status', 'draft')
            .gte('created_at', thresholdDate);

        if (emailError) throw emailError;

        // 2. Fetch Templates
        const { data: templates } = await supabaseAdmin
            .from('platform_templates')
            .select('id, name');

        const templateMap = new Map(templates?.map(t => [t.id, t.name]) || []);

        // 3. Process Data
        const metrics: PerformanceMetrics = {
            totals: { sent: 0, delivered: 0, bounced: 0, complained: 0, opened: 0, clicked: 0 },
            dailyVolume: [],
            templateBreakdown: [],
            recentAlerts: []
        };

        const volumeMap = new Map<string, { sent: number; opened: number }>();
        const tmplMap = new Map<string, any>();

        // Pre-fill last N days for the chart
        for (let i = days - 1; i >= 0; i--) {
            const dateStr = format(subDays(new Date(), i), 'MMM dd');
            volumeMap.set(dateStr, { sent: 0, opened: 0 });
        }

        (emails || []).forEach(email => {
            // Totals
            metrics.totals.sent++;
            if (['delivered', 'opened', 'clicked'].includes(email.status)) metrics.totals.delivered++;
            if (email.status === 'bounced') metrics.totals.bounced++;
            if (email.status === 'complained') metrics.totals.complained++;

            const meta = email.metadata_jsonb as any || {};
            const isOpened = !!meta.opened_at || meta.open_count > 0;
            const isClicked = !!meta.clicked_at || meta.click_count > 0;

            if (isOpened) metrics.totals.opened++;
            if (isClicked) metrics.totals.clicked++;

            // Daily Volume
            const dateStr = format(new Date(email.created_at), 'MMM dd');
            if (volumeMap.has(dateStr)) {
                const dayStats = volumeMap.get(dateStr)!;
                dayStats.sent++;
                if (isOpened) dayStats.opened++;
            }

            // Template Breakdown
            if (email.ai_generated_from_template_id) {
                const tId = email.ai_generated_from_template_id;
                if (!tmplMap.has(tId)) {
                    tmplMap.set(tId, {
                        templateId: tId,
                        templateName: templateMap.get(tId) || 'Deleted Template',
                        sent: 0, delivered: 0, opened: 0, clicked: 0
                    });
                }
                const tStats = tmplMap.get(tId);
                tStats.sent++;
                if (['delivered', 'opened', 'clicked'].includes(email.status)) tStats.delivered++;
                if (isOpened) tStats.opened++;
                if (isClicked) tStats.clicked++;
            }

            // Alerts
            if (email.status === 'bounced' || email.status === 'complained') {
                metrics.recentAlerts.push({
                    id: email.id,
                    subject: email.subject || '(no subject)',
                    to: email.to_emails?.[0] || 'Unknown',
                    status: email.status,
                    date: email.created_at
                });
            }
        });

        metrics.dailyVolume = Array.from(volumeMap.entries()).map(([date, stats]) => ({
            date,
            ...stats
        }));

        metrics.templateBreakdown = Array.from(tmplMap.values()).sort((a, b) => b.sent - a.sent);
        metrics.recentAlerts = metrics.recentAlerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

        return { data: metrics };
    } catch (e: any) {
        console.error('[getPerformanceMetrics] Error:', e);
        return { error: e.message || 'Failed to fetch performance metrics' };
    }
}
