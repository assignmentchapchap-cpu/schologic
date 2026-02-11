'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
    {
        question: 'What\'s the difference between daily and weekly logs?',
        answer: 'Daily logs require students to submit entries for each working day, providing detailed day-to-day tracking. Weekly logs allow students to submit consolidated reflections at the end of each week. Choose based on your program requirements - teaching practice often uses daily logs, while industrial attachments may use weekly logs.'
    },
    {
        question: 'How do supervisor reports work without giving supervisors accounts?',
        answer: 'We send workplace supervisors a secure, one-time email link to an evaluation form. They simply click the link, complete the assessment, and submit - no account creation or login required. The system uses secure tokens to authenticate each submission and prevent unauthorized access.'
    },
    {
        question: 'Can we customize the rubric templates?',
        answer: 'Yes! Start with our pre-built Teaching Practice or Industrial Attachment templates, then edit criteria names, point values, and descriptions to match your institutional standards. You can also create completely custom rubrics from scratch if needed.'
    },
    {
        question: 'How does the secure log window prevent backdating?',
        answer: 'Students can only submit logs during administrator-defined time windows. For example, weekly logs might have a Friday-Sunday submission window. Once the window closes, logs are locked and cannot be created or edited, ensuring timely reporting and preventing retroactive entries.'
    },
    {
        question: 'Does the timeline auto-adjust for holidays?',
        answer: 'The system auto-generates a timeline based on your configured start and end dates. You can then manually edit milestones to account for holidays, mid-term breaks, or special events using the timeline editor in your practicum dashboard.'
    },
    {
        question: 'Is geolocation tracking required?',
        answer: 'No, geolocation is completely optional. Enable it for programs requiring physical presence verification (e.g., industrial attachments in specific facilities), or disable it for trust-based programs like teaching practice where location verification is less critical.'
    }
];

export function PracticumManagerFAQ() {
    // Generate JSON-LD for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': FAQS.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
            }
        }))
    };

    return (
        <section className="py-24 bg-slate-950 border-t border-slate-900">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-serif font-bold text-white mb-4">Frequently Asked Questions</h2>
                    <p className="text-slate-400">Common questions about practicum and internship management features.</p>
                </div>

                <div className="space-y-4 mb-16">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {FAQS.map((faq, idx) => (
                            <AccordionItem key={idx} value={`item-${idx}`} className="bg-slate-900/50 border border-slate-800 rounded-xl px-4">
                                <AccordionTrigger className="text-white hover:text-purple-400 hover:no-underline font-bold py-4 text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-400 leading-relaxed pb-4">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {/* CTA Section */}
                <div className="text-center p-12 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl">
                    <h3 className="text-2xl font-serif font-bold text-white mb-4">Ready to Modernize Your Practicum Management?</h3>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                        Join TVET institutions and teacher training colleges across Kenya using Schologic to streamline field placements, supervisor evaluations, and student assessment.
                    </p>
                    <a
                        href="/#request-pilot"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors shadow-xl shadow-purple-500/20"
                    >
                        Request a Demo
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
