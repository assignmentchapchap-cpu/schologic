'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from "@schologic/database";
import { useMessages } from '@/context/MessageContext';
import { Button } from '@/components/ui/Button';
import {
    Loader2,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    Clock,
    Filter,
    User as UserIcon,
    AlertTriangle,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRoleLabel } from '@/lib/identity';

type Feedback = {
    id: string;
    user_id: string | null;
    subject: string | null;
    content: string;
    type: string | null;
    status: string | null;
    created_at: string | null;
    admin_notes: string | null;
    message_thread_id: string | null;
    priority: string | null;
    unread_count?: number; // Virtual field
    user?: {
        full_name: string | null;
        role: string | null;
    };
};

export default function AdminFeedbackPage() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [localNotes, setLocalNotes] = useState<string>('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [adminId, setAdminId] = useState<string | null>(null);

    const supabase = createClient();
    const { openNewMessage } = useMessages();

    // Fetch initial data
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setAdminId(user.id);
            }
            fetchFeedback();
        };
        init();
    }, []);

    const fetchFeedback = async () => {
        setLoading(true);
        // 1. Fetch Feedback with User details
        const { data, error } = await supabase
            .from('feedback')
            .select(`
                *,
                user:profiles!feedback_user_id_fkey (
                    full_name,
                    role
                )
            `)
            .order('created_at', { ascending: false });

        // Use the current adminId from state if available, or fetch it again if needed
        // But since state might not be set yet during init, we handle the guard inside
        if (data) {
            let feedbackData = data as any[];

            // Check for adminId inside the block to ensure non-null usage
            const { data: { user } } = await supabase.auth.getUser();
            const currentAdminId = adminId || user?.id;

            if (currentAdminId) {
                // 2. Fetch unread messages for the current admin
                const { data: unreadMessages } = await supabase
                    .from('messages')
                    .select('sender_id')
                    .eq('receiver_id', currentAdminId)
                    .eq('is_read', false);

                if (unreadMessages) {
                    // Map unread counts to feedback based on user_id
                    feedbackData = feedbackData.map(f => ({
                        ...f,
                        unread_count: unreadMessages.filter(m => m.sender_id === f.user_id).length
                    }));
                }
            }

            setFeedback(feedbackData);

            // Select first entry by default if none selected
            if (feedbackData.length > 0 && !selectedId) {
                const first = feedbackData[0];
                setSelectedId(first.id);
                setLocalNotes(first.admin_notes || '');
            }
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setFeedback(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
        const { error } = await supabase.from('feedback').update({ status: newStatus } as any).eq('id', id);
        if (error) {
            console.error('Failed to update status:', error);
            fetchFeedback();
        }
    };

    const handleUpdatePriority = async (id: string, newPriority: string) => {
        setFeedback(prev => prev.map(f => f.id === id ? { ...f, priority: newPriority } : f));
        const { error } = await supabase.from('feedback').update({ priority: newPriority } as any).eq('id', id);
        if (error) {
            console.error('Failed to update priority:', error);
            fetchFeedback();
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedId) return;
        setIsSavingNotes(true);
        const { error } = await supabase.from('feedback').update({ admin_notes: localNotes } as any).eq('id', selectedId);
        if (error) {
            console.error('Failed to save notes:', error);
        } else {
            setFeedback(prev => prev.map(f => f.id === selectedId ? { ...f, admin_notes: localNotes } : f));
        }
        setIsSavingNotes(false);
    };

    const handleRespond = (entry: Feedback) => {
        if (!entry.user_id) return;

        const contentSnippet = entry.content.length > 40
            ? entry.content.substring(0, 40) + '...'
            : entry.content;

        openNewMessage({
            recipientId: entry.user_id,
            subject: `Regarding your ${entry.type || 'feedback'}: "${contentSnippet}"`
        });
    };

    const filteredFeedback = feedback.filter(f => {
        if (filter === 'all') return true;
        if (filter === 'unread') return (f.unread_count || 0) > 0;
        return f.status === filter || f.type === filter || f.priority === filter;
    });

    const selectedFeedback = feedback.find(f => f.id === selectedId) || null;

    const statusSequence = ['new', 'follow-up', 'pending', 'resolved'];
    const statusLabels: Record<string, string> = {
        'new': 'New',
        'follow-up': 'Follow-up',
        'pending': 'Pending',
        'resolved': 'Done'
    };

    const priorities = ['low', 'medium', 'high', 'urgent'];

    if (loading && feedback.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
            {/* Unified Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">Feedback Triage</h1>
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                        <Filter className="w-3 h-3 text-slate-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="text-[10px] font-bold text-slate-600 bg-transparent outline-none uppercase tracking-widest cursor-pointer"
                        >
                            <option value="all">All Feedback</option>
                            <option value="unread">Unread Messages</option>
                            <option value="new">Status: New</option>
                            <option value="follow-up">Status: Follow-up</option>
                            <option value="pending">Status: Pending</option>
                            <option value="resolved">Status: Resolved</option>
                            <hr />
                            <option value="urgent">Priority: Urgent</option>
                            <option value="high">Priority: High</option>
                            <option value="bug">Type: Bugs</option>
                            <option value="suggestion">Type: Suggestions</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {filteredFeedback.length} entries found
                    </p>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Master List */}
                <div className="w-[35%] min-w-[320px] max-w-[450px] border-r border-slate-100 flex flex-col bg-slate-50/30 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {filteredFeedback.length === 0 ? (
                            <div className="py-20 flex flex-col items-center text-center px-4">
                                <MessageSquare className="w-10 h-10 text-slate-200 mb-4" />
                                <h3 className="text-sm font-bold text-slate-800">No matches</h3>
                                <p className="text-[10px] text-slate-400 mt-1">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            filteredFeedback.map((entry) => {
                                const isActive = selectedId === entry.id;
                                const status = entry.status || 'new';
                                const hasUnread = (entry.unread_count || 0) > 0;

                                return (
                                    <button
                                        key={entry.id}
                                        onClick={() => {
                                            setSelectedId(entry.id);
                                            setLocalNotes(entry.admin_notes || '');
                                        }}
                                        className={cn(
                                            "w-full text-left p-4 rounded-2xl transition-all border group relative overflow-hidden",
                                            isActive
                                                ? "bg-white border-indigo-200 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-50"
                                                : "bg-white/50 border-transparent hover:border-slate-200 hover:bg-white"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-slate-800 line-clamp-1">{entry.user?.full_name || 'Anonymous'}</p>
                                                {hasUnread && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" title="New Message Reply" />
                                                )}
                                            </div>
                                            <div className={cn(
                                                "w-2 h-2 rounded-full shrink-0",
                                                status === 'new' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" :
                                                    status === 'follow-up' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                                        status === 'pending' ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" :
                                                            "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                            )} />
                                        </div>
                                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                            {entry.content}
                                        </p>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                    {new Date(entry.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                                {entry.priority && entry.priority !== 'medium' && (
                                                    <span className={cn(
                                                        "text-[8px] font-black uppercase px-1 rounded-sm",
                                                        entry.priority === 'urgent' ? "text-red-500 bg-red-50" :
                                                            entry.priority === 'high' ? "text-amber-600 bg-amber-50" :
                                                                "text-slate-400 bg-slate-50"
                                                    )}>
                                                        {entry.priority}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md border",
                                                entry.type === 'bug' ? "bg-red-50 text-red-500 border-red-100" :
                                                    entry.type === 'suggestion' ? "bg-emerald-50 text-emerald-500 border-emerald-100" :
                                                        "bg-slate-50 text-slate-500 border-slate-100"
                                            )}>
                                                {entry.type || 'General'}
                                            </span>
                                        </div>
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Detail Pane */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    {selectedFeedback ? (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* User Context Row */}
                            <div className="px-8 py-6 border-b border-slate-50 shrink-0">
                                <div className="flex justify-between items-start gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                                            <UserIcon className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">{selectedFeedback.user?.full_name || 'Anonymous User'}</h2>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{getRoleLabel(selectedFeedback.user?.role) || 'Guest User'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="rounded-xl font-black text-[10px] h-9"
                                            onClick={() => handleRespond(selectedFeedback)}
                                            disabled={!selectedFeedback.user_id}
                                            leftIcon={<MessageSquare className="w-4 h-4" />}
                                        >
                                            Respond
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                                {/* Unread Banner */}
                                {(selectedFeedback.unread_count || 0) > 0 && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                <MessageSquare className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-blue-900">New Reply Received</p>
                                                <p className="text-[11px] text-blue-700">The user has replied to your message thread.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => window.location.href = '/admin/messages'}
                                            className="px-4 py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2 group"
                                        >
                                            View Reply
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>
                                )}

                                {/* Main Report Section */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback Report</p>
                                        <div className="h-px grow bg-slate-50" />
                                    </div>
                                    <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 relative">
                                        <div className="absolute -top-3 left-4 flex gap-2">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize border shadow-sm",
                                                selectedFeedback.type === 'bug' ? "bg-red-500 text-white border-transparent" :
                                                    selectedFeedback.type === 'suggestion' ? "bg-emerald-500 text-white border-transparent" :
                                                        "bg-slate-800 text-white border-transparent"
                                            )}>
                                                {selectedFeedback.type || 'general'}
                                            </span>
                                            {selectedFeedback.priority && selectedFeedback.priority !== 'medium' && (
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize border shadow-sm",
                                                    selectedFeedback.priority === 'urgent' ? "bg-rose-100 text-rose-600 border-rose-200" :
                                                        "bg-amber-100 text-amber-600 border-amber-200"
                                                )}>
                                                    {selectedFeedback.priority} priority
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap mt-2">{selectedFeedback.content}</p>
                                    </div>
                                </section>

                                {/* Controls Section */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <section>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Lifecycle Status</p>
                                        <div className="flex flex-col gap-1.5 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100">
                                            {statusSequence.map((s: string, idx: number) => {
                                                const isActive = s === (selectedFeedback.status || 'new');
                                                const statusLabelsMap: Record<string, string> = {
                                                    'new': 'New',
                                                    'follow-up': 'Follow-up',
                                                    'pending': 'Pending',
                                                    'resolved': 'Done'
                                                };

                                                let activeClass = "";
                                                if (s === 'new') activeClass = "bg-blue-500 text-white shadow-lg shadow-blue-500/20";
                                                if (s === 'follow-up') activeClass = "bg-amber-500 text-white shadow-lg shadow-amber-500/20";
                                                if (s === 'pending') activeClass = "bg-purple-500 text-white shadow-lg shadow-purple-500/20";
                                                if (s === 'resolved') activeClass = "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20";

                                                return (
                                                    <button
                                                        key={s}
                                                        onClick={() => handleUpdateStatus(selectedFeedback.id, s)}
                                                        className={cn(
                                                            "w-full py-2.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border text-left flex items-center justify-between",
                                                            isActive ? activeClass : "bg-white text-slate-400 border-transparent hover:border-slate-200"
                                                        )}
                                                    >
                                                        {statusLabelsMap[s]}
                                                        {isActive && <CheckCircle2 className="w-3 h-3" />}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </section>

                                    <section>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Internal Priority</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {priorities.map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => handleUpdatePriority(selectedFeedback.id, p)}
                                                    className={cn(
                                                        "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                                                        selectedFeedback.priority === p
                                                            ? "bg-slate-900 text-white border-transparent"
                                                            : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:border-slate-200"
                                                    )}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Notes Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrative Notes</p>
                                        <button
                                            onClick={handleSaveNotes}
                                            disabled={isSavingNotes || localNotes === (selectedFeedback.admin_notes || '')}
                                            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            {isSavingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                            Save Notes
                                        </button>
                                    </div>
                                    <textarea
                                        value={localNotes}
                                        onChange={(e) => setLocalNotes(e.target.value)}
                                        placeholder="Record internal updates, meeting outcomes, or next steps..."
                                        className="w-full h-40 p-5 border border-slate-100 rounded-3xl bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 outline-none transition-all text-sm text-slate-600 placeholder:text-slate-300 resize-none leading-relaxed"
                                    />

                                    <div className="flex items-center gap-4 p-5 bg-indigo-50/40 rounded-3xl border border-indigo-100/50">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
                                            <MessageSquare className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800">Communication History</p>
                                            <p className="text-[11px] text-slate-500 font-medium">Link this feedback to a persistent message thread for auditability.</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[10px] font-black text-indigo-600 hover:bg-white/80 px-4 h-10 rounded-xl bg-white shadow-sm border border-indigo-50"
                                            onClick={() => window.location.href = '/admin/messages'}
                                        >
                                            Open Thread
                                        </Button>
                                    </div>
                                </section>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8 border border-slate-100">
                                <MessageSquare className="w-12 h-12 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Select an entry</h3>
                            <p className="text-slate-400 max-w-xs mt-2 font-medium">Choose a feedback report from the left to start the administrative triage flow.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
