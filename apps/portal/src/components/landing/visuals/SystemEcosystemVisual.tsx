"use client";

import React, { useState } from 'react';
import { Shield, Users, Database, Globe, Lock, Info, X } from 'lucide-react';
import { cn } from "@/lib/utils";

export const SystemEcosystemVisual = () => {
    const [activeLayer, setActiveLayer] = useState<'governance' | 'infrastructure' | 'access'>('governance');
    const [showDescription, setShowDescription] = useState(false);

    const layers = {
        governance: {
            title: "Policy \u0026 Governance",
            desc: "Centrally managed academic policies, grading rubrics, and institutional compliance standards.",
            icon: Shield,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-100"
        },
        infrastructure: {
            title: "Secure Infrastructure",
            desc: "Encrypted data sovereignty layers with multi-campus redundancy and regional compliance.",
            icon: Database,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100"
        },
        access: {
            title: "Identity \u0026 Access",
            desc: "Granular RBAC ensures users only access data relevant to their role and department.",
            icon: Users,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100"
        }
    };

    return (
        <div
            className="w-full relative bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            role="img"
            aria-label="Relationship diagram showing institutional governance, secure infrastructure, and role-based access"
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
                            This diagram showcases Schologic's institutional governance and data sovereignty framework.
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            Schologic provides unified oversight without sacrificing local autonomy. Whether managing a single campus or a multi-institution system, our granular RBAC ensures that <strong>data sovereignty</strong> is maintained while enabling centralized policy enforcement.
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
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Institutional Architecture</h3>
                </div>
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
            </div>

            <div className="p-4 md:p-8">
                {/* 3D-ish Stack */}
                <div className="relative h-64 md:h-80 flex flex-col items-center justify-center">
                    {(Object.keys(layers) as Array<keyof typeof layers>).map((key, i) => {
                        const layer = layers[key];
                        const isActive = activeLayer === key;

                        return (
                            <button
                                key={key}
                                onClick={() => setActiveLayer(key)}
                                className={cn(
                                    "absolute w-full max-w-[280px] md:max-w-sm aspect-[3/1] rounded-2xl border-2 transition-all duration-500 shadow-lg flex items-center px-4 md:px-8 gap-4 md:gap-6",
                                    layer.bg,
                                    layer.border,
                                    isActive ? "z-30 scale-105 -translate-y-4" : "z-10 hover:z-20",
                                    i === 0 ? "top-0 translate-y-0" : i === 1 ? "top-1/4 translate-y-2 md:translate-y-4" : "top-2/4 translate-y-4 md:translate-y-8"
                                )}
                                style={{
                                    transform: `translateY(${i * (isActive ? -10 : 20)}px) rotateX(15deg) rotateZ(-2deg)`,
                                    opacity: isActive ? 1 : 0.7 + (i * 0.1)
                                }}
                            >
                                <div className={cn("p-2 md:p-3 rounded-xl bg-white shadow-sm", layer.color)}>
                                    <layer.icon className="w-5 h-5 md:w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h4 className={cn("font-black text-xs md:text-sm uppercase tracking-tight", layer.color)}>
                                        {layer.title}
                                    </h4>
                                    <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-tight">
                                        {isActive ? "Active Monitoring" : "Integrated Layer"}
                                    </p>
                                </div>
                                {isActive && (
                                    <div className="ml-auto animate-pulse">
                                        <div className={cn("w-2 h-2 rounded-full", layer.color.replace('text', 'bg'))}></div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Layer Details Section */}
                <div className="mt-8 p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-start gap-4">
                        <div className={cn("p-2 rounded-lg bg-white shadow-sm", layers[activeLayer].color)}>
                            {React.createElement(layers[activeLayer].icon, { className: "w-5 h-5" })}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-1">{layers[activeLayer].title}</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {layers[activeLayer].desc}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Badges */}
                <div className="mt-6 flex flex-wrap gap-2 md:gap-4 justify-center">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Globe className="w-3 h-3" />
                        GDPR Compliant
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Lock className="w-3 h-3" />
                        AES-256
                    </div>
                </div>
            </div>
        </div>
    );
};
