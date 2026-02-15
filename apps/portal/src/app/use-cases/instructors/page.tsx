import type { Metadata } from "next";
import { UseCasesHero } from "@/components/use-cases/UseCasesHero";
import { SectionGrid, GridColumn } from "@/components/use-cases/SectionGrid";
import { UseCaseCTA } from "@/components/use-cases/UseCaseCTA";
import { InstructorVisualPlaceholder } from "@/components/use-cases/InstructorVisualPlaceholder";
import { TAInsightsVisual } from "@/components/use-cases/TAInsightsVisual";
import { PracticumProcessVisual } from "@/components/use-cases/universities/PracticumProcessVisual";
import { ZTCIngestionVisual } from "@/components/use-cases/ZTCIngestionVisual";
import { DeanDashboardVisual } from "@/components/use-cases/universities/DeanDashboardVisual";
import { IntegrityCheckVisual } from "@/components/use-cases/IntegrityCheckVisual";
import {
    Zap,
    Shield,
    MapPin,
    TrendingUp,
    BookOpen,
    ArrowRight,
    Share2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { JsonLdFAQPage } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
    title: "Schologic for Instructors | AI Grading & Retention Tools",
    description: "Slash grading time by 80% with Schologic's AI Teaching Assistant. Detect AI writing, manage digital practicums, and boost retention with real-time analytics. The OS for modern faculty.",
    keywords: ["AI grading assistant", "academic integrity software", "digital internship logbook", "student retention analytics", "plagiarism checker", "rubric generation", "higher education", "instructor LMS Kenya", "AI Teaching Assistant", "faculty workload reduction"]
};

const faqItems = [
    { question: "How long does setup take?", answer: "Under 10 minutes. Create your account, set up your first class, upload a rubric, and start grading. No IT department or institutional approval required for individual pilots." },
    { question: "Can I use my own rubrics?", answer: "Yes. Schologic supports fully custom rubrics. You define the criteria, point allocations, and descriptors. The AI applies your exact rubric consistently across all submissions." },
    { question: "How accurate is the AI grading?", answer: "Our AI teaching assistant achieves high consistency with instructor grading. Every score comes with detailed rubric-level feedback, and you can review and adjust any grade before releasing." },
    { question: "Does it detect AI-generated content?", answer: "Yes. Our built-in integrity engine detects AI-generated text, paraphrasing tools, and plagiarism — all in one scan. No need for separate third-party tools." },
    { question: "What if my institution isn't on Schologic yet?", answer: "Individual instructors can start a free pilot independently. Once you see the results, you can recommend institutional adoption through our pilot request process." },
];

export default function InstructorsPage() {
    return (
        <main className="min-h-screen bg-white">
            <JsonLdFAQPage items={faqItems} />
            {/* 1. Hero Section */}
            <UseCasesHero
                title="Reclaim Your Classroom."
                subtitle="Grade papers in seconds, not Sundays. Detect AI usage with confidence. Mentor students who usually slip through the cracks. The operating system for the modern academic."
                label="For Instructors"
                accentColor="rose"
                ctaText="Try Grading Copilot"
                ctaHref="/login?view=signup&role=instructor"
                secondaryCtaText="Start Demo"
                secondaryCtaHref="/demo"
                visual={
                    <div className="hidden md:block relative w-full max-w-[400px] aspect-square">
                        <Image
                            src="/images/instructors/abstract-hero.svg"
                            alt=""
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                }
                visualPosition="right"
            />

            {/* 2. AI-Powered Grading (Text Left, Visual Right) */}
            <SectionGrid className="bg-rose-50 py-12 md:py-20" id="grading">
                <GridColumn span={6} className="flex flex-col justify-center order-2 md:order-1">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-6 text-rose-600">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
                        Your Weekend is No Longer for Grading.
                    </h2>
                    <div className="prose prose-lg text-slate-600 mb-8">
                        <p>
                            Research indicates that university faculty spend between <a href="https://www.insidehighered.com/news/2014/04/09/research-shows-professors-work-long-hours-and-spend-much-day-meetings" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:text-rose-700 font-medium underline decoration-rose-200 underline-offset-4">10 to 20 hours per week</a> on grading alone—a staggering burden that detracts from high-impact research and mentorship. Schologic’s <strong>AI Teaching Assistant</strong> breaks this cycle by acting as your tireless, standard-calibrated co-pilot. Instead of starting every submission from a blank cursor, you receive an instant, high-quality draft of feedback and a suggested score based entirely on your specific assessment criteria.
                        </p>
                        <p>
                            Don't have a rubric? Our <strong>Rubric Generator</strong> instantly creates one aligned to Bloom's Taxonomy directly from your assignment prompt. This is not automated grading; it is <strong>augmented intelligence</strong>. You maintain full &quot;Human-in-the-Loop&quot; control to review every comment, edit the nuanced feedback, and approve the final grade. By automating the repetitive mechanics of assessment, you can reduce your grading time by up to <a href="https://asu.edu" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:text-rose-700 font-medium underline decoration-rose-200 underline-offset-4">80%</a> while actually increasing the depth and consistency of feedback your students receive. Whether it’s a 500-student lecture or a graduate seminar, give every submission the attention it deserves without the burnout.
                        </p>
                    </div>
                    <Link href="/features/ai-teaching-assistant" className="inline-flex items-center text-rose-600 font-bold hover:text-rose-700 transition-colors">
                        Explore Grading Tools <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </GridColumn>
                <GridColumn span={6} className="order-1 md:order-2">
                    <div className="w-full flex justify-center transform hover:scale-[1.02] transition-transform duration-500">
                        <TAInsightsVisual />
                    </div>
                </GridColumn>
            </SectionGrid>

            {/* 3. Academic Integrity (Visual Left, Text Right) */}
            <SectionGrid className="bg-white py-12 md:py-20" id="integrity">
                <GridColumn span={6} className="order-1">
                    <div className="h-full flex items-center justify-center py-8">
                        <IntegrityCheckVisual />
                    </div>
                </GridColumn>
                <GridColumn span={6} className="flex flex-col justify-center order-2">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 text-emerald-600">
                        <Shield className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
                        Verify Authenticity. Preserve Standards.
                    </h2>
                    <div className="prose prose-lg text-slate-600 mb-8">
                        <p>
                            With recent studies showing that <a href="https://www.turnitin.com/blog/the-state-of-ai-writing-and-originality" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:text-rose-700 font-medium underline decoration-rose-200 underline-offset-4">89% of students have used AI tools</a> for coursework, maintaining academic standards is harder than it has ever been. Traditional plagiarism checkers are simply no longer sufficient; they often fail to distinguish between malicious fabrication and legitimate, allowed AI assistance (like grammar checking). You need a system that understands nuance.
                        </p>
                        <p>
                            Schologic’s <strong>Integrity Hub</strong> provides this precision. Unlike &quot;black box&quot; tools that offer a single, opaque percentage score, our multi-model engine provides a granular, paragraph-level analysis of the document. You can adjust the sensitivity settings based on the assessment type, ensuring you don’t unfairly penalize a student for using digital aids on a creative writing assignment. Most importantly, your student submissions are processed entirely within our sovereign infrastructure and are <strong>never</strong> used to train public AI models, ensuring total data privacy and compliance. We empower you to make informed, evidence-based decisions about document authenticity, preserving the value of the degree you award.
                        </p>
                    </div>
                    <Link href="/features/ai-detection" className="inline-flex items-center text-rose-600 font-bold hover:text-rose-700 transition-colors">
                        See AI Detection in Action <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </GridColumn>
            </SectionGrid>

            {/* 4. Practicum Supervision (Text Left, Visual Right) */}
            <SectionGrid className="bg-slate-50 py-12 md:py-20" id="practicum">
                <GridColumn span={6} className="flex flex-col justify-center order-2 md:order-1">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
                        Supervise Attachments Without Leaving Campus.
                    </h2>
                    <div className="prose prose-lg text-slate-600 mb-8">
                        <p>
                            The &quot;Theory-Practice Gap&quot; often widens during industrial attachment because meaningful supervision is logistically difficult. Students are effectively invisible to the institution until they return with a physical logbook that is easily falsified. Schologic’s <strong>Practicum Manager</strong> transforms this operational blind spot into a transparent, data-rich workflow.
                        </p>
                        <p>
                            Students use our mobile-friendly interface to log daily activities with geo-tagged evidence, ensuring they are physically present at their placement and replacing easily faked paper logs. Meanwhile, industry supervisors receive secure, automated email prompts to validate student performance weekly—no login or account creation required. This real-time visibility allows you to identify issues in Week 3 rather than Week 12. At the end of the attachment, the system aggregates these weekly validations into a <strong>Digital Supervisor Final Report</strong>, giving you a verified, comprehensive view of the student's performance for final grading. Bridge the gap between campus theory and real-world practice with total confidence.
                        </p>
                    </div>
                    <Link href="/features/practicum-manager" className="inline-flex items-center text-rose-600 font-bold hover:text-rose-700 transition-colors">
                        Automate Practicums <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </GridColumn>
                <GridColumn span={6} className="order-1 md:order-2">
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 h-full relative overflow-hidden group flex items-center justify-center">
                        <PracticumProcessVisual />
                    </div>
                </GridColumn>
            </SectionGrid>

            {/* 5. Retention & Analytics (Visual Left, Text Right) */}
            <SectionGrid className="bg-white py-12 md:py-20" id="retention">
                <GridColumn span={6} className="order-1">
                    <div className="h-full flex items-center justify-center">
                        <DeanDashboardVisual />
                    </div>
                </GridColumn>
                <GridColumn span={6} className="flex flex-col justify-center order-2">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-6 text-amber-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
                        Identify Struggles Before They Fail.
                    </h2>
                    <div className="prose prose-lg text-slate-600 mb-8">
                        <p>
                            National statistics show that <a href="https://nscresearchcenter.org/persistence-retention/" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:text-rose-700 font-medium underline decoration-rose-200 underline-offset-4">19% of first-year students</a> drop out before their sophomore year. In large cohorts, these at-risk students often suffer in silence, their struggles going unnoticed until they fail a major exam or stop attending entirely. Early intervention is the single most effective strategy for improving retention.
                        </p>
                        <p>
                            Schologic empowers you with <strong>Real-Time Engagement Analytics</strong>. Our dashboard aggregates critical data points to flag students based on proven risk indicators: <strong>Late Assignments</strong> and <strong>High AI Usage</strong>. These specific metrics are strong predictors of academic struggle. Instead of waiting for a mid-semester crisis, you can see exactly which students are falling behind and practice <strong>Intrusive Advising</strong>: sending a personalized, supportive check-in email when it matters most. By moving from reactive to proactive support, you can significantly improve student success rates and ensure no student is left behind due to a lack of timely support.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <Link href="#retention" className="inline-flex items-center text-rose-600 font-bold hover:text-rose-700 transition-colors">
                            View Student Analytics <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                        <Link href="/?mode=invite" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-rose-600 transition-colors">
                            <Share2 className="w-4 h-4" /> Invite a Colleague
                        </Link>
                    </div>
                </GridColumn>
            </SectionGrid>

            {/* 6. Universal Reader (Text Left, Visual Right) */}
            <SectionGrid className="bg-indigo-50 py-12 md:py-20" id="materials">
                <GridColumn span={6} className="flex flex-col justify-center order-2 md:order-1">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-6 text-indigo-600">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
                        Textbooks They Actually Read.
                    </h2>
                    <div className="prose prose-lg text-slate-600 mb-8">
                        <p>
                            The cost of learning materials is a primary barrier to equity. Research constantly shows that adopting Open Educational Resources (OER) leads to significantly <a href="https://www.ijlter.org/index.php/ijlter/article/view/1449" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:text-rose-700 font-medium underline decoration-rose-200 underline-offset-4">lower DFW (Drop/Fail/Withdraw) rates</a> because students have access to materials from day one. Schologic makes OER adoption seamless with our built-in <strong>Universal Reader</strong>.
                        </p>
                        <p>
                            You can ingest content from trusted global repositories like LibreTexts or your own PDFs directly into the LMS. The Universal Reader provides a premium, distraction-free reading experience that supports <strong>IMSCC Common Cartridge</strong> formats, allowing for rich, interactive chapters. Crucially, it provides <strong>Student Alerts</strong>: automated notifications when new materials are posted or readings are due. This keeps students aligned with your syllabus. By controlling the reading experience and eliminating cost barriers, you ensure every student has access to high-quality materials, leveling the playing field for academic success.
                        </p>
                    </div>
                    <Link href="/features/oer-library" className="inline-flex items-center text-rose-600 font-bold hover:text-rose-700 transition-colors">
                        Browse the Library <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </GridColumn>
                <GridColumn span={6} className="order-1 md:order-2">
                    <div className="w-full transform hover:scale-[1.02] transition-transform duration-500">
                        <ZTCIngestionVisual />
                    </div>
                </GridColumn>
            </SectionGrid>

            {/* 7. Final CTA */}
            <UseCaseCTA
                accentColor="rose"
                icon={<Zap className="w-8 h-8 text-rose-600" />}
                heading="Join the Faculty of the Future."
                subtitle="Create your account, upload your first rubric, and start grading in under 10 minutes. No IT support needed, no institutional approval required. See the results, then share with your department."
                primaryCta={{
                    text: "Start Free Pilot",
                    href: "/login?view=signup&role=instructor",
                }}
                secondaryCta={{
                    text: "View Live Demo",
                    href: "/demo",
                }}
                badges={[
                    { icon: <Zap className="w-4 h-4" />, label: "Instant Grading" },
                    { icon: <Shield className="w-4 h-4" />, label: "AI Detection" },
                    { icon: <TrendingUp className="w-4 h-4" />, label: "Retention Analytics" },
                ]}
                faqItems={faqItems}
            />
        </main>
    );
}
