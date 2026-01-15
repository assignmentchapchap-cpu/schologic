'use client';

import { useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

const roles = [
    {
        id: 'instructors',
        label: 'For Instructors',
        title: "Grade with Superpowers",
        description: "Turn hours of grading into minutes. Give every student ample feedback without burning out.",
        points: [
            "Instant sentence-level feedback",
            "Auto-generated rubrics from simple prompts",
            "Bulk grading workflows",
            "Detailed class performance analytics"
        ]
    },
    {
        id: 'students',
        label: 'For Students',
        title: "Know Where You Stand",
        description: "Get feedback instantly. Understand your grade before the deadline and improve your writing skills.",
        points: [
            "Instant preliminary scoring",
            "Clear, actionable feedback",
            "Originality & AI check reports",
            "Transparent grading criteria"
        ]
    }
];

export default function RoleSwitcher() {
    const [activeRole, setActiveRole] = useState(0);

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Decorative Blobs */}
            <div className="absolute -left-20 top-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute -right-20 bottom-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-60"></div>


            <div className="container mx-auto px-6 relative z-10">
                <div className="flex justify-center mb-16">
                    <div className="bg-slate-100 p-1 rounded-2xl flex">
                        {roles.map((role, index) => (
                            <button
                                key={role.id}
                                onClick={() => setActiveRole(index)}
                                className={`px-8 py-3 rounded-xl font-bold transition-all ${activeRole === index ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                    <div className="order-2 md:order-1 space-y-8 animate-fade-in-up">
                        <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                            {roles[activeRole].title}
                        </h3>
                        <p className="text-xl text-slate-500 leading-relaxed">
                            {roles[activeRole].description}
                        </p>
                        <div className="space-y-4">
                            {roles[activeRole].points.map((point, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                        <CheckCircle className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-lg text-slate-700 font-medium">{point}</span>
                                </div>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-4 transition-all pt-4">
                            Learn more about features <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="order-1 md:order-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl transform rotate-3 scale-95 opacity-50 blur-lg"></div>
                            <div className="relative bg-slate-900 rounded-3xl p-2 shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
                                <img
                                    src={`/feature-preview-${activeRole === 0 ? 'instructor' : 'student'}.png`}
                                    alt="Interface Preview"
                                    className="rounded-2xl w-full h-auto bg-slate-800 min-h-[400px] object-cover"
                                    // Fallback if image missing
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                {/* Fallback Placeholder */}
                                <div className="hidden h-[400px] w-full bg-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-500 gap-4">
                                    <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
                                        <span className="text-3xl">✨</span>
                                    </div>
                                    <p className="font-mono text-sm uppercase tracking-widest">Interface Preview: {roles[activeRole].label}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
