'use client';

import ErrorLogTable from '@/components/admin/ErrorLogTable';
import { Shield, AlertTriangle } from 'lucide-react';

export default function SystemErrorsPage() {
    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                        System Error Logs
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Monitor and debug application errors occurring across the platform.
                    </p>
                </div>
            </div>

            <ErrorLogTable />
        </div>
    );
}
