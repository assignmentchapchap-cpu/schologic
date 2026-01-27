
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@schologic/database";
import { ArrowRight, Loader2, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { verifyClassInvite, enrollStudent } from '@/app/actions/student';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

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

                // 1. Verify Class Code via Server Action (Bypasses RLS)
                const verifyRes = await verifyClassInvite(inviteCode);

                if (verifyRes.error) throw new Error(verifyRes.error);
                if (!verifyRes.success || !verifyRes.classId) throw new Error("Invalid class invite code");

                // 2. Create Auth User

                // Capitalize Name
                const formattedName = studentName
                    .split(' ')
                    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                    .join(' ');

                const { data: authData, error: authErr } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback?next=/student/dashboard`,
                        data: {
                            role: 'student',
                            full_name: formattedName,
                            registration_number: regNumber, // Pass here for trigger to handle
                        }
                    }
                });

                if (authErr) {
                    if (authErr.message.includes('already registered') || authErr.code === 'unique_violation') {
                        throw new Error("This email is already registered. Please log in.");
                    }
                    throw authErr;
                }
                if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
                    throw new Error("This email is already registered. Please log in.");
                }
                if (!authData.user) throw new Error("Signup failed");

                // 3. Upsert Profile - Client side update might fail if no session (email confirm enabled).
                // We rely on the metadata above + trigger. 
                // But we attempt update just in case we HAVE a session (e.g. auto confirm).
                if (authData.session) {
                    await supabase.from('profiles').update({
                        full_name: formattedName,
                        registration_number: regNumber,
                        role: 'student'
                    }).eq('id', authData.user.id);
                }

                // 4. Create Enrollment via Server Action
                // This uses the service role to insert even if the user is not yet confirmed/authenticated
                const enrollRes = await enrollStudent(authData.user.id, verifyRes.classId, formattedName, regNumber);

                if (enrollRes.error && enrollRes.error !== 'Already enrolled') {
                    console.error("Enrollment Error:", enrollRes.error);
                    // We might want to warn the user, but account is created.
                    // For now, let's proceed but maybe show a warning toast?
                    // showToast("Account created but enrollment failed. Please contact support.", 'warning');
                }

                showToast("Account created! Please verify your email.", 'success');
                // router.push('/student/dashboard'); // Don't redirect if not logged in
                if (authData.session) {
                    router.push('/student/dashboard');
                } else {
                    setMode('login'); // Switch to login view so they can login after verifying
                }

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
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-grid-pattern">
            <Card className="max-w-md w-full relative z-10" hoverEffect={false}>
                <div className="text-center relative mb-8">
                    <Link href="/" className="absolute left-0 top-0 p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Home className="w-5 h-5" />
                    </Link>
                    <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-4">
                        <ArrowRight className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Student Portal</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                        {mode === 'signup' ? 'Join your class to access assignments' : 'Welcome back, log in to continue'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">

                    {/* Common Fields */}
                    <Input
                        label="EMAIL ADDRESS"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="student@school.edu"
                        required
                        fullWidth
                    />

                    <Input
                        label="PASSWORD"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        fullWidth
                    />

                    {/* Signup Only Fields */}
                    {mode === 'signup' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-top-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider"><span className="bg-white px-2 text-slate-400">Class Details</span></div>
                            </div>

                            <Input
                                label="CLASS INVITE CODE"
                                value={inviteCode}
                                onChange={e => setInviteCode(e.target.value)}
                                className="font-mono text-center text-xl tracking-widest uppercase focus:ring-emerald-500"
                                placeholder="ABC-123"
                                required
                                maxLength={8}
                                fullWidth
                            />

                            <Input
                                label="FULL NAME"
                                value={studentName}
                                onChange={e => {
                                    const val = e.target.value.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
                                    setStudentName(val);
                                }}
                                placeholder="John Doe"
                                required
                                fullWidth
                            />

                            <Input
                                label="REGISTRATION NO"
                                value={regNumber}
                                onChange={e => {
                                    const val = e.target.value.toUpperCase();
                                    if (val.length <= 12 && /^[A-Z0-9\-#/]*$/.test(val)) {
                                        setRegNumber(val);
                                        setRegError(null);
                                    } else if (val.length <= 12) {
                                        setRegError('Invalid characters');
                                    }
                                }}
                                className={`font-mono ${regError ? 'border-red-300 bg-red-50' : 'focus:ring-emerald-500'}`}
                                placeholder="A001/2023"
                                required
                                error={regError || undefined}
                                fullWidth
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        isLoading={loading}
                        fullWidth
                        size="lg"
                        variant="success"
                        className="active:scale-95 shadow-lg shadow-emerald-100"
                    >
                        {mode === 'signup' ? 'Join Class' : 'Log In'}
                    </Button>
                </form>

                <div className="mt-8 text-center bg-slate-50 p-4 rounded-xl">
                    <button
                        onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                        className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                        {mode === 'signup' ? 'Already have an account? Log In' : 'Need to join a class? Sign Up'}
                    </button>
                </div>
            </Card>
        </div>
    );
}
