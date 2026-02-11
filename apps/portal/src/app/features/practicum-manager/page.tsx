import { FeatureHero } from '@/components/features/FeatureHero';
import { PlacementWorkflow } from '@/components/features/practicum-manager/PlacementWorkflow';
import { SupervisionTracking } from '@/components/features/practicum-manager/SupervisionTracking';
import { AssessmentFramework } from '@/components/features/practicum-manager/AssessmentFramework';
import { ComplianceTools } from '@/components/features/practicum-manager/ComplianceTools';
import { PracticumManagerFAQ } from '@/components/features/practicum-manager/PracticumManagerFAQ';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Practicum & Internship Management System for TVET & Teacher Training | Schologic',
    description: 'Digital practicum management for teaching practice and industrial attachments in Kenya. Track student placements, automate supervisor evaluations, manage logbooks, and ensure compliance with automated workflows.',
    keywords: [
        'practicum management system',
        'teaching practice Kenya',
        'industrial attachment tracking',
        'TVET practicum software',
        'teacher training college',
        'field placement management',
        'internship tracking system',
        'supervisor evaluation software',
        'student logbook management',
        'practicum compliance tools',
        'workplace-based learning',
        'practicum assessment rubrics'
    ],
    openGraph: {
        title: 'Practicum & Internship Management for TVET & Teacher Training Colleges',
        description: 'Automate practicum workflows: student placements, supervisor reports, secure logbooks, and compliance tracking. Built for Kenyan TVET institutions and teacher training colleges.',
    },
    other: {
        'application/ld+json': JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'Schologic Practicum Manager',
            'applicationCategory': 'EducationalApplication',
            'operatingSystem': 'Web',
            'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
            'description': 'Digital practicum and internship management system for teaching practice, industrial attachments, and field placements in TVET and teacher training institutions.',
            'featureList': [
                'Automated Practicum Timeline Generation',
                'Secure Student Log Windows',
                'Email-Based Supervisor Evaluations',
                'Customizable Assessment Rubrics',
                'Geolocation Verification',
                'Document Repository Management',
                'Compliance Audit Trail',
                'Export and Reporting Tools'
            ]
        })
    }
};

export default function PracticumManagerPage() {
    return (
        <div className="bg-slate-950 min-h-screen">
            <FeatureHero
                title="Practicum & Internship Management, Simplified"
                description="From placement to assessment, manage the entire practicum lifecycle. Built specifically for teacher training colleges and TVET institutions in Kenya."
                label="Practicum Management"
                align="center"
                ctaText="Request a Demo"
                ctaHref="/#request-pilot"
            />

            {/* Intro Section */}
            <div className="max-w-3xl mx-auto text-center mb-24 px-6 pt-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">Built for Real-World Learning</h2>
                <p className="text-lg text-slate-400 leading-relaxed">
                    Managing practicum placements shouldn't require spreadsheets and manual follow-ups. Schologic automates enrollment, tracking, and assessment so you can focus on what matters: <span className="text-white font-bold">Student Success in the Field.</span>
                </p>
            </div>

            {/* Core Feature Sections */}
            <PlacementWorkflow />
            <SupervisionTracking />
            <AssessmentFramework />
            <ComplianceTools />
            <PracticumManagerFAQ />
        </div>
    );
}
