'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Send, Plus, MoreVertical, Check, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useMessages } from '@/context/MessageContext';
import { useUser } from '@/context/UserContext';
import { createClient } from "@schologic/database";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import NewMessageModal from '@/components/messaging/NewMessageModal';

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
    const { messages, markAsRead, sendMessage, loading: messagesLoading } = useMessages();
    const { user } = useUser();
    const supabase = createClient();

    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [profiles, setProfiles] = useState<Record<string, Profile>>({});
    const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);

    // Group messages into conversations
    const conversations = useMemo(() => {
        if (!user) return [];

        const groups: Record<string, any> = {};

        messages.forEach(msg => {
            const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
            if (!groups[partnerId]) {
                groups[partnerId] = {
                    partnerId,
                    messages: [],
                    lastMessage: msg,
                    unreadCount: 0
                };
            }
            groups[partnerId].messages.push(msg);
            if (new Date(msg.created_at || 0) > new Date(groups[partnerId].lastMessage.created_at || 0)) {
                groups[partnerId].lastMessage = msg;
            }
            if (!msg.is_read && msg.receiver_id === user.id) {
                groups[partnerId].unreadCount++;
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
                .map(c => c.partnerId)
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
        conversations.find(c => c.partnerId === selectedConversationId),
        [conversations, selectedConversationId]);

    const handleSendReply = async () => {
        if (!replyContent.trim() || !selectedConversationId || !user) return;
        setIsSending(true);
        const lastMsgId = activeConversation?.lastMessage?.id || null;
        const { error } = await sendMessage(selectedConversationId, replyContent.trim(), lastMsgId);
        if (!error) {
            setReplyContent('');
        }
        setIsSending(false);
    };

    if (messagesLoading && conversations.length === 0) {
        return (
            <div className="flex h-[600px] items-center justify-center bg-white rounded-3xl border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="flex h-[700px] bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
            {/* Sidebar */}
            <div className={cn(
                "w-full md:w-80 border-r border-slate-50 flex flex-col",
                selectedConversationId ? "hidden md:flex" : "flex"
            )}>
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Messages</h2>
                    {user?.role !== 'student' && (
                        <button
                            onClick={() => setIsNewMessageModalOpen(true)}
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

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            <p>No conversations found.</p>
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const partner = profiles[conv.partnerId];
                            return (
                                <button
                                    key={conv.partnerId}
                                    onClick={() => setSelectedConversationId(conv.partnerId)}
                                    className={cn(
                                        "w-full p-4 rounded-3xl transition-all flex items-start gap-3 mb-1",
                                        selectedConversationId === conv.partnerId
                                            ? "bg-indigo-50 text-indigo-900 shadow-sm"
                                            : "hover:bg-slate-50 text-slate-600"
                                    )}
                                >
                                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0 border-2 border-white overflow-hidden shadow-sm">
                                        <User className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-sm truncate">{partner?.full_name || 'Loading...'}</h4>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {new Date(conv.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {conv.lastMessage.subject && (
                                            <p className="text-[10px] font-black uppercase text-indigo-500 mb-0.5 truncate tracking-tight">{conv.lastMessage.subject}</p>
                                        )}
                                        <p className="text-xs line-clamp-1 opacity-70 leading-relaxed italic">"{conv.lastMessage.content}"</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-white/50 rounded-full border border-current text-indigo-400">
                                                {partner?.role || 'User'}
                                            </span>
                                            {conv.unreadCount > 0 && (
                                                <span className="bg-indigo-600 text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
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
                "flex-1 flex flex-col bg-slate-50/30",
                !selectedConversationId ? "hidden md:flex" : "flex"
            )}>
                {selectedConversationId ? (
                    <>
                        {/* Thread Header */}
                        <div className="p-6 bg-white border-b border-slate-50 flex items-center gap-4">
                            <button
                                onClick={() => setSelectedConversationId(null)}
                                className="md:hidden p-2 hover:bg-slate-50 rounded-xl"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{profiles[selectedConversationId]?.full_name}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{profiles[selectedConversationId]?.role}</p>
                            </div>
                            <div className="ml-auto">
                                <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {[...(activeConversation?.messages || [])].reverse().map((msg, idx) => {
                                const isOwn = msg.sender_id === user?.id;
                                const isBroadcast = msg.broadcast_id !== null;

                                // For broadcasts we sent, show aggregate report
                                const broadcastStats = isOwn && isBroadcast ? {
                                    total: messages.filter(m => m.broadcast_id === msg.broadcast_id).length,
                                    read: messages.filter(m => m.broadcast_id === msg.broadcast_id && m.is_read).length
                                } : null;

                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex flex-col max-w-[80%] animate-in fade-in slide-in-from-bottom-2",
                                            isOwn ? "ml-auto items-end" : "items-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-4 rounded-3xl text-sm leading-relaxed shadow-sm",
                                            isOwn
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                                        )}>
                                            {msg.subject && (
                                                <div className="mb-2 pb-2 border-b border-current opacity-60">
                                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Subject</p>
                                                    <p className="font-black text-xs leading-none">{msg.subject}</p>
                                                </div>
                                            )}
                                            {msg.content}
                                        </div>

                                        {broadcastStats && broadcastStats.total > 1 && (
                                            <div className="mt-1 flex items-center gap-2 px-2 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                                                <div className="flex -space-x-1">
                                                    {[...Array(Math.min(3, broadcastStats.read))].map((_, i) => (
                                                        <div key={i} className="w-3 h-3 rounded-full bg-indigo-400 border border-white" />
                                                    ))}
                                                </div>
                                                <span className="text-[9px] font-black text-indigo-600 uppercase">
                                                    Read by {broadcastStats.read} of {broadcastStats.total} recipients
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mt-2 px-1">
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isOwn && !isBroadcast && (
                                                msg.is_read ? <Check className="w-3 h-3 text-indigo-400" /> : <Check className="w-3 h-3 text-slate-300" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Reply Area */}
                        <div className="p-6 bg-white border-t border-slate-50">
                            <div className="flex gap-3 items-end">
                                <div className="flex-1 relative">
                                    <textarea
                                        placeholder="Write your reply..."
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        disabled={isSending}
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 transition-all resize-none h-14 min-h-[56px] custom-scrollbar"
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
                                        className="absolute right-2 bottom-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-slate-900 transition-all disabled:opacity-50 disabled:bg-slate-300"
                                    >
                                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
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
                                onClick={() => setIsNewMessageModalOpen(true)}
                            >
                                Start New Conversation
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <NewMessageModal
                isOpen={isNewMessageModalOpen}
                onClose={() => setIsNewMessageModalOpen(false)}
            />
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
