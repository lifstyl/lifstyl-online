import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe half of the Auth.js config.
 *
 * `middleware.ts` runs in the Edge runtime, which can't load the Postgres
 * driver. So the providers that hit the database live in `auth.ts` (Node
 * runtime only) and this file holds everything middleware needs — session
 * strategy plus the callbacks that carry `role` through the JWT. Importing
 * the full `auth.ts` into middleware would pull `postgres.js` into the edge
 * bundle and break the deployment at runtime.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  providers: [], // real providers are added in auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as {
          role?: string;
          agentId?: number;
          name?: string | null;
          manageAll?: boolean;
        };
        token.role = u.role;
        token.agentId = u.agentId;
        token.manageAll = u.manageAll;
        token.name = u.name ?? token.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
        (session.user as { agentId?: number }).agentId = token.agentId as
          | number
          | undefined;
        (session.user as { manageAll?: boolean }).manageAll = token.manageAll as
          | boolean
          | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
