import React from "react";
import { LucideIcon, RotateCcw, CheckCircle2 } from "lucide-react";

interface ExecutiveSummaryCardProps {
    title: string;
    tabKey: string;
    isLocked: boolean;
    isChampion: boolean;
    onReactivate: (tabKey: string) => void;
    icon: LucideIcon;
    size?: "small" | "large";
    children: React.ReactNode;
    primaryMetric?: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export function ExecutiveSummaryCard({
    title,
    tabKey,
    isLocked,
    isChampion,
    onReactivate,
    icon: Icon,
    size = "small",
    children,
    primaryMetric,
    className = "",
    noPadding = false
}: ExecutiveSummaryCardProps) {
    return (
        <div className={`group flex flex-col relative bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-slate-300/80 ${className}`}>
            {/* Status Banner - Absolute top right, above all text */}
            <div className="absolute top-0 right-0 z-[100] translate-y-[-2px]">
                {isLocked ? (
                    isChampion ? (
                        <button
                            onClick={() => onReactivate(tabKey)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-bl-2xl bg-emerald-50 border-b border-l border-emerald-100/80 shadow-sm transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 group/reactivate"
                            title={`Reactivate ${title} for revision`}
                        >
                            <div className="relative">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 group-hover/reactivate:opacity-0 transition-opacity" />
                                <RotateCcw className="w-3.5 h-3.5 absolute inset-0 opacity-0 group-hover/reactivate:opacity-100 transition-opacity text-indigo-600" />
                            </div>
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest group-hover/reactivate:text-indigo-600">Locked</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-bl-2xl bg-emerald-50 border-b border-l border-emerald-100/80 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Locked</span>
                        </div>
                    )
                ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-bl-2xl bg-amber-50 border-b border-l border-amber-100/80 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Pending</span>
                    </div>
                )}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 pb-2">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isLocked ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50/50 text-indigo-600 group-hover:bg-indigo-50'}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">{title}</h3>
                        {primaryMetric && (
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {primaryMetric}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Reactivate button consolidated into banner above */}
                </div>
            </div>

            {/* Content */}
            <div className={`flex-1 ${noPadding ? 'p-0' : 'px-5 py-4 pt-2'}`}>
                {children}
            </div>

            {/* Bottom Accent */}
            {isLocked && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
            )}
        </div>
    );
}
