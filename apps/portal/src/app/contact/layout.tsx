

import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { BackgroundGrid } from '@/components/use-cases/BackgroundGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us - Schologic LMS',
    description: 'Get in touch with the Schologic team. Support, sales inquiries, and general questions.',
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-500/30 text-slate-900 font-sans">
            <Navbar solid={true} />

            <main className="relative pt-20 min-h-screen">
                <BackgroundGrid />
                <div className="relative z-10">
                    {children}
                </div>
            </main>

            <Footer />
        </div>
    );
}
