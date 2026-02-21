
import { MODELS, AnalysisConfig, AnalysisResult, SegmentAnalysis } from './types';

// Helper to split text
function splitIntoSentences(text: string): string[] {
    return text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
}

function splitIntoParagraphs(text: string): string[] {
    return text.split(/\r?\n+/).filter(p => p.trim().length > 10);
}

export async function analyzeText(
    text: string,
    config: Partial<AnalysisConfig>,
    apiKey: string
): Promise<AnalysisResult> {
    if (!text) throw new Error("No text provided");
    if (!apiKey) throw new Error("Missing Hugging Face API Key");

    const selectedModel = config.model || MODELS.AI_DETECTOR_PIRATE;
    const selectedMethod = config.method || 'weighted';
    const units = config.granularity === 'sentence' ? splitIntoSentences(text) : splitIntoParagraphs(text);

    const results: SegmentAnalysis[] = [];
    let totalWords = 0;
    let suspectedWords = 0;

    for (const unit of units) {
        const trimmed = unit.trim();
        if (!trimmed) continue;

        const words = trimmed.split(/\s+/).length;
        totalWords += words;

        try {
            const API_URL = `https://router.huggingface.co/hf-inference/models/${selectedModel}`;

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: trimmed }),
            });

            if (!response.ok) {
                console.error("HF API Error:", response.status, response.statusText);
                throw new Error(`HuggingFace API Request Failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const scores = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : (Array.isArray(data) ? data : []);

            const aiLabels = ["ChatGPT", "LABEL_1", "fake", "Fake", "AI", "ai", "AI-Generated"];
            const aiScoreOb = scores.find((s: any) => aiLabels.includes(s.label));

            let aiProb = 0;
            if (aiScoreOb) {
                aiProb = aiScoreOb.score;
            } else {
                const label1 = scores.find((s: any) => s.label === "LABEL_1");
                if (label1) aiProb = label1.score;
            }

            let contribution = 0;
            let finalIsFlagged = false;

            if (selectedMethod === 'strict') {
                finalIsFlagged = aiProb > 0.9;
                contribution = finalIsFlagged ? words : 0;
            } else if (selectedMethod === 'weighted') {
                finalIsFlagged = aiProb > 0.5;
                contribution = words * aiProb;
            } else {
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
            // Throw the error instead of pushing a dummy score to block submissions
            throw err;
        }
    }

    const globalScore = totalWords > 0 ? Math.round((suspectedWords / totalWords) * 100) : 0;

    return {
        globalScore,
        segments: results,
        totalWords,
        overallReason: `Analysis via ${selectedModel} (${selectedMethod})`
    };
}
