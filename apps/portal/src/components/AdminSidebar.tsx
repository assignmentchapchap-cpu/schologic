'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Users, Mail, MessageSquare, Shield, LogOut, Menu, X, ChevronLeft, ChevronRight, AlertTriangle, Zap, Terminal, Bell } from 'lucide-react';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@schologic/database';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useNotifications } from '@/context/NotificationContext';
import { getRoleLabel } from '@/lib/identity';
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
    { label: 'Dashboard', icon: Home, href: '/admin/dashboard', color: 'text-indigo-400' },
    { label: 'Leads Hub', icon: Users, href: '/admin/leads', color: 'text-orange-400' },
    { label: 'Users', icon: Users, href: '/admin/users', color: 'text-amber-400' },
    { label: 'AI Usage', icon: Zap, href: '/admin/ai-usage', color: 'text-violet-400' },
    { label: 'Messaging', icon: MessageSquare, href: '/admin/messages', color: 'text-emerald-400' },
    { label: 'Email', icon: Mail, href: '/admin/email/inbox', color: 'text-cyan-400' },
    { label: 'Feedback', icon: Mail, href: '/admin/feedback', color: 'text-blue-400' },
    { label: 'System Errors', icon: Terminal, href: '/admin/errors', color: 'text-fuchsia-400' },
    { label: 'Security Audit', icon: AlertTriangle, href: '/admin/security', color: 'text-rose-400' },
];


export default function AdminSidebar({ isCollapsed = false, onToggleCollapse }: AdminSidebarProps) {
    const { user } = useUser();
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const notiRef = useRef<HTMLDivElement>(null);

    // Close mobile menu and notification dropdown on outside click / route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
                setIsNotiOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                        <span className="text-xs text-rose-400 font-medium uppercase tracking-wider block leading-none mt-1">{getRoleLabel(user?.role)}</span>
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
                                <Image src="/logo_updated.png" alt="Schologic LMS" fill className="object-contain rounded-xl" />
                            </div>
                            <div className={cn("transition-all duration-300", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                                <span className="text-xl font-bold text-white whitespace-nowrap">
                                    Schologic LMS
                                </span>
                                <p className="text-xs text-rose-400 font-medium uppercase tracking-wider">{getRoleLabel(user?.role)}</p>
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

                    {/* Notifications */}
                    <div className={cn("px-3 py-2 border-t border-slate-800", isCollapsed ? "flex justify-center" : "")} ref={notiRef}>
                        <button
                            onClick={() => setIsNotiOpen(!isNotiOpen)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl transition-all w-full relative group",
                                isNotiOpen ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800",
                                isCollapsed ? "justify-center" : ""
                            )}
                            title={isCollapsed ? `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}` : undefined}
                        >
                            <div className="relative shrink-0">
                                <Bell className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {!isCollapsed && <span className="whitespace-nowrap">Notifications</span>}
                            {!isCollapsed && unreadCount > 0 && (
                                <span className="ml-auto bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}

                            {/* Collapsed tooltip */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700 transition-opacity">
                                    Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
                                </div>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {isNotiOpen && (
                            <div className={cn(
                                "absolute bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-[60] overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200",
                                isCollapsed ? "left-20 bottom-4 w-80" : "left-4 right-4 bottom-16 w-auto"
                            )}>
                                <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wide"
                                            onClick={() => markAllAsRead()}
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <Bell className="h-5 w-5 text-slate-600 mx-auto mb-2" />
                                            <p className="text-xs text-slate-500">No notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <button
                                                key={n.id}
                                                className={`w-full text-left px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors flex gap-3 items-start ${!n.is_read ? 'bg-indigo-500/5' : ''
                                                    }`}
                                                onClick={() => {
                                                    markAsRead(n.id);
                                                    if (n.link) window.location.href = n.link;
                                                    setIsNotiOpen(false);
                                                }}
                                            >
                                                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!n.is_read ? 'bg-indigo-400' : 'bg-transparent'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[12px] leading-snug ${!n.is_read ? 'font-semibold text-white' : 'text-slate-400'}`}>
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                                        {n.created_at ? formatTimeAgo(new Date(n.created_at)) : ''}
                                                    </p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

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

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}
