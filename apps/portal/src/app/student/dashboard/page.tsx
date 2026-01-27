
'use client';

import { Suspense, useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { BookOpen, Calendar, Clock, ArrowRight, Plus, Search, User as UserIcon, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Database } from "@schologic/database";
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import NotificationBell from '@/components/NotificationBell';
import StudentCalendar from '@/components/student/StudentCalendar';
import GlobalAssignmentsCard from '@/components/student/GlobalAssignmentsCard';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';


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

function DashboardContent() {
    const [enrollments, setEnrollments] = useState<EnrollmentWithClass[]>([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState<AssignmentWithClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Use Context
    const { user, loading: userLoading } = useUser();

    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    useEffect(() => {
        if (searchParams.get('mobile_search') === 'true') {
            setShowMobileSearch(true);
        }
    }, [searchParams]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            if (!user) return;
            // No need to set user locally, we use context user

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
            if (!user) {
                router.push('/login?role=student');
                return;
            }

            // 1. Find class with instructor details
            const { data: cls, error: clsErr } = await supabase
                .from('classes')
                .select('id, is_locked, instructor:profiles!instructor_id(settings), enrollments(count)')
                .eq('invite_code', joinCode.trim().toUpperCase())
                .single();

            if (clsErr || !cls) throw new Error("Invalid code");
            if (cls.is_locked) throw new Error("Class is locked");

            // Demo Limit Check (10 Students)
            // We need to check if the INSTRUCTOR is a demo user.
            // Since we don't have is_demo on profile directly in types yet (it's in metadata), 
            // we might need to check the auth user or rely on profile settings if we stored it there.
            // Let's do a reliable check: Retrieve the instructor's Auth Metadata via RPC or just check Profile if we synced it.
            // ALTERNATIVE: Use the profile scan. Logic: If instructor profile exists, let's assume valid.
            // But we need to know if they are demo. 
            // Workaround: Check if we can get user_metadata of the instructor from client? No.
            // We'll check via a server action or simpler: 
            // If the CLASS was created by a demo user (we don't track that on class).

            // Re-think: We added `is_demo` to `user_metadata` in Auth. We can't query that easily from Client with RLS unless we expose it.
            // Let's assume for now we check the *current* user (Student) isn't relevant. 
            // It's the CLASS OWNER.

            // To properly implement this securely, we should move Join Class to a Server Action.
            // But for now, let's fetch the Owner's Profile and check if their email ends with @schologic.demo (Convention)

            const { data: instructorUser } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', (cls as any).instructor_id || '') // Types might be tricky with join
                .single();

            // Actually, `cls` join above returns strict structure. 
            // Let's do a separate fetch for simpler typing if needed, or refine query.

            const { data: owner } = await supabase.from('classes').select('instructor_id').eq('id', cls.id).single();
            if (owner) {
                const { data: ownerProfile } = await supabase.from('profiles').select('email').eq('id', owner.instructor_id || '').single();
                if (ownerProfile?.email?.endsWith('@schologic.demo')) {
                    const currentCount = cls.enrollments?.[0]?.count || 0;
                    if (currentCount >= 10) {
                        throw new Error("Demo Class Full: This demo class is limited to 10 students.");
                    }
                }
            }

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

            showToast("Successfully joined!", 'success');
            setJoinCode('');
            fetchDashboardData(); // Refresh

        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'An error occurred', 'error');
        } finally {
            setJoining(false);
        }
    };

    // Filter for search
    const filteredEnrollments = searchQuery
        ? enrollments.filter(e =>
            e.classes?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.classes?.invite_code.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : enrollments;

    const filteredAssignments = searchQuery
        ? upcomingAssignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.classes?.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : upcomingAssignments;

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-2 md:gap-6 animate-fade-in relative z-30">
                    {/* Mobile Search Overlay */}
                    {showMobileSearch && (
                        <div className="absolute inset-x-0 -top-2 bottom-0 bg-white z-[60] flex items-center gap-2 p-2 rounded-xl shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                            <Input
                                autoFocus
                                className="border-none bg-transparent focus:ring-0 p-0 text-lg"
                                placeholder="Search courses or assignments..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                leftIcon={<Search className="w-5 h-5 text-indigo-600" />}
                                fullWidth
                            />
                            <button onClick={() => { setShowMobileSearch(false); setSearchQuery(''); }} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className={showMobileSearch ? 'opacity-0' : 'opacity-100 transition-opacity'}>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                        <p className="text-slate-500 font-bold text-sm mt-1">Welcome back, get ready.</p>
                    </div>

                    <div className={`flex items-center gap-2 md:gap-4 shrink-0 ${showMobileSearch ? 'opacity-0 pointer-events-none' : ''}`}>
                        <form onSubmit={handleJoinClass} className="flex gap-0 shadow-sm rounded-xl overflow-hidden">
                            <Input
                                placeholder="Code"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                                className="rounded-r-none border-r-0 w-28 md:w-48 uppercase font-mono placeholder:normal-case placeholder:font-sans py-2.5"
                                fullWidth={false}
                            />
                            <Button
                                type="submit"
                                disabled={joining}
                                isLoading={joining}
                                size="md" // Match height roughly
                                variant="success" // Emerald
                                className="rounded-l-none px-4 md:px-6 h-[50px] md:h-[50px]" // Force height to match input
                            >
                                Join
                            </Button>
                        </form>

                        <div className="hidden md:block">
                            <NotificationBell />
                        </div>
                    </div>
                </header>

                {/* Search Results (Mobile Only View) */}
                {searchQuery && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-2">
                        <h3 className="font-bold text-slate-400 text-sm uppercase mb-4">Search Results</h3>
                        {filteredEnrollments.length === 0 && filteredAssignments.length === 0 ? (
                            <p className="text-slate-500 italic">No matches found.</p>
                        ) : (
                            <div className="space-y-4">
                                {filteredEnrollments.map(e => (
                                    <Link key={e.class_id} href={`/student/class/${e.class_id}`}>
                                        <Card className="flex items-center gap-2 p-4 hover:border-emerald-400 transition-all" hoverEffect>
                                            <BookOpen className="w-4 h-4 text-emerald-600" />
                                            <span className="font-bold text-slate-800">{e.classes?.name}</span>
                                        </Card>
                                    </Link>
                                ))}
                                {filteredAssignments.map(a => (
                                    <Link key={a.id} href={`/student/assignment/${a.id}`}>
                                        <Card className="flex items-center gap-2 p-4 hover:border-indigo-400 transition-all" hoverEffect>
                                            <div className="p-1 bg-indigo-50 rounded text-indigo-600"><Clock className="w-3 h-3" /></div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{a.title}</p>
                                                <p className="text-xs text-slate-500">{a.classes?.name}</p>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Default Dashboard View */}
                <div className={searchQuery ? 'opacity-50 pointer-events-none' : ''}>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Main Column: Global Workload */}
                        <div className="lg:col-span-2 space-y-8">
                            <GlobalAssignmentsCard />
                        </div>

                        {/* Sidebar: Upcoming Work */}
                        <div className="space-y-6">
                            <StudentCalendar />
                            <Card className="h-full relative" hoverEffect={false}>
                                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                                    <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-600" /> Due Soon</span>
                                    <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full">{upcomingAssignments.length}</span>
                                </h2>

                                {upcomingAssignments.length === 0 ? (
                                    <p className="text-slate-400 text-center py-8 text-sm">No upcoming deadlines! 🎉</p>
                                ) : (
                                    <div className="space-y-4">
                                        {upcomingAssignments.map((assign) => (
                                            <div key={assign.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group cursor-pointer" onClick={() => router.push(`/student/assignment/${assign.id}`)}>
                                                <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors line-clamp-1">{assign.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">{assign.classes?.name}</p>
                                                    <p className="text-xs text-indigo-500 mt-2 font-bold flex items-center gap-1">
                                                        Due {assign.due_date ? new Date(assign.due_date).toLocaleDateString() : 'No date'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StudentDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
