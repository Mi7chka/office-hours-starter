/* Week 2 sample data: made-up leads for a made-up company. No real people.
   The rows, the form and the prompt are the ones used in Session 2. The sample sheet writes its times
   as "Mon 8:12 AM" with no date, so the tool places them in the current week (lastWeek: the week before).
   Two of last week's rows already have a reply, so the sheet shows both kinds of row. */
window.OH_SAMPLE = window.OH_SAMPLE || {};
window.OH_SAMPLE.leadForm = {
  formTitle: "Greenline Landscaping: request a quote (SAMPLE)",
  services: ["Lawn care (weekly)", "Fall cleanup", "Patio or hardscape", "Hedges and mulch", "Drainage", "Commercial property", "Something else"],
  sources: ["Google search", "Google Maps", "A neighbor or friend", "Saw your truck", "Facebook or Instagram", "Something else"],

  // Oldest first, the way a form's response sheet fills up. Hannah Brandt is in it twice, on purpose.
  leads: [
    { received: "Thu 12:30 PM", lastWeek: true, repliedAfterMin: 95, name: "Aisha Karim", email: "aisha.karim@example.com", phone: "555-0128", service: "Hedges and mulch",
      details: "Front hedges are overgrown and the beds need fresh mulch. It is a small yard. Could it be done in one visit?", best: "Lunchtime", found: "Google search" },
    { received: "Thu 4:15 PM", lastWeek: true, name: "Owen Fitzgerald", email: "owen.fitzgerald@example.com", phone: "", service: "Commercial property",
      details: "I manage a small office building with a parking lot and two planting beds. Looking for a seasonal contract. Please email, I am rarely at my desk.", best: "Email only", found: "Google Maps" },
    { received: "Fri 7:40 AM", lastWeek: true, repliedAfterMin: 50, name: "Mei-Lin Zhao", email: "meilin.zhao@example.com", phone: "555-0171", service: "Drainage",
      details: "Water pools by the back fence every time it rains and the lawn there is dying. Not sure what the fix is.", best: "Any day before noon", found: "Saw your truck" },
    { received: "Sat 2:03 AM", lastWeek: true, name: "Rank Booster Team", email: "sales@rank-booster.example.net", phone: "555-0199", service: "Something else",
      details: "We can put your website at the top of search results. Reply today for a free audit of your site.", best: "Anytime", found: "Something else" },
    { received: "Mon 8:12 AM", name: "Marcus Oyelaran", email: "marcus.oyelaran@example.com", phone: "555-0142", service: "Patio or hardscape",
      details: "We just bought a house and want a paver patio in the backyard, roughly 300 square feet, plus some planting along the fence. Can someone come look at it?", best: "Weekends", found: "Google search" },
    { received: "Mon 6:47 PM", name: "Hannah Brandt", email: "hannah.brandt@example.com", phone: "555-0117", service: "Lawn care (weekly)",
      details: "Corner lot, front and back. Looking for weekly mowing through the end of the season. When could you start?", best: "Weekday mornings", found: "A neighbor or friend" },
    { received: "Tue 7:05 AM", name: "Hannah Brandt", email: "hannah.brandt@example.com", phone: "555-0117", service: "Lawn care (weekly)",
      details: "Sending this again in case the first one did not go through. Weekly mowing, corner lot. Please call me.", best: "Weekday mornings", found: "A neighbor or friend" }
  ],

  // Tonight's 9 PM lead, the one the demo submits live.
  live: { name: "Tomas Reyes", email: "tomas.reyes@example.com", phone: "555-0163", service: "Fall cleanup",
    details: "Half-acre lot with a lot of oak trees. I need the leaves cleared and the beds cut back before the end of the month. What does something like this usually cost?",
    best: "Weekdays after 6 PM", found: "A neighbor or friend" },

  // The sentence builder: this tool's own sentence first, then the five automations from the session.
  examples: [
    { name: "This tool", when: "a lead fills out the form", do: "save it", tell: "tell me", levels: [1],
      apps: "In real apps: Google Forms saves each answer as a row in Google Sheets and emails you about it.",
      why: "The form is linked to a sheet and the email notice is turned on. Two settings in an app you already have. That is level 1." },
    { name: "Web form to CRM", when: "a lead fills out the form", do: "save it to the CRM", tell: "email me", levels: [1, 2],
      apps: "In real apps: HubSpot or Zoho CRM saves the lead as a contact and sends a notice to a named person.",
      why: "If the form builder is part of HubSpot or Zoho CRM, it is level 1: the form and the CRM are one product. If the form lives on WordPress, Wix or Squarespace and the CRM is somewhere else, it takes a connector. That is level 2." },
    { name: "Booking to calendar", when: "someone books a call", do: "hold the time on my calendar", tell: "tell both of us", levels: [1],
      apps: "In real apps: Calendly holds the time in Google Calendar, and the customer gets a confirmation and a reminder.",
      why: "Level 1. Look for the calendar connection in Calendly, and for the confirmation and reminder settings." },
    { name: "Paid invoice to thank-you", when: "an invoice is paid", do: "add a row to the sheet", tell: "leave me a thank-you draft", levels: [2],
      apps: "In real apps: an invoice paid in QuickBooks or Square adds a row in Google Sheets, and a thank-you draft waits in Gmail.",
      why: "Level 2. The invoice app and the sheet do not know about each other, so a connector (Zapier, Make or n8n) passes it along. Notice the word draft: it writes it, you read it, you press send." },
    { name: "New review to alert", when: "a new review comes in", do: "send it to my email", tell: "tell me the same day", levels: [1, 2],
      apps: "In real apps: a new review on your Google Business Profile sends an alert to you, or to Slack.",
      why: "Google can already email you about new reviews, so start at level 1. If you want it to land in Slack where the whole team sees it, that takes a connector: level 2." },
    { name: "Missed follow-up to task", when: "a lead gets no reply for two days", do: "make a task", tell: "put my name on it", levels: [1],
      apps: "In real apps: your CRM's task list shows the name and the next step.",
      why: "Level 1 in many CRMs. Look for task reminders or workflow rules. This one is the safety net: it catches the 9 PM lead when everything else has failed." }
  ],
  levels: [
    { name: "Level 1: built in", detail: "A feature inside an app you already pay for. Often a setting nobody turned on." },
    { name: "Level 2: a connector", detail: "Zapier, Make or n8n sits between two apps and passes things along." },
    { name: "Level 3: custom built", detail: "Software written for your business. Only when the connector version cracks." }
  ],

  prompt: "You are the office assistant for Greenline Landscaping, a small landscaping company. Below is one new lead from our website form: a header row, then the lead.\n1. Draft a reply to this person, friendly and direct, under 90 words.\n2. Thank them, repeat what they asked for in one line, and ask one question that helps us plan a site visit.\n3. Under the draft, write a one-line task for the owner with a due date.\nRules: never quote a price. Never promise a date. Use only what is in the row. If something is missing, ask me instead of guessing.\n\nNew lead:",

  // The sample answer for Tomas Reyes. One line in it breaks a rule, on purpose, so there is something to catch.
  answer: "DRAFT REPLY\n\nHi Tomas,\n\nThank you for asking Greenline Landscaping about a fall cleanup. You have a half-acre lot with a lot of oak trees, and you want the leaves cleared and the beds cut back. I can't give you a cost until we have seen the lot. We will have it done before the end of the month. Which weekday evening after 6 PM works for a short site visit?\n\nGreenline Landscaping\n\nTASK FOR THE OWNER\nCall Tomas Reyes after 6 PM tomorrow about a site visit for the fall cleanup. Due: tomorrow.\n\nI did not quote a price. The row has no street address. Do you want me to ask him for it?",

  // The four rules of the prompt, as things a person ticks after reading the draft.
  checks: [
    "It does not quote a price.",
    "It does not promise a date.",
    "Everything in it comes from the row.",
    "Where something was missing, it asked instead of guessing."
  ],

  // What the demo produces, and who typed each part.
  whoTyped: [
    ["Form submitted", "Tomas asks for a fall cleanup, a little after 9 PM", "The customer, once"],
    ["Row in the sheet", "Name, email, phone, request and the time", "Nobody"],
    ["Notice to the owner", "\"New quote request\" appears at the top of the sheet", "Nobody"],
    ["Draft reply", "Thanks him, repeats the request, asks one question", "The AI. Not sent"],
    ["Task for the owner", "Call Tomas after 6 PM tomorrow about a site visit", "The AI"],
    ["Sent to the customer", "Nothing, until a person reads the draft", "You"]
  ]
};
