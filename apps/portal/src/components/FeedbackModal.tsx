'use client';

import { useState } from 'react';
import { createClient } from "@schologic/database";
import { X, Send, CheckCircle2, AlertCircle, Loader2, Volume2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const { user } = useUser();
    const supabase = createClient();
    const [content, setContent] = useState('');
    const [type, setType] = useState<'general' | 'bug' | 'feature'>('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const { error: submitError } = await supabase.from('feedback').insert({
                user_id: user.id,
                content: content.trim(),
                type: type,
                status: 'pending'
            });

            if (submitError) throw submitError;

            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setContent('');
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                            <Volume2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">Feedback</h3>
                            <p className="text-slate-500 text-xs">Help us improve Schologic</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6">
                    {isSuccess ? (
                        <div className="py-8 text-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h3>
                            <p className="text-slate-500 text-sm">Your feedback has been submitted successfully.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm animate-in shake-in duration-300">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Feedback Category</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['general', 'bug', 'feature'] as const).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t)}
                                            className={cn(
                                                "py-2.5 px-2 rounded-xl text-[11px] font-bold capitalize transition-all border-2",
                                                type === t
                                                    ? "bg-amber-50 border-amber-500 text-amber-600"
                                                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="feedback-content" className="block text-xs font-bold text-slate-500 uppercase mb-2">Details</label>
                                <textarea
                                    id="feedback-content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Tell us what's on your mind..."
                                    className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none text-[13px] text-slate-700 placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !content.trim()}
                                    className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <span>Send Feedback</span>
                                            <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
