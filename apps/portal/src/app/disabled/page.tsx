'use client';

import { AlertTriangle, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DisabledAccountPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 border border-slate-100 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-8">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-4 font-serif">Account Suspended</h1>

                <p className="text-slate-600 mb-8 leading-relaxed text-sm">
                    Your Schologic account has been temporarily deactivated or restricted. This may be due to administrative action, billing issues, or a security notification.
                </p>

                <div className="space-y-4">
                    <a
                        href="mailto:support@schologic.com"
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                    >
                        <Mail className="w-4 h-4" />
                        Contact Support
                    </a>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Homepage
                    </Link>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                        Security Enforcement System
                    </p>
                </div>
            </div>
        </div>
    );
}
