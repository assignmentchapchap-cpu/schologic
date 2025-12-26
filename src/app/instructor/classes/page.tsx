'use client';

import { createClient } from '@/lib/supabase';
import { Home, Plus, Calendar, Users, ArrowRight, X, GraduationCap, AlertCircle } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { isDateFuture, isDateAfter } from '@/lib/date-utils';
import Link from 'next/link';
import { Database } from '@/lib/database.types';
import { useSearchParams } from 'next/navigation';

type ClassItem = Database['public']['Tables']['classes']['Row'];

function ClassesContent() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [creating, setCreating] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [classCode, setClassCode] = useState('');
    const [codeError, setCodeError] = useState<string | undefined>(undefined);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Validation State
    const [errors, setErrors] = useState<{ startDate?: string, endDate?: string }>({});

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user);

            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .eq('instructor_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setClasses(data);
            setLoading(false);
        };
        getData();
    }, []);

    // Auto-open modal if query param present
    useEffect(() => {
        if (searchParams.get('new') === 'true') {
            setCreating(true);
        }
    }, [searchParams]);

    const createClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!newClassName) return;

        const newErrors: { startDate?: string, endDate?: string } = {};

        // Validation
        if (startDate && !isDateFuture(startDate)) {
            newErrors.startDate = "Start Date cannot be in the past.";
        }

        if (startDate && endDate && !isDateAfter(endDate, startDate)) {
            newErrors.endDate = "End Date must be after the Start Date.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            const { data, error } = await supabase
                .from('classes')
                .insert([
                    {
                        name: newClassName,
                        instructor_id: user.id,
                        invite_code: inviteCode,
                        class_code: classCode || null,
                        start_date: startDate ? new Date(startDate).toISOString() : null,
                        end_date: endDate ? new Date(endDate).toISOString() : null
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            setClasses([data, ...classes]);
            setNewClassName('');
            setClassCode('');
            setStartDate('');
            setEndDate('');
            setErrors({});
            setCreating(false);
        } catch (error: any) {
            console.error('Error creating class:', error);
            alert('Error creating class');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 animate-fade-in">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Classes</h1>
                            <p className="text-slate-500 font-medium">Manage your classrooms and students</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setCreating(true)}
                            className="bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 text-sm uppercase tracking-wide"
                        >
                            <Plus className="w-4 h-4" />
                            New Class
                        </button>
                    </div>
                </header>

                {/* Class List */}
                {classes.length === 0 && !loading ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed animate-slide-in">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Home className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No Classes Yet</h3>
                        <p className="text-slate-500 mb-6">Create your first class to get started.</p>
                        <button onClick={() => setCreating(true)} className="text-indigo-600 font-bold hover:underline">Create a Class</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                        {classes.map(cls => (
                            <Link href={`/instructor/class/${cls.id}`} key={cls.id} className="group">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all h-full flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono font-bold">{cls.invite_code}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">{cls.name}</h3>
                                        {cls.start_date && (
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(cls.start_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm">
                                        Manage Class <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))
                        }
                    </div>
                )}


                {/* Create Modal */}
                {creating && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-xl text-slate-900">Create New Class</h3>
                                <button onClick={() => setCreating(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <form onSubmit={createClass} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class Name</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                        <input
                                            autoFocus
                                            className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                            placeholder="e.g. Introduction to Physics"
                                            value={newClassName}
                                            onChange={e => setNewClassName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class Code (Optional)</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                        <input
                                            className={`w-full pl-10 p-3 border rounded-xl focus:ring-2 outline-none font-medium font-mono ${codeError ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-indigo-500'}`}
                                            placeholder="e.g. BIO101"
                                            value={classCode}
                                            onChange={e => {
                                                const val = e.target.value.toUpperCase();
                                                if (val.length <= 8) {
                                                    if (/^[A-Z0-9\-#/]*$/.test(val)) {
                                                        setClassCode(val);
                                                        if (codeError) setCodeError(undefined);
                                                    } else {
                                                        setCodeError('Only letters, numbers, -, #, / allowed');
                                                    }
                                                }
                                            }}
                                        />
                                        {codeError && (
                                            <div className="flex items-start gap-1 mt-1 text-red-500 animate-fade-in">
                                                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                <span className="text-xs font-medium">{codeError}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            className={`w-full p-3 border rounded-xl focus:ring-2 outline-none ${errors.startDate ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-indigo-500'}`}
                                            value={startDate}
                                            onChange={e => {
                                                setStartDate(e.target.value);
                                                if (errors.startDate) setErrors({ ...errors, startDate: undefined });
                                            }}
                                        />
                                        {errors.startDate && (
                                            <div className="flex items-start gap-1 mt-1 text-red-500">
                                                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                <span className="text-xs font-medium">{errors.startDate}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            className={`w-full p-3 border rounded-xl focus:ring-2 outline-none ${errors.endDate ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-indigo-500'}`}
                                            value={endDate}
                                            onChange={e => {
                                                setEndDate(e.target.value);
                                                if (errors.endDate) setErrors({ ...errors, endDate: undefined });
                                            }}
                                        />
                                        {errors.endDate && (
                                            <div className="flex items-start gap-1 mt-1 text-red-500">
                                                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                <span className="text-xs font-medium">{errors.endDate}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={!!codeError}
                                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Create Class
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
                }
            </div >
        </div >
    );
}

export default function InstructorClassesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center text-slate-400">Loading Classes...</div>}>
            <ClassesContent />
        </Suspense>
    );
}
