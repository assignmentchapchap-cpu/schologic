import type { Database } from '@schologic/database';

// Raw Row Types from Supabase
export type PracticumRow = Database['public']['Tables']['practicums']['Row'];
export type EnrollmentRow = Database['public']['Tables']['practicum_enrollments']['Row'];
export type LogRow = Database['public']['Tables']['practicum_logs']['Row'];
export type ResourceRow = Database['public']['Tables']['practicum_resources']['Row'];

// Enums (Derived from Database definition if possible, or mirrored)
export type LogInterval = 'daily' | 'weekly';
export type LogTemplateType = 'teaching_practice' | 'industrial_attachment' | 'custom';
export type EnrollmentStatus = 'pending' | 'approved' | 'rejected';
export type SupervisorStatus = 'pending' | 'verified' | 'rejected';

// Extended Interfaces (for App usage)
export interface Practicum extends PracticumRow {
    // Add derived properties if needed in future
}

export interface Enrollment extends EnrollmentRow {
    // JSONB typed accessors can be added via helpers
}

export interface LogEntry extends LogRow {
    // 'entries' is JSONB in DB, but we know it matches the template
    entries: Record<string, any>;
}
