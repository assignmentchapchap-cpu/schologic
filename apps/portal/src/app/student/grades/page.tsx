'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { FileText, CheckCircle, Clock, Search, Filter, ChevronDown, Download, GraduationCap, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Database } from "@schologic/database";
import { jsPDF } from "jspdf";
import { useToast } from '@/context/ToastContext';

type EnrollmentProfile = {
    id: string;
    class_id: string;
    classes: {
        id: string;
        name: string;
        class_code: string;
        instructor_id: string;
    } | null;
};

type ClassSummary = {
    class_id: string;
    class_name: string;
    class_code: string;
    totalPossible: number;
    totalEarned: number;
    percentage: number;
    avgAi: number | null;
    submittedCount: number;
    totalAssignments: number;
};

export default function StudentGradesPage() {
    const supabase = createClient();
    const [summaries, setSummaries] = useState<ClassSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Tools
    const [gradesSearch, setGradesSearch] = useState('');
    const [gradesSort, setGradesSort] = useState<'name' | 'score_high' | 'score_low' | 'ai_high' | 'ai_low'>('name');
    const [gradesFilter, setGradesFilter] = useState<'all' | 'passing' | 'failing'>('all'); // Simplified filter for students
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);


    useEffect(() => {
        fetchGradesData();
    }, []);

    const fetchGradesData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Enrollments (Classes)
            const { data: enrolls, error: enrollErr } = await supabase
                .from('enrollments')
                .select(`
                    id, class_id,
                    classes (id, name, class_code, instructor_id)
                `)
                .eq('student_id', user.id);

            if (enrollErr) throw enrollErr;

            const validEnrolls = (enrolls as any[]).filter(e => e.classes) as EnrollmentProfile[];
            const classIds = validEnrolls.map(e => e.class_id);

            if (classIds.length === 0) {
                setLoading(false);
                return;
            }

            // 2. Fetch Assignments for these classes
            const { data: assignments, error: assignErr } = await supabase
                .from('assignments')
                .select('id, class_id, max_points')
                .in('class_id', classIds);

            if (assignErr) throw assignErr;

            // 3. Fetch Submissions for these classes
            const { data: submissions, error: subErr } = await supabase
                .from('submissions')
                .select('id, class_id, assignment_id, grade, ai_score')
                .eq('student_id', user.id)
                .in('class_id', classIds);

            if (subErr) throw subErr;

            // 4. Aggregate Data
            const summariesData: ClassSummary[] = validEnrolls.map(enroll => {
                const cls = enroll.classes!;
                const classAssigns = assignments?.filter(a => a.class_id === cls.id) || [];
                const classSubs = submissions?.filter(s => s.class_id === cls.id) || [];

                // Metrics
                const totalPossible = classAssigns.reduce((acc, curr) => acc + curr.max_points, 0);
                const totalEarned = classSubs.reduce((acc, curr) => acc + (curr.grade || 0), 0);
                // Normalized to 100%
                const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

                const aiScores = classSubs.filter(s => s.ai_score !== null && s.ai_score !== undefined).map(s => s.ai_score as number);
                const avgAi = aiScores.length > 0 ? Math.round(aiScores.reduce((a, b) => a + b, 0) / aiScores.length) : null;

                return {
                    class_id: cls.id,
                    class_name: cls.name,
                    class_code: cls.class_code || 'N/A',
                    totalPossible,
                    totalEarned,
                    percentage,
                    avgAi,
                    submittedCount: classSubs.length,
                    totalAssignments: classAssigns.length
                };
            });

            setSummaries(summariesData);

        } catch (error) {
            console.error("Error fetching grades", error);
            showToast("Failed to load grades.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("My Grades Report", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

        let y = 40;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Class", 14, y);
        doc.text("Assignments", 80, y);
        doc.text("Avg AI", 120, y);
        doc.text("Score", 160, y);
        doc.line(14, y + 2, 190, y + 2);
        y += 10;

        doc.setFont("helvetica", "normal");
        filteredSummaries.forEach(s => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`${s.class_code}: ${s.class_name}`, 14, y);
            doc.text(`${s.submittedCount}/${s.totalAssignments}`, 80, y);
            doc.text(s.avgAi !== null ? `${s.avgAi}%` : '-', 120, y);
            doc.text(`${s.percentage.toFixed(0)}%`, 160, y);
            y += 8;
        });

        doc.save("My_Grades_Report.pdf");
    };

    // Filter & Sort Logic
    const filteredSummaries = summaries
        .filter(s => {
            const search = gradesSearch.toLowerCase();
            const match = s.class_name.toLowerCase().includes(search) || s.class_code.toLowerCase().includes(search);
            if (!match) return false;

            if (gradesFilter === 'passing' && s.percentage < 50) return false;
            if (gradesFilter === 'failing' && s.percentage >= 50) return false;

            return true;
        })
        .sort((a, b) => {
            if (gradesSort === 'name') return a.class_name.localeCompare(b.class_name);
            if (gradesSort === 'score_high') return b.percentage - a.percentage;
            if (gradesSort === 'score_low') return a.percentage - b.percentage;
            if (gradesSort === 'ai_high') return (b.avgAi || 0) - (a.avgAi || 0);
            if (gradesSort === 'ai_low') return (a.avgAi || 0) - (b.avgAi || 0);
            return 0;
        });

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8"><span className="text-slate-500 font-bold animate-pulse">Loading Grades...</span></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Grades</h1>
                    <p className="text-sm md:text-base text-slate-500 font-medium">Track your academic performance across all classes.</p>
                </header>

                <div className="mt-8 space-y-6 animate-fade-in">
                    {/* Controls */}
                    <div className="flex md:flex-row flex-col-reverse md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">

                        {/* Search */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex-1 max-w-sm">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input
                                placeholder="Search by class name or code..."
                                className="bg-transparent outline-none text-sm font-bold text-slate-700 w-full"
                                value={gradesSearch}
                                onChange={(e) => setGradesSearch(e.target.value)}
                            />
                        </div>

                        {/* Filters & Actions */}
                        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="hidden md:inline text-xs font-bold text-slate-400 uppercase tracking-wider">FILTER:</span>
                                <div className="relative">
                                    <select
                                        className="appearance-none bg-slate-50 border border-slate-200 pl-3 pr-8 py-2 rounded-xl text-xs md:text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[120px]"
                                        value={gradesFilter}
                                        onChange={(e) => setGradesFilter(e.target.value as any)}
                                    >
                                        <option value="all">All Classes</option>
                                        <option value="passing">Passing</option>
                                        <option value="failing">Failing</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            <div className="w-px h-6 bg-slate-200 shrink-0 hidden md:block"></div>

                            <div className="flex items-center gap-2 shrink-0">
                                <span className="hidden md:inline text-xs font-bold text-slate-400 uppercase tracking-wider">SORT:</span>
                                <div className="relative">
                                    <select
                                        className="appearance-none bg-slate-50 border border-slate-200 pl-3 pr-8 py-2 rounded-xl text-xs md:text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[140px]"
                                        value={gradesSort}
                                        onChange={(e) => setGradesSort(e.target.value as any)}
                                    >
                                        <option value="name">Name (A-Z)</option>
                                        <option value="score_high">Score (High-Low)</option>
                                        <option value="score_low">Score (Low-High)</option>
                                        <option value="ai_high">AI (High-Low)</option>
                                        <option value="ai_low">AI (Low-High)</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            <button
                                onClick={exportToPDF}
                                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all shadow-md active:scale-95 shrink-0 ml-auto md:ml-2"
                                title="Export PDF"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden md:inline font-bold text-sm">Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Class Grades Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-20 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap border-r border-slate-300">
                                        Class Name
                                    </th>
                                    <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider border-l border-slate-200 whitespace-nowrap">
                                        Progress
                                    </th>
                                    <th className="p-4 font-bold text-xs text-indigo-600 uppercase tracking-wider border-l border-slate-200 text-center w-24 bg-indigo-50/30 whitespace-nowrap">
                                        Avg AI
                                    </th>
                                    <th className="p-4 font-bold text-xs text-emerald-600 uppercase tracking-wider border-l border-slate-200 text-center w-24 bg-emerald-50/30 whitespace-nowrap">
                                        <span className="md:hidden">Total</span>
                                        <span className="hidden md:inline">Total Score</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSummaries.map((summary, i) => (
                                    <tr key={summary.class_id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 sticky left-0 bg-white group-hover:bg-slate-50 z-20 border-r border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="text-slate-400 font-mono text-xs font-bold w-4 text-right flex-shrink-0">{i + 1}.</div>
                                                <Link href={`/student/class/${summary.class_id}?tab=assignments`} className="flex items-center gap-3 group/link">
                                                    <div className="hidden md:block p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover/link:bg-indigo-600 group-hover/link:text-white transition-colors">
                                                        <GraduationCap className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm group-hover/link:text-indigo-600 transition-colors">{summary.class_name}</div>
                                                        <div className="text-xs text-slate-400 font-mono">{summary.class_code}</div>
                                                    </div>
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="p-4 border-l border-slate-100 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{summary.submittedCount} / {summary.totalAssignments}</span>
                                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Submitted</span>
                                            </div>
                                        </td>
                                        <td className="p-4 border-l border-slate-100 text-center bg-indigo-50/10 whitespace-nowrap">
                                            {summary.avgAi !== null ? (
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold inline-block min-w-[3rem] ${summary.avgAi < 20 ? 'bg-emerald-100 text-emerald-700' :
                                                    summary.avgAi < 50 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {summary.avgAi}%
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 font-bold">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 border-l border-slate-100 text-center font-black text-emerald-600 bg-emerald-50/10 whitespace-nowrap text-sm">
                                            {summary.percentage.toFixed(0)}%
                                        </td>
                                    </tr>
                                ))}
                                {filteredSummaries.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="w-8 h-8 opacity-20" />
                                                <p className="font-medium">No classes found matching your criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
