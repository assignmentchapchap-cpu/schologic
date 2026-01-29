
'use client';

import Link from 'next/link';
import { createClient } from "@schologic/database";
import { useEffect, useState } from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DemoBanner() {
    const [isDemo, setIsDemo] = useState(false);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data } = await supabase.auth.getUser();
            const user = data?.user;
            if (user?.user_metadata?.is_demo === true) {
                setIsDemo(true);
            } else {
                setIsDemo(false);
            }
            setLoading(false);
        };

        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
                checkUser();
            }
        });

        checkUser();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const showBanner = pathname?.startsWith('/instructor') || pathname?.startsWith('/student');

    if (loading || !isDemo || !showBanner) return null;

    return (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-bold flex flex-col md:flex-row items-center justify-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-1 z-50 relative">
            <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 fill-white/20" />
                <span>Demo Mode: You are exploring the interactive demo.</span>
            </div>

            <Link
                href="/instructor/settings"
                className="relative inline-flex h-8 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500 shadow-md transform hover:scale-105 transition-transform duration-200"
            >
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#fbbf24_0%,#6366f1_33%,#ffffff_66%,#fbbf24_100%)]" />
                <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-white px-4 py-1 text-xs font-black text-orange-600 backdrop-blur-3xl gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 fill-orange-200 animate-pulse" />
                    Upgrade to Standard
                </span>
            </Link>
        </div>
    );
}
