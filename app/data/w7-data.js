/* Week 7 sample data: thirty made-up October jobs for a made-up company. No real people.
   The same rows as samples/week-7-sample-jobs-export.csv, messy on purpose: one job typed twice,
   dates written two ways, one blank amount and one customer spelled two ways. */
window.OH_SAMPLE = window.OH_SAMPLE || {};
window.OH_SAMPLE.jobsExport = {
  title: "Greenline Landscaping, October jobs (SAMPLE DATA)",
  biz: "a small landscaping company",
  rows: [
    ["Date", "Customer", "Service", "Town", "Amount (USD)", "Paid", "How they found us"],
    ["2026-10-01", "Teresa Alvarez", "Lawn care", "Fairview", "95", "Yes", "Repeat customer"],
    ["2026-10-01", "Harold Benton", "Fall cleanup", "Brookfield", "420", "Yes", "Referral"],
    ["2026-10-02", "Sam Keller", "Lawn care", "Riverton", "125", "Yes", "Google search"],
    ["2026-10-05", "Nadia Hossain", "Mulch and planting", "Oak Hollow", "860", "Yes", "Website form"],
    ["10/6/2026", "Gordon Pike", "Hedge trimming", "Fairview", "280", "Yes", "Yard sign"],
    ["10/6/2026", "Elena Marchetti", "Fall cleanup", "Riverton", "510", "No", "Referral"],
    ["2026-10-07", "Howard Ellison", "Patio and hardscape", "Riverton", "5200", "Yes", "Referral"],
    ["2026-10-08", "Priya Raman", "Lawn care", "Brookfield", "110", "Yes", "Repeat customer"],
    ["2026-10-09", "Dana Whitfield", "Hedge trimming", "Brookfield", "385", "Yes", "Referral"],
    ["2026-10-09", "Dana Whitfield", "Hedge trimming", "Brookfield", "385", "Yes", "Referral"],
    ["2026-10-12", "Walt Jennings", "Lawn care", "Oak Hollow", "140", "Yes", "Repeat customer"],
    ["2026-10-12", "Ben Thackeray", "Mulch and planting", "Brookfield", "1240", "Yes", "Referral"],
    ["10/13/2026", "Joanne Fitch", "Fall cleanup", "Oak Hollow", "465", "Yes", "Google search"],
    ["10/14/2026", "Irene Castillo", "Hedge trimming", "Riverton", "310", "Yes", "Repeat customer"],
    ["2026-10-15", "Teresa Alvarez", "Lawn care", "Fairview", "95", "Yes", "Repeat customer"],
    ["2026-10-15", "Sofia Lindqvist", "Mulch and planting", "Fairview", "725", "Yes", "Referral"],
    ["2026-10-16", "Sam Keller", "Lawn care", "Riverton", "125", "Yes", "Google search"],
    ["2026-10-19", "Dev Kapoor", "Fall cleanup", "Fairview", "390", "Yes", "Website form"],
    ["10/20/2026", "Carla Mendes", "Lawn care", "Fairview", "95", "Yes", "Yard sign"],
    ["10/20/2026", "Andre Baptiste", "Mulch and planting", "Riverton", "980", "No", "Google search"],
    ["2026-10-21", "Ruth Abernathy", "Fall cleanup", "Brookfield", "", "No", "Referral"],
    ["2026-10-22", "P. Raman", "Lawn care", "Brookfield", "110", "Yes", "Repeat customer"],
    ["2026-10-23", "Marcus Oyelaran", "Patio and hardscape", "Oak Hollow", "6400", "No", "Website form"],
    ["2026-10-26", "Walt Jennings", "Lawn care", "Oak Hollow", "140", "Yes", "Repeat customer"],
    ["2026-10-26", "Grace Whitlock", "Mulch and planting", "Brookfield", "1150", "Yes", "Repeat customer"],
    ["10/27/2026", "Tom Oduya", "Fall cleanup", "Riverton", "540", "No", "Google search"],
    ["10/28/2026", "Paul Nakamura", "Hedge trimming", "Oak Hollow", "345", "No", "Google search"],
    ["2026-10-29", "Teresa Alvarez", "Lawn care", "Fairview", "95", "Yes", "Repeat customer"],
    ["2026-10-29", "Janet Osei", "Patio and hardscape", "Fairview", "4850", "Yes", "Referral"],
    ["2026-10-30", "Lillian Voss", "Fall cleanup", "Oak Hollow", "475", "Yes", "Repeat customer"]
  ],

  /* The prompt from Session 7. The page fills in the kind of business and the number of columns. */
  prompt: "You are helping the office manager of {biz}. Below is a jobs export.\n1. List every problem you find: duplicate rows, mixed date formats, blanks, names spelled more than one way.\n2. Then give me a clean table: the same {n} columns in the same order, one row per job, exact duplicate rows removed, dates as YYYY-MM-DD. Write the table as comma-separated lines with the header row first.\nRules: do not change any amount. Leave a blank amount blank. Do not add anything up. List every row you altered or removed, and why. Flag anything you are unsure of and ask me. Do not guess.\n\nExport:",

  /* A sample answer, the way a careful AI chat gives it back: the problems, every row it touched,
     what it is unsure of, then the clean table. Row numbers count the jobs, not the header. */
  answer: [
    "PROBLEMS I FOUND",
    "1. A duplicate row. Dana Whitfield, Hedge trimming, Brookfield, 385, on 2026-10-09 is in the export twice (rows 9 and 10).",
    "2. Mixed date formats. 8 rows write the date as month/day/year (10/6/2026). The rest use YYYY-MM-DD.",
    "3. A blank amount. Row 21, Ruth Abernathy, Fall cleanup, has no amount.",
    "4. A name spelled two ways. Priya Raman (row 8) and P. Raman (row 22) are both Lawn care in Brookfield.",
    "",
    "ROWS I ALTERED OR REMOVED, AND WHY",
    "- Row 10: removed. It is an exact copy of row 9.",
    "- Rows 5, 6, 13, 14, 19, 20, 26 and 27: the date is rewritten as YYYY-MM-DD. Nothing else in those rows changed.",
    "- Row 21: not altered. The amount is blank and I left it blank.",
    "- I did not change any amount, and I did not add anything up.",
    "",
    "WHAT I AM UNSURE OF",
    "- Are Priya Raman and P. Raman the same customer? I left both spellings as they are. Tell me and I will make them match.",
    "- Row 21 has no amount. I cannot know it from the export. Can you look it up?",
    "",
    "CLEAN TABLE",
    "Date,Customer,Service,Town,Amount (USD),Paid,How they found us",
    "2026-10-01,Teresa Alvarez,Lawn care,Fairview,95,Yes,Repeat customer",
    "2026-10-01,Harold Benton,Fall cleanup,Brookfield,420,Yes,Referral",
    "2026-10-02,Sam Keller,Lawn care,Riverton,125,Yes,Google search",
    "2026-10-05,Nadia Hossain,Mulch and planting,Oak Hollow,860,Yes,Website form",
    "2026-10-06,Gordon Pike,Hedge trimming,Fairview,280,Yes,Yard sign",
    "2026-10-06,Elena Marchetti,Fall cleanup,Riverton,510,No,Referral",
    "2026-10-07,Howard Ellison,Patio and hardscape,Riverton,5200,Yes,Referral",
    "2026-10-08,Priya Raman,Lawn care,Brookfield,110,Yes,Repeat customer",
    "2026-10-09,Dana Whitfield,Hedge trimming,Brookfield,385,Yes,Referral",
    "2026-10-12,Walt Jennings,Lawn care,Oak Hollow,140,Yes,Repeat customer",
    "2026-10-12,Ben Thackeray,Mulch and planting,Brookfield,1240,Yes,Referral",
    "2026-10-13,Joanne Fitch,Fall cleanup,Oak Hollow,465,Yes,Google search",
    "2026-10-14,Irene Castillo,Hedge trimming,Riverton,310,Yes,Repeat customer",
    "2026-10-15,Teresa Alvarez,Lawn care,Fairview,95,Yes,Repeat customer",
    "2026-10-15,Sofia Lindqvist,Mulch and planting,Fairview,725,Yes,Referral",
    "2026-10-16,Sam Keller,Lawn care,Riverton,125,Yes,Google search",
    "2026-10-19,Dev Kapoor,Fall cleanup,Fairview,390,Yes,Website form",
    "2026-10-20,Carla Mendes,Lawn care,Fairview,95,Yes,Yard sign",
    "2026-10-20,Andre Baptiste,Mulch and planting,Riverton,980,No,Google search",
    "2026-10-21,Ruth Abernathy,Fall cleanup,Brookfield,,No,Referral",
    "2026-10-22,P. Raman,Lawn care,Brookfield,110,Yes,Repeat customer",
    "2026-10-23,Marcus Oyelaran,Patio and hardscape,Oak Hollow,6400,No,Website form",
    "2026-10-26,Walt Jennings,Lawn care,Oak Hollow,140,Yes,Repeat customer",
    "2026-10-26,Grace Whitlock,Mulch and planting,Brookfield,1150,Yes,Repeat customer",
    "2026-10-27,Tom Oduya,Fall cleanup,Riverton,540,No,Google search",
    "2026-10-28,Paul Nakamura,Hedge trimming,Oak Hollow,345,No,Google search",
    "2026-10-29,Teresa Alvarez,Lawn care,Fairview,95,Yes,Repeat customer",
    "2026-10-29,Janet Osei,Patio and hardscape,Fairview,4850,Yes,Referral",
    "2026-10-30,Lillian Voss,Fall cleanup,Oak Hollow,475,Yes,Repeat customer"
  ].join("\n"),

  /* The data map from the session's checklist: one home for each, and who holds the login.
     The boxes start empty. These are hints, not answers. */
  map: [
    { key: "customers", what: "Customers", homeHint: "For example: your CRM, or one Google Sheet", whoHint: "For example: you, and one person you trust" },
    { key: "money", what: "Money", homeHint: "For example: QuickBooks", whoHint: "For example: you and the bookkeeper" },
    { key: "files", what: "Files", homeHint: "For example: Google Drive, Dropbox or OneDrive", whoHint: "For example: an email address the business controls" }
  ],

  /* The backup habit. A habit to keep, not a statistic. */
  habit: [
    { key: "three", text: "Three copies: the one I work in, plus two more." },
    { key: "two", text: "Two places: not all on one laptop, and not all in one account." },
    { key: "away", text: "One away: at least one copy is not on my computer." },
    { key: "export", text: "I exported my customer list from its home and saved the copy in a second place." },
    { key: "restored", text: "I restored one file from a backup this month." }
  ]
};
