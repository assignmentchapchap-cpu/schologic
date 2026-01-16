// @ts-nocheck
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@schologic/database";
import { checkAIContent, cleanText } from '@/lib/ai-service';
import { Upload, Type, ArrowLeft, Loader2, Calendar, FileText, CheckCircle, ChevronDown, ChevronUp, Eye, X, MessageSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Database } from "@schologic/database";
import ReportView from '@/components/ReportView';
import RubricComponent from '@/components/RubricComponent';

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
    rubric: any;
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
    const [showContent, setShowContent] = useState(false);
    const [showFeedback, setShowFeedback] = useState(true);

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

    // Helper for AI Score Color
    const getAIScoreColor = (score: number) => {
        if (score < 15) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        if (score < 50) return 'bg-amber-50 text-amber-600 border-amber-100';
        return 'bg-red-50 text-red-600 border-red-100';
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-3 md:p-6">
            <div className="w-full max-w-3xl mx-auto">
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
                <div className="p-3 md:p-6 bg-white flex justify-end items-center gap-4 border-t-0 rounded-b-xl">
                    {submission ? (
                        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3">
                            {/* Status & Scores Group */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 w-full md:w-auto">
                                {/* Submitted Badge */}
                                <div className="flex items-center gap-1.5 text-emerald-600 font-bold px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100 text-xs md:text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Submitted</span>
                                </div>

                                {/* Grade Display */}
                                {submission.grade !== null ? (
                                    <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs md:text-sm">
                                        Grade: {submission.grade}/{assignment?.max_points}
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        Not graded
                                    </span>
                                )}

                                {/* AI Score Display */}
                                {submission.ai_score !== null && (
                                    <span className={`font-bold px-3 py-1.5 rounded-lg border text-xs md:text-sm ${getAIScoreColor(submission.ai_score)}`}>
                                        AI: {submission.ai_score}%
                                    </span>
                                )}
                            </div>

                            {/* Actions Group */}
                            <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-auto">
                                {/* View Content Toggle */}
                                <button
                                    onClick={() => setShowContent(!showContent)}
                                    className={`px-3 py-1.5 rounded-lg font-bold border text-xs md:text-sm transition-colors flex-1 md:flex-none justify-center flex ${showContent
                                        ? 'bg-slate-800 text-white border-slate-800'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {showContent ? 'Hide Work' : 'View Work'}
                                </button>

                                {/* View Report Button */}
                                <button
                                    onClick={() => setShowReport(true)}
                                    className="flex items-center justify-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold rounded-lg hover:bg-indigo-100 transition-colors text-xs md:text-sm flex-1 md:flex-none"
                                >
                                    <Eye className="w-4 h-4" /> Reports
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {assignment?.rubric && (
                                <Link
                                    href={`/student/assignment/${assignmentId}/rubric`}
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 w-full md:w-auto text-sm md:text-base"
                                >
                                    <Sparkles className="w-4 h-4" /> View Rubric
                                </Link>
                            )}
                            <button
                                onClick={() => setShowSubmission(!showSubmission)}
                                className={`flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-2.5 rounded-xl font-bold transition-all w-full md:w-auto text-sm md:text-base ${showSubmission
                                    ? 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                                    : 'bg-emerald-600 text-white shadow-lg hover:shadow-emerald-200 hover:bg-emerald-700'
                                    }`}
                            >
                                {showSubmission ? (
                                    <>Cancel Submission <ChevronUp className="w-4 h-4" /></>
                                ) : (
                                    <>Submit Work <ChevronDown className="w-4 h-4" /></>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Instructor Feedback Display */}
            {submission?.feedback && (
                <div className="w-full max-w-3xl mx-auto mb-6 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-indigo-50 rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
                        <button
                            onClick={() => setShowFeedback(!showFeedback)}
                            className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-indigo-100/50 transition-colors"
                        >
                            <h3 className="text-xs md:text-sm font-bold text-indigo-900 uppercase flex items-center gap-2 tracking-wider">
                                <MessageSquare className="w-4 h-4" /> Instructor Feedback
                            </h3>
                            {showFeedback ? (
                                <ChevronUp className="w-4 h-4 text-indigo-600" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-indigo-600" />
                            )}
                        </button>

                        {showFeedback && (
                            <div className="px-4 pb-4 md:px-6 md:pb-6 text-indigo-800 leading-relaxed whitespace-pre-wrap font-medium text-sm md:text-base border-t border-indigo-100/50 pt-4">
                                {submission.feedback}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Read-Only Content Viewer */}
            {showContent && submission && (
                <div className="w-full max-w-3xl mx-auto mb-6 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative group">
                        <div className="absolute top-4 right-4 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">Read Only</div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Your Submission</h3>
                        <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                            {submission.content}
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                            <span>Submitted on {new Date(submission.created_at || '').toLocaleString()}</span>
                            <span>{submission.content?.split(/\s+/).length || 0} words</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Expanded Submission Area (Only if not submitted) */}
            {showSubmission && !submission && (
                <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ring-4 ring-emerald-50/50 w-full max-w-3xl mx-auto">
                    <div className="p-3 md:p-8">
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" /> New Submission
                        </h2>

                        {analyzing || uploading ? (
                            <div className="text-center py-12 md:py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <Loader2 className="w-10 h-10 md:w-12 md:h-12 mx-auto text-emerald-500 animate-spin mb-4" />
                                <h3 className="text-base md:text-lg font-bold text-slate-800 mb-1">Analyzing Submission...</h3>
                                <p className="text-slate-500 text-xs md:text-sm">Scanning document patterns...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-4">
                                {/* 1. Text Area (Priority) */}
                                <div className="relative flex-1">
                                    <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Submission Content</label>
                                    <textarea
                                        value={textInput}
                                        onChange={e => setTextInput(e.target.value)}
                                        className={`w-full h-[50vh] md:h-96 p-3 md:p-4 border rounded-2xl resize-none focus:ring-4 outline-none transition-all font-medium text-slate-600 text-base md:text-sm leading-relaxed bg-slate-50/30 ${(assignment?.word_count && textInput.trim().split(/\s+/).filter(w => w.length > 0).length > assignment.word_count)
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                                            }`}
                                        placeholder="Paste your essay here..."
                                    />
                                    {/* Word Count Indicator */}
                                    <div className="absolute bottom-3 right-3 pointer-events-none">
                                        <div className={`text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm border shadow-sm transition-colors ${(assignment?.word_count && textInput.trim().split(/\s+/).filter(w => w.length > 0).length > assignment.word_count)
                                            ? 'bg-red-50/90 text-red-600 border-red-200'
                                            : 'bg-white/90 text-slate-400 border-slate-200'
                                            }`}>
                                            {textInput.trim().split(/\s+/).filter(w => w.length > 0).length} / {assignment?.word_count || '∞'} words
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Bottom Action Bar */}
                                <div className="flex items-center gap-3 pt-2">
                                    {/* Upload Button (Left) */}
                                    <label className="cursor-pointer group flex items-center gap-2 px-4 py-3 md:px-5 md:py-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all text-slate-600 font-bold text-sm whitespace-nowrap">
                                        <input type="file" className="sr-only" accept=".docx" onChange={handleFileUpload} />
                                        <div className="p-1 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            <Upload className="w-4 h-4" />
                                        </div>
                                        <span>Upload .docx</span>
                                    </label>


                                    {/* Submit Button (Right - Flex Grow) */}
                                    <button
                                        disabled={!textInput.trim() || (!!assignment?.word_count && textInput.trim().split(/\s+/).filter(w => w.length > 0).length > assignment.word_count)}
                                        onClick={() => handleSubmission(textInput)}
                                        className="flex-1 bg-emerald-600 text-white px-6 py-3 md:px-8 md:py-2.5 rounded-xl font-bold text-base md:text-sm shadow-lg hover:shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5 md:w-4 md:h-4" /> Submit
                                    </button>

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
