'use client';

import { GraduationCap, Grid, FileText, Shield, Sparkles, BookOpen, Archive, ChevronDown, School, Users, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface NavbarProps {
    onOpenDemo?: () => void;
    solid?: boolean;
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

export default function Navbar({ onOpenDemo, solid = false }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false);
    const [featuresOpen, setFeaturesOpen] = useState(false);
    const [useCasesOpen, setUseCasesOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled || solid ? 'bg-slate-900 border-b border-slate-700 py-3' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-500 transition-colors">
                        <GraduationCap className="w-6 h-6 text-white" />
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
                            <Link href="/features" className="hover:text-indigo-300 transition-colors">
                                Features
                            </Link>
                            <ChevronDown className={`w-4 h-4 transition-transform ${featuresOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {featuresOpen && (
                            <div className="absolute top-full left-0 w-64 pt-2">
                                <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden p-2">
                                    <Link
                                        href="/features"
                                        className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors border-b border-slate-800 mb-2 font-bold text-white"
                                    >
                                        Overview
                                    </Link>

                                    {FEATURES_MENU.map((feature) => (
                                        <Link
                                            key={feature.href}
                                            href={feature.href}
                                            className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm text-slate-300 hover:text-white"
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
                            <Link href="/use-cases" className="hover:text-indigo-300 transition-colors">
                                Use Cases
                            </Link>
                            <ChevronDown className={`w-4 h-4 transition-transform ${useCasesOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {useCasesOpen && (
                            <div className="absolute top-full left-0 w-64 pt-2">
                                <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden p-2">
                                    <Link
                                        href="/use-cases"
                                        className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors border-b border-slate-800 mb-2 font-bold text-white"
                                    >
                                        Overview
                                    </Link>

                                    {USE_CASES_MENU.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm text-slate-300 hover:text-white"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                </div>

                {/* Desktop Actions */}
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
                    {/* Login Button */}
                    <Link
                        href="/login"
                        className="flex items-center gap-1 text-sm font-bold text-white hover:text-indigo-300 transition-colors"
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
                <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-slate-700 shadow-2xl overflow-y-auto max-h-[80vh]">
                    <div className="p-4 space-y-6">
                        <div className="space-y-3">
                            {/* Features Expandable */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between w-full hover:bg-slate-800 rounded-lg transition-colors group pr-2">
                                    <Link
                                        href="/features"
                                        className="flex-1 px-2 py-2"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-400">Features</span>
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setFeaturesOpen(!featuresOpen);
                                        }}
                                        className="p-1 text-slate-500 hover:text-white rounded hover:bg-slate-700 transition-colors"
                                        aria-label="Toggle Features menu"
                                    >
                                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${featuresOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {featuresOpen && (
                                    <div className="pl-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                        {FEATURES_MENU.map((feature) => (
                                            <Link
                                                key={feature.href}
                                                href={feature.href}
                                                className="block px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors text-sm font-medium"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {feature.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Use Cases Expandable */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between w-full hover:bg-slate-800 rounded-lg transition-colors group pr-2">
                                    <Link
                                        href="/use-cases"
                                        className="flex-1 px-2 py-2"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-400">Use Cases</span>
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setUseCasesOpen(!useCasesOpen);
                                        }}
                                        className="p-1 text-slate-500 hover:text-white rounded hover:bg-slate-700 transition-colors"
                                        aria-label="Toggle Use Cases menu"
                                    >
                                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${useCasesOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {useCasesOpen && (
                                    <div className="pl-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                        {USE_CASES_MENU.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="block px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors text-sm font-medium"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Direct Links */}
                            <a
                                href="#pricing"
                                className="block px-2 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Pricing
                            </a>
                        </div>

                        <div className="border-t border-slate-800 pt-6">
                            <button
                                onClick={() => {
                                    onOpenDemo?.();
                                    setMobileMenuOpen(false);
                                }}
                                className="block w-full py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors shadow-md"
                            >
                                Start Demo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
