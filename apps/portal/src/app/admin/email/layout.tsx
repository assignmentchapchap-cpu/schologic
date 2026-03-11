'use client';

// @ts-expect-error - False positive in local LSP environment
import { usePathname, useRouter } from 'next/navigation';
// @ts-expect-error - False positive in local LSP environment
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Inbox, Send, Pencil, Users, BookOpen, Search, X, TrendingUp } from 'lucide-react';
import { searchEmailsGlobal } from '@/app/actions/adminEmails';
import { useDebounce } from 'use-debounce';

const EMAIL_TABS = [
    { label: 'Inbox', icon: Inbox, href: '/admin/email/inbox' },
    { label: 'Sent', icon: Send, href: '/admin/email/sent' },
    { label: 'Drafts', icon: Pencil, href: '/admin/email/drafts' },
    { label: 'Mailing Lists', icon: Users, href: '/admin/email/mailing-lists' },
    { label: 'Templates', icon: BookOpen, href: '/admin/email/templates' },
    { label: 'Performance', icon: TrendingUp, href: '/admin/email/performance' },
];

interface SearchResult {
    id: string;
    from_email: string;
    to_emails: string[];
    subject: string;
    created_at: string;
    folder: string;
}

export default function EmailLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 400);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Search when debounced value changes
    useEffect(() => {
        if (!debouncedSearch.trim()) {
            setResults([]);
            setShowResults(false);
            return;
        }

        async function doSearch() {
            setSearching(true);
            const res = await searchEmailsGlobal(debouncedSearch);
            // Flatten into individual results with folder tags
            const flat: SearchResult[] = [
                ...(res.inbox || []).map((e: any) => ({ ...e, folder: 'inbox' })),
                ...(res.sent || []).map((e: any) => ({ ...e, folder: 'sent' })),
                ...(res.drafts || []).map((e: any) => ({ ...e, folder: 'drafts' })),
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setResults(flat);
            setShowResults(true);
            setSearching(false);
        }

        doSearch();
    }, [debouncedSearch]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function navigateToResult(folder: string, emailId: string) {
        setShowResults(false);
        setSearch('');
        router.push(`/admin/email/${folder}?select=${emailId}`);
    }

    const folderMeta: Record<string, { label: string; color: string; icon: any }> = {
        inbox: { label: 'Inbox', color: 'text-indigo-600 bg-indigo-50', icon: Inbox },
        sent: { label: 'Sent', color: 'text-emerald-600 bg-emerald-50', icon: Send },
        drafts: { label: 'Draft', color: 'text-amber-600 bg-amber-50', icon: Pencil },
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sub-navigation header */}
            <div className="bg-white border-b border-slate-200 px-4 md:px-8">
                <div className="flex items-center gap-2 py-1">
                    {/* Tabs — scrollable */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
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

                    {/* Universal Search — right side, outside scroll container */}
                    <div className="relative shrink-0" ref={dropdownRef}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search all emails..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setShowResults(true); }}
                                onFocus={() => { if (results.length > 0) setShowResults(true); }}
                                className="w-56 lg:w-72 pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white transition-all"
                            />
                            {search && (
                                <button
                                    onClick={() => { setSearch(''); setResults([]); setShowResults(false); }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Results Dropdown — fixed positioned to escape any overflow */}
                        {showResults && search.trim() && (
                            <div className="absolute right-0 top-full mt-2 w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] max-h-[70vh] overflow-y-auto">
                                {searching ? (
                                    <div className="flex items-center justify-center py-8 text-slate-400">
                                        <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
                                        <span className="ml-2 text-sm">Searching...</span>
                                    </div>
                                ) : results.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                        <Search className="w-6 h-6 mb-2 opacity-50" />
                                        <p className="text-sm font-semibold">No results found</p>
                                        <p className="text-xs mt-1">Try different search terms</p>
                                    </div>
                                ) : (
                                    <div className="py-1">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <span className="text-xs font-semibold text-slate-400">{results.length} result{results.length !== 1 ? 's' : ''} found</span>
                                        </div>
                                        {results.map(email => {
                                            const meta = folderMeta[email.folder];
                                            const FolderIcon = meta.icon;
                                            return (
                                                <button
                                                    key={email.id}
                                                    onClick={() => navigateToResult(email.folder, email.id)}
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 border-b border-slate-50 last:border-0"
                                                >
                                                    <FolderIcon className={`w-4 h-4 mt-0.5 shrink-0 ${meta.color.split(' ')[0]}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium text-slate-800 truncate flex-1">
                                                                {email.subject || '(no subject)'}
                                                            </p>
                                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${meta.color} shrink-0`}>
                                                                {meta.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                                            {email.folder === 'sent'
                                                                ? `To: ${email.to_emails?.join(', ')}`
                                                                : email.from_email
                                                            }
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                                            {new Date(email.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Page content */}
            <div className="p-4 md:p-8">
                {children}
            </div>
        </div>
    );
}
