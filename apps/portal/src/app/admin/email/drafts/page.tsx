'use client';

import { useEffect, useState } from 'react';
import { Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { getEmails, deleteDraft } from '@/app/actions/adminEmails';
import ComposeModal from '../components/ComposeModal';

interface DraftRow {
    id: string;
    from_email: string;
    to_emails: string[];
    cc_emails: string[];
    bcc_emails: string[];
    subject: string;
    body_html: string;
    thread_id: string | null;
    created_at: string;
}

export default function DraftsPage() {
    const [drafts, setDrafts] = useState<DraftRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<DraftRow | null>(null);

    useEffect(() => { fetchDrafts(); }, []);

    async function fetchDrafts() {
        setLoading(true);
        const result = await getEmails('drafts');
        setDrafts(result.data as DraftRow[]);
        setTotal(result.total);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this draft?')) return;
        await deleteDraft(id);
        setDrafts(prev => prev.filter(d => d.id !== id));
    }

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
                <button
                    onClick={fetchDrafts}
                    className="mt-3 md:mt-0 flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
                    <div className="divide-y divide-slate-100">
                        {drafts.map(draft => (
                            <div
                                key={draft.id}
                                className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors"
                            >
                                <button
                                    onClick={() => setEditing(draft)}
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
                )}
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
