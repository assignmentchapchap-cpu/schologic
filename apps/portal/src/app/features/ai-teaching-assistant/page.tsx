import { FeatureHero } from '@/components/features/FeatureHero';
import ApertusTA from '@/components/landing/ApertusTA';
import { Sparkles, MessageSquare, List, TrendingUp, HelpCircle, Check, ArrowRight, Bot, Scale, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { AITeachingAssistantFAQ } from '@/components/features/ai-teaching-assistant/AITeachingAssistantFAQ';
import { RelatedFeatures } from '@/components/features/RelatedFeatures';

export const metadata: Metadata = {
    title: 'AI Teaching Assistant & Grading | Schologic LMS',
    description: 'Automate grading, generate rubrics, and get instant portal support with the Schologic AI Teaching Assistant. Your 24/7 co-pilot for academic management.',
    openGraph: {
        title: 'AI Teaching Assistant & Grading | Schologic LMS',
        description: 'Automate grading, generate rubrics, and get instant portal support with the Schologic AI Teaching Assistant. Your 24/7 co-pilot for academic management.',
    },
    other: {
        'application/ld+json': JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'Schologic AI Teaching Assistant',
            'applicationCategory': 'TeacherTool',
            'operatingSystem': 'Web',
            'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
            'featureList': [
                'Automated Rubric Generation',
                'Deterministic Grading Assistance',
                'Instructor Platform Copilot',
                'Gradebook Synchronization'
            ]
        })
    }
};

export default function AITeachingAssistantPage() {
    return (
        <div className="bg-slate-950 min-h-screen pb-0">
            <FeatureHero
                title="Your 24/7 Grading Partner"
                description="Reduce grading time by 75% without sacrificing quality. Schologic TA drafts feedback, generates rubrics, and guides you through the portal."
                label="AI Teaching Assistant"
                align="center"
                visual={<ApertusTA />}
            />

            <div className="container mx-auto px-6">

                {/* 1. Rubric Generator Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-32">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <List className="w-3 h-3" /> Intelligent Setup
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-white mb-6">From Prompt to Standards in Seconds</h2>
                        <div className="prose prose-invert text-slate-400 mb-8">
                            <p className="mb-4">
                                Creating high-quality rubrics is traditionally a time-consuming administrative burden. Schologic's <strong>AI Rubric Generator</strong> transforms a simple instruction into a comprehensive evaluation matrix.
                            </p>
                            <p className="mb-4">
                                When you create an assignment in the <Link href="/features/class-manager" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Class Manager</Link>, the AI analyzes your assignment description, learning objectives, and class context to auto-generate criteria. It doesn't just look for keywords; it understands the pedagogical intent—whether it's a creative writing piece requiring "Voice" and "Tone" or a lab report requiring "Data Accuracy" and "Methodology."
                            </p>
                            <p>
                                <strong>Why this matters:</strong> You get a standardized, 5-point scale rubric that ensures checking for understanding is consistent across all student submissions. You retain full control to simple-click edit any criterion, weight, or description before publishing.
                            </p>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
                        <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
                        <ol className="space-y-6">
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 font-bold text-amber-500">1</div>
                                <div>
                                    <h4 className="font-bold text-slate-200">Input Your Prompt</h4>
                                    <p className="text-sm text-slate-400 mt-1">"Write a rubric for a 10th-grade history essay on the causes of WWI, focusing on primary source analysis."</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 font-bold text-amber-500">2</div>
                                <div>
                                    <h4 className="font-bold text-slate-200">AI Drafts Criteria</h4>
                                    <p className="text-sm text-slate-400 mt-1">The system generates weighted rows for "Thesis Clarity" (30%), "Evidence Integration" (30%), "Historical Context" (20%), and "Mechanics" (20%).</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 font-bold text-amber-500">3</div>
                                <div>
                                    <h4 className="font-bold text-slate-200">Refine & Assign</h4>
                                    <p className="text-sm text-slate-400 mt-1">Adjust weights with a slider, rename categories, or add a custom row. Once saved, it syncs instantly to your <Link href="/features/grading" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Gradebook</Link>.</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>

                {/* 2. Grading Assistant Section */}
                <div className="mb-32">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <Scale className="w-3 h-3" /> Deterministic Scoring
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-white mb-6">Fairness Built-In, Not "Hallucinated"</h2>
                        <p className="text-slate-400 leading-relaxed mb-8">
                            One of the biggest concerns with AI in education is "hallucination"—the fear that a model will invent a grade based on nothing. Schologic solves this with <strong>Deterministic Scoring Logic</strong>.
                        </p>
                        <p className="text-slate-400 leading-relaxed text-left max-w-2xl mx-auto">
                            We do not ask the AI to "guess a number." Instead, the AI plays the role of a classifier. It reads a student's submission and maps specific sentences to the rubric criteria you defined. If the rubric asks for "Reference to 3 sources," the AI checks for 3 sources. It then assigns a <strong>Performance Level</strong> (Exceptional, Good, Average, etc.), which corresponds to a strict mathematical multiplier.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-white mb-4">The Human-in-the-Loop Workflow</h3>
                            <p className="text-slate-400 mb-6">
                                Automation should never replace instructor judgment. Our workflow is designed to empower you, not replace you.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-400 mt-1 shrink-0" />
                                    <div>
                                        <strong className="text-slate-200">First Pass Analysis:</strong>
                                        <p className="text-sm text-slate-400">The AI reads the paper and highlights Strength/Weakness bullet points for your review.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-400 mt-1 shrink-0" />
                                    <div>
                                        <strong className="text-slate-200">Score Suggestion:</strong>
                                        <p className="text-sm text-slate-400">Based on the multipliers, a score is <em>suggested</em> (e.g., 88/100). It is never auto-submitted.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-400 mt-1 shrink-0" />
                                    <div>
                                        <strong className="text-slate-200">Instructor Override:</strong>
                                        <p className="text-sm text-slate-400">You disagree? Click a button to change a "Good" rating to "Exceptional." The score updates instantly. You are the final arbiter.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden self-stretch">
                            <table className="w-full text-left text-sm h-full">
                                <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th className="p-6">Level</th>
                                        <th className="p-6">Multiplier</th>
                                        <th className="p-6">Definition</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 text-slate-400">
                                    <tr>
                                        <td className="p-6 text-emerald-400 font-bold">Exceptional</td>
                                        <td className="p-6 font-mono text-white">x 1.00</td>
                                        <td className="p-6">Exceeds requirements.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 text-indigo-400 font-bold">Very Good</td>
                                        <td className="p-6 font-mono text-white">x 0.85</td>
                                        <td className="p-6">Strong, minor errors.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 text-sky-400 font-bold">Good</td>
                                        <td className="p-6 font-mono text-white">x 0.60</td>
                                        <td className="p-6">Satisfactory.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 text-rose-400 font-bold">Poor</td>
                                        <td className="p-6 font-mono text-white">x 0.20</td>
                                        <td className="p-6">Fails to meet standard.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 3. Platform Copilot Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-32 bg-slate-900/20 rounded-3xl p-8 lg:p-12 border border-slate-800">
                    <div className="prose prose-invert text-slate-400">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <Bot className="w-3 h-3" /> Platform Copilot
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-white mb-6">Master the Portal Instantly</h2>
                        <p>
                            Modern Learning Management Systems are complex. Instructors often waste hours searching for "Where do I find the late submission button?" or "How do I export this report?".
                        </p>
                        <p>
                            The <strong>Schologic Platform Copilot</strong> is an embedded expert trained on every page of our documentation. It is context-aware, meaning if you ask "How do I grade this?", it knows you are currently viewing a student submission and guides you accordingly.
                        </p>
                        <h3 className="text-white font-bold text-lg mt-8 mb-4">Capabilities</h3>
                        <ul className="list-disc pl-4 space-y-2">
                            <li><strong>Navigation Assistance:</strong> "Take me to the Gradebook settings."</li>
                            <li><strong>Feature Explanation:</strong> "What does the 'Strict' AI detection mode do?"</li>
                            <li><strong>Resource Finding:</strong> "Show me the OER link for this physics module." (See <Link href="/features/oer-library" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">OER Library</Link>)</li>
                        </ul>
                    </div>
                    <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 h-full">
                        <h3 className="text-xl font-bold text-white mb-6">Example Interactions</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Scenario: New Instructor</p>
                                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                    <p className="text-slate-300 italic mb-2">"I need to add a TA to my Chemistry class."</p>
                                    <p className="text-purple-300 text-sm">"I can help. Go to <strong>Class Manager &gt; Settings &gt; Roles</strong>. Here is a direct link to the permissions page."</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Scenario: Reporting</p>
                                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                    <p className="text-slate-300 italic mb-2">"How can I download all grades for this semester?"</p>
                                    <p className="text-purple-300 text-sm">"Navigate to the <strong>Grades Tab</strong>. Click the 'Export CSV' button in the top right corner. Ensure your pop-up blocker is disabled."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Human in the Loop CTA */}
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <h2 className="text-2xl font-bold text-white mb-4">AI Drafts, You Decide.</h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Schologic never auto-submits grades. The AI provides a suggested score and reasoning, but the instructor always has the final click.
                    </p>
                </div>

            </div>

            {/* FAQ Section */}
            <AITeachingAssistantFAQ />

            {/* Related Features */}
            <RelatedFeatures currentFeature="ai-teaching-assistant" />
        </div>
    );
}
