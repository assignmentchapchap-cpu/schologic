import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schologic LMS",
  description: "AI-Powered Assignment Grading",
};

import { ToastProvider } from "@/context/ToastContext";
import DemoBanner from '@/components/DemoBanner';
import { UniversalReaderProvider } from '@/components/providers/UniversalReaderProvider';

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
          <UniversalReaderProvider>
            <DemoBanner />
            {children}
          </UniversalReaderProvider>
        </ToastProvider>
      </body >
    </html >
  );
}
