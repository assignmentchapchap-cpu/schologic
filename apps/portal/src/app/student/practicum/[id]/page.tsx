'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@schologic/database";
import {
    ArrowLeft, Calendar, MapPin, User,
    BookOpen, Layers, CheckCircle2, Clock,
    FileText, Download, Upload, ChevronRight, AlertCircle,
    List, Eye, EyeOff, Plus, Edit2, Send, Trash2, Loader2, Save
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/context/ToastContext';
import PracticumStats from '@/components/practicum/PracticumStats';
import LogEntryModal from '@/components/practicum/LogEntryModal';
import { Database } from "@schologic/database";
import { LogTemplateType, PracticumTimeline, TimelineEvent, TimelineWeek, PracticumLogEntry, LogFrequency, CompositeLogData } from '@/types/practicum';
import { cn } from '@/lib/utils';
import { LogsRubricViewer, SupervisorRubricViewer, ReportRubricViewer } from '@/components/instructor/rubrics/RubricViewers';
import {
    LOGS_ASSESSMENT_RUBRIC,
    TEACHING_PRACTICE_OBSERVATION_GUIDE,
    INDUSTRIAL_ATTACHMENT_OBSERVATION_GUIDE,
    PRACTICUM_REPORT_SCORE_SHEET,
    generateTimeline
} from "@schologic/practicum-core";

type Practicum = Database['public']['Tables']['practicums']['Row'];
type Enrollment = Database['public']['Tables']['practicum_enrollments']['Row'];
type LogEntry = Database['public']['Tables']['practicum_logs']['Row'] & { submission_status?: string; instructor_status?: string; };
type Resource = Database['public']['Tables']['practicum_resources']['Row'];

export default function StudentPracticumDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [practicum, setPracticum] = useState<Practicum | null>(null);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);

    const activeTab = searchParams.get('tab') as 'overview' | 'rubrics' | 'resources' | 'logs' | 'report' || 'overview';
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

    // Log Modal Editing State
    const [editingLogDate, setEditingLogDate] = useState<string | undefined>(undefined);
    const [editingLogData, setEditingLogData] = useState<PracticumLogEntry | undefined>(undefined);
    const [targetWeekNumber, setTargetWeekNumber] = useState<number | undefined>(undefined);

    const [rubricTab, setRubricTab] = useState<'logs' | 'supervisor' | 'report'>('logs');
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
    const [logFilter, setLogFilter] = useState<'all' | 'draft' | 'pending'>('all');

    const handleSaveReflection = async () => {
        if (!editingReflectionLogId) return;
        setSavingReflection(true);
        try {
            const { error } = await supabase
                .from('practicum_logs')
                .update({ weekly_reflection: reflectionText })
                .eq('id', editingReflectionLogId);

            if (error) throw error;
            showToast("Reflection updated successfully", "success");
            setEditingReflectionLogId(null);
            fetchDashboardData();
        } catch (e: any) {
            console.error(e);
            showToast("Failed to save reflection", "error");
        } finally {
            setSavingReflection(false);
        }
    };

    // Date Range State for Modal
    const [modalMinDate, setModalMinDate] = useState<string | undefined>(undefined);
    const [modalMaxDate, setModalMaxDate] = useState<string | undefined>(undefined);

    // Reflection Editing State
    const [editingReflectionLogId, setEditingReflectionLogId] = useState<string | null>(null);
    const [reflectionText, setReflectionText] = useState('');
    const [savingReflection, setSavingReflection] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: enrollData, error: enrollError } = await supabase
                .from('practicum_enrollments')
                .select('*, practicums(*)')
                .eq('student_id', user.id)
                .eq('practicum_id', id)
                .single();

            if (enrollError || !enrollData) {
                router.replace(`/student/practicum/${id}/setup`);
                return;
            }

            if (enrollData.status !== 'approved') {
                router.replace(`/student/practicum/${id}/setup`);
                return;
            }

            setEnrollment(enrollData);
            setPracticum(enrollData.practicums as unknown as Practicum);

            const { data: logData, error: logError } = await supabase
                .from('practicum_logs')
                .select('*')
                .eq('practicum_id', id)
                .eq('student_id', user.id)
                .order('log_date', { ascending: false });

            if (logError) throw logError;
            setLogs(logData || []);

            const { data: resData, error: resError } = await supabase
                .from('practicum_resources')
                .select('*')
                .eq('practicum_id', id);

            if (resError) throw resError;
            setResources(resData || []);

        } catch (error: any) {
            console.error("Dashboard fetch error:", error);
            showToast("Failed to load dashboard data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [id, router]);

    const [creatingLog, setCreatingLog] = useState(false);

    // Report Upload State
    const [uploadingReport, setUploadingReport] = useState(false);

    const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        if (!validTypes.includes(file.type)) {
            showToast("Please upload a PDF or Word document", "error");
            return;
        }

        // Validate size (e.g. 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showToast("File size must be less than 10MB", "error");
            return;
        }

        setUploadingReport(true);

        try {
            const res = await fetch(`/api/upload/report?filename=${encodeURIComponent(file.name)}&practicumId=${id}`, {
                method: 'POST',
                body: file,
            });

            if (!res.ok) throw new Error("Upload failed");

            const blob = await res.json();

            // Update local state
            setEnrollment(prev => prev ? ({ ...prev, student_report_url: blob.url }) : null);
            showToast("Report submitted successfully!", "success");

        } catch (error) {
            console.error(error);
            showToast("Failed to upload report", "error");
        } finally {
            setUploadingReport(false);
        }
    };

    const handleCreateLog = async () => {
        if (!practicum) return;

        if (practicum.log_interval === 'daily') {
            setEditingLogDate(undefined);
            setEditingLogData(undefined);
            setTargetWeekNumber(undefined);
            setModalMinDate(undefined);
            setModalMaxDate(undefined);
            setIsLogModalOpen(true);
        } else {
            // Weekly/Monthly Logic: Enforce Current Week

            // 1. Calculate Current Week Number relative to Start Date (Monday Aligned)
            const getMonday = (d: Date) => {
                const d2 = new Date(d);
                const day = d2.getDay();
                const diff = d2.getDate() - day + (day === 0 ? -6 : 1);
                return new Date(d2.setDate(diff));
            };

            const startDate = new Date(practicum.start_date);
            const startMonday = getMonday(startDate);
            startMonday.setHours(0, 0, 0, 0);

            const today = new Date();
            const todayMonday = getMonday(today);
            todayMonday.setHours(0, 0, 0, 0);

            // Calculate week number (1-based)
            const msPerWeek = 1000 * 60 * 60 * 24 * 7;
            const diffMs = todayMonday.getTime() - startMonday.getTime();
            const currentWeekNum = Math.floor(diffMs / msPerWeek) + 1;

            if (currentWeekNum < 1) {
                showToast("Practicum has not started yet.", "error");
                return;
            }

            // Optional: Check if practicum ended, but maybe allow late entries? 
            // For now, strict 'current week' implies you can't create weeks endlessly in future.

            const existingLog = logs.find(l => l.week_number === currentWeekNum);

            if (existingLog) {
                // Log already exists, just open it
                setSelectedLogId(existingLog.id);
                showToast(`Opened Week ${currentWeekNum} Log`, "success");
                return;
            }

            // Create New Log for Current Week
            if (!confirm(`Start a log entry for CURRENT Week ${currentWeekNum}?`)) return;
            setCreatingLog(true);

            try {
                const user = (await supabase.auth.getUser()).data.user;
                if (!user) throw new Error("Authentication required");

                // Calculate Monday of this week for the log container date
                // Since we calculated currentWeekNum from startMonday, we can project forward
                const weekStart = new Date(startMonday);
                weekStart.setDate(startMonday.getDate() + (currentWeekNum - 1) * 7);

                const { data, error } = await supabase.from('practicum_logs').insert({
                    student_id: user.id,
                    practicum_id: id,
                    week_number: currentWeekNum,
                    log_date: weekStart.toISOString(),
                    submission_status: 'draft',
                    supervisor_status: 'pending',
                    instructor_status: 'unread',
                    entries: { days: [] }
                }).select().single();

                if (error) throw error;

                await fetchDashboardData();
                setTab('logs');
                if (data) setSelectedLogId(data.id);
                showToast(`Started Week ${currentWeekNum}`, "success");

            } catch (e: any) {
                console.error(e);
                showToast(e.message || "Failed to create log", "error");
            } finally {
                setCreatingLog(false);
            }
        }
    };

    const handleEditDay = (date: string, data: PracticumLogEntry, weekNumber?: number) => {
        setEditingLogDate(date);
        setEditingLogData(data);
        setTargetWeekNumber(weekNumber);
        setIsLogModalOpen(true);
    };

    const handleSubmission = async (logId: string) => {
        if (!confirm("Are you sure you want to submit this log for assessment? You will not be able to edit it afterwards.")) return;

        try {
            const { error } = await supabase
                .from('practicum_logs')
                .update({
                    submission_status: 'submitted',
                    supervisor_status: 'pending',
                    instructor_status: 'unread'
                })
                .eq('id', logId);

            if (error) throw error;

            showToast("Log submitted successfully!", "success");
            fetchDashboardData();
        } catch (e: any) {
            showToast(e.message, "error");
        }
    };

    const handleDeleteLog = async (logId: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            const { error } = await supabase.from('practicum_logs').delete().eq('id', logId);
            if (error) throw error;

            setSelectedLogId(null);
            fetchDashboardData();
            showToast("Log deleted", "success");
        } catch (e: any) {
            showToast(e.message, "error");
        }
    }

    const setTab = (tab: string) => {
        router.push(`/student/practicum/${id}?tab=${tab}`);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><span className="animate-pulse font-bold text-slate-400">Loading Dashboard...</span></div>;
    if (!practicum || !enrollment) return null;

    const timeline = (practicum.timeline as unknown as PracticumTimeline) || { milestones: [] };
    const supervisor = (enrollment.supervisor_data as any) || {};

    const logsRubric = (practicum.logs_rubric as any) || LOGS_ASSESSMENT_RUBRIC;
    const supervisorRubric = (practicum.supervisor_report_template as any) ||
        (practicum.log_template === 'industrial_attachment' ? INDUSTRIAL_ATTACHMENT_OBSERVATION_GUIDE : TEACHING_PRACTICE_OBSERVATION_GUIDE);
    const reportRubric = (practicum.student_report_template as any) || PRACTICUM_REPORT_SCORE_SHEET;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="flex flex-col gap-2">
                    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Link href="/student/practicums" className="hover:text-emerald-600 transition-colors">My Practicums</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-bold text-slate-800">{practicum.title}</span>
                    </nav>

                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
                                    enrollment.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"
                                )}>
                                    {enrollment.status}
                                </span>
                                <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
                                    <User className="w-4 h-4" /> Instructor Name
                                </span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-1">{practicum.title}</h1>
                            <p className="text-slate-500 font-medium flex items-center gap-2">
                                <span className="text-emerald-600 font-mono font-bold bg-emerald-50 px-2 rounded">{practicum.cohort_code}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {(enrollment.workplace_data as any)?.company_name || 'No Workplace'}</span>
                            </p>
                        </div>

                        <button
                            onClick={handleCreateLog}
                            disabled={creatingLog}
                            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                        >
                            {creatingLog ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            {practicum.log_interval === 'daily' ? 'New Log Entry' : `Start New ${practicum.log_interval === 'weekly' ? 'Week' : 'Month'}`}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200">
                        {[
                            { id: 'overview', label: 'Overview', icon: Layers },
                            { id: 'rubrics', label: 'Rubrics', icon: CheckCircle2 },
                            { id: 'resources', label: 'Resources', icon: BookOpen },
                            { id: 'logs', label: 'My Logs', icon: FileText },
                            { id: 'report', label: 'Final Report', icon: FileText },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setTab(tab.id)}
                                className={cn(
                                    "px-5 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap border-b-2",
                                    activeTab === tab.id
                                        ? "bg-white text-emerald-600 border-emerald-500 shadow-sm translate-y-[2px]"
                                        : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100/50"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="animate-fade-in min-h-[400px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <PracticumStats enrollment={enrollment} practicum={practicum} logs={logs} />

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-8">
                                        <section>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                    <Calendar className="w-5 h-5 text-emerald-600" /> Timeline & Milestones
                                                </h3>
                                                <button onClick={() => setShowLogs(!showLogs)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
                                                    {showLogs ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    {showLogs ? 'Hide Logs' : 'Show Logs'}
                                                </button>
                                            </div>

                                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                                                {(() => {
                                                    // Ensure we have correct type
                                                    const events = timeline.events || [];
                                                    const weeks = timeline.weeks || [];

                                                    const getEventsForWeek = (week: TimelineWeek) => {
                                                        const start = new Date(week.start_date);
                                                        const end = new Date(week.end_date);
                                                        end.setHours(23, 59, 59, 999);

                                                        return events.filter(e => {
                                                            const d = new Date(e.date);
                                                            const inRange = d >= start && d <= end;
                                                            if (!showLogs && e.type === 'log') return false;
                                                            return inRange;
                                                        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                                    };

                                                    const getVisibleWeeks = () => {
                                                        if (!weeks || weeks.length === 0) return [];
                                                        return weeks.filter(week => {
                                                            const weekEvents = getEventsForWeek(week);
                                                            return weekEvents.length > 0;
                                                        });
                                                    };

                                                    const getPreWeekEvents = () => {
                                                        const firstStart = new Date(weeks[0].start_date);
                                                        return events.filter(e => {
                                                            const d = new Date(e.date);
                                                            if (!showLogs && e.type === 'log') return false;
                                                            return d < firstStart;
                                                        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                                    };

                                                    const getPostWeekEvents = () => {
                                                        if (!weeks || weeks.length === 0) {
                                                            // Fallback: if no weeks defined, show all events here sorted
                                                            return events.filter(e => !showLogs && e.type === 'log' ? false : true)
                                                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                                        }
                                                        const lastEnd = new Date(weeks[weeks.length - 1].end_date);
                                                        // Ensure absolute end of day
                                                        lastEnd.setHours(23, 59, 59, 999);

                                                        return events.filter(e => {
                                                            const d = new Date(e.date);
                                                            if (!showLogs && e.type === 'log') return false;
                                                            return d > lastEnd;
                                                        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                                    };

                                                    const renderEvent = (event: TimelineEvent) => (
                                                        <div key={event.id || Math.random()} className="group flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                                                            <div className="flex items-start gap-3">
                                                                <div className={cn("mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
                                                                    event.type === 'report' ? 'bg-red-500' :
                                                                        event.type === 'log' ? 'bg-blue-500' :
                                                                            event.type === 'meeting' ? 'bg-purple-500' : 'bg-emerald-500'
                                                                )} />
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-800">{event.title}</p>
                                                                    {event.description && <p className="text-xs text-slate-500 line-clamp-1">{event.description}</p>}
                                                                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                                        <span className={cn("font-medium", new Date(event.date) < new Date() ? "text-slate-400" : "text-emerald-600")}>
                                                                            {new Date(event.date).toLocaleDateString()}
                                                                        </span>
                                                                        {event.type === 'log' && <span className="bg-blue-50 text-blue-600 px-1.5 rounded text-[10px] font-bold uppercase">Log</span>}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );

                                                    const preEvents = getPreWeekEvents();
                                                    const visibleWeeks = getVisibleWeeks();
                                                    const postEvents = getPostWeekEvents();
                                                    const isEmpty = preEvents.length === 0 && visibleWeeks.length === 0 && postEvents.length === 0;

                                                    return (
                                                        <div className="space-y-6">
                                                            {/* Pre-Week Events */}
                                                            {preEvents.length > 0 && (
                                                                <div className="relative pl-6 border-l-2 border-slate-100 pb-2">
                                                                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-100" />
                                                                    <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-3 pl-1">Pre-Practicum</h4>
                                                                    <div className="space-y-2">
                                                                        {preEvents.map(renderEvent)}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Weekly Events */}
                                                            {visibleWeeks.map(week => (
                                                                <div key={week.week_number} className="relative pl-6 border-l-2 border-slate-100 last:border-0 pb-6">
                                                                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-emerald-100 border-2 border-white ring-1 ring-emerald-50" />

                                                                    <div className="flex items-baseline justify-between mb-3 pl-1">
                                                                        <h4 className="font-bold text-slate-800 text-sm">{week.label}</h4>
                                                                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                                                            {new Date(week.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(week.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                        </span>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        {getEventsForWeek(week).map(renderEvent)}
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            {/* Post-Week Events */}
                                                            {postEvents.length > 0 && (
                                                                <div className="relative pl-6 border-l-2 border-slate-100 pb-2 border-transparent">
                                                                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-100" />
                                                                    <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-3 pl-1">Post-Practicum</h4>
                                                                    <div className="space-y-2">
                                                                        {postEvents.map(renderEvent)}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {isEmpty && (
                                                                <div className="text-center py-8">
                                                                    <p className="text-slate-400 italic">No events to display.</p>
                                                                    {!showLogs && events.some(e => e.type === 'log') && (
                                                                        <button onClick={() => setShowLogs(true)} className="text-emerald-600 text-sm font-bold hover:underline mt-2">
                                                                            Show hidden log entries
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </section>

                                        {/* Recent Activity Moved to Sidebar */}
                                    </div>

                                    <div className="space-y-8">
                                        <div className="bg-slate-900 text-slate-200 p-6 rounded-3xl relative overflow-hidden">
                                            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><User className="w-5 h-5 text-emerald-400" /> Supervisor</h3>
                                            <p className="text-2xl font-black text-white mb-1">{supervisor.name || 'Not Assigned'}</p>
                                            <p className="font-medium text-emerald-400 mb-4">{supervisor.designation || 'Supervisor'}</p>
                                        </div>

                                        <section>
                                            <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h3>
                                            <div className="space-y-3">
                                                {logs.slice(0, 3).map((log) => (
                                                    <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-colors cursor-pointer" onClick={() => { setTab('logs'); setSelectedLogId(log.id); }}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><FileText className="w-5 h-5" /></div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-800">Log Entry</h4>
                                                                <p className="text-xs text-slate-500">{new Date(log.log_date).toDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <span className={cn("text-xs font-bold px-3 py-1 rounded-full",
                                                            log.supervisor_status === 'verified' ? "bg-emerald-100 text-emerald-700" :
                                                                log.supervisor_status === 'rejected' ? "bg-red-100 text-red-700" :
                                                                    (log as any).submission_status === 'draft' ? "bg-amber-100 text-amber-700" :
                                                                        "bg-blue-100 text-blue-700"
                                                        )}>{
                                                                (log as any).submission_status === 'draft' ? 'Draft' :
                                                                    log.supervisor_status === 'verified' ? 'Verified' :
                                                                        log.supervisor_status === 'rejected' ? 'Rejected' :
                                                                            'Submitted'
                                                            }</span>
                                                    </div>
                                                ))}
                                                {logs.length === 0 && <div className="text-center py-8 text-slate-400">No activity yet.</div>}
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'rubrics' && (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
                                <div className="lg:col-span-1 space-y-2">
                                    {(['logs', 'supervisor', 'report'] as const).map(t => (
                                        <button key={t} onClick={() => setRubricTab(t)} className={cn("w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all", rubricTab === t ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "bg-white text-slate-600 hover:bg-slate-50")}>
                                            <div className="capitalize">{t} Assessment</div>
                                        </button>
                                    ))}
                                </div>
                                <div className="lg:col-span-3">
                                    {rubricTab === 'logs' && <LogsRubricViewer rubric={logsRubric} />}
                                    {rubricTab === 'supervisor' && <SupervisorRubricViewer rubric={supervisorRubric} />}
                                    {rubricTab === 'report' && <ReportRubricViewer rubric={reportRubric} />}
                                </div>
                            </div>
                        )}

                        {activeTab === 'resources' && (
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 min-h-[400px]">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <BookOpen className="w-6 h-6 text-emerald-500" /> Practicum Resources
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {resources.map((res) => (
                                        <a key={res.id} href={res.file_url || '#'} target="_blank" className="block p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all bg-slate-50 hover:bg-white">
                                            <h3 className="font-bold text-slate-800 mb-1 truncate">{res.title}</h3>
                                        </a>
                                    ))}
                                    {resources.length === 0 && <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">No resources yet.</div>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'report' && (
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 min-h-[400px] animate-fade-in flex flex-col items-center justify-center text-center">
                                <div className="max-w-xl w-full">
                                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Final Practicum Report</h2>
                                    <p className="text-slate-500 mb-8 leading-relaxed">
                                        This is the final submission for your practicum. Ensure your report covers all required sections as per the rubric before uploading.
                                    </p>

                                    {enrollment?.student_report_url ? (
                                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 mb-8">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-bold text-emerald-900">Report Submitted</h3>
                                                    <p className="text-xs text-emerald-600 font-medium">Ready for grading</p>
                                                </div>
                                                <div className="flex-grow" />
                                                <a
                                                    href={enrollment.student_report_url}
                                                    target="_blank"
                                                    className="px-4 py-2 bg-white text-emerald-700 text-sm font-bold rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                                                >
                                                    <Eye className="w-4 h-4" /> View
                                                </a>
                                            </div>

                                            <p className="text-xs text-emerald-600/70 text-left px-1">
                                                Need to make changes? You can upload a new version below to replace the current file.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400">
                                                    <AlertCircle className="w-6 h-6" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-bold text-slate-700">Not Submitted</h3>
                                                    <p className="text-xs text-slate-500 font-medium">Upload your report to complete the practicum</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative group cursor-pointer">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleReportUpload}
                                            disabled={uploadingReport}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                                        />
                                        <div className={cn(
                                            "border-2 border-dashed rounded-3xl p-10 transition-all duration-200 flex flex-col items-center justify-center gap-4",
                                            uploadingReport ? "bg-slate-50 border-slate-300" : "bg-white border-slate-300 group-hover:border-emerald-500 group-hover:bg-emerald-50/10"
                                        )}>
                                            {uploadingReport ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                                    <p className="text-sm font-bold text-emerald-600">Uploading...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <Upload className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700 mb-1 group-hover:text-emerald-700">Click to upload or drag and drop</p>
                                                        <p className="text-xs text-slate-400">PDF or Word Documents (Max 10MB)</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {activeTab === 'logs' && (
                            <div className="h-[calc(100vh-200px)] min-h-[600px] flex flex-col md:flex-row gap-6 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                {/* LEFT: Sidebar List */}
                                <div className="w-full md:w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50">
                                    <div className="p-4 border-b border-slate-100 flex flex-col gap-3 bg-white">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-slate-900">Log Entries</h3>
                                            <span className="text-xs font-bold text-slate-400">{logs.length} Total</span>
                                        </div>
                                        <div className="flex p-1 bg-slate-100 rounded-lg">
                                            {(['all', 'draft', 'pending'] as const).map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => setLogFilter(f)}
                                                    className={cn(
                                                        "flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-all",
                                                        logFilter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                                    )}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto flex-grow p-3 space-y-2">
                                        {logs.filter(l => {
                                            if (logFilter === 'all') return true;
                                            if (logFilter === 'draft') return (l as any).submission_status === 'draft';
                                            if (logFilter === 'pending') return (l as any).submission_status !== 'draft' && l.supervisor_status === 'pending';
                                            return true;
                                        }).map(log => {
                                            const isSelected = selectedLogId === log.id;
                                            const entries = log.entries as any;
                                            const title = practicum.log_interval === 'daily'
                                                ? (entries.subject_taught || entries.tasks_performed || 'Daily Log')
                                                : `Week ${log.week_number || '?'}`;

                                            return (
                                                <div key={log.id} onClick={() => setSelectedLogId(log.id)} className={cn("p-3 rounded-xl cursor-pointer border transition-all hover:bg-white hover:shadow-sm", isSelected ? "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/20" : "bg-transparent border-transparent hover:border-slate-200")}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-bold text-slate-400">{new Date(log.log_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                                            log.submission_status === 'draft' ? "bg-amber-100 text-amber-700" :
                                                                log.supervisor_status === 'verified' ? "bg-emerald-100 text-emerald-700" :
                                                                    log.supervisor_status === 'rejected' ? "bg-red-100 text-red-700" :
                                                                        "bg-blue-100 text-blue-700"
                                                        )}>{
                                                                log.submission_status === 'draft' ? 'Draft' :
                                                                    log.supervisor_status === 'verified' ? 'Verified' :
                                                                        log.supervisor_status === 'rejected' ? 'Rejected' :
                                                                            'Submitted'
                                                            }</span>
                                                    </div>
                                                    <h4 className={cn("font-bold text-sm", isSelected ? "text-emerald-700" : "text-slate-700")}>{title}</h4>
                                                    <p className="text-xs text-slate-500 line-clamp-1 mt-1">{log.weekly_reflection || entries.notes || "No summary provided."}</p>
                                                </div>
                                            );
                                        })}
                                        {logs.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">No logs found.</div>}
                                    </div>
                                </div>

                                {/* RIGHT: Detail View */}
                                <div className="w-full md:w-2/3 flex flex-col bg-white">
                                    {selectedLogId ? (() => {
                                        const log = logs.find(l => l.id === selectedLogId)!;
                                        const entries = log.entries as any;
                                        const isComposite = practicum.log_interval !== 'daily';
                                        const isDraft = log.submission_status === 'draft';

                                        return (
                                            <div className="flex-grow overflow-y-auto p-6 md:p-8 animate-fade-in">
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h2 className="text-2xl font-black text-slate-900">
                                                            {isComposite ? `Week ${log.week_number || '?'}` : (entries.subject_taught || entries.tasks_performed || 'Daily Entry')}
                                                        </h2>
                                                        <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                                            <Calendar className="w-4 h-4" /> {new Date(log.log_date).toDateString()}
                                                            {!isComposite && <span className="flex items-center gap-1 ml-2"><Clock className="w-4 h-4" /> {log.clock_in ? new Date(log.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} - {log.clock_out ? new Date(log.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className={cn("px-4 py-2 rounded-xl border flex flex-col items-center",
                                                            log.supervisor_status === 'verified' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                                                                log.supervisor_status === 'rejected' ? "bg-red-50 border-red-100 text-red-700" :
                                                                    log.submission_status === 'draft' ? "bg-amber-50 border-amber-100 text-amber-700" :
                                                                        "bg-blue-50 border-blue-100 text-blue-700"
                                                        )}>
                                                            <span className="text-[10px] uppercase font-bold tracking-wider">Status</span>
                                                            <span className="font-black text-sm">{
                                                                log.submission_status === 'draft' ? 'Draft' :
                                                                    log.supervisor_status === 'verified' ? 'Verified' :
                                                                        log.supervisor_status === 'rejected' ? 'Rejected' :
                                                                            'Submitted'
                                                            }</span>
                                                        </div>
                                                        {isDraft && (
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleDeleteLog(log.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                                <button onClick={() => handleSubmission(log.id)} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow hover:bg-emerald-700 transition-colors flex items-center gap-2">
                                                                    <Send className="w-3 h-3" /> Submit for Assessment
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Composite View: Builder vs Read-Only */}
                                                {isComposite ? (
                                                    <div className="space-y-6">
                                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                                    <FileText className="w-4 h-4 text-emerald-600" /> Weekly Reflection
                                                                </h4>
                                                                {isDraft && (editingReflectionLogId !== log.id) && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingReflectionLogId(log.id);
                                                                            setReflectionText(log.weekly_reflection || '');
                                                                        }}
                                                                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {editingReflectionLogId === log.id ? (
                                                                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                                                    <textarea
                                                                        value={reflectionText}
                                                                        onChange={e => setReflectionText(e.target.value)}
                                                                        className="w-full min-h-[100px] p-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm text-slate-800 bg-white"
                                                                        placeholder="Write your reflection for this week..."
                                                                        autoFocus
                                                                    />
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={() => setEditingReflectionLogId(null)}
                                                                            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                                                                            disabled={savingReflection}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={handleSaveReflection}
                                                                            disabled={savingReflection}
                                                                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                                                        >
                                                                            {savingReflection ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                                                            Save Reflection
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                                                    {log.weekly_reflection || <span className="text-slate-400 italic">No reflection provided yet. Click edit to add.</span>}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Interactive Builder */}
                                                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                                                            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                                                                <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Daily Entries</span>
                                                                {isDraft && (
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                                                                        >
                                                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleEditDay('', {}, log.week_number || undefined)}
                                                                            className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200 bg-white"
                                                                        >
                                                                            <Plus className="w-3.5 h-3.5" /> Add Day
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-sm text-left">
                                                                    <thead className="bg-white border-b border-slate-100 text-slate-500">
                                                                        <tr>
                                                                            <th className="p-3 font-bold w-24">Date</th>
                                                                            {practicum.log_template === 'teaching_practice' ? (
                                                                                <>
                                                                                    <th className="p-3 font-bold w-24">Grade</th>
                                                                                    <th className="p-3 font-bold w-32">Subject</th>
                                                                                    <th className="p-3 font-bold w-1/4">Topic</th>
                                                                                    <th className="p-3 font-bold">Observations</th>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <th className="p-3 font-bold w-32">Dept.</th>
                                                                                    <th className="p-3 font-bold w-1/4">Tasks</th>
                                                                                    <th className="p-3 font-bold w-1/4">Skills</th>
                                                                                    <th className="p-3 font-bold">Challenges</th>
                                                                                </>
                                                                            )}
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-50">
                                                                        {entries.days?.map((day: any, idx: number) => (
                                                                            <tr
                                                                                key={idx}
                                                                                onClick={() => isDraft && handleEditDay(day.date, day, log.week_number || undefined)}
                                                                                className={cn(
                                                                                    "transition-colors",
                                                                                    isDraft ? "hover:bg-emerald-50/30 cursor-pointer group" : "hover:bg-slate-50/50"
                                                                                )}
                                                                            >
                                                                                <td className="p-3 font-medium text-slate-900 whitespace-nowrap align-top">
                                                                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                                                                                </td>
                                                                                {practicum.log_template === 'teaching_practice' ? (
                                                                                    <>
                                                                                        <td className="p-3 text-slate-600 align-top">{day.class_taught || '-'}</td>
                                                                                        <td className="p-3 text-slate-600 align-top">{day.subject_taught || '-'}</td>
                                                                                        <td className="p-3 text-slate-600 align-top">{day.lesson_topic || '-'}</td>
                                                                                        <td className="p-3 text-slate-600 align-top text-xs leading-relaxed min-w-[200px]">{day.observations || '-'}</td>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <td className="p-3 text-slate-600 align-top">{day.department || '-'}</td>
                                                                                        <td className="p-3 text-slate-600 align-top text-xs leading-relaxed max-w-[200px]">{day.tasks_performed || '-'}</td>
                                                                                        <td className="p-3 text-slate-600 align-top text-xs leading-relaxed max-w-[200px]">{day.skills_acquired || '-'}</td>
                                                                                        <td className="p-3 text-slate-600 align-top text-xs leading-relaxed max-w-[200px]">{day.challenges || '-'}</td>
                                                                                    </>
                                                                                )}
                                                                            </tr>
                                                                        ))}
                                                                        {(!entries.days || entries.days.length === 0) && (
                                                                            <tr>
                                                                                <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                                                                                    No entries for this week yet. Click below to add.
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            {/* Footer Add Button */}
                                                            {isDraft && (
                                                                <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-center">
                                                                    <button
                                                                        onClick={() => handleEditDay('', {}, log.week_number || undefined)}
                                                                        className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 hover:scale-110 transition-all"
                                                                    >
                                                                        <Plus className="w-6 h-6" />
                                                                    </button>
                                                                </div>
                                                            )}

                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Daily View Details
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {practicum.log_template === 'teaching_practice' ? (
                                                                <>
                                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                                        <label className="text-xs font-bold text-slate-400 uppercase">Subject</label>
                                                                        <p className="font-bold text-slate-800">{entries.subject_taught}</p>
                                                                    </div>
                                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                                        <label className="text-xs font-bold text-slate-400 uppercase">Grade</label>
                                                                        <p className="font-bold text-slate-800">{entries.class_taught}</p>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                                    <label className="text-xs font-bold text-slate-400 uppercase">Department</label>
                                                                    <p className="font-bold text-slate-800">{entries.department}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                                            <h4 className="font-bold text-slate-800 mb-2">Activities</h4>
                                                            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{entries.tasks_performed || entries.observations || entries.notes || "No content."}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })() : (
                                        <div className="flex-grow flex flex-col items-center justify-center text-slate-300 p-10">
                                            <FileText className="w-16 h-16 opacity-20 mb-4" />
                                            <p className="font-bold text-slate-400">Select a log entry to view details</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'report' && (
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 text-center">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Final Practicum Report</h2>
                                <p className="text-slate-500 max-w-lg mx-auto mb-8">Upload your final comprehensive report here.</p>
                                <div className="max-w-xl mx-auto border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-emerald-400 hover:bg-emerald-50/10 transition-all cursor-pointer group">
                                    <p className="font-bold text-slate-700 group-hover:text-emerald-700">Drag and drop your report (PDF)</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <LogEntryModal
                    isOpen={isLogModalOpen}
                    onClose={() => setIsLogModalOpen(false)}
                    practicumId={id}
                    templateType={practicum.log_template as LogTemplateType}
                    logInterval={practicum.log_interval as LogFrequency}
                    weekNumber={targetWeekNumber}
                    initialDate={editingLogDate}
                    initialData={editingLogData}
                    onSuccess={fetchDashboardData}
                    // Strict Logic Props
                    weekStart={(() => {
                        if (!targetWeekNumber || !practicum) return undefined;
                        const getMonday = (d: Date) => {
                            const d2 = new Date(d);
                            const day = d2.getDay();
                            const diff = d2.getDate() - day + (day === 0 ? -6 : 1);
                            return new Date(d2.setDate(diff));
                        };
                        const startMonday = getMonday(new Date(practicum.start_date));
                        startMonday.setHours(0, 0, 0, 0);
                        const weekStart = new Date(startMonday);
                        weekStart.setDate(startMonday.getDate() + (targetWeekNumber - 1) * 7);
                        return weekStart.toISOString().split('T')[0];
                    })()}
                    scheduleDays={(enrollment?.schedule as any)?.days || []}
                    existingDates={(() => {
                        if (!targetWeekNumber) return [];
                        const log = logs.find(l => l.week_number === targetWeekNumber);
                        return (log?.entries as any)?.days?.map((d: any) => d.date) || [];
                    })()}
                />
            </div>
        </div >
    );
}
