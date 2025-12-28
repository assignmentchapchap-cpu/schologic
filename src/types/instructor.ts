import { Database } from '@/lib/database.types';

export type ClassData = Database['public']['Tables']['classes']['Row'];
export type Assignment = Database['public']['Tables']['assignments']['Row'];

export type EnrollmentProfile = {
    id: string;
    student_id: string;
    joined_at: string;
    profiles: {
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
        registration_number: string | null;
    } | null;
};

export type Submission = Database['public']['Tables']['submissions']['Row'];

export type SubmissionWithProfile = Submission & {
    profiles: {
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
        registration_number: string | null;
    } | null;
};
