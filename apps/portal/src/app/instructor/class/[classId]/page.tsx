'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from "@schologic/database";
import { useToast } from '@/context/ToastContext';
import {
    Users, FileText, Calendar, Settings, Plus, MoreVertical, Trash2,
    ExternalLink, Search, Filter, ArrowLeft, Clock, CheckCircle, Download,
    X, Lock, Unlock, AlertCircle, ChevronRight, Loader2, BookOpen, Edit, Shield, PlayCircle, Copy, Check, ChevronUp, ChevronDown, ArrowUpRight,
    Eye, EyeOff, Sparkles
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Database } from "@schologic/database";
import { MODELS, MODEL_LABELS, ScoringMethod, Granularity } from '@/lib/ai-config';
import { isDateBetween, isDateAfter } from '@/lib/date-utils';
import jsPDF from 'jspdf';
import AIStatsCard from '@/components/AIStatsCard';
import AIInsightsModal from '@/components/AIInsightsModal';

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
        registration_number: string | null;
    } | null; // Join result
};

export default function ClassDetailsPage({ params }: { params: Promise<{ classId: string }> }) {
    const { classId } = use(params);
    return <ClassDetailsContent classId={classId} />;
}

function ClassDetailsContent({ classId }: { classId: string }) {

    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const initialTab = searchParams.get('tab') as 'overview' | 'assignments' | 'resources' || 'overview';


    // ...

    // Data States
    const [classData, setClassData] = useState<ClassData | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [enrollments, setEnrollments] = useState<EnrollmentProfile[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'resources' | 'grades'>(initialTab);
    const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
    const [dueDateError, setDueDateError] = useState<string | null>(null);
    const [shortCodeError, setShortCodeError] = useState<string | null>(null);

    // Form States
    const [newAssignment, setNewAssignment] = useState<{
        id?: string;
        title: string;
        description: string;
        due_date: string;
        max_points: number;
        short_code?: string;
        word_count: number;
        reference_style: string;
    }>({ title: '', description: '', due_date: '', max_points: 100, short_code: '', word_count: 500, reference_style: 'APA' });
    const [autoGenerateRubric, setAutoGenerateRubric] = useState(false);
    const [isGeneratingRubric, setIsGeneratingRubric] = useState(false);
    const [isCreatingResource, setIsCreatingResource] = useState(false);
    const [newResource, setNewResource] = useState({ title: '', content: '', file_url: '' });

    // Modals State
    // Modals State
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);

    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);

    // Submissions Tracking
    const [lastViewedAt, setLastViewedAt] = useState<Date>(new Date(0));

    useEffect(() => {
        const key = `schologic_lastViewed_${classId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            setLastViewedAt(new Date(stored));
        }
    }, [classId]);

    const updateLastViewed = () => {
        const key = `schologic_lastViewed_${classId}`;
        const now = new Date().toISOString();
        localStorage.setItem(key, now);
        // We purposefully DO NOT update the state here, so the "New" badges persist for the current session.
        // They will be cleared on the next page load.
    };

    // Auto-update last viewed when visiting Assignments tab
    useEffect(() => {
        if (activeTab === 'assignments') {
            updateLastViewed();
        }
    }, [activeTab]);
    const newSubmissionsCount = submissions.filter(s => new Date(s.created_at) > lastViewedAt).length;
    const ungradedSubmissionsCount = submissions.filter(s => s.grade === null).length;

    // Settings State
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

    // AI Metrics Calculation
    const aiGradedSubmissions = submissions.filter(s => s.ai_score !== null);
    const avgAIScore = aiGradedSubmissions.length > 0
        ? aiGradedSubmissions.reduce((acc, curr) => acc + (curr.ai_score || 0), 0) / aiGradedSubmissions.length
        : 0;
    const avgAuthScore = Math.round(100 - avgAIScore);

    // AI Trend Calculation (Current vs Previous Week for this class)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const currentWeekSubs = aiGradedSubmissions.filter(s => {
        const d = new Date(s.created_at);
        return d >= oneWeekAgo && d <= now;
    });

    const previousWeekSubs = aiGradedSubmissions.filter(s => {
        const d = new Date(s.created_at);
        return d >= twoWeeksAgo && d < oneWeekAgo;
    });

    // Calc Average AI Scores
    const currentAvgAI = currentWeekSubs.length > 0
        ? currentWeekSubs.reduce((acc, curr) => acc + (curr.ai_score || 0), 0) / currentWeekSubs.length
        : 0;

    const previousAvgAI = previousWeekSubs.length > 0
        ? previousWeekSubs.reduce((acc, curr) => acc + (curr.ai_score || 0), 0) / previousWeekSubs.length
        : 0;

    // Trend = Previous AI - Current AI (Positive means AI dropped = Good)
    // If no previous data, default to 0 or treat as baseline
    const trendValue = previousWeekSubs.length > 0
        ? Math.round((previousAvgAI - currentAvgAI) * 10) / 10
        : 0;

    // Grades Tab State
    const [gradesSearch, setGradesSearch] = useState('');
    const [gradesSort, setGradesSort] = useState<'name' | 'score_high' | 'score_low' | 'ai_high' | 'ai_low'>('name');
    const [gradesFilter, setGradesFilter] = useState<'all' | 'passing' | 'failing' | 'missing_submissions' | 'needs_grading'>('all');
    const [copied, setCopied] = useState(false);
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [showMobileNames, setShowMobileNames] = useState(true);

    // Edit Class State
    const [showEditClassModal, setShowEditClassModal] = useState(false);
    const [savingClass, setSavingClass] = useState(false);
    const [editClassForm, setEditClassForm] = useState({
        name: '',
        class_code: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchAllData();

        // Realtime subscription for Submissions
        const channel = supabase
            .channel('public:submissions')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'submissions', filter: `class_id=eq.${classId}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setSubmissions((prev) => [...prev, payload.new]);
                    } else if (payload.eventType === 'UPDATE') {
                        setSubmissions((prev) => prev.map((s) => (s.id === payload.new.id ? payload.new : s)));
                    } else if (payload.eventType === 'DELETE') {
                        setSubmissions((prev) => prev.filter((s) => s.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [classId]);

    // Reset settings form when modal opens
    useEffect(() => {
        if (showSettingsModal && classData) {
            // ... (existing settings logic) ...
            const s = classData.settings as any;
            const hasSettings = s && typeof s === 'object' && Object.keys(s).some(k => ['model', 'late_policy', 'allowed_file_types', 'granularity', 'scoring_method'].includes(k));
            const global = globalSettings || {};

            if (hasSettings) {
                const s = classData.settings as any;
                setIsOverriding(true);
                setSettingsForm({
                    model: s.model || global.model || MODELS.AI_DETECTOR_PIRATE,
                    granularity: s.granularity || global.granularity || Granularity.PARAGRAPH,
                    scoring_method: s.scoring_method || global.scoring_method || ScoringMethod.WEIGHTED,
                    late_policy: s.late_policy || global.late_policy || 'strict',
                    allowed_file_types: s.allowed_file_types || global.allowed_file_types || ['txt', 'docx']
                });
            } else {
                setIsOverriding(false);
                setSettingsForm({
                    model: global.model || MODELS.AI_DETECTOR_PIRATE,
                    granularity: global.granularity || Granularity.PARAGRAPH,
                    scoring_method: global.scoring_method || ScoringMethod.WEIGHTED,
                    late_policy: global.late_policy || 'strict',
                    allowed_file_types: global.allowed_file_types || ['txt', 'docx']
                });
            }
        }
    }, [showSettingsModal, classData, globalSettings]);

    // Initialize Edit Class Form when modal opens
    useEffect(() => {
        if (showEditClassModal && classData) {
            setEditClassForm({
                name: classData.name || '',
                class_code: classData.class_code || '',
                start_date: classData.start_date || '',
                end_date: classData.end_date || ''
            });
        }
    }, [showEditClassModal, classData]);

    const handleUpdateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingClass(true);
        try {
            const { error, data } = await supabase
                .from('classes')
                .update({
                    name: editClassForm.name,
                    class_code: editClassForm.class_code,
                    start_date: editClassForm.start_date ? editClassForm.start_date : null,
                    end_date: editClassForm.end_date ? editClassForm.end_date : null
                })
                .eq('id', classId)
                .select()
                .single();

            if (error) throw error;

            setClassData(data);
            setShowEditClassModal(false);
            showToast("Class Details Updated!", 'success');
        } catch (err: any) {
            showToast("Error updating class: " + err.message, 'error');
        } finally {
            setSavingClass(false);
        }
    };

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [clsRes, assignRes, enrollRes, resRes, profileRes, subRes] = await Promise.all([
                supabase.from('classes').select('*').eq('id', classId).single(),
                supabase.from('assignments').select('*, short_code').eq('class_id', classId).order('due_date', { ascending: true }),
                supabase.from('enrollments').select(`id, student_id, joined_at, profiles:student_id (full_name, email, avatar_url, registration_number)`).eq('class_id', classId),
                supabase.from('class_resources').select('*').eq('class_id', classId).order('created_at', { ascending: false }),
                supabase.from('profiles').select('settings').eq('id', user.id).single(),
                supabase.from('submissions').select('*').eq('class_id', classId) // Fetch all class submissions
            ]);

            if (clsRes.error) throw clsRes.error;
            if (assignRes.error) console.error("Assignments Fetch Error:", assignRes.error);
            if (subRes.error) console.error("Submissions Fetch Error:", subRes.error);

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
                        model: s.model || global.model || MODELS.AI_DETECTOR_PIRATE,
                        granularity: s.granularity || global.granularity || Granularity.PARAGRAPH,
                        scoring_method: s.scoring_method || global.scoring_method || ScoringMethod.WEIGHTED,
                        late_policy: s.late_policy || global.late_policy || 'strict',
                        allowed_file_types: s.allowed_file_types || global.allowed_file_types || ['txt', 'docx']
                    });
                } else {
                    setIsOverriding(false);
                    setSettingsForm({
                        model: global.model || MODELS.AI_DETECTOR_PIRATE,
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
                    model: global.model || MODELS.AI_DETECTOR_PIRATE,
                    granularity: global.granularity || Granularity.PARAGRAPH,
                    scoring_method: global.scoring_method || ScoringMethod.WEIGHTED,
                    late_policy: global.late_policy || 'strict',
                    allowed_file_types: global.allowed_file_types || ['txt', 'docx']
                });
            }

            if (assignRes.data) setAssignments(assignRes.data);
            if (resRes.data) setResources(resRes.data);
            if (enrollRes.data) setEnrollments(enrollRes.data as unknown as EnrollmentProfile[]);
            if (subRes.data) setSubmissions(subRes.data);


        } catch (error) {
            console.error("Error fetching class data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        setDueDateError(null);
        setShortCodeError(null);

        if (!newAssignment.short_code || !newAssignment.short_code.trim()) {
            setShortCodeError("Assignment ID is required");
            return;
        }

        try {
            const assignmentData = {
                class_id: classId,
                title: newAssignment.title,
                description: newAssignment.description,
                due_date: newAssignment.due_date ? new Date(newAssignment.due_date).toISOString() : null,
                max_points: newAssignment.max_points,
                short_code: newAssignment.short_code,
                word_count: newAssignment.word_count || 500,
                reference_style: newAssignment.reference_style || 'APA'
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

            let insertedId: string | null = null;

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
                showToast("Assignment Updated!", 'success');
            } else {
                // Create new
                const { data: created, error } = await supabase
                    .from('assignments')
                    .insert([assignmentData])
                    .select()
                    .single();

                if (error) throw error;
                setAssignments([...assignments, created]);
                insertedId = created.id;
                showToast("Assignment Created Successfully!", 'success');
            }

            // TRIGGER AI RUBRIC GENERATION (New Assignments only mostly, or updates if user toggles)
            // Logic: Only if toggle is ON and we have an ID (created or existing) and it is NOT an update where we might overwrite existing rubric unintentionally?
            // User requested: "rubric generation will be triggered when the instructor hits the 'publish assignment' button"
            // TRIGGER AI RUBRIC GENERATION
            if (autoGenerateRubric && insertedId) {
                try {
                    setIsGeneratingRubric(true);

                    const res = await fetch('/api/rubric/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: assignmentData.title,
                            description: assignmentData.description,
                            max_points: assignmentData.max_points
                        })
                    });

                    if (!res.ok) {
                        const errorData = await res.text();
                        console.error("API Error Body:", errorData);
                        throw new Error(`Rubric generation failed: ${res.status} ${res.statusText} - ${errorData}`);
                    }

                    const data = await res.json();
                    if (data.rubric) {
                        await supabase
                            .from('assignments')
                            .update({ rubric: data.rubric })
                            .eq('id', insertedId);

                        showToast("Rubric Generated and Saved!", 'success');

                        // Redirect to the new rubric tab
                        router.push(`/instructor/assignment/${insertedId}?tab=rubric`);
                        return; // Exit here, don't just close modal, we are navigating away
                    }
                } catch (err: any) {
                    console.error("Rubric Gen Failed:", err);
                    showToast("Assignment created, but Rubric generation failed: " + err.message, 'error');
                    setIsGeneratingRubric(false);
                    // We still close the modal below because the assignment was created
                }
            }

            setIsCreatingAssignment(false);
            setNewAssignment({ title: '', description: '', due_date: '', max_points: 100, short_code: '', word_count: 500, reference_style: 'APA' });
            setAutoGenerateRubric(false);
            setIsGeneratingRubric(false);
            setNewAssignment({ title: '', description: '', due_date: '', max_points: 100, short_code: '', word_count: 500, reference_style: 'APA' });
            setAutoGenerateRubric(false);
        } catch (err: any) {
            showToast("Error saving assignment: " + err.message, 'error');
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
            showToast("Resource Added!", 'success');
        } catch (err: any) {
            showToast("Error adding resource: " + err.message, 'error');
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

            // CRITICAL FIX: Update local classData state so the UI (and useEffect) knows the new settings
            if (classData) {
                // Ensure we respect the type system and logic
                // If updatePayload is null, settings becomes null.
                const newSettings = updatePayload;
                setClassData({ ...classData, settings: newSettings });
            }

            // Sync local override state just in case
            if (!updatePayload) {
                setIsOverriding(false);
            } else {
                setIsOverriding(true);
            }

            // Update local settings form to reflect inheritance if needed
            if (!isOverriding && globalSettings) {
                setSettingsForm({
                    model: globalSettings.model || MODELS.AI_DETECTOR_PIRATE,
                    granularity: globalSettings.granularity || Granularity.PARAGRAPH,
                    scoring_method: globalSettings.scoring_method || ScoringMethod.WEIGHTED,
                    late_policy: globalSettings.late_policy || 'strict',
                    allowed_file_types: globalSettings.allowed_file_types || ['txt', 'docx']
                });
            }

            setShowSettingsModal(false);
            showToast("Class Settings Saved!", 'success');
        } catch (err) {
            console.error("Error saving settings", err);
            showToast("Failed to save settings", 'error');
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

    const handleCopyCode = async () => {
        if (!classData?.invite_code) return;
        try {
            await navigator.clipboard.writeText(classData.invite_code);
            setCopied(true);
            showToast('Class code copied!', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            showToast('Failed to copy code.', 'error');
        }
    };

    const exportToPDF = () => {
        if (!classData) return;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(classData.name, 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

        // Simple table logic (since autotable might not be available or robust without config)
        let y = 40;
        doc.setFontSize(8);
        const headers = ["Reg No", "Name", ...assignments.map(a => a.short_code || a.title.slice(0, 5)), "Total %", "AI %"];
        const xPositions = [14, 40, ...assignments.map((_, i) => 80 + (i * 15)), 170, 190];

        // Print Headers
        headers.forEach((h, i) => doc.text(h, xPositions[i] || 10, y));
        doc.line(14, y + 2, 200, y + 2);
        y += 8;

        // Print Rows (using current filtered/sorted data would be best, but we'll re-calculate or just dump all)
        // For simplicity, let's dump ALL students (so it is a full record)
        enrollments.forEach(student => {
            if (y > 280) { doc.addPage(); y = 20; }

            const studentSubs = submissions.filter(s => s.student_id === student.student_id);
            const totalPointsPossible = assignments.reduce((acc, curr) => acc + curr.max_points, 0);
            const studentTotalPoints = studentSubs.reduce((acc, curr) => acc + (curr.grade || 0), 0);
            const averageScore = totalPointsPossible > 0 ? (studentTotalPoints / totalPointsPossible) * 100 : 0;

            // AI Score weighted
            let aiTotal = 0;
            let aiCount = 0;
            studentSubs.forEach(s => {
                if (s.ai_score !== null) {
                    aiTotal += s.ai_score;
                    aiCount++;
                }
            });
            const avgAI = aiCount > 0 ? aiTotal / aiCount : 0;

            doc.text(student.profiles?.registration_number || '-', xPositions[0], y);
            doc.text(student.profiles?.full_name || 'Unknown', xPositions[1], y);

            assignments.forEach((a, index) => {
                const sub = studentSubs.find(s => s.assignment_id === a.id);
                const grade = sub?.grade !== undefined && sub?.grade !== null ? sub.grade.toString() : '-';
                doc.text(grade, xPositions[2 + index] || 10, y);
            });

            doc.text(averageScore.toFixed(0) + '%', 170, y);
            doc.text(avgAI.toFixed(0) + '%', 190, y);

            y += 6;
        });

        doc.save(`${classData.name.replace(/\s+/g, '_')}_Grades.pdf`);
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8"><span className="text-slate-500 font-bold animate-pulse">Loading Class Data...</span></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-2 md:p-8">
            <div className="max-w-6xl mx-auto">
                <Link href="/instructor/classes" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Classes
                </Link>

                {/* Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    {/* Header */}
                    <div className="p-4 md:p-8 border-b border-slate-100 bg-white">
                        <div className="flex flex-col gap-3 animate-fade-in">
                            {/* Row 1: Title & Actions */}
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-2 min-w-0">
                                    <h1 className="text-xl md:text-3xl font-bold text-slate-900 flex items-center gap-2 truncate">
                                        <span className="truncate">
                                            <span className="text-indigo-600">{classData?.class_code}:</span> {classData?.name}
                                        </span>
                                    </h1>
                                    <button
                                        onClick={() => setShowEditClassModal(true)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shrink-0"
                                        title="Edit Class Details"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                                        className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors md:hidden"
                                        title={isHeaderExpanded ? "Collapse Header" : "Expand Header"}
                                    >
                                        {isHeaderExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => setShowSettingsModal(true)}
                                        className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                                        title="Class Settings"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </button>
                                    {/* Lock/Active button - keep visible always? User said "leaving the first row only". Yes, keep row 1 intact. */}
                                    <button
                                        onClick={toggleLock}
                                        className={`px-3 py-1.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 border shadow-sm ${classData?.is_locked
                                            ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                            }`}
                                        title={classData?.is_locked ? "Click to Unlock Class" : "Click to Lock Class"}
                                    >
                                        {classData?.is_locked ? (
                                            <>
                                                <Lock className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Locked</span>
                                            </>
                                        ) : (
                                            <>
                                                <Unlock className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Active</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Row 2: Metadata (Collapsible) */}
                            {isHeaderExpanded && (
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-slate-500 font-medium animate-slide-in">
                                    <button
                                        onClick={() => setShowStudentsModal(true)}
                                        className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 transition-all group"
                                        title="View Enrolled Students"
                                    >
                                        <Users className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                        <span className="font-bold">{enrollments.length} Students</span>
                                    </button>


                                    <button
                                        onClick={handleCopyCode}
                                        className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 text-indigo-700 hover:bg-indigo-100 transition-all group relative"
                                        title="Copy Invite Code"
                                    >
                                        <span className="text-xs font-bold opacity-75 uppercase tracking-wider">CODE</span>
                                        <span className="font-mono font-bold select-all">{classData?.invite_code}</span>
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />}
                                    </button>
                                    {classData?.start_date && (
                                        <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs md:text-sm">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(classData.start_date).toLocaleDateString()} - {new Date(classData.end_date!).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-1 bg-slate-200/50 p-0.5 rounded-xl mb-8 w-full md:w-fit">
                    {(['overview', 'assignments', 'resources', 'grades'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 md:flex-none px-2 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Overview View (Dashboard) */}
                {activeTab === 'overview' && classData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {/* AI Authenticity Tracker */}
                        <AIStatsCard
                            averageScore={avgAuthScore}
                            studentCount={enrollments.length}
                            trend={trendValue}
                            onClick={() => setShowAIModal(true)}
                        />

                        {/* Assignments */}
                        <div
                            onClick={() => setShowAssignmentsModal(true)}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between relative"
                        >
                            <div className="absolute top-4 right-4 text-slate-300 group-hover:text-emerald-500 transition-colors">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><FileText className="w-5 h-5" /></div>
                                <h3 className="font-bold text-slate-700 group-hover:text-emerald-700">Assignments</h3>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-black text-slate-900">{assignments.length}</p>
                                <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Total Assignments</p>
                            </div>
                        </div>

                        {/* Submissions (New & Ungraded) */}
                        <div
                            onClick={() => setShowSubmissionsModal(true)}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between relative"
                        >
                            <div className="absolute top-4 right-4 text-slate-300 group-hover:text-blue-500 transition-colors">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Clock className="w-5 h-5" /></div>
                                <h3 className="font-bold text-slate-700 group-hover:text-blue-700">Submissions</h3>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl md:text-4xl font-black text-slate-900">{ungradedSubmissionsCount}</p>
                                    <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Ungraded</p>
                                </div>
                                {newSubmissionsCount > 0 && (
                                    <div className="text-right">
                                        <p className="text-3xl md:text-4xl font-black text-blue-600">+{newSubmissionsCount}</p>
                                        <p className="text-xs text-blue-400 mt-1 font-bold uppercase tracking-wider">New</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                )}{/* Quick View Modals */}

                {/* Assignments Quick View */}
                {showAssignmentsModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                                <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-600" /> Assignment Overview
                                </h3>
                                <button onClick={() => setShowAssignmentsModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                <div className="space-y-4">
                                    {assignments.map(a => {
                                        const assignSubs = submissions.filter(s => s.assignment_id === a.id);
                                        const totalSubs = assignSubs.length;
                                        const subPercentage = enrollments.length > 0 ? Math.round((totalSubs / enrollments.length) * 100) : 0;

                                        // Time Left Logic
                                        let timeStatus = { text: 'No Due Date', color: 'text-slate-400', bg: 'bg-white border-slate-200' };
                                        if (a.due_date) {
                                            const now = new Date();
                                            const due = new Date(a.due_date);
                                            const diff = due.getTime() - now.getTime();

                                            if (diff < 0) {
                                                timeStatus = { text: 'Ended', color: 'text-slate-500', bg: 'bg-slate-100 border-slate-200' };
                                            } else {
                                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                                                if (days > 0) {
                                                    timeStatus = { text: `${days}d ${hours}h left`, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' };
                                                } else {
                                                    timeStatus = { text: `${hours}h remaining`, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' };
                                                }
                                            }
                                        }

                                        return (
                                            <div
                                                key={a.id}
                                                onClick={() => router.push(`/instructor/assignment/${a.id}`)}
                                                className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all group"
                                            >
                                                <div className="flex items-center gap-3 flex-1 w-full">
                                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">{a.title}</h4>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${timeStatus.bg} ${timeStatus.color} md:hidden mt-1 inline-block`}>
                                                            {timeStatus.text}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Progress Bar (Visible on larger screens) */}
                                                <div className="hidden md:flex flex-col items-center w-1/3 px-2">
                                                    <div className="w-full flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">
                                                        <span>Progress</span>
                                                        <span>{subPercentage}%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300 relative">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${subPercentage === 100 ? 'bg-emerald-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${subPercentage}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="hidden md:flex flex-col items-end min-w-[90px]">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${timeStatus.bg} ${timeStatus.color} whitespace-nowrap`}>
                                                        {timeStatus.text}
                                                    </span>
                                                </div>

                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0 hidden md:block" />
                                            </div>
                                        );
                                    })}
                                    {assignments.length === 0 && <p className="text-center text-slate-400 py-4">No assignments yet.</p>}
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                                <button
                                    onClick={() => {
                                        setActiveTab('assignments');
                                        setShowAssignmentsModal(false);
                                    }}
                                    className="text-emerald-600 hover:text-emerald-700 font-bold text-sm px-4 py-2 transition-colors"
                                >
                                    Go to Full Manager
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submissions Quick View */}
                {showSubmissionsModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                                <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600" /> Recent Activity
                                </h3>
                                <button onClick={() => setShowSubmissionsModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                <div className="space-y-4">
                                    {assignments.map(a => {
                                        const assignmentSubs = submissions.filter(s => s.assignment_id === a.id);
                                        const ungraded = assignmentSubs.filter(s => s.grade === null).length;
                                        const newSubs = assignmentSubs.filter(s => new Date(s.created_at) > lastViewedAt).length;
                                        const totalAssignmentSubs = assignmentSubs.length;
                                        const ungradedPercentage = totalAssignmentSubs > 0 ? Math.round((ungraded / totalAssignmentSubs) * 100) : 0;

                                        if (ungraded === 0 && newSubs === 0) return null;

                                        return (
                                            <div
                                                key={a.id}
                                                onClick={() => router.push(`/instructor/assignment/${a.id}?tab=submissions`)}
                                                className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group"
                                            >
                                                <div className="flex-1 w-full text-left">
                                                    <h4 className="font-bold text-slate-800 group-hover:text-blue-700 truncate">{a.title}</h4>
                                                    <div className="flex gap-2 mt-1 md:hidden">
                                                        {ungraded > 0 && <span className="text-xs font-bold text-slate-500">{ungraded} Ungraded</span>}
                                                        {newSubs > 0 && <span className="text-xs font-bold text-blue-600">{newSubs} New</span>}
                                                    </div>
                                                </div>

                                                {/* Progress Bar (Visible on larger screens) */}
                                                <div className="hidden md:flex flex-col items-center w-1/3 px-2">
                                                    <div className="w-full flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">
                                                        <span>Ungraded</span>
                                                        <span>{ungradedPercentage}%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300 relative">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-1000 ease-out bg-blue-500"
                                                            style={{ width: `${ungradedPercentage}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="hidden md:flex gap-2 justify-end min-w-[120px]">
                                                    {ungraded > 0 && (
                                                        <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                                                            {ungraded} Ungraded
                                                        </span>
                                                    )}
                                                    {newSubs > 0 && (
                                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                                                            {newSubs} New
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {ungradedSubmissionsCount === 0 && newSubmissionsCount === 0 && (
                                        <p className="text-center text-slate-400 py-4">No new or ungraded submissions.</p>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                                <button
                                    onClick={() => {
                                        updateLastViewed();
                                        setShowSubmissionsModal(false);
                                    }}
                                    className="text-slate-500 hover:text-slate-800 font-bold text-sm px-4 py-2 transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )
                }

                {/* Assignments View */}
                {
                    activeTab === 'assignments' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-base md:text-xl font-bold text-slate-800">Manage Assignments</h2>
                                <button
                                    onClick={() => {
                                        setIsCreatingAssignment(true);
                                        setNewAssignment({ title: '', description: '', due_date: '', max_points: 100, short_code: '', word_count: 500, reference_style: 'APA' });
                                    }}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 text-xs md:px-4 md:py-2 md:text-sm rounded-xl font-bold transition-all shadow-md active:scale-95"
                                >
                                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Create Assignment
                                </button>
                            </div>

                            {isCreatingAssignment && (
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 ring-4 ring-indigo-50/50 mb-6">
                                    <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> {newAssignment.id ? 'Edit Assignment' : 'New Assignment'}
                                    </h3>
                                    <form onSubmit={handleCreateAssignment} className="space-y-3">
                                        <div className="grid md:grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1 md:mb-2">Title</label>
                                                <input
                                                    className="w-full p-2 md:p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm md:text-base"
                                                    placeholder="e.g. Midterm Essay"
                                                    value={newAssignment.title}
                                                    onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-2 grid grid-cols-3 gap-3 md:gap-6">
                                                <div>
                                                    <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1 md:mb-2 truncate">Short Code</label>
                                                    <input
                                                        className={`w-full p-2 md:p-3 border rounded-xl focus:ring-2 outline-none font-bold font-mono text-sm md:text-base ${shortCodeError ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-indigo-500'}`}
                                                        placeholder="CAT 1"
                                                        value={newAssignment.short_code || ''}
                                                        required
                                                        onChange={e => {
                                                            const val = e.target.value.toUpperCase();
                                                            if (val.length <= 8) {
                                                                if (/^[A-Z0-9\-#/]*$/.test(val)) {
                                                                    setNewAssignment({ ...newAssignment, short_code: val });
                                                                    setShortCodeError(null);
                                                                } else {
                                                                    setShortCodeError('Invalid char');
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1 md:mb-2 truncate">Word Count</label>
                                                    <input
                                                        type="number"
                                                        className="w-full p-2 md:p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm md:text-base"
                                                        placeholder="500"
                                                        value={newAssignment.word_count || ''}
                                                        onChange={e => setNewAssignment({ ...newAssignment, word_count: parseInt(e.target.value) || 0 })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1 md:mb-2 truncate">Style</label>
                                                    <select
                                                        className="w-full p-2 md:p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold bg-white text-sm md:text-base"
                                                        value={newAssignment.reference_style}
                                                        onChange={e => setNewAssignment({ ...newAssignment, reference_style: e.target.value })}
                                                    >
                                                        <option value="APA">APA</option>
                                                        <option value="MLA">MLA</option>
                                                        <option value="Harvard">Harvard</option>
                                                        <option value="Chicago">Chicago</option>
                                                        <option value="IEEE">IEEE</option>
                                                    </select>
                                                </div>

                                                <div className="col-span-2 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4 text-indigo-600" />
                                                        <span className="text-xs font-bold text-slate-700 uppercase">Auto-generate Rubric with AI</span>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-pointer" onClick={() => setAutoGenerateRubric(!autoGenerateRubric)}>
                                                        <div className={`w-11 h-6 rounded-full transition-colors ${autoGenerateRubric ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                                            <div className={`absolute top-1 left-1 bg-white border border-slate-300 rounded-full h-4 w-4 transition-transform ${autoGenerateRubric ? 'translate-x-5 border-transparent' : ''}`}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {shortCodeError && (
                                                <div className="col-span-2 flex items-start gap-1 -mt-1 text-red-500 animate-fade-in">
                                                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-[10px] font-medium">{shortCodeError}</span>
                                                </div>
                                            )}
                                            <div className="col-span-2">
                                                <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1 md:mb-2">Description</label>
                                                <textarea
                                                    className="w-full p-2 md:p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none overflow-hidden min-h-[64px] max-h-[300px] text-sm md:text-base"
                                                    placeholder="Instructions..."
                                                    value={newAssignment.description}
                                                    maxLength={1000}
                                                    onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                                    onInput={(e) => {
                                                        e.currentTarget.style.height = 'auto';
                                                        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                                    }}
                                                />
                                                <div className="text-right text-[10px] md:text-xs text-slate-400 mt-1 font-mono">
                                                    {(newAssignment.description || '').length}/1000
                                                </div>
                                            </div>

                                            {/* Due Date & Points Row */}
                                            <div className="col-span-2 grid grid-cols-2 gap-3 md:gap-6">
                                                <div>
                                                    <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1 md:mb-2">Due Date</label>
                                                    <input
                                                        type="datetime-local"
                                                        className={`w-full p-2 md:p-3 border rounded-xl focus:ring-2 outline-none text-slate-600 font-medium text-xs md:text-sm ${dueDateError ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-indigo-500'}`}
                                                        value={newAssignment.due_date}
                                                        onChange={e => {
                                                            setNewAssignment({ ...newAssignment, due_date: e.target.value });
                                                            if (dueDateError) setDueDateError(null);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1 md:mb-2">Points</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            className="w-full p-2 md:p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold pr-12 text-sm md:text-base"
                                                            placeholder="100"
                                                            value={newAssignment.max_points}
                                                            onChange={e => {
                                                                const val = parseInt(e.target.value);
                                                                setNewAssignment({ ...newAssignment, max_points: isNaN(val) ? 0 : val });
                                                            }}
                                                            required
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">/ 100</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {dueDateError && (
                                                <div className="col-span-2 flex items-start gap-1 -mt-1 text-red-500 animate-fade-in">
                                                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-[10px] font-medium">{dueDateError}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2 md:pt-6">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCreatingAssignment(false);
                                                    setNewAssignment({ title: '', description: '', due_date: '', max_points: 100, short_code: '', word_count: 500, reference_style: 'APA' });
                                                    setAutoGenerateRubric(false);
                                                }}
                                                className="px-3 py-2 md:px-6 md:py-2.5 text-slate-500 hover:text-slate-700 font-bold text-xs md:text-sm transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button className="bg-indigo-600 text-white px-4 py-2 md:px-8 md:py-2.5 rounded-xl font-bold text-xs md:text-sm hover:bg-indigo-700 shadow-lg transition-transform active:scale-95">
                                                {newAssignment.id ? 'Update' : 'Publish'} Assignment
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )
                            }

                            <div className="grid gap-4">
                                {assignments.map(assign => {
                                    // Calculate stats
                                    const assignSubs = submissions.filter(s => s.assignment_id === assign.id);
                                    const totalSubs = assignSubs.length;
                                    const ungradedSubs = assignSubs.filter(s => s.grade === null).length;
                                    const newSubs = assignSubs.filter(s => new Date(s.created_at) > lastViewedAt).length;

                                    const subPercentage = enrollments.length > 0 ? Math.round((totalSubs / enrollments.length) * 100) : 0;

                                    // Time Left Logic
                                    let timeStatus = { text: 'No Due Date', color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200' };
                                    if (assign.due_date) {
                                        const now = new Date();
                                        const due = new Date(assign.due_date);
                                        const diff = due.getTime() - now.getTime();

                                        if (diff < 0) {
                                            timeStatus = { text: 'Ended', color: 'text-slate-500', bg: 'bg-slate-100 border-slate-200' };
                                        } else {
                                            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                                            if (days > 0) {
                                                timeStatus = { text: `${days}d ${hours}h left`, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' };
                                            } else {
                                                timeStatus = { text: `${hours}h remaining`, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' };
                                            }
                                        }
                                    }

                                    return (
                                        <div
                                            key={assign.id}
                                            onClick={() => router.push(`/instructor/assignment/${assign.id}`)}
                                            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all group shadow-sm cursor-pointer hover:shadow-md"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">{assign.title}</h3>
                                                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">{assign.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</span>
                                                    <span className={`block font-mono text-sm font-bold ${assign.due_date && new Date(assign.due_date) < new Date() ? 'text-red-500' : 'text-emerald-600'}`}>
                                                        {assign.due_date ? new Date(assign.due_date).toLocaleDateString() : 'No Due Date'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Stats Row */}
                                            <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 flex-wrap">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    <span className="font-bold">{totalSubs} / {enrollments.length}</span> Submissions
                                                </div>
                                                {ungradedSubs > 0 && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                                        <span className="font-bold text-slate-800">{ungradedSubs}</span> Ungraded
                                                    </div>
                                                )}
                                                {newSubs > 0 && (
                                                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span className="font-bold">{newSubs}</span> New
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end gap-2 mt-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setNewAssignment({
                                                            id: assign.id,
                                                            title: assign.title,
                                                            description: assign.description || '',
                                                            due_date: assign.due_date ? new Date(assign.due_date).toISOString().slice(0, 16) : '',
                                                            max_points: assign.max_points,
                                                            short_code: assign.short_code || '',
                                                            word_count: assign.word_count || 500,
                                                            reference_style: assign.reference_style || 'APA'
                                                        });
                                                        setIsCreatingAssignment(true);
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
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
                                    );
                                })}
                                {assignments.length === 0 && !isCreatingAssignment && (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                                        <p className="text-slate-400 font-medium">No assignments created yet.</p>
                                    </div>
                                )}
                            </div>
                        </div >
                    )
                }

                {/* Resources View */}
                {
                    activeTab === 'resources' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-base md:text-xl font-bold text-slate-800">Shared Files & Notes</h2>
                                <button
                                    onClick={() => setIsCreatingResource(true)}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 text-xs md:px-4 md:py-2 md:text-sm rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95"
                                >
                                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Add Note
                                </button>
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









                {/* Grades Tab */}
                {
                    activeTab === 'grades' && (
                        <div className="animate-fade-in space-y-6">
                            {/* Controls */}
                            {/* Controls */}
                            {/* Desktop Toolbar (Hidden on Mobile) */}
                            <div className="hidden md:flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex-1 max-w-sm">
                                    <Search className="w-4 h-4 text-slate-400" />
                                    <input
                                        placeholder="Search by name or reg no"
                                        className="bg-transparent outline-none text-sm font-bold text-slate-700 w-full"
                                        value={gradesSearch}
                                        onChange={(e) => setGradesSearch(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">FILTER:</span>
                                        <div className="relative">
                                            <select
                                                className="appearance-none bg-slate-50 border border-slate-200 pl-3 pr-8 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[140px]"
                                                value={gradesFilter}
                                                onChange={(e) => setGradesFilter(e.target.value as any)}
                                            >
                                                <option value="all">All Students</option>
                                                <option value="passing">Passing</option>
                                                <option value="failing">Failing</option>
                                                <option value="missing_submissions">Missing</option>
                                                <option value="needs_grading">Needs Grading</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="w-px h-6 bg-slate-200"></div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SORT:</span>
                                        <div className="relative">
                                            <select
                                                className="appearance-none bg-slate-50 border border-slate-200 pl-3 pr-8 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[140px]"
                                                value={gradesSort}
                                                onChange={(e) => setGradesSort(e.target.value as any)}
                                            >
                                                <option value="name">Name (A-Z)</option>
                                                <option value="score_high">Score (High-Low)</option>
                                                <option value="score_low">Score (Low-High)</option>
                                                <option value="ai_high">AI (High-Low)</option>
                                                <option value="ai_low">AI (Low-High)</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={exportToPDF}
                                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all shadow-md active:scale-95 ml-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="font-bold text-sm">Export PDF</span>
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Toolbar (Hidden on Desktop) */}
                            <div className="flex md:hidden items-center justify-between gap-2 bg-white p-2 md:p-4 rounded-2xl border border-slate-200 shadow-sm transition-all">
                                {isSearchExpanded ? (
                                    <div className="flex-1 flex items-center gap-2 animate-fade-in w-full">
                                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                                        <input
                                            autoFocus
                                            placeholder="Search by name or reg no..."
                                            className="flex-1 bg-transparent outline-none text-sm font-bold min-w-0"
                                            value={gradesSearch}
                                            onChange={(e) => setGradesSearch(e.target.value)}
                                        />
                                        <button
                                            onClick={() => { setIsSearchExpanded(false); setGradesSearch(''); }}
                                            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 shrink-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar mask-grad-r">
                                            <button
                                                onClick={() => setIsSearchExpanded(true)}
                                                className="p-2 md:p-2.5 text-slate-500 hover:bg-slate-50 rounded-lg shrink-0 transition-colors"
                                                title="Search"
                                            >
                                                <Search className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>

                                            <div className="w-px h-6 bg-slate-200 shrink-0"></div>

                                            <select
                                                className="p-2 md:p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-600 min-w-fit"
                                                value={gradesFilter}
                                                onChange={(e) => setGradesFilter(e.target.value as any)}
                                            >
                                                <option value="all">All</option>
                                                <option value="passing">Passing</option>
                                                <option value="failing">Failing</option>
                                                <option value="missing_submissions">Missing</option>
                                                <option value="needs_grading">Needs Grading</option>
                                            </select>

                                            <select
                                                className="p-2 md:p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-600 min-w-fit"
                                                value={gradesSort}
                                                onChange={(e) => setGradesSort(e.target.value as any)}
                                            >
                                                <option value="name">Name</option>
                                                <option value="score_high">Score (High-Low)</option>
                                                <option value="score_low">Score (Low-High)</option>
                                                <option value="ai_high">AI (High-Low)</option>
                                                <option value="ai_low">AI (Low-High)</option>
                                            </select>
                                        </div>

                                        <button
                                            onClick={exportToPDF}
                                            className="p-2 md:p-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-md active:scale-95 shrink-0"
                                            title="Export PDF"
                                        >
                                            <Download className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Gradebook Table */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className={`p-2 md:p-4 font-bold text-[10px] md:text-xs text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-20 w-32 md:w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap border-r border-slate-300 transition-all ${showMobileNames ? '' : 'hidden md:table-cell'}`}>
                                                <div className="flex items-center justify-between gap-1">
                                                    <span>Student</span>
                                                    <button
                                                        onClick={() => setShowMobileNames(false)}
                                                        className="md:hidden p-1 -mr-1 text-slate-400 hover:text-indigo-500 transition-colors"
                                                    >
                                                        <EyeOff className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </th>
                                            <th className={`p-2 md:p-4 font-bold text-[10px] md:text-xs text-slate-500 uppercase tracking-wider border-l border-slate-200 w-20 md:w-32 whitespace-nowrap transition-all ${!showMobileNames ? 'sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-300' : ''}`}>
                                                <div className="flex items-center justify-between gap-1">
                                                    <span>Reg No</span>
                                                    {!showMobileNames && (
                                                        <button
                                                            onClick={() => setShowMobileNames(true)}
                                                            className="md:hidden p-1 -mr-1 text-indigo-500 transition-colors"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </th>
                                            {assignments.map(a => (
                                                <th key={a.id} className="p-2 md:p-4 font-bold text-[10px] md:text-xs text-slate-500 uppercase tracking-wider border-l border-slate-200 text-center min-w-[80px] md:min-w-[100px] whitespace-nowrap" title={a.title}>
                                                    {a.short_code || a.title.substring(0, 10) + (a.title.length > 10 ? '...' : '')}
                                                </th>
                                            ))}
                                            <th className="p-2 md:p-4 font-bold text-[10px] md:text-xs text-indigo-600 uppercase tracking-wider border-l border-slate-200 text-center w-16 md:w-24 bg-indigo-50/30 whitespace-nowrap">Avg AI</th>
                                            <th className="p-2 md:p-4 font-bold text-[10px] md:text-xs text-emerald-600 uppercase tracking-wider border-l border-slate-200 text-center w-16 md:w-24 bg-emerald-50/30 whitespace-nowrap">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(() => {
                                            // Process Data
                                            const processed = enrollments.map(enroll => {
                                                const studentSubs = submissions.filter(s => s.student_id === enroll.student_id);
                                                const totalScore = studentSubs.reduce((acc, curr) => acc + (curr.grade || 0), 0);

                                                // AI Avg: Exclude nulls
                                                const aiScores = studentSubs.filter(s => s.ai_score !== null && s.ai_score !== undefined).map(s => s.ai_score as number);
                                                const avgAi = aiScores.length > 0 ? Math.round(aiScores.reduce((a, b) => a + b, 0) / aiScores.length) : null;

                                                return {
                                                    enroll,
                                                    studentSubs,
                                                    totalScore,
                                                    avgAi
                                                };
                                            })
                                                .filter(item => {
                                                    const search = gradesSearch.toLowerCase();
                                                    const name = item.enroll.profiles?.full_name?.toLowerCase() || '';
                                                    const reg = item.enroll.profiles?.registration_number?.toLowerCase() || '';
                                                    let match = name.includes(search) || reg.includes(search);
                                                    // Filter Logic
                                                    if (gradesFilter !== 'all') {
                                                        const totalPossible = assignments.reduce((acc, curr) => acc + curr.max_points, 0);
                                                        const studentTotalPoints = item.totalScore;
                                                        const avgPct = totalPossible > 0 ? (studentTotalPoints / totalPossible) * 100 : 0;

                                                        if (gradesFilter === 'passing' && avgPct < 50) match = false;
                                                        if (gradesFilter === 'failing' && avgPct >= 50) match = false;

                                                        if (gradesFilter === 'missing_submissions') {
                                                            // Check if any assignment has passed due date AND is not submitted
                                                            const hasMissing = assignments.some(a => {
                                                                const isDue = a.due_date && new Date(a.due_date) < new Date();
                                                                const isSubmitted = item.studentSubs.some(s => s.assignment_id === a.id);
                                                                return isDue && !isSubmitted;
                                                            });
                                                            if (!hasMissing) match = false;
                                                        }

                                                        if (gradesFilter === 'needs_grading') {
                                                            // Check if any submission has no grade
                                                            const needsGrading = item.studentSubs.some(s => s.grade === null);
                                                            if (!needsGrading) match = false;
                                                        }
                                                    }

                                                    return match;
                                                })
                                                .sort((a, b) => {
                                                    if (gradesSort === 'name') return (a.enroll.profiles?.full_name || '').localeCompare(b.enroll.profiles?.full_name || '');
                                                    if (gradesSort === 'score_high') return b.totalScore - a.totalScore;
                                                    if (gradesSort === 'score_low') return a.totalScore - b.totalScore;
                                                    if (gradesSort === 'ai_high') return (b.avgAi || 0) - (a.avgAi || 0);
                                                    if (gradesSort === 'ai_low') return (a.avgAi || 0) - (b.avgAi || 0);
                                                    return 0;
                                                });

                                            if (processed.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan={3 + assignments.length} className="p-12 text-center text-slate-400">
                                                            No students found matching your criteria.
                                                        </td>
                                                    </tr>
                                                )
                                            }

                                            return processed.map(({ enroll, studentSubs, totalScore, avgAi }, i) => (
                                                <tr key={enroll.id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className={`p-2 md:p-4 sticky left-0 bg-white group-hover:bg-slate-50 z-20 border-r border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap transition-all ${showMobileNames ? '' : 'hidden md:table-cell'}`}>
                                                        <div className="flex items-center gap-2 md:gap-3">
                                                            <div className="text-slate-400 font-mono text-[10px] md:text-sm font-bold w-4 md:w-6 text-right flex-shrink-0">{i + 1}.</div>
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-slate-700 text-xs md:text-sm whitespace-nowrap truncate max-w-[80px] md:max-w-none">{enroll.profiles?.full_name || 'Unknown'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={`p-2 md:p-4 border-l border-slate-100 text-[10px] md:text-xs font-mono font-bold text-slate-500 whitespace-nowrap transition-all ${!showMobileNames ? 'sticky left-0 bg-white group-hover:bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-300' : ''}`}>
                                                        {enroll.profiles?.registration_number || '-'}
                                                    </td>
                                                    {assignments.map(a => {
                                                        const sub = studentSubs.find(s => s.assignment_id === a.id);
                                                        return (
                                                            <td key={a.id} className="p-2 md:p-4 border-l border-slate-100 text-center whitespace-nowrap">
                                                                {sub ? (
                                                                    <div className="flex flex-col items-center">
                                                                        <span className={`font-bold text-xs md:text-sm ${sub.grade !== null ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                                                                            {sub.grade !== null ? sub.grade : 'Ungraded'}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-slate-300 font-bold">-</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-2 md:p-4 border-l border-slate-100 text-center bg-indigo-50/10 whitespace-nowrap">
                                                        {avgAi !== null ? (
                                                            <span className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs font-bold ${avgAi < 20 ? 'bg-emerald-100 text-emerald-700' :
                                                                avgAi < 50 ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>
                                                                {avgAi}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-2 md:p-4 border-l border-slate-100 text-center font-bold text-emerald-600 bg-emerald-50/10 whitespace-nowrap text-xs md:text-sm">
                                                        {totalScore}
                                                    </td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }



                {/* Students List Modal */}
                {
                    showStudentsModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                                    <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-indigo-600" /> Enrolled Students
                                    </h3>
                                    <button onClick={() => setShowStudentsModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                                <div className="overflow-y-auto p-0">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 sticky top-0 outline outline-1 outline-slate-100">
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
                                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                                    <button
                                        onClick={() => setShowStudentsModal(false)}
                                        className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Class Settings Modal */}
                {
                    showSettingsModal && (
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
                    )
                }


                {/* Edit Class Modal */}
                {
                    showEditClassModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                                    <h3 className="font-bold text-xl text-slate-900">Edit Class Details</h3>
                                    <button onClick={() => setShowEditClassModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                                <form onSubmit={handleUpdateClass}>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Class Code</label>
                                            <input
                                                type="text"
                                                required
                                                value={editClassForm.class_code}
                                                onChange={e => setEditClassForm({ ...editClassForm, class_code: e.target.value })}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="e.g. CS101"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Class Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={editClassForm.name}
                                                onChange={e => setEditClassForm({ ...editClassForm, name: e.target.value })}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="e.g. Introduction to Computer Science"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={editClassForm.start_date ? new Date(editClassForm.start_date).toISOString().split('T')[0] : ''}
                                                    onChange={e => setEditClassForm({ ...editClassForm, start_date: e.target.value })}
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">End Date</label>
                                                <input
                                                    type="date"
                                                    value={editClassForm.end_date ? new Date(editClassForm.end_date).toISOString().split('T')[0] : ''}
                                                    onChange={e => setEditClassForm({ ...editClassForm, end_date: e.target.value })}
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditClassModal(false)}
                                            className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={savingClass}
                                            className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                        >
                                            {savingClass ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                <AIInsightsModal
                    isOpen={showAIModal}
                    onClose={() => setShowAIModal(false)}
                    averageScore={avgAuthScore}
                    assignments={assignments}
                    submissions={submissions}
                    enrollments={enrollments}
                    onStudentClick={(studentId, studentName) => {
                        setShowAIModal(false);
                        setActiveTab('grades');
                        setGradesSearch(studentName);
                    }}
                />
            </div>
            {/* AI Loading Overlay */}
            {isGeneratingRubric && (
                <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center flex-col animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-6">
                        <div className="relative w-20 h-20 mx-auto">
                            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Schologic LMS</h1>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Designing Rubric...</h3>
                            <p className="text-slate-500 text-sm">Our AI is analyzing your assignment details to create a perfect grading criteria.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
