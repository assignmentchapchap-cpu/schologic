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
    hasWriteAccess: boolean;
}

export function MarkTabCompleted({ tabId, hasWriteAccess }: MarkTabCompletedProps) {
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

    if (!hasWriteAccess) return null;

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
        <div className="fixed bottom-0 left-0 w-full z-[60] pointer-events-none animate-in slide-in-from-bottom duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="pb-4 pt-10">
                    <Button
                        variant={isCompleted ? "outline" : undefined}
                        size="lg"
                        disabled={isPending}
                        className={`h-12 px-5 rounded-2xl shadow-xl transition-all font-bold flex items-center gap-2.5 pointer-events-auto ${isPending
                            ? 'bg-slate-100 text-slate-400 cursor-wait border-slate-200'
                            : isCompleted
                                ? 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 shadow-emerald-500/10'
                                : 'bg-amber-400 text-amber-950 hover:bg-amber-500 shadow-amber-500/20 animate-pulse-subtle border-b-2 border-amber-600'
                            }`}
                        onClick={toggleCompletion}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                                <span className="text-xs">Saving...</span>
                            </>
                        ) : isCompleted ? (
                            <>
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                </div>
                                <span className="text-xs">Tab Completed</span>
                            </>
                        ) : (
                            <>
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                                    <CustomCircleIcon className="h-3.5 w-3.5 text-white" />
                                </div>
                                <span className="text-xs">Mark as Completed</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <style jsx global>{`
                @keyframes pulse-subtle {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(245, 158, 11, 0.2); }
                    50% { transform: scale(1.02); box-shadow: 0 0 25px rgba(245, 158, 11, 0.4); }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
