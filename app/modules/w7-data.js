/* Week 7 · From a messy export to one screen.
   The job from Session 7: take a jobs export exactly as it came, find what is wrong with it, clean
   it without changing a single amount, explain the gap between the two totals, and read the result
   on one screen. The page finds the problems itself. The AI is a second opinion you then check. */
(function () {
  const h = OH.h, S = OH.sample.jobsExport, K = "w7:";
  const get = (k, d) => OH.store.get(K + k, d), set = (k, v) => OH.store.set(K + k, v);
  const cents = (n) => Math.round(n * 100) / 100;
  const fmt = (n) => cents(n).toLocaleString("en-US", cents(n) % 1 ? { minimumFractionDigits: 2 } : {});   // 26,655 or 1,660.60: a plain number, no currency sign
  const pad = (n) => String(n).padStart(2, "0");
  const jobs = (n) => n + (n === 1 ? " job" : " jobs");
  const low = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const rowList = (a) => (a.length < 3 ? a.join(" and ") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);
  const money = (list) => cents(list.reduce((t, r) => t + (r.amount || 0), 0));
  const rows = () => get("rows", null) || S.rows;
  // Read an amount so it can be added up. The cell itself is never rewritten.
  const num = (v) => { const s = String(v == null ? "" : v).replace(/[$,\s]/g, ""); return s !== "" && isFinite(s) ? +s : null; };
  const isPaid = (v) => /^(y|yes|paid|true|x|done|1)$/i.test(String(v || "").trim());

  // Which column does which job. Guessed from the header row, and the person can change every one.
  const ROLES = [["date", "Date", /date|day|when/], ["customer", "Customer", /customer|client|name|who/], ["amount", "Amount", /amount|total|price|revenue|usd/], ["paid", "Paid", /paid|status|balance/],
    ["service", "Group the money by", /service|item|product|category|type|job/], ["source", "How they found you", /found|source|how|channel|referr/]];
  function guess(head) {
    const c = {}, used = {};
    ROLES.forEach((r) => { const i = head.findIndex((name, j) => !used[j] && r[2].test(String(name).toLowerCase())); c[r[0]] = i; if (i >= 0) used[i] = true; });
    return c;
  }
  const cols = () => get("cols", null) || guess(rows()[0]);

  // A date written either way, as YYYY-MM-DD. In 10/6/2026 the month comes first, unless the first number is over 12.
  function readDate(v) {
    v = String(v || "").trim(); let m;
    if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(v))) return m[1] + "-" + pad(m[2]) + "-" + pad(m[3]);
    if ((m = /^(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4})$/.exec(v))) { const dayFirst = +m[1] > 12; return (m[3].length === 2 ? "20" + m[3] : m[3]) + "-" + pad(dayFirst ? m[2] : m[1]) + "-" + pad(dayFirst ? m[1] : m[2]); }
    const d = new Date(v); return v && !isNaN(d) ? d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) : "";
  }

  /* Two spellings that may be one customer. Three tests: the same letters once case, dots and spacing
     are ignored; the same last name with a first name that is only an initial (P. Raman, Priya Raman);
     or the same first letter, a shared first or last name, and no more than two letters apart. */
  const letters = (name) => name.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter(Boolean);
  const apart = (a, b) => { let prev = Array.from({ length: b.length + 1 }, (_, i) => i);      // edit distance, one row at a time
    for (let i = 1; i <= a.length; i++) { const cur = [i]; for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
    return prev[b.length]; };
  function alike(A, B) {
    if (!A.length || !B.length) return false;
    if (A.join(" ") === B.join(" ")) return true;
    if (A.length < 2 || B.length < 2 || A[0][0] !== B[0][0]) return false;
    const sameLast = A[A.length - 1] === B[B.length - 1];
    if (sameLast && (A[0].length === 1 || B[0].length === 1)) return true;
    return (sameLast || A[0] === B[0]) && apart(A.join(" "), B.join(" ")) <= 2;
  }

  /* The problem finder. It never edits the export. It returns the problems, the clean table and a
     list of every fix, each tied to the row it came from. Amounts are read, never rewritten.
     `names` holds the person's own answers about spellings: the page asks, it does not decide. */
  function analyze(all, c, names) {
    const head = all[0], cell = (r, i) => (i >= 0 && r.cells[i] != null ? r.cells[i] : "");
    const about = (r) => [cell(r, c.customer), cell(r, c.service), cell(r, c.amount)].filter(Boolean).join(", ");
    const body = all.slice(1).map((r, i) => ({ n: i + 1, cells: head.map((_, j) => String(r[j] == null ? "" : r[j]).trim()) }));
    const seen = {}, kept = [], dupes = [], dates = [], blanks = [], pairs = [], fixes = [], spelled = {};
    body.forEach((r) => {                                        // 1 · exact duplicate rows: every cell the same as an earlier row
      const key = r.cells.join("\u0001"); r.amount = num(cell(r, c.amount)); r.customer = cell(r, c.customer);
      if (seen[key]) { r.of = seen[key]; dupes.push(r); fixes.push("Row " + r.n + ": removed. An exact copy of row " + r.of + " (" + about(r) + ")."); } else { seen[key] = r.n; kept.push(r); }
    });
    kept.forEach((r) => {
      const was = cell(r, c.date), iso = readDate(was); r.date = iso || was;
      if (was && iso !== was) {                                  // 2 · dates not already YYYY-MM-DD
        dates.push({ n: r.n, was: was, iso: iso });
        fixes.push(iso ? "Row " + r.n + ": date " + was + " written as " + iso + "." : "Row " + r.n + ": could not read the date " + was + ". Left as it is.");
      }
      if (r.amount == null) {                                    // 3 · blank amounts: flagged, never filled in
        blanks.push(r); fixes.push("Row " + r.n + ": the amount is " + (cell(r, c.amount) ? "not a number (" + cell(r, c.amount) + ")" : "blank") + ". Left as it is. Look it up at the source.");
      }
      if (r.customer) (spelled[r.customer] = spelled[r.customer] || []).push(r.n);
    });
    const spellings = Object.keys(spelled).map((name) => ({ name: name, parts: letters(name) }));
    spellings.forEach((a, i) => spellings.slice(i + 1).forEach((b) => {                       // 4 · one customer, two spellings
      if (alike(a.parts, b.parts)) pairs.push({ a: a.name, b: b.name, rows: spelled[a.name].concat(spelled[b.name]).sort((x, y) => x - y), use: names[a.name + "|" + b.name] || "" });
    }));
    pairs.forEach((p) => {
      if (!p.use) return fixes.push("Rows " + rowList(p.rows) + ": " + p.a + " and " + p.b + " may be one customer. Not changed. You decide.");
      kept.forEach((r) => { if ((r.customer === p.a || r.customer === p.b) && r.customer !== p.use) { fixes.push("Row " + r.n + ": customer " + r.customer + " written as " + p.use + ", because you said they are the same."); r.customer = p.use; } });
    });
    const clean = [head].concat(kept.map((r) => r.cells.map((v, j) => (j === c.date ? r.date : j === c.customer ? r.customer : v))));
    return { head: head, body: body, kept: kept, dupes: dupes, dates: dates, blanks: blanks, pairs: pairs, fixes: fixes, clean: clean, about: about, before: money(body), after: money(kept) };
  }

  // The numbers for the one screen. Every one is measured: it comes from the clean rows.
  function view(A, c) {
    const group = (i) => {                                       // jobs and dollars for each value in column i
      const g = {};
      if (i >= 0) A.kept.forEach((r) => { const k = r.cells[i] || "(blank)"; g[k] = g[k] || { label: k, jobs: 0, value: 0 }; g[k].jobs++; g[k].value = cents(g[k].value + (r.amount || 0)); });
      return Object.keys(g).map((k) => g[k]);
    };
    const largestFirst = (a, b) => (b.amount == null ? -1 : b.amount) - (a.amount == null ? -1 : a.amount);
    const unpaid = c.paid < 0 ? [] : A.kept.filter((r) => !isPaid(r.cells[c.paid])).sort(largestFirst);
    const known = unpaid.filter((r) => r.amount != null), noAmount = unpaid.length - known.length, owed = money(known);
    return { services: group(c.service).sort((a, b) => b.value - a.value), sources: group(c.source).sort((a, b) => b.jobs - a.jobs),
      unpaid: unpaid, owed: owed, paid: cents(A.after - owed),
      owedLine: fmt(owed) + " dollars on " + known.length + " unpaid " + (known.length === 1 ? "job" : "jobs") + (noAmount ? ", plus " + jobs(noAmount) + " with no amount" : "") };
  }

  // Find the clean table inside a free-form answer: the header line, then every line under it with the same number of cells.
  function readTable(text, head) {
    const cells = (line) => (line.indexOf("|") >= 0 ? line.trim().replace(/^\||\|$/g, "").split("|") : OH.parseCSV(line)[0] || []).map((x) => String(x).trim());
    const lines = text.split("\n"), start = lines.findIndex((l) => { const x = cells(l); return x.length === head.length && x[0].toLowerCase() === String(head[0]).toLowerCase(); }), out = [];
    for (let i = start + 1; start >= 0 && i < lines.length; i++) {
      const x = cells(lines[i]);
      if (/^[\s|:-]*$/.test(lines[i])) continue;                 // a blank line, or the dashes under a table header
      if (x.length !== head.length) { if (out.length) break; continue; }
      out.push(x);
    }
    return out;
  }
  // What is in one list of amounts and not in the other, counting repeats.
  function difference(theirs, mine) { const left = mine.slice(), extra = []; theirs.forEach((x) => { const i = left.indexOf(x); if (i >= 0) left.splice(i, 1); else extra.push(x); }); return { extra: extra, missing: left }; }

  function render(root, ctx) {
    const all = rows(), c = cols(), own = get("own", false), names = get("names", null) || {}, shown = get("shown", false);
    const A = analyze(all, c, names), V = view(A, c), gap = cents(A.before - A.after);
    const redraw = () => { const y = window.scrollY; ctx.redraw(); window.scrollTo(0, y); };   // the shell jumps to the top on a redraw: go back
    const lines = (items) => h("ul", { style: "margin:6px 0 0;padding-left:18px;font-size:14px" }, items.map((x) => h("li", null, x)));
    const head3 = (text) => h("h3", { style: "margin-top:16px" }, text);
    const steps = h("div", { class: "steps" }); root.appendChild(steps);

    // 1 · the export, untouched
    const ownBox = h("textarea", { placeholder: "Paste your own export here, header row first: copy the rows from a spreadsheet, or open the CSV file and copy everything.\nWork on a copy, never the original. Leave out card numbers and passwords." });
    const colPick = (role) => h("label", { class: "f", style: "margin:0" }, role[1], h("select", { onchange: (ev) => { c[role[0]] = +ev.target.value; set("cols", c); redraw(); } },
      h("option", { value: -1, selected: c[role[0]] < 0 }, "(none)"), A.head.map((name, i) => h("option", { value: i, selected: c[role[0]] === i }, name))));
    const unsure = ROLES.slice(0, 4).filter((r) => c[r[0]] < 0).map((r) => r[1]);
    const raw = OH.table([{ h: "Row", f: (r) => r.n }].concat(A.head.map((name, j) => ({ h: name, f: (r) => r.cells[j], s: (r) => (j === c.amount ? (r.amount == null ? -1 : r.amount) : r.cells[j]) }))), A.body);
    raw.style.maxHeight = "440px"; raw.style.overflowY = "auto";
    steps.appendChild(OH.step("The export: " + A.body.length + " rows, just as it came",
      h("p", { class: "mut" }, (own ? "Your export, as you pasted it." : S.title + ".") + " This table is never edited: that is the copy-first habit. Scroll through it before you go on. How many problems can you spot?"),
      raw,
      h("div", { style: "margin-top:12px;max-width:440px" }, OH.stat("Amount column, before anything changes", fmt(A.before), "dollars on " + A.body.length + " rows. Write this number down.")),
      unsure.length ? OH.note("The page could not tell which column is: " + unsure.join(", ") + ". Open Use my own export and choose.", "warn") : null,
      h("details", { style: "margin-top:10px", open: own }, h("summary", null, "Use my own export"), ownBox,
        h("div", { class: "row", style: "margin:8px 0 12px" }, h("button", { class: "primary", onclick: () => {
          const mine = OH.parseCSV(ownBox.value); while (mine.length && mine[0].filter((x) => String(x).trim()).length < 2) mine.shift();   // skip a title line above the header
          if (mine.length < 2) return OH.toast("I need a header row and at least one row under it");
          ["cols", "names", "ai", "hand"].forEach((k) => set(k, null)); set("rows", mine); set("own", true); redraw();
        } }, "Use this export")),
        h("p", { class: "mut" }, "Which column is which? The page guessed from the header row. Change any it got wrong. The first four are needed, the last two fill the charts."),
        h("div", { class: "grid g3" }, ROLES.map(colPick))),
      shown ? null : h("div", { class: "row", style: "margin-top:12px" }, h("button", { class: "primary", onclick: () => { set("shown", true); redraw(); } }, "Show what the page found"))));
    if (!shown) return;

    // 2 · what the page found, each problem with its row and its fix
    const found = (title, n, body) => h("div", { class: "card" }, h("h3", null, title + " ", OH.badge(String(n), n ? "warn" : "ok")), n ? body : h("div", { class: "mut" }, "None found."));
    const pairBox = (p) => h("div", { style: "margin-top:6px;font-size:14px" }, "Rows " + rowList(p.rows) + ": " + p.a + " and " + p.b + ". The same customer?",
      h("select", { style: "margin-top:6px", onchange: (ev) => { names[p.a + "|" + p.b] = ev.target.value; set("names", names); redraw(); } },
        [["", "Not sure. Leave both as they are"], [p.a, "Same customer. Write it as " + p.a], [p.b, "Same customer. Write it as " + p.b]].map((o) => h("option", { value: o[0], selected: o[0] === p.use }, o[1]))));
    const kinds = [A.dupes, A.dates, A.blanks, A.pairs].filter((x) => x.length).length;
    steps.appendChild(OH.step("What the page found: " + kinds + (kinds === 1 ? " kind" : " kinds") + " of problem",
      h("div", { class: "grid g2" },
        found("Exact duplicate rows", A.dupes.length, lines(A.dupes.map((r) => "Row " + r.n + " is an exact copy of row " + r.of + ": " + A.about(r) + ". Fix: row " + r.n + " comes out of the clean table."))),
        found(A.dates.length < A.kept.length ? "Dates written more than one way" : "Dates not written as YYYY-MM-DD", A.dates.length,
          [lines(A.dates.map((d) => (d.iso ? "Row " + d.n + ": " + d.was + " becomes " + d.iso + "." : "Row " + d.n + ": could not read " + d.was + ". Left as it is."))),
            h("p", { class: "mut", style: "font-size:13px;margin:8px 0 0" }, "A date like 10/6/2026 is read as month, day, year, unless the first number is over 12. If yours are written day first, fix them at the source before you trust this.")]),
        found("Blank amounts", A.blanks.length, lines(A.blanks.map((r) => "Row " + r.n + ": " + A.about(r) + ". Left as it is. Look it up at the source. Do not guess."))),
        found("One customer, two spellings?", A.pairs.length, A.pairs.map(pairBox))),
      OH.note("Nothing is changed silently. The export in step 1 stays as it came, every fix is listed here with its row, and no amount is ever altered. The page asks about the spellings. It does not decide.")));

    // 3 · totals before and after, and the gap explained row by row
    steps.appendChild(OH.step("Totals before and after, in dollars",
      h("div", { class: "grid g3" }, OH.stat("Before: the export, " + A.body.length + " rows", fmt(A.before)), OH.stat("After: the clean table, " + jobs(A.kept.length), fmt(A.after)),
        OH.stat("The gap", fmt(gap), A.dupes.length ? "rows removed: " + A.dupes.length : "nothing was removed", gap ? "warn" : "ok")),
      A.dupes.length ? [head3("The gap, row by row"),
        OH.table([{ h: "Row removed", f: (r) => r.n }, { h: "An exact copy of row", f: (r) => r.of }, { h: "What it was", f: A.about }, { h: "Amount", f: (r) => (r.amount == null ? "blank" : fmt(r.amount)) }], A.dupes),
        OH.note("The gap is " + fmt(gap) + ", and the removed rows add up to " + fmt(money(A.dupes)) + ". Nothing else moved, so every dollar of the difference is explained. " +
          "If you could not explain the gap, you would stop here and build nothing.", "ok")]
        : OH.note("No row was removed, so the total did not move.", "ok")));

    // 4 · the one screen. Every number here is measured from the clean table.
    const top = V.sources[0], first = V.services[0], busiest = V.services.slice().sort((a, b) => b.jobs - a.jobs)[0], undecided = A.pairs.filter((p) => !p.use).length;
    const countIsNotMoney = V.services.length > 1 && busiest !== first
      ? "Count is not money. " + busiest.label + " is " + jobs(busiest.jobs) + " and " + fmt(busiest.value) + " dollars. " + first.label + " is " + jobs(first.jobs) + " and " + fmt(first.value) + "."
      : "";
    const unknown = [A.blanks.length ? A.blanks.length + " blank amount" + (A.blanks.length === 1 ? "" : "s") : "", undecided ? undecided + " customer" + (undecided === 1 ? "" : "s") + " spelled two ways" : ""].filter(Boolean);
    const typed = (key, label, hint) => h("div", { class: "stat" }, h("div", { class: "k" }, label), h("input", { type: "text", style: "margin-top:6px", placeholder: hint, value: get(key, ""), oninput: (ev) => set(key, ev.target.value) }));
    steps.appendChild(OH.step("The one screen: measured from the file",
      h("div", { class: "grid g4" },
        OH.stat("What came in · measured", fmt(A.after), "dollars billed" + (c.paid < 0 ? "" : ", " + fmt(V.paid) + " of it paid so far")),
        OH.stat("What is owed · measured", fmt(V.owed), c.paid < 0 ? "choose the Paid column in step 1" : V.owedLine.replace(/^\S+ /, ""), V.owed ? "warn" : "ok"),
        OH.stat("Jobs · measured", A.kept.length, "one row per job in the clean table"),
        OH.stat("Top source · measured", top ? top.label : "Not tracked", top ? top.jobs + " of " + jobs(A.kept.length) : "choose the source column in step 1")),
      h("div", { class: "grid g2", style: "margin-top:14px" },
        h("div", { class: "card" }, h("h3", null, c.service < 0 ? "Revenue by service, in dollars" : "Revenue by " + low(A.head[c.service]) + ", in dollars"),
          V.services.length ? OH.bars(V.services, { fmt: fmt }) : h("div", { class: "mut" }, "Choose a column to group by in step 1."),
          countIsNotMoney ? h("p", { class: "mut", style: "margin-bottom:0" }, countIsNotMoney) : null),
        h("div", { class: "card" }, h("h3", null, c.source < 0 ? "Jobs by source" : "Jobs by " + low(A.head[c.source])),
          V.sources.length ? OH.bars(V.sources.map((s) => ({ label: s.label, value: s.jobs }))) : h("div", { class: "mut" }, "Choose the source column in step 1."))),
      head3("Unpaid jobs, largest first, in dollars"),
      OH.table([{ h: "Row", f: (r) => r.n }, { h: "Customer", f: (r) => h("b", null, r.customer) }, { h: "What", f: (r) => (c.service < 0 ? "" : r.cells[c.service]) }, { h: "Date", f: (r) => r.date },
        { h: "Amount", f: (r) => (r.amount == null ? OH.badge("No amount", "warn") : fmt(r.amount)), s: (r) => (r.amount == null ? -1 : r.amount) }], V.unpaid, { empty: "Nothing is unpaid." }),
      V.unpaid.length && V.unpaid[0].amount != null ? h("p", { class: "mut" }, "Owed in all: " + V.owedLine + ". " + fmt(V.unpaid[0].amount) + " of it is one job (" + V.unpaid[0].customer + "). Make that call first.") : null,
      unknown.length ? OH.note("Still unknown: " + unknown.join(", ") + ". The real unpaid number may be higher than what you see. Look them up at the source. " +
        "A screen that says what it does not know beats one that looks finished.", "warn") : null,
      head3("Three kinds of number, never added together"),
      h("div", { class: "grid g3" }, OH.stat("Measured: it happened, and the file is the record", fmt(A.after), "dollars, from the clean table"),
        typed("estimated", "Estimated: your best read of something nobody counted", "Type yours. For example: cash jobs not in the export"),
        typed("projected", "Projected: what you expect if things go to plan", "Type yours. For example: spring contracts you hope to sign")),
      OH.note("All three are useful. They stay in three boxes, and this page will not add them up. Measured revenue plus an estimate plus a hope is one big number that looks great and means nothing.")));

    // 5 · the AI's second opinion: the same job, then compare its clean table with the page's
    const ai = get("ai", null), show = (v) => (v === "blank" ? "a blank" : fmt(v)), bag = (list) => list.map((v) => (v == null ? "blank" : v));
    const pb = OH.promptBox({ prompt: S.prompt.replace("{biz}", own ? "a small business" : S.biz).replace("{n}", A.head.length), data: () => OH.toCSV(all), dataLabel: "export", height: 200 });
    const verdict = () => {
      const theirs = bag(ai.map((r) => num(r[c.amount]))), d = difference(theirs, bag(A.kept.map((r) => r.amount))), agree = !d.extra.length && !d.missing.length;
      const total = cents(theirs.reduce((t, v) => t + (v === "blank" ? 0 : v), 0));
      return [h("div", { class: "grid g3", style: "margin-top:12px" }, OH.stat("The page's clean table", fmt(A.after), jobs(A.kept.length)), OH.stat("The AI's clean table", fmt(total), ai.length + " rows", agree ? "ok" : "bad"),
        OH.stat("Amounts that differ", d.extra.length + d.missing.length, agree ? "no amount was changed" : "find them before you go on", agree ? "ok" : "bad")),
        OH.note(agree ? "The two clean tables agree: the same amounts on " + ai.length + " rows, adding up to " + fmt(total) + " dollars. Now read the AI's list of changes and its questions. That list is the part you asked for."
          : "They do not agree. " + (d.extra.length ? "In the AI's table and not in the page's: " + d.extra.map(show).join(", ") + ". " : "") +
            (d.missing.length ? "In the page's table and not in the AI's: " + d.missing.map(show).join(", ") + ". " : "") +
            "If the AI kept a duplicate and asked you about it, that is the rule working: answer it. If it changed or filled in an amount, that is the rule it broke.", agree ? "ok" : "warn")];
    };
    steps.appendChild(OH.step("A second opinion from the AI",
      h("p", { class: "mut" }, "The page has done the clean-up. Give the AI the same job and see whether the two agree. Read the rules before you copy: do not change any amount, list every row you altered and why, flag what you are unsure of."),
      pb.el,
      OH.pasteBox({ label: "The AI's answer", sample: own ? null : S.answer, onUse: (text) => {
        const table = readTable(text, A.head);
        if (!table.length) return OH.toast("I could not find the clean table. Ask for it as comma-separated lines, header row first.");
        set("ai", table); redraw();
      } }),
      ai ? verdict() : null));

    // 6 · check the total by hand, in your own spreadsheet
    const hand = get("hand", null) || "", mine = num(hand), handBox = h("input", { type: "text", style: "max-width:340px", placeholder: "The sum your spreadsheet shows", value: hand });
    steps.appendChild(OH.step("Check the total by hand",
      h("p", { class: "mut" }, "Copy the clean table, paste it into your own spreadsheet, select the amount column and read the sum it shows. Type that number here. If a number matters, check it."),
      h("div", { class: "row" }, h("button", { onclick: () => OH.copy(OH.toCSV(A.clean, "\t"), "Clean table copied") }, "Copy the clean table for Google Sheets or Excel"), handBox,
        h("button", { class: "primary", onclick: () => { if (num(handBox.value) == null) return OH.toast("Type the total as a number"); set("hand", handBox.value); redraw(); } }, "Check my total")),
      mine == null ? null : mine === A.after ? OH.note("It matches. Your spreadsheet and this page both say " + fmt(A.after) + ". You can build on it.", "ok")
        : mine === A.before ? OH.note("That is the total before the clean-up, " + fmt(A.before) + ". Your sheet still holds what was removed here, a gap of " + fmt(gap) + ". Check that you pasted the clean table and not the export.", "warn")
        : OH.note("It does not match. Your sheet says " + fmt(mine) + " and the clean table says " + fmt(A.after) + ", a difference of " + fmt(Math.abs(mine - A.after)) + ". Find the rows that explain it before you build anything on top.", "warn")));

    // 7 · the data map and the backup habit. These save as you type, with no redraw, so the two status lines are updated by hand.
    const map = get("map", null) || {}, ticks = get("ticks", null) || {}, mapLine = h("p", { class: "mut" }), tickLine = h("p", { class: "mut" });
    const tell = () => {
      const filled = S.map.reduce((n, m) => n + (map[m.key + ":home"] ? 1 : 0) + (map[m.key + ":who"] ? 1 : 0), 0), done = S.habit.filter((x) => ticks[x.key]).length;
      mapLine.textContent = filled + " of " + S.map.length * 2 + " boxes filled in. " + (filled < S.map.length * 2 ? "A box you cannot fill in is where to start." : "Keep this. It is the first thing you will want when something breaks.");
      tickLine.textContent = done + " of " + S.habit.length + " ticked. " + (ticks.restored ? "You restored a file, so you have a backup." : "A backup you have never restored is a hope, not a backup.");
    };
    const box = (m, part, hint) => h("input", { type: "text", placeholder: hint, value: map[m.key + ":" + part] || "", oninput: (ev) => { map[m.key + ":" + part] = ev.target.value.trim(); set("map", map); tell(); } });
    tell();
    steps.appendChild(OH.step("Your data map and the backup habit",
      h("p", { class: "mut" }, "One home per thing. When two places disagree about a fact, the home wins and everything else is a copy. Write where each one lives, and who can still get in if one person leaves."),
      OH.table([{ h: "What", f: (m) => h("b", null, m.what) }, { h: "Its one home", f: (m) => box(m, "home", m.homeHint) }, { h: "Who holds the login", f: (m) => box(m, "who", m.whoHint) }], S.map), mapLine,
      head3("The backup habit: three copies, two places, one away"),
      S.habit.map((x) => h("label", { style: "display:flex;gap:9px;align-items:flex-start;margin:7px 0;cursor:pointer" },
        h("input", { type: "checkbox", style: "margin-top:4px", checked: !!ticks[x.key], onchange: (ev) => { ticks[x.key] = ev.target.checked; set("ticks", ticks); tell(); } }), h("span", null, x.text))), tickLine));

    // 8 · take it away
    const report = () => [(own ? "My export" : S.title) + ": one screen", "", "MEASURED (every number here comes from the file)",
      "Total before the clean-up: " + fmt(A.before) + " dollars on " + A.body.length + " rows", "Total after: " + fmt(A.after) + " dollars on " + jobs(A.kept.length),
      "The gap: " + fmt(gap) + (A.dupes.length ? " (" + A.dupes.map((r) => "row " + r.n + ", an exact copy of row " + r.of).join("; ") + ")" : ""),
      "Revenue: " + (V.services.map((s) => s.label + " " + fmt(s.value) + " (" + jobs(s.jobs) + ")").join("; ") || "not grouped"),
      "Unpaid: " + (c.paid < 0 ? "no Paid column chosen" : V.owedLine), "Jobs by source: " + (V.sources.map((s) => s.label + " " + s.jobs).join("; ") || "not tracked"),
      "", "EVERY FIX, WITH ITS ROW"].concat(A.fixes.length ? A.fixes : ["None needed."], ["", "NOT ADDED TO ANYTHING ABOVE",
      "Estimated (typed by me): " + (get("estimated", "") || "none"), "Projected (typed by me): " + (get("projected", "") || "none"), "", "DATA MAP"],
      S.map.map((m) => m.what + ": " + (map[m.key + ":home"] || "not written down") + ". Login held by: " + (map[m.key + ":who"] || "not written down") + ".")).join("\n");
    steps.appendChild(OH.step("Take it with you",
      h("p", { class: "mut" }, "The clean table keeps every column and every amount as it came. The summary is plain text: the totals, every fix with its row, and your data map."),
      h("div", { class: "row" }, h("button", { class: "primary", onclick: () => OH.download("clean-table.csv", OH.toCSV(A.clean), "text/csv") }, "Download the clean table as a CSV file"),
        h("button", { onclick: () => OH.copy(report(), "Summary copied") }, "Copy the summary"))));
  }

  OH.register({
    week: 7, id: "w7-data", title: "From a messy export to one screen",
    intro: "Thirty messy rows go in. The page finds what is wrong, cleans it without changing a single amount, explains the gap, and shows the result on one screen.",
    render: render,
    summary: function () { const c = cols(), V = view(analyze(rows(), c, get("names", null) || {}), c); return { label: "Unpaid jobs, in dollars", value: fmt(V.owed), tone: V.owed ? "warn" : "ok" }; },
    /* For the game (GAME.md): what counts as done, read from what this page has already saved. It writes nothing.
       The catch is the check that proves the work: the total typed by hand has to match the clean table.
       With the sample that is 26,655, not the 27,040 the export started with. */
    objectives: function () {
      const d = { found: false, labels: false, second: false, total: false, map: false };
      try {
        const c = cols(), A = analyze(rows(), c, get("names", null) || {}), ai = get("ai", null), hand = num(get("hand", null)), map = get("map", null) || {};
        const typed = (v) => String(v || "").trim() !== "", bag = (list) => list.map((v) => (v == null ? "blank" : v));
        d.found = get("shown", false) === true;
        d.labels = typed(get("estimated", "")) && typed(get("projected", ""));
        if (Array.isArray(ai) && ai.length) {                                             // the same comparison step 5 shows
          const x = difference(bag(ai.map((r) => num(r[c.amount]))), bag(A.kept.map((r) => r.amount)));
          d.second = !x.extra.length && !x.missing.length;
        }
        d.total = hand != null && hand === A.after;
        d.map = S.map.every((m) => typed(map[m.key + ":home"]));
      } catch (e) { /* nothing saved yet, or something unreadable: every box stays empty */ }
      return [
        { id: "found", label: "Show what is wrong in the export, row by row", done: !!d.found, required: true },
        { id: "labels", label: "Type an estimate and a projection, each in its own box", done: !!d.labels, required: true },
        { id: "second", label: "Get a second opinion that changes no amount", done: !!d.second, required: true },
        { id: "total", label: "Check the clean total by hand until it matches", done: !!d.total, required: true },
        { id: "map", label: "Write down one home for customers, money and files", done: !!d.map, required: false }
      ];
    }
  });
})();
