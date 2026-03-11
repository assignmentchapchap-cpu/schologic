'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { Pencil, RefreshCw, Trash2, Search, Mail, ArrowLeft, CheckSquare, Sparkles, Send } from 'lucide-react';
import { searchEmails, deleteDraft, bulkEmailAction, regenerateDraft, approveAndScheduleDrafts } from '@/app/actions/adminEmails';
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
    status: string;
    scheduled_at: string | null;
    ai_generated_from_template_id: string | null;
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

    // AI & Scheduling state
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [regenerationNote, setRegenerationNote] = useState('');

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

    // Auto-select draft from universal search via URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const selectId = params.get('select');
            if (selectId && drafts.length > 0 && !selected) {
                const match = drafts.find(d => d.id === selectId);
                if (match) handleSelect(match);
            }
        }
    }, [drafts, selected]);

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

    async function handleRegenerate() {
        if (!selected) return;
        setRegeneratingId(selected.id);
        const res = await regenerateDraft(selected.id, regenerationNote);
        if (res.error) {
            alert(res.error);
        } else {
            setRegenerationNote('');
            fetchDrafts();
        }
        setRegeneratingId(null);
    }

    async function handleApproveSchedule(isBulk = false) {
        const ids = isBulk ? Array.from(checkedIds) : [selected!.id];
        if (ids.length === 0) return;

        const staggerStr = prompt(`Schedule ${ids.length} email(s) starting now?\nEnter delay between emails in minutes (0 for no delay):`, '0');
        if (staggerStr === null) return;

        const stagger = parseInt(staggerStr, 10) || 0;

        setBulkLoading(true);
        const res = await approveAndScheduleDrafts(ids, new Date().toISOString(), stagger);
        setBulkLoading(false);

        if (res.error) {
            alert(res.error);
        } else {
            if (isBulk) setCheckedIds(new Set());
            if (!isBulk && selected) {
                const updated = { ...selected, status: 'scheduled', scheduled_at: new Date().toISOString() };
                setSelected(updated);
            }
            fetchDrafts();
        }
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
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search drafts by subject..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors shadow-sm"
                />
            </div>

            {/* Bulk Action Bar */}
            {checkedIds.size > 0 && (
                <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
                    <span className="text-sm font-bold text-slate-700">{checkedIds.size} selected</span>
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={() => handleApproveSchedule(true)}
                            disabled={bulkLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                        >
                            <Send className="w-3.5 h-3.5" /> Approve & Schedule
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
                                            <p className="text-sm font-semibold text-slate-700 truncate flex items-center gap-2">
                                                {draft.subject || '(no subject)'}
                                                {draft.status === 'scheduled' && (
                                                    <span className="shrink-0 bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold">SCHED</span>
                                                )}
                                                {draft.ai_generated_from_template_id && (
                                                    <span className="shrink-0 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold">AI</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5 truncate">
                                                To: {draft.to_emails?.join(', ') || '(no recipient)'}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {draft.status === 'scheduled' && draft.scheduled_at
                                                    ? `Scheduled: ${new Date(draft.scheduled_at).toLocaleString()}`
                                                    : `Last edited: ${new Date(draft.created_at).toLocaleString()}`
                                                }
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
                                <h2 className="text-xl font-bold text-slate-900 mb-2 flex flex-wrap items-center gap-2">
                                    {selected.subject || '(no subject)'}
                                    {selected.status === 'scheduled' && (
                                        <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-bold tracking-wide uppercase">Scheduled</span>
                                    )}
                                    {selected.ai_generated_from_template_id && (
                                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold tracking-wide uppercase flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> AI Generated
                                        </span>
                                    )}
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                    <span className="font-semibold text-slate-700">To:</span>
                                    {selected.to_emails?.join(', ') || '(no recipient)'}
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    {selected.status === 'scheduled' && selected.scheduled_at
                                        ? `Scheduled to send on: ${new Date(selected.scheduled_at).toLocaleString()}`
                                        : `Last edited: ${new Date(selected.created_at).toLocaleString()}`
                                    }
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

                            {/* AI Regeneration Panel */}
                            {selected.ai_generated_from_template_id && selected.status === 'draft' && (
                                <div className="mt-6 p-4 border border-amber-200 bg-amber-50/50 rounded-xl">
                                    <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4" /> AI Regeneration</h4>
                                    <p className="text-xs text-amber-700 mb-3">Provide feedback to tweak this draft.</p>
                                    <textarea
                                        value={regenerationNote}
                                        onChange={e => setRegenerationNote(e.target.value)}
                                        placeholder="e.g. Make it shorter, focus more on ROI..."
                                        className="w-full p-2.5 text-sm rounded-lg border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 mb-3"
                                        rows={2}
                                    />
                                    <button
                                        onClick={handleRegenerate}
                                        disabled={regeneratingId === selected.id}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${regeneratingId === selected.id ? 'animate-spin' : ''}`} />
                                        {regeneratingId === selected.id ? 'Regenerating...' : 'Regenerate Draft'}
                                    </button>
                                </div>
                            )}

                            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
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
                                {selected.status === 'draft' && (
                                    <button
                                        onClick={() => handleApproveSchedule(false)}
                                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                        Approve & Schedule
                                    </button>
                                )}
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
