
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Terminal, User, Upload, LogOut, GraduationCap, Calendar, Settings, FileText, Menu, X, Search, Plus, Bell, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationBell from './NotificationBell';
import { createClient } from "@schologic/database";
import { useRouter } from 'next/navigation';


// Simple utility if @/lib/utils doesn't exist yet, but previous files used it? 
// Actually previous files used locally defined `cn` or imported. 
// I'll assume standard imports or define local helper if needed. 
// Checking imports... `ReportView.tsx` imported `clsx` and `tailwind-merge`.
// I will just implement the component cleanly.

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    role: 'instructor' | 'student';
}

export default function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const links = role === 'instructor' ? [
        { href: '/instructor/dashboard', label: 'Dashboard', icon: Home },
        { href: '/instructor/classes', label: 'Classes', icon: GraduationCap },

        { href: '/instructor/calendar', label: 'Calendar', icon: Calendar },
        { href: '/instructor/lab', label: 'AI Lab', icon: Terminal },
        { href: '/instructor/settings', label: 'Settings', icon: Settings },
        { href: '/instructor/profile', label: 'Profile', icon: User },
    ] : [
        { href: '/student/dashboard', label: 'Dashboard', icon: Home },
        { href: '/student/classes', label: 'My Classes', icon: GraduationCap },
        { href: '/student/grades', label: 'My Grades', icon: FileText },
        { href: '/student/profile', label: 'Profile', icon: User },
    ];

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email?.endsWith('@schologic.demo')) {
                setIsDemo(true);
            }
        };
        checkUser();
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const handleMobileSearch = () => {
        // Navigate to dashboard with search param to trigger search overlay
        const path = role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard';
        router.push(`${path}?mobile_search=true`);
    };

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur text-white p-3 flex items-center justify-between border-b border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label="Open Menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <Link href={role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'} className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                            <Image src="/logo.png" alt="Schologic LMS" fill className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-tight block leading-none text-white">Schologic LMS</span>
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block leading-none mt-1">{role}</span>
                        </div>
                    </Link>
                </div>

                {/* Mobile Global Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleMobileSearch}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    {role === 'instructor' && (
                        <Link
                            href="/instructor/classes?new=true"
                            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-900/20"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Class
                        </Link>
                    )}
                    <NotificationBell />
                </div>
            </div>

            {/* Backdrop for Mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/10 z-40 md:hidden backdrop-blur-[1px] animate-fade-in"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 z-50 h-screen w-[240px] md:w-64 bg-slate-900 text-white border-r border-slate-800 transition-transform duration-300 ease-in-out font-sans shadow-2xl md:shadow-none",
                isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="flex h-full flex-col">
                    {/* Logo Area */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 shrink-0">
                                <Image src="/logo.png" alt="Schologic LMS" fill className="object-cover rounded-xl" />
                            </div>
                            <div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                    Schologic LMS
                                </span>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{role}</p>
                            </div>
                        </div>
                        {/* Close Button Mobile */}
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="md:hidden p-1 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-4 py-8 overflow-y-auto">
                        {links.map((link) => {
                            const isActive = pathname === link.href || (link.href !== '/profile' && pathname?.startsWith(link.href));
                            const isRestricted = isDemo && (link.href === '/instructor/lab' || link.href === '/instructor/settings');

                            if (isRestricted) {
                                return (
                                    <div
                                        key={link.href}
                                        className="flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl text-slate-500 cursor-not-allowed opacity-60 hover:bg-slate-800/50"
                                        title="Available in Full Version"
                                    >
                                        <div className="flex items-center gap-3">
                                            <link.icon className="h-5 w-5" />
                                            {link.label}
                                        </div>
                                        <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">Lock</span>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group",
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    )}
                                >
                                    <link.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / User */}
                    <div className="p-4 border-t border-slate-800">
                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition-all"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
