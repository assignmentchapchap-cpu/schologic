
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
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.email?.toLowerCase().endsWith('@schologic.demo')) {
                setIsDemo(true);
            }
            setLoading(false);
        };
        checkUser();
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
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs flex items-center gap-1.5 transition-colors backdrop-blur-sm border border-white/20"
            >
                <Sparkles className="w-3 h-3 text-amber-100" />
                Upgrade to Standard
            </Link>
        </div>
    );
}
