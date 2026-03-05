import { Metadata } from 'next';
import { Suspense } from 'react';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Schologic LMS - Credible, Flexible, & Intelligent Learning.',
  description: 'Boost instructor productivity by 80% and protect academic integrity. Schologic LMS (Schoologic) unifies AI grading, content detection, and OER into a secure white label pilot management portal designed for African higher education.',
  keywords: [
    'White Label LMS',
    'Pilot Management Portal',
    'Instructor Productivity Tools',
    'Schologic LMS',
    'School Logic',
    'Schoologic'
  ],
  alternates: {
    canonical: 'https://schologic.com',
  },
  openGraph: {
    title: 'Schologic LMS - Credible, Flexible, & Intelligent Learning.',
    description: 'Boost instructor productivity by 80% and protect academic integrity. School Logic (Schoologic) unifies AI grading, content detection, and OER into a secure white label pilot management portal.',
    images: [{
      url: '/images/updated screenshots/dashboard.webp',
      width: 1200,
      height: 630,
      alt: 'Schologic LMS Dashboard'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schologic LMS - Credible, Flexible, & Intelligent Learning.',
    description: 'Boost instructor productivity by 80% and protect academic integrity. School Logic (Schoologic) unifies AI grading, content detection, and OER into a secure white label pilot management portal.',
    images: ['/images/updated screenshots/dashboard.webp']
  }
};

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <HomeClient />
    </Suspense>
  );
}
