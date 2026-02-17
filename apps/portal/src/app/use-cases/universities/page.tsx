import { UseCasesHero } from "@/components/use-cases/UseCasesHero";
import { SectionGrid, GridColumn } from "@/components/use-cases/SectionGrid";
import { UseCaseCTA } from "@/components/use-cases/UseCaseCTA";
import { Shield, Brain, BookOpen, Share2, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

import { UniversitiesHeroVisual } from "@/components/use-cases/universities/UniversitiesHeroVisual";
import dynamic from 'next/dynamic';

const PracticumProcessVisual = dynamic(() => import("@/components/landing/visuals/PracticumProcessVisual").then(mod => mod.PracticumProcessVisual), { ssr: false });
const TAInsightsVisual = dynamic(() => import("@/components/landing/visuals/TAInsightsVisual").then(mod => mod.TAInsightsVisual), { ssr: false });
const ZTCIngestionVisual = dynamic(() => import("@/components/landing/visuals/ZTCIngestionVisual").then(mod => mod.ZTCIngestionVisual), { ssr: false });
const DeanDashboardVisual = dynamic(() => import("@/components/landing/visuals/DeanDashboardVisual").then(mod => mod.DeanDashboardVisual), { ssr: false });
const SystemEcosystemVisual = dynamic(() => import("@/components/landing/visuals/SystemEcosystemVisual").then(mod => mod.SystemEcosystemVisual), { ssr: false });
import { JsonLdFAQPage } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
    title: 'University LMS Kenya | Academic Integrity & Multi-Campus Management | Schologic',
    description: 'Eliminate campus silos, automate TVET practicum tracking, and secure academic integrity with AI detection. The unified platform for Kenya\'s leading universities with CUE compliance built-in.',
    keywords: ['university lms kenya', 'academic integrity software', 'practicum management', 'multi-campus platform', 'student retention analytics', 'OER integration', 'TVET compliance', 'open and distance learning', 'online classes', 'virtual learning', 'CUE accreditation', 'data sovereignty'],
};

const faqItems = [
    { question: "How does Schologic handle multi-campus deployments?", answer: "Our architecture supports granular Role-Based Access Control. A Head of Department sees their courses across campuses, while Deans get an institution-wide view. Curriculum updates propagate instantly to all campuses." },
    { question: "Is data hosted locally in compliance with the Data Protection Act?", answer: "Yes. All student and institutional data is processed and stored on sovereign infrastructure within Kenya, fully aligned with the Data Protection Act 2019." },
    { question: "Can we integrate with our existing Student Information System?", answer: "Schologic is designed to complement your SIS, not replace it. We provide APIs and export formats that allow seamless data exchange with existing systems like KUCCPS portals." },
    { question: "What does the institutional pilot include?", answer: "A full-featured deployment for your chosen departments, onboarding support, faculty training sessions, and a dedicated success manager. No cost during the pilot period." },
    { question: "How does the AI detection work at scale?", answer: "Our integrity engine processes submissions in bulk, flagging AI-generated content, paraphrased text, and potential plagiarism. Results are aggregated on the Dean's Dashboard for institutional oversight." },
];

export default function UniversitiesPage() {
    return (
        <div>
            <JsonLdFAQPage items={faqItems} />
            {/* 1. Hero Section */}
            <UseCasesHero
                title="The Operating System for the Modern University."
                subtitle="Unify campuses. Automate practicums. Secure degrees. One sovereign platform for leading institutions in Kenya and beyond."
                label="For Universities"
                accentColor="indigo"
                ctaText="Request a Pilot"
                ctaHref="/#request-pilot"
                secondaryCtaText="View Live Demo"
                secondaryCtaHref="/demo"
                visualPosition="right"
                visual={
                    <div className="hidden md:block relative w-full max-w-[400px] aspect-square">
                        <UniversitiesHeroVisual />
                    </div>
                }
            />

            {/* 2. Institutional Integrity (AI Detection) - Indigo Theme */}
            <div className="bg-indigo-50 py-12 md:py-20">
                <SectionGrid id="integrity">
                    <GridColumn span={6} className="order-2 md:order-1 flex items-center">
                        <div className="prose prose-lg prose-slate pr-6">
                            <p>
                                We empower instructors with "Human-in-the-Loop" controls, allowing them to adjust sensitivity based on assessment type. Your student data never leaves Schologic's encrypted infrastructure and is never used for third-party model training, ensuring absolute <strong>data sovereignty</strong>.
                            </p>
                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-indigo-100 mt-6">
                                <Image
                                    src="/images/universities/university-ai-content-detection.webp"
                                    alt="Schologic Integrity Hub - AI Content Detection Dashboard with granularity controls"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </GridColumn>
                    <GridColumn span={6} className="order-1 md:order-2 flex items-center">
                        <div className="prose prose-lg prose-slate pl-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <Shield className="w-3 h-3" /> Institutional Integrity
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                                Protect the Value of Your Degree in the Age of AI.
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    <strong>Academic integrity</strong> is facing an unprecedented crisis. With recent studies indicating that <a href="https://anara.com/ai-in-education-statistics" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 underline decoration-indigo-200 underline-offset-4 font-medium">over 86% of students globally utilize AI tools</a> for their coursework, traditional methods of <strong>plagiarism detection</strong> are no longer sufficient. Institutions must now analyze the <em>provenance</em> of student work to distinguish between genuine scholarship and AI-generated fabrication.
                                </p>
                                <p>
                                    Schologic's <strong>Integrity Hub</strong> provides a sovereign, multi-model <strong>AI content detection</strong> engine within our secure, tenant-isolated infrastructure. Unlike "black box" solutions that offer a simple percentage, our <a href="/features/ai-detection" className="text-indigo-600 hover:text-indigo-700 underline decoration-indigo-200 underline-offset-4 font-medium">AI Detection</a> engine provides granular, paragraph-level analysis using three distinct models to triangulate authenticity.
                                </p>
                            </div>
                        </div>
                    </GridColumn>
                </SectionGrid>
            </div>

            {/* 3. Employability & Verification (Practicum) - White Background */}
            <div className="bg-white py-12 md:py-20">
                <SectionGrid>
                    <GridColumn span={6} className="flex items-center">
                        <div className="prose prose-lg prose-slate pr-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <CheckCircle className="w-3 h-3" /> Employability & Verification
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                                Bridge the Gap Between Theory and Practice.
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    For University Deans, the <strong>industrial attachment</strong> phase is often a "black hole" of data. Students leave the campus, and administrative visibility vanishes until they return with a signed physical logbook. This lack of oversight contributes to the "theory-practice gap," where <a href="https://www.universityworldnews.com/post.php?story=20190815121749809" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 underline decoration-emerald-200 underline-offset-4 font-medium">graduates lack the practical skills employers demand</a>.
                                </p>
                                <p>
                                    Schologic's <a href="/features/practicum-manager" className="text-emerald-600 hover:text-emerald-700 underline decoration-emerald-200 underline-offset-4 font-medium">Practicum Management System</a> transforms this chaotic process into a verifiable digital workflow with <strong>built-in audit trails for CUE program reviews and TVETA compliance reporting</strong>. We digitize physical logbooks, allowing students to log daily activities with timestamped evidence.
                                </p>
                                <p>
                                    Crucially, we close the feedback loop with <strong>secure automated email evaluations</strong> for industry supervisors. By digitizing supervision, Faculties can identify struggling students weeks before the attachment ends, intervening to ensure successful outcomes and regulatory compliance.
                                </p>
                            </div>
                            <div className="mt-8">
                                <Link href="/#request-pilot" className="text-emerald-600 font-bold hover:text-emerald-700 inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors">
                                    Begin your institutional pilot <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </GridColumn>
                    <GridColumn span={6}>
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 h-full relative overflow-hidden group flex items-center justify-center">
                            <PracticumProcessVisual />
                        </div>
                    </GridColumn>
                </SectionGrid>
            </div>

            {/* 4. Faculty Empowerment (AI TA) - Light Purple Theme */}
            <div className="bg-purple-50 py-12 md:py-20">
                <SectionGrid>
                    <GridColumn span={6} className="order-2 md:order-1 flex items-center justify-center">
                        <div className="w-full flex justify-center transform hover:scale-[1.02] transition-transform duration-500">
                            <TAInsightsVisual />
                        </div>
                    </GridColumn>
                    <GridColumn span={6} className="order-1 md:order-2 flex items-center">
                        <div className="prose prose-lg prose-slate pl-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <Brain className="w-3 h-3" /> Faculty Empowerment
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                                Reduce Faculty Turnover Without Increasing Headcount.
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Faculty burnout is a strategic risk for <strong>higher education management</strong>. As enrollment numbers grow, the administrative burden of grading becomes unsustainable. <a href="https://artsmart.ai/blog/ai-in-education-statistics" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline decoration-purple-200 underline-offset-4 font-medium">Global surveys show that 68% of educators</a> are already turning to unvetted AI tools, creating shadow IT risks.
                                </p>
                                <p>
                                    Schologic provides a sanctioned, secure alternative: an <a href="/features/ai-teaching-assistant" className="text-purple-600 hover:text-purple-700 underline decoration-purple-200 underline-offset-4 font-medium">AI Teaching Assistant</a> integrated directly into the grading workflow—ideal for <strong>online classes</strong> and <strong>open and distance learning</strong> programs.
                                </p>
                                <p>
                                    Our AI Co-pilot instantly generates pedagogical rubrics and drafts personalized feedback for student submissions, which the instructor reviews and approves. This "human-in-the-loop" approach reduces grading time by up to 75%. By removing administrative drudgery, you improve <strong>faculty retention</strong> and increase research output without expanding your payroll.
                                </p>
                            </div>
                        </div>
                    </GridColumn>
                </SectionGrid>
            </div>

            {/* 5. Sovereign Content Strategy (OER) - White Background */}
            <div className="bg-white py-12 md:py-20">
                <SectionGrid>
                    <GridColumn span={6} className="flex items-center">
                        <div className="prose prose-lg prose-slate pr-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <BookOpen className="w-3 h-3" /> Sovereign Content Strategy
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                                Zero Textbook Costs. Zero Compromise.
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    The cost of learning materials is a primary driver of <strong>student attrition</strong> in Kenyan universities. Leading institutions globally are increasingly adopting <strong>Open Educational Resources (OER)</strong>, with <a href="https://www.universityworldnews.com/post.php?story=20230915103059870" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline decoration-blue-200 underline-offset-4 font-medium">research showing significant cost savings</a>. However, the OER user experience is often fragmented.
                                </p>
                                <p>
                                    Schologic's <a href="/features/universal-reader" className="text-blue-600 hover:text-blue-700 underline decoration-blue-200 underline-offset-4 font-medium">Universal Reader</a> unifies your <strong>OER integration</strong> strategy for both campus-based and <strong>virtual learning</strong> environments. It ingests content from global repositories like LibreTexts and OpenStax (via Common Cartridge) and renders it in a standardized, premium reading interface.
                                </p>
                                <p>
                                    This allows your institution to mandate a "<strong>Zero Textbook Cost</strong>" (ZTC) policy for first-year courses without forcing students to struggle with poor-quality scans. By controlling the reading experience, you also gain <strong>learning analytics</strong> on student engagement—knowing exactly who has read assigned material before the lecture begins.
                                </p>
                            </div>
                        </div>
                    </GridColumn>
                    <GridColumn span={6} className="flex items-center justify-center">
                        <div className="w-full transform hover:scale-[1.02] transition-transform duration-500">
                            <ZTCIngestionVisual />
                        </div>
                    </GridColumn>
                </SectionGrid>
            </div>

            {/* 6. Multi-Campus Management - Light Amber Theme */}
            <div className="bg-amber-50 py-12 md:py-20">
                <SectionGrid>
                    <GridColumn span={6} className="order-2 md:order-1 flex items-center justify-center">
                        <div className="w-full transform hover:scale-[1.02] transition-transform duration-500">
                            <SystemEcosystemVisual />
                        </div>
                    </GridColumn>
                    <GridColumn span={6} className="order-1 md:order-2 flex items-center">
                        <div className="prose prose-lg prose-slate pl-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <Share2 className="w-3 h-3" /> Multi-Campus Management
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                                One University. One Standard.
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    As universities expand to satellite campuses, the risk of "siloed" operations increases. <a href="https://element451.com/blog/breaking-down-data-silos" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 underline decoration-amber-200 underline-offset-4 font-medium">Data fragmentation</a> is frequently cited as the number one barrier to strategic decision-making in <strong>higher education management</strong>.
                                </p>
                                <p>
                                    Schologic solves this with a unified architecture designed for multi-campus realities. Our robust [Class Manager](/features/class-manager) utilizes granular <strong>Role-Based Access Control (RBAC)</strong> to ensure data visibility. A Head of Department can oversee curriculum compliance across all campuses, while a Dean retains a holistic view.
                                </p>
                                <p>
                                    When the Main Campus updates a curriculum, satellite campuses instantly see the changes. This unified approach ensures that a student in a remote campus receives the exact same standard of instruction as a student at the headquarters.
                                </p>
                            </div>
                        </div>
                    </GridColumn>
                </SectionGrid>
            </div>

            {/* 7. Dean's Dashboard - White Background */}
            <div className="bg-white py-12 md:py-20">
                <SectionGrid>
                    <GridColumn span={6} className="flex items-center">
                        <div className="prose prose-lg prose-slate pr-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <TrendingUp className="w-3 h-3" /> The Dean's Dashboard
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                                Management by Exception.
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    University leaders are often data-rich but insight-poor. You drown in end-of-semester PDF reports that arrive too late. <a href="https://eab.com/insights/blogs/student-success/data-decision-making" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:text-rose-700 underline decoration-rose-200 underline-offset-4 font-medium">Research confirms</a> that timely access to actionable <strong>enrollment analytics</strong> is the single biggest differentiator for high-performing institutions.
                                </p>
                                <p>
                                    The Schologic <strong>Dean's Dashboard</strong> is designed for "Management by Exception." It surfaces anomalies requiring executive intervention: a department where grading turnaround is slow, a course where <strong>student retention</strong> risk has spiked, or a rise in academic integrity flags.
                                </p>
                                <p>
                                    By aggregating data from the <a href="/features/class-manager" className="text-rose-600 hover:text-rose-700 underline decoration-rose-200 underline-offset-4 font-medium">Class Manager</a> across all campuses, we provide a live pulse of your institution's health, enabling proactive resource deployment.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-6">
                                <Link href="/?mode=invite" className="inline-flex items-center gap-2 text-rose-600 font-bold hover:text-rose-700 transition-colors">
                                    <Share2 className="w-4 h-4" /> Invite an Instructor
                                </Link>
                            </div>
                        </div>
                    </GridColumn>
                    <GridColumn span={6}>
                        <div className="h-full flex items-center justify-center">
                            <DeanDashboardVisual />
                        </div>
                    </GridColumn>
                </SectionGrid>
            </div>

            {/* 8. Final CTA */}
            <UseCaseCTA
                accentColor="indigo"
                icon={<Shield className="w-8 h-8 text-indigo-600" />}
                heading="Transform Your Institution."
                subtitle="Unify campuses, automate assessment, and ensure regulatory compliance with one sovereign platform. Whether you manage one campus or ten, Schologic provides the infrastructure for quality and student success."
                primaryCta={{
                    text: "Request a Pilot",
                    href: "/#request-pilot",
                }}
                secondaryCta={{
                    text: "View Live Demo",
                    href: "/demo",
                }}
                badges={[
                    { icon: <CheckCircle className="w-4 h-4" />, label: "CUE & TVETA Compliant" },
                    { icon: <CheckCircle className="w-4 h-4" />, label: "Data Protection Act Aligned" },
                    { icon: <CheckCircle className="w-4 h-4" />, label: "99.99% Uptime SLA" },
                ]}
                faqItems={faqItems}
            />
        </div>
    );
}
