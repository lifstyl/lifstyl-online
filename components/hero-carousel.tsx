"use client";

import { useEffect, useState } from "react";
import type { CarouselImage } from "@/lib/db/schema";

/**
 * Full-bleed hero background carousel. Cross-fades between images from the DB.
 * Falls back to a navy gradient when no images are configured, so the hero
 * text is always legible.
 */
export function HeroCarousel({ images }: { images: CarouselImage[] }) {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % images.length),
      5000
    );
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-navy-deep">
      {hasImages &&
        images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.id}
            src={img.url}
            alt={img.altText}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      {/* Navy scrim so the headline stays readable over any photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/80 via-navy/55 to-navy-deep/85" />

      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all ${
                i === active ? "w-6 bg-gold" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
