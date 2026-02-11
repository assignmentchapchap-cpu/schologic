import { useState, useEffect } from 'react';
import { createClient } from "@schologic/database";
import { Database } from "@schologic/database";
import { useToast } from '@/context/ToastContext';
import { Loader2, AlertCircle } from 'lucide-react';
import StudentListSidebar from './StudentListSidebar';
import SubmissionsListColumn from './SubmissionsListColumn';
import LogReadingPane from './LogReadingPane';
import { updatePracticumGrades } from '@/app/actions/grading';

type Practicum = Database['public']['Tables']['practicums']['Row'];
type Enrollment = Database['public']['Tables']['practicum_enrollments']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null;
    logs?: any[];
};

interface SubmissionsManagerProps {
    practicumId: string;
    practicum: Practicum; // Pass full object if available, or fetch
}

export default function SubmissionsManager({ practicumId, practicum }: SubmissionsManagerProps) {
    const supabase = createClient();
    const { showToast } = useToast();

    // Data State
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Enrollment[]>([]);
    const [logs, setLogs] = useState<any[]>([]);

    // UI State
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'logs' | 'student_reports' | 'supervisor_reports'>('all');

    // Processing State
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchAllData = async () => {
        if (!practicumId) return;

        try {
            setLoading(true);

            // 1. Fetch Enrollments
            const { data: enrollDataRaw, error: enrollError } = await supabase
                .from('practicum_enrollments')
                .select('*')
                .eq('practicum_id', practicumId)
                .eq('status', 'approved')
                .order('joined_at', { ascending: true });

            if (enrollError) throw enrollError;

            if (!enrollDataRaw || enrollDataRaw.length === 0) {
                setStudents([]);
                setLogs([]);
                setLoading(false);
                return;
            }

            // 2. Fetch Profiles
            const studentIds = enrollDataRaw.map(e => e.student_id);
            let profilesMap = new Map();

            if (studentIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', studentIds);

                if (profilesData) {
                    profilesMap = new Map(profilesData.map(p => [p.id, p]));
                }
            }

            // 3. Fetch Logs (Using correct schema: practicum_id + student_id)
            let logData: any[] = [];

            if (studentIds.length > 0) {
                const { data: fetchedLogs, error: logError } = await supabase
                    .from('practicum_logs')
                    .select('*')
                    .eq('practicum_id', practicumId)
                    .in('student_id', studentIds)
                    .neq('submission_status', 'draft')
                    .order('log_date', { ascending: false });

                if (logError) throw logError;
                logData = (fetchedLogs || []).map(l => ({ ...l, type: 'log' }));
            }

            // 4. Generate Report Items from Enrollments
            const reportItems = enrollDataRaw
                .filter(e => e.student_report_url)
                .map(e => ({
                    id: `report-${e.student_id}`,
                    type: 'student_report', // RENAMED
                    student_id: e.student_id,
                    log_date: e.joined_at,
                    submission_status: 'submitted',
                    supervisor_status: e.final_grade ? 'verified' : 'pending',
                    instructor_status: e.student_report_grades ? 'read' : 'unread',
                    student_report_url: e.student_report_url,
                    entries: { subject_taught: 'Final Report' }
                }));

            // 4b. Generate Supervisor Report Items
            const supervisorReportItems = enrollDataRaw
                // We show item if supervisor_report exists OR if we want to show pending ones? 
                // Let's show all approved enrollments as 'pending' supervisor reports or only submitted ones?
                // Plan says: "List View: Shows status of reports (Pending / Submitted)"
                // So we should list them all for approved students.
                .map(e => ({
                    id: `sup-report-${e.student_id}`,
                    type: 'supervisor_report',
                    student_id: e.student_id,
                    log_date: e.joined_at, // Or updated_at
                    submission_status: 'submitted', // Check actual report existence below
                    instructor_status: e.supervisor_report ? 'unread' : 'read', // Mark unread if submitted and not graded? Simplicity: 'unread' if submitted.
                    supervisor_report: e.supervisor_report,
                    entries: { subject_taught: 'Supervisor Evaluation' },
                    // Status logic handled in Column based on supervisor_report presence
                }));

            // 5. Combine and Sort
            const allSubmissions = [...logData, ...reportItems, ...supervisorReportItems].sort((a, b) =>
                new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
            );

            // 6. Combine Data for Sidebar
            const studentsWithLogs = enrollDataRaw.map(student => ({
                ...student,
                profiles: profilesMap.get(student.student_id) || null,
                logs: allSubmissions.filter(l => l.student_id === student.student_id)
            })) as Enrollment[];

            setStudents(studentsWithLogs);
            setLogs(allSubmissions);

            // Auto-select first student if none selected
            if (!selectedStudentId && studentsWithLogs.length > 0) {
                setSelectedStudentId(studentsWithLogs[0].student_id);
            }

        } catch (error: any) {
            console.error("Failed to load submissions:", error);
            showToast("Failed to load submission data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [practicumId]);

    // Handle student selection
    const handleStudentSelect = (studentId: string) => {
        setSelectedStudentId(studentId);
        setSelectedLogId(null); // Reset detail view
    };

    // Handle log selection (Mark as Read)
    const handleLogSelect = async (item: any) => {
        setSelectedLogId(item.id);

        // Mark as Read if unread
        if (item.instructor_status === 'unread') {
            try {
                // Optimistic update
                setLogs(prev => prev.map(l => l.id === item.id ? { ...l, instructor_status: 'read' } : l));

                await supabase
                    .from('practicum_logs')
                    .update({ instructor_status: 'read' })
                    .eq('id', item.id);

                // Update student list progress (unread count decreased)
                setStudents(prev => prev.map(s => {
                    if (s.student_id === item.student_id) {
                        const updatedLogs = (s.logs || []).map((l: any) => l.id === item.id ? { ...l, instructor_status: 'read' } : l);
                        return { ...s, logs: updatedLogs };
                    }
                    return s;
                }));

            } catch (e) {
                console.error("Failed to mark as read", e);
            }
        }
    };

    // Verification Logic
    const handleVerification = async (logId: string, status: 'verified' | 'rejected') => {
        if (!confirm(`Are you sure you want to mark this log as ${status}?`)) return;

        try {
            setProcessingId(logId);
            const { error } = await supabase
                .from('practicum_logs')
                .update({ supervisor_status: status })
                .eq('id', logId);

            if (error) throw error;

            showToast(`Log marked as ${status}`, "success");

            // Update local state
            setLogs(prev => prev.map(l => l.id === logId ? { ...l, supervisor_status: status } : l));

            // Update student's logs too
            setStudents(prev => prev.map(s => {
                // Technically we just need to update the logs array attached to the student
                // But since we derive the list from 'logs' state, we might not need to Deep update 'students' 
                // EXCEPT that StudentListSidebar calculates progress from 'student.logs'. So yes, update it.
                if (s.logs && s.logs.some((l: any) => l.id === logId)) {
                    const updatedLogs = s.logs.map((l: any) => l.id === logId ? { ...l, supervisor_status: status } : l);
                    return { ...s, logs: updatedLogs };
                }
                return s;
            }));

        } catch (e: any) {
            showToast(e.message, "error");
        } finally {
            setProcessingId(null);
        }
    };

    // Grading Logic
    const handleUpdateGrade = async (enrollmentId: string, field: 'logs_grade' | 'report_grade' | 'supervisor_grade', value: number) => {
        try {
            // Optimistic Update (immediate UI feedback)
            setStudents(prev => prev.map(s =>
                s.id === enrollmentId ? { ...s, [field]: value } : s
            ));

            const result = await updatePracticumGrades(enrollmentId, { [field]: value });
            if (!result.success) throw new Error(result.error);

            showToast("Grade updated", "success");

            // Refetch data to ensure UI matches database
            await fetchAllData();
        } catch (e: any) {
            console.error("Failed to update grade", e);
            showToast("Failed to update grade", "error");

            // Refetch to revert optimistic update if failed
            await fetchAllData();
        }
    };

    if (loading) {
        return <div className="p-12 flex items-center justify-center text-slate-400 gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading Submissions...</div>;
    }

    // Prepare View Data
    const selectedStudentLogs = selectedStudentId
        ? logs.filter(l => l.student_id === selectedStudentId)
        : [];

    const selectedLog = selectedLogId
        ? logs.find(l => l.id === selectedLogId)
        : null;

    const selectedStudent = selectedStudentId ? students.find(s => s.student_id === selectedStudentId) : null;


    return (
        <div className="h-[calc(100vh-200px)] min-h-[600px] flex bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
            {/* Left Pane: Student List */}
            <StudentListSidebar
                students={students}
                selectedId={selectedStudentId}
                onSelect={handleStudentSelect}
                practicum={practicum}
            />

            {/* Middle Pane: Submissions List */}
            <div className="w-80 flex-shrink-0">
                {selectedStudentId ? (
                    <SubmissionsListColumn
                        items={selectedStudentLogs}
                        selectedId={selectedLogId}
                        onSelect={handleLogSelect}
                        filter={filter}
                        setFilter={setFilter}
                        currentLogsGrade={selectedStudent?.logs_grade ?? undefined}
                        onUpdateLogsGrade={(g) => selectedStudent && handleUpdateGrade(selectedStudent.id, 'logs_grade', g)}
                        currentReportGrade={selectedStudent?.report_grade ?? undefined}
                        onUpdateReportGrade={(g) => selectedStudent && handleUpdateGrade(selectedStudent.id, 'report_grade', g)}
                        currentSupervisorGrade={selectedStudent?.supervisor_grade ?? undefined}
                        onUpdateSupervisorGrade={(g) => selectedStudent && handleUpdateGrade(selectedStudent.id, 'supervisor_grade', g)}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center bg-slate-50 text-slate-400 text-xs">Select a student</div>
                )}
            </div>

            {/* Right Pane: Detail View */}
            <div className="flex-grow flex flex-col bg-white overflow-hidden">
                {selectedLog ? (
                    <LogReadingPane
                        log={selectedLog}
                        practicum={practicum}
                        onVerify={(id) => handleVerification(id, 'verified')}
                        onReject={(id) => handleVerification(id, 'rejected')}
                        verificationProcessing={processingId === selectedLog.id}
                        // Grading Props
                        currentReportGrade={selectedStudent?.report_grade ?? undefined}
                        onUpdateReportGrade={(g) => selectedStudent && handleUpdateGrade(selectedStudent.id, 'report_grade', g)}
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 p-8 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="font-bold">No submission selected</p>
                        <p className="text-xs max-w-xs mt-2">Select a submission from the list to view details and verify.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
