/* Week 1 · Inbox to task list.
   The job from Session 1: sort today's email into four piles, pull out what only you can do,
   then check the AI's work. Works with the sample inbox, or with emails you paste in. */
(function () {
  const h = OH.h, S = OH.sample.inbox, K = "w1:";
  const get = (k, d) => OH.store.get(K + k, d), set = (k, v) => OH.store.set(K + k, v);
  const emails = () => get("emails", S.emails);
  const asText = (list) => list.map((e) => "EMAIL " + e.id + "\nFrom: " + e.from + "\nSubject: " + e.subject + "\n" + e.body).join("\n\n");

  function parseEmails(text) {                       // "From: … / Subject: …" blocks, or one email per blank-line block
    const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    return blocks.map((b, i) => {
      const from = (/^from:\s*(.+)$/im.exec(b) || [])[1], subject = (/^subject:\s*(.+)$/im.exec(b) || [])[1];
      const body = b.split("\n").filter((l) => !/^(from|subject|email \d+)\b/i.test(l.trim())).join(" ").trim();
      return { id: i + 1, from: from || "Unknown sender", subject: subject || (body.slice(0, 60) + (body.length > 60 ? "…" : "")), body: body };
    });
  }

  function parseAnswer(text) {                       // read the piles and the task lines out of a free-form answer
    const piles = {}, tasks = []; let pile = null, inTasks = false;
    text.split("\n").forEach((line) => {
      const up = line.toUpperCase();
      if (/TASKS?\b/.test(up) && !/EMAIL\s*\d+/.test(up)) { inTasks = true; pile = null; return; }
      const head = S.piles.find((p) => up.replace(/[^A-Z ]/g, " ").trim().indexOf(p) === 0 || up.indexOf(p + ":") >= 0 || up.trim() === p);
      if (head && !/EMAIL\s*\d+/.test(up)) { pile = head; inTasks = false; return; }
      const m = /EMAIL\s*#?(\d+)/i.exec(line); if (!m) return;
      const id = +m[1];
      if (inTasks) {
        const parts = line.split("|").map((x) => x.trim());
        if (parts.length >= 2) tasks.push({ id: id, task: parts[1], who: parts[2] || "Owner", due: parts[3] || "", done: false });
      } else if (pile) piles[id] = pile;
      else { const inline = S.piles.find((p) => up.indexOf(p) >= 0); if (inline) piles[id] = inline; }
    });
    return { piles: piles, tasks: tasks };
  }

  function render(root, ctx) {
    const list = emails(), ai = get("ai", null), mine = get("piles", null), tasks = get("tasks", []), rules = get("rules", []);
    const steps = h("div", { class: "steps" }); root.appendChild(steps);

    // 1 · the inbox
    const own = h("textarea", { placeholder: "Paste 5 to 15 of your own emails here. Leave a blank line between them.\nA line starting with From: and one starting with Subject: help, and are not required.\nLeave out anything with a password or a card number." });
    steps.appendChild(OH.step("Today's inbox: " + list.length + " emails",
      OH.table([{ h: "#", f: (e) => e.id }, { h: "From", f: (e) => e.from.replace(/<.*>/, "").trim() }, { h: "Subject", f: (e) => h("b", null, e.subject) }, { h: "What it says", f: (e) => h("span", { class: "mut" }, e.body.slice(0, 110) + (e.body.length > 110 ? "…" : "")) }], list),
      h("details", { style: "margin-top:10px" }, h("summary", null, "Use my own emails"), own,
        h("div", { class: "row", style: "margin-top:8px" }, h("button", { class: "primary", onclick: () => { const p = parseEmails(own.value); if (p.length < 2) return OH.toast("Paste at least two emails, with a blank line between them"); set("emails", p); set("ai", null); set("piles", null); set("tasks", []); ctx.redraw(); } }, "Use these emails")))));

    // 2 · the prompt (the new-hire rule: the job, the context, the rules, an example, a check)
    const prompt = S.prompt.replace("\n\nEmails:", (rules.length ? "\n" + rules.map((r) => "Also: " + r).join("\n") : "") + "\n\nEmails:");
    const pb = OH.promptBox({ prompt: prompt, data: () => asText(list), dataLabel: "emails" });
    steps.appendChild(OH.step("Give the AI the job",
      h("p", { class: "mut" }, "The new-hire rule in a few lines: the job (sort into four piles), the rules (no invented prices, no promised dates), and a check (ask me if unsure). Change any line to fit your business."),
      pb.el, rules.length ? OH.note("Rules you added after checking its work: " + rules.join(" · "), "ok") : null));

    // 3 · the answer comes back
    steps.appendChild(OH.step("Bring the answer back",
      OH.pasteBox({ sample: S.answer, onUse: (text) => { const p = parseAnswer(text); if (!Object.keys(p.piles).length) return OH.toast("I could not find the piles. Ask the AI to start each line with EMAIL and its number."); set("ai", p.piles); set("piles", Object.assign({}, p.piles)); set("tasks", p.tasks); ctx.redraw(); } })));

    // 4 · which one is wrong?
    if (ai && mine) {
      const moved = list.filter((e) => ai[e.id] && mine[e.id] !== ai[e.id]);
      const rule = h("input", { type: "text", placeholder: "For example: anything about money owed to us is never FYI" });
      steps.appendChild(OH.step("Check its work: which one is wrong?",
        h("p", { class: "mut" }, "Don't ask whether it is right. Ask which one is wrong. Move any email that is in the wrong pile."),
        h("div", { class: "piles" }, S.piles.map((p) => { const inPile = list.filter((e) => mine[e.id] === p);
          return h("div", { class: "pile" }, h("h3", null, p, h("span", { class: "badge" }, inPile.length)), inPile.map((e) => h("div", { class: "item" + (ai[e.id] !== p ? " moved" : "") },
            h("b", null, e.id + ". " + e.subject), h("small", null, e.from.replace(/<.*>/, "").trim()),
            h("select", { onchange: (ev) => { mine[e.id] = ev.target.value; set("piles", mine); ctx.redraw(); } }, S.piles.map((x) => h("option", { value: x, selected: x === p }, x === p ? "In " + x : "Move to " + x)))))); })),
        moved.length ? OH.note("You moved " + moved.length + ". Each move is something the AI could not know about your business. Write it down as a rule and tomorrow it gets it right.", "warn") : null,
        h("label", { class: "f" }, "Add a rule to the prompt"), rule,
        h("div", { class: "row", style: "margin-top:8px" }, h("button", { onclick: () => { if (!rule.value.trim()) return; rules.push(rule.value.trim()); set("rules", rules); ctx.redraw(); } }, "Add this rule"))));

      // 5 · the task list
      const rows = tasks.map((t) => Object.assign({ subject: (list.find((e) => e.id === t.id) || {}).subject || "" }, t));
      steps.appendChild(OH.step("Your list for today",
        h("p", { class: "mut" }, "An inbox tells you who wants something. A list tells you what to do."),
        OH.table([{ h: "Done", f: (t) => h("input", { type: "checkbox", checked: t.done, onchange: (ev) => { tasks.find((x) => x.id === t.id).done = ev.target.checked; set("tasks", tasks); ctx.redraw(); } }) },
          { h: "Task", f: (t) => h("b", null, t.task) }, { h: "Who", f: (t) => t.who }, { h: "Due", f: (t) => t.due }, { h: "From email", f: (t) => h("span", { class: "mut" }, t.id + ". " + t.subject) }], rows,
          { rowClass: (t) => (t.done ? "done" : ""), empty: "No task lines found. Ask the AI for: EMAIL number | task | who | due." }),
        h("div", { class: "row", style: "margin-top:10px" },
          h("button", { class: "primary", onclick: () => OH.copy(OH.toCSV([["Task", "Who", "Due", "Done"]].concat(tasks.map((t) => [t.task, t.who, t.due, t.done ? "yes" : ""])), "\t"), "Task list copied") }, "Copy for Google Sheets or Excel"),
          h("button", { onclick: () => OH.download("task-list.csv", OH.toCSV([["Task", "Who", "Due", "Done"]].concat(tasks.map((t) => [t.task, t.who, t.due, t.done ? "yes" : ""]))), "text/csv") }, "Download as a file"))));
    }
  }

  OH.register({
    week: 1, id: "w1-inbox", title: "Inbox to task list",
    intro: "Twelve emails go in. Four piles and a to-do list come out, and nothing is sent to anybody.",
    render: render,
    summary: function () { const mine = OH.store.get(K + "piles", null); if (!mine) return { label: "Emails waiting to be sorted", value: emails().length, tone: "warn" };
      const n = Object.keys(mine).filter((k) => mine[k] === "REPLY TODAY").length; return { label: "Emails that need a reply today", value: n, tone: n ? "bad" : "ok" }; },
    /* What the game counts as done (GAME.md). Read only: every answer comes from what this tool already saves.
       The catch is the second one: an email sitting in a different pile from the one the AI chose. */
    objectives: function () {
      const isMap = (v) => !!v && typeof v === "object" && !Array.isArray(v);
      const ai = get("ai", null), mine = get("piles", null), tasks = get("tasks", []), rules = get("rules", []), own = get("emails", null);
      const sorted = isMap(ai) && isMap(mine) && Object.keys(mine).length > 0;
      return [
        { id: "sorted", label: "Sort the inbox into four piles", done: sorted, required: true },
        { id: "caught", label: "Catch the one it got wrong and move it", done: sorted && Object.keys(ai).some((id) => !!mine[id] && mine[id] !== ai[id]), required: true },
        { id: "task", label: "Tick one task done on your list", done: Array.isArray(tasks) && tasks.some((t) => !!t && !!t.done), required: true },
        { id: "rule", label: "Add a rule so it gets it right tomorrow", done: Array.isArray(rules) && rules.length > 0, required: false },
        { id: "own", label: "Run it on your own emails", done: Array.isArray(own) && own.length > 1, required: false }
      ];
    }
  });
})();
