
export const MODELS = {
    AI_DETECTOR_PIRATE: "PirateXX/AI-Content-Detector",
    AI_DETECTOR_ROBERTA: "roberta-base-openai-detector", // Example alternative
    AI_DETECTOR_DISTILBERT: "distilbert-base-uncased-finetuned-sst-2-english" // Example
};

export type AIGranularity = 'sentence' | 'paragraph' | 'document';

export type AIScoringMethod = 'strict' | 'weighted' | 'binary';

export interface AnalysisConfig {
    model: string;
    granularity: AIGranularity;
    method: AIScoringMethod;
}

export interface AnalysisResult {
    globalScore: number;
    segments: SegmentAnalysis[];
    totalWords: number;
    overallReason: string;
}

export interface SegmentAnalysis {
    text: string;
    prob: number; // 0-1
    words: number;
    isFlagged: boolean;
    contribution: number;
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
