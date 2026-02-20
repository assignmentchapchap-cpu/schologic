'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logClientError } from '@/app/actions/logError';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
    const pathname = usePathname();

    useEffect(() => {
        // Log the 404 error
        logClientError(`404 Not Found: ${pathname}`, undefined, pathname);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-12 h-12 text-indigo-600" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Page Not Found</h1>
                <p className="text-slate-600 mb-8">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-200"
                    >
                        <Home className="w-5 h-5" /> Back Home
                    </Link>
                </div>
            </div>
            <div className="mt-12 text-xs text-slate-400 font-mono">
                Path: {pathname}
            </div>
        </div>
    );
}
