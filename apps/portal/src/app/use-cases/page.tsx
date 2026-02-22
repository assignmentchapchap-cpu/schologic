import { SectionGrid, GridColumn } from "@/components/use-cases/SectionGrid";
import { UnifiedFAQ } from "@/components/use-cases/UnifiedFAQ";
import Link from "next/link";
import { ArrowRight, GraduationCap, School, BookOpen, Users } from "lucide-react";
import { Metadata } from "next";
import { JsonLdSoftwareApplication } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
    title: "Use Cases | LMS for Students, Faculty & Institutions | Schologic",
    description: "Discover how Schologic serves every stakeholder in education. AI grading for instructors, free textbooks for students, and multi-campus management for universities, colleges, and TVET institutions in Kenya.",
    keywords: [
        "LMS use cases",
        "education technology Kenya",
        "AI grading software",
        "university LMS",
        "TVET digital learning",
        "college hybrid learning",
        "student learning platform",
        "Schologic"
    ],
};

export default function UseCasesOverview() {
    return (
        <div className="pb-24">
            <JsonLdSoftwareApplication />
            <SectionGrid className="pt-32 pb-16 text-center">
                <GridColumn span={8} className="mx-auto">
                    <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 mb-8 tracking-tight">
                        How Schologic Works
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        Credible, flexible, & intelligent learning tools built for every stakeholder in the academic ecosystem.
                    </p>
                </GridColumn>
            </SectionGrid>

            {/* Navigation Grid */}
            <SectionGrid>
                {/* Instructors */}
                <GridColumn span={4}>
                    <Link href="/use-cases/instructors" className="block group h-full">
                        <div className="bg-white border border-slate-200 p-8 rounded-2xl h-full hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100/50 transition-all group-hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-rose-400" />
                            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-rose-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors">For Instructors</h2>
                            <p className="text-slate-500 mb-6">Automate grading, generate rubrics, and reclaim your time for teaching.</p>
                            <span className="text-rose-600 font-bold text-sm flex items-center gap-2">
                                Explore Workflow <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </Link>
                </GridColumn>

                {/* Colleges */}
                <GridColumn span={4}>
                    <Link href="/use-cases/colleges" className="block group h-full">
                        <div className="bg-white border border-slate-200 p-8 rounded-2xl h-full hover:border-amber-300 hover:shadow-xl hover:shadow-amber-100/50 transition-all group-hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <School className="w-6 h-6 text-amber-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">For Colleges</h2>
                            <p className="text-slate-500 mb-6">Transition to digital with zero textbook costs and unified management.</p>
                            <span className="text-amber-600 font-bold text-sm flex items-center gap-2">
                                Explore Workflow <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </Link>
                </GridColumn>

                {/* TVET */}
                <GridColumn span={4}>
                    <Link href="/use-cases/tvet" className="block group h-full">
                        <div className="bg-white border border-slate-200 p-8 rounded-2xl h-full hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50 transition-all group-hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">For TVET</h2>
                            <p className="text-slate-500 mb-6">Competency-based assessment and industry-linked skill tracking.</p>
                            <span className="text-emerald-600 font-bold text-sm flex items-center gap-2">
                                Explore Workflow <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </Link>
                </GridColumn>

                {/* Universities */}
                <GridColumn span={6}>
                    <Link href="/use-cases/universities" className="block group h-full">
                        <div className="bg-white border border-slate-200 p-8 rounded-2xl h-full hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50 transition-all group-hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">For Universities</h2>
                            <p className="text-slate-500 mb-6">Protect academic integrity with AI-resistant assessment and large-scale data sovereignty.</p>
                            <span className="text-indigo-600 font-bold text-sm flex items-center gap-2">
                                Explore Workflow <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </Link>
                </GridColumn>

                {/* Students */}
                <GridColumn span={6}>
                    <Link href="/use-cases/students" className="block group h-full">
                        <div className="bg-white border border-slate-200 p-8 rounded-2xl h-full hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all group-hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">For Students</h2>
                            <p className="text-slate-500 mb-6">One app for all your content. AI study companions that help you learn, not just cheat.</p>
                            <span className="text-purple-600 font-bold text-sm flex items-center gap-2">
                                Explore Workflow <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </Link>
                </GridColumn>
            </SectionGrid>

            {/* Unified FAQ Section */}
            <UnifiedFAQ />
        </div>
    );
}
