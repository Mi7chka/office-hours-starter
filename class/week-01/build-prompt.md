# Week 1 build prompt · The Today page

- **In the Claude app:** paste everything below the line and send. Save the file it makes as `week-1-today.js` in the `pieces` folder of your project.
- **In Claude Code:** open your project folder and paste the same prompt. It writes `pieces/week-1-today.js` for you.

---

## Role

You are a careful web developer helping a small business owner who is not technical. You build one small piece at a time. You keep to the design note, and you say plainly what you were unsure about.

## Context

If you can read the files in my project folder, read `MODULES.md` first. If you cannot, everything you need is here.

**The app and how a piece fits in**

- The app is plain HTML, CSS and JavaScript. It opens with a double-click as a `file://` page. There is no server and no internet.
- A piece is ONE JavaScript file. No import, no export, no fetch, no outside script, font or picture. No new libraries.
- The app loads the file by itself when it sits in the `pieces` folder with the right name. Change no other file.
- The whole file is one function that runs at once and ends by registering the piece, in this shape:

```js
(function () {
  const h = OH.h;
  function render(root, ctx) { /* build the page into root. Call ctx.redraw() after a tick, a button press or a choice in a list. Never from a text input. */ }
  OH.register({
    piece: 1,
    id: "week-1-today",
    title: "The page heading",
    intro: "One sentence under the heading.",
    data: ["the data names this piece keeps"],
    render: render,
    summary: function () { return { label: "A few words", value: "3", tone: "warn" }; }
  });
})();
```

`root` is empty each time. The app draws the title, the intro and the Sample business / My business switch above it. Do not draw a heading.

**The toolbox the app gives you. Use it, do not write your own.**

- `OH.h(tag, attrs, ...children)` makes a page element. `attrs` can hold `class`, `style`, `value`, `checked`, `placeholder`, `type`, and handlers such as `onclick` or `onchange`. `style` is text such as `"font-weight:700"`, not an object. Children are text, elements, lists, or null.
- `OH.cc.get(name)` reads data. `OH.cc.set(name, value)` keeps it in this browser. `OH.cc.own()` is true when the person looks at their own business, and false for the sample business.
- In the sample business, `OH.cc.get(name)` returns made-up sample data that is already in the app. In My business it returns `null` until the person brings their own data in. When it is `null`, show `OH.cc.setup(sentence, [steps])`, which returns the box headed Needs setup. Add it to the page like any other element. Never show a made-up number in its place.
- `OH.cc.biz()` gives `{ name, owner, town }` for the business on screen. `OH.cc.log(what, why)` adds a line to the change log.
- `OH.step(title, ...children)` a numbered section. `OH.card(title, ...children)` a card. `OH.note(text, tone)` a note. `OH.badge(text, tone)` a small label. `OH.stat(label, value, detail, tone)` a number tile. Tones: `"ok"`, `"warn"`, `"bad"`, `"blue"`.
- `OH.check(text, done, onChange, extra)` one line with a tick box. `onChange(ticked)` gets true or false, not an event. `OH.field(label, inputElement, hint)` a labelled input.
- `OH.table(columns, rows, options)` a table. `columns`: `[{ h: "Heading", f: (row) => cell }]`. `options`: `{ empty: "words for no rows", rowClass: (row) => "hot" or "done" }`.
- `OH.tabs(key, [{ id, label, count, render: (panel) => {} }])` tabs inside the piece. It remembers the open tab.
- `OH.bringIn({ label, hint, placeholder, sample, useLabel, onText: (text, fileName) => {} })` the way to bring data in with no connector: choose a file, drop a file, or paste text. `sample` is optional text for a Load the sample file button.
- `OH.promptBox({ prompt, data, dataLabel })` returns `{ el }`: a prompt the person copies into an AI chat. `OH.pasteBox({ label, sample, onUse: (text) => {} })` is where the AI's answer comes back.
- `OH.rows(text)` turns CSV text into a list of objects, keyed by the header row in lower case. `OH.toCSV(rows)` makes CSV text from a list of lists: the first inner list is the headings and each one after it is one row of cells, such as `[["title", "lane"], ["Order mulch", "Doing"]]`. It does not take the objects that `OH.rows` gives back. `OH.download(fileName, text)` saves a file. `OH.copy(text, "What was copied")` copies. `OH.toast(message)` shows a short message.
- `OH.today()` is today as `"2026-10-07"`. `OH.day(n)` is today plus n days. `OH.daysBetween(from, to)` counts days. `OH.niceDate(date)` reads like `Wed, Oct 7`.
- CSS classes already there: `steps` (put the whole page inside one `div` with this class: it spaces the cards apart and numbers each `OH.step` 1, 2, 3), `grid g2 g3 g4`, `row`, `spacer`, `card`, `mut` (grey text), `piles` with `pile` and `item` (columns of cards), `first` (a card with a blue edge; a `div` with the class `big` inside it holds large text), and buttons `primary` and `small`.

**Rules for the page**

- Words on the page are plain and short. No em dashes. No hype words. No dollar amounts.
- The page never sends, posts, pays or deletes. It can copy text and save a file to the computer, nothing more.
- Keep what the person types with `OH.cc.set`, so it is still there after a refresh.
- It works with the keyboard, and at the width of a phone (390 wide) with no sideways scroll.

## The design note

**Who uses it.** Jordan Reyes, the owner of Greenline Landscaping. Jordan opens it each morning before the crew leaves the yard.

**The one question it answers.** What needs me today?

**What is on it.**

- Today's date and the name of the business.
- The one thing to do first, at the top, bigger than the rest.
- The rest of today's list, up to five lines, each with a tick box.
- A count of how many are done.
- A way to write today's list: one thing per line, and the first line is the one thing first.
- One line for every other piece of the command center, with its number. A piece that is not built yet says so.

**What done means.**

- It opens with a double-click on Launch, with nothing to install.
- The first thing is at the top, and it is the first line I typed.
- A tick is still there after I refresh the page.
- Nothing on it is invented. With my own business and no list yet, it says Needs setup.

## What to build

Build the Today page as the file `week-1-today.js`.

**The data**

- The data name is `"today"`. `OH.cc.get("today")` returns `{ date: "2026-10-07", first: "text", firstDone: false, list: [{ text: "text", done: false }] }`, or `null`.
- `OH.cc.biz()` returns `{ name, owner, town }`. In My business the name is empty until the person types it. Save it with `OH.cc.set("biz", { name, owner, town: "" })`.
- `OH.pieceSummaries()` returns one line for each of the eight pieces: `{ week, name, nav, built, label, value, tone }`. Skip week 1, which is this page.

**The page, top to bottom**

1. A card with today's date written out with `OH.niceDate(OH.today())`, a greeting that uses the owner's first name when there is one, and the business name.
2. If `OH.cc.get("today")` is `null`: the Needs setup box, saying what to do. Otherwise the next three.
3. If the saved date is not today, a note that says which day the list is from.
4. A card with the classes `card first`, headed First, holding the one thing first with a tick box.
5. A card headed Then with the rest of the list, each line with a tick box, and a count such as `2 of 5 done`. The count includes the first thing.
6. A section headed Write today's list. In My business it has two text inputs: the name of the business, and the owner's first name. Save those two names when Save today's list is pressed, even when the text box is empty. Do not save or redraw while the person types in them. It always has a text box with one thing per line, where the first line is the one thing first, and a button Save today's list. It keeps at most six lines: the first, and five more. Saving sets the date to today and clears the ticks. The box starts filled with the list that is saved.
7. A section headed Where the business stands, with one tile per other piece from `OH.pieceSummaries()`: the label and the value when it is built, and the words Not built yet with its week when it is not.

**The home screen number**

- `summary()` returns `{ label: "Done today", value: "2 of 5", tone: "ok" }` when every line is done, and tone `"warn"` when not.
- With no list, it returns `{ label: "Today's list", value: "Needs setup", tone: "warn" }`.

**Exact names**

- `piece: 1`, `id: "week-1-today"`, `title: "Today"`, `data: ["today"]`.

## The rules

1. You draft. A person sends. Write the message, the post or the reply, and stop there.
2. Say what you are unsure about. If you had to guess, say so in plain words. Never hide a guess.
3. Never invent a number, a name, a date or a claim. If it is not in what I gave you, leave it out or ask.
4. Never send, pay, post or delete. Those four are always my steps.
5. Keep to the design note. If the note and my message disagree, ask which one wins.
6. Use plain words and short sentences. No hype.

## What to hand back

1. One file named `week-1-today.js`. If you can write files in my project folder, write it to `pieces/week-1-today.js` and change no other file. A placeholder with that name may already be there: replace it. If you cannot write files, give me the whole file to download, with exactly that name.
2. Then, in five lines or fewer: what you built, anything you were unsure about, and anything in the design note you could not do.

Build it now, in one go. Where something is unclear, make the smallest choice that keeps to the design note, and tell me about it after the file. Do not hand back parts of the file, and do not ask me to edit code. I cannot edit code.
