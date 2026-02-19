'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Send, Plus, Check, User, ArrowLeft, Loader2, Users, CheckCircle2 } from 'lucide-react';
import { useMessages } from '@/context/MessageContext';
import { useUser } from '@/context/UserContext';
import { createClient } from "@schologic/database";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import NewMessageModal from '@/components/messaging/NewMessageModal';
import { getRoleLabel, getWaitingMessage } from '@/lib/identity';

type Profile = {
    id: string;
    full_name: string | null;
    role: string | null;
};

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

export default function MessagingDashboard() {
    const { messages, markAsRead, sendMessage, loading: messagesLoading, selectedConversationId, setSelectedConversationId, openNewMessage } = useMessages();
    const { user } = useUser();
    const supabase = createClient();

    const [replyContent, setReplyContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [profiles, setProfiles] = useState<Record<string, Profile>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Group messages into conversations
    const conversations = useMemo(() => {
        if (!user) return [];

        const groups: Record<string, any> = {};

        messages.forEach(msg => {
            // Determine the conversation key: either a partnerId or a broadcastId
            let key: string;
            let isBroadcastGroup = false;

            if (msg.sender_id === user.id && msg.broadcast_id) {
                key = `broadcast:${msg.broadcast_id}`;
                isBroadcastGroup = true;
            } else {
                key = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
            }

            if (!groups[key]) {
                groups[key] = {
                    key,
                    partnerId: isBroadcastGroup ? null : key,
                    broadcastId: isBroadcastGroup ? msg.broadcast_id : null,
                    isBroadcast: isBroadcastGroup,
                    messages: [],
                    lastMessage: msg,
                    unreadCount: 0
                };
            }
            groups[key].messages.push(msg);

            const msgDate = new Date(msg.created_at || 0).getTime();
            const lastMsgDate = new Date(groups[key].lastMessage.created_at || 0).getTime();

            if (msgDate > lastMsgDate) {
                groups[key].lastMessage = msg;
            }

            if (!msg.is_read && msg.receiver_id === user.id) {
                groups[key].unreadCount++;
            }
        });

        return Object.values(groups).sort((a, b) =>
            new Date(b.lastMessage.created_at || 0).getTime() - new Date(a.lastMessage.created_at || 0).getTime()
        );
    }, [messages, user]);

    // Fetch profile data for participants
    useEffect(() => {
        const fetchProfiles = async () => {
            const missingIds = conversations
                .filter(c => !c.isBroadcast && c.partnerId)
                .map(c => c.partnerId as string)
                .filter(id => !profiles[id]);

            if (missingIds.length === 0) return;

            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .in('id', missingIds);

            if (data) {
                const newProfiles = { ...profiles };
                data.forEach(p => {
                    newProfiles[p.id] = p;
                });
                setProfiles(newProfiles);
            }
        };

        fetchProfiles();
    }, [conversations]);

    const activeConversation = useMemo(() =>
        conversations.find(c => c.key === selectedConversationId),
        [conversations, selectedConversationId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (activeConversation?.messages) {
            scrollToBottom();
        }
    }, [activeConversation?.messages]);

    const handleSendReply = async () => {
        if (!replyContent.trim() || !selectedConversationId || !user) return;
        setIsSending(true);

        // RLS Fix: To reply, non-instructors/superadmins MUST provide a parent_id 
        // for a message where they were the receiver. 
        // Even for instructors, providing a parent_id is safer for threading.

        // Find the most recent message in this thread where the current user was the RECIPIENT
        const lastReceivedMessage = activeConversation?.messages
            .find((m: Message) => m.receiver_id === user.id);

        // If we found a message sent TO us, use it as parent. 
        // Otherwise fallback to the absolute last message (appropriate for instructors).
        const parentId = lastReceivedMessage?.id || activeConversation?.lastMessage?.id || null;

        const { error } = await sendMessage(selectedConversationId, replyContent.trim(), null, parentId);

        if (!error) {
            setReplyContent('');
        } else {
            console.error('Messaging Error:', error);
            alert(`Failed to send message: ${error.message || 'Unknown error'}. Please try again.`);
        }
        setIsSending(false);
    };

    // Auto-mark as read when viewing conversation
    useEffect(() => {
        if (!selectedConversationId || !user || !activeConversation) return;

        const unreadMessages = activeConversation.messages.filter(
            (m: Message) => !m.is_read && m.receiver_id === user.id
        );

        if (unreadMessages.length > 0) {
            unreadMessages.forEach((msg: Message) => markAsRead(msg.id));
        }
    }, [selectedConversationId, activeConversation?.unreadCount, user?.id]);

    if (messagesLoading && conversations.length === 0) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="flex w-full md:h-full bg-white relative">
            {/* Sidebar */}
            <div className={cn(
                "w-full md:w-80 border-r border-slate-50 flex flex-col md:h-full",
                selectedConversationId ? "hidden md:flex" : "flex"
            )}>
                <div className="sticky top-[64px] md:top-0 z-20 p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Messages</h2>
                    {user?.role !== 'student' && (
                        <button
                            onClick={() => openNewMessage()}
                            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-slate-900 transition-colors shadow-lg shadow-indigo-600/20"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="p-4 bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            <p>No conversations found.</p>
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const isBroadcast = conv.isBroadcast;
                            const partner = conv.partnerId ? profiles[conv.partnerId] : null;
                            const displayName = isBroadcast
                                ? "Broadcast Group"
                                : (partner?.full_name || 'Loading...');

                            return (
                                <button
                                    key={conv.key}
                                    onClick={() => setSelectedConversationId(conv.key)}
                                    className={cn(
                                        "w-full p-2.5 rounded-2xl transition-all flex items-start gap-2.5 mb-1",
                                        selectedConversationId === conv.key
                                            ? "bg-indigo-50 text-indigo-900 shadow-sm"
                                            : "hover:bg-slate-50 text-slate-600"
                                    )}
                                >
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white overflow-hidden shadow-sm",
                                        isBroadcast ? "bg-emerald-100" : "bg-indigo-100"
                                    )}>
                                        {isBroadcast ? (
                                            <Users className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                            <User className="w-4 h-4 text-indigo-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h4 className="font-bold text-xs truncate leading-none">{displayName}</h4>
                                            <span className="text-[9px] font-bold text-slate-400">
                                                {new Date(conv.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {conv.lastMessage.subject && (
                                            <p className="text-[9px] font-black uppercase text-indigo-500 mb-0.5 truncate tracking-tight">{conv.lastMessage.subject}</p>
                                        )}
                                        <p className="text-[11px] line-clamp-1 opacity-70 leading-tight italic">"{conv.lastMessage.content}"</p>
                                        <div className="flex justify-between items-center mt-1.5">
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-white/50 rounded-full border border-current",
                                                isBroadcast ? "text-emerald-500" : "text-indigo-400"
                                            )}>
                                                {isBroadcast ? `${conv.messages.length} Recipients` : getRoleLabel(partner?.role)}
                                            </span>
                                            {conv.unreadCount > 0 && (
                                                <span className="bg-red-500 text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-sm shadow-red-500/20">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Thread */}
            <div className={cn(
                "flex-1 flex flex-col bg-slate-50/30 relative md:h-full md:overflow-hidden",
                !selectedConversationId ? "hidden md:flex" : "flex"
            )}>
                {selectedConversationId ? (
                    <>
                        {/* Thread Header - Isolated on Desktop */}
                        <div className="sticky top-[64px] md:static z-30 p-4 border-b border-slate-100 bg-white/95 backdrop-blur-sm flex items-center gap-3 shadow-sm md:shadow-none">
                            <button
                                onClick={() => setSelectedConversationId(null)}
                                className="md:hidden p-2 -ml-2 hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg",
                                activeConversation?.isBroadcast ? "bg-emerald-600 shadow-emerald-600/20" : "bg-indigo-600 shadow-indigo-600/20"
                            )}>
                                {activeConversation?.isBroadcast ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">
                                    {activeConversation?.isBroadcast ? "Broadcast Delivery Report" : profiles[selectedConversationId!]?.full_name}
                                </h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {activeConversation?.isBroadcast ? `${activeConversation.messages.length} Recipients` : getRoleLabel(profiles[selectedConversationId!]?.role)}
                                </p>
                            </div>
                        </div>

                        {/* Messages List - Independent Scroll Zone */}
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar md:pb-32">
                            {(activeConversation?.isBroadcast
                                ? [activeConversation.messages[0]] // Only show one for broadcast sent
                                : [...(activeConversation?.messages || [])].reverse()
                            ).map((msg, idx) => {
                                const isOwn = msg.sender_id === user?.id;
                                const isBroadcast = msg.broadcast_id !== null;

                                // For broadcasts we sent, show aggregate report
                                const broadcastStats = isOwn && isBroadcast ? {
                                    total: activeConversation.messages.length,
                                    read: activeConversation.messages.filter((m: Message) => m.is_read).length
                                } : null;

                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2",
                                            isOwn ? "ml-auto items-end" : "items-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-3 rounded-2xl text-xs leading-relaxed shadow-sm",
                                            isOwn
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                                        )}>
                                            {msg.subject && (
                                                <div className="mb-1.5 pb-1.5 border-b border-current opacity-60">
                                                    <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1">Subject</p>
                                                    <p className="font-black text-[10px] leading-none">{msg.subject}</p>
                                                </div>
                                            )}
                                            {msg.content}
                                        </div>

                                        {broadcastStats && activeConversation.isBroadcast && (
                                            <div className="mt-1.5 flex items-center gap-2 px-2.5 py-1 bg-white rounded-full border border-slate-100 shadow-sm">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight">
                                                    Delivered to {broadcastStats.total} students • {broadcastStats.read} Read
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mt-1.5 px-1">
                                            <span className="text-[9px] font-bold text-slate-400">
                                                {new Date(msg.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isOwn && !isBroadcast && (
                                                msg.is_read ? <Check className="w-3 h-3 text-indigo-400" /> : <Check className="w-3 h-3 text-slate-300" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Area - Bounded Unit */}
                        {!activeConversation?.isBroadcast && (
                            <div className="sticky bottom-0 md:absolute md:bottom-0 md:left-0 md:right-0 z-40 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] md:shadow-none">
                                {user?.role?.toLowerCase() === 'student' && activeConversation?.lastMessage?.sender_id === user.id ? (
                                    <div className="py-2 px-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-1">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <p className="text-[11px] font-bold text-slate-500 italic">
                                            {getWaitingMessage(activeConversation?.messages[0]?.sender_id === user.id
                                                ? activeConversation?.messages[0]?.receiver_id
                                                : activeConversation?.messages[0]?.sender_id)}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex gap-2.5 items-end">
                                        <div className="flex-1 relative">
                                            <textarea
                                                placeholder="Write your reply..."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                disabled={isSending}
                                                className="w-full bg-slate-50 border-none rounded-xl p-3 pr-10 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all resize-none h-11 min-h-[44px] custom-scrollbar"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendReply();
                                                    }
                                                }}
                                            />
                                            <button
                                                disabled={!replyContent.trim() || isSending}
                                                onClick={handleSendReply}
                                                className="absolute right-1.5 bottom-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-slate-900 transition-all disabled:opacity-50 disabled:bg-slate-300"
                                            >
                                                {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center bg-slate-50/20">
                        <div className="w-24 h-24 bg-white rounded-[40px] shadow-sm flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 text-indigo-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Select a conversation</h3>
                        <p className="max-w-xs text-sm leading-relaxed font-bold">Choose a message from the sidebar or start a new conversation to begin chatting.</p>
                        {user?.role !== 'student' && (
                            <Button
                                variant="primary"
                                className="mt-8 bg-indigo-600 hover:bg-slate-900 rounded-2xl h-14 px-8 font-black"
                                onClick={() => openNewMessage()}
                            >
                                Start New Conversation
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* NewMessageModal is now rendered globally by MessageProvider / Context */}
        </div>
    );
}

function MessageSquare(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}
