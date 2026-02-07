import { format } from 'date-fns';
import { Calendar, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from "@schologic/database";

type LogEntry = Database['public']['Tables']['practicum_logs']['Row'];

// Polymorphic item types
type SubmissionItem = (LogEntry & { type: 'log' }) | (LogEntry & { type: 'report' });

interface SubmissionsListColumnProps {
    items: SubmissionItem[];
    selectedId: string | null;
    onSelect: (item: SubmissionItem) => void;
    filter: 'all' | 'unread' | 'logs' | 'reports';
    setFilter: (f: 'all' | 'unread' | 'logs' | 'reports') => void;
}

export default function SubmissionsListColumn({ items, selectedId, onSelect, filter, setFilter }: SubmissionsListColumnProps) {

    // Filter logic
    const filteredItems = items.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'logs') return item.type === 'log';
        if (filter === 'reports') return item.type === 'report';
        if (filter === 'unread') return (item as any).instructor_status === 'unread';
        return true;
    });

    return (
        <div className="h-full flex flex-col bg-slate-50 border-r border-slate-200">
            {/* Header / Filter */}
            <div className="p-3 border-b border-slate-200 flex flex-col gap-2 bg-white">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Submissions</h3>
                <div className="flex p-1 bg-slate-100 rounded-lg">
                    {(['all', 'unread', 'logs', 'reports'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={cn(
                                "flex-1 py-1 text-[10px] font-bold rounded-md capitalize transition-all",
                                filter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto p-2 space-y-1">
                {filteredItems.map((item) => {
                    const isSelected = selectedId === item.id;
                    const isUnread = (item as any).instructor_status === 'unread';
                    const isDraft = (item as any).submission_status === 'draft';
                    const isVerified = item.supervisor_status === 'verified';

                    return (
                        <div
                            key={item.id}
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
                                    {item.type === 'log' ? <Calendar className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                    {item.type === 'log' ? 'Log' : 'Report'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">{format(new Date(item.log_date), 'MMM d')}</span>
                            </div>

                            <h4 className={cn("font-bold text-sm leading-tight mb-2", isUnread ? "text-slate-900" : "text-slate-600")}>
                                {item.week_number ? `Week ${item.week_number}` : (item.entries as any).subject_taught || 'Daily Log'}
                            </h4>

                            <div className="flex items-center gap-2">
                                {isDraft ? (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">Draft</span>
                                ) : isVerified ? (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Verified
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Pending
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
        </div>
    );
}
