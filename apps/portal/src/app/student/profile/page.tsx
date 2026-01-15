'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { User, Mail, School, Save, Loader2, Hash } from 'lucide-react';
import Link from 'next/link';
import { Database } from "@schologic/database";
import { useRouter } from 'next/navigation';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function StudentProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        bio: '',
        avatar_url: '',
        registration_number: '' // Added registration number
    });

    const supabase = createClient();
    const router = useRouter();

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
                .single();

            if (error) throw error;
            if (data) {
                setProfile(data);
                setFormData({
                    // Clear generic default name if present to encourage user input
                    full_name: data.full_name === 'Guest Instructor' ? '' : (data.full_name || ''),
                    bio: data.bio || '',
                    avatar_url: data.avatar_url || '',
                    registration_number: data.registration_number || ''
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

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    bio: formData.bio,
                    avatar_url: formData.avatar_url,
                    registration_number: formData.registration_number // Update Reg No
                })
                .eq('id', user.id);

            if (error) throw error;
            // Optimistic update
            if (profile) setProfile({ ...profile, ...formData });
            alert("Profile updated successfully!");
        } catch (error) {
            console.error('Error updating profile', error);
            alert("Failed to update profile.");
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
                        <h1 className="text-xl md:text-3xl font-bold text-slate-800">Student Profile</h1>
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

                            {/* Registration Number - Key Student Field */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Registration Number</label>
                                <div className="relative">
                                    <Hash className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                                    <input
                                        type="text"
                                        value={formData.registration_number}
                                        onChange={e => setFormData({ ...formData, registration_number: e.target.value })}
                                        className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono tracking-wide placeholder:font-sans"
                                        placeholder="e.g. SC/123/2023"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Your unique student ID.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none placeholder:font-normal"
                                        placeholder="Enter your full name"
                                        required
                                    />
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

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                                        <input
                                            type="email"
                                            value={profile?.email || ''}
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
