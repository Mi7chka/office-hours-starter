/* Week 6 sample data: ten made-up leads for a made-up company. No real people.
   The same list as samples/week-6-sample-pipeline.csv. The dates are written for the class date. */
window.OH_SAMPLE = window.OH_SAMPLE || {};
window.OH_SAMPLE.pipeline = {
  classDate: "2026-11-11",
  stages: ["New", "Contacted", "Discovery", "Proposal", "Won", "Lost"],
  columns: ["Name", "Asked for", "Source", "Stage", "Last contact", "Next step", "Next step date", "Notes", "Email", "Phone"],
  leads: [
    { id: 1, name: "Angela Morris", asked: "Retaining wall on the front slope, two options", source: "Website form", stage: "Discovery",
      last: "2026-10-30", step: "Send the written quote", date: "2026-11-04",
      notes: "Site visit done Oct 30. She wants two options: timber and stone. Measurements are in the job folder. Quote not written yet.",
      email: "angela.morris@example.com", phone: "555-0126" },
    { id: 2, name: "Colleen Ward", asked: "Spring planting plan for the front beds", source: "Partner: Northside Mulch Supply", stage: "Proposal",
      last: "2026-11-10", step: "Call after she reviews the quote", date: "2026-11-17",
      notes: "Quote sent as a Google Doc on Nov 10. She asked for a week to look it over. Call her Tuesday Nov 17.",
      email: "colleen.ward@example.com", phone: "555-0190" },
    { id: 3, name: "Derek Lund", asked: "Sprinkler system winterizing", source: "Google Business Profile", stage: "Contacted",
      last: "2026-11-02", step: "Call back with a time slot", date: "2026-11-05",
      notes: "Found us on Google and called. Prefers a phone call. Says he does not read email. Wants it done before the first hard freeze.",
      email: "derek.lund@example.com", phone: "555-0155" },
    { id: 4, name: "Greg Tanaka", asked: "Stone walkway and front steps", source: "Website form", stage: "Proposal",
      last: "2026-10-16", step: "Follow up on the written quote", date: "2026-10-23",
      notes: "Site visit Saturday Oct 10. Written quote emailed Oct 16. No reply since. Weekends are best for him.",
      email: "greg.tanaka@example.com", phone: "555-0114" },
    { id: 5, name: "Kendra Brooks", asked: "New sod for the backyard after a pool removal", source: "Website form", stage: "Contacted",
      last: "2026-10-21", step: "Answer her question about cost", date: "",
      notes: "Replied to her form the same day. She wrote back asking what sod costs per square foot. Nobody answered.",
      email: "kendra.brooks@example.com", phone: "555-0174" },
    { id: 6, name: "Marcus Oyelaran", asked: "Paver patio, about 300 square feet, plus planting along the fence", source: "Website form", stage: "Won",
      last: "2026-10-23", step: "Ask how the patio turned out and who else needs one", date: "2026-11-20",
      notes: "Signed the quote in DocuSign. Patio finished in October. Invoice sent from QuickBooks.",
      email: "marcus.oyelaran@example.com", phone: "555-0142" },
    { id: 7, name: "Renee Dubois", asked: "Weekly lawn care for a rental house", source: "Referral: Priya Raman", stage: "New",
      last: "2026-11-03", step: "", date: "",
      notes: "Priya gave her our number. She left a voicemail Nov 3. Nobody has called her back.",
      email: "renee.dubois@example.com", phone: "555-0119" },
    { id: 8, name: "Simone Okafor", asked: "Monthly grounds care for a small office building", source: "Referral: Teresa Alvarez", stage: "Discovery",
      last: "2026-11-06", step: "Site walk with the property manager", date: "2026-11-13",
      notes: "Booked through Calendly for Friday Nov 13 at 10 AM. Wants one invoice a month.",
      email: "simone.okafor@example.com", phone: "555-0109" },
    { id: 9, name: "Victor Hale", asked: "Lawn aeration and overseeding", source: "Google Business Profile", stage: "Proposal",
      last: "2026-10-28", step: "Follow up on the quote", date: "2026-10-30",
      notes: "Found us on Google and called. Quote sent Oct 26. Phone call Oct 28: he went with another company for this fall. Said to try him again in spring.",
      email: "victor.hale@example.com", phone: "555-0152" },
    { id: 10, name: "Wendy Nguyen", asked: "Holiday lights on the front of the house", source: "Email", stage: "Contacted",
      last: "2026-11-09", step: "Call her as promised", date: "2026-11-11",
      notes: "Emailed Monday Nov 9 asking if we do holiday lights. Replied the same day and promised a call on Wednesday Nov 11.",
      email: "wendy.nguyen@example.com", phone: "555-0136" }
  ],

  /* The prompt from Session 6. The page fills in who you are, today's date and which leads to draft for. */
  who: "Jordan, the owner of Greenline Landscaping, a small landscaping company",
  sign: "Jordan",
  ownWho: "the owner of a small business [say what you do]",
  ownSign: "[your first name]",
  prompt: "You are the office assistant for {who}. Today is {today}. Below is our list of leads.\n1. List every open lead whose next step date is in the past or missing.\n2. {which}, draft a follow-up email using only that lead's notes. Start each draft with a line that says DRAFT FOR and the lead's full name.\nRules: never invent a price or a date. Under 80 words each. Sound like a person, not a company. Ask one question. Sign as {sign}. If you are unsure, ask me instead of guessing.\n\nLeads:",

  /* Sample drafts, one for each lead that has gone quiet. Some are wrong on purpose, the way a real
     answer can be: Victor already said no, Angela's names a day nobody chose, Derek does not read
     email, and Renee is a referral who should hear a voice first. Greg's and Kendra's are fine. */
  drafts: {
    "Greg Tanaka": "Hi Greg,\n\nIt's Jordan from Greenline. I emailed the written quote for your stone walkway and front steps on October 16, and I wanted to make sure it reached you.\n\nIs there anything in it you would like me to change or explain?\n\nThanks,\nJordan",
    "Victor Hale": "Hi Victor,\n\nJordan from Greenline here, following up on the quote I sent for lawn aeration and overseeding. I would love to get your lawn ready before winter.\n\nWould you like me to hold a spot on the schedule for you?\n\nThanks,\nJordan",
    "Angela Morris": "Hi Angela,\n\nThank you for walking me through the front slope on October 30. I'm sorry the written quote is late. I'm pricing both options, timber and stone, and you will have it by Friday.\n\nWould you like a photo of each style next to the numbers?\n\nThanks for your patience,\nJordan",
    "Derek Lund": "Hi Derek,\n\nIt's Jordan from Greenline. I'm sorry for the slow reply about winterizing your sprinkler system. I know you want it done before the first hard freeze.\n\nWhat time of day works best for the visit?\n\nThanks,\nJordan",
    "Kendra Brooks": "Hi Kendra,\n\nIt's Jordan from Greenline. I'm sorry your question about the cost of sod went unanswered. The honest answer depends on the size of the yard and the ground the pool removal left behind, so I would rather measure than guess.\n\nCould I come by and take a look?\n\nThanks,\nJordan",
    "Renee Dubois": "Hi Renee,\n\nThank you for your voicemail, and I'm sorry nobody called you back. Priya told us you have a rental house that needs weekly lawn care.\n\nWhat is the best time to reach you?\n\nThanks,\nJordan"
  }
};
