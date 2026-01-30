'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
    {
        question: "How do I create a new class?",
        answer: "Navigate to the Classes tab and click the '+ Create Class' button. You'll need to enter the Class Name, Class Code (e.g., PSY101), and optional start/end dates. The system will then automatically generate a unique invite code."
    },
    {
        question: "How do students join my class?",
        answer: "Share the unique 6-digit invite code (displayed on your class card) with your students. They simply click 'Join Class' on their dashboard and enter this code to be instantly enrolled."
    },
    {
        question: "What file formats can I upload as resources?",
        answer: "You can upload PDF documents, DOCX files, and IMSCC cartridges directly from the Resources tab. You can also link to external URLs for videos or websites."
    },
    {
        question: "Can I customize AI detection for a specific class?",
        answer: "Yes. In the Class Settings, you can toggle 'Override Global Defaults'. This allows you to choose specific models (like RoBERTa or PirateXX) and granularity settings just for that course."
    },
    {
        question: "What is the difference between Paragraph and Sentence granularity?",
        answer: "Paragraph-level scanning is best for long-form essays where context matters. Sentence-level scanning is more rigorous and better suited for short responses or quizzes."
    },
    {
        question: "Which AI scoring method should I use?",
        answer: "'Weighted' is recommended for nuanced scoring. 'Strict' only flags high-confidence (>90%) matches, matching zero-tolerance policies. 'Binary' counts any flagged segment as a violation."
    },
    {
        question: "How do I stop accepting submissions?",
        answer: "You can 'Lock' a class from the Settings tab. This prevents any new submissions from students but keeps all existing data and grades accessible for your review."
    },
    {
        question: "Does locking a class delete student data?",
        answer: "No. Locking only freezes the class state. Students can still view resources and their own grades, and you can still access all submissions and reports. You can unlock the class at any time."
    },
    {
        question: "How can I export student grades?",
        answer: "Go to the Grades tab and click 'Export to PDF'. This will generate a comprehensive report including student names, registration numbers, assignment grades, and AI integrity scores."
    },
    {
        question: "What information is included in the class report?",
        answer: "The PDF export includes a full roster view with individual assignment scores, total class percentages, average AI integrity scores, and summary statistics for the course."
    }
];

export function ClassManagerFAQ() {
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
                    <p className="text-slate-400">Everything you need to know about managing your digital classroom.</p>
                </div>

                <div className="space-y-4">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {FAQS.map((faq, idx) => (
                            <AccordionItem key={idx} value={`item-${idx}`} className="bg-slate-900/50 border border-slate-800 rounded-xl px-4">
                                <AccordionTrigger className="text-white hover:text-indigo-400 hover:no-underline font-bold py-4 text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-400 leading-relaxed pb-4">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
