'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';
import RubricComponent from '@/components/RubricComponent';

export default function StudentRubricPage({ params }: { params: Promise<{ assignmentId: string }> }) {
    const { assignmentId } = use(params);
    const [assignment, setAssignment] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchRubric = async () => {
            const { data, error } = await supabase
                .from('assignments')
                .select('rubric, max_points, title')
                .eq('id', assignmentId)
                .single();

            if (data) setAssignment(data);
            setLoading(false);
        };
        fetchRubric();
    }, [assignmentId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!assignment?.rubric) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-500">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p>No rubric available for this assignment.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">{assignment.title}</h1>
                    <p className="text-slate-500">Grading Rubric</p>
                </div>

                <RubricComponent
                    rubric={assignment.rubric}
                    isEditable={false} // Read-only
                    maxPoints={assignment.max_points}
                />
            </div>
        </div>
    );
}
