'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Users, Mail, MessageSquare, Shield, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@schologic/database';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AdminSidebarProps {
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const NAV_LINKS = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home, color: 'text-indigo-400' },
    { href: '/admin/users', label: 'Users', icon: Users, color: 'text-amber-400' },
    { href: '/admin/messages', label: 'Messages', icon: Mail, color: 'text-emerald-400' },
    { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare, color: 'text-blue-400' },
    { href: '/admin/security', label: 'Security', icon: Shield, color: 'text-rose-400' },
];

export default function AdminSidebar({ isCollapsed = false, onToggleCollapse }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur text-white p-3 border-b border-slate-800 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label="Open Menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <Link href="/admin/dashboard" className="flex flex-col">
                        <span className="font-bold text-lg tracking-tight block leading-none text-white">Schologic LMS</span>
                        <span className="text-xs text-rose-400 font-medium uppercase tracking-wider block leading-none mt-1">superadmin</span>
                    </Link>
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
                "w-[240px]",
                isCollapsed ? "md:w-20" : "md:w-64",
                isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Desktop Toggle Button */}
                <button
                    onClick={onToggleCollapse}
                    className="hidden md:flex absolute -right-3 top-10 bg-rose-600 text-white p-1 rounded-full shadow-lg border border-rose-500 cursor-pointer z-50 hover:bg-rose-500 transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <div className="flex h-full flex-col">
                    {/* Logo Area */}
                    <div className={cn(
                        "flex items-center p-6 md:p-4 border-b border-slate-800 transition-all duration-300",
                        isCollapsed ? "justify-center px-4" : "justify-end md:justify-between gap-3"
                    )}>
                        <Link
                            href="/admin/dashboard"
                            className={cn("flex items-center gap-3 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer")}
                        >
                            <div className="relative w-10 h-10 shrink-0">
                                <Image src="/logo.png" alt="Schologic LMS" fill className="object-cover rounded-xl" />
                            </div>
                            <div className={cn("transition-all duration-300", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                                <span className="text-xl font-bold text-white whitespace-nowrap">
                                    Schologic LMS
                                </span>
                                <p className="text-xs text-rose-400 font-medium uppercase tracking-wider">superadmin</p>
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
                    <nav className="flex-1 space-y-2 px-3 py-6 md:py-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
                        {NAV_LINKS.map((link) => {
                            const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== '/admin/dashboard');

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl transition-all duration-200 group relative w-full",
                                        isActive
                                            ? "bg-rose-600 text-white shadow-md shadow-rose-900/20"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800",
                                        isCollapsed ? "justify-center" : ""
                                    )}
                                    title={isCollapsed ? link.label : undefined}
                                >
                                    <link.icon className={cn("h-6 w-6 shrink-0 transition-colors", isActive ? "text-white" : `${link.color} group-hover:text-white`)} />
                                    {!isCollapsed && <span className="whitespace-nowrap">{link.label}</span>}

                                    {/* Tooltip for collapsed state */}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700 transition-opacity">
                                            {link.label}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / Sign Out */}
                    <div className="p-4 md:p-3 border-t border-slate-800">
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
