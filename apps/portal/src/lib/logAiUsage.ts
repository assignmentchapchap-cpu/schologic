import { createClient } from '@supabase/supabase-js';

// Service-role client for bypassing RLS on telemetry inserts
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

interface AiUsagePayload {
    instructorId: string;
    studentId?: string; // Set when a student triggers the AI call (e.g. submission analysis)
    endpoint: string;
    provider: string;
    model: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    isDemo: boolean;
}

/**
 * Logs AI API usage to `api_usage_logs`.
 * Errors are swallowed so they never block the API response.
 */
export async function logAiUsage(payload: AiUsagePayload): Promise<void> {
    try {
        await supabaseAdmin.from('api_usage_logs').insert({
            instructor_id: payload.instructorId,
            student_id: payload.studentId ?? null,
            endpoint: payload.endpoint,
            provider: payload.provider,
            model: payload.model,
            prompt_tokens: payload.promptTokens ?? 0,
            completion_tokens: payload.completionTokens ?? 0,
            total_tokens: payload.totalTokens ?? 0,
            is_demo: payload.isDemo,
        });
    } catch (err) {
        console.error('[logAiUsage] Failed to log usage:', err);
    }
}

/**
 * Estimate token count from text (rough: ~0.75 words per token for English).
 */
export function estimateTokens(text: string): number {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.ceil(wordCount / 0.75);
}
