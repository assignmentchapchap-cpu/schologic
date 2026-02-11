'use client';

import { useState, useMemo } from 'react';
import { Database } from "@schologic/database";
import { Loader2, CheckCircle2, User, Search, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { requestSupervisorReports } from '@/app/actions/practicum';
import { useToast } from '@/context/ToastContext';

type Enrollment = Database['public']['Tables']['practicum_enrollments']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

interface RequestReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    enrollments: Enrollment[];
    practicumId: string;
}

export default function RequestReportDialog({ isOpen, onClose, enrollments, practicumId }: RequestReportDialogProps) {
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successCount, setSuccessCount] = useState<number | null>(null);

    // Filter valid enrollments (must have supervisor email)
    const validEnrollments = useMemo(() => {
        return enrollments.filter(e => {
            const supervisor = e.supervisor_data as any;
            return !!supervisor?.email;
        });
    }, [enrollments]);

    const filteredEnrollments = useMemo(() => {
        if (!searchQuery) return validEnrollments;
        const q = searchQuery.toLowerCase();
        return validEnrollments.filter(e =>
            e.profiles?.full_name?.toLowerCase().includes(q) ||
            (e.supervisor_data as any)?.name?.toLowerCase().includes(q)
        );
    }, [validEnrollments, searchQuery]);

    // Handle Selection logic
    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredEnrollments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredEnrollments.map(e => e.student_id))); // Use student_id as user identifier usually, wait action takes studentIds
        }
    };

    const handleSend = async () => {
        if (selectedIds.size === 0) return;

        try {
            setIsSubmitting(true);
            const result = await requestSupervisorReports(practicumId, Array.from(selectedIds));

            if (result.success) {
                setSuccessCount(result.sent || 0);
                showToast(`Successfully sent ${result.sent} requests.`, 'success');
                setTimeout(() => {
                    onClose();
                    setSuccessCount(null);
                    setSelectedIds(new Set());
                }, 2000);
            } else {
                showToast(result.error || 'Failed to send requests', 'error');
            }
        } catch (error: any) {
            showToast(error.message || 'An error occurred', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    if (successCount !== null) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Requests Sent!</h2>
                    <p className="text-slate-600">
                        Evaluations have been requested for <span className="font-bold text-slate-900">{successCount}</span> students.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Request Supervisor Reports</h2>
                        <p className="text-sm text-slate-500">Select students to send final evaluation requests to.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex gap-3">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search students or supervisors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-500 flex items-center bg-white px-3 border border-slate-200 rounded-lg">
                        {selectedIds.size} Selected
                    </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto p-4 space-y-2 flex-grow min-h-[300px]">
                    {filteredEnrollments.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            {validEnrollments.length === 0 ? (
                                <div className="flex flex-col items-center gap-2">
                                    <AlertCircle className="w-8 h-8 opacity-50" />
                                    <p>No students have valid supervisor emails yet.</p>
                                </div>
                            ) : (
                                <p>No matching students found.</p>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === filteredEnrollments.length && filteredEnrollments.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>Select All</span>
                            </div>

                            {filteredEnrollments.map(enrollment => {
                                const isSelected = selectedIds.has(enrollment.student_id);
                                const supervisor = enrollment.supervisor_data as any;

                                return (
                                    <div
                                        key={enrollment.id}
                                        onClick={() => toggleSelect(enrollment.student_id)}
                                        className={cn(
                                            "flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm",
                                            isSelected
                                                ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500/20"
                                                : "bg-white border-slate-100 hover:border-emerald-200"
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => { }} // Handled by div click
                                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                                        />

                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                                            {enrollment.profiles?.full_name?.[0] || <User className="w-4 h-4" />}
                                        </div>

                                        <div className="flex-grow min-w-0">
                                            <h4 className={cn("text-sm font-bold truncate", isSelected ? "text-emerald-900" : "text-slate-900")}>
                                                {enrollment.profiles?.full_name || 'Unknown Student'}
                                            </h4>
                                            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                                <span className="font-medium">Supervisor:</span> {supervisor?.name} ({supervisor?.email})
                                            </p>
                                        </div>

                                        {enrollment.supervisor_report && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                                Received
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={selectedIds.size === 0 || isSubmitting}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? 'Sending...' : `Send requests to ${selectedIds.size} supervisors`}
                    </button>
                </div>
            </div>
        </div>
    );
}
