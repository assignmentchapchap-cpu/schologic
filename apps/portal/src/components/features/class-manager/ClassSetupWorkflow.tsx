'use client';

import { Users, BookOpen, Settings, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function ClassSetupWorkflow() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Step 1: Onboarding
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">Launch Your Course in Seconds</h2>
                    <p className="text-lg text-slate-400">
                        Skip the administrative headaches. Schologic streamlines the setup process so you can start teaching immediately.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Step 1: Create */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 relative group hover:border-indigo-500/30 transition-all">
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-white border border-slate-700 z-10 shadow-xl">
                            1
                        </div>
                        <div className="mb-8 pl-4">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-indigo-400" />
                                Create Class
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Define your term, subject, and grading settings in a single modal.
                            </p>
                        </div>
                        {/* Mock UI: Create Modal Form */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="space-y-1">
                                <div className="h-2 w-16 bg-slate-800 rounded"></div>
                                <div className="h-8 w-full bg-slate-800/50 border border-slate-700/50 rounded flex items-center px-3 text-xs text-slate-500">
                                    Introduction to Psychology
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <div className="h-2 w-12 bg-slate-800 rounded"></div>
                                    <div className="h-8 w-full bg-slate-800/50 border border-slate-700/50 rounded flex items-center px-3 text-xs text-slate-500">
                                        PSY101
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-2 w-12 bg-slate-800 rounded"></div>
                                    <div className="h-8 w-full bg-slate-800/50 border border-slate-700/50 rounded flex items-center px-3 text-xs text-slate-500">
                                        Fall 2024
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-8 bg-indigo-600 rounded flex items-center justify-center text-xs font-bold text-white mt-2">
                                Create Class
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Invite */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 relative group hover:border-emerald-500/30 transition-all">
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-white border border-slate-700 z-10 shadow-xl">
                            2
                        </div>
                        <div className="mb-8 pl-4">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-400" />
                                Invite Students
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Share a unique 6-digit code. No manual data entry required.
                            </p>
                        </div>
                        {/* Mock UI: Invite Code Card */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-4 group-hover:bg-slate-900 transition-colors">
                            <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">Join Code</div>
                            <div className="text-4xl font-mono font-bold text-white tracking-widest">
                                XJ9-2LK
                            </div>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors"
                            >
                                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                {copied ? 'Copied' : 'Copy Code'}
                            </button>
                        </div>
                    </div>

                    {/* Step 3: Resources */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 relative group hover:border-blue-500/30 transition-all">
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-white border border-slate-700 z-10 shadow-xl">
                            3
                        </div>
                        <div className="mb-8 pl-4">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-400" />
                                Add Resources
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Link PDFs, Docs, or Cartridges from your library instantly.
                            </p>
                        </div>
                        {/* Mock UI: Library List */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                            <div className="p-3 border-b border-slate-800 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            </div>
                            <div className="p-2 space-y-2">
                                <div className="flex items-center gap-3 p-2 rounded bg-slate-800/50">
                                    <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="h-2 w-3/4 bg-slate-700 rounded mb-1"></div>
                                        <div className="h-1.5 w-1/2 bg-slate-800 rounded"></div>
                                    </div>
                                    <div className="w-4 h-4 rounded-full border border-slate-600"></div>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded bg-slate-800/50">
                                    <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center text-red-400">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="h-2 w-2/3 bg-slate-700 rounded mb-1"></div>
                                        <div className="h-1.5 w-1/3 bg-slate-800 rounded"></div>
                                    </div>
                                    <div className="w-4 h-4 rounded-full bg-indigo-500 border border-indigo-500 flex items-center justify-center">
                                        <Check className="w-2 h-2 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
