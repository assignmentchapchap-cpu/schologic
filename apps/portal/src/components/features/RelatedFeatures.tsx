'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Shield, Users, Globe, CheckCircle } from 'lucide-react';

interface RelatedFeaturesProps {
    currentFeature: 'class-manager' | 'ai-detection' | 'ai-teaching-assistant' | 'universal-reader' | 'oer-library';
}

const FEATURES = {
    'class-manager': {
        title: 'Class Manager',
        description: 'Streamline course admin and onboarding.',
        icon: Users,
        href: '/features/class-manager',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20'
    },
    'ai-detection': {
        title: 'AI Detection',
        description: 'Evidence-based integrity analysis.',
        icon: Shield,
        href: '/features/ai-detection',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20'
    },
    'ai-teaching-assistant': {
        title: 'AI Teaching Assistant',
        description: 'Automated grading and rubric alignment.',
        icon: CheckCircle,
        href: '/features/ai-teaching-assistant',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20'
    },
    'universal-reader': {
        title: 'Universal Reader',
        description: 'AI-enhanced document accessibility.',
        icon: BookOpen,
        href: '/features/universal-reader',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20'
    },
    'oer-library': {
        title: 'OER Library',
        description: 'Zero-cost educational resources.',
        icon: Globe,
        href: '/features/oer-library',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20'
    }
};

const RELATED_MAP: Record<string, string[]> = {
    'class-manager': ['ai-detection', 'ai-teaching-assistant'],
    'ai-detection': ['class-manager', 'ai-teaching-assistant'],
    'ai-teaching-assistant': ['ai-detection', 'universal-reader'],
    'universal-reader': ['ai-teaching-assistant', 'oer-library'],
    'oer-library': ['universal-reader', 'class-manager']
};

export function RelatedFeatures({ currentFeature }: RelatedFeaturesProps) {
    const relatedKeys = RELATED_MAP[currentFeature] || [];
    const relatedItems = relatedKeys.map(key => FEATURES[key as keyof typeof FEATURES]);

    return (
        <section className="py-24 bg-slate-950 border-t border-slate-900">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-serif font-bold text-white mb-8 text-center">Explore Related Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {relatedItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group block p-6 rounded-2xl border ${item.border} ${item.bg} hover:bg-slate-900 transition-all duration-300`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className={`w-6 h-6 ${item.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-slate-400 text-sm mt-1">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
