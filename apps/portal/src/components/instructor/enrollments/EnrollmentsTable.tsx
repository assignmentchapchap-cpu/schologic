'use client';

import { useState, useMemo } from 'react';
import {
    Search, Filter, ChevronDown, User, Eye,
    Check, XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from "@schologic/database";

type Enrollment = Database['public']['Tables']['practicum_enrollments']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

interface EnrollmentsTableProps {
    data: Enrollment[];
    onViewProfile: (student: Enrollment) => void;
}

export default function EnrollmentsTable({ data, onViewProfile }: EnrollmentsTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    // Hide rejected by default: actually implementation implies we show "Active" or "Pending" mostly. 
    // If filter is 'all', should we show rejected? 
    // User asked: "rejected applications can be hidden by default"
    // So 'all' might might excluding rejected, and we have a specific 'rejected' tab? 
    // Let's implement statusFilter containing: 'all_active', 'pending', 'approved', 'rejected'. 
    // Where 'all_active' includes pending + approved. 
    // Or just simple filter state.

    // Let's stick to standard filters but default the view logic

    const filteredData = useMemo(() => {
        return data.filter(item => {
            // 1. Search
            const name = item.profiles?.full_name?.toLowerCase() || '';
            const reg = item.student_registration_number?.toLowerCase() || item.profiles?.registration_number?.toLowerCase() || '';
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = name.includes(searchLower) || reg.includes(searchLower);

            if (!matchesSearch) return false;

            // 2. Status Filter
            if (statusFilter === 'all') {
                return item.status !== 'rejected'; // Hide rejected by default
            }
            return item.status === statusFilter;
        });
    }, [data, searchQuery, statusFilter]);

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search student by name or Reg. Number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {[
                        { id: 'all', label: 'Active & Pending' },
                        { id: 'pending', label: 'Pending Review' },
                        { id: 'approved', label: 'Approved Cohort' },
                        { id: 'rejected', label: 'Rejected' },
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setStatusFilter(filter.id as any)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors",
                                statusFilter === filter.id
                                    ? "bg-slate-800 text-white"
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reg. Number</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Program</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredData.length > 0 ? (
                            filteredData.map((enrollment) => (
                                <tr key={enrollment.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                {enrollment.profiles?.avatar_url ? (
                                                    <img src={enrollment.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">
                                                    {enrollment.profiles?.full_name || 'Unknown'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {enrollment.student_email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono text-slate-600 font-medium">
                                            {enrollment.student_registration_number || enrollment.profiles?.registration_number || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                        <div>
                                            <p className="text-sm text-slate-900 font-medium">{enrollment.course_code || '-'}</p>
                                            <p className="text-xs text-slate-500 capitalize">{enrollment.program_level || '-'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1",
                                            enrollment.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                                                enrollment.status === 'rejected' ? "bg-red-100 text-red-700" :
                                                    "bg-amber-100 text-amber-700"
                                        )}>
                                            {enrollment.status === 'approved' && <Check className="w-3 h-3" />}
                                            {enrollment.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                            {enrollment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => onViewProfile(enrollment)}
                                            className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 font-bold text-xs transition-all shadow-sm"
                                        >
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <User className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No students found matching your filters.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-slate-400 text-center">
                Showing {filteredData.length} of {data.length} students
            </p>
        </div>
    );
}
