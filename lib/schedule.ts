/**
 * Formatting for open house date/time values.
 *
 * These are plain calendar and clock values ("2026-11-23", "14:00"), not
 * instants, so everything here is string arithmetic. Nothing converts between
 * timezones — the point is that the board shows exactly the window the listing
 * agent typed, whatever timezone the server or the reader happens to be in.
 */

const DAY_MONTH = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** "2026-11-23" → "Mon, Nov 23". */
export function formatDate(isoDate: string): string {
  // Pinned to UTC so the calendar date can't slide a day either way.
  const d = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return DAY_MONTH.format(d);
}

/** "14:00" → "2:00 PM". */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  const hour = Number(h);
  const minute = m ?? "00";
  if (!Number.isFinite(hour)) return hhmm;
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${minute} ${suffix}`;
}

/** "14:00"–"16:00" → "2:00 – 4:00 PM", dropping a repeated AM/PM. */
export function formatTimeRange(start: string, end: string): string {
  const a = formatTime(start);
  const b = formatTime(end);
  const aSuffix = a.slice(-2);
  const bSuffix = b.slice(-2);
  if (aSuffix === bSuffix) return `${a.slice(0, -3)} – ${b}`;
  return `${a} – ${b}`;
}

/** "Mon, Nov 23 · 2:00 – 4:00 PM" */
export function formatWindow(
  isoDate: string,
  start: string,
  end: string
): string {
  return `${formatDate(isoDate)} · ${formatTimeRange(start, end)}`;
}

/**
 * Validate a posted window. Returns an error message, or null when it's fine.
 * Guards the things a date picker alone won't: an end before the start, and a
 * window already in the past.
 */
export function validateWindow(
  isoDate: string,
  start: string,
  end: string,
  todayIso: string
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return "Pick a date.";
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
    return "Pick a start and end time.";
  }
  if (end <= start) return "The end time has to be after the start time.";
  if (isoDate < todayIso) return "That date has already passed.";
  return null;
}

/** Today's date in the office timezone, as "YYYY-MM-DD". */
export function todayInOffice(timeZone: string): string {
  // en-CA gives ISO-style YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}
