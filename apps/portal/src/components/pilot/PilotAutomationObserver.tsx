"use client";

import { useEffect, useRef } from "react";
import { usePilotForm } from "./PilotFormContext";
import { updatePilotData } from "@/app/actions/pilotPortal";

/**
 * PilotAutomationObserver
 * 
 * Centrally monitors the tasks_jsonb state and automatically updates completed_tabs_jsonb.
 * This ensures that a tab is locked (completed) only when all tasks within that tab are finalized.
 * It also handles unlocking tabs if a Champion reactivates a task (Phase 3).
 */
export function PilotAutomationObserver() {
    const { watch, setValue, getValues } = usePilotForm();
    const tasks = watch("tasks_jsonb") || [];
    const completedTabs = watch("completed_tabs_jsonb") || [];
    const lastTasksHash = useRef("");

    useEffect(() => {
        // Create a simple hash/string representation to avoid unnecessary updates if other pilot data changes
        const tasksHash = JSON.stringify(tasks.map(t => ({ id: t.id, finalized: t.finalized, tab: t.tab })));
        if (tasksHash === lastTasksHash.current) return;
        lastTasksHash.current = tasksHash;

        const tabsInSystem = Array.from(new Set(tasks.map(t => t.tab)));
        if (tabsInSystem.length === 0) return;

        let newCompletedTabs = [...completedTabs];
        let changed = false;

        tabsInSystem.forEach(tab => {
            const tabTasks = tasks.filter(t => t.tab === tab);
            const allFinalized = tabTasks.length > 0 && tabTasks.every(t => t.finalized);
            const isMarked = completedTabs.includes(tab);

            if (allFinalized && !isMarked) {
                newCompletedTabs.push(tab);
                changed = true;
            } else if (!allFinalized && isMarked) {
                // Reactivation: if any task in a previously completed tab is no longer finalized, unlock the tab
                newCompletedTabs = newCompletedTabs.filter(t => t !== tab);
                changed = true;
            }
        });

        if (changed) {
            setValue("completed_tabs_jsonb", newCompletedTabs, { shouldDirty: true });
            // Direct sync to database for immediate effect
            updatePilotData({ completed_tabs_jsonb: newCompletedTabs });
        }
    }, [tasks, completedTabs, setValue]);

    return null; // Side-effect only component
}
