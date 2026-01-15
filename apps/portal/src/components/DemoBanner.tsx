
'use client';

import { createClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DemoBanner() {
    const [isDemo, setIsDemo] = useState(false);
    const [loading, setLoading] = useState(true);

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

    if (loading || !isDemo) return null;

    return (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-bold flex items-center justify-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-1 z-50 relative">
            <AlertTriangle className="w-4 h-4 fill-white/20" />
            <span>Welcome to the Schologic LMS interactive demo! Follow the prompts to explore the instructor dashboard.</span>
        </div>
    );
}
