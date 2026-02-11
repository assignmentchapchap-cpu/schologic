import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { VerificationForm } from './VerificationForm';
import { cn } from '@/lib/utils';

// Admin client to fetch log by token (bypassing RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export const metadata = {
    title: 'Verify Practicum Log | Schologic',
    robots: 'noindex, nofollow' // Keep it private
};

// Force revalidation
export const revalidate = 0;

export default async function VerifyLogPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    // 1. Fetch Log by Token (Raw, no joins)
    const { data: logRaw, error } = await supabaseAdmin
        .from('practicum_logs')
        .select('*')
        .eq('verification_token', token)
        .single();

    if (error || !logRaw) {
        console.error("Verify Page Error:", error);
        return notFound();
    }

    // 2. Fetch Related Data Sequentially
    const { data: student } = await supabaseAdmin
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', logRaw.student_id)
        .single();

    const { data: practicum } = await supabaseAdmin
        .from('practicums')
        .select('title, code, organization_name, log_template')
        .eq('id', logRaw.practicum_id)
        .single();

    // 3. Construct the object structure expected by the UI
    const log = {
        ...logRaw,
        profiles: student,
        practicums: practicum
    };

    if (error || !log) {
        return notFound();
    }

    const templateType = practicum?.log_template || 'teaching_practice'; // Default fallback

    const isPending = log.supervisor_status === 'pending';
    const isVerified = log.supervisor_status === 'verified';

    // Parse entries for display
    const entries = log.entries as any;
    const isWeekly = !!log.week_number;

    // Helper to render daily entries based on template (MATCHING LogReadingPane.tsx)
    const renderEntries = () => {
        if (isWeekly) {
            // Composite Table View
            return (
                <div className="space-y-6">
                    {/* Weekly Reflection */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            Weekly Reflection
                        </h4>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {log.weekly_reflection || entries.summary || "No reflection provided."}
                        </p>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                                    <tr>
                                        <th className="p-3 font-bold w-32">Date</th>
                                        {templateType === 'teaching_practice' ? (
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
                                    {(entries.days || []).map((day: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-3 font-medium text-slate-900 align-top whitespace-nowrap">
                                                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </td>
                                            {templateType === 'teaching_practice' ? (
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
                                            <td colSpan={5} className="p-8 text-center text-slate-400 italic">No daily entries found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        } else {
            // Single Day Detailed View
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Time Logged</h4>
                            <div className="flex items-center gap-2 text-slate-700 font-mono text-sm">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                {new Date(log.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                {new Date(log.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Date</h4>
                            <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                                <Calendar className="w-4 h-4 text-emerald-500" />
                                {new Date(log.log_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {templateType === 'teaching_practice' ? (
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
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="bg-slate-900 px-8 py-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] bg-center rounded-t-3xl" />
                    <h1 className="text-2xl md:text-3xl font-black text-white mb-2 relative z-10">Log Verification</h1>
                    <p className="text-slate-400 relative z-10">Schologic Practicum Management</p>
                </div>

                {/* Status Banner */}
                {!isPending && (
                    <div className={cn(
                        "p-4 text-center font-bold text-sm flex items-center justify-center gap-2",
                        isVerified ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    )}>
                        {isVerified ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        This log has already been {log.supervisor_status}.
                    </div>
                )}

                <div className="p-8">
                    {/* Student Info */}
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                            {student?.full_name?.[0] || 'S'}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{student?.full_name || 'Student'}</h2>
                            <p className="text-slate-500 text-sm">{practicum?.title} // {templateType.replace('_', ' ').toUpperCase()}</p>
                        </div>
                        <div className="ml-auto text-right hidden sm:block">
                            <p className="text-xs text-slate-400 font-bold uppercase">Log Date</p>
                            <p className="text-sm font-medium text-slate-700">{new Date(log.log_date).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Log Content */}
                    <div className="mb-8">
                        {renderEntries()}
                    </div>

                    {/* Action Form */}
                    {isPending ? (
                        <VerificationForm token={token} />
                    ) : (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                            <h3 className="font-bold text-slate-900 mb-2">Supervisor Feedback</h3>
                            <p className="text-slate-600 italic">"{log.supervisor_comment || 'No comment provided.'}"</p>
                            <div className="mt-4 text-xs text-slate-400">
                                Verified on {new Date(log.supervisor_verified_at || new Date()).toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-8 text-center text-slate-400 text-xs">
                &copy; {new Date().getFullYear()} Schologic LMS. All rights reserved.
            </p>
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
