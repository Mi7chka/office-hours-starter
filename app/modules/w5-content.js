/* Week 5 · One idea, five pieces.
   The job from Session 5: one real lesson from the week goes in, with a few facts and three samples
   of how the owner writes. Five pieces come back. You find the weakest one, have only that one fixed,
   and approve each piece before it counts as ready. Then the weekly routine and the one number to
   watch. Nothing here posts anywhere: it drafts, you approve, then you post. */
(function () {
  const h = OH.h, S = OH.sample.content, K = "w5:";
  const get = (k, d) => OH.store.get(K + k, d), set = (k, v) => OH.store.set(K + k, v);
  const sampleIdea = () => ({ lesson: S.lesson, facts: S.facts, samples: S.samples.map((s) => s.text) });
  const words = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);
  const people = (n) => n + (n === 1 ? " person" : " people");
  const approvedCount = () => { const approved = get("approved", {}); return S.pieces.filter((p, i) => approved[i]).length; };

  // What goes under the prompt: the lesson, the facts and the three writing samples, laid out like samples/week-5-one-idea.txt
  function material(idea, tag) {
    return "THIS WEEK'S LESSON" + tag + "\n" + idea.lesson + "\n\nFACTS YOU MAY USE" + tag + "\n" + idea.facts + "\n\nHOW THE OWNER WRITES" + tag + "\n" +
      idea.samples.map((text, i) => "\nSAMPLE " + (i + 1) + ". " + S.samples[i].label + ":\n" + text).join("\n");
  }

  /* Split the answer into the five pieces. A piece starts at a line like "PIECE 2: VIDEO" (bold marks and
     "##" are fine). A short numbered heading such as "2. Video script" also counts, as long as the numbers
     arrive in order. Everything from "LEFT OUT:" on is kept as the AI's note about what it could not use. */
  function parsePieces(text) {
    const pieces = [], note = [];
    let lines = null, inNote = false;
    text.split("\n").forEach((raw) => {
      const line = raw.replace(/[*#`_]/g, "").trim();
      if (/^(left out|missing)\b/i.test(line)) { inNote = true; note.push(line.replace(/^[^:]*:?\s*/, "")); return; }
      if (inNote) { note.push(line); return; }
      const head = /^piece\s*([1-5])\b/i.exec(line) || (line.length < 60 ? /^([1-5])\s*[.):]/.exec(line) : null);
      if (head && +head[1] === pieces.length + 1) { lines = []; pieces.push(lines); return; }
      if (lines) lines.push(raw.replace(/\*\*/g, ""));
    });
    return { texts: pieces.map((l) => l.join("\n").trim()), note: note.join(" ").trim() };
  }

  // A fixed piece comes back as: an optional "PIECE n:" heading, the new text, then an optional "WHY:" line.
  function parseFix(text) {
    const lines = text.replace(/\*\*/g, "").trim().split("\n"), at = lines.findIndex((l) => /^\s*why\s*:/i.test(l));
    const body = (at < 0 ? lines : lines.slice(0, at)).filter((l, i) => !(i === 0 && /^\W*piece\s*[1-5]\b/i.test(l)));
    return { text: body.join("\n").trim(), why: at < 0 ? "" : lines.slice(at).join(" ").replace(/^\s*why\s*:\s*/i, "").trim() };
  }

  // The short follow-up from the session: fix only the weakest piece, keep the owner's voice, and say why.
  function fixPrompt(n, piece, why) {
    return "Fix only PIECE " + n + ", " + piece.the + ". Leave the other four as they are.\n" +
      "Why it is the weakest: " + (why || "[say what is wrong with it]") + "\n" +
      "Keep the owner's voice and use only the facts I gave you. Send back only that piece, starting with PIECE " + n + ": " + piece.heading +
      ", then one line starting with WHY: that says what you changed and why.";
  }

  function render(root, ctx) {
    const idea = get("idea", null) || sampleIdea(), usingSample = !get("idea", null);
    const pieces = get("pieces", null), weak = get("weak", null), approved = get("approved", {});
    const redraw = () => { const y = window.scrollY; ctx.redraw(); window.scrollTo(0, y); };   // the shell jumps to the top; come back
    const steps = h("div", { class: "steps" }); root.appendChild(steps);
    const area = (label, value, onInput, hint, height) => [h("label", { class: "f" }, label),
      h("textarea", { value: value, placeholder: hint, style: "min-height:" + height + "px", oninput: (ev) => { onInput(ev.target.value); set("idea", idea); } })];
    const startFresh = () => { set("pieces", null); set("leftOut", ""); set("approved", {}); set("weak", null); set("why", ""); };

    // 1 · the idea: one lesson, a few facts, three samples of the owner's writing. Every box can be edited.
    const useOwnIdea = () => { set("idea", { lesson: "", facts: "", samples: S.samples.map(() => "") }); startFresh(); redraw(); };
    steps.appendChild(OH.step("This week's idea",
      h("p", { class: "mut" }, "One real lesson from the week: a question a customer asked, a job you finished, or a mistake you fixed. " +
        "You do not have to be clever. You have to have gone to work this week."),
      usingSample ? OH.note("Sample data: a made-up week at a made-up company. No real people, no real reviews, no real offers.") : null,
      h("div", { class: "grid g2" },
        h("div", null, area("The lesson: what the customer asked, and what you told them", idea.lesson, (v) => { idea.lesson = v; }, S.hints.lesson, 200)),
        h("div", null, area("Facts the AI may use, one per line", idea.facts, (v) => { idea.facts = v; }, S.hints.facts, 200))),
      h("div", { class: "grid g3" }, S.samples.map((s, i) => h("div", null,
        area("How you write, sample " + (i + 1) + ": " + s.label.toLowerCase(), idea.samples[i], (v) => { idea.samples[i] = v; }, S.hints.sample, 130)))),
      h("div", { class: "row", style: "margin-top:10px" }, h("button", { onclick: useOwnIdea }, "Clear the sample and type my own idea"))));

    // 2 · the prompt: the job, the rules, and a layout the tool can read back
    const pb = OH.promptBox({ prompt: S.prompt, data: () => material(idea, get("idea", null) ? "" : " (SAMPLE DATA)"), dataLabel: "material", height: 290 });
    steps.appendChild(OH.step("Give the AI the job",
      h("p", { class: "mut" }, "The job: five pieces from one idea. The rules: only the facts I gave you, no invented numbers or reviews, " +
        "never name a customer, write like the samples. For your own business, change the word landscaping."),
      pb.el));

    // 3 · the answer comes back. If the five pieces cannot be found, say which shape to ask for.
    const problem = h("div");
    const useAnswer = (text) => {
      const got = parsePieces(text), filled = got.texts.filter((t) => t).length;
      problem.innerHTML = "";
      if (got.texts.length !== S.pieces.length || filled !== S.pieces.length) {
        return problem.appendChild(OH.note(["I found " + filled + " of the five pieces. Send the AI this line, then paste its new answer here: ",
          h("b", null, S.reshape), " ", h("button", { class: "small", onclick: () => OH.copy(S.reshape, "Request copied") }, "Copy that line")], "warn"));
      }
      startFresh(); set("pieces", got.texts.map((t) => ({ text: t }))); set("leftOut", got.note); redraw();
    };
    steps.appendChild(OH.step("Bring the five pieces back", OH.pasteBox({ sample: S.answer, onUse: useAnswer }), problem));

    if (!pieces) {                                                // keep the step numbers steady before there is an answer
      ["Five pieces from one idea", "Check its work: which one is weakest?", "Approve, then take it away"].forEach((title) =>
        steps.appendChild(OH.step(title, h("p", { class: "mut" }, "This fills in when you bring the answer back in step 3."))));
    } else {
      // 4 · the five pieces as cards: the text, a word count, a copy button
      const leftOut = get("leftOut", "");
      const pieceCard = (p, i) => h("div", { class: "card" },
        h("h3", null, (i + 1) + ". " + p.name + " ", pieces[i].fixed ? OH.badge("fixed", "ok") : weak === i ? OH.badge("weakest", "warn") : null),
        h("div", { class: "mut", style: "font-size:13px" }, "Goes to: " + p.goes + ". " + p.tip),
        h("pre", { class: "code", style: "margin:8px 0" }, pieces[i].text),
        pieces[i].changed ? h("div", { class: "mut", style: "font-size:13px;margin-bottom:8px" }, "What changed: " + pieces[i].changed) : null,
        h("div", { class: "row" }, OH.badge(words(pieces[i].text) + " words"), h("span", { class: "spacer" }),
          h("button", { class: "small", onclick: () => { set("weak", i); set("why", ""); redraw(); } }, "This one is weakest"),
          h("button", { class: "small", onclick: () => OH.copy(pieces[i].text, p.name + " copied") }, "Copy")));
      steps.appendChild(OH.step("Five pieces from one idea",
        h("p", { class: "mut" }, "One answer, said five ways. Nobody sees all five: each customer sees the one piece that reached them. " +
          "Read each one against the facts in step 1."),
        h("div", { class: "grid g2" }, S.pieces.map(pieceCard)),
        leftOut ? OH.note("What it left out, and told you about: " + leftOut) : null));

      // 5 · which one is weakest? Build the short follow-up that fixes only that piece, then swap the fix in.
      const pick = weak == null ? null : S.pieces[weak];
      const follow = h("pre", { class: "code" });
      const why = h("input", { type: "text", value: get("why", ""), placeholder: "For example: it promises a guarantee I never gave",
        oninput: () => { set("why", why.value); drawFollow(); } });
      const drawFollow = () => { follow.textContent = pick ? fixPrompt(weak + 1, pick, why.value.trim()) : "Pick the weakest piece first."; };
      const replace = (text) => {
        const fix = parseFix(text);
        if (!fix.text) return OH.toast("I could not find the fixed piece in that. Paste the piece itself.");
        pieces[weak] = { text: fix.text, fixed: true, changed: fix.why }; approved[weak] = false;   // a changed piece needs a fresh yes
        set("pieces", pieces); set("approved", approved); redraw();
      };
      drawFollow();
      steps.appendChild(OH.step("Check its work: which one is weakest?",
        h("p", { class: "mut" }, S.weakIntro),
        h("label", { class: "f" }, "First, ask the AI the same question"), h("pre", { class: "code" }, S.askWeakest),
        h("div", { class: "row", style: "margin-top:8px" }, h("button", { onclick: () => OH.copy(S.askWeakest, "Question copied") }, "Copy the question")),
        h("label", { class: "f" }, "The weakest piece"),
        h("select", { style: "width:auto", onchange: (ev) => { set("weak", ev.target.value === "" ? null : +ev.target.value); set("why", ""); redraw(); } },
          [h("option", { value: "", selected: weak == null }, "Pick one")].concat(S.pieces.map((p, i) => h("option", { value: i, selected: weak === i }, (i + 1) + ". " + p.name)))),
        h("label", { class: "f" }, "What is wrong with it"), why,
        h("label", { class: "f" }, "The follow-up: fix only that one"), follow,
        h("div", { class: "row", style: "margin:8px 0 12px" },
          h("button", { class: "primary", onclick: () => (pick ? OH.copy(follow.textContent, "Follow-up copied") : OH.toast("Pick the weakest piece first")) }, "Copy the follow-up")),
        pick ? OH.pasteBox({ label: "Paste the fixed piece here", placeholder: "Paste only the fixed piece", useLabel: "Replace this piece", onUse: replace,
          sample: weak === S.weakest.piece ? S.weakest.fix : null }) : null,
        pick && weak !== S.weakest.piece ? h("p", { class: "mut", style: "font-size:13px" },
          "The sample fix is written for the Google Business Profile post. For any other piece, use your AI chat.") : null));

      // 6 · approve, then take it away. Nothing counts as ready until a person has ticked it.
      const ready = () => S.pieces.map((p, i) => (approved[i] ? p.name.toUpperCase() + "\nGoes to: " + p.goes + "\n\n" + pieces[i].text : null))
        .filter(Boolean).join("\n\n----------\n\n");
      const take = (how) => () => (approvedCount() ? how(ready()) : OH.toast("Approve at least one piece first"));
      steps.appendChild(OH.step("Approve, then take it away",
        h("p", { class: "mut" }, S.approveNote),
        OH.table([
          { h: "Approve", f: (r) => h("input", { type: "checkbox", checked: !!approved[r.i],
            onchange: (ev) => { approved[r.i] = ev.target.checked; set("approved", approved); redraw(); } }) },
          { h: "Piece", f: (r) => [h("b", null, r.p.name), " ", pieces[r.i].fixed ? OH.badge("fixed", "ok") : weak === r.i ? OH.badge("weakest, not fixed yet", "warn") : null] },
          { h: "Where it goes", f: (r) => r.p.goes },
          { h: "How it starts", f: (r) => h("span", { class: "mut" }, pieces[r.i].text.split("\n")[0]) },
          { h: "Words", f: (r) => words(pieces[r.i].text) }
        ], S.pieces.map((p, i) => ({ p: p, i: i })), { rowClass: (r) => (weak === r.i && !pieces[r.i].fixed ? "hot" : "") }),
        h("div", { class: "row", style: "margin-top:10px" },
          OH.badge(approvedCount() + " of " + S.pieces.length + " approved", approvedCount() === S.pieces.length ? "ok" : "blue"),
          h("button", { class: "primary", onclick: take((text) => OH.copy(text, "Approved pieces copied")) }, "Copy the approved pieces"),
          h("button", { onclick: take((text) => OH.download("approved-pieces.txt", text)) }, "Download the approved pieces"))));
    }

    // 7 · the weekly routine: a named day and a minute budget for each step, to tick off
    const ticks = get("routine", {}), sum = (list) => list.reduce((n, r) => n + r.minutes, 0);
    const total = sum(S.routine), ticked = sum(S.routine.filter((r) => ticks[r.day]));
    steps.appendChild(OH.step("The weekly routine: about an hour",
      h("p", { class: "mut" }, S.routineNote),
      OH.table([
        { h: "Done", f: (r) => h("input", { type: "checkbox", checked: !!ticks[r.day],
          onchange: (ev) => { ticks[r.day] = ev.target.checked; set("routine", ticks); redraw(); } }) },
        { h: "Day", f: (r) => h("b", null, r.day) }, { h: "The job", f: (r) => r.job }, { h: "What it means", f: (r) => r.detail },
        { h: "Budget", f: (r) => r.minutes + " minutes", s: (r) => r.minutes }
      ], S.routine, { rowClass: (r) => (ticks[r.day] ? "done" : "") }),
      h("div", { class: "row", style: "margin-top:10px" },
        OH.badge(ticked + " of " + total + " budgeted minutes ticked off", ticked === total ? "ok" : "blue"),
        h("button", { class: "small", onclick: () => { set("routine", {}); redraw(); } }, "Start a new week"))));

    // 8 · the one number to watch: one count a week, shown as bars
    const ownLog = get("log", null), log = ownLog || S.number.log;
    const week = h("input", { type: "date", value: OH.today(), style: "width:170px" });
    const count = h("input", { type: "number", min: "0", placeholder: "0", style: "width:110px" });
    const posted = h("input", { type: "text", placeholder: "What you posted that week", style: "flex:1;min-width:200px" });
    const addWeek = () => {
      const n = parseInt(count.value, 10);
      if (!week.value || isNaN(n) || n < 0) return OH.toast("Pick the week and type a number");
      const next = log.filter((x) => x.week !== week.value).concat([{ week: week.value, count: n, note: posted.value.trim() }]);
      set("log", next.sort((a, b) => (a.week > b.week ? 1 : -1))); redraw();
    };
    steps.appendChild(OH.step("The one number to watch",
      h("p", { class: "mut" }, S.number.ask),
      ownLog ? null : OH.note("These four weeks are made up. Clear the log before you add your own number."),
      log.length ? OH.bars(log.map((x) => ({ label: OH.niceDate(x.week), value: x.count })), { fmt: people }) : null,
      h("div", { style: "margin-top:12px" }, OH.table([
        { h: "Week ending", f: (x) => OH.niceDate(x.week), s: (x) => x.week }, { h: S.number.label, f: (x) => x.count },
        { h: "What you posted that week", f: (x) => x.note || "" }
      ], log, { empty: "No weeks yet. Add your first number below." })),
      h("label", { class: "f" }, "Add a week: the Friday, the count, what you posted"),
      h("div", { class: "row" }, week, count, posted, h("button", { class: "primary", onclick: addWeek }, "Add this week"),
        h("button", { class: "small", onclick: () => { set("log", []); redraw(); } }, "Clear the log")),
      h("p", { class: "mut", style: "font-size:13px" }, S.number.honest)));
  }

  OH.register({
    week: 5, id: "w5-content", title: "One idea, five pieces",
    intro: "One real lesson from the week goes in. A post, a video script, an email, a website answer and a Google post come out, and nothing is ready until you approve it.",
    render: render,
    summary: function () { const n = approvedCount(); return { label: "Pieces approved this week", value: n + " of " + S.pieces.length, tone: n === S.pieces.length ? "ok" : "warn" }; },
    /* For the game (GAME.md): what counts as done, read from what this page has already saved. It writes nothing.
       The catch is a promise no fact supports: in the sample answer, the Google post guarantees every shrub. */
    objectives: function () {
      const d = { pieces: false, weakest: false, fixed: false, approved: false, routine: false, number: false };
      try {
        const saved = get("pieces", null), weak = get("weak", null), approved = get("approved", null) || {};
        const ticks = get("routine", null) || {}, log = get("log", null), idea = get("idea", null) || sampleIdea();
        if (Array.isArray(saved) && saved.length === S.pieces.length) {
          const text = (i) => String((saved[i] || {}).text || "");
          const allowed = /guarantee/i.test(idea.lesson + " " + idea.facts);             // a guarantee is invented only when the facts never give one
          const promised = S.pieces.map((p, i) => i).filter((i) => !allowed && /guarantee/i.test(text(i)));
          d.pieces = S.pieces.every((p, i) => text(i).trim() !== "");
          d.weakest = d.pieces && typeof weak === "number" && !!saved[weak] && promised.every((i) => i === weak);
          d.fixed = d.pieces && saved.some((p) => p && p.fixed) && !promised.length;
          d.approved = d.fixed && S.pieces.every((p, i) => approved[i]);                  // ticks made before the fix do not count: a changed piece needs a fresh yes
        }
        d.routine = S.routine.slice(0, 2).every((r) => ticks[r.day]);
        d.number = Array.isArray(log) && log.length > 0;
      } catch (e) { /* nothing saved yet, or something unreadable: every box stays empty */ }
      return [
        { id: "pieces", label: "Bring five pieces back from one idea", done: !!d.pieces, required: true },
        { id: "weakest", label: "Find the piece that overpromises and mark it weakest", done: !!d.weakest, required: true },
        { id: "fixed", label: "Have only that piece fixed, and swap the fix in", done: !!d.fixed, required: true },
        { id: "approved", label: "Approve all five pieces, the fixed one included", done: !!d.approved, required: true },
        { id: "routine", label: "Tick Monday and Tuesday on the weekly routine", done: !!d.routine, required: false },
        { id: "number", label: "Write down this week's one number", done: !!d.number, required: false }
      ];
    }
  });
})();
