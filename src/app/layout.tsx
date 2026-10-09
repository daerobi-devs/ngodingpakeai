import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const getAppUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'https://ngodingpakeprd.buatin.biz.id';
};

const APP_URL = getAppUrl();

export const metadata: Metadata = {
  title: 'ngodingpakeprd — Generator PRD Standar Industri untuk AI Coding',
  description: 'Ubah ide mentah menjadi PRD & arsitektur teknis terstruktur dengan AI Engine, siap dieksekusi oleh Cursor, Claude Code, dan Roo Code.',
  metadataBase: new URL(APP_URL),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.jpg', type: 'image/jpeg' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    url: APP_URL,
    title: 'ngodingpakeprd — Generator PRD Standar Industri untuk AI Coding',
    description: 'Ubah ide mentah menjadi PRD & arsitektur teknis terstruktur dengan AI Engine, siap dieksekusi oleh Cursor, Claude Code, dan Roo Code.',
    siteName: 'ngodingpakeprd',
    locale: 'id_ID',
    images: [
      {
        url: `${APP_URL}/og-image.jpg`,
        secureUrl: `${APP_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'ngodingpakeprd — AI Architecture & PRD Engine',
      },
      {
        url: `${APP_URL}/logo-square.jpg`,
        secureUrl: `${APP_URL}/logo-square.jpg`,
        width: 600,
        height: 600,
        type: 'image/jpeg',
        alt: 'ngodingpakeprd Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ngodingpakeprd — Generator PRD Standar Industri untuk AI Coding',
    description: 'Ubah ide mentah menjadi PRD & arsitektur teknis terstruktur dengan AI Engine, siap dieksekusi oleh Cursor, Claude Code, dan Roo Code.',
    images: [`${APP_URL}/og-image.jpg`],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#09090b] text-zinc-100 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
