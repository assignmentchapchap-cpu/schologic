'use client';

import { useState, useEffect } from 'react';
import { X, Send, Save, ChevronDown } from 'lucide-react';
import { sendEmail, saveDraft, getTemplates, renderTemplate } from '@/app/actions/adminEmails';
import { SENDER_IDENTITIES } from '../constants';

interface ComposeModalProps {
    onClose: () => void;
    onSent?: () => void;
    replyTo?: {
        to: string[];
        subject: string;
        threadId: string;
    };
    draft?: {
        id: string;
        from_email: string;
        to_emails: string[];
        cc_emails: string[];
        bcc_emails: string[];
        subject: string;
        body_html: string;
        thread_id: string | null;
    };
}

interface Template {
    id: string;
    name: string;
    subject: string;
    content_html: string;
    variables: string[];
    category: string | null;
}

export default function ComposeModal({ onClose, onSent, replyTo, draft }: ComposeModalProps) {
    const [from, setFrom] = useState(draft?.from_email || SENDER_IDENTITIES[0].value);
    const [to, setTo] = useState(draft?.to_emails?.join(', ') || replyTo?.to?.join(', ') || '');
    const [cc, setCc] = useState(draft?.cc_emails?.join(', ') || '');
    const [bcc, setBcc] = useState(draft?.bcc_emails?.join(', ') || '');
    const [subject, setSubject] = useState(draft?.subject || replyTo?.subject || '');
    const [html, setHtml] = useState(draft?.body_html || '');
    const [showCc, setShowCc] = useState(!!(draft?.cc_emails?.length || draft?.bcc_emails?.length));
    const [sending, setSending] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Template state
    const [templates, setTemplates] = useState<Template[]>([]);
    const [showTemplates, setShowTemplates] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    async function loadTemplates() {
        const result = await getTemplates();
        if (result.data) setTemplates(result.data as Template[]);
    }

    async function handleSend() {
        if (!to.trim()) { setError('Recipient is required'); return; }
        setSending(true);
        setError('');

        const result = await sendEmail({
            from,
            to: to.split(',').map(s => s.trim()).filter(Boolean),
            cc: cc ? cc.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            bcc: bcc ? bcc.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            subject,
            html: html || '<p></p>',
            threadId: replyTo?.threadId || draft?.thread_id || undefined,
        });

        setSending(false);
        if (result.error) {
            setError(result.error);
        } else {
            onSent?.();
            onClose();
        }
    }

    async function handleSaveDraft() {
        setSaving(true);
        const result = await saveDraft({
            id: draft?.id,
            from,
            to: to.split(',').map(s => s.trim()).filter(Boolean),
            cc: cc ? cc.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            bcc: bcc ? bcc.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            subject,
            html,
            threadId: replyTo?.threadId || draft?.thread_id || undefined,
        });
        setSaving(false);
        if (!result.error) onClose();
    }

    async function handleTemplateSelect(template: Template) {
        setShowTemplates(false);

        if (template.variables.length === 0) {
            setSubject(template.subject);
            setHtml(template.content_html);
        } else {
            // For templates with variables, insert as-is (user will fill in manually for now)
            setSubject(template.subject);
            setHtml(template.content_html);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-t-2xl md:rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">
                        {replyTo ? 'Reply' : draft ? 'Edit Draft' : 'New Email'}
                    </h2>
                    <div className="flex items-center gap-2">
                        {/* Template selector */}
                        {templates.length > 0 && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowTemplates(!showTemplates)}
                                    className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1"
                                >
                                    Templates <ChevronDown className="w-3 h-3" />
                                </button>
                                {showTemplates && (
                                    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-10 py-1 max-h-48 overflow-y-auto">
                                        {templates.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => handleTemplateSelect(t)}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                                            >
                                                <span className="font-medium text-slate-800">{t.name}</span>
                                                {t.category && (
                                                    <span className="ml-2 text-[10px] uppercase font-bold text-slate-400">{t.category}</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {/* From */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-slate-500 w-12 shrink-0">From</label>
                        <select
                            value={from}
                            onChange={e => setFrom(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            {SENDER_IDENTITIES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* To */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-slate-500 w-12 shrink-0">To</label>
                        <input
                            type="text"
                            value={to}
                            onChange={e => setTo(e.target.value)}
                            placeholder="recipient@example.com"
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        {!showCc && (
                            <button onClick={() => setShowCc(true)} className="text-xs font-semibold text-indigo-500 hover:text-indigo-700">
                                Cc/Bcc
                            </button>
                        )}
                    </div>

                    {/* CC/BCC */}
                    {showCc && (
                        <>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-semibold text-slate-500 w-12 shrink-0">Cc</label>
                                <input
                                    type="text"
                                    value={cc}
                                    onChange={e => setCc(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-semibold text-slate-500 w-12 shrink-0">Bcc</label>
                                <input
                                    type="text"
                                    value={bcc}
                                    onChange={e => setBcc(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </>
                    )}

                    {/* Subject */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-slate-500 w-12 shrink-0">Subj</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="Subject"
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    {/* Body */}
                    <textarea
                        value={html}
                        onChange={e => setHtml(e.target.value)}
                        placeholder="Write your email..."
                        rows={12}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    />

                    {error && (
                        <p className="text-sm text-red-500 font-medium">{error}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                    <button
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                        {sending ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}
