import { NextRequest, NextResponse } from 'next/server';
import { analyzeText, MODELS } from '@schologic/ai-bridge';

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

        // Use ai-bridge analyzeText function
        const result = await analyzeText(
            text,
            {
                model: model || MODELS.AI_DETECTOR_PIRATE,
                granularity: granularity || 'paragraph',
                method: method || 'weighted'
            },
            apiKey
        );

        // Return result with 'globalScore' mapped to 'score' for backward compatibility
        return NextResponse.json({
            globalScore: result.globalScore,
            segments: result.segments,
            totalWords: result.totalWords,
            overallReason: result.overallReason
        });

    } catch (error) {
        console.error("Analyze API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
