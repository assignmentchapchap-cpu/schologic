'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Inbox as InboxIcon, RefreshCw, Search, Mail, Filter, ArrowLeft, CheckSquare, Eye, EyeOff, Trash2 } from 'lucide-react';
import { searchEmails, markEmailAsRead, bulkEmailAction } from '@/app/actions/adminEmails';
import { useDebounce } from 'use-debounce';
import { useEmailRealtime } from '../hooks/useEmailRealtime';
import ComposeModal from '../components/ComposeModal';

interface EmailRow {
    id: string;
    from_email: string;
    to_emails: string[];
    subject: string;
    body_text: string | null;
    body_html: string | null;
    status: string;
    is_read: boolean;
    created_at: string;
    thread_id: string | null;
    attachments_jsonb?: { filename: string; storage_path: string }[] | null;
}

const READ_FILTERS = [
    { value: '', label: 'All Mail' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
];

export default function InboxPage() {
    const [emails, setEmails] = useState<EmailRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<EmailRow | null>(null);
    const [search, setSearch] = useState('');
    const [readFilter, setReadFilter] = useState('');
    const [page, setPage] = useState(1);
    const [showCompose, setShowCompose] = useState(false);
    const [debouncedSearch] = useDebounce(search, 400);
    const [showMobileDetail, setShowMobileDetail] = useState(false);
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);

    const fetchEmails = useCallback(async () => {
        setLoading(true);
        const result = await searchEmails(debouncedSearch, 'inbox', readFilter, page);
        setEmails(result.data as EmailRow[]);
        setTotal(result.total);
        setLoading(false);
    }, [debouncedSearch, readFilter, page]);

    useEffect(() => { fetchEmails(); }, [fetchEmails]);
    useEffect(() => { setPage(1); }, [debouncedSearch, readFilter]);

    // Supabase Realtime
    const handleRealtimeInsert = useCallback((newEmail: any) => {
        setEmails(prev => [newEmail, ...prev]);
        setTotal(t => t + 1);
    }, []);
    const handleRealtimeUpdate = useCallback((updated: any) => {
        setEmails(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
        if (selected?.id === updated.id) setSelected(prev => prev ? { ...prev, ...updated } : null);
    }, [selected?.id]);
    const handleRealtimeDelete = useCallback((id: string) => {
        setEmails(prev => prev.filter(e => e.id !== id));
        setTotal(t => Math.max(0, t - 1));
        if (selected?.id === id) { setSelected(null); setShowMobileDetail(false); }
    }, [selected?.id]);
    useEmailRealtime('inbox', handleRealtimeInsert, handleRealtimeUpdate, handleRealtimeDelete);

    // Auto-select email from universal search
    const searchParams = useSearchParams();
    useEffect(() => {
        const selectId = searchParams.get('select');
        if (selectId && emails.length > 0 && !selected) {
            const match = emails.find(e => e.id === selectId);
            if (match) handleSelect(match);
        }
    }, [emails, searchParams]);

    async function handleSelect(email: EmailRow) {
        setSelected(email);
        setShowMobileDetail(true);
        if (!email.is_read) {
            await markEmailAsRead(email.id);
            setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_read: true } : e));
        }
    }

    const unreadCount = emails.filter(e => !e.is_read).length;
    const totalPages = Math.ceil(total / 25);

    function toggleCheck(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        setCheckedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    function toggleCheckAll() {
        if (checkedIds.size === emails.length) {
            setCheckedIds(new Set());
        } else {
            setCheckedIds(new Set(emails.map(e => e.id)));
        }
    }

    async function handleBulkAction(action: 'markRead' | 'markUnread' | 'delete') {
        if (checkedIds.size === 0) return;
        setBulkLoading(true);
        await bulkEmailAction(Array.from(checkedIds), action);
        setCheckedIds(new Set());
        setBulkLoading(false);
        fetchEmails();
    }

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <InboxIcon className="w-7 h-7 text-indigo-600" />
                        Inbox
                        {unreadCount > 0 && (
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 mt-1">{total} emails received</p>
                </div>
                <div className="flex items-center gap-3 mt-3 md:mt-0">
                    <button
                        onClick={() => {
                            if (isSelecting) {
                                setCheckedIds(new Set());
                            }
                            setIsSelecting(!isSelecting);
                        }}
                        className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm ${isSelecting
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {isSelecting ? 'Cancel' : 'Select'}
                    </button>
                    <button
                        onClick={() => setShowCompose(true)}
                        className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        Compose
                    </button>
                    <button
                        onClick={fetchEmails}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by subject or sender..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                    />
                </div>
                <div className="relative w-full sm:w-44">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={readFilter}
                        onChange={e => setReadFilter(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none bg-white"
                    >
                        {READ_FILTERS.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {checkedIds.size > 0 && (
                <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <span className="text-sm font-bold text-indigo-700">{checkedIds.size} selected</span>
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={() => handleBulkAction('markRead')}
                            disabled={bulkLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            <Eye className="w-3.5 h-3.5" /> Mark Read
                        </button>
                        <button
                            onClick={() => handleBulkAction('markUnread')}
                            disabled={bulkLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            <EyeOff className="w-3.5 h-3.5" /> Mark Unread
                        </button>
                        <button
                            onClick={() => handleBulkAction('delete')}
                            disabled={bulkLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Two-pane layout */}
            <div className="flex gap-4 min-h-[600px]">
                {/* Email List */}
                <div className={`w-full md:w-2/5 bg-white rounded-2xl border border-slate-200 overflow-hidden ${showMobileDetail ? 'hidden md:block' : ''}`}>
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
                        </div>
                    ) : emails.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <InboxIcon className="w-10 h-10 mb-3" />
                            <p className="font-semibold">No emails yet</p>
                            <p className="text-xs mt-1">Incoming emails will appear here</p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
                                {/* Select All header */}
                                {isSelecting && (
                                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50/50 border-b border-slate-100">
                                        <button onClick={toggleCheckAll} className="text-slate-400 hover:text-indigo-500 transition-colors">
                                            {checkedIds.size === emails.length && emails.length > 0
                                                ? <CheckSquare className="w-4 h-4 text-indigo-500" />
                                                : <span className="w-4 h-4 border-2 border-slate-300 rounded inline-block" />
                                            }
                                        </button>
                                        <span className="text-xs text-slate-400 font-medium">Select all</span>
                                    </div>
                                )}
                                {emails.map(email => (
                                    <button
                                        key={email.id}
                                        onClick={() => handleSelect(email)}
                                        className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors ${selected?.id === email.id ? 'bg-indigo-50/50 border-l-2 border-indigo-500' : ''
                                            } ${!email.is_read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {isSelecting && (
                                                <div role="checkbox" aria-checked={checkedIds.has(email.id)} onClick={(e) => toggleCheck(email.id, e)} className="mt-0.5 text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer">
                                                    {checkedIds.has(email.id)
                                                        ? <CheckSquare className="w-4 h-4 text-indigo-500" />
                                                        : <span className="w-4 h-4 border-2 border-slate-300 rounded inline-block" />
                                                    }
                                                </div>
                                            )}
                                            <div className="mt-0.5">
                                                {email.is_read
                                                    ? <Mail className="w-4 h-4 text-slate-300" />
                                                    : <Mail className="w-4 h-4 text-indigo-500" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm truncate ${!email.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                    {email.from_email}
                                                </p>
                                                <p className={`text-sm truncate mt-0.5 ${!email.is_read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                                    {email.subject || '(no subject)'}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {new Date(email.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-30"
                                    >
                                        ← Previous
                                    </button>
                                    <span className="text-xs text-slate-400">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-30"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Email Detail */}
                <div className={`flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden ${showMobileDetail ? 'block' : 'hidden md:block'}`}>
                    {selected ? (
                        <div className="p-6 overflow-y-auto max-h-[600px]">
                            {/* Mobile back button */}
                            <button
                                onClick={() => { setShowMobileDetail(false); setSelected(null); }}
                                className="md:hidden flex items-center gap-1 text-sm font-semibold text-indigo-600 mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to list
                            </button>

                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-2">{selected.subject || '(no subject)'}</h2>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                    <span className="font-semibold text-slate-700">From:</span>
                                    {selected.from_email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                    <span className="font-semibold text-slate-700">To:</span>
                                    {selected.to_emails?.join(', ')}
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    {new Date(selected.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="border-t border-slate-100 pt-4">
                                {selected.body_html ? (
                                    <div
                                        className="prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selected.body_html }}
                                    />
                                ) : (
                                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                                        {selected.body_text || '(empty)'}
                                    </pre>
                                )}
                            </div>
                            {selected.attachments_jsonb && selected.attachments_jsonb.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100 pb-2">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attachments</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selected.attachments_jsonb.map((att, i) => (
                                            <a
                                                key={i}
                                                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${att.storage_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors max-w-[200px]"
                                            >
                                                <span className="truncate flex-1 font-medium">{att.filename}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => setShowCompose(true)}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                            <Mail className="w-12 h-12 mb-3" />
                            <p className="font-semibold">Select an email</p>
                            <p className="text-xs mt-1">Click on an email to read it</p>
                        </div>
                    )}
                </div>
            </div>

            {showCompose && (
                <ComposeModal
                    onClose={() => setShowCompose(false)}
                    onSent={fetchEmails}
                    replyTo={selected ? {
                        to: [selected.from_email],
                        subject: `Re: ${selected.subject}`,
                        threadId: selected.thread_id || selected.id,
                    } : undefined}
                />
            )}
        </>
    );
}
