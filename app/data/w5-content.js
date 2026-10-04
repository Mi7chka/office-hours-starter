/* Week 5 sample data: a made-up week at a made-up company. No real people, no real reviews, no real offers.
   The lesson, the facts, the three writing samples and the weekly routine are the ones from Session 5. */
window.OH_SAMPLE = window.OH_SAMPLE || {};
window.OH_SAMPLE.content = {
  // The idea: one real lesson from the week.
  lesson: [
    "On Tuesday a customer, Priya Raman, asked the owner on the phone:",
    "\"Is it too late to plant shrubs this fall, or should we wait for spring?\"",
    "",
    "What the owner told her:",
    "It is not too late. Fall is a good time to plant shrubs and trees around here. The soil is still warm and the air is cool, so the roots settle in before winter. The real cutoff is the ground freezing, not the date on the calendar. To stay ahead of it, our crew's last planting day this year is Saturday, November 21. After planting, water once a week until the ground freezes. Anything tender, like annual flowers, waits for spring."
  ].join("\n"),
  facts: [
    "- Company: Greenline Landscaping. Owner: Jordan Reyes. A crew of four.",
    "- Fall services: shrub and tree planting, fall cleanup, mulching.",
    "- The crew's last planting day this year: Saturday, November 21. That is the crew's date, not the date the ground freezes.",
    "- New plants get watered once a week until the ground freezes. The customer does the watering. The crew shows them how before leaving.",
    "- A site visit is free and takes about 20 minutes.",
    "- Booking page: greenline-sample.example.com/book"
  ].join("\n"),
  // Three things the owner really sent. This is how the AI learns the voice.
  samples: [
    { label: "A text to a customer", text: "Hi Dana, Jordan from Greenline. You were right to be annoyed about Tuesday. That was our mistake, not yours. Thursday at 8, and I'll be on the crew myself." },
    { label: "An email reply", text: "Thanks for asking, Marcus. Short answer: yes, we can do the patio and the fence planting together. Longer answer: I need to see the yard first, because the slope decides everything. Pick a weekend time here and I'll come look: greenline-sample.example.com/book\nJordan" },
    { label: "An old social post", text: "Mulch isn't decoration. It's a blanket. Two to three inches deep, and keep it off the trunk. That's the whole lesson. See you out there." }
  ],
  hints: {
    lesson: "One question a customer asked you this week, in their words, and what you told them. Leave out anything private about a customer.",
    facts: "A few true facts, one per line: what you sell, a date, how to book.",
    sample: "Something you really wrote, pasted as it is."
  },

  // The five pieces, in the order the prompt asks for them.
  pieces: [
    { name: "A short post", the: "the short post", heading: "POST", goes: "Instagram, Facebook or LinkedIn",
      tip: "The customer's question and your answer, in a few lines." },
    { name: "A 30-second video script", the: "the 30-second video script", heading: "VIDEO", goes: "Your phone, then your social account",
      tip: "You, on your phone, saying the same answer out loud. Read it against a clock. Thirty seconds is short." },
    { name: "A three-line email", the: "the three-line email", heading: "EMAIL", goes: "Mailchimp or HubSpot",
      tip: "To people who asked to hear from you. Three lines, one link." },
    { name: "A website answer", the: "the website answer", heading: "WEBSITE ANSWER", goes: "Your questions page",
      tip: "The question in your customer's words, answered once and kept." },
    { name: "A Google Business Profile post", the: "the Google Business Profile post", heading: "GOOGLE POST", goes: "Google Business Profile",
      tip: "A short update with a photo, where people look you up on Google." }
  ],

  prompt: [
    "You write the marketing for a small landscaping company. Below: one lesson from this week, the facts, and three samples of how the owner writes.",
    "Turn that lesson into five pieces:",
    "1. A short social post.",
    "2. A 30-second video script.",
    "3. A three-line email, with a subject.",
    "4. A website FAQ answer, with the question in the customer's words.",
    "5. A Google Business Profile post.",
    "Rules: use only the facts I gave you. No invented numbers, reviews or promises. Never name a customer. Write like the samples. End each piece with the booking link. If a fact is missing, leave it out and tell me.",
    "Layout: start each piece with its own line: PIECE 1: POST, PIECE 2: VIDEO, PIECE 3: EMAIL, PIECE 4: WEBSITE ANSWER, PIECE 5: GOOGLE POST. After the five, add a line starting LEFT OUT: that says what you left out.",
    "",
    "Material:"
  ].join("\n"),
  reshape: "Lay the five pieces out again and change nothing else. Start each piece with its own line: PIECE 1: POST, PIECE 2: VIDEO, PIECE 3: EMAIL, PIECE 4: WEBSITE ANSWER, PIECE 5: GOOGLE POST.",

  // The sample answer. One piece makes a promise that is not in the facts, on purpose. Finding it is the exercise.
  answer: [
    "PIECE 1: POST",
    "Is it too late to plant this fall? Not yet.",
    "Fall is a good time for shrubs and trees around here. The soil is still warm and the air is cool, so the roots settle in before winter.",
    "The real cutoff is the ground freezing, not the calendar. Our crew's last planting day this year is Saturday, November 21.",
    "After planting, water once a week until the ground freezes. That's the whole lesson.",
    "Pick a time and I'll come look: greenline-sample.example.com/book",
    "",
    "PIECE 2: VIDEO",
    "A customer asked me this on Tuesday.",
    "Is it too late to plant shrubs this fall, or should we wait for spring?",
    "Short answer: it's not too late. The soil is still warm and the air is cool, so the roots settle in before winter.",
    "The real cutoff is the ground freezing, not the calendar. Our crew's last planting day this year is Saturday, November 21.",
    "I'm Jordan from Greenline. Book a free site visit: greenline-sample.example.com/book",
    "",
    "PIECE 3: EMAIL",
    "Subject: Is it too late to plant this fall?",
    "Short answer: no, it's not too late.",
    "Fall is a good time for shrubs and trees here, and our crew's last planting day this year is Saturday, November 21.",
    "A site visit is free and takes about 20 minutes. Pick a time here and I'll come look: greenline-sample.example.com/book",
    "",
    "PIECE 4: WEBSITE ANSWER",
    "Is it too late to plant shrubs this fall?",
    "No. Fall is a good time to plant shrubs and trees around here. The soil is still warm and the air is cool, so the roots settle in before winter. The real cutoff is the ground freezing, not the date on the calendar. Our crew's last planting day this year is Saturday, November 21. After planting, water once a week until the ground freezes. We show you how before we leave. Anything tender, like annual flowers, waits for spring. To start, book a free site visit: greenline-sample.example.com/book",
    "",
    "PIECE 5: GOOGLE POST",
    "Last planting day: Saturday, November 21.",
    "It's not too late to plant shrubs and trees this fall. The soil is still warm, so the roots settle in before winter. Every shrub we plant is guaranteed to make it to spring.",
    "Free site visit, about 20 minutes: greenline-sample.example.com/book",
    "",
    "LEFT OUT: No prices, because your facts have none. I did not name the customer who asked."
  ].join("\n"),

  // "Which one is wrong?" The first follow-up from the session, and the sample fix for the planted weak piece.
  weakIntro: "Do not ask whether they are good. Ask which one is wrong. Watch for the usual suspects: a number you never gave it, a review nobody wrote, a customer's name, a word like guaranteed.",
  askWeakest: "Which one of these five is the weakest? Name one. Check each against my facts and my samples, and list anything you added that I did not give you.",
  weakest: {
    piece: 4,
    fix: [
      "PIECE 5: GOOGLE POST",
      "Last planting day: Saturday, November 21.",
      "It's not too late to plant shrubs and trees this fall. The soil is still warm and the air is cool, so the roots settle in before winter. Water once a week until the ground freezes. We'll show you how before we leave.",
      "Free site visit, about 20 minutes: greenline-sample.example.com/book",
      "WHY: I took out the guarantee. It was not in your facts, and it was a promise you never made. The watering fact is in its place."
    ].join("\n")
  },
  approveNote: "It drafts. You approve. Then it posts. Scheduling is not approving: read the whole piece in step 4 before you tick it. The test: would you say it to a customer standing in front of you, and could you prove it?",

  // The weekly routine. The minutes are a budget, not a promise.
  routine: [
    { day: "Monday", job: "Pick the idea", detail: "One question, one job or one fix from last week.", minutes: 5 },
    { day: "Tuesday", job: "Batch the drafts", detail: "All five pieces in one sitting, with AI, in your own voice.", minutes: 15 },
    { day: "Wednesday", job: "Design", detail: "One Canva template. Change the words and the photo.", minutes: 20 },
    { day: "Thursday", job: "Schedule", detail: "Read every piece, then line up next week, one a day.", minutes: 15 },
    { day: "Friday", job: "One number", detail: "How many new people got in touch this week? Write it down.", minutes: 5 }
  ],
  routineNote: "A day for each step, and a time limit for each day. The hour is a budget, not a promise. The first week runs long, because you are making the template and saving your prompt. Out of time? Post fewer pieces, not worse ones. If five small sittings do not suit you, do the whole hour on Monday. The order matters more than the days.",

  // The one number to watch. These four weeks are made up, and they prove nothing about what works.
  number: {
    label: "New people who got in touch",
    ask: "How many new people got in touch this week? Calls, forms, messages, bookings. One count, every Friday, next to what you posted.",
    honest: "The count is measured. Why it moved is your best guess, so label it that way. One week tells you nothing. Give the same routine a couple of months before you judge it.",
    log: [
      { week: "2026-10-09", count: 4, note: "The mulch post" },
      { week: "2026-10-16", count: 3, note: "Nothing posted" },
      { week: "2026-10-23", count: 5, note: "Nothing posted" },
      { week: "2026-10-30", count: 3, note: "Fall cleanup photos" }
    ]
  }
};
