'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import IntegrityHub from '@/components/landing/IntegrityHub';
import UniversalReader from '@/components/landing/UniversalReader';
import SchologicTA from '@/components/landing/SchologicTA';
import Footer from '@/components/landing/Footer';
import DemoSignupModal from '@/components/auth/DemoSignupModal';
import InstitutionalPilotModal from '@/components/leads/InstitutionalPilotModal';
import ShareDemoModal from '@/components/landing/ShareDemoModal'; // Moved here
import { Sparkles, Share2 } from 'lucide-react';

function HomeContent() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showPilotModal, setShowPilotModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Check for legacy hash
    if (typeof window !== 'undefined' && window.location.hash === '#request-pilot') {
      setShowPilotModal(true);
    }

    // 2. Check for mode query param
    const mode = searchParams.get('mode');
    if (mode === 'demo') {
      setShowDemoModal(true);
    } else if (mode === 'invite') {
      setShowInviteModal(true);
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-slate-900 selection:bg-indigo-500/30">
      <Navbar onOpenDemo={() => setShowDemoModal(true)} />

      {/* Section 1: The Authority Hook */}
      <Hero
        onOpenDemo={() => setShowDemoModal(true)}
        onOpenPilot={() => setShowPilotModal(true)}
      />

      {/* Section 2: Forensic Evidence */}
      <IntegrityHub />

      {/* Section 3: ZTC Mandate ROI */}
      <UniversalReader />

      {/* Section 4: Faculty Retention */}
      <SchologicTA />

      {/* Final Institutional CTA */}
      <section id="pilot" className="py-24 bg-indigo-900 relative overflow-hidden border-t border-indigo-800">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-800/50 backdrop-blur-sm border border-indigo-500/30 text-indigo-200 text-sm font-bold mb-8 font-mono">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>INSTITUTIONAL PARTNERSHIP PROGRAM</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-black text-white mb-8 tracking-tight">
            Ready to transform <br />
            Academic Excellence?
          </h2>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto font-light">
            Join forward-thinking institutions using AI to offer smart, credible, and flexible higher education.
          </p>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center sm:justify-center sm:gap-4 w-full px-1 sm:px-0">
            <button
              onClick={() => setShowPilotModal(true)}
              className="px-2 py-3 sm:px-8 sm:py-4 bg-white text-indigo-900 rounded-lg font-bold text-base sm:text-lg hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/40 active:scale-95 font-sans w-full sm:w-auto sm:min-w-[280px] whitespace-nowrap"
            >
              Start <span className="hidden sm:inline">Your Institutional</span> Pilot
            </button>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-2 py-3 sm:px-8 sm:py-4 bg-transparent border-2 border-indigo-400/30 text-indigo-100 rounded-lg font-bold text-base sm:text-lg hover:bg-indigo-800/50 hover:border-indigo-400/60 transition-all active:scale-95 font-sans flex items-center justify-center gap-1 sm:gap-2 w-full sm:w-auto sm:min-w-[280px] whitespace-nowrap"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Invite <span className="hidden sm:inline">an</span> Instructor
            </button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      {showDemoModal && (
        <DemoSignupModal onClose={() => setShowDemoModal(false)} />
      )}

      {showPilotModal && (
        <InstitutionalPilotModal onClose={() => setShowPilotModal(false)} />
      )}

      {showInviteModal && (
        <ShareDemoModal onClose={() => setShowInviteModal(false)} />
      )}

      {/* Hidden Semantic Text for AI Crawlers */}
      <div className="hidden">
        Schologic is an education technology company building the operating system for academic integrity and digital learning in Africa.
        AI content detection, automated grading, practicum management, and open educational resources for universities, colleges, and TVET institutions.
        Evidence-Based AI Detection using RoBERTa open-weights models trained on the Human ChatGPT Comparison Corpus (HC3).
        LTI 1.3 Compliant. IMS Global Common Cartridge 1.3. CUE and CDACC aligned.
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <HomeContent />
    </Suspense>
  );
}
