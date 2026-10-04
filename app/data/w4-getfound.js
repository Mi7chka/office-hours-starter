/* Week 4 sample data: a made-up company in a made-up town. No real people.
   The five checks, the weak service page and the owner's facts are the ones from Session 4. */
window.OH_SAMPLE = window.OH_SAMPLE || {};
window.OH_SAMPLE.getfound = {
  // Who the checks look for. The class starts with Greenline, then types its own details.
  business: { name: "Greenline Landscaping", sells: "paver patios", town: "Cedar Hollow", site: "greenline-sample.example.com" },
  madeUpNote: "Greenline Landscaping is a made-up company in a made-up town. A real search will not find it, and its web address leads nowhere. In class, Mitchell looks up his own site, mitchellbconsulting.com, with the links in check 2. To run the checks for real, type your own details and press Use these details.",
  live: "mitchellbconsulting.com",

  // The five checks. "opens" names the button and what it opens: a Google search or a page on the site.
  checks: [
    { id: 1, title: "Search what you sell plus your town", minutes: 3,
      opens: [{ label: "Search Google for what I sell and my town", kind: "search" }],
      ask: "Are you on the first screen?",
      note: "Who is on the first screen? Which words did you search?",
      look: [
        "Search what you sell plus your town. Not your business name. That is what a stranger would type.",
        "Look at the first screen before you scroll. Are you on it? Who is?",
        "Results differ from person to person and from place to place. A private browser window gives a more honest look than your usual one.",
        "Write down the exact words you searched. You will search the same words again next month."
      ] },
    { id: 2, title: "See what Google has read", minutes: 2, live: true,
      opens: [{ label: "Search Google for site: and my address", kind: "site" }, { label: "Open my /sitemap.xml", kind: "sitemap" }],
      ask: "Did Google show pages from your site?",
      note: "How many pages came up? Which titles need fixing?",
      look: [
        "The word site, a colon and your web address, with no spaces, shows only pages from your site. Every result is a page Google has read.",
        "The blue line is that page's title. Titles that say only Home, Services or About are the first to fix.",
        "No results at all? Google may not have read your site yet. Google Search Console is the free tool that shows why.",
        "This is a rough look, not a full count. Search Console has the full picture.",
        "Your address followed by /sitemap.xml is the list of pages you ask search engines to read. Many website builders make it for you.",
        "Some sites also publish /llms.txt, a short plain-text summary for AI tools. It is a new practice, not an official standard, and nobody can promise an assistant will read it."
      ] },
    { id: 3, title: "Your Google Business Profile", minutes: 10,
      opens: [{ label: "Search Google for my business name", kind: "name" }],
      ask: "Is it claimed, with the category, hours and phone all true?",
      note: "What needs fixing on the listing?",
      look: [
        "Search your own business name. Is there a listing with your hours and phone number?",
        "Is it claimed? If you are not sure, look for the option to claim it as the owner.",
        "Is the category the one that names your main service?",
        "Are the hours true, holidays included?",
        "Are the name, address and phone written exactly as they are on your website?",
        "Are the photos real: your work, your crew, your storefront?",
        "When did you last ask a customer for a review? When did you last answer one?"
      ] },
    { id: 4, title: "One clear page for each service", minutes: 5,
      opens: [{ label: "Open my website", kind: "home" }],
      ask: "Does each service you sell have its own clear page?",
      note: "Which service page gets fixed first?",
      look: [
        "Open your website. Count the things you sell. Count the pages that describe them.",
        "A single Services page with a list is one page trying to answer every question.",
        "A good service page says, in plain sentences: what it is, where you do it, who it is for, and how to book.",
        "It also answers the questions customers ask on the phone, in their words.",
        "Pick the one service that earns you the most. That page gets fixed first."
      ] },
    { id: 5, title: "Ask an AI assistant", minutes: 5, question: true, opens: [],
      ask: "Did it know your business and get every fact right?",
      note: "Which fact did it get wrong?",
      look: [
        "Open ChatGPT, Claude, Gemini or Copilot and paste the question.",
        "Do not ask whether it is right. Ask which one is wrong: the hours, the phone, the services, the town.",
        "You cannot edit the assistant. Find the page or the listing it read, fix that, and check again in a few weeks."
      ] }
  ],
  dont: [
    "Do not pay anyone who promises the first position. Nobody can promise that.",
    "Do not buy reviews or links.",
    "Do not stuff a page with town names. Name the towns you really serve, once, in a sentence.",
    "Do not expect a change overnight. This takes weeks, not days. Look once a month."
  ],

  // The weak page. Its text is the "before": the hype and the missing town are the point.
  page: {
    site: "greenline-sample.example.com", path: "services",
    title: "Services", description: "", heading: "Our Services",
    text: "Welcome to our services page! At Greenline we do it all. Our passionate team of experts delivers premium outdoor living experiences tailored to your unique needs. From concept to completion, we pride ourselves on quality, excellence and customer satisfaction. No job is too big or too small. Contact us today to learn more!"
  },
  facts: [
    ["Business name", "Greenline Landscaping"],
    ["What this page is about", "paver patios and walkways, built in backyards"],
    ["Where", "Cedar Hollow and the neighboring towns"],
    ["Who it is for", "homeowners"],
    ["First step", "a free site visit at the house. Saturday visits are available."],
    ["After the visit", "a written quote"],
    ["What the job includes", "preparing the ground, laying the pavers, cleaning up when the work is done"],
    ["Can be added to the same job", "planting along a fence or a border"],
    ["How to book", "the quote request form on the website, or call 555-0100"],
    ["Office hours", "Monday to Friday, 8 AM to 5 PM"],
    ["What customers ask on the phone", "Do you work in my town? How do I get a quote? What does a patio cost?"]
  ],

  // Rule-of-thumb lengths for the sketch. Not an official limit: search engines cut by width, and it changes.
  lengths: { title: 60, description: 155 },
  lengthNote: "A rule of thumb, not an official limit: a title past about 60 characters, or a description past about 155, tends to get cut off in results. A search engine can also write its own description, so look at what really shows.",
  guessNote: "No description was written, so the search engine is left to guess. This sketch shows the first lines of the page.",

  prompt: [
    "You are helping a small landscaping company fix one web page so search engines and AI assistants can understand it. Below: the page today, then the owner's facts.",
    "Write:",
    "1. A page title with the service and the town.",
    "2. A two-sentence description.",
    "3. Three questions a customer would ask, in their own words, each with a two-sentence answer.",
    "Rules: use only the facts I gave you; do not invent reviews, awards or numbers. If a fact is missing, say so and ask me. Plain words, no hype.",
    "Layout: put each item on its own line, starting with TITLE:, DESCRIPTION:, Q1:, A1:, Q2:, A2:, Q3:, A3:. End with a line starting MISSING: for any fact you needed and did not have.",
    "",
    "Page and facts:"
  ].join("\n"),
  shapeHelp: "I could not find a title, a description and a question with its answer. Ask the AI to lay it out again on lines that start with TITLE:, DESCRIPTION:, Q1:, A1:, Q2:, A2:, Q3:, A3: and MISSING:, then paste it here.",

  // The sample answer has one line that is not in the owner's facts, on purpose. Finding it is the exercise.
  answer: [
    "TITLE: Paver Patios in Cedar Hollow | Greenline Landscaping",
    "DESCRIPTION: Paver patios and walkways in Cedar Hollow and the neighboring towns. Start with a free site visit at your house, then get a written quote.",
    "Q1: Do you build patios in Cedar Hollow?",
    "A1: Yes. We have built paver patios and walkways in backyards in Cedar Hollow and the neighboring towns for more than ten years.",
    "Q2: How do I get a quote?",
    "A2: Use the quote request form on the website or call 555-0100 to book a free site visit, and Saturday visits are available. After the visit you get a written quote.",
    "Q3: What does a patio cost?",
    "A3: You get a written quote after a free site visit at your house. The quote covers preparing the ground, laying the pavers and cleaning up when the work is done.",
    "MISSING: There is no price in your facts, so question 3 names none and points to the written quote. Tell me a price if you want one on the page."
  ].join("\n")
};
