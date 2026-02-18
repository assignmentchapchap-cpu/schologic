'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import FeedbackModal from '@/components/FeedbackModal';

interface FeedbackContextType {
    openFeedback: () => void;
    closeFeedback: () => void;
    isOpen: boolean;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openFeedback = () => setIsOpen(true);
    const closeFeedback = () => setIsOpen(false);

    return (
        <FeedbackContext.Provider value={{ openFeedback, closeFeedback, isOpen }}>
            {children}
            <FeedbackModal isOpen={isOpen} onClose={closeFeedback} />
        </FeedbackContext.Provider>
    );
}

export function useFeedback() {
    const context = useContext(FeedbackContext);
    if (context === undefined) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }
    return context;
}
