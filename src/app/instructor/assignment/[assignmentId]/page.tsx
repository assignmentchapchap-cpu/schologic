'use client';

import { useEffect, useState, use } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, FileText, CheckCircle, Clock, Pencil, Save, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Database } from '@/lib/database.types';

type SubmissionWithProfile = Database['public']['Tables']['submissions']['Row'] & {
    profiles: {
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
    } | null;
};

type AssignmentDetails = Database['public']['Tables']['assignments']['Row'] & {
    classes: {
        name: string;
    } | null;
};

export default function GradingPageParams({ params }: { params: Promise<{ assignmentId: string }> }) {
    const { assignmentId } = use(params);
    return <GradingPage assignmentId={assignmentId} />
}

function GradingPage({ assignmentId }: { assignmentId: string }) {
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get('tab') as 'overview' | 'submissions') || 'overview';

    const [submissions, setSubmissions] = useState<SubmissionWithProfile[]>([]);
    const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
    const [totalStudents, setTotalStudents] = useState(0);
    const [loading, setLoading] = useState(true);

    // Grading State
    const [selectedSub, setSelectedSub] = useState<SubmissionWithProfile | null>(null);
    const [grade, setGrade] = useState<number | ''>('');
    const [feedback, setFeedback] = useState('');
    const [saving, setSaving] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', due_date: '', max_points: 100 });

    const [activeTab, setActiveTab] = useState<'overview' | 'submissions'>(initialTab);

    useEffect(() => {
        fetchData();
    }, [assignmentId]);

    const fetchData = async () => {
        try {
            // 1. Fetch Assignment & Submissions
            const [assignRes, subRes] = await Promise.all([
                supabase.from('assignments').select('*, classes(name)').eq('id', assignmentId).single(),
                supabase.from('submissions')
                    .select('*, profiles(full_name, email, avatar_url)')
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
            alert("Grade Saved!");

        } catch (err: any) {
            alert("Error saving grade: " + err.message);
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
            alert("Assignment Updated!");
        } catch (error: any) {
            alert("Error updating assignment: " + error.message);
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
                    <div className="p-8 pb-0 border-b border-slate-100 bg-white">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                                    {assignment?.title}
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                                        title="Edit Assignment"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                </h1>
                                <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Due: {assignment?.due_date ? new Date(assignment.due_date).toLocaleString() : 'No Due Date'}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        {assignment?.max_points} Points
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-8">
                            {[
                                { id: 'overview', label: 'Overview', icon: FileText },
                                { id: 'submissions', label: 'Submissions', icon: CheckCircle }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`pb-4 border-b-2 font-bold text-sm flex items-center gap-2 transition-colors ${activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-slate-50/30 min-h-[500px]">

                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="p-8 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="col-span-2 space-y-8">
                                        <section>
                                            <h3 className="font-bold text-slate-900 mb-4 text-lg">Description</h3>
                                            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                {assignment?.description || "No description provided."}
                                            </div>
                                        </section>
                                    </div>
                                    <div className="col-span-1 space-y-6">
                                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                            <h3 className="font-bold text-slate-900 mb-4">Class Stats</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-500 font-medium text-sm">Submitted</span>
                                                    <span className="font-bold text-slate-900">{submissions.length} / {totalStudents}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-500 font-medium text-sm">Graded</span>
                                                    <span className="font-bold text-slate-900">{submissions.filter(s => s.grade !== null).length}</span>
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

                        {/* SUBMISSIONS TAB */}
                        {activeTab === 'submissions' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 h-[600px] animate-fade-in">
                                {/* List Column */}
                                <div className="col-span-1 overflow-y-auto bg-white">
                                    {submissions.map(sub => (
                                        <button
                                            key={sub.id}
                                            onClick={() => {
                                                setSelectedSub(sub);
                                                setGrade(sub.grade ?? '');
                                                setFeedback(sub.feedback || '');
                                            }}
                                            className={`w-full text-left p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 ${selectedSub?.id === sub.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
                                        >
                                            <h4 className="font-bold text-slate-800 text-sm mb-1">{sub.profiles?.full_name || 'Unknown'}</h4>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">{new Date(sub.created_at).toLocaleDateString()}</span>
                                                {sub.grade !== null ? (
                                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{sub.grade} pts</span>
                                                ) : (
                                                    <span className="font-bold text-slate-400">Not Graded</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                    {submissions.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 text-sm">No submissions yet.</div>
                                    )}
                                </div>

                                {/* Grading Column */}
                                <div className="col-span-2 p-8 bg-slate-50/30 overflow-y-auto">
                                    {selectedSub ? (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-900">{selectedSub.profiles?.full_name}</h2>
                                                    <p className="text-sm text-slate-500 font-mono">{selectedSub.profiles?.email}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className={`px-3 py-1 rounded-full text-sm font-bold border ${selectedSub.ai_score! > 70 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                        AI Score: {selectedSub.ai_score?.toFixed(1)}%
                                                    </div>
                                                    <Link href={`/instructor/submission/${selectedSub.id}`} target="_blank" className="text-indigo-600 hover:underline text-sm font-bold flex items-center gap-1">
                                                        <FileText className="w-4 h-4" /> Full Report
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-h-96 overflow-y-auto font-serif text-slate-700 leading-chill">
                                                {selectedSub.content}
                                            </div>

                                            <form onSubmit={handleSaveGrade} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-lg ring-4 ring-indigo-50/50">
                                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                    <CheckCircle className="w-5 h-5 text-indigo-600" /> Grade & Feedback
                                                </h3>
                                                <div className="grid grid-cols-4 gap-4 mb-4">
                                                    <div className="col-span-1">
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Score</label>
                                                        <input
                                                            type="number"
                                                            max={assignment?.max_points || 100}
                                                            value={grade}
                                                            onChange={e => setGrade(Number(e.target.value))}
                                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-bold text-lg text-center"
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Feedback</label>
                                                        <input
                                                            type="text"
                                                            value={feedback}
                                                            onChange={e => setFeedback(e.target.value)}
                                                            placeholder="Great work, but watch out for..."
                                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end">
                                                    <button disabled={saving} className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70">
                                                        {saving ? 'Saving...' : 'Save Grade'}
                                                    </button>
                                                </div>
                                            </form>
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
            </div>
        </div>
    );
}
