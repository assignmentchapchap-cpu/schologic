import { FeatureHero } from '@/components/features/FeatureHero';
import { ReaderInterfaceMock } from '@/components/features/universal-reader/ReaderInterfaceMock';
import { UniversalReaderFAQ } from '@/components/features/universal-reader/UniversalReaderFAQ';
import { RelatedFeatures } from '@/components/features/RelatedFeatures';
import { FileText, BookOpen, Download, Zap, Archive, Sparkles, Monitor, Layers, Search, CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Universal Document Reader for LMS | PDF, DOCX & IMSCC | Schologic',
    description: 'One viewer for all learning content. Read PDFs, DOCX, and Common Cartridge files with built-in AI summarization. Built for universities and colleges in Kenya.',
    keywords: ['open learning', 'content reader', 'PDF viewer', 'Common Cartridge', 'universities', 'Kenya', 'document viewer LMS', 'IMSCC reader', 'AI summarization', 'DOCX viewer'],
    openGraph: {
        title: 'Open Learning Content Reader | Schologic LMS',
        description: 'Enable open learning with a unified reader for PDFs, DOCX, and Common Cartridge. Built for universities and colleges in Kenya.',
    }
};

export default function UniversalReaderPage() {
    return (
        <div className="bg-slate-950 min-h-screen pb-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        'name': 'Schologic Universal Reader',
                        'applicationCategory': 'EducationalApplication',
                        'operatingSystem': 'Web',
                        'offers': {
                            '@type': 'Offer',
                            'price': '0',
                            'priceCurrency': 'USD'
                        },
                        'featureList': [
                            'PDF and DOCX Rendering',
                            'Common Cartridge (IMSCC) Support',
                            'AI Summarization',
                            'Contextual Search'
                        ]
                    })
                }}
            />

            <FeatureHero
                title="Any Content. One Interface."
                description="Stop forcing students to download multiple apps. The Universal Reader unifies PDFs, Word docs, and Course Cartridges into a single, specialized learning interface."
                label="Universal Reader"
                align="center"
                visual={<ReaderInterfaceMock />}
                ctaText="Start Your Pilot"
                ctaHref="/#request-pilot"
            />

            <div className="container mx-auto px-6">

                {/* 1. Format Agnostic Engine */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32 items-start">
                    <div className="lg:col-span-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <Layers className="w-3 h-3" /> Format Agnostic
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-white mb-6">Stop The "Download & Open" Cycle</h2>
                        <div className="prose prose-invert text-slate-400">
                            <p className="mb-4 leading-relaxed">
                                In traditional LMS platforms, accessing content is a disjointed experience: Download a PDF, find it in the downloads folder, open it in Acrobat. Repeat for every syllabus and reading.
                            </p>
                            <p className="leading-relaxed">
                                Schologic's <strong>Universal Reader</strong> acts as a unified operating system for course content, facilitating true <strong>open learning</strong> by removing proprietary format barriers. Whether an instructor uploads a syllabus or imports a full <Link href="/features/oer-library" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Open Educational Resource</Link>, it opens instantly in our secure, streaming reader.
                            </p>
                        </div>
                    </div>
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all hover:bg-slate-900 group">
                            <div className="w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-rose-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Native PDF Rendering</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Vector-sharp rendering at any zoom level, from 50% to 200%. Includes an automatically generated, collapsible table of contents for navigating long textbooks without endless scrolling.
                            </p>
                        </div>
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all hover:bg-slate-900 group">
                            <div className="w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Monitor className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">DOCX Previews</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Microsoft Word files are parsed and rendered as clean, read-only HTML. Students view syllabi and assignments with original formatting (headers, lists, tables) intact, no Office license required.
                            </p>
                        </div>
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all hover:bg-slate-900 group">
                            <div className="w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Archive className="w-6 h-6 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Common Cartridge (IMSCC)</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Import entire course structures from Canvas, Blackboard, or Moodle. The reader preserves the module hierarchy, allowing students to browse chapters and sections seamlessly within the left sidebar.
                            </p>
                        </div>
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all hover:bg-slate-900 group">
                            <div className="w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Streaming Architecture</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Large files are streamed to the browser, not downloaded. This means a 100-page slide deck or a textbook opens in seconds, ensuring students on slower connections aren't left waiting.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. AI Study Companion */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-32 bg-slate-900/20 rounded-3xl p-8 lg:p-12 border border-slate-800">
                    <div className="prose prose-invert text-slate-400">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <Sparkles className="w-3 h-3" /> AI Study Companion
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-white mb-6">Active Reading, Powered by Intelligence</h2>
                        <p className="leading-relaxed mb-6">
                            Reading on a screen can be passive. The Universal Reader turns it into an active learning session. Our embedded AI doesn't just "chat"; it has context on the specific document you are viewing.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                                    <Search className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">Contextual Search</h4>
                                    <p className="text-sm">Find definitions or key concepts across the entire document. The search understands context, helping you find "inflation causes" even if the exact phrase isn't used.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                                    <CheckCircle className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">Scoped Summarization</h4>
                                    <p className="text-sm">Don't summarize the whole book. Select specific page ranges or chapters (for IMSCC) to generate focused study guides for an upcoming exam.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 h-full shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            Try It: Summarize This Module
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Input Scope</span>
                                    <span className="text-xs text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded border border-purple-500/20">Pages 12-15</span>
                                </div>
                                <p className="text-slate-300 italic text-sm">"Summarize the key causes of inflation mentioned in this section for my macroeconomics final."</p>
                            </div>

                            <div className="bg-purple-900/10 p-4 rounded-lg border border-purple-500/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-purple-400 uppercase">AI Generated Summary</span>
                                </div>
                                <ul className="space-y-3 text-sm text-purple-100">
                                    <li className="flex gap-3">
                                        <span className="text-purple-500 mt-1">•</span>
                                        <span><strong>Demand-Pull Inflation:</strong> Occurs when aggregate demand exceeds aggregate supply. Described as "too much money chasing too few goods".</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-purple-500 mt-1">•</span>
                                        <span><strong>Cost-Push Inflation:</strong> Driven by rising costs of production inputs (e.g., oil, labor) which decreases aggregate supply.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <UniversalReaderFAQ />

                {/* Related Features Footer */}
                <RelatedFeatures currentFeature="universal-reader" />

            </div>
        </div>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
