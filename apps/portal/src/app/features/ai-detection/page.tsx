import { FeatureHero } from '@/components/features/FeatureHero';
import IntegrityHub from '@/components/landing/IntegrityHub';
import { AIDetectionFAQ } from '@/components/features/ai-detection/AIDetectionFAQ';
import { RelatedFeatures } from '@/components/features/RelatedFeatures';
import { Shield, Eye, Lock, Scale, CheckCircle, AlertTriangle, Github, Server, Cpu, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Content Detection for Academic Integrity | Schologic LMS',
    description: 'AI content detection for online classes. Multi-model analysis with transparent reporting for universities in Kenya.',
    keywords: ['AI content detection', 'academic integrity', 'online classes', 'Kenya', 'plagiarism detection'],
    openGraph: {
        title: 'AI Content Detection for Academic Integrity | Schologic LMS',
        description: 'AI content detection for online classes. Multi-model analysis with transparent reporting for universities in Kenya.',
    },
    other: {
        'application/ld+json': JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'Schologic AI Detection',
            'applicationCategory': 'EducationalApplication',
            'operatingSystem': 'Web',
            'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
            'featureList': [
                'Multi-model AI Detection',
                'Granular Paragraph Analysis',
                'Weighted Authenticity Scoring',
                'PDF and DOCX Support'
            ]
        })
    }
};

export default function AIDetectionPage() {
    return (
        <div className="bg-slate-950 min-h-screen pb-0">
            <FeatureHero
                title="Evidence-Based Integrity Analysis"
                description="Schologic uses a multi-model approach to detect AI-generated content with unparalleled accuracy. We provide transparent, granular reporting so you can make informed decisions."
                label="Integrity Hub"
                align="center"
                visual={<IntegrityHub />}
                ctaText="Start Your Pilot"
                ctaHref="/#request-pilot"
            />

            <div className="container mx-auto px-6">

                {/* 1. The Detection Engine (Process) */}
                <div className="max-w-5xl mx-auto mb-32">
                    <h2 className="text-3xl font-serif font-bold text-white mb-16 text-center">The Detection Engine</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 z-0"></div>

                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <span className="text-4xl font-bold text-slate-700">1</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Segment Analysis</h3>
                            <p className="text-slate-400">Submissions are split into semantic units (sentences or paragraphs) based on your <a href="/features/class-manager" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Class Manager settings</a> to isolate specific AI-generated claims.</p>
                        </div>
                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
                                <span className="text-4xl font-bold text-indigo-200">2</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Multi-Model Scan</h3>
                            <p className="text-slate-400">Each segment is run against 3 specialized models (RoBERTa, AI Content Detector, OpenAI Base) to detect different generation patterns.</p>
                        </div>
                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <span className="text-4xl font-bold text-slate-700">3</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Triangulation</h3>
                            <p className="text-slate-400">Scores are weighed and aggregated to filter false positives, producing a final "Authenticity Score" visible in your <a href="/features/grading" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Gradebook</a>.</p>
                        </div>
                    </div>
                </div>

                {/* 2. Open Source Strategy */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <Lock className="w-3 h-3" /> Data Sovereignty
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-white mb-6">Why Open Source Models?</h2>
                        <div className="prose prose-invert text-slate-400">
                            <p className="mb-4">
                                Most detectors are "Black Boxes"—proprietary APIs that send your student data to 3rd-party servers where it may be stored or used for training.
                            </p>
                            <p className="mb-6">
                                Schologic takes a different approach. We deploy <strong>Open-Weights Models</strong> (like RoBERTa) directly within your institutional tenant.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                                    <span><strong>Zero Data Leaks:</strong> Student essays never leave our secure infrastructure.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                                    <span><strong>Full Transparency:</strong> You can inspect exactly how the models are trained and what data they use.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                                    <span><strong>FERPA & GDPR Compliant:</strong> No murky 3rd-party data processing agreements.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-center h-full relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider mb-6">
                                <Shield className="w-3 h-3 text-emerald-400" />
                                Why It Matters
                            </div>
                            <h4 className="font-serif font-bold text-2xl text-white mb-4">
                                Protecting the Value of a Degree.
                            </h4>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Academic integrity isn't just about catching cheaters—it's about preserving the value of education, especially in <strong>online classes</strong>. In an era of instant answers, ensuring that students engage with the material, think critically, and produce original work is more crucial than ever.
                            </p>
                            <p className="text-slate-400 leading-relaxed">
                                AI detection helps maintain a level playing field, validates genuine student effort, and upholds the standards that give Schologic degrees their meaning.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Instructor-Controlled Intelligence (Model Choice) */}
                <div className="max-w-4xl mx-auto mb-32">
                    <h2 className="text-3xl font-serif font-bold text-white mb-6 text-center">Instructor-Controlled Intelligence</h2>
                    <p className="text-center text-slate-400 max-w-2xl mx-auto mb-12">
                        One size does not fit all. Different assignments require different eyes. We give you the power to choose the right model for the job.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Scale className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">RoBERTa Large</h3>
                            <div className="text-xs font-mono text-slate-500 mb-4 bg-slate-950 px-2 py-1 rounded w-fit">HC3 Corpus Trained</div>
                            <p className="text-sm text-slate-400">The academic standard. Best for formal essays and research papers. Trained to spot standard GPT-3/4 patterns.</p>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-purple-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Eye className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">AI Content Detector</h3>
                            <div className="text-xs font-mono text-slate-500 mb-4 bg-slate-950 px-2 py-1 rounded w-fit">Mixed/Humanized Data</div>
                            <p className="text-sm text-slate-400">A more aggressive model. Best for creative writing or when you suspect "humanizing" tools were used.</p>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">OpenAI RoBERTa</h3>
                            <div className="text-xs font-mono text-slate-500 mb-4 bg-slate-950 px-2 py-1 rounded w-fit">Apollo Dataset</div>
                            <p className="text-sm text-slate-400">Specializes in short-form content and reviews. Use as a "Second Opinion" to validate other flags.</p>
                        </div>
                    </div>
                </div>

                {/* 4. Flexible Scoring Table (Visual) */}
                <div className="max-w-4xl mx-auto bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden mb-32">
                    <div className="p-8 border-b border-slate-800">
                        <h2 className="text-2xl font-bold text-white mb-6">Flexible Scoring Logic</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
                                <h4 className="text-emerald-400 font-bold text-sm mb-2">Why Weighted?</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">Best for most classrooms. It mimics human intuition by looking at the "density" of AI signals rather than just one-off flags.</p>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
                                <h4 className="text-slate-300 font-bold text-sm mb-2">Why Strict?</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">Ideal for high-stakes exams. It significantly reduces false positives by ignoring low-confidence signals entirely.</p>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
                                <h4 className="text-amber-400 font-bold text-sm mb-2">Why Binary?</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">For zero-tolerance policies. Flags a document if <em>any single paragraph</em> is detected as AI. Use with caution.</p>
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-800">
                        <div className="grid grid-cols-1 md:grid-cols-4 p-6 gap-4 items-center hover:bg-slate-800/30 transition-colors">
                            <div className="font-bold text-indigo-400">Weighted</div>
                            <div className="col-span-2 text-slate-300 text-sm">Takes the average probability of all highlighted segments. Best for nuanced evaluation.</div>
                            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full w-fit">Recommended</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 p-6 gap-4 items-center hover:bg-slate-800/30 transition-colors">
                            <div className="font-bold text-indigo-400">Strict</div>
                            <div className="col-span-2 text-slate-300 text-sm">Only counts segments with &gt;90% AI probability. Minimizes false accusations.</div>
                            <div className="text-xs font-mono uppercase tracking-widest text-slate-500 bg-slate-800 px-3 py-1 rounded-full w-fit">Conservative</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 p-6 gap-4 items-center hover:bg-slate-800/30 transition-colors">
                            <div className="font-bold text-indigo-400">Binary</div>
                            <div className="col-span-2 text-slate-300 text-sm">Flags submission if ANY segment exceeds 50% probability. Maximum scrutiny.</div>
                            <div className="text-xs font-mono uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full w-fit">Aggressive</div>
                        </div>
                    </div>
                </div>

                {/* 5. The AI Lab (Sandbox SEO Section) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32 bg-indigo-900/10 rounded-3xl p-8 border border-indigo-500/20">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
                            <Cpu className="w-3 h-3" /> Testing Sandbox
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-white mb-4">The AI Lab: A Sandbox for Integrity</h2>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            We don't believe in "set it and forget it." The <strong>AI Lab</strong> allows you to paste sample text and test different models and granularity configurations in real-time.
                        </p>
                        <p className="text-slate-400 text-sm mb-6">
                            Use the Lab to "Calibrate before you Grade." Test known AI text and known human text to understand how different sensitivity settings affect the final Score.
                        </p>
                        <button className="text-white font-bold border-b-2 border-indigo-500 hover:text-indigo-400 transition-colors pb-1">
                            Explore the AI Lab Documentation →
                        </button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
                        <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                                <span className="text-xs font-bold text-slate-500">AI LAB PREVIEW</span>
                                <span className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded">SANDBOX MODE</span>
                            </div>
                            <div className="space-y-2 mb-4 font-mono text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Model:</span>
                                    <span className="text-emerald-400">RoBERTa Large</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Granularity:</span>
                                    <span className="text-indigo-400">Sentence Level</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Status:</span>
                                    <span className="text-amber-400">Calibrating...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. Ethics Disclaimer */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex gap-4 items-start max-w-3xl mx-auto mb-24">
                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                    <div>
                        <h4 className="text-amber-500 font-bold mb-2">Our Stance on Academic Integrity</h4>
                        <p className="text-sm text-amber-200/80 leading-relaxed">
                            AI detection is probabilistic, not deterministic. We provide these scores as <strong>evidence to support instructor judgment</strong>, not as absolute proof of misconduct. We recommend using our "Weighted" scoring method for the most fair assessment.
                        </p>
                        <p className="text-sm text-amber-200/80 leading-relaxed mt-2">
                            <strong>Limitation:</strong> No detector is 100% accurate. False positives can occur. Schologic is designed to be one tool in a holistic grading process.
                        </p>
                    </div>
                </div>

            </div>

            {/* 7. FAQ Section */}
            <AIDetectionFAQ />

            {/* 8. Related Features */}
            <RelatedFeatures currentFeature="ai-detection" />
        </div>
    );
}
