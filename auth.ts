import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";
import { db } from "./lib/db";
import { agents } from "./lib/db/schema";
import { normalizePhone, phoneLookupKey } from "./lib/phone";

/**
 * Two separate login realms:
 *
 *  • "credentials" — the single site owner/admin, checked against the
 *    ADMIN_EMAIL / ADMIN_PASSWORD_HASH env vars. Full access to /admin.
 *  • "agent" — Lifstyl agents contributing to the Office Exclusives board,
 *    checked against the `agents` table. Their password is their phone
 *    number. No access to /admin.
 *
 * This file touches the database, so it must only be imported from Node
 * runtime code (server components / server actions) — never from middleware.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
        const hash = process.env.ADMIN_PASSWORD_HASH ?? "";

        if (!adminEmail || !hash) return null;
        if (email !== adminEmail) return null;
        if (!bcrypt.compareSync(password, hash)) return null;

        return {
          id: "admin",
          email: adminEmail,
          name: "Lifstyl Admin",
          role: "admin",
        };
      },
    }),

    Credentials({
      id: "agent",
      name: "Agent",
      credentials: {
        phone: { label: "Phone number", type: "password" },
      },
      async authorize(credentials) {
        const phone = normalizePhone(String(credentials?.phone ?? ""));
        if (!phone) return null;

        // Find by the indexed lookup key rather than scanning every agent's
        // bcrypt hash, then verify with bcrypt.
        const rows = await db
          .select()
          .from(agents)
          .where(eq(agents.phoneLookup, phoneLookupKey(phone)))
          .limit(1);

        const agent = rows[0];
        if (!agent || !agent.active) return null;
        if (!bcrypt.compareSync(phone, agent.phoneHash)) return null;

        return {
          id: `agent-${agent.id}`,
          name: agent.name,
          role: "agent",
          agentId: agent.id,
          manageAll: agent.isManager,
        };
      },
    }),
  ],
});

/** Convenience accessor for the current session's role + agent id. */
export async function getSessionInfo() {
  const session = await auth();
  if (!session?.user) return null;
  const user = session.user as {
    name?: string | null;
    role?: string;
    agentId?: number;
    manageAll?: boolean;
  };
  const isAdmin = user.role === "admin";
  return {
    name: user.name ?? "",
    role: user.role ?? "",
    agentId: user.agentId,
    isAdmin,
    isAgent: user.role === "agent",
    /** Can edit/remove any listing: the site admin, or a manager agent. */
    canManageAllListings: isAdmin || user.manageAll === true,
  };
}
