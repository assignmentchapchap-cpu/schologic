'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@schologic/database";
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { OTPInput } from '@/components/ui/OTPInput';
import Alert from '@/components/Alert';

type AuthStage = 'credentials' | 'otp_reset' | 'new_password';

// Password Validation Helper
const isPasswordStrong = (pwd: string) => {
    const hasMinLength = pwd.length >= 6;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
};

export default function PilotAuthForm({ type }: { type: 'login' | 'setup' }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL State
    const isReset = searchParams.get('view') === 'reset';
    const isVerifyReset = searchParams.get('view') === 'verify_reset';

    // Logic: If 'setup', we enforce an email verification step first.
    // Setup links from Resend direct users to /setup. They enter their email, 
    // receive a 6-digit OTP, and then set their permanent password.
    // We treat 'setup' exactly like a 'reset' flow behind the scenes.
    const [authStage, setAuthStage] = useState<AuthStage>(
        isVerifyReset ? 'otp_reset' : 'credentials'
    );

    // Form Fields
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // Status State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(
        isVerifyReset ? 'Please enter the code sent to your email.' : null
    );
    const [resendTimer, setResendTimer] = useState(0);

    const supabase = createClient();

    // Handle Supabase Hash for setup links (if coming from an email invite)
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.includes('type=invite')) {
            // Supabase Client implicitly handles the session creation from the URL hash.
            // We just need to prompt them to update their password.
            setAuthStage('new_password');
        }
    }, []);

    // Timer effect
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Handle Unauthorized Redirect Error from proxy.ts
    useEffect(() => {
        if (searchParams.get('error') === 'unauthorized_pilot') {
            setError("Access Restricted: This account is not associated with an active pilot program.");
            // Clear the param from URL without reloading
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

    const switchView = (newParams: URLSearchParams) => {
        setAuthStage('credentials');
        setError(null);
        setSuccessMsg(null);
        setOtp('');
        router.push(`?${newParams.toString()}`);
    };

    // 1. Initial Submission (Credentials or Request Reset)
    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            if (isReset || type === 'setup') {
                // Setup and Reset both start by sending an OTP to verify identity
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                if (error) throw error;
                setAuthStage('otp_reset');
                setSuccessMsg(`We sent a 6-digit code to ${email}.`);
            } else {
                // Sign In
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // Redirect on success
                window.location.href = '/portal/scope';
            }
        } catch (err: unknown) {
            console.error('Pilot Auth error:', err);
            setError(err instanceof Error ? err.message : 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    // 2. OTP Verification (For Reset)
    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            setSuccessMsg(`Code resent to ${email}`);
            setResendTimer(60); // 60s cooldown
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'recovery'
            });

            if (verifyError) throw verifyError;

            // Reset OTP Verified -> Set New Password
            setAuthStage('new_password');
            setOtp(''); // Clear OTP
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Invalid code.');
        } finally {
            setLoading(false);
        }
    };

    // 3. Set New Password (For Setup & Reset Flows)
    const handleNewPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!isPasswordStrong(newPassword)) {
            setError("Password must be at least 6 characters and include uppercase, lowercase, and number.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            // Successfully set password, redirect to portal scope tab
            window.location.href = '/portal/scope';
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    // --- Render Helpers ---

    const renderCredentialsForm = () => (
        <form onSubmit={handleCredentialsSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Input
                type="email"
                placeholder="Institutional Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-50"
                fullWidth
                disabled={loading || isVerifyReset}
            />

            {(!isReset && !isVerifyReset && type !== 'setup') && (
                <PasswordInput
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            )}

            <Button
                type="submit"
                isLoading={loading}
                fullWidth
                size="lg"
                className="bg-slate-900 text-white hover:bg-black rounded-xl font-bold shadow-sm transition-all active:scale-[0.98]"
            >
                {isReset ? 'Send Reset Code' : (type === 'setup' ? 'Send Setup Code' : 'Sign In')}
            </Button>
        </form>
    );

    const renderOTPForm = () => (
        <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center">
                <p className="text-slate-500 mb-4">
                    Enter the 6-digit code sent to <span className="font-bold text-slate-800">{email}</span>
                </p>
                <OTPInput
                    value={otp}
                    onChange={setOtp}
                    disabled={loading}
                />
            </div>

            <Button
                type="submit"
                isLoading={loading}
                fullWidth
                size="lg"
                className="bg-slate-900 text-white hover:bg-black rounded-xl font-bold shadow-sm transition-all active:scale-[0.98]"
                disabled={otp.length !== 6}
            >
                Verify Code
            </Button>

            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || loading}
                    className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 font-medium"
                >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
                </button>
                <button
                    type="button"
                    onClick={() => setAuthStage('credentials')}
                    className="w-full text-sm text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-3 h-3" /> Back to Sign In
                </button>
            </div>
        </form>
    );

    const renderNewPasswordForm = () => (
        <form onSubmit={handleNewPasswordSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
            {type === 'setup' && (
                <Input
                    type="email"
                    placeholder="Institutional Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-50"
                    fullWidth
                    disabled={loading}
                />
            )}
            <PasswordInput
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                showStrength
            />
            <PasswordInput
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
            />
            <Button
                type="submit"
                isLoading={loading}
                fullWidth
                size="lg"
                className="bg-slate-900 text-white hover:bg-black rounded-xl font-bold shadow-sm transition-all active:scale-[0.98]"
            >
                Secure Account
            </Button>
        </form>
    );

    return (
        <div className="space-y-6">
            {error && <Alert type="error" message={error} />}
            {successMsg && <Alert type="success" message={successMsg} />}

            {authStage === 'credentials' && renderCredentialsForm()}
            {authStage === 'otp_reset' && renderOTPForm()}
            {authStage === 'new_password' && renderNewPasswordForm()}

            {authStage === 'credentials' && (
                <div className="flex flex-col gap-3 text-center text-sm text-slate-600 border-t border-slate-100 pt-6 mt-6">
                    {(!isReset && type !== 'setup') ? (
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set('view', 'reset');
                                switchView(params);
                            }}
                            className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
                            type="button"
                        >
                            Forgot Password?
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.delete('view');
                                switchView(params);
                            }}
                            className="text-indigo-600 font-bold hover:underline"
                            type="button"
                        >
                            Back to Sign In
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
