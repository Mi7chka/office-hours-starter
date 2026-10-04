/* The season, and the sample business every screen uses. Plain data, no logic.
   pieces   = the eight pieces of the command center, one a week (version 2 of the class).
   sessions = the eight tools from version 1. They live on as the Toolbox, and the game is built on them. */
window.OH_COURSE = {
  series: "Wednesday Office Hours",
  season: "Build a Command Center together",
  when: "Wednesdays, 9:00 PM Eastern",
  subscribe: "https://mitchellbconsulting.com/office-hours",
  paidUrl: "https://mitchellbconsulting.com/command-center",
  business: { name: "Greenline Landscaping", owner: "Jordan Reyes", town: "Cedar Hollow", phone: "555-0100", note: "A made-up company. No real people." },

  /* The six steps every piece goes through, in this order. */
  steps: [
    { name: "Design", makes: "A design note", line: "Who uses it, the one question it answers, what is on it, what done means." },
    { name: "Prompt", makes: "The build prompt", line: "Written from a template: role, context, the design note, the rules, what to hand back." },
    { name: "Review", makes: "A reviewed build", line: "Read it against the design note. Find the one thing it got wrong." },
    { name: "Test", makes: "Three checks, passed", line: "Written before the build, run with sample data." },
    { name: "Ship", makes: "A runbook line", line: "The step, the sign it worked, how to undo it." },
    { name: "Log", makes: "One change log line", line: "What changed and why, plus a decision when a choice was made." }
  ],

  /* file = the fixed file name. The piece is pieces/<file>.js and its sample data is app/data/<file>.js. */
  pieces: [
    { week: 1, date: "2026-10-07", short: "The blueprint", focus: "Design", title: "The blueprint: design it before you build it", piece: "The Today page", nav: "Today", file: "week-1-today", icon: "☀",
      promise: "Leave with a project folder, a rules file for your AI, and a Today page that opens with a double-click.",
      paid: "the whole command center, fitted to your business in 24 to 48 hours" },
    { week: 2, date: "2026-10-14", short: "The board", focus: "Requirements", title: "Tasks and the board: say what done means", piece: "The board and the change log", nav: "Board", file: "week-2-board", icon: "☑",
      promise: "Put every open task on one board where each card says what done means and who does each step.",
      paid: "a board where dropping a ticket starts an agent" },
    { week: 3, date: "2026-10-21", short: "Email", focus: "Prompting", title: "Email: the short list only you can act on", piece: "The email short list", nav: "Email", file: "week-3-email", icon: "✉",
      promise: "Run an inbox review that sorts everything and hands you the short list, with drafts to check. It never sends.",
      paid: "the Email agent that runs by itself morning and afternoon and keeps the phishing and unsubscribe lists" },
    { week: 4, date: "2026-10-28", short: "The pipeline", focus: "Review", title: "The pipeline: every deal gets a next step", piece: "The pipeline", nav: "Pipeline", file: "week-4-pipeline", icon: "⇉",
      promise: "Put every lead on one board with a next step and a date, and learn to check what the AI built before you trust it.",
      paid: "a live CRM connection and the follow-up agent that finds quiet deals for you" },
    { week: 5, date: "2026-11-04", short: "Your website", focus: "Testing", title: "Your website talks to your Command Center", piece: "Website inquiries and the website tab", nav: "Website", file: "week-5-website", icon: "⌂",
      promise: "Bring website inquiries into your pipeline with their source, and test a build with three checks you wrote first.",
      paid: "the form landing in the pipeline by itself, and the website, ad and search numbers pulled onto one page on a schedule" },
    { week: 6, date: "2026-11-11", short: "Content", focus: "Integration", title: "Canva and the content calendar", piece: "The content calendar and the posts board", nav: "Content", file: "week-6-content", icon: "✎",
      promise: "Plan a month of posts on one calendar and make a post graphic from your own Canva template.",
      paid: "the Content agent that plans the month and drafts in your voice" },
    { week: 7, date: "2026-11-18", short: "The day plan", focus: "Release", title: "The day plan: one thing first", piece: "Plan my day and the day page", nav: "Day plan", file: "week-7-day-plan", icon: "◔",
      promise: "Start each morning with a plan that reads your board, your pipeline, your email and your calendar.",
      paid: "the Day Plan agent that writes the plan before you sit down" },
    { week: 8, date: "2026-11-25", short: "Keep it running", focus: "Maintain", title: "Keep it running: backups and what comes next", piece: "The owner summary, the knowledge page, the backup and the roadmap", nav: "Summary", file: "week-8-keep-running", icon: "⚙",
      promise: "Back it up, mark your numbers honestly, and leave with a 90-day roadmap: build next, or hire out.",
      paid: "team sign-in, hosting for a team, the scheduler and the agents" }
  ],

  /* Version 1: the eight tools. Now the Toolbox. The game reads this list, so it stays as it was. */
  sessions: [
    { week: 1, date: "2026-10-07", title: "AI at work: 5 jobs to hand off this week", tool: "Inbox to task list", icon: "✉" },
    { week: 2, date: "2026-10-14", title: "Automations: make the apps you already pay for talk to each other", tool: "Lead form to follow-up", icon: "⇄" },
    { week: 3, date: "2026-10-21", title: "Your website has 3 seconds: build a site that brings in work", tool: "The 3-second home page test", icon: "⏱" },
    { week: 4, date: "2026-10-28", title: "Get found: SEO for Google and for AI answers", tool: "The get-found checks", icon: "⌕" },
    { week: 5, date: "2026-11-04", title: "Marketing that runs every day without eating your week", tool: "One idea, five pieces", icon: "✎" },
    { week: 6, date: "2026-11-11", title: "Leads to paid work: a follow-up system and a CRM you'll actually use", tool: "The pipeline board", icon: "☰" },
    { week: 7, date: "2026-11-18", title: "Where your data lives: spreadsheets, databases, backups, and one screen to see it all", tool: "From a messy export to one screen", icon: "▦" },
    { week: 8, date: "2026-11-25", title: "When it breaks: tech support, security basics, and your 90-day plan", tool: "The when-it-breaks sheet and your 90-day plan", icon: "⚒" }
  ]
};
