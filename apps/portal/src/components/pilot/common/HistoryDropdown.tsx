"use client";

import React from "react";
import { usePilotForm } from "@/components/pilot/PilotFormContext";

interface HistoryDropdownProps {
    tabKey: string;
    tabLabel?: string;
}

export function HistoryDropdown({ tabKey, tabLabel }: HistoryDropdownProps) {
    const { watch } = usePilotForm();
    const allLog = watch("changelog_jsonb") || {};
    const entries = (allLog[tabKey] || [])
        .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 30);

    if (entries.length === 0) {
        return (
            <div className="absolute top-full mt-2 right-0 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <p className="text-xs text-slate-400 text-center">No edit history yet.</p>
            </div>
        );
    }

    return (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-1">
                <h4 className="text-xs font-bold text-slate-900">Edit History</h4>
                {tabLabel && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {tabLabel} Only
                    </span>
                )}
            </div>
            <div className="max-h-64 overflow-y-auto">
                {entries.map((log: any, idx: number) => (
                    <div key={idx} className="px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-700 text-xs font-medium truncate">{log.user}</span>
                            <span className="text-slate-400 text-[10px] shrink-0">
                                {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{log.action}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
