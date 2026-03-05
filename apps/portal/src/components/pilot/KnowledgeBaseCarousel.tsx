'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const SECTIONS = [
    { chapter: "01", title: "Platform Overview", desc: "Understand the Schologic Pilot: a zero-risk deployment tailored specifically to your institution's unique environment." },
    { chapter: "02", title: "Application Process", desc: "Initiate your journey via the Review Gate using an official institutional email address for automated server provisioning." },
    { chapter: "03", title: "Team Collaboration", desc: "Invite up to 5 stakeholders to your private workspace and use automated task assignments for seamless deployment." },
    { chapter: "04", title: "Pilot Architect", desc: "Select core modules and value add-ons to design your ideal white label LMS at your own pace." },
    { chapter: "05", title: "Branding & Config", desc: "White-label your dedicated tenant with institutional logos, brand colors, and custom governance settings." },
    { chapter: "06", title: "Evaluation Phase", desc: "Track real-time productivity KPIs and generate evidence-based ROI reports for transition to an enterprise license." },
];

// To handle infinite loop with 3 cards in view:
// We pad the array with clones from both ends.
// Real: [0, 1, 2, 3, 4, 5]
// Padded: [4, 5, 0, 1, 2, 3, 4, 5, 0, 1]
const DISPLAYED_ITEMS = [
    SECTIONS[4],
    SECTIONS[5],
    ...SECTIONS,
    SECTIONS[0],
    SECTIONS[1],
];

export function KnowledgeBaseCarousel() {
    const [activeIndex, setActiveIndex] = useState(2); // Start at the first 'real' item (index 0 of SECTIONS)
    const [isTransitioning, setIsTransitioning] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => prev + 1);
            setIsTransitioning(true);
        }, 9000); // 8s pause + 1s transition

        return () => clearInterval(interval);
    }, []);

    // Handle Infinite Loop Jump
    useEffect(() => {
        if (activeIndex === SECTIONS.length + 2) {
            // After the transition to the first cloned card (at the end), jump back to the actual first card
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setActiveIndex(2);
            }, 1000); // Wait for transition duration
            return () => clearTimeout(timer);
        }
    }, [activeIndex]);

    return (
        <div className="relative w-full overflow-hidden py-24 mb-16">
            <div
                className={cn(
                    "flex transition-transform ease-in-out",
                    isTransitioning ? "duration-1000" : "duration-0"
                )}
                style={{
                    transform: `translateX(-${(activeIndex - 1) * 33.33}%)`,
                }}
            >
                {DISPLAYED_ITEMS.map((item, i) => {
                    const isCenter = i === activeIndex;
                    const sectionId = item.title.toLowerCase()
                        .replace(/ & /g, '-')
                        .replace(/ /g, '-')
                        .replace(/[():]/g, '');

                    return (
                        <div
                            key={`${item.chapter}-${i}`}
                            className="w-1/3 shrink-0 px-4 flex justify-center items-center"
                        >
                            <Link
                                href={`/pilot-knowledge-base#${sectionId}`}
                                className={cn(
                                    "p-10 bg-white rounded-[2.5rem] border border-slate-200 transition-all duration-1000 origin-center text-center block hover:border-indigo-500 hover:shadow-xl group/card",
                                    isCenter
                                        ? "scale-[1.2] z-20 shadow-2xl shadow-indigo-500/10 border-indigo-200 opacity-100"
                                        : "scale-100 opacity-100"
                                )}
                                style={{
                                    width: '380px',
                                    height: '240px'
                                }}
                            >
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block group-hover/card:text-indigo-500">Section {item.chapter}</span>
                                <h4 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h4>
                                <p className="text-sm text-slate-700 leading-relaxed font-light">
                                    {item.desc}
                                </p>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
