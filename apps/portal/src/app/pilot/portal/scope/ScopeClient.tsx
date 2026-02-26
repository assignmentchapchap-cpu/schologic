"use client";

import { usePilotForm } from "@/components/pilot/PilotFormContext";
import { CheckCircle2, Home, Users, Monitor, GraduationCap } from "lucide-react";

export function ScopeClient({ pilot }: { pilot: any }) {
    const { register, watch, setValue } = usePilotForm();

    // Watch current form state for modules
    const coreModules = watch("scope_jsonb.core_modules") || [];
    const addOns = watch("scope_jsonb.add_ons") || [];

    // Watch constraints
    const maxStudents = watch("scope_jsonb.max_students");
    const maxInstructors = watch("scope_jsonb.max_instructors");
    const pilotWeeks = watch("scope_jsonb.pilot_period_weeks");

    const CORE_OPTIONS = [
        { id: "Class Manager", label: "Class Manager", desc: "Core LMS & grading functionality" },
        { id: "Practicum Manager", label: "Practicum Manager", desc: "Internship & attachment tracking" }
    ];

    const ADDON_OPTIONS = [
        { id: "AI Forensics", label: "AI Detection & Forensics", desc: "Advanced plagiarism analysis" },
        { id: "AI Assistant", label: "AI Teaching Assistant", desc: "Automated tutoring & feedback" },
        { id: "OER Library", label: "OER & Universal Reader", desc: "Digital resource library" }
    ];

    const toggleArrayItem = (path: any, currentArray: string[], value: string) => {
        if (currentArray.includes(value)) {
            setValue(path, currentArray.filter(i => i !== value), { shouldDirty: true, shouldValidate: true });
        } else {
            setValue(path, [...currentArray, value], { shouldDirty: true, shouldValidate: true });
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* 1. Institutional Summary Card */}
            <div className="bg-white border text-sm border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 md:items-center">
                <div className="flex-1 space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-4 md:divide-x divide-slate-100">
                    <div>
                        <p className="text-slate-500 font-medium mb-1 flex items-center gap-1.5"><Home className="w-4 h-4" /> Institution</p>
                        <p className="font-bold text-slate-900">{pilot.institution}</p>
                    </div>
                    <div className="md:px-4">
                        <p className="text-slate-500 font-medium mb-1 flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> Type</p>
                        <p className="font-bold text-slate-900">{pilot.institution_type || 'Unknown'}</p>
                    </div>
                    <div className="md:px-4">
                        <p className="text-slate-500 font-medium mb-1 flex items-center gap-1.5"><Users className="w-4 h-4" /> Size</p>
                        <p className="font-bold text-slate-900">{pilot.institution_size}</p>
                    </div>
                    <div className="md:px-4">
                        <p className="text-slate-500 font-medium mb-1 flex items-center gap-1.5"><Monitor className="w-4 h-4" /> Current LMS</p>
                        <p className="font-bold text-slate-900">{pilot.current_lms}</p>
                    </div>
                </div>
            </div>

            {/* 2. Module Selection */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Module Scope</h2>
                    <p className="text-sm text-slate-500">Toggle the modules to be enabled during this pilot. These define what your team will test.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Core Foundations */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" /> Core Foundations
                        </h3>
                        <div className="space-y-3">
                            {CORE_OPTIONS.map(opt => {
                                const active = coreModules.includes(opt.id);
                                return (
                                    <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${active ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                                        <input type="checkbox" checked={active} onChange={() => toggleArrayItem("scope_jsonb.core_modules", coreModules, opt.id)} className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                                        <div>
                                            <p className={`text-sm font-bold ${active ? 'text-indigo-900' : 'text-slate-700'}`}>{opt.label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Value Accelerators */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500" /> Value Accelerators
                        </h3>
                        <div className="space-y-3">
                            {ADDON_OPTIONS.map(opt => {
                                const active = addOns.includes(opt.id);
                                return (
                                    <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${active ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                                        <input type="checkbox" checked={active} onChange={() => toggleArrayItem("scope_jsonb.add_ons", addOns, opt.id)} className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300" />
                                        <div>
                                            <p className={`text-sm font-bold ${active ? 'text-amber-900' : 'text-slate-700'}`}>{opt.label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Constraints & Limits */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Constraints & Logistics</h2>
                    <p className="text-sm text-slate-500">Define the physical parameters of the sandbox environment.</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm grid md:grid-cols-3 gap-6">
                    {/* Period */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Pilot Period (Weeks)</label>
                        <div className="relative">
                            <input
                                type="number"
                                min={2} max={12}
                                {...register("scope_jsonb.pilot_period_weeks", { valueAsNumber: true })}
                                className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">WKS</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Standard pilots run 2 to 4 weeks. Extended pilots require approval.</p>
                    </div>

                    {/* Instructors */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Max Instructors</label>
                        <div className="relative">
                            <input
                                type="number"
                                min={1} max={20}
                                {...register("scope_jsonb.max_instructors", { valueAsNumber: true })}
                                className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">SEATS</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Limit the number of staff actively testing the platform.</p>
                    </div>

                    {/* Students */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Max Students</label>
                        <div className="relative">
                            <input
                                type="number"
                                min={10} max={1000} step={10}
                                {...register("scope_jsonb.max_students", { valueAsNumber: true })}
                                className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">SEATS</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Maximum test student capability across all sandbox courses.</p>
                    </div>
                </div>
            </div>

            {/* Target Departments input simply using comma separated string -> arrays or just text */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <label className="block text-sm font-bold text-slate-700 mb-2">Target Departments (Optional)</label>
                <input
                    type="text"
                    placeholder="e.g. Computer Science, Business School, Nursing..."
                    value={(watch("scope_jsonb.target_departments") || []).join(', ')}
                    onChange={(e) => {
                        const depts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setValue("scope_jsonb.target_departments", depts, { shouldDirty: true });
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">Comma separated list of participating departments or faculties.</p>
            </div>
        </div>
    );
}
