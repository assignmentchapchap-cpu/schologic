'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, GraduationCap, ChevronDown, Search, ArrowRight, ArrowLeft } from 'lucide-react';
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

const COUNTRY_CODES = [
    { code: '+254', country: 'Kenya', digits: 9 },
    { code: '+234', country: 'Nigeria', digits: 10 },
    { code: '+27', country: 'South Africa', digits: 9 },
    { code: '+256', country: 'Uganda', digits: 9 },
    { code: '+255', country: 'Tanzania', digits: 9 },
    { code: '+251', country: 'Ethiopia', digits: 9 },
    { code: '+233', country: 'Ghana', digits: 9 },
    { code: '+20', country: 'Egypt', digits: 10 },
    { code: '+1', country: 'USA/Canada', digits: 10 },
    { code: '+44', country: 'UK', digits: 10 },
].sort((a, b) => {
    if (a.code === '+254') return -1;
    if (b.code === '+254') return 1;
    return a.country.localeCompare(b.country);
});

type FormState = 'filling' | 'submitting' | 'success';

export function InstitutionalInquiryForm() {
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

    const [emailTouched, setEmailTouched] = useState(false);
    const [phoneTouched, setPhoneTouched] = useState(false);

    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);
    const filteredCountries = COUNTRY_CODES.filter(c =>
        c.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.code.includes(countrySearch)
    );

    const capitalizeName = (value: string) => value.replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    const isValidEmail = (emailValue: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    const emailError = emailTouched && email.length > 0 && !isValidEmail(email) ? 'Invalid email' : null;

    const expectedDigits = selectedCountry?.digits || 9;
    const isValidPhone = (phoneValue: string) => phoneValue.length === expectedDigits;
    const phoneError = phoneTouched && phoneNumber.length > 0 && !isValidPhone(phoneNumber) ? `Need ${expectedDigits} digits` : null;

    const toggleInterest = (value: string) => {
        setPrimaryInterest(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    };

    const nextStep = () => {
        setError(null);
        if (step === 1) {
            if (!firstName.trim() || !lastName.trim() || !jobTitle.trim() || !email.trim() || !institution.trim() || !institutionSize || !currentLms || !phoneNumber.trim()) {
                setError('Fill in all fields.');
                return;
            }
            if (!isValidEmail(email)) { setEmailTouched(true); setError('Invalid email.'); return; }
            if (!isValidPhone(phoneNumber)) { setPhoneTouched(true); setError(`Need ${expectedDigits} digits.`); return; }
        }
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (primaryInterest.length === 0) { setError('Select at least one goal.'); return; }
        setState('submitting');
        const data: PilotRequestData = {
            firstName: capitalizeName(firstName),
            lastName: capitalizeName(lastName),
            institution, jobTitle, email, phone: `${countryCode} ${phoneNumber}`,
            institutionSize, currentLms, primaryInterest, virtualLearning, otherInfo: otherInfo || undefined
        };
        const result = await submitPilotRequest(data);
        if (result.error) { setError(result.error); setState('filling'); } else { setState('success'); }
    };

    if (state === 'success') {
        return (
            <div className="p-8 text-center animate-in fade-in zoom-in duration-500 bg-white rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 relative z-10">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Inquiry Received</h3>
                <p className="text-slate-600 mb-8 max-w-xs mx-auto text-sm leading-relaxed font-light">
                    Thank you, {firstName}. Your institutional credentials have been verified. Our strategists will reach out to schedule your pilot kickoff.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                >
                    Done
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden animate-fade-in relative group transition-all duration-500">
            <div className="bg-white px-8 py-5 flex items-center justify-between relative z-10 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-slate-900" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 tracking-tight uppercase">Pilot Inquiry</span>
                </div>
                <div className="flex gap-1.5">
                    <div className={`h-1.5 w-6 rounded-full transition-all duration-500 ${step === 1 ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                    <div className={`h-1.5 w-6 rounded-full transition-all duration-500 ${step === 2 ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium animate-in shake duration-300">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Jane"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Institutional Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setEmailTouched(true)}
                                placeholder="dean@university.ac.ke"
                                className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium ${emailError ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Institution Name</label>
                                <input
                                    type="text"
                                    value={institution}
                                    onChange={(e) => setInstitution(e.target.value)}
                                    placeholder="University of Nairobi"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Job Title</label>
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="Dean / Provost / IT Admin"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Institution Size</label>
                                <select
                                    value={institutionSize}
                                    onChange={(e) => setInstitutionSize(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer text-sm font-medium"
                                >
                                    <option value="">Select size...</option>
                                    {INSTITUTION_SIZES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Current LMS</label>
                                <select
                                    value={currentLms}
                                    onChange={(e) => setCurrentLms(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer text-sm font-medium"
                                >
                                    <option value="">Select LMS...</option>
                                    {LMS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Phone Number</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                    className="px-3 border border-slate-200 rounded-xl bg-white text-xs font-mono font-bold flex items-center gap-1 min-w-[80px]"
                                >
                                    {countryCode} <ChevronDown className="w-3 h-3 text-slate-400" />
                                </button>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                    onBlur={() => setPhoneTouched(true)}
                                    placeholder="712345678"
                                    className={`flex-1 px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium ${phoneError ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-xs font-bold text-slate-900 mb-2.5 ml-1">Pilot Goals (Select all that apply)</label>
                            <div className="grid grid-cols-1 gap-2">
                                {INTEREST_OPTIONS.map(opt => (
                                    <label
                                        key={opt.value}
                                        className={`group flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${primaryInterest.includes(opt.value) ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-white'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${primaryInterest.includes(opt.value) ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300'}`}>
                                            {primaryInterest.includes(opt.value) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <input type="checkbox" hidden checked={primaryInterest.includes(opt.value)} onChange={() => toggleInterest(opt.value)} />
                                        <span className={`text-sm font-bold ${primaryInterest.includes(opt.value) ? 'text-indigo-900' : 'text-slate-600'}`}>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white/50 cursor-pointer group">
                            <input type="checkbox" checked={virtualLearning} onChange={(e) => setVirtualLearning(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-indigo-600" />
                            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Active Distance Learning Program</span>
                        </label>
                    </div>
                )}

                <div className="pt-4">
                    {step === 1 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            Continue to Pilot Scope
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-5 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all shadow-sm active:scale-95"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button
                                type="submit"
                                disabled={state === 'submitting'}
                                className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50 active:scale-95 flex items-center justify-center"
                            >
                                {state === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Institutional Pilot'}
                            </button>
                        </div>
                    )}
                </div>
            </form>

            <div className="bg-white px-8 py-4 border-t border-slate-100 flex items-center justify-center gap-2 relative z-10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verified Secure Data Portal</span>
            </div>

            {showCountryDropdown && (
                <div className="absolute top-0 left-0 w-full h-full bg-white/95 backdrop-blur-sm z-50 p-6 animate-in fade-in slide-in-from-bottom-5 duration-300 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-serif font-bold text-slate-900 text-lg">Select Country</h4>
                        <button onClick={() => setShowCountryDropdown(false)} className="text-slate-400 hover:text-slate-900 transition-colors px-2 py-1 font-bold">Close</button>
                    </div>
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Find your country..."
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                        {filteredCountries.map(c => (
                            <button
                                key={c.code}
                                onClick={() => { setCountryCode(c.code); setShowCountryDropdown(false); }}
                                className="flex items-center justify-between p-4 rounded-xl hover:bg-white transition-all text-left"
                            >
                                <span className="text-sm font-bold text-slate-700">{c.country}</span>
                                <span className="font-mono text-xs text-slate-400">{c.code}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
