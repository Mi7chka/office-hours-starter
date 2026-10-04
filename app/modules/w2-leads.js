/* Week 2 · Lead form to follow-up.
   The job from Session 2: "when this happens, do that, and tell me". A quote form is the trigger,
   a new row in the leads sheet is the action, and a notice to the owner is the "and tell me".
   Then an AI drafts the follow-up from that row and a person checks it. Nothing is sent to anybody. */
(function () {
  const h = OH.h, S = OH.sample.leadForm, K = "w2:";
  const get = (k, d) => OH.store.get(K + k, d), set = (k, v) => OH.store.set(K + k, v);
  const MIN = 60000, DAY = 1440 * MIN, DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const FIELDS = ["when", "name", "email", "phone", "service", "details", "best", "found"];      // one lead, in the order of the sheet's columns
  const HEAD = ["Timestamp", "Name", "Email", "Phone", "Service needed", "Details", "Best time to reach you", "How did you find us?"];
  const row = (l) => FIELDS.map((f) => l[f] || "");

  // ── time ──
  function clock(ms) {                               // "Mon 8:12 AM", the way the sample sheet writes it
    const d = new Date(ms), hr = d.getHours();
    return DAYS[d.getDay()] + " " + (hr % 12 || 12) + ":" + String(d.getMinutes()).padStart(2, "0") + " " + (hr < 12 ? "AM" : "PM");
  }
  function span(ms) {                                // "2 days 13 hr", "3 hr 5 min", "12 min"
    const m = Math.max(0, Math.round(ms / MIN)), hr = Math.floor(m / 60), d = Math.floor(hr / 24);
    return d ? d + (d === 1 ? " day " : " days ") + (hr % 24) + " hr" : hr ? hr + " hr " + (m % 60) + " min" : m + " min";
  }
  const full = (ms) => new Date(ms - new Date(ms).getTimezoneOffset() * MIN).toISOString().slice(0, 16).replace("T", " ");   // "2026-10-14 21:04", which a spreadsheet reads as a date
  function stamp(received, weeksBack) {              // "Mon 8:12 AM" as a real moment in this week, or some weeks back
    const m = /^(\w{3}) (\d+):(\d+) (AM|PM)$/.exec(received), d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + ((DAYS.indexOf(m[1]) + 6) % 7) - 7 * weeksBack);   // back to Monday, forward to the day
    d.setHours((+m[2] % 12) + (m[4] === "PM" ? 12 : 0), +m[3], 0, 0);
    return d.getTime();
  }

  // ── the leads ──
  function sampleLeads() {                           // the sample rows, with real times so "waiting" is a real number on any day
    const early = S.leads.some((l) => !l.lastWeek && stamp(l.received, 0) > Date.now()) ? 1 : 0;   // opened before Tuesday morning: use the week before
    return S.leads.map((l, i) => {
      const at = stamp(l.received, early + (l.lastWeek ? 1 : 0)), replied = l.repliedAfterMin ? at + l.repliedAfterMin * MIN : null;
      return Object.assign({}, l, { id: i + 1, at: at, when: clock(at), status: replied ? "replied" : "new", repliedAt: replied });
    });
  }
  const leads = () => get("leads", null) || sampleLeads();
  /* The guardrail: the same person asking twice. Two rows are the same person when the email
     matches or the phone number matches. */
  const contact = (l) => [String(l.email || "").trim().toLowerCase(), String(l.phone || "").replace(/\D/g, "")];
  function same(a, b) { const x = contact(a), y = contact(b); return !!((x[0] && x[0] === y[0]) || (x[1] && x[1] === y[1])); }
  const firstAsk = (l, list) => list.slice(0, list.indexOf(l)).find((o) => same(o, l));           // the earlier row from this person, if there is one
  const waiting = (list) => list.filter((l, i) => l.status === "new" && !list.slice(0, i).some((o) => o.status === "new" && same(o, l)));   // people, not rows
  const waitTone = (w) => (!w.length ? "ok" : w.some((l) => l.at && Date.now() - l.at >= DAY) ? "bad" : "warn");

  /* Rows pasted from a person's own sheet. With a header row, each column is matched by its name;
     without one, the columns are read in the order of the sample sheet. */
  const NAMES = [["best", /best|reach/], ["found", /find|found|hear|source/], ["when", /time|date|when/], ["email", /mail/], ["phone", /phone|mobile|cell/],
    ["name", /name/], ["service", /service|need|want/], ["details", /detail|message|note|comment/]];
  function parseRows(text) {
    const rows = OH.parseCSV(text); if (!rows.length) return [];
    const guess = rows[0].map((c) => (NAMES.find((n) => n[1].test(String(c).toLowerCase())) || [null])[0]);
    const hasHead = !rows[0].some((c) => /@/.test(c)) && ["name", "email", "phone"].some((f) => guess.indexOf(f) >= 0);
    const cols = hasHead ? guess : FIELDS;
    return rows.slice(hasHead ? 1 : 0).map((r, i) => {
      const l = { id: i + 1, status: "new", repliedAt: null };
      cols.forEach((f, c) => { if (f && l[f] == null) l[f] = String(r[c] || "").trim(); });
      const t = Date.parse(l.when); l.at = t > Date.now() - 3650 * DAY && t < Date.now() + DAY ? t : null;   // a time it can read, or none
      return l;
    }).filter((l) => l.name || l.email || l.phone);
  }

  /* The answer comes back as free text. Split it into the draft and the owner's task, then point at
     the sentences a person should read twice: anything that looks like a price or a promised date. */
  const PRICE = /[$€£]\s?\d|\b\d+\s?(dollars|bucks)\b|\bper (hour|visit|month)\b/i;
  const DATE = /\b(today|tonight|tomorrow|this (week|weekend|month)|next (week|month)|end of the (week|month)|within \d+ \w+|(mon|tues|wednes|thurs|fri|satur|sun)day)\b/i;
  function readAnswer(text) {
    text = text.replace(/[*#`]/g, "");                 // the marks an AI chat puts around headings
    const cut = text.search(/^\W*(owner'?s? )?task\b/im);
    const draft = (cut >= 0 ? text.slice(0, cut) : text).replace(/^(\W*(draft|here)[^\n]*\n)+/i, "").trim();   // drop a heading line such as "Draft reply"
    const sentences = (draft.match(/[^.?!\n]+[.?!]?/g) || []).map((s) => s.trim());
    return { draft: draft, task: cut >= 0 ? text.slice(cut).trim() : "", words: draft.split(/\s+/).filter(Boolean).length,
      prices: sentences.filter((s) => PRICE.test(s)), dates: sentences.filter((s) => DATE.test(s)) };
  }
  function sampleAnswer(l) {                         // no AI at hand: the sample draft for the 9 PM lead, a plain template for anyone else
    if (l.email === S.live.email) return S.answer;
    const about = (l.service || "some work").toLowerCase();
    return "Hi " + ((l.name || "there").split(" ")[0]) + ",\n\nThank you for your request. You asked about " + about + ". Which day and time is best for us to come and take a look?\n\n"
      + OH.course.business.name + "\n\nTask for the owner: reply to " + (l.name || "this lead") + " about " + about + ". Due: today.\n\nThis is a plain template built in the page from the row. An AI chat writes a better one.";
  }

  function render(root, ctx) {
    const list = leads(), now = Date.now(), rules = get("rules", []), own = get("own", false);
    const stay = () => { const y = window.scrollY; ctx.redraw(); window.scrollTo(0, y); };          // redraw, and stay where the person was
    const save = (toTop) => { set("leads", list); if (toTop) ctx.redraw(); else stay(); };
    const wait = waiting(list), noticed = list.find((l) => l.id === get("notice", 0));
    const reply = (l) => list.forEach((o) => { if (o.status === "new" && (o === l || same(o, l))) { o.status = "replied"; o.repliedAt = Date.now(); } });   // one reply answers every row from that person
    const steps = h("div", { class: "steps" }); root.appendChild(steps);

    // 1 · the sheet: every lead, how long it has waited for a first reply, and the duplicates
    const oldest = wait.filter((l) => l.at).sort((a, b) => a.at - b.at)[0], dups = list.filter((l) => firstAsk(l, list));
    function firstReply(l) {
      const dup = firstAsk(l, list);
      const badge = l.status === "junk" ? OH.badge("Not a lead") : l.status === "replied" ? OH.badge(l.at && l.repliedAt ? "Replied after " + span(l.repliedAt - l.at) : "Replied", "ok")
        : OH.badge(l.at ? "Waiting " + span(now - l.at) : "Waiting", l.at && now - l.at >= 2 * DAY ? "bad" : "warn");
      return h("div", { style: "min-width:200px" }, badge,
        dup ? [" ", OH.badge("Duplicate", "warn"), h("div", { class: "mut", style: "font-size:12.5px;margin-top:3px" }, "Same person as the row from " + dup.when + ". One reply answers both.")] : null,
        h("div", { class: "row", style: "margin-top:6px" }, l.status !== "new"
          ? h("button", { class: "small", onclick: () => { l.status = "new"; l.repliedAt = null; save(); } }, "Undo")
          : [h("button", { class: "small", onclick: () => { reply(l); save(); } }, "Mark as replied"), h("button", { class: "small", onclick: () => { l.status = "junk"; save(); } }, "Not a lead")]));
    }
    const sheet = OH.table([
      { h: "Timestamp", f: (l) => l.when, s: (l) => l.at || 0 },
      { h: "Name", f: (l) => h("b", null, l.name), s: (l) => l.name },
      { h: "Email and phone", f: (l) => [l.email, h("br"), l.phone || h("span", { class: "mut" }, "no phone")], s: (l) => l.email },
      { h: "Service needed", f: (l) => l.service },
      { h: "Details", f: (l) => h("span", { class: "mut" }, l.details), s: (l) => l.details },
      { h: "Best time", f: (l) => l.best },
      { h: "Found us", f: (l) => l.found },
      { h: "First reply", f: firstReply, s: (l) => (l.status === "new" && l.at ? now - l.at : -1) }
    ], list.slice().reverse(), { rowClass: (l) => (l === noticed ? "hot" : l.status === "junk" ? "done" : "") });
    const ownBox = h("textarea", { placeholder: "Copy the rows from your own sheet, header row included, and paste them here. Oldest row first, the way a form's response sheet is.\nColumns it looks for: time, name, email, phone, service, details, best time, how they found you.\nLeave out anything with a password or a card number." });
    function useOwn() {
      const mine = parseRows(ownBox.value);
      if (!mine.length) return OH.toast("Paste at least one row with a name, an email or a phone number");
      set("leads", mine); set("own", true); set("notice", 0); set("pick", null); set("answer", null); ctx.redraw();
    }
    steps.appendChild(OH.step("The leads sheet: " + list.length + " rows",
      noticed ? h("div", { class: "note ok" }, h("b", null, "Notice to the owner: "), "new quote request from " + noticed.name + " (" + noticed.service + "), saved to the sheet at " + noticed.when + ". Nobody retyped it.",
        firstAsk(noticed, list) ? h("div", { class: "warn" }, "This person already asked on " + firstAsk(noticed, list).when + ". The new row is flagged as a duplicate.") : null) : null,
      h("div", { class: "grid g3", style: "margin-bottom:12px" },
        OH.stat("Waiting for a first reply", wait.length, "people, not rows", waitTone(wait)),
        OH.stat("Longest wait", oldest ? span(now - oldest.at) : "None", oldest ? oldest.name + ", since " + oldest.when : "Nobody is waiting", oldest ? waitTone(wait) : "ok"),
        OH.stat("Duplicates flagged", dups.length, "same email or same phone", dups.length ? "warn" : "ok")),
      h("p", { class: "mut" }, "Newest first. A form's response sheet in Google Sheets looks like this, one row per lead. The last column is what the sheet does not tell you: who is still waiting."),
      sheet,
      h("details", { style: "margin-top:10px" }, h("summary", null, "Use my own leads"), ownBox,
        h("div", { class: "row", style: "margin-top:8px" }, h("button", { class: "primary", onclick: useOwn }, "Use these rows")))));

    // 2 · the trigger: a customer submits the form. Saving the row is the action; the notice is the "and tell me".
    const field = (label, el) => h("div", null, h("label", { class: "f" }, label), el);
    const choose = (options) => h("select", null, h("option", { value: "" }, "Choose one"), options.map((o) => h("option", { value: o }, o)));
    const F = { name: h("input", { type: "text" }), email: h("input", { type: "text" }), phone: h("input", { type: "text" }), service: choose(S.services),
      best: h("input", { type: "text" }), found: choose(S.sources), details: h("textarea", { style: "min-height:80px;font:inherit" }) };
    function submit() {
      const l = { id: Math.max.apply(null, list.map((x) => x.id).concat([0])) + 1, at: Date.now(), status: "new", repliedAt: null };
      Object.keys(F).forEach((f) => { l[f] = F[f].value.trim(); }); l.when = clock(l.at);
      if (!l.name || !(l.email || l.phone)) return OH.toast("Add a name, and an email or a phone number");
      list.push(l); set("notice", l.id); set("pick", null);
      OH.toast("Saved as a new row. The owner has been told."); save(true);
    }
    steps.appendChild(OH.step("A new lead comes in",
      h("p", { class: "mut" }, "This is the trigger. Submitting the form saves a new row with the time (the action) and puts a notice at the top of the sheet (the \"and tell me\"). Nobody retypes anything."),
      h("div", { class: "card", style: "max-width:860px;background:#fafbfd" }, h("h3", null, S.formTitle),
        h("div", { class: "grid g3" }, field("Name", F.name), field("Email", F.email), field("Phone", F.phone)),
        h("div", { class: "grid g3" }, field("Service needed", F.service), field("Best time to reach you", F.best), field("How did you find us?", F.found)),
        field("Details", F.details),
        h("div", { class: "row", style: "margin-top:10px" },
          h("button", { onclick: () => Object.keys(F).forEach((f) => { F[f].value = S.live[f]; }) }, "Fill in tonight's 9 PM lead"),
          h("button", { class: "primary", onclick: submit }, "Submit the form")))));

    // 3 · say it in one sentence, then pick the lowest level that does the job
    const first = S.examples[0], sen = get("sentence", { ex: 0, when: first.when, do: first.do, tell: first.tell });
    const out = h("pre", { class: "code", style: "font-size:16px" }), about = h("p", { class: "mut", style: "margin:8px 0" }), levelRow = h("div", { class: "row" }), verdict = h("div");
    const part = (f, label, hint) => field(label, h("input", { type: "text", value: sen[f], placeholder: hint, oninput: (ev) => { sen[f] = ev.target.value; sen.ex = null; set("sentence", sen); showSentence(); } }));
    const parts = [part("when", "When...", "a lead fills out the form"), part("do", "do...", "save it"), part("tell", "and tell me...", "tell me")];
    function showSentence() {                          // redraws only this step, so typing never loses its place
      const ex = sen.ex == null ? null : S.examples[sen.ex], level = get("level", 0);
      out.textContent = "When " + (sen.when.trim() || "...") + ", " + (sen.do.trim() || "...") + (sen.tell.trim() ? ", and " + sen.tell.trim() : "") + ".";
      about.textContent = ex ? ex.apps : "Your own sentence. No app names yet: decide what should happen first, then go looking for the tool.";
      levelRow.innerHTML = ""; verdict.innerHTML = "";
      S.levels.forEach((lv, i) => levelRow.appendChild(h("button", { class: level === i + 1 ? "primary" : "", onclick: () => { set("level", i + 1); showSentence(); } }, lv.name)));
      if (!sen.tell.trim()) verdict.appendChild(OH.note("There is no \"and tell me\" yet. Without it, quiet looks the same whether the job got done or stopped weeks ago.", "warn"));
      if (level && ex) verdict.appendChild(OH.note((ex.levels.indexOf(level) >= 0 ? "Yes. " : "Look again. ") + ex.why, ex.levels.indexOf(level) >= 0 ? "ok" : "warn"));
      if (level && !ex) verdict.appendChild(OH.note(S.levels[level - 1].detail + " Start at the lowest level that does the job, and move up only when you can name the crack."));
    }
    function useExample(i) {
      const ex = S.examples[i]; Object.assign(sen, { ex: i, when: ex.when, do: ex.do, tell: ex.tell }); set("sentence", sen); set("level", 0);
      ["when", "do", "tell"].forEach((f, n) => { parts[n].querySelector("input").value = sen[f]; }); showSentence();
    }
    showSentence();
    steps.appendChild(OH.step("Say it in one sentence",
      h("p", { class: "mut" }, "Before you open any tool, say the automation out loud: when this happens, do that, and tell me. If you can't say it in one sentence, it's two automations. Build the first one."),
      h("div", { class: "row" }, S.examples.map((ex, i) => h("button", { class: "small", onclick: () => useExample(i) }, ex.name))),
      h("div", { class: "grid g3" }, parts), h("div", { style: "margin-top:12px" }, out), about,
      h("label", { class: "f" }, "Which level is this?"), levelRow, verdict,
      h("div", { class: "row", style: "margin-top:10px" }, h("button", { onclick: () => OH.copy(out.textContent, "Sentence copied") }, "Copy my sentence"))));

    // 4 · the follow-up: the session's prompt, with the header row and one lead underneath
    const picked = get("pick", null);                  // the newest lead still waiting, unless the person chose another one
    const target = list.find((l) => l.id === picked && l.status === "new") || wait[wait.length - 1] || list[list.length - 1];
    const prompt = S.prompt.replace("\n\nNew lead:", rules.map((r) => "\nAlso: " + r).join("") + "\n\nNew lead:");
    const pb = OH.promptBox({ prompt: prompt, data: () => OH.toCSV([HEAD, row(target)], "\t"), dataLabel: "new lead", height: 230 });
    steps.appendChild(OH.step("Draft the follow-up",
      h("p", { class: "mut" }, "Last week's new-hire rule again. The job: draft a reply. The rules: never quote a price, never promise a date, use only what is in the row. The check: ask me if something is missing. The header row and one lead go underneath."),
      wait.length ? field("Draft a reply for", h("select", { style: "max-width:560px", onchange: (ev) => { set("pick", +ev.target.value); stay(); } },
        wait.slice().reverse().map((l) => h("option", { value: l.id, selected: l === target }, l.name + " · " + l.service + " · " + l.when)))) : null,
      !own && !list.some((l) => l.email === S.live.email) ? OH.note("Tonight's 9 PM lead is not in the sheet yet. Submit the form in step 2 and he becomes the newest row.", "warn") : null,
      h("div", { style: "margin-top:10px" }, pb.el), rules.length ? OH.note("Rules you added after checking its work: " + rules.join(" · "), "ok") : null));

    // 5 · the answer comes back
    const answer = get("answer", null), mine = answer && answer.id === target.id ? readAnswer(answer.text) : null;
    const paste = OH.pasteBox({ sample: () => sampleAnswer(target), onUse: (text) => { set("answer", { id: target.id, text: text }); set("checks", []); stay(); } });
    if (mine) paste.querySelector("textarea").value = answer.text;
    steps.appendChild(OH.step("Bring the answer back", paste));

    // 6 · which part is wrong?
    if (mine) {
      const checks = get("checks", []), tally = h("div", { class: "mut", style: "font-size:13px" }), rule = h("input", { type: "text", placeholder: "For example: if they ask what it costs, say a written quote follows the site visit" });
      const count = () => { tally.textContent = S.checks.filter((c, i) => checks[i]).length + " of " + S.checks.length + " checked by a person"; };
      const quote = (found) => found.map((s) => "\"" + s + "\"").join(" ");
      count();
      steps.appendChild(OH.step("Check its work: which part is wrong?",
        h("p", { class: "mut" }, "Don't ask whether it is right. Ask which part is wrong. Nothing here has been sent to " + target.name + ". It drafts. You send."),
        h("div", { class: "grid g2" },
          OH.card("The draft: " + mine.words + " words, not sent", h("pre", { class: "code" }, mine.draft)),
          OH.card("Task for the owner", h("pre", { class: "code" }, mine.task || "No task line found. Ask the AI to start that line with the word Task."))),
        mine.prices.length ? OH.note("A price appears: " + quote(mine.prices) + " The rule says never quote a price.", "warn") : OH.note("No price found in the draft.", "ok"),
        mine.dates.length ? OH.note("Read this twice: " + quote(mine.dates) + " The rule says never promise a date. Is that a promise?", "warn") : OH.note("No day or deadline found in the draft.", "ok"),
        mine.words > 90 ? OH.note("The draft is " + mine.words + " words. The prompt asked for under 90.", "warn") : null,
        S.checks.map((c, i) => h("label", { style: "display:flex;gap:9px;align-items:center;margin:7px 0;cursor:pointer" },
          h("input", { type: "checkbox", checked: !!checks[i], style: "width:17px;height:17px", onchange: (ev) => { checks[i] = ev.target.checked; set("checks", checks); count(); } }), c)), tally,
        h("label", { class: "f" }, "Add a rule to the prompt"), rule,
        h("div", { class: "row", style: "margin-top:8px" },
          h("button", { onclick: () => { if (!rule.value.trim()) return; rules.push(rule.value.trim()); set("rules", rules); stay(); } }, "Add this rule"), h("span", { class: "spacer" }),
          h("button", { onclick: () => OH.copy(mine.draft, "Draft copied") }, "Copy the draft"),
          h("button", { class: "primary", onclick: () => { reply(target); save(true); } }, "Mark " + target.name + " as replied"))));
    }

    // 7 · what just happened and who typed it, then the sheet to take away
    const status = (l) => (l.status === "junk" ? "Not a lead" : l.status === "replied" ? "Replied" : "Waiting") + (firstAsk(l, list) ? ", duplicate" : "");
    const forSheet = () => [HEAD.concat(["Status", "First reply after"])].concat(list.map((l) =>
      [l.at ? full(l.at) : l.when || ""].concat(row(l).slice(1), [status(l), l.status === "replied" && l.at && l.repliedAt ? span(l.repliedAt - l.at) : ""])));
    steps.appendChild(OH.step("Take it with you",
      own ? h("p", { class: "mut" }, "Your own rows, each with a status and how long the first reply took. Paste them back into your sheet.") : [
        h("p", { class: "mut" }, "Read the right-hand column. The customer typed his details once. After that nobody in the business retyped them, and nothing goes out until a person reads it."),
        OH.table([{ h: "Step", f: (r) => h("b", null, r[0]) }, { h: "What happened", f: (r) => r[1] }, { h: "Who typed it", f: (r) => r[2] }], S.whoTyped)],
      OH.note("One honest note: you pasted that row into the AI chat by hand. A connector (Zapier, Make or n8n) can do that last hop and leave the result as a draft. That is level 2. The person still sits between the draft and the customer."),
      h("div", { class: "row", style: "margin-top:10px" },
        h("button", { class: "primary", onclick: () => OH.copy(OH.toCSV(forSheet(), "\t"), "Leads copied") }, "Copy for Google Sheets or Excel"),
        h("button", { onclick: () => OH.download("leads.csv", OH.toCSV(forSheet()), "text/csv") }, "Download as a file"))));
  }

  OH.register({
    week: 2, id: "w2-leads", title: "Lead form to follow-up",
    intro: "A quote request comes in, lands as a row in the sheet, and the owner is told. Then a reply is drafted and checked, and nothing is sent to anybody.",
    render: render,
    summary: function () { const wait = waiting(leads()); return { label: "Leads waiting for a first reply", value: wait.length, tone: waitTone(wait) }; },
    /* What counts as done in the game (GAME.md). Read only: every answer comes from what the tool has already
       saved, in the order the runbook walks it. The catch is the draft: a person ticks all four checks, and a
       draft that still names a price or a day also needs a rule written against it. */
    objectives: function () {
      const ok = (test) => { try { return !!test(); } catch (e) { return false; } };               // nothing saved yet, or something odd saved: not done
      const saved = () => get("leads", null) || [], answer = () => get("answer", null) || {}, text = () => String(answer().text || "");
      return [
        { id: "junk", label: "Find the sales pitch in the sheet and mark it Not a lead", required: false,
          done: ok(() => saved().some((l) => l.status === "junk")) },
        { id: "lead", label: "Send tonight's 9 PM lead through the quote form", required: true,
          done: ok(() => { const id = get("notice", 0); return id > 0 && saved().some((l) => l.id === id); }) },
        { id: "sentence", label: "Say one automation in a sentence and pick its level", required: false,
          done: ok(() => {
            const first = S.examples[0], sen = get("sentence", null) || { ex: 0, when: first.when, do: first.do, tell: first.tell }, level = get("level", 0);
            return ["when", "do", "tell"].every((f) => String(sen[f] || "").trim()) && level > 0 && (sen.ex == null || S.examples[sen.ex].levels.indexOf(level) >= 0);
          }) },
        { id: "draft", label: "Bring the draft reply back from the AI", required: true,
          done: ok(() => text().trim()) },
        { id: "caught", label: "Tick the four checks and add a rule for what it got wrong", required: true,
          done: ok(() => {
            const checks = get("checks", []), rules = get("rules", []), found = readAnswer(text());
            return text().trim() && Array.isArray(checks) && S.checks.every((c, i) => checks[i] === true)
              && ((Array.isArray(rules) && rules.length > 0) || !(found.prices.length || found.dates.length));
          }) },
        { id: "replied", label: "Mark the lead as replied once the draft is right", required: true,
          done: ok(() => { const id = answer().id; return id != null && saved().some((l) => l.id === id && l.status === "replied"); }) }
      ];
    }
  });
})();
