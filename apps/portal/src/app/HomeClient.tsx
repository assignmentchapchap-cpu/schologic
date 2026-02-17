'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import { LightHero } from '@/components/landing/LightHero';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import {
    IntegrityCheckVisual,
    TAInsightsVisual,
    PracticumProcessVisual,
    ZTCIngestionVisual,
    StudentMobileCarousel,
    SystemEcosystemVisual
} from '@/components/landing/visuals/LazyVisuals';
import { BackgroundGrid } from '@/components/use-cases/BackgroundGrid';
import {
    FileText, Shield, Activity,
    Sparkles, Users,
    MapPin, CheckCircle, Target,
    BookOpen, Globe, Repeat,
    Smartphone, Calendar,
    Lock, Eye, Share2,
    FileCheck
} from 'lucide-react';
import Footer from '@/components/landing/Footer';
import DemoSignupModal from '@/components/auth/DemoSignupModal';
import InstitutionalPilotModal from '@/components/leads/InstitutionalPilotModal';
import ShareDemoModal from '@/components/landing/ShareDemoModal';
import { JsonLdWebSite } from "@/components/seo/JsonLd";

export default function HomeClient() {
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [showPilotModal, setShowPilotModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash === '#request-pilot') {
            setShowPilotModal(true);
        }

        const mode = searchParams.get('mode');
        if (mode === 'demo') {
            setShowDemoModal(true);
        } else if (mode === 'invite') {
            setShowInviteModal(true);
        }
    }, [searchParams]);

    return (
        <main className="min-h-screen bg-white selection:bg-indigo-500/30">
            <JsonLdWebSite />
            <Navbar onOpenDemo={() => setShowDemoModal(true)} />

            {/* Section 1: The Authority Hook */}
            <LightHero />

            {/* Section 2: Forensic Evidence */}
            <FeaturesSection
                eyebrow="Evidence-Based Integrity"
                title="Protect Reputation with Multi-Model Forensics."
                description="Detect AI-generated content with unparalleled transparency. We strictly avoid 'black box' guessing by using a multi-stage analysis engine."
                align="left"
                visual={<IntegrityCheckVisual />}
                visualScaleClass="scale-[0.95] md:scale-[0.75] group-hover:scale-[1.05] md:group-hover:scale-[0.8] origin-center"
                features={[
                    {
                        icon: FileText,
                        title: "Segment Analysis",
                        description: "Submissions are split into semantic units to isolate specific AI-generated claims."
                    },
                    {
                        icon: Shield,
                        title: "Multi-Model Scan",
                        description: "Files run against 3 specialized models (RoBERTa, AI Content Detector, OpenAI Base) to catch distinct patterns."
                    },
                    {
                        icon: Activity,
                        title: "Authenticity Score",
                        description: "Weighted triangulation filters false positives, giving you actionable proof."
                    }
                ]}
            />

            {/* Section 3: AI Teaching Assistant */}
            <FeaturesSection
                eyebrow="Instructor Productivity Engine"
                title="Scale Personalized Learning with 24/7 AI Assistants."
                description="Reduce grading time by up to 80% without sacrificing quality. Our AI drafts feedback based on YOUR rubric—the ideal companion for distance learning environments."
                align="right"
                className="bg-slate-50"
                visual={<TAInsightsVisual />}
                visualScaleClass="scale-[0.9] md:scale-[0.65] group-hover:scale-[0.95] md:group-hover:scale-[0.7] origin-center"
                features={[
                    {
                        icon: Sparkles,
                        title: "Rubric Generator",
                        description: "Convert a simple prompt into a standardized 5-point rubric in seconds."
                    },
                    {
                        icon: Target,
                        title: "Deterministic Scoring",
                        description: "Anti-Hallucination logic maps student work to criteria, never inventing grades."
                    },
                    {
                        icon: Users,
                        title: "Platform Copilot",
                        description: "Context-aware help for navigating the portal and finding resources."
                    }
                ]}
            />

            {/* Section 4: Practicum Management */}
            <FeaturesSection
                eyebrow="Field Placement Tracking"
                title="TVET & Industrial Attachment Management."
                description="Digitize the entire placement lifecycle for Teaching Practice and Industrial Attachments. Replace paper logbooks with a verified digital trail for CUE compliance."
                align="left"
                className="bg-white"
                visual={<PracticumProcessVisual />}
                visualScaleClass="scale-[0.9] md:scale-[0.65] group-hover:scale-[0.95] md:group-hover:scale-[0.7] origin-center"
                features={[
                    {
                        icon: MapPin,
                        title: "Placement Workflow",
                        description: "Automated enrollment and site assignment for thousands of students."
                    },
                    {
                        icon: CheckCircle,
                        title: "Supervision Tracking",
                        description: "Automated log verification for supervisors and electronic supervisor reports."
                    },
                    {
                        icon: Target,
                        title: "Assessment Framework",
                        description: "Competency-based evaluation matrices for precise skill tracking."
                    }
                ]}
            />

            {/* Section 5: Zero Textbook Cost */}
            <FeaturesSection
                eyebrow="OER Library Integration"
                title="Eliminate Textbook Costs with Open Learning."
                description="Import high-quality, peer-reviewed content from LibreTexts and OpenStax directly into your course with one click. Supporting open learning standards for every student."
                align="right"
                className="bg-slate-50"
                visual={<ZTCIngestionVisual />}
                visualScaleClass="scale-[0.9] md:scale-[0.65] group-hover:scale-[0.95] md:group-hover:scale-[0.67] origin-center"
                features={[
                    {
                        icon: BookOpen,
                        title: "Zero Textbook Cost",
                        description: "Replace expensive textbooks with free, high-quality OER materials."
                    },
                    {
                        icon: Globe,
                        title: "Global Connectivity",
                        description: "IMS Common Cartridge support ensures compatibility with global repositories."
                    },
                    {
                        icon: Repeat,
                        title: "Remix & Adapt",
                        description: "Full editorial control to mix chapters, add localized content, and customize flow."
                    }
                ]}
            />

            {/* Section 6: Mobile First */}
            <FeaturesSection
                eyebrow="Mobile Optimized Learning"
                title="Learning That Fits in Every Student's Pocket."
                description="Designed for the reality of student life. A fully mobile-optimized app for online learning that allows students to submit assignments and track progress anywhere."
                align="left"
                className="bg-white"
                visual={<StudentMobileCarousel />}
                visualScaleClass="scale-[0.9] md:scale-[0.75] group-hover:scale-[0.95] md:group-hover:scale-[0.8] origin-center"
                features={[
                    {
                        icon: Smartphone,
                        title: "Universal Access",
                        description: "Dashboard, Grades, and Assignments available on any smartphone."
                    },
                    {
                        icon: Activity,
                        title: "Instant Updates",
                        description: "Real-time notifications on your dashboard for grades and announcements."
                    },
                    {
                        icon: Calendar,
                        title: "Digital Logbook",
                        description: "Students document field experiences and clinical hours directly from their phone."
                    }
                ]}
            />

            {/* Section 7: RBAC */}
            <FeaturesSection
                eyebrow="Enterprise-Grade Security"
                title="Granular Governance for Complex Institutions."
                description="A unified LMS framework that ensures data privacy and compliance. Give Deans, HODs, and Admins the exact visibility they need without compromising security."
                align="right"
                className="bg-slate-50"
                visual={<SystemEcosystemVisual />}
                visualScaleClass="scale-[0.9] md:scale-[0.75] group-hover:scale-[0.95] md:group-hover:scale-[0.8] origin-center"
                features={[
                    {
                        icon: Eye,
                        title: "Customized Dashboards",
                        description: "Context-aware views for Deans, HODs, and Administrators tailored to specific KPIs."
                    },
                    {
                        icon: FileCheck,
                        title: "Departmental QA",
                        description: "Head of Department tools for tracking curriculum compliance and staff allocation."
                    },
                    {
                        icon: Lock,
                        title: "Audit Logs",
                        description: "Complete traceability of every grade change and system action."
                    }
                ]}
            />

            {/* Final Institutional CTA */}
            <section id="pilot" className="py-16 bg-slate-50 relative overflow-hidden border-t border-slate-200">
                <BackgroundGrid />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50/50 backdrop-blur-sm border border-amber-200/40 text-amber-700 text-sm font-bold mb-8 font-mono">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>INSTITUTIONAL PARTNERSHIP PROGRAM</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-8 tracking-tight">
                        Ready to transform <br />
                        Academic Excellence?
                    </h2>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        Join forward-thinking institutions using the Schologic LMS to offer smart, credible, and flexible higher education.
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center sm:justify-center sm:gap-4 w-full px-1 sm:px-0">
                        <button
                            onClick={() => setShowPilotModal(true)}
                            className="px-2 py-3 sm:px-8 sm:py-4 bg-indigo-600 text-white rounded-lg font-bold text-base sm:text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 font-sans w-full sm:w-auto sm:min-w-[280px] whitespace-nowrap"
                        >
                            Start <span className="hidden sm:inline">Your Institutional</span> Pilot
                        </button>

                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="px-2 py-3 sm:px-8 sm:py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-lg font-bold text-base sm:text-lg hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 font-sans flex items-center justify-center gap-1 sm:gap-2 w-full sm:w-auto sm:min-w-[280px] whitespace-nowrap shadow-sm"
                        >
                            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                            Invite <span className="hidden sm:inline">an</span> Instructor
                        </button>
                    </div>
                </div>
            </section>

            <Footer />

            {/* Modals */}
            {showDemoModal && (
                <DemoSignupModal onClose={() => setShowDemoModal(false)} />
            )}

            {showPilotModal && (
                <InstitutionalPilotModal onClose={() => setShowPilotModal(false)} />
            )}

            {showInviteModal && (
                <ShareDemoModal onClose={() => setShowInviteModal(false)} />
            )}

            {/* Hidden Semantic Text for AI Crawlers */}
            <div className="hidden">
                Schologic is an education technology company building the operating system for academic integrity and digital learning in Africa.
                AI content detection, automated grading, practicum management, and open educational resources for universities, colleges, and TVET institutions.
                Evidence-Based AI Detection using RoBERTa open-weights models trained on the Human ChatGPT Comparison Corpus (HC3).
                LTI 1.3 Compliant. IMS Global Common Cartridge 1.3. CUE and CDACC aligned.
            </div>
        </main>
    );
}
