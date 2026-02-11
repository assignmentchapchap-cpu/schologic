
'use client';

import { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import Link from 'next/link';

type Notification = {
    id: string;
    message: string;
    is_read: boolean | null;
    created_at: string | null;
    link: string | null;
    type: string | null;
    user_id: string | null;
};

import { twMerge } from 'tailwind-merge';
import { useNotifications } from '@/context/NotificationContext';

export default function NotificationBell({ variant = 'default', className }: { variant?: 'default' | 'mobile'; className?: string }) {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const baseClass = variant === 'mobile'
        ? "relative p-2 rounded-full text-white hover:bg-slate-800 transition-colors"
        : "relative p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm hover:shadow-md transition-all";

    const buttonClass = twMerge(baseClass, className);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={buttonClass}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className={`absolute ${variant === 'mobile' ? 'top-1 right-1 w-2 h-2 border-slate-800' : 'top-2 right-2 w-2.5 h-2.5 border-white'} bg-red-500 rounded-full border-2`}></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={() => markAllAsRead()} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
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
                                                        {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : ''}
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
