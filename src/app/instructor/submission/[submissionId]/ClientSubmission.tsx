'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import ReportView from '@/components/ReportView';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ClientSubmission({ submissionId }: { submissionId: string }) {
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchSub = async () => {
            const { data, error } = await supabase
                .from('submissions')
                .select('*, profiles(full_name), classes(id, name)')
                .eq('id', submissionId)
                .single();

            if (data) setSubmission(data);
            setLoading(false);
        };
        fetchSub();
    }, [submissionId]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Report...</div>;
    if (!submission) return <div className="p-8 text-center text-red-500">Submission not found.</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Link href={`/instructor/class/${submission.classes?.id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Class
                </Link>

                <div className="mb-8">
                    <h1 className="text-xl md:text-3xl font-bold text-slate-800">Submission Analysis</h1>
                    <div className="flex items-center gap-2 mt-2 text-slate-600">
                        <span className="font-semibold">{submission.profiles?.full_name}</span>
                        <span>&bull;</span>
                        <span>{submission.classes?.name}</span>
                        <span>&bull;</span>
                        <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                <ReportView
                    score={submission.ai_score}
                    reportData={submission.report_data}
                />
            </div>
        </div>
    );
}
