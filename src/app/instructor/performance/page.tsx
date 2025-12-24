'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { BarChart2, ChevronRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function PerformancePage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data } = await supabase
                    .from('classes')
                    .select('*')
                    .eq('instructor_id', user.id)
                    .order('created_at', { ascending: false });

                if (data) setClasses(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <BarChart2 className="w-8 h-8 text-indigo-600" /> Performance Overview
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Select a class to view detailed grading performance.</p>
                </header>

                <div className="grid gap-4">
                    {classes.map((cls) => (
                        <Link
                            key={cls.id}
                            href={`/instructor/class/${cls.id}?tab=submissions`}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{cls.name}</h3>
                                    <p className="text-sm text-slate-400 font-mono">{cls.invite_code}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </Link>
                    ))}
                    {classes.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                            No classes details found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
