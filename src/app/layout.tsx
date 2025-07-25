import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CursorWrapper } from '@/components/ui/cursor-wrapper';
import { ThemeProvider } from '@/contexts/ThemeContext';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://evolve-ai-learning.vercel.app'),
  title: "EVOLVE - AI-Powered Learning Platform",
  description: "Revolutionize your learning experience with EVOLVE - an AI-powered platform for personalized, project-based learning.",
  icons: {
    icon: [
      {
        url: '/LogoForBlackBG.png',
        type: 'image/png',
        sizes: '32x32'
      },
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
    apple: [
      {
        url: '/LogoForBlackBG.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    title: "EVOLVE - AI-Powered Learning Platform",
    description: "Revolutionize your learning experience with EVOLVE - an AI-powered platform for personalized, project-based learning.",
    images: [
      {
        url: '/LogoForWhiteBG.png',
        width: 1200,
        height: 630,
        alt: 'EVOLVE Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "EVOLVE - AI-Powered Learning Platform",
    description: "Revolutionize your learning experience with EVOLVE - an AI-powered platform for personalized, project-based learning.",
    images: ['/LogoForWhiteBG.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider>
            <CursorWrapper />
            {children}
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
