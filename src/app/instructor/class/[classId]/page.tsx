'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase';
import { FileText, Download, Lock, Unlock, ArrowLeft, Users, Calendar, Plus, Trash2, Clock, CheckCircle, Settings, Brain, Save, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { Database } from '@/lib/database.types';
import { MODELS, MODEL_LABELS, ScoringMethod, Granularity } from '@/lib/ai-config';
import { isDateBetween, isDateAfter } from '@/lib/date-utils';

type ClassData = Database['public']['Tables']['classes']['Row'];
type Assignment = Database['public']['Tables']['assignments']['Row'];
type EnrollmentProfile = {
    id: string;
    student_id: string;
    joined_at: string;
    profiles: {
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
    } | null; // Join result
};

export default function ClassDetailsParams({ params }: { params: Promise<{ classId: string }> }) {
    const { classId } = use(params);
    return <ClassDetails classId={classId} />
}

import { useSearchParams } from 'next/navigation';

function ClassDetails({ classId }: { classId: string }) {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') as 'overview' | 'assignments' | 'resources' | 'students' | 'submissions' || 'overview';

    // ...

    // Data States
    const [classData, setClassData] = useState<ClassData | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [enrollments, setEnrollments] = useState<EnrollmentProfile[]>([]);
    const [resources, setResources] = useState<any[]>([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'resources' | 'students' | 'submissions'>(initialTab);
    const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
    const [dueDateError, setDueDateError] = useState<string | null>(null);

    // Form States
    const [newAssignment, setNewAssignment] = useState<{
        id?: string;
        title: string;
        description: string;
        due_date: string;
        max_points: number;
    }>({ title: '', description: '', due_date: '', max_points: 100 });
    const [isCreatingResource, setIsCreatingResource] = useState(false);
    const [newResource, setNewResource] = useState({ title: '', content: '', file_url: '' });

    // Settings State
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [globalSettings, setGlobalSettings] = useState<any>(null);
    const [settingsForm, setSettingsForm] = useState({
        model: MODELS.ROBERTA_LARGE,
        granularity: Granularity.PARAGRAPH,
        scoring_method: ScoringMethod.WEIGHTED,
        late_policy: 'strict',
        allowed_file_types: ['txt', 'docx']
    });
    const [isOverriding, setIsOverriding] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, [classId]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [clsRes, assignRes, enrollRes, resRes, profileRes] = await Promise.all([
                supabase.from('classes').select('*').eq('id', classId).single(),
                supabase.from('assignments').select('*').eq('class_id', classId).order('due_date', { ascending: true }),
                supabase.from('enrollments').select(`id, student_id, joined_at, profiles:student_id (full_name, email, avatar_url)`).eq('class_id', classId),
                supabase.from('class_resources').select('*').eq('class_id', classId).order('created_at', { ascending: false }),
                supabase.from('profiles').select('settings').eq('id', user.id).single()
            ]);

            if (clsRes.error) throw clsRes.error;

            setClassData(clsRes.data);

            // Handle Settings
            const global = profileRes.data?.settings as any || {};
            setGlobalSettings(global);

            if (clsRes.data.settings && typeof clsRes.data.settings === 'object') {
                const s = clsRes.data.settings as any;
                const hasKeys = Object.keys(s).some(k => ['model', 'late_policy', 'allowed_file_types', 'granularity', 'scoring_method'].includes(k));

                // Only consider it an override if it has keys AND is different from global (optional, but safer is just checking keys)
                // For now, strict key check. If even one key exists, it is an override.
                // NOTE: If the user sees this ON, it means they have saved settings previously.
                if (hasKeys) {
                    setIsOverriding(true);
                    setSettingsForm({
                        model: s.model || global.model || MODELS.ROBERTA_LARGE,
                        granularity: s.granularity || global.granularity || Granularity.PARAGRAPH,
                        scoring_method: s.scoring_method || global.scoring_method || ScoringMethod.WEIGHTED,
                        late_policy: s.late_policy || global.late_policy || 'strict',
                        allowed_file_types: s.allowed_file_types || global.allowed_file_types || ['txt', 'docx']
                    });
                } else {
                    setIsOverriding(false);
                    setSettingsForm({
                        model: global.model || MODELS.ROBERTA_LARGE,
                        granularity: global.granularity || Granularity.PARAGRAPH,
                        scoring_method: global.scoring_method || ScoringMethod.WEIGHTED,
                        late_policy: global.late_policy || 'strict',
                        allowed_file_types: global.allowed_file_types || ['txt', 'docx']
                    });
                }
            } else {
                // Inherit Globals (Data settings is null or not an object)
                setIsOverriding(false);
                setSettingsForm({
                    model: global.model || MODELS.ROBERTA_LARGE,
                    granularity: global.granularity || Granularity.PARAGRAPH,
                    scoring_method: global.scoring_method || ScoringMethod.WEIGHTED,
                    late_policy: global.late_policy || 'strict',
                    allowed_file_types: global.allowed_file_types || ['txt', 'docx']
                });
            }

            if (assignRes.data) setAssignments(assignRes.data);
            if (resRes.data) setResources(resRes.data);
            if (enrollRes.data) setEnrollments(enrollRes.data as unknown as EnrollmentProfile[]);

        } catch (error) {
            console.error("Error fetching class data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        setDueDateError(null);

        try {
            const assignmentData = {
                class_id: classId,
                title: newAssignment.title,
                description: newAssignment.description,
                due_date: newAssignment.due_date ? new Date(newAssignment.due_date).toISOString() : null,
                max_points: newAssignment.max_points
            };

            // Validation vs Class Dates
            if (newAssignment.due_date && classData) {
                if (classData.start_date && !isDateAfter(newAssignment.due_date, classData.start_date)) {
                    setDueDateError(`Due date must be after the class start date (${new Date(classData.start_date).toLocaleDateString()}).`);
                    return;
                }
                if (classData.end_date && isDateAfter(newAssignment.due_date, classData.end_date)) {
                    setDueDateError(`Due date cannot be after the class end date (${new Date(classData.end_date).toLocaleDateString()}).`);
                    return;
                }
            }

            let data;

            if (newAssignment.id) {
                // Update existing
                const { data: updated, error } = await supabase
                    .from('assignments')
                    .update(assignmentData)
                    .eq('id', newAssignment.id)
                    .select()
                    .single();

                if (error) throw error;

                setAssignments(assignments.map(a => a.id === updated.id ? updated : a));
                alert("Assignment Updated!");
            } else {
                // Create new
                const { data: created, error } = await supabase
                    .from('assignments')
                    .insert([assignmentData])
                    .select()
                    .single();

                if (error) throw error;
                setAssignments([...assignments, created]);
                alert("Assignment Created!");
            }

            setIsCreatingAssignment(false);
            setNewAssignment({ title: '', description: '', due_date: '', max_points: 100 });
        } catch (err: any) {
            alert("Error saving assignment: " + err.message);
        }
    };

    const handleCreateResource = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase.from('class_resources').insert([{
                class_id: classId,
                title: newResource.title,
                content: newResource.content,
                file_url: newResource.file_url,
                created_by: user.id
            }]).select().single();

            if (error) throw error;

            setResources([data, ...resources]);
            setIsCreatingResource(false);
            setNewResource({ title: '', content: '', file_url: '' });
            alert("Resource Added!");
        } catch (err: any) {
            alert("Error adding resource: " + err.message);
        }
    };


    const toggleLock = async () => {
        if (!classData) return;
        const newVal = !classData.is_locked;
        const { error } = await supabase.from('classes').update({ is_locked: newVal }).eq('id', classId);
        if (!error) {
            setClassData({ ...classData, is_locked: newVal });
        }
    };

    const saveSettings = async () => {
        setSavingSettings(true);
        try {
            const updatePayload = isOverriding ? settingsForm : null;

            const { error } = await supabase
                .from('classes')
                .update({ settings: updatePayload })
                .eq('id', classId);

            if (error) throw error;

            // Update local state to reflect inheritance if needed
            if (!isOverriding && globalSettings) {
                setSettingsForm({
                    model: globalSettings.model || MODELS.ROBERTA_LARGE,
                    granularity: globalSettings.granularity || Granularity.PARAGRAPH,
                    scoring_method: globalSettings.scoring_method || ScoringMethod.WEIGHTED,
                    late_policy: globalSettings.late_policy || 'strict',
                    allowed_file_types: globalSettings.allowed_file_types || ['txt', 'docx']
                });
            }

            setShowSettingsModal(false);
            alert("Class Settings Saved!");
        } catch (err) {
            console.error("Error saving settings", err);
            alert("Failed to save settings");
        } finally {
            setSavingSettings(false);
        }
    };

    const toggleFileType = (type: string) => {
        if (!isOverriding) return;
        setSettingsForm(prev => {
            const types = prev.allowed_file_types.includes(type)
                ? prev.allowed_file_types.filter(t => t !== type)
                : [...prev.allowed_file_types, type];
            return { ...prev, allowed_file_types: types };
        });
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8"><span className="text-slate-500 font-bold animate-pulse">Loading Class Data...</span></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <Link href="/instructor/classes" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Classes
                </Link>

                {/* Header */}
                <header className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-slate-900">{classData?.name}</h1>
                                {classData?.is_locked ? (
                                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Locked
                                    </span>
                                ) : (
                                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1">
                                        <Unlock className="w-3 h-3" /> Active
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Code</span>
                                    <span className="font-mono text-slate-900 font-bold">{classData?.invite_code}</span>
                                </span>
                                {classData?.start_date && (
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        {new Date(classData.start_date).toLocaleDateString()} - {classData.end_date ? new Date(classData.end_date).toLocaleDateString() : 'Ongoing'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowSettingsModal(true)}
                            className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            title="Class Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={toggleLock}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            {classData?.is_locked ? "Unlock Class" : "Lock Class"}
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl mb-8 w-fit flex-wrap">
                    {(['overview', 'assignments', 'resources', 'students', 'submissions'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Overview View */}
                {
                    activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users className="w-5 h-5" /></div>
                                    <h3 className="font-bold text-slate-700">Total Students</h3>
                                </div>
                                <p className="text-4xl font-black text-slate-900">{enrollments.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FileText className="w-5 h-5" /></div>
                                    <h3 className="font-bold text-slate-700">Assignments</h3>
                                </div>
                                <p className="text-4xl font-black text-slate-900">{assignments.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Download className="w-5 h-5" /></div>
                                    <h3 className="font-bold text-slate-700">Resources</h3>
                                </div>
                                <p className="text-4xl font-black text-slate-900">{resources.length}</p>
                            </div>
                        </div>
                    )
                }

                {/* Assignments View */}
                {
                    activeTab === 'assignments' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-800">Class Assignments</h2>
                                <button
                                    onClick={() => {
                                        setIsCreatingAssignment(true);
                                        setNewAssignment({ title: '', description: '', due_date: '', max_points: 100 });
                                    }}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
                                >
                                    <Plus className="w-4 h-4" /> Create Assignment
                                </button>
                            </div>

                            {isCreatingAssignment && (
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 ring-4 ring-indigo-50/50 mb-6">
                                    <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> {newAssignment.id ? 'Edit Assignment' : 'New Assignment'}
                                    </h3>
                                    <form onSubmit={handleCreateAssignment} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                                <input
                                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                                    placeholder="e.g. Midterm Essay"
                                                    value={newAssignment.title}
                                                    onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                                <textarea
                                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                                                    placeholder="Instructions for students..."
                                                    value={newAssignment.description}
                                                    onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Date</label>
                                                <input
                                                    type="datetime-local"
                                                    className={`w-full p-3 border rounded-xl focus:ring-2 outline-none text-slate-600 font-medium ${dueDateError ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-indigo-500'}`}
                                                    value={newAssignment.due_date}
                                                    onChange={e => {
                                                        setNewAssignment({ ...newAssignment, due_date: e.target.value });
                                                        if (dueDateError) setDueDateError(null);
                                                    }}
                                                />
                                                {dueDateError && (
                                                    <div className="flex items-start gap-1 mt-1 text-red-500 animate-fade-in">
                                                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                        <span className="text-xs font-medium">{dueDateError}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Points</label>
                                                <input
                                                    type="number"
                                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                                    value={newAssignment.max_points}
                                                    onChange={e => setNewAssignment({ ...newAssignment, max_points: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCreatingAssignment(false);
                                                    setNewAssignment({ title: '', description: '', due_date: '', max_points: 100 });
                                                }}
                                                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg">
                                                {newAssignment.id ? 'Update' : 'Publish'} Assignment
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="grid gap-4">
                                {assignments.map(assign => (
                                    <div key={assign.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all group shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">{assign.title}</h3>
                                                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{assign.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</span>
                                                <span className={`block font-mono text-sm font-bold ${new Date(assign.due_date!) < new Date() ? 'text-red-500' : 'text-emerald-600'}`}>
                                                    {assign.due_date ? new Date(assign.due_date).toLocaleDateString() : 'No Due Date'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setNewAssignment({
                                                        id: assign.id,
                                                        title: assign.title,
                                                        description: assign.description || '',
                                                        due_date: assign.due_date ? new Date(assign.due_date).toISOString().slice(0, 16) : '',
                                                        max_points: assign.max_points
                                                    });
                                                    setIsCreatingAssignment(true);
                                                }}
                                                className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm("Are you sure? This will delete all student submissions!")) return;
                                                    const { error } = await supabase.from('assignments').delete().eq('id', assign.id);
                                                    if (!error) setAssignments(assignments.filter(a => a.id !== assign.id));
                                                }}
                                                className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {assignments.length === 0 && !isCreatingAssignment && (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                                        <p className="text-slate-400 font-medium">No assignments created yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {/* Resources View */}
                {
                    activeTab === 'resources' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-800">Class Resources</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsCreatingResource(true)}
                                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" /> Add Note
                                    </button>
                                </div>
                            </div>

                            {isCreatingResource && (
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 ring-4 ring-amber-50/50 mb-6">
                                    <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> New Resource
                                    </h3>
                                    <form onSubmit={handleCreateResource} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                            <input
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                                                placeholder="e.g. Lecture Notes: Week 1"
                                                value={newResource.title}
                                                onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Content / URL</label>
                                            <textarea
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none h-24 resize-none"
                                                placeholder="Add a description or paste a link..."
                                                value={newResource.content}
                                                onChange={e => setNewResource({ ...newResource, content: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsCreatingResource(false)}
                                                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-black shadow-lg">
                                                Post Resource
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {resources.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                                    <p className="text-slate-400 font-medium">No resources shared yet.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {resources.map(res => (
                                        <div key={res.id} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center group hover:border-indigo-300 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{res.title}</h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">Added {new Date(res.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Students View (Roster) */}
                {
                    activeTab === 'students' && (
                        <div className="animate-fade-in">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {enrollments.map((enroll) => (
                                            <tr key={enroll.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                                            {enroll.profiles?.avatar_url ? (
                                                                <img src={enroll.profiles.avatar_url} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Users className="w-4 h-4 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-slate-700">{enroll.profiles?.full_name || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-slate-500 font-mono">
                                                    {enroll.profiles?.email || '-'}
                                                </td>
                                                <td className="p-4 text-sm text-slate-400 text-right font-medium">
                                                    {new Date(enroll.joined_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {enrollments.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="p-12 text-center text-slate-400">
                                                    No students enrolled yet. Share the code
                                                    <span className="mx-2 font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">{classData?.invite_code}</span>
                                                    to invite them!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

                {/* Submissions View */}
                {
                    activeTab === 'submissions' && (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-xl font-bold text-slate-800">Class Submissions</h2>
                            <div className="grid gap-4">
                                {assignments.map(assign => (
                                    <Link
                                        key={assign.id}
                                        href={`/instructor/assignment/${assign.id}`}
                                        className="block bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">{assign.title}</h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                    <span className={`flex items-center gap-1.5 ${new Date(assign.due_date!) < new Date() ? 'text-slate-500' : 'text-emerald-600'}`}>
                                                        <Clock className="w-4 h-4" />
                                                        Due: {assign.due_date ? new Date(assign.due_date).toLocaleDateString() : 'None'}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <CheckCircle className="w-4 h-4" />
                                                        {assign.max_points} Points
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    View Submissions
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {assignments.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-slate-400 font-medium">No assignments to grade.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

            </div>

            {/* Class Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-indigo-600" /> Class Configuration
                            </h3>
                            <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Inheritance Toggle */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                                <div>
                                    <span className="block font-bold text-slate-700 text-sm">Override Global Defaults</span>
                                    <p className="text-xs text-slate-500">Enable to customize rules for this class.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isOverriding}
                                        onChange={(e) => setIsOverriding(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <div className={`space-y-6 transition-opacity ${isOverriding ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>

                                {/* AI Model */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Model</label>
                                    <select
                                        value={settingsForm.model}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, model: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-xl font-bold text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {Object.entries(MODELS).map(([key, value]) => (
                                            <option key={value} value={value}>{MODEL_LABELS[value] || key}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Late Policy */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Late Policy</label>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'strict', label: 'Strict' },
                                            { id: 'grace_48h', label: '48h Grace' },
                                            { id: 'class_end', label: 'Until Class End' }
                                        ].map(policy => (
                                            <label key={policy.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${settingsForm.late_policy === policy.id
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-slate-200 hover:bg-slate-50'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name="class_late_policy"
                                                    value={policy.id}
                                                    checked={settingsForm.late_policy === policy.id}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, late_policy: e.target.value })}
                                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="font-bold text-sm text-slate-700">{policy.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* File Types */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Allowed Files</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['pdf', 'docx', 'txt', 'jpg', 'png', 'zip'].map(type => (
                                            <label key={type} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${settingsForm.allowed_file_types.includes(type)
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-slate-200 hover:bg-slate-50'
                                                }`}>
                                                <input
                                                    type="checkbox"
                                                    checked={settingsForm.allowed_file_types.includes(type)}
                                                    onChange={() => toggleFileType(type)}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="font-bold text-xs uppercase text-slate-700">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveSettings}
                                disabled={savingSettings}
                                className="px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-black transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                {savingSettings ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
