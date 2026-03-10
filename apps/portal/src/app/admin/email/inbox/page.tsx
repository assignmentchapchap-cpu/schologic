'use client';

import { useEffect, useState } from 'react';
import { Inbox as InboxIcon, RefreshCw, Search, Mail } from 'lucide-react';
import { getEmails, markEmailAsRead } from '@/app/actions/adminEmails';
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

export default function InboxPage() {
    const [emails, setEmails] = useState<EmailRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<EmailRow | null>(null);
    const [search, setSearch] = useState('');
    const [showCompose, setShowCompose] = useState(false);

    useEffect(() => {
        fetchEmails();
    }, []);

    async function fetchEmails() {
        setLoading(true);
        const result = await getEmails('inbox');
        setEmails(result.data as EmailRow[]);
        setTotal(result.total);
        setLoading(false);
    }

    async function handleSelect(email: EmailRow) {
        setSelected(email);
        if (!email.is_read) {
            await markEmailAsRead(email.id);
            setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_read: true } : e));
        }
    }

    const filtered = search
        ? emails.filter(e =>
            e.subject.toLowerCase().includes(search.toLowerCase()) ||
            e.from_email.toLowerCase().includes(search.toLowerCase())
        )
        : emails;

    const unreadCount = emails.filter(e => !e.is_read).length;

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

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by subject or sender..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                />
            </div>

            {/* Two-pane layout */}
            <div className="flex gap-4 min-h-[600px]">
                {/* Email List */}
                <div className="w-full md:w-2/5 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <InboxIcon className="w-10 h-10 mb-3" />
                            <p className="font-semibold">No emails yet</p>
                            <p className="text-xs mt-1">Incoming emails will appear here</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                            {filtered.map(email => (
                                <button
                                    key={email.id}
                                    onClick={() => handleSelect(email)}
                                    className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors ${selected?.id === email.id ? 'bg-indigo-50/50 border-l-2 border-indigo-500' : ''
                                        } ${!email.is_read ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
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
                    )}
                </div>

                {/* Email Detail */}
                <div className="hidden md:block flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    {selected ? (
                        <div className="p-6 overflow-y-auto max-h-[600px]">
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
