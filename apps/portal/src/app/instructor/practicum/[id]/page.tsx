'use client';

import { Suspense, use, useEffect, useState, useCallback } from 'react';
import { createClient } from "@schologic/database";
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Edit, ChevronUp, ChevronDown, Check, Copy, Calendar, Users, FileText, Clock, ArrowUpRight, BookOpen, Layers, Award } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Database } from "@schologic/database";
import { Card } from '@/components/ui/Card';

type PracticumData = Database['public']['Tables']['practicums']['Row'];
type Enrollment = Database['public']['Tables']['practicum_enrollments']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

import {
    TimelineConfig,
    LOGS_ASSESSMENT_RUBRIC,
    TEACHING_PRACTICE_OBSERVATION_GUIDE,
    INDUSTRIAL_ATTACHMENT_OBSERVATION_GUIDE,
    PRACTICUM_REPORT_SCORE_SHEET
} from "@schologic/practicum-core";
import TimelineEditor from '@/components/instructor/TimelineEditor';
import RubricsManager from '@/components/instructor/rubrics/RubricsManager';
import EnrollmentsTab from '@/components/instructor/enrollments/EnrollmentsTab';
import SubmissionsManager from '@/components/instructor/submissions/SubmissionsManager';
import PracticumGradesTab from '@/components/instructor/grades/PracticumGradesTab';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useNavigationGuard } from '@/context/NavigationGuardContext';

import RequestReportDialog from '@/components/instructor/RequestReportDialog';

export default function PracticumDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <PracticumDetailsContent id={id} />;
}

function PracticumDetailsContent({ id }: { id: string }) {
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    const initialTab = searchParams.get('tab') as 'overview' | 'enrollments' | 'rubrics' | 'resources' | 'submissions' | 'grades' || 'overview';
    const [activeTab, setActiveTabState] = useState(initialTab);
    const [isRubricDirty, setIsRubricDirty] = useState(false);
    const [isTimelineDirty, setIsTimelineDirty] = useState(false);
    const { blockNavigation, allowNavigation } = useNavigationGuard();

    // Internal Dialog State
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingTab, setPendingTab] = useState<(typeof activeTab) | null>(null);
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

    // Consolidated dirty check
    const isDirty = (tab: string) => {
        if (tab === 'rubrics') return isRubricDirty;
        if (tab === 'overview') return isTimelineDirty; // Timeline is in overview
        return false;
    };

    const handleDirtyChange = (key: 'rubrics' | 'overview', dirty: boolean) => {
        if (key === 'rubrics') setIsRubricDirty(dirty);
        if (key === 'overview') setIsTimelineDirty(dirty);

        if (dirty) {
            blockNavigation('main-tabs', 'You have unsaved changes. Are you sure you want to leave?');
        } else {
            // Only allow if the other one is also clean (simplified for now as usually one edits one thing)
            // Better: check both
            if ((key === 'rubrics' && !isTimelineDirty) || (key === 'overview' && !isRubricDirty)) {
                allowNavigation('main-tabs');
            }
        }
    };

    // Callback to update local state when children save
    const handleTimelineUpdate = (newConfig: any) => {
        if (!practicum) return;
        setPracticum({ ...practicum, timeline: newConfig });
        setIsTimelineDirty(false);
        // We might need to keep navigation blocked if rubrics are dirty, but for timeline we are good.
        if (!isRubricDirty) allowNavigation('main-tabs');
    };

    // Callback for Rubric updates
    const handleRubricsUpdate = (type: 'logs' | 'supervisor' | 'report', newRubric: any) => {
        if (!practicum) return;
        const keyMap = {
            'logs': 'logs_rubric',
            'supervisor': 'supervisor_report_template',
            'report': 'student_report_template'
        };
        setPracticum({ ...practicum, [keyMap[type]]: newRubric });
        // Dirty state is managed via onDirtyStateChange callback from manager
    };

    // Guarded Tab Switch
    const setActiveTab = (tab: typeof activeTab) => {
        // Check if CURRENT tab is dirty
        if (isDirty(activeTab)) {
            setPendingTab(tab);
            setShowConfirm(true);
            return;
        }
        setActiveTabState(tab);
    };

    const confirmTabChange = () => {
        if (pendingTab) {
            // Force clean state logic if needed, but components should handle cleanup on unmount or we just switch
            // Ideally we tell the child to revert, but here we just switch away
            setIsRubricDirty(false);
            setIsTimelineDirty(false);
            allowNavigation('main-tabs');
            setActiveTabState(pendingTab);
        }
        setShowConfirm(false);
    };

    // Data States
    const [practicum, setPracticum] = useState<PracticumData | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch Practicum
                const { data: pracData, error: pracError } = await supabase
                    .from('practicums')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (pracError) throw pracError;
                setPracticum(pracData);

                // Fetch Enrollments (Basic)
                const { data: enrollDataRaw, error: enrollError } = await supabase
                    .from('practicum_enrollments')
                    .select('*')
                    .eq('practicum_id', id)
                    .neq('status', 'draft'); // Exclude incomplete applications

                if (enrollError) throw enrollError;

                // Manually fetch profiles since recursive relation might be missing in types
                let joinedEnrollments: Enrollment[] = [];
                if (enrollDataRaw) {
                    const studentIds = enrollDataRaw.map(e => e.student_id);
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('*')
                        .in('id', studentIds);

                    const profilesMap = new Map(profilesData?.map(p => [p.id, p]));

                    joinedEnrollments = enrollDataRaw.map(e => ({
                        ...e,
                        profiles: profilesMap.get(e.student_id) || null
                    })) as unknown as Enrollment[];
                }

                setEnrollments(joinedEnrollments);

            } catch (error: any) {
                console.error("Error fetching practicum data details:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    fullError: error
                });
                showToast("Failed to load practicum data: " + (error.message || "Unknown error"), "error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleCopyCode = async () => {
        if (!practicum?.invite_code) return;
        try {
            await navigator.clipboard.writeText(practicum.invite_code);
            setCopied(true);
            showToast('Invite code copied!', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            showToast('Failed to copy code.', 'error');
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8"><span className="text-slate-500 font-bold animate-pulse">Loading Practicum...</span></div>;
    if (!practicum) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8"><span className="text-slate-500 font-bold">Practicum not found.</span></div>;

    const pendingApprovals = enrollments.filter(e => e.status === 'pending').length;
    const activeStudents = enrollments.filter(e => e.status === 'approved').length;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto">
                <Link href="/instructor/practicums" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Back to Practicums</span>
                </Link>

                {/* Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="p-4 md:p-8 border-b border-slate-100 bg-white">
                        <div className="flex flex-col gap-3 animate-fade-in">
                            {/* Row 1: Title & Actions */}
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-2 min-w-0">
                                    <h1 className="text-xl md:text-3xl font-bold text-slate-900 flex items-center gap-2 truncate">
                                        <span className="truncate">
                                            <span className="text-emerald-600">{practicum.cohort_code}:</span> {practicum.title}
                                        </span>
                                    </h1>
                                    <button
                                        // onClick={() => setShowEditModal(true)} // TODO: Add Edit Modal
                                        className="hidden md:block p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shrink-0"
                                        title="Edit Practicum Data"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Desktop Actions */}
                                <div className="hidden md:flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => setIsRequestDialogOpen(true)}
                                        className="px-3 py-1.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 border shadow-sm bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100"
                                    >
                                        <Award className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="hidden md:inline">Request Reports</span>
                                    </button>

                                    <button
                                        onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                                        className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors md:hidden"
                                    >
                                        {isHeaderExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>

                                    <span className="px-3 py-1.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 border shadow-sm bg-emerald-50 text-emerald-600 border-emerald-100">
                                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="hidden md:inline">
                                            {new Date(practicum.start_date).toLocaleDateString()} - {new Date(practicum.end_date).toLocaleDateString()}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Row 2: Metadata (Collapsible) */}
                            {isHeaderExpanded && (
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-slate-500 font-medium animate-slide-in">
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span className="font-bold">{enrollments.length} Enrolled</span>
                                    </div>

                                    <button
                                        onClick={handleCopyCode}
                                        className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition-all group relative"
                                        title="Copy Invite Code"
                                    >
                                        <span className="text-xs font-bold opacity-75 uppercase tracking-wider">CODE</span>
                                        <span className="font-mono font-bold select-all">{practicum.invite_code}</span>
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />}
                                    </button>

                                    <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs md:text-sm uppercase font-bold tracking-wider">
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        Template: {practicum.log_template.replace('_', ' ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-1 bg-slate-200/50 p-0.5 rounded-xl mb-8 w-full md:w-fit overflow-x-auto no-scrollbar">
                    {(['overview', 'enrollments', 'rubrics', 'resources', 'submissions', 'grades'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-none px-4 py-2.5 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Overview Tab (Dashboard) */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {/* Pending Approvals Card */}
                        <Card
                            onClick={() => setActiveTab('enrollments')} // Navigate to students for approval
                            className="hover:border-emerald-400 group flex flex-col justify-between relative"
                            hoverEffect
                        >
                            <div className="absolute top-4 right-4 text-slate-300 group-hover:text-emerald-500 transition-colors">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Users className="w-5 h-5" /></div>
                                <h3 className="font-bold text-slate-700 group-hover:text-emerald-700">Pending Approvals</h3>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-black text-slate-900">{pendingApprovals}</p>
                                <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Students Waiting</p>
                            </div>
                        </Card>

                        {/* Submissions Stats */}
                        <Card
                            // onClick={() => setShowSubmissionsModal(true)} // TODO
                            className="hover:border-blue-400 group flex flex-col justify-between relative"
                            hoverEffect
                        >
                            <div className="absolute top-4 right-4 text-slate-300 group-hover:text-blue-500 transition-colors">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Clock className="w-5 h-5" /></div>
                                <h3 className="font-bold text-slate-700 group-hover:text-blue-700">Recent Logs</h3>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-black text-slate-900">0</p>
                                <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Unverified Entries</p>
                            </div>
                        </Card>

                        {/* Timeline Editor */}
                        <div className="md:col-span-2 lg:col-span-3">
                            <TimelineEditor
                                practicumId={id}
                                initialConfig={practicum.timeline as any}
                                startDate={practicum.start_date}
                                endDate={practicum.end_date}
                                cohortTitle={practicum.title}
                                logInterval={practicum.log_interval as 'daily' | 'weekly'}
                                onDirtyChange={(dirty) => handleDirtyChange('overview', dirty)}
                                onUpdate={handleTimelineUpdate}
                            />
                        </div>
                    </div>
                )}

                {/* Enrollments Tab */}
                {activeTab === 'enrollments' && (
                    <EnrollmentsTab
                        practicumId={id}
                        initialEnrollments={enrollments}
                    />
                )}

                {/* Rubrics Tab */}
                {activeTab === 'rubrics' && (
                    <div className="animate-fade-in">
                        <RubricsManager
                            practicumId={id}
                            // Default to system standards if not customized in DB
                            logsRubric={(practicum.logs_rubric as any) || LOGS_ASSESSMENT_RUBRIC}
                            supervisorRubric={
                                (practicum.supervisor_report_template as any) ||
                                (practicum.log_template === 'industrial_attachment'
                                    ? INDUSTRIAL_ATTACHMENT_OBSERVATION_GUIDE
                                    : TEACHING_PRACTICE_OBSERVATION_GUIDE)
                            }
                            reportRubric={(practicum.student_report_template as any) || PRACTICUM_REPORT_SCORE_SHEET}
                            onDirtyStateChange={(dirty) => handleDirtyChange('rubrics', dirty)}
                            onUpdate={handleRubricsUpdate}
                        />
                    </div>
                )}

                {/* Resources Tab Stub */}
                {activeTab === 'resources' && (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 border-dashed text-center animate-fade-in">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Practicum Resources</h3>
                        <p className="text-slate-500 max-w-md mx-auto">Share documents, syllabi, and guides with your students.</p>
                        <p className="mt-4 text-xs font-mono bg-slate-100 inline-block px-2 py-1 rounded text-slate-500">Coming Soon</p>
                    </div>
                )}

                {/* Submissions Tab */}
                {activeTab === 'submissions' && (
                    <SubmissionsManager
                        practicumId={id}
                        practicum={practicum}
                    />
                )}

                {/* Grades Tab */}
                {activeTab === 'grades' && (
                    <PracticumGradesTab practicum={practicum} />
                )}
            </div>

            <RequestReportDialog
                isOpen={isRequestDialogOpen}
                onClose={() => setIsRequestDialogOpen(false)}
                enrollments={enrollments}
                practicumId={id}
            />

            <ConfirmDialog
                isOpen={showConfirm}
                title="Unsaved Changes"
                message="You have unsaved changes in this tab. Switching tabs will verify or discard them."
                strConfirm="Discard Changes"
                strCancel="Stay Here"
                variant="danger"
                onConfirm={confirmTabChange}
                onCancel={() => setShowConfirm(false)}
            />
        </div >
    );
}
