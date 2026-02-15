'use client';

import { SectionGrid, GridColumn } from "./SectionGrid";
import { cn } from "@/lib/utils";

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

import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
        <SectionGrid className="pt-32 pb-16 min-h-[85vh] flex flex-col justify-center">
            {visual && visualPosition === "left" && (
                <GridColumn span={6} className="relative flex items-center justify-center md:justify-start mb-8 md:mb-0">
                    {visual}
                </GridColumn>
            )}

            <GridColumn span={visual ? 6 : 8} className={visual ? (visualPosition === "left" ? "md:pl-12" : "md:pr-12") : "mx-auto text-center"}>
                <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-8", style.pill)}>
                    {label}
                </div>
                <h1 className="text-5xl md:text-6xl font-serif font-black text-slate-900 mb-6 leading-tight">
                    {title}
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
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
            </GridColumn>

            {visual && visualPosition === "right" && (
                <GridColumn span={6} className="relative flex items-center justify-center md:justify-end mt-8 md:mt-0">
                    {visual}
                </GridColumn>
            )}
        </SectionGrid>
    );
}
