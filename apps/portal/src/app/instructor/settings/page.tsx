'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Settings, Save, Brain, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { MODELS, MODEL_LABELS, ScoringMethod, Granularity } from '@/lib/ai-config';

export default function InstructorSettingsPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'ai' | 'submission' | 'security'>('ai');
    const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

    // Settings State
    const [settingsForm, setSettingsForm] = useState({
        model: MODELS.ROBERTA_LARGE,
        granularity: Granularity.PARAGRAPH,
        scoring_method: ScoringMethod.WEIGHTED,
        late_policy: 'strict', // 'strict' | 'grace_48h' | 'class_end'
        allowed_file_types: ['txt', 'docx']
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('settings')
                .eq('id', user.id)
                .maybeSingle(); // Use maybeSingle to handle missing profiles gracefully

            if (error) throw error;

            if (data?.settings) {
                const s = data.settings as any;
                setSettingsForm({
                    model: s.model || MODELS.ROBERTA_LARGE,
                    granularity: s.granularity || Granularity.PARAGRAPH,
                    scoring_method: s.scoring_method || ScoringMethod.WEIGHTED,
                    late_policy: s.late_policy || 'strict',
                    allowed_file_types: s.allowed_file_types || ['txt', 'docx']
                });
            }
        } catch (error) {
            console.error("Error fetching settings", error);
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                alert("Passwords do not match");
                return;
            }
            if (passwordForm.newPassword.length < 6) {
                alert("Password must be at least 6 characters");
                return;
            }

            const { error } = await supabase.auth.updateUser({
                password: passwordForm.newPassword
            });

            if (error) throw error;
            alert("Password updated successfully!");
            setPasswordForm({ newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            console.error("Error updating password", error);
            alert(error.message || "Failed to update password");
        } finally {
            setSaving(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .update({ settings: settingsForm })
                .eq('id', user.id);

            if (error) throw error;
            alert("Global Configuration Saved!");
        } catch (err) {
            console.error("Error saving settings", err);
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const toggleFileType = (type: string) => {
        setSettingsForm(prev => {
            const types = prev.allowed_file_types.includes(type)
                ? prev.allowed_file_types.filter(t => t !== type)
                : [...prev.allowed_file_types, type];
            return { ...prev, allowed_file_types: types };
        });
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Configuration...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8 text-slate-400" /> Global Settings
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-2">Configure defaults for all your classes.</p>
                </header>

                <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl mb-8 w-fit overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ai'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        AI Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('submission')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'submission'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Submission Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'security'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Security
                    </button>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 animate-fade-in relative">

                    {activeTab === 'security' && (
                        <form onSubmit={updatePassword} className="space-y-6 animate-fade-in">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <CheckCircle className="w-6 h-6 text-emerald-500" /> Password & Security
                                </h2>
                                <p className="text-slate-500 text-sm mb-6">Update your password to keep your account secure.</p>

                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            minLength={6}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            minLength={6}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'ai' && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Default AI Detection Model</label>
                                <div className="grid gap-3">
                                    {Object.entries(MODELS).map(([key, value]) => (
                                        <label key={key} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${settingsForm.model === value
                                            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${settingsForm.model === value ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <Brain className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <span className={`block text-sm font-bold ${settingsForm.model === value ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                        {MODEL_LABELS[value] || key}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-medium">{value.split('/').pop()}</span>
                                                </div>
                                            </div>
                                            <input
                                                type="radio"
                                                name="model"
                                                value={value}
                                                checked={settingsForm.model === value}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, model: e.target.value })}
                                                className="sr-only"
                                            />
                                            {settingsForm.model === value && <CheckCircle className="w-5 h-5 text-indigo-600 fill-indigo-100" />}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Granularity</label>
                                    <div className="flex flex-col gap-2">
                                        {[Granularity.PARAGRAPH, Granularity.SENTENCE].map((g) => (
                                            <label key={g} className={`relative flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-sm font-bold capitalize ${settingsForm.granularity === g
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-[1.02]'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name="granularity"
                                                    value={g}
                                                    checked={settingsForm.granularity === g}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, granularity: e.target.value as Granularity })}
                                                    className="sr-only"
                                                />
                                                {g}
                                                {settingsForm.granularity === g && <CheckCircle className="w-3 h-3 absolute top-2 right-2 text-emerald-400" />}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Strictness</label>
                                    <div className="flex flex-col gap-2">
                                        {Object.values(ScoringMethod).map((m) => (
                                            <label key={m} className={`relative flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-sm font-bold capitalize ${settingsForm.scoring_method === m
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name="scoring"
                                                    value={m}
                                                    checked={settingsForm.scoring_method === m}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, scoring_method: e.target.value as ScoringMethod })}
                                                    className="sr-only"
                                                />
                                                {m}
                                                {settingsForm.scoring_method === m && <CheckCircle className="w-3 h-3 absolute top-2 right-2 text-indigo-200" />}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'submission' && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Late Submission Policy</h2>
                                <div className="space-y-3">
                                    {[
                                        { id: 'strict', label: 'Strict Deadline', desc: 'No submissions allowed after due date. (Default)' },
                                        { id: 'grace_48h', label: '48h Grace Period', desc: 'Accepted up to 48 hours late. Marked as "Late".' },
                                        { id: 'class_end', label: 'Until Class End', desc: 'Accepted until the class end date. Marked as "Late".' }
                                    ].map(policy => (
                                        <label key={policy.id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${settingsForm.late_policy === policy.id
                                            ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="late_policy"
                                                value={policy.id}
                                                checked={settingsForm.late_policy === policy.id}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, late_policy: e.target.value })}
                                                className="sr-only"
                                            />
                                            <div className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 border ${settingsForm.late_policy === policy.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                                                }`}>
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            </div>
                                            <div>
                                                <span className={`block font-bold ${settingsForm.late_policy === policy.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                    {policy.label}
                                                </span>
                                                <p className="text-xs text-slate-500 mt-1">{policy.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Allowed File Types</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['pdf', 'docx', 'txt', 'jpg', 'png', 'zip'].map(type => (
                                        <label key={type} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${settingsForm.allowed_file_types.includes(type)
                                            ? 'border-indigo-600 bg-indigo-50/50'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}>
                                            <input
                                                type="checkbox"
                                                checked={settingsForm.allowed_file_types.includes(type)}
                                                onChange={() => toggleFileType(type)}
                                                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="font-bold text-sm uppercase text-slate-700">{type}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-3 font-medium">Default: TXT, DOCX</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-500 flex items-start gap-3">
                                <Clock className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-slate-700 mb-1">Global Defaults</p>
                                    These settings apply automatically to new assignments. You can override them individually when creating a specific assignment.
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'security' && (
                        <div className="pt-8 mt-8 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={saveSettings}
                                disabled={saving}
                                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                {saving ? 'Saving...' : (
                                    <>
                                        <Save className="w-4 h-4" /> Save Configuration
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
