/* Save Greenline · the kit.
   The toolbox every screen and every mini-game is given: timers, keys, drag, the dialogue system,
   panels, effects and the scoring hooks. A kit belongs to one screen. When the screen changes the
   engine calls kit.destroy(), and every timer, listener and style the kit handed out is removed, so
   a mini-game never has to tidy up after itself.

   This file also holds the four built-in quick challenges (pick, sort, tap, spot) that a clue stop
   can ask for by name. A mission can add a type of its own to OH.game.challenges.
   The whole API is listed in GAME.md. */
(function () {
  "use strict";
  if (!window.OH || !OH.game || !OH.game.art) return;
  const h = OH.h, G = OH.game, A = G.art;
  const S = (G.sound = G.sound || { play() {}, music() {}, unlock() {}, mute() {}, muted: () => true, tone() {}, noise() {}, playing: () => false });
  const calm = (G.calm = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches));
  const speed = () => Math.max(0.1, Number(G.speed) || 1);            // for testing: OH.game.speed = 6 plays everything six times faster
  const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  const BIN_COLORS = [A.C.red, A.C.sun, A.C.blue, A.C.purple, A.C.green, A.C.orange];
  /* kit.fx.pop and kit.fx.shake, frame for frame the same as the keyframes sg-pop and sg-shake in game.css. */
  const frames = (easing, list) => list.map((f) => ({ offset: f[0], transform: f[1], easing: easing }));
  const EFFECTS = {
    "sg-pop": { ms: 320, frames: frames("cubic-bezier(.2,1.4,.4,1)", [[0, "scale(.72)"], [0.55, "scale(1.1)"], [1, "scale(1)"]]) },
    "sg-shake": { ms: 380, frames: frames("ease", [[0, "translateX(0)"], [0.2, "translateX(-9px) rotate(-2deg)"], [0.4, "translateX(8px) rotate(2deg)"], [0.6, "translateX(-6px)"], [0.8, "translateX(4px)"], [1, "translateX(0)"]]) }
  };

  G.makeKit = function (stage, hooks) {
    hooks = hooks || {};
    const offs = [], keymaps = [], still = calm();
    let dead = false, talk = null, actorsEl = null, bubble = null, actors = {}, layer = null;
    const kit = { stage: stage, h: h, art: A, sound: S, calm: still, mission: hooks.mission || null, week: hooks.week || 0 };
    const root = () => stage.closest(".sg") || stage;
    const playing = new WeakMap();                                      // the pop or shake now running on an element (see kit.fx)
    const stopEffect = (el) => { const a = playing.get(el); if (a) { playing.delete(el); try { a.cancel(); } catch (e) { /* already over */ } } };

    // ── time ──
    kit.onCleanup = (fn) => { offs.push(fn); };
    kit.after = (ms, fn) => { const id = setTimeout(() => { if (!dead) fn(); }, ms / speed()); offs.push(() => clearTimeout(id)); return id; };
    kit.every = (ms, fn) => { const id = setInterval(() => { if (!dead) fn(); }, ms / speed()); const off = () => clearInterval(id); offs.push(off); return off; };
    kit.wait = (ms) => new Promise((res) => kit.after(ms, res));
    /* fn(seconds since start, seconds since last frame). Return false to stop. */
    kit.frame = (fn) => {
      let id = 0, on = true, last = performance.now(); const t0 = last;
      const loop = (t) => { if (!on || dead) return; const dt = Math.min(0.05, (t - last) / 1000); last = t; if (fn((t - t0) / 1000, dt) === false) { on = false; return; } id = requestAnimationFrame(loop); };
      id = requestAnimationFrame(loop);
      const off = () => { on = false; cancelAnimationFrame(id); }; offs.push(off); return off;
    };
    /* fn(p) with p easing from 0 to 1 over ms. With reduced motion it jumps straight to 1. */
    kit.tween = (ms, fn, done) => {
      ms = ms / speed();
      if (still || ms <= 0) { fn(1); if (done) done(); return () => {}; }
      const t0 = performance.now();
      return kit.frame(() => { const p = Math.min(1, (performance.now() - t0) / ms); fn(ease(p)); if (p >= 1) { if (done) done(); return false; } });
    };
    /* A clock in the HUD. {seconds: 30} counts down and calls onEnd; {up: true} counts up. */
    kit.timer = (o) => {
      o = o || {};
      let ran = 0, last = performance.now(), on = true, ended = false;
      const value = () => (o.up || !o.seconds ? Math.floor(ran) : Math.max(0, Math.ceil(o.seconds - ran)));
      const paint = () => { const v = value(); if (o.show !== false && hooks.timer) hooks.timer(Math.floor(v / 60) + ":" + String(v % 60).padStart(2, "0")); if (o.onTick) o.onTick(v); };
      const stop = kit.every(200, () => {
        const now = performance.now(); if (on) ran += (now - last) / 1000 * speed(); last = now; paint();
        if (on && !o.up && o.seconds && ran >= o.seconds && !ended) { ended = true; on = false; if (o.onEnd) o.onEnd(); }
      });
      paint();
      return { stop: () => { on = false; stop(); }, pause: () => { on = false; }, resume: () => { last = performance.now(); on = true; }, value: value, seconds: () => ran, hide: () => { if (hooks.timer) hooks.timer(""); } };
    };

    // ── input ──
    kit.on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); const off = () => target.removeEventListener(type, fn, opts); offs.push(off); return off; };
    /* kit.keys({"1": fn, Enter: fn, ArrowLeft: fn, any: fn}). The newest map wins. Enter and Space
       are left alone while a button has the focus, so a focused button still works. Arrow keys that
       no map claims move the focus from button to button. Returns a function that removes the map. */
    kit.keys = (map) => { keymaps.push(map); return () => { const i = keymaps.indexOf(map); if (i >= 0) keymaps.splice(i, 1); }; };
    function focusables() {
      const modals = root().querySelectorAll(".sg-modal"), scope = modals.length ? modals[modals.length - 1] : root();
      return Array.prototype.filter.call(scope.querySelectorAll("button:not([disabled]), a[href], input"), (n) => n.getClientRects().length > 0);
    }
    /* Nothing has the focus (a button was switched off under it): start again inside what the player
       is looking at, the panel if one is up, else the stage, and only then the HUD. */
    function home(list, dir) {
      const panels = stage.querySelectorAll(".sg-layer"), scopes = [panels.length ? panels[panels.length - 1] : null, stage];
      for (let s = 0; s < scopes.length; s++) { const inside = scopes[s] ? list.filter((n) => scopes[s].contains(n)) : []; if (inside.length) return inside[dir > 0 ? 0 : inside.length - 1]; }
      return list[dir > 0 ? 0 : list.length - 1];
    }
    function rove(dir) {
      const list = focusables(); if (!list.length) return;
      const i = list.indexOf(document.activeElement);
      (i < 0 ? home(list, dir) : list[(i + dir + list.length) % list.length]).focus();
    }
    kit.on(window, "keydown", (ev) => {
      if (dead || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const tag = ev.target && ev.target.tagName, key = ev.key;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const native = (key === "Enter" || key === " ") && (tag === "BUTTON" || tag === "A");
      if (!native) for (let i = keymaps.length - 1; i >= 0; i--) {
        const m = keymaps[i], f = m[key] || (key.length === 1 && m[key.toLowerCase()]) || (!/^(Tab|Shift|Escape|Control|Alt|Meta|CapsLock)$/.test(key) && !/^Arrow/.test(key) && m.any);
        if (f) { if (f(ev) !== false) ev.preventDefault(); return; }
        if (m.block) break;                                // a card over everything: the keys of the screen beneath it rest
      }
      if (/^Arrow/.test(key)) { rove(key === "ArrowRight" || key === "ArrowDown" ? 1 : -1); ev.preventDefault(); }
    });
    kit.focus = (el) => { if (el && el.focus) try { el.focus({ preventScroll: true }); } catch (e) { /* an old browser */ } };
    /* list[from] was just switched off. If the focus was on it (or nowhere), move it to the next live
       button in `list`, so the arrow keys carry on from inside the challenge and not from the HUD. */
    kit.focusNext = (list, from) => {
      const had = document.activeElement, n = list.length;
      if (had && had !== document.body && had !== list[from] && !had.disabled && had.isConnected) return;   // the focus is on something live: leave it there
      for (let i = 1; i <= n; i++) { const b = list[(from + i) % n]; if (b && !b.disabled && b.isConnected) return kit.focus(b); }
    };
    /* Drag `el` with a mouse or a finger. zones: elements it can be dropped on (or a function that
       returns them). onDrop(zone or null, el): return true to keep el where it was let go; anything
       else sends it back where it started. The zone under the pointer gets the class sg-over. */
    kit.drag = (el, o) => {
      o = o || {}; el.style.touchAction = "none";
      let start = null, over = null;
      const zones = () => (typeof o.zones === "function" ? o.zones() : o.zones || []);
      const hit = (x, y) => zones().find((z) => { const r = z.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }) || null;
      const setOver = (z) => { if (z === over) return; if (over) over.classList.remove("sg-over"); over = z; if (z) z.classList.add("sg-over"); if (o.onOver) o.onOver(z); };
      kit.on(el, "pointerdown", (ev) => {
        if (ev.button > 0 || (o.disabled && o.disabled())) return;
        start = { x: ev.clientX, y: ev.clientY, id: ev.pointerId, moved: false };
        try { el.setPointerCapture(ev.pointerId); } catch (e) { /* not captured: moves still arrive while over el */ }
      });
      kit.on(el, "pointermove", (ev) => {
        if (!start || ev.pointerId !== start.id) return;
        const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
        if (!start.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
        if (!start.moved) { start.moved = true; stopEffect(el); el.classList.add("sg-dragging"); if (o.onStart) o.onStart(el); }
        el.style.transition = "none"; el.style.transform = "translate(" + dx + "px," + dy + "px) rotate(" + Math.max(-8, Math.min(8, dx / 18)) + "deg)";
        setOver(hit(ev.clientX, ev.clientY));
      });
      const up = (ev) => {
        if (!start || ev.pointerId !== start.id) return;
        const moved = start.moved; start = null; el.classList.remove("sg-dragging");
        const z = moved ? hit(ev.clientX, ev.clientY) : null; setOver(null);
        el.style.transition = "";
        if (!moved) return;
        const eat = (c) => { c.stopPropagation(); c.preventDefault(); };                  // a drag is not also a tap
        el.addEventListener("click", eat, true); setTimeout(() => el.removeEventListener("click", eat, true), 60);
        if (!(o.onDrop && o.onDrop(z, el) === true)) el.style.transform = "";
      };
      kit.on(el, "pointerup", up); kit.on(el, "pointercancel", up);
    };

    // ── effects ──
    /* pop and shake. The class goes on as before (game.css animates it, and a mission may style it).
       The effect is also played as a script animation, which sits above every CSS animation: so it
       shows even on an element whose own class sets `animation`, and that animation carries on
       afterwards. With reduced motion only the class is set, and game.css makes that instant. */
    function effect(el, name) {
      if (!el) return;
      el.classList.remove(name); void el.offsetWidth; el.classList.add(name);
      stopEffect(el);
      if (still || typeof el.animate !== "function") return;
      try { playing.set(el, el.animate(EFFECTS[name].frames, { duration: EFFECTS[name].ms })); } catch (e) { /* the class alone will do */ }
    }
    kit.fx = {
      pop: (el) => effect(el, "sg-pop"),
      shake: (el) => effect(el, "sg-shake"),
      confetti: (n) => {
        if (still) return;
        const colors = [A.C.red, A.C.sun, A.C.blue, A.C.green, A.C.pink, A.C.purple, A.C.orange], box = h("div", { class: "sg-confetti", "aria-hidden": "true" });
        for (let i = 0; i < (n || 46); i++) box.appendChild(h("i", { style: "left:" + ((i * 37 + 11) % 100) + "%;background:" + colors[i % colors.length] + ";animation-delay:" + ((i * 53) % 900) / 1000 + "s;animation-duration:" + (1.6 + ((i * 29) % 12) / 10) + "s;--r:" + ((i * 67) % 360) + "deg;--x:" + (((i * 41) % 120) - 60) + "px" }));
        root().appendChild(box); kit.after(3600, () => box.remove()); offs.push(() => box.remove());
      },
      /* Send el flying into `to` (an element), shrinking as it goes, then call done. */
      fly: (el, to, done) => {
        if (still || !el || !to) { if (done) done(); return; }
        stopEffect(el);
        const a = el.getBoundingClientRect(), b = to.getBoundingClientRect();
        el.style.transition = "transform .34s cubic-bezier(.5,-.2,.8,.6), opacity .34s"; el.style.transform = "translate(" + (b.left + b.width / 2 - a.left - a.width / 2) + "px," + (b.top + b.height / 2 - a.top - a.height / 2) + "px) scale(.15)"; el.style.opacity = "0.2";
        kit.after(340, () => { el.style.transition = ""; el.style.transform = ""; el.style.opacity = ""; if (done) done(); });
      }
    };
    /* A short message that floats near the bottom of the stage and fades. */
    kit.toast = (text, tone) => { const t = h("div", { class: "sg-toast" + (tone ? " sg-" + tone : ""), role: "status" }, text); stage.appendChild(t); kit.after(2400, () => t.remove()); return t; };
    /* Add a block of CSS for this screen only. */
    kit.style = (css) => { const s = h("style", null, css); document.head.appendChild(s); offs.push(() => s.remove()); return s; };

    // ── scoring ──
    const sproutFeels = (mood) => { if (actors.sprout) actors.sprout.set({ mood: mood }).hop(); };   // Sprout, if it is on stage, reacts to every pick
    kit.score = {
      wrong: () => { S.play("wrong"); sproutFeels("oops"); if (hooks.wrong) hooks.wrong(); },
      right: () => { S.play("correct"); sproutFeels("glad"); },
      /* Did the player catch Sprout's mistake on the first try? Call once per mission. */
      sprout: (firstTry) => { if (hooks.sprout) hooks.sprout(!!firstTry); }
    };

    // ── the stage: a backdrop, actors, speech ──
    /* kit.backdrop("garden", {gray: true}) or kit.backdrop(anSvgElement). Returns the element. */
    kit.backdrop = (place, o) => {
      const old = stage.querySelector(":scope > .sg-bg"); if (old) old.remove();
      const el = typeof place === "string" ? A.scene(place, o) : place;
      el.classList.add("sg-bg"); stage.insertBefore(el, stage.firstChild); return el;
    };
    function talkLayer() {
      if (talk) return;
      actorsEl = h("div", { class: "sg-actors" });
      bubble = { tag: h("span", { class: "sg-nametag" }), shown: h("span"), rest: h("span", { class: "sg-rest", "aria-hidden": "true" }),
        next: h("button", { class: "sg-next", type: "button", "aria-label": "Next" }, A.icon("play")), skip: h("button", { class: "sg-skip", type: "button" }, "Skip"), row: h("div", { class: "sg-choices" }) };
      bubble.text = h("p", { class: "sg-line" }, bubble.shown, bubble.rest);
      bubble.el = h("div", { class: "sg-bubble", hidden: true }, bubble.tag, bubble.skip, bubble.text, bubble.row, bubble.next);
      talk = h("div", { class: "sg-talk" }, actorsEl, bubble.el);
      stage.appendChild(talk);
    }
    function addActor(a) {
      const side = a.side || (!actorsEl.querySelector(".sg-right") ? "right" : !actorsEl.querySelector(".sg-left") ? "left" : "center");
      const act = { who: a.who, side: side, mood: a.mood || null, pose: a.pose || null, el: h("div", { class: "sg-actor sg-" + side + " sg-is-" + ((A.cast[a.who] || {}).kind || "person") }) };
      const draw = () => { act.el.innerHTML = ""; act.el.appendChild(A.character(act.who, { mood: act.mood, pose: act.pose, flip: side === "right" })); };
      act.set = (o) => { if (!o) return act; const m = o.mood === undefined ? act.mood : o.mood, p = o.pose === undefined ? act.pose : o.pose; if (m !== act.mood || p !== act.pose) { act.mood = m; act.pose = p; draw(); } return act; };
      act.hop = () => kit.fx.pop(act.el);
      draw(); actorsEl.appendChild(act.el); actors[a.who] = act; crowd(); return act;
    }
    /* Two actors is the usual scene. With a third (a speaker who was not on stage is added in the
       middle), game.css sizes all of them to fit a narrow window. Two-actor scenes are not touched. */
    function crowd() { const n = actorsEl.children.length; actorsEl.style.setProperty("--n", String(n)); actorsEl.classList.toggle("sg-many", n > 2); }
    /* Put characters on the stage: kit.cast([{who: "jordan", side: "left", mood: "worried"}, "sprout"]) */
    kit.cast = (list) => { talkLayer(); actorsEl.innerHTML = ""; actors = {}; crowd(); [].concat(list || []).forEach((a, i, all) => addActor(typeof a === "string" ? { who: a, side: all.length === 1 ? "center" : i === 0 ? "left" : i === 1 ? "right" : "center" } : a)); return actors; };
    kit.actor = (who, o) => { talkLayer(); return (actors[who] || addActor({ who: who })).set(o); };
    /* Speak the lines one at a time. Each: {who, say, mood, pose}. who: "narrator" has no speaker.
       Text types itself; a tap, Enter or Space finishes the line, then moves on. Returns a Promise. */
    kit.say = (lines) => new Promise((resolve) => {
      lines = [].concat(lines || []).filter((l) => l && l.say);
      if (!lines.length) return resolve();
      talkLayer();
      let i = 0, ticker = null, full = "", shown = 0;
      const b = bubble;
      b.el.hidden = false; b.row.innerHTML = ""; b.next.hidden = false; b.skip.hidden = lines.length < 2;
      const speaking = (who, yes) => { Object.keys(actors).forEach((k) => { actors[k].el.classList.toggle("sg-speaking", yes && k === who); actors[k].el.classList.toggle("sg-listening", yes && k !== who); }); };
      const finish = () => { if (ticker) ticker(); ticker = null; shown = full.length; b.shown.textContent = full; b.rest.textContent = ""; b.el.classList.remove("sg-typing"); const l = lines[i]; if (actors[l.who]) actors[l.who].el.classList.remove("sg-talking"); };
      function show() {
        const l = lines[i], d = A.cast[l.who];
        if (d && l.who !== "narrator") { const act = kit.actor(l.who, { mood: l.mood === undefined ? undefined : l.mood, pose: l.pose === undefined ? undefined : l.pose }); act.hop(); act.el.classList.add("sg-talking"); b.el.setAttribute("data-side", act.side); }
        else b.el.setAttribute("data-side", "none");
        speaking(l.who, !!d);
        b.tag.textContent = d ? d.name : ""; b.tag.hidden = !d; b.tag.style.background = d ? d.tag : "";
        b.el.classList.toggle("sg-narration", !d);
        full = String(l.say); shown = 0; b.shown.textContent = ""; b.rest.textContent = full;
        b.el.setAttribute("aria-label", (d ? d.name + ": " : "") + full);
        kit.fx.pop(b.el); S.play("pop");
        if (still) return finish();
        b.el.classList.add("sg-typing");
        ticker = kit.every(26, () => { shown = Math.min(full.length, shown + 2); b.shown.textContent = full.slice(0, shown); b.rest.textContent = full.slice(shown); if (shown % 6 === 0) S.play("blip"); if (shown >= full.length) finish(); });
      }
      const end = () => { finish(); off(); b.next.hidden = true; b.skip.hidden = true; b.next.onclick = b.skip.onclick = b.text.onclick = null; speaking("", false); resolve(); };
      const next = () => { if (ticker) return finish(); if (i >= lines.length - 1) return end(); i++; show(); kit.focus(b.next); };
      const off = kit.keys({ Enter: next, " ": next, ArrowRight: next });
      b.next.onclick = next; b.text.onclick = next; b.skip.onclick = () => { finish(); i = lines.length - 1; show(); finish(); end(); };
      show(); kit.focus(b.next);
    });
    /* Buttons under the last line: kit.choose([{label: "To the truck!", value: 1, primary: true}]). Resolves with the value. */
    kit.choose = (options) => new Promise((resolve) => {
      talkLayer(); bubble.el.hidden = false; bubble.row.innerHTML = "";
      options.forEach((o, n) => { const btn = h("button", { class: "sg-btn" + (o.primary !== false && n === 0 ? " sg-primary" : ""), type: "button", onclick: () => { S.play("click"); bubble.row.innerHTML = ""; resolve(o.value === undefined ? n : o.value); } }, o.icon ? A.icon(o.icon) : null, o.label); bubble.row.appendChild(btn); if (n === 0) kit.focus(btn); });
    });
    kit.hush = () => { if (bubble) bubble.el.hidden = true; };

    /* A card in the middle of the stage, for a challenge or a choice.
       kit.panel({kicker, title, who}) returns {el, body, say(text, tone), close()}. tone: "ok" or "bad". */
    kit.panel = (o) => {
      o = o || {};
      if (layer) layer.remove();
      kit.hush();
      const body = h("div", { class: "sg-panel-body" }), foot = h("div", { class: "sg-panel-foot", role: "status", "aria-live": "polite" });
      const el = h("div", { class: "sg-panel" + (o.class ? " " + o.class : "") },
        h("div", { class: "sg-panel-head" }, o.who ? h("span", { class: "sg-face", style: "background:" + ((A.cast[o.who] || {}).tag || A.C.sun) }, A.avatar(o.who)) : null,
          h("div", null, o.kicker ? h("div", { class: "sg-kicker" }, o.kicker) : null, h("h2", null, o.title || ""))), body, foot);
      layer = h("div", { class: "sg-layer" }, el); stage.appendChild(layer); stage.classList.add("sg-has-panel");
      const mine = layer;
      return { el: el, body: body, foot: foot,
        say: (text, tone) => { foot.textContent = text || ""; foot.className = "sg-panel-foot" + (tone ? " sg-" + tone : ""); if (text) kit.fx.pop(foot); },
        close: () => { mine.remove(); if (layer === mine) { layer = null; stage.classList.remove("sg-has-panel"); } } };
    };

    kit.destroy = () => { if (dead) return; dead = true; offs.splice(0).reverse().forEach((f) => { try { f(); } catch (e) { /* keep tidying */ } }); keymaps.length = 0; };
    return kit;
  };

  // ── the built-in quick challenges ──
  /* Each is fn(kit, spec, done). spec.ask is the instruction; spec.who puts a face on the card.
     A wrong pick calls kit.score.wrong(), which is all the scoring a challenge has to do. */
  const C = (G.challenges = {});
  const head = (kit, spec) => kit.panel({ kicker: spec.kicker || "Quick challenge", title: spec.ask, who: spec.who });
  const numberKeys = (kit, n, fn) => { const m = {}; for (let i = 0; i < n && i < 9; i++) m[String(i + 1)] = () => fn(i); return kit.keys(m); };
  const keycap = (n) => h("kbd", { "aria-hidden": "true" }, String(n + 1));

  /* pick: one right answer out of a few. {ask, options: [..], answer: 1, why, nope: [..] or "..."} */
  C.pick = function (kit, spec, done) {
    const p = head(kit, spec); let solved = false;
    const opts = spec.options.map((text, k) => h("button", { class: "sg-opt", type: "button", onclick: () => pick(k) }, keycap(k), h("span", null, String(text))));
    function pick(k) {
      const b = opts[k]; if (solved || b.disabled) return;
      if (k !== spec.answer) { b.classList.add("sg-no"); b.disabled = true; kit.focusNext(opts, k); kit.fx.shake(b); kit.score.wrong(); p.say((Array.isArray(spec.nope) ? spec.nope[k] : spec.nope) || "Not that one. Have another go.", "bad"); return; }
      solved = true; b.classList.add("sg-yes"); opts.forEach((x) => { if (x !== b) x.disabled = true; }); kit.score.right(); p.say(spec.yes || "That's it.", "ok");
      kit.after(900, () => { p.close(); done(); });
    }
    p.body.appendChild(h("div", { class: "sg-opts" }, opts)); numberKeys(kit, opts.length, pick); kit.focus(opts[0]);
  };

  /* sort: send each card to the right basket, by drag, tap or number key.
     {ask, bins: [{key, label, color}], items: [{text, bin, why}]}. `bin` may be a list when more than one is fair. */
  C.sort = function (kit, spec, done) {
    const p = head(kit, spec), items = spec.items; let i = 0, busy = false;
    const card = h("div", { class: "sg-sortcard" }), dots = h("div", { class: "sg-dots", "aria-hidden": "true" }, items.map(() => h("i")));
    const bins = spec.bins.map((b, n) => h("button", { class: "sg-bin", type: "button", style: "--c:" + (b.color || BIN_COLORS[n % BIN_COLORS.length]), onclick: () => send(n) }, keycap(n), b.icon ? A.icon(b.icon) : null, h("b", null, b.label)));
    const fits = (it, key) => [].concat(it.bin).indexOf(key) >= 0;
    function show() { card.textContent = items[i].text; card.style.transform = ""; card.style.opacity = ""; kit.fx.pop(card); dots.children[i].className = "sg-on"; busy = false; }
    function send(n, dropped) {
      if (busy) return false; const it = items[i];
      if (!fits(it, spec.bins[n].key)) { kit.score.wrong(); kit.fx.shake(card); p.say(it.why || "Not that basket. Try another.", "bad"); return false; }
      busy = true; kit.score.right(); dots.children[i].className = "sg-ok"; p.say(it.yes || it.why || "", "ok"); kit.fx.pop(bins[n]);
      const after = () => { i++; if (i >= items.length) { card.style.visibility = "hidden"; kit.after(700, () => { p.close(); done(); }); } else show(); };
      if (dropped) { card.style.opacity = "0"; kit.after(160, after); } else kit.fx.fly(card, bins[n], after);
      return true;
    }
    p.body.appendChild(dots); p.body.appendChild(h("div", { class: "sg-desk" }, card)); p.body.appendChild(h("div", { class: "sg-bins" + (bins.length === 5 ? " sg-bins-5" : "") }, bins));
    kit.drag(card, { zones: bins, disabled: () => busy, onDrop: (z) => (z ? send(bins.indexOf(z), true) : false) });
    numberKeys(kit, bins.length, (n) => send(n)); show(); kit.focus(bins[0]);
  };

  /* tap: find every right one among the decoys. {ask, items: [{text, ok: true, why}]} */
  C.tap = function (kit, spec, done) {
    const p = head(kit, spec), need = spec.items.filter((x) => x.ok).length; let got = 0;
    const count = h("div", { class: "sg-count" });
    const paint = () => { count.textContent = got + " of " + need + " found"; };
    const chips = spec.items.map((it, n) => h("button", { class: "sg-chip", type: "button", onclick: () => pick(n) }, keycap(n), h("span", null, it.text)));
    function pick(n) {
      const it = spec.items[n], b = chips[n]; if (b.disabled || got >= need) return;
      b.disabled = true;
      if (!it.ok) { b.classList.add("sg-no"); kit.focusNext(chips, n); kit.fx.shake(b); kit.score.wrong(); p.say(it.why || "Not that one.", "bad"); return; }
      b.classList.add("sg-yes"); got++; paint(); kit.fx.pop(b); kit.score.right(); p.say(it.why || "", "ok");
      if (got >= need) kit.after(900, () => { p.close(); done(); }); else kit.focusNext(chips, n);
    }
    p.body.appendChild(count); p.body.appendChild(h("div", { class: "sg-chips" }, chips)); paint(); numberKeys(kit, chips.length, pick); kit.focus(chips[0]);
  };

  /* spot: things sorted into groups, one of them in the wrong group. Tap it, or press its number
     (the first nine have one, counted group by group).
     {ask, groups: [{label, color, items: [{text, wrong: true, why}]}], nope} */
  C.spot = function (kit, spec, done) {
    const p = head(kit, spec), chips = [], items = []; let solved = false;
    const groups = spec.groups.map((g, n) => h("div", { class: "sg-shelf", style: "--c:" + (g.color || BIN_COLORS[(n + 2) % BIN_COLORS.length]) }, h("b", null, g.label),
      g.items.map((it) => { const k = chips.length, b = h("button", { class: "sg-chip", type: "button", onclick: () => pick(k) }, k < 9 ? keycap(k) : null, h("span", null, it.text)); chips.push(b); items.push(it); return b; })));
    function pick(k) {
      const it = items[k], b = chips[k]; if (solved || !b || b.disabled) return;
      if (!it.wrong) { b.classList.add("sg-okay"); b.disabled = true; kit.focusNext(chips, k); kit.fx.shake(b); kit.score.wrong(); p.say(it.why || spec.nope || "That one is in the right place. Look again.", "bad"); return; }
      solved = true; b.classList.add("sg-found"); kit.fx.pop(b); kit.score.right(); p.say(it.why || "Found it.", "ok");
      kit.after(1300, () => { p.close(); done(); });
    }
    p.body.appendChild(h("div", { class: "sg-shelves" }, groups)); numberKeys(kit, chips.length, pick); kit.focus(chips[0]);
  };
})();
