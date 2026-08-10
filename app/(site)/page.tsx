import { HeroCarousel } from "@/components/hero-carousel";
import { HeroWaves } from "@/components/hero-waves";
import { CalendarEmbed } from "@/components/calendar-embed";
import { getCarouselImages, getPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [images, content] = await Promise.all([
    getCarouselImages(),
    getPageContent("home"),
  ]);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-32 text-center"
        style={{
          background:
            "linear-gradient(160deg, var(--navy) 0%, var(--navy-deep) 55%, #0d1a33 100%)",
        }}
      >
        <HeroWaves />
        <div className="relative z-10 w-full max-w-4xl">
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
          <HeroCarousel images={images} />
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
