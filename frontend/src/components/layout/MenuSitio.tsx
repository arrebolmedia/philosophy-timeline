'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import './menu-sitio.css';

// Menú del sitio anthonycazares.cafe (el mismo del resto del dominio): mismo marcado, mismas
// entradas y mismo comportamiento que components/Menu.tsx del repo del sitio principal
// (C:\Projects\anthonycazares-cafe); mantener a la par. Los enlaces van con <a> y rutas
// absolutas del dominio: next/link les antepondría el basePath (/timeline).
const CANAL = 'https://www.youtube.com/@FilosofIA-Canal';
const ENTRADAS = [
  { href: '/', texto: 'Inicio' },
  { href: '/curso/', texto: 'Curso' },
  { href: '/historia/', texto: 'Historia' },
  { href: '/timeline', texto: 'Timeline', actual: true },
  { href: '/blog/', texto: 'Blog' },
  { href: '/libros/', texto: 'Libros' },
] as const;

export function MenuSitio() {
  // usePathname devuelve la ruta SIN basePath: la visualización es '/'.
  const ruta = usePathname() ?? '/';
  const [abierto, setAbierto] = useState(false);
  const [meditacion, setMeditacion] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  // Al navegar, se cierra.
  useEffect(() => setAbierto(false), [ruta]);

  // Modo meditación (?meditation=1): la barra se desvanece. Se lee de la URL (como la barra
  // anterior): router.replace no dispara popstate, así que se consulta también cada 200 ms.
  useEffect(() => {
    const leer = () => setMeditacion(new URLSearchParams(window.location.search).get('meditation') === '1');
    leer();
    window.addEventListener('popstate', leer);
    const intervalo = window.setInterval(leer, 200);
    return () => {
      window.removeEventListener('popstate', leer);
      window.clearInterval(intervalo);
    };
  }, []);

  // Abierto: Escape cierra y devuelve el foco; un clic fuera cierra.
  useEffect(() => {
    if (!abierto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    const fuera = (e: PointerEvent) => {
      if (nav.current && !nav.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener('keydown', tecla);
    document.addEventListener('pointerdown', fuera);
    return () => {
      document.removeEventListener('keydown', tecla);
      document.removeEventListener('pointerdown', fuera);
    };
  }, [abierto]);

  // El panel de administración no lleva el menú del sitio.
  if (ruta.startsWith('/admin')) return null;

  const clases = ['menu', abierto && 'menu-abierto', meditacion && 'menu-oculto'].filter(Boolean).join(' ');

  return (
    <nav ref={nav} className={clases} aria-label="Principal" data-menu="" aria-hidden={meditacion || undefined}>
      <div className="menu-capsula">
        <button
          ref={boton}
          type="button"
          className="menu-boton"
          aria-expanded={abierto}
          aria-controls="menu-lista"
          onClick={() => setAbierto((a) => !a)}
        >
          <span className="menu-linea" aria-hidden="true" />
          <span className="menu-linea" aria-hidden="true" />
          <span className="menu-sr">Menú</span>
        </button>
        <ul id="menu-lista" className="menu-lista">
          {ENTRADAS.map((e) => (
            <li key={e.href}>
              {/* "Timeline": sección actual; "page" en la visualización, "true" en sus subpáginas. */}
              <a href={e.href} aria-current={'actual' in e ? (ruta === '/' ? 'page' : 'true') : undefined}>
                {e.texto}
              </a>
            </li>
          ))}
          <li>
            <a href={CANAL} rel="noopener" className="menu-externo">
              YouTube<span aria-hidden="true"> ↗</span>
              <span className="menu-sr"> (canal de YouTube, sitio externo)</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
