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
    // New: Grading Props
    currentReportGrade?: number;
    onUpdateReportGrade?: (grade: number) => void;
}

export default function LogReadingPane({ log, practicum, onVerify, onReject, verificationProcessing = false, currentReportGrade, onUpdateReportGrade }: LogReadingPaneProps) {
    const entries = log.entries as any;
    const isComposite = practicum.log_interval !== 'daily';
    const isDraft = (log as any).submission_status === 'draft';
    const isReport = (log as any).type === 'student_report'; // Using new type key
    const isSupervisorReport = (log as any).type === 'supervisor_report';

    // Status badges logic
    // Status badges logic
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'pending': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'verified': return 'Supervisor Verified';
            case 'rejected': return 'Supervisor Rejected';
            case 'pending': return 'Pending Supervisor';
            default: return status;
        }
    };

    if (isSupervisorReport) {
        const report = (log as any).supervisor_report; // Type: SupervisorReport

        if (!report) {
            return (
                <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>Report pending submission.</p>
                    </div>
                </div>
            )
        }

        return (
            <div className="h-full flex flex-col bg-white">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <User className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Supervisor Evaluation</h2>
                        </div>
                        <p className="text-slate-500 font-medium">
                            Submitted on {report.submitted_at ? format(new Date(report.submitted_at), 'MMM d, yyyy') : '-'}
                        </p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Score</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-emerald-600">{report.total_score}</span>
                            <span className="text-lg text-emerald-400 font-medium">/ {report.max_total_score}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-8">
                    {/* Sections */}
                    {report.sections.map((section: any) => (
                        <div key={section.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
                                <span>{section.title}</span>
                                <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Score Breakdown</span>
                            </h3>
                            <div className="flex flex-col gap-4">
                                {section.items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-600 w-1/2">{item.label}</span>
                                        <div className="flex items-center gap-3">
                                            {/* Visual Rating Bar */}
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <div
                                                        key={star}
                                                        className={cn(
                                                            "w-4 h-1 rounded-full transition-colors",
                                                            star <= item.value ? "bg-emerald-500" : "bg-slate-200"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <span className="font-bold text-slate-900 w-6 text-right text-sm">{item.value}/{item.max_score}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Feedback */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                        <div>
                            <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">General Feedback</h4>
                            <p className="text-slate-700 italic leading-relaxed whitespace-pre-wrap">"{report.feedback || 'No feedback provided.'}"</p>
                        </div>
                        {report.recommendation && (
                            <div className="pt-4 border-t border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Recommendation</h4>
                                <p className="text-slate-700 font-medium whitespace-pre-wrap">"{report.recommendation}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

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
                {/* Grading Section */}
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-1">Report Grade</h4>
                            <p className="text-xs text-slate-500">Assign a final score for this report.</p>
                        </div>

                        {onUpdateReportGrade ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-20 p-2 text-center font-bold text-emerald-600 text-lg border border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    placeholder="-"
                                    value={currentReportGrade ?? ''}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val)) onUpdateReportGrade(val);
                                    }}
                                />
                                <span className="font-bold text-slate-400">/ 100</span>
                            </div>
                        ) : (
                            <span className="text-xs text-slate-400 italic">Grading unavailable</span>
                        )}
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
                        {getStatusLabel(log.supervisor_status)}
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

                {/* 0. Supervisor Feedback (If verified/rejected) */}
                {log.supervisor_comment && (
                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                        <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" /> Supervisor Feedback
                        </h4>
                        <p className="text-blue-800 text-sm leading-relaxed italic">
                            "{log.supervisor_comment}"
                        </p>
                        {log.supervisor_verified_at && (
                            <p className="text-xs text-blue-400 mt-2 font-medium">
                                Verified on {format(new Date(log.supervisor_verified_at), 'MMM d, yyyy HH:mm')}
                            </p>
                        )}
                    </div>
                )}

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
