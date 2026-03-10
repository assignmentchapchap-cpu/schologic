'use client';

import { useEffect, useState } from 'react';
import { Send, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Eye } from 'lucide-react';
import { getEmails } from '@/app/actions/adminEmails';

interface EmailRow {
    id: string;
    from_email: string;
    to_emails: string[];
    subject: string;
    status: string;
    metadata_jsonb: Record<string, any> | null;
    created_at: string;
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    sent: { icon: Clock, color: 'text-blue-500 bg-blue-50', label: 'Sent' },
    delivered: { icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50', label: 'Delivered' },
    bounced: { icon: XCircle, color: 'text-red-500 bg-red-50', label: 'Bounced' },
    complained: { icon: AlertTriangle, color: 'text-amber-500 bg-amber-50', label: 'Complained' },
    delayed: { icon: Clock, color: 'text-orange-500 bg-orange-50', label: 'Delayed' },
    suppressed: { icon: XCircle, color: 'text-slate-500 bg-slate-50', label: 'Suppressed' },
    failed: { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Failed' },
    scheduled: { icon: Clock, color: 'text-cyan-500 bg-cyan-50', label: 'Scheduled' },
};

export default function SentPage() {
    const [emails, setEmails] = useState<EmailRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchEmails(); }, []);

    async function fetchEmails() {
        setLoading(true);
        const result = await getEmails('sent');
        setEmails(result.data as EmailRow[]);
        setTotal(result.total);
        setLoading(false);
    }

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Send className="w-7 h-7 text-emerald-600" />
                        Sent Items
                    </h1>
                    <p className="text-slate-500 mt-1">{total} emails sent</p>
                </div>
                <button
                    onClick={fetchEmails}
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
                ) : emails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Send className="w-10 h-10 mb-3" />
                        <p className="font-semibold">No sent emails</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-4 py-3 font-semibold text-slate-500">To</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-500">Subject</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-500">Status</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-500">Tracking</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-500">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {emails.map(email => {
                                // Fallback to 'sent' if status is unknown, but format the label correctly
                                const statusInfo = STATUS_CONFIG[email.status] || {
                                    icon: Clock,
                                    color: 'text-slate-500 bg-slate-50',
                                    label: email.status.charAt(0).toUpperCase() + email.status.slice(1).replace('_', ' ')
                                };
                                const StatusIcon = statusInfo.icon;
                                const meta = email.metadata_jsonb || {};

                                return (
                                    <tr key={email.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-700 max-w-[200px] truncate">
                                            {email.to_emails?.join(', ')}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 max-w-[300px] truncate">
                                            {email.subject || '(no subject)'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                {meta.open_count > 0 && (
                                                    <span className="flex items-center gap-1 text-indigo-500 font-semibold">
                                                        <Eye className="w-3.5 h-3.5" /> {meta.open_count}
                                                    </span>
                                                )}
                                                {meta.click_count > 0 && (
                                                    <span className="flex items-center gap-1 text-violet-500 font-semibold">
                                                        <span className="w-3.5 h-3.5 inline-flex items-center justify-center font-bold">C</span> {meta.click_count}
                                                    </span>
                                                )}
                                                {!meta.open_count && !meta.click_count && '—'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                                            {new Date(email.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
