import './globals.css'
import type { Metadata } from 'next'
import { Inter, Crimson_Text, Playfair_Display, Poppins } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import { Navigation } from '@/components/layout/Navigation'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const crimsonText = Crimson_Text({ 
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-crimson',
})

const playfairDisplay = Playfair_Display({ 
  weight: ['700', '900'],
  subsets: ['latin'],
  variable: '--font-playfair',
})

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: {
    default: 'Historia de la Filosofía Interactiva',
    template: '%s | Historia de la Filosofía'
  },
  description: 'Explora 2600 años de filosofía occidental a través de una visualización interactiva que conecta ideas, argumentos y pensadores a lo largo del tiempo.',
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: '/',
    title: 'Historia de la Filosofía Interactiva',
    description: 'Explora 2600 años de filosofía occidental de forma interactiva',
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
    description: 'Explora 2600 años de filosofía occidental de forma interactiva',
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
                <Navigation />
                <div className="flex-1">
                  {children}
                </div>
              </div>
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}