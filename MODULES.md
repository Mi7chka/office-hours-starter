# How a week's tool is built

This demo is plain HTML, CSS and JavaScript. No framework, no build step, no server, no installs.
It must keep working when someone double-clicks `index.html` (a `file://` page), so:

- **No network requests of any kind.** No `fetch`, no CDN, no fonts, no images from the web.
  Links that open another site in a new tab are fine (an AI chat, a Google search).
- **No `import`, no modules, no JSON files loaded at run time.** Data ships as a `.js` file.
- **What a person types stays in their browser** (`OH.store`, which is `localStorage`). Never send it anywhere.
- **Sample data is made up** and says so. The company is Greenline Landscaping, owner Jordan Reyes,
  town Cedar Hollow, phone numbers 555-01xx, email addresses at example.com. No real people.

Week 1 is the worked example. Read these three files before writing a week:
`app/modules/w1-inbox.js`, `app/data/w1-inbox.js`, `runbooks/session-01.json`. Then `app/shell.js`.

## The four files a week owns

| File | What it is |
|---|---|
| `app/data/wN-name.js` | Sample data. `window.OH_SAMPLE = window.OH_SAMPLE \|\| {}; window.OH_SAMPLE.key = {...};` |
| `app/modules/wN-name.js` | The tool. One IIFE that ends with `OH.register({...})`. |
| `runbooks/session-0N.json` | The 15-minute follow-along. Same shape as `session-01.json`. |
| `prompts/week-N-*.txt` and `samples/week-N-*` | Every prompt as a text file, and the raw sample files, so people can use them without the app. |

The file names are fixed by `app/manifest.js`:
`w1-inbox`, `w2-leads`, `w3-homepage`, `w4-getfound`, `w5-content`, `w6-pipeline`, `w7-data`, `w8-breaks`.

## The module

```js
(function () {
  const h = OH.h, S = OH.sample.myKey, K = "w3:";          // every stored key starts with "wN:"
  function render(root, ctx) { /* build the page into root; call ctx.redraw() after a change */ }
  OH.register({
    week: 3, id: "w3-homepage", title: "The 3-second home page test",
    intro: "One sentence under the title.",
    render: render,
    summary: function () { return { label: "Home page questions answered", value: "2 of 3", tone: "warn" }; }
  });
})();
```

- `render(root, ctx)` draws everything. `ctx.redraw()` redraws the week. `ctx.week`, `ctx.session`.
- `summary()` returns the one number this week adds to the home screen: `{label, value, tone}` with
  tone `"ok"`, `"warn"`, `"bad"` or `""`. It must work before the person has done anything.
- The shell already provides "Start over with the sample data" (it clears every `wN:` key). Add a
  `reset()` function only if you keep state somewhere else.
- Lay the page out as numbered steps with `OH.step(title, ...children)` inside
  `h("div", {class: "steps"})`, in the order the runbook walks through them.
- Every week has the same arc as the class: **sample data first, the prompt, the answer comes back,
  check its work, something you can take away** (copy, download, print). And a way to do it again
  with the person's own data.
- It has to work with no AI at hand: a "load the sample answer" path, or logic that runs in the page.

## The toolbox (`OH.*`, all in `app/shell.js`)

| Call | Gives you |
|---|---|
| `OH.h(tag, attrs, ...children)` | A DOM node. `attrs`: `class`, `html`, `value`, `checked`, `onclick` and other `on…` handlers, anything else as an attribute. Children: strings, nodes, arrays, `null`. |
| `OH.store.get(key, fallback)`, `OH.store.set(key, value)` | Saved in this browser as JSON. |
| `OH.step(title, …)`, `OH.card(title, …)`, `OH.note(text, tone)`, `OH.badge(text, tone)`, `OH.stat(label, value, detail, tone)` | Page pieces. Tones: `ok`, `warn`, `bad`, `blue`. |
| `OH.table(cols, rows, opts)` | A sortable table. `cols`: `[{h, f(row), s(row)}]`. `opts`: `{rowClass(row), empty, sort}`. Row classes `hot` and `done` are styled. |
| `OH.bars([{label, value}], {unit, fmt})` | A horizontal bar chart. |
| `OH.promptBox({prompt, data, dataLabel, height})` | An editable prompt with copy buttons and links to an AI chat. Returns `{el, text()}`. `data` may be a function. |
| `OH.pasteBox({label, placeholder, sample, onUse, useLabel})` | Where the AI's answer comes back. `sample` adds the "load the sample answer" button. |
| `OH.copy(text, what)`, `OH.download(filename, text, type)`, `OH.toast(message)` | Clipboard, a file download, a short message. |
| `OH.parseCSV(text)` → array of rows, `OH.toCSV(rows, sep)` | CSV or tab-separated text, both ways. |
| `OH.today()` → `"2026-10-07"`, `OH.niceDate(iso)` | Dates. |
| `OH.course`, `OH.course.business` | The season and the sample business. |

CSS classes you can use: `grid g2|g3|g4`, `row`, `spacer`, `card`, `stat`, `badge`, `note`, `wrap`,
`piles`, `pile`, `item` (and `item moved`), `chips`, `mut`, `ok`, `warn`, `bad`, `kicker`, `lead`,
`code` (on a `pre`), `f` (on a form `label`), buttons `primary`, `small`, `ghost`.
If you need a style that is not there, set it inline or inject one small `<style>` block from your
module; do not edit `app/shell.css`.

## The runbook (`runbooks/session-0N.json`)

The 15-minute follow-along Mitchell runs live, with the class doing it beside him.

- `minutes` is 15 and the steps' `min` values add up to exactly 15. Six to nine steps.
- Each step: `at` (clock from 0:00), `min`, `do` (what to click or type, one sentence, an order),
  `see` (the visible sign it worked), `tip` (optional, one sentence).
- `real_life`: three things to do with their own business this week.
- `if_it_breaks`: two or three recoveries, the first being "load the sample answer and keep going".
- Plain words, short sentences, no em dashes, no exclamation points, no dollar amounts.

`python3 tools/build_runbooks.py` turns the JSON into the `.md` file and into what the Runbook button shows.

## Rules for the words

Friendly, direct, plain. A smart friend who builds software. No hype words (seamless, robust,
unlock, leverage, game-changing, cutting-edge and the like). No em dashes. No statistics from
outside. No client or employer names. No prices for Mitchell's services. Real app names are welcome
(Gmail, Google Sheets, Excel, QuickBooks, Square, Shopify, Calendly, Mailchimp, HubSpot, Zoho CRM,
Canva, WordPress, Wix, Squarespace, Google Business Profile, Search Console, Zapier, Make, n8n,
ChatGPT, Claude, Gemini, Copilot, 1Password, Bitwarden): name the job the app does, never a menu or
a price you are not sure of, and never imply a partnership.

## Before you call a week done

1. `node --check app/modules/wN-name.js` and `node --check app/data/wN-name.js` pass.
2. `python3 tools/build_runbooks.py` prints no note about your session's minutes.
3. Read your module top to bottom once as a first-time user: can you finish the 15 minutes with only
   the runbook open?
