"use client";

import { useMemo, useState } from "react";
import { usePilotForm } from "@/components/pilot/PilotFormContext";
import {
    Shield,
    RotateCcw,
    CheckCircle2,
    Monitor,
    Layout,
    Users,
    Settings,
    Award,
    Globe,
    Zap,
    Activity
} from "lucide-react";
import { updatePilotData } from "@/app/actions/pilotPortal";
import { ExecutiveSummaryCard } from "@/components/pilot/preview/ExecutiveSummaryCard";

// Actual Design Previews
import { LoginTemplateSplit } from "@/components/pilot/branding/LoginTemplateSplit";
import { LoginTemplateCentered } from "@/components/pilot/branding/LoginTemplateCentered";
import { LoginTemplateMinimal } from "@/components/pilot/branding/LoginTemplateMinimal";
import { MockDashboard } from "@/app/pilot/portal/dashboard/MockDashboard";

export function PreviewClient({
    pilot,
    profile,
    membership,
    members = []
}: {
    pilot: any;
    profile: any;
    membership: any;
    members?: any[];
}) {
    const { watch, setValue } = usePilotForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const tasks = watch("tasks_jsonb") || [];
    const completedTabs = watch("completed_tabs_jsonb") || [];

    // Auth logic
    const isChampion = membership?.is_champion === true;
    const hasWriteAccess = tasks.some(t => t.tab === 'preview' && t.assignments?.[profile?.id] === 'write');
    const hasAuthority = isChampion || hasWriteAccess;

    // Data Extraction
    const scope = watch("scope_jsonb") || {};
    const coreModules = scope.core_modules || [];
    const addOns = scope.add_ons || [];

    const kpisData = watch("kpis_jsonb") || {};
    const activeKpis = (kpisData.kpis || []).filter((k: any) => k.enabled);
    const automatedCount = activeKpis.filter((k: any) => k.type === 'automated').length;
    const selfCount = activeKpis.filter((k: any) => k.type === 'self_assessment').length;

    const branding = watch("branding_jsonb") || {};
    const dashboard = watch("dashboard_layout_jsonb") || {};
    const permissions = watch("permissions_jsonb") || {};

    const autonomy = useMemo(() => {
        const values = Object.values(permissions).filter(v => v === true).length;
        return Math.min(Math.round((values / 20) * 100), 100);
    }, [permissions]);

    const taskCompletionRate = useMemo(() => {
        if (tasks.length === 0) return 0;
        const fullyCompleted = tasks.filter((t: any) => t.finalized).length;
        return Math.round((fullyCompleted / tasks.length) * 100);
    }, [tasks]);

    // Actions
    const handleReactivateTab = async (tabKey: string) => {
        if (!hasAuthority) return;
        const updatedTasks = tasks.map((t: any) =>
            t.tab === tabKey ? { ...t, finalized: false, status: 'in_progress' as const } : t
        );
        setValue("tasks_jsonb", updatedTasks, { shouldDirty: true });
        await updatePilotData({ tasks_jsonb: updatedTasks });
    };

    const handleFinalSubmit = async () => {
        if (!hasAuthority || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await updatePilotData({ status: 'submitted' });
            if (res.success) window.location.reload();
        } finally {
            setIsSubmitting(false);
        }
    };

    const isTabLocked = (key: string) => completedTabs.includes(key);

    const BrandingPreview = useMemo(() => {
        const template = branding.template || "centered";
        if (template === "split") return LoginTemplateSplit;
        if (template === "minimal") return LoginTemplateMinimal;
        return LoginTemplateCentered;
    }, [branding.template]);

    return (
        <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="mb-6 px-4 md:px-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4 relative z-50">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Final Blueprint Review</h1>

                    <div className="bg-white border border-slate-200/60 rounded-2xl p-3 shadow-sm flex items-center gap-4 min-w-[220px]">
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Blueprint Integrity</p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-700">{completedTabs.length} / 6</span>
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-tight ${completedTabs.length === 6 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                    {completedTabs.length === 6 ? 'Ready' : 'Incomplete'}
                                </span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center relative">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="20" cy="20" r="17"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className="text-indigo-500 transition-all duration-1000"
                                    strokeDasharray={`${(completedTabs.length / 6) * 106} 106`}
                                />
                            </svg>
                            <span className="absolute text-[10px] font-bold">{Math.round((completedTabs.length / 6) * 100)}%</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 relative z-40">
                    <div className="lg:w-full">
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Finalize your pilot configuration to ensure a seamless platform experience for your team and students.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-[minmax(310px,auto)] px-4 md:px-0">

                {/* 1. Project Scope */}
                <ExecutiveSummaryCard
                    title="Project Scope"
                    tabKey="scope"
                    isLocked={isTabLocked("scope")}
                    isChampion={hasAuthority}
                    onReactivate={handleReactivateTab}
                    icon={Layout}
                    primaryMetric={`${coreModules.length + addOns.length} Modules Active`}
                    className="h-[310px]"
                >
                    <div className="flex flex-col h-full space-y-[10px]">
                        {/* Section 1: Pilot Period & Seats (Moved UP) */}
                        <div className="grid grid-cols-2 gap-4 py-[8px] border-b border-slate-100">
                            <div>
                                <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mb-1">Pilot Period</p>
                                <p className="text-sm font-bold text-slate-700">{scope.pilot_period_weeks || 4} <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight ml-0.5">Weeks</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mb-1">Seats</p>
                                <div className="flex flex-col gap-0.5 items-end">
                                    <div className="flex justify-between w-full max-w-[120px] ml-auto">
                                        <span className="text-[10px] text-slate-400">Instructors:</span>
                                        <span className="text-[10px] font-bold text-slate-700">{scope.max_instructors || 5}</span>
                                    </div>
                                    <div className="flex justify-between w-full max-w-[120px] ml-auto">
                                        <span className="text-[10px] text-slate-400">Students:</span>
                                        <span className="text-[10px] font-bold text-slate-700">{scope.max_students || 200}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Modules Breakdown (Moved DOWN) */}
                        <div className="flex justify-between gap-4 py-[8px] border-b border-slate-100">
                            <div className="flex-1">
                                <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mb-2">Core Foundation</p>
                                <div className="flex flex-wrap gap-1">
                                    {coreModules.map((m: string) => (
                                        <span key={m} className="px-1.5 py-0.5 bg-indigo-50/50 border border-indigo-100/50 text-indigo-600 text-[9px] font-bold rounded uppercase tracking-tight italic">
                                            {m}
                                        </span>
                                    ))}
                                    {coreModules.length === 0 && <span className="text-[10px] text-slate-400 italic">None</span>}
                                </div>
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mb-2">Accelerators</p>
                                <div className="flex flex-wrap gap-1 justify-end">
                                    {addOns.map((m: string) => (
                                        <span key={m} className="px-1.5 py-0.5 bg-amber-50/50 border border-amber-100/50 text-amber-600 text-[9px] font-bold rounded uppercase tracking-tight italic">
                                            {m}
                                        </span>
                                    ))}
                                    {addOns.length === 0 && <span className="text-[10px] text-slate-400 italic">None</span>}
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Departments */}
                        <div className="flex items-baseline gap-1.5 py-[8px]">
                            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest shrink-0">Dept:</span>
                            <p className="text-[11px] font-semibold text-slate-600 leading-tight">
                                {scope.target_departments?.length > 0
                                    ? scope.target_departments.join(", ")
                                    : "All Academic Departments"}
                            </p>
                        </div>
                    </div>
                </ExecutiveSummaryCard>

                {/* 2. Success KPIs */}
                <ExecutiveSummaryCard
                    title="Success KPIs"
                    tabKey="kpis"
                    isLocked={isTabLocked("kpis")}
                    isChampion={hasAuthority}
                    onReactivate={handleReactivateTab}
                    icon={Zap}
                    primaryMetric={`${activeKpis.length} Indicators`}
                    className="h-[310px]"
                >
                    <div className="flex flex-col h-full space-y-4">
                        <div className="flex items-center justify-between gap-3 flex-1 pb-2">
                            <div className="flex-1 bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-slate-800 tracking-tighter">{automatedCount}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Auto</span>
                                <div className="mt-1 w-4 h-1 bg-indigo-500 rounded-full" />
                            </div>
                            <div className="flex-1 bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-slate-800 tracking-tighter">{selfCount}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manual</span>
                                <div className="mt-1 w-4 h-1 bg-slate-200 rounded-full" />
                            </div>
                        </div>
                    </div>
                </ExecutiveSummaryCard>

                {/* 3. Governance & Rules */}
                <ExecutiveSummaryCard
                    title="Governance & Rules"
                    tabKey="settings"
                    isLocked={isTabLocked("settings")}
                    isChampion={hasAuthority}
                    onReactivate={handleReactivateTab}
                    icon={Settings}
                    primaryMetric={`${autonomy}% Autonomy`}
                    className="h-[310px]"
                >
                    <div className="flex flex-col h-full space-y-4">
                        <div className="space-y-1.5 flex-1 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Agency</span>
                                <span className="text-[11px] font-bold text-emerald-600">{autonomy}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white border border-slate-100 rounded-full overflow-hidden mt-1">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${autonomy > 75 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.3)]'}`}
                                    style={{ width: `${autonomy}%` }}
                                />
                            </div>

                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-400 uppercase tracking-widest">Deletion</span>
                                    <span className={`uppercase tracking-widest ${permissions.class_delete ? 'text-amber-500' : 'text-emerald-500'}`}>
                                        {permissions.class_delete ? 'Open' : 'Locked'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold border-t border-slate-100 pt-2">
                                    <span className="text-slate-400 uppercase tracking-widest">AI Override</span>
                                    <span className="text-indigo-600 uppercase tracking-widest">
                                        {permissions.ai_assessment_override ? 'Active' : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ExecutiveSummaryCard>

                {/* 4. Success Team */}
                <ExecutiveSummaryCard
                    title="Success Team"
                    tabKey="team"
                    isLocked={isTabLocked("team")}
                    isChampion={hasAuthority}
                    onReactivate={handleReactivateTab}
                    icon={Users}
                    primaryMetric={`${members.length} Members`}
                    className="h-[310px]"
                >
                    <div className="flex flex-col h-full space-y-4">
                        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-3 flex-1 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <div className="flex -space-x-2.5">
                                    {members.slice(0, 3).map((m: any, i: number) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-white flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm relative z-[3] uppercase">
                                            {m.profiles?.email?.charAt(0) || '?'}
                                        </div>
                                    ))}
                                    {members.length > 3 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[9px] font-bold text-indigo-600 shadow-sm relative z-[0]">
                                            +{members.length - 3}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Collaborators</p>
                                    <p className="text-lg font-bold text-slate-800 leading-none">{members.length}</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Readiness</span>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600">{taskCompletionRate}%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${taskCompletionRate}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </ExecutiveSummaryCard>

                {/* 5. Branding Preview (Hero) */}
                <ExecutiveSummaryCard
                    title="Branding Preview"
                    tabKey="branding"
                    isLocked={isTabLocked("branding")}
                    isChampion={hasAuthority}
                    onReactivate={handleReactivateTab}
                    icon={Globe}
                    size="large"
                    noPadding={true}
                    className="lg:col-span-2"
                    primaryMetric={branding.subdomain ? `${branding.subdomain}.schologic.com` : "Platform Identity"}
                >
                    <div className="flex flex-col h-full">
                        <div className="relative w-full aspect-[16/10] bg-white overflow-hidden border-b border-slate-100 shrink-0">
                            {/* Actual Design Preview - Fixed 50% Scale */}
                            <div className="absolute inset-0 origin-top-left scale-[0.5]" style={{ width: '200%', height: '200%' }}>
                                <BrandingPreview config={branding} />
                            </div>
                        </div>

                        <div className="h-[100px] px-6 pt-6 pb-4 bg-slate-50 grid grid-cols-2 gap-4 items-start shrink-0">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Theme Template</p>
                                <p className="text-sm font-bold text-slate-800 capitalize">{branding.template || "Centered"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Status</p>
                                <p className="text-sm font-bold text-emerald-500">Assets Verified</p>
                            </div>
                        </div>
                    </div>
                </ExecutiveSummaryCard>

                {/* 6. Admin Experience (Hero) */}
                <ExecutiveSummaryCard
                    title="Admin Experience"
                    tabKey="dashboard"
                    isLocked={isTabLocked("dashboard")}
                    isChampion={hasAuthority}
                    onReactivate={handleReactivateTab}
                    icon={Monitor}
                    size="large"
                    noPadding={true}
                    className="lg:col-span-2"
                    primaryMetric={`Focus: ${dashboard.view_type || "Academic"}`}
                >
                    <div className="flex flex-col h-full">
                        <div className="relative w-full aspect-[16/10] bg-slate-900 overflow-hidden border-b border-slate-100 shrink-0">
                            {/* Actual Dashboard Preview - Fixed 50% Scale */}
                            <div className="absolute inset-0 origin-top-left scale-[0.5]" style={{ width: '200%', height: '200%' }}>
                                <MockDashboard layoutId={dashboard.view_type || 'academic'} selectedWidgets={dashboard.selected_widgets || []} />
                            </div>
                        </div>

                        <div className="h-[100px] px-6 pt-6 pb-4 bg-slate-50 flex flex-col items-start justify-start shrink-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2.5">Pinned Widgets ({dashboard.selected_widgets?.length || 0})</p>
                            <div className="flex flex-wrap gap-2">
                                {(dashboard.selected_widgets || ["Total Users", "Active Assignments"]).slice(0, 3).map((w: string) => (
                                    <span key={w} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 text-[9px] font-bold rounded-md uppercase tracking-tight whitespace-nowrap">
                                        {w}
                                    </span>
                                ))}
                                {dashboard.selected_widgets?.length > 3 && (
                                    <span className="text-[9px] font-bold text-slate-400 mt-0.5">+{dashboard.selected_widgets.length - 3} More</span>
                                )}
                            </div>
                        </div>
                    </div>
                </ExecutiveSummaryCard>

            </div>

            {/* Submission Section */}
            <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm flex flex-col items-center text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                    <Shield className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Deployment Authorization</h2>

                {!hasAuthority ? (
                    <div className="mt-4 max-w-lg">
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                            The blueprint is undergoing final validation. Only the <strong>Pilot Champion</strong> or authorized team members can trigger the production sandbox provisioning.
                        </p>
                        <div className="inline-flex items-center gap-3 px-5 py-3 bg-amber-50 rounded-2xl border border-amber-100/50">
                            <RotateCcw className="w-4 h-4 text-amber-500 animate-spin-slow" />
                            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">Awaiting Authorized Action</span>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 max-w-lg">
                        <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
                            All systems are verified. Provisioning the production sandbox will freeze this blueprint and initiate the secure environment setup.
                        </p>
                        <button
                            onClick={handleFinalSubmit}
                            disabled={isSubmitting}
                            className={`px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50`}
                        >
                            {isSubmitting ? 'Provisioning...' : 'Provision Sandbox Now'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
