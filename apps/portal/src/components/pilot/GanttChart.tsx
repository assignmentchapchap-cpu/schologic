"use client";

import { CheckCircle2, Clock } from "lucide-react";

// Circle icon (lucide-react doesn't export a plain Circle)
const CircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
    </svg>
);

const STATUS_CONFIG = {
    pending: { icon: CircleIcon, label: "Pending", color: "bg-slate-300" },
    in_progress: { icon: Clock, label: "In Progress", color: "bg-indigo-500" },
    completed: { icon: CheckCircle2, label: "Completed", color: "bg-emerald-500" },
};

const TAB_LABELS: Record<string, string> = {
    scope: "Scope", team: "Team", kpis: "KPIs", branding: "Branding",
    settings: "Settings", dashboard: "Dashboard", preview: "Preview",
};

interface PilotTask {
    id: string;
    tab: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    assigned_to?: string;
    start_date?: string;
    due_date?: string;
    is_auto: boolean;
    sort_order: number;
}

interface TeamMember {
    id: string;
    user_id: string;
    is_champion: boolean;
    tab_permissions_jsonb: Record<string, string>;
    created_at: string;
    profiles: { first_name: string; last_name: string; email: string } | null;
}

interface GanttChartProps {
    tasks: PilotTask[];
    members: TeamMember[];
    pilotWeeks: number;
    onStatusChange: (taskId: string) => void;
}

export function GanttChart({ tasks, members, pilotWeeks, onStatusChange }: GanttChartProps) {
    // Generate week columns
    const weeks = Array.from({ length: Math.max(pilotWeeks, 2) }, (_, i) => i + 1);
    const totalDays = pilotWeeks * 7;

    // Group tasks by tab for visual grouping
    const tabGroups = tasks.reduce<Record<string, PilotTask[]>>((acc, task) => {
        if (!acc[task.tab]) acc[task.tab] = [];
        acc[task.tab].push(task);
        return acc;
    }, {});

    // Estimate task positions: evenly distribute tasks across the pilot timeline
    const getBarPosition = (task: PilotTask, idxInGroup: number, groupSize: number) => {
        if (task.start_date && task.due_date) {
            // Use actual dates if set
            const start = new Date(task.start_date);
            const end = new Date(task.due_date);
            const now = new Date();
            const pilotStart = new Date(now);
            pilotStart.setDate(pilotStart.getDate() - 3); // assume pilot started 3 days ago

            const startOffset = Math.max(0, (start.getTime() - pilotStart.getTime()) / (1000 * 60 * 60 * 24));
            const duration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            return {
                left: `${(startOffset / totalDays) * 100}%`,
                width: `${Math.min((duration / totalDays) * 100, 100)}%`,
            };
        }

        // Auto-distribute evenly across the timeline
        const segmentWidth = totalDays / groupSize;
        const startDay = idxInGroup * segmentWidth;
        const barDays = Math.max(segmentWidth * 0.8, 2);

        return {
            left: `${(startDay / totalDays) * 100}%`,
            width: `${(barDays / totalDays) * 100}%`,
        };
    };

    // Today marker position (assume start is today minus 3 days)
    const todayPct = Math.min((3 / totalDays) * 100, 100);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex border-b border-slate-200">
                <div className="w-52 shrink-0 bg-slate-50 px-4 py-3 border-r border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Activity</span>
                </div>
                <div className="flex-1 flex">
                    {weeks.map(w => (
                        <div
                            key={w}
                            className="flex-1 px-2 py-3 text-center border-r last:border-r-0 border-slate-100 bg-slate-50"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Week {w}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rows */}
            <div className="relative">
                {/* Today marker */}
                <div
                    className="absolute top-0 bottom-0 z-10 pointer-events-none"
                    style={{ left: `calc(208px + ${todayPct}% * (100% - 208px) / 100)` }}
                >
                    <div className="w-0.5 h-full bg-red-400 opacity-50" />
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-b-md whitespace-nowrap">
                        Today
                    </div>
                </div>

                {Object.entries(tabGroups).map(([tab, tabTasks]) => (
                    <div key={tab}>
                        {/* Tab group header */}
                        <div className="flex border-b border-slate-100 bg-slate-50/50">
                            <div className="w-52 shrink-0 px-4 py-1.5 border-r border-slate-200">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                                    {TAB_LABELS[tab] || tab}
                                </span>
                            </div>
                            <div className="flex-1" />
                        </div>

                        {/* Task rows */}
                        {tabTasks.map((task, idx) => {
                            const statusCfg = STATUS_CONFIG[task.status];
                            const barPos = getBarPosition(task, idx, tabTasks.length);
                            const assignee = members.find(m => m.user_id === task.assigned_to);
                            const initials = assignee?.profiles
                                ? `${assignee.profiles.first_name?.[0] || ''}${assignee.profiles.last_name?.[0] || ''}`.toUpperCase()
                                : '';

                            return (
                                <div key={task.id} className="flex border-b border-slate-100 hover:bg-slate-50/30 transition-colors group">
                                    {/* Label */}
                                    <div className="w-52 shrink-0 px-4 py-3 border-r border-slate-200 flex items-center gap-2">
                                        <button
                                            onClick={() => onStatusChange(task.id)}
                                            className={`w-4 h-4 rounded-full ${statusCfg.color} shrink-0 hover:scale-110 transition-transform`}
                                            title={`${statusCfg.label} — click to cycle`}
                                        />
                                        <span className={`text-xs font-medium truncate ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {task.title}
                                        </span>
                                    </div>

                                    {/* Timeline area */}
                                    <div className="flex-1 relative py-2 px-1">
                                        {/* Week grid lines */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {weeks.map(w => (
                                                <div key={w} className="flex-1 border-r border-slate-100 last:border-r-0" />
                                            ))}
                                        </div>

                                        {/* Bar */}
                                        <div className="relative h-7 flex items-center">
                                            <div
                                                className={`absolute h-6 rounded-md ${statusCfg.color} opacity-80 flex items-center px-2 gap-1 transition-all cursor-pointer hover:opacity-100 hover:shadow-sm`}
                                                style={barPos}
                                                onClick={() => onStatusChange(task.id)}
                                            >
                                                {initials && (
                                                    <span className="text-[9px] font-bold text-white bg-white/20 rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                                                        {initials}
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-bold text-white truncate">
                                                    {task.title}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="px-5 py-12 text-center">
                        <p className="text-sm text-slate-400 font-medium">No activities to visualize.</p>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-200 bg-slate-50">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm ${cfg.color}`} />
                        <span className="text-[10px] font-medium text-slate-500">{cfg.label}</span>
                    </div>
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                    <div className="w-3 h-0.5 bg-red-400" />
                    <span className="text-[10px] font-medium text-slate-500">Today</span>
                </div>
            </div>
        </div>
    );
}
