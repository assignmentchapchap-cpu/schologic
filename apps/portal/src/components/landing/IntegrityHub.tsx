'use client';

import { Shield, BarChart, Eye, Lock, Search } from 'lucide-react';
import IntegrityDashboard from '@/components/features/IntegrityDashboard';

export default function IntegrityHub() {
    return (
        <div className="w-full">
            <div className="flex flex-col gap-8 items-center">

                {/* Copy: The Forensic Argument (Centered/Wide) */}
                <div className="w-full max-w-4xl mx-auto text-center md:text-left">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-200 text-xs font-bold uppercase tracking-widest mb-4">
                                <Search className="w-3 h-3" />
                                Forensic Evidence
                            </div>
                            <h2 className="text-3xl md:text-4xl font-serif font-black text-white mb-4 leading-tight">
                                The "Glass Box" Approach to <br />
                                <span className="text-amber-500">Academic Integrity.</span>
                            </h2>

                            <p className="text-lg text-slate-400 leading-relaxed">
                                Stop guessing. "Black Box" detectors give you a score without an explanation.
                                Schologic uses <strong className="text-white">Linguistic Forensic Analysis</strong> to identify patterns of deterministic structure.
                            </p>
                        </div>

                        <div className="flex-1 space-y-6 pt-2">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                                    <BarChart className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-white font-bold text-lg mb-1">Visual Evidence Heatmaps</h4>
                                    <p className="text-slate-400 text-sm">Research shows teachers trust AI scores <strong className="text-amber-200">3.5x more</strong> when they can see specifically why a paragraph was flagged.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-white font-bold text-lg mb-1">Sovereign Data Privacy</h4>
                                    <p className="text-slate-400 text-sm">Student data remains in your institutional tenant. We match against <strong className="text-emerald-300">Open-Weights Models</strong>, ensuring full FERPA compliance without 3rd-party API leaks.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual: The Linguistic Forensic Dashboard (Full Width) */}
                <div className="w-full relative animate-fade-in-up">
                    {/* Abstract Glow */}
                    <div className="absolute inset-0 bg-amber-600/10 blur-3xl transform -rotate-1 rounded-3xl"></div>

                    <div className="relative transform origin-center">
                        <IntegrityDashboard />
                    </div>
                </div>

            </div>
        </div>
    );
}
