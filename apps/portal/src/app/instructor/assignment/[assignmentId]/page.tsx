'use client';

import { useEffect, useState, use, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, FileText, CheckCircle, Clock, Pencil, Save, X, Maximize2, Minimize2, ChevronLeft, ChevronRight, Bot, History, AlertTriangle, Sparkles } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Database } from '@/lib/database.types';
import TAInsightsModal from '@/components/instructor/TAInsightsModal';
import RubricComponent from '@/components/RubricComponent';

type SubmissionWithProfile = Database['public']['Tables']['submissions']['Row'] & {
    profiles: {
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
        registration_number: string | null;
    } | null;
};

type AssignmentDetails = Database['public']['Tables']['assignments']['Row'] & {
    classes: {
        name: string;
    } | null;
    rubric: any; // specific type if possible, or jsonb
};

export default function GradingPageParams({ params }: { params: Promise<{ assignmentId: string }> }) {
    const { assignmentId } = use(params);
    return <GradingPage assignmentId={assignmentId} />
}

function GradingPage({ assignmentId }: { assignmentId: string }) {
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get('tab') as 'overview' | 'rubric' | 'submissions') || 'overview';
    const { showToast } = useToast();

    const [submissions, setSubmissions] = useState<SubmissionWithProfile[]>([]);
    const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
    const [totalStudents, setTotalStudents] = useState(0);
    const [loading, setLoading] = useState(true);

    // Grading State
    const [selectedSub, setSelectedSub] = useState<SubmissionWithProfile | null>(null);
    const [grade, setGrade] = useState<number | ''>('');
    const [feedback, setFeedback] = useState('');
    const [saving, setSaving] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isGradingFormVisible, setIsGradingFormVisible] = useState(true);
    const [sortBy, setSortBy] = useState<'recent' | 'ai_score'>('recent');
    const [filterStatus, setFilterStatus] = useState<'all' | 'graded' | 'ungraded' | 'late'>('all');

    // TA Assistant State
    const [showTAModal, setShowTAModal] = useState(false);
    const [instructorName, setInstructorName] = useState('');

    // Navigation Helpers
    const currentIndex = submissions.findIndex(s => s.id === selectedSub?.id);
    const hasNext = currentIndex !== -1 && currentIndex < submissions.length - 1;
    const hasPrev = currentIndex !== -1 && currentIndex > 0;

    const handleNext = () => {
        if (hasNext) {
            const next = submissions[currentIndex + 1];
            setSelectedSub(next);
            setGrade(next.grade ?? '');
            setFeedback(next.feedback || '');
        }
    }

    const sortedSubmissions = useMemo(() => {
        const filtered = submissions.filter(s => {
            if (filterStatus === 'all') return true;
            if (filterStatus === 'graded') return s.grade !== null;
            if (filterStatus === 'ungraded') return s.grade === null;
            if (filterStatus === 'late') {
                const dueDate = assignment?.due_date ? new Date(assignment.due_date).getTime() : 0;
                return new Date(s.created_at).getTime() > dueDate;
            }
            return true;
        });

        return [...filtered].sort((a, b) => {
            if (sortBy === 'recent') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (sortBy === 'ai_score') {
                return (b.ai_score || 0) - (a.ai_score || 0);
            }
            return 0;
        });
    }, [submissions, sortBy, assignment, filterStatus]);

    const handlePrev = () => {
        if (hasPrev) {
            const prev = submissions[currentIndex - 1];
            setSelectedSub(prev);
            setGrade(prev.grade ?? '');
            setFeedback(prev.feedback || '');
        }
    };

    const handleExitFullScreen = () => {
        setIsFullScreen(false);
    };

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', due_date: '', max_points: 100 });

    const [activeTab, setActiveTab] = useState<'overview' | 'rubric' | 'submissions'>(initialTab);

    useEffect(() => {
        fetchData();
    }, [assignmentId]);

    const fetchData = async () => {
        try {
            // 1. Fetch Assignment & Submissions
            const [assignRes, subRes] = await Promise.all([
                supabase.from('assignments').select('*, classes(name)').eq('id', assignmentId).single(),
                supabase.from('submissions')
                    .select('*, profiles(full_name, email, avatar_url, registration_number)')
                    .eq('assignment_id', assignmentId)
                    .order('created_at', { ascending: false })
            ]);

            if (assignRes.data) {
                setAssignment(assignRes.data);
                setEditForm({
                    title: assignRes.data.title,
                    description: assignRes.data.description || '',
                    due_date: assignRes.data.due_date ? new Date(assignRes.data.due_date).toISOString().slice(0, 16) : '',
                    max_points: assignRes.data.max_points
                });

                // 2. Fetch Enrollment Count (Total Students)
                const { count } = await supabase
                    .from('enrollments')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_id', assignRes.data.class_id);

                setTotalStudents(count || 0);

                // 3. Fetch Current Instructor Name
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                    if (profile?.full_name) setInstructorName(profile.full_name);
                }
            }
            if (subRes.data) setSubmissions(subRes.data as unknown as SubmissionWithProfile[]);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSub || grade === '') return;
        setSaving(true);

        try {
            // 1. Update Submission
            const { error } = await supabase
                .from('submissions')
                .update({
                    grade: Number(grade),
                    feedback: feedback
                })
                .eq('id', selectedSub.id);

            if (error) throw error;

            // 2. Create Notification
            await supabase.from('notifications').insert([{
                user_id: selectedSub.student_id,
                type: 'grade_posted',
                message: `Your assignment "${assignment?.title}" has been graded: ${grade}/${assignment?.max_points}`,
                link: `/student/result/${selectedSub.id}`
            }]);

            // Update local state
            setSubmissions(submissions.map(s => s.id === selectedSub.id ? { ...s, grade: Number(grade), feedback } : s));
            setSelectedSub(null);
            showToast('Grade Saved!', 'success');

        } catch (err: any) {
            showToast("Error saving grade: " + err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data, error } = await supabase
                .from('assignments')
                .update({
                    title: editForm.title,
                    description: editForm.description,
                    due_date: editForm.due_date ? new Date(editForm.due_date).toISOString() : null,
                    max_points: editForm.max_points
                })
                .eq('id', assignmentId)
                .select()
                .single();

            if (error) throw error;

            setAssignment({ ...assignment!, ...data });
            setIsEditing(false); // Close Modal on success
            showToast('Assignment Updated!', 'success');
        } catch (error: any) {
            showToast("Error updating assignment: " + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-slate-500 font-bold">Loading Submissions...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 flex flex-col items-center">
            <div className="max-w-6xl w-full animate-fade-in">
                <Link href={`/instructor/class/${assignment?.class_id}?tab=assignments`} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Assignments
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    {/* Header & Tabs */}
                    <div className="p-4 md:p-8 pb-0 border-b border-slate-100 bg-white">
                        <div className="flex justify-between items-start mb-4 md:mb-6">
                            <div>
                                <h1 className="text-lg md:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2 md:gap-3">
                                    <span className="truncate max-w-[220px] md:max-w-none">{assignment?.title}</span>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-1 md:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all shrink-0"
                                        title="Edit Assignment"
                                    >
                                        <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-slate-500 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        Due: {assignment?.due_date ? new Date(assignment.due_date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'No Due Date'}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        {assignment?.max_points} Points
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'overview', label: 'Overview', icon: FileText },
                                { id: 'rubric', label: 'Rubric', icon: Sparkles },
                                { id: 'submissions', label: 'Submissions', icon: CheckCircle }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`pb-3 md:pb-4 border-b-2 font-bold text-xs md:text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-slate-50/30 min-h-[500px]">

                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="p-6 md:p-8 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="col-span-2 space-y-8">
                                        <section>
                                            <h3 className="font-bold text-slate-900 mb-4 text-base md:text-lg">Description</h3>
                                            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                                                {assignment?.description || "No description provided."}
                                            </div>
                                        </section>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                            <h3 className="font-bold text-slate-900 mb-4 text-base md:text-lg">Class Stats</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-500 font-medium text-xs md:text-sm">Submitted</span>
                                                    <span className="font-bold text-slate-900 text-sm md:text-base">{submissions.length} / {totalStudents}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-500 font-medium text-xs md:text-sm">Graded</span>
                                                    <span className="font-bold text-slate-900 text-sm md:text-base">{submissions.filter(s => s.grade !== null).length}</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${totalStudents > 0 ? (submissions.length / totalStudents) * 100 : 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* RUBRIC TAB */}
                        {activeTab === 'rubric' && (
                            <div className="p-8 animate-fade-in">
                                <div className="max-w-4xl mx-auto">
                                    <RubricComponent
                                        rubric={assignment?.rubric}
                                        isEditable={true}
                                        assignmentId={assignmentId}
                                        maxPoints={assignment?.max_points}
                                        onUpdate={() => fetchData()}
                                        title={assignment?.title}
                                        description={assignment?.description || ''}
                                    />
                                </div>
                            </div>
                        )}

                        {/* SUBMISSIONS TAB */}
                        {activeTab === 'submissions' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 h-[600px] animate-fade-in">
                                {/* List Column */}
                                <div className={`col-span-1 overflow-y-auto bg-white ${selectedSub ? 'hidden md:block' : 'block'}`}>
                                    {/* Sort Controls */}
                                    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm p-4 border-b border-slate-100 flex items-center gap-3 overflow-x-auto no-scrollbar">
                                        {/* Filter Dropdown */}
                                        <div className="relative">
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                                className="appearance-none bg-slate-100 text-slate-700 text-xs font-bold py-2 pl-3 pr-8 rounded-xl border border-transparent hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                            >
                                                <option value="all">All</option>
                                                <option value="graded">Graded</option>
                                                <option value="ungraded">Ungraded</option>
                                                <option value="late">Late</option>
                                            </select>
                                            <ChevronLeft className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 rotate-[-90deg] text-slate-500 pointer-events-none" />
                                        </div>

                                        <div className="h-6 w-px bg-slate-200 flex-shrink-0 mx-1"></div>

                                        {/* Sort Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSortBy('recent')}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${sortBy === 'recent' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                <Clock className="w-3.5 h-3.5" /> Recent
                                            </button>
                                            <button
                                                onClick={() => setSortBy('ai_score')}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${sortBy === 'ai_score' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                <Bot className="w-3.5 h-3.5" /> AI Score
                                            </button>
                                        </div>
                                    </div>
                                    {sortedSubmissions.map((sub, index) => {
                                        const isLate = assignment?.due_date && new Date(sub.created_at) > new Date(assignment.due_date);
                                        return (
                                            <button
                                                key={sub.id}
                                                onClick={() => {
                                                    setSelectedSub(sub);
                                                    setGrade(sub.grade ?? '');
                                                    setFeedback(sub.feedback || '');
                                                    // On mobile, auto-show form if graded, else hide
                                                    setIsGradingFormVisible(!sub.grade);
                                                }}
                                                className={`w-full text-left p-3 md:p-4 border-b border-slate-100 hover:bg-slate-50 transition-all ${selectedSub?.id === sub.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600 pl-2 md:pl-3' : 'border-l-4 border-l-transparent'}`}
                                            >
                                                <div className="flex justify-between items-start mb-1 gap-2">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <span className="text-slate-400 font-mono text-xs md:text-sm pt-0.5 flex-shrink-0">
                                                            {(index + 1).toString().padStart(2, '0')}.
                                                        </span>
                                                        <div className="flex items-center gap-1 min-w-0 font-bold text-slate-900 text-sm md:text-base truncate leading-tight">
                                                            {sub.profiles?.registration_number ? (
                                                                <>
                                                                    <span className="text-slate-700 whitespace-nowrap text-xs md:text-sm">{sub.profiles.registration_number}</span>
                                                                    <span className="text-slate-400 font-normal">:</span>
                                                                    <span className="truncate">{sub.profiles.full_name || 'Unknown'}</span>
                                                                </>
                                                            ) : (
                                                                <span>{sub.profiles?.full_name || 'Anonymous'}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex-shrink-0">
                                                        {sub.grade !== null ? (
                                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] md:text-sm font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg border border-emerald-200 whitespace-nowrap block">
                                                                {sub.grade} / {assignment?.max_points}
                                                            </span>
                                                        ) : (
                                                            <span className="bg-slate-100 text-slate-500 text-[10px] md:text-sm font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg border border-slate-200 whitespace-nowrap block">
                                                                Ungraded
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-end pl-6 md:pl-8">
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                        <span className="text-[10px] md:text-sm text-slate-500 flex items-center gap-1 font-medium">
                                                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                                            {new Date(sub.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>

                                                        {isLate && (
                                                            <span className="flex items-center gap-1 bg-orange-50 text-orange-700 text-[10px] md:text-sm px-1.5 py-0.5 rounded border border-orange-200 font-semibold">
                                                                <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" /> Late
                                                            </span>
                                                        )}

                                                        {sub.ai_score !== null && sub.ai_score !== undefined && (
                                                            <span className={`flex items-center gap-1 text-[10px] md:text-sm px-1.5 py-0.5 rounded border font-semibold ${sub.ai_score > 70 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                                                <Bot className="w-3 h-3 md:w-4 md:h-4" /> {sub.ai_score.toFixed(0)}% AI
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Navigation Arrow */}
                                                    <div className="text-slate-300">
                                                        <ChevronRight className="w-4 h-4 md:hidden" />
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                    {submissions.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 text-sm">No submissions yet.</div>
                                    )}
                                </div>

                                {/* Grading Column */}
                                <FullScreenPortal isFullScreen={isFullScreen}>
                                    <div
                                        className={`
                                        ${isFullScreen ? 'fixed inset-0 z-[9999] md:left-64 md:z-40 bg-slate-50 flex flex-col' : 'col-span-2 p-4 md:p-8 bg-slate-50/30 overflow-y-auto'}
                                        ${selectedSub ? 'block' : 'hidden md:block'}
                                        transition-all duration-300
                                    `}>
                                        {selectedSub ? (
                                            <div className={`space-y-6 ${isFullScreen ? 'h-full flex flex-col p-2 md:p-6' : ''}`}>
                                                {/* Grading Header (Controls & Navigation) */}
                                                <div className="flex flex-row items-center justify-between gap-2 md:gap-4 border-b border-slate-200 pb-2 md:pb-4 mb-2 md:mb-4">

                                                    {/* Left: Student Info & Mobile Back */}
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <button
                                                            onClick={() => setSelectedSub(null)}
                                                            className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-slate-700"
                                                        >
                                                            <ArrowLeft className="w-5 h-5" />
                                                        </button>
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <h2 className="text-sm md:text-lg font-bold text-slate-900 flex items-center gap-2 truncate">
                                                                {selectedSub.profiles?.registration_number || selectedSub.profiles?.full_name}
                                                                {selectedSub?.ai_score !== null && selectedSub?.ai_score !== undefined && (
                                                                    <span className={`text-[10px] md:text-sm px-2 py-0.5 md:px-3 md:py-1 rounded-full border font-bold ${selectedSub.ai_score > 70 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                                        AI: {selectedSub.ai_score.toFixed(0)}%
                                                                    </span>
                                                                )}
                                                            </h2>
                                                        </div>
                                                    </div>

                                                    {/* Right: Navigation & Toggles */}
                                                    <div className="flex items-center justify-end gap-1.5 shrink-0">
                                                        {/* Navigation Arrows */}
                                                        <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm">
                                                            <button
                                                                onClick={handlePrev}
                                                                disabled={!hasPrev}
                                                                className="p-1.5 md:p-2.5 text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-500 border-r border-slate-100 transition-colors"
                                                                title="Previous Student"
                                                            >
                                                                <ChevronLeft className="w-4 h-4" />
                                                            </button>
                                                            <span className="text-xs font-bold text-slate-400 px-2 hidden md:block">
                                                                {currentIndex + 1} / {submissions.length}
                                                            </span>
                                                            <button
                                                                onClick={handleNext}
                                                                disabled={!hasNext}
                                                                className="p-1.5 md:p-2.5 text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-500 border-l border-slate-100 transition-colors"
                                                                title="Next Student"
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        {/* Generate TA Insight Button - Magic Border Effect */}
                                                        <button
                                                            onClick={() => setShowTAModal(true)}
                                                            className="relative inline-flex h-8 md:h-10 overflow-hidden rounded-lg p-[1px] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-50 shadow-sm"
                                                        >
                                                            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#6366f1_50%,#f59e0b_60%,#E2E8F0_100%)]" />
                                                            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-white px-3 py-1 text-[10px] md:text-sm font-bold text-indigo-600 backdrop-blur-3xl gap-1.5 transition-all hover:bg-indigo-50/50">
                                                                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-500 fill-indigo-100" />
                                                                <span className="hidden sm:inline">Generate TA Insight</span>
                                                                <span className="sm:hidden">TA Insight</span>
                                                            </span>
                                                        </button>

                                                        {/* View Report - Desktop Only */}
                                                        <Link href={`/instructor/submission/${selectedSub.id}`} target="_blank" className="hidden md:flex items-center gap-1.5 px-2 py-1.5 md:px-5 md:py-2.5 text-slate-500 bg-white hover:bg-slate-50 hover:text-indigo-600 rounded-lg font-bold text-[10px] md:text-sm transition-colors border border-slate-200 whitespace-nowrap" title="View Report">
                                                            <FileText className="w-3 h-3 md:w-5 md:h-5" /> View Report
                                                        </Link>

                                                        {/* Full Screen Toggle */}
                                                        <button
                                                            onClick={() => setIsFullScreen(!isFullScreen)}
                                                            className="flex p-1.5 md:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                                            title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
                                                        >
                                                            {isFullScreen ? <Minimize2 className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Content Area */}
                                                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                                                    {/* Text Content */}
                                                    <div className={`bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm overflow-y-auto font-serif text-slate-700 leading-relaxed text-sm md:text-base ${isFullScreen ? 'flex-1' : 'max-h-[500px]'}`}>
                                                        {selectedSub.content}
                                                    </div>

                                                    {/* Grading Form */}
                                                    {/* Grading Form */}
                                                    <div className="w-full transition-all duration-300">
                                                        {/* Mobile Toggle Bar */}
                                                        <div className="flex md:hidden w-full items-center justify-between p-3 bg-slate-100 rounded-t-xl border border-slate-200 border-b-0">
                                                            <button
                                                                onClick={() => setIsGradingFormVisible(!isGradingFormVisible)}
                                                                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                                                            >
                                                                <CheckCircle className="w-4 h-4 text-indigo-600" /> Grade & Feedback
                                                            </button>

                                                            <div className="flex items-center gap-3">
                                                                <Link
                                                                    href={`/instructor/submission/${selectedSub.id}`}
                                                                    target="_blank"
                                                                    className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm"
                                                                >
                                                                    <FileText className="w-3 h-3" /> View AI Report
                                                                </Link>
                                                                <button
                                                                    onClick={() => setIsGradingFormVisible(!isGradingFormVisible)}
                                                                    className="text-indigo-600 text-xs font-bold tracking-wide hover:text-indigo-800"
                                                                >
                                                                    {isGradingFormVisible ? 'Hide' : 'Show'}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Form Container */}
                                                        <div className={`${isGradingFormVisible ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'} transition-all duration-300 md:max-h-none md:opacity-100`}>
                                                            <form onSubmit={handleSaveGrade} className="bg-white p-3 md:p-6 rounded-b-xl md:rounded-2xl border border-indigo-100 shadow-lg ring-2 md:ring-4 ring-indigo-50/50">

                                                                {/* Form Header */}
                                                                <div className="hidden md:flex justify-between items-center mb-4">
                                                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                                        <CheckCircle className="w-5 h-5 text-indigo-600" /> Grade & Feedback
                                                                    </h3>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4">
                                                                    <div className="col-span-1">
                                                                        <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-0.5 md:mb-1">Score</label>
                                                                        <input
                                                                            type="number"
                                                                            max={assignment?.max_points || 100}
                                                                            value={grade}
                                                                            onChange={e => setGrade(Number(e.target.value))}
                                                                            className="w-full p-2 md:p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-bold text-base md:text-lg text-center"
                                                                        />
                                                                    </div>
                                                                    <div className="col-span-3">
                                                                        <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-0.5 md:mb-1">Feedback</label>
                                                                        <textarea
                                                                            value={feedback}
                                                                            maxLength={500}
                                                                            onChange={e => setFeedback(e.target.value)}
                                                                            onInput={(e) => {
                                                                                e.currentTarget.style.height = 'auto';
                                                                                e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                                                            }}
                                                                            placeholder="Great work..."
                                                                            rows={1}
                                                                            className="w-full p-2 md:p-3 text-sm md:text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none overflow-hidden min-h-[42px] max-h-[150px]"
                                                                        />
                                                                        <div className="text-right text-[10px] md:text-xs text-slate-400 mt-1 font-mono">
                                                                            {feedback.length}/500
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-end gap-3">
                                                                    <button disabled={saving} className="bg-indigo-600 text-white px-4 py-2.5 md:px-8 md:py-2 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70 w-full md:w-auto text-xs md:text-base">
                                                                        {saving ? 'Saving...' : 'Save Grade'}
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                    <ArrowLeft className="w-8 h-8 opacity-50" />
                                                </div>
                                                <p className="font-medium">Select a student from the list to start grading.</p>
                                            </div>
                                        )}
                                    </div>
                                </FullScreenPortal>
                            </div>
                        )}
                    </div>
                </div>



                {/* EDIT MODAL */}
                {isEditing && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-xl text-slate-800">Edit Assignment</h3>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto">
                                <form onSubmit={handleUpdateAssignment} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                            <input
                                                value={editForm.title}
                                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Date</label>
                                            <input
                                                type="datetime-local"
                                                value={editForm.due_date}
                                                onChange={e => setEditForm({ ...editForm, due_date: e.target.value })}
                                                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                            <textarea
                                                value={editForm.description}
                                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                className="w-full p-3 border border-slate-300 rounded-xl h-32 outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Points</label>
                                            <input
                                                type="number"
                                                value={editForm.max_points}
                                                onChange={e => setEditForm({ ...editForm, max_points: Number(e.target.value) })}
                                                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-4 mt-4 pt-6 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-2.5 text-slate-500 hover:text-slate-800 font-bold transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button disabled={saving} className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2">
                                                <Save className="w-4 h-4" /> Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
                {/* EDIT MODAL */}
                {isEditing && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-xl text-slate-800">Edit Assignment</h3>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto">
                                <form onSubmit={handleUpdateAssignment} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                            <input
                                                value={editForm.title}
                                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Date</label>
                                            <input
                                                type="datetime-local"
                                                value={editForm.due_date}
                                                onChange={e => setEditForm({ ...editForm, due_date: e.target.value })}
                                                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                            <textarea
                                                value={editForm.description}
                                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                className="w-full p-3 border border-slate-300 rounded-xl h-32 outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Points</label>
                                            <input
                                                type="number"
                                                value={editForm.max_points}
                                                onChange={e => setEditForm({ ...editForm, max_points: Number(e.target.value) })}
                                                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-4 mt-4 pt-6 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-2.5 text-slate-500 hover:text-slate-800 font-bold transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button disabled={saving} className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2">
                                                <Save className="w-4 h-4" /> Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* TA Assistant Modal */}
                {assignment && selectedSub && (
                    <TAInsightsModal
                        isOpen={showTAModal}
                        onClose={() => setShowTAModal(false)}
                        className={assignment.classes?.name || 'Unknown Class'}
                        assignmentTitle={assignment.title}
                        instructions={assignment.description || 'No instructions provided.'}
                        submissionText={selectedSub.content || ''}
                        aiScore={selectedSub.ai_score || 0}
                        maxPoints={assignment.max_points}
                        studentName={selectedSub.profiles?.registration_number || selectedSub.profiles?.full_name || 'Student'}
                        instructorName={instructorName || 'Your Instructor'}
                        rubric={assignment.rubric}
                    />
                )}
            </div>
        </div>
    );
}

function FullScreenPortal({ children, isFullScreen }: { children: React.ReactNode; isFullScreen: boolean }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isFullScreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isFullScreen]);

    if (isFullScreen && mounted) {
        return createPortal(children, document.body);
    }

    return <>{children}</>;
}
