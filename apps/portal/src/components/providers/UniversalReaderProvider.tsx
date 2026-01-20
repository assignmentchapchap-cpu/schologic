'use client';

import React, { useState, useCallback } from 'react';
import { UniversalReaderContext } from '@/context/UniversalReaderContext';
import { Asset } from '@/types/library';
import UniversalReader from '@/components/reader/UniversalReader';

export function UniversalReaderProvider({ children }: { children: React.ReactNode }) {
    const [activeAsset, setActiveAsset] = useState<Asset | null>(null);

    const openReader = useCallback((asset: Asset) => {
        setActiveAsset(asset);
    }, []);

    const closeReader = useCallback(() => {
        setActiveAsset(null);
    }, []);

    const isOpen = !!activeAsset;

    return (
        <UniversalReaderContext.Provider value={{ openReader, closeReader, isOpen, activeAsset }}>
            {children}
            {activeAsset && (
                <UniversalReader
                    asset={activeAsset}
                    isOpen={isOpen}
                    onClose={closeReader}
                />
            )}
        </UniversalReaderContext.Provider>
    );
}
