'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    fileUrl: string;
}

export default function PdfViewer({ fileUrl }: PdfViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [containerWidth, setContainerWidth] = useState<number>(800);

    // Calculate scale based on container width
    const updateScale = useCallback(() => {
        if (!scrollContainerRef.current) return;
        const width = scrollContainerRef.current.clientWidth - 32; // Minus padding
        setContainerWidth(width);
        const pageWidth = 612; // Standard US Letter width in PDF points

        if (width < pageWidth) {
            setScale(width / pageWidth);
        } else {
            setScale(1);
        }
    }, []);

    // Handle resize
    React.useEffect(() => {
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [updateScale]);

    // Handle document load success
    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
        setError(null);
        updateScale();
    }, [updateScale]);

    // Handle document load error
    const onDocumentLoadError = useCallback((err: Error) => {
        console.error('PDF load error:', err);
        setError('Failed to load PDF document.');
        setLoading(false);
    }, []);

    // Handle scroll to update current page
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;

        const pages = scrollContainerRef.current.querySelectorAll('.react-pdf__Page');
        if (pages.length === 0) return;

        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        const viewportTop = containerRect.top + containerRect.height / 3;

        let newCurrent = 1;
        pages.forEach((page, index) => {
            const pageRect = page.getBoundingClientRect();
            if (pageRect.top <= viewportTop) {
                newCurrent = index + 1;
            }
        });

        setCurrentPage(prev => prev !== newCurrent ? newCurrent : prev);
    }, []);

    // Page width calculation
    const pageWidth = Math.min(containerWidth, 612);

    return (
        <div className="flex flex-col h-full bg-gray-100 overflow-hidden relative">
            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                        <p className="text-gray-500 font-medium">Loading PDF...</p>
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
                    <h3 className="text-lg font-medium text-gray-900">Unable to load PDF</h3>
                    <p className="text-gray-500 mt-1 mb-4">{error}</p>
                    <a href={fileUrl} download className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium">
                        Download PDF instead
                    </a>
                </div>
            )}

            {/* PDF Document Container */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden p-4"
                onScroll={handleScroll}
            >
                <div ref={containerRef} className="mx-auto" style={{ width: pageWidth }}>
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={null}
                        error={null}
                    >
                        {Array.from(new Array(numPages), (_, index) => (
                            <div key={`page_${index + 1}`} className="mb-4">
                                <Page
                                    pageNumber={index + 1}
                                    width={pageWidth}
                                    className="shadow-lg rounded bg-white"
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                />
                            </div>
                        ))}
                    </Document>
                </div>
            </div>

            {/* Page Counter - Bottom left to avoid overlap with AI button */}
            {numPages > 0 && (
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm pointer-events-none z-20 shadow-lg">
                    Page {currentPage} of {numPages}
                </div>
            )}
        </div>
    );
}
