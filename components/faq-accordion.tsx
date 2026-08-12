"use client";

import { useState } from "react";
import type { Faq } from "@/lib/db/schema";
import { linkifyAnswer } from "@/lib/links";

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(faqs[0]?.id ?? null);

  return (
    <div className="divide-y divide-border overflow-hidden rounded-sm border border-border bg-pure-white">
      {faqs.map((faq) => {
        const isOpen = open === faq.id;
        return (
          <div key={faq.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : faq.id)}
            >
              <span className="font-serif text-lg text-navy">{faq.question}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={`shrink-0 text-gold transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              >
                <path
                  d="M3 6l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div
              className={`grid transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-6">
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-text-body">
                    {linkifyAnswer(faq.answer).map((part, i) =>
                      part.type === "link" ? (
                        <a
                          key={i}
                          href={part.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-navy underline decoration-gold underline-offset-2 hover:text-gold"
                        >
                          {part.value}
                        </a>
                      ) : (
                        part.value
                      )
                    )}
                  </p>

                  {faq.linkUrl && (
                    <a
                      href={faq.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold mt-4 inline-flex"
                    >
                      {faq.linkLabel || "Open Link"}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
