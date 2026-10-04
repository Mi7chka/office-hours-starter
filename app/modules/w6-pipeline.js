/* Week 6 · The pipeline board.
   The job from Session 6: keep every lead in one list, sort it by next step date to see who has
   gone quiet, let the AI draft the follow-ups from your notes, find the draft that is wrong, and
   leave every open lead with a next step and a date. Works with the sample leads or your own rows. */
(function () {
  const h = OH.h, S = OH.sample.pipeline, K = "w6:";
  const get = (k, d) => OH.store.get(K + k, d), set = (k, v) => OH.store.set(K + k, v);
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const leads = () => get("leads", null) || S.leads.map((l) => Object.assign({}, l));   // copies: the sample itself is never edited
  const today = () => get("today", null) || S.classDate;
  const pad = (n) => String(n).padStart(2, "0");
  const first = (l) => l.name.split(" ")[0];
  const closed = (l) => l.stage === "Won" || l.stage === "Lost";
  const plural = (n, word) => n + " " + word + (n === 1 ? "" : "s");
  const days = (from, to) => Math.round((Date.parse(to + "T12:00:00Z") - Date.parse(from + "T12:00:00Z")) / 86400000);
  const longDate = (iso) => { const p = iso.split("-"); return MONTHS[+p[1] - 1] + " " + +p[2] + ", " + p[0]; };
  const lostLine = (l) => l.name + " is closed with a no. A no is a good outcome: it closes the loop, and you stop carrying this lead around in your head. The bad outcome is silence.";

  /* Where a lead stands today. Gone quiet means: still open, and the next step or its date is
     missing, or the date has passed. `rank` puts the oldest date first, then the ones with no date. */
  function status(l, t) {
    if (closed(l)) return { quiet: false, rank: -1, text: l.stage === "Won" ? "Won" : "Closed with a no", tone: l.stage === "Won" ? "ok" : "" };
    const late = l.date ? days(l.date, t) : 0;
    if (late > 0) return { quiet: true, late: true, rank: 100000 + late, text: plural(late, "day") + " overdue", tone: "bad" };
    if (l.date && l.step) return { quiet: false, rank: 0, text: late === 0 ? "Due today" : "On time", tone: late === 0 ? "warn" : "ok" };
    const idle = l.last ? Math.max(0, days(l.last, t)) : 0;
    return { quiet: true, late: false, rank: idle, tone: "bad", text: l.date ? "No next step" : l.step ? "No date" : "No next step, no date",
      since: l.last ? plural(idle, "day") + " since the last contact" : "" };
  }

  /* The page's own check of one draft against that lead's notes: the session's rules, applied with
     plain pattern matching. It runs with no AI, and it only speaks up once you have chosen. */
  const DAY = /\b(?:mon|tues|wednes|thurs|fri|satur|sun)day\b|\btomorrow\b|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec) \d{1,2}\b|\b\d{1,2}\/\d{1,2}\b/g;
  const PRICE = /\$\s?\d[\d,.]*|\b\d[\d,.]*\s?(?:dollars|bucks)\b/g;
  const SAID_NO = /went with (another|someone|a different)|chose (another|someone)|hired (another|someone)|not interested|no longer (needs|interested)|said no\b|declined|turned (us|it) down/;
  const WANTS_A_CALL = /does not read email|doesn't read email|prefers? (a |the )?(phone|call|text)/;
  // Lower case, and "October 16" or "Oct. 16" both become "oct 16", so a date in the draft can be looked up in the notes.
  const tidy = (s) => String(s || "").toLowerCase().replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?(?= \d)/g, "$1");
  function problems(l, draft) {
    const notes = tidy(l.notes + " " + l.step), d = tidy(draft), out = [];
    const notInNotes = (re) => (d.match(re) || []).filter((x, i, a) => a.indexOf(x) === i && notes.indexOf(x) < 0).map((x) => x.charAt(0).toUpperCase() + x.slice(1));
    const newDays = notInNotes(DAY), newPrices = notInNotes(PRICE), words = draft.split(/\s+/).filter(Boolean).length, asks = (draft.match(/\?/g) || []).length;
    if (SAID_NO.test(notes)) out.push("The notes say this lead already said no. Another follow-up about the quote is the wrong move. Close the loop: move the lead to Lost, and write down when to ask again.");
    if (newDays.length) out.push("The draft names a day that is not in the notes: " + newDays.join(", ") + ". That day was invented. Take it out, or choose the day yourself.");
    if (newPrices.length) out.push("The draft quotes a price that is not in the notes: " + newPrices.join(", ") + ". An invented price is a quote you have to honor or take back.");
    if (WANTS_A_CALL.test(notes)) out.push("The notes say this person wants a phone call. An email is the wrong move, however well it is written.");
    if (/referr/i.test(l.source) && l.stage === "New") out.push("This is a referral nobody has answered yet. The first reply comes from you, by phone. Then thank the person who sent them.");
    if (words > 80) out.push("The draft runs " + words + " words. The rule says under 80.");
    if (asks !== 1) out.push("The draft asks " + plural(asks, "question") + ". The rule says one.");
    return out;
  }

  // Split an answer into drafts, in the order they came. Each one starts with a line that holds the word DRAFT and a lead's name.
  function parseDrafts(text, list) {
    const out = []; let cur = null;
    text.split("\n").forEach((line) => {
      if (/^[\W\d]*draft\b/i.test(line)) {
        const low = line.toLowerCase(), said = low.replace(/[^a-z0-9' ]/g, " ").split(/\s+/);
        const hit = list.find((l) => low.indexOf(l.name.toLowerCase()) >= 0) || list.find((l) => said.indexOf(first(l).toLowerCase()) >= 0);
        if (hit) { cur = out.find((d) => d.id === hit.id) || out[out.push({ id: hit.id, text: "" }) - 1]; cur.text = ""; return; }
      }
      if (cur) cur.text += line + "\n";
    });
    out.forEach((d) => { d.text = d.text.trim(); });
    return out.filter((d) => d.text);
  }

  /* Your own rows: pasted from Google Sheets or a CRM export, header row first. Headers are matched
     loosely, most specific first, so "Next step date" is not mistaken for "Next step". */
  const HEADERS = [["date", /next.*date|follow.*date|due/], ["step", /next/], ["last", /last.*(contact|touch|activ|call|email)|contacted/], ["source", /source|found|how/],
    ["stage", /stage|status/], ["email", /mail/], ["phone", /phone|mobile|cell|tel/], ["notes", /note|comment|detail|descr/], ["name", /name|lead|contact|customer|client/], ["asked", /ask|request|need|want|service|interest|deal|job/]];
  const STAGES = [["Won", /won/], ["Lost", /lost|dead|closed/], ["Proposal", /propos|quot|estimat/], ["Discovery", /discover|visit|meet|qualif/], ["Contacted", /contact|repl|working|attempt/]];
  function isoDate(v) {
    v = String(v || "").trim(); let m;
    if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(v))) return m[1] + "-" + pad(m[2]) + "-" + pad(m[3]);
    if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(v))) return (m[3].length === 2 ? "20" + m[3] : m[3]) + "-" + pad(m[1]) + "-" + pad(m[2]);
    const d = new Date(v); return v && !isNaN(d) ? d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) : "";
  }
  function parseLeads(text) {
    const rows = OH.parseCSV(text), col = {};
    if (rows.length < 2) return [];
    rows[0].forEach((head, i) => { const f = HEADERS.find((x) => col[x[0]] == null && x[1].test(head.toLowerCase())); if (f) col[f[0]] = i; });
    if (col.name == null) return [];
    const cell = (r, f) => (col[f] == null ? "" : String(r[col[f]] || "").trim());
    const stage = (v) => S.stages.find((x) => x.toLowerCase() === v.toLowerCase()) || (STAGES.find((x) => x[1].test(v.toLowerCase())) || ["New"])[0];
    return rows.slice(1).filter((r) => cell(r, "name")).map((r, i) => ({ id: i + 1, name: cell(r, "name"), asked: cell(r, "asked"), source: cell(r, "source"), stage: stage(cell(r, "stage")),
      last: isoDate(cell(r, "last")), step: cell(r, "step"), date: isoDate(cell(r, "date")), notes: cell(r, "notes"), email: cell(r, "email"), phone: cell(r, "phone") }));
  }

  function render(root, ctx) {
    const list = leads(), t = today(), own = get("own", false), marks = get("marks", null) || {}, drafts = get("drafts", null);
    const redraw = () => { const y = window.scrollY; ctx.redraw(); window.scrollTo(0, y); };   // the shell jumps to the top on a redraw: go back
    const save = () => { set("leads", list); redraw(); };
    const st = {}; list.forEach((l) => { st[l.id] = status(l, t); });
    const quiet = list.filter((l) => st[l.id].quiet).sort((a, b) => st[b.id].rank - st[a.id].rank);
    const byId = (id) => list.find((l) => l.id === id);
    const standing = (l) => [OH.badge(st[l.id].text, st[l.id].tone), st[l.id].since ? h("div", { class: "mut", style: "font-size:12.5px" }, st[l.id].since) : null];
    const table = (cols) => [S.columns.slice(0, cols)].concat(list.map((l) => [l.name, l.asked, l.source, l.stage, l.last, l.step, l.date, l.notes, l.email, l.phone].slice(0, cols)));
    const steps = h("div", { class: "steps" }); root.appendChild(steps);

    const stageSelect = (l) => h("select", { style: "width:auto;padding:4px 8px;font-size:13px", onchange: (ev) => {
      l.stage = ev.target.value; if (l.stage === "Lost") OH.toast("Closed with a no. That is a good outcome."); save(); } },
      S.stages.map((x) => h("option", { value: x, selected: x === l.stage }, x)));

    // The next step and its date, always asked for together. `sent` also records today as the last contact.
    const nextForm = (l, sent) => {
      const step = h("input", { type: "text", placeholder: "The next step, for example: call to ask if the quote arrived", value: sent ? "" : l.step });
      const date = h("input", { type: "date", min: t, style: "width:170px", value: sent || l.date < t ? "" : l.date });
      return h("div", { class: "row", style: "margin-top:8px" }, h("div", { style: "flex:1;min-width:220px" }, step), date,
        h("button", { class: "primary", onclick: () => {
          if (!step.value.trim() || !date.value) return OH.toast("A lead needs both: a next step and a date");
          if (date.value < t) return OH.toast("Pick today or a later date");
          l.step = step.value.trim(); l.date = date.value;
          if (sent) { l.last = t; marks[l.id] = "sent"; set("marks", marks); }
          save();
        } }, "Save the next step"));
    };

    // 1 · the list, sorted by next step date
    const ownBox = h("textarea", { placeholder: "Paste your rows here, header row first.\nThe page looks for these columns: " + S.columns.join(", ") + ".\nYou can leave Email and Phone out." });
    steps.appendChild(OH.step("The lead list: " + plural(list.length, "lead") + ", " + quiet.length + " gone quiet",
      h("div", { class: "row", style: "margin-bottom:12px" }, h("b", null, "Today is"),
        h("input", { type: "date", style: "width:170px", value: t, onchange: (ev) => { if (ev.target.value >= "2000-01-01") { set("today", ev.target.value); redraw(); } } }),
        h("button", { class: "small", onclick: () => { set("today", OH.today()); redraw(); } }, "Use the real today"),
        !own && t !== S.classDate ? h("button", { class: "small", onclick: () => { set("today", S.classDate); redraw(); } }, "Back to the class date") : null,
        own ? null : h("span", { class: "mut" }, "The sample dates are written for " + longDate(S.classDate) + ".")),
      h("div", { class: "grid g4", style: "margin-bottom:12px" },
        OH.stat("Gone quiet", quiet.length + " of " + list.length, "open, and the date is past or missing", quiet.length ? "bad" : "ok"),
        OH.stat("Date already gone by", quiet.filter((l) => st[l.id].late).length, "somebody meant to follow up"),
        OH.stat("No date at all", quiet.filter((l) => !st[l.id].late).length, "nothing will ever remind anyone"),
        OH.stat("Closed", list.filter(closed).length, "won or lost: both are finished")),
      OH.table([
        { h: "Name", f: (l) => [h("b", null, l.name), h("div", { class: "mut", style: "font-size:13px" }, l.asked)], s: (l) => l.name.toLowerCase() },
        { h: "Source", f: (l) => l.source || OH.badge("No source", "warn"), s: (l) => l.source },
        { h: "Stage", f: stageSelect, s: (l) => S.stages.indexOf(l.stage) },
        { h: "Last contact", f: (l) => (l.last ? OH.niceDate(l.last) : ""), s: (l) => l.last },
        { h: "Next step", f: (l) => l.step || (closed(l) ? "" : OH.badge("No next step", "bad")), s: (l) => l.step },
        { h: "Next step date", f: (l) => (l.date ? OH.niceDate(l.date) : closed(l) ? "" : OH.badge("No date", "bad")), s: (l) => l.date || "9999" },
        { h: "Where it stands", f: standing, s: (l) => -st[l.id].rank },
        { h: "Notes", f: (l) => h("span", { class: "mut", style: "font-size:13px" }, l.notes), s: (l) => l.notes }
      ], list, { sort: 5, rowClass: (l) => (st[l.id].quiet ? "hot" : "") }),
      OH.note("The rule: every open lead has a next step and a date. If either one is blank, that lead is already going quiet. Sorted by name, this list is a phone book. Sorted by next step date, it is a to-do list.", quiet.length ? "warn" : "ok"),
      h("details", { style: "margin-top:10px" }, h("summary", null, "Use my own leads"),
        h("p", { class: "mut" }, "Copy the rows from your own Google Sheet or a CRM export and paste them below. They stay in this browser."), ownBox,
        h("div", { class: "row", style: "margin-top:8px" }, h("button", { class: "primary", onclick: () => {
          const mine = parseLeads(ownBox.value);
          if (!mine.length) return OH.toast("I need a header row with a Name column, and at least one lead under it");
          set("leads", mine); set("own", true); set("today", OH.today()); ["picks", "drafts", "marks"].forEach((k) => set(k, null)); redraw();
        } }, "Use these leads")))));

    // 2 · who gets a follow-up, and the prompt (the three that have waited longest, unless you choose)
    const picks = (get("picks", null) || quiet.slice(0, 3).map((l) => l.id)).filter((id) => quiet.some((l) => l.id === id));
    const picked = quiet.filter((l) => picks.indexOf(l.id) >= 0);
    const oldestThree = picked.length === 3 && picked.every((l, i) => l === quiet[i] && st[l.id].late);
    const prompt = S.prompt.replace("{who}", own ? S.ownWho : S.who).replace("{today}", longDate(t)).replace("{sign}", own ? S.ownSign : S.sign)
      .replace("{which}", oldestThree ? "For the three with the oldest next step date" : "For these leads (" + picked.map((l) => l.name).join(", ") + ")");
    const pb = OH.promptBox({ prompt: prompt, data: () => OH.toCSV(table(8), "\t"), dataLabel: "leads", height: 215 });
    steps.appendChild(OH.step("Pick who gets a follow-up, and give the AI the job",
      h("p", { class: "mut" }, "The leads that have waited longest are ticked. The prompt states today's date and four rules: never invent a price or a date, under 80 words, " +
        "sound like a person, ask one question. The email and phone columns are left out of what gets copied."),
      quiet.map((l) => h("label", { style: "display:inline-flex;gap:6px;align-items:center;border:1px solid var(--line);border-radius:999px;padding:3px 11px;margin:0 6px 8px 0;font-size:13.5px;cursor:pointer" },
        h("input", { type: "checkbox", checked: picks.indexOf(l.id) >= 0, onchange: (ev) => { set("picks", picks.filter((id) => id !== l.id).concat(ev.target.checked ? [l.id] : [])); redraw(); } }),
        l.name + ", " + st[l.id].text.toLowerCase())),
      picked.length ? pb.el : OH.note(quiet.length ? "Tick at least one lead to build the prompt." : "Nobody has gone quiet, so there is nothing to draft today.", "ok")));

    // 3 · the drafts come back
    const plainDraft = (l) => "Hi " + first(l) + ",\n\nI am following up on your request" + (l.asked ? " (" + l.asked + ")" : "") + ". Is there anything you would like me to explain or change?\n\nThanks,\n" + S.ownSign;
    const sampleAnswer = () => "Open leads with a next step date in the past or missing:\n" + quiet.map((l) => "- " + l.name + ": " + st[l.id].text.toLowerCase()).join("\n") + "\n\n" +
      picked.map((l) => "DRAFT FOR " + l.name + "\n" + ((!own && S.drafts[l.name]) || plainDraft(l))).join("\n\n");
    steps.appendChild(OH.step("Bring the drafts back", OH.pasteBox({ sample: sampleAnswer, onUse: (text) => {
      const found = parseDrafts(text, list);
      if (!found.length) return OH.toast("I could not find the drafts. Ask the AI to start each one with DRAFT FOR and the lead's name.");
      set("drafts", found); set("marks", {}); redraw();
    } })));

    // 4 · which one is wrong? Always step 4, so the step numbers never move. The page's check explains itself after you choose.
    const shown = (drafts || []).filter((d) => byId(d.id)), flagged = shown.filter((d) => problems(byId(d.id), d.text).length), found = flagged.filter((d) => marks[d.id]).length;
    const mark = (id, value) => { if (value) marks[id] = value; else delete marks[id]; set("marks", marks); redraw(); };
    const card = (d) => {
      const id = d.id, l = byId(id), why = problems(l, d.text), m = marks[id];
      return h("div", { class: "card" },
        h("div", { class: "row" }, h("h3", { style: "margin:0" }, l.name), OH.badge(l.stage, "blue"), OH.badge(st[l.id].text, st[l.id].tone)),
        h("p", { class: "mut", style: "font-size:13.5px;margin:6px 0 8px" }, "The notes: " + (l.notes || "none")),
        h("pre", { class: "code" }, d.text),
        m === "hold" ? [
          h("div", { class: "note warn" }, h("b", null, "Do not send. "), why.length ? "Here is why." : "The page's check found nothing wrong with this draft. You know the customer better than a page does, so hold it if you have a reason.",
            why.length ? h("ul", { style: "margin:6px 0 0;padding-left:18px" }, why.map((x) => h("li", null, x))) : null),
          l.stage === "Lost" ? OH.note(lostLine(l), "ok") : null,
          h("div", { class: "row" }, closed(l) ? null : h("button", { class: "primary", onclick: () => { l.stage = "Lost"; OH.toast("Closed with a no. That is a good outcome."); save(); } }, "Close this lead as Lost"),
            closed(l) ? null : h("button", { onclick: () => mark(id, "asking") }, "I fixed the draft. Mark as sent"), h("button", { class: "ghost", onclick: () => mark(id, null) }, "Undo"))
        ] : m === "asking" ? [
          OH.note("Sent by you, not by the AI. Before you move on: what is the next step, and on what day?"), nextForm(l, true),
          h("div", { class: "row", style: "margin-top:8px" }, h("button", { class: "ghost", onclick: () => mark(id, null) }, "Undo"))
        ] : m === "sent" ? OH.note("Sent on " + OH.niceDate(l.last) + ". Next step: " + l.step + ", " + OH.niceDate(l.date) + ". " + first(l) + " has left the quiet list.", "ok")
        : h("div", { class: "row", style: "margin-top:10px" },
          h("button", { onclick: () => mark(id, "hold") }, "Do not send"),
          h("button", { class: "primary", onclick: () => { if (why.length) OH.toast("Not this one. Read why before it goes out."); mark(id, why.length ? "hold" : "asking"); } }, "Mark as sent")));
    };
    steps.appendChild(OH.step("Check its work: which one is wrong?",
      h("p", { class: "mut" }, "Don't ask whether the drafts are right. Ask which one is wrong. Read each draft next to that lead's notes, then choose. Nothing is sent from this page: you send it yourself, then mark it here."),
      !shown.length ? OH.note("The drafts appear here, each one under that lead's notes, once you bring an answer back in step 3.")
        : !flagged.length ? OH.note("The page's check finds nothing wrong in these drafts. Read them anyway. It drafts, you send.", "ok")
        : found < flagged.length ? OH.note("The page checked each draft against that lead's notes. It finds a problem in " + flagged.length + " of these " + shown.length + ". You have found " + found + ".", "warn")
        : OH.note("You found every draft the page's check flags: " + found + " of " + flagged.length + ". The AI did the drafting. The notes told you which drafts were wrong.", "ok"),
      h("div", { class: "grid g2" }, shown.map(card))));

    // 5 · fix the list: close the no, and give every open lead a next step and a date
    const fixRow = (l, top) => h("div", { class: "item" }, top,
      h("div", { class: "row" }, h("b", { style: "display:inline" }, l.name), OH.badge(st[l.id].text, st[l.id].tone), st[l.id].since ? h("span", { class: "mut" }, st[l.id].since) : null, h("span", { class: "spacer" }), "Stage", stageSelect(l)),
      h("small", null, l.notes), nextForm(l, false));
    steps.appendChild(OH.step("Fix the list: every open lead gets a next step and a date",
      quiet.length ? h("p", { class: "mut" }, "Most overdue first. Move the stage if it changed, write the next step, pick the day. If you cannot think of a next step, that is a decision too: close the lead.")
        : OH.note("Every open lead has a next step and a date. Nobody is going quiet.", "ok"),
      quiet.map((l) => fixRow(l, null)),
      list.filter((l) => l.stage === "Lost").map((l) => fixRow(l, [OH.note(lostLine(l), "ok"), h("small", null, "Did they say to try again later? Write when, so the list remembers and you do not have to.")]))));

    // 6 · where leads come from. In "Referral: Priya Raman" the door is before the colon and the person is after it.
    const doors = {}; list.forEach((l) => { const door = (l.source || "No source written down").split(/:\s+/)[0].trim(); doors[door] = (doors[door] || 0) + 1; });
    const senders = list.filter((l) => /:\s+\S/.test(l.source)).map((l) => l.source.split(/:\s+/)[1].trim() + " (sent " + l.name + ")");
    const won = list.filter((l) => l.stage === "Won"), blank = list.filter((l) => !l.source).length;
    steps.appendChild(OH.step("Where leads come from",
      h("p", { class: "mut" }, "The one column that pays for itself is source. Fill it in for every lead, and in three months you can sort by it and see which door your paying customers walked through."),
      OH.bars(Object.keys(doors).map((d) => ({ label: d, value: doors[d] })).sort((a, b) => b.value - a.value), { fmt: (n) => plural(n, "lead") }),
      senders.length ? OH.note("Write the name, not only the word referral. People to thank the same day, whether or not the job closes: " + senders.join(", ") + ".") : null,
      won.length ? h("p", { class: "mut" }, "Won so far: " + won.map((l) => l.name + " (" + (l.source || "no source") + ")").join(", ") + ".") : null,
      blank ? OH.note(plural(blank, "lead") + " with no source. Ask how they found you while you are still talking, and write it down.", "warn") : null));

    // 7 · take the list away
    steps.appendChild(OH.step("Take the list with you",
      h("p", { class: "mut" }, "Every column, email and phone included, with each change you made here. Paste it into a blank sheet and that sheet is your pipeline. Then open it every working day."),
      h("div", { class: "row" },
        h("button", { class: "primary", onclick: () => OH.copy(OH.toCSV(table(10), "\t"), "Lead list copied") }, "Copy for Google Sheets or Excel"),
        h("button", { onclick: () => OH.download("lead-list.csv", OH.toCSV(table(10)), "text/csv") }, "Download as a CSV file"))));
  }

  OH.register({
    week: 6, id: "w6-pipeline", title: "The pipeline board",
    intro: "One list of leads, sorted by next step date, so nobody goes quiet because you got busy. The AI drafts the follow-ups, you catch the one that is wrong, and nothing is sent to anybody.",
    render: render,
    summary: function () { const t = today(), all = leads(), n = all.filter((l) => status(l, t).quiet).length; return { label: "Leads gone quiet", value: n + " of " + all.length, tone: n ? "bad" : "ok" }; },
    /* For the game (GAME.md): what counts as done, read from what this page has already saved. It writes nothing.
       The catch is the drafts that must not go out: with the sample answer, Victor already said no and
       Angela's draft names a day that is not in her notes. The proof is a list where nobody is quiet. */
    objectives: function () {
      const d = { drafts: false, held: false, closed: false, sent: false, quiet: false, again: false };
      try {
        const list = leads(), t = today(), marks = get("marks", null) || {}, saved = get("drafts", null);
        const byId = (id) => list.find((l) => l.id === id);
        const drafts = (Array.isArray(saved) ? saved : []).filter((x) => x && typeof x.text === "string" && byId(x.id));
        const flagged = drafts.filter((x) => problems(byId(x.id), x.text).length);       // the same check step 4 runs
        const saidNo = (l) => SAID_NO.test(tidy(l.notes + " " + l.step));
        const lost = list.filter((l) => l.stage === "Lost");
        d.drafts = drafts.length > 0;
        d.held = d.drafts && (flagged.length ? flagged : drafts).every((x) => marks[x.id]);   // a choice made on every flagged draft, or on every draft when none is flagged
        d.closed = !list.some((l) => l.stage !== "Lost" && saidNo(l));
        d.sent = Object.keys(marks).some((id) => marks[id] === "sent");
        d.quiet = list.length > 0 && !list.some((l) => status(l, t).quiet);
        d.again = lost.some((l) => !!l.step && !!l.date && l.date >= t);
      } catch (e) { /* nothing saved yet, or something unreadable: every box stays empty */ }
      return [
        { id: "drafts", label: "Bring the follow-up drafts back", done: !!d.drafts, required: true },
        { id: "held", label: "Hold back every draft that should not go out", done: !!d.held, required: true },
        { id: "closed", label: "Close the lead who already said no", done: !!d.closed, required: true },
        { id: "sent", label: "Mark the good draft sent, with a next step and a date", done: !!d.sent, required: true },
        { id: "quiet", label: "Leave no open lead without a next step and a date", done: !!d.quiet, required: true },
        { id: "again", label: "Write down when to try the lost lead again", done: !!d.again, required: false }
      ];
    }
  });
})();
