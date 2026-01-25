
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@schologic/database";
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import DemoSignupModal from '@/components/auth/DemoSignupModal';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [isSignUp, setIsSignUp] = useState(false);
    const [isReset, setIsReset] = useState(false); // Toggle for password reset
    const [showDemoModal, setShowDemoModal] = useState(false);

    // Auth Fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const supabase = createClient();

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            if (isReset) {
                // Password Reset Flow
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/callback?next=/instructor/settings`, // Redirect to settings to enter new password
                });
                if (resetError) throw resetError;
                setSuccessMsg('Check your email for the password reset link.');
                return; // Stop here
            }

            if (isSignUp) {
                // Sign Up Flow
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                            full_name: `${firstName} ${lastName}`.trim(),
                            role: 'instructor'
                        }
                    }
                });

                if (signUpError) throw signUpError;

                if (data.user && data.user.identities && data.user.identities.length === 0) {
                    throw new Error('This email is already registered. Please sign in instead.');
                }

                setSuccessMsg('Account created! Please check your email to confirm your account.');
            } else {
                // Sign In Flow
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;

                // Success
                router.push('/instructor/dashboard');
                router.refresh();
            }
        } catch (err: unknown) {
            console.error('Auth error:', err);
            const message = err instanceof Error ? err.message : 'Authentication failed.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Determine the title based on mode
    const getTitle = () => {
        if (isReset) return 'Reset Password';
        if (isSignUp) return 'Create Instructor Account';
        return 'Instructor Login';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            {showDemoModal && <DemoSignupModal onClose={() => setShowDemoModal(false)} />}

            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">
                    {getTitle()}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center gap-2 text-sm text-left">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded flex items-center gap-2 text-sm text-left">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {successMsg}
                    </div>
                )}

                <div className="space-y-4">
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {isSignUp && !isReset && (
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-1/2 p-3 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                                    required={isSignUp}
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-1/2 p-3 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                                    required={isSignUp}
                                />
                            </div>
                        )}

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                            required
                        />

                        {!isReset && (
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                                required={!isReset}
                                minLength={6}
                            />
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                        >
                            {loading ? 'Processing...' : (
                                isReset ? 'Send Reset Link' :
                                    (isSignUp ? 'Create Account' : 'Sign In')
                            )}
                        </button>
                    </form>

                    <div className="flex flex-col gap-2 text-center text-sm text-slate-600">
                        {!isReset ? (
                            <>
                                <div>
                                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                                    <button
                                        onClick={() => {
                                            setIsSignUp(!isSignUp);
                                            setError(null);
                                            setSuccessMsg(null);
                                        }}
                                        className="text-blue-600 font-medium hover:underline"
                                        type="button"
                                    >
                                        {isSignUp ? 'Sign In' : 'Sign Up'}
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsReset(true);
                                        setError(null);
                                        setSuccessMsg(null);
                                        setIsSignUp(false);
                                    }}
                                    className="text-slate-500 hover:text-slate-700 hover:underline"
                                    type="button"
                                >
                                    Forgot Password?
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsReset(false);
                                    setError(null);
                                    setSuccessMsg(null);
                                }}
                                className="text-blue-600 font-medium hover:underline"
                                type="button"
                            >
                                Back to Sign In
                            </button>
                        )}
                    </div>

                    {!isReset && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-slate-500">Or</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowDemoModal(true)}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 text-sm font-bold active:scale-[0.98]"
                            >
                                <Loader2 className="w-4 h-4 hidden" /> {/* Preload icon just in case? No need */}
                                Try Demo Environment
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
