'use client';

import { useState } from 'react';
import { CheckCircle, ArrowRight, GraduationCap, School, Heart, Sparkles, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import DemoSignupModal from '@/components/auth/DemoSignupModal';
import { JsonLdFAQPage, JsonLdPricing } from '@/components/seo/JsonLd';

const faqItems = [
    {
        question: "Is Schologic really free for instructors?",
        answer: "Yes. Individual instructor accounts are completely free — whether you're independent or part of an institution. You can sign up, create classes, grade with AI, and use all instructor features at no cost."
    },
    {
        question: "Can I join an institution later?",
        answer: "Absolutely. Start with a free instructor account and join an institutional account at any time. Your data and classes transfer seamlessly."
    },
    {
        question: "What does the institutional pilot include?",
        answer: "A full-featured deployment for your chosen departments, onboarding support, faculty training sessions, and a dedicated success manager. No cost during the pilot period."
    },
    {
        question: "How is institutional pricing determined?",
        answer: "Institutional pricing depends on the size of your organization, number of active users, and any custom requirements like white-labeling or integrations. Contact us for a tailored quote."
    },
    {
        question: "Do NGOs qualify for free access?",
        answer: "Yes. Non-profit NGO learning institutions get full platform access at no cost. Contact us with your organization details and we'll set you up."
    },
];

export default function PricingPage() {
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <>
            {/* Header */}
            <section className="pt-16 pb-12 text-center">
                <div className="container mx-auto px-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                        <Sparkles className="w-3 h-3" /> Pricing
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-4">
                        Simple, transparent pricing.
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Free for instructors. Custom for institutions. Always free for non-profits.
                    </p>
                </div>
            </section>

            {/* Pricing Tiers */}
            <section className="pb-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

                        {/* Instructor Tier */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Instructor</h3>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-black text-slate-900">Free</span>
                                <span className="text-slate-500 text-sm ml-2">forever</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-6">
                                For independent instructors and those in an institution. Join an institutional account anytime.
                            </p>
                            <ul className="space-y-3 mb-8 flex-1">
                                {[
                                    'AI-powered grading',
                                    'Academic integrity detection',
                                    'Class management',
                                    'Universal document reader',
                                    'OER library access',
                                    'Join an institution later',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => setShowDemoModal(true)}
                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                                Get Started Free
                            </button>
                        </div>

                        {/* Institution Tier */}
                        <div className="bg-white rounded-2xl border-2 border-indigo-500 p-8 flex flex-col relative hover:shadow-lg transition-shadow">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                                Most Popular
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                    <School className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Institution</h3>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-black text-slate-900">Custom</span>
                                <span className="text-slate-500 text-sm ml-2">per org</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-6">
                                Pricing depends on organization size and custom requirements. Pilot is free.
                            </p>
                            <ul className="space-y-3 mb-8 flex-1">
                                {[
                                    'Everything in Instructor',
                                    'Custom domain or subdomain',
                                    'Custom logo & brand colors',
                                    'Multiple admin accounts',
                                    'Institutional analytics dashboard',
                                    'Free pilot for testing',
                                    'Dedicated success manager',
                                    'LTI 1.3 integrations',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                                        <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div className="space-y-2">
                                <Link
                                    href="/#request-pilot"
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm text-center block"
                                >
                                    Request a Pilot
                                </Link>
                                <Link
                                    href="/contact"
                                    className="w-full py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-center block text-sm"
                                >
                                    Contact Sales
                                </Link>
                            </div>
                        </div>

                        {/* NGO Tier */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-rose-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">NGO / Non-Profit</h3>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-black text-slate-900">Free</span>
                                <span className="text-slate-500 text-sm ml-2">always</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-6">
                                Full platform access for qualifying non-profit NGO learning institutions.
                            </p>
                            <ul className="space-y-3 mb-8 flex-1">
                                {[
                                    'Everything in Institution',
                                    'No cost ever',
                                    'Full platform access',
                                    'Priority onboarding support',
                                    'Community impact reporting',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                                        <CheckCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/contact"
                                className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-sm text-center block"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Institutional Features */}
            <section className="pb-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 md:p-10">
                        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Institutional Features</h2>
                        <p className="text-slate-600 text-sm mb-6">Every institutional account includes these capabilities, tailored to your organization.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { title: 'Custom Domain', desc: 'Use your own domain or a subdomain like institution.schologic.com' },
                                { title: 'Branding & Colors', desc: 'Customize logo, colors, and theming to match your identity' },
                                { title: 'Multiple Admins', desc: 'Grant admin access to multiple staff members with granular roles' },
                                { title: 'Free Pilot Program', desc: 'Test the full platform with real data before committing — no cost' },
                                { title: 'Analytics Dashboard', desc: 'Institution-wide visibility into grading, integrity, and engagement' },
                                { title: 'Dedicated Support', desc: 'Onboarding, training sessions, and a dedicated success manager' },
                            ].map((item) => (
                                <div key={item.title} className="p-4 bg-slate-50 rounded-xl">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="pb-24">
                <div className="container mx-auto px-6">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
                        <div className="space-y-3">
                            {faqItems.map((item, index) => (
                                <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                                    >
                                        <span className="font-bold text-sm text-slate-900">{item.question}</span>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-4 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openFaq === index && (
                                        <div className="px-6 pb-4 text-sm text-slate-600 animate-in slide-in-from-top-1 duration-200">
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="pb-24">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3">Ready to get started?</h2>
                    <p className="text-slate-600 mb-8 max-w-lg mx-auto text-sm">
                        Start grading smarter today — or request a pilot to see how Schologic works at institutional scale.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/#request-pilot"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            Request Institutional Pilot
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-8 py-3.5 text-indigo-600 font-bold hover:bg-indigo-50 rounded-full transition-colors"
                        >
                            Contact Us <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Modals */}
            {showDemoModal && <DemoSignupModal onClose={() => setShowDemoModal(false)} />}

            {/* Structured Data */}
            <JsonLdPricing />
            <JsonLdFAQPage items={faqItems} />

        </>
    );
}
