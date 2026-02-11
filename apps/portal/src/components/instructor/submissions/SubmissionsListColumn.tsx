import { format } from 'date-fns';
import { Calendar, FileText, CheckCircle2, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from "@schologic/database";

type LogEntry = Database['public']['Tables']['practicum_logs']['Row'];
type Enrollment = Database['public']['Tables']['practicum_enrollments']['Row'];

// Polymorphic item types
export type SubmissionItem =
    | (LogEntry & { type: 'log' })
    | (Enrollment & { type: 'student_report', log_date: string, instructor_status: 'read' | 'unread', submission_status: 'submitted' })
    | (Enrollment & { type: 'supervisor_report', log_date: string, instructor_status: 'read' | 'unread', submission_status: 'submitted' });

interface SubmissionsListColumnProps {
    items: SubmissionItem[];
    selectedId: string | null;
    onSelect: (item: SubmissionItem) => void;
    filter: 'all' | 'logs' | 'student_reports' | 'supervisor_reports';
    setFilter: (f: 'all' | 'logs' | 'student_reports' | 'supervisor_reports') => void;
    // Grading Props
    currentLogsGrade?: number;
    onUpdateLogsGrade?: (grade: number) => void;
    currentReportGrade?: number;
    onUpdateReportGrade?: (grade: number) => void;
    currentSupervisorGrade?: number;
    onUpdateSupervisorGrade?: (grade: number) => void;
}

export default function SubmissionsListColumn({ items, selectedId, onSelect, filter, setFilter, currentLogsGrade, onUpdateLogsGrade, currentReportGrade, onUpdateReportGrade, currentSupervisorGrade, onUpdateSupervisorGrade }: SubmissionsListColumnProps) {

    // Filter logic
    const filteredItems = items.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'logs') return item.type === 'log';
        if (filter === 'student_reports') return item.type === 'student_report';
        if (filter === 'supervisor_reports') return item.type === 'supervisor_report';
        return true;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'log': return <Calendar className="w-3 h-3" />;
            case 'student_report': return <FileText className="w-3 h-3" />;
            case 'supervisor_report': return <User className="w-3 h-3" />;
            default: return <FileText className="w-3 h-3" />;
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case 'log': return 'Log';
            case 'student_report': return 'Student Report';
            case 'supervisor_report': return 'Supervisor Eval';
            default: return 'Item';
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 border-r border-slate-200">
            {/* Header / Filter */}
            <div className="p-3 border-b border-slate-200 flex flex-col gap-2 bg-white">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Submissions</h3>
                <div className="flex p-1 bg-slate-100 rounded-lg overflow-x-auto no-scrollbar gap-1">
                    {(['all', 'logs', 'student_reports', 'supervisor_reports'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={cn(
                                "flex-shrink-0 px-2 py-1 text-[10px] font-bold rounded-md capitalize transition-all whitespace-nowrap",
                                filter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>


            {/* Grading Header - Logs (Only show when viewing logs) */}
            {filter === 'logs' && onUpdateLogsGrade && (
                <div className="p-3 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center animate-fade-in">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Logs Grade</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="-"
                            className="w-16 p-1 text-center text-sm font-bold border border-emerald-200 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                            value={currentLogsGrade ?? ''}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && onUpdateLogsGrade) onUpdateLogsGrade(val);
                            }}
                        />
                        <span className="text-xs font-bold text-emerald-600">pts</span>
                    </div>
                </div>
            )}

            {/* Grading Header - Student Report (Only show when viewing student reports) */}
            {filter === 'student_reports' && onUpdateReportGrade && (
                <div className="p-3 bg-purple-50 border-b border-purple-100 flex justify-between items-center animate-fade-in">
                    <span className="text-xs font-bold text-purple-800 uppercase tracking-wide">Report Grade</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="-"
                            className="w-16 p-1 text-center text-sm font-bold border border-purple-200 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
                            value={currentReportGrade ?? ''}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && onUpdateReportGrade) onUpdateReportGrade(val);
                            }}
                        />
                        <span className="text-xs font-bold text-purple-600">pts</span>
                    </div>
                </div>
            )}

            {/* Grading Header - Supervisor Eval (Only show when viewing supervisor reports) */}
            {filter === 'supervisor_reports' && onUpdateSupervisorGrade && (
                <div className="p-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center animate-fade-in">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Supervisor Grade</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="-"
                            className="w-16 p-1 text-center text-sm font-bold border border-blue-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                            value={currentSupervisorGrade ?? ''}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && onUpdateSupervisorGrade) onUpdateSupervisorGrade(val);
                            }}
                        />
                        <span className="text-xs font-bold text-blue-600">pts</span>
                    </div>
                </div>
            )}


            {/* List */}
            <div className="flex-grow overflow-y-auto p-2 space-y-1">
                {filteredItems.map((item) => {
                    const isSelected = selectedId === item.id;
                    // For logs, use real status. For reports, mock or derive.
                    const isUnread = item.instructor_status === 'unread';
                    // @ts-ignore
                    const isDraft = item.submission_status === 'draft';

                    let isVerified = false;
                    let statusLabel = 'Pending';

                    if (item.type === 'log') {
                        isVerified = item.supervisor_status === 'verified';
                        statusLabel = isVerified ? 'Verified' : 'Pending';
                    } else if (item.type === 'supervisor_report') {
                        const report = (item as any).supervisor_report;
                        isVerified = !!report;
                        statusLabel = isVerified ? 'Submitted' : 'Pending';
                    } else {
                        // Student Report
                        isVerified = !!(item as any).final_grade; // If graded
                        statusLabel = isVerified ? 'Graded' : 'Submitted';
                    }

                    return (
                        <div
                            key={item.id + '-' + item.type}
                            onClick={() => onSelect(item)}
                            className={cn(
                                "p-3 rounded-xl border cursor-pointer transition-all hover:bg-white hover:shadow-sm group relative",
                                isSelected ? "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/20" : "bg-white border-transparent hover:border-slate-200",
                                isUnread && !isSelected ? "bg-white border-l-4 border-l-emerald-500" : ""
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn("text-[10px] font-bold uppercase flex items-center gap-1",
                                    isUnread ? "text-emerald-600" : "text-slate-400"
                                )}>
                                    {getIcon(item.type)}
                                    {getLabel(item.type)}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">{format(new Date(item.log_date), 'MMM d')}</span>
                            </div>

                            <h4 className={cn("font-bold text-sm leading-tight mb-2", isUnread ? "text-slate-900" : "text-slate-600")}>
                                {item.type === 'log' ? (item.week_number ? `Week ${item.week_number}` : (item.entries as any).subject_taught || 'Daily Log') :
                                    item.type === 'supervisor_report' ? 'Final Evaluation' : 'Practicum Report'}
                            </h4>

                            <div className="flex items-center gap-2">
                                {isDraft ? (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">Draft</span>
                                ) : isVerified ? (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> {statusLabel}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {statusLabel}
                                    </span>
                                )}
                            </div>

                            {isUnread && (
                                <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                            )}
                        </div>
                    );
                })}

                {filteredItems.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                        No items found.
                    </div>
                )}
            </div>
        </div >
    );
}
