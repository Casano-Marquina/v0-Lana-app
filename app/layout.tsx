import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { InstallPrompt } from '@/components/InstallPrompt'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SoftBackground } from '@/components/SoftBackground'
import { TransitionProvider } from '@/components/TransitionProvider'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Mi Agenda - Prioridades de Vida',
  description: 'Agenda inteligente organizada por ámbitos de vida: Personal, Académico y Relacional',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mi Agenda',
  },
  icons: {
    icon: [
      {
        url: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: '/icon-192x192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#3B82F6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="color-default">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mi Agenda" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground pb-24 md:pb-0">
        <SoftBackground />
        <TransitionProvider>
          <ThemeProvider />
          {children}
          <MobileBottomNav />
          <InstallPrompt />
        </TransitionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js', {
                  scope: '/',
                }).catch(err => console.log('[v0] SW registration failed:', err));
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
