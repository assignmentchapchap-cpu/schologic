'use client';

import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import FeedbackModal from './FeedbackModal';

interface FeedbackButtonProps {
    className?: string;
    variant?: 'default' | 'mobile';
}

export default function FeedbackButton({ className, variant = 'default' }: FeedbackButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleFeedbackClick = () => {
        setIsModalOpen(true);
    };

    if (variant === 'mobile') {
        return (
            <>
                <button
                    onClick={handleFeedbackClick}
                    className={twMerge(
                        "flex items-center gap-2 bg-indigo-600/90 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm transition-all shadow-lg shadow-indigo-900/20",
                        className
                    )}
                >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Feedback</span>
                </button>
                <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </>
        );
    }

    return (
        <>
            <button
                onClick={handleFeedbackClick}
                className={twMerge(
                    "flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-900/10 hover:shadow-lg hover:-translate-y-0.5",
                    className
                )}
            >
                <Volume2 className="w-4 h-4" />
                <span>Feedback</span>
            </button>
            <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
