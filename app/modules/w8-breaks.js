/* Week 8 · The when-it-breaks sheet and your 90-day plan.
   The job from Session 8, in four parts:
     1. a panicked message becomes a clear support request (a form that runs in the page, then the same job by an AI)
     2. the one page that says who to call (edit it, print it, download it)
     3. five security habits, and the three signs of phishing
     4. the 90-day plan that puts all eight weeks in order.
   Works with the Greenline sample, or with your own business. Nothing is sent anywhere. */
(function () {
  const h = OH.h, S = OH.sample.breaks, K = "w8:", WEEK = 8;
  // armed(button, question): true on the second press within five seconds. No native dialogs anywhere in this app.
  function armed(btn, question) {
    if (btn.dataset.armed === "1") { btn.dataset.armed = ""; return true; }
    const was = btn.textContent; btn.dataset.armed = "1"; btn.textContent = question;
    setTimeout(() => { if (btn.dataset.armed === "1") { btn.dataset.armed = ""; btn.textContent = was; } }, 5000);
    return false;
  }
  const get = (k, d) => OH.store.get(K + k, d), set = (k, v) => OH.store.set(K + k, v);
  const filled = (v) => String(v || "").trim() !== "";
  const heading = (text) => h("h3", { style: "margin-top:20px" }, text);
  const buttons = (...items) => h("div", { class: "row", style: "margin-top:10px" }, items);

  // One small style block: compact text boxes, and a print style that shows only the copy in #w8-print.
  document.head.appendChild(h("style", null, [
    ".w8-answer,.w8-cell{font:13.5px/1.45 system-ui,-apple-system,'Segoe UI',sans-serif}",
    ".w8-answer{min-height:78px}",
    ".w8-cell{min-height:104px;padding:6px 8px;border-radius:8px}",
    ".w8-sheet{table-layout:fixed;min-width:940px}.w8-sheet td{padding:6px}.w8-sheet th{cursor:default;white-space:normal}",
    ".w8-pick{flex:1 1 210px;cursor:pointer}",
    ".w8-tick{display:flex;gap:10px;align-items:flex-start;cursor:pointer}.w8-tick input{margin-top:4px}",
    "#w8-print{display:none}",
    "@media print{",
    "  body.w8-printing>*:not(#w8-print){display:none!important}",
    "  body.w8-printing #w8-print{display:block;font:10px/1.3 system-ui,sans-serif;color:#000}",
    "  #w8-print h1{font-size:17px;margin:0 0 4px}#w8-print p{margin:3px 0}",
    "  #w8-print table{table-layout:fixed;margin:6px 0}",
    "  #w8-print th,#w8-print td{border:1px solid #888;padding:3px 5px;font-size:9.5px;color:#000;white-space:pre-line;overflow-wrap:anywhere}",
    "  #w8-print tr{break-inside:avoid}",
    "  #w8-print pre{white-space:pre-wrap;font:12px/1.5 system-ui,sans-serif;margin:0}",
    "}"
  ].join("\n")));

  // Print one thing only. A clean copy goes into a holder at the end of <body>, the print style hides
  // the rest of the page, and the page goes back to normal when the print window closes.
  function printOnly(node) {
    let holder = document.getElementById("w8-print");
    if (!holder) { holder = h("div", { id: "w8-print" }); document.body.appendChild(holder); }
    holder.innerHTML = ""; holder.appendChild(node);
    document.body.classList.add("w8-printing");
    window.addEventListener("afterprint", function done() {
      document.body.classList.remove("w8-printing");
      window.removeEventListener("afterprint", done);
    });
    window.print();
  }

  // A numbered step that can redraw itself, so a tick near the bottom does not jump the page back to the top.
  function part(steps, title, draw, id) {
    const body = h("div"), section = OH.step(title, body);
    const redraw = () => { body.innerHTML = ""; draw(body, redraw); };
    if (id) section.id = id;
    steps.appendChild(section); redraw();
  }

  // ── Part 1 · from a panicked message to a clear support request ──
  const sampleForm = () => { const form = {}; S.fields.forEach((q) => { form[q.id] = q.sample; }); return form; };
  const sampleMessage = () => "TEXT MESSAGE\nFrom: " + S.message.from + "\nTo: " + S.message.to + "\nSent: " + S.message.sent + "\n" + S.message.text +
    "\n\nWHAT THE OWNER KNOWS\n" + S.facts.map((fact) => "- " + fact).join("\n");

  // The request support can act on: five lines in the order the session teaches, with a clear mark where an answer is missing.
  function buildRequest(form, urgency) {
    const level = S.urgency.find((u) => u.id === urgency);
    const answer = (id) => (filled(form[id]) ? form[id].trim() : "[MISSING: " + S.fields.find((q) => q.id === id).short + "]");
    const words = filled(form.words) ? '"' + form.words.trim().replace(/^["“]+|["”]+$/g, "") + '"' : answer("words");
    return [
      "Subject: " + (level ? level.tag + ": " : "") + answer("what"),
      "What we see: " + words + (filled(form.repeat) ? " " + form.repeat.trim() : ""),
      "When it started, and what changed: " + answer("when") + " " + answer("changed"),
      "Who is affected, and what it stops: " + answer("who") + " " + (level ? level.line : "[MISSING: how urgent it is]"),
      "What we tried, in order: " + answer("tried"),
      "How to reach us: " + answer("contact")
    ].join("\n\n");
  }

  // "Did it guess the cause?" The lines of an AI answer that use a guessing word.
  const guessLines = (text) => text.split("\n").filter((line) => S.guessWords.some((w) => line.toLowerCase().indexOf(w) >= 0));

  function drawRequest(body, redraw) {
    const own = get("own", "") || "";                        // the person's own message, once they paste one
    const form = get("form", null) || (own ? {} : sampleForm());
    let urgency = get("urgency", null); if (urgency == null) urgency = own ? "" : "money";
    const inputs = {}, notes = h("div"), compare = h("div");
    const request = h("pre", { class: "code" }), requestAgain = h("pre", { class: "code" });

    function refresh() {                                     // after every change: rebuild the request and say what is missing
      const text = buildRequest(form, urgency), noWords = !filled(form.words);
      const empty = S.fields.filter((q) => q.id !== "words" && !filled(form[q.id])).map((q) => q.short).concat(urgency ? [] : ["how urgent it is"]);
      request.textContent = text; requestAgain.textContent = text;
      S.fields.forEach((q) => { inputs[q.id].style.borderColor = filled(form[q.id]) ? "" : "var(--warn)"; });
      notes.innerHTML = "";
      if (noWords) notes.appendChild(OH.note(S.wordsMissing, "warn"));
      if (noWords && !own) notes.appendChild(h("button", { style: "margin-bottom:10px", onclick: () => {
        Object.assign(form, S.reply); set("form", form);
        Object.keys(S.reply).forEach((id) => { inputs[id].value = form[id]; });
        refresh();
      } }, "Add what Luis sends back"));
      if (empty.length) notes.appendChild(OH.note("Still empty: " + empty.join(", ") + ".", "warn"));
      if (S.fields.some((q) => /passw|passcode/i.test(form[q.id] || ""))) notes.appendChild(OH.note(S.passwordNote, "warn"));
      if (!noWords && !empty.length) notes.appendChild(OH.note("Every question is answered. This request is ready to copy and send.", "ok"));
    }

    function showCompare(text) {                             // the AI's version beside the form's version
      const guesses = guessLines(text);
      compare.innerHTML = "";
      compare.appendChild(h("div", { class: "grid g2", style: "margin-top:14px" },
        OH.card("The AI's version", h("pre", { class: "code" }, text)), OH.card("The form's version", requestAgain)));
      compare.appendChild(guesses.length
        ? OH.note(S.guessed + " " + guesses.map((line) => line.trim()).join(" / "), "warn")
        : OH.note(S.noGuess, "ok"));
      compare.appendChild(h("p", { class: "mut" }, S.checks));
    }

    // the message, and a way to swap in your own
    body.appendChild(h("p", { class: "mut" }, own ? "Your own problem. Answer the calm questions, then copy the request." : S.scene));
    body.appendChild(h("div", { class: "grid g2" },
      OH.card(own ? "The message" : "The text message",
        own ? null : h("p", { class: "mut" }, "From " + S.message.from + " to " + S.message.to + " · " + S.message.sent),
        h("pre", { class: "code" }, own || S.message.text)),
      own ? null : OH.card("What the owner knows", h("ul", { style: "margin:0;padding-left:18px" }, S.facts.map((fact) => h("li", null, fact))))));
    const ownBox = h("textarea", { placeholder: S.ownHint });
    const useOwn = () => {
      if (!filled(ownBox.value)) return OH.toast("Paste or type the message first");
      set("own", ownBox.value.trim()); set("form", {}); set("urgency", ""); set("ai", null); redraw();
    };
    const backToSample = () => { ["own", "form", "urgency", "ai"].forEach((k) => set(k, null)); redraw(); };
    body.appendChild(h("details", { style: "margin-top:10px" }, h("summary", null, "Use my own problem"), ownBox, buttons(
      h("button", { class: "primary", onclick: useOwn }, "Use this message"),
      own ? h("button", { onclick: backToSample }, "Back to the Greenline sample message") : null)));

    // the calm questions, as a short form
    body.appendChild(heading("The calm questions"));
    body.appendChild(h("p", { class: "mut" }, "Two minutes, before anyone presses anything. An empty answer is useful too: it shows what nobody knows yet."));
    body.appendChild(h("div", { class: "grid g2" }, S.fields.map((q) => {
      inputs[q.id] = h("textarea", { class: "w8-answer", placeholder: q.hint, value: form[q.id] || "",
        oninput: (ev) => { form[q.id] = ev.target.value; set("form", form); refresh(); } });
      return h("div", null, h("label", { class: "f" }, q.label), inputs[q.id]);
    })));
    body.appendChild(h("label", { class: "f" }, "What does it stop?"));
    body.appendChild(h("div", { class: "row", style: "align-items:stretch" }, S.urgency.map((u) => h("label", { class: "card w8-pick" },
      h("input", { type: "radio", name: "w8-urgency", checked: urgency === u.id, onchange: () => { urgency = u.id; set("urgency", u.id); refresh(); } }),
      " ", h("b", null, u.label), h("div", { class: "mut" }, u.act)))));

    // the request the form builds
    body.appendChild(heading("The support request"));
    body.appendChild(notes); body.appendChild(request);
    body.appendChild(buttons(
      h("button", { class: "primary", onclick: () => OH.copy(buildRequest(form, urgency), "Support request copied") }, "Copy the support request")));

    // the same job, done by an AI
    body.appendChild(heading("The same job, done by an AI"));
    body.appendChild(h("p", { class: "mut" }, "Read the rules before you send it. " + S.rules.join(" ") +
      (own ? " Change the first line of the prompt so it describes your business." : "")));
    body.appendChild(OH.promptBox({ prompt: S.prompt, data: () => own || sampleMessage(), dataLabel: "message" }).el);
    body.appendChild(OH.pasteBox({ label: "Paste the AI's answer here", sample: own ? null : S.answer, useLabel: "Compare with the form's version",
      onUse: (text) => { set("ai", text); showCompare(text); } }));
    body.appendChild(compare);

    refresh();
    if (filled(get("ai", ""))) showCompare(get("ai", ""));
  }

  // ── Part 2 · the one-page when-it-breaks sheet ──
  // A clean copy of the sheet for paper: who to call, the five questions, the table, and an empty log.
  function sheetForPrint(top, rows) {
    const T = S.sheet, blank = "________________";
    const table = (cols, widths, lines) => h("table", null,
      h("thead", null, h("tr", null, cols.map((c, i) => h("th", { style: widths ? "width:" + widths[i] + "%" : null }, c)))),
      h("tbody", null, lines.map((line) => h("tr", null, line.map((v) => h("td", { style: "height:20px" }, v))))));
    return h("div", null,
      h("h1", null, "When it breaks: " + (top.biz || blank)),
      h("p", null, "Printed " + OH.niceDate(OH.today()) + ". Checked by: " + blank),
      h("p", null, h("b", null, "First call inside the business: "), top.first || blank),
      h("p", null, h("b", null, "Second call: "), top.second || blank),
      T.printTop.map((line) => h("p", null, line)),
      table(T.cols, T.widths, rows),
      h("p", null, h("b", null, T.rule)),
      h("p", null, h("b", null, "The log. "), "One line every time something breaks."),
      table(T.log, null, [0, 1, 2].map(() => T.log.map(() => ""))));
  }

  function drawSheet(body, redraw) {
    const T = S.sheet, top = Object.assign({}, T.top, get("top", null));
    const rows = (get("rows", null) || T.rows).map((row) => row.slice());       // a copy, so the sample itself is never changed
    const save = () => set("rows", rows);
    const topField = (key, label, hint) => h("div", null, h("label", { class: "f" }, label),
      h("input", { type: "text", placeholder: hint, value: top[key], oninput: (ev) => { top[key] = ev.target.value; set("top", top); } }));
    const cell = (row, c) => h("textarea", { class: "w8-cell", placeholder: T.hints[c], value: row[c], oninput: (ev) => { row[c] = ev.target.value; save(); } });

    body.appendChild(h("p", { class: "mut" }, T.intro));
    body.appendChild(h("div", { class: "grid g3" },
      topField("biz", "Business name", "Your business"),
      topField("first", "First call inside the business", "A name and a phone number"),
      topField("second", "Second call", "A name and a phone number")));
    body.appendChild(h("div", { class: "wrap", style: "margin-top:12px" }, h("table", { class: "w8-sheet" },
      h("thead", null, h("tr", null, T.cols.map((c, i) => h("th", { style: "width:" + T.widths[i] + "%" }, c)))),
      h("tbody", null, rows.length ? rows.map((row, i) => h("tr", null, row.map((v, c) => h("td", null, cell(row, c),
        c === 0 ? h("button", { class: "small ghost", onclick: () => { rows.splice(i, 1); save(); redraw(); } }, "Remove this row") : null))))
        : h("tr", null, h("td", { colspan: T.cols.length, class: "mut" }, "No rows yet. Press Add a row."))))));
    body.appendChild(buttons(
      h("button", { onclick: () => { rows.push(T.cols.map(() => "")); save(); redraw(); } }, "Add a row"),
      h("button", { class: "primary", onclick: () => printOnly(sheetForPrint(top, rows)) }, "Print the sheet"),
      h("button", { onclick: () => OH.download("when-it-breaks-sheet.csv", OH.toCSV([T.cols].concat(rows)), "text/csv") }, "Download as CSV"),
      h("span", { class: "spacer" }),
      // Replacing the rows asks first, in the page: the first press arms the button, the second one does it.
      h("button", { class: "ghost", onclick: (ev) => {
        if (get("rows", null) && !armed(ev.target, "Press again to replace the rows with a blank sheet")) return;
        set("rows", T.blank.map((tool) => T.cols.map((c, i) => (i ? "" : tool)))); set("top", { biz: "", first: "", second: "" }); redraw();
      } }, "Start a blank sheet for my business"),
      h("button", { class: "ghost", onclick: (ev) => {
        if (get("rows", null) && !armed(ev.target, "Press again to bring back the Greenline rows")) return;
        set("rows", null); set("top", null); redraw();
      } }, "Bring back the Greenline rows")));
    body.appendChild(OH.note(T.rule, "warn"));
    body.appendChild(OH.note(T.keep));
  }

  // ── Part 3 · five security habits, and the three signs of phishing ──
  // Which of the three signs a message shows, and the words that gave each one away.
  function phishSigns(text) {
    const low = text.toLowerCase();
    return S.phish.signs.map((sign) => ({ label: sign.label, hits: sign.words.filter((w) => low.indexOf(w) >= 0) }));
  }

  function drawHabits(body) {
    const ticks = get("habits", null) || {}, count = h("div"), P = S.phish;
    function showCount() {
      const n = S.habits.filter((x) => ticks[x.id]).length, next = S.habits.find((x) => !ticks[x.id]);
      const advice = next ? "Next: " + next.label.toLowerCase() + "." : "All five are habits now.";
      count.innerHTML = "";
      count.appendChild(OH.note(n + " of " + S.habits.length + " done. " + advice, next ? "" : "ok"));
    }
    body.appendChild(h("p", { class: "mut" }, S.habitsIntro));
    S.habits.forEach((x) => body.appendChild(h("label", { class: "item w8-tick" },
      h("input", { type: "checkbox", checked: !!ticks[x.id], onchange: (ev) => { ticks[x.id] = ev.target.checked; set("habits", ticks); showCount(); } }),
      h("span", null, h("b", null, x.label), x.text))));
    body.appendChild(count); showCount();

    // the three-sign check, tried on the scam email from Week 1 (or on any message pasted in)
    const message = h("textarea", { value: P.email, placeholder: "Paste a message you are not sure about. Leave out anything with a password or a card number." });
    const result = h("div");
    function check() {
      if (!filled(message.value)) return OH.toast("Paste a message first");
      const signs = phishSigns(message.value), found = signs.filter((s) => s.hits.length).length;
      result.innerHTML = "";
      signs.forEach((s) => result.appendChild(h("div", { class: "item" },
        OH.badge(s.hits.length ? "Found" : "Not found", s.hits.length ? "bad" : "ok"), " ", h("b", { style: "display:inline" }, s.label),
        s.hits.length ? h("small", { style: "display:block" }, "The words that gave it away: " + s.hits.join(", ")) : null)));
      result.appendChild(OH.note(found + " of " + signs.length + " signs. " + P.verdict[Math.min(found, 2)], found >= 2 ? "warn" : ""));
    }
    body.appendChild(heading("Is this message phishing?"));
    body.appendChild(h("p", { class: "mut" }, P.intro));
    body.appendChild(message);
    body.appendChild(buttons(h("button", { class: "primary", onclick: check }, "Check this message"),
      h("button", { onclick: () => { message.value = ""; result.innerHTML = ""; message.focus(); } }, "Try a message of my own")));
    body.appendChild(result);
  }

  // ── Part 4 · the 90-day plan: twelve weeks, three blocks, one thing at a time ──
  const isoDay = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const addDays = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return isoDay(d); };
  const nextMonday = () => addDays(OH.today(), (8 - new Date(OH.today() + "T12:00:00").getDay()) % 7);   // today, if today is a Monday
  const planStart = () => { const saved = get("start", ""); return /^\d{4}-\d{2}-\d{2}$/.test(saved) ? saved : nextMonday(); };
  const weekDates = (start, week) => OH.niceDate(addDays(start, (week - 1) * 7)) + " to " + OH.niceDate(addDays(start, week * 7 - 1));
  const planTicks = () => get("done", null) || {};
  const planDone = () => { const done = planTicks(); return S.plan.steps.filter((p) => done[p.week]).length; };
  const toolName = (session) => (OH.course.sessions.find((x) => x.week === session) || {}).tool || "";

  function planText() {                                      // the whole plan as plain text, for a file or for paper
    const P = S.plan, done = planTicks(), start = planStart();
    const lines = ["MY 90-DAY PLAN: ONE THING AT A TIME",
      planDone() + " of " + P.steps.length + " steps done. Week 1 starts " + OH.niceDate(start) + ".",
      "", "TONIGHT, BEFORE WEEK 1: " + P.tonight];
    P.blocks.forEach((block, i) => {
      lines.push("", block.label.toUpperCase() + ". " + block.theme);
      P.steps.filter((p) => p.block === i).forEach((p) => lines.push(
        (done[p.week] ? "[x] " : "[ ] ") + "Week " + p.week + " (" + weekDates(start, p.week) + "): " + p.title + ". " + p.text + " (Session " + p.session + ")"));
    });
    return lines.concat("", "THE RULE: " + P.rule).join("\n");
  }

  function drawPlan(body, redraw) {
    const P = S.plan, done = planTicks(), start = planStart(), n = planDone(), total = P.steps.length;
    // A link to the week's tool, when that week is in this copy of the app. This week's own step scrolls up to the sheet.
    const toolLink = (p) => {
      if (!OH.modules[p.session]) return h("span", { class: "mut" }, "From Session " + p.session + ": " + toolName(p.session));
      if (p.session !== WEEK) return h("a", { href: "#/w" + p.session }, "Open the Week " + p.session + " tool: " + toolName(p.session));
      const toSheet = (ev) => { ev.preventDefault(); document.getElementById("w8-sheet-step").scrollIntoView({ behavior: "smooth" }); };
      return h("a", { href: "#/w" + WEEK, onclick: toSheet }, "Go to the sheet in step 2 of this page");
    };
    const dates = {};                                        // the date line of each week, so a new start date can update them in place
    const newStart = (ev) => {
      set("start", ev.target.value);
      P.steps.forEach((p) => { dates[p.week].textContent = weekDates(planStart(), p.week); });
    };
    const stepCard = (p) => h("div", { class: "item" },
      h("label", { class: "w8-tick" },
        h("input", { type: "checkbox", checked: !!done[p.week], onchange: (ev) => { done[p.week] = ev.target.checked; set("done", done); redraw(); } }),
        h("span", null, h("b", null, "Week " + p.week + " · " + p.title), dates[p.week] = h("small", null, weekDates(start, p.week)))),
      h("div", { class: done[p.week] ? "mut" : "", style: "margin:6px 0" }, p.text),
      toolLink(p));

    body.appendChild(h("p", { class: "mut" }, P.intro));
    body.appendChild(h("div", { class: "row" },
      h("label", { class: "f", style: "margin:0" }, "Week 1 starts on"),
      h("input", { type: "date", style: "width:auto", value: start, onchange: newStart }),
      h("span", { class: "spacer" }), h("b", { class: n >= total ? "ok" : "" }, n + " of " + total + " steps done")));
    body.appendChild(h("div", { class: "bartrack", style: "margin:10px 0" }, h("div", { class: "barfill", style: "width:" + Math.round(n / total * 100) + "%" })));
    body.appendChild(OH.note("Tonight, before week 1: " + P.tonight));
    body.appendChild(h("div", { class: "piles" }, P.blocks.map((block, i) => {
      const steps = P.steps.filter((p) => p.block === i);
      return h("div", { class: "pile" },
        h("h3", null, block.label, OH.badge(steps.filter((p) => done[p.week]).length + " of " + steps.length + " done", "blue")),
        h("div", { class: "mut", style: "font-size:13px" }, block.theme),
        steps.map(stepCard));
    })));
    body.appendChild(buttons(
      h("button", { class: "primary", onclick: () => printOnly(h("pre", null, planText())) }, "Print the plan"),
      h("button", { onclick: () => OH.download("my-90-day-plan.txt", planText()) }, "Download the plan as text")));
    body.appendChild(OH.note(P.rule, "ok"));
    body.appendChild(h("p", { class: "mut", style: "font-size:13px" }, P.keep));
  }

  function render(root) {
    const steps = h("div", { class: "steps" }); root.appendChild(steps);
    document.body.classList.remove("w8-printing");           // in case a browser never said that printing ended
    part(steps, "From a panicked message to a clear support request", drawRequest);
    part(steps, "The one-page when-it-breaks sheet", drawSheet, "w8-sheet-step");
    part(steps, "Five security habits", drawHabits);
    part(steps, "Your 90-day plan: one thing at a time", drawPlan);
  }

  OH.register({
    week: WEEK, id: "w8-breaks", title: "The when-it-breaks sheet and your 90-day plan",
    intro: "A panicked text becomes a clear support request. Then the one page that says who to call, five security habits, and a plan for the next twelve weeks.",
    render: render,
    summary: function () {
      const n = planDone(), total = S.plan.steps.length;
      return { label: "90-day plan steps done", value: n + " of " + total, tone: n >= total ? "ok" : n ? "warn" : "" };
    },
    /* For the game (GAME.md): what counts as done, read from what this page has already saved. It writes nothing.
       The catch is the answer nobody has yet: the exact words on the screen stay empty until somebody asks Luis. */
    objectives: function () {
      const d = { words: false, compared: false, sheet: false, habits: false, plan: false };
      try {
        const own = get("own", "") || "", form = get("form", null) || (own ? {} : sampleForm());
        let urgency = get("urgency", null); if (urgency == null) urgency = own ? "" : "money";
        const T = S.sheet, rows = get("rows", null), ticks = get("habits", null) || {};
        const greenline = T.rows.map((row) => row[0]);
        const untouched = (row) => T.blank.indexOf(row[0]) >= 0 && row.slice(1).every((v) => !filled(v));   // a row of the blank sheet nobody has filled in
        d.words = !!urgency && S.fields.every((q) => filled(form[q.id]));               // the request is ready: no answer left empty
        d.compared = filled(get("ai", ""));
        d.sheet = Array.isArray(rows) && rows.some((row) => Array.isArray(row) && filled(row[0]) && greenline.indexOf(row[0]) < 0 && !untouched(row));
        d.habits = S.habits.some((x) => ticks[x.id]);
        d.plan = planDone() > 0;
      } catch (e) { /* nothing saved yet, or something unreadable: every box stays empty */ }
      return [
        { id: "words", label: "Find the missing answer and get it from Luis", done: !!d.words, required: true },
        { id: "compared", label: "Check the AI's version for a guessed cause", done: !!d.compared, required: true },
        { id: "sheet", label: "Put one tool of your own on the when-it-breaks sheet", done: !!d.sheet, required: true },
        { id: "habits", label: "Tick the security habits you already have", done: !!d.habits, required: false },
        { id: "plan", label: "Tick the first step of your 90-day plan", done: !!d.plan, required: true }
      ];
    }
  });
})();
