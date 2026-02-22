'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, Send, Loader2, CheckCircle, MessageSquare } from 'lucide-react';
import { submitContactForm } from '@/app/actions/leads';
import { JsonLdOrganization } from '@/components/seo/JsonLd';

type FormState = 'idle' | 'submitting' | 'success';

export default function ContactPage() {
    const [state, setState] = useState<FormState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    // Anti-spam: render contact details client-side only
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    useEffect(() => {
        // Assemble from parts to prevent scraper extraction from SSR HTML
        setContactEmail(['info', '@', 'schologic', '.com'].join(''));
        setContactPhone(['+254', '108', '289', '977'].join(''));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        setState('submitting');

        const result = await submitContactForm({
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
        });

        if (result.error) {
            setError(result.error);
            setState('idle');
        } else {
            setState('success');
        }
    };

    return (
        <section className="pt-16 pb-24">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                        <MessageSquare className="w-3 h-3" /> Contact
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto">
                        Have a question, want a demo, or need a custom quote? We&apos;d love to hear from you.
                    </p>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
                    {/* Contact Form */}
                    <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-8">
                        {state === 'success' ? (
                            <div className="py-12 text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">Message Sent</h3>
                                <p className="text-slate-600 text-sm max-w-xs mx-auto">
                                    Thank you, {name}. We&apos;ve received your message and sent you a confirmation email. We&apos;ll get back to you within 2 business days.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-900 mb-1">Send us a message</h2>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            placeholder="John Doe"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                            required
                                            placeholder="you@example.com"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                        placeholder="e.g., Institutional pricing inquiry"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Message</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        rows={3}
                                        placeholder="Tell us how we can help..."
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-sm transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={state === 'submitting'}
                                    className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {state === 'submitting' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-900 text-sm mb-4">Contact Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                        <Mail className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Email</p>
                                        {contactEmail ? (
                                            <a
                                                href={`mailto:${contactEmail}`}
                                                className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                                            >
                                                {contactEmail}
                                            </a>
                                        ) : (
                                            <span className="text-sm text-slate-400">Loading...</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Phone</p>
                                        {contactPhone ? (
                                            <a
                                                href={`tel:${contactPhone}`}
                                                className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                                            >
                                                {contactPhone}
                                            </a>
                                        ) : (
                                            <span className="text-sm text-slate-400">Loading...</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6">
                            <h3 className="font-bold text-indigo-900 text-sm mb-2">Looking for a pilot?</h3>
                            <p className="text-xs text-indigo-700 mb-4">
                                If you&apos;re an institution interested in testing Schologic, our pilot program is free.
                            </p>
                            <a
                                href="/pricing"
                                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                View Pricing &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
