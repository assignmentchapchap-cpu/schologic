'use client';

import { User, Calendar, MapPin, Edit } from 'lucide-react';

export function PlacementWorkflow() {
    return (
        <div className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Step 1: Enrollment
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">From Application to Approval in Minutes</h2>
                    <p className="text-lg text-slate-400">
                        Automated enrollment with comprehensive student profiles. Choose auto-approval or manual review based on your institution's requirements.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Step 1: Detailed Enrollment */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative group hover:border-purple-500/30 transition-all">
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-white border border-slate-700 z-10 shadow-xl">
                            1
                        </div>
                        <div className="mb-6 pl-4">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-400" />
                                Student Applies
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Complete profile with academic data, workplace details, supervisor info, and schedule.
                            </p>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="h-6 w-32 bg-slate-800 rounded"></div>
                            <div className="h-4 w-full bg-slate-800/50 rounded"></div>
                            <div className="h-4 w-3/4 bg-slate-800/50 rounded"></div>
                            <div className="h-4 w-5/6 bg-slate-800/50 rounded"></div>
                        </div>
                    </div>

                    {/* Step 2: Approval */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative group hover:border-purple-500/30 transition-all">
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-white border border-slate-700 z-10 shadow-xl">
                            2
                        </div>
                        <div className="mb-6 pl-4">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-emerald-400" />
                                Location Verified
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Optional geolocation capture for placement verification and reference.
                            </p>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <MapPin className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div className="text-xs text-slate-500">Coordinates Captured</div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Timeline Auto-Generated */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative group hover:border-purple-500/30 transition-all">
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-white border border-slate-700 z-10 shadow-xl">
                            3
                        </div>
                        <div className="mb-6 pl-4">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                Timeline Created
                            </h3>
                            <p className="text-slate-400 text-sm">
                                System generates week-by-week milestones based on start and end dates.
                            </p>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                <div className="h-2 w-20 bg-slate-700 rounded"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                <div className="h-2 w-24 bg-slate-800 rounded"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                <div className="h-2 w-16 bg-slate-800 rounded"></div>
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Customization */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative group hover:border-purple-500/30 transition-all">
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-white border border-slate-700 z-10 shadow-xl">
                            4
                        </div>
                        <div className="mb-6 pl-4">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Edit className="w-5 h-5 text-amber-400" />
                                Fully Customizable
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Edit milestones, add events, and adjust the schedule to your needs.
                            </p>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-center">
                            <div className="w-full h-8 bg-amber-600/20 border border-amber-600/30 rounded flex items-center justify-center text-xs font-bold text-amber-400">
                                Edit Timeline
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Content */}
                <div className="mt-24 max-w-4xl mx-auto border-t border-slate-800/50 pt-16">
                    <h3 className="text-2xl font-serif font-bold text-white mb-6 text-center">Intelligent Placement Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-400 leading-relaxed">
                        <div>
                            <h4 className="text-purple-400 font-bold mb-2">Comprehensive Student Profiles</h4>
                            <p className="mb-4">
                                Students provide detailed information during enrollment: <strong className="text-slate-200">academic details, workplace information, supervisor contacts, and working schedules.</strong> All data is validated and stored securely for instructor review.
                            </p>
                            <p>
                                Optional geolocation capture ensures students are at approved placement sites, with coordinates stored as a reference point for ongoing verification.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-blue-400 font-bold mb-2">Automated Timeline Generation</h4>
                            <p className="mb-4">
                                Once enrollment is approved, Schologic automatically generates a <strong className="text-slate-200">week-by-week practicum timeline</strong> based on your configured start and end dates.
                            </p>
                            <p>
                                Instructors can customize milestones, add special events, or adjust deadlines - ensuring flexibility while maintaining structure and accountability throughout the practicum period.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
