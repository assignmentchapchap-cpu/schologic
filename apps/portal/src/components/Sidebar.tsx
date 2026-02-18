
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Terminal, User, Upload, LogOut, GraduationCap, Calendar, Settings, FileText, Menu, X, Search, Plus, Bell, BookOpen, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationBell from './NotificationBell';
import { createClient } from "@schologic/database";
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigationGuard } from '@/context/NavigationGuardContext';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    role: 'instructor' | 'student';
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export default function Sidebar({ role, isCollapsed = false, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [enablePracticums, setEnablePracticums] = useState(false);
    const [hasPracticums, setHasPracticums] = useState(false);
    const { interceptLink } = useNavigationGuard();

    useEffect(() => {
        const checkPrefs = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            if (role === 'instructor') {
                const { data } = await supabase.from('profiles').select('preferences').eq('id', user.id).maybeSingle();
                if (data?.preferences && (data.preferences as any).enable_practicum_management) {
                    setEnablePracticums(true);
                }
            } else {
                // Check if student has any practicum enrollments
                const { count } = await supabase
                    .from('practicum_enrollments')
                    .select('id', { count: 'exact', head: true })
                    .eq('student_id', user.id);

                if (count && count > 0) {
                    setHasPracticums(true);
                }
            }
        };
        checkPrefs();
    }, [role]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const links = role === 'instructor' ? [
        { href: '/instructor/dashboard', label: 'Dashboard', icon: Home, color: 'text-indigo-400' },
        { href: '/instructor/classes', label: 'Classes', icon: GraduationCap, color: 'text-amber-500' },
        ...(enablePracticums ? [{ href: '/instructor/practicums', label: 'Practicums', icon: FileText, color: 'text-orange-500' }] : []),
        { href: '/instructor/library', label: 'Library', icon: BookOpen, color: 'text-emerald-400' },
        { href: '/instructor/calendar', label: 'Calendar', icon: Calendar, color: 'text-blue-400' },
        { href: '/instructor/lab', label: 'AI Lab', icon: Terminal, color: 'text-rose-400' },
        { href: '/instructor/settings', label: 'Settings', icon: Settings, color: 'text-slate-400' },
        { href: '/instructor/profile', label: 'Profile', icon: User, color: 'text-teal-400' },
    ] : [
        { href: '/student/dashboard', label: 'Dashboard', icon: Home, color: 'text-indigo-400' },
        { href: '/student/classes', label: 'My Classes', icon: GraduationCap, color: 'text-amber-500' },
        ...(hasPracticums ? [{ href: '/student/practicums', label: 'My Practicums', icon: FileText, color: 'text-emerald-500' }] : []),
        { href: '/student/grades', label: 'My Grades', icon: Award, color: 'text-emerald-400' },
        { href: '/student/profile', label: 'Profile', icon: User, color: 'text-teal-400' },
    ];

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { isDemo } = useUser();

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
                        {/* Icon removed from mobile header to clear space - moved to sidebar */}
                        <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-tight block leading-none text-white">Schologic LMS</span>
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block leading-none mt-1">{role}</span>
                        </div>
                    </Link>
                </div>

                {/* Mobile Global Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleMobileSearch}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* +Class moved to Dashboard Body per request */}
                    <NotificationBell variant="mobile" />
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
                "fixed left-0 top-0 z-50 h-screen bg-slate-900 text-white border-r border-slate-800 transition-all duration-300 ease-in-out font-sans shadow-2xl md:shadow-none",
                "w-[240px]", // Mobile width
                isCollapsed ? "md:w-20" : "md:w-64", // Desktop width handled by parent layout syncing usually, but generic here
                isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Desktop Toggle Button */}
                <button
                    onClick={onToggleCollapse}
                    className="hidden md:flex absolute -right-3 top-10 bg-indigo-600 text-white p-1 rounded-full shadow-lg border border-indigo-500 cursor-pointer z-50 hover:bg-indigo-500 transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <div className="flex h-full flex-col">
                    {/* Logo Area */}
                    <div className={cn(
                        "flex items-center p-6 border-b border-slate-800 transition-all duration-300",
                        isCollapsed ? "justify-center px-4" : "justify-end md:justify-between gap-3"
                    )}>
                        <Link
                            href={role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'}
                            className={cn("flex items-center gap-3 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer")}
                        >
                            <div className="relative w-10 h-10 shrink-0">
                                <Image src="/logo.png" alt="Schologic LMS" fill className="object-cover rounded-xl" />
                            </div>
                            <div className={cn("transition-all duration-300", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                                <span className="text-xl font-bold text-white whitespace-nowrap">
                                    Schologic LMS
                                </span>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{role}</p>
                            </div>
                        </Link>
                        {/* Close Button Mobile */}
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="md:hidden p-1 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
                        {links.map((link) => {
                            const isActive = pathname === link.href || (link.href !== '/profile' && pathname?.startsWith(link.href));
                            const isRestricted = isDemo && (link.href === '/instructor/lab' || link.href === '/instructor/settings');

                            if (isRestricted) {
                                return (
                                    <button
                                        key={link.href}
                                        onClick={() => interceptLink(link.href, (href) => router.push(href))}
                                        className={cn(
                                            "flex items-center px-3 py-3 text-sm font-bold rounded-xl text-slate-500 hover:bg-slate-800/50 hover:text-white transition-colors group cursor-pointer relative w-full",
                                            isCollapsed ? "justify-center" : "justify-between"
                                        )}
                                        title={isCollapsed ? `${link.label} (Locked)` : undefined}
                                    >
                                        <div className="flex items-center gap-3">
                                            <link.icon className="h-6 w-6 shrink-0" />
                                            {!isCollapsed && <span>{link.label}</span>}
                                        </div>
                                        {!isCollapsed && <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 group-hover:bg-slate-700 group-hover:text-white transition-colors">Lock</span>}
                                    </button>
                                );
                            }

                            return (
                                <button
                                    key={link.href}
                                    onClick={() => interceptLink(link.href, (href) => router.push(href))}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl transition-all duration-200 group relative w-full",
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800",
                                        isCollapsed ? "justify-center" : ""
                                    )}
                                    title={isCollapsed ? link.label : undefined}
                                >
                                    <link.icon className={cn("h-6 w-6 shrink-0 transition-colors", isActive ? "text-white" : `${link.color} group-hover:text-white`)} />
                                    {!isCollapsed && <span className="whitespace-nowrap">{link.label}</span>}

                                    {/* Tooltip for collapsed state (optional css-only) */}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700 transition-opacity">
                                            {link.label}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer / User */}
                    <div className="p-4 border-t border-slate-800">
                        <button
                            onClick={handleSignOut}
                            className={cn(
                                "flex w-full items-center gap-3 px-3 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition-all group",
                                isCollapsed ? "justify-center" : ""
                            )}
                            title={isCollapsed ? "Sign Out" : undefined}
                        >
                            <LogOut className="h-6 w-6 shrink-0" />
                            {!isCollapsed && <span>Sign Out</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
