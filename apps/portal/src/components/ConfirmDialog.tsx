'use client';

import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    strConfirm: string;
    strCancel?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    strConfirm,
    strCancel,
    variant = 'danger',
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const colors = {
        danger: {
            icon: 'text-red-500 bg-red-50',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        },
        warning: {
            icon: 'text-amber-500 bg-amber-50',
            button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        },
        info: {
            icon: 'text-blue-500 bg-blue-50',
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        },
        success: {
            icon: 'text-emerald-500 bg-emerald-50',
            button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
        }
    };

    const style = colors[variant];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-5 flex items-start gap-4">
                    <div className={`p-3 rounded-full shrink-0 ${style.icon}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1 pt-1">
                        <h3 className="text-lg font-bold text-slate-800 leading-tight">{title}</h3>
                        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    {strCancel && (
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            {strCancel}
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2 ${style.button} disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {strConfirm}
                    </button>
                </div>
            </div>
        </div>
    );
}
