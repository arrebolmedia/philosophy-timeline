import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { BASE_PATH } from './basePath';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) return null;
        if (credentials?.email === adminEmail && credentials?.password === adminPassword) {
          return { id: '1', email: adminEmail, name: 'Admin' };
        }
        return null;
      }
    })
  ],
  pages: {
    // NextAuth devuelve este valor tal cual como cabecera Location (ruta
    // absoluta del mismo origen) y Next NO le aplica el basePath, así que va
    // prefijado. Ojo: en src/middleware.ts es al revés (withAuth ya lo prefija).
    signIn: `${BASE_PATH}/admin/login`,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
