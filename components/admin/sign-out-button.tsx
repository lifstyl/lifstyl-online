import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/admin/login" });
      }}
    >
      <button
        type="submit"
        className="text-sm text-white/60 transition hover:text-gold-light"
      >
        Sign out
      </button>
    </form>
  );
}
