import Link from "next/link";

const cards = [
  {
    href: "/admin/home",
    title: "Home Page",
    desc: "Hero carousel photos, banner text, calendar link, About copy, and testimonials.",
  },
  {
    href: "/admin/faqs",
    title: "FAQs",
    desc: "Add, edit, reorder, or remove frequently asked questions.",
  },
  {
    href: "/admin/quarterly-meetings",
    title: "Quarterly Meetings",
    desc: "Meeting materials grouped by date, with links out to slideshows and PDFs.",
  },
  {
    href: "/admin/book-a-room",
    title: "Book a Conference Room",
    desc: "Intro text and the room-booking link.",
  },
  {
    href: "/admin/open-house-showcase",
    title: "Open House Showcase",
    desc: "Intro text and the Google Form link for open-house submissions.",
  },
  {
    href: "/admin/marketing-materials",
    title: "Marketing Materials",
    desc: "Recommended vendors grouped by category.",
  },
  {
    href: "/admin/support-staff",
    title: "Support Staff",
    desc: "The staff directory — names, titles, photos, and bios.",
  },
];

export default function AdminDashboard() {
  return (
    <>
      <header className="mb-8">
        <span className="section-tag">Admin</span>
        <h1 className="mt-3 font-serif text-3xl text-navy">Manage your site</h1>
        <p className="mt-2 text-text-body">
          Pick a section to edit. Changes go live immediately.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-6 transition hover:shadow-md"
          >
            <h2 className="font-serif text-xl text-navy">{c.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-body">
              {c.desc}
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-gold transition group-hover:translate-x-0.5">
              Edit →
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
