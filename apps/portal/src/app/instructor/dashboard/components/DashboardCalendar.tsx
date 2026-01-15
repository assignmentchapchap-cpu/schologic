'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, List, Grid, Plus, X } from 'lucide-react';
import { createClient } from "@schologic/database";
import { useToast } from '@/context/ToastContext';

interface DashboardCalendarProps {
    assignments: any[];
    events: any[]; // New prop for events
    onEventCreated: (event: any) => void;
}

export default function DashboardCalendar({ assignments, events = [], onEventCreated }: DashboardCalendarProps) {
    const supabase = createClient();
    const { showToast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Form State
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDesc, setNewEventDesc] = useState('');
    const [newEventTime, setNewEventTime] = useState('09:00');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sun

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    // Combine and Normalize Items for specific month
    const getMonthItems = () => {
        const monthFilter = (d: Date) => d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();

        const assignmentItems = assignments
            .filter(a => a.due_date && monthFilter(new Date(a.due_date)))
            .map(a => ({
                id: a.id,
                title: a.title,
                date: new Date(a.due_date),
                type: 'assignment' as const,
                time: new Date(a.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

        const eventItems = events
            .filter(e => monthFilter(new Date(e.event_date)))
            .map(e => ({
                id: e.id,
                title: e.title,
                date: new Date(e.event_date),
                type: 'event' as const,
                time: new Date(e.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                description: e.description
            }));

        return [...assignmentItems, ...eventItems].sort((a, b) => a.date.getTime() - b.date.getTime());
    };

    const monthItems = getMonthItems();

    const getItemsForDay = (day: number) => {
        return monthItems.filter(i => i.date.getDate() === day);
    };

    const handleDateClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
        setShowCreateModal(true);
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEventTitle.trim() || !selectedDate) return;
        setIsSubmitting(true);

        // Construct full timestamp
        const fullDate = new Date(selectedDate);
        const [hours, minutes] = newEventTime.split(':').map(Number);
        fullDate.setHours(hours, minutes);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('instructor_events')
                    .insert([{
                        user_id: user.id,
                        title: newEventTitle,
                        description: newEventDesc,
                        event_date: fullDate.toISOString()
                    }])
                    .select()
                    .single();

                if (data) {
                    onEventCreated(data);
                    setShowCreateModal(false);
                    setNewEventTitle('');
                    setNewEventDesc('');
                    setNewEventTime('09:00');
                    showToast('Event created successfully!', 'success');
                } else if (error) {
                    throw new Error(error.message);
                }
            }
        } catch (err: any) {
            console.error(err);
            showToast(err.message || 'Failed to create event.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-3 md:p-6 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col relative overflow-hidden">
            <div className="flex flex-row justify-between items-center mb-2 md:mb-6 gap-2 md:gap-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 shrink-0">
                    <CalendarIcon className="w-5 h-5 text-indigo-500" />
                    Calendar
                </h3>
                <div className="flex items-center gap-1 md:gap-4">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1 md:p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Grid className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1 md:p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-bold text-slate-600 bg-slate-50 px-1.5 md:px-2 py-1 rounded-lg">
                        <button onClick={prevMonth} className="p-0.5 md:p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600">
                            <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <span className="w-20 md:w-32 text-center truncate">{monthName} {year}</span>
                        <button onClick={nextMonth} className="p-0.5 md:p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600">
                            <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* View Area */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-7 gap-1 flex-1 text-center min-h-[300px]">
                    {/* Headers */}
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={`${d}-${i}`} className="text-xs font-bold text-slate-400 py-2">{d}</div>
                    ))}

                    {/* Empty Cells */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}

                    {/* Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayItems = getItemsForDay(day);
                        const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                        const hasWork = dayItems.length > 0;

                        return (
                            <div
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className={`
                                    relative h-10 md:h-full min-h-[40px] rounded-lg flex flex-col items-center justify-start py-1
                                    text-sm font-medium transition-all group cursor-pointer border border-transparent hover:border-indigo-100
                                    ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'}
                                `}
                            >
                                <span className={isToday ? 'font-bold' : ''}>{day}</span>

                                {/* Dots for items */}
                                {hasWork && (
                                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-1">
                                        {dayItems.slice(0, 4).map((item, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-1.5 h-1.5 rounded-full ${item.type === 'assignment' ? 'bg-emerald-400' : 'bg-blue-400'} ${isToday ? 'ring-1 ring-black/10' : ''}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {monthItems.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No events or assignments for {monthName}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {monthItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all">
                                    <div className={`p-3 rounded-xl ${item.type === 'assignment' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {item.type === 'assignment' ? <Clock className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-800">{item.title}</h4>
                                            <span className="text-xs font-bold text-slate-400">{item.date.getDate()} {monthName}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                            <span>{item.time}</span>
                                            {item.type === 'assignment' && <span className="bg-emerald-50 text-emerald-600 px-1.5 rounded text-[10px] font-bold uppercase">Assignment</span>}
                                            {item.type === 'event' && <span className="bg-blue-50 text-blue-600 px-1.5 rounded text-[10px] font-bold uppercase">Event</span>}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Footer Summary */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    Assignments
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    My Events
                </div>
            </div>

            {/* Create Event Modal */}
            {showCreateModal && (
                <div className="absolute inset-0 bg-white/95 z-50 flex flex-col p-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-base text-slate-800">Add Event</h3>
                        <button onClick={() => setShowCreateModal(false)} className="p-1.5 bg-slate-100 rounded-full hover:bg-slate-200">
                            <X className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>

                    <form onSubmit={handleCreateEvent} className="flex-1 flex flex-col gap-3 overflow-y-auto px-1">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
                            <div className="p-2 bg-slate-50 rounded-lg font-medium text-slate-700 text-sm">
                                {selectedDate?.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Event Title</label>
                            <input
                                type="text"
                                required
                                value={newEventTitle}
                                onChange={e => setNewEventTitle(e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. Faculty Meeting"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Time</label>
                            <input
                                type="time"
                                required
                                value={newEventTime}
                                onChange={e => setNewEventTime(e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description (Optional)</label>
                            <textarea
                                value={newEventDesc}
                                onChange={e => setNewEventDesc(e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-16 resize-none"
                                placeholder="Details..."
                            />
                        </div>

                        <div className="mt-auto pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50 transition-all flex justify-center items-center gap-2 text-sm"
                            >
                                {isSubmitting ? 'Saving...' : <><Plus className="w-4 h-4" /> Add to Calendar</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
