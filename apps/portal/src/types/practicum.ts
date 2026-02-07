
export interface PracticumLogEntry {
    // Shared / Daily simple fields
    date?: string; // For composite days
    clock_in?: string;
    clock_out?: string;

    // Teaching Practice Fields (Strict)
    office_activities?: string;
    class_taught?: string;
    subject_taught?: string;
    lesson_topic?: string;
    observations?: string; // Self-remarks
    supervisor_notes?: string;

    // Industrial Attachment Fields (Strict)
    department?: string;
    main_activity?: string;
    tasks_performed?: string;
    skills_acquired?: string;
    challenges?: string;
    solutions?: string;

    // Common/Flexible
    notes?: string;
    reflection?: string;
}

export interface CompositeLogData {
    days: PracticumLogEntry[]; // Array of daily entries
    summary?: string; // Weekly reflection or Monthly summary
    week_number?: number; // Context
    month?: string; // Context
}

export type LogFrequency = 'daily' | 'weekly' | 'monthly';
export type LogTemplateType = 'teaching_practice' | 'industrial_attachment' | 'custom';

export type SupervisorStatus = 'pending' | 'verified' | 'rejected';

// Represents the full DB row + JSONB entries
export interface PracticumLog {
    id: string;
    created_at: string;
    updated_at: string;
    student_id: string;
    practicum_id: string;

    // Core Fields
    log_date: string;
    week_number?: number;
    clock_in?: string;
    clock_out?: string;

    // Data
    entries: PracticumLogEntry | CompositeLogData;
    weekly_reflection?: string;
    file_urls?: string[];
    location_data?: PracticumLocation;

    // Status & Verification
    submission_status: 'draft' | 'submitted';
    supervisor_status: SupervisorStatus;
    supervisor_comment?: string;
    verification_token?: string;
    supervisor_verified_at?: string;
    instructor_status: 'read' | 'unread';

    // Grading
    grade?: number;
    feedback?: string;
}

export interface PracticumSchedule {
    days: string[];
    start_time: string;
    end_time: string;
}

export interface PracticumLocation {
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
    address?: string; // Optional resolved address
}

// Enrollment Data Buckets
export interface SupervisorData {
    name: string;
    designation: string;
    email: string;
    phone: string;
}

export interface WorkplaceData {
    company_name: string;
    department: string;
    address: string;
    contact_person?: string;
    contact_email?: string;
}

export interface AcademicData {
    institution: string;
    course: string;
    year_of_study: string;
}

// Timeline Interfaces
// Timeline Interfaces matching @schologic/practicum-core roughly
export interface TimelineEvent {
    id?: string;
    title: string;
    date: string; // ISO Date (was due_date)
    type: 'milestone' | 'deadline' | 'log' | 'report' | 'meeting' | 'other';
    description?: string;
    week_number?: number;
    status?: 'pending' | 'completed' | 'locked' | 'overdue'; // Computed
}

export interface TimelineWeek {
    week_number: number;
    start_date: string;
    end_date: string;
    label: string;
}

export interface PracticumTimeline {
    events: TimelineEvent[];
    weeks: TimelineWeek[];
    // Legacy support if needed, but primary is above
    milestones?: TimelineEvent[];
}
