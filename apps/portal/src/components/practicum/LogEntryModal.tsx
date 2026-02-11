'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, Save, Loader2, Upload, AlertCircle, Plus } from 'lucide-react';
import { createClient } from "@schologic/database";
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { PracticumLogEntry, LogTemplateType, LogFrequency } from '@/types/practicum';
import { useRouter } from 'next/navigation';

interface LogEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    practicumId: string;
    templateType: LogTemplateType;
    logInterval: LogFrequency;
    weekNumber?: number;
    initialDate?: string; // Specific date being edited
    initialData?: PracticumLogEntry; // Data for that day
    onSuccess: () => void;
    // Strict Date Logic Props
    weekStart?: string; // Monday of the target week
    scheduleDays?: string[]; // Allowed days e.g. ['Mon', 'Tue']
    existingDates?: string[]; // Dates already logged in this container
}

export default function LogEntryModal({
    isOpen,
    onClose,
    practicumId,
    templateType,
    logInterval,
    weekNumber,
    initialDate,
    initialData,
    onSuccess,
    weekStart,
    scheduleDays = [],
    existingDates = []
}: LogEntryModalProps) {
    const { showToast } = useToast();
    const router = useRouter();
    const supabase = createClient();

    const [submitting, setSubmitting] = useState(false);

    // Compute Available Dates
    const availableDates = useMemo(() => {
        if (!weekStart) return [];

        const dates: { date: string, label: string }[] = [];
        const start = new Date(weekStart);

        // Generate 7 days
        for (let i = 0; i < 7; i++) {
            const current = new Date(start);
            current.setDate(start.getDate() + i);

            const iso = current.toISOString().split('T')[0];
            const dayName = current.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue"

            // 1. Check Schedule (if provided)
            if (scheduleDays.length > 0 && !scheduleDays.includes(dayName)) continue;

            // 2. Check Duplicates (unless we are editing THIS specific date)
            if (!initialDate && existingDates.includes(iso)) continue;

            dates.push({
                date: iso,
                label: `${dayName}, ${current.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
            });
        }
        return dates;
    }, [weekStart, scheduleDays, existingDates, initialDate]);

    // State is always single-day now
    const [date, setDate] = useState(initialDate || '');
    const [clockIn, setClockIn] = useState(initialData?.clock_in ? new Date(initialData.clock_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '08:00');
    const [clockOut, setClockOut] = useState(initialData?.clock_out ? new Date(initialData.clock_out).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '17:00');
    const [entry, setEntry] = useState<Partial<PracticumLogEntry>>(initialData || {});

    // Reset state when opening/changing target
    useEffect(() => {
        if (isOpen) {
            setEntry(initialData || {});
            setClockIn(initialData?.clock_in ? new Date(initialData.clock_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '08:00');
            setClockOut(initialData?.clock_out ? new Date(initialData.clock_out).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '17:00');

            if (initialDate) {
                setDate(initialDate);
            } else if (availableDates.length > 0) {
                setDate(availableDates[0].date);
            } else {
                setDate(''); // No dates available
            }
        }
    }, [isOpen, initialDate, initialData, availableDates]);

    const handleChange = (field: keyof PracticumLogEntry, value: any) => {
        setEntry(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent | null, action: 'new' | 'exit' = 'exit') => {
        if (e) e.preventDefault();

        if (!date) {
            showToast("Please select a date", "error");
            return;
        }

        setSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required");

            // Build full ISO strings for clock in/out
            const clockInIso = `${date}T${clockIn}:00`;
            const clockOutIso = `${date}T${clockOut}:00`;

            // 1. Get or Create the Log Container (Daily or Weekly)
            let logId = '';

            if (logInterval === 'daily') {
                // Standard Daily Log
                const payload: any = {
                    student_id: user.id,
                    practicum_id: practicumId,
                    submission_status: 'draft',
                    log_date: date,
                    clock_in: clockInIso,
                    clock_out: clockOutIso,
                    entries: entry
                };

                const { error } = await supabase.from('practicum_logs').upsert(payload, { onConflict: 'student_id, practicum_id, log_date' });
                if (error) throw error;

            } else {
                // Weekly/Monthly: We need to find the existing log container for this week
                // If we passed weekNumber, use it. Otherwise, query by date. (Ideally weekNumber is passed)

                // For simplicity in this modal, we assume the parent passed the correct weekNumber if it exists.
                // If not, we query the log that covers this date? 
                // Better approach: The parent creates the "Log Container" first.
                // This modal effectively "UPSERTS" a day entry into the JSONB `entries` column.

                // Fetch the log for the target week
                if (!weekNumber) throw new Error("Week number required for weekly logs");

                const { data: existingLog, error: fetchError } = await supabase
                    .from('practicum_logs')
                    .select('*')
                    .eq('practicum_id', practicumId)
                    .eq('student_id', user.id)
                    .eq('week_number', weekNumber)
                    .single();

                if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

                if (!existingLog) {
                    // This should ideally not happen if parent creates it, but fallback:
                    throw new Error("Log container for this week not found. Please start the week first.");
                }

                logId = existingLog.id;
                const currentDays = (existingLog.entries as any)?.days || [];

                // Remove existing entry for this date if we are editing
                const otherDays = currentDays.filter((d: any) => d.date !== date);

                const newDayEntry = {
                    ...entry,
                    date,
                    clock_in: clockInIso,
                    clock_out: clockOutIso
                };

                // Add new/updated entry and sort by date
                const updatedDays = [...otherDays, newDayEntry].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

                const { error: updateError } = await supabase
                    .from('practicum_logs')
                    .update({
                        entries: { ...(existingLog.entries as any || {}), days: updatedDays }
                    })
                    .eq('id', logId);

                if (updateError) throw updateError;
            }

            showToast("Log entry saved successfully", "success");
            onSuccess();

            if (action === 'new') {
                // Find next available date
                const currentIndex = availableDates.findIndex(d => d.date === date);
                if (currentIndex >= 0 && currentIndex < availableDates.length - 1) {
                    setDate(availableDates[currentIndex + 1].date);
                }
                setEntry({});
            } else {
                onClose();
            }

        } catch (error: any) {
            console.error("Log submission error:", error);
            showToast(error.message || "Failed to save draft", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const isTeaching = templateType === 'teaching_practice';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[95vh] flex flex-col ring-1 ring-slate-900/5">
                {/* Header */}
                <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-white z-10">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                            {initialData ? 'Edit' : 'New'} Log Entry
                        </h3>
                        <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
                            <span className="capitalize">{logInterval} Log</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-emerald-600 font-semibold">{date || 'Select Date'}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-8 flex-grow">
                    <form id="log-form" className="space-y-8">

                        {/* Logistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 mb-1.5"><Calendar className="w-4 h-4 text-emerald-500" /> Date</label>
                                {initialDate ? (
                                    <div className="w-full bg-slate-100 border border-slate-200 shadow-sm rounded-xl px-4 py-3.5 text-sm font-bold text-slate-500 cursor-not-allowed">
                                        {new Date(initialDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                ) : (
                                    <select
                                        required
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="w-full bg-white border border-slate-300 shadow-sm rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300 placeholder:text-slate-400"
                                    >
                                        <option value="" disabled>Select Day</option>
                                        {availableDates.map(d => (
                                            <option key={d.date} value={d.date}>{d.label}</option>
                                        ))}
                                    </select>
                                )}
                                {!initialDate && availableDates.length === 0 && (
                                    <p className="text-xs text-red-500 font-medium mt-1">No available days remaining this week.</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 mb-1.5"><Clock className="w-4 h-4 text-slate-400" /> Start Time</label>
                                <input type="time" required value={clockIn} onChange={e => setClockIn(e.target.value)} className="w-full bg-white border border-slate-300 shadow-sm rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 mb-1.5"><Clock className="w-4 h-4 text-slate-400" /> End Time</label>
                                <input type="time" required value={clockOut} onChange={e => setClockOut(e.target.value)} className="w-full bg-white border border-slate-300 shadow-sm rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300" />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-100" />

                        {/* Dynamic Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isTeaching ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Grade</label>
                                        <input required placeholder="e.g. Form 3B" value={entry.class_taught || ''} onChange={e => handleChange('class_taught', e.target.value)}
                                            className="w-full bg-white border border-slate-300 shadow-sm rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300 placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Subject</label>
                                        <input required placeholder="e.g. Mathematics" value={entry.subject_taught || ''} onChange={e => handleChange('subject_taught', e.target.value)}
                                            className="w-full bg-white border border-slate-300 shadow-sm rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300 placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Topic / Sub-topic</label>
                                        <input required placeholder="e.g. Algebra: Linear Equations" value={entry.lesson_topic || ''} onChange={e => handleChange('lesson_topic', e.target.value)}
                                            className="w-full bg-white border border-slate-300 shadow-sm rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300 placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Self-Observation / Remarks</label>
                                        <textarea required placeholder="Reflect on lesson delivery, student engagement, or challenges..." value={entry.observations || ''} onChange={e => handleChange('observations', e.target.value)}
                                            className="w-full bg-white border border-slate-300 shadow-sm rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300 placeholder:text-slate-400 resize-y min-h-[120px] leading-relaxed"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Department / Section</label>
                                        <input required placeholder="e.g. IT Support" value={entry.department || ''} onChange={e => handleChange('department', e.target.value)}
                                            className="w-full bg-white border border-slate-300 shadow-sm rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300 placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Tasks Performed</label>
                                        <textarea required placeholder="List the main activities you undertook today..." value={entry.tasks_performed || ''} onChange={e => handleChange('tasks_performed', e.target.value)}
                                            className="w-full bg-white border border-slate-300 shadow-sm rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300 placeholder:text-slate-400 resize-y min-h-[100px] leading-relaxed"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">New Skills / Knowledge Acquired</label>
                                        <textarea required placeholder="What did you learn today?" value={entry.skills_acquired || ''} onChange={e => handleChange('skills_acquired', e.target.value)}
                                            className="w-full bg-white border border-slate-300 shadow-sm rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300 placeholder:text-slate-400 resize-y min-h-[100px] leading-relaxed"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Challenges Encountered</label>
                                        <textarea placeholder="Describe any difficulties faced..." value={entry.challenges || ''} onChange={e => handleChange('challenges', e.target.value)}
                                            className="w-full bg-white border border-slate-300 shadow-sm rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300 placeholder:text-slate-400 resize-y min-h-[80px] leading-relaxed"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/50 z-10">
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={(e) => handleSubmit(null, 'new')}
                        className="px-6 py-3 rounded-xl font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Save & Add New
                    </button>
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={(e) => handleSubmit(null, 'exit')}
                        className="px-8 py-3 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save & Exit
                    </button>
                </div>
            </div>
        </div>
    );
}
