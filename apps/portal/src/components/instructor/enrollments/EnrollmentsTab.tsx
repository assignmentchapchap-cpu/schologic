'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@schologic/database";
import { useToast } from '@/context/ToastContext';
import EnrollmentsTable from './EnrollmentsTable';
import StudentProfileModal from './StudentProfileModal';
import { Database } from "@schologic/database";
import { Loader2 } from 'lucide-react';

type Enrollment = Database['public']['Tables']['practicum_enrollments']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

interface EnrollmentsTabProps {
    practicumId: string;
    initialEnrollments?: Enrollment[]; // Optional if passed from parent
}

export default function EnrollmentsTab({ practicumId, initialEnrollments = [] }: EnrollmentsTabProps) {
    const supabase = createClient();
    const { showToast } = useToast();

    const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
    const [loading, setLoading] = useState(!initialEnrollments.length);

    // Modal State
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const selectedStudent = enrollments.find(e => e.id === selectedStudentId) || null;

    // Fetch data if not provided or to refresh
    const fetchEnrollments = async () => {
        try {
            // setLoading(true); // Don't block UI on refresh
            const { data: enrollDataRaw, error: enrollError } = await supabase
                .from('practicum_enrollments')
                .select('*')
                .eq('practicum_id', practicumId)
                .neq('status', 'draft');

            if (enrollError) throw enrollError;

            if (enrollDataRaw) {
                const studentIds = enrollDataRaw.map(e => e.student_id);
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', studentIds);

                const profilesMap = new Map(profilesData?.map(p => [p.id, p]));

                const joined = enrollDataRaw.map(e => ({
                    ...e,
                    profiles: profilesMap.get(e.student_id) || null
                })) as unknown as Enrollment[];

                setEnrollments(joined);
            }
        } catch (error) {
            console.error("Error fetching enrollments:", error);
            showToast("Failed to refresh student list", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!initialEnrollments.length) {
            fetchEnrollments();
        } else {
            setEnrollments(initialEnrollments);
        }
    }, [practicumId, initialEnrollments]); // Added initialEnrollments dependency

    // Update Status Handler
    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
        try {
            const updates: any = { status };
            if (status === 'approved') {
                updates.approved_at = new Date().toISOString();
            }
            if (notes !== undefined) {
                updates.instructor_notes = notes;
            }

            const { error } = await supabase
                .from('practicum_enrollments')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            showToast(`Student application ${status}`, "success");

            // Optimistic update
            setEnrollments(prev => prev.map(e =>
                e.id === id ? { ...e, ...updates } : e
            ));

        } catch (error: any) {
            console.error("Status update error", error);
            showToast("Failed to update status", "error");
            throw error; // Re-throw so modal can handle loading state
        }
    };

    // Navigation logic
    // We need to operate on the *filtered* list order ideally, but for now let's use the main list order or rely on ID finding.
    // If filtering happens in the TABLE, we don't know the order here easily unless we lift the filter state up.
    // Simplifying: Iterate through the loaded list. Using table filters + modal nav is tricky if state is separate.
    // OPTION: Lift filter state here? 
    // DECISION: For now, navigation iterates through the *entire* loaded list. This is simpler. 
    // If the user filtered the table, the modal 'next' might jump to a hidden student. 
    // This is acceptable for Phase 1.5.

    const handleNext = () => {
        const currentIndex = enrollments.findIndex(e => e.id === selectedStudentId);
        if (currentIndex < enrollments.length - 1) {
            setSelectedStudentId(enrollments[currentIndex + 1].id);
        }
    };

    const handlePrev = () => {
        const currentIndex = enrollments.findIndex(e => e.id === selectedStudentId);
        if (currentIndex > 0) {
            setSelectedStudentId(enrollments[currentIndex - 1].id);
        }
    };

    // Calculate indices for disabled states
    const currentIndex = enrollments.findIndex(e => e.id === selectedStudentId);
    const hasNext = currentIndex < enrollments.length - 1;
    const hasPrev = currentIndex > 0;

    if (loading) return <div className="p-8 text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Loading Students...</div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Student Enrollments</h2>
                    <p className="text-slate-500 text-sm">Manage student access and view applications.</p>
                </div>
                <button
                    onClick={() => fetchEnrollments()}
                    className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg"
                >
                    Refresh List
                </button>
            </div>

            <EnrollmentsTable
                data={enrollments}
                onViewProfile={(student) => {
                    setSelectedStudentId(student.id);
                    setIsModalOpen(true);
                }}
            />

            <StudentProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                student={selectedStudent}
                onNext={handleNext}
                onPrev={handlePrev}
                hasNext={hasNext}
                hasPrev={hasPrev}
                onUpdateStatus={handleUpdateStatus}
            />
        </div>
    );
}
