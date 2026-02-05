
'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { FileText, Calendar, ArrowRight, Search, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';

type PracticumEnrollment = {
    practicum_id: string;
    status: string;
    practicums: {
        id: string;
        title: string;
        instructor_id: string;
        invite_code: string;
        start_date: string;
        end_date: string;
    } | null;
};

export default function StudentPracticumsPage() {
    const [enrollments, setEnrollments] = useState<PracticumEnrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useUser();
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            fetchEnrollments();
        }
    }, [user]);

    const fetchEnrollments = async () => {
        try {
            if (!user?.id) return;
            const { data, error } = await supabase
                .from('practicum_enrollments')
                .select(`
                    practicum_id,
                    status,
                    practicums (
                        id, title, instructor_id, invite_code, start_date, end_date
                    )
                `)
                .eq('student_id', user.id);

            if (error) throw error;
            setEnrollments((data as unknown as PracticumEnrollment[]) || []);
        } catch (error) {
            console.error("Error loading practicums", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEnrollments = searchQuery
        ? enrollments.filter(e => e.practicums?.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : enrollments;

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Practicums...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12 animate-fade-in">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <FileText className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
                            My Practicums
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">Track your progress and submit your logs.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <Input
                                placeholder="Search practicums..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 shadow-sm rounded-xl w-full md:w-64 transition-all"
                                fullWidth={false}
                            />
                        </div>
                        <button
                            onClick={() => router.push('/student/dashboard')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/10 active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Join Cohort
                        </button>
                    </div>
                </header>

                {filteredEnrollments.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {searchQuery ? "No matches found" : "No Practicums Yet"}
                        </h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8">
                            {searchQuery
                                ? "Try adjusting your search terms to find what you're looking for."
                                : "Join a practicum cohort using an invite code provided by your instructor."}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => router.push('/student/dashboard')}
                                className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all"
                            >
                                Go to Dashboard to Join <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEnrollments.map((en) => (
                            <Link
                                key={en.practicum_id}
                                href={en.status === 'approved'
                                    ? `/student/practicum/${en.practicum_id}`
                                    : `/student/practicum/${en.practicum_id}/setup`
                                }
                            >
                                <Card
                                    className="p-6 border-slate-200 hover:border-emerald-400 transition-all group flex flex-col h-full relative overflow-hidden"
                                    hoverEffect
                                >
                                    {/* Emerald Accent */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-emerald-100 transition-colors -z-0 focus:z-0" />

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase px-3 py-1 rounded-full border tracking-wider",
                                                en.status === 'approved'
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : en.status === 'pending'
                                                        ? "bg-amber-50 text-amber-700 border-amber-100"
                                                        : "bg-red-50 text-red-700 border-red-100"
                                            )}>
                                                {en.status}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2">
                                            {en.practicums?.title}
                                        </h3>

                                        <div className="mt-auto pt-6 space-y-3">
                                            <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <span>
                                                    {en.practicums?.start_date ? new Date(en.practicums.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    {en.status === 'approved' ? (
                                                        <>
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-tight">Active Milestone</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Awaiting Approval</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all group-hover:translate-x-1">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
