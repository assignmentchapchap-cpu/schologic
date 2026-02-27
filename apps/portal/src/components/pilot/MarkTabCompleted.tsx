"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePilotForm } from "@/components/pilot/PilotFormContext";
import { updatePilotData } from "@/app/actions/pilotPortal";

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
    hasWritePermission?: boolean;
}

export function MarkTabCompleted({ tabId, hasWritePermission = true }: MarkTabCompletedProps) {
    const { getValues, setValue } = usePilotForm();
    const [isPending, setIsPending] = useState(false);

    // Read initial state from the global form Context
    const [isCompleted, setIsCompleted] = useState<boolean>(false);

    useEffect(() => {
        const rawCompletedTabs = getValues("completed_tabs_jsonb");
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
        setIsCompleted(completedTabs.includes(tabId));
    }, [tabId, getValues]);

    if (!hasWritePermission) return null;

    const toggleCompletion = async () => {
        setIsPending(true);
        const originalState = isCompleted;
        const newState = !originalState;

        // Optimistic UI updates
        setIsCompleted(newState);

        try {
            const rawCompletedTabs = getValues("completed_tabs_jsonb");
            let completedTabs: string[] = Array.isArray(rawCompletedTabs) ? rawCompletedTabs : [];

            const newArray = newState
                ? [...completedTabs, tabId]
                : completedTabs.filter(id => id !== tabId);

            setValue("completed_tabs_jsonb", newArray, { shouldDirty: true });

            // Persist securely to DB
            const result = await updatePilotData({ completed_tabs_jsonb: newArray });
            if (result?.error) {
                // Revert on failure
                setIsCompleted(originalState);
                setValue("completed_tabs_jsonb", completedTabs, { shouldDirty: true });
                console.error(result.error);
            }
        } catch (error) {
            setIsCompleted(originalState);
            console.error("Failed to update tab completion status", error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="mt-16 flex justify-end border-t border-slate-200 pt-6">
            <Button
                variant={isCompleted ? "outline" : undefined}
                size="lg"
                disabled={isPending}
                className={`transition-all shadow-sm rounded-xl font-bold ${isPending
                    ? 'bg-slate-100 text-slate-400 cursor-wait border-slate-200'
                    : isCompleted
                        ? 'bg-emerald-50/50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800'
                        : 'bg-slate-900 text-white hover:bg-black'
                    }`}
                onClick={toggleCompletion}
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving...
                    </>
                ) : isCompleted ? (
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
