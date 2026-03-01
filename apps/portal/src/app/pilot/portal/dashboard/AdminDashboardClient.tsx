"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { usePilotForm } from "@/components/pilot/PilotFormContext";
import { CheckCircle2, History, Layout, BarChart, ArrowLeft, AlertTriangle } from "lucide-react";
import { updatePilotData } from "@/app/actions/pilotPortal";
import { MarkTabCompleted } from "@/components/pilot/MarkTabCompleted";
import { MockDashboard } from "./MockDashboard";

// ─── Constants ───────────────────────────────────────────────

const LAYOUTS = [
    { id: "academic" as const, name: "Academic View", desc: "Focuses on Classes, Users, and Learning Activity.", icon: Layout },
    { id: "analytics" as const, name: "Analytics View", desc: "Focuses on AI Forensics, Metrics, and System Usage.", icon: BarChart },
];

export function AdminDashboardClient({ pilot, profile }: { pilot: any; profile: any }) {
    const { watch, setValue, getValues } = usePilotForm();

    // ─── UI State ───────────────────────────────────────────
    const [showChangelog, setShowChangelog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Flow state: 'gallery', 'editor', or 'preview'
    const [step, setStep] = useState<'gallery' | 'editor' | 'preview'>(() => {
        const history = getValues("changelog_jsonb")?.dashboard || [];
        const savedLayout = getValues("dashboard_layout_jsonb");
        return (history.length > 0 || !!savedLayout?.view_type) ? 'preview' : 'gallery';
    });

    const isCompleted = (watch("completed_tabs_jsonb") || []).includes("dashboard");

    // ─── Access Control ─────────────────────────────────────
    const isChampion = profile?.id === pilot?.champion_id;
    const userTasks = watch("tasks_jsonb") || [];
    const hasTaskWrite = userTasks.some((t: any) => t.tab === 'dashboard' && t.assignments?.[profile?.id] === 'write');
    const hasWriteAccess = isChampion || hasTaskWrite;

    // ─── LOCAL STATE ────────────────────────────────────────
    const [dashboardConfig, setDashboardConfig] = useState(() => {
        const saved = getValues("dashboard_layout_jsonb") || {
            view_type: 'academic',
            selected_widgets: []
        };
        return saved;
    });

    const saveTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastSavedData = useRef<string>("");

    useEffect(() => {
        if (!lastSavedData.current) lastSavedData.current = JSON.stringify(dashboardConfig);
    }, [dashboardConfig]);

    let editorName = 'Unknown Member';
    if (profile?.first_name && profile?.last_name) {
        editorName = `${profile.first_name} ${profile.last_name}`;
    } else if (profile?.email) {
        editorName = profile.email.split('@')[0];
    }

    // ─── Update helpers ─────────────────────────────────────
    const updateField = (key: string, value: any) => {
        setDashboardConfig((prev: any) => ({ ...prev, [key]: value }));
    };

    const toggleWidget = (widgetId: string) => {
        setDashboardConfig((prev: any) => {
            const widgets = prev.selected_widgets || [];
            if (widgets.includes(widgetId)) {
                return { ...prev, selected_widgets: widgets.filter((w: string) => w !== widgetId) };
            }
            return { ...prev, selected_widgets: [...widgets, widgetId] };
        });
    };

    // ─── Granular changelog ─────────────────────────────────

    const buildChangeDescriptions = useCallback((currentConfig: any): string[] => {
        const saved = getValues("dashboard_layout_jsonb") || { view_type: 'academic', selected_widgets: [] };
        const changes: string[] = [];

        if (saved.view_type !== currentConfig.view_type) {
            changes.push(`Changed layout to "${LAYOUTS.find(l => l.id === currentConfig.view_type)?.name}"`);
        }

        const addedWidgets = currentConfig.selected_widgets.filter((w: string) => !saved.selected_widgets.includes(w));
        const removedWidgets = saved.selected_widgets.filter((w: string) => !currentConfig.selected_widgets.includes(w));

        if (addedWidgets.length > 0) changes.push(`Added ${addedWidgets.length} metrics to dashboard`);
        if (removedWidgets.length > 0) changes.push(`Removed ${removedWidgets.length} metrics from dashboard`);

        return changes.length > 0 ? changes : ['Updated dashboard settings'];
    }, [getValues]);

    const appendChangelogEntries = useCallback((actions: string[]) => {
        const currentLog: Record<string, any[]> = getValues("changelog_jsonb") || {};
        const now = new Date().toISOString();
        const newEntries = actions.map(action => ({ time: now, user: editorName, action }));
        const tabEntries = currentLog['dashboard'] || [];
        const updated = { ...currentLog, dashboard: [...newEntries, ...tabEntries].slice(0, 30) };
        setValue("changelog_jsonb", updated);
        return updated;
    }, [getValues, setValue, editorName]);

    // ─── Save / Cancel ──────────────────────────────────────

    const handleSave = async (currentConfig: any, silent = false) => {
        setIsSaving(true);
        if (!silent) setError(null);
        try {
            const changes = buildChangeDescriptions(currentConfig);
            if (changes.length === 0) {
                if (!silent) setStep('preview');
                return;
            }

            setValue("dashboard_layout_jsonb", currentConfig);
            const logUpdate = appendChangelogEntries(changes);
            const res = await updatePilotData({ dashboard_layout_jsonb: currentConfig, changelog_jsonb: logUpdate });

            if (res?.error) throw new Error(res.error);

            setLastSaved(new Date());
            lastSavedData.current = JSON.stringify(currentConfig);
        } catch (err: any) {
            if (!silent) setError(err.message || 'Failed to save.');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const currentDataStr = JSON.stringify(dashboardConfig);
        if (!lastSavedData.current) lastSavedData.current = currentDataStr;
        if (currentDataStr === lastSavedData.current) return;

        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(() => {
            handleSave(dashboardConfig, true);
        }, 3000);

        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, [dashboardConfig]);

    // ─── Mock Browser Component ─────────────────────────────

    // TODO: move to a separate component file if needed or keep inline
    const MockBrowser = ({ children, url, small }: { children: React.ReactNode; url?: string; small?: boolean }) => (
        <div className={`bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden`}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200 shrink-0">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex items-center gap-1.5 bg-white rounded-md px-3 py-1 text-xs font-medium text-slate-500 border border-slate-200 ml-2 truncate">
                    <span className="text-green-600">🔒</span>
                    <span className="truncate whitespace-nowrap">{url || 'schologic.com/admin'}</span>
                </div>
            </div>
            {/* Content area with forced aspect ratio */}
            <div className="aspect-[16/10] relative overflow-hidden bg-white">
                {children}
            </div>
        </div>
    );

    const branding = watch("branding_jsonb") || {};
    const displayUrl = branding.use_custom_domain && branding.custom_domain
        ? branding.custom_domain
        : (branding.subdomain ? `${branding.subdomain}.schologic.com/admin` : 'schologic.com/admin');

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4 relative z-50">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Admin Dashboard Setup</h1>
                    <div className="flex items-center gap-2">
                        <p className="text-slate-500 text-sm">Configure your default view and pinned metrics.</p>
                        {!hasWriteAccess && !isChampion && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full border border-amber-100">
                                <AlertTriangle className="w-3 h-3" /> Read Only
                            </span>
                        )}
                    </div>
                </div>

                {step === 'editor' && (
                    <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowChangelog(!showChangelog)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold transition-colors rounded-lg ${showChangelog ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <History className="w-4 h-4" /> History
                            </button>
                            <button onClick={() => setStep('preview')} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm rounded-lg transition-colors">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Done Editing
                            </button>
                            {isSaving && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 bg-slate-50 rounded-lg">
                                    <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" /> Saving...
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Gallery View */}
            {step === 'gallery' && (
                <div className="space-y-4">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-slate-800">Choose a Base Layout</h2>
                        <p className="text-sm text-slate-500 mt-1">Select the primary focus for your administrative view.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {LAYOUTS.map(layout => {
                            const isSelected = dashboardConfig.view_type === layout.id;
                            const Icon = layout.icon;
                            return (
                                <div
                                    key={layout.id}
                                    role="button"
                                    onClick={() => !isCompleted && updateField('view_type', layout.id)}
                                    className={`group rounded-xl border-2 transition-all overflow-hidden text-left focus:outline-none ${isCompleted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/20 shadow-lg' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}
                                >
                                    <div className="pointer-events-none border-b border-slate-100 h-auto relative bg-slate-50 overflow-hidden">
                                        <MockBrowser url={displayUrl} small>
                                            <div className="w-[400%] h-[400%] origin-top-left" style={{ transform: 'scale(0.25)' }}>
                                                <MockDashboard layoutId={layout.id} selectedWidgets={dashboardConfig.selected_widgets} />
                                            </div>
                                        </MockBrowser>
                                    </div>
                                    <div className="p-4 bg-white border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4 text-slate-500" />
                                                <h3 className="text-sm font-bold text-slate-900">{layout.name}</h3>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-3">{layout.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-center pt-8 border-t border-slate-200 mt-8">
                        <button
                            onClick={() => !isCompleted && setStep('editor')}
                            disabled={isCompleted}
                            className={`font-bold py-2.5 px-8 rounded-lg shadow-sm transition-colors text-sm ${isCompleted ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                        >
                            Continue Configuraion
                        </button>
                    </div>
                </div>
            )}

            {/* Editor View */}
            {step === 'editor' && (
                <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start py-6 w-full max-w-[1400px] mx-auto px-4 lg:px-0">
                    <div className="lg:w-[380px] shrink-0 space-y-5">
                        <button
                            onClick={() => setStep('gallery')}
                            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Layouts
                        </button>

                        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selected Widgets</h3>
                            <p className="text-[11px] text-slate-400">Choose which metrics to pin to the top of your dashboard.</p>
                            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                                {/* Platform Standards */}
                                <div className="mb-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Platform Standards</p>
                                    {['Total Users', 'Total Classes', 'Active Assignments', 'Storage Usage'].map(standard => {
                                        const isSelected = dashboardConfig.selected_widgets.includes(standard);
                                        return (
                                            <label key={standard} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-50 hover:border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer group mb-1.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleWidget(standard)}
                                                    disabled={isCompleted}
                                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                                />
                                                <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>{standard}</span>
                                            </label>
                                        );
                                    })}
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Custom Pilot KPIs</p>
                                    {(watch("kpis_jsonb.kpis") || []).map((kpi: any) => {
                                        if (!kpi.enabled) return null;
                                        const isSelected = dashboardConfig.selected_widgets.includes(kpi.title);
                                        return (
                                            <label key={kpi.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer group mb-1.5">
                                                <div className="mt-0.5 relative flex items-center justify-center shrink-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleWidget(kpi.title)}
                                                        disabled={isCompleted}
                                                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 checked:bg-indigo-600 checked:border-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                    />
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                </div>
                                                <div>
                                                    <span className={`text-sm font-bold block transition-colors ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{kpi.title}</span>
                                                    <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">{kpi.description}</span>
                                                </div>
                                            </label>
                                        );
                                    })}
                                    {!(watch("kpis_jsonb.kpis") || []).some((k: any) => k.enabled) && (
                                        <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                            <p className="text-xs text-slate-500">No custom KPIs enabled.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <MarkTabCompleted tabId="dashboard" hasWriteAccess={hasWriteAccess} />
                    </div>

                    <div className="flex-1 lg:sticky lg:top-[140px] lg:self-start">
                        <MockBrowser url={displayUrl}>
                            <div className="w-[150%] h-[150%] origin-top-left" style={{ transform: 'scale(0.6666)' }}>
                                <MockDashboard layoutId={dashboardConfig.view_type} selectedWidgets={dashboardConfig.selected_widgets} />
                            </div>
                        </MockBrowser>
                    </div>
                </div>
            )}

            {/* Preview View */}
            {step === 'preview' && (
                <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start py-6 w-full max-w-[1400px] mx-auto px-4 lg:px-0">
                    <div className="lg:w-[380px] shrink-0 bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center lg:text-left">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Setup Complete</h2>
                            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                                Your admin dashboard layout and default pinned metrics have been saved. This view will be the starting point for your workspace.
                            </p>
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-100">
                            <button
                                onClick={() => !isCompleted && setStep('editor')}
                                disabled={isCompleted}
                                className={`w-full font-bold py-3 px-8 rounded-xl shadow-sm transition-colors text-sm ${isCompleted ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                            >
                                Edit Settings
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 w-full lg:w-auto lg:self-start">
                        <MockBrowser>
                            <div className="w-[150%] h-[150%] origin-top-left" style={{ transform: 'scale(0.6666)' }}>
                                <MockDashboard layoutId={dashboardConfig.view_type} selectedWidgets={dashboardConfig.selected_widgets} />
                            </div>
                        </MockBrowser>
                    </div>
                </div>
            )}
        </div>
    );
}
