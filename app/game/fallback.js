/* Save Greenline · the fallback for a mission file that is still in the OLD format
   ({scene, stakes, quiz, debrief}). Until that case is rewritten it still plays as a case: its scene
   becomes the briefing, its three questions become three clue stops (a townsperson asks, the answer's
   reason is the clue), and a short generic showdown stands in: chase the bandit out of the bushes,
   then find the one case note Sprout got wrong.

   When every mission file has `stops` and its own showdown, this file can be deleted and nothing
   else changes. Nothing here is a model for a new mission: use missions/m1.js for that. */
(function () {
  "use strict";
  if (!window.OH || !OH.game || !OH.game.art || !OH.game.makeKit) return;
  const h = OH.h, G = OH.game, A = G.art, S = G.sound;
  const PLACES = ["garden", "grind", "square", "post", "bank", "workshop"];
  const HELLO = ["Detective! I saw {bandit} sneak past this morning. Help me with one thing and I will tell you what I know.",
    "You are after {bandit}? Good. Answer me this and the clue is yours.",
    "{bandit} was here. One quick question, then you get my clue."];

  /* A long paragraph, cut into speech-bubble sized pieces at sentence ends. */
  function bubbles(paragraphs) {
    const out = [];
    [].concat(paragraphs || []).filter(Boolean).forEach((text) => {
      let now = "";
      (String(text).match(/[^.!?]+[.!?]+["']?\s*/g) || [String(text)]).forEach((s) => { if (now && (now + s).length > 150) { out.push(now.trim()); now = ""; } now += s; });
      if (now.trim()) out.push(now.trim());
    });
    return out;
  }
  const ok = (x) => x && x.q && Array.isArray(x.options) && x.options[x.answer] != null;

  /* Turn an old-format mission into the shape the engine plays. */
  G.adapt = function (old) {
    const w = +old.week, b = G.bandits[w]; if (!b) return null;
    const name = A.cast[b.key].name, quiz = (old.quiz || []).filter(ok).slice(0, 3);
    const places = [PLACES[(w - 1) % 6], PLACES[(w + 1) % 6], PLACES[(w + 3) % 6]];
    return {
      week: w, title: old.title, fallback: true, badge: { name: (old.badge || {}).name || "Case " + w }, reward: old.reward,
      briefing: { place: "hq", cast: [{ who: "jordan", side: "left", mood: "worried" }, { who: "sprout", side: "right" }],
        lines: bubbles(old.scene).map((t) => ({ who: "narrator", say: t }))
          .concat(old.stakes ? [{ who: "jordan", mood: "worried", pose: "shrug", say: old.stakes }] : [])
          .concat([{ who: "sprout", mood: "glad", pose: "wave", say: name + " is behind this. Three clues, detective, and we can make the catch." }]) },
      stops: quiz.map((q, i) => { const who = A.places[places[i]].host; return { place: places[i], who: who,
        lines: [{ who: who, mood: "happy", pose: "wave", say: HELLO[i % HELLO.length].replace("{bandit}", name) }],
        challenge: { type: "pick", ask: q.q, options: q.options, answer: q.answer, yes: "That's the one." },
        clue: { title: "Clue " + (i + 1), text: q.why } }; }),
      crack: null,
      showdown: { title: "Catch " + name, how: [name + " is hiding in the bushes. Tap it every time it pops up. Five tags and it is yours.", "Then Sprout writes up the case. One of its notes is wrong. Find it."],
        play: (kit, done) => chase(kit, done, quiz) },
      debrief: [].concat(old.debrief || []).filter(Boolean).map((t, i) => ({ who: i ? "sprout" : "jordan", mood: i ? "proud" : "glad", say: String(t) })),
      next: old.next
    };
  };

  /* The generic showdown. Part one: five bushes, and a bandit that pops out of them. */
  function chase(kit, done, quiz) {
    const m = kit.mission, name = A.cast[m.bandit].name, need = 5; let hits = 0, up = -1, shown = 0;
    kit.backdrop(m.zone, { gray: true });
    const clock = kit.timer({ up: true });
    const tally = h("div", { class: "sg-count" }), field = h("div", { class: "sg-holes" });
    const holes = [0, 1, 2, 3, 4].map((n) => h("button", { class: "sg-hole", type: "button", "aria-label": "Bush " + (n + 1), onclick: () => tag(n) },
      h("span", { class: "sg-popper" }, A.avatar(m.bandit, { mood: "glad" })), A.svg(A.shape.at(60, 60, 1.2, A.prop("bush")), { box: "0 0 120 64", class: "sg-holebush" }), h("kbd", { "aria-hidden": "true" }, String(n + 1))));
    const paint = () => { tally.textContent = hits + " of " + need + " tags"; };
    function pop() { if (up >= 0) holes[up].classList.remove("sg-up"); let n = up; while (n === up) n = (shown * 3 + hits * 2 + 1 + Math.floor(Math.random() * 5)) % 5; up = n; shown++; holes[n].classList.add("sg-up"); S.play("zip"); }
    function tag(n) {
      if (n !== up) { kit.fx.shake(holes[n]); return; }                 // an empty bush costs nothing: this part is for fun
      hits++; paint(); S.play("correct"); holes[n].classList.remove("sg-up"); kit.fx.pop(holes[n]); up = -1;
      if (hits >= need) { stop(); clock.stop(); kit.after(500, () => { wrapEl.remove(); notes(kit, done, quiz, name); }); }
    }
    const wrapEl = h("div", { class: "sg-layer sg-chase" }, h("div", { class: "sg-panel" }, h("div", { class: "sg-panel-head" }, h("div", null, h("div", { class: "sg-kicker" }, "The showdown"), h("h2", null, "Tag " + name + " five times"))), tally, field));
    holes.forEach((b) => field.appendChild(b)); kit.stage.appendChild(wrapEl); paint();
    const stop = kit.every(1150, pop); kit.after(400, pop);
    const keys = {}; holes.forEach((b, n) => { keys[String(n + 1)] = () => tag(n); }); kit.keys(keys); kit.focus(holes[0]);
  }
  /* Part two: Sprout's case notes. Each is one of the mission's questions with Sprout's answer, and
     exactly one answer is wrong. */
  function notes(kit, done, quiz, name) {
    if (!quiz.length) { kit.score.sprout(true); return done(); }
    const bad = (kit.week || 0) % quiz.length; let tries = 0, solved = false;
    kit.cast([{ who: "sprout", side: "right", mood: "proud", pose: "hips" }, { who: kit.mission.bandit, side: "left", mood: "surprised" }]);
    const p = kit.panel({ kicker: "Sprout's turn", title: "Sprout wrote up the case. One note is wrong. Tap it.", who: "sprout", class: "sg-wide" });
    const cards = quiz.map((q, i) => { const wrong = i === bad, said = wrong ? q.options[(q.answer + 1) % q.options.length] : q.options[q.answer];
      const b = h("button", { class: "sg-note", type: "button", onclick: () => pick(i, b) }, h("small", null, q.q), h("b", null, said)); return b; });
    function pick(i, b) {
      if (solved || b.disabled) return; tries++;
      if (i !== bad) { b.disabled = true; b.classList.add("sg-no"); kit.fx.shake(b); kit.score.wrong(); p.say("Sprout got that one right. Look again.", "bad"); return; }
      solved = true; kit.score.sprout(tries === 1); kit.score.right(); b.classList.add("sg-found"); kit.actor("sprout", { mood: "oops", pose: "shrug" });
      b.appendChild(h("span", { class: "sg-fix" }, "Fixed: " + quiz[i].options[quiz[i].answer]));
      p.say("Oops. " + quiz[i].why, "ok");
      const on = h("button", { class: "sg-btn sg-primary", type: "button", onclick: () => { p.close(); done(); } }, "Catch " + name); p.foot.appendChild(on); kit.focus(on);
    }
    p.body.appendChild(h("div", { class: "sg-notes" }, cards)); kit.focus(cards[0]);
    const keys = {}; cards.forEach((b, n) => { keys[String(n + 1)] = () => pick(n, b); }); kit.keys(keys);
  }
  G.chase = chase;
})();
