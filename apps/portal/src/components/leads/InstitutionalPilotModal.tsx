'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle, GraduationCap, ChevronDown, Search, ArrowRight, ArrowLeft } from 'lucide-react';
import { submitPilotRequest, PilotRequestData } from '@/app/actions/leads';

const INSTITUTION_SIZES = [
    { value: '<1000', label: 'Under 1,000 students' },
    { value: '1000-5000', label: '1,000 - 5,000 students' },
    { value: '5000-10000', label: '5,000 - 10,000 students' },
    { value: '10000+', label: '10,000+ students' },
];

const LMS_OPTIONS = [
    { value: 'Canvas', label: 'Canvas' },
    { value: 'Blackboard', label: 'Blackboard' },
    { value: 'Moodle', label: 'Moodle' },
    { value: 'D2L Brightspace', label: 'D2L Brightspace' },
    { value: 'Other', label: 'Other' },
    { value: 'None', label: 'No LMS' },
];

const INTEREST_OPTIONS = [
    { value: 'AI Grading', label: 'AI-Powered Grading' },
    { value: 'Integrity Detection', label: 'Academic Integrity Detection' },
    { value: 'OER/ZTC', label: 'OER / Zero-Textbook-Cost' },
    { value: 'All', label: 'Full Platform' },
];

// Comprehensive country codes list with phone number lengths
const COUNTRY_CODES = [
    // Africa
    { code: '+254', country: 'Kenya', digits: 9 },
    { code: '+234', country: 'Nigeria', digits: 10 },
    { code: '+27', country: 'South Africa', digits: 9 },
    { code: '+256', country: 'Uganda', digits: 9 },
    { code: '+255', country: 'Tanzania', digits: 9 },
    { code: '+251', country: 'Ethiopia', digits: 9 },
    { code: '+233', country: 'Ghana', digits: 9 },
    { code: '+20', country: 'Egypt', digits: 10 },
    { code: '+212', country: 'Morocco', digits: 9 },
    { code: '+237', country: 'Cameroon', digits: 9 },
    { code: '+225', country: 'Ivory Coast', digits: 10 },
    { code: '+221', country: 'Senegal', digits: 9 },
    { code: '+250', country: 'Rwanda', digits: 9 },
    { code: '+263', country: 'Zimbabwe', digits: 9 },
    { code: '+260', country: 'Zambia', digits: 9 },
    { code: '+265', country: 'Malawi', digits: 9 },
    { code: '+258', country: 'Mozambique', digits: 9 },
    { code: '+267', country: 'Botswana', digits: 8 },
    { code: '+264', country: 'Namibia', digits: 9 },
    { code: '+230', country: 'Mauritius', digits: 8 },
    // Americas
    { code: '+1', country: 'USA/Canada', digits: 10 },
    { code: '+52', country: 'Mexico', digits: 10 },
    { code: '+55', country: 'Brazil', digits: 11 },
    { code: '+54', country: 'Argentina', digits: 10 },
    { code: '+57', country: 'Colombia', digits: 10 },
    { code: '+56', country: 'Chile', digits: 9 },
    { code: '+51', country: 'Peru', digits: 9 },
    // Europe
    { code: '+44', country: 'United Kingdom', digits: 10 },
    { code: '+49', country: 'Germany', digits: 11 },
    { code: '+33', country: 'France', digits: 9 },
    { code: '+39', country: 'Italy', digits: 10 },
    { code: '+34', country: 'Spain', digits: 9 },
    { code: '+31', country: 'Netherlands', digits: 9 },
    { code: '+32', country: 'Belgium', digits: 9 },
    { code: '+41', country: 'Switzerland', digits: 9 },
    { code: '+43', country: 'Austria', digits: 10 },
    { code: '+46', country: 'Sweden', digits: 9 },
    { code: '+47', country: 'Norway', digits: 8 },
    { code: '+45', country: 'Denmark', digits: 8 },
    { code: '+358', country: 'Finland', digits: 9 },
    { code: '+48', country: 'Poland', digits: 9 },
    { code: '+353', country: 'Ireland', digits: 9 },
    { code: '+351', country: 'Portugal', digits: 9 },
    { code: '+30', country: 'Greece', digits: 10 },
    // Asia
    { code: '+91', country: 'India', digits: 10 },
    { code: '+86', country: 'China', digits: 11 },
    { code: '+81', country: 'Japan', digits: 10 },
    { code: '+82', country: 'South Korea', digits: 10 },
    { code: '+65', country: 'Singapore', digits: 8 },
    { code: '+60', country: 'Malaysia', digits: 10 },
    { code: '+62', country: 'Indonesia', digits: 11 },
    { code: '+66', country: 'Thailand', digits: 9 },
    { code: '+84', country: 'Vietnam', digits: 9 },
    { code: '+63', country: 'Philippines', digits: 10 },
    { code: '+971', country: 'UAE', digits: 9 },
    { code: '+966', country: 'Saudi Arabia', digits: 9 },
    { code: '+974', country: 'Qatar', digits: 8 },
    { code: '+972', country: 'Israel', digits: 9 },
    { code: '+90', country: 'Turkey', digits: 10 },
    { code: '+92', country: 'Pakistan', digits: 10 },
    { code: '+880', country: 'Bangladesh', digits: 10 },
    // Oceania
    { code: '+61', country: 'Australia', digits: 9 },
    { code: '+64', country: 'New Zealand', digits: 9 },
].sort((a, b) => {
    // Kenya first, then alphabetically
    if (a.code === '+254') return -1;
    if (b.code === '+254') return 1;
    return a.country.localeCompare(b.country);
});

interface Props {
    onClose: () => void;
}

type FormState = 'filling' | 'submitting' | 'success';

export default function InstitutionalPilotModal({ onClose }: Props) {
    const [step, setStep] = useState(1);
    const [state, setState] = useState<FormState>('filling');
    const [error, setError] = useState<string | null>(null);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [institution, setInstitution] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+254');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [institutionSize, setInstitutionSize] = useState('');
    const [currentLms, setCurrentLms] = useState('');
    const [primaryInterest, setPrimaryInterest] = useState<string[]>([]);
    const [virtualLearning, setVirtualLearning] = useState(false);
    const [otherInfo, setOtherInfo] = useState('');
    const [note, setNote] = useState('');

    // Inline validation state
    const [emailTouched, setEmailTouched] = useState(false);
    const [phoneTouched, setPhoneTouched] = useState(false);

    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);

    const filteredCountries = COUNTRY_CODES.filter(c =>
        c.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.code.includes(countrySearch)
    );

    // Name capitalization helper
    const capitalizeName = (value: string) => {
        return value.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    };

    // Email validation
    const isValidEmail = (emailValue: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailValue);
    };

    const emailError = emailTouched && email.length > 0 && !isValidEmail(email)
        ? 'Please enter a valid email address'
        : null;

    // Phone validation based on selected country
    const expectedDigits = selectedCountry?.digits || 9;
    const isValidPhone = (phoneValue: string): boolean => {
        return phoneValue.length === expectedDigits;
    };

    const phoneError = phoneTouched && phoneNumber.length > 0 && !isValidPhone(phoneNumber)
        ? `Phone number should be ${expectedDigits} digits for ${selectedCountry?.country || 'this country'}`
        : null;

    const toggleInterest = (value: string) => {
        setPrimaryInterest(prev =>
            prev.includes(value)
                ? prev.filter(v => v !== value)
                : [...prev, value]
        );
    };

    const nextStep = () => {
        setError(null);
        if (step === 1) {
            // Validate Identification & Profile
            if (!firstName.trim() || !lastName.trim() || !jobTitle.trim() || !email.trim() || !institution.trim() || !institutionSize || !currentLms || !phoneNumber.trim()) {
                setError('Please fill in all required fields.');
                return;
            }
            if (!isValidEmail(email)) {
                setEmailTouched(true);
                setError('Please provide a valid institutional email.');
                return;
            }
            if (!isValidPhone(phoneNumber)) {
                setPhoneTouched(true);
                setError(`Valid ${expectedDigits}-digit phone number required.`);
                return;
            }
        }
        setStep(step + 1);
    };

    const prevStep = () => {
        setError(null);
        setStep(step - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (primaryInterest.length === 0) {
            setError('Select at least one area of interest.');
            return;
        }

        setState('submitting');

        const fullPhone = `${countryCode} ${phoneNumber}`;

        const data: PilotRequestData = {
            firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase(),
            lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase(),
            institution,
            jobTitle,
            email,
            phone: fullPhone,
            institutionSize,
            currentLms,
            primaryInterest,
            virtualLearning,
            otherInfo: otherInfo || undefined,
            note: note || undefined,
        };

        const result = await submitPilotRequest(data);

        if (result.error) {
            setError(result.error);
            setState('filling');
        } else {
            setState('success');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 font-serif leading-tight">Institutional Pilot</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${step === 1 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>1. PROFILE</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${step === 2 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>2. GOALS</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    {state === 'success' ? (
                        <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-serif">Inquiry Secured</h3>
                            <p className="text-slate-600 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                                Thank you, {firstName}. Your institutional request has been logged. Our team will reach out within 2 business days.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                            >
                                Finish
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-in shake duration-300">
                                    {error}
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(capitalizeName(e.target.value))}
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(capitalizeName(e.target.value))}
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Institutional Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                            onBlur={() => setEmailTouched(true)}
                                            required
                                            placeholder="name@institution.ac.ke"
                                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium ${emailError ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                                }`}
                                        />
                                        {emailError && <p className="text-xs text-red-500 mt-1.5">{emailError}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Job Title</label>
                                        <input
                                            type="text"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            required
                                            placeholder="e.g., Dean of Faculty"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Institution Name</label>
                                        <input
                                            type="text"
                                            value={institution}
                                            onChange={(e) => setInstitution(e.target.value)}
                                            required
                                            placeholder="e.g., University of Nairobi"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Student Count</label>
                                            <select
                                                value={institutionSize}
                                                onChange={(e) => setInstitutionSize(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer text-sm font-medium"
                                            >
                                                <option value="">Select size...</option>
                                                {INSTITUTION_SIZES.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Primary LMS</label>
                                            <select
                                                value={currentLms}
                                                onChange={(e) => setCurrentLms(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer text-sm font-medium"
                                            >
                                                <option value="">Select LMS...</option>
                                                {LMS_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Number</label>
                                        <div className="flex gap-2">
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                    className="flex items-center gap-2 h-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors min-w-[90px]"
                                                >
                                                    <span className="font-mono text-xs font-bold">{selectedCountry?.code}</span>
                                                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                                                </button>

                                                {showCountryDropdown && (
                                                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-30 overflow-hidden ring-1 ring-black/5 animate-in slide-in-from-bottom-2 duration-200">
                                                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                                                <input
                                                                    type="text"
                                                                    value={countrySearch}
                                                                    onChange={(e) => setCountrySearch(e.target.value)}
                                                                    placeholder="Find country..."
                                                                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                                                    autoFocus
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {filteredCountries.map(country => (
                                                                <button
                                                                    key={country.code}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setCountryCode(country.code);
                                                                        setShowCountryDropdown(false);
                                                                        setCountrySearch('');
                                                                    }}
                                                                    className={`w-full px-4 py-2 text-left text-[11px] hover:bg-indigo-50 flex items-center justify-between transition-colors ${countryCode === country.code ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
                                                                        }`}
                                                                >
                                                                    <span>{country.country}</span>
                                                                    <span className="text-slate-400 font-mono">{country.code}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 relative">
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d]/g, ''))}
                                                    onBlur={() => setPhoneTouched(true)}
                                                    required
                                                    placeholder="712345678"
                                                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium ${phoneError ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                        {phoneError && <p className="text-xs text-red-500 mt-1.5">{phoneError}</p>}
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Priority Areas</label>
                                        <div className="grid grid-cols-1 gap-2.5">
                                            {INTEREST_OPTIONS.map(opt => (
                                                <label
                                                    key={opt.value}
                                                    className={`group flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${primaryInterest.includes(opt.value)
                                                        ? 'bg-indigo-50 border-indigo-500'
                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${primaryInterest.includes(opt.value) ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300'}`}>
                                                        {primaryInterest.includes(opt.value) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        hidden
                                                        checked={primaryInterest.includes(opt.value)}
                                                        onChange={() => toggleInterest(opt.value)}
                                                    />
                                                    <span className={`text-sm font-bold transition-colors ${primaryInterest.includes(opt.value) ? 'text-indigo-900' : 'text-slate-600'}`}>{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer transition-all bg-slate-50/50">
                                        <input
                                            type="checkbox"
                                            checked={virtualLearning}
                                            onChange={(e) => setVirtualLearning(e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-bold text-slate-700">Distance learning program active</span>
                                    </label>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Additional Requirements</label>
                                        <textarea
                                            value={otherInfo}
                                            onChange={(e) => setOtherInfo(e.target.value)}
                                            rows={2}
                                            placeholder="Mention specific needs..."
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-sm transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {state !== 'success' && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                        <div className="flex items-center justify-between gap-4">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-900 font-bold transition-colors text-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>
                            ) : (
                                <div />
                            )}

                            {step < 2 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]"
                                >
                                    Continue
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={state === 'submitting'}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {state === 'submitting' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Request Pilot'
                                    )}
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 text-center mt-5 uppercase tracking-widest font-black">
                            Secured Transmission
                        </p>
                    </div>
                )}
            </div>

            {/* Click outside to close dropdown */}
            {showCountryDropdown && (
                <div
                    className="fixed inset-0 z-[60]"
                    onClick={() => setShowCountryDropdown(false)}
                />
            )}
        </div>
    );
}
