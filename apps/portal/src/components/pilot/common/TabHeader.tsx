import React, { useRef, useEffect } from "react";
import { CheckCircle2, History, Save, AlertTriangle } from "lucide-react";
import { HistoryDropdown } from "./HistoryDropdown";
import { usePilotForm } from "@/components/pilot/PilotFormContext";

interface TabHeaderProps {
    title: string;
    description: string;
    tabKey: string;
    tabLabel: string;
    isReadOnly: boolean;
    isSaving: boolean;
    lastSaved: Date | null;
    error: string | null;
    hasErrors: boolean;
    hasUnsavedChanges: boolean;
    onManualSave: () => void;
    showChangelog: boolean;
    setShowChangelog: (show: boolean) => void;
}

export function TabHeader({
    title,
    description,
    tabKey,
    tabLabel,
    isReadOnly,
    isSaving,
    lastSaved,
    error,
    hasErrors,
    hasUnsavedChanges,
    onManualSave,
    showChangelog,
    setShowChangelog
}: TabHeaderProps) {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showChangelog && popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setShowChangelog(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showChangelog, setShowChangelog]);

    return (
        <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4 relative z-50">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                    {isReadOnly && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full border border-amber-100">
                            <AlertTriangle className="w-3 h-3" /> Read Only
                        </span>
                    )}
                </div>

                <div className="flex flex-col items-end gap-2 relative" ref={popoverRef}>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowChangelog(!showChangelog)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold transition-colors rounded-lg ${showChangelog ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <History className="w-4 h-4" /> History
                        </button>

                        {!isReadOnly && (
                            <button
                                onClick={onManualSave}
                                disabled={isSaving || hasErrors || !hasUnsavedChanges}
                                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Save Changes</>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Status Text & Validation Feedback */}
                    <div className="text-xs font-medium text-slate-400">
                        {hasErrors ? (
                            <span className="flex items-center gap-1.5 text-amber-600">
                                <AlertTriangle className="w-3.5 h-3.5" /> Resolve errors to enable auto-save
                            </span>
                        ) : isSaving ? (
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" /> Saving...
                            </span>
                        ) : (() => {
                            const { watch } = usePilotForm();
                            const allLog = watch("changelog_jsonb") || {};
                            const tabEntries = (allLog[tabKey] || []).sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
                            const latest = tabEntries[0] as any;

                            const displayTime = lastSaved ? lastSaved.toLocaleTimeString() : (latest ? new Date(latest.time).toLocaleTimeString() : null);

                            if (displayTime) {
                                return (
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        Last updated at {displayTime}
                                    </span>
                                );
                            }
                            return (
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    No changes yet
                                </span>
                            );
                        })()}
                    </div>

                    {/* History Popover */}
                    {showChangelog && (
                        <HistoryDropdown tabKey={tabKey} tabLabel={tabLabel} />
                    )}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 relative z-40">
                <div className="lg:w-1/3">
                    <p className="text-slate-500 text-sm">{description}</p>
                </div>
                <div className="lg:w-2/3">
                    {error && <span className="text-xs font-bold text-red-500 block mb-2">{error}</span>}
                </div>
            </div>
        </div>
    );
}
