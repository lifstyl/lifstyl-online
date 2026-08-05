import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { db } from "./lib/db";
import { agents } from "./lib/db/schema";
import { normalizePhone } from "./lib/phone";

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
        name: { label: "Name", type: "text" },
        phone: { label: "Phone number", type: "text" },
      },
      async authorize(credentials) {
        const name = String(credentials?.name ?? "").trim();
        const phone = normalizePhone(String(credentials?.phone ?? ""));
        if (!name || !phone) return null;

        const rows = await db.select().from(agents);
        // Names are matched case-insensitively so agents don't get tripped up
        // by capitalisation; the phone number is the actual secret.
        const agent = rows.find(
          (a) => a.name.trim().toLowerCase() === name.toLowerCase()
        );
        if (!agent || !agent.active) return null;
        if (!bcrypt.compareSync(phone, agent.phoneHash)) return null;

        return {
          id: `agent-${agent.id}`,
          name: agent.name,
          role: "agent",
          agentId: agent.id,
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
  };
  return {
    name: user.name ?? "",
    role: user.role ?? "",
    agentId: user.agentId,
    isAdmin: user.role === "admin",
    isAgent: user.role === "agent",
  };
}
