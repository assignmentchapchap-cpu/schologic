'use client';

import { Shield, BarChart, Eye, Lock, Search } from 'lucide-react';

export default function IntegrityHub() {
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background Detail */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Visual: The Linguistic Forensic Dashboard */}
                    <div className="relative order-2 lg:order-1 animate-fade-in-up">
                        {/* Abstract Glow */}
                        <div className="absolute inset-0 bg-indigo-500/10 blur-3xl transform -rotate-6 rounded-3xl"></div>

                        <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-1 shadow-2xl">
                            {/* Mock Browser Header */}
                            <div className="h-10 bg-slate-800 border-b border-slate-700 rounded-t-xl flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                                </div>
                                <div className="ml-4 px-3 py-1 bg-slate-900 rounded text-[10px] font-mono text-slate-400 flex items-center gap-2 border border-slate-700/50">
                                    <Lock className="w-3 h-3 text-emerald-500" />
                                    integrity.schologic.com/analysis/viewer
                                </div>
                            </div>

                            {/* Dashboard Content */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">Target Document Analysis</div>
                                        <div className="text-lg font-bold text-white flex items-center gap-2">
                                            <Eye className="w-5 h-5 text-indigo-400" />
                                            Linguistic Fingerprint ID: #8X-292
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-mono font-bold text-red-400">92.4%</div>
                                        <div className="text-xs text-slate-500">Synthetic Probability</div>
                                    </div>
                                </div>

                                {/* Heatmap Visualization */}
                                <div className="space-y-4 mb-6">
                                    <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-serif text-sm leading-relaxed text-slate-300">
                                        <span className="bg-red-500/20 text-red-200 px-1 rounded">The socioeconomic implications of the industrial revolution</span> cannot be overstated. <span className="bg-red-500/20 text-red-200 px-1 rounded">It fundamentally shifted the paradigm of labor, transforming agrarian societies</span> into urbanized industrial powerhouses. <span className="bg-indigo-500/20 text-indigo-200 px-1 rounded">However, one must consider the localized deviations</span> from this trend in sub-Saharan contexts.
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="p-3 bg-slate-800 rounded flex flex-col items-center gap-1 border border-slate-700">
                                            <span className="text-[10px] text-slate-500 uppercase">Perplexity</span>
                                            <span className="font-mono font-bold text-red-400 text-sm">Low</span>
                                        </div>
                                        <div className="p-3 bg-slate-800 rounded flex flex-col items-center gap-1 border border-slate-700">
                                            <span className="text-[10px] text-slate-500 uppercase">Burstiness</span>
                                            <span className="font-mono font-bold text-red-400 text-sm">Linear</span>
                                        </div>
                                        <div className="p-3 bg-slate-800 rounded flex flex-col items-center gap-1 border border-slate-700">
                                            <span className="text-[10px] text-slate-500 uppercase">Entropy</span>
                                            <span className="font-mono font-bold text-orange-400 text-sm">1.2 bits</span>
                                        </div>
                                        <div className="p-3 bg-slate-800 rounded flex flex-col items-center gap-1 border border-slate-700">
                                            <span className="text-[10px] text-slate-500 uppercase">Model</span>
                                            <span className="font-mono font-bold text-indigo-400 text-sm">Apertus</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    <span className="text-xs text-emerald-300 font-mono">Evidence-Based Assertion: Human-AI Hybrid Composition detected.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copy: The Forensic Argument */}
                    <div className="order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6">
                            <Search className="w-3 h-3" />
                            Forensic Evidence
                        </div>
                        <h2 className="text-3xl md:text-5xl font-serif font-black text-white mb-6 leading-tight">
                            The "Glass Box" Approach to <br />
                            <span className="text-indigo-400">Academic Integrity.</span>
                        </h2>

                        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                            Stop guessing. "Black Box" detectors give you a score without an explanation.
                            Schologic uses <strong className="text-white">Linguistic Forensic Analysis</strong> to identify patterns of deterministic structure.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                                    <BarChart className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1">Visual Evidence Heatmaps</h4>
                                    <p className="text-slate-400 text-sm">Research shows teachers trust AI scores <strong className="text-indigo-300">3.5x more</strong> when they can see specifically why a paragraph was flagged.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1">Sovereign Data Privacy</h4>
                                    <p className="text-slate-400 text-sm">Student data remains in your institutional tenant. We match against <strong className="text-emerald-300">Open-Weights Models</strong> (Apertus-70B), ensuring full FERPA compliance without 3rd-party API leaks.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-800 flex items-center gap-4 text-xs font-mono text-slate-500">
                            <span>DATA SOURCE: HC3 CORPUS</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <span>MODEL: ROBERTa-LARGE-DETECTOR</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
