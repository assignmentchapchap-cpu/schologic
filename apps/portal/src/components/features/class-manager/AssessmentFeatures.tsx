'use client';

import { FileText, CheckCircle, Bell, Clock, AlertTriangle } from 'lucide-react';

export function AssessmentFeatures() {
    return (
        <div className="py-24 bg-slate-900 border-y border-slate-800">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16 items-center">

                    {/* Content Side */}
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
                            Step 2: Assessment
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">Built for Modern Evaluation</h2>
                        <p className="text-lg text-slate-400 mb-8">
                            Whether it's a quick pop quiz or a final research paper, Schologic handles it. Our assessment engine supports rich formatting, auto-grading, and intelligent deadline management.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1">Rich Assignment Editor</h4>
                                    <p className="text-slate-400 text-sm">Embed images, videos, and code blocks directly into your assignment instructions.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1">Auto-Graded Quizzes</h4>
                                    <p className="text-slate-400 text-sm">Multiple choice, true/false, and fill-in-the-blank questions are graded instantly to save you time.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                    <Bell className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1">Smart Deadlines</h4>
                                    <p className="text-slate-400 text-sm">Set grace periods and receive alerts for students who might be falling behind.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Side */}
                    <div className="lg:w-1/2 bg-slate-950 border border-slate-800 rounded-2xl p-6 relative shadow-2xl">

                        {/* Assignment Card Mockup */}
                        <div className="bg-white rounded-xl p-6 shadow-lg mb-6 max-w-md mx-auto transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-serif font-bold text-slate-900 text-lg">Midterm Essay</h4>
                                    <p className="text-slate-500 text-xs">Due Oct 15 at 11:59 PM</p>
                                </div>
                                <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">100 Pts</span>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="h-2 w-full bg-slate-100 rounded"></div>
                                <div className="h-2 w-full bg-slate-100 rounded"></div>
                                <div className="h-2 w-2/3 bg-slate-100 rounded"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs font-bold">Rubric Attached</div>
                                <div className="flex-1 h-8 bg-black rounded flex items-center justify-center text-white text-xs font-bold">Edit</div>
                            </div>
                        </div>

                        {/* Notifications Mockup (Floating) */}
                        <div className="absolute -bottom-6 -right-6 md:right-0 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl max-w-xs animate-bounce-slow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-white text-xs font-bold flex items-center gap-2">
                                    <Bell className="w-3 h-3 text-amber-400" /> Alerts
                                </span>
                                <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">2</span>
                            </div>
                            <div className="space-y-2">
                                <div className="bg-slate-700/50 p-2 rounded flex gap-2 items-start">
                                    <Clock className="w-3 h-3 text-red-400 mt-0.5" />
                                    <div>
                                        <p className="text-slate-200 text-xs font-bold">Late Submission</p>
                                        <p className="text-slate-400 text-[10px]">Alex M. submitted "Quiz 3" 2h late.</p>
                                    </div>
                                </div>
                                <div className="bg-slate-700/50 p-2 rounded flex gap-2 items-start">
                                    <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5" />
                                    <div>
                                        <p className="text-slate-200 text-xs font-bold">Missing Work</p>
                                        <p className="text-slate-400 text-[10px]">5 students haven't started "Final".</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>

            {/* SEO Content Injection: Dashboard Overview */}
            <div className="mt-24 max-w-4xl mx-auto border-t border-slate-800/50 pt-16">
                <h3 className="text-2xl font-serif font-bold text-white mb-6 text-center">Comprehensive Assessment Dashboard</h3>
                <div className="prose prose-invert max-w-none text-slate-400">
                    <p className="text-center max-w-3xl mx-auto mb-8">
                        The Class Manager dashboard is organized into four intuitive tabs designed to support the entire assessment lifecycle, from creation to final grading.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="text-white font-bold mb-2 border-l-2 border-indigo-500 pl-3">Assignments Tab</h4>
                            <p className="text-sm">
                                Centralize your coursework. Create rich-text assignments with attached rubrics, set strict deadlines, and manage extensions. Supports all major file types including <span className="text-slate-200">DOCX, PDF, and plain text</span> submissions.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-2 border-l-2 border-amber-500 pl-3">Resources Tab</h4>
                            <p className="text-sm">
                                A dedicated library for your course materials. Link external URLs, upload syllabus documents, or import zero-cost textbooks from our <span className="text-slate-200">OER Library</span> directly into your class stream.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-2 border-l-2 border-emerald-500 pl-3">Grades Tab</h4>
                            <p className="text-sm">
                                A real-time view of student performance. Filter by submission status, sort by AI integrity scores, and export detailed reports. This tab serves as your primary hub for academic oversight.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
