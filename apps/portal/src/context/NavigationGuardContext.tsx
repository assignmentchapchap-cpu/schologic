'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';

interface NavigationGuardContextType {
    blockNavigation: (key: string, message: string) => void;
    allowNavigation: (key: string) => void;
    interceptLink: (href: string, routerPush: (href: string) => void) => void;
}

const NavigationGuardContext = createContext<NavigationGuardContextType | undefined>(undefined);

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
    // Map of blockers: key -> message
    const [blockers, setBlockers] = useState<Map<string, string>>(new Map());
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        message: string;
        pendingHref: string | null;
        pendingAction: (() => void) | null;
    }>({
        isOpen: false,
        message: '',
        pendingHref: null,
        pendingAction: null
    });

    const blockNavigation = (key: string, message: string) => {
        setBlockers(prev => {
            const newMap = new Map(prev);
            newMap.set(key, message);
            return newMap;
        });
    };

    const allowNavigation = (key: string) => {
        setBlockers(prev => {
            if (!prev.has(key)) return prev;
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
        });
    };

    const interceptLink = (href: string, routerPush: (href: string) => void) => {
        if (blockers.size === 0) {
            routerPush(href);
            return;
        }

        // Get the first blocker message
        const message = blockers.values().next().value || "You have unsaved changes. Are you sure you want to leave?";

        setDialogState({
            isOpen: true,
            message,
            pendingHref: href,
            pendingAction: () => routerPush(href)
        });
    };

    const handleConfirm = () => {
        if (dialogState.pendingAction) {
            // Clear blockers temporarily or handle redirect
            // Actually, if we confirm navigation, we should proceed regardless of blockers
            // But usually the page should cleanup. For now, force navigate.
            setBlockers(new Map()); // Clear blockers to allow nav
            dialogState.pendingAction();
        }
        setDialogState(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        setDialogState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <NavigationGuardContext.Provider value={{ blockNavigation, allowNavigation, interceptLink }}>
            {children}
            <ConfirmDialog
                isOpen={dialogState.isOpen}
                title="Unsaved Changes"
                message={dialogState.message}
                strConfirm="Discard & Leave"
                strCancel="Stay"
                variant="danger"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </NavigationGuardContext.Provider>
    );
}

export function useNavigationGuard() {
    const context = useContext(NavigationGuardContext);
    if (!context) {
        throw new Error('useNavigationGuard must be used within a NavigationGuardProvider');
    }
    return context;
}
