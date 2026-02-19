'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Search, Users, User, Shield, CheckCircle2, Loader2, Send, ChevronRight, Check } from 'lucide-react';
import { createClient } from "@schologic/database";
import { useUser } from '@/context/UserContext';
import { useMessages } from '@/context/MessageContext';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

interface NewMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Mode = 'direct' | 'admin' | 'class';

export default function NewMessageModal({ isOpen, onClose }: NewMessageModalProps) {
    const { user } = useUser();
    if (user?.role === 'student') return null;
    const { sendMessage, newMessageOptions } = useMessages();
    const supabase = createClient();

    const [mode, setMode] = useState<Mode>('direct');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Recipient state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

    // UI state
    const [isSearching, setIsSearching] = useState(false);
    const [isSelectingClasses, setIsSelectingClasses] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [availableClasses, setAvailableClasses] = useState<any[]>([]);
    const [admins, setAdmins] = useState<any[]>([]);

    // Handle pre-fill options
    useEffect(() => {
        if (isOpen && newMessageOptions) {
            // First reset to clear any stale state from previous manual use
            resetForm();

            // Apply pre-fills
            setMode('direct'); // Always use direct mode for feedback responses
            if (newMessageOptions.subject) {
                setSubject(newMessageOptions.subject);
            }
            if (newMessageOptions.recipientId) {
                const fetchRecipient = async () => {
                    const { data } = await supabase
                        .from('profiles')
                        .select('id, full_name, role')
                        .eq('id', newMessageOptions.recipientId as string)
                        .single();
                    if (data) {
                        setSelectedStudents([data]);
                    }
                };
                fetchRecipient();
            }
        }
    }, [isOpen, newMessageOptions, supabase]);

    useEffect(() => {
        if (!isOpen || !user) return;

        const fetchData = async () => {
            // 1. Fetch Classes
            const { data: classes } = await supabase
                .from('classes')
                .select('id, name')
                .eq('instructor_id', user.id);
            if (classes) setAvailableClasses(classes);

            // 2. Fetch Superadmin for 'admin' mode
            const { data: superadmins } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('role', 'superadmin')
                .limit(1);
            if (superadmins) setAdmins(superadmins);
        };

        fetchData();
    }, [isOpen, user]);

    // Student search
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const delay = setTimeout(async () => {
            if (!user) return;
            setIsSearching(true);

            let data;
            if (user.role === 'superadmin') {
                // Universal Search for Admins: Search all profiles
                const { data: results } = await supabase
                    .from('profiles')
                    .select('id, full_name, role')
                    .neq('id', user.id) // Don't message yourself
                    .ilike('full_name', `%${searchQuery}%`)
                    .limit(10);
                data = results?.map(p => ({ student: p }));
            } else {
                // Restricted Search for Instructors: Only their students
                const { data: results } = await supabase
                    .from('enrollments')
                    .select(`
                        student:profiles!enrollments_student_id_fkey (
                            id,
                            full_name,
                            role
                        ),
                        class:classes!enrollments_class_id_fkey (
                            instructor_id
                        )
                    `)
                    .eq('class.instructor_id', user.id)
                    .ilike('student.full_name', `%${searchQuery}%`)
                    .limit(10);
                data = results;
            }

            if (data) {
                // Extract and deduplicate profiles from search results
                const studentsWithIds = data
                    .map(e => (e as any).student)
                    .filter((s): s is { id: string; full_name: string | null; role: string | null } => s !== null && !!s.id);

                const uniqueIds = Array.from(new Set(studentsWithIds.map(s => s.id)));
                const uniqueStudents = uniqueIds.map(id => studentsWithIds.find(s => s.id === id));

                setSearchResults(uniqueStudents.filter(Boolean));
            }
            setIsSearching(false);
        }, 500);

        return () => clearTimeout(delay);
    }, [searchQuery]);

    const handleSend = async () => {
        if (!content.trim() || !user) return;

        setIsSending(true);
        const broadcastId = crypto.randomUUID();

        try {
            const finalRecipients = new Set<string>();

            if (mode === 'admin' && admins.length > 0) {
                finalRecipients.add(admins[0].id);
            } else if (mode === 'class') {
                const { data } = await supabase
                    .from('enrollments')
                    .select('student_id')
                    .in('class_id', selectedClassIds);
                data?.forEach(e => {
                    if (e.student_id) finalRecipients.add(e.student_id);
                });
            } else {
                selectedStudents.forEach(s => finalRecipients.add(s.id));
            }

            const promises = Array.from(finalRecipients).map(rid =>
                sendMessage(rid, content.trim(), subject.trim() || null, null, mode === 'class' ? broadcastId : null)
            );

            await Promise.all(promises);
            onClose();
            resetForm();
        } catch (err) {
            console.error('Failed to send:', err);
        } finally {
            setIsSending(false);
        }
    };

    const resetForm = () => {
        setMode('direct');
        setSubject('');
        setContent('');
        setSelectedStudents([]);
        setSelectedClassIds([]);
        setSearchQuery('');
        setIsSelectingClasses(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full h-full md:h-auto md:max-w-lg bg-white md:rounded-[32px] shadow-2xl border-t md:border border-slate-100 flex flex-col overflow-hidden max-h-screen md:max-h-[600px] animate-in md:zoom-in-95 slide-in-from-bottom md:slide-in-from-transparent duration-300">

                {/* Header with Mode Switches */}
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">New Message</h2>
                        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => { setMode('direct'); setIsSelectingClasses(false); }}
                            className={cn(
                                "flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                mode === 'direct' ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                            )}
                        >
                            Direct Message
                        </button>
                        <button
                            onClick={() => { setMode('admin'); setIsSelectingClasses(false); }}
                            className={cn(
                                "flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                mode === 'admin' ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                            )}
                        >
                            Message Admin
                        </button>
                        <button
                            onClick={() => { setMode('class'); setIsSelectingClasses(true); }}
                            className={cn(
                                "flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                mode === 'class' ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                            )}
                        >
                            Message Class
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">

                    {/* Mode-specific Recipient Selection */}
                    {mode === 'direct' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">To Student(s)</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type="text"
                                    placeholder="Search student name..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-indigo-600 outline-none transition-all shadow-inner"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-400" />}

                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 p-2">
                                        {searchResults.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => {
                                                    if (!selectedStudents.find(curr => curr.id === s.id)) {
                                                        setSelectedStudents([...selectedStudents, s]);
                                                    }
                                                    setSearchQuery('');
                                                }}
                                                className="w-full p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 text-left transition-colors"
                                            >
                                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                    <User className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{s.full_name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selection Preview */}
                            {selectedStudents.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {selectedStudents.map(s => (
                                        <div key={s.id} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-100 animate-in zoom-in-95">
                                            <span className="text-xs font-black">{s.full_name}</span>
                                            <button onClick={() => setSelectedStudents(selectedStudents.filter(curr => curr.id !== s.id))}>
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {mode === 'class' && isSelectingClasses && (
                        <div className="space-y-4 py-2">
                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">Select Target Classes</label>
                            <div className="grid grid-cols-1 gap-2">
                                {availableClasses.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            if (selectedClassIds.includes(c.id)) {
                                                setSelectedClassIds(selectedClassIds.filter(id => id !== c.id));
                                            } else {
                                                setSelectedClassIds([...selectedClassIds, c.id]);
                                            }
                                        }}
                                        className={cn(
                                            "p-4 rounded-2xl flex items-center justify-between border-2 transition-all",
                                            selectedClassIds.includes(c.id) ? "bg-emerald-50 border-emerald-500" : "bg-white border-slate-100 hover:border-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Users className={cn("w-5 h-5", selectedClassIds.includes(c.id) ? "text-emerald-500" : "text-slate-300")} />
                                            <span className={cn("text-sm font-bold", selectedClassIds.includes(c.id) ? "text-emerald-700" : "text-slate-600")}>{c.name}</span>
                                        </div>
                                        {selectedClassIds.includes(c.id) && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                    </button>
                                ))}
                            </div>
                            <Button
                                fullWidth
                                variant="success"
                                className="h-12 rounded-xl font-black text-xs"
                                disabled={selectedClassIds.length === 0}
                                onClick={() => setIsSelectingClasses(false)}
                            >
                                Done Selecting ({selectedClassIds.length})
                            </Button>
                        </div>
                    )}

                    {!isSelectingClasses && (
                        <>
                            {/* Summary for classes */}
                            {mode === 'class' && !isSelectingClasses && (
                                <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-emerald-500" />
                                        <span className="text-sm font-black text-emerald-700">{selectedClassIds.length} Classes Selected</span>
                                    </div>
                                    <button onClick={() => setIsSelectingClasses(true)} className="text-[10px] font-black text-emerald-600 hover:underline">Change</button>
                                </div>
                            )}

                            {/* Shared Subject & Message Fields */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subject</label>
                                    <input
                                        type="text"
                                        placeholder="Enter subject line..."
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Message</label>
                                    <textarea
                                        placeholder="Write your message..."
                                        className="w-full h-32 px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl text-sm font-bold outline-none transition-all shadow-inner resize-none custom-scrollbar"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Action */}
                {!isSelectingClasses && (
                    <div className="p-6 bg-white border-t border-slate-50 mt-auto">
                        <Button
                            fullWidth
                            isLoading={isSending}
                            disabled={!content.trim() || !subject.trim() || (mode === 'direct' && selectedStudents.length === 0) || (mode === 'class' && selectedClassIds.length === 0)}
                            onClick={handleSend}
                            className={cn(
                                "h-14 md:h-14 rounded-2xl font-black text-sm transition-all",
                                mode === 'admin' ? "bg-slate-900 shadow-xl shadow-slate-200" :
                                    mode === 'class' ? "bg-emerald-600 shadow-xl shadow-emerald-200" :
                                        "bg-indigo-600 shadow-xl shadow-indigo-200"
                            )}
                            rightIcon={<Send className="w-4 h-4" />}
                        >
                            {mode === 'admin' ? 'Send to Admin' : mode === 'class' ? 'Broadcast to Class' : 'Send Message'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
