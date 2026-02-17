"use client";

import React, { useState } from 'react';
import { Sparkles, Info, X } from 'lucide-react';
import { cn } from "@/lib/utils";

export const TAInsightsVisual = () => {
    const [showDescription, setShowDescription] = useState(false);

    return (
        <div
            className="w-full relative bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden font-sans"
            role="img"
            aria-label="Example AI Grading Report showing strengths and weaknesses analysis"
            data-nosnippet
        >
            {/* SEO Description Overlay */}
            {showDescription && (
                <div className="absolute inset-0 z-50 bg-white/98 backdrop-blur-sm p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <Info className="w-5 h-5" />
                            <h4 className="font-bold">Visual Description</h4>
                        </div>
                        <button
                            onClick={() => setShowDescription(false)}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            This example AI Grading Report provides a detailed analysis of student strengths and weaknesses.
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            The TA Insights module is designed to help instructors acquire a quick overview of the submission and enables them to grade faster without sacrificing feedback quality.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowDescription(false)}
                        className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-sm"
                    >
                        Got it, back to visual
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="bg-slate-50 px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-sm font-black text-slate-900 leading-none">TA Assistant</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Grading A0034</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex px-3 py-1 bg-purple-50 border border-purple-100 rounded-lg items-center gap-2">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Score</span>
                        <span className="text-lg font-black text-purple-700">52 <span className="text-purple-300">/ 100</span></span>
                    </div>
                    <button
                        onClick={() => setShowDescription(!showDescription)}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            showDescription ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        )}
                        title="Show Description"
                    >
                        <Info className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="p-2 md:p-6 space-y-3 md:space-y-8">
                {/* Strengths / Weaknesses Split */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {/* Strengths */}
                    <div className="p-2 md:p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                        <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            Strengths
                        </div>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                                Clearly explains the purpose and examples of each learning type.
                            </li>
                            <li className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                                Provides key differences between supervised, unsupervised, and reinforcement learning.
                            </li>
                        </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="p-2 md:p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                        <div className="flex items-center gap-2 mb-3 text-amber-700 font-bold text-xs uppercase tracking-wider">
                            <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                                <div className="w-0.5 h-2.5 bg-amber-500 rounded-full"></div>
                            </div>
                            Weaknesses
                        </div>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                                Lacks nuanced differentiation between learning types in explanation.
                            </li>
                            <li className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                                Could improve clarity and organization for better flow.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Scoring Rationale Table */}
                <div>
                    <div className="flex items-center gap-2 mb-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest pl-1">
                        <div className="w-3 h-3 rounded-full border border-slate-300 flex items-center justify-center text-[8px]">i</div>
                        Scoring Rationale
                    </div>

                    <div className="space-y-1">
                        {[
                            {
                                name: "Understanding of Supervised Learning",
                                feedback: "Provides examples and use cases but lacks depth in explanation.",
                                score: 11,
                                max: 20
                            },
                            {
                                name: "Understanding of Unsupervised Learning",
                                feedback: "Examples and use cases are clear but explanation could be more detailed.",
                                score: 12,
                                max: 21
                            },
                            {
                                name: "Understanding of Reinforcement Learning",
                                feedback: "Examples are provided but explanation could be more comprehensive.",
                                score: 12,
                                max: 21
                            },
                            {
                                name: "Differentiation Between Learning Types",
                                feedback: "Initial explanation lacks clarity; differentiation improves in key differences.",
                                score: 9,
                                max: 21
                            },
                            {
                                name: "Clarity and Organization",
                                feedback: "Transitions between explanations could be smoother; minor grammatical errors.",
                                score: 8,
                                max: 17
                            }
                        ].map((item, i) => (
                            <div key={i} className="group flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 gap-2">
                                <div className="w-1/4 md:w-1/3 shrink-0">
                                    <div className="text-[10px] md:text-xs font-bold text-slate-800 mb-1 leading-tight">{item.name}</div>
                                    <div className="flex gap-0.5 md:gap-1">
                                        {[1, 2, 3, 4].map(bar => (
                                            <div key={bar} className={`h-1 w-3 md:h-1.5 md:w-6 rounded-full ${
                                                // Logic to simulate strict grading visualization
                                                (item.score / item.max) > (bar * 0.25)
                                                    ? 'bg-amber-400'
                                                    : (item.score / item.max) > ((bar - 1) * 0.25)
                                                        ? 'bg-amber-200'
                                                        : 'bg-slate-100'
                                                }`}></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 text-[9px] md:text-xs text-slate-500 italic border-l border-slate-100 pl-2 md:pl-4 line-clamp-2 md:line-clamp-none">
                                    "{item.feedback}"
                                </div>
                                <div className="w-[60px] md:w-[80px] flex justify-end shrink-0">
                                    <div className="px-1.5 py-0.5 md:px-2 md:py-1 bg-indigo-50 rounded-md text-[9px] md:text-xs font-bold text-indigo-700 font-mono whitespace-nowrap">
                                        {item.score} <span className="text-indigo-300">/ {item.max}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
