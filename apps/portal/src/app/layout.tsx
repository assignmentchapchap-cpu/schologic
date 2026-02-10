import type { Metadata } from "next";
import { Inter, Merriweather, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

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
  title: "Schologic LMS | The Sovereign Integrity Layer",
  description: "The only open-weights LMS with Linguistic Forensic Analysis and Universal OER Ingestion.",
};

import { ToastProvider } from "@/context/ToastContext";
import DemoBanner from '@/components/DemoBanner';
import { UniversalReaderProvider } from '@/components/providers/UniversalReaderProvider';
import { UserProvider } from "@/context/UserContext";
import { NotificationProvider } from "@/context/NotificationContext";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${merriweather.variable} ${jetbrainsMono.variable} font-sans antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ToastProvider>
          <UserProvider>
            <UniversalReaderProvider>
              <NotificationProvider>
                <DemoBanner />
                {children}
              </NotificationProvider>
            </UniversalReaderProvider>
          </UserProvider>
        </ToastProvider>
        <Analytics />
      </body >
    </html >
  );
}
