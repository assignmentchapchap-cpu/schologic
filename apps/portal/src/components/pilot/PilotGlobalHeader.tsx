"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, MessageSquare, LogOut, User, ShieldCheck, ChevronDown, ClipboardList as ListTodo, Play, Check, ExternalLink, Shield, Headphones } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UserIdentity } from "@/lib/identity-server";
import { createClient } from "@schologic/database";
import { usePilotForm } from "./PilotFormContext";
import { updatePilotData } from "@/app/actions/pilotPortal";
import { usePilotMessages } from "@/context/PilotMessageContext";

interface PilotGlobalHeaderProps {
    identity?: UserIdentity | null;
}

export function PilotGlobalHeader({ identity }: PilotGlobalHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    const { watch, setValue, getValues } = usePilotForm();
    const tasks = watch("tasks_jsonb") || [];
    const [isTasksOpen, setIsTasksOpen] = useState(false);
    const tasksRef = useRef<HTMLDivElement>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const { openToSupport } = usePilotMessages();

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (tasksRef.current && !tasksRef.current.contains(event.target as Node)) {
                setIsTasksOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fullName = identity?.full_name || identity?.email?.split('@')[0] || "User";
    const initials = identity?.full_name
        ? identity.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : identity?.email?.[0]?.toUpperCase() || "U";

    const isChampion = identity?.pilot_permissions?.is_champion;

    const currentUserId = identity?.id || '';
    const myTasks = tasks.filter(t => t.assignments?.[currentUserId] === 'write' && t.status !== 'completed');
    const allMyAssignedTasks = tasks.filter(t => t.assignments?.[currentUserId] === 'write');
    const activeCount = myTasks.length;
    const allMyTasksCompleted = allMyAssignedTasks.length > 0 && allMyAssignedTasks.every(t => t.status === 'completed');
    const allMyTasksFinalized = allMyAssignedTasks.length > 0 && allMyAssignedTasks.every(t => t.finalized);

    const handleUpdateTaskStatus = async (taskId: string) => {
        setIsUpdating(taskId);
        try {
            const task = tasks.find(t => t.id === taskId);
            if (task?.finalized) return;

            const statusCycle: Record<string, 'pending' | 'in_progress' | 'completed'> = {
                pending: 'in_progress',
                in_progress: 'completed',
                completed: 'pending',
            };
            const nextStatus = statusCycle[task?.status || 'pending'];
            const updated = tasks.map(t =>
                t.id === taskId ? { ...t, status: nextStatus } : t
            );

            // 1. Update form state
            setValue("tasks_jsonb", updated, { shouldDirty: true });

            // 2. Append changelog
            const currentLog = getValues("changelog_jsonb") || {};
            const entry = {
                time: new Date().toISOString(),
                user: fullName,
                action: `${nextStatus === 'in_progress' ? 'Started' : 'Completed'} task: ${task?.title || taskId}`
            };
            const tab = task?.tab || 'team';
            const logUpdate = { ...currentLog, [tab]: [entry, ...(currentLog[tab] || [])].slice(0, 20) };
            setValue("changelog_jsonb", logUpdate);

            // 3. Persist to DB
            await updatePilotData({ tasks_jsonb: updated, changelog_jsonb: logUpdate });
        } catch (err) {
            console.error("Header Task Update Error:", err);
        } finally {
            setIsUpdating(null);
        }
    };

    const handleFinalizeTasks = async () => {
        const myTasks = tasks.filter(t => t.assignments?.[currentUserId] === 'write');
        if (myTasks.length === 0 || !myTasks.every(t => t.status === 'completed')) return;

        const confirmed = window.confirm("This action will finalize your current tasks and disable further changes. Are you sure you want to proceed?");
        if (!confirmed) return;

        const updated = tasks.map(t =>
            t.assignments?.[currentUserId] === 'write' ? { ...t, finalized: true } : t
        );

        setValue("tasks_jsonb", updated, { shouldDirty: true });

        // 2. Append changelog
        const currentLog = getValues("changelog_jsonb") || {};
        const entry = {
            time: new Date().toISOString(),
            user: fullName,
            action: `Confirmed final status for all tasks`
        };
        const logUpdate = { ...currentLog, team: [entry, ...(currentLog['team'] || [])].slice(0, 20) };
        setValue("changelog_jsonb", logUpdate);

        await updatePilotData({
            tasks_jsonb: updated,
            changelog_jsonb: logUpdate
        });
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between px-6 h-16">
                <div className="flex items-center gap-6">
                    <img src="/logo_updated.png" alt="Schologic" className="h-6 w-auto" />
                    <div className="h-6 w-px bg-slate-200" />
                    <span className="text-sm font-serif font-bold text-slate-900">Pilot Management Portal</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* My Tasks Dropdown */}
                    <div className="relative" ref={tasksRef}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsTasksOpen(!isTasksOpen)}
                            className={`hidden md:flex relative ${isTasksOpen ? 'bg-slate-100 text-slate-900 border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <ListTodo className="h-4 w-4 mr-2" />
                            My Tasks
                            {activeCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                                    {activeCount}
                                </span>
                            )}
                        </Button>

                        {isTasksOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-0 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-900">My Assigned Tasks</span>
                                    <Link href="/portal/team" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                        View All <ExternalLink className="w-2.5 h-2.5" />
                                    </Link>
                                </div>
                                <div className="max-h-[320px] overflow-y-auto">
                                    {myTasks.length === 0 ? (
                                        <div className="px-4 py-8 text-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2 text-slate-300">
                                                <ListTodo className="w-4 h-4" />
                                            </div>
                                            <p className="text-[11px] font-medium text-slate-400">All caught up!</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-50">
                                            {myTasks.map(task => (
                                                <div key={task.id} className="p-3 hover:bg-slate-50/50 transition-colors">
                                                    <div className="flex flex-col gap-2">
                                                        <span className="text-xs font-medium text-slate-700 leading-normal line-clamp-2">
                                                            {task.title}
                                                        </span>
                                                        <div className="flex items-center justify-between mt-0.5">
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                {task.tab}
                                                            </span>
                                                            {isUpdating === task.id ? (
                                                                <span className="w-3.5 h-3.5 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                                                            ) : (
                                                                <>
                                                                    {task.status === 'pending' && (
                                                                        <button
                                                                            onClick={() => handleUpdateTaskStatus(task.id)}
                                                                            className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                                                                        >
                                                                            <Play className="w-2.5 h-2.5 fill-indigo-600" /> Start Working
                                                                        </button>
                                                                    )}
                                                                    {task.status === 'in_progress' && (
                                                                        <button
                                                                            onClick={() => handleUpdateTaskStatus(task.id)}
                                                                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-[10px] font-bold text-amber-600"
                                                                        >
                                                                            <Check className="w-2.5 h-2.5" /> Mark Done
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-slate-50/50 border-t border-slate-100">
                                    {(() => {
                                        const allMyTasks = tasks.filter(t => t.assignments?.[currentUserId] === 'write');
                                        const allDone = allMyTasks.length > 0 && allMyTasks.every(t => t.status === 'completed');
                                        const allFinalized = allMyAssignedTasks.length > 0 && allMyAssignedTasks.every(t => t.finalized);

                                        if (allFinalized) return (
                                            <div className="flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-100 rounded-lg">
                                                <Shield className="w-3 h-3" /> All Tasks Finalized
                                            </div>
                                        );

                                        return (
                                            <button
                                                onClick={handleFinalizeTasks}
                                                disabled={!allDone}
                                                className={`w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${allDone
                                                    ? 'text-white bg-indigo-600 border-indigo-600 hover:bg-indigo-700 shadow-sm'
                                                    : 'text-slate-400 border-slate-200 bg-white opacity-40 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Shield className="w-3 h-3" /> Confirm Final Status
                                            </button>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>

                    <Button variant="ghost" size="sm" className="hidden md:flex text-slate-600 hover:text-slate-900" onClick={openToSupport}>
                        <Headphones className="h-4 w-4 mr-2" />
                        Support
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    </Button>

                    {/* Profile Dropdown */}
                    <div className="relative ml-2" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                        >
                            <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                                <span className="text-xs font-bold text-indigo-600">{initials}</span>
                            </div>
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Header */}
                                <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-indigo-600">{initials}</span>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-slate-900 truncate">{fullName}</span>
                                        <span className="text-xs text-slate-500 truncate">{identity?.email}</span>
                                    </div>
                                </div>

                                <div className="p-2 space-y-2">
                                    <div className="flex items-center justify-between px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Account Context
                                    </div>
                                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50/50 border border-slate-100 mb-2">
                                        <div className={`p-1.5 rounded-md ${isChampion ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {isChampion ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700 capitalize">
                                                {isChampion ? "Pilot Champion" : "Team Member"}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {isChampion ? "Full Administrative Access" : "Restricted Access"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Detailed Permissions Section */}
                                    <div className="px-3 py-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                            Write Permissions
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 focus-within:ring-0">
                                            {isChampion ? (
                                                <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">
                                                    All Portal Tabs
                                                </span>
                                            ) : (() => {
                                                const rawPerms = identity?.pilot_permissions?.tab_permissions_jsonb as Record<string, string> || {};

                                                // Normalize DB perms
                                                const dbActiveTabs = Object.entries(rawPerms)
                                                    .filter(([_, level]) => level === "write")
                                                    .map(([key]) => key.replace(/^tab\d+_/, ''));

                                                // Add tabs where user has task-level write access
                                                const taskActiveTabs = tasks
                                                    .filter((t: any) => t.assignments?.[identity?.id || ''] === 'write')
                                                    .map((t: any) => t.tab);

                                                const allActiveTabs = Array.from(new Set([...dbActiveTabs, ...taskActiveTabs]));

                                                if (allActiveTabs.length === 0) {
                                                    return (
                                                        <div className="w-full flex items-center gap-2 px-2 py-1.5 rounded bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100">
                                                            <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                                                            Read-Only Access
                                                        </div>
                                                    );
                                                }

                                                return allActiveTabs.map((tab) => (
                                                    <span key={tab} className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 capitalize">
                                                        {tab}
                                                    </span>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-2 border-t border-slate-50 mt-1">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors group text-left"
                                    >
                                        <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
