"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";

const brokerageResources = [
  { label: "Quarterly Meeting Materials", href: "/quarterly-meeting-materials" },
  { label: "Book a Conference Room", href: "/book-a-conference-room" },
  {
    label: "Lifstyl Community Sponsorship",
    href: "/lifstyl-community-sponsorship",
  },
  {
    label: "Recommendations For Marketing Materials",
    href: "/recommendations-for-marketing-materials",
  },
];

/**
 * The three agent-only boards share a dropdown. They're grouped rather than
 * listed flat so the top row doesn't outgrow the width available on a laptop.
 */
const agentBoards = [
  { label: "Office Exclusives", href: "/office-exclusives" },
  { label: "Buyer Wishlists", href: "/buyer-wishlists" },
  { label: "Open House Board", href: "/open-house-board" },
];

export function Nav() {
  const pathname = usePathname();
  // Home has a full-height dark hero, so the nav sits transparent over it and
  // solidifies on scroll. Every other page starts with content at the top, so
  // the nav is solid immediately.
  const transparentAtTop = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Which dropdown is open, by key — only one at a time.
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!transparentAtTop) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentAtTop]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const solid = !transparentAtTop || scrolled;

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "bg-white/95 shadow-[0_2px_24px_rgba(28,54,100,0.08)] backdrop-blur"
          : "bg-transparent",
      ].join(" ")}
    >
      <nav
        className={[
          "mx-auto flex max-w-content items-center justify-between px-6 transition-all duration-300 sm:px-10",
          solid ? "py-2.5" : "py-4",
        ].join(" ")}
      >
        <Link
          href="/"
          className="rounded-lg bg-navy px-3 py-1.5"
          aria-label="Lifstyl home"
        >
          <Logo />
        </Link>

        {/* Desktop links */}
        <ul
          className={[
            "hidden items-center gap-8 lg:flex",
            solid ? "text-navy" : "text-pure-white",
          ].join(" ")}
        >
          <NavLink href="/" solid={solid}>
            Home
          </NavLink>

          <NavDropdown
            label="Brokerage Resources"
            items={brokerageResources}
            isOpen={openMenu === "resources"}
            onOpen={(o) => setOpenMenu(o ? "resources" : null)}
          />

          <NavDropdown
            label="Agent Boards"
            items={agentBoards}
            isOpen={openMenu === "boards"}
            onOpen={(o) => setOpenMenu(o ? "boards" : null)}
          />

          <NavLink href="/contractors-and-vendors" solid={solid}>
            Contractors &amp; Vendors
          </NavLink>
          <NavLink href="/faqs" solid={solid}>
            FAQs
          </NavLink>
          <NavLink href="/support-staff" solid={solid}>
            Support Staff
          </NavLink>
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          className={`lg:hidden ${solid ? "text-navy" : "text-pure-white"}`}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {mobileOpen ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-pure-white lg:hidden">
          <ul className="mx-auto flex max-w-content flex-col px-6 py-3 text-navy">
            <MobileLink href="/">Home</MobileLink>
            <li className="py-1">
              <p className="px-1 py-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
                Brokerage Resources
              </p>
              <ul className="flex flex-col">
                {brokerageResources.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-text-body hover:text-navy"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="py-1">
              <p className="px-1 py-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
                Agent Boards
              </p>
              <ul className="flex flex-col">
                {agentBoards.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-text-body hover:text-navy"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <MobileLink href="/contractors-and-vendors">
              Contractors &amp; Vendors
            </MobileLink>
            <MobileLink href="/faqs">FAQs</MobileLink>
            <MobileLink href="/support-staff">Support Staff</MobileLink>
          </ul>
        </div>
      )}
    </header>
  );
}

/** A top-level nav item that opens a panel of links. */
function NavDropdown({
  label,
  items,
  isOpen,
  onOpen,
}: {
  label: string;
  items: { label: string; href: string }[];
  isOpen: boolean;
  onOpen: (open: boolean) => void;
}) {
  return (
    <li
      className="relative"
      onMouseEnter={() => onOpen(true)}
      onMouseLeave={() => onOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1.5 text-sm font-medium tracking-wide opacity-95 transition hover:opacity-100"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => onOpen(!isOpen)}
      >
        {label}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {isOpen && (
        <ul className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-4">
          <div className="overflow-hidden rounded-sm border border-border bg-pure-white shadow-xl">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block border-b border-border/60 px-5 py-3 text-sm text-text-body transition last:border-b-0 hover:bg-white hover:text-navy"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </div>
        </ul>
      )}
    </li>
  );
}

function NavLink({
  href,
  solid,
  children,
}: {
  href: string;
  solid: boolean;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className={[
          "group relative text-sm font-medium tracking-wide opacity-95 transition hover:opacity-100",
        ].join(" ")}
      >
        {children}
        <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-200 group-hover:w-full" />
      </Link>
    </li>
  );
}

function MobileLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li className="border-b border-border/60 last:border-b-0">
      <Link href={href} className="block px-1 py-3 text-sm font-medium">
        {children}
      </Link>
    </li>
  );
}
