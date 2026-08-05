/* Rota de autenticacao. A configuracao vive em lib/auth.ts porque
   um route handler do App Router so pode exportar metodos HTTP. */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
