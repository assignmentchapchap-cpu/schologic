'use client';

import { createClient } from '@/lib/supabase';
import { BookOpen, Calendar, ArrowRight, User, Home, GraduationCap, AlertCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Database } from '@/lib/database.types';

type EnrolledClass = {
    class_id: string;
    classes: {
        id: string;
        name: string;
        class_code: string;
        start_date: string | null;
        end_date: string | null;
        is_locked: boolean;
        instructor_id: string;
        profiles?: { full_name: string } | null;
    } | null;
};

export default function StudentClassesPage() {
    const supabase = createClient();
    const [classes, setClasses] = useState<EnrolledClass[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Enrollments with Class and Instructor Profile
            const { data, error } = await supabase
                .from('enrollments')
                .select(`
                    class_id,
                    classes (
                        id, name, class_code, start_date, end_date, is_locked, instructor_id
                    )
                `)
                .eq('student_id', user.id)
                .order('joined_at', { ascending: false });

            if (error) throw error;

            // Manual fetch for profiles if relation not set up in schema
            // Or assume typical join. Let's try to fetch profiles separately to be safe or map properly.
            // Ideally: classes(..., profiles(full_name)) but 'classes' usually links 'instructor_id' -> 'profiles.id'

            const validData = (data as any[]).filter(d => d.classes);

            // Enrich with instructor names
            const enriched = await Promise.all(validData.map(async (item) => {
                let instructorName = 'Unknown Instructor';
                if (item.classes?.instructor_id) {
                    const { data: prof } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', item.classes.instructor_id)
                        .single();
                    if (prof) instructorName = prof.full_name || 'Instructor';
                }
                return {
                    ...item,
                    classes: { ...item.classes, profiles: { full_name: instructorName } }
                };
            }));

            setClasses(enriched as EnrolledClass[]);

        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getClassStatus = (cls: EnrolledClass['classes']) => {
        if (!cls) return { label: 'UNKNOWN', color: 'bg-slate-100 text-slate-500', icon: AlertCircle };
        if (cls.is_locked) return { label: 'LOCKED', color: 'bg-slate-100 text-slate-500', icon: AlertCircle };
        if (cls.end_date && new Date(cls.end_date) < new Date()) return { label: 'COMPLETED', color: 'bg-indigo-50 text-indigo-600', icon: GraduationCap };
        return { label: 'ACTIVE', color: 'bg-emerald-50 text-emerald-600', icon: Clock };
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Classes...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-row justify-between items-center mb-8 gap-4 animate-fade-in">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">My Classes</h1>
                        <p className="text-slate-500 font-bold text-sm mt-1">Manage your enrolled courses</p>
                    </div>
                </header>

                {/* Class List */}
                {classes.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed animate-slide-in">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No Classes Yet</h3>
                        <p className="text-slate-500 mb-6">Join a class from your dashboard to get started.</p>
                        <Link href="/student/dashboard" className="text-indigo-600 font-bold hover:underline">Go to Dashboard</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                        {classes.map(({ classes: cls }) => {
                            if (!cls) return null;
                            const status = getClassStatus(cls);

                            return (
                                <Link href={`/student/class/${cls.id}`} key={cls.id} className="group block">
                                    {/* Desktop Card Layout (Hidden on Mobile) */}
                                    <div className="hidden md:flex bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all h-full flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                                {cls.class_code && (
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono font-bold">{cls.class_code}</span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors line-clamp-1">{cls.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                                <User className="w-4 h-4" />
                                                <span className="font-medium">{cls.profiles?.full_name}</span>
                                            </div>
                                            {cls.start_date && (
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{new Date(cls.start_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm">
                                            View Class <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>

                                    {/* Mobile Card Layout (Visible only on Mobile) */}
                                    <div className="flex md:hidden flex-col bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg leading-tight group-active:text-indigo-700 line-clamp-1">{cls.name}</h3>
                                                    {cls.class_code && <p className="text-xs font-bold text-slate-400 font-mono mt-0.5">{cls.class_code}</p>}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 py-3 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-600 truncate">{cls.profiles?.full_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-600">
                                                    {cls.start_date ? new Date(cls.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Date'}
                                                    {cls.end_date && ` - ${new Date(cls.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end items-center">
                                            <span className="text-indigo-600 font-bold text-xs flex items-center gap-1">
                                                View Class <ArrowRight className="w-3.5 h-3.5" />
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
