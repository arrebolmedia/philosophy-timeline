const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // La app se sirve bajo https://anthonycazares.cafe/timeline (antes en el
  // subdominio timeline.anthonycazares.cafe). Todas las rutas de Next llevan
  // el prefijo: /timeline/_next, /timeline/api/auth, /timeline/api/og, etc.
  // El valor se incrusta en build; src/lib/basePath.ts lee la misma variable
  // para prefijar rutas absolutas que Next no prefija solo (window.location,
  // <a href>, callbackUrl de NextAuth, imágenes de public/ guardadas en BD).
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '/timeline',

  // Workspace root: fija el root al directorio frontend cuando hay multiples lockfiles
  turbopack: {
    root: __dirname,
  },

  // Optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'plato.stanford.edu',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Configuración de compilación
  compiler: {
    // Eliminar console.log en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig