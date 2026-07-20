import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

type UserRole = "admin" | "equipe" | "revendedora";

const API_URL = process.env.API_INTERNAL_URL ?? "http://api:4000";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  // NextAuth mora fora de /api: o Caddy encaminha tudo em /api/* para o
  // backend NestJS (Host painel.* -> /api -> api:4000), entao as rotas do
  // NextAuth precisam de um prefixo proprio para nao colidir.
  basePath: "/auth",
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          accessToken: data.accessToken,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role: UserRole }).role;
        token.accessToken = (user as { accessToken: string }).accessToken;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.sub as string;
      }
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});
