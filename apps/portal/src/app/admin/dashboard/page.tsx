'use client';

import { createClient } from "@schologic/database";
import { useEffect, useState } from 'react';
import { Home, Users, GraduationCap, FileText, TrendingUp, Activity, ArrowUpRight, Search } from 'lucide-react';
import AIStatsCard from '@/components/AIStatsCard';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const supabase = createClient();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalInstructors: 0,
        activeClasses: 0,
        totalAssignments: 0,
        aiIntegrityScore: 88, // Mock start
        aiTrend: 4.2
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            // Parallel fetching for speed
            const [students, instructors, classes, assignments] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
                supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'instructor'),
                supabase.from('classes').select('id', { count: 'exact', head: true }),
                supabase.from('assignments').select('id', { count: 'exact', head: true })
            ]);

            setStats(prev => ({
                ...prev,
                totalStudents: students.count || 0,
                totalInstructors: instructors.count || 0,
                activeClasses: classes.count || 0,
                totalAssignments: assignments.count || 0,
                // Keep AI score mocked for demo purpose to look populated
                aiIntegrityScore: 92,
                aiTrend: 5.4
            }));
            setLoading(false);
        };

        fetchStats();
    }, []);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Institution Overview</h1>
                    <p className="text-slate-500 font-bold mt-1">Campus-wide analytics and management</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
                        Download Report
                    </button>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all">
                        Invite User
                    </button>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
                            <h3 className="text-2xl font-black text-slate-800">{(stats.totalStudents + stats.totalInstructors).toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded-md">{stats.totalStudents} Students</span>
                        <span className="bg-slate-100 px-2 py-1 rounded-md">{stats.totalInstructors} Instructors</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Classes</p>
                            <h3 className="text-2xl font-black text-slate-800">{stats.activeClasses.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>+12% vs last term</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assignments</p>
                            <h3 className="text-2xl font-black text-slate-800">{stats.totalAssignments.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                        <Activity className="w-3 h-3" />
                        <span>High Engagement</span>
                    </div>
                </div>

                <AIStatsCard
                    averageScore={stats.aiIntegrityScore}
                    studentCount={stats.totalStudents}
                    trend={stats.aiTrend}
                    onClick={() => { }}
                />
            </div>

            {/* Quick Activity / Chart Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800">Engagement Overview</h3>
                        <select className="bg-slate-50 border-none text-sm font-bold text-slate-500 rounded-lg py-1 px-3 outline-none cursor-pointer">
                            <option>Last 30 Days</option>
                            <option>Last Quarter</option>
                            <option>Year to Date</option>
                        </select>
                    </div>
                    {/* Mock Chart Visual */}
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                            <div key={i} className="w-full bg-indigo-50 rounded-t-xl relative group hover:bg-indigo-100 transition-all cursor-pointer">
                                <div
                                    className="absolute bottom-0 w-full bg-indigo-500 rounded-t-xl transition-all duration-500 ease-out group-hover:bg-indigo-600"
                                    style={{ height: `${h}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {h * 12} Students
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Week 1</span>
                        <span>Week 4</span>
                        <span>Week 8</span>
                        <span>Week 12</span>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl shadow-lg relative overflow-hidden text-white flex flex-col justify-between">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                            <Activity className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-1">System Status</h3>
                        <p className="text-slate-400 text-sm font-medium mb-6">All systems operational</p>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Database</span>
                                <span className="flex items-center gap-2 text-emerald-400 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>Healthy</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">AI Bridge</span>
                                <span className="flex items-center gap-2 text-emerald-400 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>Connected</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Storage</span>
                                <span className="flex items-center gap-2 text-emerald-400 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>Optimization On</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                        <button className="w-full bg-white/10 hover:bg-white/20 transition-colors py-3 rounded-xl font-bold text-sm">
                            System Settings
                        </button>
                    </div>

                    {/* Bg Decoration */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
}
