'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Role can be 'instructor' or default to null
    const role = searchParams.get('role');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const handleGuestLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            // For MVP anonymous login. 
            // NOTE: In a real app we might use signInAnonymously if enabled in Supabase, 
            // or just direct them to the dashboard if we are using local state before real auth.
            // But user wants "Anonymous Account" in Supabase.

            // Attempting anonymous sign in (Ensure it's enabled in Supabase dashboard)
            const { data, error } = await supabase.auth.signInAnonymously();

            if (error) throw error;

            if (data.user) {
                // Create a profile entry for this guest
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: data.user.id,
                            role: 'instructor',
                            full_name: 'Guest Instructor',
                            email: 'guest@temp.com' // Placeholder
                        }
                    ]);

                if (profileError) {
                    console.error("Profile creation failed", profileError);
                    // Proceed anyway, might just mean profile exists
                }

                router.push('/instructor/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign in as guest. Please make sure Anonymous Sign-ins are enabled in Supabase Authentication -> Providers.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">
                    Instructor Login
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={handleGuestLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Starting...' : 'Try as Guest'}
                        <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">Or sign in with email</span>
                        </div>
                    </div>

                    <form className="space-y-4 opacity-50 pointer-events-none" aria-disabled="true">
                        {/* Placeholder for future implementation */}
                        <input
                            type="email" placeholder="Email (Coming Soon)"
                            className="w-full p-3 border rounded-lg bg-slate-50" disabled
                        />
                        <input
                            type="password" placeholder="Password"
                            className="w-full p-3 border rounded-lg bg-slate-50" disabled
                        />
                        <button disabled className="w-full bg-blue-600 text-white py-3 rounded-lg">
                            Sign In
                        </button>
                    </form>
                    <p className="text-xs text-center text-slate-400">
                        Email login disabled for Guest MVP demo.
                    </p>
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
