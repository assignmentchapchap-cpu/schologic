'use client';

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface UseCasesHeroProps {
    title: string;
    subtitle: string;
    label: string;
    accentColor: "rose" | "blue" | "emerald" | "amber" | "purple" | "indigo";
    visual?: React.ReactNode;
    visualPosition?: "left" | "right";
    ctaText?: string;
    ctaHref?: string;
    onCtaClick?: () => void;
    secondaryCtaText?: string;
    secondaryCtaHref?: string;
    onSecondaryCtaClick?: () => void;
}

export function UseCasesHero({
    title,
    subtitle,
    label,
    accentColor,
    visual,
    visualPosition = "right",
    ctaText,
    ctaHref,
    onCtaClick,
    secondaryCtaText,
    secondaryCtaHref,
    onSecondaryCtaClick
}: UseCasesHeroProps) {

    const colorStyles = {
        rose: {
            pill: "bg-rose-50 border-rose-200 text-rose-600",
            text: "text-rose-600",
            button: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200",
            secondary: "text-rose-600 hover:bg-rose-50",
        },
        blue: {
            pill: "bg-blue-50 border-blue-200 text-blue-600",
            text: "text-blue-600",
            button: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200",
            secondary: "text-blue-600 hover:bg-blue-50",
        },
        emerald: {
            pill: "bg-emerald-50 border-emerald-200 text-emerald-600",
            text: "text-emerald-600",
            button: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200",
            secondary: "text-emerald-600 hover:bg-emerald-50",
        },
        amber: {
            pill: "bg-amber-50 border-amber-200 text-amber-600",
            text: "text-amber-600",
            button: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200",
            secondary: "text-amber-600 hover:bg-amber-50",
        },
        purple: {
            pill: "bg-purple-50 border-purple-200 text-purple-600",
            text: "text-purple-600",
            button: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200",
            secondary: "text-purple-600 hover:bg-purple-50",
        },
        indigo: {
            pill: "bg-indigo-50 border-indigo-200 text-indigo-600",
            text: "text-indigo-600",
            button: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200",
            secondary: "text-indigo-600 hover:bg-indigo-50",
        },
    };

    const style = colorStyles[accentColor];

    return (
        <div className="relative pt-24 pb-10 md:pt-32 md:pb-16 overflow-hidden">
            <div className="w-full pl-6 pr-6 md:pr-12 lg:pr-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">

                    {/* Visual Region - Left */}
                    {visual && visualPosition === "left" && (
                        <div className="md:col-span-5 relative flex items-center justify-center mb-8 md:mb-0">
                            {visual}
                        </div>
                    )}

                    {/* Content Region */}
                    <div className={cn(
                        "flex flex-col",
                        visual ? "md:col-span-7" : "md:col-span-8 md:col-start-3 text-center items-center",
                        visual && visualPosition === "left" ? "md:pl-12" : (visual ? "md:pr-12" : "")
                    )}>
                        <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-8 w-fit", style.pill)}>
                            {label}
                        </div>
                        <h1 className="text-[2.75rem] leading-[1.1] sm:text-5xl md:text-6xl font-serif font-black text-slate-900 mb-8 tracking-tight">
                            {title}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 leading-10 md:leading-loose mb-10 font-light max-w-2xl">
                            {subtitle}
                        </p>

                        {(ctaText || secondaryCtaText) && (
                            <div className={cn("flex flex-col sm:flex-row gap-4", !visual && "justify-center")}>
                                {ctaText && (
                                    onCtaClick ? (
                                        <button
                                            onClick={onCtaClick}
                                            className={cn("inline-flex items-center justify-center px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl min-w-[200px] whitespace-nowrap", style.button)}
                                        >
                                            {ctaText}
                                        </button>
                                    ) : ctaHref ? (
                                        <Link
                                            href={ctaHref}
                                            className={cn("inline-flex items-center justify-center px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl min-w-[200px] whitespace-nowrap", style.button)}
                                        >
                                            {ctaText}
                                        </Link>
                                    ) : null
                                )}

                                {secondaryCtaText && (
                                    onSecondaryCtaClick ? (
                                        <button
                                            onClick={onSecondaryCtaClick}
                                            className={cn("inline-flex items-center justify-center px-8 py-4 rounded-full font-bold transition-colors min-w-[200px] whitespace-nowrap", style.secondary)}
                                        >
                                            {secondaryCtaText} <ArrowRight className="w-4 h-4 ml-2" />
                                        </button>
                                    ) : secondaryCtaHref ? (
                                        <Link
                                            href={secondaryCtaHref}
                                            className={cn("inline-flex items-center justify-center px-8 py-4 rounded-full font-bold transition-colors min-w-[200px] whitespace-nowrap", style.secondary)}
                                        >
                                            {secondaryCtaText} <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    ) : null
                                )}
                            </div>
                        )}
                    </div>

                    {/* Visual Region - Right */}
                    {visual && visualPosition === "right" && (
                        <div className="md:col-span-5 relative flex items-center justify-center mt-12 md:mt-0">
                            {visual}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
