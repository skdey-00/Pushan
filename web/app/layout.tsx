import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Adaptive Traffic Signal Dashboard',
  description: 'Real-time traffic signal management system with edge-AI, YOLOv8 vehicle detection, and adaptive signal control',
  keywords: ['traffic signal', 'AI', 'YOLOv8', 'ESP32', 'smart city', 'traffic management'],
  authors: [{ name: 'Traffic Signal System' }],
  openGraph: {
    title: 'Adaptive Traffic Signal Dashboard',
    description: 'Real-time traffic signal management with edge-AI. Monitor traffic flow, vehicle detection, and adaptive signal control.',
    url: 'https://web-three-red-50.vercel.app',
    siteName: 'Traffic Signal System',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Traffic Signal Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adaptive Traffic Signal Dashboard',
    description: 'Real-time traffic signal management with edge-AI, YOLOv8, and ESP32',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  themeColor: '#0f172a',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
