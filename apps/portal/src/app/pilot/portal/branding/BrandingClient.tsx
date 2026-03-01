"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { usePilotForm } from "@/components/pilot/PilotFormContext";
import { CheckCircle2, History, Pencil, X, Save, Upload, ArrowLeft, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { updatePilotData, uploadBrandingAsset } from "@/app/actions/pilotPortal";
import { MarkTabCompleted } from "@/components/pilot/MarkTabCompleted";
import { BrandingConfig, DEFAULT_BRANDING } from "@/components/pilot/branding/types";
import { LoginTemplateSplit } from "@/components/pilot/branding/LoginTemplateSplit";
import { LoginTemplateCentered } from "@/components/pilot/branding/LoginTemplateCentered";
import { LoginTemplateMinimal } from "@/components/pilot/branding/LoginTemplateMinimal";

// ─── Template Registry ──────────────────────────────────────

const TEMPLATES = [
    { id: "split" as const, name: "Modern Split", desc: "Hero image left, form right. Enterprise SaaS feel.", Component: LoginTemplateSplit },
    { id: "centered" as const, name: "Institutional Card", desc: "Centered card on primary-color background. Classic academic.", Component: LoginTemplateCentered },
    { id: "minimal" as const, name: "Minimalist Portal", desc: "Light background, centered logo. Clean and fast.", Component: LoginTemplateMinimal },
];

function getTemplateComponent(templateId: string) {
    const found = TEMPLATES.find(t => t.id === templateId);
    return found?.Component || LoginTemplateCentered;
}

// ─── Transparency Detection ─────────────────────────────────

function detectTransparency(file: File): Promise<boolean> {
    return new Promise((resolve) => {
        if (file.type === 'image/svg+xml') { resolve(true); return; }
        if (file.type === 'image/jpeg') { resolve(false); return; }

        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(img.width, 200);
            canvas.height = Math.min(img.height, 200);
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let hasTransparency = false;
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] < 250) { hasTransparency = true; break; }
            }
            URL.revokeObjectURL(url);
            resolve(hasTransparency);
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(false); };
        img.src = url;
    });
}

// ─── Image Optimization ─────────────────────────────────────

async function optimizeImage(file: File, maxWidth = 512): Promise<File> {
    if (file.type === 'image/svg+xml') return file;
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = img.width > maxWidth ? maxWidth / img.width : 1;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);

            const isPng = file.type === 'image/png';
            canvas.toBlob(
                (blob) => {
                    resolve(blob ? new File([blob], file.name, { type: blob.type }) : file);
                },
                isPng ? 'image/png' : 'image/jpeg',
                isPng ? undefined : 0.8
            );
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
        img.src = url;
    });
}

// ─── Constants ───────────────────────────────────────────────

const PREDEFINED_COLORS = [
    '#4f46e5', '#3b82f6', '#0ea5e9', '#10b981', '#22c55e',
    '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#64748b',
    '#334155', '#0f172a'
];

// ─── Component ───────────────────────────────────────────────

export function BrandingClient({ pilot, profile }: { pilot: any; profile: any }) {
    const { watch, setValue, getValues } = usePilotForm();

    // ─── UI State ───────────────────────────────────────────
    const [showChangelog, setShowChangelog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Flow state: 'gallery', 'editor', or 'preview'
    const [step, setStep] = useState<'gallery' | 'editor' | 'preview'>(() => {
        const history = getValues("changelog_jsonb")?.branding || [];
        return history.length > 0 ? 'preview' : 'gallery';
    });
    const isCompleted = (watch("completed_tabs_jsonb") || []).includes("branding");

    const logoInputRef = useRef<HTMLInputElement>(null);
    const heroInputRef = useRef<HTMLInputElement>(null);

    // ─── LOCAL STATE (instant reactivity — same as KPIs fix) ─
    const [branding, setBranding] = useState<BrandingConfig>(() => {
        const saved = getValues("branding_jsonb");
        let safeHeading = saved?.text_overrides?.heading;
        if (!safeHeading || safeHeading === "Welcome to Schologic LMS" || safeHeading === "Welcome to Schologic") {
            safeHeading = `Welcome to ${pilot.institution}`;
        }

        return {
            ...DEFAULT_BRANDING,
            ...saved,
            text_overrides: {
                ...DEFAULT_BRANDING.text_overrides,
                ...(saved?.text_overrides || {}),
                heading: safeHeading
            },
            institution_name: pilot.institution
        };
    });

    const saveTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastSavedData = useRef<string>("");

    useEffect(() => {
        if (!lastSavedData.current) lastSavedData.current = JSON.stringify(branding);
    }, [branding]);

    // Editor name
    let editorName = 'Unknown Member';
    if (profile?.first_name && profile?.last_name) {
        editorName = `${profile.first_name} ${profile.last_name}`;
    } else if (profile?.email) {
        editorName = profile.email.split('@')[0];
    }

    // ─── Access Control ─────────────────────────────────────

    const isChampion = profile?.id === pilot?.champion_id;
    const userTasks = watch("tasks_jsonb") || [];
    const hasTaskWrite = userTasks.some((t: any) => t.tab === 'branding' && t.assignments?.[profile?.id] === 'write');
    const hasWriteAccess = isChampion || hasTaskWrite;
    const isReadOnly = isCompleted || !hasWriteAccess;

    // ─── Update helpers ─────────────────────────────────────

    const updateField = <K extends keyof BrandingConfig>(key: K, value: BrandingConfig[K]) => {
        setBranding(prev => ({ ...prev, [key]: value }));
    };

    const updateText = (key: keyof BrandingConfig['text_overrides'], value: string) => {
        setBranding(prev => ({ ...prev, text_overrides: { ...prev.text_overrides, [key]: value } }));
    };

    // ─── File upload ────────────────────────────────────────

    const handleFileUpload = async (file: File, type: 'logo' | 'hero') => {
        setIsUploading(true);
        setError(null);
        try {
            if (file.size > 2 * 1024 * 1024) throw new Error('File too large. Max 2MB.');

            // Detect transparency (logo only)
            if (type === 'logo') {
                const hasTransparency = await detectTransparency(file);
                updateField('logo_has_transparency', hasTransparency);
            }

            // Optimize
            const optimized = await optimizeImage(file, type === 'hero' ? 1920 : 512);

            // Upload
            const formData = new FormData();
            formData.set('file', optimized);
            formData.set('type', type);
            const res = await uploadBrandingAsset(formData);

            if (res.error) throw new Error(res.error);
            if (res.url) {
                const urlWithCacheBust = `${res.url}?t=${Date.now()}`;
                updateField(type === 'logo' ? 'logo_url' : 'hero_image_url', urlWithCacheBust);
            }
        } catch (err: any) {
            setError(err.message || 'Upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

    // ─── Granular changelog ─────────────────────────────────

    const buildChangeDescriptions = useCallback((currentBranding: BrandingConfig): string[] => {
        const saved = getValues("branding_jsonb") || DEFAULT_BRANDING;
        const changes: string[] = [];

        if (saved.subdomain !== currentBranding.subdomain) changes.push(`Changed subdomain to "${currentBranding.subdomain}"`);
        if (saved.use_custom_domain !== currentBranding.use_custom_domain) changes.push(currentBranding.use_custom_domain ? 'Enabled custom domain' : 'Disabled custom domain');
        if (saved.custom_domain !== currentBranding.custom_domain) changes.push(`Changed custom domain to "${currentBranding.custom_domain}"`);
        if (saved.logo_url !== currentBranding.logo_url) changes.push('Updated logo');
        if (saved.logo_size !== currentBranding.logo_size) changes.push(`Changed logo size to ${currentBranding.logo_size}px`);
        if (saved.primary_color !== currentBranding.primary_color) changes.push(`Changed primary color to ${currentBranding.primary_color}`);
        if (saved.secondary_color !== currentBranding.secondary_color) changes.push(`Changed secondary color to ${currentBranding.secondary_color}`);
        if (saved.template !== currentBranding.template) changes.push(`Switched template to "${TEMPLATES.find(t => t.id === currentBranding.template)?.name}"`);
        if (saved.hero_image_url !== currentBranding.hero_image_url) changes.push('Updated hero image');

        const savedText = saved.text_overrides || DEFAULT_BRANDING.text_overrides;
        if (savedText.heading !== currentBranding.text_overrides.heading) changes.push(`Changed heading to "${currentBranding.text_overrides.heading}"`);
        if (savedText.subtext !== currentBranding.text_overrides.subtext) changes.push('Changed subtext');
        if (savedText.id_label !== currentBranding.text_overrides.id_label) changes.push(`Changed ID field label to "${currentBranding.text_overrides.id_label}"`);
        if (savedText.password_label !== currentBranding.text_overrides.password_label) changes.push(`Changed password label to "${currentBranding.text_overrides.password_label}"`);
        if (savedText.button_text !== currentBranding.text_overrides.button_text) changes.push(`Changed button text to "${currentBranding.text_overrides.button_text}"`);

        return changes.length > 0 ? changes : ['Updated branding settings'];
    }, [getValues]);

    const appendChangelogEntries = useCallback((actions: string[]) => {
        const currentLog: Record<string, any[]> = getValues("changelog_jsonb") || {};
        const now = new Date().toISOString();
        const newEntries = actions.map(action => ({ time: now, user: editorName, action }));
        const tabEntries = currentLog['branding'] || [];
        const updated = { ...currentLog, branding: [...newEntries, ...tabEntries].slice(0, 30) };
        setValue("changelog_jsonb", updated);
        return updated;
    }, [getValues, setValue, editorName]);

    // ─── Save / Cancel ──────────────────────────────────────

    const handleSave = async (currentBranding: BrandingConfig, silent = false) => {
        setIsSaving(true);
        if (!silent) setError(null);
        try {
            const changes = buildChangeDescriptions(currentBranding);
            if (changes.length === 0) {
                if (!silent) setStep('gallery');
                return;
            }

            setValue("branding_jsonb", currentBranding);
            const logUpdate = appendChangelogEntries(changes);
            const res = await updatePilotData({ branding_jsonb: currentBranding, changelog_jsonb: logUpdate });

            if (res?.error) throw new Error(res.error);

            setLastSaved(new Date());
            lastSavedData.current = JSON.stringify(currentBranding);
        } catch (err: any) {
            if (!silent) setError(err.message || 'Failed to save.');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const currentDataStr = JSON.stringify(branding);
        if (!lastSavedData.current) lastSavedData.current = currentDataStr;
        if (currentDataStr === lastSavedData.current) return;

        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(() => {
            handleSave(branding, true);
        }, 3000);

        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, [branding]);

    // ─── Display URL ────────────────────────────────────────

    const displayUrl = branding.use_custom_domain && branding.custom_domain
        ? branding.custom_domain
        : branding.subdomain
            ? `${branding.subdomain}.schologic.com`
            : 'your-institution.schologic.com';

    // ─── Currently selected template ────────────────────────

    const SelectedTemplate = getTemplateComponent(branding.template);

    // ─── Mock Browser Component ─────────────────────────────

    const MockBrowser = ({ children, small }: { children: React.ReactNode; small?: boolean }) => (
        <div className={`bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden ${small ? '' : 'h-full'}`}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex items-center gap-1.5 bg-white rounded-md px-3 py-1 text-xs font-medium text-slate-500 border border-slate-200 ml-2 truncate">
                    <span className="text-green-600">🔒</span>
                    <span className="truncate">{displayUrl}</span>
                </div>
            </div>
            {/* Content */}
            <div className={small ? "aspect-[16/10] relative overflow-hidden bg-white" : "aspect-[16/10] relative overflow-hidden bg-white"}>
                {children}
            </div>
        </div>
    );

    // ═══════════════════════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════════════════════

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4 relative z-50">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Login Page Branding</h1>
                    <div className="flex items-center gap-2">
                        <p className="text-slate-500 text-sm">Customize how your institution's login page looks and feels.</p>
                        {!hasWriteAccess && !isChampion && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full border border-amber-100">
                                <AlertTriangle className="w-3 h-3" /> Read Only
                            </span>
                        )}
                    </div>
                </div>

                {step === 'editor' && (
                    <div className="flex flex-col items-end gap-3 relative z-50">
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

                        {/* Status Text */}
                        <div className="text-xs font-medium text-slate-400">
                            {lastSaved ? (
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    Last edited by {editorName} at {lastSaved.toLocaleTimeString()}
                                </span>
                            ) : (() => {
                                const allLog = watch("changelog_jsonb") || {};
                                const entries = (allLog['branding'] || []).sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
                                const latest = entries[0] as any;
                                return latest ? (
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        Last edited by {latest.user} at {new Date(latest.time).toLocaleTimeString()}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> No changes recorded</span>
                                );
                            })()}
                        </div>

                        {error && <span className="text-xs font-bold text-red-500">{error}</span>}

                        {/* Changelog Dropdown */}
                        {showChangelog && (() => {
                            const allLog = watch("changelog_jsonb") || {};
                            const entries = (allLog['branding'] || []).sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 30);

                            return (
                                <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-xs font-bold text-slate-900 px-3 py-2 border-b border-slate-100 mb-1">Edit History</h4>
                                    <div className="max-h-64 overflow-y-auto">
                                        {entries.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-4">No edit history yet.</p>
                                        ) : entries.map((log: any, idx: number) => (
                                            <div key={idx} className="px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-slate-700 text-xs font-medium truncate">{log.user}</span>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">Branding</span>
                                                        <span className="text-slate-400 text-[10px]">{new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{log.action}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════
                TEMPLATE GALLERY (shown in view mode or when choosing)
            ═══════════════════════════════════════════════════ */}
            {step === 'gallery' && (
                <div className="space-y-4">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-slate-800">Choose a Template</h2>
                        <p className="text-sm text-slate-500 mt-1">Preview all layouts with your current branding, then select one to customize.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TEMPLATES.map(tpl => {
                            const isSelected = branding.template === tpl.id;
                            return (
                                <div
                                    key={tpl.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => !isCompleted && updateField('template', tpl.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            if (!isCompleted) updateField('template', tpl.id);
                                        }
                                    }}
                                    className={`group rounded-xl border-2 transition-all overflow-hidden text-left focus:outline-none ${isCompleted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/20 shadow-lg' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}
                                >
                                    {/* Preview (scaled) */}
                                    <div className="pointer-events-none border-b border-slate-100">
                                        <MockBrowser small>
                                            <div className="w-[400%] h-[400%] origin-top-left" style={{ transform: 'scale(0.25)' }}>
                                                <tpl.Component config={branding} />
                                            </div>
                                        </MockBrowser>
                                    </div>

                                    {/* Info + Select */}
                                    <div className="p-4 bg-white border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-sm font-bold text-slate-900">{tpl.name}</h3>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-3">{tpl.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-200">
                        <button
                            onClick={() => !isReadOnly && setStep('editor')}
                            disabled={isReadOnly}
                            title={isReadOnly ? (isCompleted ? "Unmark as completed to edit" : "You do not have write permissions for this tab") : ""}
                            className={`font-bold py-2 px-6 rounded-lg shadow-sm transition-colors text-sm ${isReadOnly ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                        >
                            Continue to Customization
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════
                PREVIEW STATE (Review customizations)
            ═══════════════════════════════════════════════════ */}
            {step === 'preview' && (
                <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start py-6 w-full max-w-[1400px] mx-auto px-4 lg:px-0">
                    {/* Left: Description */}
                    <div className="lg:w-[380px] shrink-0 bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center lg:text-left">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Branding Preview</h2>
                            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                                This is a live preview of your selected template and customizations applied to your platform's login experience.
                            </p>
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-100">
                            <button
                                onClick={() => !isReadOnly && setStep('editor')}
                                disabled={isReadOnly}
                                title={isReadOnly ? (isCompleted ? "Unmark as completed to edit" : "You do not have write permissions for this tab") : ""}
                                className={`w-full font-bold py-3 px-8 rounded-xl shadow-sm transition-colors text-sm ${isReadOnly ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    }`}
                            >
                                Continue to Customization
                            </button>
                        </div>
                    </div>

                    {/* Right: Mock Browser View */}
                    <div className="flex-1 w-full lg:w-auto">
                        <MockBrowser>
                            <div className="w-[150%] h-[150%] origin-top-left" style={{ transform: 'scale(0.6666)' }}>
                                <SelectedTemplate config={branding} />
                            </div>
                        </MockBrowser>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════
                EDITOR — Left Controls + Right Live Preview
            ═══════════════════════════════════════════════════ */}
            {step === 'editor' && (
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Panel: Controls */}
                    <div className="lg:w-[380px] shrink-0 space-y-5">
                        {/* Back to gallery */}
                        <button
                            onClick={() => setStep('gallery')}
                            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Change Template
                        </button>

                        {/* URL Configuration */}
                        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">URL</h3>
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Subdomain</label>
                                <div className="flex items-center gap-0">
                                    <input
                                        type="text"
                                        value={branding.subdomain}
                                        disabled={isReadOnly}
                                        onChange={e => updateField('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="your-institution"
                                        className="flex-1 text-sm font-medium px-3 py-2 border border-slate-200 rounded-l-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                                    />
                                    <span className="text-xs font-medium text-slate-400 bg-slate-50 border border-l-0 border-slate-200 px-2.5 py-2.5 rounded-r-lg whitespace-nowrap">.schologic.com</span>
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={branding.use_custom_domain}
                                        onChange={e => updateField('use_custom_domain', e.target.checked)}
                                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-xs font-medium text-slate-600">Use custom domain</span>
                                </label>
                                {branding.use_custom_domain && (
                                    <input
                                        type="text"
                                        value={branding.custom_domain}
                                        onChange={e => updateField('custom_domain', e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, '').replace(/^https?:\/\//, '').replace(/\/$/, ''))}
                                        placeholder="lms.university.edu"
                                        className="mt-2 w-full text-sm font-medium px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                )}
                            </div>
                        </section>

                        {/* Logo */}
                        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logo</h3>
                            <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden"
                                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'logo'); }} />

                            <div className="flex items-center gap-3">
                                {branding.logo_url ? (
                                    <img src={branding.logo_url} alt="Logo" className="w-12 h-12 object-contain rounded border border-slate-200 bg-slate-50 p-1" />
                                ) : (
                                    <div className="w-12 h-12 flex items-center justify-center rounded border-2 border-dashed border-slate-300 bg-slate-50">
                                        <ImageIcon className="w-5 h-5 text-slate-400" />
                                    </div>
                                )}
                                <button onClick={() => logoInputRef.current?.click()} disabled={isUploading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50">
                                    <Upload className="w-3.5 h-3.5" /> {isUploading ? 'Uploading...' : branding.logo_url ? 'Replace' : 'Upload'}
                                </button>
                                {branding.logo_url && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${branding.logo_has_transparency ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                                        {branding.logo_has_transparency ? '✓ Transparent' : '⚠ Solid BG'}
                                    </span>
                                )}
                            </div>

                            {branding.logo_url && (
                                <div>
                                    <label className="text-xs font-medium text-slate-600 mb-1 block">Size: {branding.logo_size}px</label>
                                    <input type="range" min={30} max={250} value={branding.logo_size}
                                        onChange={e => updateField('logo_size', parseInt(e.target.value))}
                                        className="w-full accent-indigo-600" />
                                </div>
                            )}
                        </section>

                        {/* Colors */}
                        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Colors</h3>
                            <div className="grid grid-cols-2 gap-6">
                                {/* Primary Color */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Primary</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={branding.primary_color}
                                                onChange={e => updateField('primary_color', e.target.value)}
                                                className="w-8 h-8 rounded border border-slate-200 cursor-pointer" />
                                            <input type="text" value={branding.primary_color}
                                                onChange={e => updateField('primary_color', e.target.value)}
                                                className="flex-1 text-xs font-mono px-2 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-300" />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PREDEFINED_COLORS.map(color => (
                                            <button
                                                key={`pri-${color}`}
                                                onClick={() => updateField('primary_color', color)}
                                                className={`w-5 h-5 rounded-full border shadow-sm transition-transform hover:scale-110 ${branding.primary_color.toLowerCase() === color ? 'ring-2 ring-offset-1 ring-indigo-500 border-transparent' : 'border-slate-200'}`}
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {/* Secondary Color */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Secondary</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={branding.secondary_color}
                                                onChange={e => updateField('secondary_color', e.target.value)}
                                                className="w-8 h-8 rounded border border-slate-200 cursor-pointer" />
                                            <input type="text" value={branding.secondary_color}
                                                onChange={e => updateField('secondary_color', e.target.value)}
                                                className="flex-1 text-xs font-mono px-2 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-300" />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PREDEFINED_COLORS.map(color => (
                                            <button
                                                key={`sec-${color}`}
                                                onClick={() => updateField('secondary_color', color)}
                                                className={`w-5 h-5 rounded-full border shadow-sm transition-transform hover:scale-110 ${branding.secondary_color.toLowerCase() === color ? 'ring-2 ring-offset-1 ring-slate-800 border-transparent' : 'border-slate-200'}`}
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Hero Image (split template only) */}
                        {branding.template === 'split' && (
                            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hero Image</h3>
                                <input ref={heroInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'hero'); }} />
                                <button onClick={() => heroInputRef.current?.click()} disabled={isUploading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50">
                                    <Upload className="w-3.5 h-3.5" /> {branding.hero_image_url ? 'Replace Hero Image' : 'Upload Campus Photo'}
                                </button>
                                {branding.hero_image_url && (
                                    <img src={branding.hero_image_url} alt="Hero" className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                                )}
                            </section>
                        )}

                        {/* Terminology & Text */}
                        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Terminology & Text</h3>
                            {([
                                { key: 'heading' as const, label: 'Welcome Heading' },
                                { key: 'subtext' as const, label: 'Subtext' },
                                { key: 'id_label' as const, label: 'Primary ID Field Label' },
                                { key: 'password_label' as const, label: 'Password Field Label' },
                                { key: 'button_text' as const, label: 'Button Text' },
                            ]).map(field => (
                                <div key={field.key}>
                                    <label className="text-xs font-medium text-slate-600 mb-1 block">{field.label}</label>
                                    <input
                                        type="text"
                                        value={branding.text_overrides[field.key]}
                                        onChange={e => updateText(field.key, e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                            ))}
                        </section>

                        <MarkTabCompleted tabId="branding" hasWriteAccess={hasWriteAccess} />
                    </div>

                    {/* Right Panel: Live Mock Browser */}
                    <div className="flex-1 lg:sticky lg:top-[140px] lg:self-start">
                        <MockBrowser>
                            <div className="w-[150%] h-[150%] origin-top-left" style={{ transform: 'scale(0.6666)' }}>
                                <SelectedTemplate config={branding} />
                            </div>
                        </MockBrowser>
                    </div>
                </div>
            )}
        </div>
    );
}
