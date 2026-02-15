'use client';

import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import DemoSignupModal from '@/components/auth/DemoSignupModal';
import { BackgroundGrid } from '@/components/use-cases/BackgroundGrid';

export default function CompanyLayoutClient({ children }: { children: React.ReactNode }) {
    const [showDemoModal, setShowDemoModal] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-500/30 text-slate-900 font-sans flex flex-col">
            <Navbar solid={true} onOpenDemo={() => setShowDemoModal(true)} />

            <main className="relative pt-20 min-h-screen">
                <BackgroundGrid />
                <div className="relative z-10">
                    {children}
                </div>
            </main>

            <Footer />

            {showDemoModal && <DemoSignupModal onClose={() => setShowDemoModal(false)} />}
        </div>
    );
}
