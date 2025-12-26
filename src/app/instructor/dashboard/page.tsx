'use client';

import { createClient } from '@/lib/supabase';
import { Home, Clock, ChevronRight, X, FileText, Search, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationBell from '@/components/NotificationBell';
import AIStatsCard from '@/components/AIStatsCard';
import AIInsightsModal from '@/components/AIInsightsModal';
import DashboardCalendar from './components/DashboardCalendar';
import DashboardTodo from './components/DashboardTodo';
import { useRouter } from 'next/navigation';

export default function InstructorDashboard() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
    const [allAssignments, setAllAssignments] = useState<any[]>([]);
    const [allEvents, setAllEvents] = useState<any[]>([]);
    const [stats, setStats] = useState({ ungraded: 0, new: 0 });
    const [allEnrollments, setAllEnrollments] = useState<any[]>([]);
    const [aiStats, setAiStats] = useState({ averageScore: 0, studentCount: 0, trendData: [] as any[], trend: 0 });
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [loading, setLoading] = useState(true);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) {
            setSearchResults([]);
            return;
        }

        const results: any[] = [];

        // 1. Classes
        classes.forEach(c => {
            if (c.name.toLowerCase().includes(query) || c.class_code?.toLowerCase().includes(query)) {
                results.push({
                    type: 'class',
                    id: c.id,
                    title: c.name,
                    subtitle: c.class_code || 'No Code',
                    url: `/instructor/class/${c.id}`
                });
            }
        });

        // 2. Assignments
        allAssignments.forEach(a => {
            if (a.title.toLowerCase().includes(query)) {
                // Find class name
                const cls = classes.find(c => c.id === a.class_id);
                results.push({
                    type: 'assignment',
                    id: a.id,
                    title: a.title,
                    subtitle: `${cls?.name || 'Unknown Class'} • Due ${new Date(a.due_date).toLocaleDateString()}`,
                    url: `/instructor/class/${a.class_id}?tab=assignments` // Can't link direct to assignment modal easily without query param
                });
            }
        });

        // 3. Events
        allEvents.forEach(e => {
            if (e.title.toLowerCase().includes(query) || e.description?.toLowerCase().includes(query)) {
                results.push({
                    type: 'event',
                    id: e.id,
                    title: e.title,
                    subtitle: new Date(e.event_date).toLocaleDateString(),
                    url: '#' // Events just show in calendar
                });
            }
        });

        // 4. Students
        // Deduplicate students first?
        const seenStudents = new Set();
        allEnrollments.forEach(e => {
            const student = e.profiles;
            if (!student) return;
            const matchName = student.full_name?.toLowerCase().includes(query);
            const matchReg = student.registration_number?.toLowerCase().includes(query);

            if ((matchName || matchReg) && !seenStudents.has(e.student_id)) {
                seenStudents.add(e.student_id);
                // Find class name for context
                const cls = classes.find(c => c.id === e.class_id);
                results.push({
                    type: 'student',
                    id: e.student_id,
                    classId: e.class_id,
                    title: student.full_name || 'Unknown Student',
                    subtitle: `${student.registration_number || 'No Reg ID'} • ${cls?.name}`,
                    image: student.avatar_url,
                    url: '#'
                });
            }
        });

        setSearchResults(results);
    }, [searchQuery, classes, allAssignments, allEvents, allEnrollments]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);

                // Fetch Classes
                const { data: classesData } = await supabase
                    .from('classes')
                    .select('id, name, class_code')
                    .eq('instructor_id', user.id);

                if (classesData && classesData.length > 0) {
                    setClasses(classesData);
                    const classIds = classesData.map(c => c.id);

                    // Fetch All Submissions & Assignments for these classes
                    const [submissionsRes, assignmentsRes, enrollmentsRes, eventsRes] = await Promise.all([
                        supabase.from('submissions').select('id, class_id, grade, created_at, ai_score, student_id').in('class_id', classIds),
                        supabase.from('assignments').select('id, class_id, title, short_code, due_date').in('class_id', classIds),
                        supabase.from('enrollments').select('*, profiles:student_id(full_name, avatar_url, registration_number)').in('class_id', classIds),
                        supabase.from('instructor_events').select('*').eq('user_id', user.id)
                    ]);

                    if (submissionsRes.data) {
                        setAllSubmissions(submissionsRes.data);
                        calculateStats(classesData, submissionsRes.data);
                    }
                    if (assignmentsRes.data) {
                        setAllAssignments(assignmentsRes.data);
                    }
                    if (enrollmentsRes.data) {
                        setAllEnrollments(enrollmentsRes.data);
                    }
                    if (eventsRes.data) {
                        setAllEvents(eventsRes.data);
                    }

                    if (submissionsRes.data && classesData) {
                        calculateAIStats(classesData, submissionsRes.data, enrollmentsRes.data || []);
                    }
                }
            }
            setLoading(false);
        };

        fetchData();

        // Refresh on window focus to ensure stats are up-to-date
        const onFocus = () => fetchData();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
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
        setStats({ ungraded: totalUngraded, new: totalNew });
    };

    const calculateAIStats = (classesList: any[], submissionsList: any[], enrollmentsList: any[]) => {
        // 1. Global AI Average
        const gradedSubs = submissionsList.filter(s => s.ai_score !== null);
        const globalAvg = gradedSubs.length > 0
            ? Math.round(gradedSubs.reduce((acc: number, curr: any) => acc + (curr.ai_score || 0), 0) / gradedSubs.length)
            : 0;

        // Convert to Authenticity Score (100 - AI Score)
        const authenticityScore = 100 - globalAvg;

        // 1b. Trend Calculation (Current Week vs Previous Week)
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const currentWeekSubs = gradedSubs.filter(s => {
            const d = new Date(s.created_at);
            return d >= oneWeekAgo && d <= now;
        });

        const previousWeekSubs = gradedSubs.filter(s => {
            const d = new Date(s.created_at);
            return d >= twoWeeksAgo && d < oneWeekAgo;
        });

        const currentAvgAI = currentWeekSubs.length > 0
            ? currentWeekSubs.reduce((acc: number, curr: any) => acc + (curr.ai_score || 0), 0) / currentWeekSubs.length
            : 0;

        const previousAvgAI = previousWeekSubs.length > 0
            ? previousWeekSubs.reduce((acc: number, curr: any) => acc + (curr.ai_score || 0), 0) / previousWeekSubs.length
            : 0;

        // Authenticity Trend = (100 - CurrentAI) - (100 - PrevAI)
        // Simplifies to: PrevAI - CurrentAI
        // Example: Prev AI 20 (Auth 80), Current AI 10 (Auth 90) -> Trend +10 (Good)
        const trendValue = Math.round((previousAvgAI - currentAvgAI) * 10) / 10;

        // 2. Class Trend Data (Avg Score per Class)
        const trendData = classesList.map(cls => {
            const classSubs = submissionsList.filter(s => s.class_id === cls.id && s.ai_score !== null);
            const classAvg = classSubs.length > 0
                ? Math.round(classSubs.reduce((acc: number, curr: any) => acc + (curr.ai_score || 0), 0) / classSubs.length)
                : -1; // -1 indicates no data

            return {
                label: cls.class_code || cls.name.substring(0, 3).toUpperCase(), // Use Class Code if available
                score: classAvg, // Keep as AI Score for Trend Chart (Red = High)
                fullTitle: cls.name,
                hasData: classAvg !== -1
            };
        });

        // 3. Student Count
        const uniqueStudents = new Set(enrollmentsList.map(e => e.student_id)).size;

        setAiStats({
            averageScore: authenticityScore,
            studentCount: uniqueStudents,
            trendData: trendData,
            trend: trendValue
        });
    };

    const getStatsForClass = (classId: string) => {
        const classSubs = allSubmissions.filter(s => s.class_id === classId);
        const ungraded = classSubs.filter(s => s.grade === null).length;

        const key = `scholarSync_lastViewed_${classId}`;
        const storedDate = localStorage.getItem(key);
        const lastViewedAt = storedDate ? new Date(storedDate) : new Date(0);

        const newCount = classSubs.filter(s => new Date(s.created_at) > lastViewedAt).length;

        return { ungraded, newCount, total: classSubs.length };
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 animate-fade-in relative z-30">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                        <p className="text-slate-500 font-medium mt-1">Welcome back, Instructor</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative hidden md:block group z-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-sm transition-all relative z-10"
                                />
                            </div>

                            {/* Search Results Dropdown */}
                            {searchQuery.trim().length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                    {searchResults.length === 0 ? (
                                        <div className="p-4 text-center text-slate-400 text-xs">
                                            No results found for "{searchQuery}"
                                        </div>
                                    ) : (
                                        <div>
                                            {/* Classes */}
                                            {searchResults.filter(r => r.type === 'class').length > 0 && (
                                                <div className="p-2">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Classes</div>
                                                    {searchResults.filter(r => r.type === 'class').map(item => (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => router.push(item.url)}
                                                            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                                <Home className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-700">{item.title}</div>
                                                                <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Assignments */}
                                            {searchResults.filter(r => r.type === 'assignment').length > 0 && (
                                                <div className="p-2 border-t border-slate-50">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1 mt-1">Assignments</div>
                                                    {searchResults.filter(r => r.type === 'assignment').map(item => (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => router.push(item.url)}
                                                            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-700">{item.title}</div>
                                                                <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Students */}
                                            {searchResults.filter(r => r.type === 'student').length > 0 && (
                                                <div className="p-2 border-t border-slate-50">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1 mt-1">Students</div>
                                                    {searchResults.filter(r => r.type === 'student').map(item => (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => {
                                                                router.push(`/instructor/class/${item.classId}?tab=students`);
                                                            }}
                                                            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                                                                {item.image ? (
                                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                                                                        {item.title.substring(0, 1)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-700">{item.title}</div>
                                                                <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Events */}
                                            {searchResults.filter(r => r.type === 'event').length > 0 && (
                                                <div className="p-2 border-t border-slate-50">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1 mt-1">Events</div>
                                                    {searchResults.filter(r => r.type === 'event').map(item => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                                <CalendarIcon className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-700">{item.title}</div>
                                                                <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* New Class Button */}
                        <button
                            onClick={() => router.push('/instructor/classes?new=true')}
                            className="bg-slate-900 hover:bg-slate-800 text-white p-2 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group"
                            title="Create New Class"
                        >
                            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold whitespace-nowrap">
                                New Class
                            </span>
                        </button>

                        <NotificationBell />
                    </div>
                </header>

                {/* --- Row 1: High-Level Stats --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in mb-8">
                    {/* Card 1: Classes & Assignments */}
                    <div
                        onClick={() => setShowAssignmentsModal(true)}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700 group-hover:text-emerald-700">Overview</h3>
                                <p className="text-xs text-slate-400 font-medium">{classes.length} Active Classes</p>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-4xl font-black text-slate-900">{allAssignments.length}</p>
                                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">Total Assignments</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Global Submissions */}
                    <div
                        onClick={() => setShowSubmissionsModal(true)}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700 group-hover:text-blue-700">Submissions</h3>
                                <p className="text-xs text-slate-400 font-medium">Needs Grading</p>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-4xl font-black text-slate-900">{stats.ungraded}</p>
                                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">Ungraded</p>
                            </div>
                            {stats.new > 0 && (
                                <div className="text-right">
                                    <p className="text-4xl font-black text-blue-600">+{stats.new}</p>
                                    <p className="text-xs text-blue-400 mt-2 font-bold uppercase tracking-wider">New</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 3: AI Integrity */}
                    <AIStatsCard
                        averageScore={aiStats.averageScore}
                        studentCount={aiStats.studentCount}
                        trend={aiStats.trend}
                        onClick={() => setShowAIInsights(true)}
                    />
                </div>

                {/* --- Row 2: Productivity Zone --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-in delay-100">
                    <div className="lg:col-span-2 h-[450px]">
                        <DashboardCalendar assignments={allAssignments} events={allEvents} onEventCreated={(newEvent) => setAllEvents([...allEvents, newEvent])} />
                    </div>
                    <div className="h-[450px]">
                        <DashboardTodo />
                    </div>
                </div>

                <AIInsightsModal
                    isOpen={showAIInsights}
                    onClose={() => setShowAIInsights(false)}
                    averageScore={aiStats.averageScore}
                    submissions={allSubmissions}
                    enrollments={allEnrollments}
                    customTrendData={aiStats.trendData}
                    onStudentClick={() => { }}
                />

                {/* Assignments Modal */}
                {
                    showAssignmentsModal && (
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
                                                    onClick={() => {
                                                        router.push(`/instructor/class/${cls.id}?tab=assignments`);
                                                    }}
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
                    )
                }

                {/* Submissions Modal */}
                {
                    showSubmissionsModal && (
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
                                            const { ungraded, newCount, total } = getStatsForClass(cls.id);
                                            const ungradedPercentage = total > 0 ? Math.round((ungraded / total) * 100) : 0;

                                            if (ungraded === 0 && newCount === 0) return null;

                                            return (
                                                <div
                                                    key={cls.id}
                                                    onClick={() => {
                                                        router.push(`/instructor/class/${cls.id}?tab=assignments`);
                                                    }}
                                                    className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group"
                                                >
                                                    <div className="flex-1 w-full text-left">
                                                        <h4 className="font-bold text-slate-800 group-hover:text-blue-700">{cls.name}</h4>
                                                        <div className="flex gap-2 mt-1 md:hidden">
                                                            {ungraded > 0 && <span className="text-xs font-bold text-slate-500">{ungraded} Ungraded</span>}
                                                            {newCount > 0 && <span className="text-xs font-bold text-blue-600">{newCount} New</span>}
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar (Visible on larger screens) */}
                                                    <div className="hidden md:flex flex-col items-center w-1/3 px-2">
                                                        <div className="w-full flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">
                                                            <span>Ungraded</span>
                                                            <span>{ungradedPercentage}%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300 relative">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-1000 ease-out bg-blue-500"
                                                                style={{ width: `${ungradedPercentage}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="hidden md:flex items-center gap-2 justify-end min-w-[120px]">
                                                        {ungraded > 0 && (
                                                            <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                                                                {ungraded} Ungraded
                                                            </span>
                                                        )}
                                                        {newCount > 0 && (
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                                                                {newCount} New
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 hidden md:block" />
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
                    )
                }
            </div >
        </div >
    );
}
