'use client';

import Link from "next/link";
import { CheckCircle, Clock, ShieldCheck } from "lucide-react";
import { BackgroundGrid } from "@/components/use-cases/BackgroundGrid";
import { DeanDashboardVisual } from "@/components/use-cases/universities/DeanDashboardVisual";

export function LightHero() {
    return (
        <section className="relative pt-24 pb-10 md:pt-32 md:pb-16 overflow-hidden bg-slate-50 border-b border-slate-200">
            <BackgroundGrid />

            <div className="w-full pl-3 pr-4 md:pr-12 lg:pr-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">

                    {/* LEFT REGION: Content (Span 7) */}
                    <div className="md:col-span-7 flex flex-col">

                        <h1 className="text-[2.75rem] leading-[1.1] sm:text-5xl md:text-6xl font-serif font-black text-slate-900 mb-8 tracking-tight">
                            Smart, Credible, and Flexible Learning <br /> - With AI.
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 leading-10 md:leading-loose mb-10 font-light max-w-2xl">
                            Save <span className="text-slate-900">80% of learning management time</span> with Schologic LMS. We unify AI teacher assistance, AI content detection, practicum management, and open educational resources into <span className="text-slate-900">one powerful platform</span>.
                        </p>

                        {/* CTAs + Assurances Wrapper (Constrained Width on Desktop) */}
                        <div className="flex flex-col w-full sm:w-fit">
                            {/* Dual CTAs */}
                            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4 w-full mb-6">
                                <Link
                                    href="/#request-pilot"
                                    className="flex items-center justify-center px-4 md:px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30 text-sm md:text-base whitespace-nowrap md:min-w-[240px] active:scale-95"
                                >
                                    Request Institutional Pilot
                                </Link>
                                <Link
                                    href="/login?view=signup"
                                    className="flex items-center justify-center px-4 md:px-8 py-3.5 bg-transparent border border-indigo-900 hover:bg-indigo-50 text-indigo-900 rounded-xl font-bold transition-all text-sm md:text-base whitespace-nowrap md:min-w-[240px] active:scale-95"
                                >
                                    Free Sign Up
                                </Link>
                            </div>

                            {/* Assurances / Affirmations */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-500 mt-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    <span>Instant Access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                    <span>No Credit Card</span>
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
                    </div>

                </div>
            </div>
        </section>
    );
}
