'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface FeatureHeroProps {
    title: string;
    description: string;
    label?: string;
    ctaHref?: string;
    ctaText?: string;
    visual?: ReactNode;
    align?: 'center' | 'left';
}

export function FeatureHero({
    title,
    description,
    label,
    ctaHref = "#pilot",
    ctaText = "Start Your Pilot",
    visual,
    align = 'center'
}: FeatureHeroProps) {
    const isCenter = align === 'center';

    return (
        <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-slate-950" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] opacity-20" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] opacity-20" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className={`max-w-4xl ${isCenter ? 'mx-auto text-center' : ''}`}>
                    {label && (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6 ${!isCenter ? 'mx-0' : 'mx-auto'}`}>
                            {label}
                        </div>
                    )}

                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                        {title}
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                        {description}
                    </p>

                    <div className={`flex flex-col sm:flex-row items-center gap-4 ${isCenter ? 'justify-center' : ''}`}>
                        <Link href={ctaHref} className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 group">
                            {ctaText}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {visual && (
                    <div className="mt-20 relative mx-auto max-w-6xl">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-3xl blur opacity-20" />
                        <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/50 backdrop-blur-sm">
                            {visual}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
