'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@schologic/database';
import {
    TEACHING_PRACTICE_TEMPLATE,
    INDUSTRIAL_ATTACHMENT_TEMPLATE,
    LOGS_ASSESSMENT_RUBRIC,
    TEACHING_PRACTICE_OBSERVATION_GUIDE,
    INDUSTRIAL_ATTACHMENT_OBSERVATION_GUIDE,
    PRACTICUM_REPORT_SCORE_SHEET,
    generateTimeline
} from '@schologic/practicum-core';
import { ArrowLeft, ArrowRight, Check, Calendar, Settings, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

// Generate unique codes
const generateCode = (prefix: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${code}`;
};

type LogTemplateType = 'teaching_practice' | 'industrial_attachment' | 'custom';
type LogInterval = 'daily' | 'weekly';

interface FormData {
    // Step 1: Basic Info
    title: string;
    startDate: string;
    endDate: string;

    // Step 2: Configuration
    logTemplate: LogTemplateType;
    logInterval: LogInterval;
    geolocationRequired: boolean;
    finalReportRequired: boolean;
    autoApprove: boolean;
}

const STEPS = [
    { id: 1, title: 'Basic Info', icon: Calendar },
    { id: 2, title: 'Configuration', icon: Settings },
    { id: 3, title: 'Review & Create', icon: FileText },
];

export default function NewPracticumPage() {
    const router = useRouter();
    const supabase = createClient();
    const { showToast } = useToast();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<FormData>({
        title: '',
        startDate: '',
        endDate: '',
        logTemplate: 'industrial_attachment',
        logInterval: 'weekly',
        geolocationRequired: false,
        finalReportRequired: true,
        autoApprove: false,
    });

    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.title.trim()) newErrors.title = 'Title is required';
            if (!formData.startDate) newErrors.startDate = 'Start date is required';
            if (!formData.endDate) newErrors.endDate = 'End date is required';
            if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
                newErrors.endDate = 'End date must be after start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Get the appropriate rubrics based on template
            const supervisorGuide = formData.logTemplate === 'teaching_practice'
                ? TEACHING_PRACTICE_OBSERVATION_GUIDE
                : INDUSTRIAL_ATTACHMENT_OBSERVATION_GUIDE;

            const { data, error } = await supabase.from('practicums').insert({
                instructor_id: user.id,
                title: formData.title.trim(),
                cohort_code: generateCode('PC'),
                invite_code: generateCode('INV'),
                start_date: formData.startDate,
                end_date: formData.endDate,
                log_interval: formData.logInterval,
                log_template: formData.logTemplate,
                custom_template: formData.logTemplate === 'custom' ? {} : null,
                logs_rubric: LOGS_ASSESSMENT_RUBRIC as any,
                supervisor_report_template: supervisorGuide as any,
                student_report_template: PRACTICUM_REPORT_SCORE_SHEET as any,
                geolocation_required: formData.geolocationRequired,
                final_report_required: formData.finalReportRequired,
                auto_approve: formData.autoApprove,
                grading_config: { logs_weight: 40, supervisor_weight: 50, report_weight: 60 },
                timeline: generateTimeline(formData.startDate, formData.endDate, formData.logInterval as any, formData.title.trim()) as any,
            }).select().single();

            if (error) throw error;

            showToast('Practicum cohort created successfully!', 'success');
            router.push(`/instructor/practicum/${data.id}`);
        } catch (err) {
            console.error('Error creating practicum:', err);
            showToast('Failed to create practicum. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Back</span>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Create New Practicum</h1>
                    <p className="text-slate-500 mt-1">Set up a field attachment or teaching practice cohort</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isComplete = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center gap-2 ${isActive ? 'text-emerald-600' : isComplete ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-emerald-100 text-emerald-600' :
                                        isComplete ? 'bg-emerald-500 text-white' : 'bg-slate-100'
                                        }`}>
                                        {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span className={`hidden md:block text-sm font-medium ${isActive ? 'text-slate-900' : ''}`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div className={`w-12 md:w-24 h-0.5 mx-2 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Practicum Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    placeholder="e.g., 2026 Semester 1 - TP Cohort"
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => updateField('startDate', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.startDate ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                                    />
                                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        End Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => updateField('endDate', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.endDate ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                                    />
                                    {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Configuration */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Template Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Log Template
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { id: 'teaching_practice', name: 'Teaching Practice', desc: 'For student teachers' },
                                        { id: 'industrial_attachment', name: 'Industrial Attachment', desc: 'For workplace attachments' },
                                    ].map((template) => (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => updateField('logTemplate', template.id as LogTemplateType)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.logTemplate === template.id
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <p className="font-bold text-slate-900">{template.name}</p>
                                            <p className="text-sm text-slate-500">{template.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Log Frequency */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Log Submission Frequency
                                </label>
                                <div className="flex gap-3">
                                    {[
                                        { id: 'daily', name: 'Daily' },
                                        { id: 'weekly', name: 'Weekly' },
                                        { id: 'monthly', name: 'Monthly' },
                                    ].map((freq) => (
                                        <button
                                            key={freq.id}
                                            type="button"
                                            onClick={() => updateField('logInterval', freq.id as LogInterval)}
                                            className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${formData.logInterval === freq.id
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            {freq.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <div>
                                        <p className="font-bold text-slate-900">Auto-approve Enrollments</p>
                                        <p className="text-sm text-slate-500">Students join immediately without approval</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateField('autoApprove', !formData.autoApprove)}
                                        className={`w-12 h-7 rounded-full transition-colors ${formData.autoApprove ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${formData.autoApprove ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group">
                                    <div>
                                        <p className="font-bold text-slate-900">Require Geolocation</p>
                                        <p className="text-sm text-slate-500">Verify student location during log submission</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateField('geolocationRequired', !formData.geolocationRequired)}
                                        className={`w-12 h-7 rounded-full transition-colors ${formData.geolocationRequired ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${formData.geolocationRequired ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group">
                                    <div>
                                        <p className="font-bold text-slate-900">Require Final Report</p>
                                        <p className="text-sm text-slate-500">Students must submit a final practicum report</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateField('finalReportRequired', !formData.finalReportRequired)}
                                        className={`w-12 h-7 rounded-full transition-colors ${formData.finalReportRequired ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${formData.finalReportRequired ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg">Review Your Practicum</h3>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500">Title</p>
                                        <p className="font-bold text-slate-900">{formData.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Duration</p>
                                        <p className="font-bold text-slate-900">
                                            {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Template</p>
                                        <p className="font-bold text-slate-900 capitalize">{formData.logTemplate.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Log Frequency</p>
                                        <p className="font-bold text-slate-900 capitalize">{formData.logInterval}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {formData.autoApprove && (
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Auto-approve</span>
                                    )}
                                    {formData.geolocationRequired && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Geolocation</span>
                                    )}
                                    {formData.finalReportRequired && (
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Final Report</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <p className="text-emerald-800 text-sm">
                                    <strong>Default rubrics will be applied:</strong> Logs (40 marks), Supervisor Assessment (50 marks), and Student Report (60 marks). You can customize these after creation.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center gap-2 px-5 py-3 text-slate-600 hover:text-slate-900 font-bold transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg"
                            >
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Create Practicum
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
