'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@schologic/database';
import {
    Users, UserCheck, UserX, Zap, GraduationCap, BookOpen,
    ClipboardList, AlertTriangle, Shield, TrendingUp, ArrowUpRight, Briefcase, RefreshCw
} from 'lucide-react';
import { getRoleLabel } from '@/lib/identity';

// ─── Types ────────────────────────────────────────────────────────────
interface KPIData {
    // Users
    totalUsers: number;
    instructors: number;
    students: number;
    activeUsers: number;
    suspendedUsers: number;
    // Demo
    demoSignups: number;
    demoConversions: number;
    conversionRate: number;
    // Platform
    totalClasses: number;
    totalEnrollments: number;
    avgStudentsPerClass: number;
    totalAssignments: number;
    totalSubmissions: number;
    gradedSubmissions: number;
    ungradedSubmissions: number;
    totalPracticums: number;
    practicumEnrollments: number;
    // AI
    totalTokensBurned: number;
    demoTokens: number;
    standardTokens: number;
    // Errors & Security
    recentErrors: number;
    recentSecurityEvents: number;
}

interface RecentUser {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    is_demo: boolean | null;
}

interface RecentSecurityEvent {
    id: string;
    event_type: string;
    path: string;
    user_role: string | null;
    created_at: string;
}

// ─── Component ────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
    const supabase = createClient();
    const [kpis, setKpis] = useState<KPIData | null>(null);
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [recentSecurity, setRecentSecurity] = useState<RecentSecurityEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const now = new Date();
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

            // Parallel queries for maximum speed
            const [
                profilesRes,
                classesRes,
                enrollmentsRes,
                assignmentsRes,
                submissionsRes,
                practicumsRes,
                practicumEnrollRes,
                tokensRes,
                errorsRes,
                securityRes,
                recentUsersRes,
                recentSecurityRes,
            ] = await Promise.all([
                // 1. Profiles breakdown
                supabase.from('profiles').select('role, is_active, is_demo, demo_converted_at'),
                // 2. Classes
                supabase.from('classes').select('id', { count: 'exact', head: true }),
                // 3. Enrollments
                supabase.from('enrollments').select('id', { count: 'exact', head: true }),
                // 4. Assignments
                supabase.from('assignments').select('id', { count: 'exact', head: true }),
                // 5. Submissions (with grade status)
                supabase.from('submissions').select('grade'),
                // 6. Practicums
                supabase.from('practicums').select('id', { count: 'exact', head: true }),
                // 7. Practicum Enrollments
                supabase.from('practicum_enrollments').select('id', { count: 'exact', head: true }),
                // 8. Token burn
                supabase.from('api_usage_logs').select('total_tokens, is_demo'),
                // 9. Recent errors (24h)
                supabase.from('system_errors').select('id', { count: 'exact', head: true }).gte('created_at', twentyFourHoursAgo),
                // 10. Recent security events (24h)
                supabase.from('security_events').select('id', { count: 'exact', head: true }).gte('created_at', twentyFourHoursAgo),
                // 11. Recent users (last 10)
                supabase.from('profiles').select('id, full_name, email, role, is_demo').limit(10),
                // 12. Recent security events (last 10)
                supabase.from('security_events').select('id, event_type, path, user_role, created_at').order('created_at', { ascending: false }).limit(10),
            ]);

            // Process profiles
            const profiles = (profilesRes.data || []) as any[];
            const instructors = profiles.filter((p: any) => p.role === 'instructor').length;
            const students = profiles.filter((p: any) => p.role === 'student').length;
            const activeUsers = profiles.filter((p: any) => p.is_active !== false).length;
            const suspendedUsers = profiles.filter((p: any) => p.is_active === false).length;
            const demoSignups = profiles.filter((p: any) => p.is_demo === true).length;
            const demoConversions = profiles.filter((p: any) => p.demo_converted_at != null).length;
            const totalDemoEver = demoSignups + demoConversions; // current demos + already converted
            const conversionRate = totalDemoEver > 0 ? Math.round((demoConversions / totalDemoEver) * 100) : 0;

            // Process submissions
            const submissions = (submissionsRes.data || []) as any[];
            const gradedSubmissions = submissions.filter((s: any) => s.grade != null).length;
            const ungradedSubmissions = submissions.length - gradedSubmissions;

            // Process tokens
            const tokenLogs = (tokensRes.data || []) as any[];
            const totalTokensBurned = tokenLogs.reduce((sum: number, l: any) => sum + (l.total_tokens || 0), 0);
            const demoTokens = tokenLogs.filter((l: any) => l.is_demo).reduce((sum: number, l: any) => sum + (l.total_tokens || 0), 0);
            const standardTokens = totalTokensBurned - demoTokens;

            // Avg students per class
            const totalClasses = classesRes.count || 0;
            const totalEnrollments = enrollmentsRes.count || 0;
            const avgStudentsPerClass = totalClasses > 0 ? Math.round((totalEnrollments / totalClasses) * 10) / 10 : 0;

            setKpis({
                totalUsers: profiles.length,
                instructors,
                students,
                activeUsers,
                suspendedUsers,
                demoSignups,
                demoConversions,
                conversionRate,
                totalClasses,
                totalEnrollments,
                avgStudentsPerClass,
                totalAssignments: assignmentsRes.count || 0,
                totalSubmissions: submissions.length,
                gradedSubmissions,
                ungradedSubmissions,
                totalPracticums: practicumsRes.count || 0,
                practicumEnrollments: practicumEnrollRes.count || 0,
                totalTokensBurned,
                demoTokens,
                standardTokens,
                recentErrors: errorsRes.count || 0,
                recentSecurityEvents: securityRes.count || 0,
            });

            setRecentUsers((recentUsersRes.data || []) as RecentUser[]);
            setRecentSecurity((recentSecurityRes.data || []) as RecentSecurityEvent[]);
            setLastRefreshed(new Date());
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading || !kpis) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-500 mt-1">Platform overview &amp; key metrics</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="mt-3 md:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                    <span className="text-xs text-slate-400 ml-1">
                        {lastRefreshed.toLocaleTimeString()}
                    </span>
                </button>
            </div>

            {/* ─── KPI Grid ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KPICard icon={Users} label="Total Users" value={kpis.totalUsers} sub={`${kpis.instructors} instructors · ${kpis.students} students`} color="indigo" />
                <KPICard icon={UserCheck} label="Active Users" value={kpis.activeUsers} color="emerald" />
                <KPICard icon={UserX} label="Suspended" value={kpis.suspendedUsers} color="red" />
                <KPICard icon={TrendingUp} label="Demo → Standard" value={`${kpis.conversionRate}%`} sub={`${kpis.demoConversions} of ${kpis.demoSignups + kpis.demoConversions} demos`} color="violet" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KPICard icon={GraduationCap} label="Classes" value={kpis.totalClasses} sub={`Avg ${kpis.avgStudentsPerClass} students/class`} color="amber" />
                <KPICard icon={ArrowUpRight} label="Enrollments" value={kpis.totalEnrollments} color="blue" />
                <KPICard icon={BookOpen} label="Assignments" value={kpis.totalAssignments} color="teal" />
                <KPICard icon={ClipboardList} label="Submissions" value={kpis.totalSubmissions} sub={`${kpis.gradedSubmissions} graded · ${kpis.ungradedSubmissions} pending`} color="cyan" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KPICard icon={Briefcase} label="Practicums" value={kpis.totalPracticums} sub={`${kpis.practicumEnrollments} enrolled`} color="orange" />
                <KPICard icon={Zap} label="AI Tokens Burned" value={formatTokens(kpis.totalTokensBurned)} sub={`${formatTokens(kpis.standardTokens)} std · ${formatTokens(kpis.demoTokens)} demo`} color="rose" />
                <KPICard icon={AlertTriangle} label="Errors (24h)" value={kpis.recentErrors} color={kpis.recentErrors > 0 ? 'red' : 'emerald'} />
                <KPICard icon={Shield} label="Security (24h)" value={kpis.recentSecurityEvents} color={kpis.recentSecurityEvents > 5 ? 'red' : 'slate'} />
            </div>

            {/* ─── Tables ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-800">Recent Registrations</h2>
                        <span className="text-xs text-slate-400">Last 10</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentUsers.map(u => (
                            <div key={u.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-slate-800 truncate">{u.full_name || 'No Name'}</p>
                                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                </div>
                                <div className="flex items-center gap-2 ml-3 shrink-0">
                                    {u.is_demo && (
                                        <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Demo</span>
                                    )}
                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${u.role === 'instructor' ? 'bg-indigo-100 text-indigo-700' :
                                        u.role === 'superadmin' ? 'bg-rose-100 text-rose-700' :
                                            'bg-emerald-100 text-emerald-700'
                                        }`}>
                                        {getRoleLabel(u.role)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {recentUsers.length === 0 && (
                            <p className="px-6 py-8 text-center text-slate-400 text-sm">No users yet</p>
                        )}
                    </div>
                </div>

                {/* Recent Security Events */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-800">Recent Security Events</h2>
                        <span className="text-xs text-slate-400">Last 10</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentSecurity.map(e => (
                            <div key={e.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-slate-800">{formatEventType(e.event_type)}</p>
                                    <p className="text-xs text-slate-400 truncate">{e.path}</p>
                                </div>
                                <div className="flex items-center gap-2 ml-3 shrink-0">
                                    {e.user_role && (
                                        <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{e.user_role}</span>
                                    )}
                                    <span className="text-xs text-slate-400">{timeAgo(e.created_at)}</span>
                                </div>
                            </div>
                        ))}
                        {recentSecurity.length === 0 && (
                            <p className="px-6 py-8 text-center text-slate-400 text-sm">No security events yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Sub-Components ───────────────────────────────────────────────────
const COLOR_MAP: Record<string, { bg: string; text: string; icon: string }> = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500' },
    red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-500' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', icon: 'text-violet-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', icon: 'text-teal-500' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', icon: 'text-cyan-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', icon: 'text-rose-500' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', icon: 'text-slate-500' },
};

function KPICard({ icon: Icon, label, value, sub, color }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    color: string;
}) {
    const c = COLOR_MAP[color] || COLOR_MAP.slate;

    return (
        <div className={`${c.bg} rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${c.icon}`} />
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
            </div>
            <p className={`text-2xl md:text-3xl font-extrabold ${c.text} tracking-tight`}>{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────
function formatTokens(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

function formatEventType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
