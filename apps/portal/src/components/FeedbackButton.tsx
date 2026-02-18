'use client';

import { Volume2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useFeedback } from '@/context/FeedbackContext';

interface FeedbackButtonProps {
    className?: string;
    variant?: 'default' | 'mobile';
}

export default function FeedbackButton({ className, variant = 'default' }: FeedbackButtonProps) {
    const { openFeedback } = useFeedback();

    if (variant === 'mobile') {
        return (
            <button
                onClick={openFeedback}
                className={twMerge(
                    "flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20",
                    className
                )}
            >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Feedback</span>
            </button>
        );
    }

    return (
        <button
            onClick={openFeedback}
            className={twMerge(
                "flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 h-12 rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-500/10 hover:shadow-lg hover:-translate-y-0.5",
                className
            )}
        >
            <Volume2 className="w-4 h-4" />
            <span>Feedback</span>
        </button>
    );
}
