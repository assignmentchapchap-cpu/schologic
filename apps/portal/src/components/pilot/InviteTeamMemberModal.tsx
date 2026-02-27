"use client";

import { useState } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { inviteTeamMember } from "@/app/actions/pilotTeam";

const TAB_KEYS = [
    { key: "scope", label: "01. Scope" },
    { key: "team", label: "02. Team" },
    { key: "kpis", label: "03. KPIs" },
    { key: "branding", label: "04. Branding" },
    { key: "settings", label: "05. Settings" },
    { key: "dashboard", label: "06. Dashboard" },
    { key: "preview", label: "07. Submit" },
];

interface InviteTeamMemberModalProps {
    onClose: () => void;
    onSuccess: (member: any) => void;
}

export function InviteTeamMemberModal({ onClose, onSuccess }: InviteTeamMemberModalProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [permissions, setPermissions] = useState<Record<string, string>>(() => {
        const defaults: Record<string, string> = {};
        TAB_KEYS.forEach(t => { defaults[t.key] = "read"; });
        return defaults;
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const togglePermission = (tabKey: string, level: string) => {
        setPermissions(prev => ({ ...prev, [tabKey]: level }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim() || !email.trim()) {
            setError("Name and email are required.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await inviteTeamMember({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                tabPermissions: permissions,
            });

            if (res?.error) throw new Error(res.error);

            // Create a mock member object for immediate UI update
            onSuccess({
                id: crypto.randomUUID(),
                user_id: res.userId || crypto.randomUUID(),
                is_champion: false,
                tab_permissions_jsonb: permissions,
                created_at: new Date().toISOString(),
                profiles: { first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim().toLowerCase() },
            });
        } catch (err: any) {
            setError(err.message || "Failed to invite member.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-slate-900">Invite Team Member</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    {/* Name fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                placeholder="Jane"
                                required
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                placeholder="Doe"
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Institutional Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="jane.doe@university.edu"
                            required
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>

                    {/* Permission Matrix */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-3">Tab Permissions</label>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            {/* Header */}
                            <div className="grid grid-cols-[1fr_70px_70px_70px] gap-0 px-4 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                <span>Tab</span>
                                <span className="text-center">None</span>
                                <span className="text-center">Read</span>
                                <span className="text-center">Write</span>
                            </div>

                            {/* Rows */}
                            {TAB_KEYS.map(tab => (
                                <div key={tab.key} className="grid grid-cols-[1fr_70px_70px_70px] gap-0 px-4 py-2.5 border-b last:border-b-0 border-slate-100 items-center hover:bg-slate-50/50 transition-colors">
                                    <span className="text-xs font-medium text-slate-700">{tab.label}</span>
                                    {['none', 'read', 'write'].map(level => (
                                        <div key={level} className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() => togglePermission(tab.key, level)}
                                                className={`w-5 h-5 rounded-full border-2 transition-all ${permissions[tab.key] === level
                                                    ? 'border-indigo-500 bg-indigo-500'
                                                    : 'border-slate-300 hover:border-slate-400'
                                                    }`}
                                            >
                                                {permissions[tab.key] === level && (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                            <strong>None</strong> = tab hidden · <strong>Read</strong> = view only · <strong>Write</strong> = can edit & mark complete
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-xs font-bold text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Sending Invite...</>
                        ) : (
                            <><UserPlus className="w-4 h-4" /> Send Invite</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
