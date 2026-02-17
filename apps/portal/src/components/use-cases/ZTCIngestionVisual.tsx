
"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, Globe, CheckCircle, ChevronDown, Database, Search, Menu, MessageSquare, Download, FileText, Plus, ChevronRight, Info, X } from 'lucide-react';
import { cn } from "@/lib/utils";

export const ZTCIngestionVisual = () => {
    const [activeSource, setActiveSource] = useState<'libretexts' | 'openstax'>('libretexts');
    const [progress, setProgress] = useState(0); // 0: Idle, 1: Download, 2: Import, 3: Assign, 4: Done
    const [showDescription, setShowDescription] = useState(false);

    // Reset and trigger animation sequence on source change
    useEffect(() => {
        setProgress(0);

        const timers = [
            setTimeout(() => setProgress(1), 100),  // Start Download
            setTimeout(() => setProgress(2), 600),  // Start Import
            setTimeout(() => setProgress(3), 1100), // Start Assign
            setTimeout(() => setProgress(4), 1600), // Show Reader
        ];

        return () => timers.forEach(clearTimeout);
    }, [activeSource]);

    return (
        <div
            className="w-full relative bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-sans flex flex-col"
            role="img"
            aria-label="Universal OER Ingestion animation showing import process from LibreTexts and OpenStax"
            data-nosnippet
        >
            {/* SEO Description Overlay */}
            {showDescription && (
                <div className="absolute inset-0 z-50 bg-white/98 backdrop-blur-sm p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                            This Universal OER Ingestion animation showcases the import process from global repositories like LibreTexts and OpenStax.
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            As indicated here, the process begins with searching for a resource and adding it to the Schologic LMS library, from where you can choose follow-up actions like course assignment or curriculum remixing.
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

            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-indigo-100 flex items-center justify-center">
                        <Database className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">Universal OER Ingestion</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDescription(!showDescription)}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            showDescription ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        )}
                        title="Show Description"
                    >
                        <Info className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">IMSCC Verified</span>
                    </div>
                </div>
            </div>

            <div className="p-3 md:p-6 bg-slate-50/50 flex-1 flex flex-col">

                {/* PHASE 1: SEARCH / SOURCE SELECTION */}
                <div className="mb-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-mono text-[10px]">1</div>
                        Select Source Repository
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {/* LibreTexts Card */}
                        <button
                            onClick={() => setActiveSource('libretexts')}
                            className={cn(
                                "text-left p-4 rounded-xl border shadow-sm flex items-center gap-4 relative overflow-hidden group transition-all duration-300",
                                activeSource === 'libretexts'
                                    ? "bg-white border-blue-200 ring-2 ring-blue-100 scale-[1.02]"
                                    : "bg-white/50 border-slate-200 hover:border-blue-100 hover:bg-white"
                            )}
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                            <div className={cn(
                                "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center border z-10 transition-colors",
                                activeSource === 'libretexts' ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-100"
                            )}>
                                <BookOpen className={cn("w-5 h-5 transition-colors", activeSource === 'libretexts' ? "text-blue-600" : "text-slate-400")} />
                            </div>
                            <div className="z-10">
                                <div className={cn("font-bold text-sm transition-colors", activeSource === 'libretexts' ? "text-slate-900" : "text-slate-500")}>LibreTexts</div>
                                <div className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded-md inline-block mt-1">Chemistry 101</div>
                            </div>
                        </button>

                        {/* OpenStax Card */}
                        <button
                            onClick={() => setActiveSource('openstax')}
                            className={cn(
                                "text-left p-4 rounded-xl border shadow-sm flex items-center gap-4 relative overflow-hidden group transition-all duration-300",
                                activeSource === 'openstax'
                                    ? "bg-white border-orange-200 ring-2 ring-orange-100 scale-[1.02]"
                                    : "bg-white/50 border-slate-200 hover:border-orange-100 hover:bg-white"
                            )}
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                            <div className={cn(
                                "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center border z-10 transition-colors",
                                activeSource === 'openstax' ? "bg-orange-50 border-orange-100" : "bg-slate-50 border-slate-100"
                            )}>
                                <Globe className={cn("w-5 h-5 transition-colors", activeSource === 'openstax' ? "text-orange-600" : "text-slate-400")} />
                            </div>
                            <div className="z-10">
                                <div className={cn("font-bold text-sm transition-colors", activeSource === 'openstax' ? "text-slate-900" : "text-slate-500")}>OpenStax</div>
                                <div className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded-md inline-block mt-1">Calculus Vol. 1</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Connector from Sources to Pipeline */}
                <div className="relative h-6 w-full">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                        <path d="M 300 0 C 300 10, 48 10, 48 24" stroke="#cbd5e1" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                    </svg>
                    <div className="absolute left-[39px] bottom-0 w-4 h-4 rounded-full bg-slate-200 border-2 border-white z-10"></div>
                </div>

                {/* PHASE 2-4: THE PIPELINE */}
                <div className="flex-1 relative pl-6 md:pl-12 border-l-2 border-slate-200 ml-4 md:ml-8 space-y-3 pb-2 pt-1">

                    {/* Step 2: Download */}
                    <div className="relative group">
                        <div className={cn(
                            "absolute -left-[37px] md:-left-[61px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 bg-white z-10",
                            progress >= 1 ? "border-indigo-500 scale-110" : "border-slate-200"
                        )}>
                            <div className={cn("w-2 h-2 rounded-full transition-colors duration-500", progress >= 1 ? "bg-indigo-500" : "bg-slate-200")}></div>
                        </div>
                        <div className={cn("transition-all duration-500", progress >= 1 ? "opacity-100 translate-x-0" : "opacity-30 translate-x-4")}>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 shrink-0">
                                    <Download className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-700 text-sm">IMSCC Retrieval</div>
                                    <div className="text-xs text-slate-500">Fetching 1.2GB Common Cartridge package...</div>
                                </div>
                                {progress >= 1 ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto animate-in zoom-in spin-in-90 duration-300" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 ml-auto"></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Import */}
                    <div className="relative group">
                        <div className={cn(
                            "absolute -left-[37px] md:-left-[61px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 bg-white z-10",
                            progress >= 2 ? "border-indigo-500 scale-110" : "border-slate-200"
                        )}>
                            <div className={cn("w-2 h-2 rounded-full transition-colors duration-500", progress >= 2 ? "bg-indigo-500" : "bg-slate-200")}></div>
                        </div>
                        <div className={cn("transition-all duration-500 delay-100", progress >= 2 ? "opacity-100 translate-x-0" : "opacity-30 translate-x-4")}>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500 shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-700 text-sm">Standardization</div>
                                    <div className="text-xs text-slate-500">Normalizing schema to HTML5 canvas...</div>
                                </div>
                                {progress >= 2 ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto animate-in zoom-in spin-in-90 duration-300" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 ml-auto"></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Assign */}
                    <div className="relative group">
                        <div className={cn(
                            "absolute -left-[37px] md:-left-[61px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 bg-white z-10",
                            progress >= 3 ? "border-indigo-500 scale-110" : "border-slate-200"
                        )}>
                            <div className={cn("w-2 h-2 rounded-full transition-colors duration-500", progress >= 3 ? "bg-indigo-500" : "bg-slate-200")}></div>
                        </div>
                        <div className={cn("transition-all duration-500 delay-200", progress >= 3 ? "opacity-100 translate-x-0" : "opacity-30 translate-x-4")}>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <div className="h-10 w-10 bg-pink-50 rounded-lg flex items-center justify-center text-pink-500 shrink-0">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-700 text-sm">Target Course</div>
                                    <div className="text-xs text-slate-500">Mapping content to <span className="font-mono bg-slate-100 px-1 rounded">
                                        {activeSource === 'libretexts' ? "CHEM-101" : "MATH-101"}
                                    </span> strategy...</div>
                                </div>
                                {progress >= 3 ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto animate-in zoom-in spin-in-90 duration-300" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 ml-auto"></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Final Arrow */}
                    <div className={cn(
                        "transition-all duration-500 delay-300 flex justify-center",
                        progress >= 4 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                    )}>
                        <div className="bg-slate-100 text-slate-400 p-2 rounded-full">
                            <ChevronDown className="w-4 h-4 text-white animate-bounce" />
                        </div>
                    </div>

                </div>

                {/* PHASE 3: OUTPUT (READER) */}
                <div className={cn(
                    "transition-all duration-700 delay-300 transform",
                    progress >= 4 ? "opacity-100 translate-y-0" : "opacity-50 translate-y-8 blur-sm grayscale"
                )}>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-mono text-[10px]">5</div>
                        Universal Reader Output
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden relative">
                        {/* Reader Browser Chrome */}
                        <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400/20 border border-red-500/30"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20 border border-amber-500/30"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/20 border border-emerald-500/30"></div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-md px-3 py-1 text-[10px] text-slate-400 flex-1 flex items-center gap-2 font-mono">
                                <Search className="w-3 h-3 opality-50" />
                                <span className="truncate">
                                    {activeSource === 'libretexts'
                                        ? "schologic.edu/reader/chem-101/atomic-structure"
                                        : "schologic.edu/reader/math-101/derivatives"}
                                </span>
                            </div>
                        </div>

                        {/* Reader Body */}
                        <div className="flex h-28">
                            {/* Sidebar */}
                            <div className="w-16 bg-slate-50 border-r border-slate-100 flex flex-col items-center py-4 gap-4">
                                <Menu className="w-4 h-4 text-slate-400" />
                                <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
                                <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
                                <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4 relative">
                                <h4 className="font-serif font-bold text-slate-800 text-sm mb-2 transition-all duration-300">
                                    {activeSource === 'libretexts' ? "4.2: Atomic Structure" : "3.1: Derivatives"}
                                </h4>
                                <div className="space-y-2">
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
                                    <div className="h-1.5 w-5/6 bg-slate-100 rounded-full relative">
                                        <div className={cn(
                                            "absolute inset-0 -mx-1 px-1 rounded flex items-center group cursor-pointer transition-colors duration-300",
                                            activeSource === 'libretexts' ? "bg-yellow-100/80" : "bg-green-100/80"
                                        )}>
                                            <div className={cn(
                                                "h-full w-full rounded transition-colors",
                                                activeSource === 'libretexts' ? "bg-yellow-200/50" : "bg-green-200/50"
                                            )}></div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
                                    <div className="h-1.5 w-4/6 bg-slate-100 rounded-full"></div>
                                </div>

                                {/* Floating Toolbar Mock */}
                                <div className="absolute bottom-6 right-6 flex gap-2">
                                    <div className="h-8 w-8 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
