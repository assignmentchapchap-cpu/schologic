import { z } from 'zod';

// ============================================
// LOG ENTRY VALIDATION
// ============================================

/**
 * Base schema for log entry metadata (common to all templates)
 */
export const LogEntryMetaSchema = z.object({
    log_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)), // ISO date or YYYY-MM-DD
    week_number: z.number().int().min(1).optional(),
    clock_in: z.string().datetime().optional(),
    clock_out: z.string().datetime().optional(),
    weekly_reflection: z.string().optional(),
});

/**
 * Dynamic log entry schema - validates the template-driven 'entries' field
 * This is a generic object since actual fields depend on the chosen template
 */
export const LogEntriesSchema = z.record(z.string(), z.unknown());

/**
 * Full log submission schema
 */
export const LogSubmissionSchema = LogEntryMetaSchema.extend({
    entries: LogEntriesSchema,
    file_urls: z.array(z.string().url()).optional(),
    location_data: z.object({
        lat: z.number(),
        lng: z.number(),
        accuracy: z.number().optional(),
        timestamp: z.string().datetime().optional(),
    }).optional(),
});

export type LogSubmission = z.infer<typeof LogSubmissionSchema>;

// ============================================
// ENROLLMENT FORM VALIDATION
// ============================================

/**
 * Academic details section
 */
export const AcademicDetailsSchema = z.object({
    course: z.string().min(1, 'Course is required'),
    level: z.enum(['certificate', 'diploma', 'degree', 'masters', 'phd']),
    year: z.number().int().min(1).max(6),
});

/**
 * Workplace details section
 */
export const WorkplaceDetailsSchema = z.object({
    company_name: z.string().min(1, 'Company/School name is required'),
    building_name: z.string().optional(),
    department: z.string().optional(),
});

/**
 * Supervisor contact information
 */
export const SupervisorInfoSchema = z.object({
    first_name: z.string().min(1, 'Supervisor first name is required'),
    last_name: z.string().min(1, 'Supervisor last name is required'),
    title: z.string().optional(), // e.g., "Mr.", "Dr.", "Prof."
    phone: z.string().min(10, 'Valid phone number required'),
    email: z.string().email('Valid email required'),
});

/**
 * Schedule entry for a single day
 */
export const ScheduleEntrySchema = z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    in_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
    out_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
});

/**
 * Location coordinates for geofencing
 */
export const LocationCoordsSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracy: z.number().optional(),
});

/**
 * Full enrollment form schema
 */
export const EnrollmentFormSchema = z.object({
    // Academic
    academic_data: AcademicDetailsSchema,

    // Workplace
    workplace_data: WorkplaceDetailsSchema,

    // Supervisor (required)
    supervisor_data: SupervisorInfoSchema,

    // Schedule
    schedule: z.array(ScheduleEntrySchema).min(1, 'At least one schedule day required'),

    // Location
    location_coords: LocationCoordsSchema,
});

export type EnrollmentForm = z.infer<typeof EnrollmentFormSchema>;

// ============================================
// HELPER TYPES
// ============================================

export type AcademicDetails = z.infer<typeof AcademicDetailsSchema>;
export type WorkplaceDetails = z.infer<typeof WorkplaceDetailsSchema>;
export type SupervisorInfo = z.infer<typeof SupervisorInfoSchema>;
export type ScheduleEntry = z.infer<typeof ScheduleEntrySchema>;
export type LocationCoords = z.infer<typeof LocationCoordsSchema>;
