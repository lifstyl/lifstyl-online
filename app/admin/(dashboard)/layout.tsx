import Link from "next/link";
import { Logo } from "@/components/logo";
import { Sidebar } from "@/components/admin/sidebar";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { NotificationBell } from "@/components/admin/notification-bell";

export const metadata = { title: "Admin | Lifstyl Online" };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between bg-navy-deep p-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-2">
            <Link href="/admin" className="rounded-lg bg-navy px-3 py-1.5">
              <Logo />
            </Link>
            <NotificationBell />
          </div>
          <Sidebar />
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
          <Link
            href="/"
            target="_blank"
            className="text-sm text-white/60 transition hover:text-gold-light"
          >
            View live site ↗
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-4xl px-8 py-10">{children}</div>
      </div>
    </div>
  );
}
