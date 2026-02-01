'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Check, Clock, Copy } from 'lucide-react';

export default function LiveRubricWidget() {
    const [instruction, setInstruction] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [rubric, setRubric] = useState<null | { criteria: string, excellent: string, poor: string }[]>(null);
    const [elapsedTime, setElapsedTime] = useState(0.0);

    const handleGenerate = () => {
        if (!instruction.trim()) return;

        setIsGenerating(true);
        setRubric(null);
        setElapsedTime(0);

        // Simulate "instant" generation
        const startTime = Date.now();
        const duration = 1800; // 1.8 seconds

        const timer = setInterval(() => {
            setElapsedTime((Date.now() - startTime) / 1000);
        }, 100);

        setTimeout(() => {
            clearInterval(timer);
            setElapsedTime(1.82); // Fix final time to look precise
            setIsGenerating(false);
            setRubric([
                {
                    criteria: "Thesis Clarity",
                    excellent: "Thesis is defensible, nuanced, and clearly situated within the academic conversation.",
                    poor: "Thesis is missing, factual, or disjointed from the argument."
                },
                {
                    criteria: "Evidence Integration",
                    excellent: "Seamlessly weaves primary sources with analysis; citations are impeccable.",
                    poor: "Quotes are dropped in without context (plop citations); attribution is inconsistent."
                },
                {
                    criteria: "Critical Analysis",
                    excellent: "Interrogates the counter-argument effectively; synthesizes multiple viewpoints.",
                    poor: "Merely summarizes source material without adding original insight."
                }
            ]);
        }, duration);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700 font-sans">
            {/* Header / Staus Bar */}
            <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Schologic-70B • Inference Ready</span>
                </div>
                {rubric && (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                        <Clock className="w-3 h-3" />
                        <span>Generated in {elapsedTime}s</span>
                    </div>
                )}
            </div>

            <div className="p-6 md:p-8">
                {/* Input Section */}
                <div className="space-y-4 mb-8">
                    <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
                        Draft Assignment Instructions
                    </label>
                    <div className="relative">
                        <textarea
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            placeholder="e.g. Write a 5-page analysis of the 'Sovereign Individual' thesis..."
                            className="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none h-24 font-mono text-sm resize-none"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={!instruction || isGenerating}
                            className={`absolute bottom-3 right-3 px-4 py-2 rounded-md font-bold text-xs uppercase flex items-center gap-2 transition-all ${!instruction
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : isGenerating
                                    ? 'bg-indigo-600 text-white cursor-wait'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-slate-900'
                                }`}
                        >
                            {isGenerating ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Sparkles className="w-3 h-3" /> Generate Rubric
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                <div className="min-h-[200px] border-t border-slate-700/50 pt-8">
                    {!rubric && !isGenerating && (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 space-y-4 py-8">
                            <Clock className="w-12 h-12 opacity-20" />
                            <p className="font-mono text-sm">Paste instructions above to see the speed of Schologic.</p>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                            <div className="h-20 bg-slate-800 rounded w-full"></div>
                            <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                            <div className="h-20 bg-slate-800 rounded w-full"></div>
                        </div>
                    )}

                    {rubric && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="flex items-center justify-between">
                                <h3 className="text-indigo-400 font-mono text-sm font-bold uppercase">Generated Rubric Architecture</h3>
                                <button className="text-slate-500 hover:text-white transition-colors" title="Copy to Clipboard">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {rubric.map((row, i) => (
                                    <div key={i} className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 font-mono text-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                            <span className="font-bold text-slate-200">{row.criteria}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                            <div className="pl-4 border-l-2 border-emerald-500/30">
                                                <span className="block text-emerald-500 mb-1 font-bold">Excellent (A)</span>
                                                <span className="text-slate-400">{row.excellent}</span>
                                            </div>
                                            <div className="pl-4 border-l-2 border-red-500/30">
                                                <span className="block text-red-500 mb-1 font-bold">Needs Work (C-)</span>
                                                <span className="text-slate-400">{row.poor}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 flex items-center justify-between text-indigo-300 text-sm">
                                <span>"This took <strong>{elapsedTime}s</strong> on Schologic. How long does it take you on Blackboard?"</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
