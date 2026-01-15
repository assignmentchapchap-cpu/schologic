'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

type AssignmentEvent = {
    id: string;
    title: string;
    due_date: string; // ISO string
    class_name: string;
    class_id: string;
};

export default function StudentCalendarPage() {
    const supabase = createClient();
    const [assignments, setAssignments] = useState<AssignmentEvent[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCalendarData();
    }, []);

    const fetchCalendarData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get Enrollments
            const { data: enrolls } = await supabase
                .from('enrollments')
                .select('class_id')
                .eq('student_id', user.id);

            if (!enrolls || enrolls.length === 0) {
                setLoading(false);
                return;
            }

            const classIds = enrolls.map(e => e.class_id);

            // 2. Get Assignments
            const { data: assigns } = await supabase
                .from('assignments')
                .select('*, classes(name)')
                .in('class_id', classIds);

            if (assigns) {
                const events = assigns.map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    due_date: a.due_date,
                    class_name: a.classes?.name || 'Unknown Class',
                    class_id: a.class_id
                })).filter((a: any) => a.due_date); // Only those with due dates
                setAssignments(events);
            }

        } catch (error) {
            console.error("Error fetching calendar", error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar Helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const getAssignmentsForDay = (day: number) => {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return assignments.filter(a => isSameDay(new Date(a.due_date), targetDate));
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Calendar...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Calendar</h1>
                        <p className="text-slate-500 font-medium">Keep track of your deadlines.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                        <span className="font-bold text-slate-800 min-w-[140px] text-center select-none">{monthName} {year}</span>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 flex-1">
                    {/* Calendar Grid */}
                    <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                            {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} className="bg-slate-50/20 border-b border-r border-slate-50" />)}

                            {[...Array(days)].map((_, i) => {
                                const day = i + 1;
                                const dayAssignments = getAssignmentsForDay(day);
                                const isToday = isSameDay(new Date(), new Date(currentDate.getFullYear(), currentDate.getMonth(), day));

                                return (
                                    <div key={day} className={`min-h-[100px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50 ${isToday ? 'bg-indigo-50/30' : ''}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>
                                                {day}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {dayAssignments.map(assign => (
                                                <Link
                                                    key={assign.id}
                                                    href={`/student/assignment/${assign.id}`}
                                                    className="block text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 hover:border-emerald-300 truncate transition-all"
                                                    title={`${assign.title} (${assign.class_name})`}
                                                >
                                                    {assign.title}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming Sidebar */}
                    <div className="w-full lg:w-80 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" /> Upcoming
                            </h3>
                            <div className="space-y-4">
                                {assignments
                                    .filter(a => new Date(a.due_date) >= new Date())
                                    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                                    .slice(0, 5)
                                    .map(assign => (
                                        <div key={assign.id} className="pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">{new Date(assign.due_date).toLocaleDateString()}</p>
                                            <Link href={`/student/assignment/${assign.id}`} className="font-bold text-slate-800 hover:text-indigo-600 transition-colors block mb-0.5">
                                                {assign.title}
                                            </Link>
                                            <p className="text-xs text-slate-500">{assign.class_name}</p>
                                        </div>
                                    ))}
                                {assignments.filter(a => new Date(a.due_date) >= new Date()).length === 0 && (
                                    <p className="text-sm text-slate-400 text-center py-4">No upcoming deadlines.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
