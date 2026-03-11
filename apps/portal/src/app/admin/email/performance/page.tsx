'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Mail, AlertTriangle, RefreshCw, BarChart2, Activity, Link, Inbox } from 'lucide-react';
import { getPerformanceMetrics, type PerformanceMetrics } from '@/app/actions/emailPerformance';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PerformancePage() {
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadData() {
        setLoading(true);
        setError(null);
        const res = await getPerformanceMetrics(30);
        if (res.error) {
            setError(res.error);
        } else if (res.data) {
            setMetrics(res.data);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    if (loading && !metrics) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="font-semibold">Loading Performance Data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-200">
                <AlertTriangle className="w-6 h-6 mb-2" />
                <h3 className="font-bold text-lg">Failed to load metrics</h3>
                <p className="text-sm opacity-80">{error}</p>
                <button onClick={loadData} className="mt-4 px-4 py-2 bg-red-100 font-bold rounded-lg hover:bg-red-200 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    if (!metrics) return null;

    const { totals, dailyVolume, templateBreakdown, recentAlerts } = metrics;
    const sent = totals.sent || 1; // avoid division by zero

    // Formatting helper
    const pct = (val: number, base: number) => `${((val / base) * 100).toFixed(1)}%`;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-indigo-600" />
                        Performance Dashboard
                    </h1>
                    <p className="text-base text-slate-500 mt-1 font-medium">Last 30 Days Outbound Activity</p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Sent"
                    value={totals.sent.toString()}
                    subvalue="via Resend API"
                    icon={Mail}
                    color="indigo"
                />
                <MetricCard
                    title="Open Rate"
                    value={pct(totals.opened, sent)}
                    subvalue={`${totals.opened} unique opens`}
                    icon={Activity}
                    color="emerald"
                />
                <MetricCard
                    title="Click Rate"
                    value={pct(totals.clicked, Math.max(totals.opened, 1))}
                    subvalue={`${totals.clicked} total clicks`}
                    icon={Link}
                    color="sky"
                />
                <MetricCard
                    title="Bounce Rate"
                    value={pct(totals.bounced, sent)}
                    subvalue={`${totals.bounced} hard bounces`}
                    icon={AlertTriangle}
                    color="rose"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column: Chart & Templates */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Volume Chart */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-indigo-500" /> Daily Volume
                        </h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="sent" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                                    <Area type="monotone" dataKey="opened" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOpened)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* A/B Testing Breakdowns */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Inbox className="w-5 h-5 text-indigo-500" /> A/B Testing (Templates)
                        </h2>
                        {templateBreakdown.length === 0 ? (
                            <p className="text-sm text-slate-500 py-8 text-center italic">No AI generated templates sent recently.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Template Name</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Sent</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Open %</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Click %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {templateBreakdown.map((t) => (
                                            <tr key={t.templateId} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <span className="font-semibold text-slate-800 text-sm">{t.templateName}</span>
                                                    <div className="text-xs text-slate-400 font-mono mt-0.5" title={t.templateId}>{t.templateId.split('-')[0]}...</div>
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm font-bold text-slate-700">{t.sent}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg">
                                                        {pct(t.opened, t.sent || 1)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="text-sm font-semibold text-sky-600">
                                                        {pct(t.clicked, Math.max(t.opened, 1))}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Alerts & Deliverability */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-rose-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-600" /> Bounces & Alerts
                        </h2>
                        {recentAlerts.length === 0 ? (
                            <div className="bg-white/60 p-4 rounded-2xl border border-rose-100/50 text-center text-rose-800 text-sm font-medium">
                                No recent deliverability issues. Your sending reputation is clean!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentAlerts.map(alert => (
                                    <div key={alert.id} className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100 flex flex-col gap-1.5 hover:-translate-y-0.5 transition-transform">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-rose-600 uppercase tracking-wide bg-rose-50 px-2 py-0.5 rounded">
                                                {alert.status}
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-medium">
                                                {new Date(alert.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 truncate" title={alert.to}>
                                            {alert.to}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                            {alert.subject}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

// ─── Reusable Metric Card ──────────────────────────────────────────

function MetricCard({ title, value, subvalue, icon: Icon, color }: any) {
    const colorMap: Record<string, string> = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        sky: 'bg-sky-50 text-sky-600',
        rose: 'bg-rose-50 text-rose-600',
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out ${colorMap[color].split(' ')[0]}`} />

            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-500 text-sm">{title}</h3>
                <div className={`p-2 rounded-xl ${colorMap[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">{subvalue}</p>
            </div>
        </div>
    );
}
