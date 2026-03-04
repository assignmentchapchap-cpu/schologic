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
    Activity,
    BookOpen,
    FileText,
    Archive,
    AlertTriangle
} from "lucide-react";
import { updatePilotData } from "@/app/actions/pilotPortal";
import { notifyTabReactivated, notifyPilotSubmitted } from "@/app/actions/pilotSubmission";
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
    const [error, setError] = useState<string | null>(null);
    const tasks = watch("tasks_jsonb") || [];
    const completedTabs = watch("completed_tabs_jsonb") || [];
    const status = watch("status") || "pending";

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

    const teamTasks = useMemo(() => tasks.filter((t: any) => t.tab === 'team'), [tasks]);
    const teamCompletionRate = useMemo(() => {
        if (teamTasks.length === 0) return 0;
        const completed = teamTasks.filter((t: any) => t.status === 'completed').length;
        return Math.round((completed / teamTasks.length) * 100);
    }, [teamTasks]);

    const lateTeamRate = useMemo(() => {
        if (teamTasks.length === 0) return 0;
        const now = new Date();
        const lateCount = teamTasks.filter((t: any) =>
            t.status !== 'completed' && t.due_date && new Date(t.due_date) < now
        ).length;
        return Math.round((lateCount / teamTasks.length) * 100);
    }, [teamTasks]);

    const topPerformer = useMemo(() => {
        if (teamTasks.length === 0) return null;
        const memberCounts: Record<string, number> = {};
        teamTasks.filter((t: any) => t.status === 'completed').forEach((t: any) => {
            Object.entries(t.assignments || {}).forEach(([uid, level]) => {
                if (level === 'write') {
                    memberCounts[uid] = (memberCounts[uid] || 0) + 1;
                }
            });
        });
        const topUid = Object.entries(memberCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        return members.find(m => m.user_id === topUid) || null;
    }, [teamTasks, members]);

    const taskCompletionRate = useMemo(() => {
        if (tasks.length === 0) return 0;
        const fullyCompleted = tasks.filter((t: any) => t.status === 'completed').length;
        return Math.round((fullyCompleted / tasks.length) * 100);
    }, [tasks]);

    // Actions
    const handleReactivateTab = async (tabKey: string) => {
        if (!hasAuthority || status === 'submitted') return;
        const updatedTasks = tasks.map((t: any) =>
            t.tab === tabKey ? { ...t, finalized: false, status: 'in_progress' as const } : t
        );
        setValue("tasks_jsonb", updatedTasks, { shouldDirty: true });
        await updatePilotData({ tasks_jsonb: updatedTasks });
        // Notify team (fire-and-forget)
        const tabLabel = tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
        notifyTabReactivated(pilot.id, tabLabel, profile?.id || '').catch(() => { });
    };

    const handleFinalSubmit = async () => {
        if (!hasAuthority || isSubmitting) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await updatePilotData({ status: 'submitted' });
            if (res.success) {
                // Notify team + superadmin (fire-and-forget)
                notifyPilotSubmitted(pilot.id, pilot.institution || 'Unknown').catch(() => { });
                window.location.reload();
            } else {
                setError(res.error || 'Failed to provision sandbox. Database policies may have rejected the update.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during provisioning.');
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
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Final Pilot Configuration</h1>

                    <div className="bg-white border border-slate-200/60 rounded-2xl p-3 shadow-sm flex items-center gap-4 min-w-[220px]">
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tabs Finalized</p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-700">{completedTabs.length} / 7</span>
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-tight ${completedTabs.length === 7 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                    {completedTabs.length === 7 ? 'Ready' : 'Incomplete'}
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
                                    strokeDasharray={`${(completedTabs.length / 7) * 106} 106`}
                                />
                            </svg>
                            <span className="absolute text-[10px] font-bold">{Math.round((completedTabs.length / 7) * 100)}%</span>
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
                    <div className="flex flex-col h-full space-y-[10px] relative">
                        {/* Row 1: Types & Percentage Split */}
                        <div className="py-[8px] border-b border-slate-100">
                            <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mb-1.5">Types</p>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span className="text-slate-400 font-medium">Automated</span>
                                        <span className="font-bold text-indigo-600">{activeKpis.length > 0 ? Math.round((automatedCount / activeKpis.length) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                            style={{ width: `${activeKpis.length > 0 ? (automatedCount / activeKpis.length) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 text-right">
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span className="font-bold text-amber-600">{activeKpis.length > 0 ? Math.round((selfCount / activeKpis.length) * 100) : 0}%</span>
                                        <span className="text-slate-400 font-medium">Manual</span>
                                    </div>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden flex justify-end">
                                        <div
                                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                            style={{ width: `${activeKpis.length > 0 ? (selfCount / activeKpis.length) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: KPI Lists Side-by-Side */}
                        <div className="grid grid-cols-2 gap-4 py-[8px] border-b border-slate-100 flex-1 h-[140px]">
                            <div className="overflow-hidden">
                                <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mb-2">Automated</p>
                                <div className="space-y-1.5">
                                    {activeKpis.filter((k: any) => k.type === 'automated').slice(0, 4).map((k: any) => (
                                        <div key={k.id} className="flex items-start gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                            <span className="text-[10px] font-medium text-slate-600 leading-tight line-clamp-1">{k.title}</span>
                                        </div>
                                    ))}
                                    {automatedCount > 4 && (
                                        <p className="text-[9px] font-bold text-slate-400 mt-1 pl-2.5">+{automatedCount - 4} more</p>
                                    )}
                                    {automatedCount === 0 && <span className="text-[10px] text-slate-400 italic">None Active</span>}
                                </div>
                            </div>
                            <div className="text-right overflow-hidden flex flex-col items-end">
                                <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mb-2">Self-Assessment</p>
                                <div className="space-y-1.5 w-full">
                                    {activeKpis.filter((k: any) => k.type === 'self_assessment').slice(0, 4).map((k: any) => (
                                        <div key={k.id} className="flex items-start justify-end gap-1.5">
                                            <span className="text-[10px] font-medium text-slate-600 leading-tight line-clamp-1">{k.title}</span>
                                            <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                        </div>
                                    ))}
                                    {selfCount > 4 && (
                                        <p className="text-[9px] font-bold text-slate-400 mt-1 pr-2.5">+{selfCount - 4} more</p>
                                    )}
                                    {selfCount === 0 && <span className="text-[10px] text-slate-400 italic">None Active</span>}
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Delivery Governance (Absolute Position) */}
                        <div className="absolute bottom-0 inset-x-0 bg-white pt-2 pb-[8px]">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest shrink-0">Delivery:</span>
                                <p className="text-[11px] font-semibold text-slate-600 leading-tight truncate">
                                    {kpisData.delivery?.method === "dashboard" ? "Instructor Dashboard" : "Manual Offline"}
                                    <span className="text-slate-300 mx-1.5">•</span>
                                    <span className="capitalize">{kpisData.delivery?.frequency || "Weekly"}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </ExecutiveSummaryCard>

                {/* 3. Instructor Permissions */}
                <ExecutiveSummaryCard
                    title="Instructor Permissions"
                    tabKey="settings"
                    isLocked={isTabLocked("settings")}
                    isChampion={hasAuthority}
                    onReactivate={handleReactivateTab}
                    icon={Settings}
                    primaryMetric={`${autonomy}% Autonomy`}
                    className="h-[310px]"
                >
                    <div className="flex flex-col h-full space-y-[10px] relative">
                        {/* Row 1 & 2: Access Matrix (2x2 Grid) */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0 flex-1 min-h-0">
                            {/* Classes */}
                            <div className="pt-[2px] pb-[4px] border-b border-slate-100 flex flex-col justify-start">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <BookOpen className="w-3 h-3 text-blue-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-700">Classes</span>
                                </div>
                                <div className="space-y-1">
                                    {permissions.manage_classes ? (
                                        <>
                                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 leading-tight">
                                                <div className="w-0.5 h-0.5 rounded-full bg-slate-400" /> Create & Edit
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 leading-tight">
                                                <div className="w-0.5 h-0.5 rounded-full bg-slate-400" /> Manage Assignments
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 leading-tight">
                                                <div className="w-0.5 h-0.5 rounded-full bg-slate-400" /> Grade Assets
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 italic">Locked</span>
                                    )}
                                </div>
                            </div>

                            {/* Practicums */}
                            <div className="pt-[2px] pb-[4px] border-b border-slate-100 flex flex-col justify-start text-right items-end">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[10px] font-bold text-slate-700">Practicums</span>
                                    <div className="w-5 h-5 rounded-lg bg-emerald-50 flex items-center justify-center">
                                        <FileText className="w-3 h-3 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {permissions.manage_practicums ? (
                                        <>
                                            <div className="text-[10px] text-slate-500 font-medium flex items-center justify-end gap-1 leading-tight">
                                                Define Rubrics <div className="w-0.5 h-0.5 rounded-full bg-slate-400" />
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium flex items-center justify-end gap-1 leading-tight">
                                                Verify Logs <div className="w-0.5 h-0.5 rounded-full bg-slate-400" />
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium flex items-center justify-end gap-1 leading-tight">
                                                Supervisor Final <div className="w-0.5 h-0.5 rounded-full bg-slate-400" />
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 italic">Locked</span>
                                    )}
                                </div>
                            </div>

                            {/* OER Content */}
                            <div className="pt-[2px] pb-[8px] flex flex-col justify-start border-b border-slate-100 mt-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-5 h-5 rounded-lg bg-amber-50 flex items-center justify-center">
                                        <Archive className="w-3 h-3 text-amber-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-700">OER Content</span>
                                </div>
                                <div className="space-y-1">
                                    {permissions.allow_content_upload ? (
                                        <>
                                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 leading-tight">
                                                <div className="w-0.5 h-0.5 rounded-full bg-slate-400" /> Upload Assets
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 leading-tight">
                                                <div className="w-0.5 h-0.5 rounded-full bg-slate-400" /> Author Native
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 leading-tight">
                                                <div className="w-0.5 h-0.5 rounded-full bg-slate-400" /> Push to Class
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 italic">Locked</span>
                                    )}
                                </div>
                            </div>

                            {/* Students */}
                            <div className="pt-[2px] pb-[8px] flex flex-col justify-start text-right items-end border-b border-slate-100 mt-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[10px] font-bold text-slate-700">Student Roster</span>
                                    <div className="w-5 h-5 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <Users className="w-3 h-3 text-indigo-500" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {permissions.manage_students ? (
                                        <>
                                            <div className="text-[10px] text-slate-500 font-medium flex items-center justify-end gap-1 leading-tight">
                                                View Enrollment <div className="w-0.5 h-0.5 rounded-full bg-slate-400" />
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium flex items-center justify-end gap-1 leading-tight">
                                                Direct Message <div className="w-0.5 h-0.5 rounded-full bg-slate-400" />
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium flex items-center justify-end gap-1 leading-tight">
                                                Broadcast Alert <div className="w-0.5 h-0.5 rounded-full bg-slate-400" />
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 italic">Locked</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Critical Guardrails (Absolute Position) */}
                        <div className="absolute bottom-0 inset-x-0 bg-white pt-2 pb-[8px]">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest shrink-0">Guardrails:</span>
                                <p className="text-[11px] font-semibold text-slate-600 leading-tight truncate">
                                    AI Override: {permissions.ai_assessment_override ? "Active" : "Inactive"}
                                </p>
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
                    primaryMetric={`${teamCompletionRate}% Ready`}
                    className="h-[310px]"
                >
                    <div className="flex flex-col h-full space-y-[10px] relative">
                        {/* Row 1: Performance Pulse */}
                        <div className="py-[8px] border-b border-slate-100">
                            <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mb-1.5">Performance</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-[10px] text-slate-400">Completion</span>
                                        <span className="text-[10px] font-bold text-indigo-600">{teamCompletionRate}%</span>
                                    </div>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${teamCompletionRate}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-[10px] text-slate-400">Late Tasks</span>
                                        <span className="text-[10px] font-bold text-amber-600">{lateTeamRate}%</span>
                                    </div>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${lateTeamRate}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Top Performer */}
                        <div className="py-[12px] border-b border-slate-100 flex-1">
                            <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mb-3">Top Performer</p>
                            {topPerformer ? (
                                <div className="flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 border-2 border-white shadow-sm uppercase">
                                        {topPerformer.profiles?.email?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-slate-700 truncate">
                                            {topPerformer.profiles?.first_name
                                                ? `${topPerformer.profiles.first_name} ${topPerformer.profiles.last_name || ''}`
                                                : topPerformer.profiles?.email?.split('@')[0] || 'Member'}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-tight">Best Pace</span>
                                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">Achievement</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[60px] flex items-center justify-center border border-dashed border-slate-200 rounded-xl">
                                    <p className="text-[10px] text-slate-400 italic">No tasks completed yet</p>
                                </div>
                            )}
                        </div>

                        {/* Row 3: Team Members (Absolute Position) */}
                        <div className="absolute bottom-0 inset-x-0 bg-white pt-2 pb-[8px]">
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest shrink-0">Team Members</p>
                                <div className="flex -space-x-2">
                                    {members.slice(0, 5).map((m: any, i: number) => (
                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 shadow-sm uppercase shrink-0">
                                            {m.profiles?.email?.charAt(0) || '?'}
                                        </div>
                                    ))}
                                    {members.length > 5 && (
                                        <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[8px] font-bold text-indigo-600 shadow-sm shrink-0">
                                            +{members.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ExecutiveSummaryCard>

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
                    primaryMetric={
                        <>
                            Domain / URL: <span className="text-emerald-600 ml-1.5">{branding.subdomain ? `${branding.subdomain}.schologic.com` : "Not Set"}</span>
                        </>
                    }
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

                {/* 6. Admin Dashboard (Hero) */}
                <ExecutiveSummaryCard
                    title="Admin Dashboard"
                    tabKey="dashboard"
                    isLocked={isTabLocked("dashboard")}
                    isChampion={hasAuthority}
                    onReactivate={handleReactivateTab}
                    icon={Monitor}
                    size="large"
                    noPadding={true}
                    className="lg:col-span-2"
                    primaryMetric={
                        <>
                            Dashboard Focus: <span className="text-indigo-600 ml-1.5">{dashboard.view_type || "Academic"}</span>
                        </>
                    }
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
                {status === 'submitted' ? (
                    <>
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sandbox Provisioning Initiated</h2>
                        <div className="mt-4 max-w-lg">
                            <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                                The pilot blueprint has been permanently locked and sent for provisioning. You will receive an email once the secure sandbox environment is ready for access.
                            </p>
                            <div className="inline-flex items-center gap-3 px-5 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Environment Building...</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
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
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm font-medium text-left shadow-sm">
                                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                                        <span className="leading-relaxed">{error}</span>
                                    </div>
                                )}
                                <button
                                    onClick={handleFinalSubmit}
                                    disabled={isSubmitting}
                                    className={`px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50`}
                                >
                                    {isSubmitting ? 'Provisioning...' : 'Provision Sandbox Now'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
