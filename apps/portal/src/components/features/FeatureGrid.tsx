'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    href: string;
    bgColor?: string; // tailwind bg color class, e.g. "bg-blue-400/10"
}

export function FeatureCard({
    title,
    description,
    icon,
    href,
    bgColor = "bg-indigo-400/10"
}: FeatureCardProps) {
    return (
        <Link
            href={href}
            className="group relative flex flex-col p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-indigo-500/30 transition-all duration-300 overflow-hidden"
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${bgColor}`}>
                {icon}
            </div>

            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                {title}
            </h3>

            <p className="text-slate-400 leading-relaxed mb-6 flex-grow">
                {description}
            </p>

            <div className="flex items-center gap-2 text-sm font-bold text-indigo-400 group-hover:text-indigo-300">
                Learn more
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Link>
    );
}

export function FeatureGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {children}
        </div>
    );
}
