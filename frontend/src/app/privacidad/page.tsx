import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Información sobre el tratamiento de datos y servicios de terceros en Historia de la Filosofía Interactiva.',
}

export default function PrivacidadPage() {
  return (
    <div className="container mx-auto px-4 max-w-2xl py-16 font-[family-name:var(--font-poppins)]">
      <h1 className="text-3xl font-bold mb-2 font-[family-name:var(--font-playfair)]">Política de privacidad</h1>
      <p className="text-sm text-gray-400 mb-10">
        Sitio: <span className="font-medium">timeline.anthonycazares.cafe</span> — Responsable: Anthony Cazares
      </p>

      <div className="space-y-8 text-gray-600 text-base leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Datos que recopilamos</h2>
          <p>
            Este sitio no solicita ni almacena datos personales directamente. No hay formularios de registro, cuentas de usuario ni sistemas de comentarios. No se recopilan nombres, correos electrónicos ni datos de identificación personal.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Servicios de terceros</h2>
          <p className="mb-4">El sitio utiliza los siguientes servicios externos que pueden recopilar datos de forma independiente:</p>

          <div className="space-y-4">
            <div className="border-l-2 border-gray-200 pl-4">
              <h3 className="font-medium text-gray-700 mb-1">Google Analytics / Vercel Analytics</h3>
              <p className="text-sm">
                Recopila datos anónimos de navegación: páginas visitadas, tiempo de sesión, país de origen y tipo de dispositivo. Esta información se usa exclusivamente para entender el uso del sitio y no permite identificar a usuarios individuales.
              </p>
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline underline-offset-4 hover:text-gray-600 transition-colors"
              >
                Política de privacidad de Google →
              </a>
            </div>

            <div className="border-l-2 border-gray-200 pl-4">
              <h3 className="font-medium text-gray-700 mb-1">Google Fonts</h3>
              <p className="text-sm">
                Las tipografías del sitio se cargan desde los servidores de Google. Esto implica que el navegador del usuario realiza una solicitud HTTP a Google, la cual puede incluir la dirección IP y otros datos técnicos del dispositivo.
              </p>
              <a
                href="https://developers.google.com/fonts/faq/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline underline-offset-4 hover:text-gray-600 transition-colors"
              >
                Privacidad de Google Fonts →
              </a>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Cookies</h2>
          <p>
            El sitio puede utilizar cookies técnicas mínimas asociadas a los servicios de analítica mencionados. No se usan cookies de sesión para usuarios generales ni cookies de publicidad.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Tus derechos</h2>
          <p>
            Tienes derecho a solicitar acceso, rectificación o supresión de cualquier dato que pudiera haberse recopilado. Para ejercer estos derechos, puedes contactar a través del correo indicado en el sitio.
          </p>
        </section>

        <section className="border-t pt-8">
          <p className="text-sm text-gray-400">
            Esta política puede actualizarse ocasionalmente. La versión vigente siempre estará disponible en esta página.
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
