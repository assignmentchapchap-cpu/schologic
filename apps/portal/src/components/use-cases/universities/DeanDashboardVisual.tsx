"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
    { src: '/images/updated screenshots/dashboard.webp', alt: 'Dean\'s Institutional Dashboard - Real-time overview of enrollment, retention, and campus integrity metrics across all departments.' },
    { src: '/images/updated screenshots/class page.webp', alt: 'Class Management Page - Course materials, student roster, and assignment tracking for a specific class.' },
    { src: '/images/updated screenshots/aubmissions.webp', alt: 'Student Submissions View - Assignment submissions with AI integrity scores and grading status.' },
    { src: '/images/updated screenshots/ai report.webp', alt: 'AI Integrity Report - Detailed linguistic forensic analysis showing probability of AI authorship.' },
    { src: '/images/updated screenshots/ta insights.webp', alt: 'Teaching Assistant Insights - AI-powered analysis of student performance patterns and recommendations.' },
    { src: '/images/updated screenshots/rubric.webp', alt: 'Assessment Rubric Builder - Structured rubric with criteria, performance levels, and point allocations.' },
    { src: '/images/updated screenshots/practicum logs.webp', alt: 'Practicum Logs Management - Supervisor view of student clinical hours and field experience documentation.' },
    { src: '/images/updated screenshots/univeral reader.webp', alt: 'Universal Document Reader - Multi-format document viewer with annotation and highlighting tools.' },
];

const AUTOPLAY_INTERVAL = 4000;

export const DeanDashboardVisual = () => {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStartX = useRef<number | null>(null);

    // --- Navigation (resets autoplay timer) ---
    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const next = useCallback(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        resetTimer();
    }, [resetTimer]);

    const prev = useCallback(() => {
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
        resetTimer();
    }, [resetTimer]);

    const goTo = useCallback((index: number) => {
        setCurrent(index);
        resetTimer();
    }, [resetTimer]);

    // --- Autoplay ---
    useEffect(() => {
        if (isPaused) return;
        timerRef.current = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, AUTOPLAY_INTERVAL);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPaused, current]);

    // --- Keyboard Navigation ---
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
        if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
    }, [prev, next]);

    // --- Touch / Swipe Support ---
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(diff) > 50) {
            diff > 0 ? prev() : next();
        }
        touchStartX.current = null;
    }, [prev, next]);

    // --- Conditional Rendering: only mount current ± 1 ---
    const shouldRender = (index: number) => {
        if (index === current) return true;
        if (index === (current + 1) % slides.length) return true;
        if (index === (current - 1 + slides.length) % slides.length) return true;
        return false;
    };

    return (
        <div
            className="relative flex flex-col items-center justify-center group/carousel w-full max-w-4xl mx-auto h-full"
            role="img"
            aria-label="Dean Dashboard showing retention analytics and student risk factors"
            data-nosnippet
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Navigation Arrows + Monitor Container */}
            <div className="relative flex items-center justify-center w-full">
                {/* Left Arrow */}
                <button
                    onClick={prev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
                    aria-label="Previous screenshot"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Desktop Monitor Frame */}
                <div className="relative w-full mx-1 md:mx-4 transition-shadow duration-500 group-hover/carousel:drop-shadow-2xl">
                    {/* Monitor Bezel */}
                    <div className="relative bg-gradient-to-b from-slate-700 to-slate-800 rounded-xl p-1.5 shadow-2xl border border-slate-600">
                        {/* Webcam Dot */}
                        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-500 rounded-full z-10 ring-1 ring-slate-400/30"></div>

                        {/* Screen */}
                        <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-slate-900" aria-live="polite">
                            {slides.map((slide, index) => (
                                shouldRender(index) && (
                                    <div
                                        key={slide.src}
                                        className="absolute inset-0 transition-opacity duration-500 ease-in-out"
                                        style={{
                                            opacity: index === current ? 1 : 0,
                                            pointerEvents: index === current ? 'auto' : 'none',
                                        }}
                                        aria-hidden={index !== current}
                                    >
                                        <Image
                                            src={slide.src}
                                            alt={slide.alt}
                                            fill
                                            loading="lazy"
                                            className="object-cover object-top"
                                            sizes="(max-width: 768px) 100vw, 520px"
                                        />
                                    </div>
                                )
                            ))}

                            {/* Screen Gloss Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none z-10"></div>
                        </div>
                    </div>

                    {/* Monitor Stand - Tapered Neck + Base */}
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-14 bg-gradient-to-b from-slate-700 to-slate-600" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }}></div>
                        <div className="w-80 h-4 bg-gradient-to-b from-slate-600 to-slate-500 rounded-b-lg shadow-md"></div>
                    </div>
                </div>

                {/* Right Arrow */}
                <button
                    onClick={next}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
                    aria-label="Next screenshot"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-1.5 mt-4" role="tablist" aria-label="Slide indicators">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goTo(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${index === current
                            ? 'bg-rose-500 w-5'
                            : 'bg-slate-300 hover:bg-slate-400 w-2'
                            }`}
                        role="tab"
                        aria-selected={index === current}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Slide counter */}
            <p className="text-xs text-slate-400 mt-2 font-mono">{current + 1} / {slides.length}</p>
        </div>
    );
};
