# Save Greenline: The Case of the Busywork Bandits

The guide for anyone writing a mission. Read this and `app/game/missions/m1.js`, and you can write
mission 2.

The game is a bright cartoon adventure that teaches the same ideas as the eight weekly tools. It is
self-contained play: the tools (`#/w1` to `#/w8`) are the class's hands-on lab and the game never
changes them. The game is optional. The class and every tool work without it.

Contents: [the story bible](#1-the-story-bible) · [the files](#2-the-files) ·
[a mission file](#3-a-mission-file) · [the quick challenges](#4-the-quick-challenges) ·
[writing a showdown](#5-writing-a-showdown) · [the kit](#6-the-kit-everything-a-mini-game-is-given) ·
[the art](#7-the-art) · [the sound](#8-the-sound) · [rules for the words](#9-rules-for-the-words) ·
[testing a mission](#10-testing-a-mission) · [the old format](#11-missions-still-in-the-old-format) ·
[saving, the starter copy, the apps](#12-saving-the-starter-copy-the-apps)

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

- **You**: Greenline's new office detective. The player is spoken to ("Detective!") and never
  speaks. There is a drawing (`detective`) for a mission that wants one.
- **Jordan Reyes** (`jordan`): owns Greenline. The chief who briefs you.
- **Luis** (`luis`): the crew lead. Drives the green truck.
- **Sprout** (`sprout`): your sidekick, a small eager helper robot with a leaf antenna. Sprout is
  the AI: very fast, very keen, and **wrong about exactly one thing in every mission**, which the
  player has to catch. The line that sums it up: "Sprout drafts. You decide."
- **The townspeople**: Dana, Bea, Mayor Maple, Nell, Penny and Gus, one at each place. Each one gives
  a clue. They are warm, a little funny, and each knows one thing about working with a helper.
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

1. **The briefing** at HQ. A cutscene with speech bubbles. Jordan says what the bandit has done.
2. **The town map.** The player drives the truck to three places. At each, a townsperson gives one
   clue (one real idea from that week's class) and a quick challenge of about 20 seconds (tap, drag
   or pick) that makes the idea stick. The clues collect in the case book.
3. **Crack the case.** With three clues, the player picks the right move to stop the bandit: three
   cartoon cards. A wrong pick gets a funny reaction and another try.
4. **The showdown.** An arcade mini-game that IS the week's job, done with the hands. Then Sprout
   proudly shows its own work, and the player has to spot the one thing Sprout got wrong and fix it.
5. **Caught.** The net drops, the stars and a sticker land in the case book, the gray part of town
   bursts back into color, and the truck drives home. "Try it for real" opens that week's tool.

**Progress you can see.** The town starts partly gray and gains color case by case. Cases unlock in
order. A case that is not in this copy yet shows as a locked case with the date it arrives.

One rule about the gray, so nobody has to ask: on the **town map** every place a bandit still holds
is gray. Up close, a scene is drawn **in color**, except the case's own zone while its bandit is
loose (in case 1 that is HQ, from the briefing to the catch). A gray scene is no fun to stand in.

**Scoring.** Up to three stars a case:

1. the case is closed;
2. Sprout's mistake was caught on the first try;
3. few wrong picks in the whole case (three or fewer, unless the mission sets `maxWrong`).

The best result is kept. A case can be played again. The story meters (hours of busywork saved each
week, leads answered, dollars found) add up from each mission's `reward`, and are always labelled
as story numbers for a made-up company. A bonus sticker, "Did it for real", appears in the case
book when the week's tool reports its required `objectives()` done. That is the only thing the game
reads from a tool, and it is read only.

**It teaches without lecturing.** Every clue, card and mini-game rule is a real idea from the class,
said in one short friendly sentence. No quiz screens. Reading stays short. The hands do the learning.

**Look, sound and feel.** Bright flat colors, one thick dark outline on everything, chunky rounded
buttons, bouncy motion, characters that blink and bob, speech that types itself, confetti and
stickers. All art is drawn in code (SVG). Sound is made in code. No image files, no fonts, no
emoji, no libraries, no network.

---

## 2. The files

| File | What it is |
|---|---|
| `app/game/art.js` | Every picture: shapes, props, icons, characters, places, scenes, the town map |
| `app/game/sound.js` | Every sound: the tune and the effects, made with the Web Audio API |
| `app/game/kit.js` | The toolbox a screen or a mini-game is given, and the four built-in quick challenges |
| `app/game/game.js` | The engine: entrance, town map, the case flow, scoring, saving, the case book, the finale |
| `app/game/fallback.js` | Plays a mission file that is still in the old format (section 11) |
| `app/game/game.css` | The look. Every class starts with `sg-` |
| `app/game/missions/mN.js` | One case. **The only file a mission author writes** |

`app/shell.js` loads them in that order, then the mission files of the weeks in this copy. The
addresses are `#/game` (the entrance, then the town map), `#/game/mN` (a case) and `#/game/done`
(the finale). While the game is on, the app's header and footer are hidden. The HUD has the way out.

The rules of the house are the same as `MODULES.md`: no network requests, no `import`, no libraries,
no files loaded at run time, and it must work from a double-clicked `index.html`. A mission **never
edits the engine**. If the engine cannot do something you need, add it to your own file first; if
three missions need it, it moves into the engine.

---

## 3. A mission file

A mission is one file that calls `OH.game.mission({...})` once. This is the whole format, with a
small mini-game of its own so you can see every part working together. It is an example, not the
real case 2. `m1.js` is the full-size model.

```js
/* Save Greenline · case N: the title. Bandit: who, and what it does.
   What it teaches (session N of the class): the three ideas, in a line each.
   Everything in it is made up. */
(function () {
  "use strict";
  if (!window.OH || !OH.game || !OH.game.mission || !OH.game.art) return;
  const h = OH.h, A = OH.game.art, S = OH.game.sound;

  /* The mini-game. The engine gives you an empty stage and the kit. Call done() when the bandit is
     beaten. You never tidy up: timers, keys, drags and styles from the kit vanish with the screen. */
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

    // Sprout's turn: it is wrong about exactly one thing, and the player has to catch it
    const p = kit.panel({ kicker: "Sprout's turn", title: "Sprout drafted three replies. One should not be sent. Tap it.", who: "sprout" });
    let tries = 0;
    await new Promise((resolve) => {
      ["Thanks, Tomas. Two times that work for a visit?", "Hi Hannah, sorry for the wait.", "Owen, your quote is half price!"].forEach((text, n) => {
        const b = h("button", { class: "sg-chip", type: "button", onclick: () => {
          if (n !== 2) { tries++; b.disabled = true; b.classList.add("sg-okay"); kit.score.wrong(); return p.say("That draft is fine. Look again.", "bad"); }
          b.classList.add("sg-found"); kit.score.right();
          kit.score.sprout(tries === 0);                         // the second star. Call it once.
          p.say("Sprout made up a price. Nothing goes out until you have read it.", "ok"); kit.after(1400, resolve);
        } }, text);
        p.body.appendChild(b);
      });
    });
    p.close();
    kit.cast([{ who: "slowpoke", side: "left", mood: "surprised" }, { who: "sprout", side: "right", mood: "proud" }]);
    await kit.say([{ who: "slowpoke", mood: "surprised", say: "Answered already? But I was napping." }]);
    done();
  }

  OH.game.mission({
    week: 2,                                      // 1 to 8. Fixes the bandit, the gray zone and the sticker (section 1).
    title: "The Lead That Waited All Night",      // the case name. 34 characters or fewer.
    badge: { name: "Lead Catcher" },              // the sticker's name, three words or fewer. icon and color come from the bible.
    reward: { hours: 2, leads: 1, money: 0 },     // story numbers: small, whole, and they fit the sample data.
    maxWrong: 3,                                  // optional. Wrong picks allowed for the third star. Default 3.

    /* The briefing at HQ. A list of lines, or {setup, lines} when the scene wants extra art.
       A line: who (a character key, or "narrator"), say, and optionally mood and pose. */
    briefing: [
      { who: "jordan", mood: "worried", pose: "shrug", say: "A lead came in at 9 PM. Nobody saw it." },
      { who: "sprout", mood: "glad", pose: "wave", say: "I was awake! Nobody told me to look." }
    ],

    /* Exactly three clue stops. place: a key from section 1. who: the host, if not the place's own.
       lines: two to four. challenge: section 4. clue: one real idea from the class. */
    stops: [
      { place: "bank", who: "penny",
        lines: [{ who: "penny", mood: "happy", say: "Every automation has three parts. Most people forget the third." }],
        challenge: { type: "pick", ask: "When this happens, do that, and what?", options: ["Do it again", "Tell me", "Send it to the customer"], answer: 1 },
        clue: { title: "Tell me", text: "When this happens, do that, and tell me. The notice is the check, so quiet never means broken." } },
      { place: "workshop", /* ... */ },
      { place: "square", /* ... */ }
    ],

    /* Crack the case: three cards, exactly one with right: true. Leave `crack` out to skip the step. */
    crack: {
      lines: [{ who: "sprout", mood: "glad", say: "Three clues. So how do we stop Slowpoke?" }],
      ask: "What is the move?",
      cards: [
        { title: "Check the sheet more often", text: "Set an alarm. Every hour. All night.", icon: "clock",
          react: { who: "slowpoke", mood: "glad", say: "Lovely. I will wait between the alarms." } },
        { title: "The form tells Jordan", text: "It saves the lead, tells a person, and drafts the reply.", icon: "bolt", right: true,
          react: { who: "jordan", mood: "glad", say: "That's it. The carrying is automatic. The sending is mine." } },
        { title: "Sprout answers everyone", text: "Straight away. Nobody reads it first.", icon: "chat",
          react: { who: "sprout", mood: "oops", say: "I might promise something we cannot do." } }
      ]
    },

    /* The showdown: a title, two or three lines of how to play, and play(kit, done). */
    showdown: { title: "Beat the clock", how: ["Three leads are waiting. Answer each one.", "Tap a lead, or press 1, 2 or 3.", "Then check Sprout's drafts."], play: waitingRoom },

    /* After the catch: two lines. The second is one thing to try for real, tonight. */
    debrief: [
      { who: "jordan", mood: "glad", pose: "cheer", say: "One lead, from the form to a checked draft, and nobody retyped a word." },
      { who: "sprout", mood: "proud", say: "Tonight, fill out your own website form as a made-up customer. Time the gap." }
    ],
    next: "Next case: Greenline's home page gets three seconds."   // one line. Case 8 has none.
  });
})();
```

### Every field

| Field | Needed | What it is |
|---|---|---|
| `week` | yes | 1 to 8. The bandit, the gray zone and the sticker come from the bible table by week. |
| `title` | yes | The case name on the map, the HUD and the wanted poster. 34 characters or fewer. |
| `badge.name` | yes | The sticker's name. `badge.icon` and `badge.color` override the bible, which you should not need. |
| `reward` | yes | `{hours, leads, money}`: small whole story numbers that fit the sample data. |
| `maxWrong` | no | Wrong picks allowed for the third star. Default 3. A long showdown may allow 4. |
| `bandit`, `zone` | no | Override the bible. Do not, unless the bible itself changes. |
| `briefing` | yes | Lines, or `{place, cast, setup(kit), lines}`. Default place `hq`, default cast Jordan and Sprout. 5 to 8 lines. |
| `stops` | yes | Three of `{place, who, lines, challenge, clue: {title, text}}`. Also `cast` and `setup(kit)`. |
| `crack` | no | `{lines, ask, cards}`. A card: `{title, text, right, react: {who, mood, say}, icon or art, color}`. `art` is SVG for a 120 by 120 box. |
| `showdown` | yes | `{title, how: [..], play(kit, done)}`. |
| `debrief` | yes | Two lines, spoken after the catch by Jordan and Sprout. |
| `next` | no | One line that teases the next case. |

A line of dialogue is `{who, say, mood, pose}`. `who` is any character key, or `"narrator"` for a
line nobody speaks. A character keeps its last mood and pose until a line changes them. One or two
short sentences a line, 110 characters or fewer: a bubble has to fit a phone.

`setup(kit)` runs once the backdrop and the cast are up and before the first line. Use it to add
art to that scene (case 1 puts Clutter on a storm cloud over HQ and rains envelopes).

---

## 4. The quick challenges

A clue stop's `challenge` names one of four built-in types. Each takes about 20 seconds, works with
mouse, touch and keys, and counts wrong picks for you. `ask` is the one-line instruction.

**`pick`**: one right answer.

```js
{ type: "pick", ask: "...", options: ["...", "...", "..."], answer: 1,
  yes: "said when right", nope: "said when wrong" }          // nope may be a list, one per option
```

**`sort`**: one card at a time into the right basket: drag it, tap a basket, or press its number.

```js
{ type: "sort", ask: "...",
  bins: [{ key: "a", label: "...", icon: "bolt", color: A.C.green }, { key: "b", label: "..." }],   // two to four
  items: [{ text: "...", bin: "a", why: "one line, shown for a right or a wrong pick" }] }
// bin may be a list, ["a", "b"], when more than one basket is a fair answer
```

**`tap`**: find every right one among the decoys.

```js
{ type: "tap", ask: "Tap the five things ...", items: [{ text: "...", ok: true, why: "..." }, { text: "...", ok: false, why: "..." }] }
```

**`spot`**: things already sorted into groups, exactly one in the wrong group. Tap it.

```js
{ type: "spot", ask: "...", nope: "said for a wrong tap",
  groups: [{ label: "...", color: A.C.blue, items: [{ text: "..." }, { text: "...", wrong: true, why: "..." }] }] }
```

**Your own.** Give `play` instead of `type`: `challenge: { ask: "...", play: function (kit, spec, done) { ... } }`.
Build it with `kit.panel()` so it looks like the others, call `kit.score.wrong()` for a wrong pick
and `done()` when it is solved. To share a new type with other missions, add it to
`OH.game.challenges.myType`.

Use at least two different types across the three stops. A challenge practises the clue it earns:
the player should feel the idea in their hands before they read it.

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
4. A wrong pick calls `kit.score.wrong()`. Catching Sprout's mistake calls
   `kit.score.sprout(firstTry)` exactly once.
5. You call `done()` once. The engine closes the case, drops the net and takes it from there.
6. Teardown is automatic. Anything the kit gave you (timers, key maps, listeners added with
   `kit.on`, drags, styles from `kit.style`, the stage's contents) is removed when the screen
   changes, including when the player leaves halfway. Only things you made yourself outside the
   kit (a raw `setInterval`, a listener on `window`) need `kit.onCleanup(fn)`.

`play` may be an `async` function. If it throws, the engine shows a way to close the case anyway.

**Every showdown has the same three beats.**

1. **The job, by hand.** The week's job as an arcade game: sort, match, catch, order, fix. It must
   be the real job, not a metaphor for it. No fail state: a wrong pick bounces back with one line of
   help, and the player tries again.
2. **Sprout's turn.** Sprout does the same job in seconds, proudly. It is wrong about exactly one
   thing. Use the planted mistake from that week's sample answer where there is one.
3. **The catch and the fix.** The player finds the wrong one and puts it right.

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
| `kit.drag(el, opts)` | Drag with a mouse or a finger. `zones`: the elements it can be dropped on (or a function returning them). `onDrop(zone or null, el)`: return `true` to keep the element where it was let go; anything else sends it back. `onOver(zone)`, `onStart(el)`, `disabled()`. The zone under the pointer gets the class `sg-over`. |
| `kit.on(target, type, fn)` | `addEventListener` that is removed with the screen. |
| `kit.focus(el)` | Move the keyboard focus. Do it whenever a new set of buttons appears. |

A tap is a `<button>` with `onclick`. Buttons are focusable and work with Enter, so use real buttons.

**The stage: backdrop, actors, speech**

| | |
|---|---|
| `kit.backdrop(place, {gray})` | A place's scene behind everything. Or pass an `<svg>` of your own. Returns the element. |
| `kit.cast(list)` | Put characters on stage: `["jordan", "sprout"]` or `[{who, side: "left" / "right" / "center", mood, pose}]`. `kit.cast([])` clears them. |
| `kit.actor(who, {mood, pose})` | Change one actor (it is added if it is not on stage). Returns `{el, set(), hop()}`. |
| `kit.say(lines)` | Speak the lines one at a time. The text types itself; a tap, Enter or Space finishes the line, then moves on. Returns a Promise. |
| `kit.choose(options)` | Buttons under the last line: `[{label, value, icon}]`. Resolves with the value. |
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
| `kit.fx.pop(el)`, `kit.fx.shake(el)` | A bounce in. A "no" wobble. |
| `kit.fx.fly(el, target, done)` | Send an element flying into another, shrinking as it goes. |
| `kit.fx.confetti(n)` | Confetti over the whole screen. |

**Scoring**

| | |
|---|---|
| `kit.score.wrong()` | A wrong pick. Plays the sound, counts toward the third star. |
| `kit.score.right()` | A right pick. Plays the sound. Counts nothing. |
| `kit.score.sprout(firstTry)` | Sprout's mistake has been caught; `true` if it was the first tap. The first call wins. |
| `done()` | The second argument of `play`. Call it once. |

**Cleanup**: `kit.onCleanup(fn)` for anything you made outside the kit.

**Classes you can use** (from `game.css`): `sg-btn` (with `sg-primary`, `sg-danger`, `sg-huge`),
`sg-bin` (set its color with `style="--c:#..."`), `sg-chip` (states `sg-yes`, `sg-no`, `sg-okay`,
`sg-found`), `sg-card`, `sg-kicker`, `sg-count`, `sg-face` (a round frame for an avatar or an icon),
`sg-fine`, `sg-row`, `sg-dots`, and `<kbd>` for a key hint (hidden on touch screens). Animations:
classes `sg-pop` and `sg-shake`, keyframes `sg-bounce`, `sg-pulse`, `sg-spin`, `sg-bob`.
CSS variables: `--sg-ink`, `--sg-sun`, `--sg-green`, `--sg-red`, `--sg-blue`, `--sg-purple`,
`--sg-cream`, `--sg-font`.

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
play menu magnifier leaf trash eye truck hand keys home printer`. Add your own: `A.icons.phone = (color) => ...`.

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

**Places**: `A.scene(key, {gray})` is the whole backdrop (sky, sun, hills, the building, a path).
It is cropped to fill the stage, so what matters sits in the middle. Add a place:

```js
A.addPlace("depot", { name: "The Depot", host: "luis",
  building: () => sh.rect(-100, -110, 200, 110, 10, A.C.orange) + ... });   // about 260 wide, up to 220 tall, standing on y = 0
```

A new place can be a scene (`kit.backdrop("depot")`). It is not on the town map: the map's eight
places are fixed by the bible, so clue stops use those.

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
  caught color tick zip`. `kit.score.right()` and `kit.score.wrong()` already play theirs.
- `S.tone(frequency, seconds, {type, vol, at, to})`: one note. `at` is seconds from now, `to` slides
  the pitch. `S.noise(seconds, {from, to, vol})`: a puff of noise, for a whoosh.
- Add an effect of your own: `S.fx.honk = () => { S.tone(300, 0.2, { type: "square" }); };` then
  `S.play("honk")`.

Keep effects short and quiet (`vol` 0.15 or less). The tune stops for the showdown and comes back
after the catch.

---

## 9. Rules for the words

- **Short, warm, funny, never talking down.** Plain words a ten-year-old and a busy owner both
  enjoy. One or two short sentences a bubble.
- **Every clue, card and rule is a real idea from that week's class**, in one friendly sentence.
  Take them from the session's slides. Never invent a teaching point.
- **No quiz screens.** A challenge is something to do. If it reads like a test, redo it.
- No em dashes. A few exclamation points in speech bubbles are fine; this is a cartoon. Not one in
  every line.
- No hype words (seamless, robust, unlock, leverage, game-changing and the like). No real
  statistics. No prices. No client or employer names.
- **Greenline and everyone in it are made up.** Never write a number as if a real business got it.
  Numbers from the sample data are fine; the meters are always labelled as story numbers.
- A wrong pick is never the player's fault. The reaction is funny or helpful, never a telling-off,
  and it says why in one line.
- Sprout is never stupid and never mean. Sprout is fast, keen, sure of itself, and wrong about one
  thing. When caught, Sprout says "oops" and learns the rule.
- The bandit gloats when the player picks the slow way, and complains that it is not fair when caught.
- The debrief's second line is one thing to try for real, tonight, from the class's "do this tonight".

---

## 10. Testing a mission

1. `node --check app/game/missions/mN.js` passes.
2. Open `index.html`, press Start, and play your case from the briefing to the net:
   - once with the **mouse**, dragging where there is a drag;
   - once with the **keyboard only** (Enter, arrows, number keys);
   - once in a **narrow window**, about 390 by 844, or a phone;
   - once with **reduced motion** switched on in the system settings.
3. Make a wrong pick everywhere one can be made. Each one gets a kind reaction, another try, and
   shows up in the wrong-pick count on the results card.
4. Catch Sprout's mistake on the first try, then play again and miss it first. The second star
   follows.
5. Leave halfway (the Town map button), come back, and the case picks up at the same step. Leave in
   the middle of the showdown and nothing keeps running: no sound, no timer, no error.
6. The browser console shows no errors from start to finish.
7. Nothing overlaps and nothing is cut off at 1280 by 800 or 390 by 844: the briefing, each stop,
   each challenge, the cards, the showdown in the middle of play, Sprout's mistake, the catch.
8. Read every line aloud once. Cut any line you would skip.
9. `python3 tools/make_starter.py --week N --out <a temp folder>` and the starter still plays, with
   your case in it and the later ones locked.

Handy while testing, in the browser console:

```js
OH.game.speed = 5                                  // everything timed by the kit runs five times faster
OH.store.clear("game:"); location.reload()         // a fresh game
OH.store.set("game:done", {1: {stars: 3, at: new Date().toISOString()}}); location.reload()   // unlock case 2
location.hash = "#/game/m2"                        // straight to a case that is open
```

---

## 11. Missions still in the old format

A mission file with `scene`, `stakes`, `quiz` and `debrief` and no `stops` is in the old format.
`app/game/fallback.js` turns it into a playable case so the game is never broken while the others
are rewritten:

- its `scene` becomes the briefing (told by a narrator, with its `stakes` as Jordan's line);
- its three `quiz` questions become three clue stops: a townsperson asks, the options are a `pick`
  challenge, and the question's `why` is the clue;
- there is no "crack the case" step;
- a short generic showdown stands in: tag the bandit five times as it pops out of the bushes, then
  find the one case note Sprout got wrong (one of the three questions, answered wrongly).

To rewrite one, replace the whole file with the new format. When all eight have `stops` and a
showdown of their own, delete `fallback.js` and remove `"fallback"` from `GAME_FILES` in
`app/shell.js`. Nothing in `fallback.js` is a model for a new mission.

---

## 12. Saving, the starter copy, the apps

**Saved state** is in `OH.store` (this browser only), all under `game:` keys:

| Key | Holds |
|---|---|
| `game:started` | `true` once a game has begun |
| `game:sound` | `"on"` or `"off"` |
| `game:name` | the name on the certificate |
| `game:done` | `{week: {stars, at, last}}`: a closed case. `stars` is the best so far. |
| `game:run` | `{week: {phase, stops, wrong, sprout, at}}`: a case in progress |
| `game:real` | `{week: true}`: the "Did it for real" bonus sticker |

A mission saves nothing itself. "New game" in the menu clears everything but the sound choice,
after asking twice in the page. The game never clears a tool's work.

**`objectives()`** stays on every weekly module and the game never writes to it. It is read for one
thing only, the bonus sticker.

**The starter copy.** `python3 tools/make_starter.py --week N` ships the whole engine and only the
mission files of weeks 1 to N. The other cases show on the map as locked, with the date they arrive
(the dates are in `app/course.js`). The finale opens when every case in the copy is closed, as a
"so far" screen with a certificate of progress.

**The desktop apps.** `python3 tools/build_apps.py` copies the `app/` folder as it is, so new game
files need no change there. The apps open `index.html#/game`, which is the boot splash.
