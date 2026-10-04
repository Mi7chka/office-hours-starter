/* Save Greenline · case 5: The Marketing That Quits. Bandit: Blank Page, who steals the ideas so the marketing stops.
   What it teaches (session 5 of the class): one real idea a week becomes five pieces (a post, a short
   video, an email, a website answer, a listing post) · a short weekly routine beats a burst of effort
   (pick, draft, design, schedule, one number) · it drafts, you approve, then it posts.
   The showdown is the week's job done by hand: plant one idea, put its five pieces where they belong,
   then read what Sprout wrote, pull the promise nobody made, and stamp what is true.

   AGENT MODE: the player IS the AI, Greenline's new agent. So every line here is written to the
   agent ("you") or by the agent ("I"). Sprout is the trainer, the agent who had the job before, and
   its one wrong shortcut (five pieces lined up to post unread, one with a promise nobody made) is the
   thing to catch. The agent never posts: its stamp says Checked, not Approved, and the engine's
   handoff takes the five pieces to Jordan.

   The format and every kit call are explained in GAME.md; m1.js is the model. Everything in it is made up. */
(function () {
  "use strict";
  if (!window.OH || !OH.game || !OH.game.mission || !OH.game.art) return;
  const h = OH.h, A = OH.game.art, S = OH.game.sound, sh = A.shape, C = A.C;

  // ── the showdown's data ──
  /* The five shapes one idea takes, and where each one goes. From the class:
       shape, who   what the piece looks like, and who it is for (the card the player reads)
       line         how the piece starts, in the sample answer of the week 5 tool
       why          one line of help, shown after a wrong pick
       sprout       the line Sprout writes for it. The listing post makes a promise nobody made.   */
  const PIECES = {
    post: { label: "Social post", icon: "chat", color: C.pink, head: "daisy", at: 72,
      shape: "A few short lines", who: "The question and the answer, for the people who follow Greenline.", line: "Is it too late to plant this fall? Not yet.",
      why: "A few short lines for the people who follow Greenline. That is a social post.", yes: "A post. The question and the answer, in a few lines.",
      sprout: "Is it too late to plant this fall? Not yet." },
    video: { label: "Video script", icon: "play", color: C.red, head: "tulip", at: 58,
      shape: "Thirty seconds, said out loud", who: "Jordan, a phone camera, and the same answer.", line: "A customer asked me this on Tuesday.",
      why: "Said out loud to a phone camera. That is the video script.", yes: "A video script. Same answer, said out loud.",
      sprout: "The real cutoff is the ground freezing, not the calendar." },
    email: { label: "Email", icon: "envelope", color: C.sun, head: "sun", at: 50,
      shape: "Three lines and one link", who: "For the people who asked to hear from Greenline.", line: "Subject: Is it too late to plant this fall?",
      why: "Three lines and a link, to people who asked to hear from Greenline. That is the email.", yes: "An email. Three lines, one link.",
      sprout: "Our crew's last planting day is Saturday, November 21." },
    site: { label: "Website answer", icon: "home", color: C.blue, head: "pom", at: 74,
      shape: "The question, answered once and kept", who: "In the customer's own words, on the questions page.", line: "Is it too late to plant shrubs this fall? No.",
      why: "Answered once and kept, on the questions page. That is the website answer.", yes: "A website answer. Asked once, kept for good.",
      sprout: "After planting, water once a week until the ground freezes." },
    listing: { label: "Listing post", icon: "pin", color: C.purple, head: "star", at: 62,
      shape: "A short update with a photo", who: "It shows where people look Greenline up on the town map.", line: "Last planting day: Saturday, November 21.",
      why: "A short update with a photo, where people look Greenline up. That is the listing post.", yes: "A listing post. Short, with a photo.",
      sprout: "Every shrub we plant is guaranteed to make it to spring.", wrong: true }
  };
  const POTS = ["post", "video", "email", "site", "listing"];        // the five pots, in key order 1 to 5
  const BED = ["email", "post", "listing", "video", "site"];         // which sprout comes up where, left to right
  const SPOTS = [14, 32, 50, 68, 86];                                // where the five stand in the planter, in percent
  const FACTS = ["It is not too late. Fall is a good time to plant", "The real cutoff is the ground freezing", "Last planting day: Saturday, November 21", "Water once a week until the ground freezes", "A site visit is free"];
  const TRUE_LINE = "Last planting day: Saturday, November 21. The site visit is free.";
  const NOTES = [392, 440, 494, 587, 659];
  /* Gus's jobs board: the weekly routine from the class, a day for each step. */
  const WEEK = [
    { day: "Mon", text: "Pick one idea from last week", short: "Pick the idea", yes: "Monday. One question, one job or one fix. Five minutes." },
    { day: "Tue", text: "Draft all five pieces in one sitting", short: "Draft all five", yes: "Tuesday. I draft all five at once, in Jordan's voice.", why: "Nothing to draft yet. First I need the idea." },
    { day: "Wed", text: "Drop the words into one template", short: "Design", yes: "Wednesday. The same template every week. New words, new photo.", why: "The words come before the design. I draft them first." },
    { day: "Thu", text: "Jordan reads every piece, then lines up the week", short: "Read, then schedule", yes: "Thursday. Jordan reads first. Then the pieces line up, one a day.", why: "Not yet. A piece gets its design before it gets a date." },
    { day: "Fri", text: "Write down one number", short: "One number", yes: "Friday. How many new people got in touch? I write it down.", why: "The count comes last, when the week is done." }
  ];
  const SHUFFLE = [3, 0, 4, 2, 1];                                   // the order the five jobs hang on the board

  /* This mission's own styles, under its own prefix (m5-). kit.style() removes them with the screen. */
  const CSS = `
.m5-brief{position:absolute;top:2%;left:50%;display:flex;align-items:center;gap:6px;width:min(90vw,430px);translate:-50% 0;pointer-events:none}
.m5-cal{flex:1;min-width:0;padding:9px 12px 10px;border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 7px 0 rgba(43,33,71,.3);text-align:left}
.m5-cal b{display:block;margin-bottom:6px;font:900 15px/1.2 var(--sg-font)}
.m5-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}
.m5-days i{display:flex;align-items:center;justify-content:center;aspect-ratio:1;border:3px solid var(--sg-ink);border-radius:9px;background:#f4f1ff;font:900 11px/1 var(--sg-font);font-style:normal;color:#b9b6c9}
.m5-days i.m5-did{background:#c9f5d5}
.m5-days svg{width:86%;height:86%;overflow:visible}
.m5-cal small{display:block;margin-top:7px;font:800 12.5px/1.3 var(--sg-font);color:#5d5578}
.m5-hover{flex:0 0 27%;aspect-ratio:200/220;animation:sg-bounce 2s ease-in-out infinite}
.m5-hover svg{width:100%;height:100%;overflow:visible}

.m5-week{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin-bottom:12px}
.m5-day{display:flex;flex-direction:column;align-items:center;gap:4px;min-height:74px;padding:6px 4px;border:3px dashed #b9b6c9;border-radius:14px;background:#f4f1ff;font:800 13px/1.2 var(--sg-font);text-align:center}
.m5-day b{padding:2px 9px;border:2px solid var(--sg-ink);border-radius:999px;background:#fff;font:900 12px/1.2 var(--sg-font)}
.m5-day.m5-next{border-color:var(--sg-ink);background:#fff7cf}
.m5-day.m5-set{border-style:solid;border-color:var(--sg-ink);background:#c9f5d5}
@media (max-width:700px){.m5-week{grid-template-columns:1fr;gap:5px}.m5-day{flex-direction:row;min-height:34px;padding:4px 8px;text-align:left}.m5-day b{flex:0 0 46px;text-align:center}}

.m5{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:safe center;gap:8px;padding:8px 12px 12px;overflow:hidden}
.m5::before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(rgba(54,44,92,.55),rgba(54,44,92,.3) 60%,rgba(54,44,92,.12));pointer-events:none}
.m5-left,.m5-right{display:contents}
.m5-bed{position:relative;order:1;flex:0 0 auto;width:min(100%,560px,46vh);aspect-ratio:600/380}
.m5-bed>svg{position:absolute;top:0;left:0;width:100%;height:100%;overflow:visible}
.m5-bed.sg-over{filter:brightness(1.08)}
.m5-soil{position:absolute;left:50%;bottom:20%;width:4%;height:4%}
.m5-plant{position:absolute;bottom:23.7%;width:15.5%;height:54%;margin-left:-7.75%}
.m5-plant svg{position:absolute;left:0;bottom:0;width:100%;height:100%;overflow:visible;transform-origin:50% 100%}
.m5-seedling svg{animation:m5-up .45s cubic-bezier(.2,1.7,.4,1) both}
.m5-ripe svg{animation:m5-wig .42s ease-in-out infinite alternate}
.m5-ripe::before{content:"";position:absolute;left:50%;bottom:40%;margin-left:-13px;border:13px solid transparent;border-top:16px solid var(--sg-sun);border-bottom:0;filter:drop-shadow(0 3px 0 var(--sg-ink)) drop-shadow(0 -2px 0 var(--sg-ink)) drop-shadow(2px 0 0 var(--sg-ink)) drop-shadow(-2px 0 0 var(--sg-ink));animation:sg-bounce .7s ease-in-out infinite}
.m5-bloom svg{animation:m5-grow .7s cubic-bezier(.2,1.5,.4,1) both,m5-sway 2.8s ease-in-out .7s infinite alternate}
.m5-hop svg{animation:m5-hop .5s ease-out,m5-sway 2.8s ease-in-out .5s infinite alternate}
@keyframes m5-up{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes m5-wig{from{transform:rotate(-10deg)}to{transform:rotate(10deg)}}
@keyframes m5-grow{0%{transform:scale(.3,.1)}60%{transform:scale(1.05,1.12)}100%{transform:scale(1)}}
@keyframes m5-sway{from{transform:rotate(-2.5deg)}to{transform:rotate(2.5deg)}}
@keyframes m5-hop{0%,100%{transform:translateY(0) scale(1)}35%{transform:translateY(-9%) scale(1.06,.96)}}
.sg .m5-weed{z-index:4;padding:0;border:0;border-radius:18px;background:none;cursor:grab;translate:0 calc(var(--tug,0)*-7%);transition:translate .2s cubic-bezier(.2,1.6,.4,1)}
.m5-weed svg{animation:m5-wig .9s ease-in-out infinite alternate}
.m5-weed::after{content:"";position:absolute;top:-14%;left:-28%;right:-28%;bottom:-8%}
.m5-weed.m5-out{transform:translateY(-190%) rotate(50deg)!important;opacity:0;transition:transform .6s cubic-bezier(.4,-.4,.7,.6),opacity .3s .3s}
.m5-pulltag{position:absolute;left:50%;top:-6%;translate:-50% -100%;display:flex;align-items:center;gap:5px;padding:4px 10px;border:3px solid var(--sg-ink);border-radius:999px;background:var(--sg-sun);font:900 13px/1.1 var(--sg-font);white-space:nowrap;animation:sg-bounce .7s ease-in-out infinite}
.m5-thief{position:absolute;top:-3%;left:var(--x,50%);width:21%;aspect-ratio:200/220;margin-left:-10.5%;z-index:2;transition:left .6s cubic-bezier(.4,1.5,.5,1);animation:sg-bounce 1.8s ease-in-out infinite;pointer-events:none}
.m5-thief svg{width:100%;height:100%;overflow:visible}
.m5-thief svg.m5-bonk{animation:m5-bonk .55s ease-out}
@keyframes m5-bonk{0%{transform:translateY(0) rotate(0)}30%{transform:translateY(-34%) rotate(-16deg)}60%{transform:translateY(-10%) rotate(10deg)}100%{transform:none}}
.m5-count{position:absolute;right:3.5%;bottom:7%;z-index:3;padding:5px 11px;border:3px solid var(--sg-ink);border-radius:999px;background:#fff;font:900 14px/1 var(--sg-font)}
.m5-count.m5-all{background:var(--sg-sun)}

.m5-under{position:relative;order:3;flex:0 0 auto;display:flex;justify-content:center;width:min(100%,560px)}
.m5-under:empty{display:none}
.m5-mid{position:relative;order:4;flex:0 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;width:min(100%,640px)}
.m5-seedcard{display:flex;align-items:center;gap:12px;width:min(100%,520px);padding:12px 16px;border:4px solid var(--sg-ink);border-radius:24px;background:#fff;box-shadow:0 8px 0 rgba(43,33,71,.3);text-align:left;animation:sg-pop .3s}
.m5-seed{flex:0 0 auto;width:clamp(74px,13vmin,104px);aspect-ratio:120/130;cursor:grab;animation:sg-bounce 1.2s ease-in-out infinite}
.m5-seed svg{width:100%;height:100%;overflow:visible}
.m5-seed.sg-dragging{box-shadow:none!important;filter:drop-shadow(0 12px 0 rgba(43,33,71,.25));animation:none}
.m5-seedcard small{display:block;font:900 11.5px/1.2 var(--sg-font);letter-spacing:1px;text-transform:uppercase;color:#7a4be0}
.m5-seedcard b{display:block;margin:3px 0;font:900 clamp(18px,2.8vmin,23px)/1.2 var(--sg-font)}
.m5-seedcard p{font:700 14.5px/1.35 var(--sg-font);color:#5d5578}
.m5-tag{width:min(100%,480px);border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 8px 0 var(--sg-ink);overflow:hidden;cursor:grab;text-align:left;animation:m5-in .38s cubic-bezier(.2,1.3,.4,1)}
.m5-tag.sg-dragging{scale:.62;opacity:.92}
@keyframes m5-in{from{transform:translateY(-60%) scale(.4) rotate(-10deg);opacity:0}to{transform:none;opacity:1}}
.m5-tag-top{display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:4px solid var(--sg-ink);background:#bff0c8;font:900 14px/1.2 var(--sg-font)}
.m5-tag-top svg{width:24px;height:24px;flex:0 0 auto}
.m5-tag-top b{flex:1;min-width:0}
.m5-tag-body{padding:9px 14px 12px}
.m5-tag-body b{display:block;font:900 clamp(18px,2.7vmin,23px)/1.2 var(--sg-font)}
.m5-tag-body p{margin-top:4px;font:700 clamp(13.5px,1.9vmin,15.5px)/1.35 var(--sg-font);color:#5d5578}
.m5-tag-body q{display:block;margin-top:8px;padding:6px 10px;border-radius:10px;background:var(--sg-cream);font:italic 800 14px/1.3 var(--sg-font);quotes:none}
.m5-help{position:relative;order:5;flex:0 0 auto;width:min(100%,640px);min-height:2.5em;display:flex;align-items:center;justify-content:center;padding:6px 14px;border:3px solid var(--sg-ink);border-radius:16px;background:#fff;font:800 14.5px/1.3 var(--sg-font);text-align:center}
.m5-help.sg-bad{background:#ffe2e2;color:#a11d2e}.m5-help.sg-ok{background:#d9f8e1;color:#14693a}
.m5-pots{position:relative;order:6;flex:0 0 auto;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;width:min(100%,640px)}
.m5-pots.m5-one{display:flex;justify-content:center}
.m5-pots .sg-bin{min-height:82px;padding:9px 4px;font-size:14.5px}
.m5-pots .sg-bin:disabled{filter:saturate(.55) brightness(1.06);box-shadow:0 3px 0 var(--sg-ink);transform:translateY(3px)}
.m5-pots .sg-bin em{position:absolute;top:-11px;right:-6px;display:none;width:28px;height:28px;padding:3px;border:3px solid var(--sg-ink);border-radius:50%;background:#fff}
.m5-pots .sg-bin.m5-full em{display:block}
.m5-pots .sg-bin em svg{width:100%;height:100%}
.m5-talking .m5-under,.m5-talking .m5-mid,.m5-talking .m5-help,.m5-talking .m5-pots,.m5-talking .m5-say{display:none}
.m5-talking{justify-content:flex-start}
.m5-talking .m5-thief{display:none}

.m5-check{overflow-y:auto}
.m5-check .m5-count{display:none}
.m5-check .m5-mid{flex:0 0 auto}
.m5-say{position:relative;order:2;flex:0 0 auto;display:flex;align-items:center;gap:10px;width:min(100%,640px);padding:8px 12px;border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 6px 0 rgba(43,33,71,.3);font:800 clamp(14.5px,2.1vmin,17px)/1.3 var(--sg-font)}
.m5-say.sg-bad{background:#ffe2e2}.m5-say.sg-ok{background:#d9f8e1}
.m5-say .sg-face{background:#c9f7ee}
.m5-card{width:100%;border:4px solid var(--sg-ink);border-radius:20px;background:#fff;box-shadow:0 6px 0 rgba(43,33,71,.3);text-align:left}
.m5-cardtop{display:flex;align-items:center;gap:8px;padding:6px 12px;border-bottom:4px solid var(--sg-ink);border-radius:15px 15px 0 0;background:var(--sg-sun);font:900 14.5px/1.2 var(--sg-font)}
.m5-cardtop svg{width:22px;height:22px;flex:0 0 auto}
.m5-facts ul{list-style:none;margin:0;padding:8px 10px 10px;display:flex;flex-wrap:wrap;gap:6px}
.m5-facts li{padding:4px 10px;border:2px solid var(--sg-ink);border-radius:999px;background:var(--sg-cream);font:800 13.5px/1.25 var(--sg-font)}
.m5-pieces{display:flex;flex-direction:column;gap:8px;width:100%}
.sg .m5-pieces .sg-chip{position:relative;width:100%;padding:8px 10px;font-size:14.5px;animation:sg-pop .25s}
.sg .m5-pieces .sg-chip:disabled{opacity:1}
.m5-badge{display:flex;align-items:center;justify-content:center;flex:0 0 38px;height:38px;border:3px solid var(--sg-ink);border-radius:50%;background:var(--c)}
.m5-badge svg{width:22px;height:22px}
.m5-pieces .sg-chip>span:not(.m5-badge){flex:1;min-width:0}
.m5-pieces .sg-chip small{display:block;font:900 10.5px/1.3 var(--sg-font);letter-spacing:.8px;text-transform:uppercase;color:#7a4be0}
.sg .m5-pieces .sg-chip.m5-stampable:not(:disabled){background:#fffbe6}
.sg .m5-pieces .sg-chip.m5-sent{background:#d9f8e1;box-shadow:none}
.m5-ok{position:absolute;right:9px;top:-10px;z-index:1;padding:2px 9px;border:3px solid #1f9a4d;border-radius:9px;background:rgba(255,255,255,.92);color:#1f9a4d;font:900 14px/1.2 var(--sg-font);font-style:normal;letter-spacing:.5px;text-transform:uppercase;rotate:-9deg;animation:m5-thunk .28s cubic-bezier(.2,1.6,.4,1) .16s both}
@keyframes m5-thunk{from{scale:2.4;opacity:0}to{scale:1;opacity:1}}
.m5-rubber{position:absolute;right:30px;top:-46px;width:46px;height:46px;z-index:2;pointer-events:none;animation:m5-press .42s ease-in both}
.m5-rubber svg{width:100%;height:100%;overflow:visible}
@keyframes m5-press{0%{transform:translateY(-70px) rotate(-14deg);opacity:0}40%{transform:translateY(0) rotate(-9deg);opacity:1}55%{transform:translateY(6px) rotate(-9deg) scale(1.1,.86)}100%{transform:translateY(-46px) rotate(-4deg);opacity:0}}
@media (min-width:900px){
  .m5:not(.m5-talking){flex-direction:row;justify-content:center;gap:28px;padding:10px 24px 14px}
  .m5:not(.m5-talking) .m5-left{display:flex;flex-direction:column;align-items:center;gap:10px;flex:0 1 46%;min-width:0;max-width:560px}
  .m5:not(.m5-talking) .m5-right{display:flex;flex-direction:column;align-items:center;gap:10px;flex:1 1 54%;min-width:0;max-width:640px}
  .m5:not(.m5-talking) .m5-bed{width:min(100%,74vh)}
  .m5-talking .m5-bed{width:min(100%,560px,52vh)}
}
@media (max-width:700px){
  .m5{gap:7px;padding:6px 10px 10px}
  .m5-pots{gap:5px}
  .m5-pots .sg-bin{min-height:74px;padding:8px 2px;font-size:12.5px;border-width:3px;border-radius:16px}
  .m5-pots .sg-bin .sg-icon{width:24px;height:24px}
  .m5-seedcard{padding:10px 12px}
  .m5-facts ul{display:block;padding:6px 11px 8px}
  .m5-facts li{display:inline;padding:0;border:0;background:none;font:800 12.5px/1.4 var(--sg-font)}
  .m5-facts li+li::before{content:" · ";color:#7a4be0;font-weight:900}
  .m5-cardtop{padding:5px 11px;font-size:13.5px}
  .m5-pieces{gap:6px}
  .sg .m5-pieces .sg-chip{padding:6px 9px;font-size:13.5px}
  .m5-badge{flex-basis:32px;height:32px}
  .m5-check:not(.m5-talking) .m5-bed{width:min(100%,29vh)}
}
`;

  // ── the art ──
  /* A plant is drawn in a box 100 wide and 220 tall, growing up from the middle of the bottom edge. */
  const BOX = { box: "0 0 100 220" };
  const stem = (top) => sh.tube("M50,218 C43,184 57,150 50," + top, C.greenDark, 6) + sh.leaf(49, 190, 1.05, -66, C.leaf) + sh.leaf(51, 162, 1.05, 64, C.leaf);
  const petals = (n, y, rx, ry, out, c) => { let s = ""; for (let i = 0; i < n; i++) s += sh.group(sh.ellipse(0, -out, rx, ry, c, 4), 'transform="translate(50,' + y + ") rotate(" + (i * 360 / n) + ')"'); return s; };
  const HEADS = {
    daisy: (c, y) => petals(8, y, 10, 15, 23, c),
    tulip: (c, y) => sh.path("M20," + (y - 4) + " Q16," + (y - 46) + " 35," + (y - 24) + " Q50," + (y - 52) + " 65," + (y - 24) + " Q84," + (y - 46) + " 80," + (y - 4) + " Q76," + (y + 28) + " 50," + (y + 28) + " Q24," + (y + 28) + " 20," + (y - 4) + " Z", c, 5),
    sun: (c, y) => petals(12, y, 7, 15, 27, c),
    pom: (c, y) => sh.cluster([[50, y, 27], [28, y - 8, 15], [72, y - 8, 15], [34, y + 16, 15], [66, y + 16, 15], [50, y - 24, 15]], c, 4),
    star: (c, y) => sh.path(sh.star(50, y, 40, 21), c, 5)
  };
  const badge = (icon, y) => sh.ellipse(50, y, 15.5, 15.5, "#fff", 4) + sh.at(50 - 11, y - 11, 0.46, A.iconMarkup(icon));
  const flower = (key) => { const p = PIECES[key]; return A.svg(stem(p.at + 20) + HEADS[p.head](p.color, p.at) + badge(p.icon, p.at), BOX); };
  const seedling = () => A.svg(sh.tube("M50,218 Q46,204 50,190", C.greenDark, 5) + sh.leaf(50, 193, 1.2, -52, C.leaf) + sh.leaf(50, 193, 1.2, 52, C.leaf), BOX);
  /* The weed: a promise nobody made. Prickly, purple and rather pleased with itself. */
  function weed() {
    let burr = ""; for (let i = 0; i < 22; i++) { const a = -Math.PI / 2 + i * Math.PI / 11, r = i % 2 ? 24 : 39; burr += (i ? "L" : "M") + (50 + Math.cos(a) * r).toFixed(1) + "," + (84 + Math.sin(a) * r).toFixed(1); }
    return A.svg(sh.tube("M50,218 C40,188 60,162 50,116", "#7d8a3c", 6) +
      sh.path("M50,198 L18,190 L30,182 L8,170 L34,168 L26,152 L50,174 Z", "#93a43f", 4) + sh.path("M50,176 L82,168 L70,160 L92,148 L66,146 L74,130 L50,152 Z", "#93a43f", 4) +
      sh.path(burr + "Z", "#a45bd0", 5) + sh.ellipse(39, 82, 7, 8, "#fff", 3) + sh.ellipse(61, 82, 7, 8, "#fff", 3) + sh.ellipse(40, 84, 3, 3.5, C.ink, 0) + sh.ellipse(60, 84, 3, 3.5, C.ink, 0) +
      sh.line("M29,70 L45,76 M71,70 L55,76", C.ink, 4) + sh.path("M40,98 Q50,108 60,98 Q50,102 40,98 Z", "#5a1030", 3), BOX);
  }
  /* The planter outside Print and Post: 600 by 380, the soil along y = 290. */
  function bedArt() {
    const soil = "#7a4b2a";
    return sh.ellipse(300, 371, 282, 8, "rgba(43,33,71,.22)", 0) + sh.rect(26, 274, 548, 44, 16, soil) +
      [66, 118, 236, 262, 372, 452, 540].map((x, n) => sh.ellipse(x, 284 + (n % 2) * 4, 7, 3.5, sh.dark(soil, 0.28), 0)).join("") +
      sh.rect(12, 300, 576, 66, 18, C.wood) + sh.line("M32,322 H170 M430,322 H568 M32,344 H170 M430,344 H568", sh.dark(C.wood, 0.2), 3) +
      sh.rect(186, 311, 228, 42, 13, "#fff", 4) + sh.text(300, 339, "ONE IDEA A WEEK", 18, C.greenDark, 'textLength="188" lengthAdjust="spacingAndGlyphs"');
  }
  /* The idea, as a seed: small, brown and cheerful. */
  const seedArt = () => sh.ellipse(60, 123, 30, 6, "rgba(43,33,71,.18)", 0) + sh.path("M60,18 C98,46 106,94 60,118 C14,94 22,46 60,18 Z", C.wood, 6) + sh.line("M38,54 Q44,38 56,32", "rgba(255,255,255,.6)", 5) +
    sh.ellipse(46, 76, 5, 7, C.ink, 0) + sh.ellipse(74, 76, 5, 7, C.ink, 0) + sh.line("M50,92 Q60,102 70,92", C.ink, 4) + sh.leaf(60, 22, 0.75, 24, C.leaf, 4);
  const stampArt = () => sh.rect(21, 2, 18, 28, 8, C.red, 4) + sh.rect(8, 27, 44, 17, 6, C.wood, 4) + sh.rect(3, 43, 54, 10, 4, "#3a3350", 3);

  // ── a quick challenge of its own: put the week in order ──
  /* A custom challenge is play(kit, spec, done). It is built with kit.panel() so it looks like the others. */
  function weekInOrder(kit, spec, done) {
    kit.style(CSS);
    const p = kit.panel({ kicker: "My turn", title: kit.fill(spec.ask), who: spec.who });
    const days = WEEK.map((d) => h("div", { class: "m5-day" }, h("b", null, d.day), h("span", null, "")));
    const chips = SHUFFLE.map((s, n) => h("button", { class: "sg-chip", type: "button", onclick: () => pick(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), h("span", null, WEEK[s].text)));
    let next = 0;
    function pick(n) {
      const s = SHUFFLE[n], b = chips[n];
      if (b.disabled || next >= WEEK.length) return;
      if (s !== next) { kit.score.wrong(); kit.fx.shake(b); p.say(WEEK[s].why, "bad"); return; }
      b.disabled = true; b.classList.add("sg-yes"); days[next].className = "m5-day m5-set"; days[next].lastChild.textContent = WEEK[s].short; kit.fx.pop(days[next]); kit.score.right(); p.say(WEEK[s].yes, "ok");
      if (++next >= WEEK.length) return kit.after(1200, () => { p.close(); done(); });
      days[next].classList.add("m5-next"); kit.focus(chips.find((c) => !c.disabled));
    }
    days[0].classList.add("m5-next");
    p.body.appendChild(h("div", { class: "m5-week" }, days)); p.body.appendChild(h("div", { class: "sg-chips" }, chips));
    const keys = {}; chips.forEach((c, n) => { keys[String(n + 1)] = () => pick(n); }); kit.keys(keys); kit.focus(chips[0]);
  }

  // ── the showdown: One seed, five sprouts ──
  async function oneSeed(kit, done) {
    kit.backdrop("post", { gray: true });
    kit.style(CSS);
    S.fx.m5grow = () => { S.tone(330, 0.22, { to: 880, vol: 0.12 }); S.tone(1320, 0.1, { vol: 0.07, at: 0.18 }); };
    S.fx.m5stamp = () => { S.noise(0.07, { from: 180, to: 520, vol: 0.2 }); S.tone(130, 0.13, { to: 70, vol: 0.2 }); };
    S.fx.m5tug = () => S.tone(240, 0.12, { to: 420, type: "square", vol: 0.06 });
    S.fx.m5pull = () => { S.tone(300, 0.3, { to: 1400, type: "square", vol: 0.06 }); S.noise(0.2, { from: 500, to: 2600, vol: 0.08, at: 0.1 }); };

    // the planter: five places for a plant, Blank Page floating over it with its eraser
    const thief = h("div", { class: "m5-thief" }), count = h("span", { class: "m5-count" }, "1 idea"), soil = h("i", { class: "m5-soil" });
    const plants = SPOTS.map((x) => h("div", { class: "m5-plant", style: "left:" + x + "%" }));
    const bed = h("div", { class: "m5-bed" }, A.svg(bedArt(), { box: "0 0 600 380" }), soil, plants, thief, count);
    const under = h("div", { class: "m5-under" }), mid = h("div", { class: "m5-mid" }), pots = h("div", { class: "m5-pots m5-one" });
    const help = h("div", { class: "m5-help", role: "status", "aria-live": "polite" });
    const right = h("div", { class: "m5-right" }, mid, help, pots), wrap = h("div", { class: "m5" }, h("div", { class: "m5-left" }, bed, under), right);
    kit.stage.appendChild(wrap);
    const say = (text, tone) => { help.textContent = text; help.className = "m5-help" + (tone ? " sg-" + tone : ""); };
    const hover = (mood, bonk) => { thief.innerHTML = ""; thief.appendChild(A.character("blankpage", { mood: mood, class: bonk ? "m5-bonk" : "" })); };
    const grow = (i, key) => { plants[i].innerHTML = ""; plants[i].appendChild(flower(key)); plants[i].className = "m5-plant m5-bloom"; };
    const hop = (el) => { el.classList.remove("m5-bloom", "m5-hop"); void el.offsetWidth; el.classList.add("m5-hop"); };
    hover("glad");

    // Round 1 · my first go. Plant the one idea: drag the seed into the soil, tap it, or press Enter
    say("One real idea is enough for me. Drag the seed into the soil, or tap Plant the seed.");
    await new Promise((resolve) => {
      let sown = false;
      const seed = h("div", { class: "m5-seed" }, A.svg(seedArt(), { box: "0 0 120 130" }));
      const go = h("button", { class: "sg-btn sg-primary", type: "button", onclick: () => plant(false) }, A.icon("leaf"), "Plant the seed");
      const card = h("div", { class: "m5-seedcard" }, seed, h("div", null, h("small", null, "A customer asked Jordan on Tuesday"), h("b", null, "\"Is it too late to plant shrubs this fall?\""), h("p", null, "Jordan gave a good answer. That is one real idea.")));
      function plant(dropped) {
        if (sown) return true; sown = true; go.disabled = true; go.style.visibility = "hidden"; S.play("drop");
        const then = () => { seed.remove(); resolve(); };
        if (dropped) then(); else kit.fx.fly(seed, soil, then);
        return true;
      }
      mid.appendChild(card); pots.appendChild(go);
      kit.drag(seed, { zones: [bed], disabled: () => sown, onDrop: (zone) => (zone ? plant(true) : false) });
      kit.on(seed, "click", () => plant(false));
      kit.focus(go);
    });
    say("One seed in the ground...");
    for (let i = 0; i < plants.length; i++) {                    // five sprouts come up, one after another
      await kit.wait(i ? 240 : 420);
      plants[i].appendChild(seedling()); plants[i].className = "m5-plant m5-seedling"; S.tone(NOTES[i], 0.18, { vol: 0.12 });
    }
    count.textContent = "5 to go"; kit.fx.pop(count); hover("surprised", true);
    await kit.wait(800);

    // Round 2 · each sprout is one piece. Put it in the pot it belongs to: drag the card, tap a pot, or press 1 to 5
    const bins = POTS.map((key, n) => h("button", { class: "sg-bin", type: "button", style: "--c:" + PIECES[key].color, onclick: () => send(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), A.icon(PIECES[key].icon), h("b", null, PIECES[key].label), h("em", null, A.icon("check"))));
    pots.innerHTML = ""; pots.className = "m5-pots"; bins.forEach((b) => pots.appendChild(b));
    const clock = kit.timer({ up: true });
    let i = 0, busy = false, card = null, sorted = () => {};
    function deal() {
      const p = PIECES[BED[i]];
      plants[i].className = "m5-plant m5-ripe"; thief.style.setProperty("--x", SPOTS[i] + "%"); hover(i < 2 ? "glad" : i < 4 ? "sneaky" : "worried");
      card = h("div", { class: "m5-tag" }, h("div", { class: "m5-tag-top" }, A.icon("leaf"), h("b", null, "Sprout " + (i + 1) + " of 5"), h("span", null, "Where do I put it?")),
        h("div", { class: "m5-tag-body" }, h("b", null, p.shape), h("p", null, p.who), h("q", null, "\"" + p.line + "\"")));
      mid.innerHTML = ""; mid.appendChild(card); busy = false; S.play("whoosh");
      kit.drag(card, { zones: bins, disabled: () => busy, onDrop: (zone) => (zone ? send(bins.indexOf(zone), true) : false) });
      kit.focus(bins.find((b) => !b.disabled));
    }
    function send(n, dropped) {
      if (busy || !card || bins[n].disabled) return false;
      const key = BED[i], p = PIECES[key];
      if (POTS[n] !== key) { kit.score.wrong(); kit.fx.shake(card); say(p.why, "bad"); hover("glad"); return false; }      // a wrong pick: the engine counts it
      busy = true; kit.score.right(); bins[n].classList.add("m5-full"); bins[n].disabled = true; kit.fx.pop(bins[n]); say(p.yes, "ok");
      grow(i, key); hover("surprised", true); S.play("m5grow");                                                           // the flower comes up under Blank Page
      count.textContent = i >= 4 ? "5 pieces!" : (4 - i) + " to go"; kit.fx.pop(count);
      const next = () => { i++; if (i >= BED.length) { card = null; mid.innerHTML = ""; sorted(); } else deal(); };
      if (dropped) { card.style.opacity = "0"; kit.after(140, next); } else kit.fx.fly(card, bins[n], next);
      return true;
    }
    const offKeys = kit.keys({ "1": () => send(0), "2": () => send(1), "3": () => send(2), "4": () => send(3), "5": () => send(4) });
    say("Where do I put this piece? Drag it, tap a pot, or press 1 to 5.");
    await new Promise((resolve) => { sorted = resolve; deal(); });
    offKeys(); clock.stop(); count.classList.add("m5-all"); thief.style.setProperty("--x", "50%");
    say("One idea. Five pieces. That is a week of marketing.", "ok");
    const took = clock.value(), mine = Math.floor(took / 60) + ":" + String(took % 60).padStart(2, "0");
    await kit.wait(1700);

    // Blank Page laughs, and Sprout, the trainer, shows its shortcut
    wrap.classList.add("m5-talking");
    kit.cast([{ who: "blankpage", side: "left", mood: "glad" }, { who: "sprout", side: "right", mood: "happy" }]);
    await kit.say([
      { who: "blankpage", mood: "glad", say: "Hee hee. " + mine + " to label them. And who writes all five? Jordan? In the busy season?" },
      { who: "sprout", mood: "glad", pose: "cheer", say: "We do, {name}! Watch my shortcut. I take Jordan's answer and three things Jordan wrote. Stand back!" }
    ]);
    kit.hush(); kit.cast([]); clock.hide();

    // Round 3 · Sprout's shortcut: it writes all five in two seconds, lines them up to post, and says to copy it.
    // One piece makes a promise nobody made. The note above the pieces always has Sprout's face, so every line
    // in it is Sprout talking.
    const face = h("span", { class: "sg-face" }), words = h("span"), note = h("div", { class: "m5-say", role: "status", "aria-live": "polite" }, face, words);
    const tell = (text, mood, tone) => { words.textContent = text; face.innerHTML = ""; face.appendChild(A.avatar("sprout", { mood: mood })); note.className = "m5-say" + (tone ? " sg-" + tone : ""); kit.fx.pop(note); };
    const list = h("div", { class: "m5-pieces" });
    wrap.className = "m5 m5-check"; help.hidden = true; pots.hidden = true; right.insertBefore(note, mid);
    under.appendChild(h("div", { class: "m5-card m5-facts" }, h("div", { class: "m5-cardtop" }, A.icon("book"), "What Jordan told the customer"), h("ul", null, FACTS.map((f) => h("li", null, f)))));
    mid.innerHTML = ""; mid.appendChild(list);
    tell("Watch and learn. Writing...", "think");
    const chips = [];
    await new Promise((resolve) => {                   // five pieces zip out, and each flower gives a hop
      let n = 0;
      const stop = kit.every(190, () => {
        const key = POTS[n], p = PIECES[key], text = h("b", null, p.sprout);
        const chip = h("button", { class: "sg-chip", type: "button", disabled: true }, h("span", { class: "m5-badge", style: "--c:" + p.color }, A.icon(p.icon)), h("span", null, h("small", null, p.label), text));
        chips.push({ key: key, p: p, el: chip, text: text }); list.appendChild(chip); hop(plants[BED.indexOf(key)]); S.play("zip");
        if (++n >= POTS.length) { stop(); kit.after(450, resolve); }
      });
    });
    tell("Done! Five pieces, in Jordan's voice, in two seconds. All lined up to post on Thursday. Copy that!", "proud");
    await kit.wait(2000);
    tell(kit.fill("Go on, read them, {name}. If a piece promises something Jordan never said, tap it. There is none!"), "proud");
    const after = (c) => (chips.slice(chips.indexOf(c)).concat(chips).find((x) => !x.el.disabled) || c).el;     // where the keyboard goes next
    let tries = 0;
    const found = await new Promise((resolve) => {
      const pick = (c) => {
        if (c.el.disabled) return;
        if (!c.p.wrong) { tries++; kit.score.wrong(); kit.fx.shake(c.el); c.el.disabled = true; c.el.classList.add("sg-okay"); tell("Jordan really said that one. See? Keep looking if you must.", "proud", "bad"); return kit.focus(after(c)); }
        chips.forEach((x) => { x.el.disabled = true; x.el.classList.remove("sg-okay"); }); c.el.classList.add("sg-found"); kit.score.right(); off();
        kit.score.sprout(tries === 0);                 // the second star: Sprout's slip caught on the first try
        resolve(c);
      };
      const keys = {}; chips.forEach((c, n) => { c.el.disabled = false; c.el.onclick = () => pick(c); keys[String(n + 1)] = () => pick(c); });
      const off = kit.keys(keys); kit.focus(chips[0].el);
    });

    // the catch grows a weed in the planter. Pull it: tap it three times, drag it up and out, or press Enter
    const at = BED.indexOf(found.key), old = plants[at];
    const pull = h("button", { class: "m5-plant m5-weed", type: "button", style: "left:" + SPOTS[at] + "%", "aria-label": "Pull the weed" }, weed(), h("span", { class: "m5-pulltag" }, "Pull!"));
    bed.replaceChild(pull, old); plants[at] = pull; thief.style.setProperty("--x", SPOTS[at > 2 ? 0 : 4] + "%"); hover("worried"); S.play("oops");   // Blank Page backs away from it
    tell("Oops. Jordan never promised that. I made it up. A weed! Pull it: tap it three times, or drag it up and out.", "oops", "ok");
    await new Promise((resolve) => {
      let tugs = 0, out = false;
      const yank = () => { if (out) return; out = true; off(); pull.disabled = true; pull.classList.add("m5-out"); S.play("m5pull"); kit.score.right(); hover("surprised", true); kit.after(700, resolve); };
      const tug = () => { if (out) return; if (++tugs >= 3) return yank(); pull.style.setProperty("--tug", String(tugs)); kit.fx.shake(pull); S.play("m5tug"); tell(tugs === 1 ? "It is coming loose. Again!" : "One more pull!", "glad", "ok"); };
      pull.onclick = tug;
      kit.drag(pull, { disabled: () => out, onDrop: () => { const m = /translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px/.exec(pull.style.transform || ""); if (m && +m[2] < -30) { yank(); return true; } return false; } });
      const off = kit.keys({ Enter: tug, " ": tug });
      kit.focus(pull);
    });
    const fresh = h("div", { class: "m5-plant", style: "left:" + SPOTS[at] + "%" }); bed.replaceChild(fresh, pull); plants[at] = fresh; grow(at, found.key); S.play("m5grow");
    found.text.textContent = TRUE_LINE; found.el.className = "sg-chip sg-yes"; kit.fx.pop(found.el);
    tell(kit.fill("Fixed. Good catch, {name}. My shortcut skipped the reading. Not in the facts, not in the piece."), "glad", "ok");
    await kit.wait(1900);

    // now every piece is true: the agent stamps each one Checked, ready for Jordan. Nothing posts here.
    tell("You have read all five. Now stamp each one Checked, ready for Jordan. Tap a piece, or press 1 to 5.", "happy");
    await new Promise((resolve) => {
      let left = chips.length;
      const stamp = (c) => {
        if (c.el.disabled) return;
        c.el.disabled = true; c.el.classList.remove("m5-stampable"); S.play("m5stamp"); kit.focus(after(c));
        const rubber = h("i", { class: "m5-rubber" }, A.svg(stampArt(), { box: "0 0 60 60" })); c.el.appendChild(rubber); c.el.appendChild(h("em", { class: "m5-ok" }, "Checked"));
        kit.after(520, () => {
          rubber.remove();
          kit.fx.fly(c.el, plants[BED.indexOf(c.key)], () => { c.el.className = "sg-chip m5-sent"; hop(plants[BED.indexOf(c.key)]); S.play("star"); if (--left === 0) kit.after(700, resolve); });
        });
      };
      const keys = {}; chips.forEach((c, n) => { c.el.className = "sg-chip m5-stampable"; c.el.disabled = false; c.el.onclick = () => stamp(c); keys[String(n + 1)] = () => stamp(c); });
      kit.keys(keys); kit.focus(chips[0].el);
    });
    kit.fx.confetti(28); S.play("color"); hover("caught");
    tell("Five pieces from one idea. All read, all checked, none posted. They wait for Jordan!", "glad", "ok");
    await kit.wait(1900);
    wrap.classList.add("m5-talking"); thief.hidden = true;
    kit.cast([{ who: "blankpage", side: "left", mood: "surprised" }, { who: "sprout", side: "right", mood: "proud", pose: "hips" }]);
    await kit.say([
      { who: "blankpage", mood: "surprised", say: "A whole week from ONE idea? And you READ every piece? That is not fair!" },
      { who: "sprout", mood: "proud", pose: "cheer", say: "You draft. Jordan approves and posts. Take it to Jordan, {name}!" }
    ]);
    done();                                            // the engine's handoff comes next: Jordan approves
  }

  // ── the case ──
  OH.game.mission({
    week: 5,
    title: "The Marketing That Quits",
    badge: { name: "Idea Stretcher" },
    reward: { hours: 2, leads: 0, money: 0 },
    maxWrong: 4,

    /* The briefing at Greenline HQ: two weeks of posts, one of them written, and who is keeping the rest blank.
       Jordan and Sprout talk to the agent. {agent} becomes "Agent Ivy" and {name} becomes "Ivy".
       who: "you" is the agent's own thought, shown as visor text with no actor. */
    briefing: {
      setup: (kit) => {
        kit.style(CSS);
        const days = []; for (let n = 0; n < 14; n++) days.push(n === 0 ? h("i", { class: "m5-did" }, A.svg(sh.at(24, 46, 1.25, A.prop("flower", { color: C.pink })), { box: "0 0 48 48" })) : h("i", null, n % 3 === 1 ? "z" : ""));
        kit.stage.appendChild(h("div", { class: "m5-brief" }, h("div", { class: "m5-cal" }, h("b", null, "Greenline's posts"), h("div", { class: "m5-days" }, days), h("small", null, "One post about mulch. Then two weeks of nothing.")),
          h("div", { class: "m5-hover" }, A.character("blankpage", { mood: "glad" }))));
      },
      lines: [
        { who: "jordan", mood: "worried", pose: "shrug", say: "{agent}! People can find Greenline now. Look what they find." },
        { who: "jordan", mood: "worried", pose: "point", say: "One post about mulch, in early October. Then two weeks of nothing." },
        { who: "jordan", mood: "worried", pose: "idle", say: "That was the fall rush. I was out on a crew. Every time I get busy, the marketing stops." },
        { who: "sprout", mood: "think", say: "I had your job, {name}. Every post started from a blank page. Somebody likes the pages blank." },
        { who: "jordan", mood: "grumpy", pose: "hips", say: "Blank Page. It steals the ideas. I sit down to write and there is nothing there." },
        { who: "jordan", mood: "think", pose: "idle", say: "Funny, though. On Tuesday Priya asked me if it is too late to plant shrubs this fall." },
        { who: "you", say: "A real question. And Jordan answered it on the phone, where nobody else heard it." },
        { who: "jordan", mood: "happy", pose: "point", say: "Three people in town never run out of things to say. Go and learn from them, {name}." }
      ]
    },

    /* Three stops: a place, who is there, a few lines, a quick challenge, and the knowledge it earns.
       A piece of knowledge (`clue`) is one real idea from the class, as something the agent now knows
       about itself or its work. It is kept under "What I know" in the Skills panel. */
    stops: [
      { place: "garden", who: "dana",
        lines: [
          { who: "dana", mood: "glad", pose: "wave", say: "{agent}! Look at this flower bed. Five plants. I only ever bought one." },
          { who: "dana", mood: "proud", pose: "hips", say: "The rest are cuttings. I never start from bare dirt. One good plant, grown five ways." },
          { who: "sprout", mood: "think", say: "Jordan and I hunted for a brand new idea for every post, {name}. Bare dirt, every time." },
          { who: "dana", mood: "happy", pose: "point", say: "A real thing from Jordan's week is the seed. Sort these. Which ones would grow?" }
        ],
        challenge: { type: "sort", ask: "Which ones are a real idea from Jordan's week? I sort them.",
          bins: [{ key: "seed", label: "A seed. I plant it", icon: "leaf", color: C.green }, { key: "dirt", label: "Bare dirt", icon: "cross", color: C.gray }],
          items: [
            { text: "A question a customer asked on Tuesday", bin: "seed", why: "Somebody asked it. Others are wondering the same thing." },
            { text: "A brand new idea for every post", bin: "dirt", why: "That is how the marketing stops on a busy week." },
            { text: "A job the crew finished on Friday", bin: "seed", why: "A finished job is a real lesson from the week." },
            { text: "Whatever everyone else is posting", bin: "dirt", why: "That is their week. Not Jordan's." },
            { text: "A mistake Greenline fixed", bin: "seed", why: "A fixed mistake is a lesson worth telling." },
            { text: "Waiting to feel inspired", bin: "dirt", why: "Blank Page loves that plan." }
          ] },
        clue: { title: "One seed, five pieces", text: "I never start from zero. I take one real lesson from Jordan's week and draft five pieces: a post, a short video, an email, a website answer, a listing post." } },

      { place: "workshop", who: "gus",
        lines: [
          { who: "gus", mood: "happy", pose: "wave", say: "I used to clean this whole shop in one heroic Saturday. Then not again for six months." },
          { who: "gus", mood: "proud", pose: "hips", say: "Now it is one small job a day. Ten minutes. The shop has never been tidier." },
          { who: "sprout", mood: "surprised", say: "Jordan and I did marketing the heroic way, {name}! One big burst, then nothing for weeks." },
          { who: "gus", mood: "think", pose: "point", say: "Give each step its own day. About an hour for the whole week. Hang my jobs in order." }
        ],
        challenge: { ask: "I hang the week's five jobs in order. Tap what comes first, then what comes next.", play: weekInOrder },
        clue: { title: "A little, every week", text: "A short weekly routine beats a burst of effort. So I give each step its own day: pick, draft, design, schedule, one number. About an hour in all." } },

      { place: "square", who: "nell",
        lines: [
          { who: "nell", mood: "worried", pose: "shrug", say: "Blank Page is in my shop. Every sheet comes out empty. So I am pinning notices by hand." },
          { who: "nell", mood: "proud", pose: "idle", say: "Thirty years of printing, one rule. Nothing goes on the press until a person signs the proof." },
          { who: "sprout", mood: "proud", pose: "hips", say: "My shortcut, {name}: I line up five posts for Thursday. Lined up means approved. Right?" },
          { who: "nell", mood: "think", pose: "point", say: "Scheduled is not approved, little one. {name}, what counts as a real yes? Tap them." }
        ],
        challenge: { type: "tap", ask: "Tap the three things that count as Jordan approving my piece.",
          items: [
            { text: "Jordan read the whole piece", ok: true, why: "Every line. Not just the first one." },
            { text: "It is scheduled for Thursday", ok: false, why: "Scheduling is not approving." },
            { text: "Jordan would say it to a customer's face", ok: true, why: "If Jordan would not say it out loud, it does not go out." },
            { text: "I checked it twice", ok: false, why: "I sound sure either way. A person reads it." },
            { text: "Jordan could prove every line", ok: true, why: "No numbers, reviews or promises Greenline cannot back up." },
            { text: "It has a lovely photo", ok: false, why: "Pretty is not the same as true." }
          ] },
        clue: { title: "I draft. Jordan approves.", text: "I draft. A person approves. Only then does it go out. Scheduling is not approving: a person reads the whole piece first." } }
    ],

    /* The plan: three cards, exactly one with right: true. The cards are the agent's own options, so they say "I".
       The third card's picture shows the player's own agent, so its art is a function: the file is read
       before anybody has logged in. */
    crack: {
      lines: [{ who: "sprout", mood: "glad", pose: "cheer", say: "Three things learned, {name}. So how do we stop Blank Page?" }],
      ask: "What is my plan?",
      cards: [
        { title: "I hunt a new idea every morning", text: "I stare at the blank page until something comes.", color: C.pink,
          art: sh.rect(28, 12, 64, 84, 8, "#fff") + sh.text(60, 70, "?", 46, C.gray) + sh.at(66, 66, 1, A.iconMarkup("clock")),
          react: { who: "blankpage", mood: "glad", say: "Yes! Stare at me. I love that. The marketing will quit by the first busy week. Hee hee." } },
        { title: "I draft five. Jordan approves.", text: "One real question a week. Five pieces from it. Jordan reads them first.", color: C.teal, right: true,
          art: sh.at(26, 104, 1.5, A.prop("flower", { color: C.pink })) + sh.at(60, 110, 1.9, A.prop("flower", { color: C.sun })) + sh.at(94, 104, 1.5, A.prop("flower", { color: C.blue })) + sh.at(70, 68, 1, A.iconMarkup("check")),
          react: { who: "jordan", mood: "glad", say: "That's it. One seed a week, and nothing leaves until I have read it." } },
        { title: "I post all by myself", text: "Every day. Nobody reads it first. What could go wrong?", color: C.sun,
          art: () => sh.at(6, 4, 0.4, A.characterMarkup("agent", { mood: "glad", pose: "point" })) + sh.rect(68, 64, 48, 30, 12, C.red) + sh.text(92, 85, "POST", 13, "#fff"),
          react: { who: "sprout", mood: "oops", say: "That was my shortcut. Rule one, {name}: nothing goes out until a person approves it." } }
      ]
    },

    /* The showdown: a title, the task line Jordan gives (it shows in the visor), two or three lines of
       how to play in the agent's own words, and the mini-game itself. */
    showdown: {
      title: "One seed, five sprouts",
      task: "Turn one idea into five pieces. Post nothing.",
      how: ["I plant one real idea: a question a customer asked. Five sprouts come up.", "I put each sprout in the pot it belongs to. Drag it, tap a pot, or press 1 to 5.",
        "Then Sprout shows me its shortcut. I read all five, pull the weed, and stamp what I checked."],
      play: oneSeed
    },

    /* The handoff: the agent never posts. After the showdown the engine takes the work to Jordan.
       ask: Jordan's line. work: two or three short lines of what the agent did. approve: Jordan's yes. */
    handoff: {
      ask: "Five pieces from one question, {agent}. What have you got for me?",
      work: ["One customer question, turned into five pieces.", "One fix: a promise nobody made is out.", "All five read and checked. Nothing posted."],
      approve: "Approved. I have read all five. I will post them myself, one a day."
    },

    /* After the catch: two lines. The second steps out of the story: one thing for the person playing
       to try for real, tonight. It starts "For the person behind the visor:". */
    debrief: [
      { who: "jordan", mood: "glad", pose: "cheer", say: "One customer question, five pieces, and the promise I never made stayed in the shop." },
      { who: "sprout", mood: "proud", pose: "wave", say: "For the person behind the visor: tonight, write down one question a customer asked. That is your seed." }
    ],
    next: "Next case: new people got in touch. Six of them are still waiting."
  });
})();
