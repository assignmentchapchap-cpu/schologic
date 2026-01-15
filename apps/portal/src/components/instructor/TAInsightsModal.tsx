import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, AlertTriangle, CheckCircle, RefreshCw, ChevronRight, Copy, Info, HelpCircle } from 'lucide-react';

interface TAInsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Context Props
    submissionText: string;
    instructions: string;
    rubric?: any;
    assignmentTitle: string;
    studentName: string;
    instructorName: string;
    className: string; // "class_name"
    maxPoints: number;
    aiScore: number;
}

interface TAAnalysis {
    strengths: string[];
    weaknesses: string[];
    rubric_breakdown: {
        criterion: string;
        performance_level: string;
        score: number;
        max: number;
        reason: string;
    }[];
    score: number;
}

export default function TAInsightsModal({
    isOpen,
    onClose,
    submissionText,
    instructions,
    rubric,
    assignmentTitle,
    studentName,
    instructorName,
    className,
    maxPoints,
    aiScore
}: TAInsightsModalProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<TAAnalysis | null>(null);
    const [mounted, setMounted] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            generateInsight();
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            // Reset state on close
            setLoading(true);
            setError(null);
            setAnalysis(null);
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const generateInsight = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instructions,
                    submission_text: submissionText,
                    score: aiScore, // AI Authenticity/Probability Score
                    max_points: maxPoints,
                    student_name: studentName,
                    instructor_name: instructorName,
                    class_name: className,
                    assignment_title: assignmentTitle,
                    rubric
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to generate insight');
            }

            const data = await response.json();
            if (data.analysis) {
                setAnalysis(data.analysis);
            } else {
                throw new Error("Invalid response format");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base md:text-lg font-black text-slate-800 leading-tight">TA Assistant</h2>
                            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate max-w-[120px] md:max-w-xs">
                                Grading {studentName}
                            </p>
                        </div>
                        {analysis && (
                            <div className="ml-1 md:ml-2 px-2 py-1 md:px-3 md:py-1.5 bg-purple-50 border border-purple-100 rounded-lg flex items-center gap-1.5 md:gap-2 scale-90 md:scale-100 origin-left">
                                <span className="text-[9px] md:text-[10px] font-bold text-purple-400 uppercase tracking-widest">Score</span>
                                <span className="text-lg md:text-xl font-black text-purple-600 leading-none">{analysis.score}</span>
                                <span className="text-[10px] md:text-xs font-bold text-purple-300">/ {maxPoints}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className="p-1.5 hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded-full transition-colors"
                            title="How Scoring Works"
                        >
                            <HelpCircle className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 relative min-h-[400px]">

                    {showInfo && (
                        <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center justify-center text-center">
                            <div className="max-w-md space-y-6">
                                <div className="p-3 bg-indigo-50 rounded-full w-fit mx-auto text-indigo-600">
                                    <HelpCircle className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">How AI Scoring Works</h3>
                                    <p className="text-slate-500 text-sm">
                                        The AI evaluates each criterion against strict performance standards to ensure fair and consistent grading.
                                    </p>
                                </div>
                                <div className="bg-white border boundary-indigo-100 rounded-2xl shadow-sm text-left overflow-hidden">
                                    <div className="divide-y divide-slate-100">
                                        <div className="p-3 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 uppercase">Exceptional</p>
                                                <p className="text-[11px] text-slate-500">Exceeds all requirements.</p>
                                            </div>
                                        </div>
                                        <div className="p-3 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 uppercase">Very Good</p>
                                                <p className="text-[11px] text-slate-500">Strong work with minor errors.</p>
                                            </div>
                                        </div>
                                        <div className="p-3 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 uppercase">Good</p>
                                                <p className="text-[11px] text-slate-500">Satisfactory throughout.</p>
                                            </div>
                                        </div>
                                        <div className="p-3 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 uppercase">Average</p>
                                                <p className="text-[11px] text-slate-500">Basic performance with gaps.</p>
                                            </div>
                                        </div>
                                        <div className="p-3 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 uppercase">Poor</p>
                                                <p className="text-[11px] text-slate-500">Fails to meet minimums.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowInfo(false)}
                                    className="text-indigo-600 font-bold text-sm hover:underline"
                                >
                                    Close Guide
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 transition-all duration-300">
                            <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                            <p className="text-slate-600 font-bold animate-pulse">Analyzing Submission...</p>
                            <p className="text-xs text-slate-400 mt-2">Consulting rubric & instructions</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Analysis Failed</h3>
                            <p className="text-slate-500 max-w-sm mb-6">{error}</p>
                            <button
                                onClick={generateInsight}
                                className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" /> Try Again
                            </button>
                        </div>
                    ) : analysis ? (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                            {/* Strengths & Weaknesses Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Strengths */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Strengths
                                    </h3>
                                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 h-full">
                                        <ul className="space-y-3">
                                            {analysis.strengths.map((point, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                                                    <span className="text-emerald-500 font-bold text-lg leading-none">•</span>
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Weaknesses */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Weaknesses
                                    </h3>
                                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 h-full">
                                        <ul className="space-y-3">
                                            {analysis.weaknesses.map((point, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                                                    <span className="text-amber-500 font-bold text-lg leading-none">•</span>
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Rubric Breakdown (Structured Rationale) */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Scoring Rationale
                                </h3>
                                <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
                                    <div className="divide-y divide-indigo-50">
                                        {analysis.rubric_breakdown?.map((item, i) => (
                                            <div key={i} className="py-2 px-3 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
                                                {/* Criterion */}
                                                <div className="col-span-4 flex flex-col gap-1 pr-1 md:pr-2">
                                                    <span className="font-bold text-slate-800 text-xs md:text-[13px] leading-tight line-clamp-2">{item.criterion}</span>

                                                    {/* Performance Level Indicator */}
                                                    <div className="flex items-center gap-0.5" title={item.performance_level}>
                                                        {[1, 2, 3, 4, 5].map((segment) => {
                                                            let filled = false;
                                                            let colorClass = "bg-slate-100"; // Empty state

                                                            const level = item.performance_level?.toLowerCase() || "";
                                                            let activeCount = 0;
                                                            let activeColor = "";

                                                            if (level.includes('exceptional')) { activeCount = 5; activeColor = "bg-emerald-500"; }
                                                            else if (level.includes('very good')) { activeCount = 4; activeColor = "bg-emerald-400"; }
                                                            else if (level.includes('good')) { activeCount = 3; activeColor = "bg-yellow-400"; }
                                                            else if (level.includes('average')) { activeCount = 2; activeColor = "bg-orange-400"; }
                                                            else if (level.includes('poor')) { activeCount = 1; activeColor = "bg-red-400"; }

                                                            if (segment <= activeCount) {
                                                                colorClass = activeColor;
                                                            }

                                                            return (
                                                                <div
                                                                    key={segment}
                                                                    className={`h-1.5 w-3 rounded-full ${colorClass}`}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Rationale */}
                                                <div className="col-span-6 text-xs text-slate-500 italic leading-snug">
                                                    "{item.reason}"
                                                </div>

                                                {/* Score */}
                                                <div className="col-span-2 flex justify-end">
                                                    <div className="flex items-center gap-0.5 md:gap-1 bg-indigo-50 px-1.5 py-1 md:px-2 md:py-1 rounded-md md:rounded-lg">
                                                        <span className="font-bold text-indigo-700 text-xs md:text-sm">{item.score}</span>
                                                        <span className="text-[9px] md:text-[10px] text-indigo-300 uppercase font-bold">/{item.max}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : null}
                </div>


            </div>
        </div>,
        document.body
    );
}

