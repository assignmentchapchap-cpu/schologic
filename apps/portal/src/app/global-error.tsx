'use client';

import { useEffect } from 'react';
import { logClientError } from '@/app/actions/logError';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the crash
        logClientError(`Global Crash: ${error.message}`, error.stack, 'root-layout');
    }, [error]);

    return (
        <html>
            <body className="antialiased">
                <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
                    <div className="max-w-md text-center bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                            <AlertTriangle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            We've logged this issue and our team has been notified. Please try refreshing the page.
                        </p>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 text-left overflow-auto max-h-40">
                            <p className="font-mono text-xs text-red-600 break-all">{error.message}</p>
                            {error.digest && <p className="font-mono text-[10px] text-slate-400 mt-2">Digest: {error.digest}</p>}
                        </div>

                        <button
                            onClick={() => reset()}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all hover:scale-[1.02]"
                        >
                            <RefreshCw className="w-4 h-4" /> Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
