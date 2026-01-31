'use client';

import { Sparkles, Clock, Users } from 'lucide-react';

export default function ApertusTA() {
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

                        <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">Schologic TA</div>
                                        <div className="text-xs text-indigo-600 font-mono">Status: Reasoning...</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6 font-sans text-sm">
                                {/* User Message */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-500 font-bold">P</div>
                                    <div className="bg-slate-100 rounded-2xl rounded-tl-none p-4 text-slate-700 max-w-[90%]">
                                        Score this intro paragraph based on the "Thesis Clarity" rubric criteria. It feels a bit vague.
                                    </div>
                                </div>

                                {/* AI Response */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-white shadow-lg shadow-indigo-200">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-3 max-w-[90%]">
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl rounded-tl-none p-4 text-slate-800">
                                            <strong className="block text-indigo-700 text-xs uppercase tracking-wide mb-2 font-bold">Suggested Feedback</strong>
                                            The thesis attempts to address the prompt but lacks a specific improved direction. It mentions "economic factors" generally but doesn't specify <em>which</em> factors (e.g. inflation, labor markets) are driving the trend.
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                                                Apply Feedback
                                            </button>
                                            <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
