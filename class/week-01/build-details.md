# Week 1 build details · the Today page

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
