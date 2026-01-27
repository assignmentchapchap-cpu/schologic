
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@schologic/database";
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import DemoSignupModal from '@/components/auth/DemoSignupModal';
import Alert from '@/components/Alert';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [isSignUp, setIsSignUp] = useState(searchParams.get('view') === 'signup');
    const [isReset, setIsReset] = useState(searchParams.get('view') === 'reset'); // Toggle for password reset
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
                const capFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
                const capLast = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        data: {
                            first_name: capFirst,
                            last_name: capLast,
                            full_name: `${capFirst} ${capLast}`.trim(),
                            role: 'instructor'
                        }
                    }
                });

                if (signUpError) throw signUpError;

                if (data.user && data.user.identities && data.user.identities.length === 0) {
                    throw new Error('This email is already registered. Please sign in or reset your password.');
                }

                setSuccessMsg('Account created! Please check your email to confirm your account.');
            } else {
                // Sign In Flow
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;

                // Security Check: Enforce email verification
                if (signInData.user && !signInData.user.email_confirmed_at) {
                    await supabase.auth.signOut();
                    throw new Error('Please verify your email address to log in.');
                }

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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-grid-pattern">
            {showDemoModal && <DemoSignupModal onClose={() => setShowDemoModal(false)} />}

            <Card className="w-full max-w-md relative z-10" hoverEffect={false}>
                <h2 className="text-2xl md:text-3xl font-black mb-6 text-slate-900 text-center tracking-tight">
                    {getTitle()}
                </h2>

                {error && <Alert type="error" message={error} />}

                {successMsg && <Alert type="success" message={successMsg} />}

                <div className="space-y-6">
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {isSignUp && !isReset && (
                            <div className="flex gap-4">
                                <Input
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value.replace(/(^\w|\s\w)/g, m => m.toUpperCase()))}
                                    required={isSignUp}
                                    className="bg-slate-50"
                                    fullWidth
                                />
                                <Input
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value.replace(/(^\w|\s\w)/g, m => m.toUpperCase()))}
                                    required={isSignUp}
                                    className="bg-slate-50"
                                    fullWidth
                                />
                            </div>
                        )}

                        <Input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-slate-50"
                            fullWidth
                        />

                        {!isReset && (
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required={!isReset}
                                minLength={6}
                                className="bg-slate-50"
                                fullWidth
                            />
                        )}

                        <Button
                            type="submit"
                            isLoading={loading}
                            fullWidth
                            size="lg"
                            variant="primary"
                        >
                            {isReset ? 'Send Reset Link' : (isSignUp ? 'Create Account' : 'Sign In')}
                        </Button>
                    </form>

                    <div className="flex flex-col gap-3 text-center text-sm text-slate-600">
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
                                        className="text-indigo-600 font-bold hover:underline"
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
                                    className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
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
                                className="text-indigo-600 font-bold hover:underline"
                                type="button"
                            >
                                Back to Sign In
                            </button>
                        )}
                    </div>

                    {!isReset && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-100" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                                    <span className="bg-white px-2 text-slate-400">Or Preview</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => setShowDemoModal(true)}
                                disabled={loading}
                                fullWidth
                                variant="outline"
                                className="border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                rightIcon={<ArrowRight className="w-4 h-4" />}
                            >
                                Try Demo Environment
                            </Button>
                        </>
                    )}
                </div>
            </Card>
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
