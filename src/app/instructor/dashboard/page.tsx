'use client';

import { createClient } from '@/lib/supabase';
import { Home, Clock, ChevronRight, X, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationBell from '@/components/NotificationBell';
import { useRouter } from 'next/navigation';

export default function InstructorDashboard() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
    const [allAssignments, setAllAssignments] = useState<any[]>([]);
    const [stats, setStats] = useState({ ungraded: 0, new: 0 });
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);

                // Fetch Classes
                const { data: classesData } = await supabase
                    .from('classes')
                    .select('id, name')
                    .eq('instructor_id', user.id);

                if (classesData && classesData.length > 0) {
                    setClasses(classesData);
                    const classIds = classesData.map(c => c.id);

                    // Fetch All Submissions & Assignments for these classes
                    const [submissionsRes, assignmentsRes] = await Promise.all([
                        supabase.from('submissions').select('id, class_id, grade, created_at').in('class_id', classIds),
                        supabase.from('assignments').select('id, class_id').in('class_id', classIds)
                    ]);

                    if (submissionsRes.data) {
                        setAllSubmissions(submissionsRes.data);
                        calculateStats(classesData, submissionsRes.data);
                    }
                    if (assignmentsRes.data) {
                        setAllAssignments(assignmentsRes.data);
                    }
                }
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const calculateStats = (classesList: any[], submissionsList: any[]) => {
        let totalUngraded = 0;
        let totalNew = 0;

        classesList.forEach(cls => {
            const classSubs = submissionsList.filter(s => s.class_id === cls.id);

            // Ungraded
            totalUngraded += classSubs.filter(s => s.grade === null).length;

            // New (based on LocalStorage timestamp for that class)
            const key = `scholarSync_lastViewed_${cls.id}`;
            const storedDate = localStorage.getItem(key);
            const lastViewedAt = storedDate ? new Date(storedDate) : new Date(0); // If never viewed, all are new

            totalNew += classSubs.filter(s => new Date(s.created_at) > lastViewedAt).length;
        });

        setStats({ ungraded: totalUngraded, new: totalNew });
    };

    const getStatsForClass = (classId: string) => {
        const classSubs = allSubmissions.filter(s => s.class_id === classId);
        const ungraded = classSubs.filter(s => s.grade === null).length;

        const key = `scholarSync_lastViewed_${classId}`;
        const storedDate = localStorage.getItem(key);
        const lastViewedAt = storedDate ? new Date(storedDate) : new Date(0);

        const newCount = classSubs.filter(s => new Date(s.created_at) > lastViewedAt).length;

        return { ungraded, newCount };
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 animate-fade-in">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                            <p className="text-slate-500 font-medium">Welcome back, Instructor</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <NotificationBell />
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                    {/* Welcome Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                            <Home className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Welcome Home</h3>
                        <p className="text-slate-500 text-sm">Select "Classes" from the sidebar to manage your courses and assignments.</p>
                    </div>

                    {/* Global Assignments Card */}
                    <div
                        onClick={() => setShowAssignmentsModal(true)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-700 group-hover:text-emerald-700">All Assignments</h3>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-4xl font-black text-slate-900">{allAssignments.length}</p>
                                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">Total Assignments</p>
                            </div>
                        </div>
                    </div>

                    {/* Global Submissions Card */}
                    <div
                        onClick={() => setShowSubmissionsModal(true)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-700 group-hover:text-blue-700">All Submissions</h3>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-4xl font-black text-slate-900">{stats.ungraded}</p>
                                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">Total Ungraded</p>
                            </div>
                            {stats.new > 0 && (
                                <div className="text-right">
                                    <p className="text-4xl font-black text-blue-600">+{stats.new}</p>
                                    <p className="text-xs text-blue-400 mt-2 font-bold uppercase tracking-wider">New</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Assignments Modal */}
                {showAssignmentsModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                                <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-600" /> Assignments Overview
                                </h3>
                                <button onClick={() => setShowAssignmentsModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                <div className="space-y-4">
                                    {classes.map(cls => {
                                        const count = allAssignments.filter(a => a.class_id === cls.id).length;

                                        return (
                                            <div
                                                key={cls.id}
                                                onClick={() => router.push(`/instructor/class/${cls.id}?tab=assignments`)}
                                                className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all group"
                                            >
                                                <h4 className="font-bold text-slate-800 group-hover:text-emerald-700">{cls.name}</h4>
                                                <div className="flex items-center gap-4">
                                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold">
                                                        {count} Assignments
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {allAssignments.length === 0 && (
                                        <p className="text-center text-slate-400 py-4">No assignments created yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submissions Modal */}
                {showSubmissionsModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                                <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600" /> Submissions Overview
                                </h3>
                                <button onClick={() => setShowSubmissionsModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                <div className="space-y-4">
                                    {classes.map(cls => {
                                        const { ungraded, newCount } = getStatsForClass(cls.id);
                                        if (ungraded === 0 && newCount === 0) return null;

                                        return (
                                            <div
                                                key={cls.id}
                                                onClick={() => router.push(`/instructor/class/${cls.id}?tab=submissions`)}
                                                className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group"
                                            >
                                                <h4 className="font-bold text-slate-800 group-hover:text-blue-700">{cls.name}</h4>
                                                <div className="flex items-center gap-4">
                                                    {ungraded > 0 && (
                                                        <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold">
                                                            {ungraded} Ungraded
                                                        </span>
                                                    )}
                                                    {newCount > 0 && (
                                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold">
                                                            {newCount} New
                                                        </span>
                                                    )}
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                            </div>

                                        );
                                    })}
                                    {stats.ungraded === 0 && stats.new === 0 && (
                                        <p className="text-center text-slate-400 py-4">No pending submissions across your classes.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
