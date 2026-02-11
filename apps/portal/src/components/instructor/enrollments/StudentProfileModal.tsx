'use client';

import { useState } from 'react';
import {
    X, ChevronLeft, ChevronRight, Phone, Mail, MapPin,
    Calendar, GraduationCap, User, Check, XCircle, FileText
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';
// We'll import types from database package once strictly typed, 
// for now we assume shape passed from parent matches
import { Database } from "@schologic/database";

type Enrollment = Database['public']['Tables']['practicum_enrollments']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Enrollment | null;
    onNext?: () => void;
    onPrev?: () => void;
    hasNext?: boolean;
    hasPrev?: boolean;
    onUpdateStatus: (id: string, status: 'approved' | 'rejected', notes?: string) => Promise<void>;
}

export default function StudentProfileModal({
    isOpen,
    onClose,
    student,
    onNext,
    onPrev,
    hasNext,
    hasPrev,
    onUpdateStatus
}: StudentProfileModalProps) {
    const [activeTab, setActiveTab] = useState<'application' | 'timeline' | 'map'>('application');
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectMode, setRejectMode] = useState(false);
    const [notes, setNotes] = useState('');

    if (!student || !isOpen) return null;

    // Helper to safely access JSON fields
    const academic = student.academic_data as any || {};
    const workplace = student.workplace_data as any || {};
    const supervisor = student.supervisor_data as any || {};
    const schedule = student.schedule as any || {};
    const coords = student.location_coords as any || {};

    const handleAction = async (status: 'approved' | 'rejected') => {
        if (status === 'rejected' && !rejectMode) {
            setRejectMode(true);
            return; // Show comment box first
        }

        setIsProcessing(true);
        try {
            await onUpdateStatus(student.id, status, notes);
            setRejectMode(false);
            setNotes('');
            // Parent handles closing or moving to next?
            // Usually we just want to stay open if next exists?
            // Let's assume parent might close or we just reset state
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-50 gap-0 h-[80vh] flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onPrev}
                                disabled={!hasPrev}
                                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <button
                                onClick={onNext}
                                disabled={!hasNext}
                                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                {student.profiles?.avatar_url ? (
                                    <img src={student.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 leading-tight">
                                    {student.profiles?.full_name || 'Unknown Student'}
                                </h3>
                                <p className="text-sm text-slate-500 font-mono">
                                    {student.student_registration_number || student.profiles?.registration_number || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar */}
                    <div className="w-1/3 border-r border-slate-200 bg-white p-6 overflow-y-auto hidden md:block">
                        <div className="space-y-6">
                            {/* Contact Info */}
                            <div>
                                <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Contact Details</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-slate-900 font-medium truncate" title={student.student_email || ''}>
                                                {student.student_email || 'No Email'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-medium">
                                                {student.student_phone || 'No Phone'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Status</h4>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase",
                                    student.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                                        student.status === 'rejected' ? "bg-red-100 text-red-700" :
                                            "bg-amber-100 text-amber-700"
                                )}>
                                    {student.status}
                                </span>
                            </div>

                            {/* Actions (Sidebar) if pending */}
                            {student.status === 'pending' && (
                                <div className="pt-6 border-t border-slate-100">
                                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Decision</h4>

                                    {rejectMode ? (
                                        <div className="space-y-3 animate-fade-in">
                                            <textarea
                                                className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none min-h-[100px]"
                                                placeholder="Reason for rejection (optional)..."
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setRejectMode(false)}
                                                    className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleAction('rejected')}
                                                    disabled={isProcessing}
                                                    className="flex-1 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
                                                >
                                                    Confirm Reject
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleAction('rejected')}
                                                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 text-slate-600 rounded-xl font-bold transition-all"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleAction('approved')}
                                                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm"
                                            >
                                                <Check className="w-4 h-4" /> Approve
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notes Display if already graded/rejected/approved with notes */}
                            {student.instructor_notes && (
                                <div className="pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Instructor Notes</h4>
                                    <p className="text-sm text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic">
                                        "{student.instructor_notes}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 bg-white px-6">
                            {[
                                { id: 'application', label: 'Application Data', icon: FileText },
                                { id: 'timeline', label: 'Schedule', icon: Calendar },
                                { id: 'map', label: 'Location Map', icon: MapPin },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-4 text-sm font-bold border-b-2 transition-colors",
                                        activeTab === tab.id
                                            ? "border-emerald-500 text-emerald-700"
                                            : "border-transparent text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'application' && (
                                <div className="space-y-6 max-w-2xl">
                                    {/* Academic Card */}
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold border-b border-slate-100 pb-2">
                                            <GraduationCap className="w-5 h-5 text-emerald-600" />
                                            <h3>Academic Information</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Institution</p>
                                                <p className="font-medium text-slate-800">{academic.institution || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Course</p>
                                                <p className="font-medium text-slate-800">{academic.course || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Level</p>
                                                <p className="font-medium text-slate-800 capitalize">{student.program_level || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Year</p>
                                                <p className="font-medium text-slate-800">{academic.year_of_study || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Workplace Card */}
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold border-b border-slate-100 pb-2">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                            <h3>Workplace Details</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                            <div className="col-span-2">
                                                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Company</p>
                                                <p className="font-medium text-slate-800 text-lg">{workplace.company_name || '-'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Address</p>
                                                <p className="font-medium text-slate-800">{workplace.address || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Department</p>
                                                <p className="font-medium text-slate-800">{workplace.department || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Supervisor Card */}
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold border-b border-slate-100 pb-2">
                                            <User className="w-5 h-5 text-purple-600" />
                                            <h3>Supervisor</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Name</p>
                                                <p className="font-medium text-slate-800">{supervisor.name || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Designation</p>
                                                <p className="font-medium text-slate-800">{supervisor.designation || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Email</p>
                                                <p className="font-medium text-slate-800">{supervisor.email || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Phone</p>
                                                <p className="font-medium text-slate-800">{supervisor.phone || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="font-bold text-slate-900 mb-4">Proposed Schedule</h3>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                <div
                                                    key={day}
                                                    className={cn(
                                                        "px-4 py-2 rounded-lg font-bold border",
                                                        (schedule.days || []).includes(day)
                                                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                                            : "bg-slate-50 border-slate-100 text-slate-300"
                                                    )}
                                                >
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Start Time</p>
                                                <p className="text-xl font-mono font-medium text-slate-800">{schedule.start_time || '--:--'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase font-bold mb-1">End Time</p>
                                                <p className="text-xl font-mono font-medium text-slate-800">{schedule.end_time || '--:--'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'map' && (
                                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm h-full min-h-[400px] flex items-center justify-center bg-slate-100">
                                    {coords.lat ? (
                                        <div className="text-center">
                                            <MapPin className="w-12 h-12 text-red-500 mx-auto mb-2" />
                                            <p className="font-bold text-slate-900">Coordinates Captured</p>
                                            <p className="font-mono text-slate-500">{coords.lat}, {coords.lng}</p>
                                            <p className="text-xs text-slate-400 mt-2">Accuracy: {coords.accuracy}m</p>
                                            <a
                                                href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-block mt-4 text-blue-600 hover:underline text-sm font-bold"
                                            >
                                                Open in Google Maps
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No geolocation data provided.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

