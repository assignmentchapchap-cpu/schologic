
'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from "@schologic/database";
import { FileText, Download, ArrowLeft, Calendar, Clock, CheckCircle, AlertCircle, Eye, ArrowUpRight, Users, X, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Database } from "@schologic/database";

type ClassData = Database['public']['Tables']['classes']['Row'] & {
    instructor_profile?: { full_name: string | null, title?: string | null }
};
type Assignment = Database['public']['Tables']['assignments']['Row'];
type Resource = Database['public']['Tables']['class_resources']['Row'];

type EnrollmentProfile = {
    id: string;
    student_id: string;
    joined_at: string;
    profiles: {
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
        registration_number: string | null;
    } | null;
};

export default function StudentClassPageParams({ params }: { params: Promise<{ classId: string }> }) {
    const { classId } = use(params);
    return <StudentClassPage classId={classId} />
}

function StudentClassPage({ classId }: { classId: string }) {
    const supabase = createClient();
    const [classData, setClassData] = useState<ClassData | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [enrollments, setEnrollments] = useState<EnrollmentProfile[]>([]);
    const [submissionsMap, setSubmissionsMap] = useState<Record<string, { grade: number | null }>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'resources'>('overview');

    // UI States
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);

    useEffect(() => {
        fetchClassData();
    }, [classId]);

    const fetchClassData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            const clsQuery = supabase.from('classes').select('*, profiles:instructor_id(full_name, title)').eq('id', classId).single();
            const assignQuery = supabase.from('assignments').select('*').eq('class_id', classId).order('due_date', { ascending: true });
            const resQuery = supabase.from('class_resources').select('*').eq('class_id', classId).order('created_at', { ascending: false });
            const enrollQuery = supabase.from('enrollments').select(`id, student_id, joined_at, profiles:student_id (full_name, email, avatar_url, registration_number)`).eq('class_id', classId);
            const subQuery = user
                ? supabase.from('submissions').select('assignment_id, grade').eq('class_id', classId).eq('student_id', user.id)
                : Promise.resolve({ data: [] });

            const [clsRes, assignRes, resRes, enrollRes, subRes] = await Promise.all([
                clsQuery,
                assignQuery,
                resQuery,
                enrollQuery,
                subQuery
            ]);

            if (clsRes.data) {
                setClassData({
                    ...clsRes.data,
                    instructor_profile: clsRes.data.profiles as unknown as { full_name: string, title?: string }
                });
            }
            if (assignRes.data) setAssignments(assignRes.data);
            if (resRes.data) setResources(resRes.data);
            if (enrollRes.data) setEnrollments(enrollRes.data as unknown as EnrollmentProfile[]);

            if (subRes.data) {
                const map: Record<string, { grade: number | null }> = {};
                subRes.data.forEach((s) => {
                    if (s.assignment_id) {
                        map[s.assignment_id] = { grade: s.grade };
                    }
                });
                setSubmissionsMap(map);
            }

        } catch (error) {
            console.error("Error fetching class data", error);
        } finally {
            setLoading(false);
        }
    };

    const submittedCount = Object.keys(submissionsMap).length;
    const pendingCount = assignments.length - submittedCount;

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Class...</div>;
    if (!classData) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-red-400">Class not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <Link href="/student/classes" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Classes
                </Link>

                {/* Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="p-4 md:p-8 border-b border-slate-100 bg-white">
                        <div className="flex flex-col gap-3 animate-fade-in">
                            {/* Row 1: Title & Instructor */}
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-2 min-w-0">
                                    <h1 className="text-xl md:text-3xl font-bold text-slate-900 flex items-center gap-2 truncate">
                                        <span className="truncate">
                                            <span className="text-indigo-600">{classData?.class_code}:</span> {classData?.name}
                                        </span>
                                    </h1>
                                </div>

                                {/* Actions (Collapse Header) */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                                        className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                                        title={isHeaderExpanded ? "Collapse Header" : "Expand Header"}
                                    >
                                        {isHeaderExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <p className="text-slate-500 font-medium flex items-center gap-2">
                                Instructor: <span className="text-slate-800 font-bold">{classData.instructor_profile?.title ? `${classData.instructor_profile.title} ` : ''}{classData.instructor_profile?.full_name || 'Unknown'}</span>
                            </p>

                            {/* Row 2: Metadata (Collapsible) */}
                            {isHeaderExpanded && (
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-slate-500 font-medium animate-slide-in mt-2">
                                    <button
                                        onClick={() => setShowStudentsModal(true)}
                                        className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 transition-all group"
                                        title="View Enrolled Students"
                                    >
                                        <Users className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                        <span className="font-bold">{enrollments.length} Students</span>
                                    </button>

                                    {classData?.start_date && (
                                        <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs md:text-sm">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(classData.start_date).toLocaleDateString()} - {classData.end_date ? new Date(classData.end_date).toLocaleDateString() : 'Ongoing'}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl mb-6 w-fit">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Overview
                    </button>
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
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Assignments Card */}
                            <div
                                onClick={() => setActiveTab('assignments')}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between relative"
                            >
                                <div className="absolute top-4 right-4 text-slate-300 group-hover:text-emerald-500 transition-colors">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><FileText className="w-5 h-5" /></div>
                                    <h3 className="font-bold text-slate-700 group-hover:text-emerald-700">Assignments</h3>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-3xl md:text-4xl font-black text-emerald-600">{submittedCount}</p>
                                        <p className="text-xs text-emerald-500 mt-1 font-bold uppercase tracking-wider">Submitted</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl md:text-4xl font-black text-amber-500">{pendingCount}</p>
                                        <p className="text-xs text-amber-400 mt-1 font-bold uppercase tracking-wider">Unsubmitted</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'assignments' && (
                        <div className="grid gap-4">
                            {assignments.map(assign => {
                                const isOverdue = assign.due_date && new Date(assign.due_date) < new Date();
                                const submission = submissionsMap[assign.id];
                                const isSubmitted = !!submission;
                                const isGraded = submission && submission.grade !== null;

                                return (
                                    <div key={assign.id} className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${isSubmitted ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 hover:border-emerald-200'}`}>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-slate-800">{assign.title}</h3>
                                                {isGraded ? (
                                                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                        Graded: {submission.grade}/{assign.max_points}
                                                    </span>
                                                ) : isSubmitted ? (
                                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                        Submitted
                                                    </span>
                                                ) : null}
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
            {/* Students List Modal */}
            {
                showStudentsModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                                <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-600" /> Enrolled Students
                                </h3>
                                <button onClick={() => setShowStudentsModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="overflow-y-auto p-0">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 sticky top-0 outline outline-1 outline-slate-100">
                                        <tr>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {enrollments.map((enroll) => (
                                            <tr key={enroll.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                                            {enroll.profiles?.avatar_url ? (
                                                                <img src={enroll.profiles.avatar_url} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Users className="w-4 h-4 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-slate-700">{enroll.profiles?.full_name || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-slate-500 font-mono">
                                                    {enroll.profiles?.email || '-'}
                                                </td>
                                                <td className="p-4 text-sm text-slate-400 text-right font-medium">
                                                    {new Date(enroll.joined_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {enrollments.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="p-12 text-center text-slate-400">
                                                    No other students found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                                <button
                                    onClick={() => setShowStudentsModal(false)}
                                    className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
