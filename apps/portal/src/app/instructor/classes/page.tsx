
'use client';

import { useToast } from '@/context/ToastContext';
import { createClient } from "@schologic/database";
import { Plus, Users, Calendar, ArrowRight, X, GraduationCap, AlertCircle, FileText, Clock, Home } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { isDateFuture, isDateAfter } from '@/lib/date-utils';
import Link from 'next/link';
import { Database } from "@schologic/database";
import { useSearchParams } from 'next/navigation';

type ClassItem = Database['public']['Tables']['classes']['Row'] & {
    enrollments?: { count: number }[];
};

function ClassesContent() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

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
                .select('*, enrollments(count)')
                .eq('instructor_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setClasses(data as unknown as ClassItem[]);
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

            setClasses([data as ClassItem, ...classes]);
            setNewClassName('');
            setClassCode('');
            setStartDate('');
            setEndDate('');
            setErrors({});
            setCreating(false);
            showToast('Class Created Successfully!', 'success');
        } catch (error: any) {
            console.error('Error creating class:', error);
            showToast(error.message, 'error');
        }
    };

    const getClassStatus = (cls: ClassItem) => {
        if (cls.is_locked) return { label: 'LOCKED', color: 'bg-slate-100 text-slate-500', icon: AlertCircle };
        if (cls.end_date && new Date(cls.end_date) < new Date()) return { label: 'COMPLETED', color: 'bg-indigo-50 text-indigo-600', icon: GraduationCap };
        return { label: 'ACTIVE', color: 'bg-emerald-50 text-emerald-600', icon: Calendar };
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-row justify-between items-center mb-8 gap-4 animate-fade-in">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">My Classes</h1>
                        <p className="text-slate-500 font-bold text-sm mt-1">Manage classrooms</p>
                    </div>

                    <button
                        onClick={() => setCreating(true)}
                        className="bg-slate-900 hover:bg-black text-white p-2.5 md:px-5 md:py-3 rounded-xl font-bold hidden md:flex items-center gap-2 transition-all shadow-lg active:scale-95 text-xs md:text-sm"
                        title="Create New Class"
                    >
                        <Plus className="w-5 h-5 md:w-4 md:h-4" />
                        <span className="hidden md:inline uppercase tracking-wide">New Class</span>
                    </button>
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
                        {classes.map(cls => {
                            const status = getClassStatus(cls);
                            const studentCount = cls.enrollments?.[0]?.count || 0;

                            return (
                                <Link href={`/instructor/class/${cls.id}`} key={cls.id} className="group block">
                                    {/* Desktop Card Layout (Hidden on Mobile) */}
                                    <div className="hidden md:flex bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all h-full flex-col justify-between">
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

                                    {/* Mobile Card Layout (Visible only on Mobile) */}
                                    <div className="flex md:hidden flex-col bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg leading-tight group-active:text-indigo-700">{cls.name}</h3>
                                                    {cls.class_code && <p className="text-xs font-bold text-slate-400 font-mono mt-0.5">{cls.class_code}</p>}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 py-3 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-600">{studentCount} Students</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-600">
                                                    {cls.start_date ? new Date(cls.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Date'}
                                                    {cls.end_date && ` - ${new Date(cls.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Code:</span>
                                                <span className="text-xs font-mono font-bold text-slate-700">{cls.invite_code}</span>
                                            </div>
                                            <span className="text-indigo-600 font-bold text-xs flex items-center gap-1">
                                                Manage Class <ArrowRight className="w-3.5 h-3.5" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
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
