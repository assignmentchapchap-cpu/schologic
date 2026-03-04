'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { useUser } from './UserContext';
import NewMessageModal from '@/components/messaging/NewMessageModal';
import { getInboxMessages, invalidateInboxMessages, sendDirectMessageAction } from '@/app/actions/messaging';

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

type MessageContextType = {
    messages: Message[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    sendMessage: (receiverId: string, content: string, subject?: string | null, parentId?: string | null, broadcastId?: string | null) => Promise<{ data: any; error: any }>;
    loading: boolean;
    selectedConversationId: string | null;
    setSelectedConversationId: (id: string | null) => void;
    // Modal State
    isNewMessageOpen: boolean;
    newMessageOptions: { recipientId?: string; subject?: string } | null;
    openNewMessage: (options?: { recipientId?: string; subject?: string }) => void;
    closeNewMessage: () => void;
};

const MessageContext = createContext<MessageContextType>({
    messages: [],
    unreadCount: 0,
    markAsRead: async () => { },
    sendMessage: async () => ({ data: null, error: null }),
    loading: false,
    selectedConversationId: null,
    setSelectedConversationId: () => { },
    isNewMessageOpen: false,
    newMessageOptions: null,
    openNewMessage: () => { },
    closeNewMessage: () => { },
});

export const useMessages = () => useContext(MessageContext);

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
    const [newMessageOptions, setNewMessageOptions] = useState<{ recipientId?: string; subject?: string } | null>(null);

    const openNewMessage = (options?: { recipientId?: string; subject?: string }) => {
        setNewMessageOptions(options || null);
        setIsNewMessageOpen(true);
    };

    const closeNewMessage = () => {
        setIsNewMessageOpen(false);
        setNewMessageOptions(null);
    };

    const supabase = createClient();
    const { user } = useUser();

    useEffect(() => {
        if (!user) {
            setMessages([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        fetchMessages();

        const channel = supabase
            .channel(`messages-${user.id}`)
            .on('broadcast', { event: 'new_dm' }, (payload) => {
                const newMsg = payload.payload?.message;
                if (newMsg) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [newMsg, ...prev];
                    });
                } else {
                    fetchMessages();
                }
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user.id}`
            }, (payload) => {
                const newMsg = payload.new as Message;
                if (newMsg) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [newMsg, ...prev];
                    });
                } else {
                    fetchMessages();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchMessages = async () => {
        if (!user) return;
        try {
            const { data, error } = await getInboxMessages(Date.now());

            if (data) {
                // Ensure the data matches our Message type
                setMessages(data as Message[]);
                // Fix: Only count unread messages where the current user is the receiver
                setUnreadCount(data.filter((m: any) => !m.is_read && m.receiver_id === user.id).length);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
        setUnreadCount(prev => Math.max(0, prev - 1));
        await supabase.from('messages').update({ is_read: true }).eq('id', id);
        if (user) await invalidateInboxMessages([user.id]);
    };

    const sendMessage = async (receiverId: string, content: string, subject: string | null = null, parentId: string | null = null, broadcastId: string | null = null) => {
        if (!user) return { data: null, error: 'User not authenticated' };

        const { data, error } = await sendDirectMessageAction(
            receiverId,
            content,
            user.role === 'student' ? null : subject,
            parentId,
            user.role === 'student' ? null : broadcastId
        );

        if (data) {
            setMessages(prev => [data as Message, ...prev]);
        }

        return { data, error };
    };

    return (
        <MessageContext.Provider value={{
            messages,
            unreadCount,
            markAsRead,
            sendMessage,
            loading,
            selectedConversationId,
            setSelectedConversationId,
            isNewMessageOpen,
            newMessageOptions,
            openNewMessage,
            closeNewMessage
        }}>
            {children}
            <NewMessageModal isOpen={isNewMessageOpen} onClose={closeNewMessage} />
        </MessageContext.Provider>
    );
}
