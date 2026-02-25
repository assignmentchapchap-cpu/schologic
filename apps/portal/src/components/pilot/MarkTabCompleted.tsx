"use client";

import { useState } from "react";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePilotForm } from "@/components/pilot/PilotFormContext";

interface MarkTabCompletedProps {
    tabId: string;
    // Granular permission check
    hasWritePermission?: boolean;
}

export function MarkTabCompleted({ tabId, hasWritePermission = true }: MarkTabCompletedProps) {
    const { watch, setValue } = usePilotForm();
    const completedTabs = watch("completed_tabs_jsonb") || [];

    // Check if current tab is in the completed array
    const isCompleted = completedTabs.includes(tabId);

    // If user only has Read access, they cannot mark the tab as completed
    if (!hasWritePermission) {
        return null;
    }

    const toggleCompletion = () => {
        if (isCompleted) {
            setValue("completed_tabs_jsonb", completedTabs.filter(id => id !== tabId), { shouldDirty: true });
        } else {
            setValue("completed_tabs_jsonb", [...completedTabs, tabId], { shouldDirty: true });
        }
    };

    return (
        <div className="mt-16 flex justify-end border-t border-slate-200 pt-6">
            <Button
                variant={isCompleted ? "outline" : undefined}
                size="lg"
                className={`transition-all shadow-sm rounded-xl font-bold ${isCompleted
                    ? 'bg-emerald-50/50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800'
                    : 'bg-slate-900 text-white hover:bg-black'
                    }`}
                onClick={toggleCompletion}
            >
                {isCompleted ? (
                    <>
                        <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                        Completed
                    </>
                ) : (
                    <>
                        <CircleDashed className="mr-2 h-5 w-5 opacity-50" />
                        Mark as Completed
                    </>
                )}
            </Button>
        </div>
    );
}
