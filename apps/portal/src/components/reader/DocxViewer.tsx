'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { renderAsync } from 'docx-preview';

interface DocxViewerProps {
    fileUrl: string;
    zoomLevel?: number;
}

export default function DocxViewer({ fileUrl, zoomLevel = 1 }: DocxViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageInfo, setPageInfo] = useState({ current: 1, total: 0 });
    const [scale, setScale] = useState(1);
    const [scaledHeight, setScaledHeight] = useState<number | null>(null);

    // Calculate scale based on container width
    const updateScale = useCallback(() => {
        if (!scrollContainerRef.current) return;
        const containerWidth = scrollContainerRef.current.clientWidth - 32; // Minus padding
        const sourceDocWidth = 816; // The actual rendered width by docx-preview (Standard US Letter)
        const targetMaxWidth = 612; // The desired maximum visual width (matching PDF viewer)

        // Calculate scale to shrink 816px -> 612px (approx 0.75)
        const maxScale = targetMaxWidth / sourceDocWidth;

        // Calculate scale to fit container (for mobile)
        const fitScale = containerWidth / sourceDocWidth;

        // Use the smaller scale:
        // - On desktop: uses maxScale to cap visual width at 612px
        // - On mobile: uses fitScale to fit screen width
        // Then apply zoomLevel
        setScale(Math.min(fitScale, maxScale) * zoomLevel);
    }, [zoomLevel]);

    // Handle resize
    useEffect(() => {
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [updateScale]);

    // Count pages and update scaled height after render
    useEffect(() => {
        if (!containerRef.current) return;

        const measureAndCount = () => {
            if (!containerRef.current) return;

            // Try different selectors - docx-preview output can vary
            let pages = containerRef.current.querySelectorAll('section.docx');
            if (pages.length === 0) {
                pages = containerRef.current.querySelectorAll('.docx-wrapper > section');
            }
            if (pages.length === 0) {
                pages = containerRef.current.querySelectorAll('article');
            }

            // As fallback, count wrapper divs that look like pages
            if (pages.length === 0) {
                const wrapper = containerRef.current.querySelector('.docx-wrapper');
                if (wrapper) {
                    // Count direct children that could be pages
                    pages = wrapper.querySelectorAll(':scope > *');
                }
            }

            const pageCount = pages.length;
            if (pageCount > 0) {
                setPageInfo(prev => ({ ...prev, total: pageCount }));

                // Get the container's natural height and apply scale
                const naturalHeight = containerRef.current.offsetHeight;
                setScaledHeight(naturalHeight * scale);
            }
        };

        const observer = new MutationObserver(() => {
            setTimeout(measureAndCount, 200);
        });

        observer.observe(containerRef.current, {
            childList: true,
            subtree: true
        });

        // Initial measurement after a delay to ensure content is rendered
        setTimeout(measureAndCount, 300);

        return () => observer.disconnect();
    }, [scale]);

    // Recalculate scaled height when scale changes
    useEffect(() => {
        if (!containerRef.current) return;
        const naturalHeight = containerRef.current.offsetHeight;
        if (naturalHeight > 0) {
            setScaledHeight(naturalHeight * scale);
        }
    }, [scale]);

    // Handle scroll to update current page
    const handleScroll = useCallback(() => {
        if (!containerRef.current || !scrollContainerRef.current) return;

        // Use same selector logic as measureAndCount
        let pages = containerRef.current.querySelectorAll('section.docx');
        if (pages.length === 0) {
            pages = containerRef.current.querySelectorAll('.docx-wrapper > section');
        }
        if (pages.length === 0) {
            pages = containerRef.current.querySelectorAll('article');
        }
        if (pages.length === 0) return;

        // Get the scroll container's viewport rect
        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        const viewportTop = containerRect.top + containerRect.height / 3; // 1/3 from top

        let newCurrent = 1;
        pages.forEach((page, index) => {
            const el = page as HTMLElement;
            // getBoundingClientRect gives us the actual visual position accounting for transforms
            const pageRect = el.getBoundingClientRect();
            // If the page's top is above our viewport's 1/3 line, we're on this page
            if (pageRect.top <= viewportTop) {
                newCurrent = index + 1;
            }
        });

        setPageInfo(prev => prev.current !== newCurrent ? { ...prev, current: newCurrent } : prev);
    }, []);

    // Load document
    useEffect(() => {
        async function loadDocument() {
            if (!containerRef.current || !fileUrl) return;

            try {
                setLoading(true);
                setError(null);
                setPageInfo({ current: 1, total: 0 });
                setScaledHeight(null);

                const response = await fetch(fileUrl);
                if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
                const blob = await response.blob();

                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                }

                if (containerRef.current) {
                    await renderAsync(blob, containerRef.current, containerRef.current, {
                        className: 'docx-preview-content',
                        inWrapper: true,
                        ignoreWidth: false,  // Keep original page widths
                        ignoreHeight: false, // Keep original page heights
                        ignoreFonts: false,
                        breakPages: true,
                        ignoreLastRenderedPageBreak: false,
                        experimental: false,
                        trimXmlDeclaration: true,
                        useBase64URL: false
                    });

                    // Update scale after render
                    setTimeout(updateScale, 100);
                }

            } catch (err) {
                console.error("DocxViewer Error:", err);
                setError('Failed to render document.');
            } finally {
                setLoading(false);
            }
        }

        loadDocument();
    }, [fileUrl, updateScale]);

    return (
        <div className="flex flex-col h-full bg-gray-100 overflow-hidden relative">
            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                        <p className="text-gray-500 font-medium">Loading document...</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && !loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white p-8 text-center">
                    <div className="bg-red-50 p-4 rounded-full mb-3">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Unable to preview document</h3>
                    <p className="text-gray-500 mt-1 mb-4">{error}</p>
                    <a href={fileUrl} download className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium">
                        Download file instead
                    </a>
                </div>
            )}

            {/* Document Container */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto overflow-x-auto p-4"
                onScroll={handleScroll}
            >
                {/* Height spacer - this div has the correct scaled height */}
                <div
                    ref={wrapperRef}
                    style={{
                        width: `${816 * scale}px`,
                        height: scaledHeight ? `${scaledHeight}px` : 'auto',
                        position: 'relative',
                        overflow: 'hidden',
                        margin: '0 auto'
                    }}
                >
                    {/* Scaled content - positioned at top, scales down */}
                    <div
                        ref={containerRef}
                        className="docx-viewer-wrapper"
                        style={{
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                            width: '816px',
                            minHeight: '800px'
                        }}
                    />
                </div>
            </div>

            {/* Page Counter - Bottom left to avoid overlap with AI button */}
            {pageInfo.total > 0 && (
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm pointer-events-none z-20 shadow-lg">
                    Page {pageInfo.current} of {pageInfo.total}
                </div>
            )}

            {/* Styles for docx-preview generated content */}
            <style jsx global>{`
                /* Override docx-preview dark background with light gray */
                .docx-preview-content-wrapper,
                .docx-preview-content > div:first-child {
                    background-color: #f3f4f6 !important;
                }
                .docx-preview-content section.docx-preview-content {
                    background: white !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    margin: 0 auto 24px auto !important;
                }
                .docx-preview-content .docx-page-break {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
