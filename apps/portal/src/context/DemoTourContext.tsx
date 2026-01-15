'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface DemoTourContextType {
    tourActive: boolean;
    startTour: () => void;
    stopTour: () => void;
    tourStep: number;
    setTourStep: (step: number) => void;
}

const DemoTourContext = createContext<DemoTourContextType | undefined>(undefined);

export function DemoTourProvider({ children }: { children: React.ReactNode }) {
    const [tourActive, setTourActive] = useState(false);
    const [tourStep, setTourStep] = useState(0);

    // Initialize state from local storage or defaults
    useEffect(() => {
        const storedActive = localStorage.getItem('scholar_demo_tour_active');
        const storedStep = localStorage.getItem('scholar_demo_tour_step');

        console.log('DemoTourContext Init - Stored Active:', storedActive, 'Stored Step:', storedStep);

        if (storedActive === 'true') setTourActive(true);
        if (storedStep) setTourStep(parseInt(storedStep, 10));
    }, []);

    // Persist state changes
    useEffect(() => {
        localStorage.setItem('scholar_demo_tour_active', String(tourActive));
    }, [tourActive]);

    useEffect(() => {
        localStorage.setItem('scholar_demo_tour_step', String(tourStep));
    }, [tourStep]);

    const startTour = () => {
        setTourActive(true);
        setTourStep(0);
    };

    const stopTour = () => {
        setTourActive(false);
        setTourStep(0);
        localStorage.removeItem('scholar_demo_tour_active');
        localStorage.removeItem('scholar_demo_tour_step');
    };

    return (
        <DemoTourContext.Provider value={{ tourActive, startTour, stopTour, tourStep, setTourStep }}>
            {children}
        </DemoTourContext.Provider>
    );
}

export function useDemoTour() {
    const context = useContext(DemoTourContext);
    if (context === undefined) {
        throw new Error('useDemoTour must be used within a DemoTourProvider');
    }
    return context;
}
