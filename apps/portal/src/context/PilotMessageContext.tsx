'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from "@schologic/database";
import { getInboxMessages, invalidateInboxMessages } from '@/app/actions/messaging';
import { getSuperadminId, getPilotDiscussionMessages, invalidatePilotDiscussion, sendPilotDiscussionMessage } from '@/app/actions/pilotMessaging';

// ─── Types ─────────────────────────────────────────────────

type Message = {
    id: string;
    sender_id: string;
    receiver_id: string;
    subject: string | null;
    content: string;
    parent_id: string | null;
    broadcast_id: string | null;
    is_read: boolean | null;
    created_at: string | null;
};

type TeamMember = {
    user_id: string;
    name: string;
    status: string;
    is_champion: boolean;
};

type PilotMessageContextType = {
    // Data
    directMessages: Message[];
    discussionMessages: Message[];
    unreadDmCount: number;
    unreadDiscussionCount: number;
    superadminId: string | null;
    superadminName: string;
    teamMembers: TeamMember[];
    currentUserId: string;
    currentUserName: string;
    pilotRequestId: string;

    // Actions
    sendDirectMessage: (receiverId: string, content: string, subject?: string | null, parentId?: string | null) => Promise<{ data: any; error: any }>;
    sendDiscussionMessage: (content: string) => Promise<{ data: any; error: any }>;
    markAsRead: (id: string) => Promise<void>;
    markDiscussionRead: () => void;
    getNameForId: (userId: string) => string;

    // Panel state
    isPanelOpen: boolean;
    togglePanel: () => void;
    openPanel: () => void;
    closePanel: () => void;
    openToSupport: () => void;
    activeView: 'threads' | 'thread' | 'compose';
    setActiveView: (view: 'threads' | 'thread' | 'compose') => void;
    activeThreadId: string | null;
    setActiveThreadId: (id: string | null) => void;
    composeRecipientId: string | null;
    setComposeRecipientId: (id: string | null) => void;

    loading: boolean;
};

const PilotMessageContext = createContext<PilotMessageContextType>({
    directMessages: [],
    discussionMessages: [],
    unreadDmCount: 0,
    unreadDiscussionCount: 0,
    superadminId: null,
    superadminName: 'Support',
    teamMembers: [],
    currentUserId: '',
    currentUserName: '',
    pilotRequestId: '',
    sendDirectMessage: async () => ({ data: null, error: null }),
    sendDiscussionMessage: async () => ({ data: null, error: null }),
    markAsRead: async () => { },
    markDiscussionRead: () => { },
    getNameForId: () => 'Unknown',
    isPanelOpen: false,
    togglePanel: () => { },
    openPanel: () => { },
    closePanel: () => { },
    openToSupport: () => { },
    activeView: 'threads',
    setActiveView: () => { },
    activeThreadId: null,
    setActiveThreadId: () => { },
    composeRecipientId: null,
    setComposeRecipientId: () => { },
    loading: true,
});

export const usePilotMessages = () => useContext(PilotMessageContext);

// ─── Provider ──────────────────────────────────────────────

interface PilotMessageProviderProps {
    children: React.ReactNode;
    identity: {
        id: string;
        full_name?: string | null;
        email?: string | null;
    };
    pilotRequestId: string;
    initialMembers: Array<{
        user_id: string;
        is_champion: boolean;
        status: string;
        profiles?: { first_name?: string; last_name?: string; email?: string } | null;
    }>;
}

export function PilotMessageProvider({ children, identity, pilotRequestId, initialMembers }: PilotMessageProviderProps) {
    const supabase = createClient();
    const currentUserId = identity.id;
    const currentUserName = identity.full_name || identity.email || 'You';

    // Data state
    const [directMessages, setDirectMessages] = useState<Message[]>([]);
    const [discussionMessages, setDiscussionMessages] = useState<Message[]>([]);
    const [superadminId, setSuperadminId] = useState<string | null>(null);
    const [superadminName, setSuperadminName] = useState('Support');
    const [loading, setLoading] = useState(true);

    // Panel state
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [activeView, setActiveView] = useState<'threads' | 'thread' | 'compose'>('threads');
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [composeRecipientId, setComposeRecipientId] = useState<string | null>(null);

    // Discussion "last read" timestamp — per-user via localStorage
    // (is_read is per-row and shared, so it can't track per-user read state for group messages)
    const discussionStorageKey = `pilot_discussion_read_${pilotRequestId}_${currentUserId}`;
    const [discussionLastRead, setDiscussionLastRead] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(discussionStorageKey) || '1970-01-01T00:00:00Z';
        }
        return '1970-01-01T00:00:00Z';
    });

    const markDiscussionRead = useCallback(() => {
        const now = new Date().toISOString();
        setDiscussionLastRead(now);
        if (typeof window !== 'undefined') {
            localStorage.setItem(discussionStorageKey, now);
        }
    }, [discussionStorageKey]);

    // Derive joined team members for recipient picker
    const teamMembers: TeamMember[] = initialMembers
        .filter(m => m.status === 'joined')
        .map(m => ({
            user_id: m.user_id,
            name: m.profiles
                ? `${m.profiles.first_name || ''} ${m.profiles.last_name || ''}`.trim() || m.profiles.email || 'Unknown'
                : 'Unknown',
            status: m.status,
            is_champion: m.is_champion,
        }));

    // Name resolver — works for team members, superadmin, and current user
    const getNameForId = useCallback((userId: string) => {
        if (userId === currentUserId) return 'You';
        if (userId === superadminId) return superadminName;
        const member = teamMembers.find(m => m.user_id === userId);
        return member?.name || 'Unknown';
    }, [currentUserId, superadminId, superadminName, teamMembers]);

    // ── Fetch ────────────────────────────────────────────────
    // Do NOT invalidate cache before reads — let Redis serve fast reads.
    // Cache is only invalidated after writes (in server actions).

    const fetchDirectMessages = useCallback(async () => {
        const { data } = await getInboxMessages();
        if (data) {
            const dms = (data as Message[]).filter(m => m.broadcast_id !== pilotRequestId);
            setDirectMessages(dms);
        }
    }, [pilotRequestId]);

    const fetchDiscussionMessages = useCallback(async () => {
        const { data } = await getPilotDiscussionMessages(pilotRequestId);
        if (data) {
            setDiscussionMessages(data as Message[]);
        }
    }, [pilotRequestId]);

    const fetchSuperadmin = useCallback(async () => {
        const { data } = await getSuperadminId();
        if (data) {
            setSuperadminId(data.id);
            setSuperadminName(data.name);
        }
    }, []);

    // Initial load
    useEffect(() => {
        Promise.all([fetchDirectMessages(), fetchDiscussionMessages(), fetchSuperadmin()])
            .finally(() => setLoading(false));
    }, []);

    // ── Real-time (for DMs — Supabase Realtime works with RLS) ──

    useEffect(() => {
        const channel = supabase
            .channel(`pilot-messages-${pilotRequestId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
            }, (payload) => {
                const msg = payload.new as Message;
                if (msg.sender_id === currentUserId) return;

                if (msg.broadcast_id === pilotRequestId) {
                    // Discussion — refetch from server (admin client)
                    fetchDiscussionMessages();
                } else if (msg.receiver_id === currentUserId) {
                    // DM — add directly
                    setDirectMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
            }, (payload) => {
                const msg = payload.new as Message;
                setDirectMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: msg.is_read } : m));
                setDiscussionMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: msg.is_read } : m));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, pilotRequestId]);

    // ── Always-on polling (15s background, 5s when panel open) ──
    // Essential for discussion messages (admin-client inserts bypass Supabase Realtime)
    // Also ensures FAB badge updates even when panel is closed

    useEffect(() => {
        const interval = isPanelOpen ? 5000 : 15000;
        const timer = setInterval(() => {
            fetchDiscussionMessages();
            fetchDirectMessages();
        }, interval);
        return () => clearInterval(timer);
    }, [isPanelOpen, fetchDiscussionMessages, fetchDirectMessages]);

    // ── Unread counts ────────────────────────────────────────

    const unreadDmCount = directMessages.filter(
        m => !m.is_read && m.receiver_id === currentUserId
    ).length;

    const unreadDiscussionCount = discussionMessages.filter(
        m => m.sender_id !== currentUserId && (m.created_at || '') > discussionLastRead
    ).length;

    // ── Actions ──────────────────────────────────────────────

    const sendDirectMessage = async (
        receiverId: string,
        content: string,
        subject: string | null = null,
        parentId: string | null = null
    ) => {
        const { data, error } = await supabase.from('messages').insert({
            sender_id: currentUserId,
            receiver_id: receiverId,
            subject,
            content,
            parent_id: parentId,
            broadcast_id: null,
            is_read: false,
        }).select().single();

        if (data) {
            setDirectMessages(prev => [...prev, data as Message]);
            await invalidateInboxMessages([currentUserId, receiverId]);
        }

        return { data, error };
    };

    const sendDiscussionMessage = async (content: string) => {
        // Use server action (admin client) to bypass RLS so all members can see the message
        const { data, error } = await sendPilotDiscussionMessage(pilotRequestId, content);

        if (data) {
            setDiscussionMessages(prev => {
                if (prev.some(m => m.id === (data as Message).id)) return prev;
                return [...prev, data as Message];
            });
        }

        return { data, error };
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setDirectMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
        setDiscussionMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));

        await supabase.from('messages').update({ is_read: true }).eq('id', id);
        await invalidateInboxMessages([currentUserId]);
    };

    // ── Panel controls ───────────────────────────────────────

    const togglePanel = useCallback(() => setIsPanelOpen(prev => !prev), []);
    const openPanel = useCallback(() => {
        setIsPanelOpen(true);
        setActiveView('threads');
    }, []);
    const closePanel = useCallback(() => {
        setIsPanelOpen(false);
        setActiveView('threads');
        setActiveThreadId(null);
    }, []);

    // FIX #6: Support opens compose with superadmin pre-filled
    const openToSupport = useCallback(() => {
        setIsPanelOpen(true);
        // Check if we already have an existing DM thread with the superadmin
        const hasSupportThread = superadminId && directMessages.some(
            m => m.sender_id === superadminId || m.receiver_id === superadminId
        );
        if (hasSupportThread && superadminId) {
            setActiveView('thread');
            setActiveThreadId(superadminId);
        } else {
            // Open compose with superadmin pre-selected
            setActiveView('compose');
            setComposeRecipientId(superadminId);
        }
    }, [superadminId, directMessages]);

    return (
        <PilotMessageContext.Provider value={{
            directMessages,
            discussionMessages,
            unreadDmCount,
            unreadDiscussionCount,
            superadminId,
            superadminName,
            teamMembers,
            currentUserId,
            currentUserName,
            pilotRequestId,
            sendDirectMessage,
            sendDiscussionMessage,
            markAsRead,
            markDiscussionRead,
            getNameForId,
            isPanelOpen,
            togglePanel,
            openPanel,
            closePanel,
            openToSupport,
            activeView,
            setActiveView,
            activeThreadId,
            setActiveThreadId,
            composeRecipientId,
            setComposeRecipientId,
            loading,
        }}>
            {children}
        </PilotMessageContext.Provider>
    );
}
