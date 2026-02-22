import type { Metadata } from "next";
import { Inter, Merriweather, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://schologic.com'),
  title: "Schologic LMS - Credible, Flexible, & Intelligent Learning.",
  description: "Cut grading time by up to 80%, eliminate textbook costs, and protect academic integrity — without switching between five different tools. Schologic LMS unifies AI grading, content detection, class management, and open educational resources into one platform designed for African universities and colleges.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Schologic LMS',
    description: 'Credible, Flexible, & Intelligent Learning.',
    url: 'https://schologic.com',
    siteName: 'Schologic LMS',
    images: [
      {
        url: '/images/updated screenshots/dashboard.webp',
        width: 1200,
        height: 630,
        alt: 'Schologic LMS Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schologic LMS',
    description: 'Credible, Flexible, & Intelligent Learning.',
    images: ['/images/updated screenshots/dashboard.webp'],
  },
};

import { ToastProvider } from "@/context/ToastContext";
import DemoBanner from '@/components/DemoBanner';
import { UserProvider } from "@/context/UserContext";
import { JsonLdOrganization } from "@/components/seo/JsonLd";
import { GoogleAnalytics } from '@next/third-parties/google';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://yysunbytccvkynpyxzjy.supabase.co" />
        <link rel="dns-prefetch" href="https://yysunbytccvkynpyxzjy.supabase.co" />
        <link rel="preconnect" href="https://fond-akita-38050.upstash.io" />
        <link rel="dns-prefetch" href="https://fond-akita-38050.upstash.io" />
      </head>
      <body
        className={`${inter.variable} ${merriweather.variable} ${jetbrainsMono.variable} font-sans antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ToastProvider>
          <UserProvider>
            <DemoBanner />
            <JsonLdOrganization />
            {children}
          </UserProvider>
        </ToastProvider>
        <GoogleAnalytics gaId="G-WLLYY0ET1Y" />
      </body >
    </html >
  );
}
