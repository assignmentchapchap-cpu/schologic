"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';

export const TAInsightsVisual = () => {
    return (
        <div className="w-full max-w-2xl mx-auto relative bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-sm font-black text-slate-900 leading-none">TA Assistant</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Grading A0034</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-purple-50 border border-purple-100 rounded-lg flex items-center gap-2">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Score</span>
                        <span className="text-lg font-black text-purple-700">52 <span className="text-purple-300">/ 100</span></span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Strengths / Weaknesses Split */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
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
                    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
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
                            <div key={i} className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className="w-1/3 pr-4">
                                    <div className="text-xs font-bold text-slate-800 mb-1.5">{item.name}</div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(bar => (
                                            <div key={bar} className={`h-1.5 w-6 rounded-full ${
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
                                <div className="flex-1 px-4 text-xs text-slate-500 italic border-l border-slate-100 line-clamp-2">
                                    "{item.feedback}"
                                </div>
                                <div className="w-[80px] flex justify-end shrink-0">
                                    <div className="px-2 py-1 bg-indigo-50 rounded-md text-xs font-bold text-indigo-700 font-mono whitespace-nowrap">
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
