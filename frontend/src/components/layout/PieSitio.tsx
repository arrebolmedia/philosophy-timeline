'use client';

import Link from 'next/link';
import { useMeditacion } from '@/lib/useMeditacion';
import './pie-sitio.css';

// Pie del sitio anthonycazares.cafe, el mismo del resto del dominio: mismo marcado y mismos
// enlaces que components/Pie.tsx del repo del sitio principal (C:\Projects\anthonycazares-cafe);
// mantener a la par. Diferencias: sin «Línea de tiempo» (es la sección actual), con el crédito
// a Deniz Cem Önduygu y el registro de cambios, y oculto en modo meditación.
// Los enlaces del dominio van con <a> y ruta absoluta: next/link les antepondría el basePath.
const CANAL = 'https://www.youtube.com/@FilosofIA-Canal';
const NEWSLETTER = 'https://ia.anthonycazares.cafe';
const SECCIONES = [
  { href: '/', texto: 'Portada' },
  { href: '/curso/', texto: 'Filosofía, de principio a fin' },
  { href: '/historia/', texto: 'Historia de la Filosofía' },
  { href: '/blog/', texto: 'Blog' },
  { href: '/libros/', texto: 'Libros' },
] as const;

export function PieSitio() {
  // En modo meditación no se pinta: la visualización ocupa la pantalla y no queda nada debajo.
  if (useMeditacion()) return null;

  return (
    <div className="pie-sitio">
      <footer>
        <p className="pie-marca">
          <a href="/">anthonycazares.cafe</a>
        </p>
        <ul>
          {SECCIONES.map((s) => (
            <li key={s.href}>
              <a href={s.href}>{s.texto}</a>
            </li>
          ))}
        </ul>
        <ul className="pie-fuera">
          <li>
            <a href={CANAL}>Canal de YouTube</a>
          </li>
          <li>
            <a href={NEWSLETTER}>Newsletter</a>
          </li>
        </ul>
        <p className="pie-nota">
          Línea de tiempo inspirada en el trabajo de{' '}
          <a href="https://www.denizcemonduygu.com/philo/">Deniz Cem Önduygu</a> ·{' '}
          <Link href="/logs">Registro de cambios</Link>
        </p>
        <p className="pie-linea">
          Material de estudio libre. No es un programa oficial: no otorga título, grado ni créditos.
        </p>
        <p className="pie-linea">
          Contenido bajo licencia <a href="/legal/">CC BY-NC 4.0</a> · <a href="/privacidad/">Privacidad</a>
        </p>
      </footer>
    </div>
  );
}
