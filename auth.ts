import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

/**
 * Single-admin auth. Credentials are checked against ADMIN_EMAIL and a bcrypt
 * hash in ADMIN_PASSWORD_HASH — there is no user table, since only the owner
 * logs in. Sessions are stateless JWTs.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  trustHost: true,
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

        const ok = bcrypt.compareSync(password, hash);
        if (!ok) return null;

        return { id: "admin", email: adminEmail, name: "Lifstyl Admin" };
      },
    }),
  ],
});
