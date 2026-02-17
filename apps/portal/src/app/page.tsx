import { Metadata } from 'next';
import { Suspense } from 'react';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Schologic LMS - The Operating System for Academic Integrity',
  description: 'Unify AI grading, content detection, and OER into one platform. Designed for African universities and colleges to protect reputation and scale personalized learning.',
  alternates: {
    canonical: 'https://schologic.com',
  },
  openGraph: {
    title: 'Schologic LMS - The Operating System for Academic Integrity',
    description: 'Unify AI grading, content detection, and OER into one platform. Designed for African universities and colleges.',
    images: [{
      url: '/images/updated screenshots/dashboard.webp',
      width: 1200,
      height: 630,
      alt: 'Schologic LMS Dashboard'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schologic LMS - The Operating System for Academic Integrity',
    description: 'Unify AI grading, content detection, and OER into one platform.',
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
