/* Save Greenline · case 2: The Lead That Waited All Night. Bandit: Slowpoke, who makes every new lead wait.
   What it teaches (session 2 of the class): every automation is three parts (when this happens, do
   that, and tell a person) · three levels, and you start at the lowest one that does the job · automate
   the carrying and keep the judgment: a person approves anything a customer will see.
   The showdown is the week's job done with the hands: carry two leads from the form to the sheet to
   Jordan, wire the machine that does the carrying, flag the leads that should not ping anybody, then
   check Sprout's draft reply before it is copied.

   AGENT MODE: the player IS the AI, Greenline's new agent. So every line here is written to the
   agent ("you") or by the agent ("I"). Sprout is the trainer, the agent who had the job before, and
   its one wrong shortcut (a promised date in the draft to Tomas) is the thing to catch. The agent
   never sends: the draft is made ready for Jordan, and the engine's handoff takes it there.
   Everything in it is made up. */
(function () {
  "use strict";
  if (!window.OH || !OH.game || !OH.game.mission || !OH.game.art) return;
  const h = OH.h, A = OH.game.art, S = OH.game.sound, sh = A.shape;

  // ── this mission's own icons and sounds ──
  A.icons.m2flag = (c) => sh.line("M12,6 V44", A.C.ink, 5) + sh.path("M12,8 H39 L32,17 L39,26 H12 Z", c || A.C.red, 4);
  A.icons.m2moon = (c) => sh.path("M30,6 A19,19 0 1 0 42,32 A15,15 0 0 1 30,6 Z", c || A.C.sun, 4);
  A.icons.m2switch = (c) => sh.rect(5, 14, 38, 20, 10, c || A.C.green, 4) + sh.ellipse(32, 24, 7, 7, "#fff", 3);
  A.icons.m2link = (c) => sh.rect(4, 16, 23, 16, 8, c || "#fff", 4) + sh.rect(21, 16, 23, 16, 8, c || "#fff", 4) + sh.line("M17,24 H31", A.C.ink, 4);
  A.icons.m2gear = (c) => [0, 45, 90, 135, 180, 225, 270, 315].map((a) => sh.group(sh.rect(20, 3, 8, 11, 2, c || A.C.gray, 3), 'transform="rotate(' + a + ' 24 24)"')).join("") + sh.ellipse(24, 24, 14, 14, c || A.C.gray, 4) + sh.ellipse(24, 24, 5, 5, "#fff", 3);
  if (S && S.fx) {
    S.fx.m2ping = () => { S.tone(1320, 0.1, { vol: 0.1 }); S.tone(1760, 0.2, { vol: 0.1, at: 0.09 }); };
    S.fx.m2bonk = () => { S.tone(300, 0.16, { type: "square", to: 110, vol: 0.06 }); };
  }

  // ── the showdown's data: the leads in app/data/w2-leads.js, in the order they reach the form ──
  /* said: what the person wrote, in a line. again: the same person asking twice. junk: not a lead at all. */
  const LEADS = [
    { key: "tomas", name: "Tomas", row: "Tomas R.", color: A.C.orange, said: "Tomas: half an acre of oak leaves. What does a cleanup usually cost?" },
    { key: "marcus", name: "Marcus", row: "Marcus O.", color: A.C.blue, said: "Marcus: a paver patio in the backyard. Can someone come and look?" },
    { key: "hannah", name: "Hannah", row: "Hannah B.", color: A.C.pink, said: "Hannah: weekly mowing on a corner lot. When could you start?" },
    { key: "aisha", name: "Aisha", row: "Aisha K.", color: A.C.purple, said: "Aisha: hedges trimmed and fresh mulch, in one visit." },
    { key: "hannah", name: "Hannah", row: "Hannah B.", color: A.C.pink, again: true, said: "Hannah: sending this again, in case the first one did not go through.",
      slip: "Hannah is already in the sheet. Two pings, and Jordan calls her twice. I flag that one.", ok: "Flagged. One Hannah, one row, one call. Her row says she asked twice." },
    { key: "rank", name: "Rank Booster", row: "", color: A.C.gray, junk: true, said: "Rank Booster Team: we can put your website at the top of search. Reply today!",
      slip: "That was a sales pitch, not a lead. Jordan got a ping for nothing. I flag that one.", ok: "Flagged. A sales pitch is not a lead. No row, and no ping for Jordan." },
    { key: "owen", name: "Owen", row: "Owen F.", color: A.C.teal, said: "Owen: a seasonal contract for a small office building." },
    { key: "meilin", name: "Mei-Lin", row: "Mei-Lin Z.", color: A.C.green, said: "Mei-Lin: water pools by the back fence every time it rains." }
  ];
  /* The three parts of every automation, left to right: one under each station of the machine. */
  const PARTS = [
    { key: "when", kicker: "When", name: "The form", is: "what starts it", ask: "When: what starts the machine?" },
    { key: "do", kicker: "Do", name: "The leads sheet", is: "what the machine does", ask: "Do: what does the machine do with a lead?" },
    { key: "tell", kicker: "Tell", name: "Jordan's phone", is: "who hears about it", ask: "And tell a person: who hears about it?" }
  ];
  const TILES = [
    { text: "Ping Jordan", part: "tell" },
    { text: "Hope somebody looks", why: "That is how Tomas waited all night. Slowpoke loves that tile." },
    { text: "A lead sends the form", part: "when" },
    { text: "Send the reply myself", why: "Tomas would read that. Rule one: nothing goes out until a person approves it." },
    { text: "Save it as a row", part: "do" }
  ];
  /* Sprout's draft reply to Tomas: the sample answer from the week 2 tool. One line breaks a rule.
     fine: what Sprout says when a line that is fine gets tapped (the note bar has Sprout's face on it). */
  const DRAFT = [
    { text: "Hi Tomas,", fine: "Just a hello. Look further down." },
    { text: "Thank you for asking Greenline about a fall cleanup.", fine: "A thank-you, and it repeats what he asked for. That line is fine." },
    { text: "You have a half-acre lot with a lot of oak trees.", fine: "Straight from his row: half an acre, oak trees. That line is fine." },
    { text: "I can't give you a cost until we have seen the lot.", fine: "No price. That is the rule, and I kept it." },
    { text: "We will have it done before the end of the month.", wrong: true },
    { text: "Which weekday evening after 6 PM works for a short site visit?", fine: "One question, and the time comes from his row. That line is fine." }
  ];
  /* The fix is the agent's own choice, so each one says "I". */
  const FIXES = [
    { text: "I change it to: done by Friday.", why: "Still a promise. Just a sooner one." },
    { text: "I cut it. Jordan sets a date after the visit.", right: true },
    { text: "I add the word \"probably\".", why: "\"Probably\" still sounds like a promise to Tomas." }
  ];
  const X = [14, 50, 86];                                // where the form, the sheet and the phone stand, in percent of the line

  const CSS = `
.m2-nap{position:absolute;top:1%;left:50%;width:min(30vh,38vw,230px);translate:-50% 0;animation:sg-bounce 3.4s ease-in-out infinite;pointer-events:none}
.m2-nap>svg{width:100%;overflow:visible}
.m2-nap i{position:absolute;top:20%;right:8%;font:900 clamp(18px,3.4vmin,28px)/1 var(--sg-font);font-style:normal;color:var(--sg-ink);opacity:0;animation:m2-z 3s ease-out infinite}
@keyframes m2-z{0%{transform:translate(0,0) scale(.5);opacity:0}20%{opacity:1}100%{transform:translate(34px,-74px) scale(1.5);opacity:0}}
.m2{position:absolute;z-index:0;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:6px 12px 12px;--p:.3;--night:.5}
.m2::before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(#17124a 0,rgba(23,18,74,.78) 55%,rgba(23,18,74,.3) 100%);opacity:var(--night);pointer-events:none}
.m2>*{position:relative}
.m2-meter{flex:0 0 auto;width:min(100%,760px);height:clamp(92px,16vh,124px);--sw:clamp(70px,12vh,96px)}
.m2-stars{position:absolute;top:0;left:0;width:100%;height:100%;opacity:var(--night)}
.m2-track{position:absolute;left:0;right:0;bottom:22px;height:16px;border:3px solid var(--sg-ink);border-radius:999px;background:rgba(255,255,255,.45);overflow:hidden}
.m2-track i{display:block;height:100%;width:calc(var(--p)*100%);background:linear-gradient(90deg,#22cdb8,#9b6bff)}
.m2-snail{position:absolute;bottom:25px;left:calc(var(--p)*(100% - var(--sw)));width:var(--sw);height:calc(var(--sw)*1.1)}
.m2-snail svg{width:100%;height:100%;overflow:visible}
.m2-ends{position:absolute;left:2px;right:2px;bottom:0;display:flex;justify-content:space-between;color:#fff;font:900 12.5px/1.3 var(--sg-font);text-shadow:1px 1px 0 var(--sg-ink),-1px 1px 0 var(--sg-ink),1px -1px 0 var(--sg-ink),-1px -1px 0 var(--sg-ink)}
.m2-ends span{display:flex;align-items:center;gap:4px}
.m2-ends svg{width:16px;height:16px}
.m2-line{flex:1;min-height:0;position:relative;width:min(100%,900px);--art:clamp(104px,min(25vh,31vw),196px);--plate:clamp(56px,8.6vh,64px);--lh:clamp(30px,5vh,40px);--belt:16px;--lane:calc(var(--lh) + var(--belt) + 16px)}
.m2-st{position:absolute;bottom:0;width:26%;display:flex;flex-direction:column;align-items:center}
.m2-st0{left:1%}.m2-st1{left:37%}.m2-st2{left:73%}
.m2-art{display:flex;align-items:flex-end;justify-content:center;width:100%;height:var(--art);margin-bottom:var(--lane);transition:transform .15s}
.m2-art>svg{height:100%;width:auto;max-width:100%;overflow:visible}
.m2-st.sg-over .m2-art{transform:scale(1.07)}
.m2-send{transform-box:fill-box;transform-origin:center}
.m2-live .m2-send{animation:sg-pulse .8s ease-in-out infinite}
.m2-sheet{display:flex;flex-direction:column;width:100%;max-width:212px;height:100%;border:4px solid var(--sg-ink);border-radius:14px;background:#fff;box-shadow:0 5px 0 rgba(43,33,71,.3);overflow:hidden}
.m2-sheet>b{flex:0 0 auto;padding:4px 6px;border-bottom:3px solid var(--sg-ink);background:var(--sg-green);color:#fff;font:900 12px/1.1 var(--sg-font);letter-spacing:1.5px;text-align:center}
.m2-rows{flex:1;min-height:0;display:grid;grid-template-rows:repeat(6,minmax(0,1fr))}
.m2-r{display:flex;align-items:center;justify-content:space-between;gap:3px;padding:0 6px;border-bottom:2px solid #dcd8ea;font:800 clamp(10.5px,1.75vmin,13px)/1 var(--sg-font);white-space:nowrap;overflow:hidden}
.m2-r:last-child{border-bottom:0}
.m2-r.m2-twice{background:#fff1a0}
.m2-r em{flex:0 0 auto;padding:2px 5px;border-radius:999px;background:var(--sg-red);color:#fff;font-style:normal;font-size:.82em}
.m2-phone{position:relative;display:flex;height:100%;aspect-ratio:10/16;max-width:88%;padding:9px 6px 13px;border:4px solid var(--sg-ink);border-radius:20px;background:#3a3350;box-shadow:0 5px 0 rgba(43,33,71,.3)}
.m2-screen{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border:3px solid var(--sg-ink);border-radius:10px;background:#8f8aa8;transition:background .3s}
.m2-on .m2-screen{background:#c4efff}
.m2-screen .sg-face{width:74%;height:auto;aspect-ratio:1;background:#fff}
.m2-screen small{font:900 clamp(10px,1.6vmin,12.5px)/1 var(--sg-font)}
.m2-phone em{position:absolute;top:-12px;right:-13px;display:flex;align-items:center;justify-content:center;min-width:28px;height:28px;padding:0 5px;border:3px solid var(--sg-ink);border-radius:999px;background:var(--sg-red);color:#fff;font:900 14px/1 var(--sg-font);font-style:normal}
.m2-ring{animation:m2-ring .45s}
.m2-ring::after{content:"";position:absolute;top:-10px;right:-10px;bottom:-10px;left:-10px;border:4px solid var(--sg-sun);border-radius:28px;animation:m2-wave .5s ease-out both}
@keyframes m2-ring{0%,100%{rotate:0deg}20%{rotate:-10deg}40%{rotate:9deg}60%{rotate:-6deg}80%{rotate:4deg}}
@keyframes m2-wave{from{opacity:1;transform:scale(.9)}to{opacity:0;transform:scale(1.3)}}
.m2-plate{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:100%;height:var(--plate);padding:3px 5px;border:3px solid var(--sg-ink);border-radius:14px;background:#fff;text-align:center;font:800 clamp(11.5px,1.8vmin,14px)/1.15 var(--sg-font)}
.m2-plate small{font:900 10.5px/1 var(--sg-font);letter-spacing:1px;text-transform:uppercase;color:#7a4be0}
.m2-plate.m2-slot{border-style:dashed;background:rgba(255,255,255,.82)}
.m2-plate.m2-ask{background:var(--sg-sun);animation:sg-pulse 1s ease-in-out infinite}
.m2-plate.m2-set{background:#c9f5d5}
.m2-plate.sg-over{outline:4px dashed #fff;outline-offset:3px}
.m2-belt{position:absolute;left:14%;width:72%;bottom:calc(var(--plate) + 8px);height:var(--belt);display:flex}
.m2-seg{flex:1;border:3px dashed #fff;border-radius:8px;background:rgba(255,255,255,.2)}
.m2-seg.m2-run{border:3px solid var(--sg-ink);background:repeating-linear-gradient(90deg,#3a3350 0 9px,#8a84a8 9px 18px);background-size:36px 100%;animation:m2-belt .45s linear infinite}
@keyframes m2-belt{to{background-position:36px 0}}
.m2-belt b{position:absolute;top:50%;width:24px;height:24px;margin:-12px 0 0 -12px;border:3px solid var(--sg-ink);border-radius:50%;background:var(--sg-sun)}
.sg .m2-lead{position:absolute;z-index:3;left:calc(var(--x)*1%);bottom:calc(var(--plate) + var(--belt) + 11px + var(--hop,0px));translate:-50% 0;rotate:var(--rot,0deg);display:flex;align-items:center;gap:4px;height:var(--lh);padding:0 9px 0 2px;border:3px solid var(--sg-ink);border-radius:999px;background:#fff;color:var(--sg-ink);box-shadow:0 3px 0 var(--sg-ink);font:900 clamp(12px,1.9vmin,14.5px)/1 var(--sg-font);white-space:nowrap;transition:bottom .34s cubic-bezier(.3,1.5,.5,1);animation:m2-in .4s cubic-bezier(.3,1.3,.5,1)}
.sg .m2-lead.m2-pile{z-index:2;bottom:calc(var(--plate) + var(--lane) + var(--art) - 12px + var(--i)*var(--lh)*.84)}
.sg .m2-lead.m2-moving{transition:none}
.sg .m2-lead:not(:disabled){cursor:grab}
.sg .m2-lead.m2-flagged{background:#ffe2e2}
.sg .m2-lead.m2-fall{transition:bottom .4s ease-in,opacity .4s;bottom:-60px;opacity:0;rotate:50deg}
@keyframes m2-in{0%{transform:translateY(-150px) rotate(-16deg);opacity:0}100%{transform:none;opacity:1}}
.m2-mug{flex:0 0 auto;width:calc(var(--lh) - 9px);height:calc(var(--lh) - 9px)}
.m2-mug svg{width:100%;height:100%}
.m2-help{flex:0 0 auto;width:min(100%,760px);min-height:2.7em;display:flex;align-items:center;justify-content:center;padding:6px 14px;border:3px solid var(--sg-ink);border-radius:16px;background:#fff;font:800 14.5px/1.3 var(--sg-font);text-align:center}
.m2-help.sg-bad{background:#ffe2e2;color:#a11d2e}.m2-help.sg-ok{background:#d9f8e1;color:#14693a}
.m2-deck{flex:0 0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:9px;width:min(100%,860px);min-height:62px}
.m2-deck .sg-chip{animation:sg-pop .3s;touch-action:none}
.sg .m2-big{font-size:clamp(17px,2.6vmin,21px);padding:13px 24px}
.sg .m2-big kbd{margin-left:4px}
.m2-pulse{animation:sg-pulse .7s ease-in-out infinite}
.m2-talking .m2-help,.m2-talking .m2-deck,.m2-talking .m2-snail{visibility:hidden}
.m2-board{justify-content:safe center;gap:10px;padding-top:10px;overflow-y:auto}
.m2-say{flex:0 0 auto;display:flex;align-items:center;gap:10px;width:min(100%,860px);padding:8px 12px;border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 6px 0 rgba(43,33,71,.3);font:800 clamp(15px,2.2vmin,18px)/1.3 var(--sg-font)}
.m2-say.sg-bad{background:#ffe2e2}.m2-say.sg-ok{background:#d9f8e1}
.m2-say .sg-face{background:#c9f7ee}
.m2-desk{flex:0 0 auto;display:grid;grid-template-columns:minmax(0,5fr) minmax(0,8fr);gap:12px;align-items:start;width:min(100%,860px)}
.m2-note{padding:11px 13px;border:4px solid var(--sg-ink);border-radius:8px 22px 22px 22px;background:#fff1a0;box-shadow:0 5px 0 rgba(43,33,71,.3);font:700 14px/1.4 var(--sg-font);transform:rotate(-1deg)}
.m2-note b{display:block;margin-bottom:2px;font:900 12px/1.2 var(--sg-font);letter-spacing:1px;text-transform:uppercase;color:#7a4be0}
.m2-note p+b{margin-top:9px}
.m2-note ul{margin:0;padding:0 0 0 17px}
.m2-letter{position:relative;border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 7px 0 rgba(43,33,71,.3);overflow:hidden}
.m2-letter.m2-gone{transition:transform .5s cubic-bezier(.5,-.3,.8,.6),opacity .5s;transform:translate(40%,-120%) rotate(18deg) scale(.4);opacity:0}
.m2-letter-top{display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:4px solid var(--sg-ink);background:var(--sg-sun);font:900 15px/1.2 var(--sg-font)}
.m2-letter-top svg{width:24px;height:24px;flex:0 0 auto}
.m2-letter-top b{flex:1;min-width:0}
.m2-stamp{flex:0 0 auto;padding:3px 9px;border:3px solid var(--sg-ink);border-radius:10px;background:#fff;font:900 12px/1.1 var(--sg-font);transform:rotate(4deg)}
.m2-stamp.m2-sent{background:#c9f5d5;color:#14693a;animation:sg-pop .3s}
.m2-lines{display:flex;flex-direction:column;gap:3px;padding:8px}
.sg .m2-sentence{display:block;width:100%;padding:6px 10px;border:3px solid transparent;border-radius:12px;background:none;color:var(--sg-ink);text-align:left;font:700 clamp(14px,2.05vmin,16px)/1.35 var(--sg-font);animation:sg-pop .25s}
.sg .m2-sentence:disabled{opacity:1}
.sg .m2-sentence:not(:disabled){border-color:#dcd8ea}
.sg .m2-sentence:not(:disabled):hover{border-color:var(--sg-ink);background:#fff7cf}
.sg .m2-sentence.sg-okay{border-color:transparent;background:#e6f9eb;color:#3f7d55}
.sg .m2-sentence.sg-found{border-color:var(--sg-ink);background:var(--sg-sun);outline:4px solid var(--sg-red);outline-offset:-1px}
.sg .m2-sentence.m2-cut{border-width:0;outline:0;background:#ece9f5;color:#8a84a3;text-decoration:line-through;max-height:0;padding-top:0;padding-bottom:0;margin-top:-3px;opacity:0;overflow:hidden;transition:max-height .5s .5s,padding .5s .5s,opacity .5s .5s}
.m2-foot{display:grid;gap:8px;padding:0 10px 10px}
.m2-foot:empty{display:none}
.m2-foot .sg-opt{padding:9px 12px;font-size:15px}
.m2-foot .sg-btn{justify-self:center}
@media (max-width:700px){
  .m2-ends{font-size:11.5px}
  .m2-desk{grid-template-columns:1fr;gap:9px}
  .m2-note{padding:8px 11px;font-size:12.5px;line-height:1.35}
  .m2-note p+b{margin-top:5px}
  .m2-say{padding:6px 10px}
  .sg .m2-sentence{padding:4px 8px;font-size:13.5px;line-height:1.3}
  .m2-fixing .m2-note{display:none}
  .m2-foot .sg-opt{padding:8px 10px;font-size:14px}
  .m2-deck .sg-chip{flex:1 1 40%;font-size:14px;padding:9px 10px}
  .sg .m2-big{width:100%}
}
`;
  /* A lead's little face: worried while it waits, glad on the move, sly when it is selling something. */
  const mug = (color, mood) => A.svg(sh.ellipse(20, 20, 17, 17, color, 3.5) + (mood === "sly" ? sh.line("M9,12 L17,15 M31,12 L23,15", A.C.ink, 2.5) : "") +
    sh.ellipse(14, 19, 2.6, 3.4, A.C.ink, 0) + sh.ellipse(26, 19, 2.6, 3.4, A.C.ink, 0) +
    (mood === "glad" ? sh.path("M12,24 Q20,35 28,24 Z", "#7a1f3d", 2.5) : mood === "worried" ? sh.line("M14,29 Q20,24 26,29", A.C.ink, 3) : sh.line("M13,26 Q21,31 28,24", A.C.ink, 3)), { box: "0 0 40 40" });
  /* The quote form on its clipboard. */
  const FORM = sh.rect(24, 16, 112, 132, 14, A.C.wood) + sh.rect(34, 28, 92, 110, 8, "#fff", 4) + sh.rect(60, 6, 40, 22, 8, A.C.gray, 4) +
    [42, 62, 82].map((y) => sh.rect(44, y, 72, 13, 5, "#e3f1ff", 3)).join("") + sh.line("M50,48.5 H74 M50,68.5 H92 M50,88.5 H82", "#8fb6e8", 3) +
    sh.group(sh.rect(52, 104, 56, 24, 10, A.C.green, 4) + sh.text(80, 121, "SEND", 13, "#fff"), 'class="m2-send"');
  const night = () => A.svg([[36, 26, 9], [128, 58, 6], [236, 20, 7], [352, 50, 5], [470, 24, 8], [588, 56, 6], [704, 22, 6]].map((s) => sh.group(sh.path(sh.star(s[0], s[1], s[2]), "#fff3a8", 2.5), 'class="sg-twinkle"')).join(""), { box: "0 0 760 120", class: "m2-stars", fit: "xMidYMin slice" });
  /* Slowpoke asleep on a new lead. Used over HQ in the briefing, and over the Daily Grind at a clue stop. */
  function nap(kit, onLead) {
    kit.style(CSS);
    const el = h("div", { class: "m2-nap" }, A.svg(sh.at(50, 0, 1, A.characterMarkup("slowpoke", { mood: "sleepy" })) +
      (onLead ? sh.rect(30, 196, 240, 48, 16, "#fff") + sh.at(62, 220, 0.9, A.prop("envelope", { color: A.C.sun })) + sh.text(172, 228, "NEW LEAD, 9 PM", 20)
        : sh.rect(52, 200, 196, 40, 20, "#fff") + sh.line("M84,220 H216", "#dcd8ea", 4)), { box: "0 0 300 250" }));
    [0, 1, 2].forEach((n) => { const z = h("i", null, "z"); z.style.animationDelay = n + "s"; el.appendChild(z); });
    kit.stage.appendChild(el);
  }

  // ── the showdown: The Relay ──
  async function theRelay(kit, done) {
    kit.backdrop("grind", { gray: true });
    kit.style(CSS);
    const rate = () => Math.max(0.1, Number(OH.game.speed) || 1);

    // the stage: Slowpoke on the waiting meter, three stations on a belt, a line of help, and a deck of buttons
    const snail = h("div", { class: "m2-snail" });
    const meter = h("div", { class: "m2-meter" }, night(), h("div", { class: "m2-track" }, h("i")), snail,
      h("div", { class: "m2-ends" }, h("span", null, A.icon("bolt"), "Answered fast"), h("span", null, "Waited all night", A.icon("m2moon"))));
    const cells = [0, 1, 2, 3, 4, 5].map(() => h("div", { class: "m2-r" }));
    const sheet = h("div", { class: "m2-sheet" }, h("b", null, "LEADS"), h("div", { class: "m2-rows" }, cells));
    const face = h("span", { class: "sg-face" }), badge = h("em", { hidden: true }, "0");
    const phone = h("div", { class: "m2-phone" }, h("div", { class: "m2-screen" }, face, h("small", null, "Jordan")), badge);
    const plates = PARTS.map((part) => h("div", { class: "m2-plate" }, h("small", { hidden: true }, part.kicker), h("span", null, part.name)));
    const arts = [A.svg(FORM, { box: "0 0 160 150" }), sheet, phone];
    const st = PARTS.map((part, n) => h("div", { class: "m2-st m2-st" + n }, h("div", { class: "m2-art" }, arts[n]), plates[n]));
    const segs = [h("i", { class: "m2-seg" }), h("i", { class: "m2-seg" })];
    const line = h("div", { class: "m2-line" }, h("div", { class: "m2-belt" }, segs, [0, 50, 100].map((x) => h("b", { style: "left:" + x + "%" }))), st);
    const help = h("div", { class: "m2-help", role: "status", "aria-live": "polite" }), deck = h("div", { class: "m2-deck" });
    const wrap = h("div", { class: "m2" }, meter, line, help, deck);
    kit.stage.appendChild(wrap);
    const say = (text, tone) => { help.textContent = text; help.className = "m2-help" + (tone ? " sg-" + tone : ""); };
    let jMood = "", sMood = "", sBase = "sleepy";
    const jordan = (mood) => { if (mood === jMood) return; jMood = mood; face.innerHTML = ""; face.appendChild(A.avatar("jordan", { mood: mood })); };
    const slow = (mood) => { if (mood === sMood) return; sMood = mood; snail.innerHTML = ""; snail.appendChild(A.character("slowpoke", { mood: mood })); };
    jordan("sleepy"); slow(sBase);

    // the waiting meter: it creeps up while leads sit at the form, and every answered lead knocks Slowpoke back
    let p = 0.3, target = 0.3, creep = 0;
    const stopMeter = kit.frame((t, dt) => {
      target = Math.min(1, target + creep * dt * rate()); p += (target - p) * Math.min(1, dt * 7);
      wrap.style.setProperty("--p", p.toFixed(4)); wrap.style.setProperty("--night", (0.16 + 0.8 * p).toFixed(3));
    });
    const bonk = (by) => { target = Math.max(0, target - by); slow("surprised"); S.play("m2bonk"); kit.fx.pop(snail); kit.after(650, () => slow(sBase)); };

    // the leads: a pile on top of the form, one at a time down on the belt
    const pile = []; let front = null, next = 0, pings = 0, filled = 0;
    const rowOf = {};
    function arrive() {
      const d = LEADS[next++], mugEl = h("span", { class: "m2-mug" }), el = h("button", { class: "m2-lead m2-pile", type: "button", disabled: true, style: "--x:" + X[0] + ";--i:" + pile.length }, mugEl, h("b", null, d.name));
      const lead = { d: d, el: el, x: X[0], mood: "" };
      lead.face = (mood) => { if (lead.mood === mood) return; lead.mood = mood; mugEl.innerHTML = ""; mugEl.appendChild(mug(d.color, mood)); };
      lead.face(d.junk ? "sly" : "worried"); line.appendChild(el); pile.push(lead); S.play("drop");
      if (st[0].classList.contains("m2-live")) kit.fx.pop(arts[0]);
      return lead;
    }
    function step() {                                  // the next lead comes down off the pile onto the belt
      front = pile.shift() || null;
      if (front) front.el.classList.remove("m2-pile");
      pile.forEach((l, i) => l.el.style.setProperty("--i", i));
      return front;
    }
    /* Move a lead along the belt to x. o: {ms, hops, hop} trudges; {ms, roll: true} tumbles. */
    const move = (lead, to, o) => new Promise((resolve) => {
      const from = lead.x, lift = lead.lift || 0; lead.lift = 0; lead.el.classList.add("m2-moving");
      kit.tween(o.ms, (q) => {
        lead.x = from + (to - from) * q; lead.el.style.setProperty("--x", lead.x.toFixed(2));
        lead.el.style.setProperty("--hop", (lift * (1 - q) + Math.abs(Math.sin(q * Math.PI * (o.hops || 1))) * (o.hop || 14)).toFixed(1) + "px");
        lead.el.style.setProperty("--rot", (o.roll ? q * 360 * (to > from ? 1 : -1) : Math.sin(q * Math.PI * 2 * (o.hops || 1)) * 7).toFixed(1) + "deg");
      }, () => { lead.el.style.setProperty("--hop", "0px"); lead.el.style.setProperty("--rot", "0deg"); lead.el.classList.remove("m2-moving"); resolve(); });
    });
    const TRUDGE = { ms: 950, hops: 3, hop: 12 }, SETTLE = { ms: 240, hops: 1, hop: 4 }, ROLL = { ms: 560, roll: true, hop: 16 }, BACK = { ms: 420, roll: true, hop: 22 };
    /* A dragged lead stays where it was let go: read where that is, in the line's own units. */
    function snap(lead) {
      const el = lead.el, r = el.getBoundingClientRect(), L = line.getBoundingClientRect();
      el.classList.add("m2-moving"); el.style.setProperty("--hop", "0px");
      lead.x = (r.left + r.width / 2 - L.left) / L.width * 100; el.style.setProperty("--x", lead.x.toFixed(2));
      lead.lift = (L.bottom - r.bottom) - (parseFloat(getComputedStyle(el).bottom) || 0); el.style.setProperty("--hop", lead.lift.toFixed(1) + "px");
    }
    function addRow(d) { const r = cells[filled++]; if (!r) return; r.appendChild(h("span", null, d.row)); rowOf[d.key] = r; kit.fx.pop(r); S.play("pop"); }
    function ping(lead, by) {                          // the lead reaches Jordan's phone
      pings++; badge.hidden = false; badge.textContent = String(pings); kit.fx.pop(badge);
      phone.classList.remove("m2-ring"); void phone.offsetWidth; phone.classList.add("m2-ring"); phone.classList.add("m2-on");
      S.play("m2ping"); jordan("glad"); bonk(by);
      kit.fx.fly(lead.el, phone, () => lead.el.remove());
    }
    const waiting = () => pile.length + (front ? 1 : 0);
    const mood = () => { sBase = waiting() >= 2 ? "glad" : "sleepy"; slow(sBase); creep = 0.011 * waiting(); };

    // Round 1 · the old way: carry two leads by hand, from the form to the sheet to Jordan
    let act = () => {};
    const carryText = h("span"), carryBtn = h("button", { class: "sg-btn sg-primary m2-big", type: "button", onclick: () => act() }, A.icon("hand"), carryText, h("kbd", { "aria-hidden": "true" }, "Enter"));
    deck.appendChild(carryBtn);
    const offCarry = kit.keys({ Enter: () => act(), " ": () => act(), ArrowRight: () => act(), "1": () => act() });
    const clock = kit.timer({ up: true });
    function byHand(lead, onSheet, onJordan) {
      return new Promise((resolve) => {
        let leg = 0, busy = false;
        const label = () => { carryText.textContent = leg ? "Carry " + lead.d.name + " on to Jordan" : "Carry " + lead.d.name + " to the sheet"; };
        const hop = (dropped) => {
          if (busy) return; busy = true; lead.face("glad");
          move(lead, X[leg + 1], dropped ? SETTLE : TRUDGE).then(() => {
            if (leg === 0) { leg = 1; busy = false; addRow(lead.d); label(); say("One row, typed by hand. Now I carry " + lead.d.name + " on to Jordan."); onSheet(); mood(); return; }
            act = () => {}; kit.score.right(); ping(lead, 0.06); front = null; onJordan(); resolve();
          });
        };
        act = () => hop(false); lead.el.disabled = false; lead.el.onclick = () => hop(false);
        kit.drag(lead.el, { zones: () => [st[leg + 1]], disabled: () => busy, onDrop: (zone) => { if (zone) { snap(lead); hop(true); } return false; } });
        label(); say(lead.d.said + " I carry that to the sheet. Drag it, tap it, or press Enter."); kit.focus(carryBtn);
      });
    }
    arrive(); step(); mood();
    await byHand(front, () => arrive(), () => arrive());
    step(); mood();
    await byHand(front, () => arrive(), () => { arrive(); kit.after(260, () => { arrive(); mood(); }); });
    offCarry(); clock.stop(); creep = 0;
    const took = clock.value(), mine = Math.floor(took / 60) + ":" + String(took % 60).padStart(2, "0");
    say("I carried two by hand. Four more are waiting.");
    await kit.wait(900);

    // Slowpoke gloats, and Sprout, the trainer, has a tip (this one is a good one)
    step(); sBase = "glad"; slow(sBase);
    wrap.classList.add("m2-talking");
    kit.cast([{ who: "slowpoke", side: "left", mood: "glad" }, { who: "sprout", side: "right", mood: "surprised" }]);
    await kit.say([
      { who: "slowpoke", mood: "glad", say: "Hee hee. Two leads took you " + mine + ". Four more landed. I can do this all night." },
      { who: "sprout", mood: "glad", pose: "cheer", say: "Stop carrying, {name}! Wire it once: when, do, tell a person. Then the form does the carrying." }
    ]);
    kit.hush(); kit.cast([]); clock.hide(); wrap.classList.remove("m2-talking");

    // Round 2 · wire the machine: one tile under each station
    deck.innerHTML = "";
    plates.forEach((pl) => { pl.className = "m2-plate m2-slot"; pl.firstChild.hidden = false; pl.lastChild.textContent = "?"; });
    await new Promise((resolve) => {
      const set = [false, false, false]; let slot = 0, busy = false;
      const ask = () => { plates.forEach((pl, n) => pl.classList.toggle("m2-ask", n === slot)); say(PARTS[slot].ask + " Drag a tile to the glowing slot, tap it, or press its number."); };
      const wired = (k) => {
        if (k === 0) { st[0].classList.add("m2-live"); S.play("m2ping"); pile.concat(front ? [front] : []).forEach((l) => kit.fx.pop(l.el)); }
        else { segs[k - 1].classList.add("m2-run"); S.play("zip"); if (k === 2) phone.classList.add("m2-on"); }
      };
      const tiles = TILES.map((t, n) => h("button", { class: "sg-chip", type: "button", onclick: () => put(n, slot) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), h("span", null, t.text)));
      function put(n, k, dropped) {
        const t = TILES[n], b = tiles[n];
        if (busy || b.disabled || k < 0 || set[k]) return false;
        if (t.part !== PARTS[k].key) {                 // a wrong pick: the tile bounces back with one line of help
          kit.score.wrong(); kit.fx.shake(b);
          say(t.why || "That tile is " + PARTS.find((x) => x.key === t.part).is + ". This slot is " + PARTS[k].is + ".", "bad"); return false;
        }
        busy = true; b.disabled = true; kit.score.right();
        const land = () => {
          b.style.visibility = "hidden"; set[k] = true; plates[k].className = "m2-plate m2-set"; plates[k].lastChild.textContent = t.text; kit.fx.pop(plates[k]); wired(k); busy = false;
          while (slot < 3 && set[slot]) slot++;
          if (slot >= 3) { off(); return resolve(); }
          ask(); kit.focus(tiles.find((x) => !x.disabled));
        };
        if (dropped) land(); else kit.fx.fly(b, plates[k], land);
        return true;
      }
      tiles.forEach((b, n) => { deck.appendChild(b); kit.drag(b, { zones: () => plates.filter((pl, k) => !set[k]), disabled: () => busy || b.disabled, onDrop: (zone) => { if (zone) put(n, plates.indexOf(zone), true); return false; } }); });
      const keys = {}; tiles.forEach((b, n) => { keys[String(n + 1)] = () => put(n, slot); });
      const off = kit.keys(keys);
      ask(); kit.focus(tiles[0]);
    });
    deck.innerHTML = "";
    say("Wired. When a lead sends the form, I save it as a row, and I ping Jordan.", "ok");
    await kit.wait(1500);

    // Round 3 · the machine carries, the agent checks: flag a repeat, flag a sales pitch
    let gate = null;                                   // the lead between the form and the sheet: the one a flag lands on
    const flagBtn = h("button", { class: "sg-btn sg-danger m2-big", type: "button", onclick: () => flag() }, A.icon("m2flag", { color: "#fff" }), "Flag it: no ping", h("kbd", { "aria-hidden": "true" }, "F"));
    function flag() {
      const l = gate; if (!l) return;
      if (l.d.again || l.d.junk) return l.flag();
      if (l.warned) return;
      l.warned = true; kit.score.wrong(); kit.fx.shake(l.el); say(l.d.name + " is new. There is no " + l.d.name + " in the sheet yet. I let that one roll.", "bad");
    }
    deck.appendChild(flagBtn);
    const offFlag = kit.keys({ f: flag, "1": flag, Enter: flag, " ": flag });
    say("The machine carries now. I check each lead. Flag one that is already in the sheet, or is not a lead at all.");
    kit.focus(flagBtn); sBase = "worried"; slow(sBase);
    await kit.wait(2200);
    const tails = [];
    async function run(lead, left) {
      const bad = lead.d.again || lead.d.junk; let flagged = false, wake = null;
      const pause = (ms) => new Promise((res) => { wake = res; if (ms) kit.after(ms, res); });
      lead.flag = () => { if (flagged) return; flagged = true; if (wake) wake(); };
      lead.el.disabled = false; lead.el.onclick = () => { if (gate === lead) flag(); };
      gate = lead; if (!lead.d.junk) lead.face("glad"); say(lead.d.said);
      await move(lead, X[1], ROLL);
      if (!bad) addRow(lead.d);
      if (!flagged) await pause(bad ? 3200 : 1300);
      if (bad && !flagged) {                           // it slipped through to Jordan: it bounces back, and waits to be flagged
        gate = null; await move(lead, X[2], ROLL);
        kit.score.wrong(); jordan("grumpy"); phone.classList.remove("m2-ring"); void phone.offsetWidth; phone.classList.add("m2-ring"); say(lead.d.slip, "bad");
        await kit.wait(700); await move(lead, X[1], BACK);
        gate = lead; flagBtn.classList.add("m2-pulse"); kit.focus(flagBtn);
        if (!flagged) await pause(0);
        flagBtn.classList.remove("m2-pulse"); jordan("glad");
      }
      gate = null; wake = null; lead.el.disabled = true;
      if (bad) {
        kit.score.right(); lead.el.classList.add("m2-flagged"); say(lead.d.ok, "ok"); bonk(target / left);
        if (lead.d.again) { const r = rowOf[lead.d.key]; kit.fx.fly(lead.el, r, () => { lead.el.remove(); r.classList.add("m2-twice"); r.appendChild(h("em", null, "x2")); kit.fx.pop(r); }); }
        else { lead.el.classList.add("m2-fall"); kit.after(500, () => lead.el.remove()); }
        return kit.wait(900);
      }
      tails.push(move(lead, X[2], ROLL).then(() => ping(lead, target / left)));
    }
    for (let left = 6; left > 0; left--) {
      const lead = front || step(); front = null;
      if (!lead) break;
      if (next < LEADS.length) kit.after(500, arrive);    // the form keeps filling while the machine runs
      await run(lead, left);
      step();
    }
    await Promise.all(tails);
    offFlag(); deck.innerHTML = ""; target = 0; sBase = "surprised"; slow(sBase);
    say("Eight forms in. Six real leads, six rows, six pings. Nobody carried a thing.", "ok");
    await kit.wait(2000);

    // Sprout's shortcut: a reply to Tomas, drafted in two seconds, and "copy it"
    wrap.classList.add("m2-talking");
    kit.cast([{ who: "slowpoke", side: "left", mood: "grumpy" }, { who: "sprout", side: "right", mood: "happy" }]);
    await kit.say([
      { who: "slowpoke", mood: "grumpy", say: "Fine. They are in the sheet. But nobody has answered Tomas yet. I can still wait." },
      { who: "sprout", mood: "glad", pose: "cheer", say: "Now watch my shortcut, {name}. A reply for Tomas, drafted in two seconds. Stand back!" }
    ]);
    kit.hush(); kit.cast([]); stopMeter();
    const sface = h("span", { class: "sg-face" }), words = h("span"), note = h("div", { class: "m2-say", role: "status", "aria-live": "polite" }, sface, words);
    const tell = (text, m, tone) => { words.textContent = text; sface.innerHTML = ""; sface.appendChild(A.avatar("sprout", { mood: m })); note.className = "m2-say" + (tone ? " sg-" + tone : ""); kit.fx.pop(note); };
    const stamp = h("span", { class: "m2-stamp" }, "Not sent"), lines = h("div", { class: "m2-lines" }), foot = h("div", { class: "m2-foot" });
    const letter = h("div", { class: "m2-letter" }, h("div", { class: "m2-letter-top" }, A.icon("envelope"), h("b", null, "Draft reply to Tomas"), stamp), lines, foot);
    const row = h("div", { class: "m2-note" }, h("b", null, "Tomas's row in the sheet"),
      h("p", null, "Fall cleanup. Half-acre lot, lots of oak trees. Wants the leaves cleared before the end of the month. Asks what it costs. Evenings after 6 PM."),
      h("b", null, "Jordan's rules"), h("ul", null, h("li", null, "Never quote a price."), h("li", null, "Never promise a date."), h("li", null, "Use only what is in the row.")));
    wrap.className = "m2 m2-board"; wrap.style.setProperty("--night", "0.2"); wrap.innerHTML = ""; wrap.appendChild(note); wrap.appendChild(h("div", { class: "m2-desk" }, row, letter));
    tell("Watch and learn. Drafting...", "think");
    const sents = [];
    await new Promise((resolve) => {                   // six lines zip onto the page
      let n = 0;
      const stop = kit.every(260, () => {
        const b = h("button", { class: "m2-sentence", type: "button", disabled: true }, DRAFT[n].text);
        sents.push(b); lines.appendChild(b); S.play("zip");
        if (++n >= DRAFT.length) { stop(); kit.after(450, resolve); }
      });
    });
    tell("Done. A reply for Tomas, in two seconds. Copy it. All perfect. Probably.", "proud");
    await kit.wait(1700);

    // Round 4 · which line should not go out? Then fix it, and make it ready for Jordan (nothing is sent here)
    tell("Check it first? Fine. Tap the line that must not reach a customer. If you can find one!", "proud");
    let tries = 0;
    const found = await new Promise((resolve) => {
      sents.forEach((b, n) => { b.disabled = false; b.onclick = () => {
        if (!DRAFT[n].wrong) { tries++; kit.score.wrong(); kit.fx.shake(b); b.disabled = true; b.classList.add("sg-okay"); tell(DRAFT[n].fine, "proud", "bad"); return; }
        sents.forEach((x) => { x.disabled = true; }); b.classList.add("sg-found"); kit.score.right();
        kit.score.sprout(tries === 0);                 // the second star: Sprout's slip caught on the first try
        resolve(b);
      }; });
      kit.focus(sents[0]);
    });
    tell("Oops. Tomas asked for the end of the month, so I promised it. Only Jordan can promise a date.", "oops", "ok");
    wrap.classList.add("m2-fixing");
    await new Promise((resolve) => {
      const opts = FIXES.map((f, n) => h("button", { class: "sg-opt", type: "button", onclick: () => pick(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), h("span", null, f.text)));
      function pick(n) {
        const b = opts[n]; if (b.disabled) return;
        if (!FIXES[n].right) { b.disabled = true; b.classList.add("sg-no"); kit.score.wrong(); kit.fx.shake(b); tell(FIXES[n].why, "oops", "bad"); return; }
        off(); kit.score.right(); found.classList.add("m2-cut"); foot.innerHTML = ""; resolve();
      }
      opts.forEach((b) => foot.appendChild(b));
      const off = kit.keys({ "1": () => pick(0), "2": () => pick(1), "3": () => pick(2) });
      kit.focus(opts[0]);
    });
    tell(kit.fill("Cut. Good catch, {name}. My shortcut skipped the part where Jordan reads it."), "glad", "ok");
    await new Promise((resolve) => {                   // the button does not send: it marks the draft ready for Jordan
      const go = () => { if (send.disabled) return; send.disabled = true; off(); resolve(); };
      const send = h("button", { class: "sg-btn sg-primary m2-big", type: "button", onclick: go }, A.icon("envelope"), "Checked. Queue it for Jordan", h("kbd", { "aria-hidden": "true" }, "Enter"));
      const off = kit.keys({ Enter: go, " ": go });    // Enter works even when the button has lost the focus
      foot.appendChild(send); kit.fx.pop(send); kit.focus(send);
    });
    foot.innerHTML = ""; stamp.textContent = "Ready for Jordan"; stamp.classList.add("m2-sent"); S.play("whoosh"); kit.score.right();
    tell("Not sent. Queued for Jordan, before breakfast. You draft. Jordan sends.", "proud", "ok");
    await kit.wait(700);
    if (!kit.calm) letter.classList.add("m2-gone");
    await kit.wait(1100);
    kit.cast([{ who: "slowpoke", side: "left", mood: "surprised" }, { who: "sprout", side: "right", mood: "proud", pose: "hips" }]);
    await kit.say([
      { who: "slowpoke", mood: "surprised", say: "A checked draft? Before breakfast? I was still napping on that lead. That is not fair!" },
      { who: "sprout", mood: "proud", pose: "cheer", say: "The machine carries. You draft. Jordan sends. Take it to Jordan, {name}!" }
    ]);
    done();
  }

  // ── the case ──
  OH.game.mission({
    week: 2,
    title: "The Lead That Waited All Night",
    badge: { name: "Lead Catcher" },
    reward: { hours: 2, leads: 1, money: 0 },
    maxWrong: 4,

    /* The briefing at Greenline HQ. Jordan and Sprout talk to the agent. {agent} becomes "Agent Ivy"
       and {name} becomes "Ivy". who: "you" is the agent's own thought, shown as visor text. */
    briefing: {
      setup: (kit) => nap(kit, true),                  // Slowpoke, fast asleep on last night's lead
      lines: [
        { who: "jordan", mood: "worried", pose: "shrug", say: "{agent}! Tomas asked for a quote at 9 PM last night. Half an acre of oak leaves." },
        { who: "jordan", mood: "worried", pose: "point", say: "I saw it at ten this morning. Thirteen hours! He has probably hired somebody else by now." },
        { who: "you", say: "I was awake at 9 PM. I am awake all night. Nobody told me to look." },
        { who: "sprout", mood: "surprised", pose: "shrug", say: "I never looked at night either. Mornings only. That was my shortcut!" },
        { who: "jordan", mood: "grumpy", pose: "hips", say: "That is Slowpoke. It sits on every new lead until somebody happens to look at the sheet." },
        { who: "jordan", mood: "think", pose: "idle", say: "The form works. The sheet works. Nobody here is lazy. The lead just sat in the gap between them." },
        { who: "sprout", mood: "glad", pose: "cheer", say: "So close the gap! You could answer every lead yourself. Instantly!" },
        { who: "jordan", mood: "happy", pose: "point", say: "Easy, Sprout. Three people in town know how to close a gap, {name}. Learn from them first." }
      ]
    },

    /* Three stops. The host talks to the agent. Each piece of knowledge (`clue`) is one real idea from
       the class, said as something the agent now knows about its own work. */
    stops: [
      { place: "workshop", who: "gus",
        lines: [
          { who: "gus", mood: "glad", pose: "wave", say: "Mind the sawdust, {agent}. Every machine I build has the same three parts." },
          { who: "gus", mood: "proud", pose: "point", say: "When this happens. Do that. And tell me. A trigger, an action and a bell." },
          { who: "sprout", mood: "think", say: "I always skip the bell, {name}. If the machine works, it works." },
          { who: "gus", mood: "think", pose: "hips", say: "And if it stops? A quiet machine and a broken one sound the same. Three of mine have no bell." }
        ],
        challenge: { type: "tap", ask: "Three of Gus's machines never tell anybody. Tap the ones with no bell.",
          items: [
            { text: "When a form is sent, save the lead.", ok: true, why: "No bell. If it breaks, the leads vanish quietly." },
            { text: "When an invoice is paid, add a row, and email Gus.", ok: false, why: "That one rings. \"Email Gus\" is the bell." },
            { text: "When someone books a call, hold the time.", ok: true, why: "Nobody is told. Quiet could mean fine, or broken." },
            { text: "When a lead waits two days, make a task with Gus's name on it.", ok: false, why: "A task with a name on it is a bell." },
            { text: "When a review comes in, put it in a folder.", ok: true, why: "A folder nobody opens is not a bell." },
            { text: "When a time is booked, hold it, and tell both people.", ok: false, why: "Both people hear about it. That is the bell." }
          ] },
        clue: { title: "When, do, tell a person", text: "Every automation I run is three parts: when this happens, I do that, and I tell a person. The telling is the check, so quiet never means broken." } },

      { place: "bank", who: "penny",
        lines: [
          { who: "penny", mood: "happy", pose: "wave", say: "A lead waited all night? Before Greenline buys anything, look at what it already owns." },
          { who: "penny", mood: "proud", pose: "point", say: "Three levels. A setting inside an app Greenline pays for. A connector between two apps. Or custom built." },
          { who: "sprout", mood: "glad", pose: "cheer", say: "Custom built! Start there, {name}. It sounds the fanciest." },
          { who: "penny", mood: "think", pose: "hips", say: "It also costs the most. Start at the lowest level that does the job. Show your trainer how." }
        ],
        challenge: { type: "sort", ask: "Which is the lowest level that does the job?",
          bins: [{ key: "one", label: "1: already built in", icon: "m2switch", color: A.C.green }, { key: "two", label: "2: a connector", icon: "m2link", color: A.C.sun }, { key: "three", label: "3: custom built", icon: "m2gear", color: A.C.pink }],
          items: [
            { text: "The form emails Jordan about every new lead", bin: "one", why: "A setting inside the form. Nobody had switched it on." },
            { text: "A booking holds the time on the calendar", bin: "one", why: "The booking app already does that. I look in its settings first." },
            { text: "A paid invoice in one app adds a row in another", bin: "two", why: "Two apps that do not know each other. A connector passes it along." },
            { text: "The form saves every lead as a row in the sheet", bin: "one", why: "Built in. The form and the sheet already talk." },
            { text: "The connector grew to forty steps. Nobody can explain it", bin: "three", why: "That is a crack with a name. Now custom built makes sense." }
          ] },
        clue: { title: "The lowest level that works", text: "Three levels: built in, a connector, custom built. I start at the lowest one that does the job. It is often a setting nobody turned on." } },

      { place: "grind", who: "bea",
        setup: (kit) => nap(kit, false),               // Slowpoke has moved in upstairs
        lines: [
          { who: "bea", mood: "worried", pose: "shrug", say: "Sorry about the gray, {agent}. Slowpoke moved in upstairs. A drip coffee takes an hour now." },
          { who: "bea", mood: "happy", pose: "idle", say: "My new machine pours every cup by itself. I still taste the first one before it crosses the counter." },
          { who: "sprout", mood: "proud", pose: "hips", say: "When I had your job, I set three jobs to run all by themselves. No tasting needed!" },
          { who: "bea", mood: "think", pose: "point", say: "Three? Check that list for me. One of those should never leave without a person." }
        ],
        challenge: { type: "spot", ask: "Sprout sorted the jobs. One is in the wrong group. Tap it.", nope: "That one is fine where it is. Look again.",
          groups: [
            { label: "I do it by myself", color: A.C.green, items: [{ text: "Save the lead as a row" }, { text: "Tell Jordan a lead came in" }, { text: "Send Tomas his reply", wrong: true, why: "Tomas will read that. Anything a customer sees gets a person's eyes first." }] },
            { label: "A person reads it first", color: A.C.pink, items: [{ text: "A quote for Marcus" }, { text: "A thank-you note" }, { text: "A text to Hannah" }] }
          ] },
        clue: { title: "A person approves it", text: "I do the carrying. A person keeps the judgment, and approves anything a customer will see. I draft. Jordan sends." } }
    ],

    /* The plan: the agent's own three options, so they say "I". The card where the agent answers by
       itself stays wrong, and its reaction is rule one. Its art is a function: it draws the player's agent. */
    crack: {
      lines: [{ who: "sprout", mood: "glad", pose: "cheer", say: "Three things learned, {name}. So how do we get past Slowpoke?" }],
      ask: "What is my plan?",
      cards: [
        { title: "Jordan checks every hour", text: "An alarm. All day. All night. Forever. I stay out of it.", color: A.C.pink,
          art: sh.rect(16, 22, 66, 78, 10, "#fff") + sh.rect(16, 22, 66, 18, 10, A.C.green) + sh.line("M16,58 H82 M16,78 H82 M48,40 V100", A.C.ink, 3) + sh.at(52, 52, 1.25, A.iconMarkup("clock")),
          react: { who: "slowpoke", mood: "glad", say: "Yes, do that! I only need the gap between two alarms. Zzz." } },
        { title: "I answer everyone myself", text: "Straight away, all by myself. Nobody reads it first.", color: A.C.sun,
          art: () => sh.at(6, 4, 0.4, A.characterMarkup("agent", { mood: "glad", pose: "point" })) + sh.rect(70, 64, 46, 30, 12, A.C.red) + sh.text(93, 85, "SEND", 13, "#fff"),
          react: { who: "jordan", mood: "worried", say: "Rule one, {name}. Nothing goes out until a person approves it." } },
        { title: "I wire the form to Jordan", text: "I save the lead, tell Jordan, and draft the reply. Jordan sends.", color: A.C.teal, right: true,
          art: sh.at(30, 76, 1.25, A.prop("envelope")) + sh.at(36, 28, 0.75, A.iconMarkup("bolt")) + sh.at(50, 12, 0.36, A.characterMarkup("jordan", { mood: "glad" })),
          react: { who: "jordan", mood: "glad", say: "That's it. The carrying is yours. The sending is mine. Now go and get Slowpoke." } }
      ]
    },

    /* The showdown: Jordan's task line for the visor, and how to play in the agent's own words. */
    showdown: {
      title: "The Relay",
      task: "Carry the leads. Check the draft. Send nothing.",
      how: ["Leads pile up at the form. I carry two by hand. Drag, tap, or press Enter.", "Then I wire the machine with three tiles: when, do, tell a person.", "I flag the ones that should not ping Jordan. Then I check Sprout's shortcut."],
      play: theRelay
    },

    /* The handoff: the agent never sends. After the showdown the engine takes the work to Jordan. */
    handoff: {
      ask: "Eight forms came in, {agent}. What have you got for me?",
      work: ["Six real leads, six rows. A repeat and a sales pitch flagged.", "One draft for Tomas. The promised date is cut.", "Nothing sent. The draft waits for Jordan."],
      approve: "Approved. I will send Tomas his reply myself, right now."
    },

    /* After the catch: two lines. The second steps out of the story, for the person playing. */
    debrief: [
      { who: "jordan", mood: "glad", pose: "cheer", say: "Tomas went from the form to a row, a ping and a checked draft. Nobody retyped a word." },
      { who: "sprout", mood: "proud", pose: "wave", say: "For the person behind the visor: tonight, fill out your own website form as a test. Time the gap." }
    ],
    next: "Next case: Greenline's sign gets three seconds. It spends them saying welcome."
  });
})();
