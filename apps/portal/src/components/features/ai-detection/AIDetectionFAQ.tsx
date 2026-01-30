'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
    {
        question: "Is AI detection 100% accurate?",
        answer: "No. AI detection is probabilistic, not deterministic. Schologic provides a 'likelihood score' based on linguistic patterns (perplexity and burstiness). We strongly recommend using these scores as one data point in a broader academic integrity review, rather than absolute proof of misconduct."
    },
    {
        question: "Which model should I use for student essays?",
        answer: "For standard academic essays, research papers, and formal writing, we recommend the 'RoBERTa Large' model. It is trained on the HC3 Corpus (a dataset comparing human writing vs. ChatGPT) and offers the most balanced performance for academic texts."
    },
    {
        question: "Can Schologic detect content from newer models like Claude 3.5?",
        answer: "Yes. Our 'AI Content Detector' (formerly PirateXX) is trained on a broader dataset that includes outputs from newer models like Claude, Gemini, and GPT-4. It is more aggressive and better suited for detecting content from these advanced LLMs."
    },
    {
        question: "What does 'Humanized' content mean?",
        answer: "Some students use paraphrasing tools (like Quillbot) or prompt engineering to make AI text sound more human. Our 'AI Content Detector' model is specifically trained on 'humanized' datasets to spot these subtle manipulations that might bypass standard detectors."
    },
    {
        question: "What is the difference between Weighted and Strict scoring?",
        answer: "'Weighted' scoring calculates an average probability across the entire document, giving you a nuanced view. 'Strict' scoring acts as a filter: it ignores any text segments with less than 90% AI probability, significantly reducing false positives but potentially missing subtle AI usage."
    },
    {
        question: "Does the system flag citations or bibliographies?",
        answer: "Schologic's analysis engine automatically excludes common citation formats (APA, MLA, etc.) and bibliography sections from the AI score calculation to prevent false flags on legitimate reference material."
    },
    {
        question: "What is the minimum text length for analysis?",
        answer: "We require a minimum of 50 characters to run an analysis. However, for reliable results, we recommend at least 100 words. Very short texts do not provide enough linguistic data for accurate pattern recognition."
    },
    {
        question: "How can I test the models before grading?",
        answer: "Use the 'AI Lab' in your dashboard. This sandbox environment allows you to paste sample text, switch between models (RoBERTa vs. AI Content Detector), and adjust granularity (Sentence vs. Paragraph) to see how different settings affect the score."
    },
    {
        question: "Is student data used to train your models?",
        answer: "No. Schologic relies on pre-trained open-weights models (like RoBERTa and Apertus). We do not use your students' submissions to train our models, ensuring full data sovereignty and compliance with educational privacy standards (FERPA/GDPR)."
    }
];

export function AIDetectionFAQ() {
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
                    <p className="text-slate-400">Common questions about accuracy, models, and privacy.</p>
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
