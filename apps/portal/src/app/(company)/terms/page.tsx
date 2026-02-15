import { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdWebPage } from '@/components/seo/JsonLd';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Terms of Service - Schologic LMS',
    description: 'Terms of Service for Schologic LMS. Read our Acceptable Use Policy, SaaS agreement, and IP rights.',
};

export default function TermsPage() {
    return (
        <div className="container mx-auto px-6 py-16 max-w-4xl">
            <JsonLdWebPage
                name="Terms of Service - Schologic LMS"
                description="Terms of Service for Schologic LMS. SaaS Agreement and Acceptable Use Policy."
            />
            {/* Header */}
            <section className="pt-16 pb-12 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                    <FileText className="w-3 h-3" /> Legal
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-8">Terms of Service</h1>
            </section>

            <div className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-a:text-indigo-600">
                <p className="font-bold text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <p className="lead text-xl text-slate-600">
                    By accessing or using Schologic LMS (the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
                </p>

                <hr className="my-12 border-slate-200" />

                <h2>1. Description of Service</h2>
                <p>
                    Schologic provides a Learning Management System (LMS) with AI-powered features for grading, content detection, and class management. The Service is provided &quot;as is&quot; and &quot;as available.&quot;
                </p>

                <h2>2. User Accounts</h2>
                <ul>
                    <li>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</li>
                    <li>You agree not to disclose your password to any third party.</li>
                    <li>We reserve the right to disable any user account if you have failed to comply with any of the provisions of these Terms.</li>
                </ul>

                <h2>3. Acceptable Use Policy</h2>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
                    <p className="font-bold text-red-900 m-0 mb-2">Academic Integrity Warning</p>
                    <p className="text-red-800 m-0">
                        Schologic is built to uphold academic integrity. You agree <strong>NOT</strong> to use the Service:
                    </p>
                    <ul className="text-red-800 mt-2 list-disc pl-4 mb-0">
                        <li>To engage in academic dishonesty, plagiarism, or facilitate cheating.</li>
                        <li>To attempt to bypass AI detection or grading algorithms.</li>
                    </ul>
                </div>
                <p>Additionally, you agree not to:</p>
                <ul>
                    <li>Upload or transmit viruses, malware, or malicious code.</li>
                    <li>Violate any applicable local, state, national, or international law.</li>
                    <li>Reverse engineer or attempt to extract the source code of the Service.</li>
                </ul>

                <h2>4. Intellectual Property</h2>
                <h3>Your Content</h3>
                <p>
                    You retain ownership of any content (e.g., assignments, grades, course materials) you upload to the Service. You grant Schologic a limited, non-exclusive license to use such content solely for the purpose of providing the Service to you.
                </p>

                <h3>Our Content</h3>
                <p>
                    The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Schologic and its licensors.
                </p>

                <h2>5. Data Privacy</h2>
                <p>
                    Your use of the Service is also governed by our <Link href="/privacy">Privacy Policy</Link>, which is incorporated into these Terms by reference.
                </p>

                <h2>6. Limitation of Liability</h2>
                <p>
                    In no event shall Schologic, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ol>
                    <li>Your access to or use of or inability to access or use the Service;</li>
                    <li>Any conduct or content of any third party on the Service;</li>
                    <li>Any content obtained from the Service; and</li>
                    <li>Unauthorized access, use or alteration of your transmissions or content.</li>
                </ol>

                <h2>7. Termination</h2>
                <p>
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>

                <h2>8. Governing Law</h2>
                <p>
                    These Terms shall be governed and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
                </p>

                <h2>9. Changes</h2>
                <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                </p>

                <h2>10. Contact Us</h2>
                <p>
                    If you have any questions about these Terms, please contact us via our <Link href="/contact">Contact Page</Link>.
                </p>
            </div>
        </div>
    );
}
