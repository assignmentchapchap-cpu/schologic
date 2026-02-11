'use client';

import { MapPin, Files, History, Download, Shield } from 'lucide-react';

export function ComplianceTools() {
    return (
        <div className="py-24 bg-slate-900/30 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Step 4: Compliance
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">Built for Accreditation & Audit Readiness</h2>
                    <p className="text-lg text-slate-400">
                        Geolocation verification, comprehensive audit trails, and one-click export capabilities ensure your practicum program meets institutional and regulatory standards.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    {/* Geolocation */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Geolocation Verification</h3>
                                <p className="text-sm text-slate-400">Optional GPS tracking for on-site confirmation</p>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-4">
                            {/* Map placeholder */}
                            <div className="aspect-video bg-slate-950 rounded-lg border border-slate-700 flex items-center justify-center mb-4">
                                <div className="text-center">
                                    <MapPin className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                                    <div className="text-xs text-slate-500">Verified Location</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <div className="text-slate-400">Reference Point Captured</div>
                                <div className="text-emerald-400 font-bold">✓ Active</div>
                            </div>
                        </div>

                        <p className="text-sm text-slate-400">
                            Enable geolocation for programs requiring physical presence verification. Student locations are captured during enrollment and checked with each log submission.
                        </p>
                    </div>

                    {/* Document Management */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <Files className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Document Repository</h3>
                                <p className="text-sm text-slate-400">Centralized storage for all practicum materials</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-red-500/20 flex items-center justify-center">
                                    <Files className="w-5 h-5 text-red-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white truncate">Student_Logbook.pdf</div>
                                    <div className="text-xs text-slate-500">Submitted 2 weeks ago</div>
                                </div>
                                <Download className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center">
                                    <Files className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white truncate">Final_Report.docx</div>
                                    <div className="text-xs text-slate-500">Submitted 3 days ago</div>
                                </div>
                                <Download className="w-4 h-4 text-slate-400" />
                            </div>
                        </div>

                        <p className="text-sm text-slate-400">
                            All student submissions, supervisor reports, and instructor resources stored securely in one location with version tracking.
                        </p>
                    </div>
                </div>

                {/* Bottom Row: Audit Trail + Export */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Audit Trail */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <History className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Complete Audit Trail</h3>
                                <p className="text-sm text-slate-400">Track every submission, edit, and approval</p>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-3">
                            <div className="flex gap-3 text-xs">
                                <div className="font-mono text-slate-500">14:32</div>
                                <div className="flex-1">
                                    <div className="text-white">Log submitted by student</div>
                                    <div className="text-slate-500">Week 3 practicum log</div>
                                </div>
                            </div>
                            <div className="flex gap-3 text-xs">
                                <div className="font-mono text-slate-500">15:18</div>
                                <div className="flex-1">
                                    <div className="text-white">Supervisor verified log</div>
                                    <div className="text-slate-500">Email confirmation received</div>
                                </div>
                            </div>
                            <div className="flex gap-3 text-xs">
                                <div className="font-mono text-slate-500">09:45</div>
                                <div className="flex-1">
                                    <div className="text-white">Instructor graded submission</div>
                                    <div className="text-slate-500">Score: 18/20</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Export Capabilities */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <Download className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Export Everything</h3>
                                <p className="text-sm text-slate-400">Generate reports for accreditation</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-left transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-white">Final Grades (CSV)</div>
                                        <div className="text-xs text-slate-400">All students with component breakdown</div>
                                    </div>
                                    <Download className="w-4 h-4 text-slate-400" />
                                </div>
                            </button>
                            <button className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-left transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-white">Compliance Report (PDF)</div>
                                        <div className="text-xs text-slate-400">Complete audit trail with timestamps</div>
                                    </div>
                                    <Download className="w-4 h-4 text-slate-400" />
                                </div>
                            </button>
                            <button className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-left transition-colors group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-white flex items-center gap-2">
                                            AI Content Detection
                                            <Shield className="w-3.5 h-3.5 text-blue-400" />
                                        </div>
                                        <div className="text-xs text-slate-400">Final reports scanned for AI-generated content</div>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* SEO Content */}
                <div className="mt-24 max-w-4xl mx-auto border-t border-slate-800/50 pt-16">
                    <h3 className="text-2xl font-serif font-bold text-white mb-6 text-center">Accreditation-Ready Documentation</h3>
                    <div className="text-slate-400 leading-relaxed space-y-4">
                        <p>
                            Regulatory bodies and accreditation agencies require comprehensive documentation of practicum activities. Schologic maintains <strong className="text-white">complete audit trails</strong> of all submissions, approvals, and grade changes - automatically timestamped and attributed to specific users.
                        </p>
                        <p>
                            Export capabilities include <strong className="text-white">CSV gradebooks and PDF compliance reports,</strong> ensuring you can quickly respond to audit requests or institutional reporting requirements without manual data compilation. Final reports are automatically scanned for AI-generated content using Schologic's integrated detection system.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
