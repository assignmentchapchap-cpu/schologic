'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { Loader2 } from 'lucide-react';

export default function MessagesRedirect() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        if (user.role === 'instructor') {
            router.replace('/instructor/messages');
        } else {
            router.replace('/student/messages');
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Loading your inbox...</p>
            </div>
        </div>
    );
}
