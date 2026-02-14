"use client";

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, AlertCircle, Settings } from 'lucide-react';

export const DeanDashboardVisual = () => {
    return (
        <div className="w-full relative isolate font-sans py-[10%]">
            {/* 
              Composition Strategy: 
              We use a defined aspect ratio container to hold the base dashboard,
              then absolute position the 'drill-down' elements on top.
              py-[10%] provides vertical breathing room for overlapping cards.
            */}

            {/* 1. Base Layer: The Institutional Dashboard */}
            <div className="relative w-full aspect-[16/10] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 group">
                <Image
                    src="/images/updated screenshots/dashboard.webp"
                    alt="Dean's Institutional Dashboard Overview - Showing real-time enrollment, retention, and campus integrity metrics across all departments."
                    fill
                    loading="lazy"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />

                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl pointer-events-none"></div>
            </div>

            {/* 2. Overlay Layer: The "Exception" (Grade Table) 
                Positioned: Center Right, floating 
            */}
            <div className="absolute top-[8%] right-0 w-[55%] aspect-[16/10] rounded-xl overflow-hidden shadow-2xl border border-red-200 bg-white transform rotate-[-2deg] hover:rotate-0 hover:z-20 transition-all duration-500 hover:scale-105 group/table">
                {/* Header Bar Simulation */}
                <div className="h-6 bg-red-50 border-b border-red-100 flex items-center px-3 gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Retention Alert: Nursing Dept</span>
                </div>
                <div className="relative w-full h-full">
                    <Image
                        src="/images/updated screenshots/grade table.webp"
                        alt="Course Performance Drill-down - Highlighting specific courses with anomalous grade distributions or attendance drops."
                        fill
                        loading="lazy"
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 50vw, 33vw"
                    />
                </div>

                {/* Connection Cursor */}
                <div className="absolute -left-3 top-1/2 bg-white rounded-full p-1.5 shadow-lg border border-red-100 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                </div>
            </div>

            {/* 3. Focus Layer: The "Root Cause" (AI Report) 
                Positioned: Bottom Left, overlapping
            */}
            <div className="absolute bottom-0 left-0 w-[40%] aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-indigo-200 bg-white transform rotate-[3deg] hover:rotate-0 hover:z-30 transition-all duration-500 hover:scale-105 group/report">
                <div className="h-6 bg-indigo-50 border-b border-indigo-100 flex items-center px-3 gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Student Integrity Audit</span>
                </div>
                <div className="relative w-full h-full">
                    <Image
                        src="/images/updated screenshots/ai report.webp"
                        alt="Individual Student AI Integrity Report - Detailed linguistic forensic analysis showing probability of AI authorship."
                        fill
                        loading="lazy"
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 40vw, 25vw"
                    />
                </div>
            </div>

            {/* 4. Control Layer: The "Settings" (AI Settings)
                Positioned: Bottom Right, smaller
            */}
            <div className="absolute bottom-[12%] right-[5%] w-[30%] aspect-square rounded-xl overflow-hidden shadow-xl border border-slate-200 bg-white transform rotate-[-3deg] hover:rotate-0 hover:z-30 transition-all duration-500 hover:scale-105 group/settings">
                <div className="h-6 bg-slate-50 border-b border-slate-100 flex items-center px-3 gap-2">
                    <Settings className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Policy Config</span>
                </div>
                <div className="relative w-full h-full">
                    <Image
                        src="/images/updated screenshots/ai settings.webp"
                        alt="System Configuration - Adjusting institutional AI detection sensitivity thresholds and policy settings."
                        fill
                        loading="lazy"
                        className="object-cover object-left-top"
                        sizes="(max-width: 768px) 30vw, 20vw"
                    />
                </div>
                {/* Interactive Element */}
                <div className="absolute bottom-2 right-2 bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg opacity-0 group-hover/settings:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-3 h-3" />
                </div>
            </div>

        </div>
    );
};
