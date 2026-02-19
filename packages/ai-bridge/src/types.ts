
// AI Detection Models
export const MODELS = {
    ROBERTA_LARGE: "Hello-SimpleAI/chatgpt-detector-roberta",
    AI_DETECTOR_PIRATE: "PirateXX/AI-Content-Detector",
    OPENAI_DETECTOR: "fakespot-ai/roberta-base-ai-text-detection-v1"
};

// Human-readable model labels for UI
export const MODEL_LABELS: Record<string, string> = {
    [MODELS.ROBERTA_LARGE]: "RoBERTa Large (Baseline)",
    [MODELS.AI_DETECTOR_PIRATE]: "PirateXX Detector",
    [MODELS.OPENAI_DETECTOR]: "OpenAI RoBERTa Base"
};

// Scoring & Granularity
export type AIGranularity = 'sentence' | 'paragraph' | 'document';
export type AIScoringMethod = 'strict' | 'weighted' | 'binary';

// Backward-compatible enums (match portal's ai-config.ts)
export enum ScoringMethod {
    BINARY = 'binary',
    WEIGHTED = 'weighted',
    STRICT = 'strict'
}

export enum Granularity {
    PARAGRAPH = 'paragraph',
    SENTENCE = 'sentence'
}

export interface AnalysisConfig {
    model?: string;
    granularity?: AIGranularity;
    method?: AIScoringMethod;
}

// Primary type for segment analysis
export interface SegmentAnalysis {
    text: string;
    prob: number; // 0-1
    words: number;
    isFlagged: boolean;
    contribution: number;
    reason?: string; // Optional, used by some UI
}

// Backward-compatible alias
export type AnalysisSegment = SegmentAnalysis;

// Primary type for analysis result
export interface AnalysisResult {
    globalScore: number;
    segments: SegmentAnalysis[];
    totalWords: number;
    overallReason: string;
}

// Backward-compatible alias (portal uses 'score' not 'globalScore')
export interface AnalysisReport {
    score: number;
    segments: SegmentAnalysis[];
    totalWords: number;
    overallReason?: string;
}

// HuggingFace detection response
export interface DetectionResponse {
    score: number;
    label: string;
}

// Real token usage returned by PublicAI (OpenAI-compatible format)
export interface AiUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

export interface GradingRequest {
    instructions: string;
    submission_text: string;
    score: number;
    max_points: number;
    student_name: string;
    instructor_name?: string;
    class_name?: string;
    assignment_title?: string;
    rubric?: any;
    apiKey: string;
}

export interface GradingResult {
    strengths: string[];
    weaknesses: string[];
    rubric_breakdown: {
        criterion: string;
        performance_level: string;
        score: number;
        max: number;
        reason: string;
    }[];
    score: number;
}

export interface RubricRequest {
    title: string;
    description: string;
    max_points: number;
    apiKey: string;
}

export interface RubricCriterion {
    criterion: string;
    points: number;
    levels: {
        score: number;
        description: string;
    }[];
}
