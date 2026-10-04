/* Week 8 sample data: a made-up Friday afternoon at a made-up company (Greenline Landscaping).
   No real people. The vendor contacts are placeholders: look up the real ones inside your own accounts. */
window.OH_SAMPLE = window.OH_SAMPLE || {};
window.OH_SAMPLE.breaks = {

  /* ── Part 1 · the panicked text, what the owner knows, and the calm questions ── */
  scene: "Greenline Landscaping again. It is Friday afternoon, and Luis, the crew lead, sends the owner this text. It is what a real message looks like, and nobody can act on it yet.",
  message: {
    from: "Luis (crew lead)", to: "Jordan (owner)", sent: "Friday, 4:41 PM",
    text: "hey boss the card thing isnt working again and customers are waiting. tried it like 3 times, it just spins and then says something about connection?? mrs whitfield is standing right here and wants to pay before the weekend. worked fine this morning. what do i do"
  },
  facts: [
    "Greenline's crew of four works out of two trucks most days. Each truck carries a tablet and its own card reader. Both readers are on the same Square account.",
    "Luis's truck is at the Whitfield house this afternoon. Luis said at lunch that the phone signal out there is weak.",
    "This morning Luis's truck was at a different job across town. His reader took a card there at 10:15 AM with no trouble.",
    "Luis's tablet installed an update and restarted itself at about 12:30 PM.",
    "The other truck (Ana's) took a card payment on its own reader at 2:10 PM today with no trouble.",
    "This happened once before, earlier this month. Somebody got it working. Nobody wrote down what fixed it.",
    "There is no written backup plan for taking a payment when a reader is down.",
    "Contact for the support request: Jordan Reyes, owner, 555-0110, jordan@greenline-sample.example.com. Jordan can be reached until 6:00 PM today."
  ],

  /* The calm questions. `sample` is what the owner can answer from the facts above.
     The exact words are left empty on purpose: Luis only wrote "something about connection". */
  fields: [
    { id: "what", label: "What stopped working?", short: "what stopped working", hint: "The thing, in plain words",
      sample: "The card reader in Luis's truck (Square) will not take a payment" },
    { id: "words", label: "What exactly do you see? The exact words on the screen", short: "the exact words on the screen", hint: "Not \"it's broken\". Read the words off the screen, or take a photo of it.",
      sample: "" },
    { id: "when", label: "What time did it start, and what were you doing?", short: "the time it started", hint: "The time, and what you were doing right before",
      sample: "Friday afternoon, while taking a card payment at a customer's house. Luis texted at 4:41 PM." },
    { id: "who", label: "One person or everyone?", short: "one person or everyone", hint: "One device, one login, or all of them",
      sample: "One reader, with a customer waiting to pay. The other truck's reader took a card at 2:10 PM today, and both readers are on the same Square account." },
    { id: "changed", label: "What changed?", short: "what changed", hint: "An update, a new password, a card on file, a cable. It worked yesterday.",
      sample: "Two things changed since the reader last worked at 10:15 AM. The tablet installed an update and restarted at about 12:30 PM. The truck also moved to a job site with a weak phone signal." },
    { id: "repeat", label: "Can you make it happen again?", short: "whether it happens every time", hint: "Try once more, on purpose. Then stop pressing.",
      sample: "It fails every time: 3 tries, the same message each time. We have stopped retrying." },
    { id: "tried", label: "What have you already tried, in order?", short: "what you already tried", hint: "One thing at a time, in the order you tried it",
      sample: "Retried the payment 3 times. Nothing else yet." },
    { id: "contact", label: "How to reach you, and until when", short: "how to reach you", hint: "A name, a phone number, and a time",
      sample: "Jordan Reyes, owner, 555-0110, jordan@greenline-sample.example.com. Reachable until 6:00 PM today." }
  ],
  /* What Luis sends back when somebody asks him. Made-up wording, not copied from any real app. */
  reply: {
    words: "Reader not connected. Check your connection and try again.",
    when: "The first failed try was at 4:38 PM on Friday, while taking a card payment at a customer's house.",
    tried: "Retried the payment 3 times. Then opened a web page on the tablet: it loads, but slowly, with one bar of signal."
  },
  wordsMissing: "The exact words on the screen are missing. That is the first thing support will ask for. Ask for a photo of the screen, or have the words read out to you.",
  passwordNote: "One of your answers mentions a password. Saying that a password changed is fine. The password itself never goes in a support request, and real support does not need it.",
  urgency: [
    { id: "money", label: "It stopped us taking money", act: "Call now.", tag: "Urgent", line: "It stopped us taking money." },
    { id: "slow", label: "It slowed us down", act: "Deal with it today.", tag: "Today", line: "It slowed us down, and we can still work." },
    { id: "annoying", label: "It's annoying", act: "Write it in the log and fix it this week.", tag: "This week", line: "It is annoying, and nothing has stopped." }
  ],

  /* The session's prompt, its four rules, and a sample answer for when no AI chat is at hand. */
  prompt: "You are a calm support engineer helping a small landscaping company. Below is a text from a crew lead and what the owner knows.\n1. Answer five questions using only what is written: What exactly do they see? One person or everyone? What changed? Can they repeat it? What does it stop?\n2. List what to try first, in order, one step at a time.\n3. Draft a support request to the vendor, under 120 words.\nRules: ask me for anything missing. Do not guess the cause. Never ask for or include a password.\n\nMessage and facts:",
  rules: ["Ask me for anything missing.", "Do not guess the cause.", "List what to try first, in order.", "Never ask for or include a password."],
  answer: "FIVE QUESTIONS, FROM WHAT IS WRITTEN\n\n1. What exactly do they see? The reader spins, then shows a message \"about connection\". The exact words are missing. I need them from you.\n2. One person or everyone? One reader. The other truck's reader took a card at 2:10 PM today, and both readers are on the same Square account.\n3. What changed? Two things since the reader last worked at 10:15 AM. The tablet installed an update and restarted at about 12:30 PM. The truck also moved to a house where the phone signal is weak. I am listing both and naming neither as the cause.\n4. Can they repeat it? Yes. 3 tries, the same result each time. Stop retrying for now.\n5. What does it stop? Taking money. A customer is waiting to pay.\n\nWHAT TO TRY FIRST, IN ORDER\nOne step, then one test payment.\n1. Let Mrs. Whitfield go. Write her name and the amount on the job sheet and email her an invoice today.\n2. Check the signal. Move the tablet to where the signal is stronger.\n3. Restart the card reader.\n4. Restart the tablet.\nWrite down which step fixed it.\n\nSUPPORT REQUEST (DRAFT)\nSubject: One of two card readers will not take payments\n\nHello. One of our two card readers stopped taking payments on Friday afternoon. It spins, then shows this message: [EXACT WORDS NEEDED]. It failed 3 times in a row. Our second reader, on the same Square account, took a card at 2:10 PM today. The failing reader last worked at 10:15 AM. Since then its tablet installed an update at about 12:30 PM, and it moved to a job site with a weak phone signal. So far we have only retried. A customer is waiting to pay. Please contact Jordan Reyes, owner, at 555-0110 or jordan@greenline-sample.example.com, until 6:00 PM today.\n\nWHAT I NEED FROM YOU\n- The exact words on the screen.\n- The time of the first failed try.\n- Whether the tablet can open a web page right now.\n\nOne more thing. Luis wrote \"again\". This happened earlier this month and nobody wrote down what fixed it. When it is fixed this time, write down what the fix was.\n\nI did not guess the cause, and there is no password in the request.",
  /* "Did it guess the cause?" Words that usually mean an answer is guessing. */
  guessWords: ["probably", "likely", "caused by", "due to", "must be", "the culprit", "the problem is", "is to blame"],
  guessed: "Did it guess the cause? Read these lines twice:",
  noGuess: "Did it guess the cause? No guessing words found (probably, likely, caused by, due to). Read its what-changed line anyway: it should list what changed and blame nothing.",
  ownHint: "Paste the message you got, and add what you already know about it.\nLeave out anything with a password or a card number.",
  checks: "Three more things to check by eye. Did it ask you for what is missing? Did it list what to try one step at a time? Is there a password anywhere in the request?",

  /* ── Part 2 · the one-page when-it-breaks sheet, filled in for Greenline ── */
  sheet: {
    cols: ["What we depend on", "Who owns the login", "Support contact", "While it's down", "Renews"],
    widths: [16, 19, 21, 28, 16],
    hints: ["The tool", "A name, and the second person. Never a password.", "Phone, help page, status page", "What we do today", "The date, and which card pays for it"],
    top: { biz: "Greenline Landscaping", first: "Jordan Reyes (owner), 555-0110", second: "Casey Doyle (office manager), 555-0111" },
    rows: [
      ["Email (Gmail)", "Jordan Reyes holds the admin account. Second person: Casey Doyle. Two-step login is on. The backup codes are printed and in the office safe.", "SAMPLE help page: help.mail.example.com. SAMPLE phone: 555-0101", "Casey calls today's customers from the paper schedule. Quotes wait until email is back.", "Monthly, paid from the business bank card. Check that card's expiry date every January."],
      ["Website (built on WordPress)", "Jordan has an admin login. Second person: Casey, with a separate login.", "Nico Ferrand, Maple Street Web (made-up company), 555-0123, nico@maplestreetweb.example.com", "Customers can still call. Tell Nico. New quote requests come in by phone until it is back.", "Hosting renews every June. Nico sends a reminder in May."],
      ["Domain name (greenline-sample.example.com)", "Registered in the business's name, in Jordan's account. Not in the web designer's. Second person: Casey.", "NameHarbor (made-up registrar), 555-0134, support@nameharbor.example.com", "If the domain lapses, the website and the email both stop. Jordan renews it the same day.", "March 14 every year. Auto-renew is on."],
      ["QuickBooks", "Jordan holds the main login. Second person: Casey, with a separate login.", "SAMPLE help page: help.quickbooks.example.com. Bookkeeper: Helen Marsh, Lakeside Bookkeeping (made-up company), 555-0156", "Write invoices on the paper pad in the top office drawer. Enter them when it is back.", "Monthly, paid from the business bank card."],
      ["Card readers (Square), one in each truck", "Jordan holds the account. Second person: Casey. Crew leads use the tablets. They do not have the account login.", "SAMPLE phone: 555-0167. SAMPLE status page: status.square.example.com", "Do not keep the customer waiting. Write the name and the amount on the job sheet. Casey emails an invoice from QuickBooks before 6 PM the same day.", "No renewal date in this sample. Casey checks both readers and their chargers every Monday."],
      ["Office internet", "The account is in the business's name. Second person: Jordan and Casey are both allowed to call.", "Cedar Hollow Internet (made-up provider), 555-0178, account number SAMPLE-0000", "Casey's phone becomes the hotspot. Printing waits.", "The contract ends in October. Put a reminder in the calendar for September."],
      ["Phones", "Jordan is the account holder. Second person: Casey is allowed to call.", "Tri-County Mobile (made-up provider), 555-0189, account number SAMPLE-0000", "Crew leads use their personal phones. Casey calls the provider from a personal phone.", "The plan is reviewed every August."],
      ["Automation (from Session 2): when a lead fills out the quote form, save it to the leads sheet, and tell me", "It runs in Jordan's account. Second person: Casey.", "Nico Ferrand, who built it, 555-0123", "How we would notice: the notice emails stop. Casey sends a test lead on the first of every month. If it has stopped, Casey copies new leads into the sheet by hand each morning.", "Monthly, paid from the business bank card."]
    ],
    /* The rows of the blank sheet. Leave out any row your business does not need. */
    blank: ["Email (Gmail or Outlook)", "Website", "Domain name", "QuickBooks", "Square or Stripe (how we take money)", "Shopify (leave this row out if you do not sell online)", "Internet provider", "Phones", "Each automation (one row each)"],
    intro: "One page that answers \"who do we call?\" before the day you need it. One row for each tool the business cannot run without. Type in any cell to change it.",
    rule: "Passwords are never written on this page. They live in the password manager. This page says whose account it is and who to call.",
    keep: "Where to keep it: in a Google Doc, so you can open it from your phone, and one printed copy, because the day the internet is down is the day you cannot open a Google Doc.",
    printTop: [
      "How urgent is it? STOPPED TAKING MONEY: call now. SLOWED US DOWN: today. ANNOYING: write it in the log, fix it this week.",
      "Before you call anyone, write down five things. 1. What exactly do you see? The exact words, the time, what you were doing. 2. Is it one person or everyone? 3. What changed? 4. Can you make it happen again? 5. What does it stop? Then one fix at a time."
    ],
    log: ["Date", "What broke", "What fixed it", "Who fixed it"]
  },

  /* ── Part 3 · five security habits, and the scam email from Week 1's sample inbox ── */
  habitsIntro: "Five habits. None of them needs an IT department. Tick the ones that are already done in your business.",
  habits: [
    { id: "manager", label: "A password manager", text: "Use a password manager such as 1Password or Bitwarden, so you remember one long password and it remembers the rest." },
    { id: "twostep", label: "Two-step login", text: "Turn on two-step login for your email first, then your bank, QuickBooks and the account that holds your domain name, and print the backup codes." },
    { id: "phishing", label: "The three signs of phishing", text: "When a message has pressure, a link and a request for a password or a payment, do not click: go to the site the way you always do." },
    { id: "updates", label: "Updates", text: "Say yes to updates the week they appear on your phone, laptop, browser and website, and on WordPress that includes the plugins." },
    { id: "access", label: "Access off the same day", text: "Remove a person's email, logins and shared access the day they leave, the same way you would get the keys back." }
  ],
  phish: {
    intro: "This is the scam email from Week 1's sample inbox. Three signs give a message like this away: pressure, a link, and a request for a password or a payment.",
    email: "From: Account Security <security-alert@acc0unt-verify.example.net>\nSubject: URGENT: Your account is suspended\n\nWe detected unusual activity. Your business account has been suspended. Click here within 24 hours to verify your password and card number or your account will be closed.",
    signs: [
      { label: "Pressure: a deadline or a threat", words: ["urgent", "within 24 hours", "suspended", "will be closed", "immediately", "final notice", "act now", "right away", "last chance", "expires today"] },
      { label: "A link to click", words: ["click here", "click the link", "click below", "tap here", "http://", "https://", "www."] },
      { label: "A request for a password or a payment", words: ["password", "card number", "verify your", "gift card", "wire transfer", "bank details", "login code", "pay now", "payment"] }
    ],
    /* What to say for 0 signs, 1 sign, and 2 or 3 signs. */
    verdict: [
      "This simple word check found none of the three. That does not prove the message is safe. If it still feels off, call the sender on a number you already have.",
      "One sign by itself is common in ordinary email. Look at the sender's address before you click anything.",
      "Do not click. Go to the site the way you always do, or call the sender on a number you already have."
    ]
  },

  /* ── Part 4 · the 90-day plan: twelve weeks, three blocks, one take-home action from each session ── */
  plan: {
    intro: "Eight sessions is a lot. Nobody does all of it in a week. Here is the order: twelve weeks, three blocks, one thing at a time.",
    tonight: "turn on two-step login for your email and save the backup codes. Then start your sheet with two rows: your email, and how you take money.",
    keep: "Your ticks stay in this browser. Start over with the sample data, at the top of this page, clears them too, so download the plan first.",
    rule: "One thing at a time. Finish it, write down that it is done, then start the next one. If a week goes sideways, you do not start over. You pick the same item up on Monday.",
    blocks: [
      { label: "Weeks 1 to 4", theme: "The inbox job, then one automation. Sessions 1 and 2." },
      { label: "Weeks 5 to 8", theme: "The top of the home page, the search checks, one idea a week. Sessions 3, 4 and 5." },
      { label: "Weeks 9 to 12", theme: "The pipeline, the backups, the one screen, then the sheet. Sessions 6, 7 and 8." }
    ],
    steps: [
      { week: 1, block: 0, session: 1, title: "Hand off the inbox job", text: "Run the inbox prompt on 10 of your own emails, find the one it got wrong, and add a rule." },
      { week: 2, block: 0, session: 1, title: "Keep the inbox job going", text: "Run it every workday this week, and write down the one thing you retyped most." },
      { week: 3, block: 0, session: 2, title: "Write one automation as a sentence", text: "Fill out your own website form as a made-up customer, time the gap, then write: when this happens, do that, and tell me." },
      { week: 4, block: 0, session: 2, title: "Build that one automation", text: "Turn on one built-in feature in an app you already pay for, so one thing stops being retyped. Just one." },
      { week: 5, block: 1, session: 3, title: "Fix the top of your home page", text: "Hand your phone to someone for three seconds and ask what you do, then put one headline, one line of proof and one button at the top." },
      { week: 6, block: 1, session: 4, title: "Run the Google checks", text: "Search what you sell plus your town, then open your Google Business Profile: claimed, category, hours, phone." },
      { week: 7, block: 1, session: 4, title: "Check what AI says about you", text: "Ask an AI assistant who does your service in your town, and check every fact it gives." },
      { week: 8, block: 1, session: 5, title: "Start one idea a week", text: "Write down one question a customer asked this week, run the five-piece prompt on it, and schedule the best piece." },
      { week: 9, block: 2, session: 6, title: "Set up the pipeline", text: "List every open lead in one sheet with a stage, a next step and a date, send the oldest follow-up, and put a 10-minute check on your calendar every workday." },
      { week: 10, block: 2, session: 7, title: "Get the backups running, and test one", text: "Write your data map, export your customer list to a second place, then open one file from the backup on purpose." },
      { week: 11, block: 2, session: 7, title: "Put your numbers on one screen", text: "Open one dashboard you already pay for, and write down the answer you could not find." },
      { week: 12, block: 2, session: 8, title: "Finish the sheet and print it", text: "Fill in every row of your when-it-breaks sheet, save it in a Google Doc, and print one copy." }
    ]
  }
};
