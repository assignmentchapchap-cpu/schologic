'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from "@schologic/database";
import { useToast } from '@/context/ToastContext';
import { upgradeDemoAccount } from '@/app/actions/account';

interface UpgradeAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UpgradeAccountModal({ isOpen, onClose }: UpgradeAccountModalProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const router = useRouter();
    const { showToast } = useToast();
    const supabase = createClient();

    useEffect(() => {
        if (isOpen) {
            const fetchUser = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.email) {
                    setEmail(user.email);
                }
            };
            fetchUser();
        }
    }, [isOpen]);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            // 1. Call Server Action to Wipe Data & Update Role
            const res = await upgradeDemoAccount(email);

            if (res.error) {
                throw new Error(res.error);
            }

            // 2. Trigger Standard Password Reset (OTP)
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/instructor/settings`,
            });

            if (resetError) throw resetError;

            // 3. Sign Out & Redirect
            await supabase.auth.signOut();

            showToast('Upgrade initiated! Please check your email for the code.', 'success');
            router.push(`/login?view=reset&email=${encodeURIComponent(email)}`);
            onClose();

        } catch (error: any) {
            console.error("Upgrade Error:", error);
            showToast(error.message || 'Failed to start upgrade process', 'error');
        } finally {
            setLoading(false);
            setConfirming(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-100">

                {/* Header Gradient */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <Sparkles className="w-7 h-7 text-orange-500" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Upgrade to Standard Account</h2>
                    <p className="text-slate-500 text-sm text-center mb-8 leading-relaxed">
                        Ready to make this workspace your own? We'll wipe the demo data and set you up with a clean, permanent account.
                    </p>

                    {!confirming ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Confirm Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium text-slate-800"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 items-start">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-800">
                                    <span className="font-bold block mb-1">Warning: Data Wipe</span>
                                    Proceeding will permanently delete all demo classes, students, and submissions. This action cannot be undone.
                                </div>
                            </div>

                            <button
                                onClick={() => setConfirming(true)}
                                disabled={loading || !email}
                                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                            >
                                Continue to Upgrade
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                            <div className="bg-slate-50 rounded-xl p-6 text-center border dashed border-slate-200">
                                <p className="text-sm font-medium text-slate-600 mb-1">Email will be set to:</p>
                                <p className="text-lg font-bold text-slate-900">{email}</p>
                            </div>

                            <button
                                onClick={handleUpgrade}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3.5 rounded-xl hover:shadow-orange-200 hover:shadow-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                Confirm & Upgrade
                            </button>

                            <button
                                onClick={() => setConfirming(false)}
                                disabled={loading}
                                className="w-full py-2 text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
