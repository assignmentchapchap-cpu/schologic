import { MockSidebar } from './MockSidebar';
import { usePilotForm } from "@/components/pilot/PilotFormContext";
import {
    Users, UserCheck, UserX, Zap, GraduationCap, BookOpen,
    ClipboardList, AlertTriangle, Shield, TrendingUp, ArrowUpRight,
    Briefcase, Activity, Clock, FileCheck, FileText, HardDrive
} from 'lucide-react';
import { DEMO_CLASS, DEMO_STUDENTS, DEMO_ASSIGNMENTS, DEMO_AI_REPORTS, DEMO_PRACTICUM } from '@/lib/demo-data';

const COLOR_MAP: Record<string, { bg: string; text: string; icon: string }> = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500' },
    red: { bg: 'bg-rose-50', text: 'text-rose-700', icon: 'text-rose-500' },
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
        <div className={`${c.bg} rounded-2xl p-4 border border-white/60 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${c.icon}`} />
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-slate-500 truncate">{label}</span>
            </div>
            <p className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800">{value}</p>
            {sub && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{sub}</p>}
        </div>
    );
}

// Map real KPI titles to demo data config
function getDemoKpiProps(title: string) {
    switch (title) {
        case "Total Users": return { icon: Users, value: DEMO_STUDENTS.length + 5, sub: "5 instructors · students", color: "indigo" };
        case "Total Classes": return { icon: GraduationCap, value: "12", sub: "Active this term", color: "amber" };
        case "Active Assignments": return { icon: ClipboardList, value: "14", sub: "Across classes", color: "teal" };
        case "Storage Usage": return { icon: HardDrive, value: "84%", sub: "4.2 TB / 5 TB", color: "blue" };
        case "Admin Hours Saved": return { icon: Clock, value: "~45 Hrs", sub: "Monthly", color: "indigo" };
        case "Student Participation Rate": return { icon: Activity, value: "92%", sub: "Active this week", color: "emerald" };
        case "Assessor Hours Saved": return { icon: Clock, value: "12 Docs", sub: "Weekly", color: "orange" };
        case "Confidence in Digital Logs": return { icon: Shield, value: "4.8/5", sub: "Average rating", color: "blue" };
        case "Supervisor Turnaround Time": return { icon: FileCheck, value: "< 24 Hrs", sub: "Average", color: "teal" };
        case "AI-Generated Submissions Detected": return { icon: Zap, value: "24", sub: "Flagged this week", color: "rose" };
        case "System Usage": return { icon: HardDrive, value: "84%", sub: "4.2 TB / 5 TB", color: "blue" };
        case "Grading Hours Saved": return { icon: Clock, value: "~18 Hrs", sub: "Weekly", color: "violet" };
        case "Textbook Cost Savings": return { icon: TrendingUp, value: "$14.5K", sub: "YTD Savings", color: "emerald" };
        case "Resource Read Rate": return { icon: BookOpen, value: "78%", sub: "OER completion", color: "cyan" };
        case "Ease of Resource Access": return { icon: Shield, value: "4.9/5", sub: "User rating", color: "amber" };
        default: return { icon: Activity, value: "N/A", color: "slate" };
    }
}

export function MockDashboard({ layoutId, selectedWidgets = [] }: { layoutId: string, selectedWidgets?: string[] }) {
    // Default system metrics if none selected or space available
    const systemWidgets = [
        <KPICard key="sys_users" icon={Users} label="Total Users" value={DEMO_STUDENTS.length + 5} sub={`5 instructors · ${DEMO_STUDENTS.length} students`} color="indigo" />,
        <KPICard key="sys_classes" icon={GraduationCap} label="Total Classes" value="12" sub={`Avg ${Math.floor(DEMO_STUDENTS.length / 2)} students/class`} color="amber" />,
        <KPICard key="sys_storage" icon={HardDrive} label="Storage Usage" value="84%" sub="4.2 TB / 5 TB" color="blue" />,
        <KPICard key="sys_tasks" icon={ClipboardList} label="Active Assignments" value="14" sub="Across all active classes" color="teal" />,
    ];

    return (
        <div className="flex h-full min-h-full w-full bg-slate-50 cursor-default pointer-events-none select-none overflow-hidden border border-white/40">
            <MockSidebar />
            <main className="flex-1 flex flex-col min-w-0 h-full">
                <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
                            {layoutId === 'academic' ? 'Academic Dashboard' : 'Analytics & Forensics'}
                        </h1>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">Global Overview</p>
                    </div>
                </header>
                <div className="flex-1 p-6 overflow-hidden min-h-0 bg-slate-50/50">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {(selectedWidgets || []).map(widgetTitle => {
                            const props = getDemoKpiProps(widgetTitle);
                            return <KPICard key={widgetTitle} label={widgetTitle} {...props} />;
                        })}
                        {/* Fill empty spots with system widgets if needed */}
                        {systemWidgets.slice(0, Math.max(0, 4 - selectedWidgets.length))}
                    </div>

                    {/* Lower Sections based on layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                        {layoutId === 'academic' && (
                            <>
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <h2 className="font-bold text-slate-800 truncate">Course: {DEMO_CLASS.name}</h2>
                                    </div>
                                    <div className="p-6 flex-1 text-slate-400">
                                        <p className="text-sm font-medium text-slate-600 mb-4 uppercase tracking-wider text-[10px]">Upcoming Deadlines</p>
                                        <div className="space-y-2">
                                            {DEMO_ASSIGNMENTS.slice(0, 2).map(a => (
                                                <div key={a.short_code} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                                                    <span className="text-xs font-semibold text-slate-800 truncate pr-2">{a.title}</span>
                                                    <span className="text-[10px] font-medium text-slate-500 shrink-0">{new Date(a.due_date).toLocaleDateString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <h2 className="font-bold text-slate-800">Recent Enrollments</h2>
                                    </div>
                                    <div className="divide-y divide-slate-100 flex-1">
                                        {DEMO_STUDENTS.slice(0, 3).map(s => (
                                            <div key={s.first} className="px-6 py-2.5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs text-slate-400">
                                                        {s.first[0]}{s.last[0]}
                                                    </div>
                                                    <p className="font-semibold text-xs text-slate-800">{s.first} {s.last}</p>
                                                </div>
                                                <span className="text-[9px] uppercase font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">Active</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 lg:col-span-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-bold text-slate-800">Quick Portal Settings</h2>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Live Preview</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { label: 'Public Self-Enrollment', enabled: true },
                                            { label: 'AI Assistant (All Classes)', enabled: true },
                                            { label: 'Pilot Maintenance Mode', enabled: false },
                                        ].map(setting => (
                                            <div key={setting.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                <span className="text-xs font-bold text-slate-700">{setting.label}</span>
                                                <div className={`w-8 h-4 rounded-full relative transition-colors ${setting.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${setting.enabled ? 'right-0.5' : 'left-0.5'}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        {layoutId === 'analytics' && (
                            <>
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                        <h2 className="font-bold text-slate-800">System Resources & Usage</h2>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Healthy
                                        </span>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {/* Storage Usage */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Cloud Storage</span>
                                                <span className="text-xs font-bold text-slate-900">84%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '84%' }} />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px] text-slate-400">4.2 TB Used</span>
                                                <span className="text-[10px] text-slate-400">5.0 TB Total</span>
                                            </div>
                                        </div>

                                        {/* AI Credits */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-xs font-bold text-slate-500 uppercase">AI Token Allocation</span>
                                                <span className="text-xs font-bold text-slate-900">62% consumed</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-violet-500 rounded-full" style={{ width: '62%' }} />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px] text-slate-400">12.4M Tokens</span>
                                                <span className="text-[10px] text-slate-400">Monthly Reset</span>
                                            </div>
                                        </div>

                                        {/* Activity Sparkline Mock */}
                                        <div className="pt-4 mt-4 border-t border-slate-50">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">API Traffic (24h)</p>
                                            <div className="flex items-end gap-1 h-12">
                                                {[30, 45, 25, 60, 80, 40, 35, 90, 100, 75, 40, 55, 70, 45, 30].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-slate-100 rounded-t-sm" style={{ height: `${h}%` }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                        <h2 className="font-bold text-slate-800">AI Forensics Flags</h2>
                                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">High Priority</span>
                                    </div>
                                    <div className="p-6 flex-1 overflow-hidden">
                                        {[DEMO_AI_REPORTS.assignment2_average].map((report, idx) => {
                                            const isHigh = report.ai_probability > 50;
                                            return (
                                                <div key={idx} className={`mb-4 last:mb-0 p-4 border rounded-xl ${isHigh ? 'border-rose-200 bg-rose-50/50' : 'border-emerald-200 bg-emerald-50/50'}`}>
                                                    <div className="flex justify-between items-start mb-2 text-slate-400">
                                                        <div>
                                                            <span className="text-sm font-bold text-slate-800">Submission #847</span>
                                                            <p className="text-[10px] text-slate-500 mt-0.5 whitespace-nowrap">Marketing Fundamentals Essay</p>
                                                        </div>
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isHigh ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'}`}>
                                                            {report.ai_probability}% AI Prob
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-2 p-2 bg-white/60 rounded border border-white/80 leading-relaxed">{report.segments[0].text}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

