'use client';

import { FileText, Scale, Target } from 'lucide-react';

export function AssessmentFramework() {
    return (
        <div className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Step 3: Assessment
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">Transparent, Standardized Grading</h2>
                    <p className="text-lg text-slate-400">
                        Pre-built rubric templates for Teaching Practice and Industrial Attachment, fully customizable to match your institution's standards.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* Template Selection */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3">Built-In Templates</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Choose from industry-standard rubrics designed for Teaching Practice or Industrial Attachment programs.
                        </p>
                        <div className="space-y-2">
                            <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs">
                                <div className="font-bold text-white mb-1">Teaching Practice</div>
                                <div className="text-slate-500">Lesson planning, delivery, classroom management</div>
                            </div>
                            <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs">
                                <div className="font-bold text-white mb-1">Industrial Attachment</div>
                                <div className="text-slate-500">Technical skills, workplace conduct, tasks</div>
                            </div>
                        </div>
                    </div>

                    {/* Customization */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                            <Scale className="w-6 h-6 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3">Fully Editable</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Customize criteria, point allocations, and grading scales to align with your institutional requirements.
                        </p>
                        <div className="bg-slate-950 border border-slate-700 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-xs text-slate-400">Criterion Example</div>
                                <div className="text-xs text-emerald-400">Editable</div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="text-xs text-white">Professional Conduct</div>
                                    <div className="text-xs text-slate-500">10 pts</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-xs text-white">Technical Skills</div>
                                    <div className="text-xs text-slate-500">15 pts</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grading Components */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                            <Target className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3">100-Point Scale</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Automated grade calculation from three weighted components ensures transparent, consistent scoring.
                        </p>
                        <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-white">Supervisor Report</div>
                                <div className="text-xs font-bold text-blue-400">50%</div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-white">Final Report</div>
                                <div className="text-xs font-bold text-purple-400">30%</div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-white">Practicum Logs</div>
                                <div className="text-xs font-bold text-emerald-400">20%</div>
                            </div>
                            <div className="pt-2 border-t border-slate-600 flex justify-between items-center">
                                <div className="text-xs font-bold text-white">Final Grade</div>
                                <div className="text-sm font-bold text-white">100%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Comparison: Before/After Customization */}
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-serif font-bold text-white mb-8 text-center">Template Customization Example</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
                            <div className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wide">Default Template</div>
                            <div className="space-y-3">
                                <div className="bg-slate-950 border border-slate-700 rounded p-3 text-sm">
                                    <div className="text-white font-bold mb-1">Personal Attributes (10)</div>
                                    <div className="text-xs text-slate-400">Punctuality, appearance, attitude</div>
                                </div>
                                <div className="bg-slate-950 border border-slate-700 rounded p-3 text-sm">
                                    <div className="text-white font-bold mb-1">Core Competencies (40)</div>
                                    <div className="text-xs text-slate-400">Technical skills, problem-solving</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-6">
                            <div className="text-sm font-bold text-emerald-400 mb-4 uppercase tracking-wide">Your Custom Template</div>
                            <div className="space-y-3">
                                <div className="bg-slate-950 border border-emerald-700/30 rounded p-3 text-sm">
                                    <div className="text-white font-bold mb-1">Professionalism (15)</div>
                                    <div className="text-xs text-slate-400">Ethics, communication, teamwork</div>
                                </div>
                                <div className="bg-slate-950 border border-emerald-700/30 rounded p-3 text-sm">
                                    <div className="text-white font-bold mb-1">CBET Competencies (35)</div>
                                    <div className="text-xs text-slate-400">KNEC-aligned skill assessment</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Content */}
                <div className="mt-24 max-w-4xl mx-auto border-t border-slate-800/50 pt-16">
                    <h3 className="text-2xl font-serif font-bold text-white mb-6 text-center">Fair, Consistent Grading at Scale</h3>
                    <div className="text-slate-400 leading-relaxed space-y-4">
                        <p>
                            Schologic's <strong className="text-white">standardized assessment framework</strong> ensures every student is evaluated using the same criteria. Start with pre-built templates for <strong className="text-white">Teaching Practice</strong> or <strong className="text-white">Industrial Attachment,</strong> then customize point values and descriptions to match your institution's standards.
                        </p>
                        <p>
                            The system automatically calculates final grades from three weighted components: Supervisor Reports (50%), Final Reports (30%), and Practicum Logs (20%). Instructors can manually adjust weights or override grades when necessary, maintaining flexibility while ensuring transparency for both students and accreditation bodies.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
