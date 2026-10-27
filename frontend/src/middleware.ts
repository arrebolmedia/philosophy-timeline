import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      // SIN basePath, a propósito. En next-auth 4.24 withAuth compara este valor
      // con req.nextUrl.pathname (que Next entrega sin basePath) para dejar pasar
      // la propia página de login, y al redirigir ya le antepone el basePath
      // (Location: /timeline/admin/login?callbackUrl=/timeline/admin...). Si aquí
      // se prefijara, la comparación fallaría y habría un bucle de redirecciones.
      signIn: '/admin/login',
    },
  }
);

export const config = {
  // SIN basePath, a propósito. Con basePath en next.config.js, Next antepone el
  // basePath a cada matcher al compilar el middleware (ver getMiddlewareMatchers
  // en node_modules/next/dist/build/analysis/get-page-static-info.js), así que
  // '/admin/:path*' protege /timeline/admin/... y NO /admin/... (que ya no existe).
  matcher: ['/admin/:path*'],
};
