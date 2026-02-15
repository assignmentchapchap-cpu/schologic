'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle, Send, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { submitDemoInvite, ShareDemoData } from '@/app/actions/leads';

interface Props {
    onClose: () => void;
}

type FormState = 'filling' | 'submitting' | 'success';

export default function ShareDemoModal({ onClose }: Props) {
    const [state, setState] = useState<FormState>('filling');
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [senderName, setSenderName] = useState('');
    const [senderEmail, setSenderEmail] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setState('submitting');

        const data: ShareDemoData = {
            senderName,
            senderEmail,
            recipientName,
            recipientEmail,
            recipientPhone,
            message: message || undefined
        };

        const result = await submitDemoInvite(data);

        if (result.error) {
            setError(result.error);
            setState('filling');
        } else {
            setState('success');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 font-serif leading-tight">Share Demo</h2>
                            <p className="text-xs text-slate-500 font-medium">Invite an instructor or colleague</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                    {state === 'success' ? (
                        <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-serif">Invitation Sent!</h3>
                            <p className="text-slate-600 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                                Thank you, {senderName}. We've sent an invitation to {recipientName} and a confirmation copy to you.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-in shake duration-300">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Details (Sender)</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={senderName}
                                                    onChange={(e) => setSenderName(e.target.value)}
                                                    placeholder="Your Name"
                                                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={senderEmail}
                                                    onChange={(e) => setSenderEmail(e.target.value)}
                                                    placeholder="Your Email"
                                                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Recipient Details</h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={recipientName}
                                                    onChange={(e) => setRecipientName(e.target.value)}
                                                    placeholder="Their Name"
                                                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    required
                                                    value={recipientPhone}
                                                    onChange={(e) => setRecipientPhone(e.target.value)}
                                                    placeholder="Phone Number"
                                                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                required
                                                value={recipientEmail}
                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                                placeholder="Their Email"
                                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Personal Message <span className="text-slate-300 font-normal normal-case">(Optional)</span></label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={2}
                                            placeholder="Hey, check out this grading tool..."
                                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={state === 'submitting'}
                                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {state === 'submitting' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Invite <Send className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
