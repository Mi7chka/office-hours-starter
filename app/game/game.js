/* Save Greenline: The Case of the Busywork Bandits · the engine, in Agent Mode.
   A cartoon adventure that teaches the same ideas as the eight weekly tools, and changes nothing in
   them. The player IS Greenline's new AI agent: they log in, see every scene through the agent's
   visor, learn one piece of knowledge at a time, and level up. It runs in a full-window stage of its
   own (the app's header and footer are hidden while it is on) and has three addresses:
     #/game        the entrance (splash, title, agent login, boot sequence), then the town map
     #/game/mN     case N: briefing, three places to learn from, the plan, the showdown, the handoff, caught
     #/game/done   the finale: the town in color, the bandits in the net, the badge, the certificate

   The files:  art.js draws everything · sound.js makes every sound · kit.js is the toolbox a screen
   or a mini-game is handed · this file runs the story · missions/mN.js is one case each.
   Everything saved sits under "game:" keys in OH.store, in this browser only. The agent's name is a
   display name and nothing more: the game never asks for a password, an email or anything personal.
   GAME.md is the guide for mission authors. */
(function () {
  "use strict";
  if (!window.OH || !OH.course || !OH.game || !OH.game.art || !OH.game.makeKit) return;
  const h = OH.h, C = OH.course, G = OH.game, A = G.art, S = G.sound;
  const WEEKS = C.sessions.map((s) => s.week), TOTAL = WEEKS.length;
  const BOSS = String(C.business.owner || "The owner"), OWNER = BOSS.split(" ")[0], TOWN = C.business.town || "Cedar Hollow", BIZ = C.business.name || "Greenline";
  const GAME = "Save Greenline", SUB = "The Case of the Busywork Bandits";
  const RULE = "Nothing goes out until a person approves it.";

  /* The story bible as data: one bandit a case, each holding one part of town until it is caught.
     `key` is the character in art.js, `zone` the place that stays gray, `icon` and `color` the sticker. */
  const BANDITS = (G.bandits = {
    1: { key: "clutter", zone: "hq", icon: "envelope", color: A.C.green },
    2: { key: "slowpoke", zone: "grind", icon: "bolt", color: A.C.teal },
    3: { key: "mumbles", zone: "square", icon: "sign", color: A.C.orange },
    4: { key: "hideseek", zone: "park", icon: "pin", color: A.C.red },
    5: { key: "blankpage", zone: "post", icon: "pencil", color: A.C.blue },
    6: { key: "ghoster", zone: "garden", icon: "chat", color: A.C.purple },
    7: { key: "doubletrouble", zone: "bank", icon: "coins", color: A.C.pink },
    8: { key: "chaos", zone: "workshop", icon: "shield", color: A.C.sun }
  });

  /* The agent grows like a character in a life sim: skills fed by knowledge. One skill for each week's
     subject, and one that runs through every case: Judgment. */
  const SKILLS = (G.skills = [
    { key: "w1", week: 1, name: "AI at Work", icon: "envelope", color: A.C.green, about: "What I am quick at, and where I need a person." },
    { key: "w2", week: 2, name: "Automation", icon: "bolt", color: A.C.teal, about: "When this happens, do that, and tell a person." },
    { key: "w3", week: 3, name: "Websites", icon: "sign", color: A.C.orange, about: "A home page gets three seconds." },
    { key: "w4", week: 4, name: "Getting Found", icon: "pin", color: A.C.red, about: "The map, the search, and plain answers." },
    { key: "w5", week: 5, name: "Marketing", icon: "pencil", color: A.C.blue, about: "One real idea, many pieces." },
    { key: "w6", week: 6, name: "Leads", icon: "chat", color: A.C.purple, about: "Every lead has a next step and a date." },
    { key: "w7", week: 7, name: "Data", icon: "coins", color: A.C.pink, about: "Clean rows first. Then count." },
    { key: "w8", week: 8, name: "Support and Security", icon: "shield", color: A.C.sun, about: "Stay calm, lock the doors, know who to call." },
    { key: "judgment", week: 0, name: "Judgment", icon: "eye", color: "#7dfbff", about: "Asking before sending. Catching the wrong shortcut." }
  ]);
  const skillOf = (key) => SKILLS.find((s) => s.key === key) || SKILLS[0];
  /* Ten levels. Each one has a plain title and a permission the owner now trusts the agent with.
     `at` is the total experience that reaches it. */
  const LEVELS = (G.levels = [
    { at: 0, title: "New Agent", perm: "Read the inbox" },
    { at: 30, title: "Trainee", perm: "Sort and label" },
    { at: 90, title: "Helper", perm: "Draft replies" },
    { at: 170, title: "Assistant", perm: "Carry new leads to the sheet" },
    { at: 260, title: "Trusted Assistant", perm: "Draft the website words" },
    { at: 360, title: "Specialist", perm: "Check the map listing" },
    { at: 470, title: "Senior Agent", perm: "Plan a week of posts" },
    { at: 580, title: "Lead Agent", perm: "Draft the follow-ups" },
    { at: 690, title: "Office Chief", perm: "Tidy the numbers" },
    { at: 800, title: "Greenline's Right Hand", perm: "Run the bad-day checklist" }
  ]);
  /* What earns experience, by case. Each line is kept as a best-so-far count, so playing a case again
     can only add to it. The first three feed the week's skill, the last three feed Judgment.
       clues  pieces of knowledge learned (3)            sharp  quick challenges solved with no wrong pick (3)
       stars  the case's stars (3)                       plan   picked the plan (1), on the first try (2)
       catch  caught Sprout's wrong shortcut (1), first try (2)   ask  handed the work over (1), without trying to send it (2) */
  const PTS = { clues: 10, sharp: 5, stars: 10, plan: 5, catch: 10, ask: 5 }, CAP = { clues: 3, sharp: 3, stars: 3, plan: 2, catch: 2, ask: 2 };
  const WHY = { clues: "learned", sharp: "first try", stars: "stars", plan: "the right plan", catch: "caught the wrong shortcut", ask: "asked before sending" };
  const SKILL_MAX = CAP.clues * PTS.clues + CAP.sharp * PTS.sharp + CAP.stars * PTS.stars, JUDGE_MAX = CAP.plan * PTS.plan + CAP.catch * PTS.catch + CAP.ask * PTS.ask;

  // ── saved state, all under "game:" ──
  //    game:sound    "on" or "off" (sound.js)            game:v      2 once an older save has been brought forward
  //    game:agent    {id, name, look, lv, since}         the agent who is logged in. lv: the last level they were shown
  //    game:started  true once this agent has begun      game:name   the name on the certificate
  //    game:done     {week: {stars, at, last, v}}        a solved case; stars is the best so far
  //    game:run      {week: {phase, stops, sharp, wrong, sprout, at}}   a case in progress
  //    game:xp       {week: {clues, sharp, stars, plan, catch, ask}}    what has earned experience, best so far
  //    game:slots    {id: {agent, started, name, done, run, xp}}        the other agents on this computer
  //    game:real     {week: true}                        the bonus sticker: did the job in the real tool
  const KEY = "game:", PER = ["agent", "started", "name", "done", "run", "xp"];
  const read = (k, d) => OH.store.get(KEY + k, d), write = (k, v) => OH.store.set(KEY + k, v);
  const asMap = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const whole = (v) => Math.max(0, Math.round(Number(v) || 0));
  G.state = () => ({ name: String(read("name", "") || ""), started: !!read("started", false), done: asMap(read("done", {})), run: asMap(read("run", {})), real: asMap(read("real", {})) });

  // ── missions ──
  const raw = (G.missions = G.missions || {}), cache = {};
  /* A mission file calls this once. */
  G.mission = function (data) { if (data && WEEKS.indexOf(+data.week) >= 0) { raw[+data.week] = data; delete cache[+data.week]; } };
  /* The mission, with the story bible's defaults filled in. A file with no stops or no showdown is
     not a case: it shows on the map as one that has not arrived yet. */
  function mission(w) {
    if (cache[w]) return cache[w];
    const m = raw[w];
    if (!m || !Array.isArray(m.stops) || !m.showdown) return null;
    const b = BANDITS[w] || BANDITS[1], r = m.reward || {};
    return (cache[w] = Object.assign({ bandit: b.key, zone: b.zone, maxWrong: 3 }, m, { week: w,
      badge: Object.assign({ name: "Case " + w, icon: b.icon, color: b.color }, m.badge), reward: { hours: whole(r.hours), leads: whole(r.leads), money: whole(r.money) } }));
  }
  const session = (w) => C.sessions.find((s) => s.week === w) || {};
  const inCopy = (w) => !!(OH.modules[w] && mission(w));              // the week's tool and its case are both in this copy
  const isOpen = (w, st) => inCopy(w) && (w === WEEKS[0] || !!st.done[w - 1]);
  const doneCount = (st) => WEEKS.filter((w) => st.done[w]).length;
  const arrives = (w) => (session(w).date ? OH.niceDate(session(w).date) : "soon");

  // ── the agent: who the player is ──
  const LOOKS = A.agentLooks, NAMES = ["Ivy", "Pip", "Juno", "Moss", "Nova", "Remy", "Tansy", "Bolt"], MAX_AGENTS = 4;
  const lookKey = (v) => (LOOKS.some((l) => l.key === v) ? v : LOOKS[0].key);
  const cleanName = (v) => String(v == null ? "" : v).replace(/[{}<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 14);
  const asAgent = (v) => { const a = asMap(v), name = cleanName(a.name); return name ? { id: String(a.id || "a1"), name: name, look: lookKey(a.look), lv: Math.max(1, whole(a.lv)), since: String(a.since || "") } : null; };
  const agent = () => asAgent(read("agent", null));
  /* The number on the badge: a story number made from the agent's own id, so it stays the same. */
  const badgeNo = (a) => { let n = 7; String(a.id + a.name).split("").forEach((c) => { n = (n * 31 + c.charCodeAt(0)) % 9000; }); return "GL-" + (1000 + n); };
  function sync() { const a = agent(); if (a) A.setAgent(a.look, a.name); return a; }

  // ── experience: a ledger of what each case has taught, and what it adds up to ──
  const entry = (e) => { e = asMap(e); const o = {}; Object.keys(CAP).forEach((k) => { o[k] = Math.min(CAP[k], whole(e[k])); }); return o; };
  const ledgerOf = (x) => { x = asMap(x); const o = {}; WEEKS.forEach((w) => { o[w] = entry(x[w]); }); return o; };
  const points = (e) => ({ skill: e.clues * PTS.clues + e.sharp * PTS.sharp + e.stars * PTS.stars, judgment: e.plan * PTS.plan + e.catch * PTS.catch + e.ask * PTS.ask });
  /* Where an agent stands: experience by skill, the total, the level, and how far the next one is. */
  function standing(xp) {
    const led = ledgerOf(xp === undefined ? read("xp", {}) : xp), skills = { judgment: 0 }; let total = 0, level = 1;
    WEEKS.forEach((w) => { const p = points(led[w]); skills["w" + w] = p.skill; skills.judgment += p.judgment; total += p.skill + p.judgment; });
    LEVELS.forEach((L, i) => { if (total >= L.at) level = i + 1; });
    const cur = LEVELS[level - 1], nxt = LEVELS[level] || null;
    return { skills: skills, total: total, level: level, title: cur.title, perm: cur.perm, next: nxt ? nxt.at : null, nextTitle: nxt ? nxt.title : "",
      fill: nxt ? Math.round((total - cur.at) / (nxt.at - cur.at) * 100) : 100 };
  }
  const skillMax = (s) => (s.week ? SKILL_MAX : JUDGE_MAX * TOTAL);
  const skillLevel = (s, xp) => Math.min(5, Math.floor(xp / (skillMax(s) / 5)));
  /* Record what a case has just taught. Returns the gains to show: [{skill, n, why}]. */
  function award(w, patch) {
    const all = asMap(read("xp", {})), before = entry(all[w]), after = Object.assign({}, before), gains = [];
    Object.keys(patch).forEach((k) => { if (CAP[k]) after[k] = Math.max(before[k], Math.min(CAP[k], whole(patch[k]))); });
    all[w] = after; write("xp", all);
    Object.keys(CAP).forEach((k) => { const n = (after[k] - before[k]) * PTS[k]; if (n > 0) gains.push({ skill: k === "clues" || k === "sharp" || k === "stars" ? "w" + w : "judgment", n: n, why: WHY[k] }); });
    return gains;
  }
  /* A save from before Agent Mode has stars and clues but no ledger. Work out what it had earned, so
     nobody starts again from zero. Runs once: "game:v" remembers. */
  function migrate() {
    if (whole(read("v", 0)) >= 2) return;
    const done = asMap(read("done", {})), run = asMap(read("run", {})), all = asMap(read("xp", {}));
    WEEKS.forEach((w) => {
      const d = asMap(done[w]), r = asMap(run[w]), e = entry(all[w]);
      if (done[w] && d.v !== 2) {
        const stars = Math.min(3, Math.max(1, whole(d.stars))), last = asMap(d.last), clean = !!d.last && whole(last.wrong) === 0;
        e.clues = 3; e.stars = Math.max(e.stars, stars); e.catch = Math.max(e.catch, stars >= 3 || last.sprout === true ? 2 : 1);
        e.plan = Math.max(e.plan, clean ? 2 : 1); e.sharp = Math.max(e.sharp, clean ? 3 : 0); e.ask = 2;
      } else if (run[w]) {
        e.clues = Math.max(e.clues, Math.min(3, (Array.isArray(r.stops) ? r.stops : []).filter(Boolean).length));
        if (r.phase === "showdown") e.plan = Math.max(e.plan, 1);
      }
      if (points(e).skill + points(e).judgment > 0) all[w] = e;
    });
    write("xp", all); write("v", 2);
  }

  // ── more than one agent on a computer: the one logged in lives in the keys above, the rest wait in "slots" ──
  const slots = () => asMap(read("slots", {}));
  function stash() { const a = agent(); if (!a) return; const all = slots(), snap = {}; PER.forEach((k) => { const v = read(k, null); if (v != null) snap[k] = v; }); all[a.id] = snap; write("slots", all); }
  function unload() { PER.forEach((k) => OH.store.clear(KEY + k)); }
  function loadAgent(id) { const snap = asMap(slots()[id]); if (!asAgent(snap.agent)) return; stash(); unload(); PER.forEach((k) => { if (snap[k] != null) write(k, snap[k]); }); const all = slots(); delete all[id]; write("slots", all); sync(); }
  function removeAgent(id) { const a = agent(); if (a && a.id === id) unload(); const all = slots(); delete all[id]; write("slots", all); }
  /* Make a new agent and log it in. The very first agent on an older save takes that save's progress. */
  function createAgent(name, look) {
    if (agent()) { stash(); unload(); }
    const a = { id: "a" + Date.now().toString(36), name: cleanName(name) || NAMES[0], look: lookKey(look), lv: standing().level, since: new Date().toISOString() };
    write("agent", a); sync(); return a;
  }
  /* Every agent on this computer, the one logged in first. */
  function roster() {
    const a = agent(), all = slots(), list = [];
    const row = (ag, xp, done, here) => { const s = standing(xp); return { id: ag.id, name: ag.name, look: ag.look, level: s.level, title: s.title, cases: WEEKS.filter((w) => asMap(done)[w]).length, here: here }; };
    if (a) list.push(row(a, read("xp", {}), read("done", {}), true));
    Object.keys(all).forEach((id) => { const ag = asAgent(asMap(all[id]).agent); if (ag && (!a || ag.id !== a.id)) list.push(row(ag, all[id].xp, all[id].done, false)); });
    return list;
  }

  // ── the story meters: made-up numbers for a made-up company, always labelled as story numbers ──
  const count = (n) => whole(n).toLocaleString("en-US");              // 8,775: no dollar sign. The label says dollars.
  const METERS = [
    { key: "hours", label: "Hours of busywork saved each week", icon: "clock", fmt: String, gain: (n) => "+" + n + (n === 1 ? " hour" : " hours") + " of busywork saved each week" },
    { key: "leads", label: "Leads answered", icon: "chat", fmt: String, gain: (n) => "+" + n + (n === 1 ? " lead answered" : " leads answered") },
    { key: "money", label: "Dollars found", icon: "coins", fmt: count, gain: (n) => "+" + count(n) + (n === 1 ? " dollar found" : " dollars found") }
  ];
  function totals(st) { const t = { hours: 0, leads: 0, money: 0 }; WEEKS.forEach((w) => { const m = st.done[w] && mission(w); if (m) METERS.forEach((x) => { t[x.key] += m.reward[x.key]; }); }); return t; }
  const gains = (m) => METERS.filter((x) => m.reward[x.key] > 0).map((x) => x.gain(m.reward[x.key]));
  /* The bonus sticker. Read only: asks the week's tool whether its required objectives are done. */
  function didForReal(w) {
    const st = G.state(); if (st.real[w]) return true;
    const mod = OH.modules[w]; if (!mod || typeof mod.objectives !== "function") return false;
    try { const req = (mod.objectives() || []).filter((o) => o && o.required !== false); if (req.length && req.every((o) => !!o.done)) { st.real[w] = true; write("real", st.real); return true; } } catch (e) { /* the tool is fine without the game */ }
    return false;
  }

  // ── a case in progress ──
  function getRun(w) { const r = asMap(G.state().run[w]); return { phase: r.phase || "briefing", stops: Array.isArray(r.stops) ? r.stops : [], sharp: Array.isArray(r.sharp) ? r.sharp : [], wrong: whole(r.wrong), sprout: typeof r.sprout === "boolean" ? r.sprout : null, at: r.at || "hq" }; }
  function setRun(w, patch) { const all = G.state().run; all[w] = Object.assign(getRun(w), patch); write("run", all); return all[w]; }
  function endRun(w) { const all = G.state().run; delete all[w]; write("run", all); }
  const tally = (list) => list.filter(Boolean).length;
  /* Up to three stars: the case is closed · Sprout's wrong shortcut caught on the first try · few wrong picks. */
  function closeCase(w) {
    const m = mission(w), r = getRun(w), st = G.state(), had = st.done[w];
    const stars = 1 + (r.sprout === true ? 1 : 0) + (r.wrong <= m.maxWrong ? 1 : 0);
    st.done[w] = { stars: Math.max(stars, had ? whole(had.stars) : 0), at: (had && had.at) || new Date().toISOString(), last: { stars: stars, wrong: r.wrong, sprout: r.sprout === true }, v: 2 };
    write("done", st.done); endRun(w);
    return { stars: stars, best: st.done[w].stars, first: !had, wrong: r.wrong, sprout: r.sprout === true };
  }
  /* The task line in the visor: what the owner wants from the agent right now. */
  function taskFor(w, phase) {
    const m = mission(w), who = A.cast[m.bandit].name;
    if (phase === "briefing") return "Listen up. I have a job for you.";
    if (phase === "stops") return (m.task || "Learn three things, then stop " + who + ".") + " " + tally(getRun(w).stops) + " of " + m.stops.length + " learned.";
    if (phase === "crack") return "Pick the plan that stops " + who + ".";
    if (phase === "showdown") return m.showdown.task || "Do the job. Then check Sprout's shortcut.";
    if (phase === "handoff") return "Bring me your work before anything goes out.";
    return "Case closed. Good work.";
  }

  // ── the stage, and the visor the agent sees it through ──
  let host = null, root = null, hud = null, stage = null, floats = null, kit = null;
  let entered = false;                                 // has the entrance been passed on this visit?
  let party = 0, burst = false;                        // a case just closed: the truck drives home, and a first win plays the color back
  let hudTimer = null, hudPips = null, hudChip = null;

  function mount(view) {
    host = view;
    if (root && root.parentNode === host) return;
    hud = h("div", { class: "sg-hud" }); stage = h("div", { class: "sg-stage" });
    floats = h("div", { class: "sg-floats", role: "status", "aria-live": "polite" });
    /* the visor: four corner brackets and a soft edge over every scene, so it reads as seen through the agent's eyes */
    const visor = h("div", { class: "sg-visor", "aria-hidden": "true" }, h("i"), h("i"), h("i"), h("i"), h("span", { class: "sg-visor-tag" }, "Agent view"));
    root = h("div", { class: "sg" }, A.defs(), hud, h("div", { class: "sg-view" }, stage, visor), floats);
    host.appendChild(root); document.body.classList.add("sg-on");
  }
  /* Start a new screen: the old screen's kit is destroyed, the stage is emptied, a new kit comes back. */
  function screen(name, o) {
    o = o || {};
    if (kit) kit.destroy();
    root.querySelectorAll(".sg-modal, .sg-confetti").forEach((n) => n.remove());
    stage.innerHTML = ""; stage.className = "sg-stage sg-s-" + name;
    root.classList.toggle("sg-fp", !o.bare || !!o.visor);                    // first person: the visor is on
    root.setAttribute("data-screen", name);
    const w = o.week || 0;
    kit = G.makeKit(stage, { week: w, mission: w ? mission(w) : null,
      agent: () => { const a = agent(), s = standing(); return a ? { name: a.name, look: a.look, level: s.level, title: s.title } : null; },
      wrong: () => { if (w) setRun(w, { wrong: getRun(w).wrong + 1 }); },
      sprout: (first) => { if (!w || getRun(w).sprout !== null) return; setRun(w, { sprout: first }); showGains(award(w, { catch: first ? 2 : 1 })); },
      timer: (text) => { if (hudTimer) { hudTimer.textContent = text; hudTimer.hidden = !text; hud.classList.toggle("sg-timing", !!text); } } });
    drawHud(o);
    return kit;
  }
  function go(hash) { if ((location.hash || "") === hash) G.render(host, hash.replace(/^#\/game\/?/, "")); else location.hash = hash; }
  const iconBtn = (icon, label, fn, cls) => h("button", { class: "sg-hudbtn" + (cls ? " " + cls : ""), type: "button", title: label, "aria-label": label, onclick: fn }, A.icon(icon), h("span", null, label));
  function soundBtn() {
    const b = iconBtn("sound", "Sound", () => { S.mute(!S.muted()); if (!S.muted()) { S.unlock(); if (entered && !S.playing()) S.music(true); S.play("pop"); } paint(); });
    const paint = () => { b.innerHTML = ""; b.appendChild(A.icon(S.muted() ? "mute" : "sound")); b.appendChild(h("span", null, S.muted() ? "Sound off" : "Sound on")); b.setAttribute("aria-pressed", S.muted() ? "false" : "true"); b.title = S.muted() ? "Turn the sound on" : "Turn the sound off"; };
    paint(); return b;
  }
  function starsEl(n, cls) { return h("span", { class: "sg-stars" + (cls ? " " + cls : ""), role: "img", "aria-label": n + " of 3 stars" }, [1, 2, 3].map((i) => h("i", { class: i <= n ? "sg-on" : "" }, A.icon("star", { color: i <= n ? A.C.sun : "#d9d5e8" })))); }
  const xpBar = (s, cls) => h("span", { class: "sg-xp" + (cls ? " " + cls : ""), role: "img", "aria-label": s.next ? s.total + " of " + s.next + " experience" : s.total + " experience, top level" }, h("i", { style: "width:" + s.fill + "%" }));
  /* The agent in the HUD: face, name, level and experience bar. It is a button: it opens the Skills panel. */
  function agentChip() {
    const a = agent(), s = standing();
    return h("button", { class: "sg-chipbtn sg-bookbtn", type: "button", title: "My skills", "aria-label": "Agent " + a.name + ". Level " + s.level + ", " + s.title + ". Open my skills.", onclick: () => skillsPanel() },
      h("span", { class: "sg-chipface" }, A.avatar("agent", { mood: "happy" })),
      h("span", { class: "sg-chiptext" }, h("b", null, a.name), h("small", null, "Lv " + s.level), h("em", null, s.title)), xpBar(s));
  }
  function refreshChip() { if (!hudChip || !hudChip.parentNode || !agent()) return; const next = agentChip(), had = document.activeElement === hudChip; hudChip.parentNode.replaceChild(next, hudChip); hudChip = next; if (had && kit) kit.focus(next); }
  function drawHud(o) {
    hud.innerHTML = ""; hud.className = "sg-hud" + (o.bare ? " sg-bare" : ""); hudTimer = hudPips = hudChip = null;
    hud.appendChild(o.week ? iconBtn("home", "Town map", () => go("#/game")) : iconBtn("exit", "Leave the game", () => { location.hash = "#/"; }));
    if (!o.bare) {
      if (agent()) { hudChip = agentChip(); hud.appendChild(hudChip); }
      hud.appendChild(h("div", { class: "sg-hudtitle" }, h("small", null, o.kicker || GAME + " · " + TOWN), h("b", null, o.task ? [h("i", null, OWNER + ": "), o.task] : o.title || TOWN)));
      if (o.week) {
        const m = mission(o.week), r = getRun(o.week);
        hudPips = h("span", { class: "sg-pips", role: "img", "aria-label": "Things learned" }, m.stops.map((s, i) => h("i", { class: r.stops[i] || o.allClues ? "sg-on" : "" }, A.icon("magnifier"))));
        hud.appendChild(hudPips);
      } else if (o.stars) { const st = G.state(), got = WEEKS.reduce((a, w) => a + (st.done[w] ? whole(st.done[w].stars) : 0), 0); hud.appendChild(h("span", { class: "sg-hudstars", role: "img", "aria-label": got + " stars" }, A.icon("star"), h("b", null, String(got)))); }
      hudTimer = h("span", { class: "sg-hudtimer", hidden: true }); hud.appendChild(hudTimer);
      if (!o.week) hud.appendChild(iconBtn("menu", "Log out", () => login()));
    } else hud.appendChild(h("span", { class: "sg-spacer" }));
    hud.appendChild(soundBtn());
  }
  const hudFor = (w, phase, extra) => Object.assign({ week: w, kicker: "Case " + w + " · " + mission(w).title, task: taskFor(w, phase) }, extra);
  /* A card over everything. Escape or a tap outside closes it, unless dismiss is false. Returns close(). */
  function modal(k, card, o) {
    o = o || {};
    const prev = document.activeElement, el = h("div", { class: "sg-modal", role: "dialog", "aria-modal": "true" }, card);
    let off = () => {};
    const close = () => { if (!el.parentNode) return; el.remove(); off(); if (prev && prev.isConnected) k.focus(prev); if (o.onClose) o.onClose(); };
    if (o.dismiss !== false) { el.addEventListener("click", (ev) => { if (ev.target === el) close(); }); off = k.keys({ Escape: close, block: true }); }
    else off = k.keys({ block: true });
    root.appendChild(el); k.onCleanup(() => el.remove());
    k.focus(card.querySelector(".sg-primary") || card.querySelector("button, a[href], input"));
    return close;
  }
  const btn = (label, fn, cls, icon) => h("button", { class: "sg-btn" + (cls ? " " + cls : ""), type: "button", onclick: () => { S.play("click"); fn(); } }, icon ? A.icon(icon) : null, label);
  /* A button that is the agent's own choice, said in the first person. */
  const reply = (label, fn, icon, cls) => btn(label, fn, "sg-reply" + (icon ? " sg-hasicon" : "") + (cls === "" ? "" : " " + (cls || "sg-primary")), icon);

  // ── experience on screen: gains that float up, the level-up card, the badge ──
  /* "+10 Automation": each gain floats under the agent's chip for a moment, and the bar fills. */
  function showGains(list) {
    if (!root || !list || !list.length) return;
    floats.style.top = (hud.offsetHeight + 8) + "px";
    floats.classList.toggle("sg-low", !!root.querySelector(".sg-modal"));   // a card is up (the results): float under it, not over its title
    list.forEach((g, i) => setTimeout(() => {
      if (!root || !floats.isConnected) return;
      const sk = skillOf(g.skill), el = h("div", { class: "sg-float", style: "--c:" + sk.color }, A.icon(sk.icon), h("b", null, "+" + g.n + " " + sk.name), g.why ? h("small", null, g.why) : null);
      floats.appendChild(el); S.play("gain"); setTimeout(() => el.remove(), 2600);
    }, i * 380));
    refreshChip(); if (hudChip && kit) kit.fx.pop(hudChip);
  }
  /* Has the agent passed a level since it was last told? Then say so, with what the owner now trusts it with. */
  function levelUp(k) {
    return new Promise((resolve) => {
      const a = agent(), s = standing();
      if (!a || s.level <= a.lv) return resolve();
      const perms = LEVELS.slice(a.lv, s.level).map((L) => L.perm);
      write("agent", Object.assign({}, a, { lv: s.level })); refreshChip();
      let close = () => {};
      const card = h("div", { class: "sg-card sg-levelup" }, A.word("LEVEL UP!"), h("div", { class: "sg-kicker" }, "Level " + s.level + " of " + LEVELS.length), h("h2", null, s.title),
        h("p", null, OWNER + " now trusts me with:"), h("ul", { class: "sg-perms" }, perms.map((p) => h("li", null, A.icon("check"), h("span", null, p)))),
        h("p", { class: "sg-fine" }, "Still " + OWNER + "'s call: anything that goes out."),
        h("div", { class: "sg-row" }, reply("Got it", () => close())));
      close = modal(k, card, { dismiss: false, onClose: resolve });
      S.play("level"); k.fx.confetti(40);
    });
  }
  /* The ID badge: name, look, level, title, and the newest thing the owner trusts this agent with. */
  function badgeEl(a, s) {
    const look = LOOKS.find((l) => l.key === a.look) || LOOKS[0];
    return h("div", { class: "sg-badge", style: "--c:" + A.shape.light(look.trim, 0.55) }, h("div", { class: "sg-badge-top" }, h("span", null, BIZ), h("span", null, "Agent ID")),
      h("span", { class: "sg-badge-face" }, A.avatar("agent-" + a.look, { mood: "glad" })),
      h("div", { class: "sg-badge-main" }, h("small", null, "Agent"), h("b", null, a.name), h("span", null, "Level " + s.level + " · " + s.title), xpBar(s), h("small", null, s.next ? s.total + " of " + s.next + " XP to Level " + (s.level + 1) : s.total + " XP. Top level.")),
      h("div", { class: "sg-badge-foot" }, h("span", null, h("i", null, "Trusted with "), s.perm), h("span", null, h("i", null, "Supervisor "), BOSS), h("span", { class: "sg-badge-no" }, badgeNo(a))));
  }
  /* One bar for each skill. */
  function skillRows(s) {
    return h("ul", { class: "sg-skilllist" }, SKILLS.map((sk) => {
      const xp = s.skills[sk.key] || 0, max = skillMax(sk), here = !sk.week || inCopy(sk.week);
      return h("li", { class: "sg-skill" + (here ? "" : " sg-later"), style: "--c:" + sk.color }, h("span", { class: "sg-face" }, A.icon(sk.icon)),
        h("div", null, h("div", { class: "sg-skill-top" }, h("b", null, sk.name), h("small", null, "Level " + skillLevel(sk, xp) + " of 5")),
          h("span", { class: "sg-skillbar", role: "img", "aria-label": xp + " of " + max + " experience" }, h("i", { style: "width:" + Math.round(xp / max * 100) + "%" })),
          h("small", null, here ? sk.about + " " + xp + " of " + max + " XP." : "Case " + sk.week + " arrives " + arrives(sk.week) + ".")));
    }));
  }

  // ── the entrance: splash, title, agent login, boot sequence ──
  function splash() {
    const k = screen("boot", { bare: true }); let gone = false;
    const next = () => { if (gone) return; gone = true; titleScreen(); };
    stage.appendChild(h("button", { class: "sg-boot", type: "button", "aria-label": "Skip the intro", onclick: next },
      h("span", { class: "sg-bootlogo" }, A.sticker("leaf", A.C.green)), h("span", { class: "sg-boottext" }, h("b", null, C.series), h("small", null, "presents"))));
    k.keys({ any: next, Enter: next, " ": next }); k.after(k.calm ? 900 : 2200, next);
  }
  /* The town behind the title and the login: clouds drift, the truck idles, Sprout waves, a bandit peeks. */
  function titleBackdrop() {
    const sh = A.shape, bg = A.titleScene(); bg.classList.add("sg-bg"); stage.appendChild(bg);
    stage.appendChild(h("div", { class: "sg-title-tree" }, A.svg(sh.group(sh.at(0, 104, 1, A.characterMarkup("clutter")), 'class="sg-peeker"') + sh.at(280, 326, 2.5, A.prop("tree")) + sh.at(292, 332, 2.6, A.prop("bush")), { box: "0 0 380 334" })));
    stage.appendChild(h("div", { class: "sg-title-truck" }, A.svg(sh.at(112, 132, 1, sh.group(A.prop("truck"), 'class="sg-idle"')), { box: "0 0 224 140" })));
    stage.appendChild(h("div", { class: "sg-title-sprout" }, A.character("sprout", { mood: "glad", pose: "wave", flip: true })));
  }
  function titleScreen() {
    const k = screen("title", { bare: true }); titleBackdrop();
    const start = () => { S.unlock(); S.play("start"); login(); };
    const b = h("button", { class: "sg-start", type: "button", onclick: start }, "PRESS START");
    stage.appendChild(h("div", { class: "sg-title-top" }, A.logo()));
    stage.appendChild(h("div", { class: "sg-title-bottom" }, b, h("small", null, "You are the agent. Click, tap or press Enter")));
    k.keys({ Enter: start, " ": start }); k.focus(b);
  }
  /* The agent login. No password, no email: a made-up name and a look, kept in this browser.
     A returning player is welcomed back; "Switch agent" lists every agent on this computer.
     o.then runs after the boot sequence (a case that was opened by its address, for one). */
  function login(o) {
    o = o || {};
    const k = screen("login", { bare: true }); titleBackdrop();
    if (!S.playing()) S.music(true);
    const box = h("div", { class: "sg-login" });
    stage.appendChild(h("div", { class: "sg-login-logo" }, A.logo())); stage.appendChild(box);
    const enter = () => { S.unlock(); S.play("login"); entered = true; write("started", true); party = 0; burst = false; bootSequence(o.then); };
    const tools = () => {                              // the sound switch repaints itself, so a name half typed is never lost
      const sound = h("button", { class: "sg-btn sg-soundrow", type: "button", onclick: () => { S.mute(!S.muted()); if (!S.muted()) { S.unlock(); S.music(true); S.play("pop"); } paint(); drawHud({ bare: true }); } });
      const paint = () => { sound.innerHTML = ""; sound.appendChild(A.icon(S.muted() ? "mute" : "sound")); sound.appendChild(document.createTextNode(S.muted() ? "Sound: off" : "Sound: on")); };
      paint(); return h("div", { class: "sg-login-tools" }, sound, btn("How to play", () => howTo(k), "", "magnifier"));
    };
    const head = (title, note) => { box.innerHTML = ""; box.appendChild(h("div", { class: "sg-kicker" }, "Agent login")); box.appendChild(h("h2", null, title)); if (note) box.appendChild(h("p", { class: "sg-login-note" }, note)); };

    function welcome() {
      const a = sync(), s = standing();
      head("Welcome back, Agent " + a.name);
      box.appendChild(badgeEl(a, s));
      const inb = reply("Log in", enter, "play");
      box.appendChild(h("div", { class: "sg-login-row" }, inb, btn("Switch agent", switcher, "", "badge")));
      box.appendChild(tools()); k.focus(inb);
    }
    function form() {
      const st = G.state(), old = !agent() && (st.started || doneCount(st) > 0 || Object.keys(st.run).length > 0), s = standing(), others = roster().length;
      let look = LOOKS[0].key, pick = 0;
      head("Log in as an agent", old ? "Your saved cases are still here: " + doneCount(st) + " closed. Your agent starts at Level " + s.level + ", " + s.title + "." : agent() ? "A new agent starts at Level 1. Agent " + agent().name + " stays on this computer." : "You are Greenline's new AI agent. Pick a name and a look.");
      const name = h("input", { type: "text", id: "sg-agentname", maxlength: "14", autocomplete: "off", spellcheck: "false", value: NAMES[0], "aria-describedby": "sg-agentfine", onkeydown: (ev) => { if (ev.key === "Enter") { ev.preventDefault(); submit(); } } });
      const looks = LOOKS.map((l) => h("button", { class: "sg-look", type: "button", "aria-pressed": "false", "aria-label": "Look: " + l.label, style: "--c:" + A.shape.light(l.trim, 0.55), onclick: () => choose(l.key) }, A.avatar("agent-" + l.key, { mood: "glad" }), h("small", null, l.label)));
      const choose = (key) => { look = key; looks.forEach((b, i) => b.setAttribute("aria-pressed", LOOKS[i].key === key ? "true" : "false")); S.play("pop"); };
      const submit = () => { createAgent(name.value, look); enter(); };
      const inb = reply("Log in", submit, "play");
      box.appendChild(h("div", { class: "sg-field" }, h("label", { for: "sg-agentname" }, "Agent name"), h("div", { class: "sg-field-row" }, name, btn("Another name", () => { pick = (pick + 1) % NAMES.length; name.value = NAMES[pick]; }, "sg-small"))));
      box.appendChild(h("div", { class: "sg-field" }, h("span", { class: "sg-label", id: "sg-looklabel" }, "Pick a look"), h("div", { class: "sg-looks", role: "group", "aria-labelledby": "sg-looklabel" }, looks)));
      box.appendChild(h("div", { class: "sg-login-row" }, inb, others ? btn("Back", agent() ? welcome : switcher) : null));
      box.appendChild(h("p", { class: "sg-fine", id: "sg-agentfine" }, "A made-up name for your agent. It stays in this browser. No password, no email."));
      box.appendChild(tools());
      looks[0].setAttribute("aria-pressed", "true"); k.focus(inb);
    }
    function switcher() {
      const list = roster();
      if (!list.length) return form();
      head("Who is logging in?");
      const rows = list.map((r) => h("li", { class: "sg-agentrow" },
        h("button", { class: "sg-agentpick", type: "button", onclick: () => { S.play("pop"); if (!r.here) loadAgent(r.id); welcome(); } }, h("span", { class: "sg-face", style: "background:" + A.shape.light((LOOKS.find((l) => l.key === r.look) || LOOKS[0]).trim, 0.55) }, A.avatar("agent-" + r.look)),
          h("span", null, h("b", null, "Agent " + r.name), h("small", null, "Level " + r.level + " · " + r.title + " · " + r.cases + " of " + TOTAL + " cases"))),
        btn("Remove", () => ask(r), "sg-small")));
      box.appendChild(h("ul", { class: "sg-agentlist" }, rows));
      const more = list.length < MAX_AGENTS ? reply("New agent", form, "star", "") : h("p", { class: "sg-fine" }, "Four agents is the most this computer keeps. Remove one to add another.");
      box.appendChild(h("div", { class: "sg-login-row" }, more, agent() ? btn("Back", welcome) : null));
      k.focus(rows[0].querySelector("button"));
    }
    function ask(r) {                                  // the in-page question before an agent is removed. Never a native dialog.
      head("Remove Agent " + r.name + "?", "Its skills, stars and stickers will be cleared from this computer.");
      const keep = btn("Keep Agent " + r.name, switcher, "sg-primary");
      box.appendChild(h("div", { class: "sg-login-row" }, btn("Yes, remove", () => { removeAgent(r.id); const rest = roster(); if (!agent() && rest.length) loadAgent(rest[0].id); if (agent()) switcher(); else form(); }, "sg-danger"), keep));
      k.focus(keep);
    }
    if (agent()) welcome(); else if (roster().length) switcher(); else form();
  }
  /* The boot sequence, in the agent's own voice. Short, and one key skips it. */
  function bootSequence(then) {
    const a = sync(), s = standing(), st = G.state(), n = doneCount(st), k = screen("bootseq", { bare: true, visor: true });
    let gone = false;
    const next = () => { if (gone) return; gone = true; if (typeof then === "function") then(); else townMap(); };
    const lines = s.total > 0 || n > 0
      ? ["Agent " + a.name + " is back online.", "I am Level " + s.level + ", " + s.title + ". " + n + " of " + TOTAL + " cases closed.", "Rule one still stands. " + RULE]
      : ["Agent " + a.name + " is online.", "I work for " + BIZ + ", in " + TOWN + ".", "My supervisor is " + BOSS + ".", "My trainer is Sprout. Sprout had this job before me.", "Rule one. " + RULE, "I am Level 1, a New Agent. The more I learn, the more " + OWNER + " trusts me."];
    const list = h("ol", { class: "sg-bootlines", "aria-live": "polite" }), startB = reply("Skip", next, "play");
    stage.appendChild(h("div", { class: "sg-bootseq" }, h("span", { class: "sg-bootface" }, A.avatar("agent", { mood: "glad" })), h("div", { class: "sg-kicker" }, "Starting up"), list, h("div", { class: "sg-row" }, startB)));
    let i = 0;
    const ready = () => { startB.lastChild.textContent = "Start my shift"; };
    const add = () => { if (i >= lines.length) return false; list.appendChild(h("li", null, lines[i])); S.play("boot"); i++; if (i >= lines.length) ready(); return true; };
    if (k.calm) { while (add()) { /* all at once */ } } else { add(); const stop = k.every(620, () => { if (!add()) stop(); }); }
    k.keys({ any: next }); k.focus(startB);
  }
  function howTo(k) {
    const steps = [["badge", "You are Greenline's new AI agent. Log in, and see the town through your own visor."],
      ["truck", OWNER + " gives you a job. Ride to three places. Each friend teaches you one thing."],
      ["skills", "Every thing you learn feeds a skill. Skills add up to levels. Levels earn " + OWNER + "'s trust."],
      ["bolt", "Do the job in the showdown. Sprout, your trainer, has a shortcut. One part of it is always wrong. Catch it."],
      ["stamp", "You never send. You hand your work to " + OWNER + ", and " + OWNER + " approves it."]];
    let close = () => {};
    close = modal(k, h("div", { class: "sg-card sg-howto" }, h("h2", null, "How to play"),
      h("ol", null, steps.map((s) => h("li", null, h("span", { class: "sg-face" }, A.icon(s[0])), h("span", null, s[1])))),
      h("p", { class: "sg-fine" }, "Click or tap. Or use the keyboard: Enter, the arrow keys and the number keys. Your progress is saved in this browser."),
      h("div", { class: "sg-row" }, btn("Got it", () => close(), "sg-primary"))));
  }

  // ── the town map ──
  const wantsTall = () => stage.clientWidth < stage.clientHeight * 0.9;
  /* Draw the map into the stage, sized to fit, with a bar underneath. Returns the art.js map, plus
     pinAt(x, y, el) to lay a button over it and say(text, button) to fill the bar. The bar is the
     agent thinking, so its face is the agent's own. */
  function buildMap(k, o) {
    const st = G.state(), layout = wantsTall() ? "tall" : "wide", gray = {}, peek = {};
    WEEKS.forEach((w) => { const b = BANDITS[w]; if (!b) return; if (!st.done[w]) { gray[b.zone] = true; if (inCopy(w)) peek[b.zone] = b.key; } else if (o.keepGray === w) gray[b.zone] = true; });
    const map = A.townMap(layout, { gray: gray, peek: peek });
    const wrap = h("div", { class: "sg-map sg-map-" + layout }, map.el), holder = h("div", { class: "sg-mapholder" }, wrap), bar = h("div", { class: "sg-mapbar" });
    stage.appendChild(holder); stage.appendChild(bar);
    const fit = () => { const s = Math.min(holder.clientWidth / map.w, holder.clientHeight / map.h); wrap.style.width = Math.floor(map.w * s) + "px"; wrap.style.height = Math.floor(map.h * s) + "px"; wrap.style.setProperty("--u", s + "px"); };
    map.say = (text, button, mood) => { bar.innerHTML = ""; bar.appendChild(h("span", { class: "sg-face" }, A.avatar("agent", { mood: mood || "happy" }))); bar.appendChild(h("p", null, text)); if (button) { bar.appendChild(button); k.focus(button); } fit(); };
    map.pinAt = (x, y, el) => { el.style.left = (x / map.w * 100) + "%"; el.style.top = (y / map.h * 100) + "%"; wrap.appendChild(el); return el; };
    map.fit = fit;
    k.on(window, "resize", () => { if ((wantsTall() ? "tall" : "wide") !== layout) return o.redraw(); fit(); });
    return map;
  }
  /* The truck drives the short way round the ring road, then done() runs. */
  function drive(k, map, from, to, done) {
    const a = map.stop(from), d = map.path(from, to);
    if (Math.abs(d) < 1) return done();
    S.play("truck"); map.el.classList.add("sg-driving");
    k.tween(650 + Math.abs(d) * 2.4, (p) => map.truckTo(a + d * p, d > 0 ? 1 : -1), () => { map.el.classList.remove("sg-driving"); done(); });
  }
  function townMap(o) {
    o = o || {}; entered = true;
    const st = G.state(), have = WEEKS.filter(inCopy), next = have.find((w) => !st.done[w] && isOpen(w, st)), n = doneCount(st);
    const mid = next && getRun(next).phase !== "briefing";
    const k = screen("map", { stars: true, task: next ? (mid ? "Back to case " + next + ". We are not done." : "Case " + next + " is waiting for you.") : n >= TOTAL ? "All eight are in the net. Take a bow." : "Nothing new today. Good work." });
    if (!S.playing()) S.music(true);
    const just = party && st.done[party] ? party : 0, color = just && burst; party = 0; burst = false;
    const map = buildMap(k, { keepGray: color ? just : 0, redraw: () => townMap(o) });
    WEEKS.forEach((w) => {
      const b = BANDITS[w]; if (!b) return;
      const p = map.pin(b.zone), done = st.done[w], state = done ? "done" : isOpen(w, st) ? "open" : inCopy(w) ? "locked" : "later";
      map.pinAt(p.x, p.y, h("button", { class: "sg-pin sg-pin-" + state, type: "button", "aria-label": "Case " + w + ", " + (done ? "solved" : state === "open" ? "ready to play" : state === "locked" ? "locked" : "arrives " + arrives(w)), onclick: () => { S.play("pop"); caseCard(k, w); } },
        h("b", null, String(w)), state === "done" ? starsEl(whole(done.stars)) : state === "open" ? h("small", null, "Play") : state === "locked" ? A.icon("lock") : A.icon("clock")));
    });
    const idle = () => {
      if (o.notice) map.say(o.notice, next ? reply("I'll take case " + next, () => caseCard(k, next), "play") : null, "think");
      else if (next) map.say((mid ? "I am in the middle of case " + next + ": " : "Case " + next + " is waiting for me: ") + mission(next).title + ".", reply(mid ? "Back to my case" : "I'll take case " + next, () => caseCard(k, next), "play"), "glad");
      else if (have.length && have.every((w) => st.done[w])) map.say(n >= TOTAL ? "All eight bandits are in the net. The whole town is back in color!" : "I have closed every case in this copy. Case " + (n + 1) + " arrives " + arrives(n + 1) + ".", reply(n >= TOTAL ? "See the finale" : "See how far I have come", () => go("#/game/done"), "star"), "proud");
      else map.say("No cases in this copy yet. The first one arrives " + arrives(WEEKS[0]) + ".", null, "think");
    };
    map.truckTo(map.stop(just ? BANDITS[just].zone : "hq"), 1);
    if (!just) return idle();
    if (!color) return drive(k, map, BANDITS[just].zone, "hq", idle);
    map.say(A.places[BANDITS[just].zone].name + " is coming back...", null, "surprised");
    k.after(600, () => {                               // the gray part of town bursts back into color, then the truck drives home
      const r = map.reveal(BANDITS[just].zone); S.play("color"); k.fx.confetti();
      k.tween(1000, (p) => r.circle.setAttribute("r", r.max * p), () => { r.finish(); drive(k, map, BANDITS[just].zone, "hq", idle); });
    });
  }
  /* A wanted poster for one case: who the bandit is, and the way in. */
  function caseCard(k, w) {
    const st = G.state(), m = mission(w), b = BANDITS[w], d = A.cast[b.key], done = st.done[w], open = isOpen(w, st), here = inCopy(w), mid = getRun(w).phase !== "briefing";
    let close = () => {};
    const play = () => { close(); if (done && !mid) endRun(w); go("#/game/m" + w); };
    const card = h("div", { class: "sg-card sg-wanted" + (done ? " sg-solved" : "") },
      h("div", { class: "sg-wanted-top" }, done ? "CAUGHT" : "WANTED"),
      h("div", { class: "sg-mug", style: "background:" + A.shape.light(d.tag, 0.55) }, A.character(b.key, done ? { mood: "caught", net: true } : { mood: open ? "glad" : "sneaky" })),
      h("h2", null, d.name), h("p", { class: "sg-crime" }, d.role),
      h("div", { class: "sg-casename" }, h("small", null, "Case " + w + " · teaches " + skillOf("w" + w).name), h("b", null, m ? m.title : session(w).tool)),
      done ? starsEl(whole(done.stars), "sg-big") : null,
      done && didForReal(w) ? h("p", { class: "sg-fine" }, "Bonus sticker: you did this job for real in the week " + w + " tool.") : null,
      !here ? h("p", { class: "sg-fine" }, "This case arrives " + arrives(w) + ". A new one lands every Wednesday.") : !open && !done ? h("p", { class: "sg-fine" }, "Close case " + (w - 1) + " first.") : null,
      h("div", { class: "sg-row" },
        here && (open || done) ? reply(mid ? "Back to my case" : done ? "I'll run it again" : "I'll take the case", play, "play") : null,
        done && OH.modules[w] ? h("a", { class: "sg-btn", href: "#/w" + w }, "Try it for real") : null,
        btn("Close", () => close(), here && (open || done) ? "" : "sg-primary")));
    close = modal(k, card);
  }

  // ── a case ──
  function playCase(w) {
    const m = mission(w), st = G.state();
    if (!m || !inCopy(w)) return townMap({ notice: session(w).week ? "Case " + w + " is not in this copy yet. It arrives " + arrives(w) + "." : "There is no such case." });
    if (!st.done[w] && !isOpen(w, st)) return townMap({ notice: "Case " + w + " opens when case " + (w - 1) + " is closed." });
    entered = true; if (!st.started) write("started", true);
    const r = getRun(w);
    if (r.phase === "stops") return stopsMap(w);
    if (r.phase === "crack") return crack(w);
    if (r.phase === "showdown") return showdownIntro(w);
    if (r.phase === "handoff") return handoff(w);
    briefing(w);
  }
  /* One talking scene: a backdrop, a cast, optional setup(kit) for extra art, then the lines.
     Everybody on stage is looking at the agent, because the agent is the camera.
     The place is drawn gray while it is this case's zone and the bandit is still loose. */
  function playScene(k, sc, fallback, w) {
    const m = mission(w), d = Array.isArray(sc) ? { lines: sc } : (sc || {}), place = d.place || fallback.place;
    k.backdrop(place, { gray: place === m.zone && !G.state().done[w] });
    k.cast(d.cast || fallback.cast);
    if (typeof d.setup === "function") { try { d.setup(k); } catch (e) { if (window.console) console.error(e); } }
    return k.say(d.lines || []);
  }
  async function briefing(w) {
    const m = mission(w), k = screen("talk", hudFor(w, "briefing"));
    setRun(w, { phase: "briefing", stops: [], sharp: [], wrong: 0, sprout: null, at: "hq" });
    await playScene(k, m.briefing, { place: "hq", cast: [{ who: "jordan", side: "left", mood: "worried" }, { who: "sprout", side: "right" }] }, w);
    await k.choose([{ label: (m.briefing && m.briefing.reply) || "I'm on it. To the truck!", icon: "truck" }]);
    setRun(w, { phase: "stops" }); stopsMap(w);
  }
  /* The ride, seen from the passenger seat: the road rolls in, the place grows at the end of it.
     With reduced motion there is no ride: the agent is simply there. */
  function travel(w, place, then) {
    if (G.calm()) return then();
    const m = mission(w), k = screen("travel", hudFor(w, getRun(w).phase === "stops" ? "stops" : "crack")), st = A.street(place, { gray: place === m.zone && !G.state().done[w] });
    let gone = false;
    const arrive = () => { if (gone) return; gone = true; then(); };
    st.el.classList.add("sg-bg"); stage.appendChild(st.el);
    const skip = h("button", { class: "sg-skip sg-povskip", type: "button", onclick: arrive }, "Skip the ride");
    stage.appendChild(h("div", { class: "sg-pov" }, h("small", null, "On my way to"), h("b", null, A.places[place].name), h("span", null, "Luis is driving. I am watching the road.")));
    stage.appendChild(skip);
    S.play("truck");
    k.tween(2200, st.move, () => k.after(260, arrive));
    k.keys({ any: arrive, Enter: arrive, " ": arrive }); k.focus(skip);
  }
  /* The town map during a case: a pin on each place to learn from, then the way back to HQ. */
  function stopsMap(w) {
    const m = mission(w), r = getRun(w), k = screen("map", hudFor(w, "stops"));
    if (!S.playing()) S.music(true);
    const map = buildMap(k, { redraw: () => stopsMap(w) });
    let busy = false;
    const left = m.stops.map((s, i) => i).filter((i) => !r.stops[i]);
    const leave = (place, then) => { if (busy) return; busy = true; setRun(w, { at: place }); travel(w, place, then); };
    m.stops.forEach((s, i) => {
      const p = map.pin(s.place), place = A.places[s.place];
      map.pinAt(p.x, p.y, h("button", { class: "sg-pin " + (r.stops[i] ? "sg-pin-found" : "sg-pin-clue"), type: "button", disabled: !!r.stops[i], "aria-label": "Stop " + (i + 1) + ", " + place.name + (r.stops[i] ? ", learned" : ""), onclick: () => leave(s.place, () => stop(w, i)) },
        r.stops[i] ? A.icon("check") : A.icon("magnifier"), h("small", null, r.stops[i] ? "Learned" : "Learn " + (i + 1))));
    });
    map.truckTo(map.stop(r.at), 1);
    const names = { 1: "One more thing", 2: "Two more things" };
    if (left.length) {
      const i = left[0], place = A.places[m.stops[i].place];
      map.say(left.length === m.stops.length ? "Three places can teach me something. Where do I go first? Tap a pin, or press 1, 2 or 3." : (names[left.length] || left.length + " more things") + " to learn.", reply("I'll go to " + place.name, () => leave(m.stops[i].place, () => stop(w, i)), "truck"));
      const keys = {}; m.stops.forEach((s, n) => { if (!r.stops[n]) keys[String(n + 1)] = () => leave(s.place, () => stop(w, n)); }); k.keys(keys);
    } else {
      const p = map.pin("hq"), home = () => leave("hq", () => { setRun(w, { phase: m.crack ? "crack" : "showdown" }); if (m.crack) crack(w); else showdownIntro(w); });
      map.pinAt(p.x, p.y, h("button", { class: "sg-pin sg-pin-open", type: "button", "aria-label": "Back to Greenline HQ", onclick: home }, A.icon("star"), h("small", null, "HQ")));
      map.say("Three things learned, and all of them saved. Back to HQ.", reply(m.crack ? "I'll go and make my plan" : "I'm ready for the showdown", home, "truck"), "proud");
    }
  }
  /* A stop: a friend talks to the agent, a quick challenge, then one piece of knowledge to keep. */
  async function stop(w, i) {
    const m = mission(w), s = m.stops[i], who = s.who || A.places[s.place].host || "sprout", k = screen("talk", hudFor(w, "stops"));
    await playScene(k, { place: s.place, cast: s.cast || [{ who: who, side: "left" }, { who: "sprout", side: "right" }], setup: s.setup, lines: s.lines }, {}, w);
    const before = getRun(w).wrong;
    await challenge(k, Object.assign({ who: who }, s.challenge));
    const clean = getRun(w).wrong === before;
    await clueCard(k, s.clue, i, m.stops.length, w);
    const r = getRun(w), stops = r.stops.slice(), sharp = r.sharp.slice(); stops[i] = 1; if (clean) sharp[i] = 1;
    setRun(w, { stops: stops, sharp: sharp });
    showGains(award(w, { clues: tally(stops), sharp: tally(sharp) }));
    await levelUp(k);
    stopsMap(w);
  }
  /* Run a quick challenge. spec.type names a built-in (pick, sort, tap, spot); or give spec.play(kit, done). */
  function challenge(k, spec) {
    return new Promise((resolve) => {
      let over = false; const done = () => { if (over) return; over = true; resolve(); };
      const fn = typeof spec.play === "function" ? spec.play : G.challenges[spec.type];
      if (!fn) return done();
      try { fn(k, spec, done); } catch (e) { if (window.console) console.error(e); done(); }
    });
  }
  /* A piece of knowledge: the card says what was learned and which skill it feeds, and it flies into
     the agent's memory (the chip in the HUD). */
  function clueCard(k, clue, i, of, w) {
    return new Promise((resolve) => {
      k.hush(); S.play("clue");
      const sk = skillOf("w" + w), fresh = entry(asMap(read("xp", {}))[w]).clues < tally(getRun(w).stops) + 1;
      const card = h("div", { class: "sg-clue" }, h("span", { class: "sg-clue-pin" }, A.icon("magnifier")), h("div", { class: "sg-kicker" }, "New knowledge · " + (i + 1) + " of " + of), h("h2", null, clue.title), h("p", null, k.fill(clue.text)),
        h("div", { class: "sg-clue-skill", style: "--c:" + sk.color }, A.icon(sk.icon), h("b", null, fresh ? "+" + PTS.clues + " " + sk.name : sk.name), h("small", null, fresh ? "feeds this skill" : "I know this one already")));
      const layer = h("div", { class: "sg-layer" }, card);
      card.appendChild(h("div", { class: "sg-row" }, reply("I'll remember that", () => {
        S.play("star"); if (hudPips && hudPips.children[i]) { hudPips.children[i].className = "sg-on"; k.fx.pop(hudPips.children[i]); }
        k.fx.fly(card, hud.querySelector(".sg-bookbtn"), () => { layer.remove(); resolve(); });
      }, "book")));
      stage.appendChild(layer); k.fx.pop(card); k.focus(card.querySelector("button"));
    });
  }
  /* The plan: three cards, one right move. A wrong pick gets a reaction and another try. The cards are
     the agent's own options, so a mission writes them in the first person. */
  async function crack(w) {
    const m = mission(w), c = m.crack, k = screen("talk", hudFor(w, "crack", { allClues: true }));
    await playScene(k, { place: c.place || "hq", cast: c.cast, lines: c.lines }, { place: "hq", cast: [{ who: "jordan", side: "left" }, { who: "sprout", side: "right" }] }, w);
    const p = k.panel({ kicker: "My plan", title: k.fill(c.ask), class: "sg-wide" }); let solved = false, tries = 0;
    const react = (r, tone, extra) => { p.foot.innerHTML = ""; p.foot.className = "sg-panel-foot sg-react sg-" + tone; if (r && r.who && A.cast[r.who]) p.foot.appendChild(h("span", { class: "sg-face", style: "background:" + A.cast[r.who].tag }, A.avatar(r.who, { mood: r.mood }))); p.foot.appendChild(h("span", null, r && r.who && A.cast[r.who] ? h("b", null, A.cast[r.who].name + ": ") : null, k.fill((r && r.say) || ""))); if (extra) p.foot.appendChild(extra); k.fx.pop(p.foot); };
    const cards = c.cards.map((card, n) => h("button", { class: "sg-pickcard", type: "button", onclick: () => pick(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)),
      h("span", { class: "sg-pickart", style: "background:" + (card.color || [A.C.pink, A.C.sun, A.C.teal][n % 3]) }, card.art ? A.svg(typeof card.art === "function" ? card.art() : card.art, { box: card.box || "0 0 120 120" }) : A.icon(card.icon || "star")), h("b", null, card.title), h("span", null, card.text)));
    function pick(n) {
      const card = c.cards[n], b = cards[n]; if (solved || b.disabled) return;
      if (!card.right) { tries++; b.disabled = true; b.classList.add("sg-no"); k.focusNext(cards, n); k.fx.shake(b); k.score.wrong(); return react(card.react || { say: "Not that one. Try another." }, "bad"); }
      solved = true; b.classList.add("sg-yes"); cards.forEach((x) => { if (x !== b) x.disabled = true; }); k.score.right();
      b.appendChild(h("span", { class: "sg-stamp" }, "My plan!"));
      showGains(award(w, { plan: tries === 0 ? 2 : 1 }));
      const on = reply("I'm ready. To the showdown", async () => { on.disabled = true; await levelUp(k); setRun(w, { phase: "showdown" }); showdownIntro(w); }, "bolt");
      react(card.react || { say: "That's the plan." }, "ok", on); k.focus(on);
    }
    p.body.appendChild(h("div", { class: "sg-pickcards" }, cards));
    const keys = {}; cards.forEach((b, n) => { keys[String(n + 1)] = () => pick(n); }); k.keys(keys); k.focus(cards[0]);
  }
  /* Before the showdown: the bandit, face to face, with the visor locked on. */
  function showdownIntro(w) {
    const m = mission(w), k = screen("vs", hudFor(w, "showdown", { allClues: true })), d = A.cast[m.bandit];
    const go2 = reply("I'm ready. Go!", () => showdownPlay(w), "bolt", "sg-primary sg-huge");
    stage.appendChild(h("div", { class: "sg-vs" }, h("div", { class: "sg-rays", "aria-hidden": "true" }),
      h("div", { class: "sg-vs-row" }, h("div", { class: "sg-target" }, h("i"), h("i"), h("i"), h("i"), A.character(m.bandit, { mood: "glad" }), h("b", { style: "background:" + d.tag }, "Target: " + d.name))),
      h("div", { class: "sg-card sg-vs-card" }, h("div", { class: "sg-kicker" }, "The showdown · my job"), h("h2", null, m.showdown.title),
        h("ul", null, [].concat(m.showdown.how || []).map((x) => h("li", null, k.fill(x)))), h("div", { class: "sg-row" }, go2))));
    S.play("whoosh"); k.focus(go2);
  }
  /* The showdown is the mission's own mini-game: play(kit, done). The engine gives it a clean stage and
     takes over again when it calls done(). The job is done, but nothing has gone out: the handoff is next. */
  function showdownPlay(w) {
    const m = mission(w), k = screen("play", hudFor(w, "showdown", { allClues: true })); let over = false;
    S.music(false); floats.innerHTML = "";             // the mini-game starts with a clear view: no gain left floating over it
    const done = () => { if (over) return; over = true; setRun(w, { phase: "handoff" }); handoff(w); };
    const oops = (e) => {
      if (over) return; if (window.console) console.error(e);
      stage.appendChild(h("div", { class: "sg-layer" }, h("div", { class: "sg-card" }, h("h2", null, "The showdown tripped over its own feet"), h("p", null, "Sorry about that. You can still close the case."), h("div", { class: "sg-row" }, btn("Carry on anyway", done, "sg-primary")))));
    };
    try { const r = m.showdown.play(k, done); if (r && typeof r.catch === "function") r.catch(oops); } catch (e) { oops(e); }
  }
  /* Rule one, as something the player does: the agent never sends. It hands its work to the owner,
     and the owner approves it. "I'll send it myself" is always there, and it is always turned down. */
  async function handoff(w) {
    const m = mission(w), hd = m.handoff || {}, k = screen("talk", hudFor(w, "handoff", { allClues: true }));
    if (!S.playing()) S.music(true);
    k.backdrop("hq", { gray: m.zone === "hq" && !G.state().done[w] });
    k.cast([{ who: "jordan", side: "center", mood: "happy" }]);
    await k.say([{ who: "jordan", mood: "happy", pose: "idle", say: hd.ask || "Show me what you have, {agent}." }]);
    k.cast([]);                                        // the card takes the stage: Jordan's face is on it
    const p = k.panel({ kicker: "For " + OWNER + "'s approval", title: "My work is ready. What do I do with it?", who: "jordan" });
    const work = [].concat(hd.work || ["The job is done: " + m.showdown.title + ".", "Sprout's wrong shortcut is fixed.", "Nothing has gone out yet."]);
    const list = h("ul", { class: "sg-work" }, work.map((x) => h("li", null, A.icon("check"), h("span", null, k.fill(x))))), sheet = h("div", { class: "sg-worksheet" }, list);
    let tried = false, over = false;
    const give = reply("I'll hand it to " + OWNER + " to approve", () => pick(0), "hand"), send = reply("I'll send it myself", () => pick(1), "bolt", "");
    [give, send].forEach((b, n) => b.insertBefore(h("kbd", { "aria-hidden": "true" }, String(n + 1)), b.firstChild));
    function pick(n) {
      if (over) return;
      if (n === 1) { if (send.disabled) return; tried = true; send.disabled = true; send.classList.add("sg-no"); k.fx.shake(send); S.play("oops"); p.say("Not my call. Rule one: " + RULE.charAt(0).toLowerCase() + RULE.slice(1), "bad"); return k.focus(give); }
      over = true; give.disabled = send.disabled = true; give.classList.add("sg-yes");
      sheet.appendChild(h("span", { class: "sg-approved" }, "Approved")); S.play("stamp");
      showGains(award(w, { ask: tried ? 1 : 2 }));
      const on = reply("Now, the bandit", async () => { on.disabled = true; await levelUp(k); caught(w); }, "bolt");
      p.foot.innerHTML = ""; p.foot.className = "sg-panel-foot sg-react sg-ok";
      p.foot.appendChild(h("span", { class: "sg-face", style: "background:" + A.cast.jordan.tag }, A.avatar("jordan", { mood: "glad" })));
      p.foot.appendChild(h("span", null, h("b", null, OWNER + ": "), k.fill(hd.approve || "Approved. It goes out under my name."))); p.foot.appendChild(on);
      k.fx.pop(p.foot); k.focus(on);
    }
    p.body.appendChild(sheet); p.body.appendChild(h("div", { class: "sg-handoff" }, give, send));
    k.keys({ "1": () => pick(0), "2": () => pick(1) }); k.focus(give);
  }
  /* Caught: the net drops, the place gets its color back, a debrief, then the stars and the sticker. */
  async function caught(w) {
    const m = mission(w), res = closeCase(w), k = screen("caught", hudFor(w, "caught", { allClues: true }));
    const gray = k.backdrop(m.zone, { gray: res.first });
    const perp = h("div", { class: "sg-perp" }, A.character(m.bandit, { mood: "surprised" })); stage.appendChild(perp);
    if (m.caught && typeof m.caught.setup === "function") { try { m.caught.setup(k); } catch (e) { if (window.console) console.error(e); } }   // a mission's own art for the catch
    await k.wait(700);
    S.play("drop"); perp.innerHTML = ""; perp.appendChild(A.character(m.bandit, { mood: "caught", net: true })); perp.classList.add("sg-netted");
    const word = A.word("CAUGHT!"); word.classList.add("sg-caughtword"); stage.appendChild(word);
    S.play("caught"); k.fx.confetti(60);
    await k.wait(1100);
    if (res.first) { const color = A.scene(m.zone); color.classList.add("sg-bg", "sg-colorburst"); stage.insertBefore(color, gray.nextSibling); S.play("color"); }
    k.cast([{ who: "jordan", side: "left", mood: "glad", pose: "cheer" }, { who: "sprout", side: "right", mood: "glad", pose: "cheer" }]);
    await k.say(m.debrief || []);
    if (!S.playing()) S.music(true);
    results(k, w, res);
  }
  function results(k, w, res) {
    const m = mission(w), next = w + 1, stars = starsEl(0, "sg-big"), sticker = h("span", { class: "sg-stickerwrap" }, A.sticker(m.badge.icon, m.badge.color));
    const rule = (ok, text) => h("li", { class: ok ? "sg-ok" : "sg-miss" }, A.icon(ok ? "check" : "cross"), h("span", null, text));
    const home = async () => { await levelUp(k); party = w; burst = res.first; go("#/game"); };
    const starGains = award(w, { stars: res.stars }), mine = points(ledgerOf(read("xp", {}))[w]), sk = skillOf("w" + w), jd = skillOf("judgment");
    const learned = h("div", { class: "sg-learned" }, h("small", null, "What this case has taught me"),
      h("span", { style: "--c:" + sk.color }, A.icon(sk.icon), h("b", null, sk.name), mine.skill + " of " + SKILL_MAX + " XP"),
      h("span", { style: "--c:" + jd.color }, A.icon(jd.icon), h("b", null, jd.name), mine.judgment + " of " + JUDGE_MAX + " XP"));
    const card = h("div", { class: "sg-card sg-results" }, h("div", { class: "sg-kicker" }, "Case " + w + " closed"), h("h2", null, A.cast[m.bandit].name + " is in the net"), stars,
      h("ul", { class: "sg-rules" }, rule(true, "I closed the case."), rule(res.sprout, res.sprout ? "I caught Sprout's wrong shortcut on the first try." : "Catch Sprout's wrong shortcut on the first try for this star."),
        rule(res.wrong <= m.maxWrong, res.wrong === 0 ? "Not one wrong pick." : res.wrong <= m.maxWrong ? "Only " + res.wrong + " wrong " + (res.wrong === 1 ? "pick" : "picks") + "." : res.wrong + " wrong picks. " + m.maxWrong + " or fewer earns this star.")),
      learned,
      h("div", { class: "sg-earned" }, sticker, h("div", null, h("small", null, "New sticker"), h("b", null, m.badge.name), gains(m).map((g) => h("span", { class: "sg-gain" }, g)), gains(m).length ? h("small", null, "Story numbers for a made-up company.") : null)),
      m.next && inCopy(next) ? h("p", { class: "sg-teaser" }, m.next) : next <= TOTAL && !inCopy(next) ? h("p", { class: "sg-teaser" }, "Case " + next + " arrives " + arrives(next) + ".") : null,
      res.best > res.stars ? h("p", { class: "sg-fine" }, "My best for this case is still " + res.best + " stars.") : null,
      h("div", { class: "sg-row" }, reply("Ride home", home, "truck"), OH.modules[w] ? h("a", { class: "sg-btn", href: "#/w" + w }, "Try it for real") : null));
    modal(k, card, { dismiss: false });
    for (let i = 0; i < res.stars; i++) k.after(350 + i * 380, () => { const s = stars.children[i]; s.className = "sg-on"; s.innerHTML = ""; s.appendChild(A.icon("star")); k.fx.pop(s); S.play("star"); });
    k.after(500 + res.stars * 380, () => { sticker.classList.add("sg-stuck"); S.play("sticker"); showGains(starGains); });
    k.after(1500 + res.stars * 380, () => { levelUp(k); });
  }

  // ── the Skills panel: the agent's skills, what it knows, and its badge. Open from the HUD at any time. ──
  function skillsPanel(tab) {
    if (!kit || !agent()) return;
    floats.innerHTML = "";                             // a gain still floating would sit on top of the panel
    const k = kit, a = agent(), st = G.state(), s = standing(), t = totals(st), n = doneCount(st), body = h("div", { class: "sg-skills-body" }); let close = () => {};
    const tabs = [["skills", "Skills"], ["know", "What I know"], ["badge", "My badge"]];
    const tabBtns = tabs.map((x) => h("button", { class: "sg-tab", type: "button", "aria-pressed": "false", onclick: () => { S.play("click"); show(x[0]); } }, x[1]));
    const skillsTab = () => h("div", null,
      h("p", { class: "sg-rankline" }, h("b", null, "Level " + s.level + " of " + LEVELS.length + " · " + s.title), " · " + s.total + " XP" + (s.next ? ". " + (s.next - s.total) + " more to " + s.nextTitle + "." : ". Top level.")),
      xpBar(s, "sg-big"), skillRows(s),
      h("p", { class: "sg-fine" }, "Knowledge feeds skills: every thing I learn adds to a bar. A first-try answer and every star add more."));
    const knowTab = () => h("div", null,
      h("p", { class: "sg-rankline" }, h("b", null, n + " of " + TOTAL + " cases closed"), " · everything I have learned so far"),
      h("ol", { class: "sg-booklist" }, WEEKS.map((w) => {
        const m = inCopy(w) ? mission(w) : null, b = BANDITS[w], done = st.done[w], r = getRun(w), found = m ? m.stops.filter((x, i) => done || r.stops[i]) : [];
        return h("li", { class: "sg-bookrow" + (done ? " sg-solved" : "") },
          h("span", { class: "sg-booksticker" }, done && m ? A.sticker(m.badge.icon, m.badge.color) : A.sticker("lock", "#d9d5e8")),
          h("div", null, h("small", null, "Case " + w + " · " + skillOf("w" + w).name + (done && m ? " · " + m.badge.name : "")), h("b", null, m ? m.title : "Arrives " + arrives(w)), done ? starsEl(whole(done.stars)) : null,
            done && didForReal(w) ? h("span", { class: "sg-real" }, A.icon("check"), "Did it for real") : null,
            found.length ? h("ul", null, found.map((x) => h("li", null, h("b", null, x.clue.title + (/[.?!]$/.test(x.clue.title) ? " " : ". ")), k.fill(x.clue.text)))) : m && !done ? h("span", { class: "sg-fine" }, "Nothing learned here yet. " + A.cast[b.key].name + " is still out there.") : null));
      })),
      h("div", { class: "sg-meters" }, METERS.map((x) => h("div", { class: "sg-meter" }, A.icon(x.icon), h("b", null, x.fmt(t[x.key])), h("small", null, x.label)))),
      h("p", { class: "sg-fine" }, "Story numbers for a made-up company. Nothing here is a real result."));
    const badgeTab = () => h("div", null, badgeEl(a, s),
      h("h3", null, "What " + OWNER + " trusts me with"),
      h("ol", { class: "sg-permlist" }, LEVELS.map((L, i) => h("li", { class: i < s.level ? "sg-ok" : "sg-miss" }, A.icon(i < s.level ? "check" : "lock"), h("span", null, h("b", null, L.perm), h("small", null, "Level " + (i + 1) + " · " + L.title + (i < s.level ? "" : " · at " + L.at + " XP")))))),
      h("p", { class: "sg-fine" }, "Rule one never changes: " + RULE.charAt(0).toLowerCase() + RULE.slice(1)));
    function show(key) { tabBtns.forEach((b, i) => b.setAttribute("aria-pressed", tabs[i][0] === key ? "true" : "false")); body.innerHTML = ""; body.appendChild(key === "know" ? knowTab() : key === "badge" ? badgeTab() : skillsTab()); body.scrollTop = 0; }
    close = modal(k, h("div", { class: "sg-card sg-book sg-skills" }, h("div", { class: "sg-book-top" }, h("h2", null, A.icon("skills"), "Agent " + a.name), btn("Close", () => close())),
      h("div", { class: "sg-tabs", role: "group", "aria-label": "Skills panel" }, tabBtns), body, h("div", { class: "sg-row" }, btn("Close", () => close(), "sg-primary"))));
    show(tab || "skills");
  }

  // ── the finale: the whole town in color, the bandits in the net, the badge, the certificate ──
  function finale() {
    entered = true;
    const a = agent(), s = standing(), st = G.state(), have = WEEKS.filter(inCopy), left = have.filter((w) => !st.done[w]), n = doneCount(st), full = n >= TOTAL;
    const k = screen("final", { kicker: GAME + " · " + (full ? "Greenline is saved" : "The story so far"), task: full ? "You did it. The town is back in color." : "So far, so good. More cases are on the way.", stars: true });
    if (!S.playing()) S.music(true);
    if (!have.length || left.length) {
      k.backdrop("hq");
      const b = reply("Back to town", () => go("#/game"), "truck");
      stage.appendChild(h("div", { class: "sg-layer" }, h("div", { class: "sg-card" }, h("h2", null, "Not yet, Agent " + a.name),
        h("p", null, have.length ? left.length + (left.length === 1 ? " bandit is" : " bandits are") + " still loose in this copy. The finale opens when they are caught." : "This copy has no cases yet."), h("div", { class: "sg-row" }, b))));
      return k.focus(b);
    }
    const t = totals(st), got = have.reduce((x, w) => x + whole(st.done[w].stars), 0), mine = "Agent " + a.name;
    const when = have.map((w) => st.done[w].at).filter(Boolean).sort().pop(), date = new Date(when || Date.now());
    const shown = (isNaN(date) ? new Date() : date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    const who = h("div", { class: "sg-certname" }, st.name || mine);
    const name = h("input", { type: "text", id: "sg-certinput", maxlength: "40", autocomplete: "off", placeholder: mine, value: st.name, oninput: () => { const v = name.value.trim(); write("name", v); who.textContent = v || mine; } });
    const share = (full ? "I logged in as an AI agent and caught all eight Busywork Bandits in " + GAME + ", a little cartoon game about the jobs that eat a small business's week."
      : "I logged in as an AI agent and have caught " + n + " of the " + TOTAL + " Busywork Bandits in " + GAME + ", a little cartoon game about the jobs that eat a small business's week.")
      + " It comes from " + C.series + ", a free live class for people who run a small business: " + C.subscribe;
    const town = A.townMap("wide", {}); town.el.classList.add("sg-final-town");
    const cert = h("div", { class: "sg-cert" }, h("div", { class: "sg-certin" },
      h("div", { class: "sg-certstickers" }, have.map((w) => A.sticker(mission(w).badge.icon, mission(w).badge.color))),
      h("div", { class: "sg-certk" }, full ? "Certificate of completion" : "Certificate of progress"), h("div", { class: "sg-certsmall" }, "This is to say that"), who,
      h("div", { class: "sg-certsmall" }, full ? "caught all eight Busywork Bandits and gave " + TOWN + " its color back." : "is on the trail of the Busywork Bandits, with " + n + " of " + TOTAL + " in the net."),
      h("div", { class: "sg-certbig" }, GAME + ": " + SUB), h("div", { class: "sg-certrow" }, got + " of " + have.length * 3 + " stars · Level " + s.level + " · " + s.title),
      h("div", { class: "sg-certfoot" }, shown + " · " + C.series + ", a free live class by Mitchell B Consulting"),
      h("div", { class: "sg-certnote" }, C.business.name + " and everyone in it are made up. The ideas are real.")));
    const print = btn("Print the certificate", printCertificate, "sg-primary", "printer");
    stage.appendChild(h("div", { class: "sg-final" },
      h("div", { class: "sg-final-hero" }, town.el, A.word(full ? "SAVED!" : "SO FAR, SO GOOD", { color: full ? A.C.sun : "#fff" })),
      h("p", { class: "sg-final-lead" }, full ? "Eight bandits, eight cases, and the whole town is back in color. " + OWNER + " gets the evenings back, and I never pressed send." : "I have closed every case in this copy. Case " + (n + 1) + " arrives " + arrives(n + 1) + "."),
      h("h2", null, full ? "All eight, in the net" : "In the net so far"),
      h("ul", { class: "sg-lineup" }, WEEKS.map((w) => { const d = A.cast[BANDITS[w].key], done = st.done[w]; return h("li", { class: done ? "sg-solved" : "sg-loose" }, A.character(BANDITS[w].key, done ? { mood: "caught", net: true } : { mood: "sneaky" }), h("b", null, d.name), h("small", null, done ? "Caught" : "Still out there")); })),
      h("h2", null, "Who I am now"),
      h("div", { class: "sg-final-me" }, badgeEl(a, s), skillRows(s)),
      h("h2", null, "What changed at Greenline"),
      h("div", { class: "sg-meters" }, METERS.map((x) => h("div", { class: "sg-meter" }, A.icon(x.icon), h("b", null, x.fmt(t[x.key])), h("small", null, x.label))).concat([h("div", { class: "sg-meter" }, A.icon("star"), h("b", null, got + " of " + have.length * 3), h("small", null, "Stars · Level " + s.level + ", " + s.title))])),
      h("p", { class: "sg-fine" }, "Story numbers for a made-up company. Nothing here is a real result."),
      h("h2", null, "The certificate"),
      h("div", { class: "sg-certtools" }, h("label", { for: "sg-certinput" }, "Name on the certificate"), name, h("small", { class: "sg-fine" }, "Leave it empty to print your agent's name. It stays in this browser.")), cert,
      h("div", { class: "sg-row" }, print, btn("Copy a line to share", () => OH.copy(share, "Copied"), "", "chat"), btn("Back to town", () => go("#/game"), "", "truck")),
      h("div", { class: "sg-share" }, h("small", null, "What gets copied"), h("p", null, share))));
    town.truckTo(town.stop("hq"), 1);
    if (full) k.fx.confetti(70);
  }
  /* Print only the certificate: a class on <body> switches the print styles on, and comes off afterwards. */
  function printCertificate() {
    const off = () => { document.body.classList.remove("sg-printing"); window.removeEventListener("afterprint", off); };
    document.body.classList.add("sg-printing"); window.addEventListener("afterprint", off);
    window.print();
    if (!("onafterprint" in window)) off();
  }

  // ── what the shell calls ──
  /* Draw the game into `view`. `path` is what follows #/game/ : "" (entrance or town map), "m3", "done".
     Nothing past the entrance is shown to a player who has not logged in as an agent. */
  G.render = function (view, path) {
    mount(view); migrate(); sync();
    const m = /^m(\d+)$/.exec(path || ""), deep = m || path === "done";
    if (deep && !agent()) return login({ then: () => G.render(view, path) });
    if (m) return playCase(+m[1]);
    if (path === "done") return finale();
    if (!entered) return splash();
    townMap();
  };
  /* The shell calls this when the player goes anywhere that is not the game. */
  G.leave = function () {
    if (kit) kit.destroy(); kit = null;
    S.music(false);
    document.body.classList.remove("sg-on", "sg-printing");
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null; hudChip = null;
  };
  /* The invitation on the app's home screen. */
  G.homeEntry = function () {
    migrate();
    const a = sync(), st = G.state(), n = doneCount(st), s = standing(), back = !!a || st.started;
    return h("a", { class: "sg-home", href: "#/game" }, h("span", { class: "sg-home-art" }, A.avatar(a ? "agent" : "sprout", { mood: "glad" })),
      h("span", { class: "sg-home-text" }, h("span", { class: "sg-home-k" }, "Play the game"), h("b", null, GAME + ": " + SUB),
        h("small", null, back ? (a ? "Agent " + a.name + ". " : "") + "Level " + s.level + ", " + s.title + ". " + n + " of " + TOTAL + " bandits caught. Pick up where you left off."
          : "Log in as Greenline's new AI agent. Learn a skill a week, level up, and catch eight goofy bandits who steal the town's time.")),
      h("span", { class: "sg-home-cta" }, back ? "Continue" : "Play"));
  };
  G.bible = { game: GAME, sub: SUB, town: TOWN, weeks: WEEKS, meters: METERS, skills: SKILLS, levels: LEVELS, rule: RULE, standing: standing };
})();
