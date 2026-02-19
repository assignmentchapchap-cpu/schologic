import { NextRequest, NextResponse } from 'next/server';
import { analyzeText, MODELS } from '@schologic/ai-bridge';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';
import { logAiUsage, estimateTokens } from '@/lib/logAiUsage';
import { logSystemError } from '@/lib/logSystemError';

export async function POST(req: NextRequest) {
    try {
        const { text, model, granularity, method } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const apiKey = process.env.HUGGING_FACE_ACCESS_TOKEN;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing HuggingFace API Key" }, { status: 500 });
        }

        // Extract user session for usage tracking
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        const selectedModel = model || MODELS.AI_DETECTOR_PIRATE;

        // Use ai-bridge analyzeText function
        const result = await analyzeText(
            text,
            {
                model: selectedModel,
                granularity: granularity || 'paragraph',
                method: method || 'weighted'
            },
            apiKey
        );

        // Log AI usage (fire-and-forget)
        if (user) {
            const estimatedTokens = estimateTokens(text);
            logAiUsage({
                instructorId: user.id,
                endpoint: '/api/analyze',
                provider: 'huggingface',
                model: selectedModel,
                totalTokens: estimatedTokens,
                isDemo: user.user_metadata?.is_demo === true,
            });
        }

        // Return result with 'globalScore' mapped to 'score' for backward compatibility
        return NextResponse.json({
            globalScore: result.globalScore,
            segments: result.segments,
            totalWords: result.totalWords,
            overallReason: result.overallReason
        });

    } catch (error) {
        console.error("Analyze API Error:", error);
        logSystemError({
            path: '/api/analyze',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            stackTrace: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
