// Prefijo bajo el que se sirve la app (https://anthonycazares.cafe/timeline).
//
// Next.js aplica el basePath automáticamente a next/link, useRouter, redirect()
// y a los assets de /_next, pero NO a rutas absolutas escritas a mano:
// window.location, <a href="/...">, fetch a rutas propias, callbackUrl de
// NextAuth, URLs de public/ guardadas como texto, etc. Para esos casos hay que
// prefijar con BASE_PATH.
//
// Debe coincidir con el basePath de next.config.js (que lee la misma variable).
// Para servir en la raíz de un dominio (p. ej. desarrollo suelto) define
// NEXT_PUBLIC_BASE_PATH="" y reconstruye: el valor se incrusta en tiempo de build.
export const BASE_PATH: string = process.env.NEXT_PUBLIC_BASE_PATH ?? '/timeline';

// Antepone BASE_PATH a una ruta propia de la app (que empiece por "/").
// Deja intactas las URLs absolutas (https://..., //cdn...), data: y blob:,
// y no duplica el prefijo si la ruta ya lo trae.
export function withBasePath(path: string): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return path;
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`) || path.startsWith(`${BASE_PATH}?`))) {
    return path;
  }
  return `${BASE_PATH}${path}`;
}
