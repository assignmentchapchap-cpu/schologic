'use client';

import { createClient } from '@/lib/supabase';
import { Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationBell from '@/components/NotificationBell';

export default function InstructorDashboard() {
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 animate-fade-in">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                            <p className="text-slate-500 font-medium">Welcome back, Instructor</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <NotificationBell />
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                            <Home className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Welcome Home</h3>
                        <p className="text-slate-500 text-sm">Select "Classes" from the sidebar to manage your courses and assignments.</p>
                    </div>
                    {/* Placeholder for future dashboard widgets */}
                </div>
            </div>
        </div>
    );
}
