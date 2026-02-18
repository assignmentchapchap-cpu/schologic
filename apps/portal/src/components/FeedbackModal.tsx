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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Volume2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Feedback</h2>
                            <p className="text-indigo-100 text-xs">Help us improve Schologic LMS</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {isSuccess ? (
                        <div className="py-8 text-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h3>
                            <p className="text-slate-500">Your feedback has been submitted successfully. We appreciate your input!</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm animate-in shake-in duration-300">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">What kind of feedback is this?</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['general', 'bug', 'feature'] as const).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t)}
                                            className={cn(
                                                "py-3 px-4 rounded-2xl text-xs font-bold capitalize transition-all border-2",
                                                type === t
                                                    ? "bg-indigo-50 border-indigo-600 text-indigo-600"
                                                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="feedback-content" className="block text-sm font-bold text-slate-700 mb-3">Details</label>
                                <textarea
                                    id="feedback-content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Tell us what's on your mind..."
                                    className="w-full h-40 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none text-slate-800 placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || !content.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 h-14 rounded-2xl text-lg font-bold group"
                                rightIcon={isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            >
                                {isSubmitting ? 'Submitting...' : 'Send Feedback'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
