'use client';

import Link from "next/link";
import { CheckCircle, Clock, ShieldCheck } from "lucide-react";
import { BackgroundGrid } from "@/components/use-cases/BackgroundGrid";
import dynamic from 'next/dynamic';

import { DeanDashboardVisual } from "@/components/landing/visuals/LazyVisuals";
import { getPilotUrl } from '@/lib/urls';

export function LightHero() {
    return (
        <section className="relative pt-24 pb-10 md:pt-32 md:pb-16 overflow-hidden bg-slate-50 border-b border-slate-200">
            <BackgroundGrid />

            <div className="w-full pl-3 pr-4 md:pr-12 lg:pr-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">

                    {/* LEFT REGION: Content (Span 7) */}
                    <div className="md:col-span-7 flex flex-col">

                        <h1 className="text-[2.75rem] leading-[1.2] sm:text-5xl md:text-6xl font-serif font-black text-slate-900 mb-8 tracking-tight">
                            Credible, Flexible, & Intelligent Learning.
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 leading-10 md:leading-loose mb-10 font-light max-w-2xl">
                            Maximize <strong>productivity</strong> and save <span className="text-slate-900">up to 80% of learning management time</span> with a custom, <strong>white label</strong> Schologic LMS institutional portal. We unify AI content detection, digital practicum management, AI assistants and open educational resources into <span className="text-slate-900">one powerful platform</span>.
                        </p>

                        {/* CTAs + Assurances Wrapper (Constrained Width on Desktop) */}
                        <div className="flex flex-col w-full sm:w-fit">
                            {/* Dual CTAs */}
                            <div className="grid grid-cols-[3fr_2fr] sm:flex sm:flex-row gap-2 sm:gap-4 w-full sm:w-fit mb-6">
                                <Link
                                    href={getPilotUrl()}
                                    className="px-2 py-3.5 sm:px-8 sm:py-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center text-[16px] min-[375px]:text-[17px] sm:text-lg tracking-tight whitespace-nowrap"
                                >
                                    Start Institutional Pilot
                                </Link>
                                <Link
                                    href="/login?view=signup"
                                    className="flex items-center justify-center px-2 py-3.5 sm:px-8 sm:py-4 bg-transparent border border-indigo-900 hover:bg-indigo-50 text-indigo-900 rounded-xl font-bold transition-all text-[16px] min-[375px]:text-[17px] sm:text-lg tracking-tight whitespace-nowrap active:scale-95"
                                >
                                    Free Sign Up
                                </Link>
                            </div>

                            {/* Assurances / Affirmations (Desktop only now) */}
                            <div className="hidden md:flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-500 mt-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    <span>Free Instructor Access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                    <span>Live Demo</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                    <span>10-min Setup</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT REGION: Visual (Span 5) */}
                    <div className="md:col-span-5 relative mt-12 md:mt-0">
                        {/* Ambient Glow - Intelligence/Warmth */}
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#FFBF00] opacity-30 blur-[120px] rounded-full mix-blend-multiply pointer-events-none z-0"
                        />

                        {/* Monitor Visual - Scaled to fit */}
                        <div className="relative z-10 w-full md:min-w-[130%] md:-ml-[20%] lg:min-w-[125%] lg:-ml-[15%]">
                            <DeanDashboardVisual />
                        </div>

                        {/* Assurances / Affirmations (Mobile only - below Visual) */}
                        <div className="md:hidden flex flex-row items-center justify-center gap-2 min-[375px]:gap-4 w-full mt-6">
                            <div className="flex items-center gap-1 whitespace-nowrap">
                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="text-[10px] min-[375px]:text-xs font-medium text-slate-500 tracking-tight">Free Instructor Access</span>
                            </div>
                            <div className="flex items-center gap-1 whitespace-nowrap">
                                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span className="text-[10px] min-[375px]:text-xs font-medium text-slate-500 tracking-tight">Live Demo</span>
                            </div>
                            <div className="flex items-center gap-1 whitespace-nowrap">
                                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                <span className="text-[10px] min-[375px]:text-xs font-medium text-slate-500 tracking-tight">10-min Setup</span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}
