import { config } from "dotenv";
config({ path: ".env" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Seeds the database with the content currently live on lifstyl.online
 * (captured during the rebuild audit). Safe to re-run: it clears each
 * table first. Two values are intentional placeholders the owner must
 * set via /admin — see PLACEHOLDER comments below.
 */
async function main() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error("POSTGRES_URL is not set.");
  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  const {
    carouselImages,
    testimonials,
    faqs,
    staffMembers,
    resourceLinks,
    pageContent,
  } = schema;

  // Clear existing rows.
  await db.delete(carouselImages);
  await db.delete(testimonials);
  await db.delete(faqs);
  await db.delete(staffMembers);
  await db.delete(resourceLinks);
  await db.delete(pageContent);

  // ── Homepage key/value content ──────────────────────────────
  await db.insert(pageContent).values([
    { pageSlug: "home", key: "heroHeading", value: "WELCOME TO LIFSTYL.ONLINE" },
    { pageSlug: "home", key: "heroBanner", value: "SEE WHAT'S NEW" },
    { pageSlug: "home", key: "eventsHeading", value: "EVENTS & TRAININGS" },
    {
      pageSlug: "home",
      key: "aboutHeading",
      value: "ABOUT LIFSTYL",
    },
    {
      pageSlug: "home",
      key: "aboutBody",
      value:
        "Lifstyl Real Estate Owner & CEO, Eli Haddad, began in real estate in 2014 in Lexington, Kentucky. Tired of giving his hard-earned commissions back to the brokerage, Eli set out to make the most influential brokerage that benefits the AGENT, and NOT the Brokerage.\n\nLifstyl Real Estate was born of this idea in 2019. Beginning with one office in Lexington, KY, the Lifstyl Real Estate brand has seen a tremendous following.\n\nOur culture is built on our core values, the only assets we have for our agents and associate brokers: Hold yourself to the highest level of professional competence and Integrity. To have a never-ending thirst for learning by being Coachable. To always be Committed to strive for excellence. To keep a Positive mindset and to be Passionate about your success, business and life.",
    },
    {
      pageSlug: "home",
      key: "ctaHeading",
      value: "Get the freedom to take control of your business.",
    },
    { pageSlug: "home", key: "ctaButtonLabel", value: "Just Click Here" },
    { pageSlug: "home", key: "ctaButtonUrl", value: "https://www.joinlifstyl.com/" },
    // PLACEHOLDER: paste the Google Calendar public embed URL here via /admin/home.
    // Leave blank to show a "calendar not configured yet" note on the page.
    { pageSlug: "home", key: "calendarEmbedUrl", value: "" },
  ]);

  // ── Testimonials ────────────────────────────────────────────
  await db.insert(testimonials).values([
    {
      name: "Lyndi Griffin",
      quote:
        "Coming to Lifstyl Real Estate was one of the best decisions I have ever made. The amount of money I save put me in a position to better my marketing, which in turn helped my business tremendously! The culture at Lifstyl is unlike any other office I have ever worked for. Everyone is so friendly and helpful with anything you need. Not to mention, they stay up to date with technology and market trends. Lifstyl is a very forward-thinking and agent-centered office - which, in my opinion, is what most brokerages in central Kentucky are missing.",
      sortOrder: 0,
    },
    {
      name: "Towanda Lahor",
      quote:
        "Lifstyl allows every agent to run their own personal branding & puts the agents first! We have the best principal & managing brokers and office staff in the business. We are family!",
      sortOrder: 1,
    },
  ]);

  // ── FAQs ────────────────────────────────────────────────────
  await db.insert(faqs).values([
    {
      question: "What are Lifstyl Real Estate's Branding Guidelines?",
      answer:
        "It is important that all agents remain \"on brand\" with Lifstyl. Not only does it help you as an agent to be seen, but it also serves to widen the Lifstyl brand and everyone's exposure. For more detailed information, refer to the Lifstyl Orientation Manual!",
      sortOrder: 0,
    },
    {
      question: "What are all of the Lifstyl Agent Costs and Fees I may incur?",
      answer:
        "Commission plans are chosen by Lifstyl agents when they come on board. Through the onboarding process, forms are signed including the Lifstyl Policies and Procedures, the Independent Contractor Agreement and Commission Plan choices. This is a synopsis of all agent costs and fees that are associated with each plan and with any additional fees that may have been agreed to in the onboarding process.",
      sortOrder: 1,
    },
    {
      question:
        "How do I reserve a meeting room at the Pasadena Drive office of Lifstyl in Lexington, KY?",
      answer:
        "Use the Book a Conference Room page and follow the directions to reserve a room.",
      sortOrder: 2,
    },
    {
      question: "Where do I find a copy of the Lifstyl Orientation Manual?",
      answer:
        "Ask your Principal Broker for a link to the most recent Lifstyl Orientation Manual. Remember that occasionally things get updated, so it's the responsibility of the agent to stay informed!",
      sortOrder: 3,
    },
    {
      question:
        "Can I get a bonus for recruiting a new agent to Lifstyl Real Estate?",
      answer:
        "New agents are always welcome to join Lifstyl. Please be sure to contact your Principal Broker to let them know who you may be working with — you don't want the bonus going to someone else!",
      sortOrder: 4,
    },
    {
      question: "How to create a collaborative post on Instagram? (Video Tutorial)",
      answer:
        "See the video tutorial for step-by-step instructions on creating a collaborative post on Instagram.",
      sortOrder: 5,
    },
    {
      question:
        "What are the differences between a Real Estate Team and a Partnership?",
      answer:
        "Reach out to your Principal Broker to understand the structural and commission differences between operating as a Real Estate Team versus a Partnership.",
      sortOrder: 6,
    },
  ]);

  // ── Quarterly Meeting Materials (grouped by meeting date) ────
  await db.insert(resourceLinks).values([
    {
      pageSlug: "quarterly-meeting-materials",
      groupLabel: "Quarterly Meeting — October 30, 2025",
      groupNote: "Below is the link to the Quarterly Meeting slideshow.",
      title: "View the Presentation",
      url: "#",
      sortOrder: 0,
    },
    {
      pageSlug: "quarterly-meeting-materials",
      groupLabel: "Quarterly Meeting — June 11, 2025",
      groupNote: "Below are the links to the Quarterly Meeting notes.",
      title: "View the Presentation",
      url: "#",
      sortOrder: 1,
    },
    {
      pageSlug: "quarterly-meeting-materials",
      groupLabel: "Quarterly Meeting — March 5, 2025",
      groupNote:
        "Below is the link to the presentation and PDF document from the meeting and handouts from Mattingly Ford.",
      title: "View the Presentation",
      url: "#",
      sortOrder: 2,
    },
    {
      pageSlug: "quarterly-meeting-materials",
      groupLabel: "Quarterly Meeting — March 5, 2025",
      groupNote: "",
      title: "Mattingly Ford Land Scam",
      url: "#",
      sortOrder: 3,
    },
    {
      pageSlug: "quarterly-meeting-materials",
      groupLabel: "Quarterly Meeting — October 30, 2024",
      groupNote: "Below are the links to the Quarterly Meeting presentation slides.",
      title: "Presentation Slides",
      url: "#",
      sortOrder: 4,
    },
  ]);

  // ── Recommendations For Marketing Materials (grouped by type) ─
  await db.insert(resourceLinks).values([
    {
      pageSlug: "recommendations-for-marketing-materials",
      groupLabel: "Business Cards",
      title: "The Personal Marketing Company",
      url: "https://www.tpmco.com/",
      sortOrder: 0,
    },
    {
      pageSlug: "recommendations-for-marketing-materials",
      groupLabel: "For Sale Signs",
      title: "Lowen Signs",
      url: "https://www.lowensign.com/",
      sortOrder: 1,
    },
    {
      pageSlug: "recommendations-for-marketing-materials",
      groupLabel: "For Sale Signs",
      title: "Fast Signs",
      url: "https://www.fastsigns.com/",
      sortOrder: 2,
    },
  ]);

  // ── Book a Conference Room ──────────────────────────────────
  await db.insert(pageContent).values([
    {
      pageSlug: "book-a-conference-room",
      key: "intro",
      value:
        "Need a room for a client meeting or a training? Reserve one of the Lifstyl conference rooms below.",
    },
    {
      pageSlug: "book-a-conference-room",
      key: "bookingUrl",
      value: "https://lifstyl.skedda.com/",
    },
  ]);

  // ── Open House Showcase (new page) ──────────────────────────
  await db.insert(pageContent).values([
    {
      pageSlug: "open-house-showcase",
      key: "intro",
      value:
        "Biweekly, we do a showcase on our social media highlighting the open houses taking place during the weekend. Information is pulled from FlexMLS unless you fill out the Google Form with the corrected information.",
    },
    // PLACEHOLDER: set the real Open House Showcase Google Form URL via /admin.
    {
      pageSlug: "open-house-showcase",
      key: "formUrl",
      value: "https://forms.gle/REPLACE_WITH_OPEN_HOUSE_FORM",
    },
  ]);

  console.log("✓ Seed complete.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
