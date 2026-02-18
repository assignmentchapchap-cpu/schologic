export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      api_usage_logs: {
        Row: {
          completion_tokens: number | null
          created_at: string | null
          endpoint: string
          id: string
          instructor_id: string | null
          is_demo: boolean | null
          model: string | null
          prompt_tokens: number | null
          provider: string | null
          total_tokens: number | null
        }
        Insert: {
          completion_tokens?: number | null
          created_at?: string | null
          endpoint: string
          id?: string
          instructor_id?: string | null
          is_demo?: boolean | null
          model?: string | null
          prompt_tokens?: number | null
          provider?: string | null
          total_tokens?: number | null
        }
        Update: {
          completion_tokens?: number | null
          created_at?: string | null
          endpoint?: string
          id?: string
          instructor_id?: string | null
          is_demo?: boolean | null
          model?: string | null
          prompt_tokens?: number | null
          provider?: string | null
          total_tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_tags: {
        Row: {
          asset_id: string
          tag_id: string
        }
        Insert: {
          asset_id: string
          tag_id: string
        }
        Update: {
          asset_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_tags_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_type: string
          collection_id: string | null
          content: Json | null
          created_at: string | null
          file_url: string | null
          function: string | null
          id: string
          instructor_id: string
          mime_type: string | null
          parent_asset_id: string | null
          size_bytes: number | null
          source: string
          title: string
          updated_at: string | null
        }
        Insert: {
          asset_type: string
          collection_id?: string | null
          content?: Json | null
          created_at?: string | null
          file_url?: string | null
          function?: string | null
          id?: string
          instructor_id: string
          mime_type?: string | null
          parent_asset_id?: string | null
          size_bytes?: number | null
          source: string
          title: string
          updated_at?: string | null
        }
        Update: {
          asset_type?: string
          collection_id?: string | null
          content?: Json | null
          created_at?: string | null
          file_url?: string | null
          function?: string | null
          id?: string
          instructor_id?: string
          mime_type?: string | null
          parent_asset_id?: string | null
          size_bytes?: number | null
          source?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_parent_asset_id_fkey"
            columns: ["parent_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          assignment_type: string | null
          class_id: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          max_points: number
          reference_style: string | null
          rubric: Json | null
          short_code: string | null
          title: string
          word_count: number | null
        }
        Insert: {
          assignment_type?: string | null
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          max_points?: number
          reference_style?: string | null
          rubric?: Json | null
          short_code?: string | null
          title: string
          word_count?: number | null
        }
        Update: {
          assignment_type?: string | null
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          max_points?: number
          reference_style?: string | null
          rubric?: Json | null
          short_code?: string | null
          title?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_assets: {
        Row: {
          added_at: string | null
          asset_id: string | null
          class_id: string | null
          id: string
        }
        Insert: {
          added_at?: string | null
          asset_id?: string | null
          class_id?: string | null
          id?: string
        }
        Update: {
          added_at?: string | null
          asset_id?: string | null
          class_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_assets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_assets_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          class_code: string | null
          created_at: string | null
          end_date: string | null
          id: string
          instructor_id: string | null
          invite_code: string
          is_locked: boolean | null
          name: string
          settings: Json | null
          start_date: string | null
        }
        Insert: {
          class_code?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          instructor_id?: string | null
          invite_code: string
          is_locked?: boolean | null
          name: string
          settings?: Json | null
          start_date?: string | null
        }
        Update: {
          class_code?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          instructor_id?: string | null
          invite_code?: string
          is_locked?: boolean | null
          name?: string
          settings?: Json | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string | null
          id: string
          instructor_id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instructor_id: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instructor_id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          class_id: string | null
          id: string
          joined_at: string | null
          student_id: string | null
        }
        Insert: {
          class_id?: string | null
          id?: string
          joined_at?: string | null
          student_id?: string | null
        }
        Update: {
          class_id?: string | null
          id?: string
          joined_at?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          content: string
          created_at: string | null
          id: string
          status: string | null
          subject: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          status?: string | null
          subject?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          status?: string | null
          subject?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      instructor_events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      instructor_todos: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          text: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          text: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          parent_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          parent_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          parent_id?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pilot_requests: {
        Row: {
          created_at: string | null
          current_lms: string
          email: string
          first_name: string
          id: string
          institution: string
          institution_size: string
          job_title: string
          last_name: string
          note: string | null
          other_info: string | null
          phone: string
          primary_interest: string[]
          status: string | null
          virtual_learning: boolean
        }
        Insert: {
          created_at?: string | null
          current_lms: string
          email: string
          first_name: string
          id?: string
          institution: string
          institution_size: string
          job_title: string
          last_name: string
          note?: string | null
          other_info?: string | null
          phone: string
          primary_interest: string[]
          status?: string | null
          virtual_learning?: boolean
        }
        Update: {
          created_at?: string | null
          current_lms?: string
          email?: string
          first_name?: string
          id?: string
          institution?: string
          institution_size?: string
          job_title?: string
          last_name?: string
          note?: string | null
          other_info?: string | null
          phone?: string
          primary_interest?: string[]
          status?: string | null
          virtual_learning?: boolean
        }
        Relationships: []
      }
      practicum_enrollments: {
        Row: {
          academic_data: Json
          approved_at: string | null
          course_code: string | null
          final_grade: number | null
          id: string
          instructor_notes: string | null
          joined_at: string
          location_coords: Json | null
          logs_grade: number | null
          practicum_id: string
          program_level: string | null
          report_grade: number | null
          schedule: Json | null
          status: string
          student_email: string | null
          student_id: string
          student_phone: string | null
          student_registration_number: string | null
          student_report_grades: Json | null
          student_report_url: string | null
          supervisor_data: Json
          supervisor_grade: number | null
          supervisor_report: Json | null
          workplace_data: Json
        }
        Insert: {
          academic_data?: Json
          approved_at?: string | null
          course_code?: string | null
          final_grade?: number | null
          id?: string
          instructor_notes?: string | null
          joined_at?: string
          location_coords?: Json | null
          logs_grade?: number | null
          practicum_id: string
          program_level?: string | null
          report_grade?: number | null
          schedule?: Json | null
          status?: string
          student_email?: string | null
          student_id: string
          student_phone?: string | null
          student_registration_number?: string | null
          student_report_grades?: Json | null
          student_report_url?: string | null
          supervisor_data?: Json
          supervisor_grade?: number | null
          supervisor_report?: Json | null
          workplace_data?: Json
        }
        Update: {
          academic_data?: Json
          approved_at?: string | null
          course_code?: string | null
          final_grade?: number | null
          id?: string
          instructor_notes?: string | null
          joined_at?: string
          location_coords?: Json | null
          logs_grade?: number | null
          practicum_id?: string
          program_level?: string | null
          report_grade?: number | null
          schedule?: Json | null
          status?: string
          student_email?: string | null
          student_id?: string
          student_phone?: string | null
          student_registration_number?: string | null
          student_report_grades?: Json | null
          student_report_url?: string | null
          supervisor_data?: Json
          supervisor_grade?: number | null
          supervisor_report?: Json | null
          workplace_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "practicum_enrollments_practicum_id_fkey"
            columns: ["practicum_id"]
            isOneToOne: false
            referencedRelation: "practicums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practicum_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      practicum_logs: {
        Row: {
          clock_in: string | null
          clock_out: string | null
          created_at: string
          entries: Json
          feedback: string | null
          file_urls: string[] | null
          grade: number | null
          id: string
          instructor_status: string
          location_data: Json | null
          log_date: string
          practicum_id: string
          student_id: string
          submission_status: string
          supervisor_comment: string | null
          supervisor_status: string
          supervisor_verified_at: string | null
          updated_at: string
          verification_token: string | null
          week_number: number | null
          weekly_reflection: string | null
        }
        Insert: {
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          entries?: Json
          feedback?: string | null
          file_urls?: string[] | null
          grade?: number | null
          id?: string
          instructor_status?: string
          location_data?: Json | null
          log_date: string
          practicum_id: string
          student_id: string
          submission_status?: string
          supervisor_comment?: string | null
          supervisor_status?: string
          supervisor_verified_at?: string | null
          updated_at?: string
          verification_token?: string | null
          week_number?: number | null
          weekly_reflection?: string | null
        }
        Update: {
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          entries?: Json
          feedback?: string | null
          file_urls?: string[] | null
          grade?: number | null
          id?: string
          instructor_status?: string
          location_data?: Json | null
          log_date?: string
          practicum_id?: string
          student_id?: string
          submission_status?: string
          supervisor_comment?: string | null
          supervisor_status?: string
          supervisor_verified_at?: string | null
          updated_at?: string
          verification_token?: string | null
          week_number?: number | null
          weekly_reflection?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practicum_logs_practicum_id_fkey"
            columns: ["practicum_id"]
            isOneToOne: false
            referencedRelation: "practicums"
            referencedColumns: ["id"]
          },
        ]
      }
      practicum_resources: {
        Row: {
          content: string | null
          created_at: string
          file_url: string | null
          id: string
          mime_type: string | null
          practicum_id: string
          size_bytes: number | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          mime_type?: string | null
          practicum_id: string
          size_bytes?: number | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          mime_type?: string | null
          practicum_id?: string
          size_bytes?: number | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practicum_resources_practicum_id_fkey"
            columns: ["practicum_id"]
            isOneToOne: false
            referencedRelation: "practicums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practicum_resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      practicums: {
        Row: {
          auto_approve: boolean | null
          cohort_code: string
          created_at: string
          custom_template: Json | null
          end_date: string
          final_report_required: boolean | null
          geolocation_required: boolean | null
          grading_config: Json
          id: string
          instructor_id: string
          invite_code: string
          log_interval: string
          log_template: string
          logs_rubric: Json
          start_date: string
          student_report_template: Json
          supervisor_report_template: Json
          timeline: Json
          title: string
          updated_at: string
        }
        Insert: {
          auto_approve?: boolean | null
          cohort_code: string
          created_at?: string
          custom_template?: Json | null
          end_date: string
          final_report_required?: boolean | null
          geolocation_required?: boolean | null
          grading_config?: Json
          id?: string
          instructor_id: string
          invite_code: string
          log_interval: string
          log_template: string
          logs_rubric?: Json
          start_date: string
          student_report_template?: Json
          supervisor_report_template?: Json
          timeline?: Json
          title: string
          updated_at?: string
        }
        Update: {
          auto_approve?: boolean | null
          cohort_code?: string
          created_at?: string
          custom_template?: Json | null
          end_date?: string
          final_report_required?: boolean | null
          geolocation_required?: boolean | null
          grading_config?: Json
          id?: string
          instructor_id?: string
          invite_code?: string
          log_interval?: string
          log_template?: string
          logs_rubric?: Json
          start_date?: string
          student_report_template?: Json
          supervisor_report_template?: Json
          timeline?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          demo_converted_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          honorific: string | null
          id: string
          institution_id: string | null
          is_active: boolean | null
          is_demo: boolean | null
          last_name: string | null
          phone: string | null
          preferences: Json | null
          professional_affiliation: string | null
          referred_by: string | null
          registration_number: string | null
          role: string | null
          settings: Json | null
          title: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          demo_converted_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          honorific?: string | null
          id: string
          institution_id?: string | null
          is_active?: boolean | null
          is_demo?: boolean | null
          last_name?: string | null
          phone?: string | null
          preferences?: Json | null
          professional_affiliation?: string | null
          referred_by?: string | null
          registration_number?: string | null
          role?: string | null
          settings?: Json | null
          title?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          demo_converted_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          honorific?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          is_demo?: boolean | null
          last_name?: string | null
          phone?: string | null
          preferences?: Json | null
          professional_affiliation?: string | null
          referred_by?: string | null
          registration_number?: string | null
          role?: string | null
          settings?: Json | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          recipient_email: string
          sender_email: string
          sender_name: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipient_email: string
          sender_email: string
          sender_name: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recipient_email?: string
          sender_email?: string
          sender_name?: string
          status?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          ai_score: number | null
          assignment_id: string | null
          class_id: string | null
          content: string | null
          created_at: string
          feedback: string | null
          file_url: string | null
          grade: number | null
          id: string
          report_data: Json | null
          student_id: string | null
        }
        Insert: {
          ai_score?: number | null
          assignment_id?: string | null
          class_id?: string | null
          content?: string | null
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          id?: string
          report_data?: Json | null
          student_id?: string | null
        }
        Update: {
          ai_score?: number | null
          assignment_id?: string | null
          class_id?: string | null
          content?: string | null
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          id?: string
          report_data?: Json | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_errors: {
        Row: {
          created_at: string | null
          error_message: string
          id: string
          path: string | null
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message: string
          id?: string
          path?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string
          id?: string
          path?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_errors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
      is_student_of_class: {
        Args: { lookup_class_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
