'use client';

import { Menu, Search, Maximize2, X, ZoomIn, ZoomOut, Sparkles, ChevronRight } from 'lucide-react';

export function ReaderInterfaceMock() {
    return (
        <div className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 flex flex-col h-[500px]">
            {/* Header */}
            <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <div className="p-1.5 hover:bg-slate-700 rounded cursor-pointer transition-colors">
                        <Menu className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-8 bg-red-500/20 border border-red-500/30 rounded flex items-center justify-center">
                            <span className="text-[10px] font-bold text-red-400">PDF</span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-200 truncate max-w-[200px] md:max-w-md">
                            Introduction_to_Microeconomics_Ch4.pdf
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 mr-2">
                        <Search className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-600">Find in document...</span>
                        <span className="text-xs text-slate-700 font-mono ml-4">Ctrl+F</span>
                    </div>
                    <div className="p-1.5 hover:bg-slate-700 rounded cursor-pointer text-slate-400 hover:text-white transition-colors">
                        <Maximize2 className="w-4 h-4" />
                    </div>
                    <div className="p-1.5 hover:bg-red-900/30 hover:text-red-400 rounded cursor-pointer text-slate-400 transition-colors">
                        <X className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Sidebar (TOC) */}
                <div className="w-64 bg-slate-900 border-r border-slate-700 flex-col hidden md:flex">
                    <div className="p-4 border-b border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Table of Contents</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {['Market Forces', 'Supply and Demand', 'Elasticity', 'Consumer Choice', 'Production Costs'].map((item, i) => (
                            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer ${i === 1 ? 'bg-indigo-500/10 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'}`}>
                                <ChevronRight className={`w-3 h-3 ${i === 1 ? 'rotate-90' : ''}`} />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-slate-100 relative overflow-hidden flex justify-center p-8">
                    {/* Mock PDF Page */}
                    <div className="w-[8.5in] h-[11in] bg-white shadow-lg mx-auto p-12 text-slate-800 flex flex-col gap-6 scale-[0.85] origin-top md:scale-100">
                        <h1 className="text-2xl font-serif font-bold text-slate-900 border-b border-slate-200 pb-4">4.2 Supply and Demand</h1>

                        <div className="flex gap-4 mb-4">
                            <div className="flex-1 space-y-3">
                                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                                    The law of supply stating that all else equal, an increase in price results in an increase in quantity supplied. In other words, there is a direct relationship between price and quantity: quantities respond in the same direction as price changes.
                                </p>
                                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                                    Supply is depicted as an upward sloping curve. A change in price results in a movement along the supply curve, whereas a change in any other variable shifts the supply curve.
                                </p>
                            </div>
                            <div className="w-1/3 h-32 bg-slate-50 border border-slate-100 rounded flex items-center justify-center">
                                {/* Simple Chart SVG */}
                                <svg viewBox="0 0 100 100" className="w-full h-full p-2 opacity-50">
                                    <line x1="10" y1="90" x2="90" y2="90" stroke="currentColor" strokeWidth="2" />
                                    <line x1="10" y1="90" x2="10" y2="10" stroke="currentColor" strokeWidth="2" />
                                    <path d="M 20 80 Q 50 50 80 20" stroke="currentColor" strokeWidth="2" fill="none" className="text-blue-500" />
                                    <path d="M 20 20 Q 50 50 80 80" stroke="currentColor" strokeWidth="2" fill="none" className="text-red-500" />
                                </svg>
                            </div>
                        </div>

                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
                            <h5 className="text-xs font-bold text-yellow-800 mb-1">Key Definition</h5>
                            <p className="text-[10px] text-yellow-700">
                                <strong className="text-yellow-900">Equilibrium:</strong> The point at which the supply and demand curves intersect.
                            </p>
                        </div>
                    </div>

                    {/* Floating Controls */}
                    <div className="absolute right-6 bottom-6 flex flex-col gap-2">
                        <div className="flex flex-col bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 border-b border-slate-800 transition-colors">
                                <ZoomIn className="w-4 h-4" />
                            </button>
                            <div className="p-2 text-xs font-mono text-center text-slate-300 bg-slate-950">
                                100%
                            </div>
                            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 border-t border-slate-800 transition-colors">
                                <ZoomOut className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="group flex items-center justify-end">
                            <span className="mr-2 px-2 py-1 bg-indigo-500 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Summarize Page
                            </span>
                            <button className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110">
                                <Sparkles className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
