export enum ScoringMethod {
    BINARY = 'binary',
    WEIGHTED = 'weighted',
    STRICT = 'strict'
}

export enum Granularity {
    PARAGRAPH = 'paragraph',
    SENTENCE = 'sentence'
}

export interface AnalysisSegment {
    text: string;
    prob: number;
    words: number;
    reason?: string;
    isFlagged?: boolean; // Added for UI
    contribution?: number; // Added for UI
}

export interface AnalysisReport {
    score: number;
    segments: AnalysisSegment[];
    totalWords: number;
    overallReason?: string;
}

export interface DetectionResponse {
    score: number;
    label: string;
}

export const MODELS = {
    ROBERTA_LARGE: "Hello-SimpleAI/chatgpt-detector-roberta",
    AI_DETECTOR_PIRATE: "PirateXX/AI-Content-Detector",
    OPENAI_DETECTOR: "fakespot-ai/roberta-base-ai-text-detection-v1"
};

export const MODEL_LABELS: Record<string, string> = {
    [MODELS.ROBERTA_LARGE]: "RoBERTa Large (Baseline)",
    [MODELS.AI_DETECTOR_PIRATE]: "PirateXX Detector",
    [MODELS.OPENAI_DETECTOR]: "OpenAI RoBERTa Base"
};
