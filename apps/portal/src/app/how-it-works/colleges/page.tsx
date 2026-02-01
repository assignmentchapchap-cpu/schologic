'use client';

import { HowItWorksHero } from "@/components/how-it-works/HowItWorksHero";
import { SectionGrid, GridColumn } from "@/components/how-it-works/SectionGrid";
import { Maximize2, Layers, Users, TrendingUp, Shield, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CollegesPage() {
    return (
        <div className="pb-24">
            <HowItWorksHero
                title="The Lean Academic Engine for Modern Colleges."
                subtitle="Deliver full-time, evening, and distance programs through one unified platform. Maximize capacity, empower instructors, and protect credentials."
                label="For Colleges"
                accentColor="amber"
            />

            {/* Section 1: The Capacity Challenge */}
            <SectionGrid>
                <GridColumn span={6} className="order-2 md:order-1">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-full">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                            <Maximize2 className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Don't Let Physical Walls Limit Your Mission</h3>
                        <div className="text-slate-600 leading-relaxed space-y-4">
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
                    <div className="prose prose-lg prose-slate">
                        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">One Campus. Limitless Reach.</h2>
                        <p className="text-slate-600">
                            Whether a student attends in person, joins an evening session after work, or completes their program online, they access the same <strong>quality learning experience</strong> through a mobile-responsive platform designed for the modern Kenyan learner.
                        </p>
                    </div>
                </GridColumn>
            </SectionGrid>

            {/* Section 2: Unified Platform */}
            <SectionGrid>
                <GridColumn span={6} className="flex items-center">
                    <div className="prose prose-lg prose-slate">
                        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Full-Time. Evening. Distance. One Standard.</h2>
                        <div className="text-slate-600 space-y-4">
                            <p>
                                Traditional administration often means managing separate systems for different student populations. This fragmentation leads to duplicated work and inconsistent standards.
                            </p>
                            <p>
                                Schologic consolidates all delivery modes into a <strong>single unified platform</strong>. Full-time students taking assessments on campus use the same system as distance learners in Mombasa. Evening students accessing materials after work use the same interface.
                            </p>
                            <p>
                                Our <strong>blended learning architecture</strong> guarantees that every student—regardless of mode—earns a credential of equal value.
                            </p>
                        </div>
                        <div className="mt-6">
                            <Link href="/features/class-manager" className="text-amber-600 font-bold hover:text-amber-700 inline-flex items-center gap-2">
                                Learn more about the Class Manager <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </GridColumn>
                <GridColumn span={6}>
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-full">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                            <Layers className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Unified Delivery Manager</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-slate-600">
                                <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-slate-900">Multi-Mode Enrollment</strong>
                                    Batch-enroll students into full-time, evening, or distance tracks from one dashboard.
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600">
                                <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-slate-900">Unified Assessment</strong>
                                    One gradebook, one set of rubrics, one standard applied across all formats.
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600">
                                <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-slate-900">Cross-Mode Analytics</strong>
                                    Track performance and engagement regardless of attendance mode.
                                </div>
                            </li>
                        </ul>
                    </div>
                </GridColumn>
            </SectionGrid>

            {/* Section 3: Instructor Empowerment */}
            <SectionGrid>
                <GridColumn span={6} className="order-2 md:order-1">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-full">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                            <Users className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Give Faculty Back 10 Hours Every Week</h3>
                        <div className="text-slate-600 leading-relaxed space-y-4">
                            <p>
                                In many Kenyan colleges, the same instructor teaches day, evening, and distance sections. Without proper tools, this means triple the administrative work: separate rosters, multiple gradebooks, and manual tracking.
                            </p>
                            <p>
                                Schologic's <strong>instructor efficiency tools</strong> eliminate this redundancy. Content uploaded once is available to all. Rubrics apply consistently across modes. Attendance and grading are automated.
                            </p>
                            <p>
                                By consolidating workflows, Schologic returns approximately <strong>10 hours per week</strong> to your faculty—time they can redirect toward mentorship and improving educational outcomes.
                            </p>
                        </div>
                        <div className="mt-8">
                            <Link href="/features/ai-teaching-assistant" className="text-amber-600 font-bold hover:text-amber-700 inline-flex items-center gap-2">
                                Explore AI Teaching Assistant <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </GridColumn>
                <GridColumn span={6} className="order-1 md:order-2 flex items-center">
                    <div className="prose prose-lg prose-slate">
                        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Zero Extra Work.</h2>
                        <ul className="space-y-4 not-prose">
                            <li className="flex items-start gap-3 text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2.5" />
                                <span><strong>Automated Enrollment Sync:</strong> No manual data entry for add/drops.</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2.5" />
                                <span><strong>AI-Assisted Grading:</strong> Initial feedback generated automatically.</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2.5" />
                                <span><strong>Unified Attendance:</strong> Single view for in-person and online participation.</span>
                            </li>
                        </ul>
                    </div>
                </GridColumn>
            </SectionGrid>

            {/* Section 4: Student Retention */}
            <SectionGrid>
                <GridColumn span={6} className="flex items-center">
                    <div className="prose prose-lg prose-slate">
                        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Keep Every Student Connected</h2>
                        <div className="text-slate-600 space-y-4">
                            <p>
                                Student dropout is a significant concern, particularly among evening and distance learners balancing work and family. Disengagement quickly leads to dropout without intervention.
                            </p>
                            <p>
                                Schologic's <strong>student success platform</strong> provides early warning indicators. Our analytics track grades, login frequency, and content interaction. When a student disengages—whether full-time or distance—the system flags them for follow-up.
                            </p>
                            <p>
                                For students, a <strong>modern, mobile-first interface</strong> clearly displays deadlines and progress, making the learning path transparent and accessible.
                            </p>
                        </div>
                    </div>
                </GridColumn>
                <GridColumn span={6}>
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-full">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                            <TrendingUp className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Retention & Success</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-slate-600">
                                <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-slate-900">At-Risk Alerts</strong>
                                    Automated notifications when engagement drops below thresholds.
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600">
                                <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-slate-900">Mobile-Responsive</strong>
                                    Students access coursework from any device, anywhere.
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600">
                                <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-slate-900">Clear Progress Tracking</strong>
                                    Visual dashboards show exactly where students stand.
                                </div>
                            </li>
                        </ul>
                    </div>
                </GridColumn>
            </SectionGrid>

            {/* Section 5: Academic Integrity (CTA) */}
            <SectionGrid className="bg-amber-50/50 rounded-3xl mt-12 text-center">
                <GridColumn span={8} className="mx-auto">
                    <Shield className="w-12 h-12 text-amber-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">One Standard. Every Mode. Verified Achievement.</h2>
                    <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                        Combat the perception that evening or online programs are less rigorous. Schologic integrates secure assessment tools, AI content detection, and digital proctoring into every course. Ensure that every degree you award commands respect in the job market.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button className="bg-amber-600 text-white px-8 py-3 rounded-full font-bold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20 flex items-center gap-2">
                            Launch Your Hybrid Campus <ArrowRight className="w-5 h-5" />
                        </button>
                        <Link href="/features/ai-detection" className="text-slate-600 font-bold hover:text-amber-600 transition-colors">
                            Explore Integrity Tools
                        </Link>
                    </div>
                </GridColumn>
            </SectionGrid>
        </div>
    );
}
