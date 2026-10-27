import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4 text-center text-sm text-gray-400 font-[family-name:var(--font-poppins)] space-y-2">
        <p>
          Inspirado en el trabajo de{' '}
          <a
            href="https://www.denizcemonduygu.com/philo/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-gray-600 transition-colors"
          >
            Deniz Cem Önduygu
          </a>.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/logs" className="underline underline-offset-4 hover:text-gray-600 transition-colors">
            Registro de cambios
          </Link>
          <span aria-hidden>·</span>
          {/* Licencia y privacidad son las del sitio entero (anthonycazares.cafe/legal/ y
              /privacidad/, en la otra app): <a> con ruta del dominio, sin el basePath. */}
          <a href="/legal/" className="underline underline-offset-4 hover:text-gray-600 transition-colors">
            Licencia CC BY 4.0
          </a>
          <span aria-hidden>·</span>
          <a href="/privacidad/" className="underline underline-offset-4 hover:text-gray-600 transition-colors">
            Privacidad
          </a>
        </div>
      </div>
    </footer>
  )
}
