import { useState, useEffect } from 'react';
import { createClient } from "@schologic/database";
import { Database } from "@schologic/database";
import { useToast } from '@/context/ToastContext';
import { Loader2, AlertCircle } from 'lucide-react';
import StudentListSidebar from './StudentListSidebar';
import SubmissionsListColumn from './SubmissionsListColumn';
import LogReadingPane from './LogReadingPane';

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
    const [filter, setFilter] = useState<'all' | 'unread' | 'logs' | 'reports'>('all');

    // Processing State
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Initial Fetch
    const fetchAllData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Enrollments (Basic)
            const { data: enrollDataRaw, error: enrollError } = await supabase
                .from('practicum_enrollments')
                .select('*')
                .eq('practicum_id', practicumId)
                .eq('status', 'approved')
                .order('created_at', { ascending: true });

            if (enrollError) throw enrollError;

            // Fetch profiles separately to avoid type issues
            const studentIds = enrollDataRaw?.map(e => e.student_id) || [];
            let profilesMap = new Map();

            if (studentIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', studentIds);

                profilesMap = new Map(profilesData?.map(p => [p.id, p]));
            }

            // 2. Fetch All Logs for these Students (Phase 1)
            // Note: practicum_logs usually links via enrollment_id, not practicum_id directly
            const enrollmentIds = enrollDataRaw?.map(e => e.id) || [];

            let logData: any[] = [];

            if (enrollmentIds.length > 0) {
                const { data, error: logError } = await supabase
                    .from('practicum_logs')
                    .select('*')
                    .in('enrollment_id', enrollmentIds)
                    .neq('submission_status', 'draft')
                    .order('log_date', { ascending: false });

                if (logError) throw logError;
                logData = data || [];
            }

            // 3. Attach profiles and logs
            const studentsWithLogs = (enrollDataRaw || []).map(student => ({
                ...student,
                profiles: profilesMap.get(student.student_id) || null,
                logs: (logData || []).filter(l => l.student_id === student.student_id)
            })) as Enrollment[];

            setStudents(studentsWithLogs);
            setLogs(logData || []);

            // Default select first student if none selected
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

    if (loading) {
        return <div className="p-12 flex items-center justify-center text-slate-400 gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading Submissions...</div>;
    }

    // Prepare View Data
    const selectedStudentLogs = selectedStudentId
        ? logs.filter(l => l.student_id === selectedStudentId).map(l => ({ ...l, type: 'log' as const }))
        : [];

    const selectedLog = selectedLogId
        ? logs.find(l => l.id === selectedLogId)
        : null;

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
