'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getPilotUrl } from '@/lib/urls';

export function CollegesPilotCTA() {
    return (
        <Link
            href={getPilotUrl()}
            className="bg-amber-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-amber-700 transition-all transform hover:scale-105 shadow-xl shadow-amber-600/20 flex items-center justify-center gap-2 w-max mx-auto sm:mx-0"
        >
            Launch Your Hybrid Campus <ArrowRight className="w-5 h-5" />
        </Link>
    );
}
