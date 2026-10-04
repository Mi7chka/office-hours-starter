/* Week 3 sample data: the first screen of a made-up home page for a made-up company. No real people.
   The words on the "before" page, the facts and the prompt are the ones used in Session 3.
   The rating, the review count and the review are made up too. On a real site, use real ones or none. */
window.OH_SAMPLE = window.OH_SAMPLE || {};
window.OH_SAMPLE.homepage = {
  // What every visitor is asking before they scroll.
  questions: ["What do they do?", "Is it for me?", "What do I do next?"],

  // The "before" first screen. Weak on purpose: a welcome, a history line, a small link, no phone number.
  before: {
    logo: "GREENLINE", tagline: "QUALITY · INTEGRITY · SERVICE",
    headline: "Welcome to Our Website",
    sub: "Family owned and operated since 2009. We are passionate about quality, committed to excellence and dedicated to exceeding your expectations.",
    link: "Learn More",
    below: "What was there: a welcome, a history line and a small Learn More link. Scroll down the real page and you get Our Story, Our Mission and Our Values. What We Do comes last, and the phone number is in the small print at the very bottom."
  },

  // The facts the rewrite starts from. Type over them with your own business.
  facts: {
    name: "Greenline Landscaping",
    what: "Lawn care, hedge trimming and paver patios",
    who: "homeowners",
    where: "Cedar Hollow",
    proof: "4.9 stars from 132 Google reviews",
    action: "Get a free quote",
    other: "Family owned since 2009. Free site visit, then a written quote.",
    phone: "555-0100"
  },
  fields: [
    { key: "name", label: "Business name", hint: "The name on the truck" },
    { key: "what", label: "What you do", hint: "In the words a customer would type into Google" },
    { key: "who", label: "Who it is for", hint: "homeowners, restaurants, dentists, new parents" },
    { key: "where", label: "Where", hint: "Your town or your county" },
    { key: "proof", label: "One piece of proof", hint: "Your real rating and review count. None yet? Leave it empty" },
    { key: "action", label: "The one action you want", hint: "A verb on a button: Get a quote, Book a time, Call now" },
    { key: "other", label: "Anything else that is true (optional)", hint: "How long you have done it, how a first visit works" },
    { key: "phone", label: "Phone number for the top of the page (optional)", hint: "Big enough to tap with a thumb" }
  ],
  // Shown under the proof line on the new page, only while the proof is still Greenline's own.
  review: "\"Showed up on time, yard looks great, fair price.\" Sam K., Cedar Hollow",

  prompt: "You write the top of a home page for a small local business.\nWrite 3 headlines, each 10 words or fewer. Each one says what we do, who it is for and where. Under each, add one supporting line of 15 words or fewer.\nRules: plain words a customer would use. Use only the facts below. Do not invent numbers, reviews or awards. No slogans.\nGood example: \"Roof repair for Maple Hill homeowners.\"\n\nFacts:",

  // The sample answer. The third one adds a number that is not in the facts, on purpose, so there is something to catch.
  answer: "1. Lawn care and patios for Cedar Hollow homeowners\nMowing, hedges and patios. Free site visit, written quote.\n\n2. Cedar Hollow lawn care, hedge trimming and paver patios\nFamily owned since 2009. Free site visit, then a written quote.\n\n3. The lawn and patio crew Cedar Hollow homeowners trust\nTrusted by more than 500 local families since 2009. 4.9 stars on Google.\n\nAll three use only the facts you gave me.",

  // The six parts every small business site needs, each with the real tool that does it.
  parts: [
    { job: "A headline that says it", tool: "Your home page", how: "What you do, who it's for and where. On a phone, before anyone scrolls." },
    { job: "Proof from real customers", tool: "Google Business Profile", how: "The real rating, one real review, photos of your own work." },
    { job: "One call to action", tool: "Calendly, or your quote form", how: "One button, repeated down the page: book a time, or open the quote form." },
    { job: "A form that goes somewhere", tool: "HubSpot, Zoho CRM or Google Sheets", how: "Every lead lands in a CRM, or at least in Google Sheets. Never only in an inbox." },
    { job: "Speed on a phone", tool: "PageSpeed Insights", how: "Google's free speed test. Paste in your address and read the phone result, not the desktop one." },
    { job: "A way to see what happens", tool: "Google Analytics and Search Console", how: "Analytics: what visitors do on the site. Search Console: what they searched to find you." }
  ]
};
