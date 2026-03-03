"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
    X, ArrowLeft, Send, Plus, Loader2,
    MessageSquare, Hash, Shield, ChevronRight, User, Check
} from "lucide-react";
import { usePilotMessages } from "@/context/PilotMessageContext";
import { cn } from "@/lib/utils";

// ─── Thread List View ─────────────────────────────────────

function ThreadListView() {
    const {
        directMessages, discussionMessages, currentUserId,
        superadminId, getNameForId,
        setActiveView, setActiveThreadId, setComposeRecipientId,
        unreadDiscussionCount,
    } = usePilotMessages();

    // Build conversation threads from DMs
    const dmThreads = useMemo(() => {
        const groups: Record<string, {
            partnerId: string;
            partnerName: string;
            messages: any[];
            lastMessage: any;
            unreadCount: number;
        }> = {};

        directMessages.forEach(msg => {
            const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
            if (!groups[partnerId]) {
                groups[partnerId] = {
                    partnerId,
                    partnerName: partnerId === superadminId
                        ? 'Support'
                        : getNameForId(partnerId),
                    messages: [],
                    lastMessage: msg,
                    unreadCount: 0,
                };
            }
            groups[partnerId].messages.push(msg);
            const msgDate = new Date(msg.created_at || 0).getTime();
            const lastDate = new Date(groups[partnerId].lastMessage.created_at || 0).getTime();
            if (msgDate > lastDate) groups[partnerId].lastMessage = msg;
            if (!msg.is_read && msg.receiver_id === currentUserId) groups[partnerId].unreadCount++;
        });

        return Object.values(groups).sort(
            (a, b) => new Date(b.lastMessage.created_at || 0).getTime() - new Date(a.lastMessage.created_at || 0).getTime()
        );
    }, [directMessages, currentUserId, superadminId, getNameForId]);

    const handleOpenDiscussion = () => {
        setActiveView('thread');
        setActiveThreadId('discussion');
    };

    const handleOpenThread = (partnerId: string) => {
        setActiveView('thread');
        setActiveThreadId(partnerId);
    };

    const handleCompose = () => {
        setComposeRecipientId(null);
        setActiveView('compose');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Pinned Discussion Board */}
            <div className="p-3 border-b border-slate-100">
                <button
                    onClick={handleOpenDiscussion}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-100 transition-colors text-left group"
                >
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/20">
                        <Hash className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-900">Team Discussion</span>
                            {unreadDiscussionCount > 0 && (
                                <span className="bg-indigo-600 text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                                    {unreadDiscussionCount}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-indigo-600/60 font-medium truncate mt-0.5">
                            {discussionMessages.length > 0
                                ? discussionMessages[discussionMessages.length - 1].content
                                : 'No messages yet — start the conversation!'}
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
            </div>

            {/* DM Threads */}
            <div className="flex-1 overflow-y-auto">
                {dmThreads.length === 0 ? (
                    <div className="p-8 text-center">
                        <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-400">No direct messages yet</p>
                        <p className="text-[10px] text-slate-300 mt-1">Start a conversation below</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-0.5">
                        {dmThreads.map(thread => (
                            <button
                                key={thread.partnerId}
                                onClick={() => handleOpenThread(thread.partnerId)}
                                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                    thread.partnerId === superadminId ? "bg-amber-50" : "bg-slate-100"
                                )}>
                                    {thread.partnerId === superadminId
                                        ? <Shield className="w-3.5 h-3.5 text-amber-600" />
                                        : <User className="w-3.5 h-3.5 text-slate-400" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 truncate">{thread.partnerName}</span>
                                        <span className="text-[9px] font-bold text-slate-300 shrink-0">
                                            {thread.lastMessage.created_at && new Date(thread.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <p className="text-[10px] text-slate-400 truncate pr-2">
                                            {thread.lastMessage.subject && <span className="font-bold text-slate-500">{thread.lastMessage.subject} · </span>}
                                            {thread.lastMessage.content}
                                        </p>
                                        {thread.unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-[8px] font-black min-w-[14px] h-3.5 px-1 rounded-full flex items-center justify-center shrink-0">
                                                {thread.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* New Message Button */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                <button
                    onClick={handleCompose}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
                >
                    <Plus className="w-3.5 h-3.5" /> New Message
                </button>
            </div>
        </div>
    );
}

// ─── Thread View ──────────────────────────────────────────

function ThreadView() {
    const {
        directMessages, discussionMessages, currentUserId,
        teamMembers, superadminId, getNameForId,
        sendDirectMessage, sendDiscussionMessage, markAsRead, markDiscussionRead,
        activeThreadId, setActiveView, setActiveThreadId,
    } = usePilotMessages();

    const [replyContent, setReplyContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isDiscussion = activeThreadId === 'discussion';

    // Get messages for this thread
    const threadMessages = useMemo(() => {
        if (isDiscussion) return discussionMessages;
        return directMessages
            .filter(m => m.sender_id === activeThreadId || m.receiver_id === activeThreadId)
            .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
    }, [isDiscussion, discussionMessages, directMessages, activeThreadId]);

    // Thread name
    const threadName = useMemo(() => {
        if (isDiscussion) return 'Team Discussion';
        if (activeThreadId === superadminId) return 'Support';
        return getNameForId(activeThreadId || '');
    }, [isDiscussion, activeThreadId, superadminId, getNameForId]);

    // Get sender initials helper
    const getSenderInitials = (senderId: string) => {
        const name = getNameForId(senderId);
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [threadMessages.length]);

    // Mark as read — different strategies for discussion vs DMs
    useEffect(() => {
        if (isDiscussion) {
            // Discussion: update localStorage timestamp (per-user, not shared DB field)
            markDiscussionRead();
        } else {
            // DMs: mark individual messages as read in DB (is_read is per-recipient)
            threadMessages
                .filter(m => !m.is_read && m.receiver_id === currentUserId)
                .forEach(m => markAsRead(m.id));
        }
    }, [threadMessages, currentUserId, isDiscussion]);

    const handleSend = async () => {
        const text = replyContent.trim();
        if (!text) return;
        setIsSending(true);

        try {
            if (isDiscussion) {
                await sendDiscussionMessage(text);
            } else if (activeThreadId) {
                const lastReceived = [...threadMessages].reverse().find(m => m.receiver_id === currentUserId);
                await sendDirectMessage(activeThreadId, text, null, lastReceived?.id || null);
            }
            setReplyContent('');
        } catch (err) {
            console.error('Send error:', err);
        }
        setIsSending(false);
    };

    const handleBack = () => {
        setActiveView('threads');
        setActiveThreadId(null);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white shrink-0">
                <button onClick={handleBack} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                </button>
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0",
                    isDiscussion ? "bg-indigo-600" : activeThreadId === superadminId ? "bg-amber-100" : "bg-slate-100"
                )}>
                    {isDiscussion
                        ? <Hash className="w-4 h-4 text-white" />
                        : activeThreadId === superadminId
                            ? <Shield className="w-3.5 h-3.5 text-amber-600" />
                            : <User className="w-3.5 h-3.5 text-slate-500" />
                    }
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-800">{threadName}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {isDiscussion
                            ? `${teamMembers.length} members`
                            : activeThreadId === superadminId ? 'Platform Admin' : 'Team Member'}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {threadMessages.length === 0 && (
                    <div className="text-center py-12">
                        <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 font-medium">No messages yet</p>
                    </div>
                )}
                {threadMessages.map(msg => {
                    const isOwn = msg.sender_id === currentUserId;
                    return (
                        <div
                            key={msg.id}
                            className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}
                        >
                            {/* Avatar */}
                            {(isDiscussion || !isOwn) && (
                                <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-black mt-0.5",
                                    isOwn ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
                                )}>
                                    {getSenderInitials(msg.sender_id)}
                                </div>
                            )}
                            <div className={cn("max-w-[75%] flex flex-col", isOwn ? "items-end" : "items-start")}>
                                {(isDiscussion && !isOwn) && (
                                    <span className="text-[9px] font-bold text-slate-400 mb-0.5 px-1">
                                        {getNameForId(msg.sender_id)}
                                    </span>
                                )}
                                <div className={cn(
                                    "px-3 py-2 rounded-2xl text-xs leading-relaxed",
                                    isOwn
                                        ? "bg-indigo-600 text-white rounded-br-sm"
                                        : "bg-slate-100 text-slate-700 rounded-bl-sm"
                                )}>
                                    {msg.subject && (
                                        <p className={cn(
                                            "text-[9px] font-black uppercase tracking-wider mb-1 pb-1 border-b",
                                            isOwn ? "border-white/20 text-indigo-200" : "border-slate-200 text-slate-400"
                                        )}>
                                            {msg.subject}
                                        </p>
                                    )}
                                    {msg.content}
                                </div>
                                {/* Timestamp + Read Receipts */}
                                <div className="flex items-center gap-1 mt-0.5 px-1">
                                    <span className="text-[8px] font-bold text-slate-300">
                                        {msg.created_at && new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {/* Read receipts for own messages */}
                                    {isOwn && !isDiscussion && (
                                        msg.is_read
                                            ? <span className="flex -space-x-1.5"><Check className="w-3 h-3 text-indigo-400" /><Check className="w-3 h-3 text-indigo-400" /></span>
                                            : <Check className="w-3 h-3 text-slate-300" />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply Bar */}
            <div className="p-3 border-t border-slate-100 bg-white shrink-0">
                <div className="flex gap-2 items-end">
                    <textarea
                        placeholder={isDiscussion ? "Message the team..." : "Write a reply..."}
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        disabled={isSending}
                        className="flex-1 bg-slate-50 border-none rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all resize-none h-10 min-h-[40px] max-h-24 outline-none"
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <button
                        disabled={!replyContent.trim() || isSending}
                        onClick={handleSend}
                        className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:bg-slate-300 shrink-0 shadow-sm"
                    >
                        {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Compose View ─────────────────────────────────────────

function ComposeView() {
    const {
        teamMembers, superadminId, superadminName, currentUserId,
        sendDirectMessage,
        setActiveView, setActiveThreadId,
        composeRecipientId, setComposeRecipientId,
    } = usePilotMessages();

    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Only joined members (excluding self) + superadmin
    const recipients = useMemo(() => {
        const list = teamMembers
            .filter(m => m.user_id !== currentUserId)
            .map(m => ({ id: m.user_id, name: m.name, isAdmin: false }));

        if (superadminId) {
            list.unshift({ id: superadminId, name: `Support (${superadminName})`, isAdmin: true });
        }
        return list;
    }, [teamMembers, currentUserId, superadminId, superadminName]);

    const handleSend = async () => {
        if (!composeRecipientId || !content.trim()) return;
        setIsSending(true);
        const { error } = await sendDirectMessage(composeRecipientId, content.trim(), subject.trim() || null);
        if (!error) {
            setActiveView('thread');
            setActiveThreadId(composeRecipientId);
        }
        setIsSending(false);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white shrink-0">
                <button onClick={() => { setActiveView('threads'); setComposeRecipientId(null); }} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                </button>
                <h4 className="text-xs font-bold text-slate-800">New Message</h4>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Recipient */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">To</label>
                    <select
                        value={composeRecipientId || ''}
                        onChange={e => setComposeRecipientId(e.target.value || null)}
                        className="w-full px-3 py-2.5 bg-slate-50 rounded-xl text-xs font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
                    >
                        <option value="">Select recipient...</option>
                        {recipients.map(r => (
                            <option key={r.id} value={r.id}>
                                {r.isAdmin ? '🛡️ ' : ''}{r.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Subject</label>
                    <input
                        type="text"
                        placeholder="Enter subject..."
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 rounded-xl text-xs font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
                    />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Message</label>
                    <textarea
                        placeholder="Write your message..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full h-28 px-3 py-2.5 bg-slate-50 rounded-xl text-xs font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all resize-none"
                    />
                </div>
            </div>

            {/* Send */}
            <div className="p-3 border-t border-slate-100 bg-white shrink-0">
                <button
                    disabled={!composeRecipientId || !content.trim() || isSending}
                    onClick={handleSend}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:bg-slate-300 shadow-sm"
                >
                    {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Send Message
                </button>
            </div>
        </div>
    );
}

// ─── Main Panel ───────────────────────────────────────────

export function PilotMessagingPanel() {
    const { isPanelOpen, closePanel, activeView, loading } = usePilotMessages();

    if (!isPanelOpen) return null;

    return (
        <>
            {/* Backdrop — above ALL page content */}
            <div
                className="fixed inset-0 z-[9998] bg-black/10 backdrop-blur-[2px] animate-in fade-in duration-200"
                onClick={closePanel}
            />

            {/* Panel — above backdrop */}
            <div className="fixed top-0 right-0 bottom-0 z-[9999] w-full sm:w-[380px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-800">Messages</h3>
                    </div>
                    <button
                        onClick={closePanel}
                        className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                        </div>
                    ) : (
                        <>
                            {activeView === 'threads' && <ThreadListView />}
                            {activeView === 'thread' && <ThreadView />}
                            {activeView === 'compose' && <ComposeView />}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
