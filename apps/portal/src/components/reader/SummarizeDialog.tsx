'use client';

import React, { useState } from 'react';
import { X, Sparkles, FileText, ChevronRight, ChevronDown, CheckSquare } from 'lucide-react';

// IMSCC Types (matching doc-engine)
interface ImsccTocItem {
    id: string;
    title: string;
    resourceRef?: string;
    children: ImsccTocItem[];
}

interface ImsccResource {
    type: string;
    url?: string;
}

interface ImsccContent {
    title: string;
    toc: ImsccTocItem[];
    resources: Record<string, ImsccResource>;
}

export interface SummarizeOptions {
    context: string;
    pages: string;
    selectedSections?: { id: string; title: string; resourceRef: string }[];
}

interface SummarizeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (options: SummarizeOptions) => void;
    documentTitle?: string;
    imsccContent?: ImsccContent | null;
}

// Recursive TOC Item with checkbox
function TocCheckboxItem({
    item,
    resources,
    selectedIds,
    onToggle,
    depth = 0
}: {
    item: ImsccTocItem;
    resources: Record<string, ImsccResource>;
    selectedIds: Set<string>;
    onToggle: (item: ImsccTocItem) => void;
    depth?: number;
}) {
    const [isExpanded, setIsExpanded] = useState(depth === 0);
    const hasChildren = item.children.length > 0;
    const hasResource = !!item.resourceRef && resources[item.resourceRef]?.url;
    const isSelected = selectedIds.has(item.id);
    const isChapter = hasChildren && !item.resourceRef;

    return (
        <div>
            <div
                className={`flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer`}
                style={{ paddingLeft: `${8 + depth * 16}px` }}
            >
                {/* Expand/Collapse for chapters */}
                {hasChildren ? (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                        className="p-0.5 text-gray-400 hover:text-gray-600"
                    >
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                ) : (
                    <span className="w-4" />
                )}

                {/* Checkbox (only for items with resources/URLs) */}
                {hasResource ? (
                    <button
                        type="button"
                        onClick={() => onToggle(item)}
                        className={`p-0.5 rounded transition-colors ${isSelected ? 'text-indigo-600' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                        {isSelected ? <CheckSquare className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-current rounded-sm" />}
                    </button>
                ) : (
                    <span className="w-5" />
                )}

                {/* Title */}
                <span
                    onClick={() => hasResource && onToggle(item)}
                    className={`text-sm truncate flex-1 ${isChapter ? 'font-semibold text-gray-800' : 'text-gray-600'} ${hasResource ? 'cursor-pointer hover:text-indigo-600' : ''}`}
                >
                    {item.title}
                </span>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div>
                    {item.children.map(child => (
                        <TocCheckboxItem
                            key={child.id}
                            item={child}
                            resources={resources}
                            selectedIds={selectedIds}
                            onToggle={onToggle}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SummarizeDialog({ isOpen, onClose, onSubmit, documentTitle, imsccContent }: SummarizeDialogProps) {
    const [context, setContext] = useState('');
    const [pages, setPages] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    if (!isOpen) return null;

    const isImscc = !!imsccContent?.toc?.length;

    const handleToggle = (item: ImsccTocItem) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(item.id)) {
            newSet.delete(item.id);
        } else {
            if (newSet.size < 5) { // Limit to 5 selections
                newSet.add(item.id);
            }
        }
        setSelectedIds(newSet);
    };

    // Build selected sections for submission
    const getSelectedSections = (): SummarizeOptions['selectedSections'] => {
        if (!imsccContent) return undefined;
        const sections: SummarizeOptions['selectedSections'] = [];

        const traverse = (items: ImsccTocItem[]) => {
            for (const item of items) {
                if (selectedIds.has(item.id) && item.resourceRef) {
                    sections.push({ id: item.id, title: item.title, resourceRef: item.resourceRef });
                }
                if (item.children.length) traverse(item.children);
            }
        };
        traverse(imsccContent.toc);
        return sections.length > 0 ? sections : undefined;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            context: context.trim(),
            pages: pages.trim(),
            selectedSections: getSelectedSections()
        });
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
            <div className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isImscc ? 'max-w-lg' : 'max-w-md'}`}>
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
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* IMSCC Section Selector */}
                    {isImscc && imsccContent && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                                <span>Select sections to summarize</span>
                                <span className="text-xs text-gray-400 font-normal">
                                    {selectedIds.size}/5 selected
                                </span>
                            </label>
                            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50 p-2">
                                {imsccContent.toc.map(item => (
                                    <TocCheckboxItem
                                        key={item.id}
                                        item={item}
                                        resources={imsccContent.resources}
                                        selectedIds={selectedIds}
                                        onToggle={handleToggle}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-gray-400">
                                Select up to 5 sections. Only sections with content can be summarized.
                            </p>
                        </div>
                    )}

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
                            placeholder="e.g., Focus on key statistics and legal resources..."
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none bg-gray-50 focus:bg-white"
                            rows={2}
                        />
                    </div>

                    {/* Page Range Input - only for non-IMSCC */}
                    {!isImscc && (
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
                        </div>
                    )}

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
                            disabled={isImscc && selectedIds.size === 0}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            {isImscc ? `Summarize (${selectedIds.size})` : 'Summarize'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
