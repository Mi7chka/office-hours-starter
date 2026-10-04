/* Week 3 · The 3-second home page test.
   The job from Session 3: show a home page for three seconds, then ask the visitor's three questions.
   Rewrite the first screen from a few plain facts, check the AI's headlines against those facts,
   pick one, and run the test again on the new page. Nothing is published anywhere. */
(function () {
  const h = OH.h, S = OH.sample.homepage, K = "w3:";
  const get = (k, d) => OH.store.get(K + k, d), set = (k, v) => OH.store.set(K + k, v);
  const words = (s) => String(s || "").split(/\s+/).filter(Boolean).length;
  const numbers = (s) => String(s || "").match(/\d+(?:[.,]\d+)*/g) || [];
  const clean = (s) => String(s || "").trim().replace(/[.\s]+$/, "");                 // no full stop at the end
  const dot = (s) => (clean(s) ? clean(s) + "." : "");
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const yesCount = (which) => (get("score", {})[which] || []).filter((a) => a === true).length;
  const isSample = (f) => Object.keys(S.facts).every((k) => f[k] === S.facts[k]);
  // The facts as one line to paste under the prompt. An empty fact is left out.
  const factsLine = (f) => [f.name, f.what, f.who && f.where ? "For " + f.who + " in " + f.where : f.who ? "For " + f.who : f.where ? "In " + f.where : "", f.other, f.proof,
    f.action ? "The one action we want: " + f.action : ""].map(clean).filter(Boolean).join(". ") + ".";

  /* The look of the two sample pages, one phone screen each. Injected once; app/shell.css is not touched. */
  const CSS = `
.w3-stage{position:relative;width:100%;max-width:340px;margin:12px auto 0}
.w3-phone{display:flex;flex-direction:column;min-height:540px;overflow:hidden;background:#fff;border:8px solid #2b2b2b;border-radius:30px;color:#1f2a22;font-family:-apple-system,"Segoe UI",Helvetica,Arial,sans-serif}
.w3-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;border-bottom:1px solid #e3e3e3}
.w3-logo{font-size:16px;font-weight:700;line-height:1.2;color:#2f5d3a}
.w3-logo small{display:block;margin-top:3px;font-size:9px;letter-spacing:.22em;color:#9a9a9a}
.w3-menu{font:22px/1 Arial,sans-serif;color:#7a7a7a}
.w3-call{padding:6px 12px;border:2px solid #2f5d3a;border-radius:999px;font-size:15px;font-weight:700;color:#2f5d3a;white-space:nowrap}
.w3-hero{flex:1;display:flex;flex-direction:column;justify-content:center;padding:22px 20px 24px;color:#fff;background:linear-gradient(rgba(20,45,26,.72),rgba(20,45,26,.72)),linear-gradient(160deg,#7fae7a,#3f7a4a 45%,#24502e)}
.w3-hero h3{margin:0 0 12px;font-size:29px;line-height:1.15;font-weight:800;color:#fff}
.w3-sub{margin:0 0 18px;font-size:17px;line-height:1.45;color:#f1f6ef}
.w3-proof{margin:0 0 20px;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.14);font-size:15px}
.w3-proof b,.w3-proof i{display:block}
.w3-proof i{margin-top:6px;line-height:1.45}
.w3-stars{color:#ffd666;font-size:17px;letter-spacing:.08em}
.w3-btn{display:block;padding:16px 18px;border-radius:12px;background:#ffd666;color:#1f2a22;font-size:19px;font-weight:800;text-align:center}
.w3-link{font-size:12px;color:rgba(255,255,255,.7);text-decoration:underline}
.w3-dots{margin-top:26px;font-size:11px;letter-spacing:.5em;color:rgba(255,255,255,.6)}
.w3-weak{font-family:Georgia,"Times New Roman",serif}
.w3-weak .w3-logo{font-size:19px;font-weight:400;letter-spacing:.32em}
.w3-weak .w3-hero{align-items:center;padding:28px 26px;text-align:center;background:linear-gradient(rgba(20,45,26,.55),rgba(20,45,26,.55)),linear-gradient(160deg,#7fae7a,#3f7a4a 45%,#24502e)}
.w3-weak .w3-hero h3{margin-bottom:16px;font-size:33px;font-weight:400;font-style:italic}
.w3-weak .w3-sub{font-size:14px;line-height:1.6;color:rgba(255,255,255,.85)}
.w3-cover{position:absolute;top:8px;right:8px;bottom:8px;left:8px;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:26px;border-radius:22px;background:#1f2a22;color:#fff;font-size:24px;font-weight:800;line-height:1.25;text-align:center}
.w3-cover small{margin-bottom:14px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#ffd666}
.w3-bar{position:absolute;top:-10px;left:8px;right:8px;height:5px;border-radius:3px;background:var(--blue);transform-origin:left center;animation:w3-count 3s linear forwards}
@keyframes w3-count{from{transform:scaleX(1)}to{transform:scaleX(0)}}`;

  /* One phone screen, built from the words in `p`. A part with no words is not drawn.
     `weak` gives it the look of the "before" page. */
  function phone(p, weak) {
    return h("div", { class: "w3-phone" + (weak ? " w3-weak" : "") },
      h("div", { class: "w3-top" }, h("div", { class: "w3-logo" }, p.logo, p.tagline ? h("small", null, p.tagline) : null),
        p.call ? h("span", { class: "w3-call" }, p.call) : h("span", { class: "w3-menu" }, "☰")),
      h("div", { class: "w3-hero" }, h("h3", null, p.headline), p.sub ? h("p", { class: "w3-sub" }, p.sub) : null,
        p.proof ? h("div", { class: "w3-proof" }, p.stars ? h("div", { class: "w3-stars" }, "★★★★★") : null, h("b", null, p.proof), p.review ? h("i", null, p.review) : null) : null,
        p.button ? h("span", { class: "w3-btn" }, p.button) : null,
        p.link ? h("span", { class: "w3-link" }, p.link) : null, weak ? h("div", { class: "w3-dots" }, "●○○○") : null));
  }

  /* The 3-second test for one page ("before" or "after"). "Run the 3-second test" shows the page for
     exactly three seconds and covers it again. Then each of the three questions gets a yes or a no,
     and the number of yeses is that page's score. It redraws only itself. */
  function tester(which, makePage, startOpen, note) {
    const answers = (get("score", {})[which] || []).slice(), stage = h("div", { class: "w3-stage" }), panel = h("div");
    let ran = answers.length > 0, state = startOpen ? "open" : ran ? "asked" : "ready", timer = null;      // ready, showing, asked or open
    const cover = (kicker, text) => h("div", { class: "w3-cover" }, h("small", null, kicker), text);
    function run() { clearTimeout(timer); ran = true; state = "showing"; draw(); timer = setTimeout(() => { state = "asked"; draw(); }, 3000); }
    function answer(i, value) { answers[i] = value; const all = get("score", {}); all[which] = answers; set("score", all); draw(); }
    function draw() {
      stage.innerHTML = ""; stage.appendChild(makePage()); panel.innerHTML = "";
      if (state === "ready") stage.appendChild(cover("The 3-second test", "You get three seconds with this home page."));
      if (state === "asked") stage.appendChild(cover("Time is up", "Look away. What do you know?"));
      if (state === "showing") { stage.appendChild(h("div", { class: "w3-bar" })); panel.appendChild(h("p", { class: "lead" }, "Look at the phone. One. Two. Three.")); return; }
      panel.appendChild(h("div", { class: "row" }, h("button", { class: "primary", onclick: run }, "Run the 3-second test"),
        ran ? h("button", { onclick: () => { state = state === "open" ? "asked" : "open"; draw(); } }, state === "open" ? "Cover the page" : "Show the page again") : null));
      if (!ran) return;
      S.questions.forEach((q, i) => panel.appendChild(h("div", { class: "row", style: "margin-top:12px" }, h("b", { style: "flex:1;min-width:170px" }, q),
        [true, false].map((v) => h("button", { class: "small" + (answers[i] === v ? " primary" : ""), onclick: () => answer(i, v) }, v ? "Yes" : "No")))));
      const n = answers.filter((a) => a === true).length;
      panel.appendChild(h("p", { style: "margin-top:14px" }, "In three seconds this page answers ", h("b", { class: n === 3 ? "ok" : n ? "warn" : "bad" }, n + " of 3"), " questions.",
        which === "after" ? " The old page answered " + yesCount("before") + " of 3." : ""));
      if (note && state === "open") panel.appendChild(h("p", { class: "mut" }, note));
    }
    draw();
    return { el: h("div", { class: "grid g2", style: "align-items:start" }, stage, panel), show: () => { if (state !== "showing") { state = "open"; draw(); } } };
  }

  /* Read the headlines out of a free-form answer. A numbered line starts a headline ("1. Roof repair",
     "Headline 1: Roof repair", or the number on a line by itself); the next line is its supporting line. */
  function parseHeadlines(text) {
    const NUM = /^(?:headline|option)?\s*\d+\s*[:.)]\s+/i, ALONE = /^(?:headline|option)?\s*\d+\s*[:.)]?$/i;
    const LABEL = /^(?:[-•]\s*)?(?:(?:headline|supporting line|sub-?line|subhead(?:line)?)\s*:\s*)?/i;
    const tidy = (s) => s.replace(LABEL, "").replace(/\s*\(\d+ words?\)$/i, "").replace(/^["“'‘]+|["”'’]+$/g, "").trim(), found = [];
    text.split("\n").map((l) => l.replace(/[*_#>`]/g, "").trim()).filter(Boolean).forEach((line) => {
      const last = found[found.length - 1];
      if (NUM.test(line) || ALONE.test(line)) found.push({ headline: tidy(line.replace(NUM, "").replace(ALONE, "")), sub: "" });
      else if (last && !last.headline) last.headline = tidy(line);
      else if (last && !last.sub) last.sub = tidy(line);
    });
    return found.filter((o) => o.headline).slice(0, 6);
  }
  /* Did it add something it was not given? A number that is not in the facts, or a big claim the facts do not make. */
  const CLAIMS = /\b(award[- ]winning|awards?|best|top[- ]rated|number one|leading|guaranteed?|trusted by|voted)\b/gi;
  function notInFacts(o, f) {
    const given = (factsLine(f) + " " + f.phone).toLowerCase(), known = numbers(given), text = o.headline + " " + o.sub;
    return numbers(text).filter((n) => known.indexOf(n) < 0).concat((text.match(CLAIMS) || []).filter((c) => given.indexOf(c.toLowerCase()) < 0).map((c) => "\"" + c.toLowerCase() + "\""));
  }
  function plainHeadlines(f) {                       // no AI at hand and your own facts: three headlines from the formula
    const what = clean(f.what), low = what.charAt(0).toLowerCase() + what.slice(1);
    return ["1. " + cap(what) + " for " + f.who + " in " + f.where + "\n" + dot(f.proof || f.other),
      "2. " + f.where + " " + low + " for " + f.who + "\n" + dot(f.other || f.proof),
      "3. " + cap(f.who) + " in " + f.where + ": " + low + "\n" + dot(f.action)].join("\n\n");
  }

  function render(root, ctx) {
    if (!document.getElementById("w3-style")) document.head.appendChild(h("style", { id: "w3-style" }, CSS));
    const facts = Object.assign({}, S.facts, get("facts", {}));                      // a copy, so typing never changes the sample
    const options = get("options", null), picked = get("pick", null), chosen = get("chosen", null);
    const stay = () => { const y = window.scrollY; ctx.redraw(); window.scrollTo(0, y); };          // redraw, and stay where the person was
    const field = (label, el) => h("div", null, h("label", { class: "f" }, label), el);
    const steps = h("div", { class: "steps" }); root.appendChild(steps);
    let afterTest = null;

    // 1 · the test, on the "before" page. It starts covered, so nobody reads it early.
    steps.appendChild(OH.step("The 3-second test",
      h("p", { class: "mut" }, "A busy person on a phone is not reading your page. They are checking it. Three seconds is a rule of thumb, not a statistic."),
      tester("before", () => phone(S.before, true), false, S.before.below).el,
      OH.note("Your own page: open it on your phone, count to three, look away, and answer the same three questions.")));

    // 2 · the facts. They start as Greenline's; type over them with your own business.
    const formula = h("pre", { class: "code", style: "font-size:15px" });
    const showFormula = () => { formula.textContent = cap(clean(facts.what)) + " for " + facts.who + " in " + facts.where + ". Then one button: " + facts.action + "."; };
    const change = (key) => (ev) => { facts[key] = ev.target.value; set("facts", facts); showFormula(); if (afterTest) afterTest.show(); };
    showFormula();
    steps.appendChild(OH.step("The facts",
      h("p", { class: "mut" }, "These start as Greenline's facts. Type over any line with your own business and everything below follows. Start over with the sample data brings Greenline back."),
      h("div", { class: "grid g2" }, S.fields.map((fd) => field(fd.label, h("input", { type: "text", value: facts[fd.key], placeholder: fd.hint, oninput: change(fd.key) })))),
      h("label", { class: "f" }, "The formula: what you do, who it is for, where. Then one button"), formula,
      OH.note("Greenline is made up, so its rating and its review count are made up too. On your site that line has to be your real number, copied from your real Google Business Profile. No reviews yet? Leave it empty.")));

    // 3 · the prompt: the session's job and rules, with the facts underneath
    steps.appendChild(OH.step("Give the AI the job",
      h("p", { class: "mut" }, "The new-hire rule from week 1 in a few lines. The job: three headlines. The context: your facts. The rules: only these facts, and no invented numbers, reviews or awards. And one good example."),
      OH.promptBox({ prompt: S.prompt, data: () => factsLine(facts), dataLabel: "facts", height: 170 }).el));

    // 4 · the answer comes back
    steps.appendChild(OH.step("Bring the answer back", OH.pasteBox({ sample: () => (isSample(facts) ? S.answer : plainHeadlines(facts)), onUse: (text) => {
      const found = parseHeadlines(text);
      if (!found.length) return OH.toast("I could not find the headlines. Ask the AI to number them 1, 2 and 3.");
      set("options", found); set("pick", null); stay();
    } })));

    // 5 · check each headline against the facts, then pick one
    if (options) {
      const card = (o, i) => {
        const extra = notInFacts(o, facts), tooLong = words(o.headline) > 10 || words(o.sub) > 15;
        return h("div", { class: "card" }, h("div", { class: "kicker" }, "Headline " + (i + 1)), h("h3", { style: "font-size:19px;margin-top:4px" }, o.headline), h("p", { style: "margin:0 0 8px" }, o.sub),
          h("div", { class: tooLong ? "warn" : "mut", style: "font-size:13px" }, words(o.headline) + " words, and " + words(o.sub) + " under it. The prompt asked for 10 and 15 or fewer."),
          extra.length ? OH.note("Not in your facts: " + extra.join(", ") + ". That line goes, or you fix it.", "warn") : OH.note("No number or big claim here that is missing from your facts.", "ok"),
          h("button", { class: picked === i ? "primary" : "", onclick: () => { set("pick", i); set("chosen", { headline: o.headline, sub: o.sub }); stay(); } }, picked === i ? "Headline " + (i + 1) + " is on the page" : "Use headline " + (i + 1)));
      };
      steps.appendChild(OH.step("Check its work, then pick one",
        h("p", { class: "mut" }, "It drafts. You publish. Read each one against your facts before anything goes on a page: did it add a number, a review or an award you did not give it? Then pick the one that would make you pick up the phone."),
        h("div", { class: "grid g3" }, options.map(card))));
    }

    // 6 · the new first screen: the headline that was picked, plus the proof line and the button from the facts
    if (chosen) {
      const afterPage = () => {
        const sample = facts.proof === S.facts.proof;                                // the stars and the sample review belong to Greenline's proof only
        return { logo: facts.name, call: clean(facts.phone) ? "Call " + clean(facts.phone) : "", headline: chosen.headline, sub: chosen.sub,
          proof: clean(facts.proof), stars: sample, review: sample ? S.review : "", button: clean(facts.action) };
      };
      const edit = (key) => h("input", { type: "text", value: chosen[key], oninput: (ev) => { chosen[key] = ev.target.value; set("chosen", chosen); afterTest.show(); } });
      const takeAway = () => ["The top of the home page: what shows on a phone before anyone scrolls.", "", "Headline: " + chosen.headline, "Line under it: " + chosen.sub,
        clean(facts.proof) ? "Proof: " + clean(facts.proof) : null, "Button: " + clean(facts.action), clean(facts.phone) ? "Phone number, at the top and big enough to tap: " + clean(facts.phone) : null, "",
        "For whoever edits the site (WordPress, Wix, Squarespace or Shopify): these lines replace the first screen. The welcome line and the history move down the page."].filter((x) => x != null).join("\n");
      afterTest = tester("after", () => phone(afterPage()), true);
      steps.appendChild(OH.step("The new first screen",
        h("p", { class: "mut" }, "Same company, same facts, same colors. The words changed, and the order. One headline, one line of proof, one button, and the phone number at the top. Now run the test again."),
        afterTest.el,
        h("div", { class: "grid g2" }, field("Headline", edit("headline")), field("Line under it", edit("sub"))),
        h("p", { class: "mut" }, "The proof line, the button and the phone number come from your facts in step 2. Change them there and this screen follows."),
        h("div", { class: "row" },
          h("button", { class: "primary", onclick: () => OH.copy(takeAway(), "First screen copied") }, "Copy the new first screen"),
          h("button", { onclick: () => OH.download("home-page-first-screen.txt", takeAway()) }, "Download as a file"))));
    }

    // 7 · the six parts every small business site needs, each with the tool that does it
    const have = get("parts", []), tally = h("b");
    const count = () => { const n = S.parts.filter((p, i) => have[i]).length; tally.textContent = n + " of " + S.parts.length; tally.className = n === S.parts.length ? "ok" : n >= 3 ? "warn" : "bad"; };
    count();
    steps.appendChild(OH.step("Six parts every small business site needs",
      h("p", { class: "mut" }, "Tick the ones your own site already has. One point for each. Not one of them needs a custom site."),
      S.parts.map((p, i) => h("label", { style: "display:flex;gap:10px;align-items:flex-start;margin:10px 0;cursor:pointer" },
        h("input", { type: "checkbox", checked: !!have[i], style: "margin-top:4px;width:17px;height:17px", onchange: (ev) => { have[i] = ev.target.checked; set("parts", have); count(); } }),
        h("span", null, h("b", null, p.job), " ", OH.badge(p.tool, "blue"), h("br"), h("span", { class: "mut" }, p.how)))),
      h("p", null, "Your score: ", tally, ". The missing ones are your job for the week.")));
  }

  OH.register({
    week: 3, id: "w3-homepage", title: "The 3-second home page test",
    intro: "Three seconds, three questions. Test a weak first screen, rewrite it from a few plain facts, and test it again.",
    render: render,
    // The current page is the new first screen once a headline is picked, and the "before" page until then.
    summary: function () { const n = yesCount(get("chosen", null) ? "after" : "before"); return { label: "Home page questions answered", value: n + " of 3", tone: n === 3 ? "ok" : n ? "warn" : "bad" }; },
    /* What counts as done in the game (GAME.md). Read only: every answer comes from what the tool has already
       saved, in the order the runbook walks it. The catch is the headline on the page: it has to pass the same
       check the cards run (no number or big claim that is missing from the facts), and then the test is run again. */
    objectives: function () {
      const ok = (test) => { try { return !!test(); } catch (e) { return false; } };               // nothing saved yet, or something odd saved: not done
      const typed = () => { const f = get("facts", null); return f && typeof f === "object" ? f : null; };                 // the facts as typed over, or none
      const facts = () => Object.assign({}, S.facts, typed()), chosen = () => get("chosen", null);
      const headlines = () => { const o = get("options", null); return Array.isArray(o) && o.length > 0; };
      const answered = (which) => { const a = get("score", {})[which]; return Array.isArray(a) && S.questions.every((q, i) => typeof a[i] === "boolean"); };
      return [
        { id: "tested", label: "Run the 3-second test on the old page and answer all three", required: true,
          done: ok(() => answered("before")) },
        { id: "drafted", label: "Bring three headlines back from the AI", required: true,
          done: ok(headlines) },
        { id: "caught", label: "Check each headline against the facts. Pick a true one", required: true,
          done: ok(() => { const c = chosen(); return headlines() && clean(c.headline) && !notInFacts(c, facts()).length; }) },
        { id: "retested", label: "Run the test on the new page and score 3 of 3", required: true,
          done: ok(() => clean(chosen().headline) && answered("after") && yesCount("after") === S.questions.length) },
        { id: "parts", label: "Tick the parts your own site already has", required: false,
          done: ok(() => get("parts", []).some((p) => p === true)) },
        { id: "own", label: "Type your own business over Greenline's facts", required: false,
          done: ok(() => typed() && !isSample(facts())) }
      ];
    }
  });
})();
