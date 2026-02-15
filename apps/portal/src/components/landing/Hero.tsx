'use client';

import Link from 'next/link';
import LiveRubricWidget from './LiveRubricWidget';

interface HeroProps {
    onOpenDemo: () => void;
    onOpenPilot: () => void;
}

export default function Hero({ onOpenDemo, onOpenPilot }: HeroProps) {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-900 font-sans">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[500px] -left-[200px] w-[1000px] h-[1000px] bg-indigo-600/20 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute top-[20%] -right-[300px] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl opacity-30"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Powered by Schologic AI
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black text-white tracking-tight leading-tight mb-8">
                        Smart, Credible, and Flexible <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400">
                            Higher Education, with AI.
                        </span>
                    </h1>

                    {/* Subhead */}
                    <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                        Cut grading time by 80%, eliminate textbook costs, and protect academic integrity — all from one platform built for African universities, colleges, and TVET institutions.
                    </p>

                    {/* CTAs - 3 Tier Hierarchy */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={onOpenPilot}
                            className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:bg-indigo-100 shadow-lg shadow-indigo-900/20 active:scale-95"
                        >
                            Request Institutional Pilot
                        </button>
                        <Link
                            href="/login?view=signup"
                            className="w-full md:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all border border-slate-700"
                        >
                            Create Free Instructor Account
                        </Link>
                        <button
                            onClick={onOpenDemo}
                            className="text-slate-400 hover:text-white font-medium transition-colors underline-offset-4 hover:underline"
                        >
                            Try Interactive Demo →
                        </button>
                    </div>

                    {/* Live Proof Widget */}

                </div>
            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-950 to-transparent z-20"></div>
        </section>
    );
}
