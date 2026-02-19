'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@schologic/database';
import { Zap, RefreshCw, TrendingUp, BarChart2, Users, ChevronRight, X, ArrowUpRight, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────
interface UsageLog {
    id: string;
    instructor_id: string | null;
    endpoint: string;
    provider: string;
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    is_demo: boolean;
    created_at: string;
}

interface InstructorProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    is_demo: boolean | null;
}

interface ModelStat {
    model: string;
    provider: string;
    calls: number;
    totalTokens: number;
    avgTokens: number;
    pct: number;
}

interface InstructorStat {
    id: string;
    full_name: string | null;
    email: string | null;
    is_demo: boolean | null;
    calls: number;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    byEndpoint: { endpoint: string; calls: number; tokens: number }[];
}

interface DailyPoint { date: string; tokens: number; calls: number; }

// ─── Helpers ─────────────────────────────────────────────────────────────
function formatTokens(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

function endpointLabel(e: string): string {
    const map: Record<string, string> = {
        '/api/assistant': 'Submission Feedback',
        '/api/rubric/generate': 'Rubric Builder',
        '/api/analyze': 'AI Detection',
        '/actions/summarize': 'Summarization',
    };
    return map[e] ?? e;
}

function providerBadge(provider: string) {
    const styles: Record<string, string> = {
        publicai: 'bg-violet-100 text-violet-700',
        huggingface: 'bg-yellow-100 text-yellow-700',
    };
    const labels: Record<string, string> = {
        publicai: 'PublicAI',
        huggingface: 'HuggingFace',
    };
    return (
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${styles[provider] ?? 'bg-slate-100 text-slate-600'}`}>
            {labels[provider] ?? provider}
        </span>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function AiUsagePage() {
    const supabase = createClient();
    const [logs, setLogs] = useState<UsageLog[]>([]);
    const [profiles, setProfiles] = useState<InstructorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const [selectedInstructor, setSelectedInstructor] = useState<InstructorStat | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [logsRes, profilesRes] = await Promise.all([
            supabase.from('api_usage_logs').select('*').order('created_at', { ascending: true }),
            supabase.from('profiles').select('id, full_name, email, is_demo').in('role', ['instructor', 'superadmin']),
        ]);
        setLogs((logsRes.data ?? []) as UsageLog[]);
        setProfiles((profilesRes.data ?? []) as InstructorProfile[]);
        setLastRefreshed(new Date());
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Loading AI Usage data...</p>
                </div>
            </div>
        );
    }

    // ── Derived Stats ──────────────────────────────────────────────────
    const totalTokens = logs.reduce((s, l) => s + (l.total_tokens ?? 0), 0);
    const totalCalls = logs.length;
    const avgTokens = totalCalls > 0 ? Math.round(totalTokens / totalCalls) : 0;
    const standardTokens = logs.filter(l => !l.is_demo).reduce((s, l) => s + (l.total_tokens ?? 0), 0);
    const demoTokens = totalTokens - standardTokens;
    const standardPct = totalTokens > 0 ? Math.round((standardTokens / totalTokens) * 100) : 0;

    // Daily trend (last 30 days)
    const dailyMap: Record<string, DailyPoint> = {};
    for (let i = 29; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'MMM dd');
        dailyMap[d] = { date: d, tokens: 0, calls: 0 };
    }
    logs.forEach(l => {
        const d = format(new Date(l.created_at), 'MMM dd');
        if (dailyMap[d]) {
            dailyMap[d].tokens += l.total_tokens ?? 0;
            dailyMap[d].calls += 1;
        }
    });
    const dailyData = Object.values(dailyMap);

    // Model breakdown
    const modelMap: Record<string, { provider: string; calls: number; totalTokens: number }> = {};
    logs.forEach(l => {
        const key = l.model;
        if (!modelMap[key]) modelMap[key] = { provider: l.provider, calls: 0, totalTokens: 0 };
        modelMap[key].calls++;
        modelMap[key].totalTokens += l.total_tokens ?? 0;
    });
    const modelStats: ModelStat[] = Object.entries(modelMap)
        .map(([model, s]) => ({
            model,
            provider: s.provider,
            calls: s.calls,
            totalTokens: s.totalTokens,
            avgTokens: s.calls > 0 ? Math.round(s.totalTokens / s.calls) : 0,
            pct: totalTokens > 0 ? Math.round((s.totalTokens / totalTokens) * 100) : 0,
        }))
        .sort((a, b) => b.totalTokens - a.totalTokens);

    // Instructor leaderboard
    const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
    const instructorMap: Record<string, InstructorStat> = {};
    logs.forEach(l => {
        if (!l.instructor_id) return;
        if (!instructorMap[l.instructor_id]) {
            const p = profileMap[l.instructor_id];
            instructorMap[l.instructor_id] = {
                id: l.instructor_id,
                full_name: p?.full_name ?? null,
                email: p?.email ?? null,
                is_demo: p?.is_demo ?? null,
                calls: 0, totalTokens: 0, promptTokens: 0, completionTokens: 0,
                byEndpoint: [],
            };
        }
        const stat = instructorMap[l.instructor_id];
        stat.calls++;
        stat.totalTokens += l.total_tokens ?? 0;
        stat.promptTokens += l.prompt_tokens ?? 0;
        stat.completionTokens += l.completion_tokens ?? 0;

        const ep = stat.byEndpoint.find(e => e.endpoint === l.endpoint);
        if (ep) { ep.calls++; ep.tokens += l.total_tokens ?? 0; }
        else stat.byEndpoint.push({ endpoint: l.endpoint, calls: 1, tokens: l.total_tokens ?? 0 });
    });
    const instructorStats = Object.values(instructorMap).sort((a, b) => b.totalTokens - a.totalTokens);

    const MODEL_COLORS = ['#7c3aed', '#4f46e5', '#0891b2', '#0d9488', '#65a30d'];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-6 h-6 text-violet-600" />
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">AI Usage</h1>
                    </div>
                    <p className="text-slate-500">Token consumption & model analytics across all AI features</p>
                </div>
                <button
                    onClick={fetchData}
                    className="mt-3 md:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                    <span className="text-xs text-slate-400 ml-1">{lastRefreshed.toLocaleTimeString()}</span>
                </button>
            </div>

            {/* ── Section 1: Platform KPIs ───────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KPICard icon={Zap} label="Total Tokens" value={formatTokens(totalTokens)} sub="All time" color="violet" />
                <KPICard icon={Activity} label="Total Calls" value={totalCalls.toLocaleString()} sub="AI API requests" color="indigo" />
                <KPICard icon={TrendingUp} label="Avg Tokens / Call" value={formatTokens(avgTokens)} color="blue" />
                <KPICard
                    icon={BarChart2}
                    label="Standard vs Demo"
                    value={`${standardPct}% Std`}
                    sub={`${formatTokens(standardTokens)} std · ${formatTokens(demoTokens)} demo`}
                    color="emerald"
                />
            </div>

            {/* ── Section 2: Daily Trend Chart ──────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-slate-800 text-lg">Token Burn — Last 30 Days</h2>
                    <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">Daily</span>
                </div>
                {totalTokens === 0 ? (
                    <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No usage data yet</div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={dailyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                tickLine={false}
                                axisLine={false}
                                interval={4}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={v => formatTokens(v)}
                                width={45}
                            />
                            <Tooltip
                                formatter={(v) => [formatTokens(v as number), 'Tokens']}
                                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                            />
                            <Bar dataKey="tokens" radius={[4, 4, 0, 0]} maxBarSize={32}>
                                {dailyData.map((_, i) => (
                                    <Cell key={i} fill={_.tokens > 0 ? '#7c3aed' : '#e2e8f0'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ── Sections 3 & 4: Model Breakdown + Instructor Leaderboard ─ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Model Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-bold text-slate-800">Model Breakdown</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Ranked by total token usage</p>
                    </div>
                    {modelStats.length === 0 ? (
                        <p className="px-6 py-8 text-center text-slate-400 text-sm">No model data yet</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {modelStats.map((m, i) => (
                                <div key={m.model} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-xs font-bold text-slate-400 w-4">#{i + 1}</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]" title={m.model}>
                                                    {m.model.split('/').pop()}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {providerBadge(m.provider)}
                                                    <span className="text-xs text-slate-400">{m.calls} calls</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                            <p className="font-extrabold text-slate-800 text-sm">{formatTokens(m.totalTokens)}</p>
                                            <p className="text-xs text-slate-400">{formatTokens(m.avgTokens)}/call</p>
                                        </div>
                                    </div>
                                    {/* Usage bar */}
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{ width: `${m.pct}%`, backgroundColor: MODEL_COLORS[i] ?? '#94a3b8' }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">{m.pct}% of total usage</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Instructor Leaderboard */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-bold text-slate-800">Instructor Leaderboard</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Click to view detailed breakdown</p>
                    </div>
                    {instructorStats.length === 0 ? (
                        <p className="px-6 py-8 text-center text-slate-400 text-sm">No instructor usage yet</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {instructorStats.map((ins, i) => (
                                <button
                                    key={ins.id}
                                    onClick={() => setSelectedInstructor(ins)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                            style={{ backgroundColor: MODEL_COLORS[i % MODEL_COLORS.length] }}
                                        >
                                            {(ins.full_name ?? ins.email ?? '?')[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{ins.full_name ?? 'Unnamed'}</p>
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-xs text-slate-400 truncate">{ins.email}</p>
                                                {ins.is_demo && (
                                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1 py-0.5 rounded uppercase">Demo</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-3">
                                        <div className="text-right">
                                            <p className="font-extrabold text-slate-800 text-sm">{formatTokens(ins.totalTokens)}</p>
                                            <p className="text-xs text-slate-400">{ins.calls} calls</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Instructor Detail Panel ──────────────────────────── */}
            {selectedInstructor && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedInstructor(null)} />
                    {/* Panel */}
                    <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col animate-slide-in-right">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
                                    {(selectedInstructor.full_name ?? selectedInstructor.email ?? '?')[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{selectedInstructor.full_name ?? 'Unnamed'}</p>
                                    <p className="text-xs text-slate-400">{selectedInstructor.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedInstructor(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* KPIs */}
                        <div className="p-6 border-b border-slate-100">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-violet-50 rounded-xl p-4">
                                    <p className="text-xs font-bold uppercase text-violet-500 tracking-wide">Total Tokens</p>
                                    <p className="text-2xl font-extrabold text-violet-700 mt-1">{formatTokens(selectedInstructor.totalTokens)}</p>
                                </div>
                                <div className="bg-indigo-50 rounded-xl p-4">
                                    <p className="text-xs font-bold uppercase text-indigo-500 tracking-wide">Total Calls</p>
                                    <p className="text-2xl font-extrabold text-indigo-700 mt-1">{selectedInstructor.calls}</p>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <p className="text-xs font-bold uppercase text-blue-500 tracking-wide">Prompt Tokens</p>
                                    <p className="text-xl font-extrabold text-blue-700 mt-1">{formatTokens(selectedInstructor.promptTokens)}</p>
                                </div>
                                <div className="bg-teal-50 rounded-xl p-4">
                                    <p className="text-xs font-bold uppercase text-teal-500 tracking-wide">Completion Tokens</p>
                                    <p className="text-xl font-extrabold text-teal-700 mt-1">{formatTokens(selectedInstructor.completionTokens)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown by Feature */}
                        <div className="p-6">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Usage by Feature</h3>
                            <div className="space-y-3">
                                {selectedInstructor.byEndpoint.sort((a, b) => b.tokens - a.tokens).map(ep => {
                                    const pct = selectedInstructor.totalTokens > 0
                                        ? Math.round((ep.tokens / selectedInstructor.totalTokens) * 100) : 0;
                                    return (
                                        <div key={ep.endpoint} className="bg-slate-50 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{endpointLabel(ep.endpoint)}</p>
                                                    <p className="text-xs text-slate-400">{ep.calls} calls</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-extrabold text-slate-700">{formatTokens(ep.tokens)}</p>
                                                    <p className="text-xs text-slate-400">{pct}%</p>
                                                </div>
                                            </div>
                                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {selectedInstructor.byEndpoint.length === 0 && (
                                    <p className="text-slate-400 text-sm text-center py-4">No feature breakdown available</p>
                                )}
                            </div>
                        </div>

                        {/* View User Profile Link */}
                        <div className="px-6 pb-6 mt-auto">
                            <a
                                href={`/admin/users`}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors"
                            >
                                <Users className="w-4 h-4" />
                                View in User Management
                                <ArrowUpRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, { bg: string; text: string; icon: string }> = {
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', icon: 'text-violet-500' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500' },
};

function KPICard({ icon: Icon, label, value, sub, color }: {
    icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
    const c = COLOR_MAP[color] ?? COLOR_MAP.indigo;
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
