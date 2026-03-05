'use client'; // Unified Pilot Navbar

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function PilotNavbarSimple() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-100 py-3">
            <div className="container mx-auto px-6 flex justify-between items-center h-10">
                {/* Left: Branding */}
                <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                    <div className="relative w-8 h-8 md:w-9 md:h-9 shrink-0">
                        <Image
                            src="/logo_updated.png"
                            alt="Schologic Logo"
                            fill
                            priority
                            className="object-contain"
                        />
                    </div>
                    <span className="font-serif font-bold text-lg md:text-xl text-slate-900 tracking-tight shrink-0">
                        Schologic LMS
                    </span>
                </Link>

                {/* Right: Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
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

                {/* Right: Mobile Navigation */}
                <div className="flex md:hidden items-center gap-3">
                    <Link
                        href="/login"
                        className="px-4 py-1.5 inline-block bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                    >
                        Login
                    </Link>
                    <button
                        className="text-slate-900 p-1 -mr-1"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl overflow-y-auto max-h-[80vh]">
                    <div className="p-4 flex flex-col">
                        <Link
                            href="/pilot-knowledge-base"
                            className="block px-4 py-3 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Knowledge Base
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
