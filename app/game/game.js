/* Save Greenline: The Case of the Busywork Bandits · the engine.
   A cartoon adventure that teaches the same ideas as the eight weekly tools, and changes nothing in
   them. It runs in a full-window stage of its own (the app's header and footer are hidden while it
   is on) and has three addresses:
     #/game        the entrance (boot splash, title, menu), then the town map
     #/game/mN     case N: briefing, three clue stops, crack the case, the showdown, caught
     #/game/done   the finale: the town in color, the bandits in the net, the certificate

   The files:  art.js draws everything · sound.js makes every sound · kit.js is the toolbox a screen
   or a mini-game is handed · this file runs the story · missions/mN.js is one case each.
   Everything saved sits under "game:" keys in OH.store, in this browser only.
   GAME.md is the guide for mission authors. */
(function () {
  "use strict";
  if (!window.OH || !OH.course || !OH.game || !OH.game.art || !OH.game.makeKit) return;
  const h = OH.h, C = OH.course, G = OH.game, A = G.art, S = G.sound;
  const WEEKS = C.sessions.map((s) => s.week), TOTAL = WEEKS.length;
  const OWNER = String(C.business.owner || "The owner").split(" ")[0], TOWN = C.business.town || "Cedar Hollow";
  const GAME = "Save Greenline", SUB = "The Case of the Busywork Bandits";

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

  // ── saved state, all under "game:" ──
  //    game:started  true once a game has begun          game:sound  "on" or "off" (sound.js)
  //    game:name     the name on the certificate
  //    game:done     {week: {stars, at, last}}           a solved case; stars is the best so far
  //    game:run      {week: {phase, stops, wrong, sprout, at}}   a case in progress
  //    game:real     {week: true}                        the bonus sticker: did the job in the real tool
  const KEY = "game:";
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
  const rank = (n) => (n >= 8 ? "Greenline's hero" : n === 7 ? OWNER + "'s right hand" : n >= 5 ? "Senior detective" : n >= 3 ? "Detective" : n >= 1 ? "Junior detective" : "Rookie detective");

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
  function getRun(w) { const r = asMap(G.state().run[w]); return { phase: r.phase || "briefing", stops: Array.isArray(r.stops) ? r.stops : [], wrong: whole(r.wrong), sprout: typeof r.sprout === "boolean" ? r.sprout : null, at: r.at || "hq" }; }
  function setRun(w, patch) { const all = G.state().run; all[w] = Object.assign(getRun(w), patch); write("run", all); return all[w]; }
  function endRun(w) { const all = G.state().run; delete all[w]; write("run", all); }
  /* Up to three stars: the case is closed · Sprout's slip caught on the first try · few wrong picks. */
  function closeCase(w) {
    const m = mission(w), r = getRun(w), st = G.state(), had = st.done[w];
    const stars = 1 + (r.sprout === true ? 1 : 0) + (r.wrong <= m.maxWrong ? 1 : 0);
    st.done[w] = { stars: Math.max(stars, had ? whole(had.stars) : 0), at: (had && had.at) || new Date().toISOString(), last: { stars: stars, wrong: r.wrong, sprout: r.sprout === true } };
    write("done", st.done); endRun(w);
    return { stars: stars, best: st.done[w].stars, first: !had, wrong: r.wrong, sprout: r.sprout === true };
  }

  // ── the stage ──
  let host = null, root = null, hud = null, stage = null, kit = null;
  let entered = false;                                 // has the entrance been passed on this visit?
  let party = 0, burst = false;                        // a case just closed: the truck drives home, and a first win plays the color back
  let hudTimer = null, hudPips = null;

  function mount(view) {
    host = view;
    if (root && root.parentNode === host) return;
    hud = h("div", { class: "sg-hud" }); stage = h("div", { class: "sg-stage" });
    root = h("div", { class: "sg" }, A.defs(), hud, stage);
    host.appendChild(root); document.body.classList.add("sg-on");
  }
  /* Start a new screen: the old screen's kit is destroyed, the stage is emptied, a new kit comes back. */
  function screen(name, o) {
    o = o || {};
    if (kit) kit.destroy();
    root.querySelectorAll(".sg-modal, .sg-confetti").forEach((n) => n.remove());
    stage.innerHTML = ""; stage.className = "sg-stage sg-s-" + name;
    const w = o.week || 0;
    kit = G.makeKit(stage, { week: w, mission: w ? mission(w) : null,
      wrong: () => { if (w) setRun(w, { wrong: getRun(w).wrong + 1 }); },
      sprout: (first) => { if (w && getRun(w).sprout === null) setRun(w, { sprout: first }); },
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
  function drawHud(o) {
    hud.innerHTML = ""; hud.className = "sg-hud" + (o.bare ? " sg-bare" : ""); hudTimer = hudPips = null;
    hud.appendChild(o.week ? iconBtn("home", "Town map", () => go("#/game")) : iconBtn("exit", "Leave the game", () => { location.hash = "#/"; }));
    if (!o.bare) {
      hud.appendChild(h("div", { class: "sg-hudtitle" }, h("small", null, o.kicker || GAME), h("b", null, o.title || TOWN)));
      if (o.week) {
        const m = mission(o.week), r = getRun(o.week);
        hudPips = h("span", { class: "sg-pips", role: "img", "aria-label": "Clues found" }, m.stops.map((s, i) => h("i", { class: r.stops[i] || o.allClues ? "sg-on" : "" }, A.icon("magnifier"))));
        hud.appendChild(hudPips);
      } else if (o.stars) { const st = G.state(), got = WEEKS.reduce((a, w) => a + (st.done[w] ? whole(st.done[w].stars) : 0), 0); hud.appendChild(h("span", { class: "sg-hudstars", role: "img", "aria-label": got + " stars" }, A.icon("star"), h("b", null, String(got)))); }
      hudTimer = h("span", { class: "sg-hudtimer", hidden: true }); hud.appendChild(hudTimer);
      hud.appendChild(iconBtn("book", "Case book", caseBook, "sg-bookbtn"));
      if (!o.week) hud.appendChild(iconBtn("menu", "Menu", () => menu()));
    } else hud.appendChild(h("span", { class: "sg-spacer" }));
    hud.appendChild(soundBtn());
  }
  const hudFor = (w, extra) => Object.assign({ week: w, kicker: "Case " + w, title: mission(w).title }, extra);
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

  // ── the entrance: boot splash, title, menu ──
  function boot() {
    const k = screen("boot", { bare: true }); let gone = false;
    const next = () => { if (gone) return; gone = true; titleScreen(); };
    stage.appendChild(h("button", { class: "sg-boot", type: "button", "aria-label": "Skip the intro", onclick: next },
      h("span", { class: "sg-bootlogo" }, A.sticker("leaf", A.C.green)), h("span", { class: "sg-boottext" }, h("b", null, C.series), h("small", null, "presents"))));
    k.keys({ any: next, Enter: next, " ": next }); k.after(k.calm ? 900 : 2200, next);
  }
  /* The town behind the title and the menu: clouds drift, the truck idles, Sprout waves, a bandit peeks. */
  function titleBackdrop() {
    const sh = A.shape, bg = A.titleScene(); bg.classList.add("sg-bg"); stage.appendChild(bg);
    stage.appendChild(h("div", { class: "sg-title-tree" }, A.svg(sh.group(sh.at(0, 104, 1, A.characterMarkup("clutter")), 'class="sg-peeker"') + sh.at(280, 326, 2.5, A.prop("tree")) + sh.at(292, 332, 2.6, A.prop("bush")), { box: "0 0 380 334" })));
    stage.appendChild(h("div", { class: "sg-title-truck" }, A.svg(sh.at(112, 132, 1, sh.group(A.prop("truck"), 'class="sg-idle"')), { box: "0 0 224 140" })));
    stage.appendChild(h("div", { class: "sg-title-sprout" }, A.character("sprout", { mood: "glad", pose: "wave", flip: true })));
  }
  function titleScreen() {
    const k = screen("title", { bare: true }); titleBackdrop();
    const start = () => { S.unlock(); S.play("start"); menu(); };
    const b = h("button", { class: "sg-start", type: "button", onclick: start }, "PRESS START");
    stage.appendChild(h("div", { class: "sg-title-top" }, A.logo()));
    stage.appendChild(h("div", { class: "sg-title-bottom" }, b, h("small", null, "Click, tap or press Enter")));
    k.keys({ Enter: start, " ": start }); k.focus(b);
  }
  function newGame() { const off = S.muted(); OH.store.clear(KEY); write("sound", off ? "off" : "on"); write("started", true); party = 0; burst = false; entered = true; townMap(); }
  function menu() {
    const k = screen("menu", { bare: true }); titleBackdrop();
    if (!S.playing()) S.music(true);
    const st = G.state(), has = st.started || Object.keys(st.done).length > 0 || Object.keys(st.run).length > 0;
    const box = h("div", { class: "sg-menu" });
    stage.appendChild(h("div", { class: "sg-title-top sg-small" }, A.logo())); stage.appendChild(box);
    function main() {
      box.innerHTML = "";
      const sound = btn("", () => { S.mute(!S.muted()); if (!S.muted()) { S.unlock(); S.music(true); S.play("pop"); } drawHud({ bare: true }); main(); k.focus(box.querySelector(".sg-soundrow")); }, "sg-soundrow", S.muted() ? "mute" : "sound");
      sound.appendChild(document.createTextNode(S.muted() ? "Sound: off" : "Sound: on"));
      const first = has ? btn("Continue", () => { write("started", true); entered = true; townMap(); }, "sg-primary", "play") : btn("New game", newGame, "sg-primary", "play");
      box.appendChild(first);
      if (has) box.appendChild(btn("New game", ask, "", "star"));
      box.appendChild(sound); box.appendChild(btn("How to play", () => howTo(k), "", "magnifier"));
      k.focus(first);
    }
    function ask() {                                   // the in-page reset: a question, then two answers. Never a native dialog.
      box.innerHTML = "";
      const keep = btn("Keep my progress", main, "sg-primary");
      box.appendChild(h("p", { class: "sg-menu-ask" }, "Start a new game? Your stars and stickers will be cleared."));
      box.appendChild(btn("Yes, start over", newGame, "sg-danger")); box.appendChild(keep); k.focus(keep);
    }
    main();
  }
  function howTo(k) {
    const steps = [["truck", "Jordan briefs you at Greenline HQ. A Busywork Bandit is stealing the town's time."],
      ["magnifier", "Drive to three places. Each friend has one clue and one quick challenge."],
      ["hand", "Crack the case: pick the move that stops the bandit."],
      ["bolt", "Win the showdown with your hands. Then check Sprout's work. Sprout is always wrong about one thing."],
      ["star", "Catch the bandit, earn up to three stars, and bring the color back to town."]];
    let close = () => {};
    close = modal(k, h("div", { class: "sg-card sg-howto" }, h("h2", null, "How to play"),
      h("ol", null, steps.map((s) => h("li", null, h("span", { class: "sg-face" }, A.icon(s[0])), h("span", null, s[1])))),
      h("p", { class: "sg-fine" }, "Click or tap. Or use the keyboard: Enter, the arrow keys and the number keys. Your progress is saved in this browser."),
      h("div", { class: "sg-row" }, btn("Got it", () => close(), "sg-primary"))));
  }

  // ── the town map ──
  const wantsTall = () => stage.clientWidth < stage.clientHeight * 0.9;
  /* Draw the map into the stage, sized to fit, with a bar underneath. Returns the art.js map, plus
     pinAt(x, y, el) to lay a button over it and say(text, button) to fill the bar. */
  function buildMap(k, o) {
    const st = G.state(), layout = wantsTall() ? "tall" : "wide", gray = {}, peek = {};
    WEEKS.forEach((w) => { const b = BANDITS[w]; if (!b) return; if (!st.done[w]) { gray[b.zone] = true; if (inCopy(w)) peek[b.zone] = b.key; } else if (o.keepGray === w) gray[b.zone] = true; });
    const map = A.townMap(layout, { gray: gray, peek: peek });
    const wrap = h("div", { class: "sg-map sg-map-" + layout }, map.el), holder = h("div", { class: "sg-mapholder" }, wrap), bar = h("div", { class: "sg-mapbar" });
    stage.appendChild(holder); stage.appendChild(bar);
    const fit = () => { const s = Math.min(holder.clientWidth / map.w, holder.clientHeight / map.h); wrap.style.width = Math.floor(map.w * s) + "px"; wrap.style.height = Math.floor(map.h * s) + "px"; wrap.style.setProperty("--u", s + "px"); };
    map.say = (text, button, mood) => { bar.innerHTML = ""; bar.appendChild(h("span", { class: "sg-face" }, A.avatar("sprout", { mood: mood || "happy" }))); bar.appendChild(h("p", null, text)); if (button) { bar.appendChild(button); k.focus(button); } fit(); };
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
    const k = screen("map", { title: TOWN, kicker: GAME, stars: true });
    if (!S.playing()) S.music(true);
    const st = G.state(), have = WEEKS.filter(inCopy), next = have.find((w) => !st.done[w] && isOpen(w, st)), n = doneCount(st);
    const just = party && st.done[party] ? party : 0, color = just && burst; party = 0; burst = false;
    const map = buildMap(k, { keepGray: color ? just : 0, redraw: () => townMap(o) });
    WEEKS.forEach((w) => {
      const b = BANDITS[w]; if (!b) return;
      const p = map.pin(b.zone), done = st.done[w], state = done ? "done" : isOpen(w, st) ? "open" : inCopy(w) ? "locked" : "later";
      map.pinAt(p.x, p.y, h("button", { class: "sg-pin sg-pin-" + state, type: "button", "aria-label": "Case " + w + ", " + (done ? "solved" : state === "open" ? "ready to play" : state === "locked" ? "locked" : "arrives " + arrives(w)), onclick: () => { S.play("pop"); caseCard(k, w); } },
        h("b", null, String(w)), state === "done" ? starsEl(whole(done.stars)) : state === "open" ? h("small", null, "Play") : state === "locked" ? A.icon("lock") : A.icon("clock")));
    });
    const idle = () => {
      if (o.notice) map.say(o.notice, next ? btn("Play case " + next, () => caseCard(k, next), "sg-primary", "play") : null, "think");
      else if (next) map.say((getRun(next).phase !== "briefing" ? "We are in the middle of case " + next + ". " : "Case " + next + " is waiting: ") + mission(next).title + ".", btn(getRun(next).phase !== "briefing" ? "Back to the case" : "Play case " + next, () => caseCard(k, next), "sg-primary", "play"), "glad");
      else if (have.length && have.every((w) => st.done[w])) map.say(n >= TOTAL ? "All eight bandits are in the net. The whole town is back in color!" : "Every case in this copy is solved. Case " + (n + 1) + " arrives " + arrives(n + 1) + ".", btn(n >= TOTAL ? "See the finale" : "See how far you have come", () => go("#/game/done"), "sg-primary", "star"), "proud");
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
      h("div", { class: "sg-casename" }, h("small", null, "Case " + w), h("b", null, m ? m.title : session(w).tool)),
      done ? starsEl(whole(done.stars), "sg-big") : null,
      done && didForReal(w) ? h("p", { class: "sg-fine" }, "Bonus sticker: you did this job for real in the week " + w + " tool.") : null,
      !here ? h("p", { class: "sg-fine" }, "This case arrives " + arrives(w) + ". A new one lands every Wednesday.") : !open && !done ? h("p", { class: "sg-fine" }, "Solve case " + (w - 1) + " first.") : null,
      h("div", { class: "sg-row" },
        here && (open || done) ? btn(mid ? "Back to the case" : done ? "Play it again" : "Take the case", play, "sg-primary", "play") : null,
        done && OH.modules[w] ? h("a", { class: "sg-btn", href: "#/w" + w }, "Try it for real") : null,
        btn("Close", () => close(), here && (open || done) ? "" : "sg-primary")));
    close = modal(k, card);
  }

  // ── a case ──
  function playCase(w) {
    const m = mission(w), st = G.state();
    if (!m || !inCopy(w)) return townMap({ notice: session(w).week ? "Case " + w + " is not in this copy yet. It arrives " + arrives(w) + "." : "There is no such case." });
    if (!st.done[w] && !isOpen(w, st)) return townMap({ notice: "Case " + w + " opens when case " + (w - 1) + " is solved." });
    entered = true; if (!st.started) write("started", true);
    const r = getRun(w);
    if (r.phase === "stops") return stopsMap(w);
    if (r.phase === "crack") return crack(w);
    if (r.phase === "showdown") return showdownIntro(w);
    briefing(w);
  }
  /* One talking scene: a backdrop, a cast, optional setup(kit) for extra art, then the lines.
     The place is drawn gray while it is this case's zone and the bandit is still loose. */
  function playScene(k, sc, fallback, w) {
    const m = mission(w), d = Array.isArray(sc) ? { lines: sc } : (sc || {}), place = d.place || fallback.place;
    k.backdrop(place, { gray: place === m.zone && !G.state().done[w] });
    k.cast(d.cast || fallback.cast);
    if (typeof d.setup === "function") { try { d.setup(k); } catch (e) { if (window.console) console.error(e); } }
    return k.say(d.lines || []);
  }
  async function briefing(w) {
    const m = mission(w), k = screen("talk", hudFor(w));
    setRun(w, { phase: "briefing", stops: [], wrong: 0, sprout: null, at: "hq" });
    await playScene(k, m.briefing, { place: "hq", cast: [{ who: "jordan", side: "left", mood: "worried" }, { who: "sprout", side: "right" }] }, w);
    await k.choose([{ label: "To the truck!", icon: "truck" }]);
    setRun(w, { phase: "stops" }); stopsMap(w);
  }
  /* The town map during a case: a pin on each clue stop, then the way back to HQ. */
  function stopsMap(w) {
    const m = mission(w), r = getRun(w), k = screen("map", hudFor(w));
    if (!S.playing()) S.music(true);
    const map = buildMap(k, { redraw: () => stopsMap(w) });
    let busy = false;
    const left = m.stops.map((s, i) => i).filter((i) => !r.stops[i]);
    const leave = (place, then) => { if (busy) return; busy = true; map.say("Off we go. Luis is driving.", null, "glad"); drive(k, map, r.at, place, () => { setRun(w, { at: place }); then(); }); };
    m.stops.forEach((s, i) => {
      const p = map.pin(s.place), place = A.places[s.place];
      map.pinAt(p.x, p.y, h("button", { class: "sg-pin " + (r.stops[i] ? "sg-pin-found" : "sg-pin-clue"), type: "button", disabled: !!r.stops[i], "aria-label": "Clue " + (i + 1) + " at " + place.name + (r.stops[i] ? ", found" : ""), onclick: () => leave(s.place, () => stop(w, i)) },
        r.stops[i] ? A.icon("check") : A.icon("magnifier"), h("small", null, r.stops[i] ? "Found" : "Clue " + (i + 1))));
    });
    map.truckTo(map.stop(r.at), 1);
    const names = { 1: "One more clue", 2: "Two more clues", 3: "Three clues" };
    if (left.length) {
      const i = left[0], place = A.places[m.stops[i].place];
      map.say(left.length === m.stops.length ? "Three places to visit. Each one has a clue. Tap a pin, or press 1, 2 or 3." : (names[left.length] || left.length + " more clues") + " to find.", btn("Drive to " + place.name, () => leave(m.stops[i].place, () => stop(w, i)), "sg-primary", "truck"));
      const keys = {}; m.stops.forEach((s, n) => { if (!r.stops[n]) keys[String(n + 1)] = () => leave(s.place, () => stop(w, n)); }); k.keys(keys);
    } else {
      const p = map.pin("hq"), home = () => leave("hq", () => { setRun(w, { phase: m.crack ? "crack" : "showdown" }); if (m.crack) crack(w); else showdownIntro(w); });
      map.pinAt(p.x, p.y, h("button", { class: "sg-pin sg-pin-open", type: "button", "aria-label": "Back to Greenline HQ", onclick: home }, A.icon("star"), h("small", null, "HQ")));
      map.say("All the clues are in the case book. Back to HQ!", btn(m.crack ? "Crack the case" : "To the showdown", home, "sg-primary", "truck"), "proud");
    }
  }
  /* A clue stop: a friend talks, a quick challenge, a clue for the case book. */
  async function stop(w, i) {
    const m = mission(w), s = m.stops[i], who = s.who || A.places[s.place].host || "sprout", k = screen("talk", hudFor(w));
    await playScene(k, { place: s.place, cast: s.cast || [{ who: who, side: "left" }, { who: "sprout", side: "right" }], setup: s.setup, lines: s.lines }, {}, w);
    await challenge(k, Object.assign({ who: who }, s.challenge));
    await clueCard(k, s.clue, i, m.stops.length);
    const stops = getRun(w).stops.slice(); stops[i] = 1; setRun(w, { stops: stops });
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
  function clueCard(k, clue, i, of) {
    return new Promise((resolve) => {
      k.hush(); S.play("clue");
      const card = h("div", { class: "sg-clue" }, h("span", { class: "sg-clue-pin" }, A.icon("magnifier")), h("div", { class: "sg-kicker" }, "Clue " + (i + 1) + " of " + of), h("h2", null, clue.title), h("p", null, clue.text));
      const layer = h("div", { class: "sg-layer" }, card);
      card.appendChild(h("div", { class: "sg-row" }, btn("Put it in the case book", () => {
        S.play("star"); if (hudPips && hudPips.children[i]) { hudPips.children[i].className = "sg-on"; k.fx.pop(hudPips.children[i]); }
        k.fx.fly(card, hud.querySelector(".sg-bookbtn"), () => { layer.remove(); resolve(); });
      }, "sg-primary", "book")));
      stage.appendChild(layer); k.fx.pop(card); k.focus(card.querySelector("button"));
    });
  }
  /* Crack the case: three cartoon cards, one right move. A wrong pick gets a reaction and another try. */
  async function crack(w) {
    const m = mission(w), c = m.crack, k = screen("talk", hudFor(w, { allClues: true }));
    await playScene(k, { place: c.place || "hq", cast: c.cast, lines: c.lines }, { place: "hq", cast: [{ who: "jordan", side: "left" }, { who: "sprout", side: "right" }] }, w);
    const p = k.panel({ kicker: "Crack the case", title: c.ask, class: "sg-wide" }); let solved = false;
    const react = (r, tone, extra) => { p.foot.innerHTML = ""; p.foot.className = "sg-panel-foot sg-react sg-" + tone; if (r && r.who && A.cast[r.who]) p.foot.appendChild(h("span", { class: "sg-face", style: "background:" + A.cast[r.who].tag }, A.avatar(r.who, { mood: r.mood }))); p.foot.appendChild(h("span", null, r && r.who && A.cast[r.who] ? h("b", null, A.cast[r.who].name + ": ") : null, (r && r.say) || "")); if (extra) p.foot.appendChild(extra); k.fx.pop(p.foot); };
    const cards = c.cards.map((card, n) => h("button", { class: "sg-pickcard", type: "button", onclick: () => pick(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)),
      h("span", { class: "sg-pickart", style: "background:" + (card.color || [A.C.pink, A.C.sun, A.C.teal][n % 3]) }, card.art ? A.svg(card.art, { box: card.box || "0 0 120 120" }) : A.icon(card.icon || "star")), h("b", null, card.title), h("span", null, card.text)));
    function pick(n) {
      const card = c.cards[n], b = cards[n]; if (solved || b.disabled) return;
      if (!card.right) { b.disabled = true; b.classList.add("sg-no"); k.focusNext(cards, n); k.fx.shake(b); k.score.wrong(); return react(card.react || { say: "Not that one. Try another." }, "bad"); }
      solved = true; b.classList.add("sg-yes"); cards.forEach((x) => { if (x !== b) x.disabled = true; }); k.score.right();
      b.appendChild(h("span", { class: "sg-stamp" }, "Cracked!"));
      const on = btn("To the showdown", () => { setRun(w, { phase: "showdown" }); showdownIntro(w); }, "sg-primary", "bolt");
      react(card.react || { say: "That's the move." }, "ok", on); k.focus(on);
    }
    p.body.appendChild(h("div", { class: "sg-pickcards" }, cards));
    const keys = {}; cards.forEach((b, n) => { keys[String(n + 1)] = () => pick(n); }); k.keys(keys); k.focus(cards[0]);
  }
  function showdownIntro(w) {
    const m = mission(w), k = screen("vs", hudFor(w, { allClues: true })), d = A.cast[m.bandit];
    const go2 = btn("Go!", () => showdownPlay(w), "sg-primary sg-huge", "bolt");
    stage.appendChild(h("div", { class: "sg-vs" }, h("div", { class: "sg-rays", "aria-hidden": "true" }),
      h("div", { class: "sg-vs-row" }, h("div", { class: "sg-vs-side" }, A.character(m.bandit, { mood: "glad" }), h("b", { style: "background:" + d.tag }, d.name)),
        A.word("VS", { color: "#fff" }), h("div", { class: "sg-vs-side" }, A.character("sprout", { mood: "glad", pose: "cheer", flip: true }), h("b", { style: "background:" + A.cast.sprout.tag }, "You and Sprout"))),
      h("div", { class: "sg-card sg-vs-card" }, h("div", { class: "sg-kicker" }, "The showdown"), h("h2", null, m.showdown.title),
        h("ul", null, [].concat(m.showdown.how || []).map((x) => h("li", null, x))), h("div", { class: "sg-row" }, go2))));
    S.play("whoosh"); k.focus(go2);
  }
  /* The showdown is the mission's own mini-game: play(kit, done). The engine gives it a clean stage and
     takes over again when it calls done(). */
  function showdownPlay(w) {
    const m = mission(w), k = screen("play", hudFor(w, { allClues: true })); let over = false;
    S.music(false);
    const done = () => { if (over) return; over = true; caught(w); };
    const oops = (e) => {
      if (over) return; if (window.console) console.error(e);
      stage.appendChild(h("div", { class: "sg-layer" }, h("div", { class: "sg-card" }, h("h2", null, "The showdown tripped over its own feet"), h("p", null, "Sorry about that. You can still close the case."), h("div", { class: "sg-row" }, btn("Catch the bandit anyway", done, "sg-primary")))));
    };
    try { const r = m.showdown.play(k, done); if (r && typeof r.catch === "function") r.catch(oops); } catch (e) { oops(e); }
  }
  /* Caught: the net drops, the place gets its color back, a debrief, then the stars and the sticker. */
  async function caught(w) {
    const m = mission(w), res = closeCase(w), k = screen("caught", hudFor(w, { allClues: true }));
    const gray = k.backdrop(m.zone, { gray: res.first });
    const perp = h("div", { class: "sg-perp" }, A.character(m.bandit, { mood: "surprised" })); stage.appendChild(perp);
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
    const home = () => { party = w; burst = res.first; go("#/game"); };
    const card = h("div", { class: "sg-card sg-results" }, h("div", { class: "sg-kicker" }, "Case " + w + " closed"), h("h2", null, A.cast[m.bandit].name + " is in the net"), stars,
      h("ul", { class: "sg-rules" }, rule(true, "You closed the case."), rule(res.sprout, res.sprout ? "You caught Sprout's slip on the first try." : "Catch Sprout's slip on the first try for this star."),
        rule(res.wrong <= m.maxWrong, res.wrong === 0 ? "Not one wrong pick." : res.wrong <= m.maxWrong ? "Only " + res.wrong + " wrong " + (res.wrong === 1 ? "pick" : "picks") + "." : res.wrong + " wrong picks. " + m.maxWrong + " or fewer earns this star.")),
      h("div", { class: "sg-earned" }, sticker, h("div", null, h("small", null, "New sticker"), h("b", null, m.badge.name), gains(m).map((g) => h("span", { class: "sg-gain" }, g)), gains(m).length ? h("small", null, "Story numbers for a made-up company.") : null)),
      m.next && inCopy(next) ? h("p", { class: "sg-teaser" }, m.next) : next <= TOTAL && !inCopy(next) ? h("p", { class: "sg-teaser" }, "Case " + next + " arrives " + arrives(next) + ".") : null,
      res.best > res.stars ? h("p", { class: "sg-fine" }, "Your best for this case is still " + res.best + " stars.") : null,
      h("div", { class: "sg-row" }, btn("Drive home", home, "sg-primary", "truck"), OH.modules[w] ? h("a", { class: "sg-btn", href: "#/w" + w }, "Try it for real") : null));
    modal(k, card, { dismiss: false });
    for (let i = 0; i < res.stars; i++) k.after(350 + i * 380, () => { const s = stars.children[i]; s.className = "sg-on"; s.innerHTML = ""; s.appendChild(A.icon("star")); k.fx.pop(s); S.play("star"); });
    k.after(500 + res.stars * 380, () => { sticker.classList.add("sg-stuck"); S.play("sticker"); });
  }

  // ── the case book: every case, its sticker, its stars and its clues ──
  function caseBook() {
    if (!kit) return;
    const k = kit, st = G.state(), t = totals(st), n = doneCount(st); let close = () => {};
    const rows = WEEKS.map((w) => {
      const m = inCopy(w) ? mission(w) : null, b = BANDITS[w], done = st.done[w], r = getRun(w), found = m ? m.stops.filter((s, i) => done || r.stops[i]) : [];
      return h("li", { class: "sg-bookrow" + (done ? " sg-solved" : "") },
        h("span", { class: "sg-booksticker" }, done && m ? A.sticker(m.badge.icon, m.badge.color) : A.sticker("lock", "#d9d5e8")),
        h("div", null, h("small", null, "Case " + w + (done && m ? " · " + m.badge.name : "")), h("b", null, m ? m.title : "Arrives " + arrives(w)), done ? starsEl(whole(done.stars)) : null,
          done && didForReal(w) ? h("span", { class: "sg-real" }, A.icon("check"), "Did it for real") : null,
          found.length ? h("ul", null, found.map((s) => h("li", null, h("b", null, s.clue.title + (/[.?!]$/.test(s.clue.title) ? " " : ". ")), s.clue.text))) : m && !done ? h("span", { class: "sg-fine" }, A.cast[b.key].name + " is still out there.") : null));
    });
    close = modal(k, h("div", { class: "sg-card sg-book" }, h("div", { class: "sg-book-top" }, h("h2", null, A.icon("book"), "Case book"), btn("Close", () => close())),
      h("p", { class: "sg-rankline" }, h("b", null, rank(n)), " · " + n + " of " + TOTAL + " cases solved"),
      h("div", { class: "sg-meters" }, METERS.map((x) => h("div", { class: "sg-meter" }, A.icon(x.icon), h("b", null, x.fmt(t[x.key])), h("small", null, x.label)))),
      h("p", { class: "sg-fine" }, "Story numbers for a made-up company. Nothing here is a real result."),
      h("ol", { class: "sg-booklist" }, rows), h("div", { class: "sg-row" }, btn("Close", () => close(), "sg-primary"))));
  }

  // ── the finale: the whole town in color, the bandits in the net, the meters, the certificate ──
  function finale() {
    entered = true;
    const st = G.state(), have = WEEKS.filter(inCopy), left = have.filter((w) => !st.done[w]), n = doneCount(st), full = n >= TOTAL;
    const k = screen("final", { title: full ? "Greenline is saved" : "The story so far", kicker: GAME, stars: true });
    if (!S.playing()) S.music(true);
    if (!have.length || left.length) {
      k.backdrop("hq");
      const b = btn("Back to town", () => go("#/game"), "sg-primary", "truck");
      stage.appendChild(h("div", { class: "sg-layer" }, h("div", { class: "sg-card" }, h("h2", null, "Not yet, detective"),
        h("p", null, have.length ? left.length + (left.length === 1 ? " bandit is" : " bandits are") + " still loose in this copy. The finale opens when they are caught." : "This copy has no cases yet."), h("div", { class: "sg-row" }, b))));
      return k.focus(b);
    }
    const t = totals(st), got = have.reduce((a, w) => a + whole(st.done[w].stars), 0);
    const when = have.map((w) => st.done[w].at).filter(Boolean).sort().pop(), date = new Date(when || Date.now());
    const shown = (isNaN(date) ? new Date() : date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    const who = h("div", { class: "sg-certname" }, st.name || "The office detective");
    const name = h("input", { type: "text", id: "sg-certinput", maxlength: "40", autocomplete: "off", placeholder: "Your name", value: st.name, oninput: () => { const v = name.value.trim(); write("name", v); who.textContent = v || "The office detective"; } });
    const share = (full ? "I caught all eight Busywork Bandits in " + GAME + ", a little cartoon game about the jobs that eat a small business's week."
      : "I have caught " + n + " of the " + TOTAL + " Busywork Bandits in " + GAME + ", a little cartoon game about the jobs that eat a small business's week.")
      + " It comes from " + C.series + ", a free live class for people who run a small business: " + C.subscribe;
    const town = A.townMap("wide", {}); town.el.classList.add("sg-final-town");
    const cert = h("div", { class: "sg-cert" }, h("div", { class: "sg-certin" },
      h("div", { class: "sg-certstickers" }, have.map((w) => A.sticker(mission(w).badge.icon, mission(w).badge.color))),
      h("div", { class: "sg-certk" }, full ? "Certificate of completion" : "Certificate of progress"), h("div", { class: "sg-certsmall" }, "This is to say that"), who,
      h("div", { class: "sg-certsmall" }, full ? "caught all eight Busywork Bandits and gave " + TOWN + " its color back." : "is on the trail of the Busywork Bandits, with " + n + " of " + TOTAL + " in the net."),
      h("div", { class: "sg-certbig" }, GAME + ": " + SUB), h("div", { class: "sg-certrow" }, got + " of " + have.length * 3 + " stars · " + rank(n)),
      h("div", { class: "sg-certfoot" }, shown + " · " + C.series + ", a free live class by Mitchell B Consulting"),
      h("div", { class: "sg-certnote" }, C.business.name + " and everyone in it are made up. The ideas are real.")));
    const print = btn("Print the certificate", printCertificate, "sg-primary", "printer");
    stage.appendChild(h("div", { class: "sg-final" },
      h("div", { class: "sg-final-hero" }, town.el, A.word(full ? "SAVED!" : "SO FAR, SO GOOD", { color: full ? A.C.sun : "#fff" })),
      h("p", { class: "sg-final-lead" }, full ? "Eight bandits, eight cases, and the whole town is back in color. " + OWNER + " gets the evenings back." : "Every case in this copy is solved. Case " + (n + 1) + " arrives " + arrives(n + 1) + "."),
      h("h2", null, full ? "All eight, in the net" : "In the net so far"),
      h("ul", { class: "sg-lineup" }, WEEKS.map((w) => { const d = A.cast[BANDITS[w].key], done = st.done[w]; return h("li", { class: done ? "sg-solved" : "sg-loose" }, A.character(BANDITS[w].key, done ? { mood: "caught", net: true } : { mood: "sneaky" }), h("b", null, d.name), h("small", null, done ? "Caught" : "Still out there")); })),
      h("h2", null, "What changed at Greenline"),
      h("div", { class: "sg-meters" }, METERS.map((x) => h("div", { class: "sg-meter" }, A.icon(x.icon), h("b", null, x.fmt(t[x.key])), h("small", null, x.label))).concat([h("div", { class: "sg-meter" }, A.icon("star"), h("b", null, got + " of " + have.length * 3), h("small", null, "Stars · " + rank(n)))])),
      h("p", { class: "sg-fine" }, "Story numbers for a made-up company. Nothing here is a real result."),
      h("h2", null, "Your certificate"),
      h("div", { class: "sg-certtools" }, h("label", { for: "sg-certinput" }, "Name on the certificate"), name), cert,
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
  /* Draw the game into `view`. `path` is what follows #/game/ : "" (entrance or town map), "m3", "done". */
  G.render = function (view, path) {
    mount(view);
    const m = /^m(\d+)$/.exec(path || "");
    if (m) return playCase(+m[1]);
    if (path === "done") return finale();
    if (!entered) return boot();
    townMap();
  };
  /* The shell calls this when the player goes anywhere that is not the game. */
  G.leave = function () {
    if (kit) kit.destroy(); kit = null;
    S.music(false);
    document.body.classList.remove("sg-on", "sg-printing");
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
  };
  /* The invitation on the app's home screen. */
  G.homeEntry = function () {
    const st = G.state(), n = doneCount(st);
    return h("a", { class: "sg-home", href: "#/game" }, h("span", { class: "sg-home-art" }, A.avatar("sprout", { mood: "glad" })),
      h("span", { class: "sg-home-text" }, h("span", { class: "sg-home-k" }, "Play the game"), h("b", null, GAME + ": " + SUB),
        h("small", null, st.started ? n + " of " + TOTAL + " bandits caught. " + rank(n) + ". Pick up where you left off." : "Eight goofy bandits are stealing the town's time. Catch one a week, with a robot sidekick who is always wrong about one thing.")),
      h("span", { class: "sg-home-cta" }, st.started ? "Continue" : "Play"));
  };
  G.bible = { game: GAME, sub: SUB, town: TOWN, weeks: WEEKS, meters: METERS, rank: rank };
})();
