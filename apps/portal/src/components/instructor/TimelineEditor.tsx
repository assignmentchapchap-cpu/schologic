'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@schologic/database';
import { TimelineConfig, TimelineEvent, TimelineWeek, generateTimeline } from '@schologic/practicum-core';
import { Calendar, Plus, Trash2, Save, X, AlertCircle, CheckCircle, Edit2, Filter, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { v4 as uuidv4 } from 'uuid';

interface TimelineEditorProps {
    practicumId: string;
    initialConfig: TimelineConfig;
    onUpdate?: (newConfig: TimelineConfig) => void;
    // New props for regeneration
    startDate: string;
    endDate: string;
    cohortTitle: string;
    logInterval: 'daily' | 'weekly';
    onDirtyChange?: (isDirty: boolean) => void;
}

export default function TimelineEditor({ practicumId, initialConfig, onUpdate, startDate, endDate, cohortTitle, logInterval, onDirtyChange }: TimelineEditorProps) {
    const supabase = createClient();
    const { showToast } = useToast();

    // Determine the type for config state. It might come from DB as generic Json, so we cast it.
    const [config, setConfig] = useState<TimelineConfig>(initialConfig || { weeks: [], events: [] });
    const [loading, setLoading] = useState(false);
    const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
    const [showLogs, setShowLogs] = useState(false);
    const prevDirtyRef = useRef(false); // Using ref to track emission

    // Track Dirty State
    useEffect(() => {
        const isDirty = JSON.stringify(initialConfig || { weeks: [], events: [] }) !== JSON.stringify(config);

        // Only emit if value implies a change from what we expect or just to be safe, only if it changes?
        // Actually, we can use a ref to prevent duplicate emissions
        // But simply checking if (isDirty) inside effect that runs on onDirtyChange is dangerous if parent recreates handler.
        // We will assume parent might recreate handler, so we should guard emission.

        // HOWEVER, since we can't use useRef directly in replace loop easily without adding import, 
        // I'll assume useRef is available or use a state-based approach? No, state causes render.
        // I will just use the fact that I can import useRef.
        // A simpler way: Remove onDirtyChange from dependency array. 
        // ESLint warns, but it is often safe if handler is stable-ish or we don't care about stale closure (here we strictly call it with boolean).

        // Better:
        if (onDirtyChange) onDirtyChange(isDirty);

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [config, initialConfig]); // Removed onDirtyChange from deps to break loop

    const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

    const handleRegenerate = () => {
        setShowRegenerateConfirm(true);
    };

    const confirmRegenerate = () => {
        try {
            const newConfig = generateTimeline(startDate, endDate, logInterval, cohortTitle);
            setConfig(newConfig);
            showToast('Timeline regenerated with new defaults', 'success');
        } catch (e) {
            console.error(e);
            showToast('Failed to regenerate timeline', 'error');
        } finally {
            setShowRegenerateConfirm(false);
        }
    };


    // Helpers
    const getEventsForWeek = (week: TimelineWeek) => {
        if (!config?.events) return [];
        const start = new Date(week.start_date);
        const end = new Date(week.end_date);
        // Ensure we cover the full end day
        end.setHours(23, 59, 59, 999);

        return config.events.filter(e => {
            const d = new Date(e.date);
            // Time range check
            const inRange = d >= start && d <= end;
            // Filter check
            if (!showLogs && e.type === 'log') return false;

            return inRange;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const getVisibleWeeks = () => {
        if (!config?.weeks) return [];

        return config.weeks.filter(week => {
            const events = getEventsForWeek(week);
            return events.length > 0;
        });
    };

    const getPreWeekEvents = () => {
        if (!config?.weeks || config.weeks.length === 0) return [];
        const firstStart = new Date(config.weeks[0].start_date);

        return config.events.filter(e => {
            const d = new Date(e.date);
            if (!showLogs && e.type === 'log') return false;
            return d < firstStart;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const getPostWeekEvents = () => {
        if (!config?.weeks || config.weeks.length === 0) return config?.events || []; // If no weeks, everything is here (or handled loosely)
        const lastEnd = new Date(config.weeks[config.weeks.length - 1].end_date);

        return config.events.filter(e => {
            const d = new Date(e.date);
            if (!showLogs && e.type === 'log') return false;
            return d > lastEnd;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    // Render helper for an event item
    const renderEvent = (event: TimelineEvent) => (
        <div key={event.id} className="group flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all">
            <div className="flex items-start gap-3">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${event.type === 'report' ? 'bg-red-500' :
                    event.type === 'log' ? 'bg-blue-500' :
                        event.type === 'meeting' ? 'bg-purple-500' : 'bg-emerald-500'
                    }`} />
                <div>
                    <p className="text-sm font-bold text-slate-800">{event.title}</p>
                    {event.description && <p className="text-xs text-slate-500">{event.description}</p>}
                    <p className="text-xs text-slate-400 mt-1">{new Date(event.date).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setEditingEvent(event)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('practicums')
                .update({ timeline: config as any }) // Cast to any for Json column
                .eq('id', practicumId);

            if (error) throw error;
            showToast('Timeline saved successfully', 'success');
            if (onUpdate) onUpdate(config);
        } catch (err) {
            console.error(err);
            showToast('Failed to save timeline', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = (id: string) => {
        setConfig(prev => ({
            ...prev,
            events: prev.events.filter(e => e.id !== id)
        }));
    };

    const handleAddEvent = () => {
        // Default to today or start of first week
        const defaultDate = config?.weeks && config.weeks.length > 0 ? config.weeks[0].start_date : new Date().toISOString();
        const newEvent: TimelineEvent = {
            id: uuidv4(),
            title: 'New Event',
            date: defaultDate,
            type: 'milestone',
            description: ''
        };
        setEditingEvent(newEvent);
    };

    const saveEventEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEvent) return;

        setConfig(prev => {
            const exists = prev.events.find(ev => ev.id === editingEvent.id);
            if (exists) {
                return {
                    ...prev,
                    events: prev.events.map(ev => ev.id === editingEvent.id ? editingEvent : ev)
                };
            } else {
                return {
                    ...prev,
                    events: [...prev.events, editingEvent]
                };
            }
        });
        setEditingEvent(null);
    };

    // Count invisible logs to show what's hidden
    const hiddenLogCount = !showLogs && config?.events ? config.events.filter(e => e.type === 'log').length : 0;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" /> Timeline & Events
                    </h3>
                    <p className="text-sm text-slate-500">Manage key dates and submission deadlines.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors border ${showLogs
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {showLogs ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {showLogs ? 'Hiding Logs' : 'Showing Logs'}
                        {!showLogs && hiddenLogCount > 0 && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-xs">{hiddenLogCount}</span>}
                    </button>
                    <button
                        onClick={handleRegenerate}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-500 rounded-lg text-sm font-bold hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                        title="Reset to defaults"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleAddEvent}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Event
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="space-y-6">
                    {/* Pre-Week Events (Early Milestones) */}
                    {getPreWeekEvents().length > 0 && (
                        <div className="relative pl-8 border-l-2 border-slate-100 pb-6 transition-all">
                            <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-slate-100 border-2 border-white ring-1 ring-slate-200 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            </div>
                            <div className="mb-2">
                                <h4 className="font-bold text-slate-700">Pre-Practicum</h4>
                            </div>
                            <div className="space-y-2">
                                {getPreWeekEvents().map(renderEvent)}
                            </div>
                        </div>
                    )}

                    {/* Weekly Events */}
                    {getVisibleWeeks().map(week => (
                        <div key={week.week_number} className="relative pl-8 border-l-2 border-slate-100 last:border-0 pb-6 transition-all">
                            <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-slate-100 border-2 border-white ring-1 ring-slate-200 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            </div>

                            <div className="flex items-baseline justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-700">{week.label}</h4>
                                </div>
                                <span className="text-xs font-mono text-slate-400">
                                    {new Date(week.start_date).toLocaleDateString()} - {new Date(week.end_date).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="space-y-2 animate-fade-in">
                                {getEventsForWeek(week).map(renderEvent)}
                            </div>
                        </div>
                    ))}

                    {/* Post-Week Events (Late Milestones) */}
                    {getPostWeekEvents().length > 0 && (
                        <div className="relative pl-8 border-l-2 border-slate-100 pb-6 border-transparent">
                            <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-slate-100 border-2 border-white ring-1 ring-slate-200 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            </div>
                            <div className="mb-2">
                                <h4 className="font-bold text-slate-700">Post-Practicum</h4>
                            </div>
                            <div className="space-y-2">
                                {getPostWeekEvents().map(renderEvent)}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {getVisibleWeeks().length === 0 && getPreWeekEvents().length === 0 && getPostWeekEvents().length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                            <p>No visible events. {hiddenLogCount > 0 ? 'Enable "Show Logs" to see log submissions.' : 'Add an event to get started.'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                        <form onSubmit={saveEventEdit}>
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-900">
                                    {config.events.find(e => e.id === editingEvent.id) ? 'Edit Event' : 'New Event'}
                                </h3>
                                <button type="button" onClick={() => setEditingEvent(null)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingEvent.title}
                                        onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-700"
                                        placeholder="Event Title"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={editingEvent.date.split('T')[0]} // Handle ISO string
                                        onChange={e => setEditingEvent({ ...editingEvent, date: new Date(e.target.value).toISOString() })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Type</label>
                                        <select
                                            value={editingEvent.type}
                                            onChange={e => setEditingEvent({ ...editingEvent, type: e.target.value as any })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                        >
                                            <option value="milestone">Milestone</option>
                                            <option value="deadline">Deadline</option>
                                            <option value="log">Log Submission</option>
                                            <option value="report">Report</option>
                                            <option value="meeting">Meeting</option>
                                        </select>
                                    </div>
                                    <div>
                                        {/* Optional: System Flag or other meta */}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                                    <textarea
                                        value={editingEvent.description || ''}
                                        onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-20 text-sm resize-none"
                                        placeholder="Optional description..."
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingEvent(null)}
                                    className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 rounded-lg transition-colors"
                                >
                                    Save Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Regeneration Confirmation Modal */}
            {showRegenerateConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="animate-spin-slow"><RefreshCw className="w-6 h-6" /></span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Reset Timeline?</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            This will regenerate the entire timeline based on default settings. <br />
                            <strong className="text-red-500">All custom events and edits will be lost.</strong>
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRegenerateConfirm(false)}
                                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRegenerate}
                                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md shadow-emerald-200"
                            >
                                Yes, Reset It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
