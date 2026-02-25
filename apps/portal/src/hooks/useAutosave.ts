"use client";

import { useEffect, useRef, useState } from "react";
import { usePilotForm, PilotBlueprint } from "@/components/pilot/PilotFormContext";

interface AutosaveOptions {
    onSave?: (data: PilotBlueprint) => Promise<void>;
    debounceMs?: number;
}

export function useAutosave({ onSave, debounceMs = 1500 }: AutosaveOptions = {}) {
    const { watch } = usePilotForm();
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const saveTimeout = useRef<NodeJS.Timeout | null>(null);

    // Watch the entire form state
    const formValues = watch();

    useEffect(() => {
        if (!onSave) return;

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
                setLastSaved(new Date());
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
    }, [formValues, onSave, debounceMs]);

    return { isSaving, lastSaved, error };
}
