"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePilotForm } from "@/components/pilot/PilotFormContext";

export const CustomCircleIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
    </svg>
);

interface MarkTabCompletedProps {
    tabId: string;
    // Granular permission check
    hasWritePermission?: boolean;
}

export function MarkTabCompleted({ tabId, hasWritePermission = true }: MarkTabCompletedProps) {
    const { watch, setValue } = usePilotForm();
    const rawCompletedTabs = watch("completed_tabs_jsonb");

    // Ensure completedTabs is always a valid array
    let completedTabs: string[] = [];
    if (Array.isArray(rawCompletedTabs)) {
        completedTabs = rawCompletedTabs;
    } else if (typeof rawCompletedTabs === 'string') {
        try {
            const parsed = JSON.parse(rawCompletedTabs);
            if (Array.isArray(parsed)) completedTabs = parsed;
        } catch {
            completedTabs = [];
        }
    }

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
                        <CustomCircleIcon className="mr-2 h-5 w-5 opacity-50" />
                        Mark as Completed
                    </>
                )}
            </Button>
        </div>
    );
}
