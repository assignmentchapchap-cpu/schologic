'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@schologic/database';
import {
    Shield, Search, Filter, Calendar, Terminal, User, Globe, Info,
    Lock, Zap, RefreshCw, ChevronLeft, ChevronRight,
    MapPin, Monitor, AlertCircle
} from 'lucide-react';
import { getRoleLabel } from '@/lib/identity';
import { useUser } from '@/context/UserContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ─── Types ────────────────────────────────────────────────────────────
interface SecurityEvent {
    id: string;
    event_type: string;
    path: string;
    user_id: string | null;
    user_role: string | null;
    target_role: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string | null;
    profiles?: {
        full_name: string | null;
        email: string | null;
    } | null;
}

// ─── Component ────────────────────────────────────────────────────────
export default function SecurityAuditPage() {
    const supabase = createClient();
    const { user: currentUser } = useUser();

    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 50;

    const fetchEvents = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('security_events')
                .select(`
                    *,
                    profiles:user_id (
                        full_name,
                        email
                    )
                `, { count: 'exact' })
                .order('created_at', { ascending: false });

            if (filterType !== 'all') {
                query = query.eq('event_type', filterType);
            }

            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            const { data, count, error } = await query.range(from, to);

            if (error) throw error;

            setEvents(data || []);
            if (count) {
                setTotalPages(Math.ceil(count / itemsPerPage));
            }
        } catch (err) {
            console.error('[SecurityAudit] Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [page, filterType]);

    const filteredEvents = useMemo(() => {
        if (!searchQuery) return events;
        const q = searchQuery.toLowerCase();
        return events.filter(e =>
            e.path.toLowerCase().includes(q) ||
            e.event_type.toLowerCase().includes(q) ||
            e.user_id?.toLowerCase().includes(q) ||
            e.profiles?.full_name?.toLowerCase().includes(q) ||
            e.profiles?.email?.toLowerCase().includes(q)
        );
    }, [events, searchQuery]);

    const getEventBadge = (type: string) => {
        switch (type) {
            case 'unauthorized_access':
                return { bg: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Unauthorized Access' };
            case 'role_mismatch':
                return { bg: 'bg-amber-100 text-amber-700', icon: Lock, label: 'Role Mismatch' };
            case 'deactivated_access':
                return { bg: 'bg-slate-100 text-slate-700', icon: Zap, label: 'Deactivated User' };
            case 'demo_restricted':
                return { bg: 'bg-blue-100 text-blue-700', icon: Info, label: 'Demo Restriction' };
            default:
                return { bg: 'bg-indigo-100 text-indigo-700', icon: Shield, label: type.replace(/_/g, ' ') };
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-600 rounded-2xl shadow-lg shadow-rose-200">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Security Audit Log</h1>
                        <p className="text-slate-500 mt-1">Monitor platform access and authorization incidents</p>
                    </div>
                </div>

                <button
                    onClick={() => { setPage(1); fetchEvents(); }}
                    className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    Refresh Logs
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by path, user, or event type..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            className="bg-slate-50 border border-slate-200 rounded-xl text-sm py-2 px-4 focus:ring-2 focus:ring-rose-500 outline-none cursor-pointer"
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                        >
                            <option value="all">All Event Types</option>
                            <option value="unauthorized_access">Unauthorized Access</option>
                            <option value="role_mismatch">Role Mismatch</option>
                            <option value="deactivated_access">Deactivated Account</option>
                            <option value="demo_restricted">Demo Restriction</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Event & Type</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Path</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User Context</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Device/Network</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8 h-16 bg-slate-50/50" />
                                    </tr>
                                ))
                            ) : filteredEvents.length > 0 ? (
                                filteredEvents.map((event) => {
                                    const badge = getEventBadge(event.event_type);
                                    const Icon = badge.icon;

                                    return (
                                        <tr key={event.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("p-2 rounded-lg", badge.bg)}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-sm whitespace-nowrap">
                                                        {badge.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 group/path">
                                                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                                                    <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                                        {event.path}
                                                    </code>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {event.user_id ? (
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5">
                                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                                            <span className="font-bold text-sm text-slate-800">
                                                                {event.profiles?.full_name || 'Anonymous'}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-slate-500 ml-5">
                                                            {getRoleLabel(event.user_role)} • {event.profiles?.email || event.user_id}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-slate-400 grayscale">
                                                        <User className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-medium">Guest / Initial Login</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                        {event.ip_address || 'Unknown IP'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 max-w-[200px] truncate" title={event.user_agent || undefined}>
                                                        <Monitor className="w-3.5 h-3.5 shrink-0" />
                                                        {event.user_agent || 'Unknown UA'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {event.created_at ? new Date(event.created_at).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {event.created_at ? new Date(event.created_at).toLocaleTimeString() : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Shield className="w-12 h-12 text-slate-200" />
                                            <p className="text-slate-500 font-medium">No security events found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Page <span className="font-bold text-slate-800">{page}</span> of <span className="font-bold text-slate-800">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-600" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
