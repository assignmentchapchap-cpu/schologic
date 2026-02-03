
// Specific structure for the Practicum Observation Guide
export interface ObservationAttribute {
    id: string;
    attribute?: string; // Present in "Personal Attributes"
    competency?: string; // Present in "Core Competencies"
    description: string;
}

export interface AssessmentArea {
    category: string;
    attributes: ObservationAttribute[];
}

export interface PracticumObservationGuide {
    title: string;
    grading_key: Record<string, string>;
    assessment_areas: AssessmentArea[];
    total_score: number;
}

// Specific structure for the Practicum Report Score Sheet
export interface ReportSubsection {
    id?: string;
    title: string;
    marks: number;
}

export interface ReportSection {
    item_number: number;
    section: string;
    details?: string;
    marks?: number; // Total for section if no subsections, or implies total
    total_marks?: number; // Explicit total
    subsections?: ReportSubsection[];
}

export interface PracticumReportScoreSheet {
    title: string;
    sections: ReportSection[];
    total_report_marks: number;
    final_grading_notes: string[];
}

// Keeping the generic config for other potential rubrics (Logs)
export interface RubricCriterion {
    id: string;
    label: string;
    description?: string;
    max_points: number;
    optional?: boolean; // Added to support "Optional site visit" from Spec
}

export interface RubricSection {
    id: string;
    title: string;
    description?: string;
    criteria: RubricCriterion[];
}

export interface RubricConfig {
    id: string;
    title: string;
    total_marks: number;
    sections: RubricSection[];
}
