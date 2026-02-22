'use client';

import { Github, Twitter, Linkedin, GraduationCap, Shield, Server, Eye, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

function FooterColumn({ title, children }: { title: string, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-900 md:border-none pb-4 md:pb-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between md:hidden py-2"
            >
                <h4 className="font-bold text-slate-200 text-sm">{title}</h4>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <h4 className="hidden md:block font-bold text-slate-200 mb-4 text-sm">{title}</h4>

            <div className={`${isOpen ? 'block' : 'hidden'} md:block animate-in slide-in-from-top-2 duration-200`}>
                {children}
            </div>
        </div>
    );
}

export default function Footer() {
    return (
        <footer className="font-sans text-white">
            {/* Institutional Compliance & Sovereignty - Compact Styled Section */}
            <div className="relative py-12 bg-indigo-900 border-t border-indigo-800 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-8">Institutional Compliance & Sovereignty</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded bg-indigo-800/50 flex items-center justify-center shrink-0 border border-indigo-500/30">
                                <Server className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <h6 className="font-bold text-white text-sm">Data Sovereignty</h6>
                                <p className="text-xs text-indigo-200 mt-1 leading-relaxed opacity-80">Data stays in your tenant. Zero retention by 3rd-party model providers.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded bg-indigo-800/50 flex items-center justify-center shrink-0 border border-indigo-500/30">
                                <Shield className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div>
                                <h6 className="font-bold text-white text-sm">Global Compliance</h6>
                                <p className="text-xs text-indigo-200 mt-1 leading-relaxed opacity-80">FERPA & GDPR Ready Infrastructure. ISO 27001 Certified Data Centers.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded bg-indigo-800/50 flex items-center justify-center shrink-0 border border-indigo-500/30">
                                <Eye className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                                <h6 className="font-bold text-white text-sm">Accessibility First</h6>
                                <p className="text-xs text-indigo-200 mt-1 leading-relaxed opacity-80">WCAG 2.1 AA Standards compliant interface for all reader & dashboard views.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="bg-slate-950 py-16 border-t border-slate-900">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-3 font-serif font-bold text-xl mb-6">
                                <div className="relative w-10 h-10 shrink-0">
                                    <Image
                                        src="/logo_updated.png"
                                        alt="Schologic Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                Schologic LMS
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Our platform serves universities, colleges, and TVET institutions with AI content detection, automated grading, practicum management, and open educational resources to improve access and integrity in higher education.
                            </p>
                        </div>

                        <FooterColumn title="Use Cases">
                            <ul className="space-y-2 text-slate-500 text-sm">
                                <li><Link href="/use-cases/universities" className="hover:text-indigo-400 transition-colors">Universities</Link></li>
                                <li><Link href="/use-cases/colleges" className="hover:text-indigo-400 transition-colors">Colleges</Link></li>
                                <li><Link href="/use-cases/tvet" className="hover:text-indigo-400 transition-colors">TVET</Link></li>
                                <li><Link href="/use-cases/instructors" className="hover:text-indigo-400 transition-colors">Instructors</Link></li>
                                <li><Link href="/use-cases/students" className="hover:text-indigo-400 transition-colors">Students</Link></li>
                            </ul>
                        </FooterColumn>

                        <FooterColumn title="Company">
                            <ul className="space-y-2 text-slate-500 text-sm">
                                <li><Link href="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
                                <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
                                <li><Link href="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                                <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                            </ul>
                        </FooterColumn>

                        <FooterColumn title="Features">
                            <ul className="space-y-2 text-slate-500 text-sm">
                                <li><Link href="/features/class-manager" className="hover:text-indigo-400 transition-colors">Class Manager</Link></li>
                                <li><Link href="/features/ai-detection" className="hover:text-indigo-400 transition-colors">AI Detection</Link></li>
                                <li><Link href="/features/ai-teaching-assistant" className="hover:text-indigo-400 transition-colors">AI Teaching Assistant</Link></li>
                                <li><Link href="/features/universal-reader" className="hover:text-indigo-400 transition-colors">Universal Reader</Link></li>
                                <li><Link href="/features/oer-library" className="hover:text-indigo-400 transition-colors">OER Library</Link></li>
                            </ul>
                        </FooterColumn>
                    </div>

                    <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                            <p className="text-slate-600 text-xs font-mono">
                                © {new Date().getFullYear()} Schologic LMS. All rights reserved.
                            </p>
                            <Link href="/sitemap.xml" className="text-slate-600 text-[10px] uppercase tracking-widest hover:text-indigo-400 transition-colors">
                                Sitemap
                            </Link>
                        </div>
                        <div className="flex gap-6">
                            <Github className="w-4 h-4 text-slate-600 hover:text-white transition-colors cursor-pointer" />
                            <Twitter className="w-4 h-4 text-slate-600 hover:text-white transition-colors cursor-pointer" />
                            <Linkedin className="w-4 h-4 text-slate-600 hover:text-white transition-colors cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
