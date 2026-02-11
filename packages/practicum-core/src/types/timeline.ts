export interface TimelineEvent {
    id: string; // UUID
    title: string;
    date: string; // ISO Date String
    type: 'milestone' | 'deadline' | 'meeting' | 'report' | 'log';
    description?: string;
    is_system?: boolean; // If true, handled automatically (like start/end dates)
}

export interface TimelineWeek {
    week_number: number;
    start_date: string; // ISO Date String
    end_date: string;   // ISO Date String
    label: string;      // e.g., "Week 1"
    is_break?: boolean;
}

export interface TimelineConfig {
    weeks: TimelineWeek[];
    events: TimelineEvent[];
    settings?: {
        log_deadline_day?: number; // 0=Sun, 5=Fri (Default)
        report_offset_days?: number; // Default 30
        supervisor_offset_days?: number; // Default 7
    };
}
