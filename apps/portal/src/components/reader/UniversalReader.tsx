'use client';

import React, { useState } from 'react';
import { X, FileText, Maximize2, Minimize2, Sparkles, List } from 'lucide-react';
import DocxViewer from './DocxViewer';
import PdfViewer from './PdfViewer';
import { Asset } from '@/types/library';

interface UniversalReaderProps {
    asset: Asset;
    onClose: () => void;
    isOpen?: boolean;
}

export default function UniversalReader({ asset, onClose, isOpen = true }: UniversalReaderProps) {
    const [isMaximized, setIsMaximized] = useState(false);
    const [isOutlineOpen, setIsOutlineOpen] = useState(false);
    const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);

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
                            <div className="text-center text-gray-400 py-8">
                                <List className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No outline available</p>
                                <p className="text-xs mt-1">Headings appear here</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Viewer */}
                    <div className="flex-1 overflow-hidden bg-gray-50 transition-all duration-300">
                        {asset.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                            <DocxViewer fileUrl={asset.file_url || ''} />
                        ) : asset.mime_type === 'application/pdf' ? (
                            <PdfViewer fileUrl={asset.file_url || ''} />
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

                        {/* AI Sidebar Content - Placeholder */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="text-center text-gray-400 py-12">
                                <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">AI features coming soon</p>
                                <p className="text-xs mt-1">Summarize, explain, quiz and more</p>
                            </div>
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
        </div>
    );
}
