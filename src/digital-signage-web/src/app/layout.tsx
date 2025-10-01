import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from '@/app/providers'
import "./globals.css";

// Force dynamic rendering for all pages to avoid prerendering issues
export const dynamic = 'force-dynamic'

// Polyfill for 'self' in Node.js environment
if (typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis as any
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Digital Signage - Admin Dashboard",
    template: "%s | Digital Signage"
  },
  description: "Digital Signage Management System - Manage devices, content, and schedules",
  keywords: [
    "digital signage",
    "content management",
    "device management", 
    "dashboard",
    "admin panel"
  ],
  authors: [
    {
      name: "Digital Signage Team",
    }
  ],
  creator: "Digital Signage Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Digital Signage - Admin Dashboard",
    description: "Digital Signage Management System - Manage devices, content, and schedules",
    siteName: "Digital Signage",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Signage - Admin Dashboard",
    description: "Digital Signage Management System - Manage devices, content, and schedules",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-gray-50 min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <div id="root">
            {children}
          </div>
          {/* Portal root for modals and overlays */}
          <div id="modal-root" />
          <div id="tooltip-root" />
          <div id="notification-root" />
        </Providers>
      </body>
    </html>
  );
}
