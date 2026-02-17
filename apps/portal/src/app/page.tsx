'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import { LightHero } from '@/components/landing/LightHero';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { IntegrityCheckVisual } from '@/components/use-cases/IntegrityCheckVisual';
import { TAInsightsVisual } from '@/components/use-cases/TAInsightsVisual';
import { PracticumProcessVisual } from '@/components/use-cases/universities/PracticumProcessVisual';
import { ZTCIngestionVisual } from '@/components/use-cases/ZTCIngestionVisual';
import { StudentMobileCarousel } from '@/components/use-cases/colleges/StudentMobileCarousel';
import { SystemEcosystemVisual } from '@/components/use-cases/universities/SystemEcosystemVisual';
import {
  FileText, Shield, Activity,
  Sparkles, Clock, Users,
  MapPin, CheckCircle, Target,
  BookOpen, Globe, Repeat,
  Smartphone, Calendar, // Removed Book (use BookOpen)
  Lock, Eye, Share2, // Removed Key
  FileCheck, // Added for QA (replaces Key)
  GraduationCap // Added for Study (replaces Book if needed, or use BookOpen)
} from 'lucide-react';
import Footer from '@/components/landing/Footer';
import DemoSignupModal from '@/components/auth/DemoSignupModal';
import InstitutionalPilotModal from '@/components/leads/InstitutionalPilotModal';
import ShareDemoModal from '@/components/landing/ShareDemoModal'; // Moved here

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
      {/* Section 1: The Authority Hook */}
      <LightHero />

      {/* Section 2: Forensic Evidence */}
      <FeaturesSection
        eyebrow="Evidence-Based Integrity"
        title="Protect Reputation with Multi-Model Forensics."
        description="Detect AI-generated content with 99% accuracy. We strictly avoid 'black box' guessing by using a transparent, multi-stage analysis engine."
        align="left"
        visual={<IntegrityCheckVisual />}
        visualScaleClass="scale-[0.95] md:scale-[0.75] group-hover:scale-[1.05] md:group-hover:scale-[0.8] origin-center"
        features={[
          {
            icon: FileText,
            title: "Segment Analysis",
            description: "Submissions are split into semantic units to isolate specific AI-generated claims."
          },
          {
            icon: Shield,
            title: "Multi-Model Scan",
            description: "Files run against 3 specialized models (RoBERTa, OpenAI, context-aware) to catch distinct patterns."
          },
          {
            icon: Activity,
            title: "Authenticity Score",
            description: "Weighted triangulation filters false positives, giving you actionable proof."
          }
        ]}
      />

      {/* Section 3: AI Teaching Assistant */}
      <FeaturesSection
        eyebrow="Faculty Retention Engine"
        title="Scale Personalized Learning with 24/7 AI Tutors."
        description="Reduce grading time by 80% without sacrificing quality. Our AI drafts feedback based on YOUR rubric, identifying at-risk students instantly."
        align="right"
        className="bg-slate-50"
        visual={<TAInsightsVisual />}
        visualScaleClass="scale-[0.9] md:scale-[0.65] group-hover:scale-[0.95] md:group-hover:scale-[0.7] origin-center"
        features={[
          {
            icon: Sparkles,
            title: "Rubric Generator",
            description: "Convert a simple prompt into a standardized 5-point rubric in seconds."
          },
          {
            icon: Target,
            title: "Deterministic Scoring",
            description: "Anti-Hallucination logic maps student work to criteria, never inventing grades."
          },
          {
            icon: Users,
            title: "Platform Copilot",
            description: "Context-aware help for navigating the portal and finding resources."
          }
        ]}
      />

      {/* Section 4: Practicum Management */}
      <FeaturesSection
        eyebrow="Field Placement Tracking"
        title="Digitize the Entire Placement Lifecycle."
        description="Replace paper logbooks with a verified digital trail. Track hours, approve logs, and evaluate competencies in real-time."
        align="left"
        className="bg-white"
        visual={<PracticumProcessVisual />}
        visualScaleClass="scale-[0.9] md:scale-[0.65] group-hover:scale-[0.95] md:group-hover:scale-[0.7] origin-center"
        features={[
          {
            icon: MapPin,
            title: "Placement Workflow",
            description: "Automated enrollment and site assignment for thousands of students."
          },
          {
            icon: CheckCircle,
            title: "Supervision Tracking",
            description: "GPS-verified attendance logging and digital preceptor approvals."
          },
          {
            icon: Target,
            title: "Assessment Framework",
            description: "Competency-based evaluation matrices for precise skill tracking."
          }
        ]}
      />

      {/* Section 5: Zero Textbook Cost */}
      <FeaturesSection
        eyebrow="OER Library Integration"
        title="Eliminate Student Costs with Open Standards."
        description="Import high-quality, peer-reviewed content from LibreTexts and OpenStax directly into your course with one click."
        align="right"
        className="bg-slate-50"
        visual={<ZTCIngestionVisual />}
        visualScaleClass="scale-[0.9] md:scale-[0.65] group-hover:scale-[0.95] md:group-hover:scale-[0.67] origin-center"
        features={[
          {
            icon: BookOpen,
            title: "Zero Student Cost",
            description: "Replace expensive textbooks with free, high-quality OER materials."
          },
          {
            icon: Globe,
            title: "Global Connectivity",
            description: "IMS Common Cartridge support ensures compatibility with global repositories."
          },
          {
            icon: Repeat,
            title: "Remix & Adapt",
            description: "Full editorial control to mix chapters, add localized content, and customize flow."
          }
        ]}
      />

      {/* Section 6: Mobile First */}
      <FeaturesSection
        eyebrow="Offline-First Learning"
        title="Learning That Fits in Every Student's Pocket."
        description="Designed for the reality of student life. A fully functional app that allows students to learn, submit, and track progress anywhere."
        align="left"
        className="bg-white"
        visual={<StudentMobileCarousel />}
        visualScaleClass="scale-[0.9] md:scale-[0.75] group-hover:scale-[0.95] md:group-hover:scale-[0.8] origin-center"
        features={[
          {
            icon: Smartphone,
            title: "Universal Access",
            description: "Dashboard, Grades, and Assignments available on any smartphone."
          },
          {
            icon: BookOpen,
            title: "AI Study Assistant",
            description: "Personalized tutoring and content analysis available on mobile."
          },
          {
            icon: Calendar,
            title: "Digital Logbook",
            description: "Students document field experiences and clinical hours directly from their phone."
          }
        ]}
      />

      {/* Section 7: RBAC */}
      <FeaturesSection
        eyebrow="Enterprise Security"
        title="Granular Governance for Complex Institutions."
        description="Ensure data privacy and compliance. Give Deans, HODs, and Admins the exact visibility they need without compromising security."
        align="right"
        className="bg-slate-50"
        visual={<SystemEcosystemVisual />}
        visualScaleClass="scale-[0.9] md:scale-[0.75] group-hover:scale-[0.95] md:group-hover:scale-[0.8] origin-center"
        features={[
          {
            icon: Eye,
            title: "Vice Chancellor View",
            description: "High-level dashboards for strategic policy and multi-campus oversight."
          },
          {
            icon: FileCheck,
            title: "Departmental QA",
            description: "Head of Department tools for tracking curriculum compliance and staff allocation."
          },
          {
            icon: Lock,
            title: "Audit Logs",
            description: "Complete traceability of every grade change and system action."
          }
        ]}
      />

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
