/**
 * Strict Type Definitions for JSONB Columns
 * 
 * This file provides TypeScript interfaces for all JSON/JSONB columns in the database.
 * Use these types instead of `any` when working with settings, rubric, report_data, or content.
 */

import { ScoringMethod, Granularity, AnalysisSegment } from '@schologic/ai-bridge';

// ============================================================================
// CLASS SETTINGS (profiles.settings, classes.settings)
// ============================================================================

export interface ClassSettings {
    model: string;
    granularity: Granularity | string;
    scoring_method: ScoringMethod | string;
    late_policy: 'strict' | 'lenient' | 'none' | string;
    allowed_file_types: string[];
}

export const DEFAULT_CLASS_SETTINGS: ClassSettings = {
    model: 'PirateXX/AI-Content-Detector',
    granularity: Granularity.PARAGRAPH,
    scoring_method: ScoringMethod.WEIGHTED,
    late_policy: 'strict',
    allowed_file_types: ['txt', 'docx']
};

// ============================================================================
// RUBRIC (assignments.rubric)
// ============================================================================

export interface RubricLevel {
    score: number;
    description: string;
}

export interface RubricItem {
    criterion: string;
    points: number;
    description?: string;
    levels: RubricLevel[];
}

export type Rubric = RubricItem[];

// ============================================================================
// QUIZ DATA (assignments.rubric when assignment_type = 'quiz')
// ============================================================================

export interface QuizQuestion {
    id: string;
    question: string;
    choices: string[];
    correct_index: number;
    points: number;
}

export interface QuizData {
    type: 'quiz';
    questions: QuizQuestion[];
    time_limit_minutes?: number;
    shuffle_questions?: boolean;
    shuffle_choices?: boolean;
}

// Student responses stored in submissions.report_data for quizzes
export interface QuizSubmission {
    quiz_responses: Record<string, number>; // question_id -> selected_index
    auto_score: number;
    time_taken_seconds?: number;
}

export function isQuizData(data: unknown): data is QuizData {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;
    return obj.type === 'quiz' && Array.isArray(obj.questions);
}

/**
 * Safely normalize any rubric data into a typed RubricItem array.
 * Handles legacy formats where rubric might be { criteria: [...] } or just [...].
 */
export function normalizeRubric(data: unknown): RubricItem[] {
    if (!data) return [];

    let items: unknown[] = [];

    if (Array.isArray(data)) {
        items = data;
    } else if (typeof data === 'object' && data !== null && 'criteria' in data) {
        const obj = data as { criteria: unknown };
        if (Array.isArray(obj.criteria)) {
            items = obj.criteria;
        }
    }

    return items.map((item: unknown) => {
        const obj = item as Record<string, unknown>;
        return {
            criterion: (obj.criterion || obj.title || '') as string,
            points: (obj.points || obj.max_points || 0) as number,
            description: (obj.description || '') as string,
            levels: Array.isArray(obj.levels) ? obj.levels as RubricLevel[] : []
        };
    });
}

// ============================================================================
// REPORT DATA (submissions.report_data)
// ============================================================================

export interface ReportData {
    score: number;
    segments: AnalysisSegment[];
    totalWords: number;
    overallReason?: string;
    // Legacy fallback fields
    paragraphs?: LegacySegment[];
    sentences?: LegacySegment[];
}

export interface LegacySegment {
    paragraph?: string;
    sentence?: string;
    score?: number;
    isSuspected?: boolean;
    isFlagged?: boolean;
}

/**
 * Safely normalize report data, handling both new and legacy formats.
 */
export function normalizeReportData(data: unknown): ReportData | null {
    if (!data || typeof data !== 'object') return null;

    const obj = data as Record<string, unknown>;

    return {
        score: (obj.score || 0) as number,
        segments: Array.isArray(obj.segments) ? obj.segments as AnalysisSegment[] : [],
        totalWords: (obj.totalWords || 0) as number,
        overallReason: obj.overallReason as string | undefined,
        paragraphs: obj.paragraphs as LegacySegment[] | undefined,
        sentences: obj.sentences as LegacySegment[] | undefined
    };
}

// ============================================================================
// ASSET CONTENT (assets.content)
// ============================================================================

export interface AssetContent {
    type: 'text' | 'structured' | 'imscc';
    text?: string;
    sections?: AssetSection[];
    metadata?: Record<string, unknown>;
}

export interface AssetSection {
    title?: string;
    content: string;
    type?: 'paragraph' | 'heading' | 'list' | 'code';
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isClassSettings(obj: unknown): obj is ClassSettings {
    if (!obj || typeof obj !== 'object') return false;
    const o = obj as Record<string, unknown>;
    return typeof o.model === 'string' || typeof o.late_policy === 'string';
}

export function isRubricItem(obj: unknown): obj is RubricItem {
    if (!obj || typeof obj !== 'object') return false;
    const o = obj as Record<string, unknown>;
    return typeof o.criterion === 'string' && typeof o.points === 'number';
}
