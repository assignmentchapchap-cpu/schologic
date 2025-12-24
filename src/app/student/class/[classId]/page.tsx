'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase';
import { FileText, Download, ArrowLeft, Calendar, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { Database } from '@/lib/database.types';

type ClassData = Database['public']['Tables']['classes']['Row'] & {
    instructor_profile?: { full_name: string | null }
};
type Assignment = Database['public']['Tables']['assignments']['Row'];
type Resource = Database['public']['Tables']['class_resources']['Row'];

export default function StudentClassPageParams({ params }: { params: Promise<{ classId: string }> }) {
    const { classId } = use(params);
    return <StudentClassPage classId={classId} />
}

function StudentClassPage({ classId }: { classId: string }) {
    const supabase = createClient();
    const [classData, setClassData] = useState<ClassData | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'assignments' | 'resources'>('assignments');

    useEffect(() => {
        fetchClassData();
    }, [classId]);

    const fetchClassData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            // Store promises in an array of Promise<any> to satisfy Promise.all type requirements
            // Supabase builders are "thenable" but sometimes TS complains if not explicitly cast or awaited.
            // Using .then() converts them to standard Promises.
            const promises = [
                supabase.from('classes').select('*, profiles:instructor_id(full_name)').eq('id', classId).single(),
                supabase.from('assignments').select('*').eq('class_id', classId).order('due_date', { ascending: true }),
                supabase.from('class_resources').select('*').eq('class_id', classId).order('created_at', { ascending: false })
            ];

            // If user exists, fetch their submissions for this class
            if (user) {
                promises.push(
                    supabase.from('submissions')
                        .select('assignment_id')
                        .eq('class_id', classId)
                        .eq('student_id', user.id)
                );
            }

            const results = await Promise.all(promises);
            const clsRes = results[0];
            const assignRes = results[1];
            const resRes = results[2];

            // Submissions result is index 3 if user exists
            const subRes = user ? results[3] : { data: [] };

            if (clsRes.data) {
                setClassData({
                    ...clsRes.data,
                    instructor_profile: clsRes.data.profiles as unknown as { full_name: string }
                });
            }
            if (assignRes.data) setAssignments(assignRes.data);
            if (resRes.data) setResources(resRes.data);

            if (subRes.data) {
                // Fix: Cast the map result to string[] explicitly to avoid Set<unknown> error
                const ids = new Set((subRes.data as any[]).map((s: any) => s.assignment_id as string));
                setSubmittedIds(ids);
            }

        } catch (error) {
            console.error("Error fetching class data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Class...</div>;
    if (!classData) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-red-400">Class not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <Link href="/student/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                {/* Header */}
                <header className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{classData.name}</h1>
                        <p className="text-slate-500 font-medium flex items-center gap-2">
                            Instructor: <span className="text-slate-800 font-bold">{classData.instructor_profile?.full_name || 'Unknown'}</span>
                        </p>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl mb-6 w-fit">
                    <button
                        onClick={() => setActiveTab('assignments')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'assignments' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Assignments
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'resources' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Resources
                    </button>
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'assignments' && (
                        <div className="grid gap-4">
                            {assignments.map(assign => {
                                const isOverdue = assign.due_date && new Date(assign.due_date) < new Date();
                                const isSubmitted = submittedIds.has(assign.id);

                                return (
                                    <div key={assign.id} className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${isSubmitted ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 hover:border-emerald-200'}`}>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-slate-800">{assign.title}</h3>
                                                {isSubmitted && (
                                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                        Submitted
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-500 text-sm mb-3 line-clamp-2 max-w-xl">{assign.description}</p>

                                            <div className="flex items-center gap-4 text-xs font-medium">
                                                <span className={`flex items-center gap-1.5 ${isOverdue && !isSubmitted ? 'text-red-500' : 'text-slate-500'}`}>
                                                    <Clock className="w-4 h-4" />
                                                    {assign.due_date ? new Date(assign.due_date).toLocaleString() : 'No Deadline'}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-slate-500">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {assign.max_points} Points
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/student/assignment/${assign.id}`}
                                            className={`px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 whitespace-nowrap flex items-center gap-2 ${isSubmitted
                                                    ? 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                                                    : 'bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-lg'
                                                }`}
                                        >
                                            {isSubmitted ? (
                                                <>
                                                    <Eye className="w-4 h-4" /> View Submission
                                                </>
                                            ) : (
                                                'Start Assignment'
                                            )}
                                        </Link>
                                    </div>
                                );
                            })}
                            {assignments.length === 0 && (
                                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <CheckCircle className="w-12 h-12 text-emerald-100 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">No assignments posted yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="grid gap-4">
                            {resources.map(res => (
                                <div key={res.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl mt-1">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-slate-800 mb-1">{res.title}</h3>
                                            <p className="text-slate-600 text-sm mb-4 whitespace-pre-wrap">{res.content}</p>

                                            {res.file_url && (
                                                <a
                                                    href={res.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
                                                >
                                                    <Download className="w-4 h-4" /> Download / View Attachment
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {resources.length === 0 && (
                                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <AlertCircle className="w-12 h-12 text-amber-100 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">No resources shared yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
