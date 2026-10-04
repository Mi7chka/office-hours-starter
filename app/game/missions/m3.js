/* Save Greenline · case 3: The Sign That Says Nothing. Bandit: Mumbles, who scrambles the sign so
   nobody understands the home page in three seconds.
   What it teaches (session 3 of the class): every visitor asks three things before they scroll (what
   do you do, is it for me, what do I do next) · one clear action beats five · a template is right for
   most sites, until the site has to talk to the rest of the business.
   The showdown is the week's job done with the hands: give the sign the three-second test, rebuild
   its first screen from tiles (what, for whom, where, one line of proof, one button), test it again,
   then check Sprout's three headlines against the facts.

   AGENT MODE: the player IS the AI, Greenline's new agent. So every line here is written to the
   agent ("you") or by the agent ("I"). Sprout is the trainer, the agent who had the job before, and
   its one wrong shortcut (a number nobody gave it, in the third headline) is the thing to catch. The
   agent never publishes: the new sign and the headlines are drafts, and the engine's handoff takes
   them to Jordan. Everything in it is made up. */
(function () {
  "use strict";
  if (!window.OH || !OH.game || !OH.game.mission || !OH.game.art) return;
  const h = OH.h, A = OH.game.art, S = OH.game.sound, sh = A.shape;
  if (S && S.fx) S.fx.m3lamp = () => { S.tone(880, 0.09, { vol: 0.1 }); S.tone(1320, 0.18, { vol: 0.1, at: 0.07 }); };

  // ── the showdown's data: the first screen in app/data/w3-homepage.js, before and after ──
  const OLD = { tagline: "QUALITY · INTEGRITY · SERVICE", headline: "Welcome to Our Website",
    sub: "Family owned and operated since 2009. We are passionate about quality, committed to excellence and dedicated to exceeding your expectations.", link: "Learn More" };
  /* What a passer-by might catch in three seconds. Every answer is a fair one: none of them is what Greenline sells. */
  const CAUGHT = [
    { text: "It said welcome", re: "A welcome. Friendly! But welcome to what?" },
    { text: "Something about quality", re: "Quality what? Every sign in every town says quality." },
    { text: "Family owned, since 2009", re: "Lovely, and true. Still no idea what they sell." },
    { text: "No idea what they sell", re: "Exactly. Three seconds, and still no idea." }
  ];
  /* The three people every sign has to answer, and what each one says when it does. */
  const ASK = [
    { who: "dana", q: "What do you do?", yes: "Landscaper!", needs: ["what"] },
    { who: "bea", q: "Is it for me?", yes: "That's my town!", needs: ["who", "where"] },
    { who: "nell", q: "What do I do next?", yes: "A free quote!", needs: ["cta"] }
  ];
  const SLOTS = [{ key: "what", label: "What we do" }, { key: "who", label: "For whom" }, { key: "where", label: "Where" }, { key: "proof", label: "One line of proof" }, { key: "cta", label: "One button" }];
  /* Nine tiles, scrambled by Mumbles. Five belong on the sign (slot). Four do not (why). */
  const TILES = [
    { text: "Outdoor living solutions", why: "Nobody types that into a search. Customers say lawn. Customers say patio." },
    { text: "in Cedar Hollow", slot: "where", ok: "Cedar Hollow. Now a neighbor knows it is for them." },
    { text: "Learn More", why: "More about what? A button needs a verb and one clear thing to do." },
    { text: "Lawn care and patios", slot: "what", ok: "What Greenline does, in the words a customer would use." },
    { text: "Award-winning service", why: "Which award? Nobody gave Greenline one. Real proof, or none." },
    { text: "4.9 stars from 132 Google reviews", slot: "proof", ok: "One line of proof, from real customers." },
    { text: "for homeowners", slot: "who", ok: "For homeowners. Dana is one of those." },
    { text: "Family owned since 2009", why: "True, and nice. A good second screen. Not the top of the sign." },
    { text: "Get a free quote", slot: "cta", ok: "One button, with a verb on it." }
  ];
  /* Sprout's three headlines: the sample answer from the week 3 tool. The third one adds a number nobody gave it. */
  const FACTS = ["Lawn care, hedge trimming and paver patios", "For homeowners in Cedar Hollow", "Family owned since 2009", "4.9 stars from 132 Google reviews", "Free site visit, then a written quote"];
  const HEADS = [
    { head: "Lawn care and patios for Cedar Hollow homeowners", sub: ["Mowing, hedges and patios.", "Free site visit, written quote."], fine: "Lawns, patios, Cedar Hollow, a free visit. All of that is in the facts." },
    { head: "Cedar Hollow lawn care, hedge trimming and paver patios", sub: ["Family owned since 2009.", "Free site visit, then a written quote."], fine: "Hedges, patios, 2009, a written quote. Every word is in the facts." },
    { head: "The lawn and patio crew Cedar Hollow homeowners trust", sub: ["Trusted by more than 500 local families since 2009.", "4.9 stars on Google."], wrong: true, fix: "Family owned since 2009." }
  ];
  /* The fix is the agent's own choice, so each one says "I". */
  const FIXES = [
    { text: "I keep it. It sounds great.", why: "It sounds great, and nobody can back it up. Dana would ask which families." },
    { text: "I make it 50 families, to be safe.", why: "A smaller made-up number is still made up." },
    { text: "I cut it. Real proof, or none.", right: true }
  ];

  const CSS = `
.m3-sky{position:absolute;top:0;left:0;right:0;height:46%;pointer-events:none;overflow:hidden}
.m3-sky i{position:absolute;top:-12%;display:flex;align-items:center;justify-content:center;width:clamp(26px,4.6vmin,40px);height:clamp(26px,4.6vmin,40px);border:3px solid var(--sg-ink);border-radius:9px;background:#fff;font:900 clamp(15px,2.8vmin,24px)/1 var(--sg-font);font-style:normal;animation:m3-fall 4.6s linear infinite}
@keyframes m3-fall{0%{transform:translateY(-20%) rotate(-30deg);opacity:0}12%{opacity:1}100%{transform:translateY(560%) rotate(200deg);opacity:0}}
.m3-boss{position:absolute;top:1%;left:50%;width:min(30vh,38vw,230px);translate:-50% 0;animation:sg-bounce 2.4s ease-in-out infinite;pointer-events:none}
.m3-boss svg{width:100%;overflow:visible}
.m3-flyer{padding:12px 12px 14px;border:4px solid var(--sg-ink);border-radius:6px 22px 22px 22px;background:var(--sg-cream);box-shadow:0 6px 0 rgba(43,33,71,.3);text-align:center;transform:rotate(-1deg)}
.m3-flyer>b{display:flex;align-items:center;justify-content:center;gap:6px;font:900 21px/1.1 var(--sg-font);letter-spacing:1px;color:#1f8a47}
.m3-flyer>b svg{width:24px;height:24px}
.m3-flyer>small{display:block;margin:3px 0 10px;font:800 13.5px/1.3 var(--sg-font)}
.m3-btns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.sg .m3-peel{position:relative;padding:11px 6px;border:3px solid var(--sg-ink);border-radius:14px;background:var(--c,#fff);color:var(--sg-ink);box-shadow:0 4px 0 var(--sg-ink);font:900 14.5px/1.15 var(--sg-font);rotate:var(--tilt,0deg);transition:transform .45s cubic-bezier(.5,-.3,.8,.6),opacity .45s}
.sg .m3-peel:hover:not(:disabled){filter:brightness(1.07);border-color:var(--sg-ink)}
.m3-peel kbd{position:absolute;top:-10px;left:-8px}
.sg .m3-peel.m3-off{transform:translateY(120px) rotate(34deg) scale(.7);opacity:0}
.sg .m3-peel.m3-kept{grid-column:1/-1;grid-row:1;rotate:0deg;animation:sg-pulse 1s ease-in-out infinite}
.m3{position:absolute;z-index:0;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:6px 12px 12px;overflow:hidden}
.m3>*{position:relative}
.m3-bb{flex:0 0 auto;width:min(100%,600px,74vh);margin-top:4.3em;font-size:16px}
.m3-frame{position:relative}
.m3-board{position:relative;aspect-ratio:2/1;border:.28em solid var(--sg-ink);border-radius:1em;background:#1f8a47;box-shadow:0 .4em 0 rgba(43,33,71,.3);overflow:hidden}
.m3-board.sg-over{outline:4px dashed var(--sg-sun);outline-offset:-12px}
.m3-lamps{position:absolute;left:7%;bottom:calc(100% + .3em);display:flex;gap:1.5em}
.m3-lamp{position:relative;width:1.5em;height:1.5em;border:.2em solid var(--sg-ink);border-radius:50%;background:#b9b6c9;transition:background .2s,box-shadow .2s}
.m3-lamp::after{content:"";position:absolute;top:100%;left:50%;width:.34em;height:.75em;margin-left:-.17em;background:var(--sg-ink)}
.m3-lamp.m3-lit{background:var(--sg-sun);box-shadow:0 0 0 .32em rgba(255,216,61,.5);animation:sg-pop .3s}
.m3-perch{position:absolute;z-index:2;right:5%;bottom:calc(100% - 1.1em);width:16%;aspect-ratio:200/220;pointer-events:none}
.m3-perch svg{width:100%;height:100%;overflow:visible}
.m3-legs{display:flex;justify-content:space-between;padding:0 16%}
.m3-legs i{width:1.1em;height:1.1em;border:.22em solid var(--sg-ink);border-top:0;background:#c98b52}
.m3-face{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5em;padding:.7em 1em;color:#fff;text-align:center}
.m3-old{background:#7d9c8c}
.m3-old>b{font:900 .7em/1 var(--sg-font);letter-spacing:.3em}
.m3-old>small{font:800 .5em/1.2 var(--sg-font);letter-spacing:.22em;opacity:.85}
.m3-old h3{margin:.1em 0;font:700 1.9em/1.1 Georgia,"Times New Roman",serif;font-style:italic}
.m3-old h3 span{display:inline-block;animation:m3-wob 1.5s ease-in-out infinite alternate}
.m3-old h3 span:nth-child(2n){animation-direction:alternate-reverse;animation-duration:1.9s}
@keyframes m3-wob{from{transform:rotate(-6deg) translateY(-.07em)}to{transform:rotate(5deg) translateY(.09em)}}
.m3-old p{max-width:88%;font:600 .64em/1.4 var(--sg-font);opacity:.92}
.m3-old u{font:700 .6em/1 var(--sg-font)}
.m3-top{display:flex;align-items:center;justify-content:space-between;width:100%;font:900 .78em/1 var(--sg-font);letter-spacing:.06em}
.m3-top span{display:flex;align-items:center;gap:.3em}
.m3-top svg{width:1.35em;height:1.35em}
.m3-h{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.16em .34em;margin:auto 0 0;font:900 1.72em/1.08 var(--sg-font)}
.m3-slot{display:inline-flex;align-items:center;justify-content:center;gap:.35em;min-width:5.2em;min-height:1.5em;padding:.1em .5em;border:.14em dashed rgba(255,255,255,.8);border-radius:.5em}
.m3-h .m3-slot{min-width:4em;min-height:1.25em;border-width:.09em;border-radius:.32em}
.m3-slot i{font:800 .72em/1 var(--sg-font);font-style:normal;letter-spacing:.06em;text-transform:uppercase;opacity:.9}
.m3-h .m3-slot i{font-size:.42em}
.m3-slot.m3-in{min-width:0;min-height:0;padding:0;border-color:transparent;animation:sg-pop .32s cubic-bezier(.2,1.4,.4,1)}
.m3-proof{font:800 .92em/1.15 var(--sg-font)}
.m3-proof svg{flex:0 0 auto;width:5.2em;height:1.1em}
.m3-cta{margin:0 0 auto;font:900 1.02em/1 var(--sg-font)}
.m3-cta.m3-in{padding:.5em 1.2em;border:.2em solid var(--sg-ink);border-radius:.8em;background:var(--sg-sun);color:var(--sg-ink);box-shadow:0 .26em 0 var(--sg-ink)}
.m3-cover{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.45em;padding:1em;background:#2b2147;color:#fff;text-align:center;transition:transform .36s cubic-bezier(.5,0,.3,1)}
.m3-cover.m3-up{transform:translateY(-105%)}
.m3-cover svg{position:absolute;top:0;left:0;width:100%;height:100%}
.m3-cover small{position:relative;font:900 .7em/1 var(--sg-font);letter-spacing:.16em;text-transform:uppercase;color:var(--sg-sun)}
.m3-cover b{position:relative;max-width:88%;font:900 1.4em/1.2 var(--sg-font)}
.m3-bar{position:absolute;top:0;left:0;right:0;height:.5em;background:var(--sg-sun);transform:scaleX(0);transform-origin:0 50%}
.m3-crowd{flex:0 0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:min(100%,600px)}
.m3-asker{display:flex;align-items:center;gap:6px;min-width:0}
.m3-asker .sg-face{width:clamp(38px,6.4vh,52px);height:clamp(38px,6.4vh,52px);background:#fff}
.m3-asker p{flex:1;min-width:0;padding:6px 7px;border:3px solid var(--sg-ink);border-radius:14px;background:#fff;font:900 clamp(11.5px,1.8vmin,14px)/1.15 var(--sg-font);text-align:center}
.m3-asker.m3-no p{background:#ffe2e2;color:#a11d2e}
.m3-asker.m3-yes p{background:#c9f5d5;color:#14693a}
.m3-help{flex:0 0 auto;width:min(100%,760px);min-height:2.7em;display:flex;align-items:center;justify-content:center;padding:6px 14px;border:3px solid var(--sg-ink);border-radius:16px;background:#fff;font:800 14.5px/1.3 var(--sg-font);text-align:center}
.m3-help.sg-bad{background:#ffe2e2;color:#a11d2e}.m3-help.sg-ok{background:#d9f8e1;color:#14693a}
.m3-deck{flex:0 0 auto;display:flex;flex-wrap:wrap;align-items:center;align-content:flex-start;justify-content:center;gap:9px;width:min(100%,1120px);min-height:122px}
.m3-deck .sg-chip{rotate:var(--tilt,0deg);animation:sg-pop .3s;touch-action:none}
.sg .m3-big{font-size:clamp(17px,2.6vmin,21px);padding:13px 24px}
.sg .m3-big kbd{margin-left:4px}
.m3-talking .m3-help,.m3-talking .m3-deck,.m3-talking .m3-crowd,.m3-talking .m3-perch{visibility:hidden}
.m3-b{justify-content:safe center;gap:10px;padding-top:10px;overflow-y:auto}
.m3-say{flex:0 0 auto;display:flex;align-items:center;gap:10px;width:min(100%,880px);padding:8px 12px;border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 6px 0 rgba(43,33,71,.3);font:800 clamp(15px,2.2vmin,18px)/1.3 var(--sg-font)}
.m3-say.sg-bad{background:#ffe2e2}.m3-say.sg-ok{background:#d9f8e1}
.m3-say .sg-face{background:#c9f7ee}
.m3-desk{flex:0 0 auto;display:grid;grid-template-columns:minmax(0,5fr) minmax(0,8fr);gap:14px;align-items:start;width:min(100%,880px)}
.m3-note{padding:11px 13px;border:4px solid var(--sg-ink);border-radius:8px 22px 22px 22px;background:#fff1a0;box-shadow:0 5px 0 rgba(43,33,71,.3);font:700 14px/1.4 var(--sg-font);transform:rotate(-1deg)}
.m3-note b{display:block;margin-bottom:3px;font:900 12px/1.2 var(--sg-font);letter-spacing:1px;text-transform:uppercase;color:#7a4be0}
.m3-note ul{margin:0;padding:0 0 0 17px}
.m3-heads{display:grid;gap:11px}
.sg .m3-head{position:relative;display:block;width:100%;padding:9px 13px 10px 50px;border:4px solid var(--sg-ink);border-radius:20px;background:#fff;color:var(--sg-ink);box-shadow:0 5px 0 var(--sg-ink);text-align:left;animation:sg-pop .3s}
.sg .m3-head:disabled{opacity:1}
.sg .m3-head:hover:not(:disabled){background:#fff7cf;border-color:var(--sg-ink)}
.m3-head em{position:absolute;top:10px;left:10px;display:flex;align-items:center;justify-content:center;width:30px;height:30px;border:3px solid var(--sg-ink);border-radius:50%;background:var(--sg-sun);font:900 15px/1 var(--sg-font);font-style:normal}
.m3-head b{display:block;font:900 clamp(15.5px,2.3vmin,19px)/1.2 var(--sg-font)}
.m3-head span{display:block;margin-top:3px;font:700 clamp(13px,1.9vmin,15px)/1.4 var(--sg-font);color:#5d5578}
.sg .m3-head.sg-okay{background:#e6f9eb;box-shadow:none}
.sg .m3-head.sg-found{background:#fff7cf;outline:4px solid var(--sg-red);outline-offset:2px}
.m3-head mark{margin:0 -3px;padding:1px 3px;border-radius:6px;background:none;color:inherit}
.m3-head.sg-found mark{background:var(--sg-sun);color:var(--sg-ink);box-shadow:0 0 0 3px var(--sg-red)}
.m3-head mark.m3-true{background:#c9f5d5;color:#14693a;box-shadow:none;animation:sg-pop .3s}
.m3-foot{display:grid;gap:8px;margin-top:13px}
.m3-foot:empty{display:none}
.m3-foot .sg-opt{padding:9px 12px;font-size:15px}
@media (max-width:700px){
  .m3-board{aspect-ratio:9/5}
  .m3-asker{flex-direction:column;gap:2px}
  .m3-asker .sg-face{margin-bottom:-9px;z-index:1}
  .m3-asker p{flex:0 0 auto;width:100%;padding:9px 4px 5px}
  .m3-btns{grid-template-columns:repeat(2,minmax(0,1fr))}
  .m3-desk{grid-template-columns:1fr;gap:9px}
  .m3-note{padding:8px 11px;font-size:12.5px;line-height:1.35}
  .m3-say{padding:6px 10px}
  .m3-deck{min-height:246px}
  .m3-deck{gap:8px}
  .m3-deck .sg-chip{flex:1 1 40%;font-size:13.5px;padding:8px 9px}
  .sg .m3-big{width:100%}
  .sg .m3-head{padding:8px 10px 9px 46px}
  .m3-foot .sg-opt{padding:8px 10px;font-size:14px}
}
`;
  /* Town Square seen from right in front of the billboard: the map kiosk and a lamp at the sides, so the
     middle of the stage is free for the sign itself. A scene of this mission's own (it is not on the town map). */
  A.addPlace("m3front", { name: "Town Square", host: "maple", building: () =>
    sh.at(104, 0, 1, sh.rect(40, -96, 80, 96, 10, A.C.sun) + sh.path("M28,-96 L80,-142 L132,-96 Z", A.C.red) + sh.rect(52, -82, 56, 44, 6, "#fff", 4) +
      sh.line("M60,-50 Q72,-70 84,-58 T100,-66", A.C.blue, 3.5) + sh.at(88, -82, 0.42, A.iconMarkup("pin")) + sh.ellipse(80, -116, 9, 9, "#fff", 3) + sh.text(80, -111, "i", 13)) +
    sh.at(-200, 0, 1.1, A.prop("lamp")) });
  const leafIcon = () => A.icon("leaf", { color: "#fff" });
  const starRow = () => A.svg([0, 1, 2, 3, 4].map((n) => sh.path(sh.star(11 + n * 21, 11, 9.5), A.C.sun, 2.5)).join(""), { box: "0 0 106 22" });
  const scribble = () => A.svg(sh.line("M14,22 L34,10 L48,30 L66,10 L84,28 L104,12 M310,172 L328,158 L344,178 L362,160 L384,176 M22,160 L40,176 L58,158 M330,24 L350,12 L372,30", A.C.orange, 5), { box: "0 0 400 200", fit: "none" });
  /* Mumbles and a sky full of scrambled letters. Used over HQ in the briefing, and over Town Square at a clue stop. */
  function scramble(kit) {
    kit.style(CSS);
    const sky = h("div", { class: "m3-sky" });
    "EWMLOCE?QY".split("").forEach((c, n) => { const t = h("i", null, c); t.style.left = (3 + n * 9.6) + "%"; t.style.animationDelay = ((n * 7) % 10) * 0.46 + "s"; sky.appendChild(t); });
    kit.stage.appendChild(sky);
    kit.stage.appendChild(h("div", { class: "m3-boss" }, A.svg(sh.at(50, 0, 1, A.characterMarkup("mumbles", { mood: "glad" })) + sh.rect(28, 196, 244, 48, 14, "#fff") +
      sh.line("M48,228 L62,212 L76,230 L92,212 L108,230 L124,214 L140,230 L156,212 L172,230 L188,214 L204,230 L220,212 L236,228 L252,214", A.C.orange, 5), { box: "0 0 300 250" })));
  }

  /* A quick challenge of this mission's own: a flyer with six buttons. Peel five off, keep the one that brings in work. */
  function peel(kit, spec, done) {
    kit.style(CSS);
    const p = kit.panel({ kicker: spec.kicker || "My turn", title: kit.fill(spec.ask), who: spec.who });
    let left = spec.buttons.filter((b) => !b.keep).length;
    const count = h("div", { class: "sg-count" }), paint = () => { count.textContent = left ? left + " to peel off" : "One button left"; };
    const colors = [A.C.pink, A.C.sun, A.C.teal, "#fff", A.C.orange, A.C.blue];
    const btns = spec.buttons.map((b, n) => h("button", { class: "m3-peel", type: "button", style: "--c:" + (b.keep ? A.C.green : colors[n % colors.length]) + ";--tilt:" + [-3, 2, -1, 3, -2, 1][n % 6] + "deg", onclick: () => pick(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), b.text));
    function pick(n) {
      const b = spec.buttons[n], el = btns[n]; if (el.disabled || !left) return;
      if (b.keep) { kit.score.wrong(); kit.fx.shake(el); p.say(b.why, "bad"); return; }
      el.disabled = true; el.classList.add("m3-off"); left--; paint(); kit.score.right(); S.play("whoosh"); p.say(b.why, "ok");
      kit.focus(btns.find((x) => !x.disabled));
      if (left) return;
      btns.forEach((x, k) => { if (spec.buttons[k].keep) x.classList.add("m3-kept"); else x.style.display = "none"; });
      p.say(spec.yes || "One button. Now everybody knows what to do next.", "ok");
      kit.after(1500, () => { p.close(); done(); });
    }
    p.body.appendChild(count);
    p.body.appendChild(h("div", { class: "m3-flyer" }, h("b", null, A.icon("leaf"), "GREENLINE"), h("small", null, "Lawn care and patios for Cedar Hollow homeowners"), h("div", { class: "m3-btns" }, btns)));
    const keys = {}; btns.forEach((b, n) => { keys[String(n + 1)] = () => pick(n); }); kit.keys(keys);
    paint(); kit.focus(btns[0]);
  }

  // ── the showdown: The Three-Second Sign ──
  async function threeSecondSign(kit, done) {
    kit.backdrop("m3front", { gray: true });
    kit.style(CSS);

    // the stage: the billboard with Mumbles on top, three passers-by, a line of help, and a deck of buttons
    const lamps = ASK.map(() => h("i", { class: "m3-lamp" })), perch = h("div", { class: "m3-perch" });
    const face = h("div", { class: "m3-face m3-old" }), bar = h("i", { class: "m3-bar" }), coverK = h("small"), coverT = h("b");
    const cover = h("div", { class: "m3-cover" }, scribble(), coverK, coverT);
    const board = h("div", { class: "m3-board" }, face, cover, bar);
    const bb = h("div", { class: "m3-bb" }, h("div", { class: "m3-frame" }, h("div", { class: "m3-lamps" }, lamps), perch, board), h("div", { class: "m3-legs" }, h("i"), h("i")));
    const crowd = ASK.map((a) => { const f = h("span", { class: "sg-face" }), p = h("p", null, a.q); return { a: a, f: f, p: p, el: h("div", { class: "m3-asker" }, f, p), mood: "" }; });
    const help = h("div", { class: "m3-help", role: "status", "aria-live": "polite" }), deck = h("div", { class: "m3-deck" });
    const wrap = h("div", { class: "m3" }, bb, h("div", { class: "m3-crowd" }, crowd.map((c) => c.el)), help, deck);
    kit.stage.appendChild(wrap);
    const fit = () => { bb.style.fontSize = Math.max(10, bb.clientWidth / (kit.stage.clientWidth < 700 ? 25 : 30)) + "px"; };   // the sign's words scale with the sign
    fit(); kit.on(window, "resize", fit);
    const say = (text, tone) => { help.textContent = text; help.className = "m3-help" + (tone ? " sg-" + tone : ""); };
    let mMood = "";
    const mumbles = (mood) => { if (mood === mMood) return; mMood = mood; perch.innerHTML = ""; perch.appendChild(A.character("mumbles", { mood: mood })); };
    const asker = (c, mood, text, cls) => { if (c.mood !== mood) { c.mood = mood; c.f.innerHTML = ""; c.f.appendChild(A.avatar(c.a.who, { mood: mood })); } c.p.textContent = text; c.el.className = "m3-asker" + (cls ? " " + cls : ""); kit.fx.pop(c.el); };
    const setCover = (kicker, text) => { coverK.textContent = kicker; coverT.textContent = text; };
    const rate = () => Math.max(0.1, Number(OH.game.speed) || 1);
    /* One big button in the deck. Resolves when it is pressed. */
    const press = (label, icon) => new Promise((resolve) => {
      const go = () => { off(); deck.innerHTML = ""; S.play("click"); resolve(); };
      const b = h("button", { class: "sg-btn sg-primary m3-big", type: "button", onclick: go }, A.icon(icon), label, h("kbd", { "aria-hidden": "true" }, "Enter"));
      const off = kit.keys({ Enter: go, " ": go });    // Enter works even when the button has lost the focus
      deck.innerHTML = ""; deck.appendChild(b); kit.fx.pop(b); kit.focus(b);
    });
    /* Lift the cover for three seconds. onSecond(n) runs as each second starts. */
    const flash = (onSecond) => new Promise((resolve) => {
      let last = -1;
      cover.classList.add("m3-up"); S.play("whoosh");
      bar.style.transition = "none"; bar.style.transform = "scaleX(1)"; void bar.offsetWidth;
      bar.style.transition = "transform " + (3 / rate()).toFixed(2) + "s linear"; bar.style.transform = "scaleX(0)";
      const t = kit.timer({ seconds: 3, onTick: (v) => { if (v === last || v < 1) return; last = v; S.play("tick"); if (onSecond) onSecond(4 - v); }, onEnd: () => { t.stop(); t.hide(); resolve(); } });
    });

    // Round 1 · the three-second test, on the sign Mumbles scrambled
    face.appendChild(h("b", null, "GREENLINE")); face.appendChild(h("small", null, OLD.tagline));
    face.appendChild(h("h3", null, OLD.headline.split(" ").map((w) => [h("span", null, w), " "])));
    face.appendChild(h("p", null, OLD.sub)); face.appendChild(h("u", null, OLD.link));
    mumbles("sneaky"); crowd.forEach((c) => asker(c, "happy", c.a.q));
    setCover("The three-second test", "I get three seconds with this sign.");
    say("Mumbles scrambled Greenline's sign. I look at it the way a stranger does: for three seconds.");
    await press("Show me the sign", "eye");
    say("One. Two. Three.");
    await flash();
    setCover("Time is up", "I look away. What do I know?"); cover.classList.remove("m3-up"); S.play("drop"); mumbles("glad");
    say("Quick, before I forget. What did the sign tell me? Tap it, or press its number.");
    const caught = await new Promise((resolve) => {
      const chips = CAUGHT.map((c, n) => h("button", { class: "sg-chip", type: "button", onclick: () => pick(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), h("span", null, c.text)));
      const pick = (n) => { off(); deck.innerHTML = ""; S.play("click"); resolve(CAUGHT[n]); };
      const keys = {}; chips.forEach((b, n) => { deck.appendChild(b); keys[String(n + 1)] = () => pick(n); });
      const off = kit.keys(keys); kit.focus(chips[0]);
    });
    say(caught.re + " And the three questions? Nobody got an answer.", "bad");
    for (let n = 0; n < crowd.length; n++) { await kit.wait(520); asker(crowd[n], "worried", crowd[n].a.q, "m3-no"); kit.fx.shake(crowd[n].el); S.play("oops"); }
    await kit.wait(2300);

    // Round 2 · rebuild the first screen from tiles: what, for whom, where, one line of proof, one button
    const slotEl = {}, have = {};
    SLOTS.forEach((s) => { slotEl[s.key] = h(s.key === "proof" || s.key === "cta" ? "div" : "span", { class: "m3-slot" + (s.key === "proof" ? " m3-proof" : s.key === "cta" ? " m3-cta" : "") }, h("i", null, s.label)); });
    face.className = "m3-face"; face.innerHTML = "";
    face.appendChild(h("div", { class: "m3-top" }, h("span", null, leafIcon(), "GREENLINE"), h("span", null, "555-0100")));
    face.appendChild(h("div", { class: "m3-h" }, slotEl.what, slotEl.who, slotEl.where)); face.appendChild(slotEl.proof); face.appendChild(slotEl.cta);
    crowd.forEach((c) => asker(c, "happy", c.a.q));
    cover.classList.add("m3-up"); S.play("whoosh"); mumbles("sneaky");
    say("I draft the sign again. Five tiles belong on it. Drag one onto the sign, tap it, or press its number.");
    await new Promise((resolve) => {
      let busy = false, placed = 0;
      const tiles = TILES.map((t, n) => h("button", { class: "sg-chip", type: "button", style: "--tilt:" + [-2, 1.5, -1, 2, -1.5, 1, -2, 2, -1][n] + "deg", onclick: () => put(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), h("span", null, t.text)));
      function put(n, dropped) {
        const t = TILES[n], b = tiles[n]; if (busy || b.disabled) return;
        if (!t.slot) { kit.score.wrong(); kit.fx.shake(b); b.disabled = true; b.classList.add("sg-no"); say(t.why, "bad"); mumbles("glad"); kit.focus(tiles.find((x) => !x.disabled)); return; }
        busy = true; b.disabled = true; kit.score.right();
        const land = () => {
          const s = slotEl[t.slot]; b.style.visibility = "hidden"; have[t.slot] = true; placed++;
          s.innerHTML = ""; if (t.slot === "proof") s.appendChild(starRow()); s.appendChild(document.createTextNode(t.text)); s.classList.add("m3-in");
          ASK.forEach((a, k) => { if (!lamps[k].classList.contains("m3-lit") && a.needs.every((x) => have[x])) { lamps[k].classList.add("m3-lit"); S.play("m3lamp"); } });
          say(t.ok, "ok"); mumbles(placed >= 4 ? "surprised" : placed >= 2 ? "worried" : "sneaky"); busy = false;
          if (placed >= SLOTS.length) { off(); return resolve(); }
          kit.focus(tiles.find((x) => !x.disabled));
        };
        if (dropped) land(); else kit.fx.fly(b, slotEl[t.slot], land);
      }
      deck.innerHTML = "";
      tiles.forEach((b, n) => { deck.appendChild(b); kit.drag(b, { zones: [board], disabled: () => busy || b.disabled, onDrop: (zone) => { if (zone) put(n, true); return false; } }); });
      const keys = {}; tiles.forEach((b, n) => { keys[String(n + 1)] = () => put(n); });
      const off = kit.keys(keys); kit.focus(tiles[0]);
    });
    await kit.wait(1300);

    // the test again: the same three seconds, and this time the passers-by get their answers
    deck.innerHTML = ""; setCover("The three-second test", "Same sign. New words. Three seconds.");
    cover.classList.remove("m3-up"); S.play("drop"); lamps.forEach((l) => l.classList.remove("m3-lit"));
    say("What, for whom and where. One line of proof. One button. Now I test my draft like a stranger.", "ok");
    await press("Flash the new sign", "eye");
    say("One. Two. Three.");
    await flash((n) => { const c = crowd[n - 1]; if (!c) return; asker(c, "glad", c.a.yes, "m3-yes"); lamps[n - 1].classList.add("m3-lit"); S.play("m3lamp"); });
    mumbles("surprised"); kit.fx.confetti(40); S.play("correct");
    say("Three seconds, three answers. My draft passes, and the phone number is right at the top.", "ok");
    await kit.wait(2600);

    // Sprout's shortcut: three more headlines, in two seconds, and "copy them"
    wrap.classList.add("m3-talking");
    kit.cast([{ who: "mumbles", side: "left", mood: "grumpy" }, { who: "sprout", side: "right", mood: "happy" }]);
    await kit.say([
      { who: "mumbles", mood: "grumpy", say: "Mmmph. One sign. The home page needs a headline too. I will scramble that next." },
      { who: "sprout", mood: "glad", pose: "cheer", say: "Now watch my shortcut, {name}. Three headlines from Jordan's facts, in two seconds. Stand back!" }
    ]);
    kit.hush(); kit.cast([]);
    const sface = h("span", { class: "sg-face" }), words = h("span"), note = h("div", { class: "m3-say", role: "status", "aria-live": "polite" }, sface, words);
    const tell = (text, m, tone) => { words.textContent = text; sface.innerHTML = ""; sface.appendChild(A.avatar("sprout", { mood: m })); note.className = "m3-say" + (tone ? " sg-" + tone : ""); kit.fx.pop(note); };
    const heads = h("div", { class: "m3-heads" }), foot = h("div", { class: "m3-foot" });
    const facts = h("div", { class: "m3-note" }, h("b", null, "The facts Jordan gave Sprout"), h("ul", null, FACTS.map((f) => h("li", null, f))));
    wrap.className = "m3 m3-b"; wrap.innerHTML = ""; wrap.appendChild(note); wrap.appendChild(h("div", { class: "m3-desk" }, facts, h("div", null, heads, foot)));
    tell("Watch and learn. Writing...", "think");
    const cards = [];
    await new Promise((resolve) => {                   // three headlines zip onto the page
      let n = 0;
      const stop = kit.every(420, () => {
        const d = HEADS[n], marks = d.sub.map((s) => h("mark", null, s));
        const b = h("button", { class: "m3-head", type: "button", disabled: true }, h("em", null, String(n + 1)), h("b", null, d.head), h("span", null, marks[0], " ", marks[1]));
        cards.push({ d: d, el: b, marks: marks }); heads.appendChild(b); S.play("zip");
        if (++n >= HEADS.length) { stop(); kit.after(500, resolve); }
      });
    });
    tell("Done. Three headlines, only Jordan's facts. Copy them. All perfect. Probably.", "proud");
    await kit.wait(1700);

    // Round 3 · which headline says something nobody told Sprout? Then put it right.
    tell("Check them first? Fine. Tap the headline with a fact Jordan never gave me. If you can find one!", "proud");
    let tries = 0;
    const found = await new Promise((resolve) => {
      const pick = (c) => {
        if (c.el.disabled) return;
        if (!c.d.wrong) { tries++; kit.score.wrong(); kit.fx.shake(c.el); c.el.disabled = true; c.el.classList.add("sg-okay"); tell(c.d.fine + " Look again.", "proud", "bad"); return; }
        off(); cards.forEach((x) => { x.el.disabled = true; }); c.el.classList.add("sg-found"); kit.score.right();
        kit.score.sprout(tries === 0);                 // the second star: Sprout's slip caught on the first try
        resolve(c);
      };
      cards.forEach((c) => { c.el.disabled = false; c.el.onclick = () => pick(c); });
      const off = kit.keys({ "1": () => pick(cards[0]), "2": () => pick(cards[1]), "3": () => pick(cards[2]) });
      kit.focus(cards[0].el);
    });
    found.marks[1].className = "m3-true";
    tell("Oops. Nobody gave me 500 families. It sounded good, so I added it. How do you fix it?", "oops", "ok");
    await new Promise((resolve) => {
      const opts = FIXES.map((f, n) => h("button", { class: "sg-opt", type: "button", onclick: () => pick(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), h("span", null, f.text)));
      function pick(n) {
        const b = opts[n]; if (b.disabled) return;
        if (!FIXES[n].right) { b.disabled = true; b.classList.add("sg-no"); kit.score.wrong(); kit.fx.shake(b); tell(FIXES[n].why, "oops", "bad"); return; }
        off(); kit.score.right(); foot.innerHTML = ""; resolve();
      }
      opts.forEach((b) => foot.appendChild(b));
      const off = kit.keys({ "1": () => pick(0), "2": () => pick(1), "3": () => pick(2) });
      kit.focus(opts[0]);
    });
    found.marks[0].textContent = found.d.fix; found.marks[0].className = "m3-true"; found.el.className = "m3-head sg-okay"; kit.fx.pop(found.el);
    tell(kit.fill("Fixed. Good catch, {name}. Now all three are true. My shortcut skipped checking the facts."), "glad", "ok");
    await kit.wait(2000);
    kit.cast([{ who: "mumbles", side: "left", mood: "surprised" }, { who: "sprout", side: "right", mood: "proud", pose: "hips" }]);
    await kit.say([
      { who: "mumbles", mood: "surprised", say: "They read it in three seconds? And you checked your trainer's facts? Mmmph. That is not fair!" },
      { who: "sprout", mood: "proud", pose: "cheer", say: "You draft. Jordan publishes. Take it to Jordan, {name}!" }
    ]);
    done();
  }

  // ── the case ──
  OH.game.mission({
    week: 3,
    title: "The Sign That Says Nothing",
    badge: { name: "Three-Second Pass" },
    reward: { hours: 0, leads: 2, money: 0 },
    maxWrong: 4,

    /* The briefing at Greenline HQ. Jordan and Sprout talk to the agent. {agent} becomes "Agent Ivy"
       and {name} becomes "Ivy". who: "you" is the agent's own thought, shown as visor text. */
    briefing: {
      setup: scramble,                                 // Mumbles, and a sky full of scrambled letters
      lines: [
        { who: "jordan", mood: "worried", pose: "shrug", say: "{agent}! The leads sheet went quiet overnight. Not the good kind of quiet." },
        { who: "jordan", mood: "worried", pose: "point", say: "Mumbles got to our billboard in Town Square. People walk past, squint, and keep walking." },
        { who: "sprout", mood: "think", pose: "idle", say: "I gave it three seconds, {name}. I remember a welcome, and the word quality. And I work here!" },
        { who: "jordan", mood: "grumpy", pose: "hips", say: "Every word on that sign is true! I wrote it myself. I am proud of that sign." },
        { who: "jordan", mood: "think", pose: "idle", say: "It is the top of our home page, painted big. A stranger gives it three seconds. Then they are gone." },
        { who: "you", say: "Every word is true. And I still cannot say what Greenline sells." },
        { who: "jordan", mood: "happy", pose: "point", say: "Three people in town know what a sign has to say. Learn from them, {name}. Then we fix ours." }
      ]
    },

    /* Three stops. The host talks to the agent. Each piece of knowledge (`clue`) is one real idea from
       the class, said as something the agent now knows about its own work. */
    stops: [
      { place: "garden", who: "dana",
        lines: [
          { who: "dana", mood: "happy", pose: "wave", say: "{agent}! I walked past your billboard this morning. Lovely colors. What does it sell?" },
          { who: "sprout", mood: "oops", pose: "shrug", say: "Landscaping! Lawns, hedges, patios! It says so. Somewhere. Probably." },
          { who: "dana", mood: "think", pose: "idle", say: "When I need a hedge trimmed, a sign gets three seconds. And I am asking three things at once." },
          { who: "dana", mood: "proud", pose: "point", say: "What do you do? Is it for me? What do I do next? Try your sign against those." }
        ],
        challenge: { type: "sort", ask: "Which of Dana's questions does each line answer?",
          bins: [{ key: "what", label: "What do you do?", icon: "leaf", color: A.C.green }, { key: "who", label: "Is it for me?", icon: "home", color: A.C.sun },
            { key: "next", label: "What next?", icon: "hand", color: A.C.blue }, { key: "none", label: "None of them", icon: "cross", color: A.C.purple }],
          items: [
            { text: "Welcome to Our Website", bin: "none", why: "Polite, and it answers nothing. Three seconds gone." },
            { text: "Lawn care and paver patios", bin: "what", why: "That is what Greenline does, in a customer's words." },
            { text: "Family owned since 2009", bin: "none", why: "True and nice. A good second screen, a poor first one." },
            { text: "For Cedar Hollow homeowners", bin: "who", why: "Dana is a homeowner in Cedar Hollow. So yes, it is for her." },
            { text: "Quality. Integrity. Service.", bin: "none", why: "Every company says so. It answers none of the three." },
            { text: "Get a free quote", bin: "next", why: "A verb on a button. Now she knows what to do next." }
          ] },
        clue: { title: "Three questions", text: "Every visitor asks three things before they scroll: \"What do you do?\" \"Is it for me?\" \"What do I do next?\" The first screen I draft answers all three." } },

      { place: "post", who: "nell",
        lines: [
          { who: "nell", mood: "happy", pose: "wave", say: "I print every flyer in town. The busy ones have five buttons, three arrows and a coupon." },
          { who: "nell", mood: "think", pose: "idle", say: "Nobody calls any of them. Give people five things to do and they do none." },
          { who: "sprout", mood: "surprised", pose: "shrug", say: "But I put six buttons on Greenline's flyer. Something for everyone! That is my shortcut." },
          { who: "nell", mood: "glad", pose: "point", say: "One button, dear. With a verb on it. Go on, {name}, peel the rest off." }
        ],
        challenge: { ask: "Sprout's flyer has six buttons. Peel five off. Keep the one that brings in work.", play: peel, yes: "One button. Now everybody knows what to do next.",
          buttons: [
            { text: "Learn More", why: "More about what? Off it comes." },
            { text: "Our Story", why: "A good second screen. Not a button up top." },
            { text: "Get a free quote", keep: true, why: "Keep that one! A verb, and one clear thing to do." },
            { text: "Follow Us", why: "That sends people away from the page." },
            { text: "Our Mission", why: "Nobody phones about a mission." },
            { text: "Read the Blog", why: "Later, maybe. First they want a quote." }
          ] },
        clue: { title: "One button", text: "One clear action beats five. I put one button with a verb on it, like \"Get a free quote\", and I repeat it down the page." } },

      { place: "square", who: "maple",
        setup: scramble,                               // Mumbles, right over the sign it scrambled
        lines: [
          { who: "maple", mood: "worried", pose: "shrug", say: "Welcome to Town Square! Mind the gray. And that billboard. I cannot make out a word of it." },
          { who: "maple", mood: "proud", pose: "point", say: "The town's own website came out of a box. A template. Up in a week, and I change the words myself." },
          { who: "sprout", mood: "think", pose: "idle", say: "Greenline should build a custom one, {name}. Bigger! Fancier! That is what I would do." },
          { who: "maple", mood: "think", pose: "hips", say: "Only when the site has to talk to the rest of the business. Not one day before. Look here." }
        ],
        challenge: { type: "spot", ask: "The mayor sorted these. One is in the wrong group. Tap it.", nope: "That one is in the right group. Look again.",
          groups: [
            { label: "A template is right", color: A.C.blue, items: [{ text: "Pages, photos and opening hours" }, { text: "A good site, live this month" },
              { text: "Leads get retyped into the CRM", wrong: true, why: "Retyping means the site cannot talk to the rest of the business. That is the sign it has outgrown the template." }] },
            { label: "Outgrown the template", color: A.C.orange, items: [{ text: "Bookings live somewhere else" }, { text: "Payments live somewhere else" }, { text: "Nobody on the team can change it" }] }
          ] },
        clue: { title: "Template first", text: "A template is right for most sites, so I start there. A site has outgrown it when it has to talk to the rest of the business: the CRM, the bookings, the payments." } }
    ],

    /* The plan: the agent's own three options, so they say "I". */
    crack: {
      lines: [{ who: "sprout", mood: "glad", pose: "cheer", say: "Three things learned, {name}. So how do we unscramble the sign?" }],
      ask: "What is my plan?",
      cards: [
        { title: "I add more to the sign", text: "Our story, our mission, our values, and five buttons.", color: A.C.pink,
          art: sh.rect(14, 18, 92, 70, 10, "#fff") + sh.line("M24,32 H96 M24,43 H96 M24,54 H96 M24,65 H70", A.C.ink, 3.5) + [22, 42, 62, 82].map((x) => sh.rect(x, 72, 16, 10, 4, A.C.sun, 2.5)).join("") + sh.rect(30, 88, 8, 22, 2, A.C.wood, 3) + sh.rect(82, 88, 8, 22, 2, A.C.wood, 3),
          react: { who: "mumbles", mood: "glad", say: "Mmm, yes! More words! Nobody will find the one that matters. Hee hee." } },
        { title: "I build a brand new site", text: "Custom built, from nothing. Ready next spring.", color: A.C.sun,
          art: [0, 1, 2].map((r) => [0, 1, 2].map((c) => sh.rect(14 + c * 30 + (r % 2) * 8, 64 + r * 15, 28, 13, 3, A.C.orange, 3)).join("")).join("") + sh.at(58, 6, 1.15, A.iconMarkup("clock")),
          react: { who: "maple", mood: "think", say: "Slow down. The words are the trouble, not the box they came in. Template first." } },
        { title: "I say it in three seconds", text: "What we do, for whom and where. One line of proof. One button.", color: A.C.teal, right: true,
          art: sh.rect(12, 16, 96, 68, 10, "#1f8a47") + sh.line("M26,34 H94 M34,47 H86", "#fff", 6) + sh.rect(42, 58, 36, 16, 7, A.C.sun, 3) + sh.rect(30, 84, 8, 24, 2, A.C.wood, 3) + sh.rect(82, 84, 8, 24, 2, A.C.wood, 3) + sh.at(86, 4, 0.7, A.iconMarkup("check")),
          react: { who: "jordan", mood: "glad", say: "That's it. What we do, for whom and where. Then one button. You draft it. I put it up." } }
      ]
    },

    /* The showdown: Jordan's task line for the visor, and how to play in the agent's own words. */
    showdown: {
      title: "The Three-Second Sign",
      task: "Draft a three-second sign. Publish nothing.",
      how: ["I look at the scrambled sign for three seconds. Then I say what I caught.", "I draft it again from tiles. Drag one onto the sign, tap it, or press its number.", "Then Sprout shows me its shortcut: three headlines. I check them against the facts."],
      play: threeSecondSign
    },

    /* The handoff: the agent never publishes. After the showdown the engine takes the work to Jordan. */
    handoff: {
      ask: "A new sign and three headlines, {agent}. Show me.",
      work: ["A draft of the sign: what, for whom, where, proof, one button.", "Three headlines. One made-up number is cut.", "Nothing published. Not one word."],
      approve: "Approved. I will put the new words up myself."
    },

    /* After the catch: two lines. The second steps out of the story, for the person playing. */
    debrief: [
      { who: "jordan", mood: "glad", pose: "cheer", say: "The sign went from a welcome to what we do, for whom and where. With one button." },
      { who: "sprout", mood: "proud", pose: "wave", say: "For the person behind the visor: tonight, hand someone your phone for three seconds. Ask what you do." }
    ],
    next: "Next case: the sign is clear. Nobody searching for a patio can find Greenline."
  });
})();
