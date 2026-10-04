/* Week 4 · The get-found checks.
   The job from Session 4: run the five checks that decide whether Google and AI assistants can find
   and describe a business, then fix one weak service page from a few plain facts and confirm that
   nothing in the rewrite was made up. Buttons open a search or a page in a new tab. The tool itself
   never asks the web for anything, and what you type stays in this browser. */
(function () {
  const h = OH.h, S = OH.sample.getfound, K = "w4:";
  const get = (k, d) => OH.store.get(K + k, d), set = (k, v) => OH.store.set(K + k, v);
  const load = (k, sample) => get(k, null) || JSON.parse(JSON.stringify(sample));   // a copy, so edits never change the sample
  const ANSWERS = { yes: ["Yes", "ok"], no: ["No", "bad"], unsure: ["Not sure", "warn"] };
  const checksDone = () => { const found = get("found", {}); return S.checks.filter((c) => found[c.id] && found[c.id].answer).length; };

  // The search-result sketch and the short lists need a few styles the shell does not have.
  if (!document.getElementById("w4-style")) {
    document.head.appendChild(h("style", { id: "w4-style" },
      ".w4-result{max-width:640px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;font-family:Arial,sans-serif}" +
      ".w4-result .u{font-size:13px;color:var(--soft)}" +
      ".w4-result .t{font-size:19px;line-height:1.3;color:#1a0dab;margin:2px 0}" +
      ".w4-result .d{font-size:14px;line-height:1.45;color:#4d5156}" +
      ".w4-list{margin:6px 0 10px;padding-left:18px;font-size:13.5px;color:var(--soft)}"));
  }

  const link = (label, href) => h("a", { class: "btn", href: href, target: "_blank", rel: "noopener" }, label);
  const google = (words) => "https://www.google.com/search?q=" + encodeURIComponent(words);
  // "https://Example.com/services/" becomes "example.com": the bare site name the searches need
  const cleanSite = (text) => String(text || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  // Cut a long line back to a whole word, the way a search result does
  const cut = (text, about) => (text.length > about ? text.slice(0, about).replace(/\s+\S*$/, "") + " …" : text);
  const question = (b) => "Who does " + b.sells + " in " + b.town + ", and what do you know about " + b.name + "?";

  // Where a check's button goes: a Google search for some words, or a page on the person's own site.
  function target(kind, b) {
    const words = { search: b.sells + " " + b.town, site: "site:" + b.site, name: b.name + " " + b.town }[kind];
    if (words) return { href: google(words), shows: "Google search: " + words };
    const url = "https://" + b.site + (kind === "sitemap" ? "/sitemap.xml" : "");
    return { href: url, shows: url };
  }

  // A sketch of one search result: the address line, the title line, the description. With no
  // description written, it shows the first lines of the page, which is roughly what a search engine guesses.
  function resultPreview(page) {
    return h("div", null,
      h("div", { class: "w4-result" },
        h("div", { class: "u" }, page.site + (page.path ? " › " + page.path : "")),
        h("div", { class: "t" }, cut(page.title || "Untitled page", S.lengths.title)),
        h("div", { class: "d" }, cut(page.description || page.text || "", S.lengths.description))),
      page.description ? null : h("div", { class: "mut", style: "font-size:13px;margin-top:6px" }, S.guessNote));
  }

  // The count, and whether it is likely to show in full. A rule of thumb, never a fixed limit.
  function lengthHint(text, about) {
    const fits = text.length <= about;
    return h("span", { class: "mut", style: "font-size:13px" }, text.length + " characters ",
      OH.badge(fits ? "likely to show in full" : "likely to get cut off", fits ? "ok" : "warn"));
  }

  // What goes under the prompt, in the same layout as samples/week-4-sample-service-page.txt
  function asText(page, facts) {
    return "THE PAGE AS IT IS TODAY\n\nPage title (the blue line in a search result): " + (page.title || "[empty]") +
      "\nDescription (the short lines under the title): " + (page.description || "[empty]") +
      "\nHeading at the top of the page: " + (page.heading || "[empty]") + "\n\nText on the page:\n" + page.text +
      "\n\nTHE OWNER'S FACTS\n\n" + facts.filter((f) => f[1].trim()).map((f) => f[0] + ": " + f[1]).join("\n");
  }

  /* Read the answer back. Lines start with TITLE:, DESCRIPTION:, Q1:, A1: ... and MISSING:. Bold marks,
     list numbers and labels such as "Page title:" or "Question 1:" are fine. A line with no label
     belongs to the item above it. Returns null when the title, the description or the questions are missing. */
  function parseRewrite(text) {
    const out = { title: "", description: "", qa: [], missing: "" };
    let addTo = null;
    text.split("\n").forEach((raw) => {
      const line = raw.replace(/[*#`]/g, "").replace(/^\s*(?:[-•]|\d+[.)])\s+/, "").trim();
      if (!line) return;
      const m = /^(?:page |meta |seo )?(title|description|question|answer|missing)\b[^:]{0,20}:\s*(.*)$/i.exec(line) ||
        /^(q|a)\s*\d*\s*[:.)]\s*(.*)$/i.exec(line);
      if (!m) { if (addTo) addTo(" " + line); return; }
      const kind = m[1][0].toLowerCase(), rest = m[2];
      if (kind === "q") { const pair = { q: rest, a: "" }; out.qa.push(pair); addTo = (more) => { pair.q += more; }; }
      else if (kind === "a") { const pair = out.qa[out.qa.length - 1]; if (pair) { pair.a = rest; addTo = (more) => { pair.a += more; }; } }
      else { const key = { t: "title", d: "description", m: "missing" }[kind]; out[key] = rest; addTo = (more) => { out[key] += more; }; }
    });
    out.title = out.title.trim(); out.description = out.description.trim(); out.missing = out.missing.trim();
    out.qa = out.qa.map((x) => ({ q: x.q.trim(), a: x.a.trim() })).filter((x) => x.q && x.a);
    return out.title && out.description && out.qa.length ? out : null;
  }

  // The take-away: plain text for whoever edits the site, with anything flagged listed at the end.
  function handoffText(page, rewrite, flagged) {
    return ["For the web page at " + page.site + (page.path ? "/" + page.path : ""), "", "PAGE TITLE", rewrite.title, "", "DESCRIPTION", rewrite.description, "",
      "QUESTIONS AND ANSWERS FOR THE PAGE"]
      .concat(rewrite.qa.map((x) => "\nQ: " + x.q + "\nA: " + x.a))
      .concat(flagged.length ? ["", "CHECK BEFORE PUBLISHING. NOT FROM MY FACTS:"].concat(flagged.map((p) => "- " + p.label + ": " + p.says)) : [])
      .join("\n");
  }

  function findingsText(b, found) {
    return "Get-found checks for " + b.name + ", " + OH.today() + "\n" + S.checks.map((c) => {
      const mine = found[c.id] || {};
      return c.id + ". " + c.title + ": " + (mine.answer ? ANSWERS[mine.answer][0] : "not done yet") + (mine.note ? ". " + mine.note : "");
    }).join("\n");
  }

  function render(root, ctx) {
    const b = load("biz", S.business), usingSample = b.name === S.business.name;
    const found = get("found", {}), page = load("page", S.page), facts = load("facts", S.facts);
    const rewrite = get("rewrite", null), verdicts = get("verdicts", {}), rules = get("rules", []);
    const redraw = () => { const y = window.scrollY; ctx.redraw(); window.scrollTo(0, y); };   // the shell jumps to the top; come back
    const steps = h("div", { class: "steps" }); root.appendChild(steps);
    const field = (label, value, onInput, hint, tall) => [h("label", { class: "f" }, label),
      h(tall ? "textarea" : "input", { type: tall ? null : "text", value: value, placeholder: hint, oninput: (ev) => onInput(ev.target.value) })];
    const options = (list, chosen) => list.map((o) => h("option", { value: o[0], selected: o[0] === (chosen || "") }, o[1]));

    // 1 · who we are checking: typed once, used by every button in step 2
    const draft = Object.assign({}, b);
    const useDetails = () => {
      const next = { name: draft.name.trim(), sells: draft.sells.trim(), town: draft.town.trim(), site: cleanSite(draft.site) };
      if (!next.name || !next.sells || !next.town || !next.site) return OH.toast("Fill in all four boxes first");
      set("biz", next); redraw();
    };
    steps.appendChild(OH.step("Who are we checking?",
      OH.note(usingSample ? S.madeUpNote : "The checks below now use your details. They stay in this browser.", usingSample ? "warn" : "ok"),
      h("div", { class: "grid g4" },
        h("div", null, field("Business name", b.name, (v) => { draft.name = v; }, "Your business name")),
        h("div", null, field("What you sell, in a customer's words", b.sells, (v) => { draft.sells = v; }, "For example: bookkeeping")),
        h("div", null, field("Town or area", b.town, (v) => { draft.town = v; }, "Your town or area")),
        h("div", null, field("Website address", b.site, (v) => { draft.site = v; }, "yourdomain.com"))),
      h("div", { class: "row", style: "margin-top:10px" }, h("button", { class: "primary", onclick: useDetails }, "Use these details"))));

    // 2 · the five checks: a button that opens the right thing, and a place to write down what you saw
    const ask = question(b);
    const checkCard = (c) => {
      const mine = found[c.id] || {}, state = ANSWERS[mine.answer];
      const save = (patch) => { found[c.id] = Object.assign({}, found[c.id], patch); set("found", found); };
      const targets = c.opens.map((o) => target(o.kind, b));
      return h("div", { class: "card" },
        h("h3", null, c.id + ". " + c.title + " ", state ? OH.badge(state[0], state[1]) : OH.badge("about " + c.minutes + " minutes")),
        h("ul", { class: "w4-list" }, c.look.map((x) => h("li", null, x))),
        c.question ? [h("pre", { class: "code" }, ask), h("div", { class: "row", style: "margin-top:8px" },
          h("button", { class: "primary", onclick: () => OH.copy(ask, "Question copied") }, "Copy the question"),
          link("Open Claude", "https://claude.ai/new"), link("Open ChatGPT", "https://chatgpt.com/"))] : null,
        targets.length ? [h("div", { class: "row" }, c.opens.map((o, i) => link(o.label, targets[i].href))),
          h("div", { class: "mut", style: "font-size:13px;margin-top:4px" }, targets.map((t) => t.shows).join(" · "))] : null,
        c.live ? h("div", { class: "row", style: "margin-top:8px" }, h("span", { class: "mut", style: "font-size:13px" }, "In class, Mitchell looks up his own site:"),
          link("site:" + S.live, google("site:" + S.live)), link(S.live + "/sitemap.xml", "https://" + S.live + "/sitemap.xml"),
          link(S.live + "/llms.txt", "https://" + S.live + "/llms.txt")) : null,
        h("label", { class: "f" }, c.ask),
        h("div", { class: "row" },
          h("select", { style: "width:auto", onchange: (ev) => { save({ answer: ev.target.value }); redraw(); } },
            options([["", "Not done yet"], ["yes", "Yes"], ["no", "No"], ["unsure", "Not sure"]], mine.answer)),
          h("input", { type: "text", style: "flex:1;min-width:200px", placeholder: c.note, value: mine.note || "", oninput: (ev) => save({ note: ev.target.value }) })));
    };
    steps.appendChild(OH.step("The five checks",
      h("p", { class: "mut" }, "Each button opens a new tab. Look, come back, and write down what you saw. All five are free. " +
        "In class we run checks 1, 2 and 5. Checks 3 and 4 are for later this week."),
      h("div", { class: "grid g2" }, S.checks.map(checkCard)),
      h("div", { class: "row", style: "margin-top:12px" },
        OH.badge(checksDone() + " of " + S.checks.length + " checks done", checksDone() === S.checks.length ? "ok" : "blue"),
        h("button", { class: "small", onclick: () => OH.copy(findingsText(b, found), "Your findings copied") }, "Copy what I found")),
      OH.note([h("b", null, "What not to do. "), S.dont.join(" ")], "warn")));

    // 3 · one weak page as a search result, with the page and the owner's facts in boxes you can edit
    const todayViews = [h("div"), h("div")];                     // step 3 and step 6 both show today's result
    const drawToday = () => todayViews.forEach((box) => { box.innerHTML = ""; box.appendChild(resultPreview(page)); });
    const factList = h("ul", { class: "w4-list" });               // shown again in step 7, to check against
    const drawFacts = () => {
      factList.innerHTML = "";
      facts.filter((f) => f[1].trim()).forEach((f) => factList.appendChild(h("li", null, h("b", null, f[0] + ": "), f[1])));
    };
    const editPage = (key) => (v) => { page[key] = v; set("page", page); drawToday(); };
    const ownPage = !!page.own;                                   // set once the person clears the sample page
    const useOwnPage = () => {
      set("page", { own: true, site: b.site, path: "", title: "", description: "", heading: "", text: "" });
      set("facts", S.facts.map((f) => [f[0], f[0] === "Business name" ? b.name : f[0] === "Where" ? b.town : ""]));
      set("rewrite", null); set("verdicts", {}); redraw();
    };
    drawToday(); drawFacts();
    steps.appendChild(OH.step("One weak page, and the facts to fix it",
      h("p", { class: "mut" }, (ownPage ? "Type the page as it is today on the left, and a few true facts about that service on the right. "
        : "The title is one word. The description is empty. The page never names a town and answers no questions. ") +
        "The facts are all the AI is allowed to use."),
      h("div", { class: "grid g2" },
        OH.card("How the page looks in a search result today", todayViews[0],
          field("Page title (the blue line)", page.title, editPage("title"), "For example: Services"),
          field("Description (the short lines under the title)", page.description, editPage("description"), "Empty"),
          field("Heading at the top of the page", page.heading, editPage("heading")),
          field("Text on the page", page.text, editPage("text"), "Paste the words that are on the page today", true)),
        OH.card("The owner's facts", facts.map((f, i) => field(f[0], f[1], (v) => { facts[i][1] = v; set("facts", facts); drawFacts(); })))),
      h("div", { class: "row", style: "margin-top:10px" }, h("button", { onclick: useOwnPage }, "Clear the sample and type my own page"))));

    // 4 · the prompt: the job, the rules, and a layout the tool can read back
    const prompt = (ownPage ? S.prompt.replace("a small landscaping company", "a small business") : S.prompt)
      .replace("\n\nPage and facts:", rules.map((r) => "\nAlso: " + r).join("") + "\n\nPage and facts:");
    const pb = OH.promptBox({ prompt: prompt, data: () => asText(page, facts), dataLabel: "page with its facts", height: 250 });
    steps.appendChild(OH.step("Give the AI the job",
      h("p", { class: "mut" }, "Read the rule before you copy: use only the facts I gave you, and do not invent reviews, awards or numbers. " +
        "The page and the facts from step 3 go underneath."),
      pb.el, rules.length ? OH.note("Rules you added after checking its work: " + rules.join(" · "), "ok") : null));

    // 5 · the answer comes back
    const problem = h("div");
    const useAnswer = (text) => {
      const parsed = parseRewrite(text);
      problem.innerHTML = "";
      if (!parsed) return problem.appendChild(OH.note(S.shapeHelp, "warn"));
      set("rewrite", parsed); set("verdicts", {}); redraw();
    };
    steps.appendChild(OH.step("Bring the answer back", OH.pasteBox({ sample: S.answer, onUse: useAnswer }), problem));

    if (!rewrite) {                                               // keep the step numbers steady before there is an answer
      ["Before and after", "Check its work: is every fact one you supplied?", "Hand it to whoever edits your site"].forEach((title) =>
        steps.appendChild(OH.step(title, h("p", { class: "mut" }, "This fills in when you bring the answer back in step 5."))));
      return;
    }

    // 6 · the same search result before and after, then the three questions as cards
    const after = { site: page.site, path: page.path, title: rewrite.title, description: rewrite.description };
    const copyCard = (title, text, about, label) => OH.card(title, h("p", { style: "margin:0 0 8px" }, text),
      h("div", { class: "row" }, lengthHint(text, about), h("span", { class: "spacer" }), h("button", { class: "small", onclick: () => OH.copy(text, title + " copied") }, label)));
    steps.appendChild(OH.step("Before and after",
      h("div", { class: "grid g2" }, OH.card("Today", todayViews[1]), OH.card("After the rewrite", resultPreview(after))),
      h("div", { class: "grid g2", style: "margin-top:14px" },
        copyCard("Page title", rewrite.title, S.lengths.title, "Copy the title"),
        copyCard("Description", rewrite.description, S.lengths.description, "Copy the description")),
      h("p", { class: "mut", style: "font-size:13px" }, S.lengthNote),
      h("div", { class: "grid g3" }, rewrite.qa.map((x, i) => OH.card(null, h("h3", null, x.q), h("p", { style: "margin:0 0 8px" }, x.a),
        h("button", { class: "small", onclick: () => OH.copy("Q: " + x.q + "\nA: " + x.a, "Question " + (i + 1) + " copied") }, "Copy question " + (i + 1))))),
      rewrite.missing ? OH.note("What it said is missing: " + rewrite.missing) : null));

    // 7 · check its work: every piece of the rewrite is either made of supplied facts, or it gets flagged
    const pieces = [{ key: "title", label: "Page title", says: rewrite.title }, { key: "description", label: "Description", says: rewrite.description }]
      .concat(rewrite.qa.map((x, i) => ({ key: "q" + (i + 1), label: "Question " + (i + 1), says: x.q + " " + x.a })));
    const flagged = pieces.filter((p) => verdicts[p.key] === "flag"), confirmed = pieces.filter((p) => verdicts[p.key] === "mine");
    const rule = h("input", { type: "text", placeholder: "For example: never say how long we have been in business" });
    const addRule = () => { if (!rule.value.trim()) return; rules.push(rule.value.trim()); set("rules", rules); redraw(); };
    steps.appendChild(OH.step("Check its work: is every fact one you supplied?",
      h("p", { class: "mut" }, "Do not ask whether it reads well. Ask which one is wrong. Did it invent a price, a guarantee, years in business? " +
        "Hold each piece against the facts and make your call."),
      h("div", { class: "grid g2" },
        OH.card("The owner's facts", factList),
        h("div", null, OH.table([
          { h: "In the rewrite", f: (p) => h("b", null, p.label), s: (p) => p.label },
          { h: "What it says", f: (p) => p.says },
          { h: "Your call", f: (p) => h("select", { onchange: (ev) => { verdicts[p.key] = ev.target.value; set("verdicts", verdicts); redraw(); } },
            options([["", "Not checked yet"], ["mine", "Every fact is one I supplied"], ["flag", "Not from my facts"]], verdicts[p.key])), s: (p) => verdicts[p.key] || "" }
        ], pieces, { rowClass: (p) => (verdicts[p.key] === "flag" ? "hot" : "") }))),
      h("div", { class: "row", style: "margin-top:10px" },
        OH.badge(confirmed.length + " of " + pieces.length + " confirmed", confirmed.length === pieces.length ? "ok" : "blue"),
        flagged.length ? OH.badge(flagged.length + " not from my facts", "bad") : null),
      flagged.length ? h("div", { class: "card", style: "margin-top:10px" }, h("h3", null, "Not from my facts"),
        h("ul", { class: "w4-list" }, flagged.map((p) => h("li", null, h("b", null, p.label + ": "), p.says))),
        h("p", { class: "mut" }, "Take the made-up part out before this goes on the site. Then write the rule that stops it, and run the prompt again."),
        h("label", { class: "f" }, "Add a rule to the prompt"), rule,
        h("div", { class: "row", style: "margin-top:8px" }, h("button", { onclick: addRule }, "Add this rule"))) : null));

    // 8 · the take-away: plain text for whoever edits the site
    const handoff = handoffText(page, rewrite, flagged);
    steps.appendChild(OH.step("Hand it to whoever edits your site",
      h("p", { class: "mut" }, "It drafts. You publish. Nothing goes on a website until a person has read it."),
      h("pre", { class: "code" }, handoff),
      h("div", { class: "row", style: "margin-top:10px" },
        h("button", { class: "primary", onclick: () => OH.copy(handoff, "Title, description and questions copied") }, "Copy for whoever edits the site"),
        h("button", { onclick: () => OH.download("page-rewrite.txt", handoff) }, "Download as a text file"))));
  }

  OH.register({
    week: 4, id: "w4-getfound", title: "The get-found checks",
    intro: "Five free checks on whether Google and AI assistants can find and describe a business, then one weak page fixed from a few plain facts.",
    render: render,
    summary: function () { const n = checksDone(); return { label: "Get-found checks done", value: n + " of " + S.checks.length, tone: n === S.checks.length ? "ok" : "warn" }; },
    /* What counts as done in the game (GAME.md). Read only: every answer comes from what the tool has already
       saved, in the order the runbook walks it. The catch is step 7: every piece of the rewrite gets a call, and
       the piece holding the sample answer's made-up line ("for more than ten years") only counts once it is flagged. */
    objectives: function () {
      const ok = (test) => { try { return !!test(); } catch (e) { return false; } };               // nothing saved yet, or something odd saved: not done
      const MADE_UP = /more than ten years/i;
      return [
        { id: "own", label: "Point the checks at your own business", required: false,
          done: ok(() => { const b = get("biz", null); return b.name && b.name !== S.business.name; }) },
        { id: "checks", label: "Run three of the five checks and record what you saw", required: true,
          done: ok(() => checksDone() >= 3) },
        { id: "rewrite", label: "Bring the rewritten page back from the AI", required: true,
          done: ok(() => { const r = get("rewrite", null); return r.title && r.qa.length > 0; }) },
        { id: "caught", label: "Hold each piece against the facts. Flag what is made up", required: true,
          done: ok(() => {
            const r = get("rewrite", null), calls = get("verdicts", {});
            const pieces = [["title", r.title], ["description", r.description]].concat(r.qa.map((x, i) => ["q" + (i + 1), x.q + " " + x.a]));
            return pieces.every((p) => (MADE_UP.test(p[1]) ? calls[p[0]] === "flag" : calls[p[0]] === "mine" || calls[p[0]] === "flag"));
          }) },
        { id: "allfive", label: "Finish all five checks", required: false,
          done: ok(() => checksDone() === S.checks.length) }
      ];
    }
  });
})();
