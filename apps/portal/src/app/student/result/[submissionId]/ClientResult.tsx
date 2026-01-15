'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import ReportView from '@/components/ReportView';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function StudentResult({ submissionId }: { submissionId: string }) {
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchSub = async () => {
            // Students can only see their own submissions via RLS, 
            // so we just query by ID. 
            const { data, error } = await supabase
                .from('submissions')
                .select('*, classes(name)')
                .eq('id', submissionId)
                .single();

            if (data) setSubmission(data);
            setLoading(false);
        };
        fetchSub();
    }, [submissionId]);

    if (loading) return <div className="p-8 text-center text-slate-500">Retrieving Analysis Report...</div>;
    if (!submission) return <div className="p-8 text-center text-red-500">Submission not found or access denied.</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Link href={`/student/assignment/${submission.assignment_id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Assignment
                    </Link>
                    <span className="text-slate-400 text-sm font-mono">
                        ID: {submissionId.split('-')[0]}...
                    </span>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Analysis Results</h1>
                    <p className="text-slate-500">
                        Class: <span className="font-semibold text-emerald-600">{submission.classes?.name}</span>
                    </p>
                </div>

                <ReportView
                    score={submission.ai_score}
                    reportData={submission.report_data}
                    readOnly
                />
            </div>
        </div>
    );
}
