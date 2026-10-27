import './globals.css'
import type { Metadata } from 'next'
import { Inter, Crimson_Text, Playfair_Display, Poppins } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from 'sonner'
import { MenuSitio } from '@/components/layout/MenuSitio'
import { PieSitio } from '@/components/layout/PieSitio'
import { BASE_PATH } from '@/lib/basePath'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const crimsonText = Crimson_Text({ 
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-crimson',
})

// Fuente variable (todos los pesos), como en el sitio: el menú, el pie y el 404 usan 400 y 600.
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

// URL pública de la app, YA con el basePath (en producción:
// https://anthonycazares.cafe/timeline). Se usa como metadataBase.
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000${BASE_PATH}`

export const metadata: Metadata = {
  title: {
    default: 'Historia de la Filosofía Interactiva',
    template: '%s | Historia de la Filosofía'
  },
  description: 'Una guía visual.',
  keywords: [
    'filosofía',
    'historia',
    'visualización',
    'interactivo',
    'timeline',
    'pensadores',
    'ideas filosóficas'
  ],
  authors: [{ name: 'Historia de la Filosofía Team' }],
  creator: 'Historia de la Filosofía Team',
  // En esta versión de Next, las URLs relativas de metadata (p. ej.
  // '/images/OG-image.png') se resuelven uniendo la RUTA de metadataBase con la
  // relativa (resolveUrl en next/dist/lib/metadata/resolvers/resolve-url.js),
  // así que con metadataBase = .../timeline salen como .../timeline/images/...
  // y conservan el basePath. Por eso no se prefijan a mano. Requisito:
  // NEXT_PUBLIC_BASE_URL debe incluir el basePath.
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    // Absoluta y sin barra final (un '/' relativo saldría como .../timeline/,
    // que Next redirige con 308 a .../timeline).
    url: SITE_URL,
    title: 'Historia de la Filosofía Interactiva',
    description: 'Una guía visual.',
    siteName: 'Historia de la Filosofía',
    images: [
      {
        url: '/images/OG-image.png',
        width: 1200,
        height: 630,
        alt: 'Historia de la Filosofía - Timeline Interactivo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Historia de la Filosofía Interactiva',
    description: 'Una guía visual.',
    images: ['/images/OG-image.png'],
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
  verification: {
    google: 'your-google-verification-code',
  },
  // app/icon.tsx (icono dinámico) sale en el <link rel="icon"> como "/icon?hash",
  // SIN basePath (Next 16.2 + Turbopack), y el navegador lo pediría a la raíz del
  // dominio, fuera de la app. Declararlo aquí lo hace salir como /timeline/icon
  // (las URLs de `icons` no se resuelven contra metadataBase, de ahí el prefijo).
  icons: {
    icon: [{ url: `${BASE_PATH}/icon`, type: 'image/png', sizes: '32x32' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${crimsonText.variable} ${playfairDisplay.variable} ${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <div className="relative flex min-h-screen flex-col">
                <MenuSitio />
                <div className="flex-1">
                  {children}
                </div>
                <PieSitio />
              </div>
              <Toaster position="bottom-right" richColors closeButton />
            </QueryProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}