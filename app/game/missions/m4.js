/* Save Greenline · case 4: The Company Nobody Can Find. Bandit: Hide-and-Seek, who hides Greenline from the town map.
   What it teaches (session 4 of the class): a search asks three questions (can it read the page, does the
   page answer what was asked, does anyone vouch for you) · the free listing needs the same name, address
   and phone everywhere · AI assistants repeat what your pages plainly say, so say it plainly.
   And one thing nobody can promise: the first spot in a search.
   The showdown is the week's job done by hand: make the listing match, then put plain answers on the page.

   AGENT MODE: the player IS the AI, Greenline's new agent. So every line here is written to the
   agent ("you") or by the agent ("I"). Sprout is the trainer, the agent who had the job before, and
   its one wrong shortcut (a line that is not in Jordan's facts) is the thing to catch. The agent never
   publishes: the listing fix and the page are drafts, and the engine's handoff takes them to Jordan.

   The format and every kit call are explained in GAME.md; m1.js is the model. Everything in it is made up. */
(function () {
  "use strict";
  if (!window.OH || !OH.game || !OH.game.mission || !OH.game.art) return;
  const h = OH.h, A = OH.game.art, S = OH.game.sound, sh = A.shape, C = A.C;

  // ── the showdown's data ──
  /* One way to write the name, the address and the phone: the way the website has them. The phone is
     the sample company's; the street is made up for this case. */
  const SITE = { name: "Greenline Landscaping", addr: "12 Fern Road", phone: "555-0100" };
  /* What the town map listing says today. To a program this is a different business. */
  const LISTED = { name: "Green Line Landscape & Design", addr: "Fern Rd, by the big oak", phone: "555-0199, the old one" };
  const KINDS = [
    { key: "name", label: "Name", a: "a name", yes: "The name matches the website now." },
    { key: "addr", label: "Address", a: "an address", yes: "One address, written one way." },
    { key: "phone", label: "Phone", a: "a phone number", yes: "One phone number, and somebody answers it." }
  ];
  /* The tiles for round one, in tray order. ok: it matches the website. why: one line of help. */
  const TILES = [
    { kind: "name", text: "Greenline Landscaping LLC", why: "Close. The website has no LLC. To a program like me, that is another business." },
    { kind: "phone", text: "555-0100", ok: true },
    { kind: "addr", text: "12 Fern Road", ok: true },
    { kind: "addr", text: "12 Fern Rd., rear gate", why: "A neighbor would find it. A program would not. I copy the website." },
    { kind: "name", text: "Greenline Landscaping", ok: true },
    { kind: "phone", text: "555-0101", why: "One digit off. Somebody else's phone rings." }
  ];
  /* Round two: three neighbors ask the map kiosk a real question, in their own words. */
  const ASKERS = [
    { who: "dana", q: "Who builds patios near me?", thanks: "Cedar Hollow? That is me!" },
    { who: "gus", q: "How do I book a visit?", thanks: "A form and a phone number. Easy." },
    { who: "nell", q: "What does a patio cost?", thanks: "No made-up price. I like that." }
  ];
  /* The lines that could go on Greenline's patio page. a: the neighbor it answers. The rest answer nobody. */
  const LINES = [
    { text: "Premium outdoor living experiences!", why: "Lovely words. They name no service and no town." },
    { text: "Use the quote form or call 555-0100.", a: 1 },
    { text: "flyer-with-all-the-details.jpg", img: true, why: "The words are locked inside a picture. A search cannot read a picture." },
    { text: "We build paver patios in Cedar Hollow.", a: 0 },
    { text: "We do it all! No job too small.", why: "All of what? That answers nothing anybody asked." },
    { text: "Every yard differs. You get a written quote.", a: 2 }
  ];
  /* Sprout's shortcut. Jordan's facts, and the page Sprout, the trainer, writes from them: the sample
     answer from the week 4 tool, with its planted mistake. Nobody told Sprout how long Greenline has been at it. */
  const FACTS = ["Paver patios and walkways", "Cedar Hollow and the neighboring towns", "A free site visit, Saturdays too", "Then a written quote", "The quote form, or 555-0100"];
  const DRAFT = [
    { tag: "Title", text: "Paver Patios in Cedar Hollow | Greenline Landscaping" },
    { tag: "About", text: "Paver patios and walkways in Cedar Hollow and the neighboring towns." },
    { tag: "Answer", text: "We have built patios here for more than ten years.", wrong: true },
    { tag: "Answer", text: "Use the quote form or call 555-0100 to book a free site visit." },
    { tag: "Answer", text: "Saturday visits are available." },
    { tag: "Answer", text: "After the visit you get a written quote." }
  ];
  const TRUE_LINE = "Yes. We build patios in Cedar Hollow and the neighboring towns.";
  /* The agent's three options for the line Sprout made up, in its own words. Sprout answers a wrong one. */
  const FIXES = [
    { label: "I keep it. It sounds great", icon: "star", color: C.sun, why: "It does sound great. It is still not in Jordan's facts." },
    { label: "I take it out and ask Jordan", icon: "hand", color: C.green, ok: true },
    { label: "I make it twenty years", icon: "bolt", color: C.pink, why: "A bigger number that nobody gave us? That is worse!" }
  ];
  /* The six bushes Hide-and-Seek has piled on Greenline's pin, in the order they leave: where each sits
     (percent of the kiosk), where it flies when it goes (percent of itself, and a spin), and its green. */
  const BUSH = [[50, 49, 40, -330, 50, C.leaf], [43.4, 59.5, -330, 30, -80, C.grassDark], [56.6, 59.5, 330, 30, 80, C.green],
    [46, 55.5, -300, -200, -130, C.leaf], [54, 55.5, 300, -200, 130, C.grassDark], [50, 59, -20, 300, -30, C.greenDark]];
  const SEEK_MOODS = ["glad", "glad", "sneaky", "sneaky", "worried", "worried", "surprised"];

  /* This mission's own styles, under its own prefix (m4-). kit.style() removes them with the screen. */
  const CSS = `
.m4-brief{position:absolute;top:1.5%;left:50%;width:min(82vw,360px);padding-top:min(19vw,74px);translate:-50% 0;pointer-events:none}
.m4-lurk{position:absolute;top:0;right:5%;width:36%;aspect-ratio:200/220;animation:m4-lurk 3.4s ease-in-out infinite}
@keyframes m4-lurk{0%,100%{transform:translateY(34%)}14%,74%{transform:translateY(0)}86%{transform:translateY(40%)}}
.m4-lurk svg{width:100%;height:100%;overflow:visible}
.m4-search{position:relative;padding:9px 12px 10px;border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 7px 0 rgba(43,33,71,.3);text-align:left}
.m4-sbar{display:flex;align-items:center;gap:8px;margin-bottom:6px;padding:6px 12px;border:3px solid var(--sg-ink);border-radius:999px;background:var(--sg-cream);font:900 15px/1.2 var(--sg-font)}
.m4-sbar svg{width:22px;height:22px;flex:0 0 auto}
.m4-typed{display:inline-block;max-width:30ch;overflow:hidden;white-space:nowrap;border-right:3px solid var(--sg-ink);animation:m4-type 1.3s steps(26) both}
@keyframes m4-type{from{max-width:0}to{max-width:30ch}}
.m4-search p{display:flex;align-items:center;gap:9px;padding:2px 6px;font:800 14.5px/1.3 var(--sg-font);color:#5d5578;animation:sg-rise .3s both}
.m4-search p b{display:flex;align-items:center;justify-content:center;flex:0 0 22px;height:22px;border-radius:50%;background:#e9e4f6;font:900 12px/1 var(--sg-font);color:var(--sg-ink)}
.m4-search p.m4-none{margin-top:4px;padding:5px 9px;border-radius:12px;background:#ffe2e2;color:#a11d2e;font-weight:900}
.m4-search p svg{width:18px;height:18px;flex:0 0 auto}
@keyframes m4-peek{0%,100%{transform:translateY(20%)}16%,72%{transform:translateY(0)}84%{transform:translateY(26%)}}

.m4{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:safe center;gap:8px;padding:8px 12px 12px;overflow:hidden}
.m4::before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(rgba(54,44,92,.5),rgba(54,44,92,.2) 65%,rgba(54,44,92,.06));pointer-events:none}
.m4-left,.m4-right{display:contents}
.m4-top{position:relative;order:1;flex:0 0 auto;width:min(100%,560px,42vh);aspect-ratio:2/1}
.m4-top>svg{position:absolute;top:0;left:0;width:100%;height:100%;overflow:visible;z-index:1}
.m4-seek{position:absolute;left:73%;top:0;width:25%;aspect-ratio:200/220;z-index:0;animation:m4-peek 3.2s ease-in-out infinite}
.m4-seek svg{width:100%;height:100%;overflow:visible}
.m4-rays{position:absolute;left:50%;top:44.5%;width:30%;aspect-ratio:1;z-index:2;translate:-50% -50%;border-radius:50%;opacity:0;transition:opacity .6s;pointer-events:none;
  background:repeating-conic-gradient(rgba(255,216,61,.95) 0 12deg,rgba(255,216,61,0) 12deg 24deg);-webkit-mask:radial-gradient(circle,#000 25%,transparent 68%);mask:radial-gradient(circle,#000 25%,transparent 68%);animation:sg-spin 12s linear infinite}
.m4-found .m4-rays{opacity:1}
.m4-pin{position:absolute;left:50%;top:62%;width:10.5%;aspect-ratio:100/130;z-index:3;transform:translate(-50%,-100%) scale(var(--s,.7));transform-origin:50% 100%;filter:grayscale(var(--g,1));transition:transform .5s cubic-bezier(.2,1.7,.4,1),filter .5s}
.m4-pin svg{width:100%;height:100%;overflow:visible}
.m4-found .m4-pin svg{animation:sg-bounce .9s ease-in-out infinite}
.m4-bush{position:absolute;width:13.5%;aspect-ratio:100/64;z-index:4;translate:-50% -50%;transition:transform .75s cubic-bezier(.4,-.5,.8,.5),opacity .5s .2s;animation:m4-rustle 2.4s ease-in-out infinite}
.m4-bush svg{width:100%;height:100%;overflow:visible}
@keyframes m4-rustle{0%,100%{rotate:-3deg}50%{rotate:3deg}}
.m4-bush.m4-off{transform:translate(var(--fx),var(--fy)) rotate(var(--fr)) scale(.5);opacity:0}
.m4-count{position:absolute;left:3%;top:7%;z-index:12;padding:5px 12px;border:3px solid var(--sg-ink);border-radius:999px;background:#fff;font:900 14px/1 var(--sg-font)}
.m4-found .m4-count{background:var(--sg-sun)}
.m4-plate,.m4-vouch{opacity:0;transition:opacity .4s}
.m4-named .m4-plate,.m4-asking .m4-vouch{opacity:1}
.m4-star{transform-box:fill-box;transform-origin:center;transition:fill .3s}
.m4-star.m4-on{fill:#ffd83d;animation:sg-pop .4s}

.m4-under{position:relative;order:3;flex:0 0 auto;display:flex;align-items:flex-end;justify-content:center;width:min(100%,560px)}
.m4-mid{position:relative;order:4;flex:0 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;width:min(100%,640px)}
.m4-card{width:100%;border:4px solid var(--sg-ink);border-radius:20px;background:#fff;box-shadow:0 6px 0 rgba(43,33,71,.3);text-align:left;animation:sg-pop .3s cubic-bezier(.2,1.4,.4,1)}
.m4-cardtop{display:flex;align-items:center;gap:8px;padding:6px 12px;border-bottom:4px solid var(--sg-ink);border-radius:15px 15px 0 0;background:var(--sg-sun);font:900 14.5px/1.2 var(--sg-font)}
.m4-cardtop svg{width:22px;height:22px;flex:0 0 auto}
.m4-cardtop em{margin-left:auto;padding:2px 9px;border:2px solid var(--sg-ink);border-radius:999px;background:#fff;font:900 11.5px/1.3 var(--sg-font);font-style:normal;white-space:nowrap}
.m4-site .m4-cardtop{background:#c9f7ee}
.m4-site p{display:flex;align-items:baseline;gap:8px;padding:5px 12px;font:900 15.5px/1.25 var(--sg-font)}
.m4-site p:last-child{padding-bottom:9px}
.m4-site small,.m4-slot small{flex:0 0 58px;font:900 10.5px/1 var(--sg-font);letter-spacing:1px;text-transform:uppercase;color:#7a4be0}
.m4-slot{display:flex;align-items:center;gap:8px;margin:8px 9px;padding:8px 11px;min-height:46px;border:3px dashed #d23b3b;border-radius:14px;background:#ffecec;color:#a11d2e;font:800 15px/1.25 var(--sg-font);transition:transform .15s}
.m4-slot span{flex:1;min-width:0}
.m4-slot svg{width:20px;height:20px;flex:0 0 auto}
.m4-slot.m4-done{border-style:solid;border-color:var(--sg-ink);background:#c9f5d5;color:var(--sg-ink);font-weight:900}
.m4-slot.sg-over,.m4-page.sg-over{outline:5px dashed var(--sg-sun);outline-offset:2px;transform:scale(1.02)}
.m4-bar{display:flex;align-items:center;gap:5px;padding:6px 12px;border-bottom:4px solid var(--sg-ink);border-radius:15px 15px 0 0;background:#e9e4f6;font:900 14px/1.2 var(--sg-font)}
.m4-bar i{flex:0 0 11px;height:11px;border:2px solid var(--sg-ink);border-radius:50%;background:var(--sg-red)}
.m4-bar i+i{background:var(--sg-sun)}.m4-bar i+i+i{background:var(--sg-green)}
.m4-bar b{flex:1;min-width:0;margin-left:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.m4-page{transition:transform .15s}
.m4-fluff{padding:6px 12px 0;font:italic 700 13.5px/1.3 var(--sg-font);color:#8a84a3}
.m4-fluff.m4-cut{text-decoration:line-through}
.m4-line{display:flex;align-items:center;gap:8px;margin:6px 9px;padding:6px 10px;min-height:38px;border:3px dashed #c5c0d8;border-radius:12px;color:#8a84a3;font:800 14.5px/1.25 var(--sg-font)}
.m4-line:last-child{margin-bottom:9px}
.m4-line svg{width:18px;height:18px;flex:0 0 auto}
.m4-line.m4-now{border-color:var(--sg-ink);color:#5d5578;animation:m4-glow 1.1s ease-in-out infinite alternate}
@keyframes m4-glow{from{background:#fffbe6}to{background:#ffe873}}
.m4-line.m4-done{border-style:solid;border-color:var(--sg-ink);background:#c9f5d5;color:var(--sg-ink);animation:sg-pop .3s}
.m4-guest{display:flex;align-items:flex-end;gap:12px;width:100%}
.m4-walker{flex:0 0 auto;height:clamp(84px,13vh,170px);aspect-ratio:200/280;transition:transform .6s cubic-bezier(.3,1.1,.5,1),opacity .3s}
.m4-walker svg{width:100%;height:100%;overflow:visible}
.m4-walker.m4-away{transform:translateX(-240%);opacity:0;transition:none}
.m4-walker.m4-bye{transform:translateX(-240%);opacity:0;transition:transform .6s ease-in,opacity .3s .3s}
.m4-walker.m4-walking svg{animation:m4-step .3s ease-in-out 2}
@keyframes m4-step{50%{transform:translateY(-9%) rotate(-3deg)}}
.m4-ask{position:relative;flex:1;min-width:0;align-self:center;padding:9px 13px;border:4px solid var(--sg-ink);border-radius:20px;background:#fff;box-shadow:0 5px 0 rgba(43,33,71,.3)}
.m4-ask::before{content:"";position:absolute;left:-12px;top:50%;width:16px;height:16px;margin-top:-10px;border:4px solid var(--sg-ink);border-right:0;border-top:0;background:inherit;transform:rotate(45deg)}
.m4-ask small{display:block;margin-bottom:2px;font:900 11px/1.2 var(--sg-font);letter-spacing:1px;text-transform:uppercase;color:#7a4be0}
.m4-ask b{font:900 clamp(17px,2.6vmin,22px)/1.2 var(--sg-font)}
.m4-ask.m4-thanks{background:#d9f8e1}
.m4-fly{position:absolute;z-index:9;width:34px;height:34px;pointer-events:none}
.m4-fly svg{width:100%;height:100%}
.m4-help{position:relative;order:5;flex:0 0 auto;width:min(100%,640px);min-height:2.5em;display:flex;align-items:center;justify-content:center;padding:6px 14px;border:3px solid var(--sg-ink);border-radius:16px;background:#fff;font:800 14.5px/1.3 var(--sg-font);text-align:center}
.m4-help.sg-bad{background:#ffe2e2;color:#a11d2e}.m4-help.sg-ok{background:#d9f8e1;color:#14693a}
.m4-tray{position:relative;order:6;flex:0 0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px 9px;width:min(100%,640px)}
.sg .m4-tile{position:relative;display:flex;align-items:center;gap:8px;min-height:52px;padding:8px 10px 8px 13px;border:3px solid var(--sg-ink);border-radius:15px;background:var(--sg-cream);box-shadow:0 5px 0 var(--sg-ink);
  font:800 14.5px/1.25 var(--sg-font);text-align:left;cursor:grab;transition:transform .22s cubic-bezier(.2,1.4,.4,1);animation:m4-wig 2.8s ease-in-out infinite}
.sg .m4-tile:nth-child(2n){animation-delay:-.9s}.sg .m4-tile:nth-child(3n){animation-delay:-1.7s}
.sg .m4-tile:hover{background:#fff7cf}
.sg .m4-tile.sg-dragging{animation:none;opacity:.94}
@keyframes m4-wig{0%,100%{rotate:-1.1deg}50%{rotate:1.1deg}}
.m4-tile kbd{position:absolute;top:-10px;left:-7px}
.m4-tile svg{width:28px;height:28px;flex:0 0 auto}
.sg .m4-tile.m4-used{visibility:hidden}
.m4-tile.m4-img span{font-style:italic;color:#5d5578;overflow-wrap:anywhere}
.m4-talking .m4-under,.m4-talking .m4-mid,.m4-talking .m4-help,.m4-talking .m4-tray{display:none}
.m4-talking{justify-content:flex-start}
.m4-talking .m4-seek{display:none}

.m4-check{overflow-y:auto}
.m4-check .m4-mid{flex:0 0 auto}
.m4-say{position:relative;order:2;flex:0 0 auto;display:flex;align-items:center;gap:10px;width:min(100%,640px);padding:8px 12px;border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 6px 0 rgba(43,33,71,.3);font:800 clamp(14.5px,2.1vmin,17px)/1.3 var(--sg-font)}
.m4-say.sg-bad{background:#ffe2e2}.m4-say.sg-ok{background:#d9f8e1}
.m4-say .sg-face{background:#c9f7ee}
.m4-facts ul{list-style:none;margin:0;padding:8px 10px 10px;display:flex;flex-wrap:wrap;gap:6px}
.m4-facts li{padding:4px 10px;border:2px solid var(--sg-ink);border-radius:999px;background:var(--sg-cream);font:800 13.5px/1.25 var(--sg-font)}
.m4-draft{display:flex;flex-direction:column;gap:7px;padding:9px}
.sg .m4-draft .sg-chip{width:100%;padding:8px 10px;font-size:14.5px;animation:sg-pop .25s}
.sg .m4-draft .sg-chip:disabled{opacity:1}
.m4-draft .sg-chip small{flex:0 0 auto;min-width:56px;padding:3px 7px;border-radius:8px;background:#e9e4f6;font:900 10.5px/1.2 var(--sg-font);letter-spacing:.6px;text-transform:uppercase;text-align:center}
.m4-fixes{grid-template-columns:repeat(3,minmax(0,1fr))}
.m4-fixes .sg-bin{min-height:76px;font-size:14.5px}
@media (min-width:900px){
  .m4:not(.m4-talking){flex-direction:row;justify-content:center;gap:28px;padding:10px 24px 14px}
  .m4:not(.m4-talking) .m4-left{display:flex;flex-direction:column;align-items:center;gap:10px;flex:0 1 46%;min-width:0;max-width:560px}
  .m4:not(.m4-talking) .m4-right{display:flex;flex-direction:column;align-items:center;gap:10px;flex:1 1 54%;min-width:0;max-width:640px}
  .m4:not(.m4-talking) .m4-top{width:100%}
  .m4:not(.m4-talking) .m4-under{min-height:clamp(120px,30vh,236px);align-items:flex-start}
  .m4-walker{height:clamp(120px,30vh,236px)}
  .m4-guest{align-items:center}
  .m4-talking .m4-top{width:min(100%,560px,58vh)}
  .m4-site p,.m4-slot{font-size:16.5px}
}
@media (max-width:700px){
  .m4{gap:7px;padding:6px 10px 10px}
  .m4-tray{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 8px}
  .sg .m4-tile{min-height:48px;padding:7px 8px 7px 10px;font-size:13.5px}
  .m4-slot{margin:6px 8px;min-height:42px;padding:6px 10px}
  .m4-line{min-height:36px;font-size:13.5px}
  .m4-fixes{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
  .m4-fixes .sg-bin{font-size:13px;padding:8px 4px}
  .sg .m4-draft .sg-chip{font-size:13.5px;padding:7px 9px}
  .m4-check:not(.m4-talking) .m4-top{display:none}
  .m4-facts ul{padding:6px 8px 8px;gap:5px}
  .m4-facts li{padding:3px 8px;font-size:12.5px}
}
`;

  // ── the art ──
  /* The map kiosk in Hollow Park: a paper town map in a wooden frame, 600 by 300. Greenline's spot is in
     the middle, with a name plate and three stars under it that the game switches on. */
  function kioskArt() {
    const road = (d) => sh.line(d, C.ink, 15) + sh.line(d, "#d9d3ea", 10) + '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="7 7"/>';
    const house = (x, y, c) => sh.rect(x - 13, y - 17, 26, 17, 3, c, 3) + sh.path("M" + (x - 17) + "," + (y - 16) + " L" + x + "," + (y - 31) + " L" + (x + 17) + "," + (y - 16) + " Z", sh.dark(c, 0.18), 3);
    const dot = (x, y) => sh.at(x - 8.2, y - 15, 0.34, A.iconMarkup("pin", "#c3bdd8"));          // somebody else's pin
    const stars = [0, 1, 2].map((n) => sh.path(sh.star(276 + n * 24, 231.5, 8), "#e4e0ef", 2.5, 'class="m4-star"')).join("");
    return sh.rect(84, 244, 22, 56, 5, C.wood) + sh.rect(494, 244, 22, 56, 5, C.wood) + sh.ellipse(95, 298, 30, 5, "rgba(43,33,71,.2)", 0) + sh.ellipse(505, 298, 30, 5, "rgba(43,33,71,.2)", 0) +
      sh.rect(22, 78, 556, 180, 20, C.wood) + sh.rect(38, 94, 524, 148, 10, "#fff6dc", 4) +
      sh.ellipse(92, 206, 40, 22, "#cfeeb4", 0) + sh.ellipse(510, 204, 44, 26, "#cfeeb4", 0) + sh.ellipse(512, 208, 24, 11, C.water, 3) +
      sh.at(78, 222, 0.3, A.prop("tree")) + sh.at(110, 226, 0.26, A.prop("pine")) + sh.at(468, 226, 0.28, A.prop("tree")) +
      road("M48,122 H552") + road("M150,104 V232") + road("M450,104 V232") +
      house(80, 172, C.pink) + dot(80, 138) + house(118, 186, C.blue) + house(486, 166, C.orange) + dot(486, 132) + house(524, 172, C.teal) +
      house(196, 172, C.purple) + house(404, 176, C.sun) + dot(404, 142) +
      sh.rect(38, 94, 524, 148, 10, "none", 4) +
      sh.rect(160, 56, 280, 40, 14, C.red) + sh.text(300, 84, "CEDAR HOLLOW", 21, "#fff", 'textLength="216" lengthAdjust="spacingAndGlyphs"') +
      sh.ellipse(300, 187, 17, 5, "rgba(43,33,71,.25)", 0) +
      sh.group(sh.rect(212, 199, 176, 21, 10, "#fff", 3) + sh.text(300, 214.5, "Greenline Landscaping", 13, C.ink, 'textLength="152" lengthAdjust="spacingAndGlyphs"'), 'class="m4-plate"') +
      sh.group(stars, 'class="m4-vouch"');
  }
  /* Greenline's pin, 100 by 130, the tip at the bottom middle. */
  const pinArt = () => sh.path("M50,126 C24,92 9,72 9,49 A41,41 0 0 1 91,49 C91,72 76,92 50,126 Z", C.red, 6) + sh.ellipse(50, 48, 25, 25, "#fff", 5) + sh.leaf(50, 66, 1.1, 14, C.leaf, 4) + sh.line("M22,38 Q26,20 44,14", "rgba(255,255,255,.75)", 5);
  /* A picture of words: the tile a search cannot read. */
  const pictureIcon = () => A.svg(sh.rect(4, 8, 40, 32, 5, "#fff", 4) + sh.ellipse(15, 19, 4, 4, C.sun, 2.5) + sh.path("M7,37 L19,25 L27,32 L33,26 L41,37 Z", C.leaf, 3), { box: "0 0 48 48" });

  // ── the showdown: Back on the map ──
  async function backOnTheMap(kit, done) {
    kit.backdrop("park", { gray: true });
    kit.style(CSS);
    S.fx.m4rustle = () => S.noise(0.2, { from: 2600, to: 600, vol: 0.09 });
    S.fx.m4steps = () => { for (let i = 0; i < 4; i++) S.tone(170 + (i % 2) * 50, 0.05, { type: "square", vol: 0.04, at: i * 0.13 }); };

    // the kiosk: the map, Hide-and-Seek peeking over it, the pin under six bushes
    const seek = h("div", { class: "m4-seek" }), count = h("span", { class: "m4-count" }, "6 to go");
    const pin = h("div", { class: "m4-pin" }, A.svg(pinArt(), { box: "0 0 100 130" })), board = A.svg(kioskArt(), { box: "0 0 600 300" });
    const bushes = BUSH.map((b, n) => {
      const el = h("i", { class: "m4-bush", style: "left:" + b[0] + "%;top:" + b[1] + "%;z-index:" + (4 + n) + ";--fx:" + b[2] + "%;--fy:" + b[3] + "%;--fr:" + b[4] + "deg;animation-delay:" + (-n * 0.4) + "s" });
      el.appendChild(A.svg(sh.at(50, 58, 1.04, A.prop("bush", { color: b[5] })), { box: "0 0 100 64" })); return el;
    });
    const top = h("div", { class: "m4-top" }, seek, board, h("div", { class: "m4-rays" }), pin, bushes, count);
    const under = h("div", { class: "m4-under" }), mid = h("div", { class: "m4-mid" }), tray = h("div", { class: "m4-tray" });
    const help = h("div", { class: "m4-help", role: "status", "aria-live": "polite" });
    const right = h("div", { class: "m4-right" }, mid, help, tray), wrap = h("div", { class: "m4" }, h("div", { class: "m4-left" }, top, under), right);
    kit.stage.appendChild(wrap);
    const say = (text, tone) => { help.textContent = text; help.className = "m4-help" + (tone ? " sg-" + tone : ""); };
    const peek = (mood) => { seek.innerHTML = ""; seek.appendChild(A.character("hideseek", { mood: mood, class: "sg-pop" })); };   // it flinches each time
    let lit = 0, busy = false;
    const giggle = () => { peek("glad"); kit.after(1300, () => peek(SEEK_MOODS[lit])); };            // a wrong pick: it enjoys that
    /* One more thing is right: a bush flies off, the pin grows and gets its color back. */
    function light() {
      bushes[lit].classList.add("m4-off"); lit++;
      pin.style.setProperty("--s", String(0.7 + lit * 0.055)); pin.style.setProperty("--g", String(Math.max(0, 1 - lit / 6)));
      count.textContent = lit >= 6 ? "Ready for the map!" : (6 - lit) + " to go"; kit.fx.pop(count); peek(SEEK_MOODS[lit]); S.play("m4rustle");
      if (lit >= 6) { top.classList.add("m4-found"); kit.fx.confetti(28); S.play("color"); }
    }
    /* Fill the tray with tiles: drag one, tap it, or press its number. pick(n, zone) decides. */
    function deal(items, zones, pick) {
      tray.innerHTML = "";
      const tiles = items.map((it, n) => {
        const b = h("button", { class: "m4-tile" + (it.img ? " m4-img" : ""), type: "button", onclick: () => pick(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), it.img ? pictureIcon() : null, h("span", null, it.text));
        tray.appendChild(b);
        kit.drag(b, { zones: zones, disabled: () => busy || b.disabled, onDrop: (zone) => (zone ? pick(n, zone) === true : false) });
        return b;
      });
      const keys = {}; tiles.forEach((b, n) => { keys[String(n + 1)] = () => { pick(n); }; });
      const off = kit.keys(keys); kit.focus(tiles[0]);
      const retire = (b) => { b.classList.add("m4-used"); b.disabled = true; };
      return { tiles: tiles, off: off, retire: retire, next: () => kit.focus(tiles.find((b) => !b.disabled)) };
    }
    peek("glad");
    const clock = kit.timer({ up: true });

    // Round 1 · my first go. The listing: snap the name, address and phone that match the website into place
    const slots = {};
    under.appendChild(h("div", { class: "m4-card m4-site" }, h("div", { class: "m4-cardtop" }, A.icon("home"), "Greenline's website says"),
      KINDS.map((k) => h("p", null, h("small", null, k.label), h("span", null, SITE[k.key])))));
    mid.appendChild(h("div", { class: "m4-card m4-list" }, h("div", { class: "m4-cardtop" }, A.icon("pin"), "The town map listing says", h("em", null, "No match")),
      KINDS.map((k) => { slots[k.key] = h("div", { class: "m4-slot" }, h("small", null, k.label), h("span", null, LISTED[k.key]), A.icon("cross")); return slots[k.key]; })));
    const noMatch = mid.querySelector("em");
    say("I make the listing match the website. Drag a tile to its line, tap it, or press its number.");
    await new Promise((resolve) => {
      let left = KINDS.length;
      const t = deal(TILES, KINDS.map((k) => slots[k.key]), (n, zone) => {
        const it = TILES[n], b = t.tiles[n], kind = KINDS.find((k) => k.key === it.kind), slot = slots[it.kind];
        if (busy || b.disabled) return false;
        if (zone && zone !== slot) { kit.fx.shake(b); say("That is " + kind.a + ". It goes on the " + kind.label.toLowerCase() + " line.", "bad"); return false; }
        if (!it.ok) { kit.score.wrong(); giggle(); kit.fx.shake(b); say(it.why, "bad"); return false; }      // a wrong pick: the engine counts it
        kit.score.right(); slot.classList.add("m4-done"); slot.children[1].textContent = it.text; slot.replaceChild(A.icon("check"), slot.lastChild); kit.fx.pop(slot);
        TILES.forEach((x, i) => { if (x.kind === it.kind) t.retire(t.tiles[i]); });                           // the look-alike goes too
        light(); say(kind.yes, "ok");
        if (--left === 0) { busy = true; t.off(); noMatch.textContent = "It matches"; noMatch.style.background = "#c9f5d5"; kit.after(1100, resolve); } else t.next();
        return true;
      });
    });
    top.classList.add("m4-named");
    say("One business now, not three. My listing fix is ready for Jordan.", "ok");
    await kit.wait(1500);

    // Round 2 · three neighbors walk up and ask the map a real question. The plain answer goes on the page draft.
    const walker = h("div", { class: "m4-walker m4-away" }), askWho = h("small"), askText = h("b"), ask = h("div", { class: "m4-ask", hidden: true }, askWho, askText);
    const title = h("b", null, "Services"), fluff = h("p", { class: "m4-fluff" }, "\"Welcome! At Greenline we do it all.\"");
    const rows = ASKERS.map(() => h("div", { class: "m4-line" }, h("span", null, "...")));
    const page = h("div", { class: "m4-card m4-page" }, h("div", { class: "m4-bar" }, h("i"), h("i"), h("i"), title), fluff, rows);
    under.innerHTML = ""; under.appendChild(h("div", { class: "m4-guest" }, walker, ask));
    mid.innerHTML = ""; mid.appendChild(page); top.classList.add("m4-asking");
    const starEls = board.querySelectorAll(".m4-star");
    let now = 0, answered = () => {};
    const t2 = deal(LINES, [page], (n) => {
      const it = LINES[n], b = t2.tiles[n], who = ASKERS[now], name = A.cast[who.who].name;
      if (busy || b.disabled) return false;
      if (it.a === undefined) { kit.score.wrong(); giggle(); kit.fx.shake(b); say(it.why, "bad"); return false; }
      if (it.a !== now) { kit.score.wrong(); giggle(); kit.fx.shake(b); say("True, but that is not what " + name + " asked. I answer the question.", "bad"); return false; }
      busy = true; kit.score.right(); t2.retire(b);
      const row = rows[now]; row.className = "m4-line m4-done"; row.innerHTML = ""; row.appendChild(A.icon("check")); row.appendChild(h("span", null, it.text));
      if (now === 0) { title.textContent = "Paver Patios in Cedar Hollow"; fluff.classList.add("m4-cut"); }
      light(); say("That answers " + name + ", in plain words. " + name + " leaves a star.", "ok");
      walker.innerHTML = ""; walker.appendChild(A.character(who.who, { mood: "glad", pose: "cheer" })); kit.fx.pop(walker);
      askText.textContent = who.thanks; ask.classList.add("m4-thanks"); kit.fx.pop(ask);
      vouch(starEls[now]); kit.after(1500, answered);
      return true;
    });
    busy = true;
    /* A happy neighbor vouches: a star flies from them to the listing on the map. */
    function vouch(star) {
      const from = walker.getBoundingClientRect(), box = wrap.getBoundingClientRect(), f = h("i", { class: "m4-fly", style: "left:" + (from.left + from.width / 2 - 17 - box.left) + "px;top:" + (from.top - box.top) + "px" }, A.icon("star"));
      wrap.appendChild(f);
      kit.fx.fly(f, star, () => { f.remove(); star.classList.add("m4-on"); S.play("star"); });
    }
    for (now = 0; now < ASKERS.length; now++) {
      const who = ASKERS[now], name = A.cast[who.who].name;
      walker.className = "m4-walker m4-away"; walker.innerHTML = ""; walker.appendChild(A.character(who.who, { mood: "think" }));
      ask.hidden = true; ask.classList.remove("m4-thanks"); void walker.offsetWidth; walker.className = "m4-walker m4-walking"; S.play("m4steps");
      await kit.wait(650);
      askWho.textContent = name + " asks the map"; askText.textContent = who.q; ask.hidden = false; kit.fx.pop(ask); S.play("pop");
      rows[now].className = "m4-line m4-now"; rows[now].firstChild.textContent = name + "'s answer goes here";
      say("Which line answers " + name + "? Drag it onto my page draft, tap it, or press its number.");
      busy = false; t2.next();
      await new Promise((resolve) => { answered = resolve; });
      walker.className = "m4-walker m4-bye";
      await kit.wait(500);
    }
    t2.off(); clock.stop();
    t2.tiles.forEach((b) => t2.retire(b));
    say("The pin lights up. My listing fix and my page draft are ready for Jordan.", "ok");
    const took = clock.value(), mine = Math.floor(took / 60) + ":" + String(took % 60).padStart(2, "0");
    await kit.wait(1700);

    // Hide-and-Seek laughs, and Sprout, the trainer, shows its shortcut
    wrap.classList.add("m4-talking");
    kit.cast([{ who: "hideseek", side: "left", mood: "glad" }, { who: "sprout", side: "right", mood: "happy" }]);
    await kit.say([
      { who: "hideseek", mood: "glad", say: "Hee hee. " + mine + " for one little page. Greenline has a dozen more. I will hide those instead!" },
      { who: "sprout", mood: "glad", pose: "cheer", say: "A dozen pages? Watch my shortcut, {name}. Jordan's facts in, a page out. Two seconds!" }
    ]);
    kit.hush(); kit.cast([]); clock.hide();

    // Round 3 · Sprout's shortcut: it writes the next page from Jordan's facts, and says to copy it. One line
    // is not in the facts. The note above the page always has Sprout's face, so every line in it is Sprout talking.
    const face = h("span", { class: "sg-face" }), words = h("span"), note = h("div", { class: "m4-say", role: "status", "aria-live": "polite" }, face, words);
    const tell = (text, mood, tone) => { words.textContent = text; face.innerHTML = ""; face.appendChild(A.avatar("sprout", { mood: mood })); note.className = "m4-say" + (tone ? " sg-" + tone : ""); kit.fx.pop(note); };
    const draft = h("div", { class: "m4-draft" });
    wrap.className = "m4 m4-named m4-check"; help.hidden = true; tray.innerHTML = ""; right.insertBefore(note, mid);
    under.innerHTML = ""; under.appendChild(h("div", { class: "m4-card m4-facts" }, h("div", { class: "m4-cardtop" }, A.icon("book"), "Jordan's facts"), h("ul", null, FACTS.map((f) => h("li", null, f)))));
    mid.innerHTML = ""; mid.appendChild(h("div", { class: "m4-card" }, h("div", { class: "m4-bar" }, h("i"), h("i"), h("i"), h("b", null, "Sprout's new page")), draft));
    tell("Watch and learn. Writing...", "think");
    const chips = [];
    await new Promise((resolve) => {                   // six lines zip onto the page
      let n = 0;
      const stop = kit.every(170, () => {
        const d = DRAFT[n], chip = h("button", { class: "sg-chip", type: "button", disabled: true }, h("small", null, d.tag), h("span", null, d.text));
        chips.push({ d: d, el: chip }); draft.appendChild(chip); S.play("zip");
        if (++n >= DRAFT.length) { stop(); kit.after(450, resolve); }
      });
    });
    tell("Done! A title and five plain lines, in two seconds. Copy it. All of it true. Probably.", "proud");
    await kit.wait(1900);
    tell(kit.fill("Go on, check me, {name}. If one line is not in Jordan's facts, tap it. There is none!"), "proud");
    let tries = 0;
    const found = await new Promise((resolve) => {
      const pick = (c) => {
        if (c.el.disabled) return;
        if (!c.d.wrong) {
          tries++; kit.score.wrong(); kit.fx.shake(c.el); c.el.disabled = true; c.el.classList.add("sg-okay"); tell("That one is in Jordan's facts. See? Keep looking if you must.", "proud", "bad");
          return kit.focus((chips.slice(chips.indexOf(c)).concat(chips).find((x) => !x.el.disabled) || c).el);   // the keyboard stays on the page
        }
        chips.forEach((x) => { x.el.disabled = true; }); c.el.classList.add("sg-found"); kit.score.right(); off();
        kit.score.sprout(tries === 0);                 // the second star: Sprout's slip caught on the first try
        resolve(c);
      };
      const keys = {}; chips.forEach((c, n) => { c.el.disabled = false; c.el.onclick = () => pick(c); keys[String(n + 1)] = () => pick(c); });
      const off = kit.keys(keys); kit.focus(chips[0].el);
    });
    tell("Oops. Nobody told me how long Greenline has built patios. I guessed. What will you do with that line?", "oops", "ok");
    await new Promise((resolve) => {
      const fixes = FIXES.map((f, n) => h("button", { class: "sg-bin", type: "button", style: "--c:" + f.color, onclick: () => pick(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), A.icon(f.icon), h("b", null, f.label)));
      const pick = (n) => {
        if (!FIXES[n].ok) { kit.score.wrong(); kit.fx.shake(fixes[n]); tell(FIXES[n].why, "oops", "bad"); return; }
        fixes.forEach((b) => { b.disabled = true; }); off(); kit.score.right();
        found.el.className = "sg-chip sg-yes"; found.el.lastChild.textContent = TRUE_LINE; kit.fx.pop(found.el); resolve();
      };
      tray.className = "m4-tray m4-fixes"; fixes.forEach((b) => tray.appendChild(b));
      const off = kit.keys({ "1": () => pick(0), "2": () => pick(1), "3": () => pick(2) }); kit.focus(fixes[0]);
    });
    tell(kit.fill("Fixed. Good catch, {name}. My shortcut skipped the part where I ask Jordan."), "glad", "ok");
    await kit.wait(1700);
    wrap.classList.add("m4-talking"); note.hidden = true; peek("caught");
    kit.cast([{ who: "hideseek", side: "left", mood: "surprised" }, { who: "sprout", side: "right", mood: "proud", pose: "hips" }]);
    await kit.say([
      { who: "hideseek", mood: "surprised", say: "One name everywhere? Plain facts? And you CHECK your own trainer? Nowhere left to hide. Not fair!" },
      { who: "sprout", mood: "proud", pose: "cheer", say: "You check the facts. Jordan puts it on the map. Take it to Jordan, {name}!" }
    ]);
    done();                                            // the engine's handoff comes next: Jordan approves
  }

  // ── the case ──
  OH.game.mission({
    week: 4,
    title: "The Company Nobody Can Find",
    badge: { name: "On the Map" },
    reward: { hours: 1, leads: 3, money: 0 },
    maxWrong: 4,

    /* The briefing at Greenline HQ: a search that finds everybody but Greenline, and who is hiding behind it.
       Jordan and Sprout talk to the agent. {agent} becomes "Agent Ivy" and {name} becomes "Ivy".
       who: "you" is the agent's own thought, shown as visor text with no actor. */
    briefing: {
      setup: (kit) => {
        kit.style(CSS);
        const rows = ["Somebody Else's Patios", "Somebody Else's Cousin", "A page about ducks"].map((t, n) => h("p", { style: "animation-delay:" + (1.4 + n * 0.3) + "s" }, h("b", null, String(n + 1)), t));
        kit.stage.appendChild(h("div", { class: "m4-brief" }, h("div", { class: "m4-lurk" }, A.character("hideseek", { mood: "glad" })),
          h("div", { class: "m4-search" }, h("div", { class: "m4-sbar" }, A.icon("magnifier"), h("span", { class: "m4-typed" }, "patio builder cedar hollow")), rows,
            h("p", { class: "m4-none", style: "animation-delay:2.5s" }, A.icon("cross"), "Greenline: not found"))));
      },
      lines: [
        { who: "jordan", mood: "worried", pose: "shrug", say: "{agent}! Search for a patio builder in Cedar Hollow. Go on. I will wait." },
        { who: "jordan", mood: "worried", pose: "point", say: "Somebody Else. Somebody Else's Cousin. A page about ducks. No Greenline." },
        { who: "you", say: "I asked myself who builds patios around here. I had no idea. And I work here!" },
        { who: "jordan", mood: "worried", pose: "idle", say: "Our patio page is called \"Services\". It says we \"do it all\". It never names the town." },
        { who: "jordan", mood: "grumpy", pose: "hips", say: "That is Hide-and-Seek's work. It has hidden Greenline from the town map." },
        { who: "sprout", mood: "glad", pose: "wave", say: "When I had your job, a man phoned. He sells the first spot in every search. Guaranteed, he said!" },
        { who: "jordan", mood: "grumpy", pose: "idle", say: "Nobody can promise that spot. Not him, not anyone." },
        { who: "jordan", mood: "happy", pose: "point", say: "Three people in town know how getting found really works. Go and learn from them, {name}." }
      ]
    },

    /* Three stops: a place, who is there, a few lines, a quick challenge, and the knowledge it earns.
       A piece of knowledge (`clue`) is one real idea from the class, as something the agent now knows
       about itself or its work. It is kept under "What I know" in the Skills panel. */
    stops: [
      { place: "square", who: "maple",
        lines: [
          { who: "maple", mood: "glad", pose: "wave", say: "Welcome to Town Square, {agent}! Ask the map kiosk anything. It asks three questions back." },
          { who: "maple", mood: "proud", pose: "point", say: "Can I read this page? Does it answer what was asked? Does anybody vouch for them?" },
          { who: "sprout", mood: "oops", say: "Greenline's best page is a photo of a flyer, {name}. I never could read the words inside it!" },
          { who: "maple", mood: "think", pose: "idle", say: "Then neither can the kiosk. Every trouble fails one of the three. See which is which." }
        ],
        challenge: { type: "sort", ask: "Which of the three questions does each one fail? I sort them.",
          bins: [{ key: "read", label: "Can it read the page?", icon: "eye", color: C.blue }, { key: "answer", label: "Does the page answer?", icon: "chat", color: C.sun }, { key: "vouch", label: "Does anyone vouch?", icon: "star", color: C.pink }],
          items: [
            { text: "The words are inside a picture", bin: "read", why: "It needs real text. Words locked in a picture may not be read." },
            { text: "The page never names the town", bin: "answer", why: "A stranger types the service and the town. The page has to say both." },
            { text: "Not one review yet", bin: "vouch", why: "A review is a neighbor vouching for Greenline." },
            { text: "The page is titled \"Services\"", bin: "answer", why: "It can be read. It answers nothing. It has to say the service and the town." },
            { text: "No other website mentions Greenline", bin: "vouch", why: "A link from a real website is somebody vouching." },
            { text: "The phone number is part of the logo", bin: "read", why: "A logo is a picture. The number has to be typed as text too." }
          ] },
        clue: { title: "I ask three questions", text: "A search asks three things, so I ask them too. Can it read the page? Does the page answer what was asked? Does anyone vouch for the business?" } },

      { place: "bank", who: "penny",
        lines: [
          { who: "penny", mood: "think", say: "A check came in for \"Green Line Landscape and Design\". I can't pay that to Greenline." },
          { who: "penny", mood: "happy", pose: "point", say: "To a bank, a different name is a different business. A person shrugs. A program like you can't." },
          { who: "sprout", mood: "oops", pose: "shrug", say: "Greenline is written three ways around town, {name}. The map thinks it is three small companies." },
          { who: "penny", mood: "proud", pose: "idle", say: "One name, one address, one phone. The same in every place. Find the odd one out." }
        ],
        challenge: { type: "spot", ask: "Three listings for one business. I find the line that does not match. Tap it.", nope: "That line is the same in all three. I keep looking.",
          groups: [
            { label: "The website", color: C.teal, items: [{ text: "Greenline Landscaping" }, { text: "12 Fern Road" }, { text: "555-0100" }] },
            { label: "The town map", color: C.red, items: [{ text: "Greenline Landscaping" }, { text: "12 Fern Road" }, { text: "555-0199", wrong: true, why: "An old phone number. The map sends callers to a phone nobody answers." }] },
            { label: "The phone book", color: C.sun, items: [{ text: "Greenline Landscaping" }, { text: "12 Fern Road" }, { text: "555-0100" }] }
          ] },
        clue: { title: "One name, one address, one phone", text: "To a program like me, a different name is a different business. So a free listing needs the same name, address and phone everywhere. I write them one way, in every place." } },

      { place: "grind", who: "bea",
        lines: [
          { who: "bea", mood: "surprised", say: "A customer asked her phone who builds patios in Cedar Hollow. It never said Greenline!" },
          { who: "sprout", mood: "think", pose: "shrug", say: "Agents like us only repeat what we can read, {name}. Not written down? We skip Greenline." },
          { who: "bea", mood: "think", pose: "idle", say: "Greenline's page says \"premium outdoor living experiences\". What is there to repeat?" },
          { who: "bea", mood: "happy", pose: "point", say: "My sign says \"Hot cocoa. Here. Every day.\" Plain. Tap the lines an agent like you could pass along." }
        ],
        challenge: { type: "tap", ask: "Tap the four lines an agent like me could pass along.",
          items: [
            { text: "We build paver patios in Cedar Hollow", ok: true, why: "What, and where. Easy to repeat." },
            { text: "Premium outdoor living experiences", ok: false, why: "Nice words. No service and no town in them." },
            { text: "Call 555-0100 or use the quote form", ok: true, why: "How to book, in one plain sentence." },
            { text: "We do it all!", ok: false, why: "All of what? I cannot pass that along." },
            { text: "The site visit is free", ok: true, why: "A fact a customer can use." },
            { text: "From concept to completion", ok: false, why: "That could be any company on earth." },
            { text: "After the visit you get a written quote", ok: true, why: "What happens next, said plainly." },
            { text: "Passionate about excellence", ok: false, why: "Lovely. Still no facts." }
          ] },
        clue: { title: "I repeat what is plainly said", text: "I can only repeat what a page plainly says. So I write the facts in plain sentences: what, where, for whom, how to book." } }
    ],

    /* The plan: three cards, exactly one with right: true. The cards are the agent's own options, so they say "I". */
    crack: {
      lines: [{ who: "sprout", mood: "glad", pose: "cheer", say: "Three things learned, {name}. So how do we get Greenline back on the map?" }],
      ask: "What is my plan?",
      cards: [
        { title: "I ask Jordan to buy the first spot", text: "The man on the phone says it is guaranteed.", color: C.pink,
          art: sh.path(sh.star(60, 58, 50), C.sun) + sh.text(60, 72, "#1", 34) + sh.at(96, 96, 1, A.prop("coin")) + sh.at(22, 98, 0.8, A.prop("coin")),
          react: { who: "hideseek", mood: "glad", say: "Nobody can promise that spot. Pay him anyway! I will go on hiding you. Hee hee." } },
        { title: "I write plain, matching facts", text: "One name, address and phone everywhere. Pages that answer in plain words.", color: C.teal, right: true,
          art: sh.at(6, 2, 2.1, A.iconMarkup("pin")) + sh.at(64, 62, 1.1, A.iconMarkup("check")),
          react: { who: "jordan", mood: "glad", say: "That's it. Easy to read and easy to repeat. You draft it. I put us back on the map." } },
        { title: "I say the town forty times", text: "Cedar Hollow Cedar Hollow Cedar Hollow. They can't miss it.", color: C.sun,
          art: sh.at(14, 0, 1.9, A.iconMarkup("sign")) + sh.rect(22, 80, 76, 34, 12, C.red) + sh.text(60, 105, "x 40", 24, "#fff"),
          react: { who: "sprout", mood: "oops", say: "I read a page like that. It answered nothing. Name the towns Greenline serves once, in a sentence." } }
      ]
    },

    /* The showdown: a title, the task line Jordan gives (it shows in the visor), two or three lines of
       how to play in the agent's own words, and the mini-game itself. */
    showdown: {
      title: "Back on the map",
      task: "Fix the listing. Draft the page. Publish nothing.",
      how: ["The map listing is wrong. I snap in the name, address and phone that match the website.", "Then neighbors ask the map real questions. I put the plain answer on my page draft.",
        "Drag a tile, tap it, or press its number. Then Sprout shows me its shortcut. I check it."],
      play: backOnTheMap
    },

    /* The handoff: the agent never publishes. After the showdown the engine takes the work to Jordan.
       ask: Jordan's line. work: two or three short lines of what the agent did. approve: Jordan's yes. */
    handoff: {
      ask: "The listing and the patio page, {agent}. What have you got for me?",
      work: ["A listing fix: one name, one address, one phone.", "A patio page with three plain answers. One made-up line out.", "Nothing published. Not one word."],
      approve: "Approved. I will put the listing and the page up myself."
    },

    /* After the catch: two lines. The second steps out of the story: one thing for the person playing
       to try for real, tonight. It starts "For the person behind the visor:". */
    debrief: [
      { who: "jordan", mood: "glad", pose: "cheer", say: "One name, one address, one phone, and a page that says what we do and where. They can find us." },
      { who: "sprout", mood: "proud", pose: "wave", say: "For the person behind the visor: tonight, search what you sell plus your town. Ask an AI too. Check the facts." }
    ],
    next: "Next case: the marketing stops every time Jordan gets busy."
  });
})();
