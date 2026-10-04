/* Save Greenline · case 7: The Case of the Extra 385 Dollars. Bandit: Double Trouble, twins who copy
   rows so the numbers disagree.
   What it teaches (session 7 of the class): every kind of data has one home · never let a tool change
   an amount without showing you · check the total before and after, and explain every dollar of the gap.
   The showdown is the week's job done by hand: clean a messy jobs export without moving a dollar.
   Every row and every total comes from app/data/w7-data.js and is added up here, never typed in.

   AGENT MODE: the player IS the AI, Greenline's new agent. So every line here is written to the
   agent ("you") or by the agent ("I"). Here the agent is the tool that must show its changes. Sprout
   is the trainer, the agent who had the job before, and its one wrong shortcut (a blank filled with
   a guess, and no word about it) is the thing to catch. The agent never sends and never calls a
   customer: the engine's handoff takes the cleaned rows to Jordan.

   GAME.md explains every field and every kit call used here. Everything in it is made up. */
(function () {
  "use strict";
  if (!window.OH || !OH.game || !OH.game.mission || !OH.game.art) return;
  const h = OH.h, A = OH.game.art, S = OH.game.sound, sh = A.shape;

  // ── the sample export: thirty October jobs, messy on purpose ──
  const EX = (OH.sample && OH.sample.jobsExport) || {};
  const ROWS = (EX.rows || []).slice(1).map((r, i) => ({ n: i + 1, date: r[0], who: r[1], what: r[2], amount: r[4] === "" ? null : Number(r[4]), paid: r[5] === "Yes", key: r.join("|") }));
  const sum = (rows) => rows.reduce((a, r) => a + (r.amount || 0), 0);
  const money = (n) => Math.round(n).toLocaleString("en-US");
  const first = (name) => String(name).split(" ")[0];
  const isSlash = (r) => /\//.test(r.date);
  const iso = (d) => { const m = /^(\d+)\/(\d+)\/(\d+)$/.exec(d); return m ? m[3] + "-" + m[1].padStart(2, "0") + "-" + m[2].padStart(2, "0") : d; };
  /* The copy is the second of two rows that match in every column. Its twin is the row it copied. */
  const seen = {}, COPY = ROWS.find((r) => { if (seen[r.key]) return true; seen[r.key] = r; return false; }) || null, ORIGINAL = COPY ? seen[COPY.key] : null;
  const CLEAN = ROWS.filter((r) => r !== COPY);
  const BEFORE = sum(ROWS), AFTER = sum(CLEAN), GAP = BEFORE - AFTER;                 // 27,040 · 26,655 · 385
  const CROOKED = ROWS.filter(isSlash);                                               // dates written month/day/year: eight rows
  const BLANK = ROWS.find((r) => r.amount === null) || null;                          // one job with no amount
  const ALIAS = ROWS.find((r) => /^[A-Z]\.\s/.test(r.who)) || null;                   // one customer spelled a second way
  const UNPAID = CLEAN.filter((r) => !r.paid), OWED = sum(UNPAID), TOP = UNPAID.slice().sort((a, b) => (b.amount || 0) - (a.amount || 0))[0] || null;   // 8,775
  /* Sprout's guess for the blank: the average of the other jobs of that kind, to the nearest five. */
  const ALIKE = CLEAN.filter((r) => BLANK && r.what === BLANK.what && r.amount !== null);
  const GUESS = ALIKE.length ? Math.round(sum(ALIKE) / ALIKE.length / 5) * 5 : 0;
  const DECOY = ALIKE.find((r) => r.amount === GUESS) || ALIKE[0] || null;            // a real row with that same amount
  const repeats = (r) => ROWS.some((x) => x !== r && x.who === r.who && x.what === r.what && x.date !== r.date);

  // ── the art ──
  /* A job slip, small, for the sky over HQ and the cards. Drawn around its middle. */
  const slipArt = (color) => sh.rect(-17, -22, 34, 44, 5, color || "#fff", 4) + sh.line("M-9,-11 H9 M-9,-2 H7", A.C.ink, 3) + sh.rect(-3, 7, 13, 9, 3, A.C.sun, 2.5);
  A.icons.m7flag = (c) => sh.line("M13,43 V6", A.C.ink, 5) + sh.path("M13,7 H39 L31,17 L39,27 H13 Z", c || A.C.red, 4);
  /* The big scale, 400 by 262. The beam and the two pans are moved by makeScale(). */
  function scaleMarkup() {
    const pan = (cls, label, extra) => sh.group(sh.line("M0,0 L-40,62 M0,0 L40,62", A.C.ink, 4) +
      sh.rect(-28, 42, 56, 22, 4, "#fff", 3) + sh.rect(-22, 33, 44, 15, 4, "#fff", 3) + sh.line("M-13,41 H12", A.C.ink, 2.5) +
      sh.path("M-56,62 H56 Q50,90 0,90 Q-50,90 -56,62 Z", A.C.teal) +
      sh.rect(-52, 98, 104, 44, 12, "#fff", 4) + sh.text(0, 113, label, 11.5, "#7a4be0", 'letter-spacing="1.5"') + sh.text(0, 135, "", 21, A.C.ink, 'class="m7-num"') + (extra || ""), 'class="' + cls + '"');
    return sh.rect(128, 238, 144, 18, 9, "#7a5ad6") + sh.rect(190, 54, 20, 188, 8, A.C.purple) + sh.path("M191,2 H209 L200,13 Z", A.C.ink, 0) +
      sh.group(sh.rect(56, 45, 288, 14, 7, A.C.sun) + sh.path("M194,50 L200,15 L206,50 Z", A.C.red, 4), 'class="m7-beam"') + sh.ellipse(200, 52, 13, 13, "#fff") + sh.ellipse(200, 52, 4, 4, A.C.ink, 0) +
      pan("m7-panl", "BEFORE") +
      pan("m7-panr", "AFTER", sh.group(sh.line("M0,142 V154", A.C.ink, 4) + sh.rect(-52, 154, 104, 24, 9, A.C.sun, 4) + sh.text(0, 171, "", 12.5, A.C.ink), 'class="m7-hang"'));
  }
  /* The scale weighs the total before against the total after plus every dollar that has a reason.
     It is level when the gap is fully explained. set({after, explained}) returns what is left over. */
  function makeScale(kit) {
    const el = A.svg(scaleMarkup(), { box: "0 0 400 262", class: "m7-scale" });
    const beam = el.querySelector(".m7-beam"), left = el.querySelector(".m7-panl"), right = el.querySelector(".m7-panr"), hang = el.querySelector(".m7-hang");
    let a = 0, v = 0, target = 0, after = BEFORE, explained = 0;
    const draw = () => {
      const rad = a * Math.PI / 180, dx = 140 * Math.cos(rad), dy = 140 * Math.sin(rad);
      beam.setAttribute("transform", "rotate(" + a.toFixed(2) + " 200 52)");
      left.setAttribute("transform", "translate(" + (200 - dx).toFixed(1) + "," + (52 - dy).toFixed(1) + ")");
      right.setAttribute("transform", "translate(" + (200 + dx).toFixed(1) + "," + (52 + dy).toFixed(1) + ")");
    };
    const set = (o) => {
      if (o.after != null) after = o.after;
      if (o.explained != null) explained = o.explained;
      const over = after + explained - BEFORE;
      target = over === 0 ? 0 : Math.sign(over) * (5 + 7 * Math.min(1, Math.abs(over) / 1500));
      right.querySelector(".m7-num").textContent = money(after);
      hang.style.display = explained ? "" : "none"; hang.querySelector("text").textContent = money(explained) + " explained";
      if (kit.calm) { a = target; draw(); }
      return over;
    };
    left.querySelector(".m7-num").textContent = money(BEFORE);
    set({}); draw();
    if (!kit.calm) kit.frame((t, dt) => { const uneasy = target ? Math.sin(t * 5) * 0.5 : 0; v += (70 * (target + uneasy - a) - 6 * v) * dt; a += v * dt; draw(); });   // a soft spring, so the beam tips, wobbles and settles
    return { el: el, set: set, after: () => after, pan: right };
  }
  /* One row of the export as a paper slip: a button, with the paper inside it so the paper can shake
     while the button rides the belt. o.date and o.amount show a cleaned-up value. */
  function slip(r, o) {
    o = o || {};
    const amount = "amount" in o ? o.amount : r.amount;
    const date = h("b", { class: "m7-date" }, o.date || r.date), amt = h("strong", { class: "m7-amt" }), paper = h("span", { class: "m7-paper" }, h("small", null, "Row " + r.n), date, h("span", { class: "m7-who" }, r.who), h("span", { class: "m7-what" }, r.what), amt);
    const el = h("button", { class: "m7-slip", type: "button" }, paper);
    const s = { row: r, el: el, paper: paper, date: date, amt: amt };
    s.amount = (n) => { amt.textContent = n == null ? "no amount" : money(n); amt.className = "m7-amt" + (n == null ? " m7-none" : ""); };
    /* A flag says "somebody look this up". On a blank amount it fills the empty box; anywhere else it is a sticker on the corner. */
    s.flag = (text) => {
      if (!amt.classList.contains("m7-none")) return paper.appendChild(h("span", { class: "m7-flag" }, A.icon("m7flag"), text));
      amt.textContent = ""; amt.appendChild(A.icon("m7flag")); amt.appendChild(document.createTextNode(text)); amt.className = "m7-amt m7-flagged";
    };
    s.amount(amount);
    return s;
  }
  S.fx.m7fix = () => { S.tone(500, 0.06, { type: "square", vol: 0.05 }); S.tone(820, 0.1, { vol: 0.11, at: 0.05 }); };
  S.fx.m7pull = () => { S.noise(0.16, { from: 900, to: 3600, vol: 0.09 }); S.tone(620, 0.16, { to: 240, vol: 0.12, at: 0.04 }); };
  S.fx.m7level = () => { S.tone(659.3, 0.14, { vol: 0.11 }); S.tone(784, 0.14, { vol: 0.11, at: 0.1 }); S.tone(1046.5, 0.3, { vol: 0.12, at: 0.2 }); };
  S.fx.m7copy = () => { S.tone(880, 0.05, { type: "square", vol: 0.04 }); S.tone(880, 0.05, { type: "square", vol: 0.04, at: 0.09 }); };

  /* This mission's own styles, all under the prefix m7-. kit.style() takes them away with the screen. */
  const CSS = `
.m7-above{position:absolute;top:0;left:0;right:0;height:56%;pointer-events:none;overflow:hidden}
.m7-above i{position:absolute;top:-14%;width:clamp(26px,4.6vmin,40px);animation:m7-fall 3.6s linear infinite}
.m7-above svg{width:100%;height:auto;overflow:visible}
@keyframes m7-fall{0%{transform:translateY(-20%) rotate(-14deg);opacity:0}14%{opacity:1}100%{transform:translateY(46vh) rotate(22deg);opacity:0}}
.m7-boss{position:absolute;top:1%;left:50%;width:min(30vh,40vw,236px);translate:-50% 0;animation:sg-bounce 2.2s ease-in-out infinite;pointer-events:none}
.m7-lists{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.m7-list{display:flex;flex-direction:column;gap:6px;padding:9px;border:3px solid var(--sg-ink);border-radius:18px;background:#fff7dc}
.m7-list.m7-tidy{background:#e9f6ff}
.m7-list>b{font:900 13.5px/1.2 var(--sg-font);text-align:center}
.sg .m7-tk{display:flex;align-items:center;gap:6px;min-height:42px;padding:6px 9px;border:3px solid var(--sg-ink);border-radius:12px;background:#fff;font:800 14.5px/1.2 var(--sg-font);text-align:left}
.m7-tk i{flex:1;min-width:0;font-style:normal}
.m7-tk em{font:900 16px/1 var(--sg-font);font-style:normal;font-variant-numeric:tabular-nums}
.sg button.m7-tk{box-shadow:0 4px 0 var(--sg-ink)}
.sg button.m7-tk:hover:not(:disabled){background:#fff7cf;border-color:var(--sg-ink)}
.sg .m7-tk.sg-okay{background:#e6f9eb;color:#3f7d55;box-shadow:none}
.sg .m7-tk.sg-found{background:var(--sg-sun);outline:4px solid var(--sg-red);outline-offset:2px}
.m7{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:6px 12px 10px;--sw:162px;--sh:114px}
.m7::before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(rgba(255,95,150,.5) 0,rgba(255,95,150,.2) 50%,rgba(255,95,150,0) 86%);opacity:var(--haze,1);transition:opacity .6s;pointer-events:none}
.m7>*{position:relative}
.m7-top{flex:1 1 0;min-height:112px;width:min(100%,640px);display:flex;align-items:center;justify-content:center}
.m7-scale{width:100%;height:100%;overflow:visible}
.m7-scale.sg-over{filter:drop-shadow(0 0 10px #fff)}
.m7-gap{flex:0 0 auto;max-width:min(100%,760px);padding:6px 16px;border:3px solid var(--sg-ink);border-radius:999px;background:#fff;font:900 14.5px/1.25 var(--sg-font);text-align:center}
.m7-gap.sg-bad{background:#ffe2e2;color:#a11d2e}.m7-gap.sg-ok{background:#d9f8e1;color:#14693a}
.m7-deck{flex:0 0 auto;display:flex;align-items:flex-end;justify-content:space-between;gap:8px;width:min(100%,960px);height:clamp(84px,17vh,136px)}
.m7-tray{display:flex;align-items:flex-end;gap:8px;height:100%}
.m7-tray>b{align-self:center;padding:5px 10px;border:3px solid var(--sg-ink);border-radius:12px;background:var(--sg-sun);font:900 13px/1.2 var(--sg-font);animation:sg-bounce .9s ease-in-out infinite}
.m7-twins{height:100%;aspect-ratio:200/220;margin-right:3%}
.m7-twins svg{width:100%;height:100%;overflow:visible}
.m7-line{position:relative;flex:0 0 auto;align-self:stretch;height:calc(var(--sh) + 38px);margin:0 -12px;overflow:hidden}
.m7-rail{position:absolute;left:-14px;right:-14px;bottom:4px;height:24px;border:4px solid var(--sg-ink);border-radius:13px;background:#57507a repeating-linear-gradient(90deg,transparent 0 20px,rgba(255,255,255,.24) 20px 26px);background-position-x:var(--roll,0)}
.m7-out{display:flex;align-items:center;gap:5px;margin-right:auto;padding:4px 11px 4px 7px;border:3px solid var(--sg-ink);border-radius:999px;background:#fff;font:900 12.5px/1.1 var(--sg-font);white-space:nowrap}
.m7-tray:not(:empty)+.m7-out{display:none}
.m7-out svg{width:16px;height:16px}
.sg .m7-slip{position:absolute;left:0;bottom:26px;width:var(--sw);height:var(--sh);padding:0;border:0;border-radius:12px;background:none;text-align:left}
.m7-paper{position:relative;display:flex;flex-direction:column;gap:1px;width:100%;height:100%;padding:6px 9px 7px;border:3px solid var(--sg-ink);border-radius:10px;background:#fff;box-shadow:0 5px 0 rgba(43,33,71,.4);transition:background .2s,transform .15s}
.m7-paper small{font:900 10px/1.2 var(--sg-font);letter-spacing:.8px;text-transform:uppercase;color:#8a84a3}
.m7-date{font:900 15.5px/1.2 var(--sg-font);font-variant-numeric:tabular-nums}
.m7-who{font:900 13.5px/1.25 var(--sg-font);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.m7-what{font:700 12px/1.25 var(--sg-font);color:#5d5578;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.m7-amt{margin-top:auto;align-self:flex-end;padding:2px 8px;border:2px solid var(--sg-ink);border-radius:9px;background:#fff3c4;font:900 15.5px/1.2 var(--sg-font);font-variant-numeric:tabular-nums}
.m7-amt.m7-none{border-style:dashed;background:#fff;color:#8a84a3;font-size:12.5px}
.m7-slip:hover:not(:disabled) .m7-paper,.m7-slip:focus-visible .m7-paper{background:#fff9d6}
.m7-ok .m7-paper{background:#e3f8e9}.m7-ok .m7-date{color:#14693a}
.m7-lift .m7-paper{transform:translateY(-8px) rotate(-2deg);background:#fff3c4}
.m7-amt.m7-flagged{display:flex;align-items:center;gap:3px;border-style:solid;background:#ffe2e2;color:#a11d2e;font-size:12.5px;animation:sg-pop .3s}
.m7-flag{position:absolute;top:-10px;right:-8px;display:flex;align-items:center;gap:3px;padding:2px 7px 2px 3px;border:2px solid var(--sg-ink);border-radius:8px;background:#ffe2e2;color:#a11d2e;font:900 11px/1.1 var(--sg-font);transform:rotate(5deg);animation:sg-pop .3s}
.m7-flag svg,.m7-flagged svg{width:15px;height:15px}
.sg .m7-loose{position:relative;bottom:auto;flex:0 0 auto;height:100%;width:calc(var(--sw)*.9)}
.m7-loose .m7-paper{animation:sg-pulse 1s ease-in-out infinite;cursor:grab}
.m7-loose .m7-what,.m7-loose small{display:none}
.m7-zip{pointer-events:none;animation:m7-zip .75s linear forwards}
@keyframes m7-zip{from{transform:translateX(100vw)}to{transform:translateX(-120%)}}
.m7-still{height:auto;max-height:36vh;margin:0;padding:4px 4px 8px;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:9px 8px;width:100%}
.m7-calm .m7-deck{height:84px}
.m7-still .m7-rail{display:none}
.sg .m7-still .m7-slip{position:relative;bottom:auto;width:auto}
.m7-tally{flex:0 0 auto;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:min(100%,760px)}
.m7-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 12px 5px 7px;border:3px solid var(--sg-ink);border-radius:999px;background:#fff;font:800 13.5px/1.1 var(--sg-font)}
.m7-chip svg{width:19px;height:19px}
.m7-chip i{font-style:normal}
.m7-chip b{font-weight:900;font-variant-numeric:tabular-nums}
.m7-chip.m7-done{background:#c9f5d5}
.m7-help{flex:0 0 auto;width:min(100%,760px);min-height:2.5em;display:flex;align-items:center;justify-content:center;padding:6px 14px;border:3px solid var(--sg-ink);border-radius:16px;background:#fff;font:800 14.5px/1.3 var(--sg-font);text-align:center}
.m7-help.sg-bad{background:#ffe2e2;color:#a11d2e}.m7-help.sg-ok{background:#d9f8e1;color:#14693a}
.m7-ask,.m7-fix{flex:0 0 auto;display:grid;grid-template-columns:1fr 1fr;gap:9px;width:min(100%,760px);padding:10px;border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 6px 0 rgba(43,33,71,.3);animation:sg-pop .3s}
.m7-ask>b{grid-column:1/-1;font:900 15.5px/1.25 var(--sg-font);text-align:center}
.m7-fix{grid-template-columns:1fr;width:min(100%,640px)}
.m7-say{flex:0 0 auto;display:flex;align-items:center;gap:10px;width:min(100%,960px);padding:8px 12px;border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 6px 0 rgba(43,33,71,.3);font:800 clamp(15px,2.2vmin,18px)/1.3 var(--sg-font)}
.m7-say.sg-bad{background:#ffe2e2}.m7-say.sg-ok{background:#d9f8e1}
.m7-say .sg-face{background:#c9f7ee}
.m7-park{flex:0 0 auto;display:grid;grid-template-columns:repeat(6,minmax(0,var(--sw)));gap:14px 12px;justify-content:center;width:100%;padding-top:10px}
.sg .m7-park .m7-slip{position:relative;bottom:auto;width:auto;animation:sg-pop .3s}
.m7-park kbd{position:absolute;top:-10px;right:-7px;z-index:1}
.sg .m7-park .sg-okay .m7-paper{background:#e6f9eb;box-shadow:none}
.sg .m7-park .m7-found .m7-paper{background:var(--sg-sun);outline:4px solid var(--sg-red);outline-offset:2px}
.m7-screen{flex:0 0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;width:min(100%,760px)}
.m7-tile{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border:4px solid var(--sg-ink);border-radius:20px;background:#fff;box-shadow:0 6px 0 rgba(43,33,71,.3);animation:sg-pop .34s both}
.m7-tile:nth-child(2){animation-delay:.12s;background:#fff3c4}.m7-tile:nth-child(3){animation-delay:.24s}
.m7-tile small{font:900 11px/1.2 var(--sg-font);letter-spacing:.8px;text-transform:uppercase;color:#7a4be0}
.m7-tile b{font:900 clamp(22px,4.4vmin,32px)/1.1 var(--sg-font);font-variant-numeric:tabular-nums}
.m7-tile span{font:700 12.5px/1.3 var(--sg-font);color:#5d5578}
.m7-sprout .m7-deck,.m7-sprout .m7-tally,.m7-sprout .m7-help{display:none}
.m7-fixing .m7-park .m7-slip:not(.m7-keep){display:none}
.m7-fixing .m7-park{grid-template-columns:minmax(0,var(--sw))}
.m7-talking .m7-deck,.m7-talking .m7-line,.m7-talking .m7-tally,.m7-talking .m7-help,.m7-talking .m7-say,.m7-talking .m7-park,.m7-talking .m7-fix,.m7-talking .m7-screen{display:none}
.m7-talking .m7-top{flex:0 0 auto;height:min(31vh,240px)}
@media (max-width:700px){
  .m7{--sw:138px;--sh:108px}
  .m7-tally{gap:5px;flex-wrap:nowrap}
  .m7-chip{gap:4px;padding:5px 8px 5px 5px;font-size:12.5px;white-space:nowrap}
  .m7-chip svg{width:16px;height:16px}
  .m7-chip i{display:none}
  .m7-ask{grid-template-columns:1fr}
  .m7-park{grid-template-columns:repeat(3,minmax(0,1fr));gap:13px 8px}
  .m7-park .m7-paper{padding:5px 6px 6px}
  .m7-park .m7-who{font-size:12.5px}.m7-park .m7-date{font-size:14px}
  .m7-fixing .m7-park{grid-template-columns:minmax(0,150px)}
  .m7-screen{gap:7px}
  .m7-tile{padding:8px 8px;border-radius:16px}
  .m7-lists{gap:7px}
  .m7-list{padding:7px}
  .sg .m7-tk{padding:6px 7px;font-size:13.5px}
}
`;

  // ── a quick challenge of its own: two lists side by side, and one amount that changed ──
  /* spec: {ask, who, left, right, rows: [{was, now, a, b}], yes, nope}. The row whose b differs from a is the one. */
  function tidyCopy(kit, spec, done) {
    const p = kit.panel({ kicker: "My turn", title: kit.fill(spec.ask), who: spec.who }); let solved = false;
    const row = (r, n) => h("button", { class: "m7-tk", type: "button", onclick: () => pick(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), h("i", null, r.now), h("em", null, String(r.b)));
    const mine = spec.rows.map(row);
    function pick(n) {
      const r = spec.rows[n], b = mine[n]; if (solved || b.disabled) return;
      if (r.a === r.b) { b.disabled = true; b.classList.add("sg-okay"); kit.fx.shake(b); kit.score.wrong(); p.say(spec.nope, "bad"); return; }
      solved = true; mine.forEach((x) => { x.disabled = true; }); b.classList.add("sg-found"); kit.fx.pop(b); kit.score.right(); p.say(spec.yes, "ok");
      kit.after(1500, () => { p.close(); done(); });
    }
    p.body.appendChild(h("div", { class: "m7-lists" },
      h("div", { class: "m7-list" }, h("b", null, spec.left), spec.rows.map((r) => h("span", { class: "m7-tk" }, h("i", null, r.was), h("em", null, String(r.a))))),
      h("div", { class: "m7-list m7-tidy" }, h("b", null, spec.right), mine)));
    const keys = {}; mine.forEach((b, n) => { keys[String(n + 1)] = () => pick(n); }); kit.keys(keys); kit.focus(mine[0]);
  }

  // ── the showdown: Twin trouble ──
  /* play(kit, done) is the whole mini-game. Three beats: my first go (clean the export by hand while
     the scale watches the total), Sprout's shortcut (all thirty rows in three seconds, "do it my
     way"), then I catch the amount Sprout made up and put the blank back. Nothing is sent here:
     done() hands the work to Jordan.
     The help line is the agent's own thinking ("I"). The bar with Sprout's face is Sprout talking
     to the agent ("you"). */
  async function twinTrouble(kit, done) {
    kit.backdrop("bank", { gray: true });
    kit.style(CSS);
    const rush = Math.max(0.1, Number(OH.game.speed) || 1), still = kit.calm;

    // Round 1 · thirty rows ride the belt. Tap every row with a problem. The scale watches the total.
    const scale = makeScale(kit), gap = h("div", { class: "m7-gap", role: "status" }), tray = h("div", { class: "m7-tray" }), twins = h("div", { class: "m7-twins" });
    const rail = h("div", { class: "m7-rail" }), outCount = h("b"), line = h("div", { class: "m7-line" + (still ? " m7-still" : "") }, rail), out = h("span", { class: "m7-out" }, A.icon("check"), outCount);
    const tally = h("div", { class: "m7-tally" }), help = h("div", { class: "m7-help", role: "status", "aria-live": "polite" });
    const wrap = h("div", { class: "m7" + (still ? " m7-calm" : "") }, h("div", { class: "m7-top" }, scale.el), gap, h("div", { class: "m7-deck" }, tray, out, twins), line, tally, help);
    kit.stage.appendChild(wrap);
    const say = (text, tone) => { help.textContent = text; help.className = "m7-help" + (tone ? " sg-" + tone : ""); };
    const note = (text, tone) => { gap.textContent = text; gap.className = "m7-gap" + (tone ? " sg-" + tone : ""); kit.fx.pop(gap); };
    let face = "";
    const twin = (mood, hop) => { if (mood !== face) { face = mood; twins.innerHTML = ""; twins.appendChild(A.character("doubletrouble", { mood: mood })); } if (hop) kit.fx.pop(twins); };
    const need = { copy: COPY ? 1 : 0, date: CROOKED.length, blank: BLANK ? 1 : 0 }, got = { copy: 0, date: 0, blank: 0 };
    const chips = [["copy", "hand", "Copy", " pulled"], ["date", "clock", "Dates", " straight"], ["blank", "m7flag", "Blank", " flagged"]].map((c) => {
      const b = h("b"), el = h("span", { class: "m7-chip" }, A.icon(c[1]), h("span", null, c[2], h("i", null, c[3])), b); tally.appendChild(el);
      return () => { b.textContent = got[c[0]] + " of " + need[c[0]]; el.classList.toggle("m7-done", got[c[0]] >= need[c[0]]); };
    });
    const allFixed = () => got.copy >= need.copy && got.date >= need.date && got.blank >= need.blank;
    const kindOf = (r) => (COPY && (r === COPY || r === ORIGINAL) ? "copy" : isSlash(r) ? "date" : r === BLANK ? "blank" : r === ALIAS ? "name" : "");
    const slips = ROWS.map((r) => { const s = slip(r); s.kind = kindOf(r); s.fixed = false; s.out = false; s.entered = still; s.pos = 0; s.x = 0; s.el.onclick = () => inspect(s); line.appendChild(s.el); return s; });
    const clock = kit.timer({ up: true });
    let W = 1, sw = 150, pitch = 162, off = 0, paused = false, fast = false, pairDone = !COPY, warned = false, gone = 0, cleaned = () => {};
    const size = () => { W = line.clientWidth || 1; sw = (slips[0] && slips[0].el.offsetWidth) || 150; pitch = sw + 12; };
    const onBelt = () => slips.filter((s) => !s.out && (still || (s.x > -sw * 0.7 && s.x < W - sw * 0.2))).sort((a, b) => a.x - b.x);
    const paint = () => { chips.forEach((f) => f()); outCount.textContent = gone + " of " + (ROWS.length - got.copy) + " rows checked"; wrap.style.setProperty("--haze", String(Math.max(0.15, 1 - (got.copy + got.date + got.blank) / Math.max(1, need.copy + need.date + need.blank)))); };
    function enter(s) { s.entered = true; if (s.row === COPY && !pairDone) { twin("glad", true); S.play("m7copy"); kit.after(1500, () => { if (!pairDone) twin("sneaky"); }); } }   // the twins giggle as their copy rolls out
    function leave(s) {
      const open = s.kind === "copy" ? !pairDone : (s.kind === "date" || s.kind === "blank") && !s.fixed;
      if (open) {                                      // a problem that slid past comes round again: nothing is ever lost
        s.pos = Math.max(off + W + 8, Math.max.apply(null, slips.filter((x) => !x.out && x !== s).map((x) => x.pos).concat([0])) + pitch); s.x = s.pos - off; s.entered = false; twin("glad", true);
        if (!warned) { warned = true; say("A row with a problem slid past. It is coming round again."); }
        return;
      }
      const had = document.activeElement === s.el;
      s.out = true; s.el.remove(); gone++; paint();
      if (had) { const next = onBelt()[0]; if (next) kit.focus(next.el); }
      if (slips.every((x) => x.out)) cleaned();
    }
    function lay() {                                   // put every slip where the belt has carried it
      slips.forEach((s) => {
        if (s.out) return;
        s.x = s.pos - off;
        if (!s.entered && s.x < W - sw * 0.3) enter(s);
        if (s.x < -sw) return leave(s);
        const show = s.x < W + 6;
        if (s.shown !== show) { s.shown = show; s.el.style.visibility = show ? "" : "hidden"; }
        if (show) s.el.style.transform = "translateX(" + s.x.toFixed(1) + "px)";
      });
      rail.style.setProperty("--roll", (-(off % 26)).toFixed(1) + "px");
    }
    function settled() {                               // after every fix: is that all of them?
      paint();
      if (!allFixed() || fast) return;
      fast = true; twin("caught", true); say("That is every problem. The rest of the rows are clean.", "ok");
      if (still) kit.after(1200, () => cleaned());
    }
    function inspect(s) {
      if (paused || s.out) return;
      const r = s.row;
      if (s.kind === "date" && !s.fixed) {             // a date written the other way: straighten it, and nothing else
        s.fixed = true; got.date++; s.date.textContent = iso(r.date); s.el.classList.add("m7-ok"); kit.fx.pop(s.paper); kit.score.right(); S.play("m7fix");
        say(got.date === 1 ? "Straight: " + iso(r.date) + ". I changed only the date. The scale did not move." : "Straight: " + iso(r.date) + ".", "ok"); return settled();
      }
      if (s.kind === "copy" && !pairDone) {
        const mate = slips.find((x) => x !== s && x.kind === "copy");
        if (mate && mate.entered && s.entered) return pull(s, mate);
        kit.score.wrong(); kit.fx.shake(s.paper); return say("By itself that row is fine. I watch what comes after it.", "bad");
      }
      if (s.kind === "blank" && !s.fixed) return ask(s);
      if (s.kind === "name" && !s.fixed) {             // a bonus catch: not needed to win, never a wrong pick
        s.fixed = true; s.flag("Ask"); kit.score.right(); return say("Spotted. " + r.who + " may be Priya. I flag it and ask Jordan. I never merge names on a guess.", "ok");
      }
      if (s.fixed || s.kind === "copy") return say("That row is already put right.");
      kit.score.wrong(); kit.fx.shake(s.paper);        // a clean row: the engine counts the wrong pick
      say(repeats(r) ? "Same customer, different day. A repeat customer is not a copy." : "Nothing wrong with that row. I let it ride.", "bad");
    }
    /* The copy comes off the belt, the total drops, and the scale tips until the gap has a reason. */
    function pull(s, mate) {
      const r = s.row;
      pairDone = true; paused = true; got.copy++; s.out = true; s.el.remove(); mate.el.classList.add("m7-ok"); kit.score.right(); S.play("m7pull"); twin("surprised", true); paint();
      const loose = slip(r); loose.el.classList.add("m7-loose"); tray.innerHTML = ""; tray.appendChild(loose.el); tray.appendChild(h("b", null, "Hang it on the scale"));
      scale.set({ after: BEFORE - (r.amount || 0) }); note("The total dropped by " + money(GAP) + ". No reason given yet.", "bad");
      say("Pulled: a copy of row " + mate.row.n + ". Now I explain the gap. Tap the copy, drag it to the scale, or press Enter.");
      let hung = false;
      const hangIt = () => {
        if (hung) return; hung = true;
        kit.fx.fly(loose.el, scale.pan, () => {
          tray.innerHTML = ""; scale.set({ explained: GAP }); S.play("m7level"); kit.score.right(); twin("sneaky");
          note("Level. " + money(BEFORE) + " before, " + money(AFTER) + " after. The " + money(GAP) + " is one job typed twice.", "ok");
          say("Explained. Every dollar of the gap has a reason.", "ok"); paused = false;
          const next = onBelt()[0]; if (next) kit.focus(next.el);
          settled();
        });
      };
      loose.el.onclick = hangIt;
      kit.drag(loose.el, { zones: [scale.el], onDrop: (zone) => { if (zone) hangIt(); return false; } });
      kit.focus(loose.el);
    }
    /* The blank: guess it, or say so? The belt waits. */
    function ask(s) {
      const r = s.row; paused = true; s.el.classList.add("m7-lift");
      const opts = [{ text: "I type in a likely amount", why: "A guess in a sheet looks exactly like a fact. I leave it blank." }, { text: "I leave it blank and flag it", right: true }];
      const btns = opts.map((o, k) => h("button", { class: "sg-opt", type: "button", onclick: () => pick(k) }, h("kbd", { "aria-hidden": "true" }, String(k + 1)), h("span", null, o.text)));
      const box = h("div", { class: "m7-ask" }, h("b", null, "Row " + r.n + " has no amount. What do I do?"), btns);
      function pick(k) {
        const o = opts[k], b = btns[k]; if (b.disabled) return;
        if (!o.right) { kit.score.wrong(); kit.fx.shake(b); b.disabled = true; b.classList.add("sg-no"); return say(o.why, "bad"); }
        offAsk(); box.remove(); tally.hidden = false; s.fixed = true; got.blank++; s.el.classList.remove("m7-lift"); s.el.classList.add("m7-ok"); s.flag("Look it up"); kit.score.right(); S.play("m7fix");
        say("Flagged. A blank that says it is blank. Jordan looks it up at the source.", "ok"); paused = false; kit.focus(s.el); settled();
      }
      tally.hidden = true; wrap.insertBefore(box, help);
      const offAsk = kit.keys({ "1": () => pick(0), "2": () => pick(1) });
      say(first(r.who) + "'s job has no amount. Tap an answer, or press 1 or 2."); kit.focus(btns[0]);
    }
    size(); slips.forEach((s, i) => { s.pos = W * 0.42 + i * pitch; }); twin("sneaky"); paint(); if (!still) lay();
    note("Level. " + money(BEFORE) + " before. Not a dollar has moved.");
    kit.on(window, "resize", () => { size(); if (!still) lay(); });
    let beltAt = 0;                                    // the belt keeps real time, so a slow phone does not make it crawl
    if (!still) kit.frame((t) => { const dt = Math.min(0.25, t - beltAt); beltAt = t; if (!paused) { off += dt * (pitch / 2.1) * rush * (fast ? 9 : 1); lay(); } });
    const step = (dir) => { const list = onBelt(); if (!list.length) return; const i = list.findIndex((s) => s.el === document.activeElement); kit.focus(list[i < 0 ? 0 : Math.max(0, Math.min(list.length - 1, i + dir))].el); };
    const offKeys = kit.keys({ ArrowRight: () => step(1), ArrowLeft: () => step(-1) });
    say("I look for rows with a problem: a copy, a crooked date, a blank. Tap one, or use the arrow keys and Enter.");
    await new Promise((resolve) => { cleaned = resolve; if (!slips.length) return resolve(); const one = onBelt()[0]; if (one) kit.focus(one.el); });
    offKeys(); clock.stop();
    const took = clock.value(), mine = Math.floor(took / 60) + ":" + String(took % 60).padStart(2, "0");
    await kit.wait(700);

    // Round 2 · the twins giggle, and Sprout, the trainer, shows its shortcut: the same export in seconds
    wrap.classList.add("m7-talking");
    kit.cast([{ who: "doubletrouble", side: "left", mood: "glad" }, { who: "sprout", side: "right", mood: "happy" }]);
    await kit.say([
      { who: "doubletrouble", mood: "glad", say: "Hee hee. Hee hee. One little copy, and it took you " + mine + " to find. We can make ten more by lunch!" },
      { who: "sprout", mood: "glad", pose: "cheer", say: "Not bad, {name}. Now watch my shortcut. All " + ROWS.length + " rows, clean, in three seconds." }
    ]);
    kit.hush(); kit.cast([]); clock.hide();
    const sprout = h("span", { class: "sg-face" }), words = h("span"), bar = h("div", { class: "m7-say", role: "status", "aria-live": "polite" }, sprout, words);
    /* One line above the rows, with Sprout's face on it: every one is Sprout talking to the agent. */
    const tell = (text, mood, tone) => { words.textContent = text; sprout.innerHTML = ""; sprout.appendChild(A.avatar("sprout", { mood: mood })); bar.className = "m7-say" + (tone ? " sg-" + tone : ""); kit.fx.pop(bar); };
    wrap.className = "m7 m7-sprout"; wrap.style.setProperty("--haze", "0.25"); line.className = "m7-line"; line.innerHTML = ""; line.appendChild(rail); wrap.insertBefore(bar, line);
    scale.set({ after: BEFORE, explained: 0 }); note("Level. Sprout starts from the same export.");
    tell("Watch and learn. Cleaning...", "think");
    await new Promise((resolve) => {                   // every row zips past, and Sprout fixes it on the way
      let n = 0;
      const stop = kit.every(95, () => {
        const r = ROWS[n], z = slip(r, { date: iso(r.date), amount: r === BLANK ? GUESS : r.amount });
        z.el.classList.add("m7-zip"); z.el.disabled = true; line.appendChild(z.el); kit.after(1100, () => z.el.remove());
        if (r === COPY) scale.set({ after: scale.after() - (r.amount || 0), explained: GAP });
        if (r === BLANK) scale.set({ after: scale.after() + GUESS });
        if (n % 3 === 0) S.play("zip");
        if (++n >= ROWS.length) { stop(); kit.after(900, resolve); }
      });
    });
    note("The total is up by " + money(GUESS) + ". Nobody said why.", "bad");
    tell("Done. The copy is out, the dates are straight, every row is tidy. Do it my way. All perfect. Probably.", "proud");
    await kit.wait(1900);

    // Round 3 · I check before I copy: which row is wrong? Then I put the blank back, with a flag.
    const lineup = [CROOKED[0], ORIGINAL, DECOY, BLANK, TOP, CROOKED[CROOKED.length - 1]].filter((r, i, all) => r && all.indexOf(r) === i).sort((a, b) => a.n - b.n);
    const park = h("div", { class: "m7-park" }), parked = lineup.map((r, n) => { const s = slip(r, { date: iso(r.date), amount: r === BLANK ? GUESS : r.amount }); s.el.insertBefore(h("kbd", { "aria-hidden": "true" }, String(n + 1)), s.paper); park.appendChild(s.el); return s; });
    line.remove(); wrap.appendChild(park);
    tell(kit.fill("The scale is off? I changed no amounts. Probably. Check my rows, {name}. Tap the one that changed."), "proud");
    let tries = 0;
    const found = await new Promise((resolve) => {
      const pick = (s) => {
        if (!s || s.el.disabled) return;
        if (s.row !== BLANK) {
          tries++; kit.score.wrong(); kit.fx.shake(s.paper); s.el.disabled = true; s.el.classList.add("sg-okay");
          return tell(s.row === DECOY ? "See? " + first(s.row.who) + "'s " + money(GUESS) + " was in the export. That one is real. Try another." : "See? Same amount as the export. Hm. Which row had no amount at all?", "proud", "bad");
        }
        off(); parked.forEach((x) => { x.el.disabled = true; }); s.el.classList.add("m7-found", "m7-keep"); kit.score.right();
        kit.score.sprout(tries === 0);                 // the second star: Sprout's slip caught on the first try
        resolve(s);
      };
      const keys = {}; parked.forEach((s, n) => { s.el.onclick = () => pick(s); keys[String(n + 1)] = () => pick(s); });
      const off = kit.keys(keys);
      if (!BLANK) { kit.score.sprout(true); return resolve(null); }
      kit.focus(parked[0].el);
    });
    if (found) {
      tell("Oops. " + first(BLANK.who) + "'s row had no amount. " + BLANK.what + "s run about " + money(GUESS) + ", so I typed " + money(GUESS) + ". What do you do with it?", "oops", "ok");
      wrap.classList.add("m7-fixing");
      await new Promise((resolve) => {
        const fixes = [{ text: "I keep the " + money(GUESS) + ". It is probably close", why: "Probably is not a record. November would be planned on a guess." },
          { text: "I delete " + first(BLANK.who) + "'s row", why: "The job happened. Deleting it hides money Greenline is owed." },
          { text: "I put the blank back, with a flag", right: true }];
        const opts = fixes.map((f, k) => h("button", { class: "sg-opt", type: "button", onclick: () => pick(k) }, h("kbd", { "aria-hidden": "true" }, String(k + 1)), h("span", null, f.text)));
        function pick(k) {
          const f = fixes[k], b = opts[k]; if (b.disabled) return;
          if (!f.right) { kit.score.wrong(); kit.fx.shake(b); b.disabled = true; b.classList.add("sg-no"); return tell(f.why, "oops", "bad"); }
          off(); opts.forEach((x) => { x.disabled = true; }); b.classList.add("sg-yes"); kit.score.right();
          found.amount(null); found.flag("Look it up"); found.el.classList.remove("m7-found"); found.el.classList.add("m7-ok"); kit.fx.pop(found.paper);
          scale.set({ after: AFTER }); S.play("m7level"); note("Level. " + money(BEFORE) + " before, " + money(AFTER) + " after, " + money(GAP) + " explained.", "ok");
          kit.after(700, () => { fix.remove(); resolve(); });
        }
        const fix = h("div", { class: "m7-fix" }, opts); wrap.appendChild(fix);
        const off = kit.keys({ "1": () => pick(0), "2": () => pick(1), "3": () => pick(2) });
        kit.focus(opts[0]);
      });
    }
    tell(kit.fill("Blank again, with a flag. Good catch, {name}. My shortcut skipped showing what it changed."), "glad", "ok");
    await kit.wait(1700);
    // the payoff: one screen, built on rows that can be trusted
    park.remove(); wrap.classList.remove("m7-fixing");
    const tile = (k, big, small) => h("div", { class: "m7-tile" }, h("small", null, k), h("b", null, big), h("span", null, small));
    wrap.appendChild(h("div", { class: "m7-screen" },
      tile("October, cleaned", money(AFTER), "dollars, from " + CLEAN.length + " jobs. No row counted twice."),
      tile("Still unpaid", money(OWED), TOP ? "dollars. " + money(TOP.amount) + " of it is one " + first(TOP.what).toLowerCase() + ". Jordan calls first." : "dollars. Jordan calls first."),
      tile("Flagged, not guessed", BLANK ? "1 row" : "0 rows", BLANK ? first(BLANK.who) + "'s amount. Jordan looks it up." : "Nothing to look up.")));
    tell("Now the one screen is worth building. And look what it found.", "proud", "ok"); kit.fx.confetti(24);
    await kit.wait(3200);
    wrap.classList.add("m7-talking"); wrap.style.setProperty("--haze", "0");
    kit.cast([{ who: "doubletrouble", side: "left", mood: "surprised" }, { who: "sprout", side: "right", mood: "proud", pose: "hips" }]);
    await kit.say([
      { who: "doubletrouble", mood: "surprised", say: "You counted before AND after? Doing things twice is OUR trick. That is not fair!" },
      { who: "sprout", mood: "proud", pose: "cheer", say: "You clean. The sheet counts. Jordan decides. Take it to Jordan, {name}!" }
    ]);
    done();
  }

  // ── the case ──
  OH.game.mission({
    week: 7,
    title: "The Case of the Extra " + money(GAP) + " Dollars",
    badge: { name: "Gap Finder" },
    reward: { hours: 1, leads: 0, money: 8775 },
    maxWrong: 4,

    briefing: {
      setup: (kit) => {                                // the twins over HQ, and job slips falling two by two
        kit.style(CSS);
        const above = h("div", { class: "m7-above" });
        for (let n = 0; n < 7; n++) for (let k = 0; k < 2; k++) {
          const i = h("i"); i.appendChild(A.svg(sh.at(24, 28, 1, slipArt(k ? "#ffd9e8" : "#fff")), { box: "0 0 48 56" }));
          i.style.left = (5 + n * 13.5 + k * 4.4) + "%"; i.style.animationDelay = (-((n * 5) % 7) * 0.5 - k * 0.12) + "s"; above.appendChild(i);
        }
        kit.stage.appendChild(above); kit.stage.appendChild(h("div", { class: "m7-boss" }, A.character("doubletrouble", { mood: "glad" })));
      },
      /* Jordan and Sprout talk to the agent. who: "you" is the agent's own thought, shown as visor text. */
      lines: [
        { who: "jordan", mood: "happy", pose: "wave", say: "{agent}! The leads are moving and October is over. So I asked one question. How did we do?" },
        { who: "jordan", mood: "worried", pose: "shrug", say: "The jobs export says " + money(BEFORE) + ". I do not trust it. I typed those rows in the truck, between jobs." },
        { who: "sprout", mood: "glad", pose: "cheer", say: "Thirty rows! When this was my job, I charted them in one second. Bars! Colors! A pie!" },
        { who: "jordan", mood: "worried", pose: "point", say: "Not yet. A chart built on bad rows is a confident lie. And somebody has been copying rows." },
        { who: "jordan", mood: "grumpy", pose: "hips", say: "Double Trouble. Twins. They copy one row, and suddenly two totals do not agree." },
        { who: "you", say: "So first I find what is wrong. And I change no amount while I do it." },
        { who: "jordan", mood: "happy", pose: "point", say: "Three people in town keep very tidy books. Go and learn from them. Then meet me at the bank." }
      ]
    },

    stops: [
      { place: "square", who: "maple",
        lines: [
          { who: "maple", mood: "proud", pose: "wave", say: "Welcome to Town Square, {agent}! One town, one map. It lives in that kiosk." },
          { who: "maple", mood: "grumpy", pose: "hips", say: "Last spring the cafe, the bank and the bus stop each drew their own. Three maps. Three different parks." },
          { who: "sprout", mood: "surprised", say: "Which one was right?" },
          { who: "maple", mood: "happy", pose: "point", say: "The kiosk. It is the map's home. The rest are copies. Now, where do Greenline's things live?" }
        ],
        challenge: { type: "sort", ask: "Each thing has one home. Where do I put it?",
          bins: [{ key: "people", label: "The customer list", icon: "chat", color: A.C.blue }, { key: "money", label: "The money app", icon: "coins", color: A.C.sun }, { key: "files", label: "The shared drive", icon: "book", color: A.C.green }],
          items: [
            { text: "Dana's phone number", bin: "people", why: "A fact about a customer. It lives in the customer list." },
            { text: "What Marcus still owes", bin: "money", why: "A money question gets its answer in the money app." },
            { text: "The signed patio contract", bin: "files", why: "A signed document is a file. It lives on the drive." },
            { text: "Priya's new address", bin: "people", why: "One customer list. Change it there, and only there." },
            { text: "October's paid invoices", bin: "money", why: "What came in is true in the money app." },
            { text: "A photo of the finished hedge", bin: "files", why: "Photos are files. One folder, one home." }
          ] },
        clue: { title: "One home", text: "Every kind of data I work with has one home: customers, money, files. When two places disagree, I trust the home. Everything else is a copy." } },

      { place: "grind", who: "bea",
        setup: (kit) => kit.style(CSS),
        lines: [
          { who: "bea", mood: "grumpy", pose: "hips", say: "My new till has a TIDY UP button. I pressed it. Oh, it tidied." },
          { who: "bea", mood: "worried", pose: "shrug", say: "Now the drawer is off, and the till will not say what it changed." },
          { who: "sprout", mood: "think", say: "It changed something and did not show you? Even I leave a list. Usually." },
          { who: "bea", mood: "happy", pose: "point", say: "Here are my five tickets, and the till's tidy copy. One amount is different. Find it." }
        ],
        challenge: { ask: "The till tidied five tickets. Which amount did it change? Tap it in the tidy copy.", play: tidyCopy,
          left: "Bea's tickets", right: "The till's tidy copy",
          rows: [{ was: "table 1", now: "Table 1", a: 12, b: 12 }, { was: "TABLE 2", now: "Table 2", a: 18, b: 18 }, { was: "tbl 3", now: "Table 3", a: 7, b: 7 }, { was: "Table 4", now: "Table 4", a: 23, b: 32 }, { was: "table five", now: "Table 5", a: 15, b: 15 }],
          yes: "23 became 32, and the till never said a word.", nope: "Same amount as Bea's ticket. Only the name got tidied. Keep looking." },
        clue: { title: "I show every change", text: "I never change an amount without showing a person which row, and why. I may tidy a date. I may not quietly move a dollar." } },

      { place: "garden", who: "dana",
        lines: [
          { who: "dana", mood: "happy", pose: "wave", say: "{agent}! Mind the seedlings. I counted forty in this tray before I tidied it." },
          { who: "dana", mood: "worried", pose: "idle", say: "After tidying: thirty-seven. So I stop. Nothing gets planted until I know where three went." },
          { who: "sprout", mood: "think", say: "My shortcut: just call it forty. It is close." },
          { who: "dana", mood: "happy", pose: "point", say: "Close is how a garden goes missing. Every seedling in that gap gets a reason. Help me find them." }
        ],
        challenge: { type: "tap", ask: "40 before, 37 after. Which two notes explain the gap of 3? Tap them.",
          items: [
            { text: "2 wilted, now in the compost", ok: true, why: "Two of the three have a reason." },
            { text: "It is probably fine", ok: false, why: "Probably is not a reason." },
            { text: "1 given to Nell", ok: true, why: "One of the three has a reason." },
            { text: "Call it 40 anyway", ok: false, why: "Then the tray and the list disagree forever." },
            { text: "Count again next week", ok: false, why: "Plant nothing on a number you cannot explain." }
          ] },
        clue: { title: "Before and after", text: "I check the total before I clean a list, and again after. I explain every dollar of the gap. If I cannot, I stop, and nothing gets built on it." } }
    ],

    /* The plan: the agent's own three options, so they say "I". The card where I fix things quietly
       shows the player's own agent, so its art is a function. */
    crack: {
      lines: [{ who: "sprout", mood: "glad", pose: "cheer", say: "Three things learned, {name}. So how do we stop Double Trouble?" }],
      ask: "What is my plan?",
      cards: [
        { title: "I take the bigger number", text: money(BEFORE) + " looks nicer on the wall. Jordan plans November on it.", color: A.C.pink,
          art: sh.at(34, 78, 1.1, slipArt()) + sh.at(52, 70, 1.1, slipArt("#ffd9e8")) + sh.at(64, 14, 1.05, A.iconMarkup("coins")),
          react: { who: "doubletrouble", mood: "glad", say: "Yes! Use it! We will copy a few more rows by Friday. Hee hee. Hee hee." } },
        { title: "I fix it quietly", text: "Dates, blanks, amounts. No list of what I changed.", color: A.C.sun,
          art: () => sh.at(2, 4, 0.4, A.characterMarkup("agent", { mood: "glad", pose: "point" })) + sh.at(70, 56, 1.05, A.iconMarkup("pencil")),
          react: { who: "sprout", mood: "oops", say: "That was my shortcut. A blank filled with a guess looks just like a fact. Show every change you make." } },
        { title: "I total, clean, total again", text: "I change no amount. I explain every dollar of the gap.", color: A.C.teal, right: true,
          art: sh.rect(54, 34, 12, 66, 5, A.C.purple) + sh.rect(32, 96, 56, 12, 6, "#7a5ad6") + sh.rect(12, 28, 96, 11, 5, A.C.sun) + sh.ellipse(60, 33, 8, 8, "#fff", 4) +
            [18, 102].map((x) => sh.line("M" + x + ",36 L" + (x - 13) + ",62 M" + x + ",36 L" + (x + 13) + ",62", A.C.ink, 3) + sh.path("M" + (x - 17) + ",62 H" + (x + 17) + " Q" + (x + 14) + ",76 " + x + ",76 Q" + (x - 14) + ",76 " + (x - 17) + ",62 Z", "#fff", 4)).join(""),
          react: { who: "jordan", mood: "glad", say: "That's it. Total before, total after, and every dollar of the gap explained. Go and get those twins." } }
      ]
    },

    /* The showdown: a title, Jordan's task line for the visor, how to play in the agent's own words. */
    showdown: {
      title: "Twin trouble",
      task: "Clean the thirty rows. Change no amount.",
      how: ["Thirty rows ride the belt. I catch every row with a problem: a copy, a crooked date, a blank.", "Tap a row, or use the arrow keys and Enter. I change no amount, and I keep the scale level.", "Then Sprout shows me its shortcut. I check it before I copy it."],
      play: twinTrouble
    },

    /* The handoff: the agent never sends. After the showdown the engine takes the work to Jordan. */
    handoff: {
      ask: "Thirty rows, {agent}. What have you got for me?",
      work: ["One copy pulled. The gap of " + money(GAP) + " is explained.", "Dates straightened. One blank flagged, not guessed.", "No amount changed. Nothing sent."],
      approve: "Approved. Now I trust the total. I'll look up that blank myself."
    },

    /* After the catch: two lines. The second steps out of the story, for the person playing. */
    debrief: [
      { who: "jordan", mood: "glad", pose: "cheer", say: money(BEFORE) + " became " + money(AFTER) + ". The gap of " + money(GAP) + " is one job typed twice. And " + money(OWED) + " is still unpaid, mostly one patio." },
      { who: "sprout", mood: "proud", pose: "wave", say: "For the person behind the visor: tonight, export one list, work on a copy, and total it before and after." }
    ],
    next: "Next case: Friday, 4:41 PM. The card reader dies with a customer waiting."
  });
})();
