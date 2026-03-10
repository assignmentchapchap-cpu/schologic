'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Inbox, Send, Pencil, Users, BookOpen } from 'lucide-react';

const EMAIL_TABS = [
    { label: 'Inbox', icon: Inbox, href: '/admin/email/inbox' },
    { label: 'Sent', icon: Send, href: '/admin/email/sent' },
    { label: 'Drafts', icon: Pencil, href: '/admin/email/drafts' },
    { label: 'Mailing Lists', icon: Users, href: '/admin/email/mailing-lists' },
    { label: 'Templates', icon: BookOpen, href: '/admin/email/templates' },
];

export default function EmailLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sub-navigation tabs */}
            <div className="bg-white border-b border-slate-200 px-4 md:px-8">
                <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
                    {EMAIL_TABS.map((tab) => {
                        const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Page content */}
            <div className="p-4 md:p-8">
                {children}
            </div>
        </div>
    );
}
