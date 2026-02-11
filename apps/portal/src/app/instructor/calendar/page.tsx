

'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CalendarAssignment {
    id: string;
    title: string;
    due_date: string;
    classes: { name: string } | null;
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [assignments, setAssignments] = useState<CalendarAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchAssignments();
    }, [currentDate]);

    const fetchAssignments = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: classes } = await supabase
                .from('classes')
                .select('id')
                .eq('instructor_id', user.id);

            if (!classes || classes.length === 0) {
                setLoading(false);
                return;
            }

            const classIds = classes.map(c => c.id);

            // 2. Get Assignments for the current month window (plus/minus a few days to be safe, or just all future?)
            // For simplicity in this view, let's fetch all relevant open assignments or just specific month.
            // Let's fetch ALL for the classes to be responsive, or filter deeply.
            // Better: Fetch assignments due in this month.

            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

            const { data: assign, error } = await supabase
                .from('assignments')
                .select(`
                    *,
                    classes (name)
                `)
                .in('class_id', classIds)
                .gte('due_date', startOfMonth)
                .lte('due_date', endOfMonth)
                .order('due_date', { ascending: true });

            if (error) throw error;
            setAssignments((assign as CalendarAssignment[]) || []);

        } catch (error) {
            console.error("Error fetching calendar data", error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar Grid Logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    const empties = Array.from({ length: firstDay }, (_, i) => i);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center justify-between mb-6 md:mb-8 gap-2">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Calendar</h1>
                        <p className="hidden md:block text-slate-500 font-medium text-sm">Manage Deadlines & Events</p>
                    </div>
                    <div className="flex items-center gap-1 md:gap-4 bg-white p-1 md:p-2 rounded-xl shadow-sm border border-slate-200 shrink-0">
                        <button onClick={prevMonth} className="p-1.5 md:p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                        </button>
                        <span className="font-bold text-slate-800 text-sm md:text-base w-28 md:w-40 text-center whitespace-nowrap">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={nextMonth} className="p-1.5 md:p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar Grid */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="grid grid-cols-7 mb-4 text-center">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-xs font-bold text-slate-400 uppercase tracking-wider py-2">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {empties.map(i => <div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-50/50 rounded-xl" />)}
                            {daysArray.map(day => {
                                const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                const dayAssignments = assignments.filter(a => new Date(a.due_date).getDate() === day);
                                const isToday = new Date().toDateString() === currentDayDate.toDateString();

                                return (
                                    <div key={day} className={`h-24 md:h-32 p-2 rounded-xl border transition-all hover:shadow-md ${isToday ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
                                        <span className={`text-sm font-bold block mb-1 ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>{day}</span>
                                        <div className="space-y-1 overflow-y-auto max-h-[calc(100%-24px)]">
                                            {dayAssignments.map(a => (
                                                <div key={a.id} className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-1 rounded font-medium truncate" title={a.title}>
                                                    {a.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming List */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-600" /> Upcoming Deadlines
                            </h3>
                            {loading ? (
                                <div className="text-center text-slate-400 py-8">Loading schedule...</div>
                            ) : assignments.length === 0 ? (
                                <div className="text-center py-12">
                                    <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium text-sm">No assignments due this month.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {assignments.map(a => (
                                        <Link href={`/instructor/assignment/${a.id}`} key={a.id} className="block group">
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-indigo-200 group-hover:bg-white inset-ring transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-100">
                                                        {new Date(a.due_date).getDate()} {new Date(a.due_date).toLocaleString('default', { month: 'short' })}
                                                    </span>
                                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">{a.title}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{a.classes?.name}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
