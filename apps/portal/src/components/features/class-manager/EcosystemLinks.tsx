'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';

export function EcosystemLinks() {
    return (
        <div className="py-24 bg-slate-950 border-t border-slate-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-2xl font-serif font-bold text-white mb-4">Complete Your Teaching Toolkit</h2>
                    <p className="text-slate-400">Class Manager works best when paired with our content and grading pillars.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                    {/* OER Link */}
                    <Link href="/features/oer-library" className="group block relative bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:bg-slate-900 hover:border-indigo-500/30 transition-all overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BookOpen className="w-32 h-32 text-indigo-400 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6">
                                <BookOpen className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Build a Zero-Cost Curriculum</h3>
                            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                                Import free, peer-reviewed textbooks from our OER Library directly into your class resources.
                            </p>
                            <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                                Explore OER Library <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </Link>

                    {/* AI TA Link */}
                    <Link href="/features/ai-teaching-assistant" className="group block relative bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:bg-slate-900 hover:border-amber-500/30 transition-all overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="w-32 h-32 text-amber-400 -rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                                <Sparkles className="w-6 h-6 text-amber-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Automate Your Grading</h3>
                            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                                Connect assignments to our AI Teaching Assistant to generate rubrics and draft feedback instantly.
                            </p>
                            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                                Meet Schologic TA <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </Link>

                </div>
            </div>
        </div>
    );
}
