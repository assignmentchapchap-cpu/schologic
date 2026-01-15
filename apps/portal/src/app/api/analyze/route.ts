import { NextRequest, NextResponse } from 'next/server';
import { MODELS } from '@/lib/ai-config';

// Helper to split text
function splitIntoSentences(text: string): string[] {
    return text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
}

function splitIntoParagraphs(text: string): string[] {
    return text.split(/\r?\n+/).filter(p => p.trim().length > 10);
}

export async function POST(req: NextRequest) {
    try {
        const { text, model, granularity, method } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        // Default to PirateXX (Database Default) if no model provided
        const selectedModel = model || MODELS.AI_DETECTOR_PIRATE;
        // Default to Weighted (Database Default) if no method provided
        const selectedMethod = method || 'weighted';
        const units = granularity === 'sentence' ? splitIntoSentences(text) : splitIntoParagraphs(text);

        const results = [];
        let totalWords = 0;
        let suspectedWords = 0;

        // Process units
        for (const unit of units) {
            const trimmed = unit.trim();
            if (!trimmed) continue;

            const words = trimmed.split(/\s+/).length;
            totalWords += words;

            try {
                // Using the new Router Endpoint format from ai-config recommendations
                const API_URL = `https://router.huggingface.co/hf-inference/models/${selectedModel}`;

                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.HUGGING_FACE_ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ inputs: trimmed }),
                });

                if (!response.ok) {
                    console.error("HF API Error:", response.status, response.statusText);
                    results.push({ text: unit, prob: 0, words, isFlagged: false });
                    continue;
                }

                const data = await response.json();

                // Robust parsing logic
                const scores = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : (Array.isArray(data) ? data : []);

                // Labels that indicate AI
                const aiLabels = ["ChatGPT", "LABEL_1", "fake", "Fake", "AI", "ai", "AI-Generated"];
                const aiScoreOb = scores.find((s: any) => aiLabels.includes(s.label));

                let aiProb = 0;

                if (aiScoreOb) {
                    aiProb = aiScoreOb.score;
                } else {
                    // Fallback: If we only have LABEL_0 and LABEL_1 and neither matched above, check specifically for LABEL_1
                    const label1 = scores.find((s: any) => s.label === "LABEL_1");
                    if (label1) aiProb = label1.score;
                }

                const isFlagged = aiProb > 0.5; // Base probability check

                // Calculate contribution based on method
                let contribution = 0;
                let finalIsFlagged = false;

                if (selectedMethod === 'strict') {
                    finalIsFlagged = aiProb > 0.9;
                    contribution = finalIsFlagged ? words : 0;
                } else if (selectedMethod === 'weighted') {
                    finalIsFlagged = aiProb > 0.5;
                    contribution = words * aiProb;
                } else {
                    // Default to Binary
                    finalIsFlagged = aiProb > 0.5;
                    contribution = finalIsFlagged ? words : 0;
                }

                if (finalIsFlagged || (selectedMethod === 'weighted' && aiProb > 0.5)) {
                    suspectedWords += contribution;
                }

                results.push({
                    text: unit,
                    prob: aiProb,
                    words,
                    isFlagged: finalIsFlagged,
                    contribution
                });

            } catch (err) {
                console.error("Error analyzing unit:", err);
                results.push({ text: unit, prob: 0, words, isFlagged: false });
            }
        }

        const globalScore = totalWords > 0 ? Math.round((suspectedWords / totalWords) * 100) : 0;

        return NextResponse.json({
            globalScore: globalScore,
            segments: results,
            totalWords: totalWords,
            overallReason: `Analysis via ${selectedModel} (${selectedMethod})`
        });

    } catch (error) {
        console.error("Analyze API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
