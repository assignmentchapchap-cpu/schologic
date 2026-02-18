'use client';

import { useState } from 'react';
import { MessageSquare, Check, X } from 'lucide-react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useMessages } from '@/context/MessageContext';
import { useUser } from '@/context/UserContext';


export default function MessageBell({ variant = 'default', className }: { variant?: 'default' | 'mobile'; className?: string }) {
    const { messages, unreadCount, markAsRead, setSelectedConversationId, openNewMessage } = useMessages();
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    // Only show unread messages in the dropdown
    const unreadMessages = messages.filter(m => !m.is_read && m.receiver_id === user?.id);

    const baseClass = variant === 'mobile'
        ? "relative p-2 rounded-full text-white hover:bg-slate-800 transition-colors"
        : "relative p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm hover:shadow-md transition-all";

    const buttonClass = twMerge(baseClass, className);

    const handleMessageClick = (msg: any) => {
        const partnerId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
        setSelectedConversationId(partnerId);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={buttonClass}
                title="Messages"
            >
                <MessageSquare
                    className={twMerge("w-5 h-5", unreadCount > 0 ? "text-emerald-500 fill-emerald-500/20" : "text-slate-400")}
                    fill={unreadCount > 0 ? "currentColor" : "none"}
                />
                {unreadCount > 0 && (
                    <span className={twMerge(
                        "absolute flex items-center justify-center bg-red-500 rounded-full border-2 text-[8px] font-black text-white animate-pulse shadow-sm shadow-red-500/50",
                        variant === 'mobile'
                            ? 'top-1 right-1 min-w-[16px] h-4 border-slate-800'
                            : 'top-1 right-1 min-w-[18px] h-[18px] border-white'
                    )}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px] md:hidden" onClick={() => setIsOpen(false)} />
                    <div className="fixed inset-x-4 top-20 md:absolute md:inset-auto md:right-0 md:mt-2 w-auto md:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-sm">New Messages</h3>
                            <div className="flex gap-3">
                                {user?.role !== 'student' && (
                                    <button
                                        onClick={() => {
                                            openNewMessage();
                                            setIsOpen(false);
                                        }}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                    >
                                        New
                                    </button>
                                )}
                                <Link
                                    href={user?.role === 'instructor' ? "/instructor/messages" : "/messages"}
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600"
                                >
                                    History
                                </Link>
                            </div>
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {unreadMessages.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm font-bold italic">
                                    No new messages.
                                </div>
                            ) : (
                                <div>
                                    {unreadMessages.map(msg => (
                                        <div
                                            key={msg.id}
                                            className="p-4 border-b border-slate-50 hover:bg-indigo-50/50 transition-colors flex gap-3 bg-indigo-50/30"
                                        >
                                            <div className="mt-1">
                                                <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm shadow-red-500/50" />
                                            </div>
                                            <div className="flex-1">
                                                <Link
                                                    href={user?.role === 'instructor' ? "/instructor/messages" : "/messages"}
                                                    onClick={() => handleMessageClick(msg)}
                                                    className="text-sm text-slate-700 font-bold leading-snug mb-1 line-clamp-2 hover:text-indigo-600 cursor-pointer"
                                                >
                                                    {msg.content}
                                                </Link>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                    <button
                                                        onClick={() => markAsRead(msg.id)}
                                                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                                                    >
                                                        Mark read
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* NewMessageModal is now global via MessageContext */}
        </div>
    );
}
