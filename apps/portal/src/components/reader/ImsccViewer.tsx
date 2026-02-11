'use client';

import React, { useState } from 'react';
import { Loader2, AlertCircle, ExternalLink, BookOpen } from 'lucide-react';

interface ImsccViewerProps {
    url: string | null;
    onError?: () => void;
}

export default function ImsccViewer({ url, onError }: ImsccViewerProps) {
    const [isLoading, setIsLoading] = useState(!!url);
    const [error, setError] = useState<string | null>(null);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const handleIframeError = () => {
        setIsLoading(false);
        setError('Failed to load content. The source may block embedding.');
        onError?.();
    };

    // Empty state - no URL selected
    if (!url) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-400">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Select a section to read</p>
                    <p className="text-sm mt-1">Choose from the outline on the left</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full relative bg-gray-50">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Loading content...</span>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white">
                    <div className="text-center p-8">
                        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">{error}</p>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-indigo-600 hover:underline"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open in new tab
                        </a>
                    </div>
                </div>
            )}

            {/* Content Iframe */}
            <iframe
                src={url}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title="Book Content"
            />
        </div>
    );
}
