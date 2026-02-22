'use client';

import React from 'react';
import { NotificationProvider } from "@/context/NotificationContext";
import { MessageProvider } from "@/context/MessageContext";
import { UniversalReaderProvider } from './UniversalReaderProvider';

export function DashboardProviders({ children }: { children: React.ReactNode }) {
    return (
        <UniversalReaderProvider>
            <NotificationProvider>
                <MessageProvider>
                    {children}
                </MessageProvider>
            </NotificationProvider>
        </UniversalReaderProvider>
    );
}
