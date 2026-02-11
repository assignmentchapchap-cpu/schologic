'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { useUser } from './UserContext';

type Notification = {
    id: string;
    message: string;
    is_read: boolean | null;
    created_at: string | null;
    link: string | null;
    type: string | null;
    user_id: string | null;
};

type NotificationContextType = {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    loading: boolean;
};

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAsRead: async () => { },
    markAllAsRead: async () => { },
    loading: false,
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const { user } = useUser();

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        fetchNotifications();

        const channel = supabase
            .channel('realtime:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' },
                () => {
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        if (user) {
            await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, loading }}>
            {children}
        </NotificationContext.Provider>
    );
}
