/* =============================================================
   NEXTAUTH — configuracao

   Fica aqui, e nao no route handler, porque um route handler do
   App Router so pode exportar metodos HTTP.

   ESTADO ATUAL: provider de credenciais validando contra as contas
   de demonstracao de lib/courses.js, com sessao em JWT (sem banco).

   PROXIMO PASSO (bloqueado por dependencia externa): provisionar o
   Neon, aplicar prisma/schema.prisma e trocar o authorize() abaixo
   por consulta ao banco com hash de senha (User.passwordHash).
   Ver docs/DOSSIE-MESTRE.md §10.
   ============================================================= */

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { USERS_DB } from '@/lib/courses';

type DemoUser = {
  id: string;
  email: string;
  pass: string;
  name: string;
  role: string;
  org: string;
  plan: string;
};

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  pages: { signIn: '/academy' },
  providers: [
    CredentialsProvider({
      name: 'BIZZ.IA Sales Academy',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const email = credentials.email.trim().toLowerCase();
        const user = (USERS_DB as DemoUser[]).find(
          (u) => u.email.toLowerCase() === email && u.pass === credentials.password,
        );
        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          org: user.org,
          plan: user.plan,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        token.role = u.role;
        token.org = u.org;
        token.plan = u.plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        Object.assign(session.user, { role: token.role, org: token.org, plan: token.plan });
      }
      return session;
    },
  },
};
