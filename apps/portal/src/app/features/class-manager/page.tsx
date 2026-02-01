import { FeatureHero } from '@/components/features/FeatureHero';
import { ClassSetupWorkflow } from '@/components/features/class-manager/ClassSetupWorkflow';
import { AssessmentFeatures } from '@/components/features/class-manager/AssessmentFeatures';
import { GradingDeepDive } from '@/components/features/class-manager/GradingDeepDive';
import { EcosystemLinks } from '@/components/features/class-manager/EcosystemLinks';
import { ClassManagerFAQ } from '@/components/features/class-manager/ClassManagerFAQ';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Online Class Manager for Universities | Schologic LMS',
    description: 'Manage online classes for universities in Kenya. Single dashboard for hybrid, in-person, and distance learning courses.',
    keywords: ['online classes', 'class management', 'LMS', 'universities', 'Kenya', 'distance learning'],
    openGraph: {
        title: 'Online Class Manager for Universities | Schologic LMS',
        description: 'Manage online classes for universities in Kenya. Single dashboard for hybrid, in-person, and distance learning courses.',
    },
    other: {
        'application/ld+json': JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'Schologic Class Manager',
            'applicationCategory': 'EducationalApplication',
            'operatingSystem': 'Web',
            'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
            'featureList': [
                'Online Class Management',
                'Assignment Tracking',
                'Student Roster Management',
                'Gradebook Integration'
            ]
        })
    }
};

export default function ClassManagerPage() {
    return (
        <div className="bg-slate-950 min-h-screen">
            <FeatureHero
                title="Your Complete Teaching Command Center"
                description="The Class Manager is the heart of Schologic LMS. It brings your students, content, and grading into a single, intuitive dashboard designed to save you hours every week."
                label="Cornerstone Feature"
                align="center"
                // Placeholder for actual dashboard visual - using a code block style div for now
                ctaText="Start Your Pilot"
                ctaHref="/#request-pilot"
            />

            {/* Intro Stat */}
            <div className="max-w-3xl mx-auto text-center mb-24 px-6 pt-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">Built for the Modern Instructor</h2>
                <p className="text-lg text-slate-400 leading-relaxed">
                    Traditional LMS interfaces are cluttered and confusing. Schologic's Class Manager strips away the noise, focusing on what matters most for in-person and <strong className="text-white">online classes</strong>: <span className="text-white font-bold">Content, Engagement, and Assessment.</span>
                </p>
            </div>

            {/* Pillar Content Sections */}
            <ClassSetupWorkflow />
            <AssessmentFeatures />
            <GradingDeepDive />
            <EcosystemLinks />
            <ClassManagerFAQ />
        </div>
    );
}
