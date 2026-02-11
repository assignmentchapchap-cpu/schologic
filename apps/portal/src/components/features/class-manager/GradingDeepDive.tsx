'use client';

import { Download, Filter, BarChart, Search } from 'lucide-react';

export function GradingDeepDive() {
    return (
        <div className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Step 3: Grading & Analytics
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">Data-Driven Grading</h2>
                    <p className="text-lg text-slate-400">
                        Stop juggling spreadsheets. Use our advanced grid to filter by AI score, identify at-risk students, and export reports in seconds.
                    </p>
                </div>

                {/* The Grid Visual */}
                <div className="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mb-12">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between bg-slate-900/50">
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type="text" placeholder="Search student..." className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white w-64 focus:outline-none focus:border-emerald-500" disabled />
                            </div>
                            <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm hover:bg-slate-700 transition">
                                <Filter className="w-4 h-4" /> Filter
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-3 py-2 bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 text-sm font-bold rounded-lg hover:bg-emerald-600/20 transition">
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-12 bg-slate-800/50 text-slate-400 text-xs font-bold uppercase tracking-wider p-4 border-b border-slate-800">
                        <div className="col-span-4 pl-2">Student</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="col-span-2 text-center">AI Score</div>
                        <div className="col-span-2 text-center">Grade</div>
                        <div className="col-span-2 text-right pr-2">Actions</div>
                    </div>

                    {/* Table Rows (Mock Data) */}
                    <div className="divide-y divide-slate-800/50 text-sm">
                        {/* Row 1 */}
                        <div className="grid grid-cols-12 p-4 items-center hover:bg-slate-800/30 transition-colors group">
                            <div className="col-span-4 flex items-center gap-3 pl-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">JD</div>
                                <div>
                                    <div className="text-white font-bold">Jane Doe</div>
                                    <div className="text-slate-500 text-xs">ID: 882910</div>
                                </div>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Submitted</span>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="text-emerald-400 font-bold">12%</span>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="text-white font-mono">92/100</span>
                            </div>
                            <div className="col-span-2 text-right pr-2">
                                <button className="text-indigo-400 hover:text-indigo-300 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">Review</button>
                            </div>
                        </div>

                        {/* Row 2 - Problematic */}
                        <div className="grid grid-cols-12 p-4 items-center hover:bg-slate-800/30 transition-colors bg-red-500/5 group">
                            <div className="col-span-4 flex items-center gap-3 pl-2">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border border-slate-600">MS</div>
                                <div>
                                    <div className="text-white font-bold">Mark Smith</div>
                                    <div className="text-slate-500 text-xs">ID: 112039</div>
                                </div>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20">Late (2h)</span>
                            </div>
                            <div className="col-span-2 text-center flex items-center justify-center gap-1">
                                <span className="text-red-400 font-bold">88%</span>
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="text-slate-500 font-mono">--/100</span>
                            </div>
                            <div className="col-span-2 text-right pr-2">
                                <button className="text-indigo-400 hover:text-indigo-300 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">Grade</button>
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-12 p-4 items-center hover:bg-slate-800/30 transition-colors group">
                            <div className="col-span-4 flex items-center gap-3 pl-2">
                                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold border border-pink-500/30">EL</div>
                                <div>
                                    <div className="text-white font-bold">Emily Liu</div>
                                    <div className="text-slate-500 text-xs">ID: 993812</div>
                                </div>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Submitted</span>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="text-emerald-400 font-bold">4%</span>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="text-white font-mono">98/100</span>
                            </div>
                            <div className="col-span-2 text-right pr-2">
                                <button className="text-indigo-400 hover:text-indigo-300 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">Review</button>
                            </div>
                        </div>
                    </div>
                    {/* Footer */}
                    <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
                        <span>Showing 3 of 45 students</span>
                        <div className="flex gap-2">
                            <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">1</div>
                            <div className="w-6 h-6 rounded bg-transparent border border-transparent hover:bg-slate-800 flex items-center justify-center cursor-pointer">2</div>
                        </div>
                    </div>
                </div>

                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4">
                            <BarChart className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-white font-bold mb-2">Class-Wide Analytics</h3>
                        <p className="text-slate-400 text-sm">Visualize integrity trends across the entire semester to spot outliers early.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4">
                            <Filter className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-white font-bold mb-2">Smart Filters</h3>
                        <p className="text-slate-400 text-sm">Instantly view only 'Needs Grading' or 'High AI Score' submissions.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4">
                            <Download className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-white font-bold mb-2">One-Click Export</h3>
                        <p className="text-slate-400 text-sm">Download your entire gradebook as CSV or generate PDF reports for administration.</p>
                    </div>
                </div>

                {/* SEO Content Injection: AI Settings & Exports */}
                <div className="mt-24 max-w-4xl mx-auto border-t border-slate-800/50 pt-16">
                    <h3 className="text-2xl font-serif font-bold text-white mb-8 text-center">Advanced Configuration & Reporting</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-400 leading-relaxed mb-12">
                        <div>
                            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs">AI</span>
                                AI Detection Settings
                            </h4>
                            <p className="mb-4">
                                Schologic gives you granular control over integrity monitoring. Configure detection settings on a per-class basis:
                            </p>
                            <ul className="space-y-2 list-disc pl-5 text-sm">
                                <li>
                                    <strong className="text-slate-200">Model Selection:</strong> Choose between RoBERTa Large for broad academic writing or specialized models like AI Content Detector for detecting chat-based generation.
                                </li>
                                <li>
                                    <strong className="text-slate-200">Scan Granularity:</strong> Toggle between sentence-level analysis for quizzes or paragraph-level scanning for long-form essays.
                                </li>
                                <li>
                                    <strong className="text-slate-200">Scoring Method:</strong> Apply weighted scoring to prioritize high-confidence flags or strict binary scoring for zero-tolerance policies.
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs">EX</span>
                                Flexible Data Export
                            </h4>
                            <p className="mb-4">
                                Your data belongs to you. The grading grid supports instant export functionality for administrative reporting and archival purposes.
                            </p>
                            <ul className="space-y-2 list-disc pl-5 text-sm">
                                <li>
                                    <strong className="text-slate-200">PDF Reports:</strong> Generate formal class performance summaries suitable for departmental review.
                                </li>
                                <li>
                                    <strong className="text-slate-200">CSV/Excel Export:</strong> Download raw grade data including Student IDs, assignment scores, and AI integrity metrics for offline analysis.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
