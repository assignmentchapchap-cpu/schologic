'use client';

import AiScoringLab from "@/components/AiScoringLab";
import { useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { Terminal } from 'lucide-react';

export default function LabPage() {
    const [isDemo, setIsDemo] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkDemo = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.is_demo === true) {
                setIsDemo(true);
            }
            setLoading(false);
        };
        checkDemo();
    }, []);

    if (loading) return null;

    if (isDemo) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Terminal className="w-6 h-6 text-slate-400" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">AI Lab Locked</h1>
                    <p className="text-slate-500 text-sm mb-6">
                        The AI Logic Laboratory is available in the full version.
                    </p>
                    <button onClick={() => window.history.back()} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main>
            <AiScoringLab />
        </main>
    );
}
