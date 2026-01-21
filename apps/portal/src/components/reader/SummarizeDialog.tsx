'use client';

import React, { useState } from 'react';
import { X, Sparkles, FileText } from 'lucide-react';

export interface SummarizeOptions {
    context: string;
    pages: string; // e.g., "1-3, 5, 7-9"
}

interface SummarizeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (options: SummarizeOptions) => void;
    documentTitle?: string;
}

export default function SummarizeDialog({ isOpen, onClose, onSubmit, documentTitle }: SummarizeDialogProps) {
    const [context, setContext] = useState('');
    const [pages, setPages] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ context: context.trim(), pages: pages.trim() });
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Summarize Document</h3>
                            {documentTitle && (
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{documentTitle}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    {/* Context Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            Additional Context
                            <span className="text-xs text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="e.g., Focus on key dates and financial figures..."
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none bg-gray-50 focus:bg-white"
                            rows={3}
                        />
                        <p className="text-xs text-gray-400">
                            Guide the AI to focus on specific aspects of the document.
                        </p>
                    </div>

                    {/* Page Range Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Specific Pages
                            <span className="text-xs text-gray-400 font-normal ml-2">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={pages}
                            onChange={(e) => setPages(e.target.value)}
                            placeholder="e.g., 1-3, 5, 7-9"
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                        />
                        <p className="text-xs text-gray-400">
                            Leave blank for all pages. Use commas for multiple ranges.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            Summarize
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
