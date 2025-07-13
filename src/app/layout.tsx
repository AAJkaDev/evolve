import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
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
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
    apple: [
      {
        url: '/favicon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
  },
  openGraph: {
    title: "EVOLVE - AI-Powered Learning Platform",
    description: "Revolutionize your learning experience with EVOLVE - an AI-powered platform for personalized, project-based learning.",
    images: [
      {
        url: '/logo.svg',
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
    images: ['/logo.svg'],
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
