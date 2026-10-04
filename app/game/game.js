/* Save Greenline · the game engine.
   The eight weekly tools, played as a game: a title screen, a map of eight missions, the mission flow
   (the scene, three questions, the job, mission complete) and a final screen with a certificate.
   It changes nothing in the tools. A mission draws the week's module with its normal render() and
   reads the module's objectives() to see what is done. Everything it saves sits under "game:" keys
   in OH.store, in this browser only. The rules and the mission file format are in GAME.md. */
(function () {
  "use strict";
  if (!window.OH || !OH.course) return;
  const h = OH.h, C = OH.course;
  const G = (OH.game = OH.game || {});
  G.missions = G.missions || {};

  const WEEKS = C.sessions.map((s) => s.week), TOTAL = WEEKS.length;
  const OWNER = String(C.business.owner || "The owner").split(" ")[0];
  const GAME = "Save Greenline";

  /* A mission file calls this once. */
  G.mission = function (data) { if (data && WEEKS.indexOf(+data.week) >= 0) G.missions[+data.week] = data; };

  // ── saved state: five keys, all under "game:" ──
  //    game:name     the player's name, for the certificate
  //    game:started  true once Start has been pressed
  //    game:done     {week: {stars, at}}        a finished mission
  //    game:quiz     {week: {n, missed, passed, firstTry}}
  //    game:ticks    {week: {objectiveId: true}} an objective stays ticked once it has been done
  const KEY = "game:";
  const read = (k, fallback) => OH.store.get(KEY + k, fallback);
  const write = (k, v) => OH.store.set(KEY + k, v);
  const asMap = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
  G.state = function () {
    return { name: String(read("name", "") || ""), started: !!read("started", false),
      done: asMap(read("done", {})), quiz: asMap(read("quiz", {})), ticks: asMap(read("ticks", {})) };
  };

  // ── what this copy holds, and how far the player is ──
  const session = (w) => C.sessions.find((s) => s.week === w) || {};
  const inCopy = (w) => !!(OH.modules[w] && G.missions[w]);            // the tool and its story are both here
  const available = () => WEEKS.filter(inCopy);
  const doneCount = (st) => WEEKS.filter((w) => st.done[w]).length;
  const isOpen = (w, st) => inCopy(w) && (w === WEEKS[0] || !!st.done[w - 1]);
  const arrives = (w, inSentence) => (session(w).date ? (inSentence ? "arrives " : "Arrives ") + OH.niceDate(session(w).date) : inSentence ? "is on its way" : "On its way");
  const nextArrival = () => WEEKS.find((w) => !inCopy(w));
  function rank(n) {
    return n >= 8 ? "Greenline runs itself" : n === 7 ? "Almost running itself" : n >= 5 ? OWNER + "'s right hand"
      : n >= 3 ? "Running the office" : n >= 1 ? "Getting organised" : "New at the desk";
  }

  // ── the story meters: made-up numbers for a made-up company, always labelled "in the story" ──
  const whole = (v) => Math.max(0, Math.round(Number(v) || 0));
  const dollars = (n) => "$" + whole(n).toLocaleString("en-US");
  const METERS = [
    { key: "hours", label: "Hours of busywork saved each week", fmt: String, gain: (n) => "+" + n + (n === 1 ? " hour a week" : " hours a week") },
    { key: "leads", label: "Leads answered", fmt: String, gain: (n) => "+" + n + (n === 1 ? " lead answered" : " leads answered") },
    { key: "money", label: "Dollars found", fmt: dollars, gain: (n) => "+" + dollars(n) + " found" }
  ];
  function reward(w) { const r = (G.missions[w] && G.missions[w].reward) || {}; return { hours: whole(r.hours), leads: whole(r.leads), money: whole(r.money) }; }
  function totals(st) { const t = { hours: 0, leads: 0, money: 0 }; WEEKS.forEach((w) => { if (st.done[w]) { const r = reward(w); METERS.forEach((m) => { t[m.key] += r[m.key]; }); } }); return t; }
  /* How long a meter's bar can get: every mission's reward when all eight are here, and a fair guess
     from the ones that are when this copy holds fewer. Used for the bar only, never shown as a number. */
  function ceiling(key) { const known = WEEKS.filter((w) => G.missions[w]); return known.length ? Math.round(known.reduce((a, w) => a + reward(w)[key], 0) * TOTAL / known.length) : 0; }
  const share = (value, of) => (of > 0 ? Math.max(0, Math.min(100, Math.round(value / of * 100))) : 0);
  function gains(w) { const r = reward(w); return METERS.filter((m) => r[m.key] > 0).map((m) => m.gain(r[m.key])); }

  // ── objectives: asked of the week's module, never written by it ──
  /* Returns the module's objectives, required ones first, or null when the module has none yet.
     An objective that has been done stays done (saved in game:ticks), so trying the tool on your own
     data, which clears the sample work, never takes a tick away. */
  function objectives(week) {
    const mod = OH.modules[week]; let list;
    if (!mod || typeof mod.objectives !== "function") return null;
    try { list = mod.objectives(); } catch (e) { return null; }
    if (!Array.isArray(list)) return null;
    list = list.filter((o) => o && o.id != null && o.label).map((o) => ({ id: String(o.id), label: String(o.label), done: !!o.done, required: o.required !== false }));
    if (!list.length) return null;
    const all = asMap(read("ticks", {})), kept = asMap(all[week]); let changed = false;
    list.forEach((o) => { if (o.done && !kept[o.id]) { kept[o.id] = true; changed = true; } o.done = o.done || !!kept[o.id]; });
    if (changed) { all[week] = kept; write("ticks", all); }
    return list.filter((o) => o.required).concat(list.filter((o) => !o.required));
  }
  /* 3: every objective and all three questions right first time. 2: every required objective. 0: not passed.
     A mission marked complete by hand (no checks yet) earns 2. */
  function starsFor(week, list, st) {
    if (!list) return 2;
    if (!list.filter((o) => o.required).every((o) => o.done)) return 0;
    return list.every((o) => o.done) && (st.quiz[week] || {}).firstTry ? 3 : 2;
  }
  const questions = (m) => (Array.isArray(m.quiz) ? m.quiz : []).filter((x) => x && x.q && Array.isArray(x.options) && x.options[x.answer] != null);

  // ── small pieces ──
  const calm = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const TEXT_STYLE = String.fromCharCode(0xFE0E);                      // added after a symbol, it asks for the plain glyph, never an emoji
  const symbol = (s) => (Array.from(String(s || "★"))[0] || "★") + TEXT_STYLE;
  const emblem = () => h("span", { class: "sg-emblem", "aria-hidden": "true" }, h("i"));
  const check = () => h("span", { class: "sg-check", "aria-hidden": "true" });
  const medal = (m, cls) => h("span", { class: "sg-medal" + (cls ? " " + cls : ""), "aria-hidden": "true" }, m && m.badge ? symbol(m.badge.icon) : "?");
  function stars(n, big) {
    return h("span", { class: "sg-stars" + (big ? " big" : ""), role: "img", "aria-label": n + " of 3 stars" },
      [1, 2, 3].map((i) => h("span", { class: i <= n ? "on" : "", "aria-hidden": "true" }, "★")));
  }
  /* A question drawn in the page: one button that turns into the question and two answers. Never a native dialog. */
  function twoStep(o) {
    const box = h("span", { class: "sg-two" });
    function rest(focus) { box.innerHTML = ""; const b = h("button", { class: "small ghost", type: "button", onclick: ask }, o.label); box.appendChild(b); if (focus) b.focus(); }
    function ask() {
      box.innerHTML = "";
      const no = h("button", { class: "small", type: "button", onclick: () => rest(true) }, o.no);
      box.appendChild(h("span", { class: "sg-ask", role: "group", "aria-label": o.question }, h("span", null, o.question),
        h("button", { class: "small sg-danger", type: "button", onclick: o.yes }, o.yesLabel), no));
      no.focus();
    }
    rest(false);
    return box;
  }

  // ── the page area, and the timers a screen starts ──
  let V = null, poll = null, waits = [], runs = [], onResize = null;
  function halt() {
    if (poll) clearInterval(poll); poll = null;
    waits.forEach(clearTimeout); waits = []; runs.forEach(clearInterval); runs = [];
    if (onResize) window.removeEventListener("resize", onResize); onResize = null;
    document.body.classList.remove("sg-printing");
  }
  G.leave = halt;                                    // the shell calls this whenever the page changes
  function later(fn, ms) { if (calm()) return fn(); waits.push(setTimeout(fn, ms)); }
  function countUp(el, from, to, fmt) {
    if (calm() || from === to) { el.textContent = fmt(to); return; }
    const t0 = Date.now(), id = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / 900);
      el.textContent = fmt(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p >= 1) clearInterval(id);
    }, 40);
    runs.push(id);
  }
  /* Start a new screen. Pass a week to show the shell's Runbook button for it. */
  function newScreen(cls, runbookWeek) {
    halt(); V.innerHTML = "";
    const rb = document.getElementById("runbookBtn"), drawer = document.getElementById("runbook");
    const show = !!(runbookWeek && OH.runbooks && OH.runbooks[runbookWeek]);
    if (rb) { rb.hidden = !show; rb.onclick = show ? () => OH.openRunbook(runbookWeek) : null; }
    if (drawer && !show) drawer.hidden = true;
    const el = h("div", { class: "game " + cls }); V.appendChild(el); return el;
  }
  function arrive(heading) {
    window.scrollTo(0, 0);
    if (heading && heading.focus) { try { heading.focus({ preventScroll: true }); } catch (e) { /* an old browser: no harm */ } }
  }
  function go(hash) { if ((location.hash || "") === hash) G.render(V, hash.replace(/^#\/game\/?/, "")); else location.hash = hash; }

  /* One meter: a label, a number that can count up from `from`, and a bar. */
  function meterTile(o) {
    const moving = o.from != null && o.from !== o.value;
    const v = h("div", { class: "v" }, o.fmt(moving ? o.from : o.value));
    const fill = h("div", { class: "sg-fill", style: "width:" + (moving ? o.barFrom : o.bar) + "%" });
    if (moving) later(() => { fill.style.width = o.bar + "%"; countUp(v, o.from, o.value, o.fmt); }, o.wait || 80);
    return h("div", { class: "sg-meter" + (o.cls ? " " + o.cls : "") }, h("div", { class: "k" }, o.label), v,
      h("div", { class: "sg-track", "aria-hidden": "true" }, fill), h("div", { class: "d" }, o.detail));
  }
  /* The health bar and the three story meters. `was` ({n, totals}) makes them count up from there. */
  function statusStrip(st, was, wait) {
    const n = doneCount(st), t = totals(st), pct = (k) => share(k, TOTAL);
    return h("div", { class: "sg-status" },
      meterTile({ cls: "sg-health", label: "Greenline's health", value: pct(n), from: was ? pct(was.n) : null, fmt: (x) => x + "%", bar: pct(n), barFrom: was ? pct(was.n) : 0,
        detail: n + " of " + TOTAL + " missions complete", wait: wait }),
      METERS.map((m) => meterTile({ label: m.label, value: t[m.key], from: was ? was.totals[m.key] : null, fmt: m.fmt, bar: share(t[m.key], ceiling(m.key)),
        barFrom: was ? share(was.totals[m.key], ceiling(m.key)) : 0, detail: "in the story", wait: wait })));
  }

  // ── the title screen ──
  function titleScreen() {
    const st = G.state(), el = newScreen("sg-titleview"), have = available();
    const name = h("input", { type: "text", id: "sg-name", maxlength: "40", autocomplete: "off", placeholder: "Your name", value: st.name });
    const head = h("h1", { tabindex: "-1" }, GAME);
    const begin = (ev) => { ev.preventDefault(); write("name", name.value.trim()); write("started", true); go("#/game"); };
    el.appendChild(h("form", { class: "sg-hero sg-narrow", onsubmit: begin }, emblem(),
      h("div", { class: "kicker" }, C.series + " · the game"), head,
      h("ul", { class: "sg-premise" },
        h("li", null, C.business.name + " is a good company drowning in busywork."),
        h("li", null, C.business.owner + ", the owner, has just handed you the keys to the office."),
        h("li", null, "Eight missions, one a week. Each is a broken part of the business, and you fix it by doing the real job."),
        h("li", null, "Finish all eight and " + OWNER + " gets the evenings back.")),
      have.length < TOTAL ? h("p", { class: "sg-small" }, "This copy holds " + (have.length === 1 ? "mission " + have[0] : "missions " + have[0] + " to " + have[have.length - 1]) + ". A new one arrives each Wednesday.") : null,
      h("label", { class: "f", for: "sg-name" }, "Your name (optional, it goes on your certificate)"), name,
      h("div", { class: "row sg-actions" },
        h("button", { class: "primary sg-big", type: "submit" }, st.started ? "Continue" : "Start"),
        h("span", { class: "sg-small" }, "The class never requires the game. Your progress stays in this browser."))));
    arrive(head);
  }

  // ── the map ──
  function mapStop(w, st) {
    const m = G.missions[w], s = session(w), done = st.done[w], here = inCopy(w), open = isOpen(w, st);
    const state = done ? "done" : open ? "open" : here ? "locked" : "later";
    const node = state === "done" ? symbol(m && m.badge && m.badge.icon) : state === "locked" ? h("span", { class: "sg-lock" }) : String(w);
    const line = state === "done" ? stars(whole(done.stars))
      : state === "open" ? h("span", { class: "badge blue" }, st.quiz[w] ? "Continue" : "Start")
      : state === "locked" ? "Opens after mission " + (w - 1)
      : arrives(w);
    const linked = here && (done || open);
    return h("li", { class: "sg-stop is-" + state },
      h(linked ? "a" : "div", { class: "sg-stopin", href: linked ? "#/game/m" + w : null, "aria-current": state === "open" ? "step" : null },
        h("span", { class: "sg-node", "aria-hidden": "true" }, node),
        h("span", { class: "sg-stopbody" }, h("span", { class: "sg-stopk" }, "Mission " + w), h("b", null, m ? m.title : s.tool), h("span", { class: "sg-stopstate" }, line))));
  }
  function mapScreen(notice) {
    const st = G.state(), el = newScreen("sg-mapview"), n = doneCount(st), have = available();
    const next = have.find((w) => !st.done[w] && isOpen(w, st)), soon = nextArrival();
    const head = h("h1", { tabindex: "-1" }, st.name ? "The office is yours, " + st.name + "." : "The office is yours.");
    el.appendChild(h("div", { class: "row sg-maphead" },
      h("div", null, h("div", { class: "kicker" }, GAME + " · the map"), head), h("span", { class: "spacer" }),
      h("div", { class: "sg-rank" }, h("small", null, "Your rank"), h("b", null, rank(n)))));
    if (notice) el.appendChild(OH.note(notice, "warn"));
    el.appendChild(h("div", { class: "row sg-nextup" },
      next ? h("a", { class: "btn primary sg-big", href: "#/game/m" + next }, (st.quiz[next] ? "Continue mission " : "Start mission ") + next)
        : have.length ? h("a", { class: "btn primary sg-big", href: "#/game/done" }, n >= TOTAL ? "See the whole business" : "See how far you have come") : null,
      h("span", { class: "sg-small" }, next ? (G.missions[next].title + ". " + (G.missions[next].stakes || ""))
        : soon ? "Every mission in this copy is done. Mission " + soon + " " + arrives(soon, true) + "."
        : "All eight missions are done. " + OWNER + " has the evenings back.")));
    el.appendChild(statusStrip(st));
    el.appendChild(h("h2", { class: "sg-h" }, "Eight missions, in order"));
    el.appendChild(h("ol", { class: "sg-path" }, WEEKS.map((w) => mapStop(w, st))));
    el.appendChild(h("h2", { class: "sg-h" }, "Badges"));
    el.appendChild(h("ul", { class: "sg-shelf" }, WEEKS.map((w) => { const m = G.missions[w], got = !!(st.done[w] && m && m.badge);
      return h("li", { class: "sg-badge" + (got ? "" : " off") }, medal(got ? m : null), h("span", null, got ? m.badge.name : "Mission " + w)); })));
    el.appendChild(h("div", { class: "row sg-foot" },
      h("a", { href: "#/game/title" }, st.name ? "Change the name on your certificate" : "Add your name for the certificate"),
      h("span", { class: "spacer" }),
      twoStep({ label: "Reset the game", question: "Clear your stars and the work in every tool?", yesLabel: "Yes, reset", no: "Keep playing", yes: resetGame })));
    arrive(head);
  }
  function resetGame() {
    OH.store.clear(KEY);
    WEEKS.forEach((w) => { const mod = OH.modules[w]; try { if (mod && mod.reset) mod.reset(); } catch (e) { /* keep clearing */ } OH.store.clear("w" + w + ":"); });
    OH.toast("The game is back to the start");
    go("#/game");
  }

  // ── a mission: the scene, three questions, the job, mission complete ──
  function missionScreen(week) {
    const st = G.state();
    if (!inCopy(week)) return mapScreen(session(week).week ? "Mission " + week + " is not in this copy yet. It " + arrives(week, true) + "." : null);
    if (!st.done[week] && !isOpen(week, st)) return mapScreen("Mission " + week + " opens when mission " + (week - 1) + " is complete.");
    if (!st.started) write("started", true);
    const q = st.quiz[week] || {};
    if (st.done[week]) completeScreen(week); else if (q.passed) jobScreen(week); else if (q.n > 0) quizScreen(week); else sceneScreen(week);
  }
  /* The top of every mission page: where you are, and the four steps. Returns {el, head}. */
  function missionFrame(week, step, runbook) {
    const m = G.missions[week], st = G.state(), el = newScreen("sg-mission" + (step === "job" ? "" : " sg-narrow"), runbook ? week : 0), passed = !!(st.quiz[week] || {}).passed;
    const head = h("h1", { tabindex: "-1" }, String(m.title || session(week).tool));
    const steps = [["scene", "The scene", true, () => sceneScreen(week)], ["quiz", questions(m).length === 3 ? "Three questions" : "The questions", passed, () => quizScreen(week, true)],
      ["job", "The job", passed, () => jobScreen(week)], ["complete", "Mission complete", !!st.done[week], () => completeScreen(week)]];
    const at = steps.findIndex((s) => s[0] === step);
    el.appendChild(h("a", { class: "sg-back", href: "#/game" }, "Back to the map"));
    el.appendChild(h("div", { class: "kicker" }, "Mission " + week + " of " + TOTAL));
    el.appendChild(head);
    el.appendChild(h("ol", { class: "sg-steps" }, steps.map((s, i) => {
      const cls = "sg-step" + (i === at ? " on" : (i < at || (s[2] && i !== at)) ? " past" : ""), inner = [h("i", { "aria-hidden": "true" }, String(i + 1)), s[1]];
      return h("li", null, i !== at && s[2] ? h("button", { class: cls, type: "button", onclick: s[3] }, inner) : h("span", { class: cls, "aria-current": i === at ? "step" : null }, inner));
    })));
    return { el: el, head: head };
  }

  function sceneScreen(week) {
    const m = G.missions[week], st = G.state(), f = missionFrame(week, "scene"), passed = !!(st.quiz[week] || {}).passed, who = String(m.briefer || OWNER);
    const earn = gains(week);
    f.el.appendChild(h("div", { class: "sg-card sg-scene sg-narrow" },
      h("div", { class: "sg-briefer" }, h("span", { class: "sg-avatar", "aria-hidden": "true" }, who.charAt(0).toUpperCase()), h("div", null, h("b", null, who), h("small", null, "Mission " + week + " briefing"))),
      [].concat(m.scene || []).filter(Boolean).map((p) => h("p", null, String(p))),
      m.stakes ? h("div", { class: "note warn" }, h("b", null, "The stakes. "), String(m.stakes)) : null,
      h("div", { class: "sg-earn" }, medal(m, "small"), h("div", null, h("b", null, "To earn: " + (m.badge && m.badge.name ? m.badge.name : "a badge")),
        earn.length ? h("small", null, earn.join(" · ") + ", in the story") : null)),
      h("div", { class: "row sg-actions" }, passed ? h("button", { class: "primary sg-big", type: "button", onclick: () => jobScreen(week) }, "Go to the job")
        : h("button", { class: "primary sg-big", type: "button", onclick: () => quizScreen(week) }, questions(m).length === 3 ? "Three quick questions" : "On to the questions"))));
    arrive(f.head);
  }

  /* The questions. A wrong answer shows why and the player tries again. The first run is saved as it goes
     (a miss is a miss, even after a refresh). A later run is a fresh attempt that can only improve the record. */
  function quizScreen(week, again) {
    const m = G.missions[week], list = questions(m), st = G.state(), saved = st.quiz[week] || {}, retake = !!(again && saved.passed);
    let i = retake ? 0 : Math.min(whole(saved.n), list.length), missed = retake ? false : !!saved.missed;
    const record = (patch) => { const all = G.state().quiz; all[week] = Object.assign({ n: 0, missed: false, passed: false, firstTry: false }, all[week], patch); write("quiz", all); };
    const after = () => (G.state().done[week] ? completeScreen(week) : jobScreen(week));
    if (!list.length) { record({ passed: true, firstTry: true }); return jobScreen(week); }
    if (i >= list.length) { record({ n: list.length, passed: true, firstTry: !missed }); return after(); }
    const f = missionFrame(week, "quiz"), card = h("div", { class: "sg-card sg-quiz sg-narrow" });
    f.el.appendChild(card);
    function ask(focus) {
      const item = list[i]; let solved = false;
      const why = h("div", { class: "sg-why", role: "status", "aria-live": "polite" }), nextRow = h("div", { class: "row sg-actions" });
      const title = h("h2", { tabindex: "-1" }, String(item.q));
      const opts = item.options.map((text, k) => h("button", { class: "sg-opt", type: "button", onclick: () => pick(k) }, h("i", { "aria-hidden": "true" }, "ABCDEF".charAt(k) || String(k + 1)), h("span", null, String(text))));
      function pick(k) {
        const b = opts[k];
        if (solved || b.getAttribute("aria-disabled") === "true") return;
        why.innerHTML = "";
        if (k !== item.answer) {
          b.classList.add("wrong"); b.setAttribute("aria-disabled", "true"); missed = true;
          if (!retake) record({ missed: true });
          why.appendChild(h("div", { class: "note warn" }, h("b", null, "Not quite. "), String(item.why || ""), " Have another go."));
          return;
        }
        solved = true; b.classList.add("right");
        opts.forEach((o) => { if (o !== b) o.setAttribute("aria-disabled", "true"); });
        const last = i === list.length - 1;
        if (!retake) record(last ? { n: list.length, passed: true, firstTry: !missed } : { n: i + 1 });
        else if (last && !missed) record({ firstTry: true, missed: false });
        why.appendChild(h("div", { class: "note ok" }, h("b", null, "Right. "), String(item.why || "")));
        const on = h("button", { class: "primary sg-big", type: "button", onclick: () => { if (last) return after(); i++; ask(true); } }, last ? (G.state().done[week] ? "See your stars" : "On to the job") : "Next question");
        nextRow.appendChild(on);
        if (last) nextRow.appendChild(h("span", { class: "sg-small" }, missed ? "All three answered." : "All three right first time."));
        on.focus();
      }
      card.innerHTML = "";
      card.appendChild(h("div", { class: "sg-dots", "aria-hidden": "true" }, list.map((x, k) => h("i", { class: k < i ? "ok" : k === i ? "on" : "" }))));
      card.appendChild(h("div", { class: "kicker" }, "Question " + (i + 1) + " of " + list.length));
      card.appendChild(title);
      if (retake && i === 0) card.appendChild(h("p", { class: "sg-small" }, "A fresh attempt. All of them right first time earns the third star."));
      card.appendChild(h("div", { class: "sg-opts" }, opts));
      card.appendChild(why); card.appendChild(nextRow);
      if (focus) title.focus();
    }
    ask(false);
    arrive(f.head);
  }

  /* The job: the week's tool, drawn by the module itself, under an objectives panel that ticks itself. */
  function jobScreen(week) {
    const mod = OH.modules[week], f = missionFrame(week, "job", true), s = session(week);
    const count = h("span", { class: "sg-objcount" }), fill = h("div", { class: "sg-fill" }), list = h("ul", { class: "sg-objlist" });
    const upnext = h("div", { class: "sg-upnext" }), hint = h("span", { class: "sg-objhint" }), live = h("div", { class: "sg-sr", role: "status", "aria-live": "polite" });
    const finish = h("button", { class: "primary", type: "button", onclick: complete }, "Complete the mission");
    const toggle = h("button", { class: "small ghost", type: "button", "aria-expanded": "true", onclick: () => fold(!panel.classList.contains("folded")) }, "Hide");
    const panel = h("div", { class: "sg-obj" },
      h("div", { class: "sg-objhead" }, h("b", null, "Your objectives"), count, h("div", { class: "sg-track", "aria-hidden": "true" }, fill), toggle),
      list, upnext,
      h("div", { class: "sg-objfoot" }, finish, hint, h("span", { class: "spacer" }),
        twoStep({ label: "Start this job fresh", question: "Clear this job's work and go back to the sample data?", yesLabel: "Yes, start fresh", no: "Keep my work", yes: fresh })),
      live);
    const root = h("div", { class: "sg-toolroot" });
    const ctx = { week: week, session: s, redraw: () => { draw(); tick(); } };
    function fold(yes) { panel.classList.toggle("folded", yes); toggle.textContent = yes ? "Show" : "Hide"; toggle.setAttribute("aria-expanded", yes ? "false" : "true"); }
    function draw() {
      root.innerHTML = "";
      try { mod.render(root, ctx); } catch (e) { root.innerHTML = ""; root.appendChild(OH.note("This tool could not be drawn here. Open Week " + week + " from the links at the top, do the job there, and come back.", "warn")); }
    }
    function fresh() {
      try { if (mod.reset) mod.reset(); } catch (e) { /* keep clearing */ }
      OH.store.clear("w" + week + ":");
      const all = G.state().ticks; delete all[week]; write("ticks", all);
      OH.toast("Back to the sample data");
      jobScreen(week);
    }
    let seen = null, prior = null;                     // what the panel last drew, and which objectives were done then
    function tick() {
      const objs = objectives(week), st = G.state();
      const now = objs ? objs.map((o) => [o.id, o.done ? 1 : 0, o.required ? 1 : 0, o.label].join(":")).join("|") : "none";
      if (now === seen) return;
      const before = prior;
      seen = now; prior = {}; (objs || []).forEach((o) => { prior[o.id] = o.done; });
      list.innerHTML = "";
      if (!objs) {                                     // this week's module has no objectives() yet
        list.appendChild(h("li", { class: "sg-nochecks" }, "This mission's checks are not ready yet. Do the job below, then mark it complete yourself."));
        count.textContent = ""; fill.style.width = "0%"; upnext.textContent = "Checks not ready: mark it complete yourself.";
        finish.textContent = "Mark the mission complete"; finish.disabled = false; hint.textContent = "Marked by hand, this mission earns two stars.";
        panel.classList.add("ready"); return;
      }
      const req = objs.filter((o) => o.required), left = req.filter((o) => !o.done), extra = objs.filter((o) => !o.required && !o.done), newly = [];
      objs.forEach((o) => {
        const isNew = !!(before && o.done && !before[o.id]); if (isNew) newly.push(o.label);
        list.appendChild(h("li", { class: "sg-o" + (o.done ? " done" : "") + (o.required ? "" : " bonus") + (isNew ? " just" : "") },
          h("span", { class: "sg-tick", "aria-hidden": "true" }, check()), h("span", null, o.label),
          o.required ? null : h("span", { class: "sg-tag" }, "bonus"), h("span", { class: "sg-sr" }, o.done ? " (done)" : " (to do)")));
      });
      count.textContent = (req.length - left.length) + " of " + req.length;
      fill.style.width = share(req.length - left.length, req.length) + "%";
      finish.textContent = "Complete the mission"; finish.disabled = left.length > 0;
      panel.classList.toggle("ready", !left.length);
      const first = (st.quiz[week] || {}).firstTry;
      hint.textContent = left.length ? left.length + (left.length === 1 ? " objective to go." : " objectives to go.")
        : !first ? "Ready: two stars. The third needs all three questions right first time."
        : extra.length ? "Ready: two stars. The bonus " + (extra.length === 1 ? "objective earns" : "objectives earn") + " the third."
        : "Ready: three stars.";
      upnext.textContent = left.length ? "Next: " + left[0].label : extra.length ? "Bonus: " + extra[0].label : "Everything is done.";
      if (newly.length) live.textContent = "Done: " + newly.join(". ");
    }
    function complete() {
      const objs = objectives(week), st = G.state(), had = st.done[week], got = starsFor(week, objs, st);
      if (!got) return tick();
      const was = { n: doneCount(st), totals: totals(st) }, done = st.done;
      done[week] = { stars: Math.max(got, had ? whole(had.stars) : 0), at: (had && had.at) || new Date().toISOString() };
      if (!objs) done[week].byHand = true;
      write("done", done);
      completeScreen(week, { celebrate: true, was: had ? null : was });
    }
    function place() { const top = document.querySelector(".top"); panel.style.top = ((top && top.offsetHeight) || 54) + 8 + "px"; }

    f.el.appendChild(h("div", { class: "sg-job" }, panel,
      h("div", { class: "sg-toolhead" }, h("div", { class: "kicker" }, "The job · week " + week + "'s tool"), h("h2", null, mod.title || s.tool),
        mod.intro ? h("p", { class: "lead" }, mod.intro) : null,
        OH.runbooks && OH.runbooks[week] ? h("p", { class: "sg-small" }, "Not sure where to start? Press Runbook at the top for the walk-through.") : null),
      root));
    if (window.matchMedia && window.matchMedia("(max-width: 700px)").matches) fold(true);
    draw(); tick(); place();
    onResize = place; window.addEventListener("resize", place);
    poll = setInterval(tick, 1000);                    // a module needs no changes beyond objectives()
    arrive(f.head);
  }

  /* Mission complete. `o.celebrate` plays the moment; `o.was` makes the meters count up from before. */
  function completeScreen(week, o) {
    o = o || {};
    let st = G.state(); const m = G.missions[week], objs = objectives(week);
    if (!st.done[week]) return missionScreen(week);
    const earned = starsFor(week, objs, st);
    if (earned > whole(st.done[week].stars)) {          // the third star, earned since: the bonus objectives or a clean run at the questions
      const done = st.done; done[week].stars = earned; if (objs) delete done[week].byHand; write("done", done); st = G.state(); o.celebrate = true;
    }
    const d = st.done[week], n = whole(d.stars), f = missionFrame(week, "complete"), next = week + 1, earn = gains(week);
    const allHere = available().every((w) => st.done[w]), first = (st.quiz[week] || {}).firstTry, open = objs ? objs.filter((x) => !x.done) : [];
    const need = [];
    if (n < 3) {
      if (!objs) need.push("This mission's checks are not ready yet, so the third star has to wait for them.");
      else {
        if (open.length) need.push("Still open in the job: " + open.map((x) => x.label).join("; ") + ".");
        if (!first) need.push("Answer all three questions right first time.");
      }
    }
    const card = h("div", { class: "sg-card sg-win sg-narrow" + (o.celebrate ? " sg-new" : "") },
      h("div", { class: "sg-winmedal" }, h("span", { class: "sg-ring", "aria-hidden": "true" }), o.celebrate ? burst() : null, medal(m, "big")),
      h("div", { class: "kicker" }, "Mission " + week + " complete"),
      h("h2", { class: "sg-wintitle" }, m.badge && m.badge.name ? "Badge earned: " + m.badge.name : "Mission complete"),
      stars(n, true),
      h("p", { class: "sg-small" }, n >= 3 ? "Three stars: every objective, and every question right first time." : "Two stars: the job is done. The third is still there to win."),
      need.length ? h("ul", { class: "sg-need" }, need.map((x) => h("li", null, x))) : null,
      n < 3 ? h("div", { class: "row sg-center" },
        open.length || !objs ? h("button", { class: "small", type: "button", onclick: () => jobScreen(week) }, "Open the job again") : null,
        objs && !first ? h("button", { class: "small", type: "button", onclick: () => quizScreen(week, true) }, "Answer the questions again") : null) : null);
    f.el.appendChild(card);
    f.el.appendChild(h("div", { class: "sg-narrow sg-after" + (o.celebrate ? " sg-new" : "") },
      h("h2", { class: "sg-h" }, "Greenline's numbers"),
      earn.length ? h("p", { class: "sg-small" }, "This mission: " + earn.join(" · ") + ", in the story.") : null,
      statusStrip(st, o.was || null, 1100),
      h("div", { class: "sg-card sg-debrief" }, h("div", { class: "kicker" }, "Debrief"), [].concat(m.debrief || []).filter(Boolean).map((x) => h("p", null, String(x)))),
      m.next && week < TOTAL ? h("p", { class: "sg-teaser" }, String(m.next)) : null,
      !inCopy(next) && week < TOTAL ? h("p", { class: "sg-small" }, "Mission " + next + " " + arrives(next, true) + ".") : null,
      h("div", { class: "row sg-actions" },
        inCopy(next) ? h("a", { class: "btn primary sg-big", href: "#/game/m" + next }, "On to mission " + next)
          : allHere ? h("a", { class: "btn primary sg-big", href: "#/game/done" }, week >= TOTAL ? "See the whole business" : "See how far you have come") : null,
        h("a", { class: "btn", href: "#/game" }, "Back to the map"))));
    arrive(f.head);
  }
  function burst() {                                   // sixteen small squares that fly out from the badge: CSS does the moving
    const colors = ["var(--blue)", "var(--violet)", "var(--cyan)", "#f2a900"];
    return h("span", { class: "sg-burst", "aria-hidden": "true" }, Array.from({ length: 16 }, (x, i) =>
      h("i", { style: "--a:" + (i * 22.5 + (i % 2 ? 8 : -6)) + "deg;--d:" + (96 + (i * 37) % 60) + "px;--c:" + colors[i % 4] + ";animation-delay:" + (0.2 + (i % 4) * 0.06).toFixed(2) + "s" })));
  }

  // ── the final screen: the whole business, the numbers, the certificate ──
  function finalScreen() {
    const st = G.state(), have = available(), left = have.filter((w) => !st.done[w]), n = doneCount(st), full = n >= TOTAL, soon = nextArrival();
    const el = newScreen("sg-final");
    if (!have.length || left.length) {
      const head = h("h1", { tabindex: "-1" }, "Not there yet");
      el.appendChild(h("div", { class: "sg-card sg-narrow" }, h("div", { class: "kicker" }, GAME), head,
        h("p", { class: "lead" }, have.length ? left.length + (left.length === 1 ? " mission" : " missions") + " to go in this copy. The final screen opens when they are done." : "This copy has no missions yet."),
        h("a", { class: "btn primary sg-big", href: "#/game" }, "Back to the map")));
      return arrive(head);
    }
    const head = h("h1", { tabindex: "-1" }, full ? "Greenline runs itself" : "Greenline so far");
    el.appendChild(h("div", { class: "kicker" }, GAME + " · " + (full ? "all eight missions complete" : n + " of " + TOTAL + " missions complete")));
    el.appendChild(head);
    el.appendChild(h("p", { class: "lead" }, full ? "Eight broken parts of the business, fixed one job at a time. " + OWNER + " has the evenings back."
      : "Every mission in this copy is done. Here is the business as it stands today."));
    if (!full && soon) el.appendChild(OH.note("Mission " + soon + " " + arrives(soon, true) + ". Your stars are saved in this browser until then.", "blue"));

    el.appendChild(h("h2", { class: "sg-h" }, "The whole business on one screen"));
    el.appendChild(h("div", { class: "grid g4" }, have.map((w) => {
      let x = null; try { x = OH.modules[w].summary && OH.modules[w].summary(); } catch (e) { x = null; }
      return x ? OH.stat(x.label, x.value, "Week " + w + " · " + session(w).tool, x.tone) : OH.stat(session(w).tool, "Done", "Week " + w, "ok");
    })));

    const got = have.reduce((a, w) => a + whole(st.done[w].stars), 0);
    el.appendChild(h("h2", { class: "sg-h" }, "Greenline's numbers"));
    el.appendChild(h("div", { class: "row sg-rankrow" }, h("div", { class: "sg-rank" }, h("small", null, "Your rank"), h("b", null, rank(n))),
      h("div", { class: "sg-rank" }, h("small", null, "Stars"), h("b", null, got + " of " + have.length * 3))));
    el.appendChild(statusStrip(st));

    const when = have.map((w) => st.done[w].at).filter(Boolean).sort().pop(), date = new Date(when || Date.now());
    const shown = (isNaN(date) ? new Date() : date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    const who = h("div", { class: "sg-certname" }, st.name || "The new office manager");
    const cert = h("div", { class: "sg-cert" }, h("div", { class: "sg-certin" }, emblem(),
      h("div", { class: "sg-certk" }, full ? "Certificate of completion" : "Certificate of progress"),
      h("div", { class: "sg-certsmall" }, "This is to say that"), who,
      h("div", { class: "sg-certsmall" }, full ? "took the keys to " + C.business.name + " and gave the owner the evenings back." : "took the keys to " + C.business.name + " and is putting the office in order."),
      h("div", { class: "sg-certbig" }, GAME + ": " + (full ? "eight missions complete" : n + " of " + TOTAL + " so far")),
      h("div", { class: "sg-certrow" }, got + " of " + have.length * 3 + " stars · " + rank(n)),
      h("div", { class: "sg-certfoot" }, shown + " · " + C.series + ", a free live class by Mitchell B Consulting"),
      h("div", { class: "sg-certnote" }, C.business.name + " is a made-up company. The jobs are real practice.")));
    const name = h("input", { type: "text", id: "sg-certinput", maxlength: "40", autocomplete: "off", placeholder: "Your name", value: st.name,
      oninput: () => { const v = name.value.trim(); write("name", v); who.textContent = v || "The new office manager"; } });
    const text = (full ? "I finished " + GAME + ": eight missions where you fix a made-up landscaping company's busywork with AI, one real job at a time."
      : "I am " + n + " of " + TOTAL + " missions into " + GAME + ", a game where you fix a made-up landscaping company's busywork with AI, one real job at a time.")
      + " It comes from " + C.series + ", a free live class for people who run a small business. Come and play along: " + C.subscribe;
    el.appendChild(h("h2", { class: "sg-h" }, "Your certificate"));
    el.appendChild(h("div", { class: "sg-certwrap" },
      h("div", { class: "sg-certtools" }, h("label", { class: "f", for: "sg-certinput" }, "Name on the certificate"), name), cert,
      h("div", { class: "row sg-actions sg-center" }, h("button", { class: "primary", type: "button", onclick: printCertificate }, "Print the certificate"),
        h("button", { type: "button", onclick: () => OH.copy(text, "Copied") }, "Copy something to share"), h("a", { class: "btn", href: "#/game" }, "Back to the map")),
      h("div", { class: "sg-share" }, h("div", { class: "kicker" }, "What gets copied"), h("p", null, text))));
    arrive(head);
  }
  /* Print only the certificate: a class on <body> switches the print styles on, and comes off again afterwards. */
  function printCertificate() {
    const off = () => { document.body.classList.remove("sg-printing"); window.removeEventListener("afterprint", off); };
    document.body.classList.add("sg-printing");
    window.addEventListener("afterprint", off);
    window.print();
    if (!("onafterprint" in window)) off();
  }

  // ── what the shell calls ──
  /* Draw the game into `root`. `path` is what follows #/game/ : "" (title or map), "title", "m3", "done". */
  G.render = function (root, path) {
    V = root;
    const m = /^m(\d+)$/.exec(path || "");
    if (m) return missionScreen(+m[1]);
    if (path === "done") return finalScreen();
    if (path === "title" || !G.state().started) return titleScreen();
    mapScreen();
  };
  /* The invitation on the home screen. */
  G.homeEntry = function () {
    const st = G.state(), n = doneCount(st);
    return h("a", { class: "sg-home", href: "#/game" }, emblem(),
      h("span", { class: "sg-hometext" }, h("span", { class: "kicker" }, "Optional · the course as a game"), h("b", null, "Play it as a game: " + GAME),
        h("small", null, st.started ? n + " of " + TOTAL + " missions complete · " + rank(n) + ". Pick up where you left off."
          : OWNER + " has handed you the keys to the office. Eight missions, one a week, each a real job in that week's tool.")),
      h("span", { class: "btn primary sg-cta" }, st.started ? "Continue" : "Play"));
  };
})();
