'use client';

import { useState, useEffect } from 'react';
import { AnalyticsData, getUserAnalytics } from '@/app/actions/analytics';
import { subDays, startOfYear, format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Users, UserCheck, ShieldCheck, ArrowUpRight, Loader2 } from 'lucide-react';

interface UserAnalyticsCardsProps {
    range: string;
    onRangeChange: (r: string) => void;
}

export default function UserAnalyticsCards({ range, onRangeChange }: UserAnalyticsCardsProps) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');

            const end = new Date();
            let start = subDays(end, 30);
            if (range === '24h') start = subDays(end, 1);
            if (range === '7d') start = subDays(end, 7);
            if (range === '90d') start = subDays(end, 90);
            if (range === 'ytd') start = startOfYear(end);

            const res = await getUserAnalytics(start, end);
            if (res.error) setError(res.error);
            else if (res.data) setData(res.data);
            setLoading(false);
        };
        fetchData();
    }, [range]);

    if (error) return <div className="text-red-500 text-sm p-4">Error: {error}</div>;
    if (loading && !data) return <div className="animate-pulse h-32 bg-slate-100 rounded-xl" />;

    const { summary, chartData } = data!;

    return (
        <div className="space-y-6 mb-8">
            <div className="flex justify-end bg-white border border-slate-200 rounded-lg p-1 w-fit ml-auto">
                {[{ k: '24h', l: '24H' }, { k: '7d', l: '7D' }, { k: '30d', l: '30D' }, { k: '90d', l: '90D' }, { k: 'ytd', l: 'YTD' }].map(opt => (
                    <button
                        key={opt.k}
                        onClick={() => onRangeChange(opt.k)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${range === opt.k ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        {opt.l}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Active Users" value={summary.totalActiveUsers} icon={Users} color="indigo" />
                <KpiCard title="New Signups" value={summary.newSignups} icon={UserCheck} color="blue" sub={`${summary.activeInstructors} Inst · ${summary.activeStudents} Stud`} />
                <KpiCard title="Conversions" value={summary.conversions} icon={ShieldCheck} color="emerald" sub="Demo to Paid" />
                <KpiCard title="Conv. Rate" value={summary.newSignups > 0 ? `${((summary.conversions / summary.newSignups) * 100).toFixed(1)}%` : '0%'} icon={ArrowUpRight} color="amber" sub="Of new signups" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-[300px]">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Activity Trends</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tickFormatter={(str) => format(new Date(str), 'MMM d')} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="activeUsers" name="Active Users" stroke="#6366f1" fill="url(#colorActive)" />
                        <Area type="monotone" dataKey="newSignups" name="New Signups" stroke="#3b82f6" fillOpacity={0} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon: Icon, color, sub }: any) {
    const bg = { indigo: 'bg-indigo-50 text-indigo-600', blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600' }[color as string];
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg ${bg}`}><Icon className="w-5 h-5" /></div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase">{title}</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{value}</h3>
            {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
        </div>
    );
}
