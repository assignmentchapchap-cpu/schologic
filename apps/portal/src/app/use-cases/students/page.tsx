import type { Metadata } from "next";
import { UseCasesHero } from "@/components/use-cases/UseCasesHero";
import { SectionGrid, GridColumn } from "@/components/use-cases/SectionGrid";
import { StudentsHeroVisual } from "@/components/use-cases/students/StudentsHeroVisual";
import {
    TAInsightsVisual,
    ZTCIngestionVisual,
    StudentMobileCarousel
} from "@/components/landing/visuals/LazyVisuals";
import { FlexibleLearningVisual } from "@/components/use-cases/students/FlexibleLearningVisual";
import { UseCaseCTA } from "@/components/use-cases/UseCaseCTA";
import { Share2, Zap, Smartphone, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { JsonLdFAQPage } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
    title: "Schologic for Students | AI Grading, Free Textbooks & Practicum Tools in Kenya",
    description: "Instant AI-powered feedback on every assignment, zero-cost OER textbooks, and digital practicum logbooks — all from your phone. Schologic is the student learning platform built for Kenya's hybrid education system.",
    keywords: ["student app Kenya", "instant grading feedback", "free textbooks", "OER", "practicum logbook", "hybrid learning", "education technology", "zero textbook cost", "AI grading for students", "student LMS Kenya", "Schologic"]
};

const faqItems = [
    { question: "Is Schologic free for students?", answer: "Yes. Students never pay. Your institution provides access as part of your enrollment. All features — grading, OER library, logbook — are included at no cost to you." },
    { question: "Can I use Schologic on my phone?", answer: "Absolutely. Schologic is fully responsive and works on any smartphone browser. The practicum logbook and OER reader are optimized for mobile use." },
    { question: "How do I get my institution to adopt Schologic?", answer: "Use the 'Share with Instructor' button above to send a demo link to your lecturer or department head. They can start a free pilot immediately." },
    { question: "Will my grades be visible to other students?", answer: "No. Grades are strictly private between you and your instructor. Only authorized faculty and administrators can view your academic records." },
    { question: "How does the AI grading work?", answer: "Your instructor's rubric is applied consistently by our AI teaching assistant. It provides detailed feedback on each criterion, and your instructor can always review and adjust scores." },
];

export default function StudentsPage() {
    return (
        <div className="bg-slate-50">
            <JsonLdFAQPage items={faqItems} />
            <UseCasesHero
                label="For Students"
                title="The Operating System for Your Academic Success."
                subtitle="Instant grades. Free textbooks. Verified skills. Schologic levels the playing field so you can focus on learning, not logistics."
                visual={
                    <div className="hidden md:block relative w-full max-w-[400px] aspect-square">
                        <StudentsHeroVisual />
                    </div>
                }
                accentColor="purple"
                ctaText="Share with Instructor"
                ctaHref="/?mode=invite"
                secondaryCtaText="See How It Works"
                secondaryCtaHref="/features"
            />

            {/* Benefit 1: Instant Feedback */}
            <SectionGrid id="instant-feedback" className="py-12 md:py-20">
                <GridColumn span={6} className="bg-white rounded-3xl p-2 shadow-sm border border-slate-200 overflow-hidden order-2 md:order-1">
                    <TAInsightsVisual />
                </GridColumn>
                <GridColumn span={6} className="flex flex-col justify-center order-1 md:order-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                        Instant Feedback Loops <br />
                        <span className="text-purple-600">Stop Waiting Weeks</span>
                    </h2>
                    <div className="prose prose-lg text-slate-600">
                        <p>
                            Educational research by <a href="https://www.education.vic.gov.au/Documents/school/teachers/teachingresources/practice/The_Power_of_Feedback.pdf" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium">Hattie & Timperley (2007)</a> proves that feedback is most effective when it is timely and addresses the gap between current and desired understanding. Traditional grading models often leave you waiting weeks for results, detached from the learning moment. Schologic transforms this outdated dynamic.
                        </p>
                        <p>
                            Using our state-of-the-art <Link href="/features/ai-teaching-assistant" className="text-purple-600 hover:text-purple-700 font-medium">AI-Powered Grading</Link>, you receive a detailed, granular breakdown of your submission's strengths and weaknesses literally seconds after you upload. This immediate feedback loop allows you to understand your performance instantly while the concepts are still fresh. Instead of viewing assessment as a final judgment, you can use it as a powerful diagnostic tool to iteratively improve your academic writing and mastery of the subject matter.
                        </p>
                    </div>
                </GridColumn>
            </SectionGrid>

            {/* Benefit 2: Zero Textbook Costs */}
            <SectionGrid id="zero-textbook-costs" className="bg-white py-12 md:py-20">
                <GridColumn span={6} className="flex flex-col justify-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                        Zero Textbook Costs <br />
                        <span className="text-purple-600">Grade Depends on Brain, Not Wallet</span>
                    </h2>
                    <div className="prose prose-lg text-slate-600">
                        <p>
                            With the average undergraduate student budgeting over <a href="https://trends.collegeboard.org/college-pricing-student-aid-trends" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium">$1,200 annually for textbooks</a>, the cost of course materials has become a significant barrier to equity and success. We believe your grade should depend on your intellect and effort, not your wallet. Schologic breaks down this financial barrier by integrating a powerful <Link href="/features/universal-reader" className="text-purple-600 hover:text-purple-700 font-medium">Universal Reader</Link> directly into your Learning Management System.
                        </p>
                        <p>
                            Through strategic partnerships with leading Open Educational Resource (OER) providers like <a href="https://libretexts.org/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium">LibreTexts</a> and <a href="https://openstax.org/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium">OpenStax</a>, we give you instant, free access to peer-reviewed, high-quality course materials. There are no expensive access codes to buy, no heavy backpacks to carry, and no waiting for financial aid to clear.
                        </p>
                    </div>
                </GridColumn>
                <GridColumn span={6} className="bg-slate-50 rounded-3xl p-2 shadow-sm border border-slate-200 overflow-hidden">
                    <ZTCIngestionVisual />
                </GridColumn>
            </SectionGrid>

            {/* Benefit 3: Mobile Practicum */}
            <SectionGrid id="mobile-practicum" className="py-12 md:py-20">
                <GridColumn span={6} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 overflow-hidden order-2 md:order-1 flex items-center justify-center">
                    <div className="max-w-md w-full">
                        <StudentMobileCarousel />
                    </div>
                </GridColumn>
                <GridColumn span={6} className="flex flex-col justify-center order-1 md:order-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                        Mobile Practicum Verification <br />
                        <span className="text-purple-600">Focus on Work, Not Paperwork</span>
                    </h2>
                    <div className="prose prose-lg text-slate-600">
                        <p>
                            Industrial attachments and practicums are critical stepping stones for your career employability, but managing the associated paperwork is a notorious headache. Traditional paper logbooks get lost, damaged, or forgotten, forcing you to chase busy supervisors for physical signatures weeks after the fact. This administrative burden distracts from the actual learning experience.
                        </p>
                        <p>
                            The <Link href="/features/practicum-manager" className="text-purple-600 hover:text-purple-700 font-medium">Schologic Mobile App</Link> streamlines this entire workflow. You can log your hours, record daily activities, and upload photo evidence directly from your worksite using your smartphone. Best of all, your industrial supervisor can verify your entries electronically with a single tap, ensuring your hard work is validated in real-time regardless of where you are located.
                        </p>
                    </div>
                </GridColumn>
            </SectionGrid>

            {/* Benefit 4: Flexible Learning */}
            <SectionGrid id="flexible-learning" className="bg-white py-12 md:py-20">
                <GridColumn span={6} className="flex flex-col justify-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                        Flexible Learning <br />
                        <span className="text-purple-600">Learn Anywhere, Anytime</span>
                    </h2>
                    <div className="prose prose-lg text-slate-600">
                        <p>
                            The landscape of higher education has definitively shifted. According to recent NCES data, <a href="https://nces.ed.gov/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium">73% of institutions</a> now offer hybrid learning options, reflecting a new reality where flexibility is paramount. Schologic is purpose-built to support this modern student lifestyle. Whether you are balancing a full-time job, family commitments, or living remotely, our platform seamlessly bridges the gap between campus and <Link href="/features" className="text-purple-600 hover:text-purple-700 font-medium">ODeL</Link>.
                        </p>
                        <p>
                            Our robust, offline-capable mobile architecture ensures you remains connected to your academic life even with intermittent internet connectivity. You can access course content, participate in discussion forums, and submit assignments from anywhere in the world. By removing physical and temporal barriers, we ensure your education fits into your life, not the other way around.
                        </p>
                    </div>
                </GridColumn>
                <GridColumn span={6} className="bg-purple-50 rounded-3xl p-8 shadow-sm border border-slate-200 overflow-hidden flex items-center justify-center">
                    <div className="w-full max-w-md aspect-square">
                        <FlexibleLearningVisual />
                    </div>
                </GridColumn>
            </SectionGrid>

            {/* CTA Section */}
            <UseCaseCTA
                accentColor="purple"
                icon={<Share2 className="w-8 h-8 text-purple-600" />}
                heading="Upgrade Your Education."
                subtitle="Schologic is an institutional platform. If your college or university isn't using it yet, share a demo with your instructors or administration to get started."
                primaryCta={{
                    text: "Share with Instructor",
                    href: "/?mode=invite",
                    icon: <Share2 className="w-5 h-5" />,
                }}
                secondaryCta={{
                    text: "View Mobile Features",
                    href: "#mobile-practicum",
                }}
                badges={[
                    { icon: <Zap className="w-4 h-4" />, label: "Instant Grading" },
                    { icon: <BookOpen className="w-4 h-4" />, label: "Zero Textbook Costs" },
                    { icon: <Smartphone className="w-4 h-4" />, label: "Mobile Logbook" },
                ]}
                faqItems={faqItems}
            />
        </div>
    );
}
