import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { InstallPrompt } from '@/components/InstallPrompt'
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
    <html lang="es" className="bg-white">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mi Agenda" />
      </head>
      <body className="font-sans antialiased bg-white dark:bg-gray-950">
        {children}
        <InstallPrompt />
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Apply saved theme on page load
              (function() {
                const applyTheme = () => {
                  try {
                    if (!window.indexedDB) {
                      return;
                    }
                    
                    const request = window.indexedDB.open('AgendaDB');
                    request.onsuccess = (event) => {
                      try {
                        const database = event.target.result;
                        const tx = database.transaction('preferences', 'readonly');
                        const store = tx.objectStore('preferences');
                        const getRequest = store.get('settings');
                        
                        getRequest.onsuccess = () => {
                          const prefs = getRequest.result;
                          if (prefs) {
                            // Apply theme
                            if (prefs.theme === 'dark') {
                              document.documentElement.classList.add('dark');
                            } else {
                              document.documentElement.classList.remove('dark');
                            }
                            
                            // Apply color mode
                            const colorMode = prefs.colorMode || 'default';
                            ['color-default', 'color-serenidad', 'color-naturaleza', 'color-deepfocus'].forEach(cls => {
                              document.documentElement.classList.remove(cls);
                            });
                            document.documentElement.classList.add('color-' + colorMode);
                          }
                        };
                      } catch (err) {
                        console.log('[v0] Theme apply error:', err);
                      }
                    };
                    request.onerror = () => {
                      console.log('[v0] IndexedDB open failed');
                    };
                  } catch (e) {
                    console.log('[v0] Theme loading skipped:', e);
                  }
                };
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', applyTheme);
                } else {
                  applyTheme();
                }
              })();
              
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
