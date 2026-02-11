import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export function UniversalReaderFAQ() {
    return (
        <section className="max-w-3xl mx-auto mb-24">
            <h2 className="text-3xl font-serif font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="item-1" className="border border-slate-800 rounded-lg bg-slate-950/50 px-4">
                    <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                        What file formats are supported?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-400 leading-relaxed">
                        The Universal Reader natively supports <strong>PDF</strong>, <strong>DOCX</strong> (Microsoft Word), <strong>IMSCC</strong> (Common Cartridge), and plain text files. All formats are rendered directly in the browser with no downloads required.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border border-slate-800 rounded-lg bg-slate-950/50 px-4">
                    <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                        Does search work on all document types?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-400 leading-relaxed">
                        Search is fully supported for PDF, DOCX, and Text files. Note that for <strong>IMSCC (Common Cartridge)</strong> files, cross-origin restrictions currently limit search functionality within the iframe content.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border border-slate-800 rounded-lg bg-slate-950/50 px-4">
                    <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                        How does the AI summarize large textbooks?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-400 leading-relaxed">
                        You can configure the AI summarizer to focus on specific contexts (e.g., "exam prep") and define a page range or specific sections (for IMSCC). This ensures the summary is relevant and doesn't try to process hundreds of irrelevant pages at once.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border border-slate-800 rounded-lg bg-slate-950/50 px-4">
                    <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                        Do I need to download files to read them?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-400 leading-relaxed">
                        No. Schologic uses a streaming architecture. Content is streamed securely to your browser, allowing you to start reading large PDFs or course archives instantly without waiting for a full download.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border border-slate-800 rounded-lg bg-slate-950/50 px-4">
                    <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                        What is "Common Cartridge"?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-400 leading-relaxed">
                        Common Cartridge (IMSCC) is a global standard for packaging course content. It allows you to import entire course structures—modules, quizzes, and readings—from other LMS platforms directly into Schologic.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="border border-slate-800 rounded-lg bg-slate-950/50 px-4">
                    <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                        Can I highlight text or make annotations?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-400 leading-relaxed">
                        Yes, standard highlighting and annotation tools are available for PDF and text-based documents. Annotations are saved automatically and can be accessed across devices.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7" className="border border-slate-800 rounded-lg bg-slate-950/50 px-4">
                    <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                        Does the reader work on mobile devices?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-400 leading-relaxed">
                        Yes. The reader is fully responsive. On mobile devices, the table of contents sidebar is collapsible to maximize screen space for reading. EPUB formats are specifically optimized for reflowable text on smaller screens.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        'mainEntity': [
                            {
                                '@type': 'Question',
                                'name': 'What file formats are supported?',
                                'acceptedAnswer': {
                                    '@type': 'Answer',
                                    'text': 'The Universal Reader natively supports PDF, DOCX (Microsoft Word), IMSCC (Common Cartridge), and plain text files. All formats are rendered directly in the browser with no downloads required.'
                                }
                            },
                            {
                                '@type': 'Question',
                                'name': 'Does search work on all document types?',
                                'acceptedAnswer': {
                                    '@type': 'Answer',
                                    'text': 'Search is fully supported for PDF, DOCX, and Text files. Note that for IMSCC (Common Cartridge) files, cross-origin restrictions currently limit search functionality within the iframe content.'
                                }
                            },
                            {
                                '@type': 'Question',
                                'name': 'How does the AI summarize large textbooks?',
                                'acceptedAnswer': {
                                    '@type': 'Answer',
                                    'text': 'You can configure the AI summarizer to focus on specific contexts (e.g., "exam prep") and define a page range or specific sections (for IMSCC). This ensures the summary is relevant and doesn\'t try to process hundreds of irrelevant pages at once.'
                                }
                            },
                            {
                                '@type': 'Question',
                                'name': 'Do I need to download files to read them?',
                                'acceptedAnswer': {
                                    '@type': 'Answer',
                                    'text': 'No. Schologic uses a streaming architecture. Content is streamed securely to your browser, allowing you to start reading large PDFs or course archives instantly without waiting for a full download.'
                                }
                            },
                            {
                                '@type': 'Question',
                                'name': 'What is "Common Cartridge"?',
                                'acceptedAnswer': {
                                    '@type': 'Answer',
                                    'text': 'Common Cartridge (IMSCC) is a global standard for packaging course content. It allows you to import entire course structures—modules, quizzes, and readings—from other LMS platforms directly into Schologic.'
                                }
                            },
                            {
                                '@type': 'Question',
                                'name': 'Can I highlight text or make annotations?',
                                'acceptedAnswer': {
                                    '@type': 'Answer',
                                    'text': 'Yes, standard highlighting and annotation tools are available for PDF and text-based documents. Annotations are saved automatically and can be accessed across devices.'
                                }
                            },
                            {
                                '@type': 'Question',
                                'name': 'Does the reader work on mobile devices?',
                                'acceptedAnswer': {
                                    '@type': 'Answer',
                                    'text': 'Yes. The reader is fully responsive. On mobile devices, the table of contents sidebar is collapsible to maximize screen space for reading. EPUB formats are specifically optimized for reflowable text on smaller screens.'
                                }
                            }
                        ]
                    })
                }}
            />
        </section>
    );
}
