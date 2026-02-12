import { UseCasesHero } from "@/components/use-cases/UseCasesHero";
import { SectionGrid, GridColumn } from "@/components/use-cases/SectionGrid";
import { Shield, Brain, BookOpen, Share2, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { UniversitiesPilotCTA } from "@/components/use-cases/universities/UniversitiesPilotCTA";
import { UniversitiesHeroVisual } from "@/components/use-cases/universities/UniversitiesHeroVisual";
import { PracticumProcessVisual } from "@/components/use-cases/universities/PracticumProcessVisual";
import { TAInsightsVisual } from "@/components/use-cases/TAInsightsVisual";

export const metadata: Metadata = {
    title: 'University LMS Kenya | Academic Integrity & Multi-Campus Management | Schologic',
    description: 'Eliminate campus silos, automate TVET practicum tracking, and secure academic integrity with AI detection. The unified platform for Kenya\'s leading universities with CUE compliance built-in.',
    keywords: ['university lms kenya', 'academic integrity software', 'practicum management', 'multi-campus platform', 'student retention analytics', 'OER integration', 'TVET compliance', 'open and distance learning', 'online classes', 'virtual learning'],
};

export default function UniversitiesPage() {
    return (
        <div>
            {/* 1. Hero Section */}
            <UseCasesHero
                title="The Operating System for the Modern University."
                subtitle="Unify campuses. Automate practicums. Secure degrees. One sovereign platform for leading institutions in Kenya and beyond."
                label="For Universities"
                accentColor="indigo"
                ctaText="Request Institutional Pilot"
                ctaHref="/#request-pilot"
                secondaryCtaText="View Live Instructor Demo"
                secondaryCtaHref="/demo"
                visualPosition="right"
                visual={
                    <div className="relative w-full max-w-[400px] aspect-square">
                        <UniversitiesHeroVisual />
                    </div>
                }
            />

            {/* 2. Institutional Integrity (AI Detection) - Indigo Theme */}
            <div className="bg-indigo-50 py-24">
                <SectionGrid id="integrity">
                    <GridColumn span={6} className="order-2 md:order-1 flex items-center">
                        <div className="prose prose-lg prose-slate pr-6">
                            <p>
                                We empower instructors with "Human-in-the-Loop" controls, allowing them to adjust sensitivity based on assessment type. Your student data never leaves Schologic's encrypted infrastructure and is never used for third-party model training, ensuring absolute <strong>data sovereignty</strong>.
                            </p>
                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-indigo-100 mt-6">
                                <Image
                                    src="/images/universities/university-ai-content-detection.svg"
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
            <div className="bg-white py-24">
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
            <div className="bg-purple-50 py-24">
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
            <div className="bg-white py-24">
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
                    <GridColumn span={6}>
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 h-full relative overflow-hidden group">
                            {/* Visual Placeholder: Universal Reader UI */}
                            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                                <div className="text-slate-400 font-medium font-mono text-sm px-4 text-center">
                                    Visual Placeholder: <br /> Universal Reader UI
                                </div>
                            </div>
                        </div>
                    </GridColumn>
                </SectionGrid>
            </div>

            {/* 6. Multi-Campus Management - Light Amber Theme */}
            <div className="bg-amber-50 py-24">
                <SectionGrid>
                    <GridColumn span={6} className="order-2 md:order-1">
                        <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm h-full relative overflow-hidden group">
                            {/* Visual Placeholder: Campus Map Network */}
                            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                                <div className="text-slate-400 font-medium font-mono text-sm px-4 text-center">
                                    Visual Placeholder: <br /> Campus Map Network
                                </div>
                            </div>
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
            <div className="bg-white py-24">
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
                                    By aggregating data from the <a href="/instructor/dashboard" className="text-rose-600 hover:text-rose-700 underline decoration-rose-200 underline-offset-4 font-medium">Instructor Dashboard</a> across all campuses, we provide a live pulse of your institution's health, enabling proactive resource deployment.
                                </p>
                            </div>
                        </div>
                    </GridColumn>
                    <GridColumn span={6}>
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 h-full relative overflow-hidden group">
                            {/* Visual Placeholder: Dean Analytics Dashboard */}
                            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                                <div className="text-slate-400 font-medium font-mono text-sm px-4 text-center">
                                    Visual Placeholder: <br /> Dean Analytics Dashboard
                                </div>
                            </div>
                        </div>
                    </GridColumn>
                </SectionGrid>
            </div>

            {/* 8. Final CTA */}
            <div className="bg-gradient-to-b from-indigo-50 to-white py-24 text-center bg-grid-indigo-500/10">
                <SectionGrid>
                    <GridColumn span={8} className="mx-auto">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-indigo-900/5 flex items-center justify-center mx-auto mb-8 transform rotate-3">
                            <Shield className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
                            Transform Your Institution. Start Today.
                        </h2>
                        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Join the leading universities in Kenya who are unifying their academic operations with Schologic. Whether you manage one campus or ten, whether you deliver traditional lectures or <strong>open and distance learning</strong>, we provide the sovereign infrastructure to ensure quality, compliance, and student success.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <UniversitiesPilotCTA />
                            <Link
                                href="/demo"
                                className="text-slate-600 font-bold hover:text-indigo-600 transition-colors flex items-center gap-2 text-lg"
                            >
                                View Live Instructor Demo <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="mt-12 flex justify-center gap-8 text-indigo-600/80 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> CUE & TVETA Compliant
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Data Protection Act Aligned
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> 99.99% Uptime SLA
                            </div>
                        </div>
                    </GridColumn>
                </SectionGrid>
            </div>
        </div>
    );
}
