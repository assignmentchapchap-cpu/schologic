"use client";

import React, { useState } from 'react';
import { Database, Shield, GraduationCap, Settings, BookOpen, User, Info, X } from 'lucide-react';
import { cn } from "@/lib/utils";

const roles = [
    {
        id: 'vc',
        label: 'Vice Chancellor',
        shortLabel: 'VC',
        icon: Shield,
        color: 'indigo',
        sends: 'Policy & Strategy',
        receives: 'Executive Insights',
        permissions: ['View all campuses', 'Set academic policy', 'Accreditation reports'],
    },
    {
        id: 'admin',
        label: 'System Admin',
        shortLabel: 'Admin',
        icon: Settings,
        color: 'slate',
        sends: 'Config & Security',
        receives: 'Audit Logs',
        permissions: ['Manage users & roles', 'Security config', 'System health'],
    },
    {
        id: 'hod',
        label: 'Head of Dept',
        shortLabel: 'HoD',
        icon: GraduationCap,
        color: 'emerald',
        sends: 'Curriculum QA',
        receives: 'Dept Analytics',
        permissions: ['Curriculum compliance', 'Staff allocation', 'Grade oversight'],
    },
    {
        id: 'instructor',
        label: 'Instructor',
        shortLabel: 'Instructor',
        icon: BookOpen,
        color: 'purple',
        sends: 'Content & Grades',
        receives: 'Class Analytics',
        permissions: ['Create classes', 'Grade submissions', 'View own students'],
    },
    {
        id: 'student',
        label: 'Student',
        shortLabel: 'Student',
        icon: User,
        color: 'blue',
        sends: 'Submissions',
        receives: 'Learning Materials',
        permissions: ['Submit work', 'View grades', 'Access reader'],
    },
];

const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string; ring: string }> = {
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', iconBg: 'bg-indigo-100', ring: 'ring-indigo-200' },
    slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', iconBg: 'bg-slate-100', ring: 'ring-slate-200' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-100', ring: 'ring-emerald-200' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-100', ring: 'ring-purple-200' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100', ring: 'ring-blue-200' },
};

function RoleNode({ role, isActive, onHover }: {
    role: typeof roles[0];
    isActive: boolean;
    onHover: (id: string | null) => void;
}) {
    const colors = colorMap[role.color];
    return (
        <div
            onMouseEnter={() => onHover(role.id)}
            onMouseLeave={() => onHover(null)}
            className={cn(
                "relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 cursor-default bg-white",
                isActive
                    ? `${colors.border} shadow-md ring-2 ${colors.ring} scale-[1.03]`
                    : "border-slate-100 hover:border-slate-200"
            )}
        >
            <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                isActive ? colors.iconBg : "bg-slate-50"
            )}>
                <role.icon className={cn("w-4 h-4 transition-colors", isActive ? colors.text : "text-slate-400")} />
            </div>
            <div className="min-w-0">
                <div className={cn("font-bold text-xs transition-colors", isActive ? "text-slate-900" : "text-slate-600")}>
                    {role.label}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                    {isActive ? role.receives : role.sends}
                </div>
            </div>
        </div>
    );
}

export const SystemEcosystemVisual = () => {
    const [activeRole, setActiveRole] = useState<string | null>(null);
    const [showDescription, setShowDescription] = useState(false);

    const vc = roles[0];
    const admin = roles[1];
    const hod = roles[2];
    const instructor = roles[3];
    const student = roles[4];

    const activeRoleData = roles.find(r => r.id === activeRole);

    return (
        <div
            className="w-full relative bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-sans"
            role="img"
            aria-label="Interactive Diagram showing Role-Based Access Control permissions for VCs, Admins, and Instructors"
            data-nosnippet
        >
            {/* SEO Description Overlay */}
            {showDescription && (
                <div className="absolute inset-0 z-50 bg-white/98 backdrop-blur-sm p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <Info className="w-5 h-5" />
                            <h4 className="font-bold">Visual Description</h4>
                        </div>
                        <button
                            onClick={() => setShowDescription(false)}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            This interactive diagram demonstrates the Role-Based Access Control (RBAC) permissions model for VCs, Admins, and Instructors.
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            While this visualization shows the generic framework of access distribution, we understand that each institution has unique requirements that we seek to understand and configure during the trial period.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowDescription(false)}
                        className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-sm"
                    >
                        Got it, back to visual
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-amber-100 flex items-center justify-center">
                        <Database className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">Role-Based Access Control</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDescription(!showDescription)}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            showDescription ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        )}
                        title="Show Description"
                    >
                        <Info className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">RBAC Active</span>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-10 relative">
                {/* SVG Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none">
                    {/* VC to Core */}
                    <line x1="50%" y1="18%" x2="50%" y2="42%" stroke={activeRole === 'vc' || !activeRole ? '#cbd5e1' : '#f1f5f9'} strokeWidth="2" strokeDasharray="4 4" className="transition-all duration-300" />
                    {/* Admin to Core */}
                    <line x1="25%" y1="32%" x2="42%" y2="48%" stroke={activeRole === 'admin' || !activeRole ? '#cbd5e1' : '#f1f5f9'} strokeWidth="2" strokeDasharray="4 4" className="transition-all duration-300" />
                    {/* HoD to Core */}
                    <line x1="75%" y1="32%" x2="58%" y2="48%" stroke={activeRole === 'hod' || !activeRole ? '#cbd5e1' : '#f1f5f9'} strokeWidth="2" strokeDasharray="4 4" className="transition-all duration-300" />
                    {/* Instructor to Core */}
                    <line x1="25%" y1="72%" x2="42%" y2="56%" stroke={activeRole === 'instructor' || !activeRole ? '#cbd5e1' : '#f1f5f9'} strokeWidth="2" strokeDasharray="4 4" className="transition-all duration-300" />
                    {/* Student to Core */}
                    <line x1="75%" y1="72%" x2="58%" y2="56%" stroke={activeRole === 'student' || !activeRole ? '#cbd5e1' : '#f1f5f9'} strokeWidth="2" strokeDasharray="4 4" className="transition-all duration-300" />
                </svg>

                {/* Diamond Grid Layout */}
                <div className="relative z-10 flex flex-col items-center gap-8">

                    {/* Row 1: VC (centered) */}
                    <div className="w-56">
                        <RoleNode role={vc} isActive={activeRole === 'vc'} onHover={setActiveRole} />
                    </div>

                    {/* Row 2: Admin + HoD (spread) */}
                    <div className="w-full flex justify-between px-2">
                        <div className="w-[45%]">
                            <RoleNode role={admin} isActive={activeRole === 'admin'} onHover={setActiveRole} />
                        </div>
                        <div className="w-[45%]">
                            <RoleNode role={hod} isActive={activeRole === 'hod'} onHover={setActiveRole} />
                        </div>
                    </div>

                    {/* Row 3: CORE DATABASE (centered) */}
                    <div className="flex flex-col items-center py-6">
                        <div className={cn(
                            "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500",
                            activeRole ? "bg-amber-50 ring-4 ring-amber-100" : "bg-amber-50 ring-2 ring-amber-100/50"
                        )}>
                            {/* Pulsing rings */}
                            <div className="absolute inset-0 rounded-full ring-2 ring-amber-200/30 animate-ping"></div>
                            <div className="relative flex flex-col items-center">
                                <Database className="w-6 h-6 text-amber-600 mb-1" />
                                <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider">Core</span>
                            </div>
                        </div>
                        {/* Active role permission tooltip */}
                        <div className={cn(
                            "mt-2 transition-all duration-300 text-center",
                            activeRoleData ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 h-0"
                        )}>
                            {activeRoleData && (
                                <div className="inline-flex flex-wrap gap-1 justify-center">
                                    {activeRoleData.permissions.map((perm, i) => (
                                        <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                                            {perm}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 4: Instructor + Student (spread) */}
                    <div className="w-full flex justify-between px-2">
                        <div className="w-[45%]">
                            <RoleNode role={instructor} isActive={activeRole === 'instructor'} onHover={setActiveRole} />
                        </div>
                        <div className="w-[45%]">
                            <RoleNode role={student} isActive={activeRole === 'student'} onHover={setActiveRole} />
                        </div>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        <span className="text-[10px] text-slate-400 font-medium">3 Campuses</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        <span className="text-[10px] text-slate-400 font-medium">4,500 Students</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                        <span className="text-[10px] text-slate-400 font-medium">Real-time Sync</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
