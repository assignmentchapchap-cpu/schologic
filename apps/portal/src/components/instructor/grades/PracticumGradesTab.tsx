import { useState, useEffect } from 'react';
import { createClient } from "@schologic/database";
import { Database } from "@schologic/database";
import { useToast } from '@/context/ToastContext';
import { Loader2, Save, RefreshCw, Plus, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updatePracticumGrades } from '@/app/actions/grading';

type Practicum = Database['public']['Tables']['practicums']['Row'];
type Enrollment = Database['public']['Tables']['practicum_enrollments']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

interface PracticumGradesTabProps {
    practicum: Practicum;
}

export default function PracticumGradesTab({ practicum }: PracticumGradesTabProps) {
    const supabase = createClient();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [syncing, setSyncing] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch enrollments
            const { data: enrollData, error: enrollError } = await supabase
                .from('practicum_enrollments')
                .select('*')
                .eq('practicum_id', practicum.id)
                .eq('status', 'approved')
                .order('student_registration_number', { ascending: true });

            if (enrollError) {
                console.error('❌ Enrollment fetch error:', enrollError);
                throw enrollError;
            }

            if (!enrollData || enrollData.length === 0) {
                setEnrollments([]);
                return;
            }

            // 2. Fetch profiles for all students
            const studentIds = enrollData.map((e: any) => e.student_id);
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .in('id', studentIds);

            if (profilesError) {
                console.error('⚠️ Profiles fetch error (continuing without):', profilesError);
            }

            // 3. Merge profiles into enrollments
            const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
            const mergedData = enrollData.map((enrollment: any) => ({
                ...enrollment,
                profiles: profilesMap.get(enrollment.student_id) || null
            }));

            setEnrollments(mergedData as unknown as Enrollment[]);
        } catch (e: any) {
            console.error('🔥 Error fetching grades:', e);
            showToast("Failed to load grades", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [practicum.id]);

    // Update Handler
    const handleGradeChange = async (id: string, field: 'logs_grade' | 'report_grade' | 'supervisor_grade' | 'final_grade', value: string) => {
        const numValue = value === '' ? null : parseFloat(value);
        if (numValue !== null && isNaN(numValue)) return; // Invalid input

        // Optimistic Update
        setEnrollments(prev => prev.map(e => e.id === id ? { ...e, [field]: numValue } : e));

        // Debounce or just save on blur? For now, save on change is okay if server can handle it, 
        // but blur is better. Let's rely on onBlur for the actual server call to avoid spam.
    };

    const handleSave = async (id: string, field: string, value: number | null) => {
        if (value === null) return; // Don't save empty string/null unless explicit clear (future)

        try {
            // @ts-ignore
            await updatePracticumGrades(id, { [field]: value });
            showToast("Saved", "success");
        } catch (e) {
            showToast("Failed to save", "error");
        }
    };

    // Auto-Calculate Final Grade for a student
    const calculateFinal = (e: Enrollment) => {
        // Simple sum provided all parts exist, or partial sum
        // Logic: Final = Logs + Report + Supervisor
        // If config defines weights, apply them. For now, assume raw points sum or previously defined logic.
        // User asked for "Total Points" column.
        const logs = e.logs_grade || 0;
        const report = e.report_grade || 0;
        const supervisor = e.supervisor_grade || 0;
        const total = logs + report + supervisor;
        return total;
    };

    const handleCalculateAll = async () => {
        if (!confirm("This will calculate and overwrite the Final Grade for all students based on the sum of available scores. Continue?")) return;

        setSyncing(true);
        try {
            const updates = enrollments.map(e => {
                const total = calculateFinal(e);
                // Update local
                return { ...e, final_grade: total };
            });

            setEnrollments(updates);

            // Update server (batch loop for now)
            await Promise.all(updates.map(e => updatePracticumGrades(e.id, { final_grade: e.final_grade! })));

            showToast("Final grades calculated", "success");
        } catch (e) {
            showToast("Error calculating grades", "error");
        } finally {
            setSyncing(false);
        }
    };

    const handleSyncSupervisor = async () => {
        setSyncing(true);
        try {
            // Re-fetch to get latest supervisor reports inside JSONB if needed, 
            // but we likely have them in the 'supervisor_report' column if we selected *.
            // Actually 'supervisor_report' is a column.

            const updates = enrollments.map(e => {
                const report = e.supervisor_report as any;
                if (report?.total_score) {
                    return { ...e, supervisor_grade: report.total_score };
                }
                return e;
            });

            setEnrollments(updates);

            // Push changes where changed
            const changed = updates.filter((u, i) => u.supervisor_grade !== enrollments[i].supervisor_grade);
            await Promise.all(changed.map(e => updatePracticumGrades(e.id, { supervisor_grade: e.supervisor_grade! })));

            showToast(`Synced ${changed.length} supervisor grades`, "success");
        } catch (e) {
            showToast("Error syncing", "error");
        } finally {
            setSyncing(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading Grades...</div>;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                    <h3 className="font-bold text-slate-800">Final Grades</h3>
                    <p className="text-xs text-slate-500">Manage and calculate student scores.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSyncSupervisor}
                        disabled={syncing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", syncing && "animate-spin")} /> Sync Supervisor
                    </button>
                    <button
                        onClick={handleCalculateAll}
                        disabled={syncing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 shadow-sm shadow-emerald-200"
                    >
                        <Plus className="w-3.5 h-3.5" /> Calculate All
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900">
                        <Download className="w-3.5 h-3.5" /> Export
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-4 w-64">Student</th>
                            <th className="p-4 w-32 text-center">Logs & Other</th>
                            <th className="p-4 w-32 text-center">Student Report</th>
                            <th className="p-4 w-32 text-center">Supervisor Eval</th>
                            <th className="p-4 w-32 text-center bg-slate-100/50">Total Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {enrollments.map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-4">
                                    <div className="font-bold text-slate-900">{student.profiles?.full_name || 'Unknown'}</div>
                                    <div className="text-xs text-slate-500 font-mono">{student.student_registration_number || '-'}</div>
                                </td>

                                {/* Logs Grade */}
                                <td className="p-2 text-center">
                                    <GradeInput
                                        value={student.logs_grade}
                                        onChange={(v) => handleGradeChange(student.id, 'logs_grade', v)}
                                        onBlur={(v) => handleSave(student.id, 'logs_grade', v ? parseFloat(v) : null)}
                                    />
                                </td>

                                {/* Report Grade */}
                                <td className="p-2 text-center">
                                    <GradeInput
                                        value={student.report_grade}
                                        onChange={(v) => handleGradeChange(student.id, 'report_grade', v)}
                                        onBlur={(v) => handleSave(student.id, 'report_grade', v ? parseFloat(v) : null)}
                                    />
                                </td>

                                {/* Supervisor Grade */}
                                <td className="p-2 text-center">
                                    <GradeInput
                                        value={student.supervisor_grade}
                                        onChange={(v) => handleGradeChange(student.id, 'supervisor_grade', v)}
                                        onBlur={(v) => handleSave(student.id, 'supervisor_grade', v ? parseFloat(v) : null)}
                                        highlight={!!student.supervisor_report}
                                    />
                                </td>

                                {/* Final Grade */}
                                <td className="p-2 text-center bg-slate-50/50">
                                    <div className="flex items-center justify-center gap-2">
                                        <input
                                            type="number"
                                            className="w-20 p-2 text-center font-black text-slate-900 bg-transparent border-b-2 border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none transition-all"
                                            placeholder="-"
                                            value={student.final_grade ?? ''}
                                            onChange={(e) => handleGradeChange(student.id, 'final_grade', e.target.value)}
                                            onBlur={(e) => handleSave(student.id, 'final_grade', e.target.value ? parseFloat(e.target.value) : null)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {enrollments.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400 italic">No approved students found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function GradeInput({ value, onChange, onBlur, highlight }: { value?: number | null, onChange: (val: string) => void, onBlur: (val: string) => void, highlight?: boolean }) {
    const [localVal, setLocalVal] = useState(value?.toString() ?? '');

    useEffect(() => {
        setLocalVal(value?.toString() ?? '');
    }, [value]);

    return (
        <div className="flex justify-center">
            <input
                type="number"
                min="0"
                className={cn(
                    "w-20 p-2 text-center text-sm font-bold border rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all",
                    highlight ? "border-emerald-200 bg-emerald-50/30 text-emerald-700" : "border-slate-200 bg-white text-slate-700"
                )}
                placeholder="-"
                value={localVal}
                onChange={(e) => {
                    setLocalVal(e.target.value);
                    onChange(e.target.value);
                }}
                onBlur={(e) => onBlur(e.target.value)}
            />
        </div>
    )
}
