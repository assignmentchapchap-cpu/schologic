"use client";

import { useState, useCallback, useMemo } from "react";
import { usePilotForm } from "@/components/pilot/PilotFormContext";
import {
    CheckCircle2, Save, ChevronDown, RotateCcw,
    BookOpen, Users, Settings, FileText, Archive, AlertTriangle
} from "lucide-react";
import { usePilotAutosave } from "@/hooks/usePilotAutosave";
import { TabHeader } from "@/components/pilot/common/TabHeader";


// ─── Full Permissions Matrix ────────────────────────────────
// Mirrors: permission_matrix.md — all fields and their defaults

const PERMISSION_GROUPS = [
    {
        id: "classes",
        title: "Class Management",
        icon: BookOpen,
        color: "text-blue-500",
        bg: "bg-blue-50",
        description: "What instructors can do at the class level and within individual classes.",
        masterSwitch: "manage_classes",
        subPermissions: [
            { id: "class_create", label: "Create Classes", desc: "Spawn new classes and generate invite codes.", defaultOn: true },
            { id: "class_edit", label: "Edit Class Details", desc: "Modify class name, code, start/end dates.", defaultOn: true },
            { id: "class_delete", label: "Delete / Archive Class", desc: "Permanently delete or archive a cohort.", defaultOn: false, destructive: true },
            { id: "manage_assignments", label: "Manage Assignments", desc: "Create, edit, delete, and grade assignments.", defaultOn: true },
            { id: "manage_resources", label: "Manage Class Resources", desc: "Attach library assets to a class.", defaultOn: true },
        ]
    },
    {
        id: "practicums",
        title: "Practicum Management",
        icon: FileText,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        description: "Govern the practicum creation, evaluation, and supervisor workflow.",
        masterSwitch: "manage_practicums",
        subPermissions: [
            { id: "practicum_create", label: "Create Practicums", desc: "Spawn a new practicum cohort.", defaultOn: true },
            { id: "practicum_edit", label: "Edit Details & Rubrics", desc: "Modify details and establish rubrics (logs, reports).", defaultOn: true },
            { id: "manage_logs", label: "Manage Logs", desc: "Review and verify student practicum logs.", defaultOn: true },
            { id: "manage_supervisors", label: "Supervisor Coordination", desc: "Trigger emails to supervisors for final reports.", defaultOn: true },
        ]
    },
    {
        id: "library",
        title: "Library & Content",
        icon: Archive,
        color: "text-amber-500",
        bg: "bg-amber-50",
        description: "Define upload, authoring, and distribution policies for library assets.",
        masterSwitch: "allow_content_upload",
        subPermissions: [
            { id: "library_upload", label: "Upload Files", desc: "Upload PDFs, Word files, and IMSCC packages (subject to quota).", defaultOn: true },
            { id: "create_manual_assets", label: "Create Manual Assets", desc: "Author rich-text documents natively in the library.", defaultOn: true },
            { id: "library_edit", label: "Edit / Rename Assets", desc: "Rename and modify existing library items.", defaultOn: true },
            { id: "library_delete", label: "Delete Assets", desc: "Permanently delete library assets.", defaultOn: false, destructive: true },
            { id: "distribute_content", label: "Distribute Content", desc: "Push library items directly into specific classes.", defaultOn: true },
        ]
    },
    {
        id: "students",
        title: "Student Roster",
        icon: Users,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
        description: "Control roster access, communication, and enrollment management.",
        masterSwitch: "manage_students",
        subPermissions: [
            { id: "view_roster", label: "View Roster", desc: "See the full list of enrolled students.", defaultOn: true },
            { id: "remove_students", label: "Remove / Drop Students", desc: "Forcibly unenroll a student from a class or practicum.", defaultOn: false, destructive: true },
            { id: "message_students", label: "Message Students", desc: "Send direct messages or broadcast to the whole class.", defaultOn: true },
        ]
    }
];

// ─── Component ───────────────────────────────────────────────

export function SettingsClient({ pilot, profile }: { pilot: any; profile: any }) {
    const { watch, setValue, getValues } = usePilotForm();
    const [showChangelog, setShowChangelog] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // ─── Access Control ──────────────────────────────────────
    const isChampion = profile?.id === pilot?.champion_id;
    const userTasks = watch("tasks_jsonb") || [];
    const hasTaskWrite = userTasks.some((t: any) => t.tab === 'settings' && t.assignments?.[profile?.id] === 'write');
    const hasWriteAccess = isChampion || hasTaskWrite;
    const isCompleted = (watch("completed_tabs_jsonb") || []).includes("settings");
    const canEdit = hasWriteAccess && !isCompleted;

    // ─── Data & Scope ────────────────────────────────────────
    // Data dependencies

    // Scope dependencies
    const scopeData = watch("scope_jsonb") || {};
    const coreModules = scopeData.core_modules || [];
    const addOns = scopeData.add_ons || [];

    const isClassActive = coreModules.includes("Class Manager");
    const isPracticumActive = coreModules.includes("Practicum Manager");
    const isLibraryActive = addOns.includes("OER Library");
    const isAiAssistantActive = addOns.includes("AI Assistant");

    // Filter available groups based on scope
    const visibleGroups = PERMISSION_GROUPS.filter(g => {
        if (g.id === "classes") return isClassActive;
        if (g.id === "practicums") return isPracticumActive;
        if (g.id === "library") return isLibraryActive;
        return true; // students is always visible
    });

    let editorName = 'Unknown Member';
    if (profile?.first_name && profile?.last_name) {
        editorName = `${profile.first_name} ${profile.last_name}`;
    } else if (profile?.email) {
        editorName = profile.email.split('@')[0];
    }

    const [permissions, setPermissions] = useState(() => {
        const saved = getValues("permissions_jsonb") || {
            manage_classes: true, class_create: true, class_edit: true, class_delete: false,
            manage_assignments: true, manage_resources: true,
            manage_practicums: true, practicum_create: true, practicum_edit: true,
            manage_logs: true, manage_supervisors: true,
            allow_content_upload: true, library_upload: true, create_manual_assets: true,
            library_edit: true, library_delete: false, distribute_content: true,
            manage_students: true, view_roster: true, remove_students: false, message_students: true,
            ai_assessment_override: true, communication_rules: "standard" as const
        };
        return saved;
    });

    const p = permissions as Record<string, any>;
    const communicationRules = permissions.communication_rules || "standard";
    const aiOverride = permissions.ai_assessment_override || false;

    const { isSaving, lastSaved, error, handleManualSave, hasUnsavedChanges } = usePilotAutosave({
        tabKey: "settings",
        dataKey: "permissions_jsonb",
        currentValues: permissions,
        editorName: editorName
    });

    const handleResetToDefaults = useCallback(() => {
        if (!canEdit) return;
        const defaultPerms = {
            manage_classes: true, class_create: true, class_edit: true, class_delete: false,
            manage_assignments: true, manage_resources: true,
            manage_practicums: true, practicum_create: true, practicum_edit: true,
            manage_logs: true, manage_supervisors: true,
            allow_content_upload: true, library_upload: true, create_manual_assets: true,
            library_edit: true, library_delete: false, distribute_content: true,
            manage_students: true, view_roster: true, remove_students: false, message_students: true,
            ai_assessment_override: true, communication_rules: "standard" as const
        };
        setPermissions(defaultPerms);
        // Manual save trigger for reset
        setTimeout(() => handleManualSave(), 100);
    }, [canEdit, handleManualSave]);

    // ─── Toggle Handlers ─────────────────────────────────────

    const toggleMaster = (field: string, value: boolean) => {
        if (!canEdit) return;
        setPermissions((prev: any) => ({ ...prev, [field]: value }));
    };

    const toggleSub = (field: string, value: boolean, masterField: string) => {
        if (!canEdit || !p[masterField]) return;
        setPermissions((prev: any) => ({ ...prev, [field]: value }));
    };

    const updateAdvanced = (field: string, value: any) => {
        if (!canEdit) return;
        setPermissions((prev: any) => ({ ...prev, [field]: value }));
    };

    const toggleAccordion = (id: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const allGroupIds = visibleGroups.map(g => g.id);
    const allExpanded = allGroupIds.length > 0 && allGroupIds.every(id => expandedGroups.has(id));
    const toggleExpandAll = () => {
        setExpandedGroups(allExpanded ? new Set() : new Set(allGroupIds));
    };

    // ─── Summary Stats ───────────────────────────────────────
    const { totalPerms, enabledPerms, autonomyPercentage } = useMemo(() => {
        let total = 0, enabled = 0;
        visibleGroups.forEach(group => {
            total += 1 + group.subPermissions.length;
            if (p[group.masterSwitch]) enabled++;
            group.subPermissions.forEach(sub => {
                if (p[group.masterSwitch] && p[sub.id]) enabled++;
            });
        });

        // Add advanced settings to calculation if visible
        if (isAiAssistantActive) {
            total += 1; // AI Override
            if (aiOverride) enabled++;
        }

        // Communication Rules is always visible, but doesn't have a simple boolean toggle.
        // For simplicity we'll count it as 1 permission, enabled if it's 'standard' (full autonomy).
        total += 1;
        if (communicationRules === "standard") enabled++;

        return { totalPerms: total, enabledPerms: enabled, autonomyPercentage: total > 0 ? Math.round((enabled / total) * 100) : 0 };
    }, [p, visibleGroups, isAiAssistantActive, aiOverride, communicationRules]);

    // ─── Render ──────────────────────────────────────────────

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <TabHeader
                title="Permissions & Settings"
                description="Govern instructor capabilities and global sandbox policies."
                tabKey="settings"
                tabLabel="Settings"
                isReadOnly={!hasWriteAccess || isCompleted}
                isSaving={isSaving}
                lastSaved={lastSaved}
                error={error}
                hasErrors={false}
                hasUnsavedChanges={hasUnsavedChanges}
                onManualSave={handleManualSave}
                showChangelog={showChangelog}
                setShowChangelog={setShowChangelog}
            />

            {/* Subtitle & Expand Row mapped to grid */}
            <div className="flex flex-col lg:flex-row gap-8 mb-6 relative z-50">
                <div className="lg:w-1/3" />
                <div className="lg:w-2/3 flex justify-between items-center">
                    {/* Expand/Collapse All */}
                    <button
                        onClick={toggleExpandAll}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors shadow-sm"
                    >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${allExpanded ? 'rotate-180' : ''}`} />
                        {allExpanded ? 'Collapse All' : 'Expand All'}
                    </button>
                </div>
            </div>


            {/* Split Layout */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left: Summary Card */}
                <div className="lg:w-1/3">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 sticky top-24">
                        <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Permission Summary</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Instructor Autonomy</span>
                                <span className="font-bold text-indigo-600">{autonomyPercentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${autonomyPercentage}%` }} />
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-100">
                                <span className="text-slate-500">Configurable Permissions</span>
                                <span className="font-bold text-slate-900">{totalPerms}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Enabled</span>
                                <span className="font-bold text-emerald-600">{enabledPerms}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Restricted</span>
                                <span className="font-bold text-slate-400">{totalPerms - enabledPerms}</span>
                            </div>

                            <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-bold pt-2">System Total (All Modules): 21</p>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Governance Style</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                {autonomyPercentage >= 90
                                    ? "Decentralized: Instructors have full control over classes, resources, and communication."
                                    : autonomyPercentage >= 50
                                        ? "Balanced: Core boundaries are enforced by admins, but instructors control daily operations."
                                        : "Centralized: Most functionality is governed by administrators."}
                            </p>
                        </div>

                        {canEdit && (
                            <div className="pt-2 border-t border-slate-100 flex justify-center">
                                <button
                                    onClick={handleResetToDefaults}
                                    disabled={isSaving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Reset to Defaults
                                </button>
                            </div>
                        )}


                    </div>
                </div>

                {/* Right: Accordions */}
                <div className="lg:w-2/3 space-y-4">

                    {visibleGroups.length === 0 && (
                        <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-xl border-dashed">
                            <p className="text-sm font-medium text-slate-500">No core modules selected in the Scope tab.</p>
                        </div>
                    )}

                    {visibleGroups.map(group => {
                        const Icon = group.icon;
                        const isExpanded = expandedGroups.has(group.id);
                        const isMasterOn = Boolean(p[group.masterSwitch]);

                        return (
                            <div key={group.id} className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-opacity ${isMasterOn ? '' : 'opacity-75'}`}>
                                {/* Accordion Header */}
                                <div
                                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                                    onClick={() => toggleAccordion(group.id)}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${group.bg}`}>
                                        <Icon className={`w-5 h-5 ${group.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-slate-900 leading-snug">{group.title}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5 truncate">{group.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0" onClick={e => e.stopPropagation()}>
                                        <label className={`relative inline-flex items-center ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={isMasterOn}
                                                disabled={!canEdit}
                                                onChange={e => toggleMaster(group.masterSwitch, e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-60"></div>
                                        </label>
                                        <ChevronDown
                                            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                            onClick={e => { e.stopPropagation(); toggleAccordion(group.id); }}
                                        />
                                    </div>
                                </div>

                                {/* Expanded Sub-permissions */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 space-y-3">
                                        {!isMasterOn && (
                                            <p className="text-xs font-medium text-amber-600 text-center py-1">Master switch is disabled — sub-permissions are inactive.</p>
                                        )}
                                        {group.subPermissions.map(sub => {
                                            const isSubOn = Boolean(p[sub.id]);
                                            const subDisabled = !canEdit || !isMasterOn;
                                            return (
                                                <div
                                                    key={sub.id}
                                                    className={`flex items-center justify-between gap-4 p-3 rounded-xl border ${isMasterOn ? 'bg-white border-slate-200' : 'bg-slate-100/50 border-transparent opacity-50'}`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="block text-sm font-bold text-slate-900">{sub.label}</span>
                                                            {(sub as any).destructive && (
                                                                <span className="text-[10px] font-bold uppercase tracking-wide text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Destructive</span>
                                                            )}
                                                        </div>
                                                        <span className="block text-xs text-slate-500 mt-0.5">{sub.desc}</span>
                                                    </div>
                                                    <div className="shrink-0 pl-4">
                                                        <label className={`relative inline-flex items-center ${subDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={isSubOn}
                                                                disabled={subDisabled}
                                                                onChange={e => toggleSub(sub.id, e.target.checked, group.masterSwitch)}
                                                            />
                                                            <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-50"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Advanced Governance */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
                        <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-200">
                                <Settings className="w-5 h-5 text-slate-700" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 leading-snug">Advanced Governance</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Global policies overriding instructor defaults.</p>
                            </div>
                        </div>
                        <div className="p-5 space-y-6">
                            {/* AI Override - Dynamic */}
                            {isAiAssistantActive && (
                                <>
                                    <div className="flex items-start justify-between gap-6">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">AI Assessment Override</h4>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                Allow instructors to manually override AI-suggested grades. If disabled, AI suggestions are final.
                                            </p>
                                        </div>
                                        <label className={`relative inline-flex items-center shrink-0 mt-1 ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={Boolean(aiOverride)}
                                                disabled={!canEdit}
                                                onChange={e => updateAdvanced("ai_assessment_override", e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-60"></div>
                                        </label>
                                    </div>
                                    <div className="h-px bg-slate-100" />
                                </>
                            )}

                            {/* Communication Rules - Always Visible */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 mb-2">Communication Compliance Rules</h4>
                                <p className="text-xs text-slate-500 mb-3">Set the global policy for how instructors and students interact within the platform.</p>
                                <select
                                    value={communicationRules}
                                    disabled={!canEdit}
                                    onChange={e => updateAdvanced("communication_rules", e.target.value)}
                                    className={`w-full text-sm font-medium px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    <option value="standard">Standard: Direct messaging enabled</option>
                                    <option value="moderated">Moderated: Messages require admin approval</option>
                                    <option value="none">Disabled: Communication strictly via public class boards</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div >
    );
}
