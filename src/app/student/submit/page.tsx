'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

import { checkAIContent, cleanText } from '@/lib/ai-service';
import { Upload, Type, ArrowRight, Loader2, Home } from 'lucide-react';
import Link from 'next/link';

import { Suspense } from 'react';

export default function StudentSubmitPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StudentSubmitContent />
        </Suspense>
    );
}

function StudentSubmitContent() {
    const [step, setStep] = useState(1); // 1: Identify, 2: Upload
    const [inviteCode, setInviteCode] = useState('');
    const [studentName, setStudentName] = useState('');
    const [email, setEmail] = useState('');
    const [classData, setClassData] = useState<any>(null);

    const [textInput, setTextInput] = useState('');
    const [isExamining, setIsExamining] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();

    // Auto-load effect
    useEffect(() => {
        const assignmentId = searchParams.get('assignmentId');
        if (assignmentId && step === 1 && !classData && !isExamining) {
            handleAutoLoad(assignmentId);
        }
    }, [searchParams]);

    const handleAutoLoad = async (assignmentId: string) => {
        setIsExamining(true);
        try {
            // Check current session first
            const { data: { session } } = await supabase.auth.getSession();

            // If no session, THEN sign in anonymously (or redirect to login if we preferred)
            // But for this specific "submit" flow, we might want to keep the anon logic as fallback
            if (!session) {
                const { error: authErr } = await supabase.auth.signInAnonymously();
                if (authErr) throw authErr;
            }

            await authenticateAndFindClass(null, assignmentId);
        } catch (error) {
            console.error("Auto-load failed", error);
        } finally {
            setIsExamining(false);
        }
    };

    // Step 1: Find Class & Register/Identify
    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsExamining(true);
        try {
            await authenticateAndFindClass(inviteCode);
        } catch (error: any) {
            console.error("Join Error", error);
            alert("Failed to join. " + error.message);
        } finally {
            setIsExamining(false);
        }
    };

    const authenticateAndFindClass = async (code: string | null, assignmentId?: string) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Only update profile if we gathered new data from the form
            // If auto-loading, studentName might be empty, so we skip overwriting profile
            if (studentName) {
                const { error: profErr } = await supabase.from('profiles').upsert({
                    id: user.id,
                    role: 'student',
                    full_name: studentName,
                    email: email,
                }, { onConflict: 'id', ignoreDuplicates: true });
                if (profErr) console.error("Profile Error", profErr);
            }
        } else {
            // If we somehow still don't have a user (should be caught by handleAutoLoad or handleJoin)
            const { error: authErr } = await supabase.auth.signInAnonymously();
            if (authErr) throw authErr;
        }

        let cls;
        let pIdToDelete; // In case we need cleanup (optional)

        if (assignmentId) {
            const { data: assign, error: assignErr } = await supabase
                .from('assignments')
                .select('class_id, classes(*)')
                .eq('id', assignmentId)
                .single();

            if (assignErr || !assign) throw new Error("Assignment not found");
            cls = assign.classes;
        } else if (code) {
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .eq('invite_code', code.trim().toUpperCase())
                .single();
            if (error) throw error;
            cls = data;
        }

        if (!cls) throw new Error("Class not found");

        if (cls.is_locked) {
            throw new Error("This class is currently locked for new submissions.");
        }

        setClassData(cls);
        setStep(2);
    }

    // Step 2: Submit
    const handleSubmission = async (textToAnalyze: string) => {
        setAnalyzing(true);
        try {
            const cleaned = cleanText(textToAnalyze);

            // 1. Run AI Analysis
            const analysis = await checkAIContent(cleaned, {
                model: classData.settings?.model,
                granularity: classData.settings?.granularity,
                scoring_method: classData.settings?.scoring_method
            });

            // 2. Save to DB
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !classData) return;

            // Ensure profile exists just in case (for purely anonymous users who skipped name/email form by auto-load)
            // If they are logged in, they have a profile. If they are anon, they might not.
            // But if they came from dashboard, they are logged in.

            const { data: sub, error: subErr } = await supabase.from('submissions').insert({
                student_id: user.id,
                class_id: classData.id,
                assignment_id: searchParams.get('assignmentId') || null, // Link to assignment if known
                content: cleaned,
                ai_score: analysis.globalScore,
                report_data: analysis
            }).select().single();

            if (subErr) throw subErr;

            // 3. Redirect to Results
            router.push(`/student/result/${sub.id}`);

        } catch (error: any) {
            console.error("Submission Error", error);
            alert("Submission failed. " + error.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/parse-docx', { method: 'POST', body: formData });
            if (!res.ok) throw new Error("File parsing failed");
            const { text } = await res.json();
            if (text) {
                await handleSubmission(text);
            }
        } catch (err) {
            alert("Error processing file.");
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full">

                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center relative">
                            <Link href="/" className="absolute left-0 top-0 p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                <Home className="w-6 h-6" />
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-800">Join Assessment</h1>
                            <p className="text-slate-500 mt-2">Enter your class details to begin.</p>
                        </div>

                        <form onSubmit={handleJoin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Class Invite Code</label>
                                <input
                                    value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                                    className="w-full p-3 border rounded-lg font-mono text-center text-xl tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal"
                                    placeholder="ABC-123"
                                    required
                                    maxLength={8}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    value={studentName} onChange={e => setStudentName(e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="For retrieving results later"
                                />
                            </div>
                            <button
                                disabled={isExamining}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-lg font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                {isExamining ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Class'} <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center mb-8">
                            <span className="inline-block px-3 py-1 rounded bg-slate-100 text-slate-600 text-sm font-medium mb-4">
                                Submitting to: <span className="text-emerald-700 font-bold">{classData.name}</span>
                            </span>
                            <h2 className="text-2xl font-bold text-slate-800">Submit Your Work</h2>
                        </div>

                        {analyzing ? (
                            <div className="text-center py-12">
                                <Loader2 className="w-16 h-16 mx-auto text-emerald-500 animate-spin mb-6" />
                                <h3 className="text-xl font-medium text-slate-700">Analyzing Content...</h3>
                                <p className="text-slate-500">Checking against AI patterns ({classData.settings?.model?.split('/').pop() || 'Roberta Model'})</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Tab Toggle (implied simple implementation) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="cursor-pointer block">
                                        <input type="radio" name="method" className="peer sr-only" defaultChecked />
                                        <div className="p-4 rounded-xl border-2 border-slate-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all text-center h-full flex flex-col items-center justify-center gap-2">
                                            <Type className="w-8 h-8 text-slate-400 peer-checked:text-emerald-600" />
                                            <span className="font-medium text-slate-700 peer-checked:text-emerald-800">Paste Text</span>
                                        </div>
                                    </label>
                                    <label className="cursor-pointer block relative">
                                        <input type="file" className="sr-only" accept=".docx" onChange={handleFileUpload} />
                                        <div className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 transition-all text-center h-full flex flex-col items-center justify-center gap-2">
                                            <Upload className="w-8 h-8 text-slate-400" />
                                            <span className="font-medium text-slate-700">Upload .docx</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Text Area fallback if they picked paste */}
                                <div className="relative">
                                    <textarea
                                        value={textInput}
                                        onChange={e => setTextInput(e.target.value)}
                                        className="w-full h-48 p-4 border rounded-xl resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="Paste your essay here..."
                                    />
                                    {textInput.length > 0 && (
                                        <button
                                            onClick={() => handleSubmission(textInput)}
                                            className="absolute bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-lg"
                                        >
                                            Analyze Text
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
