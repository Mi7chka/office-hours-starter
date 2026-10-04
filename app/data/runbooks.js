/* Built by tools/build_runbooks.py from runbooks/session-NN.json and runbooks/toolbox/session-NN.json. Do not edit by hand. */
window.OH = window.OH || {};
window.OH.runbooks = {
 "1": {
  "session": 1,
  "week": 1,
  "module": "week-1-today",
  "title": "Build together: the Today page",
  "minutes": 15,
  "goal": "Take the first piece of the command center through the six steps: design, prompt, review, test, ship, log. You leave with a project folder, a rules file for your AI, and a Today page that opens with a double-click.",
  "you_need": [
   "The class starter folder, unzipped",
   "The Claude app or Claude Code",
   "Nothing to install"
  ],
  "steps": [
   {
    "at": "0:00",
    "min": 2,
    "do": "Design: Double-click Launch in the starter folder, then press Start the six steps.",
    "see": "The home screen with eight pieces that say Not built yet, then the build page for week 1.",
    "tip": "This folder is your project folder. Keep it somewhere you will find it, such as Documents."
   },
   {
    "at": "0:02",
    "min": 2,
    "do": "Design: Under step 1, open The rules file for the AI and read the rules out loud.",
    "see": "It drafts and a person sends. It says what it is unsure about. It never invents a number. It never sends, pays, posts or deletes.",
    "tip": "The same rules sit in your folder as CLAUDE.md. Add one rule of your own there after class."
   },
   {
    "at": "0:04",
    "min": 2,
    "do": "Design: Read the design note: who uses it, the one question it answers, what is on it, what done means.",
    "see": "Four short answers. The question is: what needs me today?",
    "tip": "Design comes before the prompt. If you cannot answer the four questions, the AI cannot either."
   },
   {
    "at": "0:06",
    "min": 3,
    "do": "Prompt: Press Copy the build prompt, paste it into the Claude app or Claude Code, and send. Save the file it makes as week-1-today.js in the pieces folder, and say yes to replace.",
    "see": "Your computer asks whether to replace week-1-today.js. That question means the name is right.",
    "tip": "In the Claude app you save the file yourself. In Claude Code it writes the file for you."
   },
   {
    "at": "0:09",
    "min": 2,
    "do": "Review: Press I saved the file. Look again. Then read the Today page against the design note and find the one thing it got wrong.",
    "see": "The Today page, with the one thing first at the top and Jordan's list under it.",
    "tip": "Do not ask whether it is right. Ask which one thing is wrong."
   },
   {
    "at": "0:11",
    "min": 2,
    "do": "Test: Press How it was built, go to step 4, and run the three checks with the sample business. Tick each one you saw.",
    "see": "Three ticks, and the words Three checks passed.",
    "tip": "The checks were written before the build. That is what makes them a test."
   },
   {
    "at": "0:13",
    "min": 1,
    "do": "Ship: In step 5, type your runbook line: the step, the sign it worked, how to undo it.",
    "see": "Three short answers, saved as you type.",
    "tip": "For example: each morning I write today's list. The first thing is at the top. Start over puts it back."
   },
   {
    "at": "0:14",
    "min": 1,
    "do": "Log: In step 6, type what changed and why, then press Add to my change log.",
    "see": "The line under the button says your change log has 1 line.",
    "tip": "Next Wednesday we build the board, and the page that shows this log."
   }
  ],
  "real_life": [
   "Tomorrow morning: press My business on the home screen, open Today, and write your own list. The first line is the one thing first.",
   "Open CLAUDE.md in your project folder and add one rule that is true only for your business.",
   "Write down three things you retype every week. Those are the next pieces worth building."
  ],
  "if_it_breaks": [
   "The AI is slow, or the page does not show after you saved the file: take the finished week-1-today.js from the pieces folder of the complete project, save it in your pieces folder, and keep going. The lesson is the six steps, not the typing.",
   "Your computer did not ask to replace the file: the name is not exactly week-1-today.js, or it is not in the pieces folder. Rename it, move it, and press Look again.",
   "The page says the file needs a fix: copy that sentence to the AI and ask for the whole file again. Start over with the sample data puts the Today page back."
  ]
 }
};
window.OH.toolRunbooks = {
 "1": {
  "session": 1,
  "week": 1,
  "module": "w1-inbox",
  "title": "Follow along: your inbox becomes a task list",
  "minutes": 15,
  "goal": "Sort a real inbox into four piles with AI, catch the one it gets wrong, and leave with a to-do list you can paste into a spreadsheet.",
  "you_need": [
   "This demo, open in a browser",
   "An AI chat you are signed in to (Claude or ChatGPT)",
   "Optional: 10 of your own emails"
  ],
  "steps": [
   {
    "at": "0:00",
    "min": 1,
    "do": "Open the demo (double-click Launch) and click Week 1.",
    "see": "Greenline Landscaping's inbox: 12 emails in a table.",
    "tip": "Everything here is made up. Your own data never leaves your browser."
   },
   {
    "at": "0:01",
    "min": 2,
    "do": "Read the inbox like an owner. Count the emails that truly need you today.",
    "see": "Most people count three or four out of twelve.",
    "tip": "Say your number out loud or type it in the chat before going on."
   },
   {
    "at": "0:03",
    "min": 2,
    "do": "Go to step 2, Give the AI the job. Find the job, the rules and the check inside the prompt.",
    "see": "Sort into four piles; never quote a price; never promise a date; ask if unsure.",
    "tip": "This is the new-hire rule. Change one line so it sounds like your business."
   },
   {
    "at": "0:05",
    "min": 3,
    "do": "Press Copy the prompt and the emails. Paste into your AI chat and send. Copy its whole answer.",
    "see": "Four headings (REPLY TODAY, CAN WAIT, FYI, JUNK) and a TASKS list.",
    "tip": "No AI chat handy? Use the button that loads the sample answer."
   },
   {
    "at": "0:08",
    "min": 2,
    "do": "Paste the answer into step 3 and press Use this answer.",
    "see": "Four piles appear, each email as a card.",
    "tip": "If the piles do not appear, ask the AI to start each line with EMAIL and its number."
   },
   {
    "at": "0:10",
    "min": 2,
    "do": "Which one is wrong? Look in FYI for the QuickBooks notice about three overdue invoices. Move it. Then add a rule about money owed to you.",
    "see": "The moved card turns amber, and your rule appears in the prompt.",
    "tip": "The AI could not know what a late invoice costs you until you told it."
   },
   {
    "at": "0:12",
    "min": 2,
    "do": "Scroll to Your list for today. Tick one task done, then press Copy for Google Sheets and paste it into a blank sheet.",
    "see": "A table: task, who, due.",
    "tip": "Every task starts with a verb. That is the difference between an inbox and a list."
   },
   {
    "at": "0:14",
    "min": 1,
    "do": "Click Home.",
    "see": "The first number on your one screen: emails that need a reply today.",
    "tip": "Next Wednesday the second tile lights up: a lead form that fills the list by itself."
   }
  ],
  "real_life": [
   "Tomorrow morning: press Use my own emails and paste ten of yours, with a blank line between them. Leave out anything with a password or a card number.",
   "Add one rule that is true only for your business, such as which customers always come first.",
   "Save your finished prompt somewhere you will find it. It is now your inbox instruction."
  ],
  "if_it_breaks": [
   "The AI is slow or down: load the sample answer and keep going. The lesson is the checking, not the typing.",
   "The piles look wrong after pasting: the answer needs each line to start with EMAIL and its number. Ask the AI to redo it in that shape.",
   "Start over with the sample data puts everything back."
  ]
 },
 "2": {
  "session": 2,
  "week": 2,
  "module": "w2-leads",
  "title": "Follow along: one lead, from the form to the follow-up",
  "minutes": 15,
  "goal": "Submit a quote form, watch the lead land as a row with a notice to the owner, then draft the follow-up with AI and catch the line that breaks a rule. Nothing is sent to anybody.",
  "you_need": [
   "This demo, open in a browser",
   "An AI chat you are signed in to (Claude or ChatGPT)",
   "Optional: the rows from your own leads sheet"
  ],
  "steps": [
   {
    "at": "0:00",
    "min": 1,
    "do": "Open the demo (double-click Launch) and click Week 2.",
    "see": "The leads sheet: 7 rows, with three numbers above it.",
    "tip": "Everything here is made up. Your own data never leaves your browser."
   },
   {
    "at": "0:01",
    "min": 2,
    "do": "Read the sheet like an owner. Find the longest wait, find the row marked Duplicate, then press Not a lead on the Rank Booster Team row.",
    "see": "Hannah Brandt is in the sheet twice, and the junk row is crossed out. Waiting for a first reply drops from 4 to 3.",
    "tip": "The form worked and the sheet worked. The leads still sat there, waiting for a person."
   },
   {
    "at": "0:03",
    "min": 2,
    "do": "Go to step 2, A new lead comes in. Press Fill in tonight's 9 PM lead, then press Submit the form.",
    "see": "A green Notice to the owner at the top of the sheet, and Tomas Reyes as a new amber row with the time.",
    "tip": "That is all three parts. The form is the trigger, the row is the action, the notice is the \"and tell me\"."
   },
   {
    "at": "0:05",
    "min": 2,
    "do": "Go to step 3, Say it in one sentence. Press Paid invoice to thank-you, read the sentence out loud, then press the level you think it is.",
    "see": "One sentence with a when, a do and a tell me, and a note that says whether your level fits.",
    "tip": "Start at the lowest level that does the job. Then type your own sentence over this one."
   },
   {
    "at": "0:07",
    "min": 3,
    "do": "Go to step 4, Draft the follow-up. Press Copy the prompt and the new lead. Paste into your AI chat and send. Copy its whole answer.",
    "see": "A short reply to Tomas, and under it a one-line task for the owner.",
    "tip": "No AI chat handy? Use the button that loads the sample answer."
   },
   {
    "at": "0:10",
    "min": 2,
    "do": "Paste the answer into step 5 and press Use this answer. Then ask which part is wrong. He asked what it costs, and he named a deadline.",
    "see": "The draft and the task side by side, with a note pointing at any price or any day in the draft.",
    "tip": "In the sample answer, one line promises a date. The rule said never promise a date."
   },
   {
    "at": "0:12",
    "min": 2,
    "do": "Tick the four checks and add one rule to the prompt. Then press Mark Tomas Reyes as replied, as if you had fixed the draft and sent it yourself.",
    "see": "You are back at the top of the sheet, and his row says Replied after a few minutes.",
    "tip": "It drafts. You send. The gap between \"they asked\" and \"we replied\" just got small."
   },
   {
    "at": "0:14",
    "min": 1,
    "do": "Scroll to Take it with you and press Copy for Google Sheets or Excel. Then click Home.",
    "see": "The second number on your one screen: leads waiting for a first reply.",
    "tip": "Next Wednesday the third tile lights up: the home page those leads come from."
   }
  ],
  "real_life": [
   "Be your own lead tonight. Fill out your own website form as a made-up customer and time the gap. Where did it go, who was told, and how long did it take?",
   "In step 3, write one sentence for the thing that waited longest in your business this week, and press Copy my sentence. Then turn on one built-in feature that does it, such as the notice on your form.",
   "Open Use my own leads, paste the rows from your own sheet with the header row, and press Use these rows. To build the real form in Google Forms, follow samples/week-2-google-form-setup.txt."
  ],
  "if_it_breaks": [
   "The AI is slow or down: load the sample answer and keep going. The lesson is the checking, not the typing.",
   "The task box says no task line was found: ask the AI to start that line with the word Task, then paste the answer again.",
   "Start over with the sample data puts the seven sample rows back."
  ]
 },
 "3": {
  "session": 3,
  "week": 3,
  "module": "w3-homepage",
  "title": "Follow along: the 3-second test, then a new first screen",
  "minutes": 15,
  "goal": "Fail a sample home page in three seconds, rewrite its first screen from a few plain facts with AI, catch the headline that adds something you never said, and leave with the lines to put on your own site.",
  "you_need": [
   "This demo, open in a browser",
   "An AI chat you are signed in to (Claude or ChatGPT)",
   "Your phone, with your own home page open"
  ],
  "steps": [
   {
    "at": "0:00",
    "min": 1,
    "do": "Open the demo (double-click Launch) and click Week 3.",
    "see": "A phone with a cover on it: You get three seconds with this home page.",
    "tip": "Everything here is made up. Your own data never leaves your browser."
   },
   {
    "at": "0:01",
    "min": 2,
    "do": "Press Run the 3-second test. Look at the phone until it covers itself, then answer the three questions with Yes or No.",
    "see": "Time is up on the phone, and a score under the questions. Most people get 0 of 3.",
    "tip": "Answer from memory. Leave Show the page again alone until you have."
   },
   {
    "at": "0:03",
    "min": 1,
    "do": "Press Show the page again and read what was there.",
    "see": "Welcome to Our Website, a history line and a small Learn More link. No phone number.",
    "tip": "None of it is false. It answers questions nobody has asked yet."
   },
   {
    "at": "0:04",
    "min": 2,
    "do": "Go to step 2, The facts. Read Greenline's facts, then read the formula line under them.",
    "see": "One line: what you do, who it is for, where. Then one button.",
    "tip": "Following along with your own business? Type over the facts now. Leave the proof empty if you have no reviews yet."
   },
   {
    "at": "0:06",
    "min": 3,
    "do": "Go to step 3, Give the AI the job. Press Copy the prompt and the facts. Paste into your AI chat and send. Copy its whole answer.",
    "see": "Three numbered headlines, each with one line under it.",
    "tip": "No AI chat handy? Use the button that loads the sample answer."
   },
   {
    "at": "0:09",
    "min": 2,
    "do": "Paste the answer into step 4 and press Use this answer. Read each card against the facts and find the one that added something.",
    "see": "Three cards. In the sample answer, the third one is marked Not in your facts.",
    "tip": "It drafts. You publish. A number you did not give it is a number it made up."
   },
   {
    "at": "0:11",
    "min": 2,
    "do": "Press Use headline 1, or the one that would make you pick up the phone. Then, in The new first screen, press Run the 3-second test and answer again.",
    "see": "The same company with a headline, one line of proof, one button and the phone number at the top. The score goes to 3 of 3.",
    "tip": "Fix a word in the Headline box and the phone changes as you type."
   },
   {
    "at": "0:13",
    "min": 1,
    "do": "Press Copy the new first screen and paste it into a note. Then go to Six parts every small business site needs and tick the ones your own site has.",
    "see": "Your new first screen as plain text, and your score out of six.",
    "tip": "The missing parts are your job for the week."
   },
   {
    "at": "0:14",
    "min": 1,
    "do": "Click Home.",
    "see": "The third number on your one screen: home page questions answered.",
    "tip": "Next Wednesday the fourth tile lights up: how people find that page in the first place."
   }
  ],
  "real_life": [
   "Hand your phone to someone who does not work with you. Three seconds, then take it back and ask the three questions. Write down their words, not yours.",
   "In step 2, type your own facts over Greenline's and run the prompt again. No reviews yet? Leave the proof line empty. Then pick one headline.",
   "Put the headline, one line of proof and one button on your home page in WordPress, Wix, Squarespace or Shopify. If you can't log in, send the copied lines to the person who can."
  ],
  "if_it_breaks": [
   "The AI is slow or down: load the sample answer and keep going. The lesson is the checking and the choosing, not the typing.",
   "No cards appear after you paste: the answer needs each headline numbered 1, 2 and 3 on its own line. Ask the AI to redo it in that shape.",
   "Start over with the sample data brings Greenline's facts and the first page back."
  ]
 },
 "4": {
  "session": 4,
  "week": 4,
  "module": "w4-getfound",
  "title": "Follow along: the get-found checks, then one weak page fixed",
  "minutes": 15,
  "goal": "Run three of the five get-found checks on your own business, then rewrite one weak service page from a few plain facts and catch the line the AI made up.",
  "you_need": [
   "This demo, open in a browser",
   "An AI chat you are signed in to (Claude or ChatGPT)",
   "Your business name, what you sell, your town and your website address"
  ],
  "steps": [
   {
    "at": "0:00",
    "min": 1,
    "do": "Open the demo (double-click Launch) and click Week 4.",
    "see": "Step 1, Who are we checking?, with Greenline Landscaping's details in the four boxes.",
    "tip": "Greenline is made up, so a real search will not find it. The next step swaps in your own business."
   },
   {
    "at": "0:01",
    "min": 2,
    "do": "In step 1, type your own business name, what you sell, your town and your website address. Press Use these details.",
    "see": "A green note says the checks now use your details, and the line under each button in step 2 shows your own words.",
    "tip": "Watching without a business of your own? In check 2, use the three mitchellbconsulting.com links. That is the site Mitchell looks up live."
   },
   {
    "at": "0:03",
    "min": 2,
    "do": "In check 1, press Search Google for what I sell and my town. Look at the first screen, come back, and choose Yes, No or Not sure.",
    "see": "A new tab with the search. Back in the demo, a badge on check 1 shows your answer.",
    "tip": "Type who was on the first screen in the box beside your answer. You will search the same words again next month."
   },
   {
    "at": "0:05",
    "min": 2,
    "do": "In check 2, press Search Google for site: and my address, then press Open my /sitemap.xml. Record what you saw.",
    "see": "The pages Google has read, each with its title as the blue line. Then a plain list of pages, or a page that says not found.",
    "tip": "A title that says only Home, Services or About is your first fix."
   },
   {
    "at": "0:07",
    "min": 2,
    "do": "In check 5, press Copy the question, open your AI chat, paste and send. Record whether it got every fact right.",
    "see": "An answer that names a few businesses. Yours may not be one of them.",
    "tip": "Do not ask whether it is right. Ask which one is wrong: the hours, the phone, the services, the town."
   },
   {
    "at": "0:09",
    "min": 2,
    "do": "Read Greenline's weak page in step 3. Then in step 4 press Copy the prompt and the page with its facts, paste it into your AI chat and send. Copy its whole answer.",
    "see": "In step 3, a search result titled Services with a guessed description. From the AI, lines that start with TITLE, DESCRIPTION, Q1 and A1.",
    "tip": "Find the rule in the prompt before you send it: use only the facts I gave you."
   },
   {
    "at": "0:11",
    "min": 1,
    "do": "Paste the answer into step 5 and press Use this answer.",
    "see": "Step 6 shows the search result before and after, with three question cards under it.",
    "tip": "No AI chat handy? Use the button that loads the sample answer."
   },
   {
    "at": "0:12",
    "min": 2,
    "do": "In step 7, hold each piece against the owner's facts. Choose Not from my facts for any piece with something made up, and Every fact is one I supplied for the rest.",
    "see": "The flagged row turns amber and is listed under Not from my facts.",
    "tip": "In the sample answer, question 1 says how long Greenline has been building patios. No fact says that."
   },
   {
    "at": "0:14",
    "min": 1,
    "do": "In step 8, press Copy for whoever edits the site. Then click Home.",
    "see": "The title, the description and the three questions as plain text. On Home, a new number: get-found checks done.",
    "tip": "It drafts. You publish. Checks 3 and 4 are yours to finish this week."
   }
  ],
  "real_life": [
   "This week, finish checks 3 and 4. Open your Google Business Profile and confirm it is claimed, with the category, hours and phone all true. Then count the things you sell and the pages that describe them.",
   "Pick the service that earns you the most. In step 3, press Clear the sample and type my own page, paste that page's words and a few true facts, and run the prompt.",
   "Put a reminder in your calendar to run the five checks again next month, with the same search words. This takes weeks, not days."
  ],
  "if_it_breaks": [
   "The AI is slow or down: load the sample answer in step 5 and keep going. The lesson is the checking, not the typing.",
   "The before and after does not appear: the answer needs lines that start with TITLE:, DESCRIPTION:, Q1: and A1:. Ask the AI to lay it out again in that shape.",
   "A search shows nothing, or a link says not found: that is a finding too. Greenline's links always do this, because it is made up. Start over with the sample data puts everything back."
  ]
 },
 "5": {
  "session": 5,
  "week": 5,
  "module": "w5-content",
  "title": "Follow along: one customer question becomes five pieces",
  "minutes": 15,
  "goal": "Turn one lesson from the week into a post, a video script, an email, a website answer and a Google post. Find the weakest one, fix only that one, and approve what is ready.",
  "you_need": [
   "This demo, open in a browser",
   "An AI chat you are signed in to (Claude or ChatGPT)",
   "Optional: one question a customer asked you this week, and three things you wrote yourself"
  ],
  "steps": [
   {
    "at": "0:00",
    "min": 1,
    "do": "Open the demo (double-click Launch) and click Week 5.",
    "see": "Step 1, This week's idea: a customer's question about planting in the fall, a list of facts and three writing samples.",
    "tip": "Everything here is made up. Your own words never leave your browser."
   },
   {
    "at": "0:01",
    "min": 2,
    "do": "Read step 1 like the owner. Find the crew's last planting day in the facts, then read the three writing samples out loud.",
    "see": "Saturday, November 21, and three short pieces that sound like one person.",
    "tip": "The samples are how the AI learns the voice. A text, an email and an old post are enough."
   },
   {
    "at": "0:03",
    "min": 2,
    "do": "In step 2, find the rules inside the prompt. Press Copy the prompt and the material, paste it into your AI chat and send.",
    "see": "The rules: use only the facts I gave you, no invented numbers, reviews or promises, never name a customer, write like the samples.",
    "tip": "This is the new-hire rule again: the job, the context, the rules, an example. The check is you."
   },
   {
    "at": "0:05",
    "min": 2,
    "do": "Copy the AI's whole answer, paste it into step 3 and press Use this answer.",
    "see": "Five cards in step 4, each with a word count: a post, a video script, an email, a website answer and a Google post.",
    "tip": "No AI chat handy? Use the button that loads the sample answer."
   },
   {
    "at": "0:07",
    "min": 3,
    "do": "Read the five cards. On the weakest one, press This one is weakest. In step 5, type what is wrong with it and press Copy the follow-up. Send it to the AI, paste the fixed piece back and press Replace this piece.",
    "see": "The card in step 4 shows the new text and a badge that says fixed.",
    "tip": "In the sample answer, the Google Business Profile post promises a guarantee. No fact says that."
   },
   {
    "at": "0:10",
    "min": 2,
    "do": "In step 6, tick Approve for each piece you would put your name on. Press Copy the approved pieces.",
    "see": "A badge counts the approved pieces, and only those are copied.",
    "tip": "Scheduling is not approving. Read the whole piece first."
   },
   {
    "at": "0:12",
    "min": 2,
    "do": "In step 7, tick Monday and Tuesday. In step 8, type this week's number and press Add this week.",
    "see": "20 of 60 budgeted minutes ticked off, and a new bar in the chart.",
    "tip": "The hour is a budget, not a promise. The number is measured. Why it moved is your best guess."
   },
   {
    "at": "0:14",
    "min": 1,
    "do": "Click Home.",
    "see": "A new number on your one screen: pieces approved this week.",
    "tip": "Next Wednesday: what happens when those new people get in touch."
   }
  ],
  "real_life": [
   "Tonight: press Clear the sample and type my own idea. Write down one question a customer asked you this week, in their words, with a few true facts and three things you wrote yourself. Leave out anything private about a customer.",
   "Run the prompt on it, with the word landscaping changed to your own business. Approve the best piece and schedule it for tomorrow, or set a reminder and post it by hand.",
   "On Friday, write down one number: how many new people got in touch this week. Press Clear the log first, then add your own."
  ],
  "if_it_breaks": [
   "The AI is slow or down: load the sample answer in step 3 and keep going. Step 5 has a sample fix for the Google Business Profile post too. The lesson is the checking and the approving, not the typing.",
   "The five cards do not appear: each piece has to start with its own line, PIECE 1: to PIECE 5:. Step 3 shows a line to send the AI that asks for that shape.",
   "Start over with the sample data puts everything back."
  ]
 },
 "6": {
  "session": 6,
  "week": 6,
  "module": "w6-pipeline",
  "title": "Follow along: one list of leads, and the follow-up you should not send",
  "minutes": 15,
  "goal": "Sort ten leads by next step date, see who went quiet, let AI draft three follow-ups, catch the two that should not go out, and leave with a list where every open lead has a next step and a date.",
  "you_need": [
   "This demo, open in a browser",
   "An AI chat you are signed in to (Claude or ChatGPT)",
   "Optional: your own lead list, in Google Sheets or as a CRM export"
  ],
  "steps": [
   {
    "at": "0:00",
    "min": 1,
    "do": "Open the demo (double-click Launch) and click Week 6.",
    "see": "The lead list: 10 leads, 6 gone quiet, with Today is set to November 11.",
    "tip": "Every name here is made up. Your real CRM stays closed."
   },
   {
    "at": "0:01",
    "min": 2,
    "do": "Click the Name header in the table, then click the Next step date header. Count the amber rows.",
    "see": "By name it is a phone book. By date it is a to-do list: four amber rows with a date gone by at the top, two with no date at the bottom.",
    "tip": "The two with no date worry me more. Nothing will ever remind anyone."
   },
   {
    "at": "0:03",
    "min": 2,
    "do": "Go to step 2. Check that Greg, Victor and Angela are ticked, then read the rules in the prompt out loud.",
    "see": "Today is November 11, 2026. Never invent a price or a date. Under 80 words. Sound like a person. Ask one question.",
    "tip": "The email and phone columns are not in what gets copied. The AI does not need them to write a draft."
   },
   {
    "at": "0:05",
    "min": 2,
    "do": "Press Copy the prompt and the leads. Paste into your AI chat and send. Copy its whole answer.",
    "see": "A list of the quiet leads, then three drafts that each start with DRAFT FOR and a name.",
    "tip": "No AI chat handy? In step 3, press No AI handy? Load the sample answer."
   },
   {
    "at": "0:07",
    "min": 1,
    "do": "Paste the answer into step 3, Bring the drafts back, and press Use this answer.",
    "see": "Step 4 fills with cards: each draft sits under that lead's notes.",
    "tip": "If no cards appear, ask the AI to start each draft with DRAFT FOR and the lead's name."
   },
   {
    "at": "0:08",
    "min": 3,
    "do": "Which one is wrong? Read Victor's notes, then Angela's. Press Do not send on every draft you would hold back.",
    "see": "The reason appears under the draft. With the sample answer: Victor already said no, and Angela's draft names a day that is not in her notes.",
    "tip": "Your own AI's drafts will differ. React to what is there. Greg's is the one to send."
   },
   {
    "at": "0:11",
    "min": 2,
    "do": "On Victor's card press Close this lead as Lost. On Greg's card press Mark as sent, type the next step, pick a date and press Save the next step.",
    "see": "Victor's card says a no is a good outcome. Greg's card says he has left the quiet list. The title of step 1 now says 4 gone quiet.",
    "tip": "No card for Victor? Your AI read his notes well. Set his stage to Lost in step 5 instead."
   },
   {
    "at": "0:13",
    "min": 1,
    "do": "Scroll to Where leads come from and read the bars. Then press Copy for Google Sheets or Excel and paste into a blank sheet.",
    "see": "Website form brought four of the ten leads. Your sheet has every column, with the changes you just made.",
    "tip": "Source is the one column that pays for itself."
   },
   {
    "at": "0:14",
    "min": 1,
    "do": "Click Home.",
    "see": "A new number on your one screen: leads gone quiet.",
    "tip": "Next Wednesday: where all of this data should live, and one screen to see it."
   }
  ],
  "real_life": [
   "Tonight: in step 1 open Use my own leads, paste the rows from your own sheet or CRM export with the header row first, and press Use these leads.",
   "In step 5, give every open lead a next step and a date. Then send the oldest follow-up yourself. The AI drafts it. You read it and press send.",
   "Put a 10-minute pipeline check on your calendar for every working day: open the list, sort by date, do what is due."
  ],
  "if_it_breaks": [
   "The AI is slow or down: press No AI handy? Load the sample answer and keep going. The lesson is the checking, not the typing.",
   "No draft cards after pasting: each draft has to start with a line that says DRAFT FOR and the lead's name. Ask the AI to redo it in that shape.",
   "The quiet count looks wrong: check the date next to Today is, at the top of step 1. Start over with the sample data puts everything back."
  ]
 },
 "7": {
  "session": 7,
  "week": 7,
  "module": "w7-data",
  "title": "Follow along: a messy export becomes one screen",
  "minutes": 15,
  "goal": "Find what is wrong in a 30-row jobs export, clean it without changing a single amount, explain the gap between the two totals, read the result on one screen, and write down where your own data lives.",
  "you_need": [
   "This demo, open in a browser",
   "An AI chat you are signed in to (Claude or ChatGPT)",
   "Optional: one export from an app you already pay for, on a copy"
  ],
  "steps": [
   {
    "at": "0:00",
    "min": 1,
    "do": "Open the demo (double-click Launch) and click Week 7.",
    "see": "Greenline's October jobs: 30 rows, and under the table the amount column adds up to 27,040.",
    "tip": "Sample data on purpose. A real customer list never goes on a shared screen."
   },
   {
    "at": "0:01",
    "min": 2,
    "do": "Scroll through the table and count the problems you can spot. Type your number in the chat, then press Show what the page found.",
    "see": "Step 2 lists four kinds of problem, each with its row: row 10 is a copy of row 9, eight dates are written the other way, row 21 has no amount, and rows 8 and 22 may be one customer.",
    "tip": "The page asks about the two spellings. It does not decide."
   },
   {
    "at": "0:03",
    "min": 2,
    "do": "Read step 3, Totals before and after. Say the gap out loud, and the row it comes from.",
    "see": "27,040 before and 26,655 after. The gap is 385, and 385 is row 10, the duplicate.",
    "tip": "If you could not explain the gap, you would stop here and build nothing."
   },
   {
    "at": "0:05",
    "min": 2,
    "do": "Read step 4 like an owner: the four tiles, the bars, the unpaid table. Then type one number in the Estimated box and one in the Projected box.",
    "see": "Patio and hardscape is 16,450 from 3 jobs. Unpaid is 8,775 on 5 jobs, and 6,400 of it is one patio. Your two typed numbers stay in their own boxes.",
    "tip": "Measured, estimated and projected are three different numbers. Never add across the labels."
   },
   {
    "at": "0:07",
    "min": 3,
    "do": "In step 5, press Copy the prompt and the export. Paste into your AI chat and send. Copy its whole answer, paste it under The AI's answer and press Use this answer.",
    "see": "The page's clean table and the AI's clean table side by side. With the sample answer both say 26,655, and Amounts that differ says 0.",
    "tip": "No AI chat handy? Press No AI handy? Load the sample answer."
   },
   {
    "at": "0:10",
    "min": 1,
    "do": "In step 6, type 27,040 and press Check my total. Then type 26,655 and press it again.",
    "see": "First the page says that is the total before the clean-up. Then it says it matches.",
    "tip": "At home, press Copy the clean table for Google Sheets or Excel, paste it into a sheet, and type the sum the sheet shows."
   },
   {
    "at": "0:11",
    "min": 2,
    "do": "In step 7, fill in your data map: where your customers, your money and your files live, and who holds each login. Then tick the backup habits that are true for you today.",
    "see": "The line under the table counts the boxes you filled in. The line under the ticks says whether you have a backup or a hope.",
    "tip": "A box you cannot fill in is where to start."
   },
   {
    "at": "0:13",
    "min": 1,
    "do": "In step 8, press Download the clean table as a CSV file. Then press Copy the summary and paste it into a note.",
    "see": "A file named clean-table.csv, and a plain text summary with the totals, every fix with its row, and your data map."
   },
   {
    "at": "0:14",
    "min": 1,
    "do": "Click Home.",
    "see": "A new number on your one screen: unpaid jobs, in dollars.",
    "tip": "Next Wednesday is the last session: what to do when something breaks, and your 90-day plan."
   }
  ],
  "real_life": [
   "Export one list from an app you pay for. In step 1, open Use my own export, paste it with the header row first, press Use this export, and check the page chose the right columns for the date, the customer, the amount and paid. Work on a copy, never the original.",
   "Write your data map tonight: customers, money, files. One home each, and who holds the login.",
   "Restore one file from your backup this month. If it opens, you have a backup."
  ],
  "if_it_breaks": [
   "The AI is slow or down: press No AI handy? Load the sample answer and keep going. The page has already done the clean-up by itself.",
   "The page says it could not find the clean table: ask the AI to give the table again as comma-separated lines with the header row first.",
   "The numbers look wrong with your own export: open Use my own export and check the six column choices. Start over with the sample data puts everything back."
  ]
 },
 "8": {
  "session": 8,
  "week": 8,
  "module": "w8-breaks",
  "title": "Follow along: a panicked text becomes a support request, a sheet and a plan",
  "minutes": 15,
  "goal": "Turn a panicked text into a clear support request, print the one page that says who to call, and leave with a 90-day plan that puts all eight weeks in order.",
  "you_need": [
   "This demo, open in a browser",
   "An AI chat you are signed in to (Claude or ChatGPT)",
   "Optional: a printer, or save as PDF from the print window"
  ],
  "steps": [
   {
    "at": "0:00",
    "min": 1,
    "do": "Open the demo (double-click Launch), click Week 8 and read The text message in step 1.",
    "see": "A Friday 4:41 PM text from Luis, the crew lead: the card thing isn't working again.",
    "tip": "Everything here is made up. Notice the word again: it broke before, and nobody wrote down the fix."
   },
   {
    "at": "0:01",
    "min": 2,
    "do": "Read The calm questions under the message. Find the one answer that is empty.",
    "see": "An amber note under The support request: the exact words on the screen are missing, and that is the first thing support will ask for.",
    "tip": "Luis wrote \"something about connection\". Nobody can act on that."
   },
   {
    "at": "0:03",
    "min": 2,
    "do": "Press Add what Luis sends back. Check that It stopped us taking money is picked, then press Copy the support request.",
    "see": "The request now quotes the screen word for word, and a green note says every question is answered.",
    "tip": "Two things changed that day. The request lists both and blames neither."
   },
   {
    "at": "0:05",
    "min": 3,
    "do": "Go to The same job, done by an AI. Press Copy the prompt and the message, paste it into your AI chat and send. Copy its whole answer, paste it into the box under the prompt and press Compare with the form's version.",
    "see": "The AI's version beside The form's version, and a note that answers: did it guess the cause?",
    "tip": "No AI chat handy? Use the button that loads the sample answer."
   },
   {
    "at": "0:08",
    "min": 2,
    "do": "Scroll to step 2, The one-page when-it-breaks sheet. Read the Card readers row, then press Add a row and type one tool your own business cannot run without.",
    "see": "Eight Greenline rows under five headings, and a new empty row at the bottom with a hint in each cell.",
    "tip": "Names and phone numbers go on the page. Passwords never do."
   },
   {
    "at": "0:10",
    "min": 1,
    "do": "Press Print the sheet. Look at the preview, then print it, save it as a PDF, or cancel.",
    "see": "One page: who to call first, the five questions, the table, and an empty log at the bottom.",
    "tip": "Keep it in a Google Doc, and keep one printed copy for the day the internet is down."
   },
   {
    "at": "0:11",
    "min": 2,
    "do": "In step 3, Five security habits, tick the habits your business already has. Then press Check this message under the scam email from Week 1.",
    "see": "A count of the habits that are done, and all three phishing signs found, each with the words that gave it away.",
    "tip": "Look at the sender's address too: acc0unt is spelled with a zero."
   },
   {
    "at": "0:13",
    "min": 2,
    "do": "In step 4, set Week 1 starts on to a real date and tick Week 1 to see the bar move. Press Download the plan as text, then click Home.",
    "see": "Every week shows its real dates. On the home screen, 90-day plan steps done reads 1 of 12.",
    "tip": "One thing at a time. If a week goes sideways, pick the same item up on Monday."
   }
  ],
  "real_life": [
   "Tonight: turn on two-step login for your email and save the backup codes. If it is already on, do the bank.",
   "Press Start a blank sheet for my business and fill in two rows: your email, and whatever you take money with. Then press Print the sheet.",
   "The next time something breaks: press Use my own problem, answer the calm questions, and send the request the page builds. Leave every password out."
  ],
  "if_it_breaks": [
   "The AI is slow or down: load the sample answer and keep going. The lesson is the five questions, not the typing.",
   "The print preview shows the whole page: close it and use the Print the sheet button, not the browser's own print command.",
   "Start over with the sample data puts everything back. It also clears your plan ticks, so press Download the plan as text first."
  ]
 }
};
