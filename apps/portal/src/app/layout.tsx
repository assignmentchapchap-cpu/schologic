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
  title: "Schologic LMS - Smart, Credible, and Flexible Higher Education, with AI",
  description: "Cut grading time by 80%, eliminate textbook costs, and protect academic integrity — without switching between five different tools. Schologic LMS unifies AI grading, content detection, class management, and open educational resources into one platform designed for African universities and colleges.",
};

import { ToastProvider } from "@/context/ToastContext";
import DemoBanner from '@/components/DemoBanner';
import { UniversalReaderProvider } from '@/components/providers/UniversalReaderProvider';
import { UserProvider } from "@/context/UserContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { JsonLdOrganization } from "@/components/seo/JsonLd";


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
                <JsonLdOrganization />
                {children}
              </NotificationProvider>
            </UniversalReaderProvider>
          </UserProvider>
        </ToastProvider>
      </body >
    </html >
  );
}
