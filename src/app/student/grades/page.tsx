'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Database } from '@/lib/database.types';

type SubmissionWithDetails = Database['public']['Tables']['submissions']['Row'] & {
    assignments: {
        title: string;
        max_points: number;
    } | null;
    classes: {
        name: string;
    } | null;
};

export default function StudentGradesPage() {
    const supabase = createClient();
    const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('submissions')
                .select(`
                    *,
                    assignments (title, max_points),
                    classes (name)
                `)
                .eq('student_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubmissions(data as unknown as SubmissionWithDetails[]);

        } catch (error) {
            console.error("Error fetching grades", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Grades...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Grades</h1>
                    <p className="text-slate-500 font-medium">Track your performance and feedback.</p>
                </header>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    {submissions.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No submissions found yet.</p>
                            <Link href="/student/dashboard" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">Go to Dashboard</Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Assignment</th>
                                        <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                                        <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted</th>
                                        <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">AI Score</th>
                                        <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {submissions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-6">
                                                <Link href={`/student/result/${sub.id}`} className="block">
                                                    <span className="font-bold text-indigo-900 group-hover:text-indigo-600 transition-colors">{sub.assignments?.title || 'Untitled Assignment'}</span>
                                                    {sub.feedback && (
                                                        <p className="text-xs text-slate-500 mt-1 italic">"{sub.feedback}"</p>
                                                    )}
                                                </Link>
                                            </td>
                                            <td className="p-6 text-sm font-medium text-slate-600">
                                                {sub.classes?.name}
                                            </td>
                                            <td className="p-6 text-sm text-slate-500">
                                                <span className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    {new Date(sub.created_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center">
                                                {sub.ai_score !== null && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${sub.ai_score > 50 ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        }`}>
                                                        {sub.ai_score.toFixed(0)}%
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-right">
                                                {sub.grade !== null ? (
                                                    <div>
                                                        <span className="text-lg font-black text-slate-900">{sub.grade}</span>
                                                        <span className="text-xs font-bold text-slate-400">/{sub.assignments?.max_points || 100}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
