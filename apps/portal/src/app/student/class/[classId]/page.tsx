'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from "@schologic/database";
import {
    Clock, Calendar, CheckCircle, ArrowLeft, FileText, Download,
    Link as LinkIcon, Layers, ExternalLink, ChevronRight, AlertCircle, BookOpen, User, PlayCircle, Eye,
    ChevronUp, ChevronDown, Users, X, ArrowUpRight, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Database } from "@schologic/database";
import { useReader } from '@/context/UniversalReaderContext';
import { Card } from '@/components/ui/Card';
import { Asset } from '@/types/library';

type ClassData = Database['public']['Tables']['classes']['Row'] & {
    instructor_profile?: { full_name: string | null, title?: string | null }
};
type Assignment = Database['public']['Tables']['assignments']['Row'] & Partial<{ assignment_type: string | null }>;
type Resource = Database['public']['Tables']['class_assets']['Row'] & {
    assets: Database['public']['Tables']['assets']['Row'] | null
};

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
    const { openReader } = useReader();
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
            const resQuery = supabase.from('class_assets').select('*, assets(*)').eq('class_id', classId).order('added_at', { ascending: false });
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
            if (resRes.data) setResources(resRes.data as unknown as Resource[]);
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
                    <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Back to Classes</span>
                </Link>

                {/* Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="p-4 md:p-8 border-b border-slate-100 bg-white">
                        <div className="flex flex-col gap-3 animate-fade-in">
                            {/* Row 1: Title & Instructor */}
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-2 min-w-0">
                                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2 truncate">
                                        <span className="truncate">
                                            <span className="text-indigo-600">{classData?.class_code}:</span> {classData?.name}
                                        </span>
                                    </h1>
                                </div>

                                {/* Actions (Collapse Header) - Desktop Only */}
                                <div className="hidden md:flex items-center gap-2 shrink-0">
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
                                        <span className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs md:text-sm">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(classData.start_date).toLocaleDateString()} - {classData.end_date ? new Date(classData.end_date).toLocaleDateString() : 'Ongoing'}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Row 3 (Mobile Bottom): Date | Collapse */}
                            <div className="flex md:hidden items-center justify-between pt-3 mt-1 border-t border-slate-100">
                                {/* Left: Date Range */}
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                    {classData?.start_date && (
                                        <>
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {new Date(classData.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {classData.end_date ? new Date(classData.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Ongoing'}
                                        </>
                                    )}
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                                    >
                                        {isHeaderExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl mb-6 w-full md:w-fit overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('assignments')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'assignments' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Assignments
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'resources' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Resources
                    </button>
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Assignments Card */}
                            <Card
                                onClick={() => setActiveTab('assignments')}
                                className="hover:border-emerald-400 group flex flex-col justify-between relative h-full"
                                hoverEffect
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
                            </Card>
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
                                    <Card
                                        key={assign.id}
                                        className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 p-3 md:p-6 transition-colors ${isSubmitted ? 'border-emerald-200 bg-emerald-50/10' : 'hover:border-emerald-200'}`}
                                        hoverEffect={!isSubmitted}
                                    >
                                        <div className="w-full md:w-auto flex-1">
                                            {/* Header: Title & Badges (Mobile: Stacked, Desktop: Inline) */}
                                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-2">
                                                <h3 className="font-bold text-base md:text-lg text-slate-800">{assign.title}</h3>

                                                {/* Badges */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {assign.assignment_type === 'quiz' ? (
                                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                            <Sparkles className="w-3 h-3" /> Quiz
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                                            Essay
                                                        </span>
                                                    )}
                                                    {isGraded ? (
                                                        <span className="bg-indigo-100 text-indigo-700 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                            Graded: {submission.grade}/{assign.max_points}
                                                        </span>
                                                    ) : isSubmitted ? (
                                                        <span className="bg-emerald-100 text-emerald-700 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                            Submitted
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <p className="text-slate-500 text-sm mb-2 line-clamp-2 max-w-xl">{assign.description}</p>

                                            <div className="flex items-center gap-4 text-xs font-medium">
                                                <span className={`flex items-center gap-1.5 ${isOverdue && !isSubmitted ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                                                    <Clock className="w-4 h-4" />
                                                    {assign.due_date ? `Due: ${new Date(assign.due_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : 'No Deadline'}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-slate-500">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {assign.max_points} Points
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/student/assignment/${assign.id}`}
                                            className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 whitespace-nowrap flex items-center justify-center gap-2 ${isSubmitted
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
                                    </Card>
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
                            {resources.map((item) => {
                                const res = item.assets; // Access joined asset data
                                if (!res) return null;

                                const type = res.asset_type || 'document';
                                const isLink = type === 'url';
                                const isCartridge = type === 'cartridge_root';
                                const isDocument = type === 'document' || type === 'file';
                                const source = res.source;

                                let icon = <FileText className="w-6 h-6" />;
                                let colorClass = "bg-amber-50 text-amber-600";

                                if (isLink) {
                                    icon = <LinkIcon className="w-6 h-6" />;
                                    colorClass = "bg-indigo-50 text-indigo-600";
                                } else if (isCartridge) {
                                    icon = <Layers className="w-6 h-6" />;
                                    colorClass = "bg-orange-50 text-orange-600";
                                }

                                return (
                                    <Card key={item.id} className="p-3 md:p-5 rounded-2xl flex items-start md:items-center gap-3 md:gap-4 group hover:border-indigo-300 transition-colors" hoverEffect noPadding>
                                        <div className={`p-2.5 md:p-3 rounded-xl shrink-0 ${colorClass}`}>
                                            {icon}
                                        </div>

                                        {/* Content Wrapper */}
                                        <div className="flex-1 w-full min-w-0 flex flex-col md:flex-row md:items-center md:justify-between">

                                            {/* Title Row (Mobile) / Left Side (Desktop) */}
                                            <div className="mb-2 md:mb-0 md:mr-4 min-w-0">
                                                <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-2 md:truncate">{res.title}</h3>
                                                {/* Desktop Date (Hidden on Mobile) */}
                                                <p className="hidden md:block text-xs text-slate-400 font-bold uppercase mt-0.5">Added {new Date(item.added_at ?? '').toLocaleDateString()}</p>
                                            </div>

                                            {/* Mobile Row 2: Date + Actions / Right Side (Desktop) */}
                                            <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-2 md:gap-4">

                                                {/* Mobile Date */}
                                                <p className="md:hidden text-[10px] text-slate-400 font-bold uppercase">Added {new Date(item.added_at ?? '').toLocaleDateString()}</p>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                                                    {/* Read / Content Actions */}
                                                    {(isDocument || isCartridge) && (
                                                        <button
                                                            onClick={() => openReader(res as unknown as Asset)}
                                                            className={`p-1.5 md:p-2 rounded-lg transition-all ${isCartridge
                                                                ? 'text-orange-600 hover:bg-orange-50'
                                                                : 'text-indigo-600 hover:bg-indigo-50'
                                                                }`}
                                                            title={isCartridge ? "View Course Content" : "Read Online"}
                                                        >
                                                            <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                                                        </button>
                                                    )}

                                                    {/* Link Action */}
                                                    {isLink && (
                                                        <a
                                                            href={res.file_url || '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 md:p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        >
                                                            <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                                                        </a>
                                                    )}

                                                    {/* Download Action */}
                                                    {isDocument && (
                                                        <a
                                                            href={res.file_url || '#'}
                                                            download
                                                            className="p-1.5 md:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                                        >
                                                            <Download className="w-4 h-4 md:w-5 md:h-5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })}
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
