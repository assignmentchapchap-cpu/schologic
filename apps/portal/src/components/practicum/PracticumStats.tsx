'use strict';

import { Card } from '@/components/ui/Card';
import { Clock, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from "@schologic/database";

type PracticumEnrollment = Database['public']['Tables']['practicum_enrollments']['Row'];
type Practicum = Database['public']['Tables']['practicums']['Row'];

interface PracticumStatsProps {
    enrollment: PracticumEnrollment;
    practicum: Practicum;
    logs: Database['public']['Tables']['practicum_logs']['Row'][];
}

export default function PracticumStats({ enrollment, practicum, logs }: PracticumStatsProps) {
    // 1. Log Progress
    // Calculate total days between start/end
    const start = new Date(practicum.start_date);
    const end = new Date(practicum.end_date);
    const today = new Date();

    // Total duration in days
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    // Expected logs (simple approximation for now - everyday)
    // TODO: Use log_interval 'weekly' vs 'daily' logic from core
    const totalExpectedLogs = practicum.log_interval === 'weekly'
        ? Math.ceil(totalDays / 7)
        : totalDays;

    const logsSubmitted = logs.filter(l => (l as any).submission_status !== 'draft').length;
    const progressPercent = Math.min(100, Math.round((logsSubmitted / totalExpectedLogs) * 100));

    // 2. Time Remaining
    const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isCompleted = daysRemaining < 0;

    // 3. Verification Status
    const verifiedLogs = logs.filter(l => l.supervisor_status === 'verified').length;
    // Ensure we only count pending if it's actually submitted
    const pendingLogs = logs.filter(l => (l as any).submission_status !== 'draft' && l.supervisor_status === 'pending').length;
    const rejectedLogs = logs.filter(l => l.supervisor_status === 'rejected').length;

    // Warning if many pending (e.g. > 5) or any rejected
    const verificationStatus = rejectedLogs > 0
        ? 'action_needed'
        : pendingLogs > 5
            ? 'delayed'
            : 'good';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in delay-100">
            {/* Card 1: Log Progress */}
            <Card hoverEffect className="group relative overflow-hidden text-center md:text-left">
                <div className="flex flex-col h-full justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logbook Progress</p>
                            <h3 className="text-lg font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                                {logsSubmitted} <span className="text-slate-400 text-sm font-medium">/ {totalExpectedLogs} entries</span>
                            </h3>
                        </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </Card>

            {/* Card 2: Time Remaining */}
            <Card hoverEffect className="group text-center md:text-left">
                <div className="flex flex-col h-full justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Remaining</p>
                            <h3 className="text-lg font-black text-slate-800 group-hover:text-blue-700 transition-colors">
                                {isCompleted ? 'Completed' : `${daysRemaining} Days`}
                            </h3>
                        </div>
                    </div>
                    <div className="flex gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-lg">
                        <span>End Date:</span>
                        <span className="font-bold text-slate-700">{end.toLocaleDateString()}</span>
                    </div>
                </div>
            </Card>

            {/* Card 3: Verification Health */}
            <Card hoverEffect className={cn(
                "group text-center md:text-left border transition-all",
                verificationStatus === 'action_needed' ? "border-red-100 bg-red-50/10" :
                    verificationStatus === 'delayed' ? "border-amber-100 bg-amber-50/10" : ""
            )}>
                <div className="flex flex-col h-full justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2.5 rounded-xl transition-colors group-hover:text-white",
                            verificationStatus === 'action_needed' ? "bg-red-100 text-red-600 group-hover:bg-red-600" :
                                verificationStatus === 'delayed' ? "bg-amber-100 text-amber-600 group-hover:bg-amber-600" :
                                    "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600"
                        )}>
                            {verificationStatus === 'action_needed' ? <AlertCircle className="w-5 h-5" /> :
                                verificationStatus === 'delayed' ? <Clock className="w-5 h-5" /> :
                                    <CheckCircle2 className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supervisor Status</p>
                            <h3 className={cn(
                                "text-lg font-black text-slate-800 transition-colors",
                                verificationStatus === 'action_needed' ? "group-hover:text-red-700" :
                                    verificationStatus === 'delayed' ? "group-hover:text-amber-700" :
                                        "group-hover:text-emerald-700"
                            )}>
                                {verifiedLogs} Verified
                            </h3>
                        </div>
                    </div>

                    <div className="flex gap-3 text-xs font-bold">
                        <span className="text-slate-400">{pendingLogs} Pending</span>
                        {rejectedLogs > 0 && <span className="text-red-500">{rejectedLogs} Rejected</span>}
                    </div>
                </div>
            </Card>
        </div>
    );
}
