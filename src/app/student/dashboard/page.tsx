'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { BookOpen, Calendar, Clock, ArrowRight, Plus, Search, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import NotificationBell from '@/components/NotificationBell';

type EnrollmentWithClass = {
    class_id: string;
    classes: {
        id: string;
        name: string;
        instructor_id: string;
        is_locked: boolean;
        invite_code: string;
    } | null;
};

type AssignmentWithClass = {
    id: string;
    title: string;
    due_date: string | null;
    max_points: number;
    classes: {
        name: string;
    } | null;
};

export default function StudentDashboard() {
    const [enrollments, setEnrollments] = useState<EnrollmentWithClass[]>([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState<AssignmentWithClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [user, setUser] = useState<any>(null);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // If not logged in, maybe redirect or just show empty. 
                // For MVP student flow, they often start anonymously or sign up. 
                // Assuming auth is handled or they are redirected from login.
                // If role is needed, we could check profile.
                return;
            }
            setUser(user);

            // 1. Fetch Enrollments
            const { data: enrollData, error: enrollErr } = await supabase
                .from('enrollments')
                .select(`
                    class_id,
                    classes (
                        id, name, instructor_id, is_locked, invite_code
                    )
                `)
                .eq('student_id', user.id);

            if (enrollErr) throw enrollErr;

            const validEnrollments = (enrollData as unknown as EnrollmentWithClass[]) || [];
            setEnrollments(validEnrollments);

            // 2. Fetch Assignments for these classes
            if (validEnrollments.length > 0) {
                const classIds = validEnrollments.map(e => e.class_id);
                const { data: assignData, error: assignErr } = await supabase
                    .from('assignments')
                    .select(`
                        id, title, due_date, max_points,
                        classes (name)
                    `)
                    .in('class_id', classIds)
                    .gte('due_date', new Date().toISOString()) // Only future assignments
                    .order('due_date', { ascending: true })
                    .limit(5);

                if (!assignErr && assignData) {
                    setUpcomingAssignments(assignData as unknown as AssignmentWithClass[]);
                }
            }

        } catch (error) {
            console.error("Error loading dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode) return;
        setJoining(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login?role=student');
                return;
            }

            // 1. Find class
            const { data: cls, error: clsErr } = await supabase
                .from('classes')
                .select('id, is_locked')
                .eq('invite_code', joinCode.trim().toUpperCase())
                .single();

            if (clsErr || !cls) throw new Error("Invalid code");
            if (cls.is_locked) throw new Error("Class is locked");

            // 2. Ensure Profile Exists (Fix for FK Violation)
            const { error: profErr } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                role: 'student',
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student'
            }, { onConflict: 'id', ignoreDuplicates: true }); // Only create if missing to preserve existing bio/data

            if (profErr) console.error("Profile check warning:", profErr);

            // 3. Insert Enrollment
            const { error: enrollErr } = await supabase
                .from('enrollments')
                .insert([{
                    student_id: user.id,
                    class_id: cls.id
                }]);

            if (enrollErr) {
                if (enrollErr.code === '23505') throw new Error("Already joined this class");
                throw enrollErr;
            }

            alert("Successfully joined!");
            setJoinCode('');
            fetchDashboardData(); // Refresh

        } catch (err: any) {
            alert(err.message);
        } finally {
            setJoining(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
                        <p className="text-slate-500 font-medium">Welcome back, get ready to learn.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <form onSubmit={handleJoinClass} className="flex gap-2 w-full md:w-auto shadow-sm">
                            <input
                                placeholder="Enter Class Code"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                                className="p-3 border border-slate-200 rounded-l-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono w-full md:w-48 placeholder:normal-case placeholder:font-sans"
                            />
                            <button
                                disabled={joining}
                                className="bg-emerald-600 text-white px-5 py-3 rounded-r-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-70"
                            >
                                {joining ? '...' : 'Join'}
                            </button>
                        </form>

                        <NotificationBell />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Column: Enrolled Classes */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-emerald-600" /> My Classes
                            </h2>

                            {enrollments.length === 0 ? (
                                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700">No classes found</h3>
                                    <p className="text-slate-500 mt-1">Enter an invite code above to join your first class.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {enrollments.map((enroll) => (
                                        <div key={enroll.class_id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                                    {enroll.classes?.name}
                                                </h3>
                                                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                                    {enroll.classes?.invite_code}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-6">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active</span>
                                                <Link
                                                    // For now, link to a generic view or a class view for students if we build it
                                                    // Phase 2 plan says: "List enrolled classes". 
                                                    // We can link to a new Student Class View or just show assignments here.
                                                    // Let's link to a placeholder for now or the generic submit page with pre-filled? 
                                                    // Actually, let's link to a Student Class Page (Task: "Class View").
                                                    href={`/student/class/${enroll.class_id}`}
                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar: Upcoming Work */}
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-600" /> Due Soon</span>
                                <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full">{upcomingAssignments.length}</span>
                            </h2>

                            {upcomingAssignments.length === 0 ? (
                                <p className="text-slate-400 text-center py-8 text-sm">No upcoming deadlines! 🎉</p>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingAssignments.map((assign) => (
                                        <div key={assign.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all">
                                            <div className="mb-2">
                                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1 block">
                                                    {assign.classes?.name}
                                                </span>
                                                <h4 className="font-bold text-slate-800 text-sm">{assign.title}</h4>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-3 mt-3">
                                                <span className="flex items-center gap-1 font-medium text-red-500">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(assign.due_date!).toLocaleDateString()}
                                                </span>
                                                <Link
                                                    // This will be the new specific assignment submission page
                                                    href={`/student/assignment/${assign.id}`}
                                                    className="font-bold text-indigo-600 hover:underline"
                                                >
                                                    Start
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                </div>
            </div>
        </div>
    );
}
