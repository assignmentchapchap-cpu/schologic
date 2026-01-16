import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Schologic LMS",
  description: "AI-Powered Assignment Grading",
};

import { ToastProvider } from "@/context/ToastContext";
import DemoBanner from '@/components/DemoBanner';
import { DemoTourProvider } from '@/context/DemoTourContext';
import DemoTour from '@/components/DemoTour';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ToastProvider>
          <DemoTourProvider>
            <DemoBanner />
            <DemoTour />
            {children}
          </DemoTourProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
