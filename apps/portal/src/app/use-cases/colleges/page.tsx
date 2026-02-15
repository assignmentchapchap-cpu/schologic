import { UseCasesHero } from "@/components/use-cases/UseCasesHero";
import { SectionGrid, GridColumn } from "@/components/use-cases/SectionGrid";
import { UseCaseCTA } from "@/components/use-cases/UseCaseCTA";
import { StudentMobileCarousel } from "@/components/use-cases/colleges/StudentMobileCarousel";
import { Maximize2, Layers, Users, TrendingUp, Shield, ArrowRight, CheckCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { JsonLdFAQPage } from "@/components/seo/JsonLd";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "LMS for Colleges in Kenya | Hybrid Learning Platform | Schologic",
    description: "Schologic is the lean academic engine for modern Kenyan colleges. Unify full-time, evening, and distance programs on one platform with AI grading and academic integrity.",
    keywords: [
        "LMS for colleges Kenya",
        "hybrid learning platform",
        "online distance learning ODL",
        "academic integrity software",
        "AI grading for colleges",
        "enrollment capacity management",
        "evening program Kenya",
        "Schologic for colleges",
        "student retention",
        "blended learning",
        "credential verification"
    ],
};

const faqItems = [
    { question: "Can Schologic handle day, evening, and online cohorts?", answer: "Yes. Our multi-modal architecture is built for hybrid delivery. Content, rubrics, and grading standards are shared across all cohorts, ensuring consistency regardless of delivery mode." },
    { question: "How does it reduce instructor workload?", answer: "By automating grading, attendance tracking, and content distribution across cohorts. An instructor teaching 3 sections uploads once and the AI applies rubrics consistently to all submissions." },
    { question: "What assessment integrity tools are included?", answer: "AI content detection, paraphrase detection, plagiarism checking, and submission analytics \u2014 all built-in. No separate subscriptions or third-party tools needed." },
    { question: "Are credentials equivalent across day, evening, and distance?", answer: "Yes. Because all cohorts share the same rubrics, integrity checks, and assessment standards, graduates from every delivery mode hold verifiably equivalent credentials." },
    { question: "How do we get started with a pilot?", answer: "Click 'Launch Your Hybrid Campus' above to request an institutional pilot. Our team will set up your deployment, train your faculty, and support you throughout the pilot period." },
];

export default function CollegesPage() {
    return (
        <div>
            <JsonLdFAQPage items={faqItems} />
            <UseCasesHero
                title="The Lean Academic Engine for Modern Colleges."
                subtitle="Deliver full-time, evening, and distance programs through one unified platform. Maximize capacity, empower instructors, and protect credentials."
                label="For Colleges"
                accentColor="amber"
                ctaText="Request a Pilot"
                ctaHref="/#request-pilot"
                secondaryCtaText="View Live Demo"
                secondaryCtaHref="/demo"
                visualPosition="left"
                visual={
                    <div className="hidden md:block relative w-full max-w-[400px] aspect-square">
                        <Image
                            src="/images/colleges/abstract-hero.svg"
                            alt=""
                            fill
                            className="object-contain"
                            priority
                            sizes="(max-width: 768px) 100vw, 400px"
                        />
                    </div>
                }
            />

            {/* Section 1: The Capacity Challenge - Amber Background */}
            <div className="bg-amber-50 py-12 md:py-20">
                <SectionGrid>
                    <GridColumn span={6} className="order-2 md:order-1">
                        <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm h-full relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6 relative z-10">
                                <Maximize2 className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">Don't Let Physical Walls Limit Your Mission</h3>
                            <div className="text-slate-600 leading-relaxed space-y-4 relative z-10">
                                <p>
                                    Kenya's colleges face a persistent challenge: enrollment demand continues to grow, but classroom space remains fixed. Building new infrastructure is expensive and slow. Yet administrators are under pressure to admit more students, serve working professionals through evening programs, and increasingly, offer distance learning options.
                                </p>
                                <p>
                                    Schologic provides a <strong>hybrid learning platform</strong> that extends your campus beyond its boundaries. With our <strong>multi-mode delivery system</strong>, the same course materials and assessments serve full-time day students, evening learners, and distance education participants. Effectively double your enrollment capacity without constructing a new classroom.
                                </p>
                            </div>
                        </div>
                    </GridColumn>
                    <GridColumn span={6} className="order-1 md:order-2 flex items-center">
                        <div className="prose prose-lg prose-slate pl-6">
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">One Campus. Limitless Reach.</h2>
                            <p className="text-slate-600 mb-8">
                                Whether a student attends in person, joins an evening session after work, or completes their program online, they access the same <strong>quality learning experience</strong> through a mobile-responsive platform designed for the modern Kenyan learner.
                            </p>
                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                                <Image
                                    src="/images/colleges/hybrid-campus.webp"
                                    alt="Schologic Hybrid Learning Platform - Students studying in physical classrooms and participating via distance education in Kenya"
                                    fill
                                    className="object-cover object-top"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </div>
                    </GridColumn>
                </SectionGrid>
            </div>

            {/* Section 2: Unified Platform - White Background */}
            <div className="bg-white py-12 md:py-20">
                <SectionGrid>
                    <GridColumn span={6} className="flex items-center">
                        <div className="prose prose-lg prose-slate pr-6">
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Full-Time. Evening. Distance. One Standard.</h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Traditional administration often means managing separate systems for different student populations. This fragmentation leads to duplicated work and inconsistent standards.
                                </p>
                                <p>
                                    Schologic consolidates all delivery modes into a <strong>single unified platform</strong>. Full-time students taking assessments on campus use the same system as distance learners in Mombasa. Evening students accessing materials after work use the same interface. Instructors manage a single gradebook that spans all cohorts. Rubrics, content libraries, and assessment schedules are shared institution-wide, eliminating duplicate work and ensuring every student receives identical evaluation criteria.
                                </p>
                                <p>
                                    Our <strong>blended learning architecture</strong> guarantees that every student—regardless of mode—earns a credential of equal value.
                                </p>
                                <p>
                                    This unified approach isn't just efficient — it's essential for <strong>accreditation</strong>. When regulators audit your programs, you can demonstrate that <strong>distance learning</strong> graduates met the exact same assessment standards as full-time on-campus students.
                                </p>
                            </div>
                            <div className="mt-8">
                                <Link href="/features/class-manager" className="text-amber-600 font-bold hover:text-amber-700 inline-flex items-center gap-2 px-6 py-3 bg-amber-50 rounded-full hover:bg-amber-100 transition-colors">
                                    Learn more about the Class Manager <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </GridColumn>
                    <GridColumn span={6}>
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 h-full relative">
                            {/* Decorative Elements */}
                            <div className="absolute top-4 right-4 w-24 h-24 bg-white rounded-full opacity-50 blur-2xl" />

                            <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mb-8">
                                <Layers className="w-7 h-7 text-amber-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Unified Delivery Manager</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <strong className="block text-slate-900 text-lg mb-1">Multi-Mode Enrollment</strong>
                                        <p className="text-slate-600 leading-relaxed">Batch-enroll students into full-time, evening, or distance tracks from one dashboard.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <strong className="block text-slate-900 text-lg mb-1">Unified Assessment</strong>
                                        <p className="text-slate-600 leading-relaxed">One gradebook, one set of rubrics, one standard applied across all formats.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <strong className="block text-slate-900 text-lg mb-1">Cross-Mode Analytics</strong>
                                        <p className="text-slate-600 leading-relaxed">Track performance and engagement regardless of attendance mode.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </GridColumn>
                </SectionGrid>
            </div>

            {/* Section 3: Instructor Empowerment - Dark Theme for Contrast */}
            <div className="bg-slate-900 py-12 md:py-20 relative overflow-hidden bg-dot-white/20">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

                <SectionGrid>
                    <GridColumn span={6} className="order-2 md:order-1">
                        <div className="bg-slate-800 p-10 rounded-3xl border border-slate-700 shadow-2xl h-full relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
                                    <Users className="w-7 h-7 text-amber-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Give Faculty Back <br /><span className="text-amber-400">10 Hours Every Week</span></h3>
                            </div>

                            <div className="text-slate-300 leading-relaxed space-y-6 text-lg">
                                <p>
                                    In many Kenyan colleges, the same instructor teaches day, evening, and distance sections. Without proper tools, this means triple the administrative work: separate rosters, multiple gradebooks, and manual tracking.
                                </p>
                                <p>
                                    Schologic's <strong>instructor efficiency tools</strong> eliminate this redundancy. Content uploaded once is available to all. Rubrics apply consistently across modes. Attendance and grading are automated. Our <strong>AI Teaching Assistant</strong> handles first-pass grading against your rubrics, providing instant feedback to all cohorts simultaneously. An instructor teaching 300 students across three delivery modes can now accomplish what previously required an entire departmental team.
                                </p>
                                <p>
                                    The impact goes beyond efficiency. When instructors spend less time on administrative tasks, they invest more in mentoring, curriculum development, and the hands-on guidance that defines a quality college education. This directly addresses <strong>faculty retention</strong> — a growing concern across Kenya's higher education landscape.
                                </p>
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-700 flex flex-wrap items-center gap-4">
                                <Link href="/features/ai-teaching-assistant" className="text-amber-400 font-bold hover:text-amber-300 inline-flex items-center gap-2">
                                    Explore AI Teaching Assistant <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href="/?mode=invite" className="text-slate-400 font-bold hover:text-amber-400 inline-flex items-center gap-2 transition-colors">
                                    <Share2 className="w-4 h-4" /> Invite an Instructor
                                </Link>
                            </div>
                        </div>
                    </GridColumn>
                    <GridColumn span={6} className="order-1 md:order-2 flex items-center justify-center relative">
                        {/* Laptop Mockup Container */}
                        <div className="relative w-full max-w-lg perspective-1000">

                            {/* Floating Feature Bubbles */}
                            <div className="absolute -left-12 top-0 z-20 animate-float-slow hidden md:flex items-center gap-3 bg-white border-l-4 border-l-emerald-500 p-3 rounded-lg shadow-xl max-w-[200px]">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                    <Users className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-900">Unified Attendance</div>
                                    <div className="text-[10px] text-slate-500 leading-tight">Single view for all modes</div>
                                </div>
                            </div>

                            <div className="absolute -right-8 bottom-20 z-20 animate-float-delayed hidden md:flex items-center gap-3 bg-white border-l-4 border-l-amber-500 p-3 rounded-lg shadow-xl max-w-[220px]">
                                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-900">AI Grading</div>
                                    <div className="text-[10px] text-slate-500 leading-tight">Instant initial feedback</div>
                                </div>
                            </div>

                            <div className="absolute right-0 -top-12 z-20 animate-float hidden md:flex items-center gap-3 bg-white border-l-4 border-l-blue-500 p-3 rounded-lg shadow-xl max-w-[200px]">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                    <Layers className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-900">Auto Sync</div>
                                    <div className="text-[10px] text-slate-500 leading-tight">No manual data entry</div>
                                </div>
                            </div>

                            {/* Laptop Base */}
                            <div className="relative mx-auto border-gray-800 bg-gray-800 border-[8px] rounded-t-xl h-[250px] md:h-[300px] w-full max-w-[500px] shadow-2xl">
                                <div className="rounded-lg overflow-hidden h-full w-full bg-slate-900 relative">
                                    <Image
                                        src="/images/colleges/instructor-dashboard.webp"
                                        alt="Schologic Instructor Dashboard - AI grading interface and unified attendance tracking for hybrid college classes"
                                        fill
                                        className="object-cover object-top"
                                        sizes="(max-width: 768px) 100vw, 500px"
                                    />
                                </div>
                            </div>
                            <div className="relative mx-auto bg-gray-900 rounded-b-xl rounded-t-sm h-[20px] max-w-[550px] md:w-[110%] -ml-[5%] shadow-xl"></div>
                        </div>
                    </GridColumn>
                </SectionGrid>
            </div>

            {/* Section 4: Student Retention - White Background */}
            <div className="bg-white py-12 md:py-20">
                <SectionGrid>
                    <GridColumn span={6} className="flex items-center justify-center">
                        <StudentMobileCarousel />
                    </GridColumn>
                    <GridColumn span={6} className="flex flex-col gap-8">
                        <div className="prose prose-lg prose-slate">
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Keep Every Student Connected</h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Student dropout is a significant concern, particularly among evening and distance learners balancing work and family. Disengagement quickly leads to dropout without intervention.
                                </p>
                                <p>
                                    Schologic's <strong>student success platform</strong> provides early warning indicators. Our analytics track grades, login frequency, and content interaction. When a student disengages—whether full-time or distance—the system flags them for follow-up. Faculty receive actionable dashboards showing which students haven't logged in for 48+ hours, which assignments are overdue, and which grades are trending downward — across all enrollment modes in a single view.
                                </p>
                                <p>
                                    For students, a <strong>modern, mobile-first interface</strong> clearly displays deadlines and progress, making the learning path transparent and accessible.
                                </p>
                                <p>
                                    For college administrators, improved <strong>student retention</strong> means higher completion rates, stronger institutional reputation, and more predictable revenue from tuition and government <strong>capitation grants</strong>.
                                </p>
                            </div>
                        </div>

                        {/* Condensed Retention Features */}
                        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Retention & Success</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    </div>
                                    <div>
                                        <strong className="block text-slate-900 text-sm">At-Risk Alerts</strong>
                                        <p className="text-xs text-slate-600">Auto-notifications on engagement drops.</p>
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle className="w-3 h-3 text-amber-600" />
                                    </div>
                                    <div>
                                        <strong className="block text-slate-900 text-sm">Mobile-First</strong>
                                        <p className="text-xs text-slate-600">Access from any device, anywhere.</p>
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle className="w-3 h-3 text-amber-600" />
                                    </div>
                                    <div>
                                        <strong className="block text-slate-900 text-sm">Progress Tracking</strong>
                                        <p className="text-xs text-slate-600">Visual dashboards for clarity.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GridColumn>
                </SectionGrid>
            </div>

            {/* Section 5: Academic Integrity (CTA) - Gradient Background */}
            <UseCaseCTA
                accentColor="amber"
                icon={<Shield className="w-8 h-8 text-amber-600" />}
                heading="One Standard. Verified Achievement."
                subtitle="Combat the perception that evening or online programs are less rigorous. Schologic integrates secure assessment tools, AI content detection, and digital proctoring into every course."
                primaryCta={{
                    text: "Request a Pilot",
                    href: "/#request-pilot",
                }}
                secondaryCta={{
                    text: "Explore Features",
                    href: "/features/ai-detection",
                }}
                faqItems={faqItems}
            />
        </div>
    );
}
