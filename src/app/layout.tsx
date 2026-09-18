import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

const APP_URL = 'https://ngodingpakeprd.daeroom.my.id';

export const metadata: Metadata = {
  title: 'ngodingpakeprd — Generator PRD Standar Industri untuk AI Coding',
  description: 'Ubah ide mentah menjadi PRD & arsitektur teknis terstruktur dengan AI Engine, siap dieksekusi oleh Cursor, Claude Code, dan Roo Code.',
  metadataBase: new URL(APP_URL),
  icons: {
    icon: '/favicon.jpg',
    shortcut: '/favicon.jpg',
    apple: '/favicon.jpg',
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#09090b] text-zinc-100 min-h-screen`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
