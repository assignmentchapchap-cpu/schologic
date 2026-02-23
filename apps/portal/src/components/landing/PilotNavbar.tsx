'use client';

import { GraduationCap, Grid, FileText, Shield, Sparkles, BookOpen, Archive, ChevronDown, School, Users, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface PilotNavbarProps {
    onOpenDemo?: () => void;
}

const FEATURES_MENU = [
    { href: '/features/class-manager', label: 'Class Manager', icon: Grid, description: 'Central hub for teaching' },
    { href: '/features/practicum-manager', label: 'Practicum Manager', icon: FileText, description: 'Field placement tracking' },
    { href: '/features/ai-detection', label: 'AI Detection', icon: Shield, description: 'Academic integrity tools' },
    { href: '/features/ai-teaching-assistant', label: 'AI Teaching Assistant', icon: Sparkles, description: 'Automated grading' },
    { href: '/features/universal-reader', label: 'Universal Reader', icon: BookOpen, description: 'Read any document' },
    { href: '/features/oer-library', label: 'OER Library', icon: Archive, description: 'Free textbooks' },
];

const USE_CASES_MENU = [
    { href: '/use-cases/universities', label: 'Universities', icon: GraduationCap, description: 'Multi-campus management' },
    { href: '/use-cases/colleges', label: 'Colleges', icon: School, description: 'Zero textbook costs' },
    { href: '/use-cases/tvet', label: 'TVET', icon: BookOpen, description: 'Competency-based skills' },
    { href: '/use-cases/students', label: 'Students', icon: GraduationCap, description: 'AI study companion' },
    { href: '/use-cases/instructors', label: 'Instructors', icon: Users, description: 'Automated grading' },
];

export default function PilotNavbar({ onOpenDemo }: PilotNavbarProps) {
    const [featuresOpen, setFeaturesOpen] = useState(false);
    const [useCasesOpen, setUseCasesOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-slate-900 border-b border-slate-800/60 py-3 shadow-xl">
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-9 h-9 shrink-0">
                        <Image
                            src="/logo_updated.png"
                            alt="Schologic Logo"
                            fill
                            priority
                            className="object-contain"
                        />
                    </div>
                    <span className="font-serif font-bold text-xl text-white tracking-tight">Schologic LMS</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300 font-sans">
                    {/* Features Dropdown */}
                    <div
                        className="relative group"
                        onMouseEnter={() => setFeaturesOpen(true)}
                        onMouseLeave={() => setFeaturesOpen(false)}
                    >
                        <div className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-2">
                            <span className="hover:text-indigo-300 transition-colors">Features</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${featuresOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {featuresOpen && (
                            <div className="absolute top-full left-0 w-64 pt-2">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden p-2">
                                    {FEATURES_MENU.map((feature) => (
                                        <Link
                                            key={feature.href}
                                            href={feature.href}
                                            className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm text-slate-300 hover:text-indigo-300"
                                        >
                                            {feature.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Use Cases Dropdown */}
                    <div
                        className="relative group"
                        onMouseEnter={() => setUseCasesOpen(true)}
                        onMouseLeave={() => setUseCasesOpen(false)}
                    >
                        <div className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-2">
                            <span className="hover:text-indigo-300 transition-colors">Use Cases</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${useCasesOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {useCasesOpen && (
                            <div className="absolute top-full left-0 w-64 pt-2">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden p-2">
                                    {USE_CASES_MENU.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm text-slate-300 hover:text-indigo-300"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href="/pricing" className="hover:text-indigo-300 transition-colors">Pricing</Link>
                    <Link href="/contact" className="hover:text-indigo-300 transition-colors">Contact</Link>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href="/login"
                        className="text-sm font-bold text-white hover:text-indigo-300 transition-colors"
                    >
                        Login
                    </Link>

                    <button
                        onClick={onOpenDemo}
                        className="bg-white text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors shadow-lg active:scale-95"
                    >
                        Start Demo
                    </button>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center gap-4 md:hidden">
                    <Link
                        href="/login"
                        className="text-sm font-bold text-white hover:text-amber-400 transition-colors"
                    >
                        Login
                    </Link>

                    <button
                        className="text-white p-1"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 shadow-2xl overflow-y-auto max-h-[80vh]">
                    <div className="p-4 space-y-6">
                        <div className="space-y-4">
                            <Link href="/features" className="block text-sm font-bold text-slate-300">Features</Link>
                            <Link href="/use-cases" className="block text-sm font-bold text-slate-300">Use Cases</Link>
                            <Link href="/pricing" className="block text-sm font-bold text-slate-300">Pricing</Link>
                            <Link href="/contact" className="block text-sm font-bold text-slate-300">Contact</Link>
                        </div>

                        <div className="border-t border-slate-800 pt-6">
                            <button
                                onClick={() => {
                                    onOpenDemo?.();
                                    setMobileMenuOpen(false);
                                }}
                                className="block w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors shadow-md"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
