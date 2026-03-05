import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { InstitutionalInquiryForm } from '@/components/leads/InstitutionalInquiryForm';
import { BackgroundGrid } from '@/components/use-cases/BackgroundGrid';
import { Sparkles, ArrowRight, ShieldCheck, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { PilotNavbarSimple } from '@/components/pilot/PilotNavbarSimple';
import { KnowledgeBaseCarousel } from '@/components/pilot/KnowledgeBaseCarousel';
import { JsonLdWebPage, JsonLdBreadcrumbList } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
    title: 'Pilot Management Portal | Institutional LMS Transformation',
    description: 'Launch your institutional LMS pilot with Schologic. Secure, AI-powered learning management tailored for universities, colleges, and TVET institutions across Africa.',
    keywords: [
        'Institutional LMS Pilot',
        'Pilot Management Portal',
        'Academic Integrity Pilot',
        'School Logic LMS',
        'Schoologic',
        'White Label LMS',
        'instructor productivity tools',
        'Schologic Pilot Program',
        'LMS Deployment Strategy',
        'AI Grading Pilot',
        'African Higher Education Technology',
        'learning management kenya',
        'free institutional pilot',
        'custom lms'
    ],
    alternates: {
        canonical: 'https://pilot.schologic.com',
    }
};

export default function PilotLandingPage() {
    return (
        <main className="min-h-screen bg-white selection:bg-indigo-500/30">
            <PilotNavbarSimple />

            <JsonLdWebPage
                name="Schologic LMS Pilot Management Portal"
                alternateName={["School Logic LMS", "Schoologic", "School Logic"]}
                description="Get a custom, white label LMS in four steps. We simplify creating a flexible digital campus through the pilot management portal where stakeholders boost productivity, collaborate on design, and evaluate the pilot KPIs."
                url="https://pilot.schologic.com"
            />
            <JsonLdBreadcrumbList
                items={[
                    { name: 'Pilot Portal', item: 'https://pilot.schologic.com' }
                ]}
            />

            {/* HERO SECTION */}
            <section className="relative pt-24 pb-10 md:pt-32 md:pb-16 overflow-hidden bg-white border-b border-slate-200">
                <BackgroundGrid variant="amber" />

                <div className="w-full pl-3 pr-4 md:pr-12 lg:pr-16 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">

                        {/* LEFT COLUMN: Narrative */}
                        <div className="md:col-span-7 flex flex-col pt-0">

                            <h1 className="text-[2.75rem] leading-[1.2] sm:text-5xl md:text-6xl font-serif font-bold text-slate-900 mb-8 tracking-tight">
                                Create the learning <br />
                                management system <br />
                                you need.
                            </h1>

                            <p className="text-lg md:text-xl text-slate-600 leading-10 md:leading-loose mb-10 font-light max-w-2xl">
                                Get a custom, <strong>white label LMS</strong> in four steps. We simplify creating a flexible digital campus through the pilot management portal where stakeholders boost <strong>productivity</strong>, collaborate on design, and evaluate the pilot KPIs.
                            </p>

                            <div className="mt-auto pt-8 border-t border-slate-200/60 max-w-2xl">
                                <div className="flex flex-col gap-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest font-sans">Institutional Advantage</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                                        <div className="flex items-start gap-4 group">
                                            <div className="mt-1 w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all duration-300">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <h3 className="text-sm font-bold text-slate-900 leading-none">Unified Governance</h3>
                                                <p className="text-xs text-slate-500 leading-relaxed font-light">Centralize leadership, IT, and faculty in one secure portal.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 group">
                                            <div className="mt-1 w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all duration-300">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <h3 className="text-sm font-bold text-slate-900 leading-none">Asynchronous Design</h3>
                                                <p className="text-xs text-slate-500 leading-relaxed font-light">Architect your ideal digital campus at your own institutional pace.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 group">
                                            <div className="mt-1 w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all duration-300">
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <h3 className="text-sm font-bold text-slate-900 leading-none">Data-Driven Insights</h3>
                                                <p className="text-xs text-slate-500 leading-relaxed font-light">Track module success and define KPIs with an ROI blueprint.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 group">
                                            <div className="mt-1 w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all duration-300">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <h3 className="text-sm font-bold text-slate-900 leading-none">Evidence-Based ROI</h3>
                                                <p className="text-xs text-slate-500 leading-relaxed font-light">Move from inquiry to proof without procurement friction.</p>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="pt-6 border-t border-slate-100/50 mt-4">
                                        <div className="flex items-center gap-3 group/cta cursor-default">
                                            <span className="text-2xl font-bold text-slate-900 leading-tight">Fill the form to begin your pilot today</span>
                                            <ArrowRight className="w-6 h-6 text-indigo-500 animate-bounce-x" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: 2-Step Form */}
                        <div className="md:col-span-5 relative md:pt-20">
                            <InstitutionalInquiryForm />
                        </div>

                    </div>
                </div>
            </section>

            {/* SECTION 2: THE 4-STEP PILOT JOURNEY */}
            <section className="py-16 md:py-20 lg:h-[550px] flex items-center bg-slate-50 border-y border-slate-100 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">The 4-Step Pilot Journey</h2>
                        <p className="text-slate-700 font-sans font-light">From initial inquiry to evidence-based ROI evaluation.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* STEP 1 */}
                        <div className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-500 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="font-mono font-black">01</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Institutional Inquiry</h3>
                            <p className="text-sm text-slate-700 leading-relaxed font-light">
                                Submit a secure request through your institutional lead. Provide university credentials to initiate automated provisioning, ensuring your private tenant maintains maximum data sovereignty and security.
                            </p>
                        </div>

                        {/* STEP 2 */}
                        <div className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-500 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="font-mono font-black">02</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Configuration</h3>
                            <p className="text-sm text-slate-700 leading-relaxed font-light">
                                Invite five stakeholders to your unified workspace. Use our 'Pilot Architect' to select modules, white-label the interface, and define success KPIs, ensuring your team remains aligned.
                            </p>
                        </div>

                        {/* STEP 3 */}
                        <div className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-500 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="font-mono font-black">03</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Live Sandbox</h3>
                            <p className="text-sm text-slate-700 leading-relaxed font-light">
                                Launch your dedicated tenant within two weeks. Your environment arrives pre-loaded with branding and institutional OER cartridges, enabling live testing with real-world datasets for immediate evaluation.
                            </p>
                        </div>

                        {/* STEP 4 */}
                        <div className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-500 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="font-mono font-black">04</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">ROI Evaluation</h3>
                            <p className="text-sm text-slate-700 leading-relaxed font-light">
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
                            <p className="text-slate-700 font-sans font-light text-lg">Scale your digital campus with precision. Choose the foundations you need and the intelligent values you want.</p>
                        </div>
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] border-l border-slate-200 pl-6 hidden md:block">
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
                                        The foundational command center for your entire teaching workflow. It provides instructors with effortless class creation, automated assignment tracking, and a unified grades table. Built for scalability, it allows universities to manage thousands of concurrent users while maintaining simple, intuitive navigation that enhances instructor <strong>productivity</strong>.
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
                                        Reclaim instructors' time and maximize teaching <strong>productivity</strong> with automated rubrics and deterministic grading feedback. This module reduces manual grading workloads by up to 80% through automated routine evaluations, allowing faculty to focus on high-impact teaching.
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
                        <p className="text-slate-700 font-sans font-light max-w-2xl mx-auto mb-8">Browse our documentation or get quick answers to frequently asked institutional questions.</p>
                        <Link
                            href="/pilot-knowledge-base"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-full font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
                        >
                            Knowledge Base
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-indigo-500" />
                        </Link>
                    </div>
                </div>

                <KnowledgeBaseCarousel />

                <div className="container mx-auto px-6">

                    {/* FAQ SNEAK PEEK */}
                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="p-6 bg-white rounded-2xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 mb-2">Is the Schologic Pilot completely free?</h5>
                            <p className="text-sm text-slate-700 leading-relaxed">The standard 2-4 week pilot requires a nominal setup investment based on the size of the institution and the specific modules requested (e.g., custom domain provisioning, dedicated cloud infrastructure for your <strong>white label LMS</strong>). However, this is a zero-risk investment: if your institution converts to a full enterprise contract after the pilot, 100% of the pilot setup costs are credited back to your account.</p>
                        </div>
                        <div className="p-6 bg-white rounded-2xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 mb-2">How long does it take to start the pilot?</h5>
                            <p className="text-sm text-slate-700 leading-relaxed">Once the Institutional Champion formally submits the customized Pilot Blueprint, our engineering team requires 1 to 2 weeks to provision your servers, apply your white-label branding, and configure your specific academic modules. You can track this progress live in the Pilot Management Portal.</p>
                        </div>
                        <div className="p-6 bg-white rounded-2xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 mb-2">How many students and instructors can participate?</h5>
                            <p className="text-sm text-slate-700 leading-relaxed">To ensure a focused and highly measurable trial, we strongly recommend capping the pilot at a maximum of 200 students (or 10% of your student body, whichever is lower) and between 2 to 5 Lead Instructors/HODs. This ensures manageable data collection and focused support.</p>
                        </div>
                        <div className="p-6 bg-white rounded-2xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 mb-2">Is our student data safe during the pilot?</h5>
                            <p className="text-sm text-slate-700 leading-relaxed">Absolutely. Schologic operates under strict Data Sovereignty principles and complies fully with the Kenya Data Protection Act (KDPA). All data is hosted securely, and Schologic retains zero rights to your institution's intellectual property or student records. Your pilot tenant is entirely isolated from other institutions.</p>
                        </div>
                        <div className="p-6 bg-white rounded-2xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 mb-2">What happens to our data if we do not proceed after the pilot?</h5>
                            <p className="text-sm text-slate-700 leading-relaxed">If your institution chooses not to upgrade to an enterprise license after the trial period, your committee will be given a 14-day window to export all grades, reports, and administrative data. After this window, the pilot tenant and all associated data are permanently and securely deleted from our servers.</p>
                        </div>
                        <div className="p-6 bg-white rounded-2xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 mb-2">Can we invite more than 5 members to the Pilot Committee?</h5>
                            <p className="text-sm text-slate-700 leading-relaxed">The Pilot Management Portal is optimized for a core decision-making committee of up to 5 members (e.g., Champion, HODs, Lead Instructors, IT Admin). If you require a larger governance board to review the configurations, please mention this in the discussion board, and our team can adjust your portal limits.</p>
                        </div>
                        <div className="p-6 bg-white rounded-2xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 mb-2">Do we need a dedicated IT team to run the Schologic Pilot?</h5>
                            <p className="text-sm text-slate-700 leading-relaxed">No. Because Schologic is a fully managed, cloud-native SaaS platform, our team handles all server provisioning, security patching, and uptime monitoring. Your IT department only needs to be involved for initial governance approval and reviewing data sovereignty documentation.</p>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-sm text-slate-600 mb-6 font-mono tracking-widest">INSTITUTIONAL GATEWAY <span className="text-slate-400 font-sans mx-2">|</span> <span className="text-xs text-slate-400">(Often searched as <strong>School Logic</strong> or <strong>Schoologic</strong>)</span></p>
                        <a href="https://schologic.com" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl active:scale-95">
                            Return to Main Site
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>
        </main >
    );
}
