/* Save Greenline · mission 1, the story around week 1's tool (Inbox to task list).
   The format and the rules for the words are in GAME.md. Everything here is made up. */
if (window.OH && OH.game && OH.game.mission) OH.game.mission({
  week: 1,
  title: "The inbox that ate the morning",
  badge: { name: "Inbox Tamer", icon: "✉" },
  briefer: "Jordan",
  scene: [
    "It is 7:40 on Wednesday, your first morning with the keys to the office. Jordan is already in the truck. Twelve emails came in overnight.",
    "One is from Dana Whitfield, who took a morning off work for a crew that never came. One is a scam dressed up as a security alert. One is quietly about money Greenline is owed.",
    "Jordan cannot tell which is which from a phone at a red light. You can. Hand the sorting to the AI, then check its work before anybody gets a reply."
  ],
  stakes: "Leave it, and Dana waits all day while a scam sits one click away.",
  quiz: [
    { q: "What is the most useful way to think about AI at work?",
      options: ["An expert who already knows your business", "A very fast new hire on day one", "A search engine with better manners"], answer: 1,
      why: "It reads, sorts and drafts fast, and it knows nothing about your prices or your customers until you tell it." },
    { q: "An AI answer lets you down. What do you check first?",
      options: ["Whether it had the job, the context, the rules, an example and a check", "Whether a different AI tool would have done a better job", "Whether asking the same thing again, in capital letters, helps"], answer: 0,
      why: "That is the new-hire rule, and a bad answer usually means one of the five is missing." },
    { q: "The AI hands back your inbox in four tidy piles. What do you ask?",
      options: ["Is it right?", "Can it send the replies for me?", "Which one is wrong?"], answer: 2,
      why: "It sounds just as sure when it is wrong, and there is nearly always one, so you go looking for it." }
  ],
  reward: { hours: 4, leads: 0, money: 0 },
  debrief: [
    "Twelve emails became four piles and a to-do list, and nothing was sent to anybody.",
    "You asked which one was wrong and found it. Tomorrow, run the same prompt on ten of your own emails."
  ],
  next: "Next: a lead came in at 9 PM. Nobody saw it."
});
