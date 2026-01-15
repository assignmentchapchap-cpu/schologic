'use client';

import { useState } from 'react';
import Hero from '@/components/landing/Hero';
import Navbar from '@/components/landing/Navbar';
import FeatureSection from '@/components/landing/FeatureSection';
import RoleSwitcher from '@/components/landing/RoleSwitcher';
import Footer from '@/components/landing/Footer';
import DemoSignupModal from '@/components/auth/DemoSignupModal';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar onOpenDemo={() => setShowDemoModal(true)} />

      <Hero onOpenDemo={() => setShowDemoModal(true)} />

      <div id="features">
        <FeatureSection />
      </div>

      <div id="how-it-works">
        <RoleSwitcher />
      </div>

      {/* Final CTA Section */}
      <section className="py-24 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-bold mb-8">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Join 500+ Educators today</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
            Ready to upgrade your classroom?
          </h2>
          <button
            onClick={() => setShowDemoModal(true)}
            className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
          >
            Start Your Free Demo
          </button>
        </div>
      </section>

      <Footer />

      {/* Demo Modal */}
      {showDemoModal && (
        <DemoSignupModal onClose={() => setShowDemoModal(false)} />
      )}
    </main>
  );
}
