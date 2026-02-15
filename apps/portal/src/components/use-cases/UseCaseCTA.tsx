import { SectionGrid, GridColumn } from "@/components/use-cases/SectionGrid";
import { UseCaseFAQ } from "@/components/use-cases/UseCaseFAQ";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CTAButton {
    text: string;
    href: string;
    icon?: React.ReactNode;
}

interface Badge {
    icon: React.ReactNode;
    label: string;
}

interface FAQItem {
    question: string;
    answer: string;
}

interface UseCaseCTAProps {
    accentColor: 'rose' | 'purple' | 'indigo' | 'amber' | 'emerald';
    icon: React.ReactNode;
    heading: string;
    subtitle: string;
    primaryCta: CTAButton;
    secondaryCta: CTAButton;
    badges?: Badge[];
    faqItems: FAQItem[];
}

const colorMap = {
    rose: {
        gradient: 'from-rose-50',
        grid: 'bg-grid-rose-500/10',
        shadow: 'shadow-rose-900/5',
        primaryBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
        secondaryHover: 'hover:text-rose-600',
        badgeText: 'text-rose-600/80',
    },
    purple: {
        gradient: 'from-purple-50',
        grid: 'bg-grid-purple-500/10',
        shadow: 'shadow-purple-900/5',
        primaryBg: 'bg-purple-600 hover:bg-purple-700 shadow-purple-200',
        secondaryHover: 'hover:text-purple-600',
        badgeText: 'text-purple-600/80',
    },
    indigo: {
        gradient: 'from-indigo-50',
        grid: 'bg-grid-indigo-500/10',
        shadow: 'shadow-indigo-900/5',
        primaryBg: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20',
        secondaryHover: 'hover:text-indigo-600',
        badgeText: 'text-indigo-600/80',
    },
    amber: {
        gradient: 'from-amber-50',
        grid: 'bg-grid-amber-500/10',
        shadow: 'shadow-amber-900/5',
        primaryBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
        secondaryHover: 'hover:text-amber-600',
        badgeText: 'text-amber-600/80',
    },
    emerald: {
        gradient: 'from-emerald-50',
        grid: 'bg-grid-emerald-500/10',
        shadow: 'shadow-emerald-900/5',
        primaryBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
        secondaryHover: 'hover:text-emerald-600',
        badgeText: 'text-emerald-600/80',
    },
};

export function UseCaseCTA({
    accentColor,
    icon,
    heading,
    subtitle,
    primaryCta,
    secondaryCta,
    badges,
    faqItems,
}: UseCaseCTAProps) {
    const colors = colorMap[accentColor];

    return (
        <div className={`bg-gradient-to-b ${colors.gradient} to-white py-12 md:py-16 ${colors.grid}`}>
            <SectionGrid>
                {/* Left Column: CTA Content (60%) */}
                <GridColumn span={7} className="flex flex-col justify-center text-center md:text-left">
                    <div className={`w-14 h-14 bg-white rounded-2xl shadow-xl ${colors.shadow} flex items-center justify-center mx-auto md:mx-0 mb-4 transform rotate-3`}>
                        {icon}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3">
                        {heading}
                    </h2>
                    <p className="text-base text-slate-600 mb-6 leading-relaxed">
                        {subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
                        <Link
                            href={primaryCta.href}
                            className={`text-white px-8 py-3.5 rounded-full font-bold text-base ${colors.primaryBg} transition-all transform hover:scale-105 shadow-xl flex items-center gap-2 whitespace-nowrap`}
                        >
                            {primaryCta.icon}
                            {primaryCta.text}
                            {!primaryCta.icon && <ArrowRight className="w-4 h-4" />}
                        </Link>
                        <Link
                            href={secondaryCta.href}
                            className={`text-slate-600 font-bold ${colors.secondaryHover} transition-colors flex items-center gap-2 text-sm whitespace-nowrap`}
                        >
                            {secondaryCta.text} <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {badges && badges.length > 0 && (
                        <div className={`mt-6 flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 ${colors.badgeText} text-xs font-medium`}>
                            {badges.map((badge, index) => (
                                <div key={index} className="flex items-center gap-1.5">
                                    {badge.icon}
                                    {badge.label}
                                </div>
                            ))}
                        </div>
                    )}
                </GridColumn>

                {/* Right Column: FAQ Accordion (40%) */}
                <GridColumn span={5} className="flex items-center">
                    <div className="w-full bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 p-4 shadow-sm">
                        <UseCaseFAQ items={faqItems} accentColor={accentColor} />
                    </div>
                </GridColumn>
            </SectionGrid>
        </div>
    );
}
