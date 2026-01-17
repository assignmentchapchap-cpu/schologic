import type { Metadata } from "next";
import "./globals.css";

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
        className={`font-sans antialiased overflow-x-hidden`}
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
