'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyLogAction } from '../../actions/practicum';

export function VerificationForm({ token }: { token: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAction = (decision: 'verified' | 'rejected') => {
        if (!comment.trim()) {
            setError("Please provide a comment or feedback.");
            return;
        }
        setError(null);

        startTransition(async () => {
            const result = await verifyLogAction(token, decision, comment);
            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || "Failed to process verification.");
            }
        });
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Supervisor Action</h3>
            <p className="text-slate-500 mb-6 text-sm">Please review the log details above. Provide a confidential comment for the instructor and select an action.</p>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Confidential Comment / Feedback</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="e.g., Confirmed, the student performed these tasks well..."
                        className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-700 min-h-[120px] resize-none text-sm"
                        disabled={isPending}
                    />
                    {error && <div className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1"><XCircle className="w-3 h-3" /> {error}</div>}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                        onClick={() => handleAction('rejected')}
                        disabled={isPending}
                        className="px-6 py-4 rounded-xl border border-red-100 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <XCircle className="w-5 h-5" />
                        Reject Log
                    </button>
                    <button
                        onClick={() => handleAction('verified')}
                        disabled={isPending}
                        className="px-6 py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        {isPending ? 'Processing...' : 'Verify Log'}
                    </button>
                </div>
                <p className="text-center text-xs text-slate-400 pt-2">
                    Your decision is final and will be recorded securely.
                </p>
            </div>
        </div>
    );
}
