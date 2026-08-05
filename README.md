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

**Office Exclusives** (`/office-exclusives`) is agent-only. Agents sign in with
their name and phone number to post listings to the office. Listing data is
only queried once a session exists, so nothing is served to logged-out visitors.

Admin (`/admin`, login-protected): one editor per section above, plus the
homepage carousel, calendar link, About copy, testimonials, and the two
Office Exclusives screens (all listings, and who can sign in).

### Two separate logins

| | Signs in at | Credential | Can do |
|---|---|---|---|
| **You (admin)** | `/admin/login` | Email + password | Everything, including editing/removing any listing |
| **Agents** | `/office-exclusives` | Name + phone number | Post listings; edit/remove only their own |

Agents are managed from **Admin → Exclusive Agents**. An agent's phone number
*is* their password, so it's stored only as a bcrypt hash and never displayed
anywhere on the site — the admin screen shows just the last 4 digits so you can
tell which number they were set up with. "Revoke access" blocks sign-in while
keeping their listings; "Delete" removes the agent and their listings.

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
