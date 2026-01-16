// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

export default function StudentCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchAssignments();
    }, [currentDate]);

    const fetchAssignments = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get Enrolled Classes
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('class_id')
                .eq('student_id', user.id);

            if (!enrollments || enrollments.length === 0) {
                setLoading(false);
                return;
            }

            const classIds = enrollments.map(e => e.class_id);

            // 2. Get Assignments for the current month
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

            const { data: assign, error } = await supabase
                .from('assignments')
                .select(`id, title, due_date, class_id`)
                .in('class_id', classIds)
                .gte('due_date', startOfMonth)
                .lte('due_date', endOfMonth);

            if (error) throw error;
            setAssignments(assign || []);

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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <header className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-indigo-600" /> Calendar
                </h3>
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
                    <button onClick={prevMonth} className="p-1 hover:bg-white rounded-md shadow-sm transition-all text-slate-500 hover:text-indigo-600">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-700 w-24 text-center">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-white rounded-md shadow-sm transition-all text-slate-500 hover:text-indigo-600">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-7 mb-2 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {empties.map(i => <div key={`empty-${i}`} className="aspect-square" />)}
                {daysArray.map(day => {
                    const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dayAssignments = assignments.filter(a => new Date(a.due_date).getDate() === day);
                    const isToday = new Date().toDateString() === currentDayDate.toDateString();
                    const hasAssignment = dayAssignments.length > 0;

                    return (
                        <div
                            key={day}
                            className={`
                                aspect-square rounded-lg flex flex-col items-center justify-center relative text-xs font-medium transition-all
                                ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'}
                                ${hasAssignment && !isToday ? 'font-bold text-slate-900 bg-indigo-50/50' : ''}
                            `}
                        >
                            <span>{day}</span>
                            {hasAssignment && (
                                <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-indigo-500'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Optional: Legend or Mini List of selected day's events? */}
            {/* Keeping it simple as per "just showing assignment due dates" visual request */}
        </div>
    );
}
