'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Hook that subscribes to Supabase Realtime changes on platform_emails.
 * Filters by folder direction/status so each tab only receives relevant events.
 */
export function useEmailRealtime(
    folder: 'inbox' | 'sent' | 'drafts',
    onInsert: (email: any) => void,
    onUpdate: (email: any) => void,
    onDelete: (id: string) => void
) {
    useEffect(() => {
        // Build a realtime filter based on the folder
        let filter: string;
        switch (folder) {
            case 'inbox':
                filter = 'direction=eq.inbound';
                break;
            case 'sent':
                filter = 'direction=eq.outbound';
                break;
            case 'drafts':
                filter = 'status=eq.draft';
                break;
        }

        const channel = supabase
            .channel(`email-${folder}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'platform_emails', filter },
                (payload) => {
                    // For sent tab, skip drafts that get inserted
                    if (folder === 'sent' && payload.new?.status === 'draft') return;
                    onInsert(payload.new);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'platform_emails', filter },
                (payload) => {
                    onUpdate(payload.new);
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'platform_emails', filter },
                (payload) => {
                    onDelete(payload.old?.id);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [folder, onInsert, onUpdate, onDelete]);
}
