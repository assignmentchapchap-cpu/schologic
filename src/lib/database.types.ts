export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    role: 'instructor' | 'student'
                    full_name: string | null
                    email: string | null
                    institution_id: string | null
                    bio: string | null
                    avatar_url: string | null
                    preferences: Json | null
                }
                Insert: {
                    id: string
                    role?: 'instructor' | 'student'
                    full_name?: string | null
                    email?: string | null
                    institution_id?: string | null
                    bio?: string | null
                    avatar_url?: string | null
                    preferences?: Json | null
                }
                Update: {
                    id?: string
                    role?: 'instructor' | 'student'
                    full_name?: string | null
                    email?: string | null
                    institution_id?: string | null
                    bio?: string | null
                    avatar_url?: string | null
                    preferences?: Json | null
                }
            }
            classes: {
                Row: {
                    id: string
                    instructor_id: string
                    name: string
                    invite_code: string
                    is_locked: boolean
                    created_at: string
                    settings: Json | null
                    start_date: string | null
                    end_date: string | null
                }
                Insert: {
                    id?: string
                    instructor_id: string
                    name: string
                    invite_code: string
                    is_locked?: boolean
                    created_at?: string
                    settings?: Json | null
                    start_date?: string | null
                    end_date?: string | null
                }
                Update: {
                    id?: string
                    instructor_id?: string
                    name?: string
                    invite_code?: string
                    is_locked?: boolean
                    created_at?: string
                    settings?: Json | null
                    start_date?: string | null
                    end_date?: string | null
                }
            }
            enrollments: {
                Row: {
                    id: string
                    student_id: string
                    class_id: string
                    joined_at: string
                }
                Insert: {
                    id?: string
                    student_id: string
                    class_id: string
                    joined_at?: string
                }
                Update: {
                    id?: string
                    student_id?: string
                    class_id?: string
                    joined_at?: string
                }
            }
            assignments: {
                Row: {
                    id: string
                    class_id: string
                    title: string
                    description: string | null
                    due_date: string | null
                    max_points: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    class_id: string
                    title: string
                    description?: string | null
                    due_date?: string | null
                    max_points?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    class_id?: string
                    title?: string
                    description?: string | null
                    due_date?: string | null
                    max_points?: number
                    created_at?: string
                }
            }
            class_resources: {
                Row: {
                    id: string
                    class_id: string
                    title: string
                    content: string | null
                    file_url: string | null
                    created_by: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    class_id: string
                    title: string
                    content?: string | null
                    file_url?: string | null
                    created_by: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    class_id?: string
                    title?: string
                    content?: string | null
                    file_url?: string | null
                    created_by?: string
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    message: string
                    link: string | null
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    message: string
                    link?: string | null
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: string
                    message?: string
                    link?: string | null
                    is_read?: boolean
                    created_at?: string
                }
            }
            submissions: {
                Row: {
                    id: string
                    student_id: string
                    class_id: string
                    content: string | null
                    file_url: string | null
                    ai_score: number | null
                    report_data: Json | null
                    created_at: string
                    assignment_id: string | null
                    grade: number | null
                    feedback: string | null
                }
                Insert: {
                    id?: string
                    student_id: string
                    class_id: string
                    content?: string | null
                    file_url?: string | null
                    ai_score?: number | null
                    report_data?: Json | null
                    created_at?: string
                    assignment_id?: string | null
                    grade?: number | null
                    feedback?: string | null
                }
                Update: {
                    id?: string
                    student_id?: string
                    class_id?: string
                    content?: string | null
                    file_url?: string | null
                    ai_score?: number | null
                    report_data?: Json | null
                    created_at?: string
                    assignment_id?: string | null
                    grade?: number | null
                    feedback?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
