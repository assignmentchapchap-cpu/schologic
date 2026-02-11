'use client';

import { Github, Twitter, Linkedin, GraduationCap, Shield, Server, Eye } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-slate-900 text-white py-16 font-sans">
            <div className="container mx-auto px-6">

                {/* Dean's Checklist Section */}
                <div className="mb-16 pb-12 border-b border-slate-900">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Institutional Compliance & Sovereignty</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                                <Server className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h6 className="font-bold text-slate-200 text-sm">Data Sovereignty</h6>
                                <p className="text-xs text-slate-500 mt-1">Data stays in your tenant. Zero retention by 3rd-party model providers.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                                <Shield className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <h6 className="font-bold text-slate-200 text-sm">Global Compliance</h6>
                                <p className="text-xs text-slate-500 mt-1">FERPA & GDPR Ready Infrastructure. ISO 27001 Certified Data Centers.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                                <Eye className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h6 className="font-bold text-slate-200 text-sm">Accessibility First</h6>
                                <p className="text-xs text-slate-500 mt-1">WCAG 2.1 AA Standards compliant interface for all reader & dashboard views.</p>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 font-serif font-bold text-xl mb-4">
                            <GraduationCap className="w-8 h-8 text-indigo-500" />
                            Schologic LMS
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            The Sovereign Integrity Layer for Higher Education.
                            Built on Open-Weights intelligence for academic truth.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-200 mb-4 text-sm">Platform</h4>
                        <ul className="space-y-2 text-slate-500 text-sm">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Linguistic Forensics</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Universal Reader</a></li>
                            <li><a href="/features/ai-teaching-assistant" className="hover:text-indigo-400 transition-colors">Schologic TA</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">LTI 1.3 Integrations</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-200 mb-4 text-sm">Resources</h4>
                        <ul className="space-y-2 text-slate-500 text-sm">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Institutional Case Studies</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">The ZTC Mandate Guide</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">API Documentation</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Security Whitepaper</a></li>
                        </ul>
                    </div>
                    {/* Column 2 */}
                    <div>
                        <h4 className="font-bold text-slate-200 mb-4 text-sm">Features</h4>
                        <ul className="space-y-2 text-slate-500 text-sm">
                            <li><Link href="/features/class-manager" className="hover:text-indigo-400 transition-colors">Class Manager</Link></li>
                            <li><Link href="/features/ai-detection" className="hover:text-indigo-400 transition-colors">AI Detection</Link></li>
                            <li><Link href="/features/ai-teaching-assistant" className="hover:text-indigo-400 transition-colors">AI Teaching Assistant</Link></li>
                            <li><Link href="/features/universal-reader" className="hover:text-indigo-400 transition-colors">Universal Reader</Link></li>
                            <li><Link href="/features/oer-library" className="hover:text-indigo-400 transition-colors">OER Library</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col md:row items-center justify-between gap-4">
                    <p className="text-slate-600 text-xs font-mono">
                        © {new Date().getFullYear()} Schologic LMS. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Github className="w-4 h-4 text-slate-600 hover:text-white transition-colors cursor-pointer" />
                        <Twitter className="w-4 h-4 text-slate-600 hover:text-white transition-colors cursor-pointer" />
                        <Linkedin className="w-4 h-4 text-slate-600 hover:text-white transition-colors cursor-pointer" />
                    </div>
                </div>
            </div >
        </footer >
    );
}
