

import { FeatureHero } from '@/components/features/FeatureHero';
import { FeatureGrid, FeatureCard } from '@/components/features/FeatureGrid';
import { FEATURE_LINKS } from '@/components/features/StickySubNav';
// Using hardcoded data for now to ensure rendering without data fetching dependencies
import { GraduationCap, Shield, Sparkles, BookOpen, Grid, Archive, Users, Zap, Lock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'LMS for Universities & Colleges in Kenya | Schologic',
    description: 'The dedicated LMS for universities and colleges. Explore AI content detection, academic integrity tools, and zero-textbook-cost resources.',
    keywords: ['LMS', 'universities', 'colleges', 'Kenya', 'academic integrity', 'AI content detection', 'zero textbook cost'],
    openGraph: {
        title: 'LMS for Universities & Colleges in Kenya | Schologic',
        description: 'The dedicated LMS for universities and colleges. Explore AI content detection, academic integrity tools, and zero-textbook-cost resources.',
    },
    other: {
        'application/ld+json': JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'Schologic LMS',
            'applicationCategory': 'EducationalApplication',
            'operatingSystem': 'Web',
            'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
            'featureList': [
                'AI Content Detection',
                'Automated Grading',
                'Zero Textbook Cost Resources',
                'Class Management'
            ]
        })
    }
};

export default function FeaturesPage() {
    return (
        <div className="bg-slate-950 min-h-screen">
            <FeatureHero
                title="The Sovereign Integrity Layer"
                description="Schologic is the dedicated LMS for universities and colleges, combining advanced AI detection, automated grading, and zero-textbook-cost resources into a single, sovereign platform."
                label="Platform Features"
                align="center"
                ctaText="Start Your Pilot"
                ctaHref="/#request-pilot"
            />

            <div className="container mx-auto px-6 pb-24">
                <div className="mb-16">
                    <h2 className="text-3xl font-serif font-bold text-white mb-8">Core Modules</h2>
                    <FeatureGrid>
                        <FeatureCard
                            title="Class Manager"
                            description="The command center for your entire teaching workflow. effortless class creation, assignment tracking, and real-time student management."
                            icon={<Grid className="w-7 h-7 text-emerald-400" />}
                            href="/features/class-manager"
                            bgColor="bg-emerald-400/10"
                        />
                        <FeatureCard
                            title="AI Detection"
                            description="Industry-leading AI writing detection with transparent, evidence-based reporting. Analyze submissions for authenticity in seconds."
                            icon={<Shield className="w-7 h-7 text-rose-400" />}
                            href="/features/ai-detection"
                            bgColor="bg-rose-400/10"
                        />
                        <FeatureCard
                            title="AI Teaching Assistant"
                            description="Your 24/7 grading partner. Generate balanced rubrics, get instant grading insights, and automate routine feedback."
                            icon={<Sparkles className="w-7 h-7 text-amber-400" />}
                            href="/features/ai-teaching-assistant"
                            bgColor="bg-amber-400/10"
                        />
                        <FeatureCard
                            title="Universal Reader"
                            description="One viewer for everything. Read PDF, DOCX, and IMSCC content with built-in AI summarization and study tools."
                            icon={<BookOpen className="w-7 h-7 text-blue-400" />}
                            href="/features/universal-reader"
                            bgColor="bg-blue-400/10"
                        />
                        <FeatureCard
                            title="OER Library"
                            description="Switch to Zero-Textbook-Cost courses instantly. Import peer-reviewed content from LibreTexts and OpenStax."
                            icon={<Archive className="w-7 h-7 text-indigo-400" />}
                            href="/features/oer-library"
                            bgColor="bg-indigo-400/10"
                        />
                    </FeatureGrid>
                </div>

                {/* Secondary Value Prop Section */}
                <div className="border-t border-slate-800 pt-24 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-6">
                                <Lock className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Data Sovereignty</h3>
                            <p className="text-slate-400">Your data stays in your region. We offer on-premise deployment options for complete institutional control.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-6">
                                <Zap className="w-8 h-8 text-amber-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Instant Implementation</h3>
                            <p className="text-slate-400">No training required. Our intuitive interface allows instructors to start teaching effectively from day one.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-6">
                                <Users className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Campus-Wide Scale</h3>
                            <p className="text-slate-400">Built to handle thousands of concurrent users. Manage entire departments and colleges with ease.</p>
                        </div>
                    </div>
                </div>

                {/* FAQ Snippet */}
                <div className="border-t border-slate-800 pt-24 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-serif font-bold text-white mb-10 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                            <h3 className="text-lg font-bold text-white mb-2">Is the AI detection accurate?</h3>
                            <p className="text-slate-400">Our multi-model approach (RoBERTa) provides weighted probability scores, significantly reducing false positives compared to single-model detectors.</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                            <h3 className="text-lg font-bold text-white mb-2">Can I import my existing courses?</h3>
                            <p className="text-slate-400">Yes. We support Common Cartridge (IMSCC) imports from Canvas, Blackboard, and Moodle, preserving your structure and content.</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                            <h3 className="text-lg font-bold text-white mb-2">Is there a free trial?</h3>
                            <p className="text-slate-400">We offer institutional pilots so key faculty can test the platform with real student data before committing.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
