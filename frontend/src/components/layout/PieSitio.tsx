'use client';

import Link from 'next/link';
import { useMeditacion } from '@/lib/useMeditacion';
import './pie-sitio.css';

// Pie del sitio anthonycazares.cafe, el mismo del resto del dominio: mismo marcado y mismos
// enlaces que components/Pie.tsx del repo del sitio principal (C:\Projects\anthonycazares-cafe);
// mantener a la par. Diferencias: «Línea de tiempo» es la sección actual, se añaden el crédito a
// Deniz Cem Önduygu y el registro de cambios, y no se pinta en modo meditación.
// Los enlaces del dominio van con <a> y ruta absoluta: next/link les antepondría el basePath.
const CANAL = 'https://www.youtube.com/@FilosofIA-Canal';
const NEWSLETTER = 'https://ia.anthonycazares.cafe';
const SECCIONES = [
  { href: '/', texto: 'Inicio' },
  { href: '/curso/', texto: 'Filosofía, de principio a fin' },
  { href: '/historia/', texto: 'Historia de la Filosofía' },
  { href: '/timeline', texto: 'Línea de tiempo', actual: true },
  { href: '/blog/', texto: 'Blog' },
  { href: '/libros/', texto: 'Libros' },
] as const;

export function PieSitio() {
  // En modo meditación no se pinta: la visualización ocupa la pantalla y no queda nada debajo.
  if (useMeditacion()) return null;

  return (
    <footer className="pie-sitio">
      <div className="pie-envoltorio">
        <div className="pie-rejilla">
          <div className="pie-marca">
            <a href="/" className="pie-nombre">
              anthonycazares.cafe
            </a>
            <p className="pie-lema">Por el valor del conocimiento inútil</p>
            <p className="pie-texto">
              Material de estudio libre. No es un programa oficial: no otorga título, grado ni créditos.
            </p>
            <p className="pie-texto">
              Esta línea de tiempo se inspira en el trabajo de{' '}
              <a href="https://www.denizcemonduygu.com/philo/">Deniz Cem Önduygu</a>.
            </p>
          </div>

          <nav aria-label="Secciones del sitio">
            <p className="pie-rotulo">Secciones</p>
            <ul className="pie-lista">
              {SECCIONES.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    className={'actual' in s ? 'pie-actual' : undefined}
                    aria-current={'actual' in s ? 'page' : undefined}
                  >
                    {s.texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="pie-rotulo">Suscríbete</p>
            <ul className="pie-lista">
              <li>
                <a href={CANAL}>Canal de YouTube</a>
              </li>
              <li>
                <a href={NEWSLETTER}>Newsletter</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pie-final">
          <p>
            © {new Date().getFullYear()} Anthony Cazares · Contenido bajo licencia{' '}
            <a href="/legal/" className="pie-sin-corte">
              CC BY-NC 4.0
            </a>
          </p>
          <p>
            <Link href="/logs">Registro de cambios</Link> · <a href="/privacidad/">Aviso de Privacidad</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
