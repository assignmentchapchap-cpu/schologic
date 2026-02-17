'use client';

import dynamic from 'next/dynamic';
import React from 'react';

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

export const DeanDashboardVisual = dynamic(() => import("./DeanDashboardVisual").then(mod => mod.DeanDashboardVisual), {
    ssr: false,
    loading: () => (
        <div className="w-full max-w-4xl pt-4 animate-pulse">
            <div className="w-[92%] mx-auto aspect-[16/10] bg-slate-200 rounded-t-[18px]" />
            <div className="h-[14px] bg-slate-300 w-full rounded-b-[16px]" />
        </div>
    )
});
