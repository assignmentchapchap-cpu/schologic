import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, CheckCircle2, XCircle, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button'; // Assuming we have this, or use raw button classes
import { Database } from "@schologic/database";
import { PracticumLogEntry } from '@/types/practicum';

type LogEntry = Database['public']['Tables']['practicum_logs']['Row'];
type Practicum = Database['public']['Tables']['practicums']['Row'];

interface LogReadingPaneProps {
    log: LogEntry;
    practicum: Practicum;
    onVerify: (logId: string) => void;
    onReject: (logId: string) => void;
    verificationProcessing?: boolean;
}

export default function LogReadingPane({ log, practicum, onVerify, onReject, verificationProcessing = false }: LogReadingPaneProps) {
    const entries = log.entries as any;
    const isComposite = practicum.log_interval !== 'daily';
    const isDraft = (log as any).submission_status === 'draft';
    const isReport = (log as any).type === 'report';

    // Status badges logic
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'pending': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (isReport) {
        return (
            <div className="h-full flex flex-col bg-white">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Final Report Submission</h2>
                        </div>
                        <p className="text-slate-500 font-medium">
                            Submitted on {log.log_date ? format(new Date(log.log_date), 'MMM d, yyyy') : 'Unknown Date'}
                        </p>
                    </div>
                    <div className={cn("px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border", getStatusColor(log.supervisor_status))}>
                        {log.supervisor_status === 'verified' ? 'Graded' : log.supervisor_status}
                    </div>
                </div>

                <div className="flex-grow flex flex-col items-center justify-center p-10 bg-slate-50/10">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 max-w-md w-full text-center">
                        <FileText className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Student Report</h3>
                        <p className="text-slate-500 mb-8">This document contains the final practicum report submitted by the student.</p>

                        {(log as any).student_report_url ? (
                            <a
                                href={(log as any).student_report_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                            >
                                View / Download Report
                            </a>
                        ) : (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm">
                                Error: File URL not found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Placeholder for Grading Pane (Deferred) */}
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center text-slate-400 text-sm">
                        Grading functionality coming soon.
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/30">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">
                        {isComposite ? `Week ${log.week_number || '?'}` : (entries.subject_taught || entries.tasks_performed || 'Daily Entry')}
                    </h2>
                    <p className="text-slate-500 font-medium flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            {format(new Date(log.log_date), 'EEE, MMM d, yyyy')}
                        </span>
                        {!isComposite && log.clock_in && (
                            <span className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="w-4 h-4" />
                                {format(new Date(log.clock_in), 'HH:mm')} - {log.clock_out ? format(new Date(log.clock_out), 'HH:mm') : '?'}
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", getStatusColor(log.supervisor_status))}>
                        {log.supervisor_status}
                    </div>
                    {/* Verification Actions */}
                    {log.supervisor_status === 'pending' && !isDraft && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => onReject(log.id)}
                                disabled={verificationProcessing}
                                className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                            <button
                                onClick={() => onVerify(log.id)}
                                disabled={verificationProcessing}
                                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1 disabled:opacity-50 shadow-sm shadow-emerald-200"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Scrollable Area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8">

                {/* 1. Weekly Reflection / Summary (Composite Only) */}
                {isComposite && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-600" /> Weekly Reflection
                        </h4>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {log.weekly_reflection || "No reflection provided."}
                        </p>
                    </div>
                )}

                {/* 2. Log Entries Table/List */}
                <div>
                    <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4">
                        {isComposite ? 'Daily Activities' : 'Activity Details'}
                    </h3>

                    {isComposite ? (
                        /* Composite Table View */
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                                        <tr>
                                            <th className="p-3 font-bold w-32">Date</th>
                                            {practicum.log_template === 'teaching_practice' ? (
                                                <>
                                                    <th className="p-3 font-bold w-32">Grade</th>
                                                    <th className="p-3 font-bold w-48">Subject</th>
                                                    <th className="p-3 font-bold w-64">Topic</th>
                                                    <th className="p-3 font-bold">Observations</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="p-3 font-bold w-48">Dept.</th>
                                                    <th className="p-3 font-bold w-80">Tasks</th>
                                                    <th className="p-3 font-bold w-64">Skills/Challenges</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 bg-white">
                                        {entries.days?.map((day: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-3 font-medium text-slate-900 align-top whitespace-nowrap">
                                                    {format(new Date(day.date), 'EEE, MMM d')}
                                                </td>
                                                {practicum.log_template === 'teaching_practice' ? (
                                                    <>
                                                        <td className="p-3 text-slate-600 align-top font-bold text-xs">{day.class_taught}</td>
                                                        <td className="p-3 text-slate-600 align-top font-bold text-sm">{day.subject_taught}</td>
                                                        <td className="p-3 text-slate-600 align-top">{day.lesson_topic || '-'}</td>
                                                        <td className="p-3 text-slate-600 align-top text-xs leading-relaxed min-w-[200px] whitespace-pre-wrap">{day.observations || '-'}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="p-3 text-slate-600 align-top font-bold text-sm">{day.department || '-'}</td>
                                                        <td className="p-3 text-slate-600 align-top text-xs leading-relaxed max-w-[200px] whitespace-pre-wrap">{day.tasks_performed || '-'}</td>
                                                        <td className="p-3 text-slate-600 align-top text-xs leading-relaxed max-w-[200px] whitespace-pre-wrap">
                                                            {day.skills_acquired && <div className="mb-1"><span className="font-bold text-emerald-600">Skills:</span> {day.skills_acquired}</div>}
                                                            {day.challenges && <div><span className="font-bold text-red-500">Challenges:</span> {day.challenges}</div>}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                        {(!entries.days || entries.days.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-400 italic">No daily entries found for this week.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* Single Day Detailed View */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {practicum.log_template === 'teaching_practice' ? (
                                <>
                                    <DetailField label="Office Activities" value={entries.office_activities} />
                                    <DetailField label="Class Taught" value={entries.class_taught} />
                                    <DetailField label="Subject" value={entries.subject_taught} />
                                    <DetailField label="Lesson Topic" value={entries.lesson_topic} />
                                    <DetailField label="Observations / Remarks" value={entries.observations} fullWidth />
                                    <DetailField label="Supervisor Notes" value={entries.supervisor_notes} fullWidth />
                                </>
                            ) : (
                                <>
                                    <DetailField label="Department" value={entries.department} />
                                    <DetailField label="Main Activity" value={entries.main_activity} />
                                    <DetailField label="Tasks Performed" value={entries.tasks_performed} fullWidth />
                                    <DetailField label="Skills Acquired" value={entries.skills_acquired} fullWidth />
                                    <DetailField label="Challenges" value={entries.challenges} />
                                    <DetailField label="Solutions" value={entries.solutions} />
                                </>
                            )}
                            {(entries.notes || entries.reflection) && (
                                <DetailField label="Additional Notes / Reflection" value={entries.notes || entries.reflection} fullWidth />
                            )}
                        </div>
                    )}
                </div>

                {/* Attachments Section (If any) */
                    log.file_urls && log.file_urls.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500" /> Attached Files
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {log.file_urls.map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:text-blue-800 hover:border-blue-300 transition-colors">
                                        Attachment {i + 1}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
            </div>

            {/* Footer / Meta */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-400 flex justify-between">
                <span>Submitted: {log.created_at ? format(new Date(log.created_at), 'MMM d, HH:mm') : '-'}</span>
                <span>Log ID: {log.id}</span>
            </div>
        </div>
    );
}

function DetailField({ label, value, fullWidth = false }: { label: string, value?: string, fullWidth?: boolean }) {
    if (!value) return null;
    return (
        <div className={cn("bg-slate-50 p-4 rounded-xl border border-slate-100", fullWidth ? "col-span-full" : "col-span-1")}>
            <h5 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">{label}</h5>
            <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
        </div>
    );
}
