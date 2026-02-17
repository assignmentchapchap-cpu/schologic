"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Info, X } from 'lucide-react';
import { cn } from "@/lib/utils";

const slides = [
    { src: '/images/mobile screenshots/student dashboard.webp', alt: 'Student Dashboard - Overview of courses, upcoming deadlines, and academic progress at a glance.' },
    { src: '/images/mobile screenshots/student class.webp', alt: 'Student Class View - Course materials, assignments, and instructor announcements for an enrolled class.' },
    { src: '/images/mobile screenshots/student ai.webp', alt: 'AI Study Assistant - Intelligent tutoring and content analysis tools available on mobile.' },
    { src: '/images/mobile screenshots/student log entry.webp', alt: 'Practicum Log Entry - Students documenting field experiences and clinical hours from their phone.' },
    { src: '/images/mobile screenshots/student practcum.webp', alt: 'Practicum Overview - Summary of practicum placement, hours completed, and supervisor feedback.' },
    { src: '/images/mobile screenshots/student practicum logs.webp', alt: 'Practicum Logs List - Chronological history of all submitted practicum log entries.' },
    { src: '/images/mobile screenshots/student practicum timeline.webp', alt: 'Practicum Timeline - Visual timeline of key milestones and deadlines in the practicum journey.' },
];

const AUTOPLAY_INTERVAL = 4000;

export const StudentMobileCarousel = () => {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showDescription, setShowDescription] = useState(false);

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
    }, [isPaused, current]); // `current` dependency restarts timer after manual nav

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
        if (Math.abs(diff) > 50) { // minimum 50px swipe
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
            className="relative flex items-center justify-center py-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            tabIndex={0}
            role="img"
            aria-label="Student Mobile App Screenshots showing dashboard and grades"
            data-nosnippet
        >
            {/* SEO Description Overlay */}
            {showDescription && (
                <div className="absolute inset-0 z-50 bg-white/98 backdrop-blur-sm p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <Info className="w-5 h-5" />
                            <h4 className="font-bold">Visual Description</h4>
                        </div>
                        <button
                            onClick={() => setShowDescription(false)}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            These screenshots showcase the student mobile experience, including the dashboard and grade tracking views.
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            Schologic has been designed with the needs of students in mind. Through optimized mobile functions, our app helps ensure that no student misses an announcement, deadline, or resource.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowDescription(false)}
                        className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-sm"
                    >
                        Got it, back to visual
                    </button>
                </div>
            )}

            {/* Info Toggle Button */}
            <button
                onClick={() => setShowDescription(!showDescription)}
                className={cn(
                    "absolute top-4 right-4 z-40 p-2 rounded-full shadow-lg transition-all",
                    showDescription ? "bg-indigo-600 text-white" : "bg-white text-indigo-600 hover:bg-indigo-50 border border-slate-100"
                )}
                title="Show Description"
            >
                <Info className="w-5 h-5" />
            </button>

            {/* Left Arrow */}
            <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-amber-600 hover:border-amber-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-label="Previous screenshot"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Phone Frame - 320px for better legibility on mobile, 280px on desktop is fine but let's keep it consistent or proportional */}
            <div className="relative mx-1 md:mx-12 w-[320px] md:w-[320px] shrink-0">
                {/* Phone Body */}
                <div className="relative bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl border border-slate-700">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-2xl z-10 flex items-center justify-center">
                        <div className="w-16 h-3 bg-slate-800 rounded-full"></div>
                    </div>

                    {/* Screen */}
                    <div className="relative w-full aspect-[9/19.5] rounded-[2rem] overflow-hidden bg-white" aria-live="polite">
                        {slides.map((slide, index) => (
                            shouldRender(index) && (
                                <div
                                    key={slide.src}
                                    className="absolute inset-0 transition-opacity duration-500 ease-in-out"
                                    style={{ opacity: index === current ? 1 : 0 }}
                                    aria-hidden={index !== current}
                                >
                                    <Image
                                        src={slide.src}
                                        alt={slide.alt}
                                        fill
                                        loading="lazy"
                                        className="object-cover object-top"
                                        sizes="280px"
                                    />
                                </div>
                            )
                        ))}
                    </div>

                    {/* Home Indicator */}
                    <div className="flex justify-center py-2">
                        <div className="w-24 h-1 bg-slate-600 rounded-full"></div>
                    </div>
                </div>

                {/* Dot Indicators */}
                <div className="flex justify-center gap-1.5 mt-4" role="tablist" aria-label="Slide indicators">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goTo(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === current
                                ? 'bg-amber-500 w-5'
                                : 'bg-slate-300 hover:bg-slate-400 w-2'
                                }`}
                            role="tab"
                            aria-selected={index === current}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Right Arrow */}
            <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-amber-600 hover:border-amber-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-label="Next screenshot"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};
