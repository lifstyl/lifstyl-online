export type AnswerPart =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string };

// Matches http(s):// URLs and bare www. addresses.
const URL_PATTERN = /((?:https?:\/\/|www\.)[^\s<]+)/gi;

// Trailing punctuation that's almost always sentence punctuation rather than
// part of the address — "see example.com." shouldn't link the full stop.
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/;

/**
 * Split text into plain and link segments so a URL typed straight into an FAQ
 * answer renders as a clickable link.
 *
 * Returns segments rather than an HTML string on purpose: the answer is
 * admin-entered text that gets rendered as React children, so it can never
 * inject markup into the page.
 */
export function linkifyAnswer(text: string): AnswerPart[] {
  const parts: AnswerPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    let raw = match[0];

    // Pull trailing punctuation back out of the link and into the text.
    let trailing = "";
    const punctuation = raw.match(TRAILING_PUNCTUATION);
    if (punctuation) {
      trailing = punctuation[0];
      raw = raw.slice(0, -trailing.length);
    }
    if (!raw) continue;

    if (start > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, start) });
    }

    parts.push({
      type: "link",
      value: raw,
      href: raw.toLowerCase().startsWith("http") ? raw : `https://${raw}`,
    });

    if (trailing) parts.push({ type: "text", value: trailing });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }
  return parts;
}

/**
 * Accept a pasted address in whatever shape the admin typed it and return
 * something a browser can actually follow — "canva.com" becomes
 * "https://canva.com". Returns "" for blank input.
 */
export function normalizeUrl(input: string): string {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
