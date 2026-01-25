'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { User, Mail, School, Save, Loader2 } from 'lucide-react';
import { Database } from "@schologic/database";
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function InstructorProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        first_name: '',
        last_name: '',
        honorific: '',
        bio: '',
        avatar_url: ''
    });

    const supabase = createClient();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (error) {
                console.error("Fetch profile error:", error);
            }

            if (data) {
                setProfile(data);

                // Logic to handle names:
                // 1. Try first_name/last_name from DB if they exist (assuming user added columns)
                // 2. If not, fallback to splitting full_name
                let fName = data.first_name || '';
                let lName = data.last_name || '';

                if (!fName && !lName && data.full_name) {
                    const parts = data.full_name.split(' ');
                    fName = parts[0];
                    lName = parts.slice(1).join(' ');
                }

                setFormData({
                    title: data.title || '',
                    first_name: fName,
                    last_name: lName,
                    honorific: data.honorific || '',
                    bio: data.bio || '',
                    avatar_url: data.avatar_url || ''
                });
            } else {
                // Fallback if no profile data found but user is logged in
                setProfile({
                    id: user.id,
                    email: user.email ?? null,
                    role: 'instructor',
                    title: null,
                    first_name: null,
                    last_name: null,
                    honorific: null,
                    full_name: null,
                    institution_id: null,
                    bio: null,
                    avatar_url: null,
                    preferences: null,
                    registration_number: null,
                    settings: null,

                });

                // Populate form from metadata if available
                const meta = user.user_metadata || {};
                let fName = meta.first_name || '';
                let lName = meta.last_name || '';

                if (!fName && !lName && meta.full_name) {
                    const parts = meta.full_name.split(' ');
                    fName = parts[0];
                    lName = parts.slice(1).join(' ');
                }

                setFormData({
                    title: meta.title || '',
                    first_name: fName,
                    last_name: lName,
                    honorific: '',
                    bio: '',
                    avatar_url: meta.avatar_url || ''
                });
            }
        } catch (error) {
            console.error('Error loading profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const fullName = `${formData.first_name} ${formData.last_name}`.trim();

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    title: formData.title,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    full_name: fullName,
                    bio: formData.bio,
                    avatar_url: formData.avatar_url,
                    role: 'instructor',
                    email: user.email
                });

            if (error) throw error;

            // Sync with Auth Metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    title: formData.title,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    full_name: fullName,
                    avatar_url: formData.avatar_url,
                    bio: formData.bio
                }
            });

            if (authError) console.error("Failed to sync auth metadata:", authError);

            // Optimistic update
            if (profile) setProfile({ ...profile, full_name: fullName, title: formData.title, first_name: formData.first_name, last_name: formData.last_name, bio: formData.bio, avatar_url: formData.avatar_url });
            showToast('Profile updated successfully!', 'success');
        } catch (error: unknown) {
            console.error('Error updating profile', error);
            const message = error instanceof Error ? error.message : 'Failed to update profile.';
            showToast(message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="max-w-2xl mx-auto">
                <header className="mb-6 md:mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-slate-800">My Profile</h1>
                        <p className="text-slate-500 text-xs md:text-base">Manage your personal information</p>
                    </div>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <form onSubmit={handleSave} className="p-8 space-y-6">

                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                            <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-slate-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Avatar URL</label>
                                <input
                                    type="url"
                                    value={formData.avatar_url}
                                    onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
                                    placeholder="https://example.com/me.jpg"
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                />
                                <p className="text-xs text-slate-400 mt-1">Paste a link to your profile picture.</p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                                    <div className="relative">
                                        <School className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                                        <select
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                                        >
                                            <option value="">Select...</option>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Miss">Miss</option>
                                            <option value="Dr.">Dr.</option>
                                            <option value="Prof.">Prof.</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                                    <div className="relative">
                                        <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                                        <input
                                            type="text"
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                            className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            required
                                            placeholder="First Name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                                    <div className="relative">
                                        <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                                        <input
                                            type="text"
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                            className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            required
                                            placeholder="Last Name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                                    placeholder="Tell us a bit about yourself..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                                        <input
                                            type="email"
                                            // Prefer profile email, fall back to auth email if not in profile yet
                                            value={profile?.email || ''}
                                            disabled
                                            className="w-full p-3 pl-10 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Managed via account settings</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                                    <div className="relative">
                                        <School className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                                        <input
                                            type="text"
                                            value={profile?.role?.toUpperCase() || ''}
                                            disabled
                                            className="w-full p-3 pl-10 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-70"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
