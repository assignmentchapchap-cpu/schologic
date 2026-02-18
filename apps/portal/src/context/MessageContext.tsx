'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { useUser } from './UserContext';
import NewMessageModal from '@/components/messaging/NewMessageModal';

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
    openNewMessage: () => void;
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
    const openNewMessage = () => setIsNewMessageOpen(true);
    const closeNewMessage = () => setIsNewMessageOpen(false);

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
            .channel('realtime:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            },
                () => {
                    fetchMessages();
                }
            )
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages'
            },
                () => {
                    fetchMessages();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchMessages = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`)
                .order('created_at', { ascending: false })
                .limit(100);

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
    };

    const sendMessage = async (receiverId: string, content: string, subject: string | null = null, parentId: string | null = null, broadcastId: string | null = null) => {
        if (!user) return { data: null, error: 'User not authenticated' };

        const { data, error } = await supabase.from('messages').insert({
            sender_id: user.id,
            receiver_id: receiverId,
            subject: user.role === 'student' ? null : subject, // Force null subject for students if they somehow bypass UI
            content,
            parent_id: parentId,
            broadcast_id: user.role === 'student' ? null : broadcastId,
            is_read: false
        }).select().single();

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
            openNewMessage,
            closeNewMessage
        }}>
            {children}
            <NewMessageModal isOpen={isNewMessageOpen} onClose={closeNewMessage} />
        </MessageContext.Provider>
    );
}
