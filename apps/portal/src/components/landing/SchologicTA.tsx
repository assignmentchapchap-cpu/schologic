import { Sparkles, Clock, Users } from 'lucide-react';
import dynamic from 'next/dynamic';

import { TAInsightsVisual } from '@/components/landing/visuals/LazyVisuals';

export default function SchologicTA() {
    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden border-y border-slate-200">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Copy Section */}
                    <div className="lg:w-1/2 space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-widest">
                            <Users className="w-3 h-3" />
                            Faculty Retention Engine
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 leading-tight">
                            Replace "Administrative Drag" with <br />
                            <span className="text-indigo-600">High-Reasoning Automation.</span>
                        </h2>
                        <p className="text-xl text-slate-500 leading-relaxed font-light">
                            Burnout isn't caused by teaching; it's caused by grading.
                            Give every instructor a <strong className="text-slate-900 font-medium">Schologic Teaching Assistant</strong>.
                        </p>

                        <div className="space-y-6 pt-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 text-indigo-600">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">Instant Rubric Generation</h4>
                                    <p className="text-slate-500 text-sm">Convert simple prompts into pedagogical rubrics in seconds.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 text-indigo-600">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">Draft Feedback in &lt; 2 Minutes</h4>
                                    <p className="text-slate-500 text-sm">AI drafts actionable, specific feedback. Human-in-the-loop ensures faculty remain the final authority.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Section: The "Assistant" UI */}
                    <div className="lg:w-1/2 w-full relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl transform rotate-3 opacity-10 blur-xl"></div>
                        <TAInsightsVisual />
                    </div>

                </div>
            </div>
        </section>
    );
}
