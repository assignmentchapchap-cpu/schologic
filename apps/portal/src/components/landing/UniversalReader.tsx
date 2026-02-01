'use client';

import { BookOpen, FileText, Bookmark, Check, Upload } from 'lucide-react';
import Image from 'next/image';

export default function UniversalReader() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05] pointer-events-none"></div>

            {/* Decorative Blobs - Keeping it clean but warm for "Learning" vibe */}
            <div className="absolute top-1/2 -left-20 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>


            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-6">
                        <Bookmark className="w-3 h-3" />
                        Universal OER Ingestion
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-6 leading-tight">
                        Eliminate Textbook Barriers with the <br />
                        <span className="text-indigo-600">Zero-Textbook-Cost Engine.</span>
                    </h2>
                    <p className="text-xl text-slate-500 leading-relaxed font-light">
                        The ZTC mandate is the #1 budget priority for universities and colleges.
                        Schologic natively ingests <strong className="text-slate-900 font-medium">LibreTexts</strong>, <strong className="text-slate-900 font-medium">Common Cartridge</strong>, and <strong className="text-slate-900 font-medium">PDFs</strong> into one standardized, accessible reader.
                    </p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* The Ingestion Diagram */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        {/* Source 1: LibreTexts */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Bookmark className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">LibreTexts Integration</h3>
                            <p className="text-sm text-slate-500 mt-2">Direct API connection to 100,000+ peer-reviewed open educational resources.</p>
                            <div className="mt-4 pt-4 border-t border-slate-50 w-full flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                                <Check className="w-3 h-3 text-emerald-500" /> Verified Source
                            </div>
                        </div>

                        {/* Source 2: PDF/Docs */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileText className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">Legacy Document Parsing</h3>
                            <p className="text-sm text-slate-500 mt-2">Upload syllabi & readers. Our OCR engine converts scanned PDFs into accessible HTML.</p>
                            <div className="mt-4 pt-4 border-t border-slate-50 w-full flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                                <Check className="w-3 h-3 text-emerald-500" /> WCAG 2.1 CompliantOCR
                            </div>
                        </div>

                        {/* Source 3: Common Cartridge */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">IMS Common Cartridge</h3>
                            <p className="text-sm text-slate-500 mt-2">Migrate from Blackboard/Canvas instantly. We support full LTI 1.3 course imports.</p>
                            <div className="mt-4 pt-4 border-t border-slate-50 w-full flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                                <Check className="w-3 h-3 text-emerald-500" /> LTI 1.3 Compliant
                            </div>
                        </div>
                    </div>

                    {/* Connection Lines (Desktop Only) */}
                    <div className="hidden md:block absolute top-[60%] left-[16%] right-[16%] h-20 border-b-2 border-indigo-200 rounded-b-[100px] -z-10"></div>
                    <div className="hidden md:block absolute top-[calc(60%+80px)] left-1/2 w-0.5 h-16 bg-indigo-200 -translate-x-1/2 -z-10"></div>

                    {/* Central Node: The Reader */}
                    <div className="mt-24 max-w-4xl mx-auto bg-slate-900 rounded-2xl p-2 shadow-2xl relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                            Into One Unified Experience
                        </div>
                        <div className="bg-white rounded-xl overflow-hidden aspect-[16/9] relative md:aspect-[21/9] flex items-center justify-center bg-slate-100 text-slate-400">
                            {/* Placeholder for Reader UI screenshot if available, or just a mock */}
                            <div className="text-center p-8">
                                <div className="mx-auto w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-2">
                                    <BookOpen className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="font-mono text-xs uppercase tracking-widest">Universal Reader Interface</p>
                                <p className="text-sm mt-2 max-w-sm mx-auto">Students study, cite, and submit without ever leaving your institutional portal.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
