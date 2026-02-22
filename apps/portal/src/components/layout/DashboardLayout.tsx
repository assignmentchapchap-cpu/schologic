'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { NavigationGuardProvider } from '@/context/NavigationGuardContext';
import { FeedbackProvider } from '@/context/FeedbackContext';
import { DashboardProviders } from '../providers/DashboardProviders';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: 'instructor' | 'student';
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Optional: Persist preference
    useEffect(() => {
        const stored = localStorage.getItem('sidebar_collapsed');
        if (stored) setIsCollapsed(JSON.parse(stored));
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar_collapsed', JSON.stringify(newState));
    };

    return (
        <NavigationGuardProvider>
            <FeedbackProvider>
                <DashboardProviders>
                    <div className="min-h-screen bg-slate-50">
                        <Sidebar
                            role={role}
                            isCollapsed={isCollapsed}
                            onToggleCollapse={toggleSidebar}
                        />

                        <div
                            className={`min-h-screen transition-all duration-300 ease-in-out ${isCollapsed ? 'md:ml-20' : 'md:ml-64'
                                }`}
                        >
                            {children}
                        </div>
                    </div>
                </DashboardProviders>
            </FeedbackProvider>
        </NavigationGuardProvider>
    );
}
