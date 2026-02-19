'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@schologic/database';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authErr } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authErr) throw authErr;

            // Verify user has superadmin role
            const userRole =
                data.user?.app_metadata?.role ||
                data.user?.user_metadata?.role;

            let role = userRole;

            if (!role) {
                // Fallback: check profiles table
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();
                role = profile?.role;
            }

            if (role !== 'superadmin') {
                await supabase.auth.signOut();
                throw new Error('Access denied. Superadmin credentials required.');
            }

            router.push('/admin/dashboard');
            router.refresh();
        } catch (err: unknown) {
            console.error('Admin login error:', err);
            setError(err instanceof Error ? err.message : 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-violet-500/8 rounded-full blur-[80px]" />
            </div>

            <div className="relative w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Admin Console</h1>
                    <p className="text-sm text-slate-400 mt-1">Schologic Platform Administration</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="admin@schologic.com"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-800">
                        <p className="text-xs text-slate-500 text-center">
                            This portal is restricted to authorized administrators.
                            <br />
                            Unauthorized access attempts are logged.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
