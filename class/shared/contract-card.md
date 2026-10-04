If you can read the files in my project folder, read `MODULES.md` first. If you cannot, everything you need is here.

**The app and how a piece fits in**

- The app is plain HTML, CSS and JavaScript. It opens with a double-click as a `file://` page. There is no server and no internet.
- A piece is ONE JavaScript file. No import, no export, no fetch, no outside script, font or picture. No new libraries.
- The app loads the file by itself when it sits in the `pieces` folder with the right name. Change no other file.
- The whole file is one function that runs at once and ends by registering the piece, in this shape:

```js
(function () {
  const h = OH.h;
  function render(root, ctx) { /* build the page into root. Call ctx.redraw() after anything changes. */ }
  OH.register({
    piece: {{WEEK}},
    id: "{{ID}}",
    title: "The page heading",
    intro: "One sentence under the heading.",
    data: ["the data names this piece keeps"],
    render: render,
    summary: function () { return { label: "A few words", value: "3", tone: "warn" }; }
  });
})();
```

**The toolbox the app gives you. Use it, do not write your own.**

- `OH.h(tag, attrs, ...children)` makes a page element. `attrs` can hold `class`, `style`, `value`, `checked`, `placeholder`, `type`, and handlers such as `onclick` or `onchange`. Children are text, elements, lists, or null.
- `OH.cc.get(name)` reads data. `OH.cc.set(name, value)` keeps it in this browser. `OH.cc.own()` is true when the person looks at their own business, and false for the sample business.
- In the sample business, `OH.cc.get(name)` returns made-up sample data that is already in the app. In My business it returns `null` until the person brings their own data in. When it is `null`, show `OH.cc.setup(sentence, [steps])`, which draws a box headed Needs setup. Never show a made-up number in its place.
- `OH.cc.biz()` gives `{ name, owner, town }` for the business on screen. `OH.cc.log(what, why)` adds a line to the change log.
- `OH.step(title, ...children)` a numbered section. `OH.card(title, ...children)` a card. `OH.note(text, tone)` a note. `OH.badge(text, tone)` a small label. `OH.stat(label, value, detail, tone)` a number tile. Tones: `"ok"`, `"warn"`, `"bad"`, `"blue"`.
- `OH.check(text, done, onChange, extra)` one line with a tick box. `OH.field(label, inputElement, hint)` a labelled input.
- `OH.table(columns, rows, options)` a table. `columns`: `[{ h: "Heading", f: (row) => cell }]`. `options`: `{ empty: "words for no rows", rowClass: (row) => "hot" or "done" }`.
- `OH.tabs(key, [{ id, label, count, render: (panel) => {} }])` tabs inside the piece. It remembers the open tab.
- `OH.bringIn({ label, hint, placeholder, sample, useLabel, onText: (text, fileName) => {} })` the way to bring data in with no connector: choose a file, drop a file, or paste text. `sample` is optional text for a Load the sample file button.
- `OH.promptBox({ prompt, data, dataLabel })` returns `{ el }`: a prompt the person copies into an AI chat. `OH.pasteBox({ label, sample, onUse: (text) => {} })` is where the AI's answer comes back.
- `OH.rows(text)` turns CSV text into a list of objects, keyed by the header row in lower case. `OH.toCSV(listOfRows)` makes CSV text. `OH.download(fileName, text)` saves a file. `OH.copy(text, "What was copied")` copies. `OH.toast(message)` shows a short message.
- `OH.today()` is today as `"2026-10-07"`. `OH.day(n)` is today plus n days. `OH.daysBetween(from, to)` counts days. `OH.niceDate(date)` reads like `Wed, Oct 7`.
- CSS classes already there: `grid g2 g3 g4`, `row`, `spacer`, `card`, `mut` (grey text), `piles` with `pile` and `item` (columns of cards), `first` (a card with a blue edge), and buttons `primary` and `small`.

**Rules for the page**

- Words on the page are plain and short. No em dashes. No hype words. No dollar amounts.
- The page never sends, posts, pays or deletes. It can copy text and save a file to the computer, nothing more.
- Keep what the person types with `OH.cc.set`, so it is still there after a refresh.
- It works with the keyboard, and at the width of a phone (390 wide) with no sideways scroll.
