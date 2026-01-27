
'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { FileText, CheckCircle, Clock, BookOpen, ArrowRight, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

type AssignmentItem = {
    id: string;
    title: string;
    due_date: string | null;
    class_name: string;
};



export default function GlobalAssignmentsCard() {
    const supabase = createClient();
    const [stats, setStats] = useState({
        activeClasses: 0,
        submitted: 0,
        unsubmitted: 0
    });
    const [unsubmittedList, setUnsubmittedList] = useState<AssignmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchGlobalStats();
    }, []);
    // ... (omitted fetching logic for brevity in tool call, standard replace will keep lines not touched? No replace_file_content replaces range. I need to be careful.)

    // Wait, I should use replace_file_content on specific blocks.

    const fetchGlobalStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get Active Enrollments
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select(`
                    class_id,
                    classes (
                        id, name, is_locked, end_date
                    )
                `)
                .eq('student_id', user.id);

            const activeClassesList = (enrollments || [])
                .map(e => e.classes)
                .filter(c => {
                    const cls = Array.isArray(c) ? c[0] : c;
                    return cls && !cls.is_locked;
                });

            const activeClassIds = activeClassesList.map(c => {
                const cls = Array.isArray(c) ? c[0] : c;
                return cls!.id;
            });

            // 2. Get All Assignments for Active Classes
            const { data: assignments } = await supabase
                .from('assignments')
                .select('id, title, due_date, class_id')
                .in('class_id', activeClassIds);

            const allAssignments = assignments || [];

            // 3. Get User Submissions
            const { data: submissions } = await supabase
                .from('submissions')
                .select('assignment_id')
                .eq('student_id', user.id);

            const submittedIds = new Set((submissions || []).map(s => s.assignment_id));

            // 4. Calculate Stats
            const submittedCount = submittedIds.size; // This matches unique submissions. 
            // Note: If user submitted to a class they are no longer in, this might be off? 
            // But usually we care about current workload. Let's filter submissions to matches assignments list?
            // Actually simpler: iterate assignments.

            let validSubmitted = 0;
            const unsubmittedItems: AssignmentItem[] = [];

            allAssignments.forEach(a => {
                if (submittedIds.has(a.id)) {
                    validSubmitted++;
                } else {
                    const foundClass = activeClassesList.find(c => {
                        const cls = Array.isArray(c) ? c[0] : c;
                        return cls!.id === a.class_id;
                    });
                    const cls = Array.isArray(foundClass) ? foundClass[0] : foundClass;

                    unsubmittedItems.push({
                        id: a.id,
                        title: a.title,
                        due_date: a.due_date,
                        class_name: cls ? cls.name : 'Unknown Class'
                    });
                }
            });

            setStats({
                activeClasses: activeClassesList.length,
                submitted: validSubmitted,
                unsubmitted: unsubmittedItems.length
            });
            setUnsubmittedList(unsubmittedItems.sort((a, b) => new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime()));

        } catch (error) {
            console.error("Error fetching global stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-pulse bg-slate-200 h-48 rounded-2xl"></div>;

    return (
        <>
            <Card
                onClick={() => setShowModal(true)}
                className="hover:border-indigo-400 group"
                hoverEffect
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" /> Workload Overview
                    </h3>
                    <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-100">
                    <div className="px-2">
                        <p className="text-3xl font-black text-slate-800 mb-1">{stats.activeClasses}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-center items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Active Classes
                        </p>
                    </div>
                    <div className="px-2">
                        <p className="text-3xl font-black text-emerald-500 mb-1">{stats.submitted}</p>
                        <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider flex justify-center items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Submitted
                        </p>
                    </div>
                    <div className="px-2 relative">
                        {stats.unsubmitted > 0 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>}
                        <p className="text-3xl font-black text-amber-500 mb-1">{stats.unsubmitted}</p>
                        <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider flex justify-center items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending
                        </p>
                    </div>
                </div>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-amber-500" /> Pending Assignments
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">You have {stats.unsubmitted} unsubmitted tasks.</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {unsubmittedList.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <h4 className="font-bold text-slate-800">All Caught Up!</h4>
                                    <p className="text-slate-400 text-sm mt-1">You have no pending assignments.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 p-2">
                                    {unsubmittedList.map(item => (
                                        <Link
                                            key={item.id}
                                            href={`/student/assignment/${item.id}`}
                                            className="block group"
                                            onClick={(e) => e.stopPropagation()} // Let link handle nav
                                        >
                                            <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex justify-between items-center group-hover:translate-x-1">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                                        {item.class_name}
                                                    </span>
                                                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                                                    {item.due_date && (
                                                        <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
                                                            Due: {new Date(item.due_date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
