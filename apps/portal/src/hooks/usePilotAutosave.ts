"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePilotForm } from "@/components/pilot/PilotFormContext";
import { updatePilotData } from "@/app/actions/pilotPortal";

interface UsePilotAutosaveProps {
    tabKey: string;
    dataKey?: string;
    currentValues: any;
    validationErrors?: Record<string, string | null>;
    editorName?: string;
    debounceMs?: number;
}

export function usePilotAutosave({
    tabKey,
    dataKey,
    currentValues,
    validationErrors = {},
    editorName = "Unknown Member",
    debounceMs = 3000
}: UsePilotAutosaveProps) {
    const resolvedDataKey = dataKey || `${tabKey}_jsonb`;
    const { setValue, getValues } = usePilotForm();
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const saveTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastSavedData = useRef<string>(JSON.stringify(currentValues));

    const hasErrors = Object.values(validationErrors).some(err => err !== null);

    const buildChangeDescription = useCallback((current: any): string[] => {
        const saved = getValues(resolvedDataKey as any) || {};

        // Basic change detection for changelog
        // For Scope, we have specific descriptions. For others, we fallback to a generic one.
        if (tabKey === 'scope') {
            const changes: string[] = [];
            if (JSON.stringify(saved.core_modules) !== JSON.stringify(current.core_modules)) changes.push("Updated Core Foundations");
            if (JSON.stringify(saved.add_ons) !== JSON.stringify(current.add_ons)) changes.push("Updated Value Accelerators");
            if (saved.pilot_period_weeks !== current.pilot_period_weeks) changes.push(`Changed period to ${current.pilot_period_weeks} weeks`);
            if (saved.max_instructors !== current.max_instructors) changes.push(`Updated instructors to ${current.max_instructors}`);
            if (saved.max_students !== current.max_students) changes.push(`Updated students to ${current.max_students}`);
            if (JSON.stringify(saved.target_departments) !== JSON.stringify(current.target_departments)) changes.push("Updated Target Departments");
            return changes.length > 0 ? changes : ['Updated scope settings'];
        }

        if (tabKey === 'kpis') {
            // For KPIs, we just track generic updates for now to keep it simple
            return ['Updated KPI configurations'];
        }

        if (tabKey === 'settings') {
            const changes: string[] = [];
            // Simple detection: check if master switches changed
            const masters = ['manage_classes', 'manage_practicums', 'allow_content_upload', 'manage_students'];
            masters.forEach(m => {
                if (saved[m] !== current[m]) {
                    changes.push(`${current[m] ? 'Enabled' : 'Disabled'} ${m.replace('manage_', '').replace('allow_', '').replace('_upload', '')} permissions`);
                }
            });
            if (saved.communication_rules !== current.communication_rules) changes.push(`Changed communication to ${current.communication_rules}`);
            return changes.length > 0 ? changes : ['Updated permission settings'];
        }

        return [`Updated ${tabKey} settings`];
    }, [tabKey, getValues]);

    const appendChangelogEntries = useCallback((actions: string[]) => {
        const currentLog: Record<string, any[]> = getValues("changelog_jsonb" as any) || {};
        const now = new Date().toISOString();
        const newEntries = actions.map(action => ({ time: now, user: editorName, action }));
        const currentEntries = currentLog[tabKey] || [];
        const updated = { ...currentLog, [tabKey]: [...newEntries, ...currentEntries].slice(0, 30) };
        setValue("changelog_jsonb" as any, updated);
        return updated;
    }, [getValues, setValue, editorName, tabKey]);

    const handleSave = useCallback(async (data: any, silent = false) => {
        if (hasErrors) return;

        setIsSaving(true);
        if (!silent) setError(null);

        try {
            const changes = buildChangeDescription(data);
            // Even if no specific field changes detected by simple buildChangeDescription, 
            // the data itself has changed from lastSavedData.current

            const tabDataKey = resolvedDataKey as any;
            setValue(tabDataKey, data);

            const logUpdate = appendChangelogEntries(changes);
            const res = await updatePilotData({ [tabDataKey]: data, changelog_jsonb: logUpdate });

            if (res?.error) throw new Error(res.error);

            setLastSaved(new Date());
            lastSavedData.current = JSON.stringify(data);
        } catch (err: any) {
            console.error(`Status update failed for ${tabKey}:`, err);
            if (!silent) setError(err.message || 'Failed to save.');
        } finally {
            setIsSaving(false);
        }
    }, [tabKey, hasErrors, buildChangeDescription, appendChangelogEntries, setValue]);

    // Debounced Auto-save
    useEffect(() => {
        const currentStr = JSON.stringify(currentValues);
        if (currentStr === lastSavedData.current) return;
        if (hasErrors) return;

        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            handleSave(currentValues, true);
        }, debounceMs);

        return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
    }, [currentValues, hasErrors, handleSave, debounceMs]);

    return {
        isSaving,
        lastSaved,
        error,
        handleManualSave: () => handleSave(currentValues, false),
        hasUnsavedChanges: JSON.stringify(currentValues) !== lastSavedData.current
    };
}
