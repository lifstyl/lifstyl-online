import Link from "next/link";
import { Logo } from "./logo";

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/lifstyl.re" },
  { label: "Facebook", href: "https://www.facebook.com/lifstylrealestate" },
  { label: "YouTube", href: "https://www.youtube.com/@lifstylrealestate" },
];

export function Footer() {
  return (
    <footer className="bg-navy-deep text-white/80">
      <div className="mx-auto grid max-w-content gap-10 px-6 py-14 sm:px-10 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="w-fit rounded-lg bg-navy px-3 py-1.5"
            aria-label="Lifstyl home"
          >
            <Logo />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            The Lifstyl Real Estate agent intranet — brokerage resources,
            training, and support in one place.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-lg text-white">Quick Links</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/faqs" className="transition hover:text-gold-light">
                FAQs
              </Link>
            </li>
            <li>
              <Link
                href="/quarterly-meeting-materials"
                className="transition hover:text-gold-light"
              >
                Quarterly Meeting Materials
              </Link>
            </li>
            <li>
              <Link
                href="/book-a-conference-room"
                className="transition hover:text-gold-light"
              >
                Book a Conference Room
              </Link>
            </li>
            <li>
              <Link
                href="/support-staff"
                className="transition hover:text-gold-light"
              >
                Support Staff
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-lg text-white">Follow Lifstyl</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {socials.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-gold-light"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-content flex-col gap-1 px-6 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>© {new Date().getFullYear()} Lifstyl Real Estate. All rights reserved.</p>
          <p>#LOVEYOURLIFSTYL #LIFSTYLREALESTATE #LIMITLESS</p>
        </div>
      </div>
    </footer>
  );
}
