'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { NavigationGuardProvider } from '@/context/NavigationGuardContext';
import { FeedbackProvider } from '@/context/FeedbackContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('admin_sidebar_collapsed');
        if (stored) setIsCollapsed(JSON.parse(stored));
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('admin_sidebar_collapsed', JSON.stringify(newState));
    };

    // Admin login page renders without the sidebar shell
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <NavigationGuardProvider>
            <FeedbackProvider>
                <div className="min-h-screen bg-slate-50">
                    <AdminSidebar
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
            </FeedbackProvider>
        </NavigationGuardProvider>
    );
}

