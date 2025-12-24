'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ArrowRight, Loader2, Home } from 'lucide-react';
import Link from 'next/link';

export default function StudentLoginPage() {
    const [inviteCode, setInviteCode] = useState('');
    const [studentName, setStudentName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Authenticate (Anonymous for now, consistent with requested flow)
            // In a real app, this might be a proper email/password login
            const { data: authData, error: authErr } = await supabase.auth.signInAnonymously();
            if (authErr) throw authErr;

            if (authData.user) {
                // 2. Upsert Profile
                const { error: profErr } = await supabase.from('profiles').upsert({
                    id: authData.user.id,
                    role: 'student',
                    full_name: studentName,
                    email: email,
                }, { onConflict: 'id', ignoreDuplicates: true });

                if (profErr) console.error("Profile check warning:", profErr);

                // 3. Verify Class Code
                const { data: cls, error: clsErr } = await supabase
                    .from('classes')
                    .select('id, is_locked')
                    .eq('invite_code', inviteCode.trim().toUpperCase())
                    .single();

                if (clsErr || !cls) throw new Error("Invalid invite code");
                if (cls.is_locked) throw new Error("Class is locked");

                // 4. Create Enrollment
                const { error: enrollErr } = await supabase
                    .from('enrollments')
                    .insert([{
                        student_id: authData.user.id,
                        class_id: cls.id,
                        joined_at: new Date().toISOString()
                    }]);

                // Ignore unique violation (already enrolled)
                if (enrollErr && enrollErr.code !== '23505') throw enrollErr;

                // 5. Redirect to Dashboard
                router.push('/student/dashboard');
            }

        } catch (error: any) {
            console.error("Join Error", error);
            alert("Failed to join. " + error.message);
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
                    <h1 className="text-2xl font-bold text-slate-800">Student Login</h1>
                    <p className="text-slate-500 mt-2 text-sm">Join your class to access assignments</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class Invite Code</label>
                        <input
                            value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                            className="w-full p-4 border border-slate-200 rounded-xl font-mono text-center text-xl tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder="ABC-123"
                            required
                            maxLength={8}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                        <input
                            value={studentName} onChange={e => setStudentName(e.target.value)}
                            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email (Optional)</label>
                        <input
                            type="email"
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder="For results notification"
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Class'}
                    </button>
                </form>
            </div>
        </div>
    );
}
