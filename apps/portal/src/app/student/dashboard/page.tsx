'use client';

import { Suspense, useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { BookOpen, Calendar, Clock, ArrowRight, Plus, Search, User as UserIcon, X, CheckCircle, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Database } from "@schologic/database";
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import NotificationBell from '@/components/NotificationBell';
import MessageBell from '@/components/MessageBell';
import FeedbackButton from '@/components/FeedbackButton';
import StudentCalendar from '@/components/student/StudentCalendar';
import GlobalAssignmentsCard from '@/components/student/GlobalAssignmentsCard';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';


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
    assignment_type: string | null;
    classes: {
        name: string;
    } | null;
};

type ResourceWithClass = {
    id: string;
    title: string;
    type: string | null;
    class_id: string;
    classes: {
        name: string;
    } | null;
};

type PracticumEnrollmentWithData = {
    practicum_id: string;
    status: string;
    practicums: {
        id: string;
        title: string;
        instructor_id: string;
        invite_code: string;
        start_date: string;
        end_date: string;
    } | null;
};

function DashboardContent() {
    const [enrollments, setEnrollments] = useState<EnrollmentWithClass[]>([]);
    const [practicumEnrollments, setPracticumEnrollments] = useState<PracticumEnrollmentWithData[]>([]);
    const [allAssignments, setAllAssignments] = useState<AssignmentWithClass[]>([]);
    const [resources, setResources] = useState<ResourceWithClass[]>([]);
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

            // 1. Fetch Class Enrollments
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
            setEnrollments((enrollData as unknown as EnrollmentWithClass[]) || []);

            // 1b. Fetch Practicum Enrollments
            const { data: pracData, error: pracErr } = await supabase
                .from('practicum_enrollments')
                .select(`
                    practicum_id,
                    status,
                    practicums (
                        id, title, instructor_id, invite_code, start_date, end_date
                    )
                `)
                .eq('student_id', user.id);

            if (!pracErr) {
                setPracticumEnrollments((pracData as unknown as PracticumEnrollmentWithData[]) || []);
            }

            // 2. Fetch All Assignments for search (we'll filter for "Upcoming" view)
            const validEnrollments = (enrollData as unknown as EnrollmentWithClass[]) || [];
            if (validEnrollments.length > 0) {
                const classIds = validEnrollments.map(e => e.class_id);

                // Fetch Assignments
                const { data: assignData, error: assignErr } = await supabase
                    .from('assignments')
                    .select(`
            id, title, due_date, max_points, assignment_type,
            classes (name)
            `)
                    .in('class_id', classIds)
                    .order('due_date', { ascending: true }); // Keep sorted by date for easy slicing

                if (!assignErr && assignData) {
                    setAllAssignments(assignData as unknown as AssignmentWithClass[]);
                }

                // Fetch Resources
                const { data: resourceData, error: resourceErr } = await supabase
                    .from('class_assets')
                    .select(`
                        id, title, type, class_id,
                        classes (name)
                    `)
                    .in('class_id', classIds);

                if (!resourceErr && resourceData) {
                    setResources(resourceData as unknown as ResourceWithClass[]);
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

        const cleanCode = joinCode.trim().toUpperCase();

        try {
            if (!user) {
                router.push('/login?role=student');
                return;
            }

            // 1. Try to find a CLASS first
            const { data: cls, error: clsErr } = await supabase
                .from('classes')
                .select('id, is_locked, name, instructor_id, instructor:profiles!instructor_id(settings, email), enrollments(count)')
                .eq('invite_code', cleanCode)
                .single();

            if (!clsErr && cls) {
                if (cls.is_locked) throw new Error("Class is locked");

                // Demo Limit Check
                if (cls.instructor?.email?.endsWith('@schologic.demo')) {
                    const currentCount = cls.enrollments?.[0]?.count || 0;
                    if (currentCount >= 10) {
                        throw new Error("Demo Class Full: This demo class is limited to 10 students.");
                    }
                }

                // Ensure Profile Exists
                await supabase.from('profiles').upsert({
                    id: user.id,
                    email: user.email,
                    role: 'student',
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student'
                }, { onConflict: 'id', ignoreDuplicates: true });

                // Insert Enrollment
                const { error: enrollErr } = await supabase
                    .from('enrollments')
                    .insert([{ student_id: user.id, class_id: cls.id }]);

                if (enrollErr) {
                    if (enrollErr.code === '23505') throw new Error("Already joined this class");
                    throw enrollErr;
                }

                showToast(`Joined ${cls.name}!`, 'success');
                setJoinCode('');
                fetchDashboardData();
                return;
            }

            // 2. If no class, try to find a PRACTICUM
            const { data: prac, error: pracErr } = await supabase
                .from('practicums')
                .select('id, title, instructor_id')
                .eq('invite_code', cleanCode)
                .single();

            if (!pracErr && prac) {
                // Ensure Profile Exists
                await supabase.from('profiles').upsert({
                    id: user.id,
                    email: user.email,
                    role: 'student',
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student'
                }, { onConflict: 'id', ignoreDuplicates: true });

                // Create practicum enrollment
                const { error: pEnrollErr } = await supabase
                    .from('practicum_enrollments')
                    .insert([{
                        practicum_id: prac.id,
                        student_id: user.id,
                        status: 'draft' // Initial status is now DRAFT (Incomplete)
                    }]);

                if (pEnrollErr) {
                    if (pEnrollErr.code === '23505') throw new Error("Already joined this practicum");
                    throw pEnrollErr;
                }

                showToast(`Cohort Joined! Please complete your registration.`, 'success');
                setJoinCode('');
                router.push(`/student/practicum/${prac.id}/setup`);
                return;
            }

            throw new Error("Invalid join code");

        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'An error occurred', 'error');
        } finally {
            setJoining(false);
        }
    };

    const handleDeleteApplication = async (practicumId: string) => {
        if (!confirm("Are you sure you want to delete this application? This cannot be undone.")) return;
        if (!user) return; // Guard against missing user

        try {
            const { error } = await supabase
                .from('practicum_enrollments')
                .delete()
                .eq('practicum_id', practicumId)
                .eq('student_id', user?.id)
                .neq('status', 'approved'); // Double check safety - DB RLS likely handles this too

            if (error) throw error;

            setPracticumEnrollments(prev => prev.filter(p => p.practicum_id !== practicumId));
            showToast("Application deleted", "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to delete application", "error");
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
        ? allAssignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.classes?.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : []; // Only show if searching, otherwise we don't show "All" in this specific list

    const filteredResources = searchQuery
        ? resources.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.classes?.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    // Computed views
    const upcomingAssignments = allAssignments
        .filter(a => a.due_date && new Date(a.due_date) >= new Date())
        .slice(0, 5);

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex flex-row justify-between items-center mb-6 md:mb-10 gap-2 md:gap-6 animate-fade-in relative z-30">
                    {/* Mobile Search Overlay */}
                    {showMobileSearch && (
                        <div className="absolute inset-x-0 -top-2 bottom-0 bg-white z-[60] flex items-center gap-2 p-2 rounded-xl shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                            <Input
                                autoFocus
                                className="border-none bg-transparent focus:ring-0 p-0 text-lg"
                                placeholder="Search courses or assignments..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                fullWidth
                            />
                            <button onClick={() => { setShowMobileSearch(false); setSearchQuery(''); }} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className={showMobileSearch ? 'opacity-0' : 'opacity-100 transition-opacity'}>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">Welcome back, get ready.</p>
                    </div>

                    <div className={`flex items-center gap-2 md:gap-4 shrink-0 ${showMobileSearch ? 'opacity-0 pointer-events-none' : ''}`}>
                        <form onSubmit={handleJoinClass} className="flex gap-0 shadow-sm rounded-xl overflow-hidden h-12">
                            <Input
                                placeholder="Code"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                                className="rounded-r-none border-r-0 w-28 md:w-48 uppercase font-mono placeholder:normal-case placeholder:font-sans h-12"
                                fullWidth={false}
                            />
                            <Button
                                type="submit"
                                disabled={joining}
                                isLoading={joining}
                                size="md" // Match height roughly
                                variant="success" // Emerald
                                className="rounded-l-none px-4 md:px-6 h-12" // Force height to match input
                            >
                                Join
                            </Button>
                        </form>

                        <div className="hidden md:flex items-center gap-3">
                            <FeedbackButton />
                            <MessageBell className="h-12 w-12 flex items-center justify-center p-0" />
                            <NotificationBell className="h-12 w-12" />
                        </div>
                    </div>
                </header>

                {/* Search Results (Mobile Only View) */}
                {searchQuery && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-2">
                        <h3 className="font-bold text-slate-400 text-sm uppercase mb-4">Search Results</h3>
                        {filteredEnrollments.length === 0 && filteredAssignments.length === 0 && filteredResources.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <Search className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="font-bold text-slate-800">No matches found</p>
                                <p className="text-slate-500 text-sm mt-1">Try adjusting your search terms</p>
                            </div>
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

                                {/* Quizzes */}
                                {filteredAssignments.filter(a => a.assignment_type === 'quiz').map(a => (
                                    <Link key={a.id} href={`/student/assignment/${a.id}`}>
                                        <Card className="flex items-center gap-2 p-4 hover:border-violet-400 transition-all" hoverEffect>
                                            <div className="p-1 bg-violet-50 rounded text-violet-600"><CheckCircle className="w-3 h-3" /></div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{a.title}</p>
                                                <p className="text-xs text-slate-500">Quiz • {a.classes?.name}</p>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}

                                {/* Assignments */}
                                {filteredAssignments.filter(a => a.assignment_type !== 'quiz').map(a => (
                                    <Link key={a.id} href={`/student/assignment/${a.id}`}>
                                        <Card className="flex items-center gap-2 p-4 hover:border-indigo-400 transition-all" hoverEffect>
                                            <div className="p-1 bg-indigo-50 rounded text-indigo-600"><Clock className="w-3 h-3" /></div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{a.title}</p>
                                                <p className="text-xs text-slate-500">Assignment • {a.classes?.name}</p>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}

                                {/* Resources */}
                                {filteredResources.map(r => (
                                    <Link key={r.id} href={`/student/class/${r.class_id}?tab=resources`}>
                                        <Card className="flex items-center gap-2 p-4 hover:border-blue-400 transition-all" hoverEffect>
                                            <div className="p-1 bg-blue-50 rounded text-blue-600"><BookOpen className="w-3 h-3" /></div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{r.title}</p>
                                                <p className="text-xs text-slate-500">Resource • {r.classes?.name}</p>
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

                            {/* Practicums List (Emerald Section) */}
                            {practicumEnrollments.length > 0 && (
                                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                                        <FileText className="w-6 h-6 text-emerald-600" />
                                        My Practicums
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {practicumEnrollments.map((pe) => (
                                            <Card
                                                key={pe.practicum_id}
                                                className="p-5 border-emerald-100 bg-emerald-50/20 hover:border-emerald-400 transition-all group relative"
                                                hoverEffect
                                            >
                                                {/* Clickable Overlay */}
                                                <Link
                                                    href={pe.status === 'approved'
                                                        ? `/student/practicum/${pe.practicum_id}`
                                                        : `/student/practicum/${pe.practicum_id}/setup`
                                                    }
                                                    className="absolute inset-0 z-0 focus:outline-none rounded-2xl"
                                                />

                                                <div className="relative z-10 pointer-events-none">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors pr-8">{pe.practicums?.title}</h3>
                                                        <span className={cn(
                                                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0",
                                                            pe.status === 'approved' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                                                pe.status === 'pending' ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                                    pe.status === 'rejected' ? "bg-red-100 text-red-700 border-red-200" :
                                                                        "bg-slate-100 text-slate-700 border-slate-200" // Draft/Incomplete
                                                        )}>
                                                            {pe.status === 'draft' ? 'Incomplete Application' : pe.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-4">
                                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {pe.practicums?.start_date ? new Date(pe.practicums.start_date).toLocaleDateString() : '-'}
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                                                    </div>
                                                </div>

                                                {/* Delete Action (Top Level Z-Index) */}
                                                {pe.status !== 'approved' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleDeleteApplication(pe.practicum_id);
                                                        }}
                                                        className="absolute bottom-4 right-4 z-20 p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg shadow-sm border border-slate-100 transition-all active:scale-95"
                                                        title="Withdraw / Delete Application"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            )}
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
