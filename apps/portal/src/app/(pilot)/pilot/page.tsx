'use client';

import { InstitutionalInquiryForm } from '@/components/leads/InstitutionalInquiryForm';
import { BackgroundGrid } from '@/components/use-cases/BackgroundGrid';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function PilotLandingPage() {
    return (
        <main className="min-h-screen bg-white selection:bg-indigo-500/30">
            <Navbar dark />

            {/* HERO SECTION */}
            <section className="relative pt-24 pb-10 md:pt-32 md:pb-16 overflow-hidden bg-slate-50 border-b border-slate-200">
                <BackgroundGrid />

                {/* Ambient Glows */}
                <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full pl-3 pr-4 md:pr-12 lg:pr-16 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">

                        {/* LEFT COLUMN: Narrative */}
                        <div className="md:col-span-7 flex flex-col">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50/50 backdrop-blur-sm border border-amber-200/40 text-amber-700 text-xs font-black mb-8 font-mono tracking-widest uppercase">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span>Institutional Portal</span>
                            </div>

                            <h1 className="text-[2.75rem] leading-[1.2] sm:text-5xl md:text-6xl font-serif font-black text-slate-900 mb-8 tracking-tight">
                                Create a learning <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-900">management system</span> <br />
                                that you need.
                            </h1>

                            <p className="text-lg md:text-xl text-slate-600 leading-10 md:leading-loose mb-10 font-light max-w-2xl">
                                Get a custom LMS in four steps. We have simplified the ability of institutions to create a flexible LMS through the pilot management portal where stakeholders can collaborate in design, track progress, and evaluate the pilot KPIs.
                            </p>

                            <div className="flex flex-wrap items-center gap-8 text-sm font-bold text-slate-400 mt-auto pt-6 border-t border-slate-200/60">
                                <div className="flex flex-col gap-1">
                                    <span className="text-slate-900">01. INQUIRY</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step One</span>
                                </div>
                                <div className="w-8 h-px bg-slate-200" />
                                <div className="flex flex-col gap-1 opacity-40">
                                    <span className="text-slate-900">02. CONFIG</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step Two</span>
                                </div>
                                <div className="w-8 h-px bg-slate-200" />
                                <div className="flex flex-col gap-1 opacity-40">
                                    <span className="text-slate-900">03. PILOT</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step Three</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: 2-Step Form */}
                        <div className="md:col-span-5 relative">
                            <InstitutionalInquiryForm />
                        </div>

                    </div>
                </div>
            </section>

            {/* SECTION 1: THE INSTITUTIONAL ADVANTAGE */}
            <section className="py-16 md:py-20 bg-white border-b border-slate-100">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                        The Advantage
                    </div>

                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight mb-8">
                        The Institutional Advantage
                    </h2>

                    <div className="text-lg md:text-xl text-slate-500 leading-relaxed font-light italic">
                        "The Schologic Pilot Management Portal (PMP) is a dedicated gateway designed to unify the interests of academic leadership, IT administrators, and faculty within a single, secure environment. Adopting an enterprise Learning Management System often fails due to fragmented communication and opaque deployment expectations. The PMP solves this by providing a transparent, asynchronous workspace where stakeholders can architect their ideal digital campus at their own pace. By centralizing module selection, success KPI tracking, and committee collaboration, the PMP ensures that every pilot is data-driven and aligned with institutional goals. From day one, your team has a clear blueprint of the platform’s ROI, transitioning from inquiry to evidence-based evaluation without the friction of traditional software procurement, ultimately safeguarding your institution’s academic integrity and financial efficiency."
                    </div>

                    <div className="mt-12 flex justify-center">
                        <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-indigo-100 rounded-full" />
                    </div>
                </div>
            </section>

            {/* SECTION 2: THE 4-STEP PILOT JOURNEY */}
            <section className="py-16 md:py-20 lg:h-[550px] flex items-center bg-slate-50 border-y border-slate-100 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">The 4-Step Pilot Journey</h2>
                        <p className="text-slate-500 font-sans font-light">From initial inquiry to evidence-based ROI evaluation.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* STEP 1 */}
                        <div className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-500 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="font-mono font-black">01</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Institutional Inquiry</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-light">
                                The journey begins with a secure, verified request from your institutional champion. By providing your official university or college credentials, you initiate an automated review gate that ensures your private tenant is provisioned with maximum data sovereignty.
                            </p>
                        </div>

                        {/* STEP 2 */}
                        <div className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-500 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="font-mono font-black">02</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Configuration</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-light">
                                Invite up to five key stakeholders to join a unified workspace. Together, your team will use the 'Pilot Architect' to select modules, white-label the interface, and define success KPIs, eliminating misaligned expectations.
                            </p>
                        </div>

                        {/* STEP 3 */}
                        <div className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-500 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="font-mono font-black">03</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Live Sandbox</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-light">
                                Schologic provision your dedicated tenant in under two weeks. This is your custom environment, pre-loaded with your branding and integrated with your OER cartridges for live testing with real data.
                            </p>
                        </div>

                        {/* STEP 4 */}
                        <div className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-500 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="font-mono font-black">04</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">ROI Evaluation</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-light">
                                Access a comprehensive Executive ROI Report highlighting grading hours saved, AI flags reduced, and financial savings from OER integration—definitive proof for enterprise transition.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: MODULAR ARCHITECTURE */}
            <section className="py-16 md:py-20 bg-white border-b border-slate-100">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Modular Architecture</h2>
                            <p className="text-slate-500 font-sans font-light text-lg">Scale your digital campus with precision. Choose the foundations you need and the intelligent values you want.</p>
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-l border-slate-200 pl-6 hidden md:block">
                            Enterprise Ready <br /> Modular Framework
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* CORE MODULES */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest flex items-center gap-3">
                                <span className="w-8 h-px bg-indigo-500" /> Core Foundations
                            </h3>

                            <div className="space-y-6">
                                <div className="p-8 rounded-3xl border-2 border-slate-900 bg-slate-50 relative overflow-hidden group">
                                    <h4 className="text-xl font-bold text-slate-900 mb-3">Class Manager</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-light">
                                        The foundational command center for your entire teaching workflow. It provides instructors with effortless class creation, automated assignment tracking, and a unified grades table. Built for scalability, it allows universities to manage thousands of concurrent users while maintaining simple, intuitive navigation.
                                    </p>
                                </div>

                                <div className="p-8 rounded-3xl border-2 border-slate-900 bg-slate-50 relative overflow-hidden group">
                                    <h4 className="text-xl font-bold text-slate-900 mb-3">Practicum Manager</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-light">
                                        Specifically designed for TVETs and applied sciences, the Practicum Manager digitizes the entire industrial attachment and internship lifecycle. It replaces manual logbooks with secure <strong>digital logbooks</strong> that support supervisor geolocation and evaluation links, ensuring 100% <strong>CDACC compliance</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* VALUE MODULES */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-3">
                                <span className="w-8 h-px bg-amber-500" /> Value Accelerators
                            </h3>

                            <div className="space-y-6">
                                <div className="p-8 rounded-3xl border-2 border-amber-500/30 bg-white relative overflow-hidden group hover:border-amber-500 transition-all shadow-xl shadow-amber-500/5">
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-3">AI Detection & Forensics</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-light">
                                        Sentence-level AI probability scoring using multiple <strong>RoBERTa models</strong>. By providing transparent, evidence-based reporting, it allows instructors to identify patterns in AI-assisted work and make informed grading decisions, protecting institutional reputation.
                                    </p>
                                </div>

                                <div className="p-8 rounded-3xl border-2 border-indigo-500/30 bg-white relative overflow-hidden group hover:border-indigo-500 transition-all shadow-xl shadow-indigo-500/5">
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-3">AI Teaching Assistant</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-light">
                                        Reclaim instructors' time with automated rubrics and deterministic grading feedback. This module reduces manual grading workloads by up to 80% through automated routine evaluations, allowing faculty to focus on high-impact teaching.
                                    </p>
                                </div>

                                <div className="p-8 rounded-3xl border-2 border-emerald-500/30 bg-white relative overflow-hidden group hover:border-emerald-500 transition-all shadow-xl shadow-emerald-500/5">
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-3">OER & Universal Reader</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-light">
                                        Transition to Zero-Textbook-Cost (ZTC) instantly via <strong>Common Cartridges (IMSCC)</strong>. The integrated Universal Reader allows students to read, search, and AI-summarize open resources directly within the LMS, improving retention.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: FAQ & KB SNEAK PEEK */}
            <section className="py-16 md:py-20 bg-slate-50 border-t border-slate-200">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Preparation & Success</h2>
                        <p className="text-slate-500 font-sans font-light max-w-2xl mx-auto">Browse our documentation or get quick answers to frequently asked institutional questions.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
                        {/* KB CARD 1 */}
                        <a href="/pilot-knowledge-base" className="group p-8 bg-white rounded-3xl border border-slate-200 hover:border-indigo-500 transition-all hover:shadow-2xl hover:shadow-indigo-500/10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Chapter 01</span>
                            <h4 className="text-xl font-bold text-slate-900 mb-4">Platform Overview</h4>
                            <p className="text-sm text-slate-500 leading-relaxed font-light group-hover:text-slate-900 transition-colors">
                                Understand the core architecture behind Schologic's institutional portal and how we handle data sovereignty.
                            </p>
                        </a>

                        {/* KB CARD 2 */}
                        <a href="/pilot-knowledge-base" className="group p-8 bg-white rounded-3xl border border-slate-200 hover:border-indigo-500 transition-all hover:shadow-2xl hover:shadow-indigo-500/10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Chapter 02</span>
                            <h4 className="text-xl font-bold text-slate-900 mb-4">Getting Started</h4>
                            <p className="text-sm text-slate-500 leading-relaxed font-light group-hover:text-slate-900 transition-colors">
                                A step-by-step guide for Institutional Champions to verify their domain and invite their core pilot team.
                            </p>
                        </a>

                        {/* KB CARD 3 */}
                        <a href="/pilot-knowledge-base" className="group p-8 bg-white rounded-3xl border border-slate-200 hover:border-indigo-500 transition-all hover:shadow-2xl hover:shadow-indigo-500/10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Chapter 03</span>
                            <h4 className="text-xl font-bold text-slate-900 mb-4">Managing Classes</h4>
                            <p className="text-sm text-slate-500 leading-relaxed font-light group-hover:text-slate-900 transition-colors">
                                Learn how instructors interface with the Class Manager to automate high-volume grading and tracking.
                            </p>
                        </a>
                    </div>

                    {/* FAQ SNEAK PEEK */}
                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="p-6 bg-white rounded-2xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 mb-2">How long does the domain verification take?</h5>
                            <p className="text-sm text-slate-500 leading-relaxed">Automatic verification happens within minutes of submitting your institutional email. Manual overrides take up to 24 hours.</p>
                        </div>
                        <div className="p-6 bg-white rounded-2xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 mb-2">Can we use our own branding?</h5>
                            <p className="text-sm text-slate-500 leading-relaxed">Yes. In the configuration phase, you can upload logos and set primary colors for a fully white-labeled experience.</p>
                        </div>
                        <div className="p-6 bg-white rounded-2xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 mb-2">Is the pilot data kept secure?</h5>
                            <p className="text-sm text-slate-500 leading-relaxed">Absolutely. Every pilot is provisioned on a dedicated secure tenant with full encryption at rest and in transit.</p>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-sm text-slate-400 mb-6 font-mono tracking-widest uppercase">Asynchronous Documentation</p>
                        <a href="/pilot-knowledge-base" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl active:scale-95">
                            Browse the 15-Chapter Knowledge Base
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
