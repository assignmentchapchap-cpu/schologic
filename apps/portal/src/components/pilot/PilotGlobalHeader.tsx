"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, MessageSquare, LogOut, User, ShieldCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UserIdentity } from "@/lib/identity-server";
import { createClient } from "@schologic/database";
import { usePilotForm } from "./PilotFormContext";

interface PilotGlobalHeaderProps {
    identity?: UserIdentity | null;
}

export function PilotGlobalHeader({ identity }: PilotGlobalHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    const { watch } = usePilotForm();
    const tasks = watch("tasks_jsonb") || [];

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
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
                    <Button variant="ghost" size="sm" className="hidden md:flex text-slate-600 hover:text-slate-900">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Discussion Board
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
