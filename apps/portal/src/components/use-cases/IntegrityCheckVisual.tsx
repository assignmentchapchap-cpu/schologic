"use client";

import React, { useState } from 'react';
import { BarChart, FileText, Download, AlertTriangle, Info, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

export const IntegrityCheckVisual = () => {
    const [showDescription, setShowDescription] = useState(false);

    return (
        <div
            className="w-full relative bg-white rounded-xl shadow-xl overflow-hidden font-sans border border-slate-100 transform hover:scale-[1.1] md:hover:scale-[1.02] transition-transform duration-500"
            role="img"
            aria-label="AI Detection Report Example showing 55% probability score"
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
                            This AI Detection Report example shows a 55% probability score.
                            It demonstrates the use of the <strong>sentence granularity</strong> setting, where the AI detector scans each sentence separately to isolate specific AI-generated claims.
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            You can learn more about this forensic analysis in the <Link href="/features/ai-detection" className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">AI detector page <ExternalLink className="w-3 h-3" /></Link>.
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
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Submission Analysis</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-medium text-slate-700">Alpha Duja</span>
                        <span>•</span>
                        <span>Intro to AI</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-xs font-mono text-slate-400">1/30/2026</div>
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

            <div className="p-3 md:p-6 bg-slate-50/50 space-y-4 md:space-y-6">
                <div className="grid grid-cols-2 gap-3 md:gap-6">
                    {/* AI Probability Card */}
                    <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>

                        <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-2">
                            <BarChart className="w-3 h-3 md:w-4 h-4" />
                            <span className="truncate">AI Prob.</span>
                        </div>

                        <div className="text-3xl md:text-6xl font-black text-red-600 mb-2 md:mb-4 tracking-tight">
                            55%
                        </div>

                        <p className="text-slate-500 text-[9px] md:text-xs font-medium leading-tight">
                            Strong AI patterns <br className="hidden md:block" /> detected.
                        </p>
                    </div>

                    {/* Distribution Analysis Card */}
                    <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-3 md:mb-6">
                            <h4 className="font-bold text-slate-700 text-[10px] md:text-sm truncate">Distribution</h4>
                            <div className="hidden sm:flex gap-1 text-[8px] md:text-[9px] font-bold uppercase tracking-wider">
                                <span className="text-emerald-500 bg-emerald-50 px-1 py-0.5 rounded">H</span>
                                <span className="text-red-500 bg-red-50 px-1 py-0.5 rounded">A</span>
                            </div>
                        </div>

                        {/* Mock Chart */}
                        <div className="h-20 md:h-32 flex items-end justify-between gap-0.5 md:gap-1 px-1 relative">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                <div className="border-t border-dashed border-slate-100 w-full"></div>
                                <div className="border-t border-dashed border-slate-100 w-full"></div>
                            </div>

                            {/* Bars - Reduced set for mobile */}
                            {[70, 15, 45, 80, 25, 60, 40, 60, 25, 75, 80, 90].map((height, i) => {
                                let color = "bg-emerald-400";
                                if (height > 40) color = "bg-amber-400";
                                if (height > 70) color = "bg-red-500";
                                return (
                                    <div key={i} className={`w-full rounded-t-sm ${color}`} style={{ height: `${height}%` }}></div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Segment Analysis */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                        <div className="flex items-center gap-2 font-bold text-slate-700 text-xs uppercase tracking-wide">
                            <FileText className="w-4 h-4 text-slate-400" />
                            Segment Analysis
                        </div>
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <Download className="w-3 h-3" />
                            PDF
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[10px] font-mono text-slate-300">#01</span>
                                    <span className="px-2 py-0.5 bg-red-50 border border-red-100 text-red-600 text-[9px] font-bold uppercase tracking-wider rounded flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Flagged
                                    </span>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-xs">
                                    Supervised learning uses labeled data to predict outcomes, unsupervised learning finds hidden patterns in unlabeled data, and reinforcement learning (RL) trains agents via rewards through trial-and-error interaction. Supervised learning is for mapping inputs...
                                </p>
                            </div>

                            <div className="w-24 shrink-0 text-right">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence</div>
                                <div className="text-lg font-black text-red-600">100.0%</div>
                                <div className="w-full h-1 bg-red-100 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-red-600 w-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
