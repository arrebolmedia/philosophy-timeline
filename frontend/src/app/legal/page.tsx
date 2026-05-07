import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Licencia de uso',
  description: 'Términos de licencia Creative Commons BY-NC 4.0 para Historia de la Filosofía Interactiva.',
}

export default function LegalPage() {
  const year = new Date().getFullYear()

  return (
    <div className="container mx-auto px-4 max-w-2xl py-16 font-[family-name:var(--font-poppins)]">
      <h1 className="text-3xl font-bold mb-2 font-[family-name:var(--font-playfair)]">Licencia de uso</h1>
      <p className="text-sm text-gray-400 mb-10">Creative Commons BY-NC 4.0 — © {year} Anthony Cazares</p>

      <div className="space-y-8 text-gray-600 text-base leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Qué puedes hacer</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Compartir — copiar y redistribuir el material en cualquier medio o formato.</li>
            <li>Adaptar — remezclar, transformar y construir a partir del material.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Bajo estas condiciones</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <span className="font-medium text-gray-700">Atribución</span> — debes dar crédito apropiado a Anthony Cazares e indicar si realizaste cambios. Puedes hacerlo de cualquier manera razonable, pero no de forma que sugiera que el autor te respalda.
            </li>
            <li>
              <span className="font-medium text-gray-700">No comercial</span> — no puedes utilizar el material con fines comerciales.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Sin restricciones adicionales</h2>
          <p>
            No puedes aplicar términos legales ni medidas tecnológicas que restrinjan legalmente a otros de hacer cualquier cosa que la licencia permita.
          </p>
        </section>

        <section className="border-t pt-8">
          <p className="text-sm text-gray-400">
            Esta es una descripción simplificada. El texto legal completo está disponible en{' '}
            <a
              href="https://creativecommons.org/licenses/by-nc/4.0/legalcode.es"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-gray-600 transition-colors"
            >
              creativecommons.org/licenses/by-nc/4.0
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link href="/" className="text-sm text-gray-400 underline underline-offset-4 hover:text-gray-600 transition-colors">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}
