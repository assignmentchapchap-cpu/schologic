"use client";

import { useState } from "react";
import { usePilotForm } from "@/components/pilot/PilotFormContext";
import { 
    Shield, 
    RotateCcw, 
    CheckCircle2, 
    AlertCircle, 
    ChevronRight,
    Search,
    Filter
} from "lucide-react";
import { updatePilotData } from "@/app/actions/pilotPortal";

const TAB_LABELS: Record<string, string> = {
    scope: "Scope", team: "Team", kpis: "KPIs", branding: "Branding",
    settings: "Settings", dashboard: "Dashboard", preview: "Preview",
};

export function PreviewClient({ pilot, profile, membership }: { pilot: any; profile: any; membership: any }) {
    const { watch, setValue } = usePilotForm();
    const tasks = watch("tasks_jsonb") || [];
    const completedTabs = watch("completed_tabs_jsonb") || [];
    const isChampion = membership?.is_champion === true;

    const [filterTab, setFilterTab] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const handleReactivateTask = async (taskId: string) => {
        if (!isChampion) return;
        
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedTasks = tasks.map(t => 
            t.id === taskId ? { ...t, finalized: false, status: 'in_progress' as const} : t
        );

        setValue("tasks_jsonb", updatedTasks, { shouldDirty: true });
        await updatePilotData({ tasks_jsonb: updatedTasks });
        // PilotAutomationObserver will automatically unlock the tab if necessary
    };

    const filteredTasks = tasks.filter(t => {
        if (filterTab !== "all" && t.tab !== filterTab) return false;
        if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const finalizedTasks = tasks.filter(t => t.finalized);
    const pendingFinalization = tasks.filter(t => !t.finalized);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Review & Finalize</h1>
                    <p className="text-slate-500 mt-1">Review all completed activities and confirm the overall pilot blueprint.</p>
                </div>
                
                <div className="flex gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Progress</p>
                            <p className="text-sm font-bold text-slate-900">{completedTabs.length} / 7 Tabs Locked</p>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="24" cy="24" r="20"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="text-indigo-500"
                                    strokeDasharray={`${(completedTabs.length / 7) * 125} 125`}
                                />
                            </svg>
                            <span className="absolute text-[10px] font-bold">{Math.round((completedTabs.length / 7) * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Tab Status Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-indigo-500" />
                            Tab Status
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(TAB_LABELS).map(([id, label]) => {
                                const isLocked = completedTabs.includes(id);
                                return (
                                    <div key={id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isLocked ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                            <span className={`text-sm font-bold ${isLocked ? 'text-emerald-900' : 'text-slate-600'}`}>{label}</span>
                                        </div>
                                        {isLocked ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Pending</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {isChampion && (
                        <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200/50">
                            <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-indigo-300" />
                                Champion Review
                            </h3>
                            <p className="text-xs text-indigo-200 mb-4 leading-relaxed">
                                As the Champion, you can reactivate any finalized task if it requires further revision. Reactivating a task will automatically unlock its related tab.
                            </p>
                            <div className="bg-indigo-800/50 rounded-xl p-4 border border-indigo-700/50">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Finalized Tasks</span>
                                    <span className="text-sm font-bold">{finalizedTasks.length} / {tasks.length}</span>
                                </div>
                                <div className="w-full h-1.5 bg-indigo-950 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-400 rounded-full transition-all duration-1000" 
                                        style={{ width: `${(finalizedTasks.length / tasks.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Task Review List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Activity Review</h3>
                            
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="text"
                                        placeholder="Search activities..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48"
                                    />
                                </div>
                                <select 
                                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={filterTab}
                                    onChange={(e) => setFilterTab(e.target.value)}
                                >
                                    <option value="all">All Tabs</option>
                                    {Object.entries(TAB_LABELS).map(([id, label]) => (
                                        <option key={id} value={id}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredTasks.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-slate-500">No matching activities found.</p>
                                </div>
                            ) : (
                                filteredTasks.sort((a, b) => {
                                    if (a.finalized === b.finalized) return 0;
                                    return a.finalized ? -1 : 1;
                                }).map(task => (
                                    <div key={task.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${task.finalized ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-100 italic opacity-80'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${task.finalized ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {task.finalized ? <Shield className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className={`text-sm font-bold truncate ${task.finalized ? 'text-slate-900' : 'text-slate-500'}`}>
                                                    {task.title}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                                                    {TAB_LABELS[task.tab]}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${task.finalized ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {task.finalized ? 'Finalized' : 'In Progress'}
                                                </span>
                                                {task.assignments && Object.keys(task.assignments).length > 0 && (
                                                    <span className="text-[10px] text-slate-400">
                                                        Assigned to {Object.keys(task.assignments).length} member(s)
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {isChampion && task.finalized && (
                                            <button 
                                                onClick={() => handleReactivateTask(task.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Reactivate task for revision"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                                Reactivate
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Phase 4 Integration Point */}
            {completedTabs.length === 7 && (
                <div className="mt-12 p-8 bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl shadow-xl text-center text-white">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-indigo-200" />
                    <h2 className="text-2xl font-bold mb-2">Blueprint Ready for Submission</h2>
                    <p className="text-indigo-100 max-w-2xl mx-auto mb-8">
                        All configuration tabs are locked. You have reviewed the activities and the blueprint is now ready to be finalized and provisioned.
                    </p>
                    <button className="px-12 py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all uppercase tracking-widest text-sm">
                        Finalize & Provision Pilot
                    </button>
                </div>
            )}
        </div>
    );
}
