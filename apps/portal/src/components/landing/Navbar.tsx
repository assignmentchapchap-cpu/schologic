'use client';

import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface NavbarProps {
    onOpenDemo: () => void;
}

export default function Navbar({ onOpenDemo }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/80 backdrop-blur-md border-b border-slate-700 py-3' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-500 transition-colors">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl text-white tracking-tight">Schologic LMS</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
                    <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="/login" className="text-sm font-bold text-white hover:text-indigo-300 transition-colors hidden md:block">
                        Instructor Login
                    </Link>
                    <Link href="/student/login" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors hidden md:block">
                        Student Login
                    </Link>
                    <button
                        onClick={onOpenDemo}
                        className="bg-white text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors shadow-lg active:scale-95"
                    >
                        Start Demo
                    </button>
                </div>
            </div>
        </nav>
    );
}
