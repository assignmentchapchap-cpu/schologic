'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

export function OERLibraryFAQ() {
    return (
        <section className="py-24 bg-slate-950 border-t border-slate-900">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-serif font-bold text-white mb-4">
                        Common Questions About OER
                    </h2>
                    <p className="text-slate-400">
                        Everything you need to know about importing and managing open content.
                    </p>
                </div>

                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                '@context': 'https://schema.org',
                                '@type': 'FAQPage',
                                'mainEntity': [
                                    {
                                        '@type': 'Question',
                                        'name': 'How do I import a textbook from LibreTexts?',
                                        'acceptedAnswer': {
                                            '@type': 'Answer',
                                            'text': 'Schologic supports the IMS Common Cartridge (IMSCC) standard. Simply download the course cartridge from the LibreTexts repository and upload it directly to your Instructor Library. All chapters and modules will be preserved.'
                                        }
                                    },
                                    {
                                        '@type': 'Question',
                                        'name': 'How do I add the imported book to my class?',
                                        'acceptedAnswer': {
                                            '@type': 'Answer',
                                            'text': 'Navigate to your specific class, open the "Resources" tab, and click "Add from Library". You can select the entire textbook or specific chapters to make them immediately available to students.'
                                        }
                                    },
                                    {
                                        '@type': 'Question',
                                        'name': 'Is this content truly free for students?',
                                        'acceptedAnswer': {
                                            '@type': 'Answer',
                                            'text': 'Yes. Open Educational Resources (OER) are licensed to be freely available. Students do not pay any access fees, and you can print or distribute the materials without copyright restrictions.'
                                        }
                                    },
                                    {
                                        '@type': 'Question',
                                        'name': 'Can I modify the chapters?',
                                        'acceptedAnswer': {
                                            '@type': 'Answer',
                                            'text': 'Yes. Once imported, you can hide specific sections, rename chapters to match your syllabus, or mix-and-match content from different sources to create a custom reader.'
                                        }
                                    },
                                    {
                                        '@type': 'Question',
                                        'name': 'What file formats are supported for automatic import?',
                                        'acceptedAnswer': {
                                            '@type': 'Answer',
                                            'text': 'We natively support IMS Common Cartridge (all versions from 1.1 to 1.3), which is the standard format used by Canvas, Blackboard, and most OER repositories including LibreTexts and OpenStax.'
                                        }
                                    }
                                ]
                            })
                        }}
                    />

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-slate-800">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                                How do I import a textbook from LibreTexts?
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-400 leading-relaxed">
                                Schologic supports the <strong>IMS Common Cartridge (IMSCC)</strong> standard. Simply download the course cartridge from the LibreTexts repository and upload it directly to your Instructor Library. All chapters, modules, and hierarchy will be preserved exactly as organized in the source.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2" className="border-slate-800">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                                How do I add the imported book to my class?
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-400 leading-relaxed">
                                Navigate to your specific class dashboard, open the <strong>Resources</strong> tab, and click the "Add from Library" button. You can check the box next to the imported textbook to add the entire volume, or drill down to select specific chapters to release to students week-by-week.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3" className="border-slate-800">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                                Is this content truly free for students?
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-400 leading-relaxed">
                                Yes. Open Educational Resources (OER) are published under open licenses (like Creative Commons) that allow for free access, redistribution, and adaptation. Your students will never hit a paywall, and there are no hidden platform fees for accessing these materials.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4" className="border-slate-800">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                                Can I modify the chapters?
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-400 leading-relaxed">
                                Absolutely. One of the core benefits of OER is "remixability." Once imported into Schologic, you can hide irrelevant sections, rename chapters to match your specific syllabus terminologies, or even combine chapters from different textbooks into a single custom course reader.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-5" className="border-slate-800 border-b-0">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                                What file formats are supported for automatic import?
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-400 leading-relaxed">
                                We natively support <strong>IMS Common Cartridge</strong> (versions 1.1 through 1.3), which is the verified global standard for ed-tech interoperability. This is the same format used by Canvas, Blackboard, and Moodle, ensuring you can import content from almost any major OER repository including LibreTexts, OpenStax, and Merlot.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
