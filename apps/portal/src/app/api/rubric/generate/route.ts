import { generateRubric } from "@schologic/ai-bridge";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';
import { logAiUsage } from '@/lib/logAiUsage';
import { logSystemError } from '@/lib/logSystemError';

export async function POST(req: Request) {
    let userId: string | undefined;
    try {
        const { title, description, max_points } = await req.json();

        if (!title || !max_points) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const apiKey = process.env.PUBLICAI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });

        // Extract user session for usage tracking
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;

        const { rubric, usage } = await generateRubric({
            title,
            description,
            max_points,
            apiKey
        });

        // Log AI usage with real token counts
        if (user) {
            await logAiUsage({
                instructorId: user.id,
                endpoint: '/api/rubric/generate',
                provider: 'publicai',
                model: 'swiss-ai/apertus-70b-instruct',
                promptTokens: usage.promptTokens,
                completionTokens: usage.completionTokens,
                totalTokens: usage.totalTokens,
                isDemo: user.user_metadata?.is_demo === true,
            });
        }

        return NextResponse.json({ rubric });

    } catch (error: unknown) {
        console.error("Rubric Generation Error:", error);
        await logSystemError({
            path: '/api/rubric/generate',
            errorMessage: error instanceof Error ? error.message : 'Rubric generation failed.',
            stackTrace: error instanceof Error ? error.stack : undefined,
            userId
        });
        const message = error instanceof Error ? error.message : 'Rubric generation failed.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
