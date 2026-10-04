# Save Greenline · the game

The eight weekly tools, played as a game. Optional: the class never requires it.

**Premise.** Greenline Landscaping is a good company drowning in busywork. Jordan Reyes, the owner,
has just handed you the keys to the office. Eight missions, one per week of the course. Each
mission is one broken part of the business; you fix it by doing the real job in that week's tool.
When all eight are done, the whole business is on one screen and Jordan gets the evenings back.

**Who plays.** Small business owners who are not technical. It must feel like a friendly, well-made
game, never like homework, and never talk down. Plain words, short sentences, a little wit.

## How a mission runs

1. **The scene.** A short story beat: what is going wrong at Greenline today, who is waiting.
2. **Three quick questions.** Multiple choice, from the ideas taught that week. A wrong answer shows
   why, and the player tries again. All three must be right to go on.
3. **The job.** The week's tool appears, with an objectives panel that ticks itself as the player
   works. The last objective is always the catch: finding the thing the AI got wrong.
4. **Mission complete.** Stars, a badge, the business meters rise, a two-line debrief, the next
   mission unlocks.

A mission is passed only by doing the job: every objective marked `required` must be done.

**Stars.** 3: every objective done and all three questions right on the first try.
2: every required objective done. 1 is not used; a mission is either passed or not.

**Meters (story numbers for a made-up company, always labelled "in the story").**
Hours of busywork saved each week · Leads answered · Dollars found. Each mission's `reward` adds to
them. A fourth bar, Greenline's health, is the share of missions complete.

**Ranks**, by missions complete: 0 New at the desk · 1 to 2 Getting organised · 3 to 4 Running the
office · 5 to 6 Jordan's right hand · 7 Almost running itself · 8 Greenline runs itself.

## The pieces

| File | Owner | What it is |
|---|---|---|
| `app/game/game.js`, `app/game/game.css` | the engine | Title screen, mission map, the mission flow, scoring, saving, the final screen and certificate |
| `app/game/missions/mN.js` | one per week | The story, the three questions, the reward and the debrief for mission N |
| `objectives()` in `app/modules/wN-*.js` | each week's module | What counts as done, read from that module's own saved state |
| `app/shell.js` | the engine | Loads the game files and routes `#/game`, `#/game/mN`, `#/game/done` |

### A mission file

```js
OH.game.mission({
  week: 1,
  title: "The inbox that ate Monday",             // 40 characters or fewer
  badge: { name: "Inbox Tamer", icon: "✉" },   // a name of 3 words or fewer and one plain symbol (no emoji)
  briefer: "Jordan",                              // who is talking to the player
  scene: [                                         // 2 or 3 short paragraphs, second person, present tense
    "It is 7:40 on Monday. Jordan is already in the truck. Twelve emails came in overnight.",
    "One of them is from a customer whose crew never showed up. One is a scam. Jordan cannot tell which is which from a phone at a red light."
  ],
  stakes: "Leave it, and an upset customer waits all day.",   // one line, 90 characters or fewer
  quiz: [                                          // exactly 3, each with 3 options
    { q: "An AI is most like...", options: ["A search engine", "A very fast new hire on day one", "A calculator"], answer: 1,
      why: "It reads and drafts fast, and it does not know your business until you tell it." }
  ],
  reward: { hours: 4, leads: 0, money: 0 },        // small whole numbers that fit the sample data
  debrief: [                                       // exactly 2 lines
    "Twelve emails became four piles and a list, and nothing was sent to anybody.",
    "Tomorrow: run the same prompt on ten of your own emails."
  ],
  next: "Next: a lead came in at 9 PM. Nobody saw it."   // 80 characters or fewer; mission 8 has no next
});
```

Rules for the words: the people are the ones already in the sample data (Jordan Reyes the owner,
Luis the crew lead, the customers in that week's sample file). Nothing here is a real result:
never write a number as if a real business got it. No prices for Mitchell's services, no client or
employer names, no outside statistics, no em dashes, no exclamation points, no hype words.
Quiz questions test the week's ideas (the ones on its slides), not trivia, and never trick the
player: one option is clearly right once you know the idea. `why` teaches in one sentence.

### `objectives()` on a module

Added to the object passed to `OH.register`:

```js
objectives: function () {
  return [
    { id: "sorted",  label: "Sort the inbox into four piles", done: /* true or false */, required: true },
    { id: "caught",  label: "Catch the one it got wrong and move it", done: /* ... */, required: true },
    { id: "rule",    label: "Add a rule so it gets it right tomorrow", done: /* ... */, required: false }
  ];
}
```

- Four to six objectives, in the order the runbook walks them. Labels are orders, 60 characters or fewer.
- **Read only.** Compute `done` from what the module already saves with `OH.store` (its `wN:` keys).
  Never write anything, never change how the module works, never add a new saved key unless an
  objective cannot be detected without it; if you must, save it at the moment the player acts.
- Every objective is **false on fresh sample data** and becomes true by doing what the runbook says.
- At least three are `required`. One required objective is **the catch**: the planted mistake in
  that week's sample answer, or the check that proves the work (a total that matches, a duplicate
  flagged, a test passed).
- At most two are `required: false`: the extras that earn the third star (using your own data,
  adding a rule, downloading the result).
- `objectives()` must never throw, including when nothing has been saved yet.

### What the engine provides

- `OH.game.mission(data)` registers a mission. `OH.game.missions[week]`.
- `OH.game.state()` returns `{ name, done: {week: {stars, at}}, quiz: {week: {firstTry}} }`, saved
  under the `game:` keys of `OH.store`.
- The mission page draws the module with its normal `render(root, ctx)`; `ctx.redraw` redraws the
  mission page. The objectives panel also refreshes once a second, so a module needs no changes
  beyond `objectives()`.
- A mission whose week is not in this copy (the starter holds fewer weeks) shows as arriving later.
- No native `alert`, `confirm` or `prompt` anywhere: every question to the player is drawn in the page.
- Same rules as MODULES.md: no network requests, no imports, no libraries, works from a
  double-clicked `index.html`.
