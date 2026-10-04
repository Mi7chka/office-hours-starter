# How a piece is built

This project is plain HTML, CSS and JavaScript. No framework, no build step, no server, no installs.
It must keep working when someone double-clicks `index.html` (a `file://` page), so:

- **No network requests of any kind.** No `fetch`, no CDN, no fonts, no images from the web.
  Links that open another site in a new tab are fine (an AI chat, a class page).
- **No `import`, no modules, no JSON files loaded at run time.** Data ships as a `.js` file.
- **What a person types stays in their browser** (`localStorage`). Never send it anywhere.
- **Nothing sends, posts, pays or deletes.** A piece can copy text and save a file to the computer.
- **Sample data is made up** and says so. The company is Greenline Landscaping, owner Jordan Reyes,
  town Cedar Hollow, phone numbers 555-01xx, email addresses at example.com. No real people.
  No dollar amounts.

There are two kinds of module. A **piece** is one of the eight pieces of the command center, the
thing the class builds. A **tool** is one of the eight tools from version 1, now the Toolbox.
Week 1 is the worked example of a piece: read `pieces/week-1-today.js`,
`app/data/week-1-today.js`, the folder `class/week-01/` and `runbooks/session-01.json`.
Then `app/shell.js`. In the class starter, the piece of the current week is a placeholder until it
is built. The finished one is in the complete project.

## The files a week owns

| File | What it is |
|---|---|
| `pieces/week-N-name.js` | The piece. One function that runs at once and ends with `OH.register({...})`. |
| `app/data/week-N-name.js` | Its sample data: `window.OH_SAMPLE.cc.someName = ...`. Dates are counted from today with `OH.day(n)`. |
| `class/week-0N/design-note.md` | The four questions: who uses it, the one question it answers, what is on it, what done means. |
| `class/week-0N/build-details.md` | What the build prompt needs beyond the design note: the data, the page top to bottom, the exact names. |
| `class/week-0N/checks.md` | Three checks, numbered 1 to 3, one line each, that a person can verify by looking. |
| `runbooks/session-0N.json` | The 15-minute build. |
| `class/week-0N/build-prompt.md`, `runbook.md` | Built by `tools/build_runbooks.py`. Do not edit by hand. |

The file names are fixed in `app/course.js` (`pieces[].file`): `week-1-today`, `week-2-board`,
`week-3-email`, `week-4-pipeline`, `week-5-website`, `week-6-content`, `week-7-day-plan`,
`week-8-keep-running`.

## How a piece shows up

Nobody edits a list. The shell looks in the `pieces` folder for the file of every week up to
`OH_MANIFEST.week`, and sets `OH.pieceState[n]`:

| State | When | What the home screen says |
|---|---|---|
| `built` | The file is there and it registered. | The piece's number. |
| `waiting` | The file is the starter's placeholder (it calls `OH.waiting(n)`). | Not built yet, with a link to the build page. |
| `missing` | There is no file. | The same as waiting. |
| `broken` | The file is there but nothing registered. | The file needs a fix. |
| `later` | The week is after `OH_MANIFEST.week`. | Not built yet, with the week and its date. |

A file in the `pieces` folder is a piece, and its number comes from its file name. So a piece
cannot land in the wrong slot, even if the code inside says a different number.

## The piece

```js
(function () {
  const h = OH.h;
  function render(root, ctx) { /* build the page into root; call ctx.redraw() after a change */ }
  OH.register({
    piece: 2, id: "week-2-board", title: "The board",
    intro: "One sentence under the title.",
    data: ["tasks", "log"],
    render: render,
    summary: function () { return { label: "Waiting on you", value: "4 cards", tone: "warn" }; }
  });
})();
```

- `render(root, ctx)` draws everything. `ctx.redraw()` redraws the piece and keeps the scroll
  position and the keyboard focus. `ctx.week` is the week number, `ctx.piece` its entry in the course.
- `summary()` returns the one number this piece adds to the home screen: `{label, value, tone}` with
  tone `"ok"`, `"warn"`, `"bad"` or `""`. It must work before the person has done anything.
- `data` lists the data names the piece keeps. The shell's Start over button puts those back.
  Keys of its own must start with `pN:` (`OH.store.set("p6:shift", 1)`), and Start over clears those too.
- The shell adds the heading, the switch between the sample business and My business, the
  Start over button, the link to the build page, and one line about the paid version.

### The data: `OH.cc`

Two sets of data, never mixed: the sample business and the person's own.

| Call | Gives you |
|---|---|
| `OH.cc.get(name)` | The data. In the sample business: the working copy, or the sample from `OH.sample.cc[name]`. In My business: what was brought in, or `null`. |
| `OH.cc.set(name, value)` | Keeps it in this browser, in whichever set is on screen. |
| `OH.cc.own()` | `true` in My business, `false` in the sample business. |
| `OH.cc.has(name)` | Whether there is anything to show. |
| `OH.cc.setup(sentence, [steps])` | The box headed **Needs setup**. Show it when the data is `null`. Never show a made-up number in its place. |
| `OH.cc.biz()` | `{ name, owner, town }` of the business on screen. Save the person's own with `OH.cc.set("biz", {...})`. |
| `OH.cc.log(what, why, who, decision)` | Adds a line to the change log (the data name `"log"`). |
| `OH.cc.reset([names])` | Forgets the working copy of those names in the set on screen. |
| `OH.pieceSummaries()` | One line per piece: `{ week, name, nav, built, label, value, tone }`. |
| `OH.runbookLines()` | The runbook lines written at the Ship step: `{ week, piece, step, sign, undo }`. |

Every piece has the same arc: **sample data first, then your own, brought in with no connector**:
typed, pasted, or dropped in as a file with `OH.bringIn`. Where a piece uses an AI, the piece
builds the prompt (`OH.promptBox`), the person pastes it into a chat, and the answer comes back
through `OH.bringIn`, with a sample answer so it works with no AI at hand.

## The toolbox (`OH.*`, all in `app/shell.js`)

| Call | Gives you |
|---|---|
| `OH.h(tag, attrs, ...children)` | A DOM node. `attrs`: `class`, `html`, `value`, `checked`, `onclick` and other `on…` handlers, anything else as an attribute. Children: strings, nodes, arrays, `null`. |
| `OH.store.get(key, fallback)`, `OH.store.set(key, value)`, `OH.store.remove(key)` | Saved in this browser as JSON. `OH.store.all()` and `OH.store.putAll(object)` are for the backup file. |
| `OH.step(title, …)`, `OH.card(title, …)`, `OH.note(text, tone)`, `OH.badge(text, tone)`, `OH.stat(label, value, detail, tone)` | Page parts. Tones: `ok`, `warn`, `bad`, `blue`. |
| `OH.check(text, done, onChange, extra)` | One line with a tick box. |
| `OH.field(label, input, hint)` | A labelled form control. |
| `OH.tabs(key, [{id, label, count, render(panel)}])` | Tabs inside a piece. The open tab is remembered. |
| `OH.table(cols, rows, opts)` | A sortable table. `cols`: `[{h, f(row), s(row)}]`. `opts`: `{rowClass(row), empty, sort}`. Row classes `hot` and `done` are styled. |
| `OH.bars([{label, value}], {unit, fmt})` | A horizontal bar chart. |
| `OH.bringIn({label, hint, placeholder, accept, sample, sampleLabel, useLabel, onText(text, fileName)})` | The way in with no connector: choose a file, drop a file, or paste text. With `image: true` it takes a picture and calls `onImage(dataUrl, fileName)`. |
| `OH.promptBox({prompt, data, dataLabel, height})` | An editable prompt with copy buttons and links to an AI chat. Returns `{el, text()}`. `data` may be a function. |
| `OH.pasteBox({label, placeholder, sample, onUse, useLabel})` | Where an AI's answer comes back. The Toolbox tools use it; pieces use `OH.bringIn`. |
| `OH.copy(text, what)`, `OH.download(filename, text, type)`, `OH.toast(message)` | Clipboard, a file saved to the computer, a short message. |
| `OH.parseCSV(text)`, `OH.rows(text)`, `OH.toCSV(rows, sep)` | CSV or tab-separated text. `rows` gives objects keyed by the heading row in lower case. |
| `OH.md(text)` | A small markdown reader for the class notes: headings, lists, bold, code. |
| `OH.today()`, `OH.day(n)`, `OH.daysBetween(from, to)`, `OH.niceDate(iso)` | Dates. `OH.day(n)` is today plus n days. |
| `OH.course`, `OH.course.pieces`, `OH.course.steps`, `OH.course.business` | The season, the six steps and the sample business. |

CSS classes you can use: `grid g2|g3|g4`, `row`, `spacer`, `card`, `first` (a card with a blue
edge), `stat`, `badge`, `note`, `wrap`, `piles`, `pile`, `item` (and `item moved`, `item flag`),
`sub`, `check`, `tabs`, `drop`, `cal` with `dow`, `cell`, `dn`, `post`, `chips`, `mut`, `ok`,
`warn`, `bad`, `kicker`, `lead`, `code` (on a `pre`), `f` (on a form `label`), buttons `primary`,
`small`, `ghost`. If you need a style that is not there, set it inline. Do not edit `app/shell.css`
from a piece.

## The class notes and the build prompt

`python3 tools/build_runbooks.py` puts each week's `build-prompt.md` together from five parts:

1. `class/shared/prompt-frame.md`: the template, with the two lines on how to use it in each tool.
2. `class/shared/contract-card.md`: the context every prompt carries, so it works in the Claude
   app with no access to the folder.
3. The week's `design-note.md`, word for word.
4. The week's `build-details.md`.
5. The rules, from the section "The rules" in `class/week-01/rules.md`.

So a change to the rules or to a design note reaches every prompt the next time the script runs.
The same script builds `app/data/class.js`, which is what the build page in the app shows.
Everything under the line `---` in `build-prompt.md` is what goes to the AI.

## The runbook (`runbooks/session-0N.json`)

The 15-minute build Mitchell runs live, with the class doing it beside him. The slide decks are
made from these files, so the shape does not change.

- `minutes` is 15 and the steps' `min` values add up to exactly 15. Six to eight steps.
- The steps follow the six steps in order, and each `do` starts with its step: `Design:`,
  `Prompt:`, `Review:`, `Test:`, `Ship:`, `Log:`.
- Each step: `at` (clock from 0:00), `min`, `do` (what to click or type, an order),
  `see` (the visible sign it worked), `tip` (optional, one sentence).
- `real_life`: three things to do with their own business this week.
- `if_it_breaks`: two or three recoveries, the first being "take the finished file from the
  complete project and keep going".
- Plain words, short sentences, no dashes, no exclamation points, no dollar amounts.

## The Toolbox tools (version 1)

The eight tools in `app/modules/` keep their own contract. They register with `week:` and the
game reads them by that number, so they stay as they are.

- Files: `app/modules/wN-name.js`, `app/data/wN-name.js`, `runbooks/toolbox/session-0N.json`,
  `prompts/week-N-*.txt`, `samples/week-N-*`. The names are listed in `app/manifest.js`.
- `OH.register({ week: 3, id: "w3-homepage", title, intro, render, summary, objectives })`.
- Every stored key starts with `wN:`, and the shell's Start over button clears those.
- `objectives()` is read by the game, and only for its bonus sticker. See `GAME.md`.

## Rules for the words

Friendly, direct, plain. A smart friend who builds software. No hype words: the list is in
`tools/check_words.py`. No em dashes or en dashes. No statistics from outside. No client or
employer names. No dollar amounts and no prices for Mitchell's services. Real app names are welcome
(Gmail, Google Calendar, Google Sheets, Excel, QuickBooks, Square, Canva, Search Console, Claude):
name the job the app does, never a menu or a price you are not sure of, and never imply a
partnership. Say "if your Claude plan has the Gmail connector", and never promise that it does.

## Before you call a week done

1. `node --check` passes on the piece and on its data file.
2. `python3 tools/build_runbooks.py` prints no note about your week.
3. `python3 tools/check_words.py` ends with 0 finds.
4. The piece does what its `build-details.md` says, word for word: that file is what the class's
   AI will build from.
5. The three checks pass with the sample business. In My business with nothing brought in, the
   piece says Needs setup and shows no number.
6. It works with the keyboard, and at 390 wide with no sideways scroll.
