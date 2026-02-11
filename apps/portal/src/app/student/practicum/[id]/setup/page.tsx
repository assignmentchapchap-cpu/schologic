
'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from "@schologic/database";
import {
    FileText,
    Home,
    User as UserIcon,
    MapPin,
    Clock,
    Save,
    Send,
    ArrowLeft,
    Check,
    CheckCircle2,
    Award,
    GraduationCap,
    Phone,
    Mail,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import { useNavigationGuard } from '@/context/NavigationGuardContext';
import { cn } from '@/lib/utils';

// --- Types & Constants ---

interface SetupStep {
    id: string;
    title: string;
    icon: any;
}

const ALL_STEPS: SetupStep[] = [
    { id: 'profile', title: 'Profile', icon: UserIcon },
    { id: 'academic', title: 'Academic', icon: GraduationCap },
    { id: 'workplace', title: 'Workplace', icon: Home },
    { id: 'supervisor', title: 'Supervisor', icon: UserIcon },
    { id: 'schedule', title: 'Schedule', icon: Clock },
    { id: 'location', title: 'Location', icon: MapPin },
];

export default function PracticumSetupPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: practicumId } = use(params);
    const { user } = useUser();
    const { showToast } = useToast();
    const router = useRouter();
    const supabase = createClient();
    const { blockNavigation, allowNavigation } = useNavigationGuard();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // We treat sections as steps for the progress bar
    const [activeSection, setActiveSection] = useState('profile');
    const [status, setStatus] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Practicum Settings
    const [settings, setSettings] = useState({
        auto_approve: false,
        geolocation_required: false,
        title: ''
    });

    // Form State
    const [formData, setFormData] = useState({
        // Profile Data (Read-only/Pre-filled or Input)
        student_email: '',
        student_registration_number: '',
        student_phone: '',

        // Academic Data
        program_level: '', // 'postgrad', 'degree', 'diploma', 'artisan'
        course_code: '',

        academic_data: {
            institution: '',
            course: '',
            year_of_study: '',
            // student_id_number removed/deprecated in favor of top-level student_registration_number
        },
        workplace_data: {
            company_name: '',
            department: '',
            address: '',
            contact_person: '',
            contact_email: ''
        },
        supervisor_data: {
            name: '',
            designation: '',
            email: '',
            phone: ''
        },
        schedule: {
            days: [] as string[],
            start_time: '08:00',
            end_time: '17:00'
        },
        location_coords: {
            lat: null as number | null,
            lng: null as number | null,
            accuracy: null as number | null
        }
    });

    // --- Effects ---

    useEffect(() => {
        if (user && practicumId) {
            fetchInitialData();
        }
    }, [user, practicumId]);

    useEffect(() => {
        if (isDirty) {
            blockNavigation('practicum_setup', "You have unsaved progress in your registration. Save before leaving?");
        } else {
            allowNavigation('practicum_setup');
        }
    }, [isDirty]);

    // --- Data Fetching ---

    const fetchInitialData = async () => {
        try {
            setLoading(true);

            // 1. Fetch User Profile for Pre-filling
            const { data: profile } = await supabase
                .from('profiles')
                .select('email, registration_number')
                .eq('id', user!.id)
                .single();

            // Pre-fill read only fields
            setFormData(prev => ({
                ...prev,
                student_email: user!.email || '',
                student_registration_number: profile?.registration_number || '',
                // If they have a phone in profile (custom field I assumed), use it, else empty
                // student_phone: profile?.phone || '' 
            }));

            // 2. Fetch Practicum Meta
            const { data: prac, error: pracErr } = await supabase
                .from('practicums')
                .select('title, auto_approve, geolocation_required')
                .eq('id', practicumId)
                .single();

            if (pracErr) throw pracErr;
            setSettings({
                title: prac.title,
                auto_approve: !!prac.auto_approve,
                geolocation_required: !!prac.geolocation_required
            });

            // 3. Fetch Enrollment Data
            const studentId = user?.id; // Guarded above in useEffect, but safe check here
            if (studentId) {
                const { data: enroll, error: enrollErr } = await supabase
                    .from('practicum_enrollments')
                    .select('*')
                    .eq('practicum_id', practicumId)
                    .eq('student_id', studentId)
                    .single();

                if (enrollErr && enrollErr.code !== 'PGRST116') throw enrollErr;

                if (enroll) {
                    setStatus(enroll.status);

                    if (enroll.status === 'approved') {
                        // If approved, shouldn't be here, redirect
                        router.replace(`/student/practicum/${practicumId}`);
                        return;
                    }

                    setFormData(prev => ({
                        ...prev,
                        // Top level fields
                        student_email: enroll.student_email || prev.student_email,
                        student_phone: enroll.student_phone || '',
                        student_registration_number: enroll.student_registration_number || prev.student_registration_number,
                        course_code: enroll.course_code || '',
                        program_level: enroll.program_level || '',

                        academic_data: { ...prev.academic_data, ...(enroll.academic_data as any) },
                        workplace_data: { ...prev.workplace_data, ...(enroll.workplace_data as any) },
                        supervisor_data: { ...prev.supervisor_data, ...(enroll.supervisor_data as any) },
                        schedule: { ...prev.schedule, ...(enroll.schedule as any), days: (enroll.schedule as any)?.days || [] },
                        location_coords: { ...prev.location_coords, ...(enroll.location_coords as any) }
                    }));
                }
            }
        } catch (error) {
            console.error("Error loading setup data", error);
            showToast("Failed to load registration data", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---

    const handleFieldChange = (section: string, field: string, value: any) => {
        setIsDirty(true);
        // Clear error when field changes
        // If section is empty, key is just 'field', else 'section.field'
        const errorKey = section ? `${section}.${field}` : field;

        if (errors[errorKey]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[errorKey];
                return next;
            });
        }

        setFormData(prev => {
            if (!section) {
                // Top-level update
                return {
                    ...prev,
                    [field]: value
                };
            }
            // Nested update
            return {
                ...prev,
                [section]: {
                    ...(prev as any)[section],
                    [field]: value
                }
            };
        });
    };

    const validateSection = (sectionId: string): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (sectionId === 'profile') {
            if (!formData.student_phone.trim()) newErrors['student_phone'] = 'Phone number is required';
            else if (!/^\d{9}$/.test(formData.student_phone.trim())) newErrors['student_phone'] = 'Phone must be exactly 9 digits';

            if (!formData.student_registration_number.trim()) {
                // If it's missing from profile, we might warn or block. 
                // For now, let's block and tell them to contact admin/update profile? 
                // User said "uneditable field though so that they initiate the update process if necessary"
                // So if it's empty, they are stuck? Or can we assume it might be empty safely?
                // Let's assume it's valuable.
                if (!formData.student_registration_number) newErrors['student_registration_number'] = 'Registration number missing from profile';
            }
        }

        if (sectionId === 'academic') {
            const data = formData.academic_data;
            if (!formData.program_level) newErrors['program_level'] = 'Program level is required';
            if (!formData.course_code.trim()) newErrors['course_code'] = 'Course code is required';

            if (!data.institution.trim()) newErrors['academic_data.institution'] = 'Institution is required';
            if (!data.course.trim()) newErrors['academic_data.course'] = 'Course name is required';
            if (!data.year_of_study.trim()) newErrors['academic_data.year_of_study'] = 'Year of study is required';
        }

        if (sectionId === 'workplace') {
            const data = formData.workplace_data;
            if (!data.company_name.trim()) newErrors['workplace_data.company_name'] = 'Company name is required';
            if (!data.department.trim()) newErrors['workplace_data.department'] = 'Department is required';
            if (!data.address.trim()) newErrors['workplace_data.address'] = 'Address is required';
        }

        if (sectionId === 'supervisor') {
            const data = formData.supervisor_data;
            if (!data.name.trim()) newErrors['supervisor_data.name'] = 'Supervisor name is required';
            if (!data.designation.trim()) newErrors['supervisor_data.designation'] = 'Designation is required';
            if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors['supervisor_data.email'] = 'Valid email is required';
            if (data.phone.trim()) {
                if (!/^\d{9}$/.test(data.phone.trim())) newErrors['supervisor_data.phone'] = 'Phone must be exactly 9 digits';
            } else {
                newErrors['supervisor_data.phone'] = 'Phone number is required';
            }
        }

        if (sectionId === 'schedule') {
            const data = formData.schedule;
            if (data.days.length === 0) newErrors['schedule.days'] = 'Select at least one work day';
            if (!data.start_time) newErrors['schedule.start_time'] = 'Start time is required';
            if (!data.end_time) newErrors['schedule.end_time'] = 'End time is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
            showToast("Please fill in all required fields", "error");
        }

        return isValid;
    };

    const handleSaveProgress = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('practicum_enrollments')
                .update({
                    // Top level fields
                    student_email: formData.student_email,
                    student_phone: formData.student_phone,
                    student_registration_number: formData.student_registration_number,
                    course_code: formData.course_code,
                    program_level: formData.program_level,

                    academic_data: formData.academic_data,
                    workplace_data: formData.workplace_data,
                    supervisor_data: formData.supervisor_data,
                    schedule: formData.schedule,
                    location_coords: formData.location_coords
                })
                .eq('practicum_id', practicumId)
                .eq('student_id', user.id);

            if (error) throw error;
            setIsDirty(false);
            showToast("Progress saved successfully", "success");
        } catch (error) {
            console.error("Save error", error);
            showToast("Failed to save progress", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        setSubmitting(true);
        try {
            // Validate all sections before final SUBMIT (not save)
            const sectionsStart = ['profile', 'academic', 'workplace', 'supervisor', 'schedule'];
            for (const section of sectionsStart) {
                if (!validateSection(section)) {
                    setActiveSection(section);
                    return;
                }
            }

            // Final validation (especially geolocation if required)
            if (settings.geolocation_required && !formData.location_coords.lat) {
                setActiveSection('location');
                throw new Error("Location coordinates are required for this practicum.");
            }

            const newStatus = settings.auto_approve ? 'approved' : 'pending';

            const { error } = await supabase
                .from('practicum_enrollments')
                .update({
                    // Top level fields
                    student_email: formData.student_email,
                    student_phone: formData.student_phone,
                    student_registration_number: formData.student_registration_number,
                    course_code: formData.course_code,
                    program_level: formData.program_level,

                    academic_data: formData.academic_data,
                    workplace_data: formData.workplace_data,
                    supervisor_data: formData.supervisor_data,
                    schedule: formData.schedule,
                    location_coords: formData.location_coords,
                    status: newStatus,
                    approved_at: newStatus === 'approved' ? new Date().toISOString() : null
                })
                .eq('practicum_id', practicumId)
                .eq('student_id', user.id);

            if (error) throw error;

            setIsDirty(false);
            allowNavigation('practicum_setup');

            if (settings.auto_approve) {
                showToast("Registration completed! Redirecting to dashboard...", "success");
                setTimeout(() => router.push(`/student/practicum/${practicumId}`), 1500);
            } else {
                showToast("Application submitted for approval", "success");
                setTimeout(() => router.push(`/student/practicums`), 1500);
            }
        } catch (error: any) {
            console.error("Submit error", error);
            showToast(error.message || "Failed to submit application", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser", "error");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                handleFieldChange('location_coords', 'lat', position.coords.latitude);
                handleFieldChange('location_coords', 'lng', position.coords.longitude);
                handleFieldChange('location_coords', 'accuracy', position.coords.accuracy);
                showToast("Location captured!", "success");
            },
            (error) => {
                showToast("Unable to retrieve your location", "error");
            }
        );
    };

    // --- Render Logic ---

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading Registration...</p>
        </div>
    );

    // --- PENDING STATE VIEW ---
    if (status === 'pending') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
                    <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-3">Application Under Review</h1>
                    <p className="text-slate-500 mb-8">
                        Your registration for <strong>{settings.title}</strong> has been submitted and is waiting for instructor approval. You will be notified once admitted.
                    </p>
                    <button
                        onClick={() => router.push('/student/dashboard')}
                        className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                    >
                        Back to Dashboard
                    </button>
                    <p className="text-xs text-slate-400 mt-6">
                        Need to make changes? Contact your instructor to unlock your application.
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <UserIcon className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-3">Application Declined</h1>
                    <p className="text-slate-500 mb-8">
                        Your application for <strong>{settings.title}</strong> was not approved by the instructor.
                    </p>
                    <button
                        onClick={() => router.push('/student/dashboard')}
                        className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                    >
                        Back to Dashboard
                    </button>
                    <p className="text-xs text-slate-400 mt-6">
                        You can delete this application from your dashboard.
                    </p>
                </div>
            </div>
        );
    }

    const visibleSteps = ALL_STEPS.filter(s => s.id !== 'location' || settings.geolocation_required);
    const activeIndex = visibleSteps.findIndex(s => s.id === activeSection);

    const goToNext = () => {
        if (activeIndex < visibleSteps.length - 1) {
            // Validate current step before moving
            if (validateSection(activeSection)) {
                setActiveSection(visibleSteps[activeIndex + 1].id);
            }
        }
    };

    const goToPrev = () => {
        if (activeIndex > 0) {
            setActiveSection(visibleSteps[activeIndex - 1].id);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Back to Dashboard</span>
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Complete Registration</h1>
                            <p className="text-slate-500 mt-1">
                                {settings.title || 'Practicum Cohort'}
                            </p>
                        </div>
                        <button
                            onClick={handleSaveProgress}
                            disabled={saving || !isDirty}
                            className="text-emerald-600 font-bold text-sm bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Save Progress
                        </button>
                    </div>
                </div>

                {/* Progress Steps (Instructor Style) */}
                <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 shadow-sm border border-slate-200 overflow-x-auto">
                    {visibleSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = activeSection === step.id;
                        const isComplete = index < activeIndex;

                        return (
                            <div key={step.id} className="flex items-center min-w-fit px-2">
                                <div className={cn(
                                    "flex items-center gap-2",
                                    isActive ? 'text-emerald-600' : isComplete ? 'text-emerald-500' : 'text-slate-400'
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors shrink-0",
                                        isActive ? 'bg-emerald-100 text-emerald-600' :
                                            isComplete ? 'bg-emerald-500 text-white' : 'bg-slate-100'
                                    )}>
                                        {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span className={cn(
                                        "hidden md:block text-sm font-medium whitespace-nowrap",
                                        isActive ? 'text-slate-900' : ''
                                    )}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < visibleSteps.length - 1 && (
                                    <div className={cn(
                                        "w-8 md:w-16 h-0.5 mx-2 md:mx-4 shrink-0",
                                        index < activeIndex ? 'bg-emerald-500' : 'bg-slate-200'
                                    )} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[400px]">

                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">Student Profile</h2>
                            <p className="text-sm text-slate-500">Please confirm your personal details. Some fields are read-only.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Email Address" error={undefined}>
                                    <input
                                        className="form-input-clean bg-slate-100 text-slate-500 cursor-not-allowed"
                                        value={formData.student_email}
                                        readOnly
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Sourced from your account</p>
                                </InputGroup>

                                <InputGroup label="Registration Number" error={errors['student_registration_number']}>
                                    <input
                                        className="form-input-clean bg-slate-100 text-slate-500 cursor-not-allowed"
                                        value={formData.student_registration_number || 'Not Set in Profile'}
                                        readOnly
                                    />
                                    {/* Link to profile settings if missing? */}
                                    {!formData.student_registration_number && (
                                        <p className="text-xs text-red-500 mt-1">
                                            Missing! Please update your <a href="/student/settings" className="underline">Profile Settings</a>.
                                        </p>
                                    )}
                                </InputGroup>

                                <div className="md:col-span-2">
                                    <InputGroup label="Phone Number" error={errors['student_phone']}>
                                        <div className="flex items-center">
                                            <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg px-3 py-3 text-slate-500 font-bold text-sm select-none">
                                                +254
                                            </span>
                                            <input
                                                className="form-input-clean rounded-l-none pl-3"
                                                placeholder="7XX XXX XXX (9 digits)"
                                                value={formData.student_phone}
                                                onChange={(e) => {
                                                    // Allow only numbers
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 9) handleFieldChange('', 'student_phone', val);
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">Enter the 9 digits after the country code (e.g., 712345678)</p>
                                    </InputGroup>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Academic Section */}
                    {activeSection === 'academic' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">Academic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Program Level" error={errors['program_level']}>
                                    <select
                                        className="form-input-clean"
                                        value={formData.program_level}
                                        onChange={(e) => handleFieldChange('', 'program_level', e.target.value)}
                                    >
                                        <option value="">Select Level...</option>
                                        <option value="postgrad">Postgraduate / Masters</option>
                                        <option value="degree">Undergraduate Degree</option>
                                        <option value="diploma">Diploma</option>
                                        <option value="artisan">Certificate / Artisan</option>
                                    </select>
                                </InputGroup>

                                <InputGroup label="Course Code" error={errors['course_code']}>
                                    <input
                                        className="form-input-clean"
                                        placeholder="e.g. COMP 400"
                                        value={formData.course_code}
                                        onChange={(e) => handleFieldChange('', 'course_code', e.target.value)}
                                    />
                                </InputGroup>

                                <div className="md:col-span-2 border-t border-slate-100 my-2"></div>

                                <InputGroup label="Institution / University" error={errors['academic_data.institution']}>
                                    <input
                                        className="form-input-clean"
                                        placeholder="e.g. Technical University of Kenya"
                                        value={formData.academic_data.institution}
                                        onChange={(e) => handleFieldChange('academic_data', 'institution', e.target.value)}
                                    />
                                </InputGroup>
                                <InputGroup label="Course Name" error={errors['academic_data.course']}>
                                    <input
                                        className="form-input-clean"
                                        placeholder="e.g. BSc Computer Science"
                                        value={formData.academic_data.course}
                                        onChange={(e) => handleFieldChange('academic_data', 'course', e.target.value)}
                                    />
                                </InputGroup>
                                <InputGroup label="Year of Study" error={errors['academic_data.year_of_study']}>
                                    <input
                                        className="form-input-clean"
                                        placeholder="e.g. 3rd Year"
                                        value={formData.academic_data.year_of_study}
                                        onChange={(e) => handleFieldChange('academic_data', 'year_of_study', e.target.value)}
                                    />
                                </InputGroup>
                            </div>
                        </div>
                    )}

                    {/* Workplace Section */}
                    {activeSection === 'workplace' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">Workplace Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Company / Organization Name" error={errors['workplace_data.company_name']}>
                                    <input
                                        className="form-input-clean"
                                        placeholder="e.g. Safaricom PLC"
                                        value={formData.workplace_data.company_name}
                                        onChange={(e) => handleFieldChange('workplace_data', 'company_name', e.target.value)}
                                    />
                                </InputGroup>
                                <InputGroup label="Department / Unit" error={errors['workplace_data.department']}>
                                    <input
                                        className="form-input-clean"
                                        placeholder="e.g. Engineering"
                                        value={formData.workplace_data.department}
                                        onChange={(e) => handleFieldChange('workplace_data', 'department', e.target.value)}
                                    />
                                </InputGroup>
                                <div className="md:col-span-2">
                                    <InputGroup label="Physical Address / Location" error={errors['workplace_data.address']}>
                                        <input
                                            className="form-input-clean"
                                            placeholder="e.g. Westlands, Waiyaki Way"
                                            value={formData.workplace_data.address}
                                            onChange={(e) => handleFieldChange('workplace_data', 'address', e.target.value)}
                                        />
                                    </InputGroup>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Supervisor Section */}
                    {activeSection === 'supervisor' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">Supervisor Contact</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Supervisor Name" error={errors['supervisor_data.name']}>
                                    <input
                                        className="form-input-clean"
                                        placeholder="e.g. John Doe"
                                        value={formData.supervisor_data.name}
                                        onChange={(e) => handleFieldChange('supervisor_data', 'name', e.target.value)}
                                    />
                                </InputGroup>
                                <InputGroup label="Designation / Role" error={errors['supervisor_data.designation']}>
                                    <input
                                        className="form-input-clean"
                                        placeholder="e.g. Senior Manager"
                                        value={formData.supervisor_data.designation}
                                        onChange={(e) => handleFieldChange('supervisor_data', 'designation', e.target.value)}
                                    />
                                </InputGroup>
                                <InputGroup label="Email Address" error={errors['supervisor_data.email']}>
                                    <input
                                        className="form-input-clean"
                                        type="email"
                                        placeholder="supervisor@company.com"
                                        value={formData.supervisor_data.email}
                                        onChange={(e) => handleFieldChange('supervisor_data', 'email', e.target.value)}
                                    />
                                </InputGroup>
                                <InputGroup label="Phone Number" error={errors['supervisor_data.phone']}>
                                    <div className="flex items-center">
                                        <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg px-3 py-3 text-slate-500 font-bold text-sm select-none">
                                            +254
                                        </span>
                                        <input
                                            className="form-input-clean rounded-l-none pl-3"
                                            placeholder="7XX XXX XXX (9 digits)"
                                            value={formData.supervisor_data.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 9) handleFieldChange('supervisor_data', 'phone', val);
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Enter the 9 digits after the country code</p>
                                </InputGroup>
                            </div>
                        </div>
                    )}

                    {/* Schedule Section */}
                    {activeSection === 'schedule' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">Working Schedule</h2>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Work Days</label>
                                <div className="flex flex-wrap gap-3">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <button
                                            key={day}
                                            onClick={() => {
                                                const current = formData.schedule?.days || [];
                                                const next = current.includes(day)
                                                    ? current.filter(d => d !== day)
                                                    : [...current, day];
                                                handleFieldChange('schedule', 'days', next);
                                            }}
                                            className={cn(
                                                "px-4 py-2 rounded-lg font-bold border-2 transition-all",
                                                (formData.schedule?.days || []).includes(day)
                                                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                            )}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Start Time">
                                    <input
                                        className="form-input-clean"
                                        type="time"
                                        value={formData.schedule.start_time}
                                        onChange={(e) => handleFieldChange('schedule', 'start_time', e.target.value)}
                                    />
                                </InputGroup>
                                <InputGroup label="End Time">
                                    <input
                                        className="form-input-clean"
                                        type="time"
                                        value={formData.schedule.end_time}
                                        onChange={(e) => handleFieldChange('schedule', 'end_time', e.target.value)}
                                    />
                                </InputGroup>
                            </div>
                        </div>
                    )}

                    {/* Location Section */}
                    {activeSection === 'location' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">Geolocation Verification</h2>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                                {formData.location_coords.lat ? (
                                    <>
                                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">Precise Location Captured</h3>
                                        <p className="text-slate-500 font-mono text-xs bg-white border border-slate-200 px-3 py-1 rounded-full mb-4">
                                            {formData.location_coords.lat.toFixed(6)}, {formData.location_coords.lng?.toFixed(6)}
                                        </p>
                                        <button
                                            onClick={getCurrentLocation}
                                            className="text-emerald-600 font-bold hover:underline text-sm"
                                        >
                                            Update Location
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                            <MapPin className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Location Required</h3>
                                        <p className="text-slate-500 max-w-sm mb-6">
                                            Please click the button below while physically at your workplace to pin your coordinates for attendance verification.
                                        </p>
                                        <button
                                            onClick={getCurrentLocation}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            Pin My Location
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                        {activeIndex > 0 ? (
                            <button
                                type="button"
                                onClick={goToPrev}
                                className="flex items-center gap-2 px-5 py-3 text-slate-600 hover:text-slate-900 font-bold transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {activeIndex < visibleSteps.length - 1 ? (
                            <button
                                type="button"
                                onClick={goToNext}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg"
                            >
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {settings.auto_approve ? 'Finish & Join' : 'Submit Application'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .form-input-clean {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid #e2e8f0;
                    outline: none;
                    transition: all 0.2s;
                }
                .form-input-clean:focus {
                    border-color: #10b981;
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
                }
            `}</style>
        </div>
    );
}

function InputGroup({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
                {label}
            </label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1 font-medium animate-in slide-in-from-top-1">{error}</p>}
        </div>
    );
}
