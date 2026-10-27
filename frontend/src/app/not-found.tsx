import type { Metadata } from 'next';
import Link from 'next/link';
import './no-encontrada.css';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false, follow: true },
};

// El 404 del timeline, con el mismo diseño que el de anthonycazares.cafe (app/not-found.tsx del
// repo del sitio principal): mantener a la par. Las dos primeras puertas son de esta app (Link,
// con basePath); las demás, del sitio (<a> con ruta absoluta del dominio).
const PUERTAS: { href: string; titulo: string; texto: string; app?: boolean }[] = [
  { href: '/', titulo: 'Línea de tiempo', texto: '2.600 años de filosofía: autores, ideas y cómo se conectan.', app: true },
  { href: '/filosofos', titulo: 'Filósofos', texto: 'El índice de autores de la línea de tiempo, cada uno con su ficha.', app: true },
  { href: '/historia/', titulo: 'Historia de la Filosofía', texto: 'La serie contada desde sus autores, con las fuentes y notas de cada capítulo.' },
  { href: '/curso/', titulo: 'Filosofía, de principio a fin', texto: 'El curso en video, materia por materia, desde qué es la filosofía.' },
  { href: '/libros/', titulo: 'Libros', texto: 'Traducciones de obras de dominio público, hechas desde el original.' },
  { href: '/', titulo: 'Inicio', texto: 'La portada de anthonycazares.cafe: por dónde empezar y lo último.' },
];

export default function NoEncontrada() {
  return (
    <div className="no-encontrada">
      <main id="contenido">
        <p aria-hidden="true" className="ne-numero">
          404
        </p>
        <p className="ne-rotulo">Página no encontrada</p>
        <h1 className="ne-titulo">Esta página no existe</h1>

        <figure className="ne-cita">
          <blockquote>«No podrías conocer lo que no es —no es posible— ni expresarlo».</blockquote>
          <figcaption>
            Parménides, fragmento 2 ·{' '}
            <a href="/historia/presocraticos/cap-9/">capítulo 9 de la Historia de la Filosofía</a>
          </figcaption>
        </figure>

        <p className="ne-texto">
          Puede que el enlace esté mal escrito o que la página haya cambiado de lugar. Esto, en cambio, sí es:
        </p>

        <ul className="ne-puertas">
          {PUERTAS.map((p) => {
            const contenido = (
              <>
                <span className="ne-puerta-titulo">{p.titulo}</span>
                <span className="ne-puerta-texto">{p.texto}</span>
              </>
            );
            return (
              <li key={`${p.app ? 'app' : 'sitio'}${p.href}`}>
                {p.app ? <Link href={p.href}>{contenido}</Link> : <a href={p.href}>{contenido}</a>}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
