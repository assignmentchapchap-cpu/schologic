import { FeatureHero } from '@/components/features/FeatureHero';
import { OERLibraryFAQ } from '@/components/features/oer-library/OERLibraryFAQ';
import { RelatedFeatures } from '@/components/features/RelatedFeatures';
import { BookOpen, Upload, Download, CheckCircle, GraduationCap, DollarSign, Globe, ExternalLink, Database, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Zero Textbook Cost (ZTC) Library | Schologic LMS',
    description: 'Zero Textbook Costs for universities in Kenya. Import OER content from LibreTexts and OpenStax directly into your courses.',
    keywords: ['zero textbook cost', 'ZTC', 'OER', 'LibreTexts', 'OpenStax', 'universities', 'Kenya'],
    openGraph: {
        title: 'Zero Textbook Cost (ZTC) Library | Schologic LMS',
        description: 'Zero Textbook Costs for universities in Kenya. Import OER content from LibreTexts and OpenStax directly into your courses.',
    }
};

export default function OERLibraryPage() {
    return (
        <div className="bg-slate-950 min-h-screen pb-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        'name': 'Schologic OER Manager',
                        'applicationCategory': 'EducationalApplication',
                        'operatingSystem': 'Web',
                        'offers': {
                            '@type': 'Offer',
                            'price': '0',
                            'priceCurrency': 'USD'
                        },
                        'featureList': [
                            'IMS Common Cartridge Import',
                            'LibreTexts Integration',
                            'Automated Attribution',
                            'Zero Textbook Cost Tagging'
                        ]
                    })
                }}
            />

            <FeatureHero
                title="Zero Textbook Costs. Infinite Possibilities."
                description="Replace expensive textbooks with high-quality, peer-reviewed Open Educational Resources (OER). Import content directly from LibreTexts, OpenStax, and more."
                label="OER Library"
                align="center"
                visual={
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

                        {/* Import Flow Visualization */}
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full max-w-4xl justify-center">
                            {/* Source */}
                            <div className="bg-white p-6 rounded-2xl shadow-xl w-64 text-center">
                                <div className="text-slate-900 font-serif font-bold text-2xl mb-2">LibreTexts</div>
                                <div className="text-slate-500 text-sm mb-4">Chemistry 101</div>
                                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                    <CheckCircle className="w-3 h-3" /> Creative Commons
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex flex-col items-center gap-2 text-indigo-400">
                                <div className="h-0.5 w-16 bg-indigo-500/30"></div>
                                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30">
                                    <Download className="w-4 h-4" />
                                </div>
                                <div className="h-0.5 w-16 bg-indigo-500/30"></div>
                            </div>

                            {/* Destination */}
                            <div className="bg-slate-950 border-2 border-indigo-500 p-6 rounded-2xl shadow-2xl shadow-indigo-500/20 w-64 text-center relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">Imported to Course</div>
                                <div className="text-white font-serif font-bold text-2xl mb-2">Schologic</div>
                                <div className="text-indigo-300 text-sm mb-4">Lecture 1: Atoms</div>
                                <div className="flex justify-center gap-2">
                                    <div className="h-2 w-8 bg-slate-800 rounded-full"></div>
                                    <div className="h-2 w-12 bg-slate-800 rounded-full"></div>
                                    <div className="h-2 w-6 bg-slate-800 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                ctaText="Start a Free Account"
                ctaHref="/login?view=signup"
            />

            <div className="container mx-auto px-6">

                {/* Integration Logos */}
                <div className="flex flex-wrap justify-center gap-12 opacity-50 mb-32 grayscale hover:grayscale-0 transition-all duration-500">
                    <a href="https://libretexts.org" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold font-serif text-slate-400 hover:text-white transition-colors">LibreTexts</a>
                    <a href="https://openstax.org" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold font-serif text-slate-400 hover:text-white transition-colors">OpenStax</a>
                    <a href="https://merlot.org" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold font-serif text-slate-400 hover:text-white transition-colors">Merlot</a>
                    <a href="https://www.oercommons.org" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold font-serif text-slate-400 hover:text-white transition-colors">OER Commons</a>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    <div className="p-8 border border-slate-800 rounded-3xl bg-slate-900/50 hover:bg-slate-800 transition-all">
                        <DollarSign className="w-10 h-10 text-emerald-400 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-3">Zero Student Cost</h3>
                        <p className="text-slate-400 leading-relaxed">
                            The average student spends over $1,200 annually on learning materials. By adopting OER, you eliminate a major financial barrier to access and improve day-one readiness.
                        </p>
                    </div>
                    <div className="p-8 border border-slate-800 rounded-3xl bg-slate-900/50 hover:bg-slate-800 transition-all">
                        <Globe className="w-10 h-10 text-indigo-400 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-3">Global Open Standards</h3>
                        <p className="text-slate-400 leading-relaxed">
                            We use the IMS Common Cartridge standard to ensure compatibility with repositories worldwide. If a resource complies with open standards, it works in Schologic.
                        </p>
                    </div>
                    <div className="p-8 border border-slate-800 rounded-3xl bg-slate-900/50 hover:bg-slate-800 transition-all">
                        <Upload className="w-10 h-10 text-blue-400 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-3">Remix & Adapt</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Don't like Chapter 4? Remove it. Need to merge two different textbooks? Do it. OER gives you full editorial control over your curriculum's structure.
                        </p>
                    </div>
                </div>

                {/* 1. Global Open Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32 items-start">
                    <div className="lg:col-span-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <Database className="w-3 h-3" /> The Central Repository
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-white mb-6">A Universe of Peer-Reviewed Content</h2>
                        <div className="prose prose-invert text-slate-400">
                            <p className="mb-4 leading-relaxed">
                                Moving to "Zero Textbook Cost" (ZTC) does not mean satisfying for lower quality. Platforms like <strong>LibreTexts</strong> and <strong>OpenStax</strong> host tens of thousands of peer-reviewed, faculty-authored textbooks.
                            </p>
                            <p className="leading-relaxed">
                                These resources cover almost every discipline, from advanced STEM topics to Humanities. Because they are digital-first, they are updated frequently to correct errors and reflect new discoveries, unlike static print editions.
                            </p>
                        </div>
                    </div>
                    <div className="lg:col-span-7 bg-slate-900/20 p-8 rounded-2xl border border-slate-800">
                        <h3 className="text-lg font-bold text-white mb-4">Supported Global Repositories</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a href="https://libretexts.org" target="_blank" rel="noopener noreferrer" className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-start gap-4 hover:border-blue-500/50 transition-colors group">
                                <div className="w-10 h-10 bg-blue-900/20 rounded flex items-center justify-center shrink-0 group-hover:bg-blue-900/30 transition-colors">
                                    <BookOpen className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm group-hover:text-blue-300 transition-colors">LibreTexts</h4>
                                    <p className="text-xs text-slate-500 mt-1">The world's most popular OER platform with over 100,000 pages of content.</p>
                                </div>
                            </a>
                            <a href="https://openstax.org" target="_blank" rel="noopener noreferrer" className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-start gap-4 hover:border-orange-500/50 transition-colors group">
                                <div className="w-10 h-10 bg-orange-900/20 rounded flex items-center justify-center shrink-0 group-hover:bg-orange-900/30 transition-colors">
                                    <Globe className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm group-hover:text-orange-300 transition-colors">OpenStax</h4>
                                    <p className="text-xs text-slate-500 mt-1">Rice University's initiative providing high-quality, peer-reviewed textbooks.</p>
                                </div>
                            </a>
                            <a href="https://merlot.org" target="_blank" rel="noopener noreferrer" className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-start gap-4 hover:border-purple-500/50 transition-colors group">
                                <div className="w-10 h-10 bg-purple-900/20 rounded flex items-center justify-center shrink-0 group-hover:bg-purple-900/30 transition-colors">
                                    <Layers className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm group-hover:text-purple-300 transition-colors">Merlot</h4>
                                    <p className="text-xs text-slate-500 mt-1">California State University's curated collection of free learning materials.</p>
                                </div>
                            </a>
                            <a href="https://www.oercommons.org" target="_blank" rel="noopener noreferrer" className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-start gap-4 hover:border-emerald-500/50 transition-colors group">
                                <div className="w-10 h-10 bg-emerald-900/20 rounded flex items-center justify-center shrink-0 group-hover:bg-emerald-900/30 transition-colors">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm group-hover:text-emerald-300 transition-colors">OER Commons</h4>
                                    <p className="text-xs text-slate-500 mt-1">A public digital library of open educational resources.</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 2. Import Workflow Steps */}
                <div className="mb-32">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <Upload className="w-3 h-3" /> Seamless Integration
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-white mb-4">From Repository to Classroom in 3 Steps</h2>
                        <p className="text-slate-400">
                            We've optimized the workflow to make importing a 500-page textbook as easy as uploading a syllabus.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0"></div>

                        {/* Step 1 */}
                        <div className="relative bg-slate-900 rounded-2xl p-8 border border-slate-800 z-10">
                            <div className="w-12 h-12 bg-slate-950 border border-slate-700 rounded-xl flex items-center justify-center text-xl font-bold text-white mb-6 shadow-lg shadow-indigo-900/20">1</div>
                            <h3 className="text-lg font-bold text-white mb-3">Browse & Download</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                Visit <a href="https://libretexts.org" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline">LibreTexts</a> or any OER repository. Locate your desired textbook and download the <strong>Common Cartridge (IMSCC)</strong> file.
                            </p>
                            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-slate-500">
                                chemistry_101_libretexts.imscc
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative bg-slate-900 rounded-2xl p-8 border border-slate-800 z-10">
                            <div className="w-12 h-12 bg-slate-950 border border-slate-700 rounded-xl flex items-center justify-center text-xl font-bold text-white mb-6 shadow-lg shadow-indigo-900/20">2</div>
                            <h3 className="text-lg font-bold text-white mb-3">Import to Library</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                In your Instructor Dashboard, upload the file to your Library. Schologic parses the hierarchy, organizing it into chapters and pages automatically.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                                <CheckCircle className="w-3 h-3" /> Structure Preserved
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative bg-slate-900 rounded-2xl p-8 border border-slate-800 z-10">
                            <div className="w-12 h-12 bg-slate-950 border border-slate-700 rounded-xl flex items-center justify-center text-xl font-bold text-white mb-6 shadow-lg shadow-indigo-900/20">3</div>
                            <h3 className="text-lg font-bold text-white mb-3">Add to Class</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                Go to <Link href="/features/class-manager" className="text-indigo-400 hover:text-indigo-300 underline">Class Manager</Link>, open the Resources tab, and select content. It instantly appears in the Student Dashboard.
                            </p>
                            <Link href="/features/universal-reader" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300">
                                Preview in Reader <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 3. Licensing & Attribution */}
                <div className="bg-slate-900/30 rounded-3xl p-8 md:p-12 border border-slate-800 mb-32 flex flex-col md:flex-row items-start gap-12">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <CheckCircle className="w-3 h-3" /> Automated Compliance
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-white mb-4">Licensing Made Simple</h2>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            One challenge of OER is managing attribution. Schologic handles this automatically. When you import a Creative Commons (CC-BY) resource, the platform:
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="text-slate-300 text-sm">Automatically displays the correct license and author credits in the footer of every page.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="text-slate-300 text-sm">Tracks the source URL so students can always verify specific information.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="text-slate-300 text-sm">Ensures your course materials remain copyright compliant without manual effort.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Replaced visual with text content */}
                    <div className="flex-1 bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
                        <h3 className="text-xl font-bold text-white mb-6">Technical Compliance Details</h3>

                        <div className="space-y-8">
                            <div>
                                <h4 className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
                                    <Database className="w-4 h-4" /> Metadata Retention
                                </h4>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Unlike simple PDF uploads, imported IMSCC cartridges retain the full Dublin Core metadata from the source repository. This means the original author, publication date, and version history are embedded in every page view, ensuring that students always see the correct attribution without instructor intervention.
                                </p>
                            </div>

                            <div>
                                <h4 className="flex items-center gap-2 text-teal-400 font-bold mb-2">
                                    <GraduationCap className="w-4 h-4" /> One-Click Citations
                                </h4>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Because the system understands the source material's structure, standard citation formats (APA, MLA, Chicago) can be generated dynamically. Students can copy the correct citation for any chapter directly from the reader interface, encouraging academic integrity.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <OERLibraryFAQ />

                <div className="mt-24">
                    <RelatedFeatures currentFeature="oer-library" />
                </div>
            </div>
        </div>
    );
}
