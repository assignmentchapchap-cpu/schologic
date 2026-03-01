"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { usePilotForm } from "@/components/pilot/PilotFormContext";
import { Home, Users, Monitor, GraduationCap, CheckCircle2, Pencil, X, Save, Plus, Trash2, ChevronDown, AlertTriangle, Filter } from "lucide-react";
import { usePilotAutosave } from "@/hooks/usePilotAutosave";
import { TabHeader } from "@/components/pilot/common/TabHeader";


// ─── Types ───────────────────────────────────────────────────

interface KPI {
    id: string;
    module: string;
    title: string;
    description: string;
    type: "automated" | "self_assessment";
    enabled: boolean;
    is_auto: boolean;
    frequency: "daily" | "weekly" | "biweekly" | "end_of_pilot";
}

interface Question {
    id: string;
    text: string;
    is_auto: boolean;
}

interface DeliverySettings {
    method: "dashboard" | "manual";
    frequency: "weekly" | "biweekly" | "end_of_pilot";
}

// ─── Auto-Generation Map ─────────────────────────────────────

interface KPITemplate {
    module: string;
    title: string;
    description: string;
    type: "automated" | "self_assessment";
    questions?: string[];
}

const KPI_TEMPLATES: KPITemplate[] = [
    {
        module: "generic",
        title: "Admin Hours Saved",
        description: "Measures reduction in manual administrative overhead.",
        type: "self_assessment",
        questions: [
            "How many hours per week do you estimate you spent on LMS admin tasks before Schologic?",
            "How many hours per week do you now spend on LMS admin tasks with Schologic?",
        ]
    },
    {
        module: "Class Manager",
        title: "Student Participation Rate",
        description: "Automated tracking of student engagement in active classes.",
        type: "automated"
    },
    {
        module: "Practicum Manager",
        title: "Assessor Hours Saved",
        description: "Tracking efficiency in logbook reviews and supervisor feedback.",
        type: "self_assessment",
        questions: [
            "How many hours per week did you spend reviewing practicum logbooks before Schologic?",
            "How many hours per week do you now spend?",
        ]
    },
    {
        module: "Practicum Manager",
        title: "Confidence in Digital Logs",
        description: "Assessing the accuracy and reliability of digital performance logs.",
        type: "self_assessment",
        questions: [
            "On a scale of 1-5, how confident are you that digital logs accurately capture student performance?",
            "What is the biggest challenge you face with digital logs?",
        ]
    },
    {
        module: "Practicum Manager",
        title: "Supervisor Turnaround Time",
        description: "Measures speed of logbook verification and signing process.",
        type: "automated"
    },
    {
        module: "AI Forensics",
        title: "AI-Generated Submissions Detected",
        description: "Detection rates of potential non-original academic work.",
        type: "automated"
    },
    {
        module: "AI Assistant",
        title: "Grading Hours Saved",
        description: "Efficiency gains from AI-assisted feedback and grading.",
        type: "self_assessment",
        questions: [
            "How many hours per week did grading take before Schologic?",
            "How many hours per week does grading take now?",
        ]
    },
    {
        module: "OER Library",
        title: "Textbook Cost Savings",
        description: "Estimated financial impact of adopting open educational resources.",
        type: "self_assessment",
        questions: [
            "What was the average textbook cost per student before Schologic?",
            "What is the estimated per-student cost now?",
        ]
    },
    {
        module: "OER Library",
        title: "Resource Read Rate",
        description: "Tracking student interaction with OER materials.",
        type: "automated"
    },
    {
        module: "OER Library",
        title: "Ease of Resource Access",
        description: "User accessibility rating for digital library resources.",
        type: "self_assessment",
        questions: [
            "On a scale of 1-5, how easy is it to find and access course materials?",
        ]
    },
];

const MODULE_LABELS: Record<string, string> = {
    generic: "Generic",
    "Class Manager": "Class Manager",
    "Practicum Manager": "Practicum Manager",
    "AI Forensics": "AI Detection",
    "AI Assistant": "AI Assistant",
    "OER Library": "OER Library",
};

const FREQUENCY_OPTIONS = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Biweekly" },
    { value: "end_of_pilot", label: "End of Pilot" },
];

const FREQUENCY_LABEL: Record<string, string> = {
    daily: "Daily", weekly: "Weekly", biweekly: "Biweekly", end_of_pilot: "End of Pilot",
};

const DELIVERY_FREQUENCY_OPTIONS = [
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Biweekly" },
    { value: "end_of_pilot", label: "End of Pilot" },
];

// ─── Utility ─────────────────────────────────────────────────

function generateDefaultKPIs(coreModules: string[], addOns: string[]): { kpis: KPI[]; questions: Record<string, Question[]> } {
    const enabledModules = new Set(["generic", ...coreModules, ...addOns]);
    const kpis: KPI[] = [];
    const questions: Record<string, Question[]> = {};

    KPI_TEMPLATES.forEach(tpl => {
        if (!enabledModules.has(tpl.module)) return;
        const id = crypto.randomUUID();
        kpis.push({
            id, module: tpl.module, title: tpl.title, description: tpl.description, type: tpl.type,
            enabled: true, is_auto: true, frequency: "weekly",
        });
        if (tpl.questions && tpl.questions.length > 0) {
            questions[id] = tpl.questions.map(text => ({
                id: crypto.randomUUID(), text, is_auto: true,
            }));
        }
    });
    return { kpis, questions };
}

// ─── Component ───────────────────────────────────────────────

export function KPIsClient({ pilot, profile }: { pilot: any; profile: any }) {
    const { watch, setValue, getValues } = usePilotForm();

    // ─── UI State ───────────────────────────────────────────
    const [showChangelog, setShowChangelog] = useState(false);
    const [expandedKpis, setExpandedKpis] = useState<Set<string>>(new Set());
    const [filterModule, setFilterModule] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [showDisabled, setShowDisabled] = useState(false);
    const isCompleted = (watch("completed_tabs_jsonb") || []).includes("kpis");
    const isChampion = profile?.id === pilot?.champion_id;
    const userTasks = watch("tasks_jsonb") || [];
    const hasTaskWrite = userTasks.some((t: any) => t.tab === 'kpis' && t.assignments?.[profile?.id] === 'write');
    const hasWriteAccess = isChampion || hasTaskWrite;
    const isReadOnly = isCompleted || !hasWriteAccess;

    // ─── LOCAL STATE for instant reactivity ──────────────────
    // All KPI data lives in local state. Form context is only read on init
    // and written on save. This avoids react-hook-form watch/setValue lag.
    const initData = getValues("kpis_jsonb");
    const [kpis, setKpis] = useState<KPI[]>(() => {
        const rawKpis = initData?.kpis || [];
        return rawKpis.map((k: any) => {
            let description = k.description || "";
            if (!description) {
                const tpl = KPI_TEMPLATES.find(t => t.title === k.title);
                if (tpl) description = tpl.description;
            }
            return { ...k, description };
        });
    });
    const [questions, setQuestions] = useState<Record<string, Question[]>>(() => initData?.questions || {});
    const [delivery, setDelivery] = useState<DeliverySettings>(() => ({
        method: initData?.delivery?.method || "dashboard",
        frequency: initData?.delivery?.frequency || "weekly",
    }));

    const saveTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastSavedDataRef = useRef<string>(JSON.stringify({ kpis: initData?.kpis || [], questions: initData?.questions || {}, delivery: initData?.delivery || { method: 'dashboard', frequency: 'weekly' } }));

    // Scope context (from form since scope tab owns this)
    const coreModules: string[] = watch("scope_jsonb.core_modules") || [];
    const addOns: string[] = watch("scope_jsonb.add_ons") || [];
    const enabledModules = new Set(["generic", ...coreModules, ...addOns]);

    // Editor name
    let editorName = 'Unknown Member';
    if (profile) {
        if (profile.first_name && profile.last_name) {
            editorName = `${profile.first_name} ${profile.last_name}`;
        } else if (profile.email) {
            editorName = profile.email.split('@')[0];
        }
    }

    // ─── Auto-generate on first load ────────────────────────

    const hasGeneratedRef = useRef(false);
    useMemo(() => {
        if (hasGeneratedRef.current) return;
        if (kpis.length > 0) return;

        hasGeneratedRef.current = true;
        const generated = generateDefaultKPIs(coreModules, addOns);
        setKpis(generated.kpis);
        setQuestions(generated.questions);
        // Also sync to form context so save will pick it up
        setValue("kpis_jsonb", { kpis: generated.kpis, questions: generated.questions, delivery }, { shouldDirty: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Scope reactivity: inject new KPIs for added modules ─

    const injectedModulesRef = useRef<Set<string>>(new Set());
    useMemo(() => {
        if (kpis.length === 0) return;
        const currentModuleSet = new Set(kpis.map(k => k.module));
        const allScopeModules = ["generic", ...coreModules, ...addOns];

        let newKpis: KPI[] = [];
        let newQuestions: Record<string, Question[]> = {};

        allScopeModules.forEach(mod => {
            if (!currentModuleSet.has(mod) && !injectedModulesRef.current.has(mod)) {
                const templates = KPI_TEMPLATES.filter(t => t.module === mod);
                templates.forEach(tpl => {
                    const id = crypto.randomUUID();
                    newKpis.push({
                        id, module: tpl.module, title: tpl.title, description: tpl.description, type: tpl.type,
                        enabled: true, is_auto: true, frequency: "weekly",
                    });
                    if (tpl.questions) {
                        newQuestions[id] = tpl.questions.map(text => ({
                            id: crypto.randomUUID(), text, is_auto: true,
                        }));
                    }
                });
                injectedModulesRef.current.add(mod);
            }
        });

        if (newKpis.length > 0) {
            setKpis(prev => [...prev, ...newKpis]);
            setQuestions(prev => ({ ...prev, ...newQuestions }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coreModules.join(","), addOns.join(",")]);

    const { isSaving, lastSaved, error, handleManualSave, hasUnsavedChanges } = usePilotAutosave({
        tabKey: "kpis",
        currentValues: { kpis, questions, delivery },
        editorName: editorName
    });

    const handleCancel = () => {
        // No longer used in direct editing pattern, but kept for reference if needed
    };

    // ─── KPI mutations (all local state — instant) ──────────

    const toggleKpi = (kpiId: string) => {
        setKpis(prev => prev.map(k => k.id === kpiId ? { ...k, enabled: !k.enabled } : k));
    };

    const updateKpiTitle = (kpiId: string, title: string) => {
        setKpis(prev => prev.map(k => k.id === kpiId ? { ...k, title } : k));
    };

    const updateKpiDescription = (kpiId: string, description: string) => {
        setKpis(prev => prev.map(k => k.id === kpiId ? { ...k, description } : k));
    };

    const updateKpiFrequency = (kpiId: string, frequency: KPI['frequency']) => {
        setKpis(prev => prev.map(k => k.id === kpiId ? { ...k, frequency } : k));
    };

    const deleteKpi = (kpiId: string) => {
        setKpis(prev => prev.filter(k => k.id !== kpiId));
        setQuestions(prev => { const { [kpiId]: _, ...rest } = prev; return rest; });
    };

    const addCustomKpi = (type: "automated" | "self_assessment") => {
        if (isReadOnly) return;
        const id = crypto.randomUUID();
        const newKpi: KPI = {
            id, module: "generic", title: "New KPI", description: "",
            type, enabled: true, is_auto: false, frequency: "weekly",
        };
        setKpis(prev => [...prev, newKpi]);
        if (type === "self_assessment") {
            setQuestions(prev => ({
                ...prev,
                [id]: [{ id: crypto.randomUUID(), text: "Enter your question here", is_auto: false }]
            }));
        }
        setExpandedKpis(prev => new Set(prev).add(id));
    };

    // ─── Question mutations (all local state — instant) ─────

    const updateQuestionText = (kpiId: string, qId: string, text: string) => {
        setQuestions(prev => ({
            ...prev,
            [kpiId]: (prev[kpiId] || []).map(q => q.id === qId ? { ...q, text } : q),
        }));
    };

    const deleteQuestion = (kpiId: string, qId: string) => {
        setQuestions(prev => ({
            ...prev,
            [kpiId]: (prev[kpiId] || []).filter(q => q.id !== qId),
        }));
    };

    const addQuestion = (kpiId: string) => {
        setQuestions(prev => {
            const kpiQs = prev[kpiId] || [];
            if (kpiQs.length >= 5) return prev;
            return {
                ...prev,
                [kpiId]: [...kpiQs, { id: crypto.randomUUID(), text: "Enter your question here", is_auto: false }],
            };
        });
    };

    const toggleExpand = (kpiId: string) => {
        setExpandedKpis(prev => {
            const next = new Set(prev);
            next.has(kpiId) ? next.delete(kpiId) : next.add(kpiId);
            return next;
        });
    };

    // ─── Expand / Collapse All ──────────────────────────────

    const selfAssessmentKpis = kpis.filter(k => k.type === 'self_assessment');
    const allExpanded = selfAssessmentKpis.length > 0 && selfAssessmentKpis.every(k => expandedKpis.has(k.id));

    const expandAll = () => setExpandedKpis(new Set(selfAssessmentKpis.map(k => k.id)));
    const collapseAll = () => setExpandedKpis(new Set());

    // ─── Effective enabled (accounts for module removal) ────

    const isEffectivelyEnabled = (kpi: KPI) => kpi.enabled && enabledModules.has(kpi.module);

    // ─── Filtering (split into active / disabled) ──────────

    const uniqueModules = useMemo(() => Array.from(new Set(kpis.map(k => k.module))), [kpis]);

    const applyFilters = (list: KPI[]) => list.filter(kpi => {
        if (filterModule !== "all" && kpi.module !== filterModule) return false;
        if (filterType !== "all" && kpi.type !== filterType) return false;
        return true;
    });

    const activeKpis = applyFilters(kpis.filter(k => isEffectivelyEnabled(k)));
    const disabledKpis = applyFilters(kpis.filter(k => !isEffectivelyEnabled(k)));

    // ─── Render ─────────────────────────────────────────────

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <TabHeader
                title="Key Performance Indicators"
                description="Define how success will be measured during the pilot."
                tabKey="kpis"
                tabLabel="KPIs"
                isReadOnly={isReadOnly}
                isSaving={isSaving}
                lastSaved={lastSaved}
                error={error}
                hasErrors={false} // No hard validation errors for KPIs yet
                hasUnsavedChanges={hasUnsavedChanges}
                onManualSave={handleManualSave}
                showChangelog={showChangelog}
                setShowChangelog={setShowChangelog}
            />

            {/* Subtitle & Expand Row mapped to grid */}
            <div className="flex flex-col lg:flex-row gap-8 mb-6 relative z-50">
                <div className="lg:w-1/3">
                    {/* Description removed as it is now in TabHeader */}
                </div>
                <div className="lg:w-2/3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {/* Expand/Collapse All */}
                        {selfAssessmentKpis.length > 0 ? (
                            <button
                                onClick={allExpanded ? collapseAll : expandAll}
                                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors shadow-sm"
                            >
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${allExpanded ? 'rotate-180' : ''}`} />
                                {allExpanded ? 'Collapse All' : 'Expand All'}
                            </button>
                        ) : <div />}

                        {/* Modules Filter - Relocated */}
                        <div className="flex items-center gap-2 border-l border-slate-200 pl-4 h-6">
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                            <select
                                value={filterModule}
                                onChange={e => setFilterModule(e.target.value)}
                                className="text-[11px] font-bold text-slate-600 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-300 bg-white shadow-sm max-w-[130px] truncate"
                            >
                                <option value="all">All Modules</option>
                                {uniqueModules.map(m => (
                                    <option key={m} value={m}>{MODULE_LABELS[m] || m}</option>
                                ))}
                            </select>
                            <select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                className="text-[11px] font-bold text-slate-600 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-300 bg-white shadow-sm max-w-[130px] truncate"
                            >
                                <option value="all">All Types</option>
                                <option value="automated">⚡ Automated</option>
                                <option value="self_assessment">📋 Self-Assessment</option>
                            </select>
                        </div>
                    </div>

                    <div />
                </div>
            </div>

            {error && <span className="text-xs font-bold text-red-500 block mb-2">{error}</span>}


            {/* Main content: two-column layout */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 sticky top-24">
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm mb-4 border-b pb-2">KPI Summary</h3>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total KPIs</span>
                                <span className="font-bold text-slate-900">{kpis.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Enabled</span>
                                <span className="font-bold text-emerald-600">{kpis.filter(k => isEffectivelyEnabled(k)).length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Automated</span>
                                <span className="font-bold text-indigo-600">{kpis.filter(k => k.type === 'automated' && isEffectivelyEnabled(k)).length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Self-Assessment</span>
                                <span className="font-bold text-amber-600">{kpis.filter(k => k.type === 'self_assessment' && isEffectivelyEnabled(k)).length}</span>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Questionnaire Delivery</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-600 mb-2 block">Method</label>
                                    <div className="space-y-2">
                                        <label className={`flex items-center gap-2 ${!isReadOnly ? 'cursor-pointer' : ''}`}>
                                            <input
                                                type="radio"
                                                name="delivery_method"
                                                checked={delivery.method === "dashboard"}
                                                disabled={isReadOnly}
                                                onChange={() => setDelivery(prev => ({ ...prev, method: "dashboard" }))}
                                                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 disabled:opacity-50"
                                            />
                                            <span className="text-sm text-slate-700">Instructor Dashboard</span>
                                        </label>
                                        <label className={`flex items-center gap-2 ${!isReadOnly ? 'cursor-pointer' : ''}`}>
                                            <input
                                                type="radio"
                                                name="delivery_method"
                                                checked={delivery.method === "manual"}
                                                disabled={isReadOnly}
                                                onChange={() => setDelivery(prev => ({ ...prev, method: "manual" }))}
                                                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 disabled:opacity-50"
                                            />
                                            <span className="text-sm text-slate-700">Run Internally (Manual)</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 mb-1.5 block">Frequency</label>
                                    <select
                                        value={delivery.frequency}
                                        disabled={isReadOnly}
                                        onChange={e => setDelivery(prev => ({ ...prev, frequency: e.target.value as DeliverySettings['frequency'] }))}
                                        className="w-full text-sm font-medium px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                    >
                                        {DELIVERY_FREQUENCY_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Right Column: KPI Cards */}
                <div className="lg:w-2/3 space-y-4">
                    {kpis.length === 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
                            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-500">No KPIs defined yet.</p>
                            <p className="text-xs text-slate-400 mt-1">KPIs will be auto-generated from your selected modules.</p>
                        </div>
                    )}

                    {/* Active KPIs */}
                    {activeKpis.map(kpi => {
                        const isExpanded = expandedKpis.has(kpi.id);
                        const kpiQuestions = questions[kpi.id] || [];
                        const hasSelfAssessment = kpi.type === 'self_assessment';

                        return (
                            <div key={kpi.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="flex items-center px-5 py-4 gap-4 transition-colors">
                                    {isReadOnly && (
                                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${kpi.enabled ? 'text-indigo-600' : 'text-slate-200'}`} />
                                    )}
                                    {!isReadOnly && (
                                        <button
                                            onClick={() => toggleKpi(kpi.id)}
                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${kpi.enabled ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}
                                        >
                                            {kpi.enabled && <CheckCircle2 className="w-3 h-3" />}
                                        </button>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        {!isReadOnly ? (
                                            <div className="space-y-1">
                                                <input
                                                    type="text"
                                                    value={kpi.title}
                                                    onChange={e => updateKpiTitle(kpi.id, e.target.value)}
                                                    className="text-base font-bold text-slate-900 px-2 py-1 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full leading-snug"
                                                />
                                                <input
                                                    type="text"
                                                    value={kpi.description}
                                                    placeholder="Description"
                                                    onChange={e => updateKpiDescription(kpi.id, e.target.value)}
                                                    className="text-[11px] text-slate-500 px-2 py-0.5 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none w-full"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-base font-bold text-slate-900 block leading-snug">{kpi.title}</span>
                                                <p className="text-xs text-slate-500 mt-0.5 truncate">{kpi.description}</p>
                                            </>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${kpi.type === 'automated' ? 'text-indigo-600 bg-indigo-50' : 'text-amber-600 bg-amber-50'}`}>
                                        {kpi.type === 'automated' ? '⚡ Automated' : '📋 Self-Assessment'}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                                        {MODULE_LABELS[kpi.module] || kpi.module}
                                    </span>
                                    {!isReadOnly ? (
                                        <select
                                            value={kpi.frequency}
                                            onChange={e => updateKpiFrequency(kpi.id, e.target.value as KPI['frequency'])}
                                            className="text-xs font-bold text-slate-600 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-300 bg-white shrink-0 w-28"
                                        >
                                            {FREQUENCY_OPTIONS.map(o => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 w-20 text-right">
                                            {FREQUENCY_LABEL[kpi.frequency] || kpi.frequency}
                                        </span>
                                    )}
                                    <div className="flex items-center gap-1 shrink-0 w-8 justify-end">
                                        {!isReadOnly && !kpi.is_auto && (
                                            <button onClick={() => deleteKpi(kpi.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {hasSelfAssessment && (
                                            <button onClick={() => toggleExpand(kpi.id)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer">
                                                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {hasSelfAssessment && isExpanded && (
                                    <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 space-y-2">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Self-Assessment Questions</h4>
                                        {kpiQuestions.map((q, idx) => (
                                            <div key={q.id} className="flex items-start gap-2">
                                                <span className="text-xs font-bold text-slate-400 mt-2 shrink-0 w-5 text-right">{idx + 1}.</span>
                                                {!isReadOnly ? (
                                                    <>
                                                        <input type="text" value={q.text} onChange={e => updateQuestionText(kpi.id, q.id, e.target.value)}
                                                            className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white" />
                                                        {kpiQuestions.length > 1 && (
                                                            <button onClick={() => deleteQuestion(kpi.id, q.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors shrink-0">
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-slate-700 py-1">{q.text}</p>
                                                )}
                                            </div>
                                        ))}
                                        {!isReadOnly && kpiQuestions.length < 5 && (
                                            <button onClick={() => addQuestion(kpi.id)} className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-2 ml-7">
                                                <Plus className="w-3.5 h-3.5" /> Add Question
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Add Custom KPI */}
                    {!isReadOnly && (
                        <div className="flex items-center gap-3 pt-2">
                            <button onClick={() => addCustomKpi("automated")}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                                <Plus className="w-3.5 h-3.5" /> Add Automated KPI
                            </button>
                            <button onClick={() => addCustomKpi("self_assessment")}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors">
                                <Plus className="w-3.5 h-3.5" /> Add Self-Assessment KPI
                            </button>
                        </div>
                    )}

                    {/* Disabled KPIs — collapsible section */}
                    {disabledKpis.length > 0 && (
                        <div className="pt-4 mt-2 border-t border-dashed border-slate-200">
                            <button
                                onClick={() => setShowDisabled(prev => !prev)}
                                className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 px-2 py-1.5 -ml-2 rounded-lg transition-colors"
                            >
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDisabled ? '' : '-rotate-90'}`} />
                                <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-slate-200 text-slate-600 rounded-full">{disabledKpis.length}</span>
                                Disabled KPI{disabledKpis.length !== 1 ? 's' : ''}
                            </button>

                            {showDisabled && (
                                <div className="mt-3 space-y-3">
                                    {disabledKpis.map(kpi => {
                                        const moduleRemoved = !enabledModules.has(kpi.module);
                                        return (
                                            <div key={kpi.id} className={`border rounded-xl shadow-sm overflow-hidden opacity-50 ${moduleRemoved ? 'border-amber-300 bg-amber-50/30' : 'bg-white border-slate-200'}`}>
                                                <div className="flex items-center px-5 py-3 gap-4">
                                                    {!isReadOnly && (
                                                        <button
                                                            onClick={() => toggleKpi(kpi.id)}
                                                            className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white flex items-center justify-center shrink-0 transition-colors"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-sm font-bold text-slate-400">{kpi.title}</span>
                                                        {moduleRemoved && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                                                <span className="text-[10px] font-medium text-amber-600">Module removed from scope</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${kpi.type === 'automated' ? 'text-indigo-400 bg-indigo-50' : 'text-amber-400 bg-amber-50'}`}>
                                                        {kpi.type === 'automated' ? '⚡ Automated' : '📋 Self-Assessment'}
                                                    </span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                                                        {MODULE_LABELS[kpi.module] || kpi.module}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider shrink-0 w-20 text-right">
                                                        {FREQUENCY_LABEL[kpi.frequency] || kpi.frequency}
                                                    </span>
                                                    {!isReadOnly && !kpi.is_auto && (
                                                        <button onClick={() => deleteKpi(kpi.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
