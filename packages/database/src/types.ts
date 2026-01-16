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
                    title: string | null
                    first_name: string | null
                    last_name: string | null
                    honorific: string | null
                    full_name: string | null
                    email: string | null
                    institution_id: string | null
                    bio: string | null
                    avatar_url: string | null
                    preferences: Json | null
                    registration_number: string | null
                    settings: Json | null
                }
                Insert: {
                    id: string
                    role?: 'instructor' | 'student'
                    title?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    honorific?: string | null
                    full_name?: string | null
                    email?: string | null
                    institution_id?: string | null
                    bio?: string | null
                    avatar_url?: string | null
                    preferences?: Json | null
                    registration_number?: string | null
                    settings?: Json | null
                }
                Update: {
                    id?: string
                    role?: 'instructor' | 'student'
                    title?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    honorific?: string | null
                    full_name?: string | null
                    email?: string | null
                    institution_id?: string | null
                    bio?: string | null
                    avatar_url?: string | null
                    preferences?: Json | null
                    registration_number?: string | null
                    settings?: Json | null
                }
                Relationships: []
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
                    class_code: string | null
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
                    class_code?: string | null
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
                    class_code?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "classes_instructor_id_fkey"
                        columns: ["instructor_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
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
                Relationships: [
                    {
                        foreignKeyName: "enrollments_student_id_fkey"
                        columns: ["student_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "enrollments_class_id_fkey"
                        columns: ["class_id"]
                        isOneToOne: false
                        referencedRelation: "classes"
                        referencedColumns: ["id"]
                    }
                ]
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
                    short_code: string | null
                    word_count: number | null
                    reference_style: string | null
                    rubric: Json | null
                }
                Insert: {
                    id?: string
                    class_id: string
                    title: string
                    description?: string | null
                    due_date?: string | null
                    max_points?: number
                    created_at?: string
                    short_code?: string | null
                    word_count?: number | null
                    reference_style?: string | null
                    rubric?: Json | null
                }
                Update: {
                    id?: string
                    class_id?: string
                    title?: string
                    description?: string | null
                    due_date?: string | null
                    max_points?: number
                    created_at?: string
                    short_code?: string | null
                    word_count?: number | null
                    reference_style?: string | null
                    rubric?: Json | null
                }
                Relationships: [
                    {
                        foreignKeyName: "assignments_class_id_fkey"
                        columns: ["class_id"]
                        isOneToOne: false
                        referencedRelation: "classes"
                        referencedColumns: ["id"]
                    }
                ]
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
                Relationships: []
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
                Relationships: []
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
                Relationships: []
            }
            instructor_events: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    event_date: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    event_date: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    event_date?: string
                    created_at?: string
                }
                Relationships: []
            }
            instructor_todos: {
                Row: {
                    id: string
                    user_id: string
                    text: string
                    completed: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    text: string
                    completed?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    text?: string
                    completed?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            assets: {
                Row: {
                    id: string
                    instructor_id: string
                    collection_id: string | null
                    title: string
                    content: string | null
                    file_url: string | null
                    asset_type: 'file' | 'cartridge_root' | 'document' | 'url'
                    mime_type: string | null
                    source: string | null
                    created_at: string
                    parent_asset_id: string | null
                }
                Insert: {
                    id?: string
                    instructor_id: string
                    collection_id?: string | null
                    title: string
                    content?: string | null
                    file_url?: string | null
                    asset_type: 'file' | 'cartridge_root' | 'document' | 'url' | string
                    mime_type?: string | null
                    source?: string | null
                    created_at?: string
                    parent_asset_id?: string | null
                }
                Update: {
                    id?: string
                    instructor_id?: string
                    collection_id?: string | null
                    title?: string
                    content?: string | null
                    file_url?: string | null
                    asset_type?: 'file' | 'cartridge_root' | 'document' | 'url' | string
                    mime_type?: string | null
                    source?: string | null
                    created_at?: string
                    parent_asset_id?: string | null
                }
                Relationships: []
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
