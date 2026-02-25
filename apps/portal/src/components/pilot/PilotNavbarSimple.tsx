'use client'; // Unified Pilot Navbar

import Link from 'next/link';
import Image from 'next/image';

export function PilotNavbarSimple() {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-100 py-3">
            <div className="container mx-auto px-6 flex justify-between items-center h-10">
                {/* Left: Branding */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-9 h-9 shrink-0">
                        <Image
                            src="/logo_updated.png"
                            alt="Schologic Logo"
                            fill
                            priority
                            className="object-contain"
                        />
                    </div>
                    <span className="font-serif font-bold text-xl text-slate-900 tracking-tight">Schologic LMS</span>
                </Link>

                {/* Right: Navigation Links */}
                <div className="flex items-center gap-8">
                    <Link
                        href="/pilot-knowledge-base"
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Knowledge Base
                    </Link>

                    <Link
                        href="/login"
                        className="px-5 py-2 inline-block bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </nav>
    );
}
