"use client";

import { useEffect, useRef, useState } from "react";
import { usePilotForm, PilotBlueprint } from "@/components/pilot/PilotFormContext";

interface AutosaveOptions {
    onSave?: (data: PilotBlueprint) => Promise<void>;
    debounceMs?: number;
    editorName?: string;
}

export type ChangelogEntry = {
    time: Date;
    editorName: string;
};

export function useAutosave({ onSave, debounceMs = 1500, editorName = 'Unknown Member' }: AutosaveOptions = {}) {
    const { watch } = usePilotForm();
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

    const saveTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastSavedData = useRef<string>("");

    // Watch the entire form state
    const formValues = watch();

    useEffect(() => {
        if (!onSave || !formValues) return;

        const currentDataStr = JSON.stringify(formValues);

        // Initialize lastSavedData on first render so we don't save immediately
        if (!lastSavedData.current) {
            lastSavedData.current = currentDataStr;
            return;
        }

        // Only proceed if data actually changed
        if (currentDataStr === lastSavedData.current) return;

        // Clear previous timeout
        if (saveTimeout.current) {
            clearTimeout(saveTimeout.current);
        }

        // Set new debounced save
        saveTimeout.current = setTimeout(async () => {
            try {
                setIsSaving(true);
                setError(null);
                await onSave(formValues as PilotBlueprint);

                const now = new Date();
                setLastSaved(now);
                lastSavedData.current = currentDataStr;

                // Add to changelog (keep last 5)
                setChangelog((prev) => {
                    const newLog = [{ time: now, editorName }, ...prev];
                    return newLog.slice(0, 5);
                });

            } catch (err: any) {
                console.error("Autosave failed:", err);
                setError(err.message || "Failed to save changes. Please try again.");
            } finally {
                setIsSaving(false);
            }
        }, debounceMs);

        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, [formValues, onSave, debounceMs, editorName]);

    return { isSaving, lastSaved, error, changelog };
}
