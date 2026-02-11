'use client';

import { AlertTriangle, Download, FileText, CheckCircle, BarChart } from 'lucide-react';

export default function IntegrityDashboard() {
    return (
        <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden font-sans border border-slate-100">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Submission Analysis</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span className="font-medium text-slate-700">Alpha Duja</span>
                        <span>•</span>
                        <span>Introduction to AI</span>
                        <span>•</span>
                        <span>1/30/2026</span>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-50/50 space-y-6">
                {/* Top Row: Probability & Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Probability Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>

                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            <BarChart className="w-4 h-4" />
                            AI Probability
                        </div>

                        <div className="text-7xl font-black text-red-600 mb-4 tracking-tight">
                            55%
                        </div>

                        <p className="text-slate-500 text-sm font-medium">
                            Document shows strong patterns consistent <br /> with AI generation.
                        </p>
                    </div>

                    {/* Distribution Analysis Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-bold text-slate-700">Distribution Analysis</h4>
                            <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
                                <span className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded">Human</span>
                                <span className="text-amber-500 bg-amber-50 px-2 py-1 rounded">Mixed</span>
                                <span className="text-red-500 bg-red-50 px-2 py-1 rounded">AI</span>
                            </div>
                        </div>

                        {/* Mock Chart */}
                        <div className="h-32 flex items-end justify-between gap-1 px-2 relative">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                <div className="border-t border-dashed border-slate-100 w-full"></div>
                                <div className="border-t border-dashed border-slate-100 w-full"></div>
                                <div className="border-t border-dashed border-slate-100 w-full"></div>
                            </div>

                            {/* Bars */}
                            {[80, 15, 20, 45, 80, 25, 60, 15, 40, 60, 25, 75, 10, 80, 45, 90, 15].map((height, i) => {
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
                        <div className="flex items-center gap-2 font-bold text-slate-700 text-sm uppercase tracking-wide">
                            <FileText className="w-4 h-4 text-slate-400" />
                            Segment Analysis
                        </div>
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <Download className="w-3 h-3" />
                            Export PDF
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex items-start gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xs font-mono text-slate-300">#01</span>
                                    <span className="px-2 py-0.5 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Flagged
                                    </span>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    Supervised learning uses labeled data to predict outcomes, unsupervised learning finds hidden patterns in unlabeled data, and reinforcement learning (RL) trains agents via rewards through trial-and-error interaction. Supervised learning is for mapping inputs to known outputs, while unsupervised learning focuses on structure discovery, and RL focuses on maximizing future rewards.
                                </p>
                            </div>

                            <div className="w-32 shrink-0 text-right">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence</div>
                                <div className="text-xl font-black text-red-600">100.0%</div>
                                <div className="w-full h-1 bg-red-100 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-red-600 w-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
