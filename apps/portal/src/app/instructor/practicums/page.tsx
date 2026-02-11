'use client';

import { useToast } from '@/context/ToastContext';
import { createClient } from "@schologic/database";
import { Plus, Users, Calendar, ArrowRight, X, FileText, Home, ChevronDown } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Database } from "@schologic/database";
import { useSearchParams } from 'next/navigation';

type PracticumItem = Database['public']['Tables']['practicums']['Row'] & {
    practicum_enrollments?: { id: string }[];
};

function PracticumsContent() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [practicums, setPracticums] = useState<PracticumItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user);

            const { data, error } = await supabase
                .from('practicums')
                .select('*, practicum_enrollments(id)')
                .eq('instructor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching practicums:", error);
                showToast("Failed to load practicums", "error");
            } else {
                setPracticums(data as unknown as PracticumItem[]);
            }
            setLoading(false);
        };
        getData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-row justify-between items-center mb-8 gap-4 animate-fade-in">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            Practicum Management
                        </h1>
                        <p className="text-slate-500 font-bold text-sm mt-1">Manage field attachment cohorts</p>
                    </div>

                    <Link
                        href="/instructor/practicum/new"
                        className="bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-xl font-bold hidden md:flex items-center gap-2 transition-all shadow-lg active:scale-95 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="uppercase tracking-wide">New Practicum</span>
                    </Link>
                </header>

                {practicums.length === 0 && !loading ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed animate-slide-in">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No Practicums Yet</h3>
                        <p className="text-slate-500 mb-6">Create your first practicum cohort to get started.</p>
                        <div className="flex justify-center gap-4">
                            <Link href="/instructor/practicum/new" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg">
                                Create a Practicum
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                        {practicums.map(prac => {
                            const studentCount = Array.isArray(prac.practicum_enrollments) ? prac.practicum_enrollments.length : 0;
                            const isActive = new Date(prac.end_date) >= new Date();

                            return (
                                <Link href={`/instructor/practicum/${prac.id}`} key={prac.id} className="group block">
                                    {/* Desktop Practicum Card */}
                                    <div className="hidden md:flex bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all h-full flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-mono font-bold">{prac.cohort_code}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">{prac.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(prac.start_date).toLocaleDateString()} - {new Date(prac.end_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                <Users className="w-4 h-4" />
                                                <span>{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                            Manage Practicum <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>

                                    {/* Mobile Practicum Card */}
                                    <div className="flex md:hidden flex-col bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-500 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg leading-tight group-active:text-emerald-700">{prac.title}</h3>
                                                    <p className="text-xs font-bold text-slate-400 font-mono mt-0.5">{prac.cohort_code}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {isActive ? 'ACTIVE' : 'COMPLETED'}
                                            </span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-xs text-slate-500">{studentCount} students</span>
                                            <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                                                Manage <ArrowRight className="w-3.5 h-3.5" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function InstructorPracticumsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center text-slate-400">Loading Practicums...</div>}>
            <PracticumsContent />
        </Suspense>
    );
}
