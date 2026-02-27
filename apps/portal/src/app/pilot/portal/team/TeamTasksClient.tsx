"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { usePilotForm } from "@/components/pilot/PilotFormContext";
import {
    CheckCircle2, History, X, Save, UserPlus, User,
    Shield, Star, Trash2, ChevronDown, Plus, BarChart2,
    Clock, Play, Check, RotateCcw
} from "lucide-react";
import { updatePilotData } from "@/app/actions/pilotPortal";
import { removeTeamMember } from "@/app/actions/pilotTeam";
import { MarkTabCompleted } from "@/components/pilot/MarkTabCompleted";
import { InviteTeamMemberModal } from "@/components/pilot/InviteTeamMemberModal";
import { GanttChart } from "@/components/pilot/GanttChart";

// Circle icon (lucide-react doesn't export a plain Circle)
const CircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
    </svg>
);

// ─── Helpers ─────────────────────────────────────────────────

const getMemberName = (m: TeamMember): string => {
    if (m.profiles) {
        const full = `${m.profiles.first_name || ''} ${m.profiles.last_name || ''}`.trim();
        if (full) return full;
        if (m.profiles.email) return m.profiles.email.split('@')[0];
    }
    return 'Unknown';
};

// ─── Default Per-Tab Activities ──────────────────────────────

const DEFAULT_ACTIVITIES: { tab: string; title: string }[] = [
    { tab: "scope", title: "Set module parameters" },
    { tab: "scope", title: "Configure constraints & limits" },
    { tab: "scope", title: "Add target departments" },
    { tab: "team", title: "Invite team members" },
    { tab: "team", title: "Set member permissions" },
    { tab: "team", title: "Assign team roles" },
    { tab: "kpis", title: "Identify success KPIs" },
    { tab: "kpis", title: "Configure measurement criteria" },
    { tab: "branding", title: "Upload logo & favicon" },
    { tab: "branding", title: "Configure theme colors" },
    { tab: "branding", title: "Set URL / subdomain" },
    { tab: "settings", title: "Configure class management rules" },
    { tab: "settings", title: "Set AI assessment policies" },
    { tab: "settings", title: "Define communication rules" },
    { tab: "dashboard", title: "Select dashboard layout" },
    { tab: "dashboard", title: "Choose metric widgets" },
    { tab: "preview", title: "Review full blueprint" },
    { tab: "preview", title: "Obtain team sign-off" },
];

// Dynamic tasks based on enabled modules
const MODULE_TASKS: Record<string, { tab: string; title: string }[]> = {
    "AI Forensics": [{ tab: "scope", title: "Configure AI plagiarism thresholds" }],
    "AI Assistant": [{ tab: "scope", title: "Define AI grading rubric parameters" }],
    "OER Library": [{ tab: "scope", title: "Curate initial OER resource collection" }],
    "Class Manager": [{ tab: "scope", title: "Set up class structure templates" }],
    "Practicum Manager": [{ tab: "scope", title: "Define attachment tracking rules" }],
};

const TAB_LABELS: Record<string, string> = {
    scope: "Scope", team: "Team", kpis: "KPIs", branding: "Branding",
    settings: "Settings", dashboard: "Dashboard", preview: "Preview",
};

const TAB_ORDER = ['scope', 'team', 'kpis', 'branding', 'settings', 'dashboard', 'preview'];
const TAB_NUMBERS: Record<string, string> = {
    scope: '01', team: '02', kpis: '03', branding: '04',
    settings: '05', dashboard: '06', preview: '07',
};

const STATUS_CONFIG = {
    pending: { icon: CircleIcon, label: "Pending", color: "text-slate-400", bg: "bg-slate-100", ring: "ring-slate-200" },
    in_progress: { icon: Clock, label: "In Progress", color: "text-indigo-500", bg: "bg-indigo-50", ring: "ring-indigo-200" },
    completed: { icon: CheckCircle2, label: "Completed", color: "text-emerald-500", bg: "bg-emerald-50", ring: "ring-emerald-200" },
};

// ─── Types ───────────────────────────────────────────────────

interface TeamMember {
    id: string;
    user_id: string;
    is_champion: boolean;
    tab_permissions_jsonb: Record<string, string>;
    created_at: string;
    profiles: { first_name: string; last_name: string; email: string } | null;
}

interface ChangelogEntry {
    time: string;
    user: string;
    action: string;
}

interface PilotTask {
    id: string;
    tab: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    assigned_to?: string;
    start_date?: string;
    due_date?: string;
    is_auto: boolean;
    sort_order: number;
}

// ─── Component ───────────────────────────────────────────────

export function TeamTasksClient({
    pilot,
    profile,
    membership,
    initialMembers,
}: {
    pilot: any;
    profile: any;
    membership: any;
    initialMembers: TeamMember[];
}) {
    const { watch, setValue, getValues } = usePilotForm();
    const [members, setMembers] = useState<TeamMember[]>(initialMembers);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'gantt' | 'mine'>('mine');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showChangelog, setShowChangelog] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
    const [expandedTabs, setExpandedTabs] = useState<Set<string>>(new Set());

    const isChampion = membership?.is_champion === true;
    const currentUserId = membership?.user_id || '';
    const tasks: PilotTask[] = watch("tasks_jsonb") || [];
    const scopeModules = watch("scope_jsonb.core_modules") || [];
    const scopeAddOns = watch("scope_jsonb.add_ons") || [];
    const pilotWeeks = watch("scope_jsonb.pilot_period_weeks") || 4;
    const completedTabs: string[] = watch("completed_tabs_jsonb") || [];
    const isTabCompleted = useCallback((tab: string) => completedTabs.includes(tab), [completedTabs]);

    // Editor name
    let editorName = 'Unknown Member';
    if (profile) {
        if (profile.first_name && profile.last_name) {
            editorName = `${profile.first_name} ${profile.last_name}`;
        } else if (profile.email) {
            editorName = profile.email.split('@')[0];
        }
    }

    // ─── Auto-generate tasks on first load (synchronous) ────

    const hasGeneratedRef = useRef(false);

    useMemo(() => {
        if (hasGeneratedRef.current) return;
        const currentTasks = getValues("tasks_jsonb") || [];
        if (currentTasks.length > 0) return;

        hasGeneratedRef.current = true;
        const allModules = [...scopeModules, ...scopeAddOns];
        const dynamicTasks = allModules.flatMap(mod => MODULE_TASKS[mod] || []);
        const allActivities = [...DEFAULT_ACTIVITIES, ...dynamicTasks];

        const generated: PilotTask[] = allActivities.map((act, idx) => ({
            id: crypto.randomUUID(),
            tab: act.tab,
            title: act.title,
            status: 'pending' as const,
            is_auto: true,
            sort_order: idx,
        }));

        setValue("tasks_jsonb", generated, { shouldDirty: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Save handler ──────────────────────────────

    // Append a changelog entry under a specific tab key
    const appendChangelogEntry = useCallback((tab: string, action: string) => {
        const currentLog: Record<string, ChangelogEntry[]> = getValues("changelog_jsonb") || {};
        const entry: ChangelogEntry = {
            time: new Date().toISOString(),
            user: editorName,
            action,
        };
        const tabEntries = currentLog[tab] || [];
        const updated = {
            ...currentLog,
            [tab]: [entry, ...tabEntries].slice(0, 20), // keep last 20 per tab
        };
        setValue("changelog_jsonb", updated);
        return updated;
    }, [getValues, setValue, editorName]);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        setError(null);
        try {
            const currentTasks = getValues("tasks_jsonb");
            const logUpdate = appendChangelogEntry('team', 'Manual save');
            const res = await updatePilotData({ tasks_jsonb: currentTasks, changelog_jsonb: logUpdate });
            if (res?.error) throw new Error(res.error);
            setLastSaved(new Date());
        } catch (err: any) {
            setError(err.message || "Save failed.");
        } finally {
            setIsSaving(false);
        }
    }, [getValues, editorName, appendChangelogEntry]);

    // ─── Auto-save helper ───────────────────────────────

    const autoSaveTasks = useCallback(async (updatedTasks: PilotTask[], action: string = 'Updated tasks', tab: string = 'team') => {
        setIsSaving(true);
        setError(null);
        try {
            const logUpdate = appendChangelogEntry(tab, action);
            const res = await updatePilotData({ tasks_jsonb: updatedTasks, changelog_jsonb: logUpdate });
            if (res?.error) throw new Error(res.error);
            setLastSaved(new Date());
        } catch (err: any) {
            setError(err.message || "Auto-save failed.");
        } finally {
            setIsSaving(false);
        }
    }, [appendChangelogEntry]);

    // ─── Task mutations ────────────────────────────────────

    // Status cycle — Grid/Gantt (no auto-save, requires manual Save)
    const updateTaskStatus = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && isTabCompleted(task.tab)) return;
        const statusCycle: Record<string, 'pending' | 'in_progress' | 'completed'> = {
            pending: 'in_progress',
            in_progress: 'completed',
            completed: 'pending',
        };
        const updated = tasks.map(t =>
            t.id === taskId ? { ...t, status: statusCycle[t.status] } : t
        );
        setValue("tasks_jsonb", updated, { shouldDirty: true });
    };

    // Status cycle — My Tasks (auto-saves immediately)
    const updateTaskStatusAndSave = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && isTabCompleted(task.tab)) return;
        const statusCycle: Record<string, 'pending' | 'in_progress' | 'completed'> = {
            pending: 'in_progress',
            in_progress: 'completed',
            completed: 'pending',
        };
        const updated = tasks.map(t =>
            t.id === taskId ? { ...t, status: statusCycle[t.status] } : t
        );
        setValue("tasks_jsonb", updated, { shouldDirty: true });
        autoSaveTasks(updated, `Status changed: ${task?.title || taskId}`, task?.tab || 'team');
    };

    const startWorking = () => {
        const updated = tasks.map(t =>
            t.assigned_to === currentUserId && t.status === 'pending' && !isTabCompleted(t.tab)
                ? { ...t, status: 'in_progress' as const }
                : t
        );
        setValue("tasks_jsonb", updated, { shouldDirty: true });
        autoSaveTasks(updated, 'Started working');
    };

    const updateTaskAssignee = (taskId: string, userId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && isTabCompleted(task.tab)) return;
        const updated = tasks.map(t =>
            t.id === taskId ? { ...t, assigned_to: userId || undefined } : t
        );
        const assigneeName = members.find(m => m.user_id === userId);
        setValue("tasks_jsonb", updated, { shouldDirty: true });
        autoSaveTasks(updated, `Assigned: ${task?.title || 'task'} → ${assigneeName ? getMemberName(assigneeName) : 'Unassigned'}`, task?.tab || 'team');
    };

    const assignTabBulk = (tab: string, userId: string) => {
        if (isTabCompleted(tab)) return;
        const updated = tasks.map(t =>
            t.tab === tab ? { ...t, assigned_to: userId || undefined } : t
        );
        const assigneeName = members.find(m => m.user_id === userId);
        setValue("tasks_jsonb", updated, { shouldDirty: true });
        autoSaveTasks(updated, `Bulk assigned → ${assigneeName ? getMemberName(assigneeName) : 'Unassigned'}`, tab);
    };

    const addCustomTask = (tab: string = 'team') => {
        const newTask: PilotTask = {
            id: crypto.randomUUID(),
            tab,
            title: "New task",
            status: 'pending',
            is_auto: false,
            sort_order: tasks.length,
        };
        const updated = [...tasks, newTask];
        setValue("tasks_jsonb", updated, { shouldDirty: true });
        setEditingTaskId(newTask.id);
        setEditingTitle("New task");
        setExpandedTabs(prev => new Set(prev).add(tab));
        autoSaveTasks(updated, 'Added custom task', tab);
    };

    const deleteTask = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        const updated = tasks.filter(t => t.id !== taskId);
        setValue("tasks_jsonb", updated, { shouldDirty: true });
        autoSaveTasks(updated, `Deleted: ${task?.title || 'task'}`, task?.tab || 'team');
    };

    const saveTaskTitle = (taskId: string) => {
        if (!editingTitle.trim()) return;
        const task = tasks.find(t => t.id === taskId);
        const updated = tasks.map(t =>
            t.id === taskId ? { ...t, title: editingTitle.trim() } : t
        );
        setValue("tasks_jsonb", updated, { shouldDirty: true });
        setEditingTaskId(null);
        setEditingTitle("");
        autoSaveTasks(updated, `Renamed: ${task?.title} → ${editingTitle.trim()}`, task?.tab || 'team');
    };

    // ─── Expand/Collapse ────────────────────────────────────

    const toggleTab = (tab: string) => {
        setExpandedTabs(prev => {
            const next = new Set(prev);
            next.has(tab) ? next.delete(tab) : next.add(tab);
            return next;
        });
    };

    const expandAll = () => setExpandedTabs(new Set(TAB_ORDER));
    const collapseAll = () => setExpandedTabs(new Set());
    const allExpanded = TAB_ORDER.every(t => expandedTabs.has(t));

    // ─── Team mutation ─────────────────────────────────────

    const handleRemoveMember = async (memberId: string) => {
        setRemovingMemberId(memberId);
        try {
            const res = await removeTeamMember(memberId);
            if (res?.error) throw new Error(res.error);
            setMembers(prev => prev.filter(m => m.id !== memberId));
        } catch (err: any) {
            setError(err.message || "Failed to remove member.");
        } finally {
            setRemovingMemberId(null);
        }
    };

    // ─── Derived data ──────────────────────────────────────

    const tasksByTab: Record<string, PilotTask[]> = {};
    TAB_ORDER.forEach(tab => { tasksByTab[tab] = []; });
    tasks.forEach(t => {
        if (!tasksByTab[t.tab]) tasksByTab[t.tab] = [];
        tasksByTab[t.tab].push(t);
    });

    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    const getTabAssignee = (tab: string): string => {
        const tabTasks = tasksByTab[tab] || [];
        const assigned = tabTasks.filter(t => t.assigned_to).map(t => t.assigned_to!);
        if (assigned.length === 0) return '';
        const counts: Record<string, number> = {};
        assigned.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    };

    // ─── Render ────────────────────────────────────────────

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4 relative z-50">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Team & Tasks</h1>
                    <p className="text-slate-500 text-sm">Manage your pilot team and track deployment activities across all tabs.</p>
                </div>

                <div className="flex flex-col items-end gap-3 relative z-50">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowChangelog(!showChangelog)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold transition-colors rounded-lg ${showChangelog ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <History className="w-4 h-4" /> History
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="w-4 h-4" /> Save</>
                            )}
                        </button>
                    </div>

                    {/* Status */}
                    <div className="text-xs font-medium text-slate-400">
                        {lastSaved ? (
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                Last saved by {editorName} at {lastSaved.toLocaleTimeString()}
                            </span>
                        ) : (() => {
                            const allLog = watch("changelog_jsonb") || {};
                            const teamEntries = (allLog['team'] || []).sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
                            const latest = teamEntries[0] as any;
                            if (latest) {
                                return (
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        Last saved by {latest.user} at {new Date(latest.time).toLocaleTimeString()}
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

                    {error && <span className="text-xs font-bold text-red-500">{error}</span>}

                    {/* Changelog dropdown */}
                    {showChangelog && (() => {
                        const allLog: Record<string, ChangelogEntry[]> = watch("changelog_jsonb") || {};
                        // Show only entries for the active Team tab
                        const teamEntries = (allLog['team'] || [])
                            .map(e => ({ ...e, tab: 'team' }))
                            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                            .slice(0, 30);

                        if (teamEntries.length === 0) return (
                            <div className="absolute top-full mt-2 right-0 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 animate-in fade-in slide-in-from-top-2">
                                <p className="text-xs text-slate-400 text-center">No edit history yet.</p>
                            </div>
                        );

                        return (
                            <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-xs font-bold text-slate-900 px-3 py-2 border-b border-slate-100 mb-1">Edit History</h4>
                                <div className="max-h-64 overflow-y-auto">
                                    {teamEntries.map((log, idx) => (
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

            {/* Progress Bar */}
            <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">Overall Pilot Progress</span>
                    <span className="text-xs font-bold text-indigo-600">{completedCount}/{tasks.length} activities · {progressPct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>

            {/* Split-screen */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* ─── Left Panel: Team ──────────────────── */}
                <div className="lg:w-1/3">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm sticky top-24 overflow-hidden">
                        <div className="p-5 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <Shield className="w-4 h-4 text-indigo-500" /> Pilot Team
                                <span className="ml-auto text-xs font-normal text-slate-400">{members.length}/5</span>
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                            {members.map(member => {
                                const name = getMemberName(member);
                                const email = member.profiles?.email || '';
                                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                                return (
                                    <div key={member.id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${member.is_champion ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {initials || '??'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-bold text-slate-900 truncate">{name}</span>
                                                    {member.is_champion && (
                                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{email}</p>
                                                <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${member.is_champion ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {member.is_champion ? 'Champion' : 'Member'}
                                                </span>
                                            </div>
                                            {isChampion && !member.is_champion && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    disabled={removingMemberId === member.id}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0 disabled:opacity-50"
                                                    title="Remove member"
                                                >
                                                    {removingMemberId === member.id ? (
                                                        <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin block" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Invite button (Champion only) */}
                        {isChampion && members.length < 5 && (
                            <div className="p-4 border-t border-slate-100">
                                <button
                                    onClick={() => !isTabCompleted('team') && setShowInviteModal(true)}
                                    disabled={isTabCompleted('team')}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-colors ${isTabCompleted('team') ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                                        }`}
                                >
                                    <UserPlus className="w-4 h-4" /> Invite Member
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Right Panel: Tasks ────────────────── */}
                <div className="lg:w-2/3 space-y-4">
                    {/* View controls */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('mine')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'mine' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <User className="w-3.5 h-3.5" /> My Tasks
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <BarChart2 className="w-3.5 h-3.5" /> Grid
                            </button>
                            <button
                                onClick={() => setViewMode('gantt')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'gantt' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <BarChart2 className="w-3.5 h-3.5 rotate-90" /> Gantt
                            </button>
                        </div>

                        {/* Expand / Collapse All */}
                        {viewMode === 'grid' && (
                            <button
                                onClick={allExpanded ? collapseAll : expandAll}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors"
                            >
                                <ChevronDown className={`w-3 h-3 transition-transform ${allExpanded ? 'rotate-180' : ''}`} />
                                {allExpanded ? 'Collapse All' : 'Expand All'}
                            </button>
                        )}

                        {/* Start Working (My Tasks only) */}
                        {viewMode === 'mine' && tasks.some(t => t.assigned_to === currentUserId && t.status === 'pending') && (
                            <button
                                onClick={startWorking}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                            >
                                <Play className="w-3 h-3 fill-white" /> Start Working
                            </button>
                        )}
                    </div>

                    {viewMode === 'grid' && tasks.length === 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
                            <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-500">No activities yet.</p>
                            <p className="text-xs text-slate-400 mt-1">Activities will appear here once the pilot scope is configured.</p>
                        </div>
                    )}

                    {/* Grid View — Collapsible Tab Groups */}
                    {viewMode === 'grid' && tasks.length > 0 && (
                        <div className="space-y-3">
                            {TAB_ORDER.map(tab => {
                                const tabTasks = tasksByTab[tab] || [];
                                if (tabTasks.length === 0) return null;
                                const isExpanded = expandedTabs.has(tab);
                                const tabCompleted = tabTasks.filter(t => t.status === 'completed').length;
                                const tabAssignee = getTabAssignee(tab);
                                const assigneeMember = members.find(m => m.user_id === tabAssignee);
                                const tabAssigneeName = assigneeMember ? getMemberName(assigneeMember) : '';

                                return (
                                    <div key={tab} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                        {/* Group Header */}
                                        <div
                                            className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
                                            onClick={() => toggleTab(tab)}
                                        >
                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isExpanded ? '' : '-rotate-90'}`} />
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">{TAB_NUMBERS[tab]}</span>
                                                <span className="text-sm font-bold text-slate-900">{TAB_LABELS[tab]}</span>
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    {tabCompleted}/{tabTasks.length} done
                                                </span>
                                            </div>

                                            {/* Progress mini-bar */}
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${tabTasks.length > 0 ? (tabCompleted / tabTasks.length) * 100 : 0}%` }}
                                                />
                                            </div>

                                            {/* Bulk assignee */}
                                            <div onClick={e => e.stopPropagation()}>
                                                {isChampion ? (
                                                    <select
                                                        value={tabAssignee}
                                                        onChange={e => assignTabBulk(tab, e.target.value)}
                                                        disabled={isTabCompleted(tab)}
                                                        className={`text-xs font-medium bg-transparent border border-transparent rounded-lg px-2 py-1 outline-none w-28 truncate ${isTabCompleted(tab) ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:border-slate-200 focus:border-indigo-300 cursor-pointer'
                                                            }`}
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {members.map(m => (
                                                            <option key={m.user_id} value={m.user_id}>{getMemberName(m)}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-xs font-medium text-slate-500 truncate w-28 block text-right">
                                                        {tabAssigneeName || '—'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Activities */}
                                        {isExpanded && (
                                            <div className="border-t border-slate-100">
                                                {tabTasks.map(task => {
                                                    const statusCfg = STATUS_CONFIG[task.status];
                                                    const StatusIcon = statusCfg.icon;
                                                    const taskAssignee = task.assigned_to ? members.find(m => m.user_id === task.assigned_to) : null;
                                                    const taskAssigneeName = taskAssignee ? getMemberName(taskAssignee) : '';

                                                    return (
                                                        <div key={task.id} className="flex items-center gap-3 px-5 pl-12 py-2.5 hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-b-0">
                                                            {/* Status toggle */}
                                                            <button
                                                                onClick={() => updateTaskStatus(task.id)}
                                                                disabled={isTabCompleted(tab)}
                                                                className={`w-5 h-5 flex items-center justify-center rounded-full ring-1 transition-all ${statusCfg.bg} ${statusCfg.ring} shrink-0 ${isTabCompleted(tab) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                                                                    }`}
                                                                title={isTabCompleted(tab) ? 'Tab completed' : `${statusCfg.label} — click to cycle`}
                                                            >
                                                                <StatusIcon className={`w-3 h-3 ${statusCfg.color}`} />
                                                            </button>

                                                            {/* Title */}
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                {editingTaskId === task.id ? (
                                                                    <div className="flex items-center gap-1.5 w-full">
                                                                        <input
                                                                            type="text"
                                                                            value={editingTitle}
                                                                            onChange={e => setEditingTitle(e.target.value)}
                                                                            onKeyDown={e => e.key === 'Enter' && saveTaskTitle(task.id)}
                                                                            autoFocus
                                                                            className="flex-1 text-sm font-medium px-2 py-1 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                                        />
                                                                        <button onClick={() => saveTaskTitle(task.id)} className="text-indigo-600 hover:text-indigo-700 p-1">
                                                                            <Save className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button onClick={() => { setEditingTaskId(null); setEditingTitle(""); }} className="text-slate-400 hover:text-slate-600 p-1">
                                                                            <X className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <span
                                                                        className={`text-sm font-medium truncate ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'} ${isChampion ? 'cursor-pointer' : ''}`}
                                                                        onDoubleClick={() => {
                                                                            if (isChampion) {
                                                                                setEditingTaskId(task.id);
                                                                                setEditingTitle(task.title);
                                                                            }
                                                                        }}
                                                                        title={isChampion ? 'Double-click to edit' : undefined}
                                                                    >
                                                                        {task.title}
                                                                    </span>
                                                                )}
                                                                {task.is_auto && (
                                                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">⚡</span>
                                                                )}
                                                            </div>

                                                            {/* Assignee — always visible */}
                                                            <div className="flex items-center gap-1 w-28 shrink-0">
                                                                {isChampion ? (
                                                                    <select
                                                                        value={task.assigned_to || ''}
                                                                        onChange={e => updateTaskAssignee(task.id, e.target.value)}
                                                                        disabled={isTabCompleted(tab)}
                                                                        className={`text-[11px] font-medium bg-transparent border border-transparent rounded-lg px-1 py-0.5 outline-none w-full truncate ${isTabCompleted(tab) ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:border-slate-200 focus:border-indigo-300 cursor-pointer transition-colors'
                                                                            }`}
                                                                    >
                                                                        <option value="">Unassigned</option>
                                                                        {members.map(m => (
                                                                            <option key={m.user_id} value={m.user_id}>{getMemberName(m)}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <span className="text-[11px] font-medium text-slate-500 truncate">
                                                                        {taskAssigneeName || 'Unassigned'}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Delete (custom tasks only) */}
                                                            {isChampion && !task.is_auto && (
                                                                <button
                                                                    onClick={() => deleteTask(task.id)}
                                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded-lg transition-all shrink-0"
                                                                    title="Delete task"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {/* Add task inside this group */}
                                                {isChampion && (
                                                    <div className="px-5 pl-12 py-2 border-t border-slate-100">
                                                        <button
                                                            onClick={() => addCustomTask(tab)}
                                                            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" /> Add activity
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Gantt View */}
                    {viewMode === 'gantt' && (
                        <GanttChart
                            tasks={tasks}
                            members={members}
                            pilotWeeks={pilotWeeks}
                            onStatusChange={updateTaskStatus}
                        />
                    )}

                    {/* My Tasks View */}
                    {viewMode === 'mine' && (() => {
                        const myTasks = tasks.filter(t => t.assigned_to === currentUserId);
                        const statusOrder: ('in_progress' | 'pending' | 'completed')[] = ['in_progress', 'pending', 'completed'];
                        const statusLabels = { in_progress: 'In Progress', pending: 'Pending', completed: 'Completed' };

                        if (myTasks.length === 0) {
                            return (
                                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
                                    <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-slate-500">No tasks assigned to you yet.</p>
                                    <p className="text-xs text-slate-400 mt-1">Tasks assigned to you will appear here.</p>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-3">
                                {statusOrder.map(status => {
                                    const group = myTasks.filter(t => t.status === status);
                                    if (group.length === 0) return null;
                                    const statusCfg = STATUS_CONFIG[status];

                                    return (
                                        <div key={status} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                                <statusCfg.icon className={`w-4 h-4 ${statusCfg.color}`} />
                                                <span className="text-xs font-bold text-slate-700">{statusLabels[status]}</span>
                                                <span className="text-[10px] font-medium text-slate-400 ml-1">{group.length}</span>
                                            </div>
                                            {group.map(task => {
                                                const taskStatusCfg = STATUS_CONFIG[task.status];
                                                const TaskStatusIcon = taskStatusCfg.icon;
                                                return (
                                                    <div key={task.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-b-0">
                                                        <button
                                                            onClick={() => updateTaskStatusAndSave(task.id)}
                                                            className={`w-5 h-5 flex items-center justify-center rounded-full ring-1 transition-all ${taskStatusCfg.bg} ${taskStatusCfg.ring} hover:scale-110 shrink-0`}
                                                        >
                                                            <TaskStatusIcon className={`w-3 h-3 ${taskStatusCfg.color}`} />
                                                        </button>
                                                        <span className={`text-sm font-medium flex-1 min-w-0 truncate ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                            {task.title}
                                                        </span>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md shrink-0 hidden sm:inline">
                                                            {TAB_LABELS[task.tab]}
                                                        </span>
                                                        {/* Mark Complete / Undo */}
                                                        {task.status === 'in_progress' && (
                                                            <button
                                                                onClick={() => updateTaskStatusAndSave(task.id)}
                                                                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors shrink-0"
                                                            >
                                                                <Check className="w-3 h-3" /> Done
                                                            </button>
                                                        )}
                                                        {task.status === 'completed' && (
                                                            <button
                                                                onClick={() => updateTaskStatusAndSave(task.id)}
                                                                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                                                            >
                                                                <RotateCcw className="w-3 h-3" /> Undo
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}

                    {/* Completion Action (Grid view only) */}
                    {viewMode === 'grid' && (
                        <MarkTabCompleted tabId="team" hasWritePermission={isChampion} />
                    )}
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <InviteTeamMemberModal
                    onClose={() => setShowInviteModal(false)}
                    onSuccess={(newMember: TeamMember) => {
                        setMembers(prev => [...prev, newMember]);
                        setShowInviteModal(false);
                    }}
                />
            )}
        </div>
    );
}
