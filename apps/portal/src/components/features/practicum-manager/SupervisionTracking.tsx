'use client';

import { Lock, CheckCircle, Mail, Clock } from 'lucide-react';

export function SupervisionTracking() {
    return (
        <div className="py-24 bg-slate-900/30 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Step 2: Verification
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">Secure Log Management & Supervisor Verification</h2>
                    <p className="text-lg text-slate-400">
                        Time-windowed log submissions prevent backdating, while automated supervisor verification ensures authenticity without manual follow-ups.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Secure Log Windows */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
                                <Lock className="w-6 h-6 text-rose-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Secure Log Windows</h3>
                                <p className="text-sm text-slate-400">Prevents backdating and ensures accountability</p>
                            </div>
                        </div>

                        {/* Timeline Mock */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-20 text-xs text-slate-500 font-mono">Week 1</div>
                                <div className="flex-1 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center text-xs font-bold text-emerald-400">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Submitted
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-20 text-xs text-slate-500 font-mono">Week 2</div>
                                <div className="flex-1 h-12 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center text-xs font-bold text-blue-400">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Open Now
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-20 text-xs text-slate-500 font-mono">Week 3</div>
                                <div className="flex-1 h-12 bg-slate-800/50 border border-slate-700/30 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
                                    <Lock className="w-4 h-4 mr-2" />
                                    Locked
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                            <p className="text-sm text-slate-400">
                                <strong className="text-white">Submission windows</strong> are configured by instructors. Students can only submit logs during active periods, ensuring timely reporting and preventing retroactive entries.
                            </p>
                        </div>
                    </div>

                    {/* Right: Email Verification */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <Mail className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Automated Supervisor Verification</h3>
                                <p className="text-sm text-slate-400">No accounts required - secure email links</p>
                            </div>
                        </div>

                        {/* Email Flow Visualization */}
                        <div className="space-y-4">
                            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs font-bold text-slate-500 uppercase">Step 1</div>
                                    <div className="text-xs text-blue-400">Automated</div>
                                </div>
                                <p className="text-sm text-white">System sends secure verification email to workplace supervisor</p>
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="w-px h-8 bg-slate-700"></div>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs font-bold text-slate-500 uppercase">Step 2</div>
                                    <div className="text-xs text-emerald-400">Simple</div>
                                </div>
                                <p className="text-sm text-white">Supervisor clicks link and completes evaluation form (no login)</p>
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="w-px h-8 bg-slate-700"></div>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs font-bold text-slate-500 uppercase">Step 3</div>
                                    <div className="text-xs text-purple-400">Instant</div>
                                </div>
                                <p className="text-sm text-white">Verification recorded and instructor notified immediately</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Content */}
                <div className="mt-24 max-w-4xl mx-auto border-t border-slate-800/50 pt-16">
                    <h3 className="text-2xl font-serif font-bold text-white mb-6 text-center">Accountability Without Complexity</h3>
                    <div className="text-slate-400 leading-relaxed space-y-4">
                        <p>
                            Traditional practicum management relies on manual log collection and supervisor phone calls. Schologic eliminates this overhead with <strong className="text-white">automated verification workflows</strong> and <strong className="text-white">time-locked submission windows.</strong>
                        </p>
                        <p>
                            Supervisors receive one-time secure email links to verify student logs - no account creation or training required. The system handles authentication, data collection, and notification automatically, ensuring compliance while respecting supervisors' time.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
