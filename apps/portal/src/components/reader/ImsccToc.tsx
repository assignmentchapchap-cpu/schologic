'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileText } from 'lucide-react';

// IMSCC Types
export interface ImsccTocItem {
    id: string;
    title: string;
    resourceRef?: string;
    children: ImsccTocItem[];
}

export interface ImsccResource {
    type: 'weblink' | 'webcontent' | 'lti' | 'unknown';
    href?: string;
    url?: string;
    title?: string;
}

export interface ImsccContent {
    title: string;
    toc: ImsccTocItem[];
    resources: Record<string, ImsccResource>;
}

interface ImsccTocProps {
    content: ImsccContent;
    selectedId?: string | null;
    onSelect: (item: ImsccTocItem, url: string | null) => void;
}

// Recursive TOC Item
function TocItem({
    item,
    resources,
    selectedId,
    onSelect,
    depth = 0
}: {
    item: ImsccTocItem;
    resources: Record<string, ImsccResource>;
    selectedId?: string | null;
    onSelect: (item: ImsccTocItem) => void;
    depth?: number;
}) {
    const [isExpanded, setIsExpanded] = useState(depth === 0);
    const hasChildren = item.children.length > 0;
    const hasResource = !!item.resourceRef;
    const isSelected = selectedId === item.id;
    const isChapter = hasChildren && !hasResource;

    const handleClick = () => {
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
        if (hasResource) {
            onSelect(item);
        }
    };

    return (
        <div className="select-none">
            <button
                onClick={handleClick}
                className={`
                    w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm rounded-lg transition-colors
                    ${isSelected
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }
                    ${isChapter ? 'font-semibold text-gray-900' : ''}
                `}
                style={{ paddingLeft: `${8 + depth * 12}px` }}
            >
                {hasChildren ? (
                    isExpanded
                        ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        : <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                ) : (
                    <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                )}
                <span className="truncate text-xs">{item.title}</span>
            </button>

            {hasChildren && isExpanded && (
                <div>
                    {item.children.map(child => (
                        <TocItem
                            key={child.id}
                            item={child}
                            resources={resources}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ImsccToc({ content, selectedId, onSelect }: ImsccTocProps) {
    const handleSelect = (item: ImsccTocItem) => {
        const resource = item.resourceRef ? content.resources[item.resourceRef] : null;
        const url = resource?.url || null;
        onSelect(item, url);
    };

    return (
        <div className="space-y-0.5">
            {content.toc.map(item => (
                <TocItem
                    key={item.id}
                    item={item}
                    resources={content.resources}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                />
            ))}
        </div>
    );
}
