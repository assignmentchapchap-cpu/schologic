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
    primaryMetric?: string;
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
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 pb-2">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isLocked ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50/50 text-indigo-600 group-hover:bg-indigo-50'}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">{title}</h3>
                        {primaryMetric && (
                            <p className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-widest mt-0.5">{primaryMetric}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isLocked && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50/50 border border-emerald-100/50">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Locked</span>
                        </div>
                    )}
                    {(isChampion || true) && isLocked && ( // Standardize authority check if needed, but for now matching previous logic
                        <button
                            onClick={() => onReactivate(tabKey)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 scale-90"
                            title={`Reactivate ${title} for revision`}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    )}
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
