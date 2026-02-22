'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import Image from 'next/image';

// Common Skeleton Fallbacks
const WideSkeleton = () => <div className="w-full aspect-video bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />;
const SquareSkeleton = () => <div className="w-full aspect-square bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />;
const TallSkeleton = () => <div className="w-full aspect-[4/5] bg-slate-100 animate-pulse rounded-3xl" />;

export const IntegrityCheckVisual = dynamic(() => import("./IntegrityCheckVisual").then(mod => mod.IntegrityCheckVisual), {
    ssr: false,
    loading: WideSkeleton
});

export const TAInsightsVisual = dynamic(() => import("./TAInsightsVisual").then(mod => mod.TAInsightsVisual), {
    ssr: false,
    loading: WideSkeleton
});

export const PracticumProcessVisual = dynamic(() => import("./PracticumProcessVisual").then(mod => mod.PracticumProcessVisual), {
    ssr: false,
    loading: SquareSkeleton
});

export const ZTCIngestionVisual = dynamic(() => import("./ZTCIngestionVisual").then(mod => mod.ZTCIngestionVisual), {
    ssr: false,
    loading: WideSkeleton
});

export const StudentMobileCarousel = dynamic(() => import("./StudentMobileCarousel").then(mod => mod.StudentMobileCarousel), {
    ssr: false,
    loading: TallSkeleton
});

export const SystemEcosystemVisual = dynamic(() => import("./SystemEcosystemVisual").then(mod => mod.SystemEcosystemVisual), {
    ssr: false,
    loading: SquareSkeleton
});

const DeanDashboardPlaceholder = () => (
    <div className="relative mx-auto w-full max-w-4xl pt-4">
        {/* Lid Shell */}
        <div className="relative w-[92%] mx-auto bg-[#0d0d0d] rounded-t-[18px] rounded-b-[2px] p-[1%] shadow-2xl ring-1 ring-white/10 z-10">
            {/* Inner Screen Area */}
            <div className="relative bg-black rounded-[4px] overflow-hidden aspect-[16/10] flex flex-col">
                {/* Mock Browser UI Placeholder */}
                <div className="h-5 w-full bg-[#1e1e1e] flex items-center px-2 space-x-1.5 border-b border-white/5 shrink-0">
                    {/* Window Controls */}
                    <div className="flex space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                        <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
                    </div>
                    {/* Mock Tabs/Address Bar Area */}
                    <div className="flex-1 flex items-center justify-center px-4">
                        <div className="h-2.5 w-1/2 bg-[#2d2d2d] rounded flex items-center justify-center">
                            <div className="h-0.5 w-1/2 bg-[#3d3d3d] rounded-sm"></div>
                        </div>
                    </div>
                </div>
                {/* Image Area */}
                <div className="relative w-full flex-1 bg-[#0f111a] overflow-hidden">
                    <Image
                        src="/images/updated screenshots/dashboard.webp"
                        alt="Schologic LMS Dashboard"
                        fill
                        priority
                        className="object-fill"
                        sizes="(max-width: 768px) 100vw, 800px"
                    />
                </div>
            </div>
        </div>
        {/* Bottom Chassis Shell */}
        <div className="relative -mt-[1px] mx-auto w-full z-20">
            {/* Hinge */}
            <div className="h-[14px] w-[92%] mx-auto bg-[#1a1a1a] rounded-b-lg border-x border-[#0d0d0d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
            {/* Main Base */}
            <div className="h-[14px] bg-gradient-to-b from-[#bdc1c6] to-[#8e949e] w-full rounded-b-[16px] rounded-t-[2px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] border-t border-white/40 relative z-10 ring-1 ring-black/10" />
        </div>
    </div>
);

export const DeanDashboardVisual = dynamic(() => import("./DeanDashboardVisual").then(mod => mod.DeanDashboardVisual), {
    ssr: false,
    loading: DeanDashboardPlaceholder
});
