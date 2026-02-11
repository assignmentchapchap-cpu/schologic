'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Asset } from '@/types/library';

interface UniversalReaderContextType {
    openReader: (asset: Asset) => void;
    closeReader: () => void;
    isOpen: boolean;
    activeAsset: Asset | null;
}

const UniversalReaderContext = createContext<UniversalReaderContextType | undefined>(undefined);

export function useReader() {
    const context = useContext(UniversalReaderContext);
    if (!context) {
        throw new Error('useReader must be used within a UniversalReaderProvider');
    }
    return context;
}

export { UniversalReaderContext };
