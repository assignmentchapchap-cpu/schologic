"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Settings, X, Terminal, Cpu, Layers, Activity, Sparkles } from "lucide-react";
import { MODELS, MODEL_LABELS, ScoringMethod, Granularity, AnalysisReport, AnalysisSegment } from "@schologic/ai-bridge";
import dynamic from 'next/dynamic';
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });
import ScoreChart from "@/components/ScoreChart";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AiScoringLab() {
    // State
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [rawResults, setRawResults] = useState<AnalysisSegment[]>([]);
    const [method, setMethod] = useState<ScoringMethod>(ScoringMethod.WEIGHTED);
    const [granularity, setGranularity] = useState<Granularity>(Granularity.PARAGRAPH);
    const [selectedModel, setSelectedModel] = useState<string>(MODELS.ROBERTA_LARGE);
    const [showSettings, setShowSettings] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Load persistence
    useEffect(() => {
        const savedMethod = localStorage.getItem('lab_method');
        const savedGranularity = localStorage.getItem('lab_granularity');
        const savedModel = localStorage.getItem('lab_model');

        if (savedMethod) setMethod(savedMethod as ScoringMethod);
        if (savedGranularity) setGranularity(savedGranularity as Granularity);
        if (savedModel) setSelectedModel(savedModel);
    }, []);

    // Save persistence
    const handleSaveConfig = () => {
        localStorage.setItem('lab_method', method);
        localStorage.setItem('lab_granularity', granularity);
        localStorage.setItem('lab_model', selectedModel);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        setShowSettings(false);
    };

    const handleRunAnalysis = async () => {
        if (text.trim().length < 50) {
            setError("Please enter at least 50 characters.");
            return;
        }
        setLoading(true);
        setProgress(0);
        setError(null);
        setRawResults([]);

        try {
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    model: selectedModel,
                    granularity
                })
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (!response.ok) {
                throw new Error("Analysis failed. API responded with error.");
            }

            const data = await response.json();
            setRawResults(data.segments);

        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'Engine Error: Failed to reach model.';
            setError(message);
        } finally {
            setTimeout(() => setLoading(false), 300);
        }
    };

    const calculatedReport = useMemo<AnalysisReport | null>(() => {
        if (rawResults.length === 0) return null;

        let totalWords = 0;
        let suspectedWords = 0;

        const segments = rawResults.map(res => {
            totalWords += res.words;
            let contribution = 0;
            let isFlagged = false;

            // Logic Control
            if (method === ScoringMethod.BINARY) {
                isFlagged = res.prob > 0.5;
                contribution = isFlagged ? res.words : 0;
            }
            else if (method === ScoringMethod.WEIGHTED) {
                isFlagged = res.prob > 0.5;
                contribution = res.words * res.prob;
            }
            else if (method === ScoringMethod.STRICT) {
                isFlagged = res.prob > 0.9;
                contribution = isFlagged ? res.words : 0;
            }

            suspectedWords += contribution;
            return { ...res, isFlagged, contribution };
        });

        return {
            score: Math.round((suspectedWords / totalWords) * 100),
            segments,
            totalWords,
            overallReason: `Analysis completed via ${selectedModel.split('/').pop()} using ${method.toUpperCase()} logic.`
        };
    }, [rawResults, method, granularity, selectedModel]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {showConfetti && <ReactConfetti numberOfPieces={200} recycle={false} />}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in font-sans">
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setShowSettings(false)}></div>
                    <div className="relative w-full max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col border-l border-slate-200 animate-slide-in">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Config</h2>
                                <p className="text-sm text-slate-500">Inference Engine Settings</p>
                            </div>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6 flex-1 overflow-y-auto">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">Model Selection</label>
                                <div className="space-y-2">
                                    {MODELS && Object.entries(MODELS).map(([key, value]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedModel(value)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg border transition-all text-sm",
                                                selectedModel === value
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                            )}
                                        >
                                            <div className="flex justify-between items-center mb-0.5">
                                                <span className="font-medium">{MODEL_LABELS?.[value] || key}</span>
                                                {selectedModel === value && <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>}
                                            </div>
                                            <p className="text-xs text-slate-400 truncate">{value}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                <div className="flex gap-2">
                                    <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-xs font-semibold text-blue-900 mb-1">Model Context</h3>
                                        <p className="text-xs text-blue-700 leading-relaxed">
                                            RoBERTa models generally offer the best balance of structure detection. Use specialized detectors for short-form content.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveConfig}
                            className="mt-6 w-full bg-slate-900 text-white py-3 px-4 rounded-lg font-medium text-sm hover:bg-slate-800 transition-all shadow-sm active:translate-y-0.5"
                        >
                            Save Configuration
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
                            <Terminal className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-slate-900 leading-tight">AI Lab Studio</h1>
                            <p className="text-sm text-slate-500 font-medium">Advanced Detection & Analysis</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-medium text-slate-600">{selectedModel?.split('/').pop() || 'Unknown Model'}</span>
                        </div>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm shadow-sm"
                        >
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Input - Focused on writing */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px] overflow-hidden transition-shadow hover:shadow-md">
                            <div className="flex-1 relative group">
                                <textarea
                                    className="w-full h-full p-6 text-base leading-relaxed text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-0 font-normal"
                                    placeholder="Paste or type your text here to begin analysis..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                                />
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium px-2">
                                    <span>Ready for inference</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span>{text.length} chars</span>
                                </div>
                                <button
                                    onClick={handleRunAnalysis}
                                    disabled={loading || text.length < 50}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm",
                                        loading || text.length < 50
                                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-md active:translate-y-0.5"
                                    )}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Cpu className="w-4 h-4" /> Run Analysis
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-fade-in">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                {error}
                            </div>
                        )}

                        {/* Segment Results (Clean List) */}
                        {calculatedReport && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-in">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-slate-400" />
                                    <h3 className="text-sm font-semibold text-slate-700">Detailed Breakdown</h3>
                                </div>
                                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                                    {calculatedReport.segments.map((seg, i) => (
                                        <div key={i} className={cn(
                                            "p-5 transition-colors hover:bg-slate-50",
                                            seg.isFlagged && "bg-amber-50/30 hover:bg-amber-50/50"
                                        )}>
                                            <div className="flex justify-between items-start mb-2 gap-4">
                                                <div className="text-sm text-slate-800 leading-relaxed font-normal">
                                                    {seg.text}
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {seg.isFlagged ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                                                            {(seg.prob * 100).toFixed(0)}% AI
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-500">
                                                            Human
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Controls & Dashboard */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Control Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">Model Logic</label>
                                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-lg">
                                    {(['binary', 'weighted', 'strict'] as ScoringMethod[]).map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setMethod(m)}
                                            className={cn(
                                                "py-2 px-3 text-xs font-semibold rounded-md transition-all capitalize",
                                                method === m
                                                    ? "bg-white text-slate-900 shadow-sm"
                                                    : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">Granularity</label>
                                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setGranularity(Granularity.PARAGRAPH)}
                                        className={cn(
                                            "flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all",
                                            granularity === Granularity.PARAGRAPH
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        Paragraph
                                    </button>
                                    <button
                                        onClick={() => setGranularity(Granularity.SENTENCE)}
                                        className={cn(
                                            "flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all",
                                            granularity === Granularity.SENTENCE
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        Sentence
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Score Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px] flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-700">Analysis Result</h3>
                                {calculatedReport && (
                                    <div className={cn(
                                        "px-2 py-1 rounded text-xs font-bold uppercase tracking-wide",
                                        calculatedReport.score > 50 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                                    )}>
                                        {calculatedReport.score > 50 ? "High Risk" : "Low Risk"}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 p-6 flex flex-col justify-center">
                                {calculatedReport ? (
                                    <div className="animate-fade-in">
                                        <div className="text-center mb-8">
                                            <span className={cn(
                                                "text-4xl md:text-6xl font-bold tracking-tight",
                                                calculatedReport.score > 50 ? "text-red-500" : "text-emerald-500"
                                            )}>
                                                {calculatedReport.score}%
                                            </span>
                                            <p className="text-sm text-slate-400 font-medium mt-2">AI Probability Score</p>
                                        </div>

                                        <div className="h-40">
                                            <ScoreChart data={calculatedReport.segments.map((s, i) => ({ index: i, prob: s.prob }))} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-300 space-y-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                            <Activity className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-medium">Waiting for input...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
