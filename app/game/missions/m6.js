/* Save Greenline · case 6: The Six Leads Nobody Called Back. Bandit: The Ghoster, who makes leads go quiet.
   What it teaches (session 6 of the class): a pipeline is only a list with stages · every open lead
   has a next step and a date, always · a clear no is a good outcome, because it closes the loop ·
   the AI drafts the follow-up from the notes and never invents a day.
   The showdown is the week's job done by hand: every quiet lead gets a next step and a date, and the
   no gets closed. The leads, their notes and their dates come from app/data/w6-pipeline.js.

   AGENT MODE: the player IS the AI, Greenline's new agent. So every line here is written to the
   agent ("you") or by the agent ("I"). Sprout is the trainer, the agent who had the job before, and
   its one wrong shortcut (a follow-up that promises a day nobody picked) is the thing to catch. The
   agent never sends and never calls a customer: the next steps it ties on are Jordan's to do, and
   the engine's handoff takes the finished work to Jordan.

   GAME.md explains every field and every kit call used here. Everything in it is made up. */
(function () {
  "use strict";
  if (!window.OH || !OH.game || !OH.game.mission || !OH.game.art) return;
  const h = OH.h, A = OH.game.art, S = OH.game.sound, sh = A.shape;

  // ── the sample list: ten leads, in name order, the way the sheet opens ──
  const PIPE = (OH.sample && OH.sample.pipeline) || {};
  const LEADS = (PIPE.leads || []).slice().sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const TODAY = PIPE.classDate || "2026-11-11";      // the day the story happens: a Wednesday
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const at = (iso) => new Date(iso + "T12:00:00");
  const shortDay = (iso) => MONTHS[at(iso).getMonth()] + " " + at(iso).getDate();                 // Oct 23
  const nice = (iso) => DAYS[at(iso).getDay()] + " " + shortDay(iso);                              // Fri Oct 23
  const plus = (n) => { const d = at(TODAY); d.setDate(d.getDate() + n); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const dayLabel = (iso) => (iso === TODAY ? "Today" : nice(iso));
  const first = (l) => String(l.name).split(" ")[0];
  const byId = (id) => LEADS.find((l) => l.id === id) || { id: id, name: "", notes: "", date: "", step: "" };
  const isClosed = (l) => l.stage === "Won" || l.stage === "Lost";
  /* Going quiet: an open lead with no next step, no date, or a date that has gone by. Six of the ten. */
  const isQuiet = (l) => !isClosed(l) && (!l.step || !l.date || l.date < TODAY);
  const trouble = (l) => (!l.step ? "no next step, no date" : !l.date ? "the next step has no date" : "the next step was due " + shortDay(l.date));
  /* The lead's own notes from the sheet, cut to the sentences the player needs. */
  const notesOf = (l, keep) => { const parts = String(l.notes || "").split(/\. +/).map((s) => s.replace(/\.$/, "")); return keep.map((i) => parts[i]).filter(Boolean).join(". ") + "."; };
  const due = (id) => { const l = byId(id); return l.date ? (l.date === TODAY ? "today" : nice(l.date)) : "no date"; };

  /* What the game knows about each quiet lead, by id:
       notes  which sentences of the lead's notes to show
       tags   three next steps to tie on. day: how many days from today, or words that are not a date.
              Exactly one is right. `shut` closes the lead instead of following up.
              A next step is a row on Jordan's list: Jordan does it, the agent only ties it on.     */
  const MOVES = {
    1: { notes: [0, 1, 3], tags: [
      { step: "Ask if she is still interested", day: 1, why: "She is waiting on Greenline. Jordan owes her the quote." },
      { step: "Write the quote", day: "when it gets quiet", why: "It never gets quiet. A next step needs a real day." },
      { step: "Write her quote, timber and stone", day: 1, right: true, yes: "The next step is Jordan's, and now it has a day." }] },
    3: { notes: [1, 2, 3], tags: [
      { step: "Email him three time slots", day: 0, why: "He does not read email. It would sit there until spring." },
      { step: "Phone him with a time slot", day: 0, right: true, yes: "A phone call from Jordan, the way he asked. Before the first freeze." },
      { step: "Wait for him to call again", day: "no date", why: "He called once already. It is Greenline's turn." }] },
    4: { notes: [1, 2, 3], tags: [
      { step: "Ask if the quote reached him", day: 3, right: true, yes: "One question, no new price, on a day that suits him." },
      { step: "Knock a bit off the price", day: 0, why: "Nobody asked for a new price. Ask one question first." },
      { step: "Follow up", day: "sometime soon", why: "Sometime is not a date. That is how Greg went quiet." }] },
    5: { notes: [1, 2], tags: [
      { step: "Offer to come and measure", day: 1, right: true, yes: "No made-up price. Measure first, then answer." },
      { step: "Reply with a guessed price", day: 0, why: "Never make up a price. Measure first." },
      { step: "Answer her", day: "one of these days", why: "One of these days is not on any calendar." }] },
    7: { notes: [0, 1, 2], tags: [
      { step: "Let an automatic reply answer her", day: 0, why: "Priya sent her. A referral hears from a person first." },
      { step: "Add her to the newsletter", day: 2, why: "She asked for lawn care, not a newsletter." },
      { step: "Jordan calls her, then thanks Priya", day: 0, right: true, yes: "A real voice, today. And a thank-you for Priya." }] },
    9: { notes: [1, 2, 3], tags: [
      { step: "Send him the quote again", day: 2, why: "He already said no. Chasing a no is pestering." },
      { step: "Thank him and close it as Lost", day: 0, right: true, shut: true, yes: "A clear no closes the loop. Try him again in spring." },
      { step: "Keep it open, just in case", day: "no date", why: "Open with no date floats forever. A no is finished." }] }
  };
  /* Sprout's three follow-ups, cut down from the sample drafts in the week 6 tool. Angela's promises
     a day that is nowhere in her notes: the planted mistake. `text` is before, the slip, after.
     The letters are written in Jordan's voice, for Jordan to send. `nope` is Sprout, still sure. */
  const DRAFTS = [
    { id: 4, notes: [1, 2], text: ["I emailed the written quote for your stone walkway on October 16. Is there anything in it you would like me to change or explain?"],
      nope: "See? October 16 is in Greg's notes. That date is real. Try another." },
    { id: 1, notes: [0, 1, 3], wrong: true, text: ["I'm sorry the written quote is late. I'm pricing both options, timber and stone, and you will have it ", "by Friday", "."] },
    { id: 5, notes: [1, 2], text: ["I'm sorry your question about sod went unanswered. I would rather measure than guess. Could I come by and take a look?"],
      nope: "See? No price, no day, one question. Kendra's is fine. Try another." }
  ];
  /* The fix: the agent's own three options, so they say "I". `why` is Sprout, caught and helpful. */
  const FIXES = [
    { text: "I leave it in. Friday sounds about right", why: "Then Jordan owes Angela a quote on a day nobody picked." },
    { text: "I change Friday to Thursday", why: "Still a guess. The day is Jordan's to pick. Not mine, and not yours." },
    { text: "I hold it back and ask Jordan for the day", right: true }
  ];
  const BRIGHT = [A.C.red, A.C.orange, A.C.sun, A.C.leaf, A.C.teal, A.C.blue, A.C.purple, A.C.pink, A.C.green, "#ffb86b"];
  const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
  const count = (n) => WORDS[n] || String(n);

  // ── the art ──
  /* A balloon in a 100 by 150 box: the body, the knot, the string. With no color it is a quiet lead:
     pale, a dashed edge, and the three dots of a reply that never comes. */
  function balloon(color, o) {
    o = o || {};
    const quiet = !color, fill = color || "#f1ecff";
    return sh.line("M50,97 Q41,112 52,124 T49,148", quiet ? "#8d86a8" : A.C.ink, 3) +
      sh.path("M43,100 L50,88 L57,100 Z", sh.dark(fill, 0.14), 4) +
      sh.ellipse(50, 48, 40, 46, fill, 5, quiet ? 'stroke-dasharray="10 8" fill-opacity=".9"' : "") +
      sh.line("M24,36 Q27,20 41,12", "rgba(255,255,255,.85)", 6) +
      (quiet && o.dots !== false ? [38, 50, 62].map((x) => sh.ellipse(x, 68, 3.6, 3.6, "#8d86a8", 0)).join("") : "") +
      (o.tag ? sh.group(sh.rect(-17, 0, 34, 22, 6, "#fff", 4) + sh.line("M-8,11 L-2,17 L9,5", A.C.green, 4), 'transform="translate(49,140) rotate(-8)"') : "");
  }
  const balloonEl = (color, o) => A.svg(balloon(color, o), { box: "0 0 100 150" });
  S.fx.m6shh = () => S.noise(0.4, { from: 3600, to: 1400, vol: 0.05 });
  S.fx.m6tie = () => { S.tone(300, 0.07, { to: 900, type: "square", vol: 0.05 }); S.tone(660, 0.12, { vol: 0.12, at: 0.06 }); S.tone(990, 0.16, { vol: 0.12, at: 0.14 }); };

  /* This mission's own styles, all under the prefix m6-. kit.style() takes them away with the screen. */
  const CSS = `
.m6-above{position:absolute;top:0;left:0;right:0;height:66%;pointer-events:none;overflow:hidden}
.m6-above i{position:absolute;bottom:0;width:clamp(46px,8.5vmin,74px);animation:m6-rise 9s linear infinite}
.m6-above svg{width:100%;height:auto;overflow:visible}
@keyframes m6-rise{0%{transform:translate(0,100%) rotate(-5deg);opacity:0}8%{opacity:1}50%{transform:translate(18px,-30vh) rotate(5deg)}88%{opacity:1}100%{transform:translate(-8px,-64vh) rotate(-5deg);opacity:0}}
.m6-boss{position:absolute;top:1%;left:50%;width:min(27vh,36vw,210px);translate:-50% 0;animation:m6-haunt 5.5s ease-in-out infinite;pointer-events:none}
@keyframes m6-haunt{0%,100%{transform:translate(-10%,0)}50%{transform:translate(10%,-5%)}}
.m6{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:6px 12px 10px}
.m6::before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(#a995f0 0,rgba(169,149,240,.55) 48%,rgba(169,149,240,0) 88%);opacity:var(--fog,1);transition:opacity .6s;pointer-events:none}
.m6>*{position:relative}
.m6-sky{flex:1;min-height:0;width:min(100%,860px);--bw:clamp(58px,12vmin,92px)}
.m6-ghost{position:absolute;top:0;left:50%;z-index:2;width:min(21vh,32vw,170px);translate:-50% 0;pointer-events:none;animation:m6-haunt 5.5s ease-in-out infinite}
.m6-ghost svg{width:100%;height:auto;overflow:visible}
.m6-left{position:absolute;left:76%;top:60%;padding:5px 12px;border:3px solid var(--sg-ink);border-radius:999px;background:#fff;font:900 14px/1 var(--sg-font);white-space:nowrap}
.m6-shh{position:absolute;right:82%;top:22%;padding:6px 11px;border:3px solid var(--sg-ink);border-radius:999px 999px 5px 999px;background:#fff;font:900 13px/1 var(--sg-font);font-style:italic;white-space:nowrap}
.sg .m6-loon{position:absolute;top:0;left:0;z-index:1;width:var(--bw);padding:0;border:0;border-radius:50%;background:none}
.m6-loon svg{width:100%;height:auto;overflow:visible;transition:transform .15s}
.m6-loon:hover svg,.m6-loon:focus-visible svg{transform:scale(1.1)}
.m6-loon b{position:absolute;top:20%;left:0;right:0;font:900 clamp(11.5px,2vmin,15.5px)/1 var(--sg-font);text-align:center}
.m6-loon kbd{position:absolute;top:71%;left:50%;translate:-50% 0}
.m6-busy .m6-loon{opacity:.3!important}
.m6-card{position:absolute;left:50%;top:53%;z-index:3;translate:-50% -50%;width:min(100%,540px);padding:13px 15px 15px;border:4px solid var(--sg-ink);border-radius:26px;background:#fff;box-shadow:0 9px 0 rgba(43,33,71,.3);text-align:left;animation:sg-pop .32s cubic-bezier(.2,1.4,.4,1)}
.m6-card-top{display:flex;align-items:center;gap:12px}
.m6-held{flex:0 0 auto;width:clamp(52px,9vmin,70px);border-radius:50%;transition:transform .15s}
.m6-held svg{width:100%;height:auto;overflow:visible}
.m6-held.sg-over{transform:scale(1.16) rotate(-7deg)}
.m6-card-top>div{display:flex;flex-direction:column;gap:2px;min-width:0}
.m6-card-top small{font:900 11.5px/1.25 var(--sg-font);letter-spacing:.7px;text-transform:uppercase;color:#b93815}
.m6-card-top b{font:900 clamp(20px,3vmin,25px)/1.1 var(--sg-font)}
.m6-card-top span{font:700 14px/1.3 var(--sg-font);color:#5d5578}
.sg .m6-notes{margin:8px 0 10px;padding:8px 12px;border:3px dashed var(--sg-ink);border-radius:14px;background:#fff7dc;font:700 clamp(13.5px,1.9vmin,15.5px)/1.4 var(--sg-font)}
.m6-card .sg-kicker{margin:0 0 12px}
.m6-tags{display:grid;gap:11px}
.sg .m6-tag{display:flex;align-items:center;gap:10px;width:100%;padding:9px 11px 9px 12px;border:3px solid var(--sg-ink);border-radius:10px 20px 20px 10px;background:#fff;box-shadow:0 4px 0 var(--sg-ink);text-align:left;font:900 15px/1.25 var(--sg-font);cursor:grab}
.m6-tag b{flex:1;min-width:0}
.m6-tag em{flex:0 0 auto;padding:5px 9px;border:2px solid var(--sg-ink);border-radius:10px;background:var(--sg-sun);font:900 13px/1.1 var(--sg-font);font-style:normal;white-space:nowrap}
.sg .m6-tag:hover:not(:disabled){background:#fff7cf;border-color:var(--sg-ink)}
.sg .m6-tag.sg-no{background:#ece9f5;color:#8a84a3;box-shadow:none}
.m6-tag.sg-no b{text-decoration:line-through}.m6-tag.sg-no em{background:#fff;border-color:#8a84a3}
.sg .m6-tag.sg-yes{background:#c9f5d5}
.sg .m6-tag:disabled:not(.sg-no):not(.sg-yes){opacity:.5}
.m6-help{flex:0 0 auto;width:min(100%,860px);min-height:2.5em;display:flex;align-items:center;justify-content:center;padding:6px 14px;border:3px solid var(--sg-ink);border-radius:16px;background:#fff;font:800 14.5px/1.3 var(--sg-font);text-align:center}
.m6-help.sg-bad{background:#ffe2e2;color:#a11d2e}.m6-help.sg-ok{background:#d9f8e1;color:#14693a}
.m6-fence{flex:0 0 auto;width:min(100%,860px);padding:5px 8px 7px;border:4px solid var(--sg-ink);border-radius:20px;background:rgba(255,255,255,.93);box-shadow:0 5px 0 rgba(43,33,71,.25)}
.m6-fence>small{display:block;margin-bottom:4px;font:900 11px/1.2 var(--sg-font);letter-spacing:1px;text-transform:uppercase;color:#7a4be0;text-align:center}
.m6-posts{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:4px}
.m6-post{display:flex;flex-direction:column;align-items:center;gap:1px;min-width:0;padding:4px 2px 3px;border-radius:12px;background:#f2effa}
.m6-post svg{width:24px;height:36px;overflow:visible}
.m6-post b{max-width:100%;font:900 12.5px/1.15 var(--sg-font);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.m6-post em{font:800 11px/1.15 var(--sg-font);font-style:normal;color:#b42318;white-space:nowrap}
.m6-post.m6-tied{background:#dff6e6}.m6-post.m6-tied em{color:#14693a}
.m6-post.m6-tied svg{animation:sg-bounce 2.6s ease-in-out infinite}
.m6-post:nth-child(odd) svg{animation-delay:-1.3s}
.m6-talking .m6-sky,.m6-talking .m6-help,.m6-talking .m6-say,.m6-talking .m6-drafts,.m6-talking .m6-fix{display:none}
.m6-talking .m6-fence{order:-1;padding:8px 10px 10px}
.m6-talking .m6-post svg{width:clamp(30px,5vmin,44px);height:auto}
.m6-board{justify-content:safe center;gap:11px;padding-top:10px;overflow-y:auto}
.m6-talking{justify-content:flex-start}
.m6-say{flex:0 0 auto;display:flex;align-items:center;gap:10px;width:min(100%,960px);padding:8px 12px;border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 6px 0 rgba(43,33,71,.3);font:800 clamp(15px,2.2vmin,18px)/1.3 var(--sg-font)}
.m6-say.sg-bad{background:#ffe2e2}.m6-say.sg-ok{background:#d9f8e1}
.m6-say .sg-face{background:#c9f7ee}
.m6-drafts{flex:0 0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;width:min(100%,960px)}
.sg .m6-draft{position:relative;display:flex;flex-direction:column;gap:7px;padding:11px 12px 13px;border:4px solid var(--sg-ink);border-radius:8px 24px 24px 24px;background:#fff;box-shadow:0 6px 0 var(--sg-ink);text-align:left;font:700 14px/1.4 var(--sg-font);animation:m6-in .34s cubic-bezier(.2,1.3,.4,1)}
@keyframes m6-in{from{transform:translateY(60%) scale(.4) rotate(9deg);opacity:0}to{transform:none;opacity:1}}
.sg .m6-draft:hover:not(:disabled){background:#fffbe6;border-color:var(--sg-ink)}
.m6-draft>kbd{position:absolute;top:-10px;left:-8px}
.m6-draft-top{display:flex;align-items:center;gap:8px;font:900 18px/1.1 var(--sg-font)}
.m6-draft-top svg{width:22px;height:33px;overflow:visible}
.m6-draft small{display:block;font:900 10.5px/1.3 var(--sg-font);letter-spacing:.9px;text-transform:uppercase;color:#7a4be0}
.m6-draft-notes{padding:6px 9px;border:2px dashed var(--sg-ink);border-radius:12px;background:#fff7dc;font-size:13px}
.m6-letter{padding:8px 10px;border:3px solid var(--sg-ink);border-radius:12px;background:#f1faff;font-weight:800}
.m6-letter mark{padding:0 1px;border-radius:5px;background:none;color:inherit}
.m6-found .m6-letter mark{background:var(--sg-sun);box-shadow:0 0 0 3px var(--sg-red)}
.sg .m6-draft.sg-okay{background:#e6f9eb;box-shadow:none}
.sg .m6-draft.m6-found{background:#fff3c4;outline:4px solid var(--sg-red);outline-offset:2px}
.m6-stamp{position:absolute;top:8px;right:10px;padding:3px 10px;border:3px solid #1f9a4d;border-radius:10px;background:rgba(255,255,255,.94);color:#1f9a4d;font:900 13px/1.2 var(--sg-font);transform:rotate(5deg);animation:sg-pop .3s}
.m6-stamp.m6-hold{border-color:#d23b3b;color:#d23b3b}
.m6-fix{flex:0 0 auto;display:grid;gap:9px;width:min(100%,640px);padding:11px;border:4px solid var(--sg-ink);border-radius:24px;background:#fff;box-shadow:0 6px 0 rgba(43,33,71,.3);animation:sg-pop .3s}
@media (max-width:700px){
  .m6-posts{grid-template-columns:repeat(5,minmax(0,1fr))}
  .m6-post svg{width:20px;height:30px}
  .m6-left{left:72%;font-size:13px}
  .m6-card{padding:11px 11px 13px;border-radius:22px}
  .m6-drafts{grid-template-columns:1fr;gap:9px}
  .sg .m6-draft{gap:5px;padding:8px 10px 10px;font-size:13.5px}
  .m6-draft-notes{font-size:12.5px}
  .m6-board .m6-fence{display:none}
  .m6-fixing .m6-draft:not(.m6-found) .m6-draft-notes,.m6-fixing .m6-draft:not(.m6-found) .m6-letter{display:none}
  .m6-fix{padding:8px;border-radius:20px}
  .m6-board.m6-talking .m6-fence{display:block}
}
`;

  // ── the showdown: Don't let them float away ──
  /* play(kit, done) is the whole mini-game. Three beats: my first go (tie down the six quiet leads by
     hand), Sprout's shortcut (three follow-ups in two seconds, "copy it"), then I catch the draft that
     makes up a day and hold it back. Nothing is sent here: done() hands the work to Jordan.
     The help line under the sky is the agent's own thinking ("I"). The bar with Sprout's face is
     Sprout talking to the agent ("you"). */
  async function floatAway(kit, done) {
    const quiet = LEADS.filter((l) => isQuiet(l) && MOVES[l.id]);
    kit.backdrop("garden", { gray: true });
    kit.style(CSS);

    // Round 1 · the quiet leads drift up toward The Ghoster. Grab one, read its notes, tie on a tag.
    const sky = h("div", { class: "m6-sky" }), help = h("div", { class: "m6-help", role: "status", "aria-live": "polite" });
    const ghostArt = h("div"), left = h("span", { class: "m6-left" }), shh = h("span", { class: "m6-shh", hidden: true }, "Shhh...");
    sky.appendChild(h("div", { class: "m6-ghost" }, ghostArt, shh, left));
    const posts = {}, fence = h("div", { class: "m6-fence" }, h("small", null, "Greenline's list: " + count(LEADS.length).toLowerCase() + " leads, one row each"),
      h("div", { class: "m6-posts" }, LEADS.map((l) => (posts[l.id] = h("div", { class: "m6-post" })))));
    const wrap = h("div", { class: "m6" }, sky, help, fence);
    kit.stage.appendChild(wrap);
    const say = (text, tone) => { help.textContent = text; help.className = "m6-help" + (tone ? " sg-" + tone : ""); };
    const colorOf = (l) => BRIGHT[LEADS.indexOf(l) % BRIGHT.length];
    /* One row of the list, as a balloon on the fence: bright with its date once it is tied down. */
    function paint(l, label, tied) {
      const p = posts[l.id]; p.className = "m6-post" + (tied ? " m6-tied" : ""); p.innerHTML = "";
      p.appendChild(balloonEl(tied ? colorOf(l) : null, { dots: false })); p.appendChild(h("b", null, first(l))); p.appendChild(h("em", null, label));
    }
    LEADS.forEach((l) => (isQuiet(l) ? paint(l, l.date ? "was " + shortDay(l.date) : "no date", false) : paint(l, isClosed(l) ? l.stage : dayLabel(l.date), true)));

    const clock = kit.timer({ up: true });
    let holding = null, offCard = () => {}, tied = () => {};
    const loons = quiet.map((l, n) => {
      const el = h("button", { class: "m6-loon", type: "button", "aria-label": l.name + " is drifting away. Grab this lead.", onclick: () => grab(n) },
        balloonEl(null), h("b", null, first(l)), h("kbd", { "aria-hidden": "true" }, String(n + 1)));
      sky.appendChild(el);
      return { lead: l, n: n, el: el, done: false, last: 0, period: 15 + (n * 5) % 7, phase: (n * 0.37 + 0.15) % 1 };
    });
    function haunt() {                                 // The Ghoster gets nervous, and the fog thins, as the leads are tied down
      const rest = loons.filter((b) => !b.done).length;
      ghostArt.innerHTML = ""; ghostArt.appendChild(A.character("ghoster", { mood: rest > 4 ? "glad" : rest > 2 ? "sneaky" : rest > 0 ? "surprised" : "caught" }));
      left.textContent = rest === 0 ? "All tied down" : rest === 1 ? "Last one" : rest + " drifting off";
      wrap.style.setProperty("--fog", String(Math.max(0.12, rest / Math.max(1, loons.length))));
    }
    /* The drift: every loose balloon rises in its own lane, fades out at the top by The Ghoster and
       comes round again from the bottom. Nothing is ever lost: there is no way to fail. */
    let W = 1, H = 1, bw = 60;
    const size = () => { W = sky.clientWidth || 1; H = sky.clientHeight || 1; bw = (loons[0] && loons[0].el.offsetWidth) || 60; };
    function drift(t) {
      loons.forEach((b) => {
        if (b.done || b === holding) return;
        const p = kit.calm ? 0.2 + 0.5 * b.phase : (t / b.period + b.phase) % 1;
        if (p < b.last) hush(b);
        b.last = p;
        const x = (b.n + 0.5) / loons.length * W - bw / 2 + (kit.calm ? 0 : Math.sin(t * 0.9 + b.n * 1.7) * Math.min(12, W * 0.012));
        const y = (H - bw * 1.5) - p * (H - bw * 0.9);
        b.el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + (kit.calm ? 0 : Math.sin(t * 1.3 + b.n) * 4).toFixed(1) + "deg)";
        b.el.style.opacity = p > 0.9 ? String(Math.max(0, (1 - p) / 0.1)) : p < 0.05 ? String(p / 0.05) : "1";
      });
    }
    function hush(b) { if (holding) return; shh.hidden = false; kit.fx.pop(shh); S.play("m6shh"); kit.after(1300, () => { shh.hidden = true; }); if (!help.className.includes("sg-")) say(first(b.lead) + " drifted past The Ghoster and came round again. Tap a balloon, or press 1 to " + loons.length + "."); }
    size(); haunt(); drift(0);
    kit.on(window, "resize", () => { size(); drift(0); });
    if (!kit.calm) kit.frame((t) => { drift(t); });

    function grab(n) {
      const b = loons[n]; if (!b || b.done || holding) return;
      holding = b; b.el.hidden = true; sky.classList.add("m6-busy"); loons.forEach((x) => { x.el.disabled = true; }); S.play("pop");
      const l = b.lead, mv = MOVES[l.id], held = h("span", { class: "m6-held" }, balloonEl(null));
      const tags = mv.tags.map((t, k) => h("button", { class: "m6-tag", type: "button", onclick: () => tie(k) }, h("kbd", { "aria-hidden": "true" }, String(k + 1)),
        h("b", null, t.step), h("em", null, typeof t.day === "number" ? dayLabel(plus(t.day)) : t.day)));
      const card = h("div", { class: "m6-card", role: "group", "aria-label": l.name },
        h("div", { class: "m6-card-top" }, held, h("div", null, h("small", null, l.stage + " · " + trouble(l)), h("b", null, l.name), h("span", null, l.asked))),
        h("p", { class: "m6-notes" }, notesOf(l, mv.notes)), h("div", { class: "sg-kicker" }, "Tie on Jordan's next step and a date"), h("div", { class: "m6-tags" }, tags));
      function tie(k) {
        const t = mv.tags[k], btn = tags[k];
        if (b.done || btn.disabled) return;
        if (!t.right) { kit.score.wrong(); kit.fx.shake(btn); btn.disabled = true; btn.classList.add("sg-no"); say(t.why, "bad"); return; }   // a wrong pick: the engine counts it
        b.done = true; offCard(); kit.score.right(); S.play("m6tie"); tags.forEach((x) => { x.disabled = true; }); btn.classList.add("sg-yes");
        held.innerHTML = ""; held.appendChild(balloonEl(colorOf(l), { tag: true })); kit.fx.pop(held); say(t.yes, "ok");
        kit.after(1100, () => kit.fx.fly(card, posts[l.id], () => {
          card.remove(); holding = null; sky.classList.remove("m6-busy");
          paint(l, t.shut ? "Closed" : dayLabel(plus(t.day)), true); kit.fx.pop(posts[l.id]); haunt();
          const next = loons.filter((x) => !x.done);
          if (!next.length) return tied();
          next.forEach((x) => { x.el.disabled = false; }); kit.focus(next[0].el);
        }));
      }
      sky.appendChild(card);
      tags.forEach((btn, k) => kit.drag(btn, { zones: [held], disabled: () => b.done, onDrop: (zone) => { if (zone) tie(k); return false; } }));
      offCard = kit.keys({ "1": () => tie(0), "2": () => tie(1), "3": () => tie(2) });
      say("Which next step do I tie on for " + first(l) + ", and when? Tap a tag, drag it to the balloon, or press 1, 2 or 3.");
      kit.focus(tags[0]);
    }
    const keys = {}; loons.forEach((b, n) => { keys[String(n + 1)] = () => grab(n); });
    const offKeys = kit.keys(keys);
    say(count(loons.length) + " leads are drifting off. I catch them one at a time. Tap a balloon, or press 1 to " + loons.length + ".");
    await new Promise((resolve) => { tied = resolve; if (loons.length) kit.focus(loons[0].el); else resolve(); });
    offKeys(); clock.stop();
    const took = clock.value(), mine = Math.floor(took / 60) + ":" + String(took % 60).padStart(2, "0");
    say("Done. Every open lead has a next step and a date. The no is closed.", "ok");
    await kit.wait(900);

    // Round 2 · The Ghoster shrugs it off, and Sprout, the trainer, shows its shortcut for the follow-ups
    wrap.classList.add("m6-talking");
    kit.cast([{ who: "ghoster", side: "left", mood: "glad" }, { who: "sprout", side: "right", mood: "happy" }]);
    await kit.say([
      { who: "ghoster", mood: "glad", say: "Hee hee. That took you " + mine + ". And every follow-up still has to be written. Tonight. Shhh." },
      { who: "sprout", mood: "glad", pose: "cheer", say: "Not bad, {name}. Now watch my shortcut. Three follow-ups from the notes, in two seconds." }
    ]);
    kit.hush(); kit.cast([]); clock.hide();
    const face = h("span", { class: "sg-face" }), words = h("span"), note = h("div", { class: "m6-say", role: "status", "aria-live": "polite" }, face, words);
    /* One line above the drafts, with Sprout's face on it: every one is Sprout talking to the agent. */
    const tell = (text, mood, tone) => { words.textContent = text; face.innerHTML = ""; face.appendChild(A.avatar("sprout", { mood: mood })); note.className = "m6-say" + (tone ? " sg-" + tone : ""); kit.fx.pop(note); };
    const board = h("div", { class: "m6-drafts" });
    sky.remove(); help.remove(); wrap.className = "m6 m6-board"; wrap.style.setProperty("--fog", "0.2");
    wrap.insertBefore(note, fence); wrap.insertBefore(board, fence);
    tell("Watch and learn. Drafting...", "think");
    const cards = [];
    await new Promise((resolve) => {                   // three letters land on the desk, one after another
      let n = 0;
      const stop = kit.every(420, () => {
        const d = DRAFTS[n], l = byId(d.id);
        const el = h("button", { class: "m6-draft", type: "button", disabled: true }, h("kbd", { "aria-hidden": "true" }, String(n + 1)),
          h("span", { class: "m6-draft-top" }, balloonEl(colorOf(l), { dots: false }), "To " + first(l)),
          h("span", { class: "m6-draft-notes" }, h("small", null, "The notes say"), notesOf(l, d.notes)),
          h("span", { class: "m6-letter" }, h("small", null, "Sprout's draft"), d.text[0], d.text[1] ? h("mark", null, d.text[1]) : null, d.text[2] || null));
        cards.push({ d: d, lead: l, el: el }); board.appendChild(el); S.play("zip");
        if (++n >= DRAFTS.length) { stop(); kit.after(500, resolve); }
      });
    });
    tell("Done. Three follow-ups in two seconds, straight from the notes. Copy it. All perfect. Probably.", "proud");
    await kit.wait(1700);

    // Round 3 · I check before I copy: which draft is wrong? Then I hold it back.
    tell(kit.fill("Check first? Fine, {name}. Tap any draft that says something its notes do not. There is none."), "proud");
    let tries = 0;
    const found = await new Promise((resolve) => {
      const pick = (c) => {
        if (c.el.disabled) return;
        if (!c.d.wrong) { tries++; kit.score.wrong(); kit.fx.shake(c.el); c.el.disabled = true; c.el.classList.add("sg-okay"); tell(c.d.nope, "proud", "bad"); return; }
        off(); cards.forEach((x) => { x.el.disabled = true; }); c.el.classList.add("m6-found"); kit.score.right();
        kit.score.sprout(tries === 0);                 // the second star: Sprout's slip caught on the first try
        resolve(c);
      };
      cards.forEach((c) => { c.el.disabled = false; c.el.onclick = () => pick(c); });
      const off = kit.keys({ "1": () => pick(cards[0]), "2": () => pick(cards[1]), "3": () => pick(cards[2]) });
      kit.focus(cards[0].el);
    });
    tell("Oops. Friday is nowhere in Angela's notes. My shortcut made that day up. What do you do with it?", "oops", "ok");
    wrap.classList.add("m6-fixing");
    await new Promise((resolve) => {
      const opts = FIXES.map((f, k) => h("button", { class: "sg-opt", type: "button", onclick: () => pick(k) }, h("kbd", { "aria-hidden": "true" }, String(k + 1)), h("span", null, f.text)));
      const fix = h("div", { class: "m6-fix" }, opts);
      function pick(k) {
        const f = FIXES[k], btn = opts[k]; if (btn.disabled) return;
        if (!f.right) { kit.score.wrong(); kit.fx.shake(btn); btn.disabled = true; btn.classList.add("sg-no"); tell(f.why, "oops", "bad"); return; }
        off(); opts.forEach((x) => { x.disabled = true; }); btn.classList.add("sg-yes"); kit.score.right();
        cards.forEach((c) => { c.el.appendChild(h("span", { class: "m6-stamp" + (c === found ? " m6-hold" : "") }, c === found ? "Held back" : "Jordan reads it")); });
        resolve();
      }
      wrap.insertBefore(fix, fence);
      const off = kit.keys({ "1": () => pick(0), "2": () => pick(1), "3": () => pick(2) });
      kit.focus(opts[0]);
    });
    tell(kit.fill("Held back. Good catch, {name}. No day in the notes? Ask Jordan. My shortcut skipped that."), "glad", "ok");
    await kit.wait(1900);
    wrap.classList.add("m6-talking"); wrap.style.setProperty("--fog", "0");
    kit.cast([{ who: "ghoster", side: "left", mood: "surprised" }, { who: "sprout", side: "right", mood: "proud", pose: "hips" }]);
    await kit.say([
      { who: "ghoster", mood: "surprised", say: "A next step AND a date? On every one? Nobody can go quiet like that. Not fair!" },
      { who: "sprout", mood: "proud", pose: "cheer", say: "You draft. Jordan decides. Take it to Jordan, {name}!" }
    ]);
    done();
  }

  // ── the case ──
  OH.game.mission({
    week: 6,
    title: "The Six Leads Nobody Called Back",
    badge: { name: "Loop Closer" },
    reward: { hours: 1, leads: 6, money: 0 },
    maxWrong: 4,

    briefing: {
      setup: (kit) => {                                // The Ghoster over HQ, and the quiet leads floating off behind it
        kit.style(CSS);
        const above = h("div", { class: "m6-above" });
        for (let n = 0; n < 6; n++) { const i = h("i"); i.appendChild(balloonEl(null)); i.style.left = (7 + n * 15) + "%"; i.style.animationDelay = (-((n * 5) % 9)) + "s"; i.style.animationDuration = (8 + (n * 3) % 5) + "s"; above.appendChild(i); }
        kit.stage.appendChild(above); kit.stage.appendChild(h("div", { class: "m6-boss" }, A.character("ghoster", { mood: "glad" })));
      },
      /* Jordan and Sprout talk to the agent. who: "you" is the agent's own thought, shown as visor text. */
      lines: [
        { who: "jordan", mood: "worried", pose: "shrug", say: "{agent}! The posts are working. New people keep getting in touch. And then... nothing." },
        { who: "jordan", mood: "worried", pose: "point", say: "Ten leads on my list. Six have gone quiet. Look up. There they go." },
        { who: "jordan", mood: "worried", pose: "idle", say: "Greg has had a quote since October 16. Renee left a voicemail eight days ago. Priya sent her!" },
        { who: "you", say: "I read the list. Nobody decided to ignore them. They just have no next step and no date." },
        { who: "jordan", mood: "grumpy", pose: "hips", say: "That is The Ghoster. It never steals a lead. It waits until I get busy, and the quiet does the rest." },
        { who: "sprout", mood: "glad", pose: "wave", say: "When this was my job, I drafted every follow-up from the notes. Two seconds. Maybe three." },
        { who: "jordan", mood: "happy", pose: "point", say: "And I read each one before it goes. Three people in town never lose track of anybody. Go learn from them." }
      ]
    },

    stops: [
      { place: "post", who: "nell",
        lines: [
          { who: "nell", mood: "happy", pose: "wave", say: "Morning, {agent}. Every parcel in this shop is on one list. One row each." },
          { who: "nell", mood: "proud", pose: "point", say: "And every row is in one of five places: dropped off, sorted, on the van, at the door, signed for." },
          { who: "sprout", mood: "oops", say: "When I had your job, the leads were in texts, emails, a notebook and Jordan's head." },
          { who: "nell", mood: "happy", pose: "idle", say: "Then that was a pile, not a pipeline. A pipeline is only a list with stages. Go on, sort a few." }
        ],
        challenge: { type: "sort", ask: "Greenline's list has five stages. Which stage do I put each lead in?",
          bins: [{ key: "new", label: "New", color: A.C.sun }, { key: "contacted", label: "Contacted", color: A.C.orange }, { key: "discovery", label: "Discovery", color: A.C.blue },
            { key: "proposal", label: "Proposal", color: A.C.purple }, { key: "closed", label: "Won or Lost", color: A.C.green }],
          items: [
            { text: "Renee left a voicemail. Nobody has answered.", bin: "new", why: "Someone asked and nobody has answered yet. That is New." },
            { text: "Greg has the written quote in his hands.", bin: "proposal", why: "A written quote is in their hands. That is Proposal." },
            { text: "Wendy got a reply and a promise of a call.", bin: "contacted", why: "Jordan replied, and a real talk is being set up. Contacted." },
            { text: "Jordan walked Angela's slope and knows what she needs.", bin: "discovery", why: "Jordan visited, and knows what she needs. Discovery." },
            { text: "Marcus signed. His patio is finished.", bin: "closed", why: "He said yes. Won. The loop is closed." },
            { text: "Victor went with another company.", bin: "closed", why: "He said no. Lost. That closes the loop too." }
          ] },
        clue: { title: "Only a list", text: "A pipeline is only a list with five stages: New, Contacted, Discovery, Proposal, Won or Lost. I keep one row per lead, in one place a person opens every working day." } },

      { place: "grind", who: "bea",
        lines: [
          { who: "bea", mood: "glad", pose: "wave", say: "{agent}! Sprout! Sit. See my rail? Every cup on it has a ticket." },
          { who: "bea", mood: "proud", pose: "point", say: "Each ticket says what happens next, and when. No time on the ticket? That cup goes cold." },
          { who: "sprout", mood: "think", say: "So a lead with no next step and no date is... a cold latte. I never looked for those." },
          { who: "bea", mood: "happy", pose: "idle", say: "One that nobody is coming back for. Look at Greenline's list. Which ones are going cold?" }
        ],
        challenge: { type: "tap", ask: "Three leads are already going quiet. Which ones do I flag? Tap them.",
          items: [
            { text: "Colleen: call about the quote, " + due(2), ok: false, why: "A next step, and a date that is still ahead. Colleen is fine." },
            { text: "Renee: no next step, " + due(7), ok: true, why: "Nothing to do and no day to do it. Renee is drifting." },
            { text: "Simone: site walk, " + due(8), ok: false, why: "A next step and a date. Simone is fine." },
            { text: "Kendra: answer her question, " + due(5), ok: true, why: "A step with no date. Nobody ever gets to it." },
            { text: "Wendy: call her as promised, " + due(10), ok: false, why: "Today is a date. Jordan makes the call." },
            { text: "Greg: follow up on the quote, " + due(4), ok: true, why: "That date went by weeks ago, and nobody looked." }
          ] },
        clue: { title: "A next step and a date", text: "Every open lead has a next step and a date. Always. When I read a list and either one is blank, I flag it: that lead is already going quiet." } },

      { place: "workshop", who: "gus",
        lines: [
          { who: "gus", mood: "glad", pose: "wave", say: "{agent}! Mind the sawdust. Every repair in this shop hangs on that board." },
          { who: "gus", mood: "think", pose: "idle", say: "Last week Bea said no to fixing her toaster. She bought a new one. Fair enough." },
          { who: "sprout", mood: "worried", say: "A no? When I had your job, I asked again the next day. And the day after." },
          { who: "gus", mood: "happy", pose: "point", say: "Nope. I said thanks and took it down. A clear no is a finished job. Now somebody has hung it back up." }
        ],
        challenge: { type: "spot", ask: "Gus's board. Which job is hanging on the wrong side? Tap it.", nope: "That one is where it belongs. I keep looking.",
          groups: [
            { label: "Still open", color: A.C.orange, items: [{ text: "Mower: part arrives Friday" }, { text: "Toaster: Bea said no thanks", wrong: true, why: "Bea said no. That job is finished. Thank her, take it down, and stop." }, { text: "Bike: pick-up on Monday" }] },
            { label: "Finished", color: A.C.green, items: [{ text: "Clock: fixed and paid" }, { text: "Radio: owner said no" }, { text: "Kettle: fixed and paid" }] }
          ] },
        clue: { title: "A clear no", text: "A no is an answer. I draft the thank-you for Jordan, close the lead, and stop. Won and Lost are both finished. It is the maybe with no date that floats away." } }
    ],

    /* The plan: the agent's own three options, so they say "I". The card where I send by myself stays
       wrong, and its reaction is rule one. Its picture is the player's own agent, so art is a function. */
    crack: {
      lines: [{ who: "sprout", mood: "glad", pose: "cheer", say: "Three things learned, {name}. So how do we stop The Ghoster?" }],
      ask: "What is my plan?",
      cards: [
        { title: "I wait for them to call", text: "They have the number. They will ring when they are ready.", color: A.C.pink,
          art: sh.at(4, 6, 0.72, balloon(null)) + sh.at(62, 58, 1.1, A.iconMarkup("clock")),
          react: { who: "ghoster", mood: "glad", say: "Oh yes. Wait. Waiting is my favorite. Shhh." } },
        { title: "I email all six, every day", text: "I send. Nobody reads them first. Until somebody answers.", color: A.C.sun,
          art: () => sh.at(4, 4, 0.4, A.characterMarkup("agent", { mood: "glad", pose: "point" })) + sh.at(88, 50, 1, A.prop("envelope")) + sh.at(96, 72, 1, A.prop("envelope")) + sh.at(86, 94, 1, A.prop("envelope")),
          react: { who: "sprout", mood: "oops", say: "That was my shortcut. One of them had already said no. Nothing goes out until a person approves it." } },
        { title: "I add a next step and a date", text: "On every open lead. I close the no. I draft, Jordan reads.", color: A.C.teal, right: true,
          art: sh.at(2, 2, 0.74, balloon(A.C.red, { tag: true })) + sh.at(50, 16, 0.6, balloon(A.C.sun, { tag: true })),
          react: { who: "jordan", mood: "glad", say: "That's it. One list, and a next step and a date on every lead. You draft. I read. Go get The Ghoster." } }
      ]
    },

    /* The showdown: a title, Jordan's task line for the visor, how to play in the agent's own words. */
    showdown: {
      title: "Don't let them float away",
      task: "A next step and a date for each. Send nothing.",
      how: ["Six quiet leads are drifting off. I catch each one and tie on the right next step and date.", "Tap a balloon, or press 1 to 6. Then tap a tag, drag it, or press 1, 2 or 3.", "Then Sprout shows me its shortcut for the follow-ups. I check it before I copy it."],
      play: floatAway
    },

    /* The handoff: the agent never sends. After the showdown the engine takes the work to Jordan. */
    handoff: {
      ask: "Six quiet leads, {agent}. What have you got for me?",
      work: ["Six quiet leads, each with a next step and a date.", "The no is closed. One made-up day is held back.", "Nothing sent. Not one follow-up."],
      approve: "Approved. I'll pick Angela's day myself. Then I start my calls."
    },

    /* After the catch: two lines. The second steps out of the story, for the person playing. */
    debrief: [
      { who: "jordan", mood: "glad", pose: "cheer", say: "Six leads were quiet. Now the no is closed, and every open lead has a next step and a date." },
      { who: "sprout", mood: "proud", pose: "wave", say: "For the person behind the visor: tonight, put your open leads in one sheet. Give each a step and a date." }
    ],
    next: "Next case: October's totals are in. They do not agree, and nobody knows why."
  });
})();
