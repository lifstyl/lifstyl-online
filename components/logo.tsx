/**
 * Text-based stand-in for the Lifstyl wordmark, styled to match the brand's
 * navy badge treatment. Drop the real logo PNG/SVG into /public and swap the
 * inner markup for an <Image> when available.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex flex-col items-start leading-none ${className}`}
      aria-label="Lifstyl Real Estate"
    >
      <span className="font-serif text-2xl tracking-tight text-pure-white">
        lifstyl
      </span>
      <span className="text-[8px] font-semibold uppercase tracking-[0.35em] text-gold-light">
        real estate
      </span>
    </span>
  );
}
