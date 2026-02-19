
const HF_API_URL = "https://router.huggingface.co/hf-inference/models/Hello-SimpleAI/chatgpt-detector-roberta";

export interface ParagraphAnalysis {
    paragraph: string;
    score: number; // 0 to 1 probability of being AI
    isSuspected: boolean;
}

export interface AnalysisResult {
    globalScore: number;
    paragraphs: ParagraphAnalysis[];
    wordCount: number;
    suspectedWordCount: number;
}

// Helper to remove Bibliographies/Citations
export function cleanText(text: string): string {
    // Simple heuristic: Remove lines starting with "References", "Bibliography", "Works Cited" and everything after
    const patterns = [
        /^references$/im,
        /^bibliography$/im,
        /^works cited$/im
    ];

    let cleaned = text;
    for (const pattern of patterns) {
        const match = cleaned.match(pattern);
        if (match && match.index !== undefined) {
            cleaned = cleaned.substring(0, match.index);
            break;
        }
    }
    return cleaned;
}

export async function checkAIContent(
    text: string,
    config?: { model?: string, granularity?: string, scoring_method?: string },
    classId?: string
): Promise<AnalysisResult> {
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text,
            model: config?.model,
            granularity: config?.granularity,
            method: config?.scoring_method,
            classId, // For instructor attribution when called from student submission
        }),
    });

    if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
    }

    return response.json();
}
