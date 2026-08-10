"use client";

import { useEffect, useState } from "react";
import type { CarouselImage } from "@/lib/db/schema";

/**
 * Contained, rotating photo card shown below the hero's "SEE WHAT'S NEW"
 * banner — one image at a time, cross-fading. Editable via Admin → Home.
 * (Not a full-bleed hero background — the hero itself uses HeroWaves only.)
 */
export function HeroCarousel({ images }: { images: CarouselImage[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % images.length),
      5000
    );
    return () => clearInterval(id);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="mx-auto mt-10 flex h-[320px] w-full max-w-3xl flex-col items-center justify-center rounded-sm border border-dashed border-white/25 bg-white/5 text-center sm:h-[420px] md:h-[480px]">
        <p className="text-sm text-white/60">
          No photos yet — add some from Admin → Home.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl">
      <div className="relative h-[320px] w-full overflow-hidden sm:h-[420px] md:h-[480px]">
        {images.map((img, i) => (
          // Full image shown uncropped (object-contain); any letterbox gap
          // shows the hero's own navy gradient behind this transparent box.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.id}
            src={img.url}
            alt={img.altText}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Sits under the photo rather than over it, so it never covers part
          of the image. */}
      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-5 bg-gold" : "w-1.5 bg-white/60 hover:bg-white/90"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
