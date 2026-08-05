"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/home", label: "Home Page" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/quarterly-meetings", label: "Quarterly Meetings" },
  { href: "/admin/book-a-room", label: "Book a Conference Room" },
  { href: "/admin/office-exclusives", label: "Office Exclusives" },
  { href: "/admin/exclusive-agents", label: "Exclusive Agents" },
  { href: "/admin/marketing-materials", label: "Marketing Materials" },
  { href: "/admin/support-staff", label: "Support Staff" },
  { href: "/admin/setup", label: "Setup" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={[
              "rounded-sm px-3 py-2 text-sm transition",
              active
                ? "bg-gold/15 font-medium text-gold-light"
                : "text-white/70 hover:bg-white/5 hover:text-pure-white",
            ].join(" ")}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
