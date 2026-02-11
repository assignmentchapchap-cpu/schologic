'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Shield, Sparkles, BookOpen, Grid, ArrowLeft, Archive, FileText } from 'lucide-react';

export const FEATURE_LINKS = [
    { href: '/features/class-manager', label: 'Class Manager', icon: Grid },
    { href: '/features/practicum-manager', label: 'Practicum Manager', icon: FileText },
    { href: '/features/ai-detection', label: 'AI Detection', icon: Shield },
    { href: '/features/ai-teaching-assistant', label: 'AI Teaching Assistant', icon: Sparkles },
    { href: '/features/universal-reader', label: 'Universal Reader', icon: BookOpen },
    { href: '/features/oer-library', label: 'OER Library', icon: Archive },
];

export function StickySubNav() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sticky Nav */}
            <div className="sticky top-[80px] z-40 bg-slate-900/80 backdrop-blur-lg border-y border-slate-800 hidden md:block">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-center gap-1">
                        <Link
                            href="/features"
                            className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${pathname === '/features' ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Overview
                        </Link>
                        <div className="h-4 w-px bg-slate-700 mx-2"></div>
                        {FEATURE_LINKS.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${isActive
                                        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                                        }`}
                                >
                                    <link.icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mobile Nav Header */}
            <div className="md:hidden sticky top-[72px] z-40 bg-slate-900 border-b border-slate-800 p-4 flex overflow-x-auto no-scrollbar gap-2">
                <Link
                    href="/features"
                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${pathname === '/features'
                        ? "bg-slate-800 border-slate-700 text-white"
                        : "bg-transparent border-slate-800 text-slate-500"
                        }`}
                >
                    Overview
                </Link>
                {FEATURE_LINKS.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors flex items-center gap-2 ${pathname === link.href
                            ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400"
                            : "bg-transparent border-slate-800 text-slate-500"
                            }`}
                    >
                        <link.icon className="w-3 h-3" />
                        {link.label}
                    </Link>
                ))}
            </div>
        </>
    );
}
