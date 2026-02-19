import { analyzeSubmission } from "@schologic/ai-bridge";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';
import { logAiUsage } from '@/lib/logAiUsage';
import { logSystemError } from '@/lib/logSystemError';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            instructions,
            submission_text,
            score,
            max_points,
            student_name,
            instructor_name,
            class_name,
            assignment_title,
            rubric
        } = body;

        const apiKey = process.env.PUBLICAI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });

        // Extract user session for usage tracking
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        console.log("Analyzing submission via AI Bridge for:", assignment_title);

        const { analysis, usage } = await analyzeSubmission({
            instructions,
            submission_text,
            score,
            max_points,
            student_name,
            instructor_name,
            class_name,
            assignment_title,
            rubric,
            apiKey
        });

        // Log AI usage with real token counts (fire-and-forget)
        if (user) {
            logAiUsage({
                instructorId: user.id,
                endpoint: '/api/assistant',
                provider: 'publicai',
                model: 'swiss-ai/apertus-70b-instruct',
                promptTokens: usage.promptTokens,
                completionTokens: usage.completionTokens,
                totalTokens: usage.totalTokens,
                isDemo: user.user_metadata?.is_demo === true,
            });
        }

        return NextResponse.json({ analysis });

    } catch (error: unknown) {
        console.error("TA API Error:", error);
        logSystemError({
            path: '/api/assistant',
            errorMessage: error instanceof Error ? error.message : 'TA analysis failed.',
            stackTrace: error instanceof Error ? error.stack : undefined,
        });
        const message = error instanceof Error ? error.message : 'TA analysis failed.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
