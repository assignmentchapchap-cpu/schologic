"use client";

import { Download, Activity, Layers, FileText, FileCheck, AlertTriangle } from "lucide-react";

import dynamic from "next/dynamic";
import { AnalysisSegment } from "@schologic/ai-bridge";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Dynamically import Recharts component to avoid SSR issues
const ScoreChart = dynamic(() => import("./ScoreChart"), { ssr: false });

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LegacySegment {
    paragraph?: string;
    sentence?: string;
    score?: number;
    isSuspected?: boolean;
    isFlagged?: boolean;
}

interface ReportViewProps {
    score: number;
    reportData: {
        score?: number;
        segments?: AnalysisSegment[];
        totalWords?: number;
        overallReason?: string;
        // Legacy fallback
        paragraphs?: LegacySegment[];
        sentences?: LegacySegment[];
    };
    readOnly?: boolean;
}

export default function ReportView({ score, reportData, readOnly = false }: ReportViewProps) {
    const isHighRisk = score > 50;

    // Normalize data structure handling both legacy and new API formats
    const segments: AnalysisSegment[] = reportData.segments ||
        (reportData.paragraphs || reportData.sentences || []).map((s) => ({
            text: s.paragraph || s.sentence || "",
            prob: s.score || (s.isSuspected ? 1 : 0),
            words: (s.paragraph || s.sentence || "").split(/\s+/).length,
            isFlagged: !!(s.isFlagged || s.isSuspected),
            contribution: 0,
            reason: s.isSuspected ? "Result from analysis." : "Human Pattern"
        }));

    const handleDownloadPdf = async () => {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        let y = 20;
        const margin = 20;
        const pageWidth = doc.internal.pageSize.width;
        const maxWidth = pageWidth - (margin * 2);

        doc.setFontSize(22);
        doc.text("AI Analysis Report", margin, y);
        y += 15;

        doc.setFontSize(14);
        doc.text(`AI Score: ${score}%`, margin, y);
        y += 20;

        segments.forEach((seg) => {
            const lines = doc.splitTextToSize(seg.text, maxWidth);
            const height = lines.length * 7;

            if (y + height > 280) {
                doc.addPage();
                y = 20;
            }

            if (seg.isFlagged) {
                doc.setTextColor(180, 0, 0);
            } else {
                doc.setTextColor(0, 0, 0);
            }
            doc.text(lines, margin, y);
            y += height + 5;
        });

        doc.save("report.pdf");
    };

    return (
        <div className="space-y-6 font-sans text-slate-800 animate-fade-in">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Score Card */}
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className={cn(
                        "absolute top-0 w-full h-1.5",
                        isHighRisk ? "bg-red-500" : "bg-emerald-500"
                    )}></div>

                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> AI Probability
                    </h2>

                    <div className="relative z-10">
                        <span className={cn(
                            "text-7xl font-bold tracking-tight",
                            isHighRisk ? "text-red-600" : "text-emerald-600"
                        )}>
                            {score}%
                        </span>
                    </div>

                    <p className="text-sm font-medium text-slate-500 mt-4 max-w-xs">
                        {isHighRisk
                            ? "Document shows strong patterns consistent with AI generation."
                            : "Document shows natural human writing variance."
                        }
                    </p>
                </div>

                {/* Chart Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-semibold text-slate-700">Distribution Analysis</h3>
                        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                Human
                            </span>
                            <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded">
                                Mixed
                            </span>
                            <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded">
                                AI
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[160px]">
                        <ScoreChart data={segments.map((s, i) => ({ index: i, prob: s.prob }))} />
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Segment Analysis</h3>
                    </div>
                    <button
                        onClick={handleDownloadPdf}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-xs shadow-sm"
                    >
                        <Download className="w-3.5 h-3.5" /> Export PDF
                    </button>
                </div>

                <div className="divide-y divide-slate-100">
                    {segments.length > 0 ? segments.map((seg, i) => (
                        <div key={i} className={cn(
                            "p-6 transition-colors group",
                            seg.isFlagged ? "bg-amber-50/20 hover:bg-amber-50/40" : "hover:bg-slate-50"
                        )}>
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-mono text-slate-400 font-medium">#{String(i + 1).padStart(2, '0')}</span>
                                        {seg.isFlagged && (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide">
                                                <AlertTriangle className="w-3 h-3" /> Flagged
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm leading-7 text-slate-600 group-hover:text-slate-900 transition-colors">
                                        {seg.text}
                                    </p>
                                </div>

                                <div className="flex-shrink-0 w-full md:w-32 flex flex-col items-end gap-1">
                                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Confidence</div>
                                    <div className={cn(
                                        "text-xl font-bold tabular-nums",
                                        seg.isFlagged ? "text-red-600" : "text-emerald-500"
                                    )}>
                                        {(seg.prob * 100).toFixed(1)}%
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full", seg.isFlagged ? "bg-red-500" : "bg-emerald-500")}
                                            style={{ width: `${seg.prob * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-16 text-slate-400">
                            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No analysis segments found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
