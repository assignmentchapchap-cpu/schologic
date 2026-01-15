'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeroProps {
    onOpenDemo: () => void;
}

const screenshots = [
    '/screenshots/dashboard.png',
    '/screenshots/class-details.png',
    '/screenshots/grades.png',
    '/screenshots/analysis.png',
    '/screenshots/rubric.png'
];

export default function Hero({ onOpenDemo }: HeroProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % screenshots.length);
        }, 4000); // 4 seconds per slide
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-900">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[500px] -left-[200px] w-[1000px] h-[1000px] bg-indigo-600/20 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
                <div className="absolute top-[20%] -right-[300px] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl opacity-30 animate-pulse-slow delay-1000"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        New Beta Available
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-8 animate-fade-in-up delay-100">
                        The AI Teaching Assistant <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400">
                            You've Always Wanted.
                        </span>
                    </h1>

                    {/* Subhead */}
                    <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                        Grade essays in seconds, not hours. Provide deep, personalized feedback with the power of AI. Schologic LMS redefines the academic workflow for modern educators.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto animate-fade-in-up delay-300">
                        <button
                            onClick={onOpenDemo}
                            className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-indigo-900/20 group"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Try Interactive Demo
                        </button>
                        <Link
                            href="/login"
                            className="w-full md:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700"
                        >
                            Log In
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="mt-6 flex items-center gap-6 text-sm text-slate-500 font-medium animate-fade-in-up delay-300">
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> No credit card required</span>
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Instant setup</span>
                    </div>

                    {/* 3D Mockup Slideshow */}
                    <div className="mt-20 relative w-full max-w-5xl perspective-1000 animate-fade-in-up delay-500">
                        {/* Glow behind dashboard */}
                        <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] -z-10 rounded-full h-1/2 top-1/4"></div>

                        <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out group aspect-[16/10]">
                            {/* Window Actions */}
                            <div className="h-8 md:h-10 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2 z-20 relative">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                <div className="flex-1 text-center text-[10px] text-slate-500 font-mono">dashboard.schologic.com</div>
                            </div>

                            {/* Screenshots Carousel with SLIDE Effect */}
                            <div className="relative w-full h-full bg-slate-900 overflow-hidden">
                                <div
                                    className="flex w-full h-full transition-transform duration-700 ease-in-out"
                                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                >
                                    {screenshots.map((src, index) => (
                                        <div
                                            key={src}
                                            className="w-full h-full flex-shrink-0 relative"
                                        >
                                            <Image
                                                src={src}
                                                alt={`App Screenshot ${index + 1}`}
                                                fill
                                                className="object-cover object-top"
                                                priority={index === 0}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Carousel Indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30 bg-black/50 p-2 rounded-full backdrop-blur-sm">
                                {screenshots.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-indigo-400 w-4' : 'bg-slate-500 hover:bg-slate-300'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-900 to-transparent z-20"></div>
        </section>
    );
}
