import { Metadata } from 'next';
import { Target, Shield, Users, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { JsonLdWebPage } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
    title: 'About Us - Smart, Credible, and Flexible Higher Education',
    description: 'Schologic LMS is the operating system for academic integrity and digital learning in Africa. Unifying AI grading, content detection, and OER.',
};

export default function AboutPage() {
    return (
        <>
            {/* JSON-LD */}
            <JsonLdWebPage
                name="About Us - Smart, Credible, and Flexible Higher Education"
                description="Schologic LMS is the operating system for academic integrity and digital learning in Africa."
            />

            {/* Header */}
            <section className="pt-16 pb-12 text-center">
                <div className="container mx-auto px-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                        <Sparkles className="w-3 h-3" /> About Us
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-4">
                        Smart, Credible, and Flexible Higher Education, with AI.
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Schologic is an education technology company building the operating system for academic integrity and digital learning in Africa.
                    </p>
                </div>
            </section>

            {/* Mission & Vision Grid */}
            <section className="pb-12">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {/* Mission Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 flex flex-col justify-center hover:shadow-lg transition-shadow">
                            <h2 className="text-2xl font-bold text-slate-900 font-serif mb-4">Our Mission</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Schologic LMS unifies AI grading, content detection, class management, and open educational resources into one platform designed for African universities and colleges.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                Our platform serves universities, colleges, and TVET institutions with AI content detection, automated grading, practicum management, and open educational resources.
                            </p>
                        </div>

                        {/* Vision Card */}
                        <div className="bg-indigo-900 rounded-2xl border border-indigo-800 p-8 md:p-10 flex flex-col justify-center text-white relative overflow-hidden group hover:shadow-lg transition-shadow">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-4 font-serif">The Vision</h3>
                                <p className="text-indigo-100 leading-relaxed mb-6">
                                    We believe that academic integrity is the foundation of education. In an era of AI, ensuring the credibility of degrees while leveraging technology for efficiency is paramount.
                                </p>
                                <p className="text-indigo-100 leading-relaxed">
                                    We are committed to data sovereignty, ensuring that African institutional data remains secure and sovereign.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Grid */}
            <section className="pb-24">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8 text-center">Our Core Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Value 1 */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg transition-shadow hover:border-indigo-200">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                                    <Shield className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3">Credibility First</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    We prioritize academic integrity in every feature we build. From AI detection to secure assessments, we ensure grades are earned, not generated.
                                </p>
                            </div>

                            {/* Value 2 */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg transition-shadow hover:border-emerald-200">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                                    <Target className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3">Outcome Focused</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    We build tools that save time and improve student outcomes. If it doesn&apos;t help you teach better or learn faster, it&apos;s not in Schologic.
                                </p>
                            </div>

                            {/* Value 3 */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg transition-shadow hover:border-amber-200">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                                    <Users className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3">Data Sovereignty</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Your data stays in your tenant. We do not sell your data or use it to train third-party foundation models. Your institution retains full control.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="pb-24">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3">
                        Ready to modernize your institution?
                    </h2>
                    <p className="text-slate-600 mb-8 max-w-lg mx-auto text-sm">
                        Join the growing network of African institutions prioritizing credibility and efficiency.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        Get in Touch
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </>
    );
}
