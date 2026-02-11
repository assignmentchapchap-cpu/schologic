'use client';

import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import DemoSignupModal from '@/components/auth/DemoSignupModal';
import InstitutionalPilotModal from '@/components/leads/InstitutionalPilotModal';
import { StickySubNav } from '@/components/features/StickySubNav';
import { useState } from 'react';

export default function FeaturesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [showPilotModal, setShowPilotModal] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 selection:bg-indigo-500/30">
            <Navbar onOpenDemo={() => setShowDemoModal(true)} />

            <StickySubNav />

            <main className="relative z-10 pt-20 md:pt-0">
                {children}
            </main>

            <Footer />

            {/* Modals */}
            {showDemoModal && <DemoSignupModal onClose={() => setShowDemoModal(false)} />}
            {showPilotModal && <InstitutionalPilotModal onClose={() => setShowPilotModal(false)} />}
        </div>
    );
}
