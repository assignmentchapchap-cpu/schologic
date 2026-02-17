import { LucideIcon } from 'lucide-react';
import React from 'react';
import { cn } from "@/lib/utils";

interface FeatureBlock {
    icon: LucideIcon;
    title: string;
    description: string;
}

interface FeaturesSectionProps {
    eyebrow: string;
    title: string;
    description: string;
    features: FeatureBlock[];
    align?: 'left' | 'right';
    visual: React.ReactNode;
    visualScaleClass?: string;
    className?: string; // For bg-white vs bg-slate-50
}

export function FeaturesSection({
    eyebrow,
    title,
    description,
    features,
    align = 'left',
    visual,
    visualScaleClass = 'scale-[0.65] group-hover:scale-[0.7] origin-center',
    className = 'bg-white'
}: FeaturesSectionProps) {
    return (
        <section className={`py-16 md:py-20 lg:h-[550px] flex items-center relative overflow-hidden border-y border-slate-100 ${className}`}>
            <div className="container mx-auto px-6 relative z-10 w-full">
                <div className={cn(
                    "flex flex-col lg:flex-row items-center gap-12 lg:gap-16 h-full",
                    align === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'
                )}>

                    {/* Copy Section */}
                    <div className="w-full lg:w-1/2 space-y-8 animate-fade-in-up flex flex-col justify-center h-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest w-fit">
                            {eyebrow}
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-3xl font-serif font-bold text-slate-900 leading-tight">
                                {title}
                            </h2>
                            <p className="text-lg text-slate-500 leading-relaxed font-light">
                                {description}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-4 group/item">
                                    <div className="mt-1 w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover/item:border-indigo-200 group-hover/item:text-indigo-600 transition-all">
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-900">{feature.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual Section */}
                    {/* Allow natural flow on mobile, fixed containment on desktop */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center h-full">
                        <div className="relative w-full group flex items-center justify-center">
                            {/* Inner container: relative on mobile to push content, absolute on desktop to fit h-[450px] */}
                            <div className={cn(
                                "relative lg:absolute lg:inset-0 flex items-center justify-center transform transition-transform duration-500 will-change-transform",
                                visualScaleClass
                            )}>
                                {visual}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
