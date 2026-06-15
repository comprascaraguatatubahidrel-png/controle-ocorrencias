import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [], // Os providers reais ficam no auth.ts para não quebrar o Edge Runtime
} satisfies NextAuthConfig
