'use client';

import { useState } from 'react';

import { SupervisorReport } from '@/types/practicum';
import { submitSupervisorReport } from '@/app/actions/practicum';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    PracticumObservationGuide,
    TEACHING_PRACTICE_OBSERVATION_GUIDE,
    INDUSTRIAL_ATTACHMENT_OBSERVATION_GUIDE
} from '@schologic/practicum-core';

interface ReportFormProps {
    enrollmentId: string;
    studentName: string;
    practicumTitle: string;
    templateId: string;
    signature: string;
    expiresAt: number;
    customTemplate?: PracticumObservationGuide;
}

export default function ReportForm({ enrollmentId, studentName, practicumTitle, templateId, signature, expiresAt, customTemplate }: ReportFormProps) {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial State based on template (with validation)
    const defaultTemplate = templateId === 'industrial_attachment' ? INDUSTRIAL_ATTACHMENT_OBSERVATION_GUIDE : TEACHING_PRACTICE_OBSERVATION_GUIDE;
    // Use custom template if it matches the expected structure, else fallback
    const template: PracticumObservationGuide = (customTemplate && Array.isArray(customTemplate.assessment_areas)) ? customTemplate : defaultTemplate;

    // Transform guide structure to flat report structure for state
    // We map assessment_areas -> sections, and attributes -> items
    const [formState, setFormState] = useState<SupervisorReport>({
        submitted_at: '',
        sections: template.assessment_areas.map((area, idx) => ({
            id: `area-${idx}`,
            title: area.category,
            items: area.attributes.map(attr => ({
                id: attr.id,
                label: attr.attribute || attr.competency || 'Unknown Criteria',
                type: 'rating',
                value: 0,
                max_score: 5 // Default max score for observation guide items
            }))
        })),
        feedback: '',
        recommendation: ''
    });

    const handleRatingChange = (sectionIdx: number, itemIdx: number, val: number) => {
        const newState = { ...formState };
        newState.sections[sectionIdx].items[itemIdx].value = val;
        setFormState(newState);
    };

    const handleTextChange = (field: 'feedback' | 'recommendation', val: string) => {
        setFormState({ ...formState, [field]: val });
    };

    // Derived Score
    const totalScore = formState.sections.reduce((acc, section) => {
        return acc + section.items.reduce((secAcc, item) => secAcc + (typeof item.value === 'number' ? item.value : 0), 0);
    }, 0);

    const maxScore = template.total_score || 50; // Default if missing

    const handleSubmit = async () => {
        if (!confirm("Are you sure you want to submit this evaluation? This action cannot be undone.")) return;

        try {
            setIsSubmitting(true);
            setError(null);

            const finalReport: SupervisorReport = {
                ...formState,
                submitted_at: new Date().toISOString(),
                total_score: totalScore,
                max_total_score: maxScore
            };

            const result = await submitSupervisorReport(enrollmentId, finalReport, signature, expiresAt);

            if (!result.success) throw new Error(result.error);
            setIsSuccess(true);

        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-emerald-50 p-12 rounded-3xl border border-emerald-100 text-center animate-fade-in">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-black text-emerald-900 mb-2">Report Submitted!</h1>
                <p className="text-emerald-700 text-lg">Thank you for evaluating {studentName}.</p>
                <div className="mt-8 p-4 bg-white/50 rounded-xl border border-emerald-100/50 max-w-sm mx-auto">
                    <p className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-1">Final Score</p>
                    <p className="text-4xl font-black text-emerald-600">{totalScore} <span className="text-lg text-emerald-400">/ {maxScore}</span></p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Grading Instructions / Context */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-blue-900 shadow-sm">
                <div className="flex gap-4">
                    <div className="p-2 bg-blue-100 rounded-full h-fit shrink-0 text-blue-600">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">Important: This Assessment is Critical</h3>
                        <p className="text-sm leading-relaxed text-blue-800 mb-3">
                            Your feedback directly impacts the student's final grade. This evaluation accounts for <strong className="font-black text-blue-950">50% of the total course marks</strong>.
                        </p>
                        <p className="text-xs text-blue-700 font-medium">
                            Please provide honest, detailed ratings for each criteria. You may also include specific comments for each section in the general feedback area below.
                        </p>
                    </div>
                </div>
            </div>

            {/* Score Sticky Header (Mobile friendly) */}
            <div className="sticky top-4 z-10 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 uppercase">Assessment Score</span>
                <span className={cn("text-2xl font-black", totalScore > (maxScore * 0.7) ? "text-emerald-600" : "text-slate-700")}>
                    {totalScore} <span className="text-sm text-slate-400">/ {maxScore}</span>
                </span>
            </div>

            {/* Render Template Sections based on PracticumObservationGuide structure */}
            {template.assessment_areas.map((area, sIdx) => (
                <div key={sIdx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">{area.category}</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 w-1/3 min-w-[300px] font-bold text-slate-600">Evaluation Criteria & Description</th>
                                    {/* Render Grading Scale Columns (5 to 1) */}
                                    {[5, 4, 3, 2, 1].map((score) => (
                                        <th key={score} className="p-2 text-center w-[100px] border-l border-slate-100">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-bold text-slate-700">{score}</span>
                                                <span className="text-[9px] font-medium text-slate-400 uppercase leading-tight px-1 text-center">
                                                    {template.grading_key[String(score)]?.split('(')[0].trim() || ''}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {area.attributes.map((attr, iIdx) => {
                                    // Find current value in formState
                                    const currentVal = formState.sections[sIdx]?.items[iIdx]?.value;

                                    return (
                                        <tr key={attr.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-4 border-r border-slate-50 group-hover:border-slate-100">
                                                <p className="font-bold text-slate-700 text-base mb-1">
                                                    {attr.attribute || attr.competency}
                                                </p>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    {attr.description}
                                                </p>
                                            </td>
                                            {[5, 4, 3, 2, 1].map((val) => (
                                                <td key={val} className="p-2 text-center border-l border-slate-50 group-hover:border-slate-100 relative align-middle">
                                                    <label className="cursor-pointer flex items-center justify-center w-full h-full min-h-[60px]">
                                                        <input
                                                            type="radio"
                                                            name={`section-${sIdx}-item-${iIdx}`}
                                                            checked={currentVal === val}
                                                            onChange={() => handleRatingChange(sIdx, iIdx, val)}
                                                            className="peer sr-only"
                                                        />
                                                        <div className={cn(
                                                            "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center",
                                                            currentVal === val
                                                                ? "border-emerald-500 bg-emerald-500 shadow-sm scale-125"
                                                                : "border-slate-200 bg-transparent group-hover:border-slate-300 peer-checked:border-emerald-500 peer-checked:bg-emerald-500"
                                                        )}>
                                                            {currentVal === val && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                                        </div>
                                                    </label>
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {/* Qualitative Feedback */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">FINAL REMARKS</h3>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">General Feedback / Strengths & Weaknesses</label>
                    <textarea
                        value={formState.feedback}
                        onChange={(e) => handleTextChange('feedback', e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 min-h-[120px]"
                        placeholder="Please provide additional comments..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Recommendation</label>
                    <textarea
                        value={formState.recommendation}
                        onChange={(e) => handleTextChange('recommendation', e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 min-h-[80px]"
                        placeholder="E.g. Recommended for certification..."
                    />
                </div>
            </div>

            <div className="pt-4 pb-12">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {isSubmitting ? 'Submitting Report...' : 'Submit Final Report'}
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                    By submitting this form, you certify that this assessment is accurate.
                </p>
            </div>
        </div>
    );
}
