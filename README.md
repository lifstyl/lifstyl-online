# Lifstyl Online — Agent Intranet

A custom rebuild of the Lifstyl Real Estate agent site (lifstyl.online), with a
built-in admin panel so all text and photos can be edited without touching code.
Styled to match its sister site, [limitlesslifstyl.com](https://limitlesslifstyl.com)
(navy + gold, Playfair Display + DM Sans).

## Stack

- **Next.js 14** (App Router, TypeScript) — deploy on **Vercel**
- **Tailwind CSS** with the limitless design tokens
- **Postgres** via **Drizzle ORM** (Vercel Postgres in production)
- **Vercel Blob** for image uploads (carousel, staff, testimonial photos)
- **Auth.js (NextAuth v5)** — single admin login

## Pages

Public: Home, FAQs, Quarterly Meeting Materials, Book a Conference Room,
Recommendations For Marketing Materials, Support Staff.

**Office Exclusives** (`/office-exclusives`) and **Buyer Wishlists**
(`/buyer-wishlists`) are agent-only, sharing one sign-in. Agents enter just
their phone number to post listings, or free-text notes about what their buyers
are looking for. Both are only queried once a session exists, so nothing is
served to logged-out visitors.

### Posts expire on their own

| | Stays up | Warning to admin |
|---|---|---|
| Office Exclusives listing | 30 days | 7 days before |
| Buyer Wishlist | 90 days | 7 days before |

Each card shows its own countdown ("Removes in 5 days"), and agents can take a
post down early themselves.

Removal is belt-and-braces: a daily Vercel cron (`vercel.json` →
`/api/cron/cleanup`) deletes expired rows, *and* every query filters by age —
so an expired post is never shown even if the cron misses a night. Set a
`CRON_SECRET` env var to restrict that endpoint; the signed-in admin can also
hit it directly to test.

### Admin notifications

The bell beside the logo in the admin panel shows unread alerts:

- **New Office Exclusive Listing** — an agent posted a listing
- **New Buyer Wishlist post** — an agent posted a wishlist
- **…expiring soon** — raised 7 days before a post is removed

Alerts are unique per post, so the nightly job never stacks up duplicates, and
they're cleared automatically if the post they point at is deleted.

Admin (`/admin`, login-protected): one editor per section above, plus the
homepage carousel, calendar link, About copy, testimonials, and the two
Office Exclusives screens (all listings, and who can sign in).

### Two separate logins

| | Signs in at | Credential | Can do |
|---|---|---|---|
| **You (admin)** | `/admin/login` | Email + password | Everything, including editing/removing any listing |
| **Agents** | `/office-exclusives` | Phone number only | Post listings; edit/remove only their own |

Agents sign in with just their phone number — their name is looked up and shown
once they're in. Numbers are entered as plain digits (`8595551212`).

Agents are managed from **Admin → Exclusive Agents**. An agent's phone number
*is* their password, so it's stored only as a bcrypt hash and never displayed
anywhere on the site — the admin screen shows just the last 4 digits so you can
tell which number they were set up with. "Revoke access" blocks sign-in while
keeping their listings; "Delete" removes the agent and their listings.

**Manager agents.** "Make manager" lets an agent edit or remove *any* listing on
the board. It grants nothing in `/admin` — that stays behind the email +
password login, so board management never becomes reachable with just a phone
number.

### Importing the agent roster

```bash
# One CSV of "Name,Phone" per sheet — Google Sheets exports one sheet at a time,
# so pass each exported tab as its own file and they're merged into one roster.
MANAGER_PHONE=8599485512 npm run agents:import -- "roster-sheet1.csv" "roster-sheet2.csv"
```

Safe to re-run: agents are matched on phone number, so existing ones have their
name refreshed rather than being duplicated, and their listings are untouched.
The import aborts if the roster has the same number on two agents, since the
phone number is the credential and must be unique.

> Phone numbers are found at sign-in via a peppered SHA-256 lookup key
> (`lib/phone.ts`) rather than by scanning every bcrypt hash — that's a ~96 ms
> sign-in instead of ~7 s across a 110-agent roster. The pepper is `AUTH_SECRET`,
> so **rotating `AUTH_SECRET` invalidates the keys** — re-run the import after.

## Editing content

Go to `/admin`, log in, pick a section. Everything is editable:

- **Home** — add/remove/reorder hero carousel photos, edit all text, paste the
  Google Calendar embed link, edit the About copy, manage testimonials.
- **FAQs / Quarterly Meetings / Marketing Materials / Support Staff** — add,
  edit, reorder (↑/↓), and delete entries.
- **Book a Conference Room** — edit intro text and the outbound booking link.
- **Office Exclusives** — remove any agent listing.
- **Exclusive Agents** — add agents, reset a phone number, revoke access.

Changes appear on the live site immediately.

## Local development

Requires Node 20+ and a local Postgres.

```bash
npm install
cp .env.example .env        # then fill in the values (see notes in that file)
npm run db:migrate          # create tables
npm run db:seed             # load the current site content
npm run dev                 # http://localhost:3000
```

Generate an admin password hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('YourPassword',10))"
```

> ⚠️ In a **local `.env`**, escape every `$` in the hash as `\$` (Next.js runs
> `dotenv-expand`, which otherwise corrupts it). On Vercel, paste the raw hash —
> no escaping.

## Deploying to Vercel

The repo lives on GitHub under [github.com/lifstyl](https://github.com/lifstyl);
Vercel is connected and auto-deploys on push.

1. Push this repo to GitHub.
2. In the Vercel project, add **Postgres** and **Blob** storage (Storage tab) —
   Vercel injects `POSTGRES_URL` and `BLOB_READ_WRITE_TOKEN` automatically.
3. Add the remaining env vars (Settings → Environment Variables):
   `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (raw, unescaped), `AUTH_SECRET`.
4. After the first deploy, run the migration + seed against the production DB
   (locally, with `POSTGRES_URL` pointed at the Vercel database):
   ```bash
   npm run db:migrate
   npm run db:seed        # optional — only for first-time content load
   ```

> **After deploying a schema change**, run the migration against the production
> database (locally, with `POSTGRES_URL` pointed at the Vercel database):
> `POSTGRES_URL="<prod-url>" npm run db:migrate`. Do **not** re-run `db:seed`
> on production — it clears the content tables and would wipe your edits.

## Things to set after launch

These were placeholders in the seed and should be set from `/admin`:

- **Google Calendar** (Home → "Google Calendar embed URL") — the live calendar
  embed wasn't working on the old site. Paste the `src="…"` URL from Google
  Calendar → Settings → *your calendar* → **Integrate calendar** → Embed code.
  It auto-updates whenever you add an event.
- **Office Exclusives agents** (Admin → Exclusive Agents) — nobody can sign in
  to the listings board until agents are added here.

## Security note

`npm audit` reports a few Next.js/undici advisories that are DoS-class issues
only patchable by moving to Next 15. They're low-risk for a low-traffic,
single-admin intranet on Vercel's managed platform; revisit at the next major
Next upgrade. The higher-severity Drizzle SQL-injection advisory is already
patched (drizzle-orm 0.45+).
