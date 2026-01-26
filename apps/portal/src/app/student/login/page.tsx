
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@schologic/database";
import { ArrowRight, Loader2, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function StudentLoginPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [studentName, setStudentName] = useState('');
    const [regNumber, setRegNumber] = useState('');
    const [regError, setRegError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const supabase = createClient();
    const { showToast } = useToast();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            if (mode === 'signup') {
                // --- SIGN UP FLOW ---

                // 1. Verify Class Code First (Before creating account)
                const { data: cls, error: clsErr } = await supabase
                    .from('classes')
                    .select('id, is_locked')
                    .eq('invite_code', inviteCode.trim().toUpperCase())
                    .single();

                if (clsErr || !cls) throw new Error("Invalid class invite code");
                if (cls.is_locked) throw new Error("This class is locked");

                // 2. Create Auth User
                const { data: authData, error: authErr } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: 'student',
                            full_name: studentName,
                            // We don't verify email in this demo flow significantly, 
                            // but in prod we might wait.
                        }
                    }
                });

                if (authErr) throw authErr;
                if (!authData.user) throw new Error("Signup failed");

                // 3. Upsert Profile (Trigger handles creation, but we update details)
                // We use Upsert to ensure Reg Number is saved
                // The trigger 'handle_new_user' creates the row, we update it.
                await supabase.from('profiles').update({
                    full_name: studentName,
                    registration_number: regNumber,
                    role: 'student'
                }).eq('id', authData.user.id);

                // 4. Create Enrollment
                const { error: enrollErr } = await supabase
                    .from('enrollments')
                    .insert([{
                        student_id: authData.user.id,
                        class_id: cls.id
                    }]);

                if (enrollErr && enrollErr.code !== '23505') throw enrollErr;

                showToast("Account created and joined successfully!", 'success');
                router.push('/student/dashboard');

            } else {
                // --- LOGIN FLOW ---
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                router.push('/student/dashboard');
            }

        } catch (error: unknown) {
            console.error("Auth Error", error);
            const message = error instanceof Error ? error.message : 'Authentication failed';
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="text-center relative mb-8">
                    <Link href="/" className="absolute left-0 top-0 p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Home className="w-5 h-5" />
                    </Link>
                    <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-4">
                        <ArrowRight className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Student Portal</h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        {mode === 'signup' ? 'Join your class to access assignments' : 'Welcome back, log in to continue'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">

                    {/* Common Fields */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            placeholder="student@school.edu"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {/* Signup Only Fields */}
                    {mode === 'signup' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Class Details</span></div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class Invite Code</label>
                                <input
                                    value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                                    className="w-full p-4 border border-slate-200 rounded-xl font-mono text-center text-xl tracking-widest uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="ABC-123"
                                    required
                                    maxLength={8}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                <input
                                    value={studentName} onChange={e => setStudentName(e.target.value)}
                                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registration No</label>
                                <input
                                    value={regNumber} onChange={e => {
                                        const val = e.target.value.toUpperCase();
                                        if (val.length <= 12 && /^[A-Z0-9\-#/]*$/.test(val)) {
                                            setRegNumber(val);
                                            setRegError(null);
                                        } else if (val.length <= 12) {
                                            setRegError('Invalid characters');
                                        }
                                    }}
                                    className={`w-full p-4 border rounded-xl focus:ring-2 outline-none font-mono ${regError ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:ring-emerald-500'}`}
                                    placeholder="A001/2023"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 mt-6 active:scale-95"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'signup' ? 'Join Class' : 'Log In')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                        className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                        {mode === 'signup' ? 'Already have an account? Log In' : 'Need to join a class? Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
}
