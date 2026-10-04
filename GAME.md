# Save Greenline: The Case of the Busywork Bandits

The guide for anyone writing a mission. Read this and `app/game/missions/m1.js`, and you can write
mission 2.

The game is a bright cartoon adventure that teaches the same ideas as the eight weekly tools. It is
self-contained play: the tools (`#/w1` to `#/w8`) are the class's hands-on lab and the game never
changes them. The game is optional. The class and every tool work without it.

**The game is played in Agent Mode.** The player is not a detective standing beside an AI. The
player IS the AI: Greenline's new agent. They log in with a name and a look, see every scene through
the agent's visor, learn one piece of knowledge at a time, and level up. Section 13 is the whole of
Agent Mode in one place; the rest of this guide is written for it.

Contents: [the story bible](#1-the-story-bible) · [the files](#2-the-files) ·
[a mission file](#3-a-mission-file) · [the quick challenges](#4-the-quick-challenges) ·
[writing a showdown](#5-writing-a-showdown) · [the kit](#6-the-kit-everything-a-mini-game-is-given) ·
[the art](#7-the-art) · [the sound](#8-the-sound) · [rules for the words](#9-rules-for-the-words) ·
[testing a mission](#10-testing-a-mission) · [known limits](#11-known-limits) ·
[saving, the starter copy, the apps](#12-saving-the-starter-copy-the-apps) ·
[Agent Mode](#13-agent-mode)

---

## 1. The story bible

Keep to it, so all eight missions feel like one game.

**The world.** Cedar Hollow, a bright little cartoon town. Eight places on the town map:

| Key | Place | Who is there (the host) |
|---|---|---|
| `hq` | Greenline HQ, a small green office with the truck outside | `jordan` |
| `garden` | Dana's Garden | `dana` |
| `grind` | The Daily Grind, the coffee shop | `bea` |
| `square` | Town Square: a billboard and a map kiosk | `maple` (Mayor Maple) |
| `post` | Print and Post | `nell` |
| `bank` | Cedar Hollow Savings | `penny` |
| `workshop` | The Workshop | `gus` |
| `park` | Hollow Park, in the middle of the ring road | nobody: bring your own cast |

**The cast.**

- **You**: Greenline's new AI agent. The player logs in as the agent, with a name and a look, and
  sees every scene through the agent's visor. Everybody speaks to the agent ("Agent Ivy!"). The agent
  thinks and answers in the first person ("I'll check the inbox first"). The agent is never an actor
  on the stage: it is the camera. Its drawing (`agent`) is for the badge, the HUD and the plan cards.
- **Jordan Reyes** (`jordan`): owns Greenline. The agent's supervisor: gives it the job, and approves
  its work. Nothing goes out until Jordan says so.
- **Luis** (`luis`): the crew lead. Drives the green truck. The agent rides in the passenger seat.
- **Sprout** (`sprout`): the agent's trainer, a small eager robot with a leaf antenna. Sprout is the
  agent who had this job before. Very fast, very keen, full of shortcuts, and **one of its shortcuts
  is wrong in every mission**, which the player has to catch. The lines that sum it up: "I draft.
  Jordan decides." and "Sprout taught it. I check it."
- **The townspeople**: Dana, Bea, Mayor Maple, Nell, Penny and Gus, one at each place. Each one
  teaches the agent one thing. They are warm, a little funny, and each knows one thing about working
  with an agent.
  A townsperson is met at their own place, with one exception: while a bandit holds that place, a
  case may move them next door, and their first line says why. Case 5 does it (Blank Page is in Print
  and Post, so Nell pins her notices in Town Square) and so does case 8 (Captain Chaos has the
  Workshop, so Gus waits in Hollow Park). Cases 2 and 3 keep Bea and the mayor at home, in the gray.
- **Who they are, so every case agrees.** Dana Whitfield grows things, and is also a Greenline
  customer (the hedge trim nobody showed up for). Bea runs the coffee shop: cocoa, cups, a till.
  Mayor Maple looks after Town Square, its billboard and the map kiosk. Nell prints and posts: flyers,
  parcels, the big printer. Penny guards the vault at the bank. Gus builds and fixes machines, and
  minds the sawdust.
- Customers named in the sample data (Priya, Marcus, Tomas and the rest) can be talked about.
  Nobody outside this list gets a face unless a mission draws one (section 7).

**The villains.** The Busywork Bandits: eight goofy, harmless gremlins who steal people's time.
One per mission, in this order. Each holds one part of town, which stays gray until it is caught.

| Case | Bandit (key) | What it does | The part of town it turns gray | Sticker |
|---|---|---|---|---|
| 1 | Clutter (`clutter`) | buries the morning under email | `hq` | envelope |
| 2 | Slowpoke (`slowpoke`) | makes every new lead wait | `grind` | bolt |
| 3 | Mumbles (`mumbles`) | scrambles the sign, so nobody understands the home page in three seconds | `square` | sign |
| 4 | Hide-and-Seek (`hideseek`) | hides Greenline from the town map | `park` | pin |
| 5 | Blank Page (`blankpage`) | steals the ideas, so the marketing stops | `post` | pencil |
| 6 | The Ghoster (`ghoster`) | makes leads go quiet | `garden` | chat |
| 7 | Double Trouble (`doubletrouble`) | twins who copy rows, so the numbers disagree | `bank` | coins |
| 8 | Captain Chaos (`chaos`) | the Friday afternoon outage, with a phishing trick: "the boss" | `workshop` | shield |

The bandits are never scary and never hurt anyone. They gloat, they giggle, they get caught in a net.

**How a case plays**, like a Carmen Sandiego case, in about 6 to 8 minutes:

1. **The briefing** at HQ. Jordan tells the agent what the bandit has done, and gives it the job.
   The job stays in the visor as the task line ("Jordan: Learn three things, then stop Clutter.").
2. **The town map.** The agent picks where to go, and rides there: a short street view from the
   passenger seat of the truck. At each of three places a townsperson teaches one thing (one real
   idea from that week's class), and a quick challenge of about 20 seconds (tap, drag or pick) makes
   it stick. Each thing learned is a piece of knowledge: it fills the week's skill, and it is kept
   under "What I know" in the Skills panel.
3. **The plan.** With three things learned, the agent picks its plan: three cartoon cards, each in
   the agent's own words. A wrong pick gets a funny reaction and another try.
4. **The showdown.** An arcade mini-game that IS the week's job, done with the hands. Then Sprout
   proudly shows its shortcut, and the player has to spot the one thing wrong with it and fix it.
5. **The handoff.** The agent never sends. It takes the finished work to Jordan, and Jordan approves
   it. "I'll send it myself" is on the card too, and it is always turned down: rule one.
6. **Caught.** The net drops, the stars and a sticker are saved, the gray part of town bursts back
   into color, and the truck rides home. "Try it for real" opens that week's tool.

**Progress you can see.** The town starts partly gray and gains color case by case. Cases unlock in
order. A case that is not in this copy yet shows as a locked case with the date it arrives.

One rule about the gray, so nobody has to ask: on the **town map** every place a bandit still holds
is gray. Up close, a scene is drawn **in color**, except the case's own zone while its bandit is
loose (in case 1 that is HQ, from the briefing to the catch). A gray scene is no fun to stand in.

**Scoring.** Up to three stars a case:

1. the case is closed;
2. Sprout's wrong shortcut was caught on the first try;
3. few wrong picks in the whole case (three or fewer, unless the mission sets `maxWrong`).

**Growing.** The agent grows like a character in a life sim: skills fed by knowledge. There are nine
skills, one for each week's subject and one that runs through every case, Judgment. Every piece of
knowledge, first-try answer and star adds experience to a skill, a gain floats up ("+10 Automation"),
and the total sets the agent's level, one to ten. Each level has a plain title and one permission
Jordan now trusts the agent with. Section 13 has the numbers.

The best result is kept. A case can be played again. The story meters (hours of busywork saved each
week, leads answered, dollars found) add up from each mission's `reward`, and are always labelled
as story numbers for a made-up company. Money is a plain number with the word in the label: "8,775"
under "Dollars found", never a dollar sign. A bonus sticker, "Did it for real", appears under
"What I know" when the week's tool reports its required `objectives()` done. That is the only thing the game
reads from a tool, and it is read only.

**It teaches without lecturing.** Every piece of knowledge, card and mini-game rule is a real idea from the class,
said in one short friendly sentence. No quiz screens. Reading stays short. The hands do the learning.

**Look, sound and feel.** Bright flat colors, one thick dark outline on everything, chunky rounded
buttons, bouncy motion, characters that blink and bob, speech that types itself, confetti and
stickers. All art is drawn in code (SVG). Sound is made in code. No image files, no fonts, no
emoji, no libraries, no network.

**Two sets of colors, so the player always knows who is talking.** The world is cream, white and
sun yellow. Anything that is the agent itself (the visor's corners, the HUD, the agent's own
thoughts, the buttons that are its replies) is deep navy and visor cyan (`--sg-deep`, `--sg-visor`).

---

## 2. The files

| File | What it is |
|---|---|
| `app/game/art.js` | Every picture: shapes, props, icons, characters, places, scenes, the town map |
| `app/game/sound.js` | Every sound: the tune and the effects, made with the Web Audio API |
| `app/game/kit.js` | The toolbox a screen or a mini-game is given, and the four built-in quick challenges |
| `app/game/game.js` | The engine: entrance, agent login, the visor, town map, the case flow, experience and levels, saving, the Skills panel, the finale |
| `app/game/game.css` | The look. Every class starts with `sg-` |
| `app/game/missions/mN.js` | One case. **The only file a mission author writes** |

`app/shell.js` loads them in that order, then the mission files of the weeks in this copy. The
addresses are `#/game` (the entrance: splash, title, agent login, boot sequence, then the town map),
`#/game/mN` (a case) and `#/game/done` (the finale). While the game is on, the app's header and
footer are hidden. The HUD has the way out.

The rules of the house are the same as `MODULES.md`: no network requests, no `import`, no libraries,
no files loaded at run time, and it must work from a double-clicked `index.html`. A mission **never
edits the engine**. If the engine cannot do something you need, add it to your own file first; if
three missions need it, it moves into the engine.

---

## 3. A mission file

A mission is one file that calls `OH.game.mission({...})` once. This is the whole format, with a
small mini-game of its own so you can see every part working together. It is an example, not the
real case 2. `m1.js` is the full-size model.

Every line in a mission is said **to** the agent ("you") or **by** the agent ("I"). Section 9 has
the rules; the example follows them.

```js
/* Save Greenline · case N: the title. Bandit: who, and what it does.
   What it teaches (session N of the class): the three ideas, in a line each.
   Agent Mode: the player is the agent. Everything in it is made up. */
(function () {
  "use strict";
  if (!window.OH || !OH.game || !OH.game.mission || !OH.game.art) return;
  const h = OH.h, A = OH.game.art, S = OH.game.sound;

  /* The mini-game. The engine gives you an empty stage and the kit. Call done() when the job is
     finished. You never tidy up: timers, keys, drags and styles from the kit vanish with the screen. */
  async function waitingRoom(kit, done) {
    kit.backdrop("grind", { gray: true });                       // the case's zone, still gray
    kit.style(".m2-row{position:absolute;left:0;right:0;bottom:12%;display:flex;gap:10px;justify-content:center}");
    const leads = ["Tomas", "Hannah", "Owen"], row = h("div", { class: "m2-row" });
    kit.stage.appendChild(row);
    const clock = kit.timer({ up: true });                       // a clock in the HUD
    let left = leads.length;
    await new Promise((resolve) => {
      leads.forEach((name, n) => {
        const b = h("button", { class: "sg-chip", type: "button", onclick: () => answer(b) }, h("kbd", null, String(n + 1)), name + " is waiting");
        row.appendChild(b);
      });
      function answer(b) { if (b.disabled) return; b.disabled = true; b.classList.add("sg-yes"); kit.score.right(); if (--left === 0) resolve(); }
      kit.keys({ "1": () => answer(row.children[0]), "2": () => answer(row.children[1]), "3": () => answer(row.children[2]) });
    });
    clock.stop();

    // Sprout's shortcut: one part of it is wrong, and the player has to catch it
    const p = kit.panel({ kicker: "Sprout's shortcut", title: "Sprout shows me three replies it would send. One should not go out. Tap it.", who: "sprout" });
    let tries = 0;
    await new Promise((resolve) => {
      ["Thanks, Tomas. Two times that work for a visit?", "Hi Hannah, sorry for the wait.", "Owen, your quote is half price!"].forEach((text, n) => {
        const b = h("button", { class: "sg-chip", type: "button", onclick: () => {
          if (n !== 2) { tries++; b.disabled = true; b.classList.add("sg-okay"); kit.score.wrong(); return p.say("That draft is fine. I look again.", "bad"); }
          b.classList.add("sg-found"); kit.score.right();
          kit.score.sprout(tries === 0);                         // the second star, and Judgment. Call it once.
          p.say("Sprout made up a price. I never make up a price.", "ok"); kit.after(1400, resolve);
        } }, text);
        p.body.appendChild(b);
      });
    });
    p.close();
    kit.cast([{ who: "slowpoke", side: "left", mood: "surprised" }, { who: "sprout", side: "right", mood: "proud" }]);
    await kit.say([{ who: "slowpoke", mood: "surprised", say: "Answered already? But I was napping." },
      { who: "sprout", mood: "proud", say: "You draft. Jordan sends. Take it to Jordan, {name}!" }]);   // {name}: the agent's name
    done();                                                      // the engine's handoff comes next: Jordan approves
  }

  OH.game.mission({
    week: 2,                                      // 1 to 8. Fixes the bandit, the gray zone, the sticker and the skill (section 1).
    title: "The Lead That Waited All Night",      // the case name. 34 characters or fewer.
    badge: { name: "Lead Catcher" },              // the sticker's name, three words or fewer. icon and color come from the bible.
    reward: { hours: 2, leads: 1, money: 0 },     // story numbers: small, whole, and they fit the sample data.
    maxWrong: 3,                                  // optional. Wrong picks allowed for the third star. Default 3.
    task: "Learn three things, then stop Slowpoke.",   // optional. Jordan's task line in the visor while the agent is learning.

    /* The briefing at HQ. A list of lines, or {setup, lines, reply} when the scene wants extra art.
       A line: who (a character key, "you" for the agent's own thought, or "narrator"), say, and
       optionally mood and pose. {agent} becomes "Agent Ivy" and {name} becomes "Ivy". */
    briefing: [
      { who: "jordan", mood: "worried", pose: "shrug", say: "{agent}! A lead came in at 9 PM. Nobody saw it." },
      { who: "you", say: "I was awake at 9 PM. Nobody told me to look." },
      { who: "sprout", mood: "glad", pose: "wave", say: "I never looked at night either. Mornings only. That was my shortcut!" }
    ],

    /* Exactly three stops. place: a key from section 1. who: the host, if not the place's own.
       lines: two to four. challenge: section 4. clue: one real idea from the class, as something the
       agent now knows ("I ..."). It feeds this week's skill. */
    stops: [
      { place: "bank", who: "penny",
        lines: [{ who: "penny", mood: "happy", say: "Every automation has three parts, {agent}. Most people forget the third." }],
        challenge: { type: "pick", ask: "When this happens, I do that, and what?", options: ["I do it again", "I tell a person", "I send it to the customer"], answer: 1 },
        clue: { title: "Tell a person", text: "When this happens, I do that, and I tell a person. The notice is the check, so quiet never means broken." } },
      { place: "workshop", /* ... */ },
      { place: "square", /* ... */ }
    ],

    /* The plan: three cards, exactly one with right: true. The cards are the agent's own options, so
       they say "I". Leave `crack` out to skip the step. */
    crack: {
      lines: [{ who: "sprout", mood: "glad", say: "Three things learned, {name}. So how do we stop Slowpoke?" }],
      ask: "What is my plan?",
      cards: [
        { title: "Jordan checks more often", text: "An alarm. Every hour. All night.", icon: "clock",
          react: { who: "slowpoke", mood: "glad", say: "Lovely. I will wait between the alarms." } },
        { title: "I carry it and tell Jordan", text: "I save the lead, tell Jordan, and draft the reply.", icon: "bolt", right: true,
          react: { who: "jordan", mood: "glad", say: "That's it. The carrying is yours. The sending is mine." } },
        { title: "I answer everyone myself", text: "Straight away. Nobody reads it first.", icon: "chat",
          react: { who: "jordan", mood: "worried", say: "Rule one, {name}. Nothing goes out until a person approves it." } }
      ]
    },

    /* The showdown: a title, Jordan's task line for the visor, two or three lines of how to play in
       the agent's own words, and play(kit, done). */
    showdown: { title: "Beat the clock", task: "Answer the three leads. Send nothing.",
      how: ["Three leads are waiting. I answer each one.", "Tap a lead, or press 1, 2 or 3.", "Then Sprout shows me its shortcut. I check it."], play: waitingRoom },

    /* The handoff, after the showdown: the agent never sends, Jordan approves. Optional: the engine
       has plain words of its own. ask: Jordan's line. work: two or three short lines of what the
       agent did. approve: Jordan's yes. */
    handoff: { ask: "Three leads, {agent}. Show me.", work: ["Three leads, a draft for each.", "One made-up price taken out.", "Nothing sent."], approve: "Approved. I will send these three tonight." },

    /* After the catch: two lines. The second steps out of the story: one thing for the person playing
       to try for real, tonight. It starts "For the person behind the visor:". */
    debrief: [
      { who: "jordan", mood: "glad", pose: "cheer", say: "One lead, from the form to a checked draft, and nobody retyped a word." },
      { who: "sprout", mood: "proud", say: "For the person behind the visor: tonight, fill out your own website form. Time the gap." }
    ],
    next: "Next case: Greenline's home page gets three seconds."   // one line. Case 8 has none.
  });
})();
```

### Every field

| Field | Needed | What it is |
|---|---|---|
| `week` | yes | 1 to 8. The bandit, the gray zone, the sticker and the skill the case feeds come from the bible by week. |
| `title` | yes | The case name on the map, the HUD and the wanted poster. 34 characters or fewer. |
| `badge.name` | yes | The sticker's name. `badge.icon` and `badge.color` override the bible, which you should not need. |
| `reward` | yes | `{hours, leads, money}`: small whole story numbers that fit the sample data. |
| `maxWrong` | no | Wrong picks allowed for the third star. Default 3. A long showdown may allow 4. |
| `task` | no | Jordan's task line in the visor while the agent is learning. 60 characters or fewer. Default: "Learn three things, then stop (the bandit)." |
| `bandit`, `zone` | no | Override the bible. Do not, unless the bible itself changes. |
| `briefing` | yes | Lines, or `{place, cast, setup(kit), lines, reply}`. Default place `hq`, default cast Jordan and Sprout. 5 to 8 lines. `reply` is the agent's answer on the button at the end. Default: "I'm on it. To the truck!" |
| `stops` | yes | Three of `{place, who, lines, challenge, clue: {title, text}}`. Also `cast` and `setup(kit)`. A `clue` is a piece of knowledge: +10 to the week's skill, and an entry under "What I know". |
| `crack` | no | The plan: `{lines, ask, cards}`. A card: `{title, text, right, react: {who, mood, say}, icon or art, color}`. `art` is SVG for a 120 by 120 box, or a function that returns it (use a function to draw the player's own agent: `A.characterMarkup("agent")`). |
| `showdown` | yes | `{title, task, how: [..], play(kit, done)}`. `task` is Jordan's task line in the visor. Keep it to 48 characters, so it stays on one line on a phone and the mini-game keeps its room. Default: "Do the job. Then check Sprout's shortcut." |
| `handoff` | no | `{ask, work: [..], approve}`: Jordan's line, two or three short lines of what the agent did, Jordan's yes. The engine has plain defaults. |
| `caught` | no | `{setup(kit)}`: extra art for the engine's caught screen, added when the net is about to drop (case 8 brings the other seven bandits back to watch). The handoff comes between `done()` and the catch, so a mission cannot draw on the caught screen from inside `play`. |
| `debrief` | yes | Two lines, spoken after the catch by Jordan and Sprout. |
| `next` | no | One line that teases the next case. |

A line of dialogue is `{who, say, mood, pose}`. `who` is any character key, `"you"` for the agent's
own thought (visor text, no actor: the agent is the camera), or `"narrator"` for a line nobody
speaks. A character keeps its last mood and pose until a line changes them. One or two short
sentences a line, 110 characters or fewer: a bubble has to fit a phone.

**The agent's name.** In any line of dialogue, a card's reaction, a challenge's `ask`, a clue's text,
the `how` lines and the handoff, `{agent}` becomes "Agent Ivy" and `{name}` becomes "Ivy" (whatever
the player chose; 14 characters at most). In text a mission builds itself, use `kit.fill(text)`.

`setup(kit)` runs once the backdrop and the cast are up and before the first line. Use it to add
art to that scene (case 1 puts Clutter on a storm cloud over HQ and rains envelopes).

---

## 4. The quick challenges

A stop's `challenge` names one of four built-in types. Each takes about 20 seconds, works with
mouse, touch and keys, and counts wrong picks for you. `ask` is the one-line instruction, in the
agent's own words ("Which jobs am I quick at?"). The card's kicker reads "My turn". A challenge
solved with no wrong pick earns +5 for the week's skill.

**`pick`**: one right answer.

```js
{ type: "pick", ask: "...", options: ["...", "...", "..."], answer: 1,
  yes: "said when right", nope: "said when wrong" }          // nope may be a list, one per option
```

**`sort`**: one card at a time into the right basket: drag it, tap a basket, or press its number.

```js
{ type: "sort", ask: "...",
  bins: [{ key: "a", label: "...", icon: "bolt", color: A.C.green }, { key: "b", label: "..." }],   // two to five
  items: [{ text: "...", bin: "a", why: "one line, shown for a right or a wrong pick" }] }
// bin may be a list, ["a", "b"], when more than one basket is a fair answer
```

**`tap`**: find every right one among the decoys.

```js
{ type: "tap", ask: "Tap the five things ...", items: [{ text: "...", ok: true, why: "..." }, { text: "...", ok: false, why: "..." }] }
```

**`spot`**: things already sorted into groups, exactly one in the wrong group. Tap it, or press its
number (the first nine are numbered, group by group).

```js
{ type: "spot", ask: "...", nope: "said for a wrong tap",
  groups: [{ label: "...", color: A.C.blue, items: [{ text: "..." }, { text: "...", wrong: true, why: "..." }] }] }
```

**Your own.** Give `play` instead of `type`: `challenge: { ask: "...", play: function (kit, spec, done) { ... } }`.
Build it with `kit.panel()` so it looks like the others, call `kit.score.wrong()` for a wrong pick
and `done()` when it is solved. To share a new type with other missions, add it to
`OH.game.challenges.myType`.

Use at least two different types across the three stops. A challenge practises the knowledge it
earns: the player should feel the idea in their hands before they read it.

All four keep the keyboard inside the challenge: when a wrong pick switches a button off, the focus
moves to the next live one. In a challenge of your own, do the same with `kit.focusNext` (section 6).

---

## 5. Writing a showdown

`play(kit, done)` is the whole mini-game, in your mission file. The engine has already shown the
"versus" card with your `title` and `how` lines.

**The lifecycle.**

1. The engine clears the stage, stops the tune, starts a fresh kit and calls `play(kit, done)`.
2. You build into `kit.stage`: an empty element that fills the window under the HUD
   (`position: relative`). Put a backdrop behind it with `kit.backdrop(place, {gray: true})`.
3. You run the game with the kit: `kit.drag`, `kit.keys`, `kit.timer`, `kit.after`, `kit.say` and
   the rest (section 6).
4. A wrong pick calls `kit.score.wrong()`. Catching Sprout's wrong shortcut calls
   `kit.score.sprout(firstTry)` exactly once: the second star, and +10 Judgment (+20 on the first try).
5. You call `done()` once. The engine takes the finished work to Jordan (the handoff), then closes
   the case, drops the net and takes it from there. A showdown never sends anything itself.
6. Teardown is automatic. Anything the kit gave you (timers, key maps, listeners added with
   `kit.on`, drags, styles from `kit.style`, the stage's contents) is removed when the screen
   changes, including when the player leaves halfway. Only things you made yourself outside the
   kit (a raw `setInterval`, a listener on `window`) need `kit.onCleanup(fn)`.

`play` may be an `async` function. If it throws, the engine shows a way to close the case anyway.

**Every showdown has the same three beats.**

1. **My first go.** The week's job as an arcade game: sort, match, catch, order, fix. It must be
   the real job, not a metaphor for it. No fail state: a wrong pick bounces back with one line of
   help, and the player tries again.
2. **Sprout's shortcut.** Sprout, the trainer, shows how it used to do the same job in seconds, and
   tells the agent to copy it. One part of the shortcut is wrong. Use the planted mistake from that
   week's sample answer where there is one.
3. **The catch and the fix.** The player finds the wrong one and puts it right. The last line sends
   the agent to Jordan ("Take it to Jordan, {name}!"), because the handoff is next.

**It must work everywhere.**

- Every action has a tap or click, and a key. Number keys for a few choices, arrows and Enter
  otherwise (arrows already move the focus between buttons). A drag always has a tap alternative.
- It fits 1280 by 800 and 390 by 844. Use `min()`, `clamp()`, percentages and `vmin`; a grid that is
  four across on a laptop is two across at `max-width: 700px`.
- With reduced motion (`kit.calm` is true) it stays playable: `kit.tween` jumps to the end and
  `kit.fx.fly` skips the flight. Do not make anything depend on an animation finishing.
- No native `alert`, `confirm` or `prompt`. Ask with `kit.choose` or a `kit.panel`.
- Short text. A card the player must read in the middle of a game holds a title and one or two lines.

---

## 6. The kit: everything a mini-game is given

`kit` belongs to one screen. `setup(kit)`, a custom challenge and `play(kit, done)` each get the
kit of the screen they are on.

**The basics**

| | |
|---|---|
| `kit.stage` | The element to build into. Fills the window under the HUD. |
| `kit.h` | `OH.h(tag, attrs, ...children)`, the app's DOM builder. |
| `kit.art`, `kit.sound` | `OH.game.art` and `OH.game.sound` (sections 7 and 8). |
| `kit.mission`, `kit.week` | The case being played. `kit.mission.bandit`, `.zone`, `.title`. |
| `kit.agent` | Who the player is: `{name, look, level, title}`. |
| `kit.fill(text)` | Puts the agent's name into a line: `{agent}` becomes "Agent Ivy", `{name}` becomes "Ivy". `kit.say`, `kit.choose` and the built-in challenges do it for you. |
| `kit.calm` | `true` when the player has asked for reduced motion. |

**Time**

| | |
|---|---|
| `kit.after(ms, fn)` | Run once, later. |
| `kit.every(ms, fn)` | Run again and again. Returns a function that stops it. |
| `kit.wait(ms)` | A Promise, for `await`. |
| `kit.frame(fn)` | Run every animation frame: `fn(secondsSinceStart, secondsSinceLastFrame)`. Return `false` to stop. Returns a stop function. |
| `kit.tween(ms, fn, done)` | `fn(p)` with `p` easing from 0 to 1. Jumps to 1 with reduced motion. |
| `kit.timer(opts)` | A clock in the HUD. `{seconds: 30, onEnd}` counts down; `{up: true}` counts up. Also `onTick(value)` and `show: false`. Returns `{stop, pause, resume, value(), seconds(), hide()}`. |

**Input**

| | |
|---|---|
| `kit.keys(map)` | `{"1": fn, Enter: fn, ArrowLeft: fn, any: fn}`. The newest map wins. Enter and Space are left to a focused button. Arrow keys nobody claims move the focus between buttons. Returns a function that removes the map. |
| `kit.drag(el, opts)` | Drag with a mouse or a finger. `zones`: the elements it can be dropped on (or a function returning them). `onDrop(zone or null, el)`: return `true` to keep the element where it was let go; anything else sends it back. `onOver(zone)`, `onStart(el)`, `disabled()`. The zone under the pointer gets the class `sg-over`, and the element has the class `sg-dragging` while it moves: a lifted look, with a shadow that follows its shape. |
| `kit.on(target, type, fn)` | `addEventListener` that is removed with the screen. |
| `kit.focus(el)` | Move the keyboard focus. Do it whenever a new set of buttons appears. |
| `kit.focusNext(list, n)` | You have just disabled `list[n]`: if the focus was on it, it moves to the next live button in `list`. Call it right after a wrong pick, so the arrow keys carry on from inside your game. |

A tap is a `<button>` with `onclick`. Buttons are focusable and work with Enter, so use real buttons.

**The stage: backdrop, actors, speech**

| | |
|---|---|
| `kit.backdrop(place, {gray})` | A place's scene behind everything. Or pass an `<svg>` of your own. Returns the element. |
| `kit.cast(list)` | Put characters on stage: `["jordan", "sprout"]` or `[{who, side: "left" / "right" / "center", mood, pose}]`. `kit.cast([])` clears them. |
| `kit.actor(who, {mood, pose})` | Change one actor (it is added if it is not on stage). Returns `{el, set(), hop()}`. |
| `kit.say(lines)` | Speak the lines one at a time. The text types itself; a tap, Enter or Space finishes the line, then moves on. Returns a Promise. A speaker who is not on stage walks on in the middle; with three or more on stage the whole cast shrinks to fit a phone. A line with `who: "you"` is the agent's own thought: no actor, and the bubble turns into visor text. |
| `kit.choose(options)` | Buttons under the last line: `[{label, value, icon}]`. Resolves with the value. A choice is the agent's own reply, so write the label in the first person ("I'll check the inbox first"). |
| `kit.hush()` | Hide the speech bubble. |
| `kit.panel({kicker, title, who, class})` | A card in the middle of the stage. Returns `{el, body, foot, say(text, tone), close()}`. `tone` is `"ok"` or `"bad"`. `class: "sg-wide"` for a wide one. |
| `kit.toast(text)` | A short message that floats and fades. |
| `kit.style(css)` | Add CSS for this screen only. Prefix your classes with your mission: `m2-`. |

Layers, back to front: the backdrop, what you add to `kit.stage`, the actors and the bubble, a
panel, then the engine's cards. Sprout, when it is on stage, reacts to every pick by itself: glad
for `kit.score.right()`, oops for `kit.score.wrong()`.

**Effects**

| | |
|---|---|
| `kit.fx.pop(el)`, `kit.fx.shake(el)` | A bounce in. A "no" wobble. They show on any element, including one whose own class sets `animation`, and that animation carries on afterwards. |
| `kit.fx.fly(el, target, done)` | Send an element flying into another, shrinking as it goes. |
| `kit.fx.confetti(n)` | Confetti over the whole screen. |

**Scoring**

| | |
|---|---|
| `kit.score.wrong()` | A wrong pick. Plays the sound, counts toward the third star. |
| `kit.score.right()` | A right pick. Plays the sound. Counts nothing. |
| `kit.score.sprout(firstTry)` | Sprout's wrong shortcut has been caught; `true` if it was the first tap. The first call wins. It is also the agent's Judgment: +10, and +10 more on the first try. |
| `done()` | The second argument of `play`. Call it once. |

**Cleanup**: `kit.onCleanup(fn)` for anything you made outside the kit.

**Classes you can use** (from `game.css`): `sg-btn` (with `sg-primary`, `sg-danger`, `sg-huge`,
`sg-small`, and `sg-reply` for a button that is the agent's own choice),
`sg-bin` (set its color with `style="--c:#..."`), `sg-chip` (states `sg-yes`, `sg-no`, `sg-okay`,
`sg-found`), `sg-card`, `sg-kicker`, `sg-count`, `sg-face` (a round frame for an avatar or an icon),
`sg-fine`, `sg-row`, `sg-dots`, and `<kbd>` for a key hint (hidden on touch screens). Animations:
classes `sg-pop` and `sg-shake`, keyframes `sg-bounce`, `sg-pulse`, `sg-spin`, `sg-bob`.
CSS variables: `--sg-ink`, `--sg-sun`, `--sg-green`, `--sg-red`, `--sg-blue`, `--sg-purple`,
`--sg-cream`, `--sg-font`, and the agent's own two: `--sg-visor` (cyan) and `--sg-deep` (navy).

---

## 7. The art

`const A = OH.game.art`. Everything is SVG built from strings, so pictures compose by adding strings.

**Shapes** (`A.shape`), each returns a string. `w` is the outline width: 5 by default, 0 for none.

```js
const sh = A.shape;
sh.path(d, fill, w)            sh.rect(x, y, width, height, radius, fill, w)
sh.ellipse(cx, cy, rx, ry, fill, w)   sh.line(d, color, w)      sh.tube(d, color, w)   // a line with an outline
sh.text(x, y, "TEXT", size, fill)     sh.star(cx, cy, r)        // a path string: sh.path(sh.star(...), fill)
sh.cluster([[cx, cy, r], ...], fill)  // overlapping circles that read as one outlined blob
sh.leaf(x, y, scale, rotate, fill)
sh.group(inner, attrs)         sh.at(x, y, scale, inner)        // move and scale a piece
sh.dark(color), sh.light(color), sh.mix(a, b, t)                // six-digit hex colors
```

`A.svg(markup, {box: "0 0 120 120", class, fit, label})` turns a string into an `<svg>` element.
`A.C` is the palette: `ink`, `green`, `greenDark`, `leaf`, `red`, `orange`, `yellow`, `sun`, `blue`,
`purple`, `pink`, `teal`, `brown`, `wood`, `cream`, `glass`, `gray`, `grass`, `sky`, `water`, `road`.
Use these colors. Outlines are always `A.C.ink`.

**Props**, drawn around the origin: `A.prop(name, opts)` returns a string.
`truck`, `tree`, `pine`, `bush`, `flower`, `cloud`, `sun`, `envelope`, `star`, `coin`, `net`, `bin`,
`lamp`, `bench`, `fence`, `pot`, `sign`, `magnifier`, `casebook`. Most take `{color}`. Add your own:
`A.props.cardReader = (o) => sh.rect(...) + ...`.

**Icons** (48 by 48): `A.icon("envelope")` returns an element, `A.iconMarkup(name, color)` a string.
`envelope bolt sign pin pencil chat coins shield star lock clock check cross exit book sound mute
play menu magnifier leaf trash eye truck hand keys home printer skills badge up stamp`. Add your
own: `A.icons.phone = (color) => ...`.

**Stickers and lettering**: `A.sticker(icon, color)`, `A.word("CAUGHT!", {color})`, `A.logo()`.

**Characters**: `A.character(key, {mood, pose, flip, net})` returns an element;
`A.characterMarkup(...)` a string for a 200 by 280 box (a bandit: 200 by 220); `A.avatar(key, {mood})`
just the head.

- Moods, the same words for everyone: `happy`, `glad`, `proud`, `worried`, `surprised`, `oops`,
  `grumpy`, `think`, `sleepy`, `sneaky`, `caught`.
- Poses: `idle`, `wave`, `point`, `cheer`, `hips`, `shrug`.
- `net: true` drops a net over a bandit.

Add a character in your mission file. A person:

```js
A.addCharacter("tomas", { name: "Tomas", role: "A customer with half an acre of leaves", tag: A.C.orange,
  skin: A.SKIN.tan, hair: "#3a2a22", hairStyle: "short",     // short, long, bun, tail, buzz, curly, sides
  top: A.C.orange, pants: "#4a5596",
  hat: "cap", hatColor: A.C.blue,                            // cap, sunhat, tophat, visor, fedora, hardhat, bandana
  outfit: "vest", trim: A.C.sun,                             // apron, vest, overalls, sash, suit, coat, logo
  glasses: false, beard: false, mustache: false });
```

A gremlin: `{kind: "gremlin", name, role, tag, color, shape: "blob" / "slug" / "paper" / "ghost",
back(color), front(color)}`, where `back` and `front` return SVG drawn behind and in front of the
body. Anything else: `{draw(opts)}` returning SVG for a 200 by 280 box, feet at the bottom.
`tag` is the color of the name tag on the speech bubble. All eight bandits and every townsperson
are already drawn.

**The agent.** `A.agentLooks` is the list of looks the login offers (`sky`, `sunny`, `berry`,
`rosy`): robots like Sprout with a different color, head and antenna. The engine calls
`A.setAgent(look, name)` at login, and from then on the character `"agent"` is the player's own:
`A.avatar("agent")`, `A.characterMarkup("agent", {mood, pose})`. Draw it lazily (inside a function),
because a mission file is read before anybody has logged in. Never put the agent on stage as an
actor: every scene is seen through its eyes.

**The street.** `A.street(place, {gray})` returns `{el, move(p)}`: the road from the passenger seat
of the truck, with the place at the end of it. `move(0)` is setting off and `move(1)` is there. The
engine plays it between the map and a stop; a mission does not need to.

**Places**: `A.scene(key, {gray})` is the whole backdrop (sky, sun, hills, the building, a path).
It is cropped to fill the stage, so what matters sits in the middle. Add a place:

```js
A.addPlace("depot", { name: "The Depot", host: "luis",
  building: () => sh.rect(-100, -110, 200, 110, 10, A.C.orange) + ... });   // about 260 wide, up to 220 tall, standing on y = 0
```

A new place can be a scene (`kit.backdrop("depot")`). It is not on the town map: the map's eight
places are fixed by the bible, so stops use those.

**The town map**: `A.townMap("wide" or "tall", {gray, peek})`. The engine draws it; a mission
does not need to.

**Art that moves.** Put a class on a group: `sg-bob`, `sg-blink`, `sg-wave`, `sg-spin`, `sg-drift`,
`sg-float`, `sg-steam`, `sg-twinkle`. One trap: a CSS animation replaces a `transform` attribute on
the same element, so animate a wrapper: `sh.group(sh.at(40, 60, 1, thing), 'class="sg-float"')`.

---

## 8. The sound

`const S = OH.game.sound`. All of it is made in code. Nothing plays until the player presses Start,
and the sound button in the HUD mutes everything; the choice is remembered. A mission never needs to
check either.

- `S.play(name)`: `pop click blip correct wrong oops whoosh drop truck start star sticker clue
  caught color tick zip login boot gain level stamp`. `kit.score.right()` and `kit.score.wrong()`
  already play theirs; the engine plays `gain`, `level` and `stamp`.
- `S.tone(frequency, seconds, {type, vol, at, to})`: one note. `at` is seconds from now, `to` slides
  the pitch. `S.noise(seconds, {from, to, vol})`: a puff of noise, for a whoosh.
- Add an effect of your own: `S.fx.honk = () => { S.tone(300, 0.2, { type: "square" }); };` then
  `S.play("honk")`.

Keep effects short and quiet (`vol` 0.15 or less). The tune stops for the showdown and comes back
after the catch.

---

## 9. Rules for the words

**Who is speaking, and to whom.** The player is the agent, and the agent is the camera.

- **Everybody else says "you" to the agent.** Jordan, Sprout, the townspeople and the bandit talk
  straight at the camera. Use the name sparingly: `{agent}` ("Agent Ivy") for a greeting, `{name}`
  ("Ivy") from Jordan and Sprout. Never "detective".
- **The agent says "I".** Its thoughts (`who: "you"`), its replies (`kit.choose`), the `ask` of a
  challenge, the plan cards, the `how` lines of a showdown, and every line a mini-game shows as the
  player's own thinking are in the first person: "Where do I put this one?", "I sort. Jordan checks."
- **A control hint stays a plain instruction.** "Drag it, tap a bin, or press 1 to 4." Do not twist
  it into "I drag it".
- **Knowledge is about the agent itself.** A clue is something the agent now knows about how it
  works: "I sound just as sure when I am wrong." The idea from the class does not change; the point
  of view does. Where the class says "AI" or "your helper", the game says "I". Where the class says
  "you" (the owner), the game says "a person" or "Jordan".
- **Sprout is the trainer, not the helper.** Sprout had this job before. It gives tips and
  shortcuts ("Copy me", "That was my shortcut"). One shortcut a case is wrong. When caught, Sprout
  says "oops" and admits what the shortcut skipped. Sprout is never stupid and never mean.
- **The agent never sends.** No line has the agent sending, posting, publishing, paying or calling a
  customer. It sorts, drafts, checks, flags, fixes and hands over. Sending is Jordan's. A showdown
  ends with the agent on its way to Jordan, and the engine's handoff does the rest.
- **"Clue" and "case book" are off the screen.** A clue is "knowledge" or "a thing learned", and
  the case book is "What I know". (`clue` is still the field's name in a mission file.)
- **One line steps outside the story.** The debrief's second line is for the person playing: one
  thing to try for real, tonight, from the class's "do this tonight". It starts "For the person
  behind the visor:".

**And the rules that have not changed.**

- **Short, warm, funny, never talking down.** Plain words a ten-year-old and a busy owner both
  enjoy. One or two short sentences a bubble.
- **Every piece of knowledge, card and rule is a real idea from that week's class**, in one friendly
  sentence. Take them from the session's slides. Never invent a teaching point.
- **No quiz screens.** A challenge is something to do. If it reads like a test, redo it.
- No em dashes and no en dashes. A few exclamation points in speech bubbles are fine; this is a
  cartoon. Not one in every line.
- No hype words (seamless, robust, unlock, leverage, game-changing and the like). No real
  statistics. No prices. No client or employer names, and no real person's name.
- **Greenline and everyone in it are made up.** Never write a number as if a real business got it.
  Numbers from the sample data are fine; the meters are always labelled as story numbers.
- **Money is a number and the word.** "8,775 dollars", or "8,775" under a label that says dollars.
  No dollar sign anywhere in the game, the same as the week 7 tool.
- **Nothing asks for anything personal.** No real password, no email, no phone number. The agent's
  name is a made-up display name, kept in this browser.
- A wrong pick is never the player's fault. The reaction is funny or helpful, never a telling-off,
  and it says why in one line.
- The bandit gloats when the player picks the slow way, and complains that it is not fair when caught.

---

## 10. Testing a mission

1. `node --check app/game/missions/mN.js` passes.
2. Open `index.html`, press Start, log in as an agent, and play your case from the briefing to the net:
   - once with the **mouse**, dragging where there is a drag;
   - once with the **keyboard only** (Enter, arrows, number keys);
   - once in a **narrow window**, about 390 by 844, or a phone;
   - once with **reduced motion** switched on in the system settings.
3. Make a wrong pick everywhere one can be made. Each one gets a kind reaction, another try, and
   shows up in the wrong-pick count on the results card.
4. Catch Sprout's wrong shortcut on the first try, then play again and miss it first. The second
   star follows, and so does the Judgment gain. At the handoff, pick "I'll send it myself" once:
   Jordan turns it down, and nothing breaks.
5. Leave halfway (the Town map button), come back, and the case picks up at the same step. Leave in
   the middle of the showdown and nothing keeps running: no sound, no timer, no error. Open the
   Skills panel (the agent's chip in the HUD) in the middle of a challenge and close it again.
6. The browser console shows no errors from start to finish.
7. Nothing overlaps and nothing is cut off at 1280 by 800 or 390 by 844: the briefing, each stop,
   each challenge, the cards, the showdown in the middle of play, Sprout's shortcut, the handoff,
   the catch. Mind the four corners: the visor's brackets sit there.
8. Read every line aloud once. Cut any line you would skip. Check who is speaking: nobody says
   "detective", the agent says "I", and the agent never sends.
9. `python3 tools/make_starter.py --week N --out <a temp folder>` and the starter still plays, with
   your case in it and the later ones locked.

Handy while testing, in the browser console:

```js
OH.game.speed = 5                                  // everything timed by the kit runs five times faster
OH.store.clear("game:"); location.reload()         // a fresh game: no agent, no progress
OH.store.set("game:agent", {id: "t1", name: "Ivy", look: "sky", lv: 1}); location.reload()   // skip the login form
OH.store.set("game:done", {1: {stars: 3, at: new Date().toISOString(), v: 2}}); location.reload()   // unlock case 2
location.hash = "#/game/m2"                        // straight to a case that is open (it asks for a login if there is no agent)
OH.game.bible.standing()                           // the agent's experience by skill, total and level
```

---

## 11. Known limits

Things the engine does not do for you. Every one has a workaround that a case already uses.

**Time and speed**

- **`OH.game.speed` reaches only what the kit times**: `kit.after`, `kit.every`, `kit.wait`,
  `kit.tween` and `kit.timer`. **`kit.frame` runs in real time**, and so does every CSS transition
  and animation. A game loop that should speed up in testing multiplies by the speed itself, once,
  at the top of `play`: `const rate = Math.max(0.1, Number(OH.game.speed) || 1)`, then `dt * rate`
  (cases 2 and 7), or a CSS duration of `(3 / rate) + "s"` (case 3).
- `kit.fx.fly` always takes 0.34 seconds. Its `done` comes from `kit.after`, so at a high test
  speed the callback arrives before the flight has finished. Nothing may depend on where the
  element is when `done` runs.
- With reduced motion `kit.tween` jumps to its end, `kit.fx.fly` and `kit.fx.confetti` are skipped,
  and CSS animations finish at once. `kit.frame` still runs: check `kit.calm` yourself (case 6
  stops its balloons, case 7 lays the belt out as a still grid).

**Dragging**

- **`kit.drag` does not report how far the element was dragged.** `onDrop(zone, el)` gets the zone
  (or `null`) and nothing else. The element still carries its drag as an inline
  `transform: translate(Xpx, Ypx) rotate(...)` while `onDrop` runs, so read the distance from
  `el.style.transform` there (case 5 pulls its weed this way), or measure with
  `el.getBoundingClientRect()` (case 2). The transform is cleared as soon as `onDrop` returns
  anything but `true`.
- A drag is the pointer's job only. There is no keyboard drag, so every drag needs a tap and a key.
- A zone is hit when the pointer is inside its box, not when the dragged element overlaps it.
- `sg-dragging` sets `box-shadow: none` and a `filter: drop-shadow(...)`. An element that needs its
  own filter while it is dragged sets it in a rule of its own: `.m5-seed.sg-dragging{filter:...}`.

**Effects and styles**

- `kit.fx.pop` and `kit.fx.shake` leave their class (`sg-pop`, `sg-shake`) on the element. That is
  harmless, but do not use either class to mean anything else.
- An effect animates `transform`. For as long as it plays (a third of a second) it replaces a
  `transform` the element has from CSS or from an inline style, the same as any CSS animation would.
  Position a thing that gets popped or shaken with `left`, `top`, `translate` or `rotate`, or put the
  effect on a wrapper.
- A mission's CSS comes after the engine's, so at equal specificity the mission wins. `.sg button`
  sets the font and the color of every button: style a button's lettering as `.sg .m2-thing`.
- `kit.style` belongs to one screen. The briefing, each stop, the plan, the showdown and the handoff each get a new
  kit, so each one that needs your CSS calls `kit.style(CSS)` again (in `setup`, or at the top of
  `play`).
- What a mission adds to `A.icons`, `A.props`, `A.cast`, `A.places` and `S.fx` is never removed.
  Prefix the names (`m2flag`, `m8key`) so two cases cannot collide.

**Keys and focus**

- The number keys are 1 to 9. A tenth choice has no key.
- `kit.keys({Enter: fn})` does not fire while a button has the focus: Enter and Space belong to the
  focused button. For one big button that is fine (focus it). If the focus may have been lost,
  give the button an `onclick` and the same function in the key map (cases 2 and 3).
- A map that claims an arrow key (cases 2 and 7) switches off the engine's own arrow-key roving for
  that key, while the map is on.
- A disabled button cannot hold the focus. After you disable the one the player just pressed, call
  `kit.focusNext(list, n)` or `kit.focus(...)`, or the next arrow key starts again from the first
  button on the stage.

**The stage and the HUD**

- The HUD is 56 pixels tall in a wide window and the stage is everything under it. In a narrow
  window (700 pixels or less) the HUD has two rows, the buttons and then the case and the task line
  the full width: about 75 pixels tall in a talking scene, and about 63 in a mini-game, where the
  case name steps aside and only the task line shows. A task line longer than about 48 characters
  takes a second line there, which costs the mini-game 15 pixels. While a `kit.timer` clock is
  showing, the three pips step aside for it.
- **The visor sits over the stage.** Four corner brackets, within 40 pixels of each corner, and a
  soft edge. They take no clicks, but they are drawn over your mini-game: keep anything that must
  be read out of the four corners.
- **A gain floats over the stage** for about two and a half seconds, top left, under the agent's
  chip (under the card, when the results card is up). Gains still floating are cleared when a
  showdown starts, so the only one a mini-game ever sees is its own: the Judgment gain from
  `kit.score.sprout`. A level-up card waits for a quiet moment (after a thing is learned, after the
  plan, at the handoff, at the results); it never opens in the middle of a showdown.
- The ride between places is skipped with reduced motion, and any key skips it.
- `kit.say` puts a third speaker in the middle and shrinks the cast to fit. Four or more fit too,
  but they get small: a talking scene reads best with two.
- A scene is cropped to fill the stage. Keep what matters between x = 250 and x = 550 of its 800.
- The built-in `sort` lays out two to five baskets (five across, or three over two in a narrow
  window). Six or more wrap wherever they fall.

**Saving**

- A case is saved by step: briefing, stops (which ones are learned), the plan, showdown, handoff.
  **Leaving in the middle of the showdown starts the showdown again** from its target card. Wrong
  picks made before leaving still count.
- Leaving while a knowledge card is flying into the agent's memory (a third of a second) loses that
  one: the stop is played again.
- Experience is kept as a best-so-far count for each case (section 13), so playing a case again can
  only add to it, and the same thing never pays twice.
- `{agent}` and `{name}` are filled in by the engine and by `kit.say`, `kit.choose` and the built-in
  challenges. Text a mission puts on the screen itself needs `kit.fill(text)`.
- A mission file is read before anybody has logged in. Anything that draws the player's own agent
  (`A.characterMarkup("agent")`) has to run later: inside `play`, `setup`, or a card's `art` function.
- `kit.score.sprout` keeps the first call only, and the answer is saved with the case. A showdown
  that is started again after leaving halfway keeps the answer from the first time through.

---

## 12. Saving, the starter copy, the apps

**Saved state** is in `OH.store` (this browser only), all under `game:` keys:

| Key | Holds |
|---|---|
| `game:sound` | `"on"` or `"off"` |
| `game:v` | `2` once a save from before Agent Mode has been brought forward |
| `game:agent` | `{id, name, look, lv, since}`: the agent who is logged in. `lv` is the last level it was shown |
| `game:started` | `true` once this agent has begun |
| `game:name` | the name on the certificate, if the player typed one |
| `game:done` | `{week: {stars, at, last, v}}`: a closed case. `stars` is the best so far. |
| `game:run` | `{week: {phase, stops, sharp, wrong, sprout, at}}`: a case in progress |
| `game:xp` | `{week: {clues, sharp, stars, plan, catch, ask}}`: what has earned experience, best so far |
| `game:slots` | `{id: {agent, started, name, done, run, xp}}`: the other agents on this computer |
| `game:real` | `{week: true}`: the "Did it for real" bonus sticker |

A mission saves nothing itself. Up to four agents can live on one computer, each with its own
progress: "Switch agent" on the login screen lists them, starts a new one, or removes one after
asking in the page. The sound choice and the bonus sticker are shared. The game never clears a
tool's work, and it never asks for a password, an email or anything else personal.

**`objectives()`** stays on every weekly module and the game never writes to it. It is read for one
thing only, the bonus sticker.

**The starter copy.** `python3 tools/make_starter.py --week N` ships the whole engine and only the
mission files of weeks 1 to N. The other cases show on the map as locked, with the date they arrive
(the dates are in `app/course.js`). The finale opens when every case in the copy is closed, as a
"so far" screen with a certificate of progress.

**The desktop apps.** `python3 tools/build_apps.py` copies the `app/` folder as it is, so new game
files need no change there. The apps open `index.html#/game`, which is the boot splash.

---

## 13. Agent Mode

The player is Greenline's new AI agent, in the first person, and grows the way a character in a
life sim does: the more it learns, the more it can do. This section is the whole of it.

**Logging in.** After the title screen comes the agent login: a name (a default is offered, and
"Another name" suggests more), one of four looks, and Log in. It is a made-up display name, kept in
this browser, 14 characters at most. There is no password and no email, and there must never be.
A returning player sees "Welcome back, Agent Ivy" with the badge, Log in and Switch agent. Then a
short boot sequence in the agent's own voice (online, assigned to Greenline Landscaping, supervisor
Jordan Reyes, trainer Sprout, rule one), which any key skips.

**Rule one.** "Nothing goes out until a person approves it." It is in the boot sequence, on the
badge, and it is a thing the player does: after every showdown the engine runs the **handoff**. The
agent's work is listed, and there are two replies: "I'll hand it to Jordan to approve" and "I'll
send it myself". The second is always turned down. Then Jordan stamps the work Approved, and only
then does the net drop.

**First person.** Every scene is seen through the agent's eyes.

- The **visor**: corner brackets over every scene, and a HUD with the agent's face, name, level and
  experience bar (it is a button: it opens the Skills panel), and the **task line** from Jordan.
- Characters face the camera and talk to "you". The one who is speaking steps forward.
- The agent's own thoughts (`who: "you"`) are visor text: navy, cyan edge, tagged "Agent Ivy (me)".
- Every choice is a reply in the agent's own words, on a navy or cyan button with a small arrow.
- Getting from the map to a place is a short ride seen from the passenger seat (`A.street`).
- The showdown opens face to face with the bandit, with the visor locked on: "Target: Clutter".
- The town map is still the place where the agent chooses where to go.

**Skills.** Nine of them. Eight belong to a week each; Judgment runs through every case.

| Skill | Fed by | Most it can hold |
|---|---|---|
| AI at Work, Automation, Websites, Getting Found, Marketing, Leads, Data, Support and Security | case 1 to case 8, one each | 75 |
| Judgment: asking before sending, catching the wrong shortcut | every case | 40 a case, 320 in all |

Each skill shows five levels on its bar (a fifth of its most, each).

**What earns experience.** The engine does all of it; a mission only has to be played.

| What the player did | Experience | Skill |
|---|---|---|
| Learned a piece of knowledge (a stop's `clue`) | +10, three a case | the week's |
| Solved that stop's quick challenge with no wrong pick | +5, three a case | the week's |
| Earned a star | +10, three a case | the week's |
| Picked the plan | +5, and +5 more on the first try | Judgment |
| Caught Sprout's wrong shortcut (`kit.score.sprout`) | +10, and +10 more on the first try | Judgment |
| Handed the work to Jordan | +5, and +5 more for never trying to send it | Judgment |

So a case is worth 115 at most (75 and 40), and all eight are worth 920. Each line is kept as a
best-so-far count for each case, in `game:xp`: playing a case again can add to it, and can never
pay twice for the same thing. A gain floats up under the agent's chip the moment it is earned.

**Levels.** Total experience sets the level. Each level has a plain title and one permission Jordan
now trusts the agent with. They are for flavor: no case is locked behind a level.

| Level | At | Title | Jordan now trusts the agent with |
|---|---|---|---|
| 1 | 0 | New Agent | Read the inbox |
| 2 | 30 | Trainee | Sort and label |
| 3 | 90 | Helper | Draft replies |
| 4 | 170 | Assistant | Carry new leads to the sheet |
| 5 | 260 | Trusted Assistant | Draft the website words |
| 6 | 360 | Specialist | Check the map listing |
| 7 | 470 | Senior Agent | Plan a week of posts |
| 8 | 580 | Lead Agent | Draft the follow-ups |
| 9 | 690 | Office Chief | Tidy the numbers |
| 10 | 800 | Greenline's Right Hand | Run the bad-day checklist |

The tables are `SKILLS`, `LEVELS`, `PTS` and `CAP` at the top of `game.js`. Change them there.

**The Skills panel** opens from the agent's chip in the HUD at any time, on three tabs: **Skills**
(the level, and a bar for each skill), **What I know** (every case, its sticker and stars, and each
piece of knowledge learned, in the agent's own words: this is what the case book was) and
**My badge** (the ID badge, and all ten permissions, the ones still locked included).

**The ID badge** has the agent's look, name, level and title, its experience bar, the newest
permission, its supervisor and a badge number (a story number made from the agent's own id). It is
on the Welcome back screen, in the Skills panel and in the finale.

**A save from before Agent Mode** still loads. The first time the new engine sees it, it works out
what that progress had earned and writes the ledger (`migrate()` in `game.js`, once: `game:v`). For
each case already closed: three pieces of knowledge, its stars, the plan, the catch (on the first
try if the case has three stars, or if its last run says so), and the handoff in full; the
first-try gains only when the last run had no wrong pick. For a case left halfway: the knowledge
already found. The player is then asked to log in, the saved cases stay closed, and the new agent
starts at the level that experience comes to.
