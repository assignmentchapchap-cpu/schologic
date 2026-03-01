"use client";

import { useState, useCallback, useMemo } from "react";
import { usePilotForm } from "@/components/pilot/PilotFormContext";
import { Layout, BarChart, ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { usePilotAutosave } from "@/hooks/usePilotAutosave";
import { TabHeader } from "@/components/pilot/common/TabHeader";
import { MockDashboard } from "./MockDashboard";

// ─── Constants ───────────────────────────────────────────────

const LAYOUTS = [
    { id: "academic" as const, name: "Academic View", desc: "Focuses on Classes, Users, and Learning Activity.", icon: Layout },
    { id: "analytics" as const, name: "Analytics View", desc: "Focuses on AI Forensics, Metrics, and System Usage.", icon: BarChart },
];

export function AdminDashboardClient({ pilot, profile }: { pilot: any; profile: any }) {
    const { watch, getValues } = usePilotForm();
    const [showChangelog, setShowChangelog] = useState(false);

    // ─── Access Control ─────────────────────────────────────
    const isChampion = profile?.id === pilot?.champion_id;
    const userTasks = watch("tasks_jsonb") || [];
    const hasTaskWrite = userTasks.some((t: any) => t.tab === 'dashboard' && t.assignments?.[profile?.id] === 'write');
    const isCompleted = (watch("completed_tabs_jsonb") || []).includes("dashboard");
    const isReadOnly = !isChampion && (!hasTaskWrite || isCompleted);

    // ─── LOCAL STATE ────────────────────────────────────────
    const [dashboardConfig, setDashboardConfig] = useState(() => {
        const saved = getValues("dashboard_layout_jsonb") || {};
        return {
            view_type: saved.view_type || 'academic',
            selected_widgets: saved.selected_widgets || []
        };
    });

    // Flow state: 'gallery', 'editor', or 'preview'
    const [step, setStep] = useState<'gallery' | 'editor' | 'preview'>(() => {
        const history = getValues("changelog_jsonb")?.dashboard || [];
        return history.length > 0 ? 'preview' : 'gallery';
    });

    let editorName = 'Unknown Member';
    if (profile?.first_name && profile?.last_name) {
        editorName = `${profile.first_name} ${profile.last_name}`;
    } else if (profile?.email) {
        editorName = profile.email.split('@')[0];
    }

    const { isSaving, lastSaved, error, handleManualSave, hasUnsavedChanges } = usePilotAutosave({
        tabKey: "dashboard",
        dataKey: "dashboard_layout_jsonb",
        currentValues: dashboardConfig,
        editorName: editorName
    });

    // ─── Update helpers ─────────────────────────────────────
    const updateField = async (key: string, value: any) => {
        if (isReadOnly) return;
        const newConfig = { ...dashboardConfig, [key]: value };
        setDashboardConfig(newConfig);

        // Pick implies recorded change - immediately save to establish history/step
        if (key === 'view_type') {
            await handleManualSave(newConfig);
        }
    };

    const toggleWidget = (widgetId: string) => {
        if (isReadOnly) return;
        setDashboardConfig((prev: any) => {
            const widgets = prev.selected_widgets || [];
            if (widgets.includes(widgetId)) {
                return { ...prev, selected_widgets: widgets.filter((w: string) => w !== widgetId) };
            }
            return { ...prev, selected_widgets: [...widgets, widgetId] };
        });
    };

    // ─── Mock Browser Component ─────────────────────────────

    const MockBrowser = ({ children, small }: { children: React.ReactNode; small?: boolean }) => {
        const branding = watch("branding_jsonb") || {};
        const displayUrl = branding.use_custom_domain && branding.custom_domain
            ? branding.custom_domain
            : (branding.subdomain ? `${branding.subdomain}.schologic.com/admin` : 'schologic.com/admin');

        return (
            <div className={`bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col ${small ? 'w-full' : 'w-full max-w-5xl mx-auto'}`}>
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200 shrink-0">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 bg-white rounded-md px-3 py-1 text-xs font-medium text-slate-500 border border-slate-200 ml-2 truncate">
                        <span className="text-green-600">🔒</span>
                        <span className="truncate whitespace-nowrap">{displayUrl}</span>
                    </div>
                </div>
                {/* Content area */}
                <div className={`relative overflow-hidden bg-white ${small ? 'aspect-video' : 'aspect-[16/10]'}`}>
                    {children}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <TabHeader
                title="Admin Dashboard Setup"
                description="Configure your default view and pinned metrics."
                tabKey="dashboard"
                tabLabel="Dashboard"
                isReadOnly={isReadOnly}
                isSaving={isSaving}
                lastSaved={lastSaved}
                error={error}
                hasErrors={false}
                hasUnsavedChanges={hasUnsavedChanges}
                onManualSave={handleManualSave}
                showChangelog={showChangelog}
                setShowChangelog={setShowChangelog}
            />

            {/* ═══════════════════════════════════════════════════
                GALLERY VIEW (Choose Layout)
            ═══════════════════════════════════════════════════ */}
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
                                    tabIndex={0}
                                    onClick={() => updateField('view_type', layout.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            updateField('view_type', layout.id);
                                        }
                                    }}
                                    className={`group rounded-xl border-2 transition-all overflow-hidden text-left focus:outline-none ${isReadOnly ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/20 shadow-lg' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}
                                >
                                    <div className="pointer-events-none border-b border-slate-100 h-auto relative bg-slate-50 overflow-hidden">
                                        <MockBrowser small>
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
                            onClick={() => setStep('editor')}
                            disabled={isReadOnly}
                            className={`font-bold py-2.5 px-8 rounded-lg shadow-sm transition-colors text-sm ${isReadOnly ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                        >
                            Continue to Customization
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════
                EDITOR VIEW (Widget Selection)
            ═══════════════════════════════════════════════════ */}
            {step === 'editor' && (
                <>
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-[380px] shrink-0 space-y-5">
                            <button
                                onClick={() => setStep('gallery')}
                                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" /> Change Layout
                            </button>

                            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selected Widgets</h3>
                                <p className="text-[11px] text-slate-400">Choose which metrics to pin to the top of your dashboard.</p>
                                <div className="space-y-2">
                                    <div className="mb-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Platform Standards</p>
                                        {['Total Users', 'Total Classes', 'Active Assignments', 'Storage Usage'].map(standard => {
                                            const isSelected = (dashboardConfig.selected_widgets || []).includes(standard);
                                            return (
                                                <label key={standard} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors group mb-1.5 ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${isSelected ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleWidget(standard)}
                                                        disabled={isReadOnly}
                                                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 disabled:opacity-50"
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
                                            const isSelected = (dashboardConfig.selected_widgets || []).includes(kpi.title);
                                            return (
                                                <label key={kpi.id} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors group mb-1.5 ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${isSelected ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleWidget(kpi.title)}
                                                        disabled={isReadOnly}
                                                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                                                    />
                                                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>{kpi.title}</span>
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


                        </div>

                        <div className="flex-1 lg:sticky lg:top-[140px] lg:self-start w-full lg:w-auto">
                            <MockBrowser>
                                <div className="w-[150%] h-[150%] origin-top-left" style={{ transform: 'scale(0.6666)' }}>
                                    <MockDashboard layoutId={dashboardConfig.view_type} selectedWidgets={dashboardConfig.selected_widgets} />
                                </div>
                            </MockBrowser>
                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════════════════════════════════════════
                PREVIEW VIEW (Review Setup)
            ═══════════════════════════════════════════════════ */}
            {step === 'preview' && (
                <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start py-6 w-full max-w-[1400px] mx-auto px-4 lg:px-0">
                    <div className="lg:w-[380px] shrink-0 bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center lg:text-left h-fit">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Admin Dashboard Preview</h2>
                            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                                This is a live preview of your selected layout and customizations applied to your platform's administrative experience.
                            </p>
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-100">
                            <button
                                onClick={() => setStep('editor')}
                                disabled={isReadOnly}
                                className={`font-bold py-2.5 px-8 rounded-lg shadow-sm transition-colors text-sm ${isReadOnly ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                            >
                                Continue to Customization
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
