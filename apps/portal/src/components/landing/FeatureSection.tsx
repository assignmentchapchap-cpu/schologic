'use client';

import { Zap, Scale, ShieldCheck } from 'lucide-react';

const features = [
    {
        icon: Zap,
        title: "AI-Powered Grading",
        description: "Submit essays and reports to our engine and get sentence-by-sentence feedback, scores, and improvement suggestions in seconds.",
        color: "text-amber-400",
        bg: "bg-amber-400/10"
    },
    {
        icon: Scale,
        title: "One-Click Rubrics",
        description: "No more manual criteria drafting. Describe your assignment, and our AI generates a balanced, professional marking scheme instantly.",
        color: "text-indigo-400",
        bg: "bg-indigo-400/10"
    },
    {
        icon: ShieldCheck,
        title: "Academic Integrity",
        description: "Every submission is scanned for AI probability and plagiarism. Ensure fairness with our advanced authenticity detection.",
        color: "text-emerald-400",
        bg: "bg-emerald-400/10"
    }
];

export default function FeatureSection() {
    return (
        <section className="py-24 bg-slate-900 border-t border-slate-800">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3">Why Schologic LMS?</h2>
                    <h3 className="text-3xl md:text-5xl font-black text-white mb-6">
                        Why Choose Schologic LMS?
                    </h3>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Unified experience for modern academia. Schologic LMS combines powerful AI with intuitive management.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 hover:bg-slate-800 hover:border-indigo-500/30 transition-all group">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.bg}`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                            <p className="text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
