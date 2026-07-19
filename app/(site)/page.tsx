import { HeroCarousel } from "@/components/hero-carousel";
import { CalendarEmbed } from "@/components/calendar-embed";
import {
  getCarouselImages,
  getTestimonials,
  getPageContent,
} from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [images, testimonials, content] = await Promise.all([
    getCarouselImages(),
    getTestimonials(),
    getPageContent("home"),
  ]);

  const aboutParagraphs = (content.aboutBody ?? "")
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 text-center">
        <HeroCarousel images={images} />
        <div className="max-w-4xl">
          <h1 className="text-balance font-serif text-4xl leading-tight text-pure-white sm:text-6xl lg:text-7xl">
            {content.heroHeading ?? "WELCOME TO LIFSTYL.ONLINE"}
          </h1>
          {content.heroBanner && (
            <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-sm border border-white/25 bg-white/10 px-6 py-3 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-pure-white">
                {content.heroBanner}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── EVENTS & TRAININGS ───────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-content px-6 py-20 sm:px-10">
          <div className="mb-8 text-center">
            <span className="section-tag justify-center">Stay in the loop</span>
            <h2 className="mt-4 font-serif text-3xl text-navy sm:text-4xl">
              {content.eventsHeading ?? "Events & Trainings"}
            </h2>
          </div>
          <CalendarEmbed url={content.calendarEmbedUrl} />
        </div>
      </section>

      {/* ── ABOUT LIFSTYL ────────────────────────────────── */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-content gap-10 px-6 py-20 sm:px-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="section-tag" style={{ color: "var(--gold-light)" }}>
              Who we are
            </span>
            <h2 className="mt-4 font-serif text-3xl text-pure-white sm:text-4xl">
              {content.aboutHeading ?? "About Lifstyl"}
            </h2>
          </div>
          <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-white/80">
            {aboutParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-content px-6 py-20 sm:px-10">
            <div className="mb-10 text-center">
              <span className="section-tag justify-center">In their words</span>
              <h2 className="mt-4 font-serif text-3xl text-navy sm:text-4xl">
                Agent Testimonials
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((t) => (
                <figure
                  key={t.id}
                  className="flex flex-col rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-8"
                >
                  <blockquote className="flex-1 text-[15px] leading-relaxed text-text-body">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    {t.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.photoUrl}
                        alt={t.name}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    )}
                    <span className="font-serif text-lg text-navy">{t.name}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-deep">
        <div className="mx-auto flex max-w-content flex-col items-center gap-6 px-6 py-20 text-center sm:px-10">
          <h2 className="max-w-2xl text-balance font-serif text-3xl text-pure-white sm:text-4xl">
            {content.ctaHeading ??
              "Get the freedom to take control of your business."}
          </h2>
          {content.ctaButtonUrl && (
            <a
              href={content.ctaButtonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              {content.ctaButtonLabel ?? "Just Click Here"}
            </a>
          )}
        </div>
      </section>
    </>
  );
}
