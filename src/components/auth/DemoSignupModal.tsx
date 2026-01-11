
'use client';

import { useState } from 'react';
import { X, Loader2, Sparkles, User, School } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

interface DemoSignupModalProps {
    onClose: () => void;
}

export default function DemoSignupModal({ onClose }: DemoSignupModalProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'creating'>('form');
    const [formData, setFormData] = useState({
        title: 'Dr.',
        firstName: '',
        lastName: ''
    });

    const router = useRouter();
    const supabase = createClient();
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStep('creating');

        try {
            // 1. Create Demo Account via API
            const res = await fetch('/api/demo/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const rawText = await res.text();
            let data;
            try {
                data = JSON.parse(rawText);
            } catch (e) {
                // If parsing fails, it's likely an HTML error page.
                // Try to extract the error message from title or just use the whole text if short
                if (rawText.includes('<!DOCTYPE html>')) {
                    const match = rawText.match(/<h1[^>]*>(.*?)<\/h1>/i) || rawText.match(/<title>(.*?)<\/title>/i);
                    const serverError = match ? match[1] : 'Server returned an HTML error page';
                    throw new Error(`Server Error: ${serverError}`);
                }
                throw new Error(rawText || 'Failed to parse server response');
            }

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create demo account');
            }

            const { email, password } = data;

            if (data.success !== false) { // Handle implicit success
                // Save demo student email if present
                if (data.demo_student_email) {
                    localStorage.setItem('demo_student_email', data.demo_student_email);
                }
                localStorage.setItem('demo_instructor_email', data.email);
                localStorage.setItem('demo_instructor_password', data.password);

                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password,
                });

                if (signInError) throw signInError;

                // Trigger tour start
                localStorage.setItem('scholar_demo_tour_active', 'true');
                localStorage.setItem('scholar_demo_tour_step', '0');
                console.log('Demo Signup Success. Tour Activated in LocalStorage.');

                showToast('Welcome to the Demo!', 'success');
                router.push(data.redirect || '/instructor/dashboard');
                onClose();
            } else {
                // This else block was malformed in the instruction, assuming it should handle a specific error case
                // or simply fall through to the general error handling if `data.success` is explicitly false.
                // For now, if `data.success` is explicitly false, we'll treat it as an error.
                throw new Error(data.error || 'Failed to create demo account');
            }

        } catch (error: any) {
            console.error(error);
            showToast(error.message, 'error');
            setStep('form');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">

                {/* Close Button */}
                {!loading && (
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {step === 'creating' ? (
                    <div className="p-12 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6 relative">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            <Sparkles className="w-4 h-4 text-amber-400 absolute top-0 right-0 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Setting up your Lab...</h3>
                        <p className="text-slate-500 text-sm max-w-[260px]">
                            We are creating a populated class, adding students, and generating sample submissions for you.
                        </p>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Try Schologic LMS</h3>
                                <p className="text-slate-400 text-sm">Experience the instructor dashboard immediately.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Honorific</label>
                                <div className="relative">
                                    <School className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                                    <select
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-medium text-slate-700 transition-all hover:border-slate-300"
                                    >
                                        <option value="Mr.">Mr.</option>
                                        <option value="Ms.">Ms.</option>
                                        <option value="Mrs.">Mrs.</option>
                                        <option value="Dr.">Dr.</option>
                                        <option value="Prof.">Prof.</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            placeholder="Jane"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all hover:border-slate-300"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            placeholder="Doe"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all hover:border-slate-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <span>Launch Demo Environment</span>
                                    <Sparkles className="w-4 h-4 text-amber-300" />
                                </button>
                                <p className="text-center text-xs text-slate-400 mt-3">
                                    This creates a temporary sandbox account.
                                </p>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
