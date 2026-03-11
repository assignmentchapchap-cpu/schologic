'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Pencil, RefreshCw, Trash2, Search, Mail, ArrowLeft, CheckSquare } from 'lucide-react';
import { searchEmails, deleteDraft, bulkEmailAction } from '@/app/actions/adminEmails';
import { useDebounce } from 'use-debounce';
import { useEmailRealtime } from '../hooks/useEmailRealtime';
import ComposeModal from '../components/ComposeModal';

interface DraftRow {
    id: string;
    from_email: string;
    to_emails: string[];
    cc_emails: string[];
    bcc_emails: string[];
    subject: string;
    body_html: string;
    body_text: string | null;
    thread_id: string | null;
    created_at: string;
}

export default function DraftsPage() {
    const [drafts, setDrafts] = useState<DraftRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<DraftRow | null>(null);
    const [editing, setEditing] = useState<DraftRow | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [debouncedSearch] = useDebounce(search, 400);
    const [showMobileDetail, setShowMobileDetail] = useState(false);
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);

    const fetchDrafts = useCallback(async () => {
        setLoading(true);
        const result = await searchEmails(debouncedSearch, 'drafts', '', page);
        setDrafts(result.data as DraftRow[]);
        setTotal(result.total);
        setLoading(false);
    }, [debouncedSearch, page]);

    useEffect(() => { fetchDrafts(); }, [fetchDrafts]);
    useEffect(() => { setPage(1); }, [debouncedSearch]);

    // Supabase Realtime
    const handleRealtimeInsert = useCallback((newDraft: any) => {
        setDrafts(prev => [newDraft, ...prev]);
        setTotal(t => t + 1);
    }, []);
    const handleRealtimeUpdate = useCallback((updated: any) => {
        setDrafts(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
        if (selected?.id === updated.id) setSelected(prev => prev ? { ...prev, ...updated } : null);
    }, [selected?.id]);
    const handleRealtimeDelete = useCallback((id: string) => {
        setDrafts(prev => prev.filter(e => e.id !== id));
        setTotal(t => Math.max(0, t - 1));
        if (selected?.id === id) { setSelected(null); setShowMobileDetail(false); }
    }, [selected?.id]);
    useEmailRealtime('drafts', handleRealtimeInsert, handleRealtimeUpdate, handleRealtimeDelete);

    // Auto-select draft from universal search
    const searchParams = useSearchParams();
    useEffect(() => {
        const selectId = searchParams.get('select');
        if (selectId && drafts.length > 0 && !selected) {
            const match = drafts.find(d => d.id === selectId);
            if (match) handleSelect(match);
        }
    }, [drafts, searchParams]);

    async function handleDelete(id: string) {
        if (!confirm('Delete this draft?')) return;
        await deleteDraft(id);
        if (selected?.id === id) {
            setSelected(null);
            setShowMobileDetail(false);
        }
        setDrafts(prev => prev.filter(d => d.id !== id));
    }

    function handleSelect(draft: DraftRow) {
        setSelected(draft);
        setShowMobileDetail(true);
    }

    function toggleCheck(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        setCheckedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    function toggleCheckAll() {
        if (checkedIds.size === drafts.length) {
            setCheckedIds(new Set());
        } else {
            setCheckedIds(new Set(drafts.map(e => e.id)));
        }
    }

    async function handleBulkAction(action: 'delete') {
        if (checkedIds.size === 0) return;
        if (!confirm(`Delete ${checkedIds.size} draft${checkedIds.size > 1 ? 's' : ''}?`)) return;
        setBulkLoading(true);
        await bulkEmailAction(Array.from(checkedIds), action);
        setCheckedIds(new Set());
        setBulkLoading(false);
        fetchDrafts();
    }

    const totalPages = Math.ceil(total / 25);

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Pencil className="w-7 h-7 text-amber-600" />
                        Drafts
                    </h1>
                    <p className="text-slate-500 mt-1">{total} saved drafts</p>
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
                        onClick={fetchDrafts}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search drafts by subject..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                />
            </div>

            {/* Bulk Action Bar */}
            {checkedIds.size > 0 && (
                <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-sm font-bold text-slate-700">{checkedIds.size} selected</span>
                    <div className="flex items-center gap-2 ml-auto">
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
                {/* Draft List */}
                <div className={`w-full md:w-2/5 bg-white rounded-2xl border border-slate-200 overflow-hidden ${showMobileDetail ? 'hidden md:block' : ''}`}>
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
                        </div>
                    ) : drafts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Pencil className="w-10 h-10 mb-3" />
                            <p className="font-semibold">No drafts</p>
                            <p className="text-xs mt-1">Saved drafts will appear here</p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
                                {/* Select All header */}
                                {isSelecting && (
                                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50/50 border-b border-slate-100">
                                        <button onClick={toggleCheckAll} className="text-slate-400 hover:text-amber-500 transition-colors">
                                            {checkedIds.size === drafts.length && drafts.length > 0
                                                ? <CheckSquare className="w-4 h-4 text-amber-600" />
                                                : <span className="w-4 h-4 border-2 border-slate-300 rounded inline-block" />
                                            }
                                        </button>
                                        <span className="text-xs text-slate-400 font-medium">Select all</span>
                                    </div>
                                )}
                                {drafts.map(draft => (
                                    <div
                                        key={draft.id}
                                        className={`flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${selected?.id === draft.id ? 'bg-amber-50/50 border-l-2 border-amber-500' : ''}`}
                                    >
                                        {isSelecting && (
                                            <div role="checkbox" aria-checked={checkedIds.has(draft.id)} onClick={(e) => toggleCheck(draft.id, e)} className="text-slate-400 hover:text-amber-500 transition-colors cursor-pointer mr-3 mt-0.5">
                                                {checkedIds.has(draft.id)
                                                    ? <CheckSquare className="w-4 h-4 text-amber-600" />
                                                    : <span className="w-4 h-4 border-2 border-slate-300 rounded inline-block" />
                                                }
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleSelect(draft)}
                                            className="flex-1 text-left min-w-0"
                                        >
                                            <p className="text-sm font-semibold text-slate-700 truncate">
                                                {draft.subject || '(no subject)'}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5 truncate">
                                                To: {draft.to_emails?.join(', ') || '(no recipient)'}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Last edited: {new Date(draft.created_at).toLocaleString()}
                                            </p>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(draft.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-3"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
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

                {/* Draft Detail / Preview */}
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
                                    <span className="font-semibold text-slate-700">To:</span>
                                    {selected.to_emails?.join(', ') || '(no recipient)'}
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    Last edited: {new Date(selected.created_at).toLocaleString()}
                                </p>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Draft Preview</p>
                                {selected.body_html ? (
                                    <div
                                        className="prose prose-sm max-w-none border border-slate-200 rounded-xl p-4 bg-slate-50/50"
                                        dangerouslySetInnerHTML={{ __html: selected.body_html }}
                                    />
                                ) : (
                                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                                        {selected.body_text || '(empty draft)'}
                                    </pre>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                                <button
                                    onClick={() => setEditing(selected)}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                                >
                                    Edit Draft
                                </button>
                                <button
                                    onClick={() => handleDelete(selected.id)}
                                    className="px-4 py-2 text-red-500 text-sm font-semibold hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                            <Mail className="w-12 h-12 mb-3" />
                            <p className="font-semibold">Select a draft</p>
                            <p className="text-xs mt-1">Click on a draft to preview or edit it</p>
                        </div>
                    )}
                </div>
            </div>

            {editing && (
                <ComposeModal
                    draft={editing}
                    onClose={() => setEditing(null)}
                    onSent={fetchDrafts}
                />
            )}
        </>
    );
}
