"use client";

import { useState } from "react";
import { usePilotForm } from "@/components/pilot/PilotFormContext";
import { CheckCircle2, Home, Users, Monitor, GraduationCap, History, Pencil, X, Save, AlertTriangle } from "lucide-react";
import { updatePilotData } from "@/app/actions/pilotPortal";


export function ScopeClient({ pilot, profile }: { pilot: any, profile: any }) {
    const { register, watch, setValue, getValues, formState, reset } = usePilotForm();
    const [showChangelog, setShowChangelog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [deptText, setDeptText] = useState(() => (getValues("scope_jsonb.target_departments") || []).join(", "));
    const isCompleted = (watch("completed_tabs_jsonb") || []).includes("scope");
    const isChampion = profile?.id === pilot?.champion_id;
    const userTasks = watch("tasks_jsonb") || [];
    const hasTaskWrite = userTasks.some((t: any) => t.tab === 'scope' && t.assignments?.[profile?.id] === 'write');
    const hasWriteAccess = isChampion || hasTaskWrite;
    const isReadOnly = isCompleted || !hasWriteAccess;

    // Watch current form state for modules and constraints
    const coreModules = watch("scope_jsonb.core_modules") || [];
    const addOns = watch("scope_jsonb.add_ons") || [];
    const pilotWeeks = watch("scope_jsonb.pilot_period_weeks") || 4;
    const maxInstructors = watch("scope_jsonb.max_instructors") || 5;
    const maxStudents = watch("scope_jsonb.max_students") || 200;

    // Real-time Inline Validation
    const validationErrors = {
        coreModules: coreModules.length === 0 ? "Select at least 1 Core Foundation module." : null,
        addOns: addOns.length === 0 ? "Select at least 1 Value Accelerator." : null,
        pilotWeeks: (pilotWeeks > 4 || pilotWeeks < 1) ? "Period must be 1 to 4 weeks." : null,
        maxInstructors: (maxInstructors > 5 || maxInstructors < 1) ? "Instructors must be 1 to 5." : null,
        maxStudents: (maxStudents > 200 || maxStudents < 20) ? "Students must be 20 to 200." : null,
    };
    const hasErrors = Object.values(validationErrors).some(err => err !== null);


    let EditorName = 'Unknown Member';
    if (profile) {
        if (profile.first_name && profile.last_name) {
            EditorName = `${profile.first_name} ${profile.last_name}`;
        } else if (profile.email) {
            EditorName = profile.email.split('@')[0];
        }
    }

    const handleManualSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const data = getValues();
            const scope = data.scope_jsonb;

            // Core Validations
            if (!scope.core_modules || scope.core_modules.length === 0) {
                throw new Error("You must select at least one Core Foundation module.");
            }
            if (!scope.add_ons || scope.add_ons.length === 0) {
                throw new Error("You must select at least one Value Accelerator.");
            }
            if (scope.pilot_period_weeks > 4) {
                throw new Error("Pilot period cannot exceed 4 weeks.");
            }
            if (scope.max_instructors < 1 || scope.max_instructors > 5) {
                throw new Error("Max Instructors must be between 1 and 5.");
            }
            if (scope.max_students < 20 || scope.max_students > 200) {
                throw new Error("Max Students must be between 20 and 200.");
            }

            // Append to persistent changelog
            const currentLog = getValues("changelog_jsonb") || {};
            const entry = { time: new Date().toISOString(), user: EditorName, action: 'Saved scope changes' };
            const scopeEntries = currentLog['scope'] || [];
            const updatedLog = { ...currentLog, scope: [entry, ...scopeEntries].slice(0, 20) };
            setValue("changelog_jsonb", updatedLog);

            const res = await updatePilotData({ scope_jsonb: scope, changelog_jsonb: updatedLog });
            if (res?.error) throw new Error(res.error);

            setLastSaved(new Date());
            setIsEditing(false);
        } catch (err: any) {
            console.error("Save error:", err);
            setError(err.message || "Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        reset(); // Revert any unsaved changes
        setDeptText((getValues("scope_jsonb.target_departments") || []).join(", ")); // Revert input string
        setIsEditing(false);
        setError(null);
    };

    const CORE_OPTIONS = [
        { id: "Class Manager", label: "Class Manager", desc: "Core LMS & grading functionality" },
        { id: "Practicum Manager", label: "Practicum Manager", desc: "Internship & attachment tracking" }
    ];

    const ADDON_OPTIONS = [
        { id: "AI Forensics", label: "AI Detection & Forensics", desc: "Advanced plagiarism analysis" },
        { id: "AI Assistant", label: "AI Teaching Assistant", desc: "Automated rubric & submission analysis" },
        { id: "OER Library", label: "OER & Universal Reader", desc: "Digital resource library" }
    ];

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4 relative z-50">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Pilot Blueprint: Scope</h1>
                    <div className="flex items-center gap-2">
                        <p className="text-slate-500 text-sm">Define what modules will be tested and constraints on the deployment.</p>
                        {!hasWriteAccess && !isChampion && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full border border-amber-100">
                                <AlertTriangle className="w-3 h-3" /> Read Only
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons - Top right */}
                <div className="flex flex-col items-end gap-3 relative z-50">
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                                <button
                                    onClick={handleManualSave}
                                    disabled={isSaving || hasErrors}
                                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> Save Changes</>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowChangelog(!showChangelog)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold transition-colors rounded-lg ${showChangelog ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <History className="w-4 h-4" /> History
                                </button>
                                <button
                                    onClick={() => !isCompleted && hasWriteAccess && setIsEditing(true)}
                                    disabled={isCompleted || !hasWriteAccess}
                                    title={isCompleted ? "Unmark as completed to edit" : (!hasWriteAccess ? "You do not have write permissions for this tab" : "")}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold shadow-sm rounded-lg transition-colors ${isCompleted || !hasWriteAccess ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <Pencil className="w-4 h-4" /> Edit Scope
                                </button>
                            </>
                        )}
                    </div>

                    {/* Status Text under buttons */}
                    {!isEditing && (
                        <div className="text-xs font-medium text-slate-400">
                            {lastSaved ? (
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    Last edited by {EditorName} at {lastSaved.toLocaleTimeString()}
                                </span>
                            ) : (() => {
                                // Show most recent entry from persistent changelog for this tab
                                const allLog = watch("changelog_jsonb") || {};
                                const scopeEntries = (allLog['scope'] || []).sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
                                const latest = scopeEntries[0] as any;
                                if (latest) {
                                    return (
                                        <span className="flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            Last edited by {latest.user} at {new Date(latest.time).toLocaleTimeString()}
                                        </span>
                                    );
                                }
                                return (
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> No changes recorded
                                    </span>
                                );
                            })()}
                        </div>
                    )}

                    {error && <span className="text-xs font-bold text-red-500">{error}</span>}

                    {/* Changelog Dropdown */}
                    {!isEditing && showChangelog && (() => {
                        const TAB_LABELS: Record<string, string> = {
                            scope: 'Scope', team: 'Team', kpis: 'KPIs', branding: 'Branding',
                            settings: 'Settings', dashboard: 'Dashboard', preview: 'Preview',
                        };
                        const allLog = watch("changelog_jsonb") || {};
                        const scopeEntries = (allLog['scope'] || [])
                            .map((e: any) => ({ ...e, tab: 'scope' }))
                            .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
                            .slice(0, 30);

                        if (scopeEntries.length === 0) return (
                            <div className="absolute top-full mt-2 right-0 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 animate-in fade-in slide-in-from-top-2">
                                <p className="text-xs text-slate-400 text-center">No edit history yet.</p>
                            </div>
                        );

                        return (
                            <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-xs font-bold text-slate-900 px-3 py-2 border-b border-slate-100 mb-1">Edit History</h4>
                                <div className="max-h-64 overflow-y-auto">
                                    {scopeEntries.map((log: any, idx: number) => (
                                        <div key={idx} className="px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-slate-700 text-xs font-medium truncate">{log.user}</span>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">{TAB_LABELS[log.tab] || log.tab}</span>
                                                    <span className="text-slate-400 text-[10px]">{new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{log.action}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Context / Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white border text-sm border-slate-200 rounded-xl p-6 shadow-sm space-y-6 sticky top-24">
                        <div>
                            <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Institutional Context</h3>
                        </div>
                        <div>
                            <p className="text-slate-500 font-medium mb-1 flex items-center gap-1.5"><Home className="w-4 h-4" /> Institution</p>
                            <p className="font-bold text-slate-900">{pilot.institution}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-medium mb-1 flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> Type</p>
                            <p className="font-bold text-slate-900">{pilot.institution_type || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-medium mb-1 flex items-center gap-1.5"><Users className="w-4 h-4" /> Size</p>
                            <p className="font-bold text-slate-900">{pilot.institution_size}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-medium mb-1 flex items-center gap-1.5"><Monitor className="w-4 h-4" /> Current LMS</p>
                            <p className="font-bold text-slate-900">{pilot.current_lms}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Configuration Forms */}
                <div className="lg:w-2/3 space-y-8">
                    {/* 2. Module Selection */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Module Scope</h2>
                            <p className="text-sm text-slate-500">Toggle the modules to be enabled during this pilot. These define what your team will test.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Core Foundations */}
                            <div className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 transition-colors ${isEditing && validationErrors.coreModules ? 'border-red-400 bg-red-50/10' : 'border-slate-200'}`}>
                                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center justify-between">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Core Foundations</span>
                                    {isEditing && validationErrors.coreModules && <span className="text-xs text-red-500 normal-case">{validationErrors.coreModules}</span>}
                                </h3>
                                <div className="space-y-3">
                                    {CORE_OPTIONS.map(opt => {
                                        const active = coreModules.includes(opt.id);
                                        return (
                                            <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${isEditing ? 'cursor-pointer hover:border-slate-300' : 'pointer-events-none'} ${active ? (isEditing ? 'bg-indigo-50 border-indigo-300' : 'bg-indigo-50 border-indigo-500 shadow-sm ring-1 ring-indigo-500') : (isEditing ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60 grayscale')}`}>
                                                <input
                                                    type="checkbox"
                                                    tabIndex={isEditing && !isReadOnly ? 0 : -1}
                                                    value={opt.id}
                                                    disabled={!isEditing || isReadOnly}
                                                    {...register("scope_jsonb.core_modules")}
                                                    className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 disabled:opacity-50"
                                                />
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
                            <div className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 transition-colors ${isEditing && validationErrors.addOns ? 'border-red-400 bg-red-50/10' : 'border-slate-200'}`}>
                                <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest flex items-center justify-between">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Value Accelerators</span>
                                    {isEditing && validationErrors.addOns && <span className="text-xs text-red-500 normal-case">{validationErrors.addOns}</span>}
                                </h3>
                                <div className="space-y-3">
                                    {ADDON_OPTIONS.map(opt => {
                                        const active = addOns.includes(opt.id);
                                        return (
                                            <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${isEditing ? 'cursor-pointer hover:border-slate-300' : 'pointer-events-none'} ${active ? (isEditing ? 'bg-amber-50 border-amber-300' : 'bg-amber-50 border-amber-500 shadow-sm ring-1 ring-amber-500') : (isEditing ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60 grayscale')}`}>
                                                <input
                                                    type="checkbox"
                                                    tabIndex={isEditing ? 0 : -1}
                                                    value={opt.id}
                                                    {...register("scope_jsonb.add_ons")}
                                                    className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300"
                                                />
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
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Constraints & Logistics</h2>
                            <p className="text-sm text-slate-500">Define the physical parameters of the sandbox environment.</p>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm grid md:grid-cols-3 gap-6">
                            {/* Period */}
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Pilot Period (Weeks)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={1} max={4}
                                        disabled={!isEditing}
                                        {...register("scope_jsonb.pilot_period_weeks", { valueAsNumber: true })}
                                        className={`w-full pl-4 pr-12 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium disabled:bg-slate-50 disabled:text-slate-900 disabled:opacity-100 ${isEditing && validationErrors.pilotWeeks ? 'border-red-400 text-red-900 bg-red-50/10' : 'border-slate-200'}`}
                                    />
                                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold ${isEditing && validationErrors.pilotWeeks ? 'text-red-400' : 'text-slate-400'}`}>WKS</span>
                                </div>
                                {isEditing && validationErrors.pilotWeeks ? (
                                    <p className="text-xs font-bold text-red-500 mt-2">{validationErrors.pilotWeeks}</p>
                                ) : (
                                    <p className="text-xs text-slate-500 mt-2">Standard pilots run 1 to 4 weeks.</p>
                                )}
                            </div>

                            {/* Instructors */}
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Max Instructors</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={1} max={5}
                                        disabled={!isEditing}
                                        {...register("scope_jsonb.max_instructors", { valueAsNumber: true })}
                                        className={`w-full pl-4 pr-12 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium disabled:bg-slate-50 disabled:text-slate-900 disabled:opacity-100 ${isEditing && validationErrors.maxInstructors ? 'border-red-400 text-red-900 bg-red-50/10' : 'border-slate-200'}`}
                                    />
                                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold ${isEditing && validationErrors.maxInstructors ? 'text-red-400' : 'text-slate-400'}`}>SEATS</span>
                                </div>
                                {isEditing && validationErrors.maxInstructors ? (
                                    <p className="text-xs font-bold text-red-500 mt-2">{validationErrors.maxInstructors}</p>
                                ) : (
                                    <p className="text-xs text-slate-500 mt-2">Limit the number of staff actively testing the platform.</p>
                                )}
                            </div>

                            {/* Students */}
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Max Students</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={20} max={200} step={10}
                                        disabled={!isEditing}
                                        {...register("scope_jsonb.max_students", { valueAsNumber: true })}
                                        className={`w-full pl-4 pr-12 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium disabled:bg-slate-50 disabled:text-slate-900 disabled:opacity-100 ${isEditing && validationErrors.maxStudents ? 'border-red-400 text-red-900 bg-red-50/10' : 'border-slate-200'}`}
                                    />
                                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold ${isEditing && validationErrors.maxStudents ? 'text-red-400' : 'text-slate-400'}`}>SEATS</span>
                                </div>
                                {isEditing && validationErrors.maxStudents ? (
                                    <p className="text-xs font-bold text-red-500 mt-2">{validationErrors.maxStudents}</p>
                                ) : (
                                    <p className="text-xs text-slate-500 mt-2">Maximum test student capability across all sandbox courses.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Target Departments input simply using comma separated string -> arrays or just text */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Target Departments (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. Computer Science, Business School, Nursing..."
                            value={deptText}
                            disabled={!isEditing}
                            onChange={(e) => {
                                setDeptText(e.target.value);
                                const depts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                setValue("scope_jsonb.target_departments", depts, { shouldDirty: true });
                            }}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium disabled:bg-slate-50 disabled:text-slate-900 disabled:opacity-100"
                        />
                        <p className="text-xs text-slate-500 mt-2">Comma separated list of participating departments or faculties.</p>
                    </div>

                    {/* Completion Action */}

                </div>
            </div>
        </div>
    );
}
