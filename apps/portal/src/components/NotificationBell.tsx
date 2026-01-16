
'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { Bell, Check, X } from 'lucide-react';
import Link from 'next/link';

type Notification = {
    id: string;
    message: string;
    is_read: boolean;
    created_at: string;
    link: string | null;
    type: string;
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchNotifications();

        // Realtime subscription
        const channel = supabase
            .channel('realtime:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    // Ideally check if payload.new.user_id matches current user, 
                    // but we can't easily here without storing user in state/context. 
                    // Simpler to just refetch or rely on RLS filtering (but fetch is safe).
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

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
        // Optimistic update
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm hover:shadow-md transition-all"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={() => notifications.forEach(n => markAsRead(n.id))} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    No notifications yet.
                                </div>
                            ) : (
                                <div>
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 ${!notif.is_read ? 'bg-indigo-50/30' : ''}`}
                                        >
                                            <div className="mt-1">
                                                {!notif.is_read && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-700 leading-snug mb-1">{notif.message}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                        {new Date(notif.created_at).toLocaleDateString()}
                                                    </span>
                                                    {notif.link && (
                                                        <Link href={notif.link} className="text-xs font-bold text-indigo-600 hover:underline">
                                                            View
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            {!notif.is_read && (
                                                <button onClick={() => markAsRead(notif.id)} className="text-slate-300 hover:text-slate-500">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
