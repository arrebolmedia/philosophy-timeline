'use client';

import { useEffect, useState } from 'react';

/**
 * Modo meditación del timeline (?meditation=1), para lo que vive en el layout (menú y pie).
 * Se lee de la URL: router.replace no dispara popstate, así que se consulta también cada 200 ms.
 */
export function useMeditacion() {
  const [meditacion, setMeditacion] = useState(false);
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
  return meditacion;
}
