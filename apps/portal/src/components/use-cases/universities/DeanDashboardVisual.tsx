"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

const slides = [
    { src: '/images/updated screenshots/dashboard.webp', alt: 'Dean\'s Dashboard - Real-time oversight of enrollment, retention, and institutional integrity.' },
    { src: '/images/updated screenshots/class page.webp', alt: 'Class Management - Centralized hub for materials, syllabi, and student rosters.' },
    { src: '/images/updated screenshots/submissions.webp', alt: 'Smart Grading Queue - AI-assisted scoring and integrity checks for faster assessment.' },
    { src: '/images/updated screenshots/ai report.webp', alt: 'AI Integrity Report - Transparent authorship analysis with actionable evidence.' },
    { src: '/images/updated screenshots/ta insights.webp', alt: 'Teaching Assistant Insights - AI-detected patterns to identify at-risk students early.' },
    { src: '/images/updated screenshots/rubric.webp', alt: 'Rubric Builder - Standardized, criteria-based grading across departments.' },
    { src: '/images/updated screenshots/practicum logs.webp', alt: 'Field Experience Logs - Digital verification of student hours and practical skills.' },
    { src: '/images/updated screenshots/universal reader.webp', alt: 'Universal Document Reader - Smart, accessible content viewer with built-in annotation.' },
    { src: '/images/updated screenshots/ai settings.webp', alt: 'AI Governance - Customizable policies for AI detection and usage thresholds.' },
    { src: '/images/updated screenshots/grade table.webp', alt: 'Master Gradebook - Holistic view of academic performance and assessment data.' },
    { src: '/images/updated screenshots/library.webp', alt: 'Digital Library - Seamless integration of Open Educational Resources (OER).' },
    { src: '/images/updated screenshots/practicum profiles.webp', alt: 'Practicum Profiles - Portfolio view of skills acquired during field placements.' },
    { src: '/images/updated screenshots/practicum rubrics.webp', alt: 'Practicum Rubrics - Competency-based evaluation for off-campus learning.' },
    { src: '/images/updated screenshots/practicum timeline.webp', alt: 'Practicum Timeline - Visual tracking of field work milestones and requirements.' },
    { src: '/images/updated screenshots/read assistant.webp', alt: 'Universal Reader Assistant - AI-powered summarization and context for course materials.' },
    { src: '/images/updated screenshots/settings.webp', alt: 'System Administration - Enterprise-grade configuration and role management.' },
];

const AUTOPLAY_INTERVAL = 8500;

export const DeanDashboardVisual = () => {
    const [current, setCurrent] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStartX = useRef<number | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

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
        if (isExpanded) return; // Pause autoplay when expanded

        timerRef.current = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, AUTOPLAY_INTERVAL);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [current, isExpanded]);

    // --- Keyboard Navigation (Main + Modal) ---
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (!isExpanded) return; // Only global keys when modal is open

            if (e.key === 'Escape') setIsExpanded(false);
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isExpanded, prev, next]);

    // Local navigation (when focused on container)
    const handleLocalKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (isExpanded) return; // Let global handler take over
        if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
        if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
    }, [prev, next, isExpanded]);

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

    // --- Conditional Rendering ---
    const shouldRender = (index: number) => {
        // Render current, previous, and next slides for smooth transitions
        const total = slides.length;
        if (index === current) return true;
        if (index === (current + 1) % total) return true;
        if (index === (current - 1 + total) % total) return true;
        return false;
    };

    return (
        <div
            className="flex flex-col items-center justify-center w-full max-w-full mx-auto h-full perspective-1000"
            role="region"
            aria-label="Interactive Laptop Demo"
            onKeyDown={handleLocalKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            tabIndex={0}
        >
            {/* 3D Container - Flattened for Front View per reference */}
            <div
                className="relative w-full transition-transform duration-700 ease-out transform-style-3d group"
                style={{ transform: 'perspective(2000px) rotateY(0deg) rotateX(0deg)' }}
            >
                {/* --- REALISTIC MACBOOK PRO CSS (Darker Base Theme) --- */}
                <div className="relative mx-auto w-full max-w-4xl pt-4">
                    {/* 1. Lid (Outer Shell) - Dark to match bezel (Glass look) */}
                    <div className="relative w-[92%] mx-auto bg-[#0d0d0d] rounded-t-[18px] rounded-b-[2px] p-[1%] shadow-2xl ring-1 ring-white/10 z-10 transition-colors duration-500">
                        {/* Top Camera Dot (Subtle) */}
                        <div className="absolute top-[0.8%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#222] rounded-full z-20 opacity-80"></div>

                        {/* 2. Screen Bezel (Inner Frame) - Black */}
                        <div className="relative bg-black rounded-[4px] overflow-hidden aspect-[16/10] ring-1 ring-white/5 shadow-inner flex flex-col">
                            {/* --- Mock Browser UI (Chrome - Reduced Height) --- */}
                            <div className="h-5 w-full bg-[#1e1e1e] flex items-center px-2 space-x-1.5 border-b border-white/5 shrink-0 z-20 relative">
                                {/* Window Controls */}
                                <div className="flex space-x-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#ff5f56]"></div>
                                    <div className="w-2 h-2 rounded-full bg-[#ffbd2e]"></div>
                                    <div className="w-2 h-2 rounded-full bg-[#27c93f]"></div>
                                </div>
                                {/* Mock Tabs/Address Bar Area */}
                                <div className="flex-1 flex items-center justify-center px-4">
                                    <div className="h-2.5 w-1/2 bg-[#2d2d2d] rounded flex items-center justify-center">
                                        <div className="h-0.5 w-1/2 bg-[#3d3d3d] rounded-sm"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Slide Images (Viewport) */}
                            <div className="relative w-full flex-1 bg-[#0f111a] cursor-pointer overflow-hidden group" onClick={next}>
                                {slides.map((slide, index) => (
                                    shouldRender(index) && (
                                        <div
                                            key={slide.src}
                                            className="absolute inset-0 w-full h-full"
                                            style={{
                                                opacity: index === current ? 1 : 0,
                                                transformOrigin: 'top left', // Anchor to top-left corner (Sidebar stays visible)
                                                transform: index === current ? 'scale(1.3)' : 'scale(1)', // Max zoom 1.3 (130%)
                                                transition: 'opacity 1000ms ease-in-out, transform 8000ms linear', // 8s zoom per request
                                                zIndex: index === current ? 10 : 0,
                                                pointerEvents: 'none',
                                            }}
                                            aria-hidden={index !== current}
                                        >
                                            <Image
                                                src={slide.src}
                                                alt={slide.alt}
                                                fill
                                                loading={index === 0 ? "eager" : "lazy"}
                                                // object-fill ensures no content is cut off, fitting exact dimensions
                                                className="object-fill"
                                                sizes="(max-width: 768px) 100vw, 800px"
                                            />
                                        </div>
                                    )
                                ))}
                                {/* Inner Screen Gloss/Reflection */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none z-20 mix-blend-overlay"></div>
                                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/[0.04] to-transparent pointer-events-none z-20"></div>
                            </div>

                            {/* --- Overlay Description (Bottom Right) --- */}
                            <div className="absolute bottom-6 right-6 z-30 max-w-[60%] md:max-w-md p-3 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-lg transition-all duration-500">
                                <div key={current} className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                                    <h3 className="text-sm font-bold text-white leading-tight">
                                        {slides[current].alt.split(' - ')[0]}
                                    </h3>
                                </div>
                            </div>

                            {/* --- On-Screen Controls --- */}
                            {/* Expand Button (Top Right) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                                className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 duration-300"
                                aria-label="Expand view"
                            >
                                <Maximize2 className="w-5 h-5" />
                            </button>

                            {/* --- Indicators (Top Center of Screen) --- */}
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-2 p-1.5 rounded-full bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 hover:bg-black/40">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => { e.stopPropagation(); goTo(index); }}
                                        className={`transition-all duration-300 rounded-full ${index === current
                                            ? 'w-6 h-1 bg-white shadow-sm'
                                            : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                        aria-current={index === current}
                                    />
                                ))}
                            </div>

                            {/* Prev Button (Left Center) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); prev(); }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 duration-300 transform hover:scale-110"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            {/* Next Button (Right Center) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); next(); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 duration-300 transform hover:scale-110"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* 3. Bottom Chassis (Base) - Wider than screen & Darker Aluminum */}
                    <div className="relative -mt-[1px] mx-auto w-full z-20">
                        {/* Hinge Area - Black Strip connecting screen and base */}
                        <div className="h-[14px] w-[92%] mx-auto bg-[#1a1a1a] rounded-b-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border-x border-[#0d0d0d] relative top-[0px] z-0 transition-colors duration-500"></div>

                        {/* Main Base Body - Darker Aluminum (Contrast against White) */}
                        <div className="h-[14px] bg-gradient-to-b from-[#bdc1c6] to-[#8e949e] w-full rounded-b-[16px] rounded-t-[2px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] border-t border-white/40 relative z-10 ring-1 ring-black/10 transition-colors duration-500">
                            {/* Side Curves/Reflections */}
                            <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-gradient-to-r from-white/40 to-transparent rounded-l-sm opacity-50"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-[2%] bg-gradient-to-l from-white/40 to-transparent rounded-r-sm opacity-50"></div>

                            {/* Lip for opening laptop */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[14%] h-[5px] bg-[#6b7280] rounded-b-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] opacity-80 border-t border-black/5"></div>
                        </div>
                    </div>
                </div>
            </div>



            {/* --- EXPANDED MODAL VIEW (Portal) --- */}
            {isExpanded && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300" onClick={() => setIsExpanded(false)}>
                    {/* Close Button */}
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* Navigation in Modal */}
                    <button
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Large Image */}
                    <div className="relative w-full h-full max-w-7xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={slides[current].src}
                            alt={slides[current].alt}
                            fill
                            className="object-contain"
                            priority
                            quality={100}
                        />
                        {/* Caption in Modal */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-6 py-3 rounded-full">
                            <p className="text-white font-medium text-lg text-center">
                                {slides[current].alt.split(' - ')[0]}
                            </p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
