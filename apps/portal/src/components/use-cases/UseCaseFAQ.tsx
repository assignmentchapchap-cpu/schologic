'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

interface UseCaseFAQProps {
    items: FAQItem[];
    accentColor: 'rose' | 'purple' | 'indigo' | 'amber' | 'emerald';
}

const colorMap = {
    rose: {
        text: 'text-rose-600',
        hover: 'hover:bg-rose-50',
        border: 'border-rose-200',
        activeBg: 'bg-rose-50',
    },
    purple: {
        text: 'text-purple-600',
        hover: 'hover:bg-purple-50',
        border: 'border-purple-200',
        activeBg: 'bg-purple-50',
    },
    indigo: {
        text: 'text-indigo-600',
        hover: 'hover:bg-indigo-50',
        border: 'border-indigo-200',
        activeBg: 'bg-indigo-50',
    },
    amber: {
        text: 'text-amber-600',
        hover: 'hover:bg-amber-50',
        border: 'border-amber-200',
        activeBg: 'bg-amber-50',
    },
    emerald: {
        text: 'text-emerald-600',
        hover: 'hover:bg-emerald-50',
        border: 'border-emerald-200',
        activeBg: 'bg-emerald-50',
    },
};

export function UseCaseFAQ({ items, accentColor }: UseCaseFAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const colors = colorMap[accentColor];

    return (
        <div className="text-left max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Frequently Asked Questions
            </h3>
            <div className="space-y-1">
                {items.map((item, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div key={index} className={`rounded-lg border ${isOpen ? colors.border : 'border-transparent'} transition-colors`}>
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${colors.hover}`}
                            >
                                <span className={`text-sm font-semibold ${isOpen ? colors.text : 'text-slate-700'}`}>
                                    {item.question}
                                </span>
                                <ChevronDown
                                    className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            <div
                                className={`grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                            >
                                <div className="overflow-hidden">
                                    <p className="px-3 pb-3 text-xs text-slate-500 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
