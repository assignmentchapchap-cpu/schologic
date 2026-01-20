'use client';

import React, { useState } from 'react';
import { X, FileText, Maximize2, Minimize2, PanelRight, Sparkles } from 'lucide-react';
import DocxViewer from './DocxViewer';
import { Asset } from '@/types/library';

interface UniversalReaderProps {
    asset: Asset;
    onClose: () => void;
    isOpen?: boolean;
}

export default function UniversalReader({ asset, onClose, isOpen = true }: UniversalReaderProps) {
    const [isMaximized, setIsMaximized] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
            <div className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isMaximized ? 'w-full h-full rounded-none' : 'w-full h-full sm:w-[95vw] sm:h-[90vh] sm:max-w-6xl'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 bg-white shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg shrink-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{asset.title}</h2>
                            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Document Viewer</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {/* AI Sidebar Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`p-2 rounded-lg transition-colors ${isSidebarOpen
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'hover:bg-gray-100 text-gray-500'
                                }`}
                            title={isSidebarOpen ? 'Close AI Panel' : 'Open AI Panel'}
                        >
                            {isSidebarOpen
                                ? <PanelRight className="w-5 h-5" />
                                : <PanelRight className="w-5 h-5" />
                            }
                        </button>

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

                {/* Content Area - Flex row for sidebar */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Main Viewer */}
                    <div className={`flex-1 overflow-hidden bg-gray-50 transition-all duration-300 ${isSidebarOpen ? 'sm:mr-0' : ''
                        }`}>
                        {asset.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                            <DocxViewer fileUrl={asset.file_url || ''} />
                        ) : (
                            <div className="h-full overflow-auto p-8 flex justify-center">
                                <div className="w-full max-w-3xl bg-white shadow-sm min-h-full p-12 rounded-lg">
                                    {asset.mime_type === 'application/pdf' ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <p className="text-gray-500 font-medium mb-2">PDF Viewer Coming Soon</p>
                                            <a href={asset.file_url || ''} download className="text-indigo-600 hover:underline">Download PDF</a>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <p className="text-gray-500 font-medium mb-2">Preview not available</p>
                                            <a href={asset.file_url || ''} download className="text-indigo-600 hover:underline">Download File</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Sidebar - Slides in from right */}
                    <div className={`
                        absolute sm:relative inset-y-0 right-0 
                        w-full sm:w-80 lg:w-96
                        bg-white border-l border-gray-200 
                        flex flex-col
                        transition-transform duration-300 ease-in-out
                        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                        ${!isSidebarOpen && 'sm:hidden'}
                    `}>
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-600" />
                                <span className="font-medium text-gray-900">AI Assistant</span>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 sm:hidden"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Sidebar Content - Placeholder for AI features */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="text-center text-gray-400 py-12">
                                <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">AI features coming soon</p>
                                <p className="text-xs mt-1">Summarize, explain, quiz and more</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
