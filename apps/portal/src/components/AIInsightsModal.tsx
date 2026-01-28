'use client';

import { X, AlertTriangle, CheckCircle, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Database } from "@schologic/database";

type Assignment = Database['public']['Tables']['assignments']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'];
type EnrollmentWithProfile = Database['public']['Tables']['enrollments']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

interface AIInsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
    averageScore: number;
    assignments?: Assignment[]; // Optional if customTrendData is provided
    submissions: Submission[]; // Aggregated submissions
    enrollments: EnrollmentWithProfile[];
    onStudentClick: (studentId: string, studentName: string) => void;
    customTrendData?: {
        label: string;
        score: number;
        fullTitle: string;
        hasData: boolean;
    }[];
}

export default function AIInsightsModal({ isOpen, onClose, averageScore, assignments = [], submissions, enrollments, onStudentClick, customTrendData }: AIInsightsModalProps) {
    const router = useRouter();
    if (!isOpen) return null;

    // 1. Trend Data Logic
    // If customTrendData is provided (e.g. from Dashboard showing Classes), use it.
    // Otherwise, calculate based on recent assignments.
    let trendData = customTrendData;

    if (!trendData) {
        // Real Trend Data (Last 5 assignments)
        const recentAssignments = assignments.slice(-5);

        trendData = recentAssignments.map(assignment => {
            const assignmentSubs = submissions.filter(s => s.assignment_id === assignment.id && s.ai_score !== null);

            // Default to -1 (No Data)
            let aiScore = -1;

            if (assignmentSubs.length > 0) {
                // Calculate Average AI Score directly
                aiScore = Math.round(assignmentSubs.reduce((acc, curr) => acc + (curr.ai_score || 0), 0) / assignmentSubs.length);
            }

            return {
                label: assignment.short_code || assignment.title.substring(0, 3).toUpperCase(),
                score: aiScore, // -1 if no data, 0-100 if data
                fullTitle: assignment.title,
                hasData: aiScore !== -1
            };
        });
    }

    // 2. Real High Risk Students
    // Group submissions by student_id
    const studentRiskMap = new Map<string, { count: number, lastScore: number, studentId: string }>();

    submissions.forEach(sub => {
        if (sub.ai_score !== null && sub.ai_score > 50 && sub.student_id) { // Threshold for "Risky" > 50% AI confidence + Valid Student ID
            const current = studentRiskMap.get(sub.student_id) || { count: 0, lastScore: 0, studentId: sub.student_id };
            current.count += 1;
            // Track the HIGHEST AI score (lowest authenticity)
            current.lastScore = Math.max(current.lastScore, sub.ai_score);
            studentRiskMap.set(sub.student_id, current);
        }
    });

    // Convert to array, map to names, and sort by count
    const atRiskStudents = Array.from(studentRiskMap.values())
        .map(risk => {
            const studentProfile = enrollments.find(e => e.student_id === risk.studentId);
            return {
                name: studentProfile?.profiles?.full_name || 'Unknown Student',
                count: risk.count,
                lastScore: Math.round(risk.lastScore), // Show AI Score directly
                studentId: risk.studentId,
                avatarUrl: studentProfile?.profiles?.avatar_url
            };
        })
        .filter(s => s.count > 0) // Only those with flags
        .sort((a, b) => b.count - a.count)
        .slice(0, 4); // Top 4

    const getColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100 ring-emerald-500';
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-100 ring-amber-500';
        return 'text-red-600 bg-red-50 border-red-100 ring-red-500';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/50">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-br from-white to-slate-50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <span className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200">
                                <TrendingUp className="w-6 h-6" />
                            </span>
                            The Integrity Pulse
                        </h2>
                        <p className="text-slate-500 font-medium ml-14">Real-time AI authenticity analytics</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Hero Metric - Radial */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-6">Class Average</h3>

                            <div className="relative w-48 h-48">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="96" cy="96" r="88" fill="none" className="stroke-slate-100" strokeWidth="12" />
                                    <circle
                                        cx="96" cy="96" r="88" fill="none"
                                        className="stroke-indigo-600 transition-all duration-1000 ease-out"
                                        strokeWidth="12"
                                        strokeDasharray={2 * Math.PI * 88}
                                        strokeDashoffset={2 * Math.PI * 88 * (1 - averageScore / 100)}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black text-slate-800">{averageScore}%</span>
                                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg mt-2">Authentic</span>
                                </div>
                            </div>
                            <p className="text-center text-slate-400 text-sm mt-6 max-w-[200px]">
                                Based on {submissions.filter(s => s.ai_score !== null).length} AI-graded submissions.
                            </p>
                        </div>

                        {/* Trend Analysis */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> AI Detection Trend
                            </h3>
                            <div className="h-64 bg-slate-50 rounded-2xl flex items-end justify-between p-6 gap-4 relative overflow-hidden">
                                {trendData.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group z-10 relative">
                                        {/* Bar Wrapper */}
                                        <div className="w-full h-full flex items-end justify-center relative">
                                            {d.hasData ? (
                                                <div
                                                    className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 relative group-hover:opacity-90 ${d.score > 50 ? 'bg-red-500 shadow-red-200' :
                                                        (d.score > 20 ? 'bg-amber-400 shadow-amber-200' :
                                                            'bg-emerald-500 shadow-emerald-200')
                                                        } shadow-lg`}
                                                    style={{ height: `${Math.max(d.score, 5)}%` }} // Min height 5% for visibility
                                                >
                                                    {/* Tooltip */}
                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl transition-all whitespace-nowrap z-50 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                                        {d.fullTitle}
                                                        <div className="text-xs font-normal opacity-80">{d.score}% AI Detected</div>
                                                        {/* Arrow */}
                                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full max-w-[40px] h-[5%] rounded-t-lg bg-slate-200 border-x border-t border-slate-300 repeating-lines relative" title="No graded submissions">
                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded shadow-lg transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                                        No Data
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 truncate w-full text-center h-4">{d.label}</span>
                                    </div>
                                ))}

                                {/* Grid Lines */}
                                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 pb-12 opacity-10">
                                    <div className="w-full h-px bg-slate-900" />
                                    <div className="w-full h-px bg-slate-900" />
                                    <div className="w-full h-px bg-slate-900" />
                                    <div className="w-full h-px bg-slate-900" />
                                </div>
                            </div>
                        </div>

                        {/* At Risk Spotlight */}
                        <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" /> Attention Needed
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {atRiskStudents.map((student, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors group cursor-pointer"
                                        onClick={() => onStudentClick(student.studentId, student.name)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                                                {student.avatarUrl ? (
                                                    <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    student.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{student.name}</h4>
                                                <p className="text-xs text-slate-500 font-medium">{student.count} High-AI Submissions</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-4">
                                            <div>
                                                <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Highest AI Detection</span>
                                                <div className="flex items-center justify-end gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    <span className="text-xs font-bold">{student.lastScore}%</span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                                {atRiskStudents.length === 0 && (
                                    <div className="col-span-2 text-center py-8 text-slate-400 font-medium flex flex-col items-center gap-2">
                                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                                        No students currently flagged as high-risk. High five!
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
