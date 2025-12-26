'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { checkAIContent, cleanText } from '@/lib/ai-service';
import { Upload, Type, ArrowLeft, Loader2, Calendar, FileText, CheckCircle, ChevronDown, ChevronUp, Eye, X } from 'lucide-react';
import Link from 'next/link';
import { Database } from '@/lib/database.types';
import ReportView from '@/components/ReportView';

type AssignmentDetails = Database['public']['Tables']['assignments']['Row'] & {
    classes: {
        name: string;
        settings: any;
        end_date: string | null;
        profiles: {
            settings: any;
        } | null;
    } | null;
} & {
    word_count: number | null;
    reference_style: string | null;
    short_code: string | null;
};

type SubmissionDetails = Database['public']['Tables']['submissions']['Row'];

export default function AssignmentSubmitPageParams({ params }: { params: Promise<{ assignmentId: string }> }) {
    const { assignmentId } = use(params);
    return <AssignmentSubmitPage assignmentId={assignmentId} />
}

function AssignmentSubmitPage({ assignmentId }: { assignmentId: string }) {
    const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
    const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSubmission, setShowSubmission] = useState(false);
    const [showReport, setShowReport] = useState(false);

    // Submission State
    const [textInput, setTextInput] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [uploading, setUploading] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        loadData();
    }, [assignmentId]);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/student/login');
                return;
            }

            // Parallel fetch: Assignment + Submission
            const [assignRes, subRes] = await Promise.all([
                supabase
                    .from('assignments')
                    .select('*, classes(name, settings, end_date, profiles(settings))')
                    .eq('id', assignmentId)
                    .single(),
                supabase
                    .from('submissions')
                    .select('*')
                    .eq('assignment_id', assignmentId)
                    .eq('student_id', user.id)
                    .maybeSingle()
            ]);

            if (assignRes.error) throw assignRes.error;
            setAssignment(assignRes.data);

            if (subRes.data) {
                setSubmission(subRes.data);
            }
        } catch (error) {
            console.error("Error loading data", error);
            // alert("Error loading assignment.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmission = async (content: string) => {
        if (!assignment) return;

        // Guard Clause: Prevent re-submission
        if (submission) {
            alert("This assignment has already been submitted.");
            return;
        }

        setAnalyzing(true);
        try {
            const cleaned = cleanText(content);
            // Resolve Settings (Merge Global + Class Override)
            const globalSettings = assignment.classes?.profiles?.settings || {};
            const classSettings = assignment.classes?.settings || {};

            // Helper to get effective value
            const getSetting = (key: string, defaultVal: any) => {
                // If class has the key, it overrides. Otherwise use global, then default.
                // We check if the key exists in classSettings object logic (handled by backend usually, but here we do simple merge)
                if (classSettings && Object.keys(classSettings).includes(key)) return classSettings[key];
                return globalSettings[key] !== undefined ? globalSettings[key] : defaultVal;
            };

            const effectiveSettings = {
                model: getSetting('model', undefined),
                granularity: getSetting('granularity', undefined),
                scoring_method: getSetting('scoring_method', undefined),
                late_policy: getSetting('late_policy', 'strict'),
                allowed_file_types: getSetting('allowed_file_types', ['txt', 'docx'])
            };

            // 1. Check Late Policy
            if (assignment.due_date && new Date() > new Date(assignment.due_date)) {
                const isLate = true; // Logic simplified for brevity
                const policy = effectiveSettings.late_policy;

                if (policy === 'strict') {
                    alert("Submission Failed: The due date has passed (Strict Policy).");
                    return;
                }

                if (policy === 'grace_48h') {
                    const diffHours = (new Date().getTime() - new Date(assignment.due_date).getTime()) / (1000 * 60 * 60);
                    if (diffHours > 48) {
                        alert("Submission Failed: The 48-hour grace period has passed.");
                        return;
                    }
                }

                if (policy === 'class_end') {
                    if (assignment.classes?.end_date && new Date() > new Date(assignment.classes.end_date)) {
                        alert("Submission Failed: The class has ended.");
                        return;
                    }
                }
            }

            // 2. Run AI Analysis
            const analysis = await checkAIContent(cleaned, {
                model: effectiveSettings.model,
                granularity: effectiveSettings.granularity,
                scoring_method: effectiveSettings.scoring_method
            });

            // 2. Save to DB
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data: sub, error: subErr } = await supabase
                .from('submissions')
                .insert({
                    student_id: user.id,
                    class_id: assignment.class_id,
                    assignment_id: assignment.id,
                    content: cleaned,
                    ai_score: analysis.globalScore,
                    report_data: analysis
                })
                .select()
                .single();

            if (subErr) throw subErr;

            // 3. Update local state to "Submitted" (NO REDIRECT)
            setSubmission(sub);
            setShowSubmission(false);
            // Optional: Auto-open report
            setShowReport(true);

        } catch (error: any) {
            console.error("Submission Error", error);
            alert("Submission failed: " + error.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validating File Type
        if (assignment) {
            const globalSettings = assignment.classes?.profiles?.settings || {};
            const classSettings = assignment.classes?.settings || {};

            // Simple merge logic repeated (refactor if repeated often)
            const allowedTypes: string[] = (classSettings && classSettings.allowed_file_types)
                ? classSettings.allowed_file_types
                : (globalSettings.allowed_file_types || ['txt', 'docx']);

            const ext = file.name.split('.').pop()?.toLowerCase();
            // Map docx to docx, etc. 
            // Note: 'txt' usually means text/plain.

            if (ext && !allowedTypes.includes(ext)) {
                alert(`File type .${ext} is not allowed. Allowed types: ${allowedTypes.join(', ').toUpperCase()}`);
                return;
            }
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/parse-docx', { method: 'POST', body: formData });
            if (!res.ok) throw new Error("File parsing failed");

            const { text } = await res.json();
            if (text) {
                await handleSubmission(text);
            }
        } catch (err: any) {
            alert("Error processing file: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-3xl">
                <Link
                    href={assignment ? `/student/class/${assignment.class_id}` : '/student/dashboard'}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors font-medium text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {assignment ? 'Back to Class Dashboard' : 'Back to Home'}
                </Link>

                {/* Assignment Details Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">{assignment?.title}</h1>
                                <p className="text-slate-500 font-medium">{assignment?.classes?.name}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        {assignment?.short_code && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                ID: {assignment.short_code}
                                            </span>
                                        )}
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${new Date(assignment?.due_date!) < new Date()
                                            ? 'bg-red-50 text-red-600 border-red-100'
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(assignment?.due_date!).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {assignment?.word_count && (
                                            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                Max {assignment.word_count} words
                                            </span>
                                        )}
                                        {assignment?.reference_style && (
                                            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                {assignment.reference_style}
                                            </span>
                                        )}
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                                            {assignment?.max_points} Pts
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {assignment?.description && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-600 text-sm leading-relaxed">
                            {assignment.description}
                        </div>
                    )}
                </div>

                {/* Action Bar */}
                <div className="p-6 bg-white flex justify-end items-center gap-4">
                    {submission ? (
                        <div className="flex items-center gap-4 w-full justify-between">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                                <CheckCircle className="w-5 h-5" />
                                <span>Assignment Submitted</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {submission.grade !== null ? (
                                    <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                        Grade: {submission.grade}/{assignment?.max_points}
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-lg">
                                        Not yet graded
                                    </span>
                                )}
                                <button
                                    onClick={() => setShowReport(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors text-sm"
                                >
                                    <Eye className="w-4 h-4" /> View AI Report
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowSubmission(!showSubmission)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${showSubmission
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-emerald-600 text-white shadow-lg hover:shadow-emerald-200 hover:bg-emerald-700'
                                }`}
                        >
                            {showSubmission ? (
                                <>Cancel Submission <ChevronUp className="w-4 h-4" /></>
                            ) : (
                                <>Submit Work <ChevronDown className="w-4 h-4" /></>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded Submission Area (Only if not submitted) */}
            {showSubmission && !submission && (
                <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-emerald-600" /> New Submission
                        </h2>

                        {analyzing || uploading ? (
                            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <Loader2 className="w-12 h-12 mx-auto text-emerald-500 animate-spin mb-4" />
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Analyzing Submission...</h3>
                                <p className="text-slate-500 text-sm">Scanning document patterns...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="cursor-pointer block relative group">
                                        <input type="radio" name="method" className="peer sr-only" defaultChecked />
                                        <div className="p-6 rounded-2xl border-2 border-slate-200 peer-checked:border-indigo-500 peer-checked:bg-indigo-50/30 transition-all text-center h-full flex flex-col items-center justify-center gap-3">
                                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl peer-checked:bg-indigo-600 peer-checked:text-white transition-colors">
                                                <Type className="w-6 h-6" />
                                            </div>
                                            <span className="font-bold text-slate-700">Paste Text</span>
                                        </div>
                                    </label>
                                    <label className="cursor-pointer block relative group">
                                        <input type="file" className="sr-only" accept=".docx" onChange={handleFileUpload} />
                                        <div className="p-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-400 transition-all text-center h-full flex flex-col items-center justify-center gap-3">
                                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <span className="font-bold text-slate-700">Upload .docx</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="relative">
                                    <textarea
                                        value={textInput}
                                        onChange={e => setTextInput(e.target.value)}
                                        className="w-full h-64 p-4 border border-slate-200 rounded-2xl resize-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-600"
                                        placeholder="Paste your essay here..."
                                    />
                                    <div className="absolute bottom-4 right-4">
                                        <button
                                            disabled={!textInput.trim()}
                                            onClick={() => handleSubmission(textInput)}
                                            className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95 flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Analyze & Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Report Modal */}
            {
                showReport && submission && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h2 className="text-xl font-bold text-slate-800">AI Analysis Report</h2>
                                <button
                                    onClick={() => setShowReport(false)}
                                    className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                <ReportView
                                    score={submission!.ai_score || 0}
                                    reportData={submission!.report_data as any || {}}
                                    readOnly={true}
                                />
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
