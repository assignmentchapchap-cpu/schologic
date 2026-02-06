import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from "@schologic/database";

type Enrollment = Database['public']['Tables']['practicum_enrollments']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null;
    logs?: any[]; // Annotated with logs for stats
};

interface StudentListSidebarProps {
    students: Enrollment[];
    selectedId: string | null;
    onSelect: (studentId: string) => void;
    practicum: Database['public']['Tables']['practicums']['Row'];
}

export default function StudentListSidebar({ students, selectedId, onSelect, practicum }: StudentListSidebarProps) {

    // Calculate progress (simplified version of PracticumStats)
    const calculateProgress = (student: Enrollment) => {
        const logs = student.logs || [];
        const start = new Date(practicum.start_date);
        const end = new Date(practicum.end_date);
        const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        const totalExpectedLogs = practicum.log_interval === 'weekly'
            ? Math.ceil(totalDays / 7)
            : totalDays;

        // Exclude drafts
        const logsSubmitted = logs.filter((l: any) => l.submission_status !== 'draft').length;
        const percent = Math.min(100, Math.round((logsSubmitted / totalExpectedLogs) * 100));

        const unreadCount = logs.filter((l: any) => l.instructor_status === 'unread').length;

        return { percent, unreadCount };
    };

    return (
        <div className="h-full flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 w-64 flex-shrink-0">
            <div className="p-4 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Students</h3>
                <p className="text-xs text-slate-500 mt-1">{students.length} Enrolled</p>
            </div>

            <div className="overflow-y-auto flex-grow">
                {students.map(student => {
                    const isSelected = selectedId === student.student_id;
                    const { percent, unreadCount } = calculateProgress(student);
                    const name = student.profiles?.full_name || 'Unknown Student';
                    const email = student.profiles?.email || 'No Email';

                    return (
                        <div
                            key={student.id}
                            onClick={() => onSelect(student.student_id)}
                            className={cn(
                                "p-4 border-b border-slate-800/50 cursor-pointer transition-colors group hover:bg-slate-800",
                                isSelected ? "bg-slate-800 border-l-4 border-l-emerald-500" : "border-l-4 border-l-transparent"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className={cn("font-bold text-sm", isSelected ? "text-white" : "text-slate-300 group-hover:text-white")}>
                                            {name}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{email}</p>
                                    </div>
                                </div>
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>

                            {/* Mini Progress Bar */}
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-grow h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-mono text-slate-500">{percent}%</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
