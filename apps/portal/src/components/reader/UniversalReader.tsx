'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Maximize2, Minimize2, Sparkles, List, ZoomIn, ZoomOut, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useReaderSearch } from '@/hooks/useReaderSearch';
import dynamic from 'next/dynamic';
import DocxViewer from './DocxViewer';
const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false });
import { Asset } from '@/types/library';
import { generateSummary } from '@/app/actions/summarize';
import SummarizeDialog, { SummarizeOptions } from './SummarizeDialog';
import ImsccViewer from './ImsccViewer';
import ImsccToc, { ImsccContent, ImsccTocItem } from './ImsccToc';

interface UniversalReaderProps {
    asset: Asset;
    onClose: () => void;
    isOpen?: boolean;
}

export default function UniversalReader({ asset, onClose, isOpen = true }: UniversalReaderProps) {
    const [isMaximized, setIsMaximized] = useState(false);
    const [isOutlineOpen, setIsOutlineOpen] = useState(false);
    const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Viewer & Search
    const viewerRef = React.useRef<HTMLDivElement>(null);
    const { search, clear, currentMatchIndex, totalMatches, nextMatch, prevMatch } = useReaderSearch(viewerRef);
    const [searchQuery, setSearchQuery] = useState('');

    // AI State
    const [summary, setSummary] = useState<string[] | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [isSummarizeDialogOpen, setIsSummarizeDialogOpen] = useState(false);

    // IMSCC State
    const [imsccUrl, setImsccUrl] = useState<string | null>(null);
    const [imsccSelectedId, setImsccSelectedId] = useState<string | null>(null);
    const isImscc = asset.asset_type === 'cartridge_root' && asset.content;
    const imsccContent = isImscc ? (asset.content as ImsccContent) : null;

    // Auto-select first IMSCC page on load
    useEffect(() => {
        if (imsccContent && !imsccSelectedId) {
            // Find first item with a URL
            const findFirst = (items: ImsccTocItem[]): { id: string; url: string } | null => {
                for (const item of items) {
                    if (item.resourceRef) {
                        const resource = imsccContent.resources[item.resourceRef];
                        if (resource?.url) {
                            return { id: item.id, url: resource.url };
                        }
                    }
                    if (item.children.length > 0) {
                        const found = findFirst(item.children);
                        if (found) return found;
                    }
                }
                return null;
            };

            const first = findFirst(imsccContent.toc);
            if (first) {
                setImsccSelectedId(first.id);
                setImsccUrl(first.url);

                // Sneak peek: briefly show sidebar to hint it exists
                setTimeout(() => {
                    setIsOutlineOpen(true);
                    setTimeout(() => setIsOutlineOpen(false), 5000); // Close after 5s
                }, 3000); // Delay 3s before peek
            }
        }
    }, [imsccContent, imsccSelectedId]);

    // Live search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                search(searchQuery);
            } else {
                clear();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, search, clear]);

    // Handle Enter to go to next match
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        nextMatch();
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        clear();
        setSearchQuery('');
    };

    // Zoom handlers
    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    const handleZoomReset = () => setZoomLevel(1);

    // Toggle outline sidebar (auto-close AI sidebar on desktop)
    const toggleOutline = () => {
        if (!isOutlineOpen && isAISidebarOpen) {
            setIsAISidebarOpen(false);
        }
        setIsOutlineOpen(!isOutlineOpen);
    };

    // Toggle AI sidebar (auto-close outline on desktop)
    const toggleAISidebar = () => {
        if (!isAISidebarOpen && isOutlineOpen) {
            setIsOutlineOpen(false);
        }
        setIsAISidebarOpen(!isAISidebarOpen);
    };

    const handleSummarize = async (options?: SummarizeOptions) => {
        if (isSummarizing) return;

        setIsSummarizeDialogOpen(false);
        setIsSummarizing(true);
        setAiError(null);

        const result = await generateSummary(
            asset.file_url || '',
            asset.mime_type || '',
            options ? {
                context: options.context,
                pages: options.pages,
                selectedSections: options.selectedSections
            } : undefined
        );

        if (result.error) {
            setAiError(result.error);
        } else if (result.summary) {
            setSummary(result.summary);
        }

        setIsSummarizing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
            <div className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isMaximized ? 'w-full h-full rounded-none' : 'w-full h-full sm:w-[95vw] sm:h-[90vh] sm:max-w-6xl'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 bg-white shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {/* Outline Toggle Button - Top Left, visible on all screens */}
                        <button
                            onClick={toggleOutline}
                            className={`p-2 rounded-lg transition-colors shrink-0 ${isOutlineOpen
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                            title={isOutlineOpen ? 'Close Outline' : 'Show Outline'}
                        >
                            <List className="w-5 h-5" />
                        </button>

                        <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg shrink-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{asset.title}</h2>
                            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Document Viewer</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {/* Search Toggle - hidden for IMSCC since iframe content is cross-origin */}
                        {asset.asset_type !== 'cartridge_root' && (
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className={`p-2 rounded-lg transition-colors hidden sm:block ${isSearchOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-500'}`}
                                title="Search"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        )}

                        {/* Search Bar (Floating or Expanded) */}
                        {isSearchOpen && (
                            <div className="absolute top-16 right-4 sm:top-2 sm:right-auto sm:relative z-50 bg-white p-1 rounded-lg shadow-lg border border-gray-200 flex items-center gap-1 animate-in fade-in slide-in-from-top-2">
                                <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Find in document..."
                                        className="w-40 sm:w-64 px-2 py-1.5 text-sm border-none focus:outline-none focus:ring-0 bg-transparent"
                                        autoFocus
                                    />
                                    <span className="text-xs text-gray-400 whitespace-nowrap min-w-[3rem] text-center">
                                        {totalMatches > 0 ? `${currentMatchIndex + 1}/${totalMatches}` : totalMatches === 0 && searchQuery ? '0/0' : ''}
                                    </span>
                                </form>
                                <div className="h-4 w-px bg-gray-200 mx-1" />
                                <button type="button" onClick={prevMatch} className="p-1 hover:bg-gray-100 rounded text-gray-500" disabled={totalMatches === 0}>
                                    <ChevronUp className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={nextMatch} className="p-1 hover:bg-gray-100 rounded text-gray-500" disabled={totalMatches === 0}>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={closeSearch} className="p-1 hover:bg-gray-100 rounded text-gray-500 ml-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Maximize (hidden on mobile) */}
                        <button
                            onClick={() => setIsMaximized(!isMaximized)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors hidden sm:block"
                        >
                            {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Area - Flex row for sidebars */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Left Outline Sidebar - Slides in, overlay on mobile */}
                    <div className={`
                        absolute sm:relative inset-y-0 left-0
                        w-4/5 sm:w-64 lg:w-72
                        bg-white border-r border-gray-200 
                        flex flex-col shrink-0
                        transition-transform duration-300 ease-in-out z-30
                        ${isOutlineOpen ? 'translate-x-0' : '-translate-x-full'}
                        ${!isOutlineOpen && 'sm:hidden'}
                    `}>
                        {/* Outline Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-2">
                                <List className="w-4 h-4 text-gray-600" />
                                <span className="font-medium text-gray-900">Outline</span>
                            </div>
                            <button
                                onClick={toggleOutline}
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Outline Content */}
                        <div className="flex-1 overflow-y-auto p-3">
                            {imsccContent ? (
                                <ImsccToc
                                    content={imsccContent}
                                    selectedId={imsccSelectedId}
                                    onSelect={(item, url) => {
                                        setImsccSelectedId(item.id);
                                        setImsccUrl(url);
                                    }}
                                />
                            ) : (
                                <div className="text-center text-gray-400 py-8">
                                    <List className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No outline available</p>
                                    <p className="text-xs mt-1">Headings appear here</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Viewer */}
                    <div ref={viewerRef} className="flex-1 overflow-hidden bg-gray-50 transition-all duration-300 relative group">
                        {/* Floating Zoom Controls - hidden for IMSCC */}
                        {asset.asset_type !== 'cartridge_root' && (
                            <div className="absolute top-6 right-6 z-20 flex flex-col bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                                <button
                                    onClick={handleZoomIn}
                                    disabled={zoomLevel >= 2}
                                    className="p-2 hover:bg-gray-50 text-gray-600 border-b border-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleZoomReset}
                                    className="p-2 hover:bg-gray-50 text-[10px] font-bold text-gray-500 border-b border-gray-100 transition-colors"
                                    title="Reset Zoom"
                                >
                                    {Math.round(zoomLevel * 100)}%
                                </button>
                                <button
                                    onClick={handleZoomOut}
                                    disabled={zoomLevel <= 0.5}
                                    className="p-2 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        {asset.asset_type === 'cartridge_root' && asset.content ? (
                            <ImsccViewer url={imsccUrl} />
                        ) : asset.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                            <DocxViewer fileUrl={asset.file_url || ''} zoomLevel={zoomLevel} />
                        ) : asset.mime_type === 'application/pdf' ? (
                            <PdfViewer fileUrl={asset.file_url || ''} zoomLevel={zoomLevel} />
                        ) : (
                            <div className="h-full overflow-auto p-8 flex justify-center">
                                <div className="w-full max-w-3xl bg-white shadow-sm min-h-full p-12 rounded-lg">
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <p className="text-gray-500 font-medium mb-2">Preview not available</p>
                                        <a href={asset.file_url || ''} download className="text-indigo-600 hover:underline">Download File</a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right AI Sidebar - Slides in from right */}
                    <div className={`
                        absolute sm:relative inset-y-0 right-0 
                        w-full sm:w-80 lg:w-96
                        bg-white border-l border-gray-200 
                        flex flex-col shrink-0
                        transition-transform duration-300 ease-in-out
                        ${isAISidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                        ${!isAISidebarOpen && 'sm:hidden'}
                    `}>
                        {/* AI Sidebar Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-600" />
                                <span className="font-medium text-gray-900">AI Assistant</span>
                            </div>
                            <button
                                onClick={() => setIsAISidebarOpen(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* AI Sidebar Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {summary ? (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-indigo-600" />
                                        Document Summary
                                    </h3>
                                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                        <ul className="space-y-3">
                                            {summary.map((point, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                                                    <span className="text-indigo-500 font-bold text-lg leading-none mt-0.5">•</span>
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <button
                                        onClick={() => setSummary(null)}
                                        className="text-xs text-gray-400 hover:text-gray-600 underline"
                                    >
                                        Clear Summary
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                    {isSummarizing ? (
                                        <div className="flex flex-col items-center space-y-3">
                                            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-sm text-gray-500 animate-pulse">Analyzing document...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-3 bg-indigo-50 rounded-full">
                                                <Sparkles className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-medium text-gray-900">AI Assistant</h3>
                                                <p className="text-sm text-gray-500 max-w-[200px] mx-auto">
                                                    Get a quick summary of this document to understand key concepts.
                                                </p>
                                            </div>

                                            {aiError && (
                                                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg max-w-full break-words">
                                                    {aiError}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => setIsSummarizeDialogOpen(true)}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
                                            >
                                                Summarize Document
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Floating AI Assistant Button - Bottom Right */}
                    {!isAISidebarOpen && (
                        <button
                            onClick={toggleAISidebar}
                            className="absolute bottom-6 right-6 z-20
                                       flex items-center gap-2
                                       bg-indigo-600 hover:bg-indigo-700
                                       text-white font-medium
                                       px-4 py-3 rounded-full
                                       shadow-lg hover:shadow-xl
                                       transition-all duration-200
                                       group"
                            title="Open AI Assistant"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span className="hidden sm:inline text-sm">AI Assistant</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Summarize Dialog */}
            <SummarizeDialog
                isOpen={isSummarizeDialogOpen}
                onClose={() => setIsSummarizeDialogOpen(false)}
                onSubmit={handleSummarize}
                documentTitle={asset.title || undefined}
                imsccContent={asset.asset_type === 'cartridge_root' ? (asset.content as any) : null}
            />
        </div>
    );
}
