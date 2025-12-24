'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Terminal, User, Upload, LogOut, GraduationCap, Calendar, Settings, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase';
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
        router.push('/login');
    };

    const links = role === 'instructor' ? [
        { href: '/instructor/dashboard', label: 'Dashboard', icon: Home },
        { href: '/instructor/classes', label: 'Classes', icon: GraduationCap },
        { href: '/instructor/calendar', label: 'Calendar', icon: Calendar },
        { href: '/instructor/lab', label: 'AI Lab', icon: Terminal },
        { href: '/instructor/settings', label: 'Settings', icon: Settings },
        { href: '/profile', label: 'Profile', icon: User },
    ] : [
        { href: '/student/dashboard', label: 'Dashboard', icon: Home },
        { href: '/student/grades', label: 'My Grades', icon: FileText },
        { href: '/student/submit', label: 'Submit Work', icon: Upload },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full transition-transform md:translate-x-0 bg-slate-900 text-white border-r border-slate-800">
                <div className="flex h-full flex-col">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 p-6 border-b border-slate-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-900/20">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">ScholarSync</h1>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{role}</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-4 py-8">
                        {links.map((link) => {
                            // Check active state exact or sub-path
                            const isActive = pathname === link.href || (link.href !== '/profile' && pathname?.startsWith(link.href));

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
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
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition-all"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header (Visible only on small screens) */}
            {/* NOTE: For simplicity in MVP, we might rely on the main page content padding, 
                but let's add a small hamburger trigger or just rely on the existing layout structure. 
                For this MVP step, I will stick to the Desktop Sidebar and ensure MD+ works perfectly.
                Mobile users often need a dedicated drawer, but let's ensure the desktop layout doesn't break first.
            */}
        </>
    );
}
