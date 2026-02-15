import { Metadata } from 'next';
import { JsonLdWebPage } from '@/components/seo/JsonLd';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Privacy Policy - Schologic LMS',
    description: 'Privacy Policy for Schologic LMS. Learn about our commitment to Data Sovereignty, FERPA/GDPR compliance, and student data protection.',
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-6 py-16 max-w-4xl">
            <JsonLdWebPage
                name="Privacy Policy - Schologic LMS"
                description="Privacy Policy for Schologic LMS. Learn about our Data Sovereignty and compliance."
            />
            {/* Header */}
            <section className="pt-16 pb-12 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                    <Shield className="w-3 h-3" /> Privacy
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-8">Privacy Policy</h1>
            </section>

            <div className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-a:text-indigo-600">
                <p className="font-bold text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <p className="lead text-xl text-slate-600">
                    Schologic (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you access our platform (the &quot;Service&quot;). We prioritize <strong>Data Sovereignty</strong>, ensuring that institutional data remains under the control of the institution.
                </p>

                <hr className="my-12 border-slate-200" />

                <h2>1. Information We Collect</h2>
                <p>We collect information in the following categories:</p>
                <ul>
                    <li><strong>Account Information:</strong> Name, email address, and institutional affiliation for instructors and administrators.</li>
                    <li><strong>Student Data:</strong> Educational records, assignments, and grades processed on behalf of the educational institution. <strong>We process this data strictly as a School Official under FERPA and a Data Processor under GDPR.</strong></li>
                    <li><strong>Usage Data:</strong> Information about how you access and use the Service (e.g., access logs, device information).</li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <p>We use the collected data for the following purposes:</p>
                <ul>
                    <li>To provide and maintain the Service (grading, plagiarism detection, LMS features).</li>
                    <li>To improve our platform&apos;s performance and accessibility.</li>
                    <li>To communicate with you regarding your account or system updates.</li>
                </ul>
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 my-6">
                    <p className="font-bold text-indigo-900 m-0">Our Data Commitments:</p>
                    <ul className="text-indigo-800 m-0 mt-2 list-disc pl-4">
                        <li>We <strong>DO NOT</strong> sell your data.</li>
                        <li>We <strong>DO NOT</strong> use your data to train third-party foundation AI models.</li>
                    </ul>
                </div>

                <h2>3. Data Sovereignty & Storage</h2>
                <p>
                    Your data is stored in secure, isolated tenants. We adhere to strict data sovereignty principles, ensuring that data is processed and stored in compliance with local regulations and institutional requirements. We aim to keep African institutional data within the continent or compatible jurisdictions whenever feasible.
                </p>

                <h2>4. Disclosure of Your Information</h2>
                <p>We may share information in the following situations:</p>
                <ul>
                    <li><strong>With Your Institution:</strong> Student data is accessible to authorized instructors and administrators of the licensing institution.</li>
                    <li><strong>Service Providers:</strong> We may share data with trusted third-party vendors (e.g., hosting providers) solely to provide the Service, bound by strict confidentiality agreements.</li>
                    <li><strong>Legal Requirements:</strong> If required by law or in response to valid requests by public authorities.</li>
                </ul>

                <h2>5. Security of Your Data</h2>
                <p>
                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                </p>

                <h2>6. Your Data Rights</h2>
                <p>Depending on your location, you may have the following rights:</p>
                <ul>
                    <li><strong>Access:</strong> Request access to the personal data we hold about you.</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
                    <li><strong>Deletion:</strong> Request deletion of your data (subject to institutional retention policies).</li>
                </ul>
                <p>
                    To exercise these rights, please contact us via our secure <a href="/contact">Contact Page</a>.
                </p>

                <h2>7. Contact Us</h2>
                <p>
                    If you have questions about this Privacy Policy, please contact us via our <a href="/contact">Contact Page</a>.
                </p>
            </div>
        </div>
    );
}
