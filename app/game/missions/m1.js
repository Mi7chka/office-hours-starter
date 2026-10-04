/* Save Greenline · case 1: The Morning Storm. Bandit: Clutter, who buries the morning under email.
   What it teaches (session 1 of the class): AI is a very fast new hire on day one · the new-hire
   rule (the job, the context, the rules, a good example, a check) · ask "which one is wrong?" ·
   it drafts, you decide. The showdown is the week's job done by hand: sort an inbox into four piles.

   THIS IS THE MODEL MISSION. Cases 2 to 8 are written by copying the shape of this file.
   GAME.md explains every field and every kit call used here. Everything in it is made up. */
(function () {
  "use strict";
  if (!window.OH || !OH.game || !OH.game.mission || !OH.game.art) return;
  const h = OH.h, A = OH.game.art, S = OH.game.sound, sh = A.shape;

  // ── the showdown's data ──
  /* The four piles from the class, in key order 1 to 4. */
  const BINS = [
    { key: "reply", label: "Reply today", icon: "bolt", color: A.C.red },
    { key: "wait", label: "Can wait", icon: "clock", color: A.C.sun },
    { key: "fyi", label: "FYI", icon: "eye", color: A.C.blue },
    { key: "junk", label: "Junk", icon: "trash", color: A.C.purple }
  ];
  /* What the game knows about each of the twelve sample emails in app/data/w1-inbox.js, by id:
       short   a name small enough for a chip
       ok      every pile that is a fair answer (a judgment call gets two)
       sprout  where Sprout files it: the sample AI answer from the week 1 tool, wrong about email 11
       why     one line of help, shown after a wrong pick                                          */
  const MAIL = {
    1: { short: "Dana: nobody showed up", ok: ["reply"], sprout: "reply", why: "Dana took the morning off and nobody came. She hears back today." },
    2: { short: "New quote request", ok: ["reply"], sprout: "reply", why: "A new lead is waiting. A lead gets a reply today." },
    3: { short: "Can we move Friday?", ok: ["reply"], sprout: "reply", why: "Priya needs a yes or a no before Friday." },
    4: { short: "Mulch invoice 4471", ok: ["wait"], sprout: "wait", why: "The supplier gives Greenline thirty days. It can wait a little." },
    5: { short: "A payment came in", ok: ["fyi"], sprout: "fyi", why: "Money arrived. Good to know. Nothing to do." },
    6: { short: "URGENT: account suspended", ok: ["junk"], sprout: "junk", why: "A rush, a link, and it wants a password. That is a scam." },
    7: { short: "A new 5-star review", ok: ["fyi", "wait"], sprout: "fyi", why: "Lovely to read. Nothing has to happen today." },
    8: { short: "Luis: Thursday off?", ok: ["wait", "reply"], sprout: "wait", why: "Luis needs an answer, just not this minute." },
    9: { short: "Insurance renews next month", ok: ["wait"], sprout: "wait", why: "Next month. It can wait, with a date on it." },
    10: { short: "Newsletter: 7 trends", ok: ["junk", "fyi"], sprout: "junk", why: "Nobody at Greenline asked for seven trends." },
    11: { short: "3 invoices are overdue", ok: ["reply", "wait"], sprout: "fyi", why: "That is money owed to Greenline. Somebody has to act on it." },
    12: { short: "Trimmer sale this weekend", ok: ["junk"], sprout: "junk", why: "An ad. Greenline already has trimmers." }
  };
  const WRONG = 11;                                    // the one Sprout gets wrong: overdue invoices, filed under FYI
  const sender = (e) => String(e.from || "").replace(/<.*>/, "").trim();
  const clip = (t, n) => (String(t).length > n ? String(t).slice(0, n).replace(/\s+\S*$/, "") + "..." : String(t));

  /* This mission's own styles. A mission keeps its classes under its own prefix (m1-) and adds them
     with kit.style(), which removes them again when the screen changes. */
  const CSS = `
.m1-sky{position:absolute;top:0;left:0;right:0;height:46%;pointer-events:none;overflow:hidden}
.m1-sky i{position:absolute;top:-12%;width:clamp(30px,5vmin,46px);animation:m1-rain 3.4s linear infinite}
@keyframes m1-rain{0%{transform:translateY(-20%) rotate(-20deg);opacity:0}15%{opacity:1}100%{transform:translateY(520%) rotate(40deg);opacity:0}}
.m1-boss{position:absolute;top:1%;left:50%;width:min(30vh,38vw,230px);translate:-50% 0;animation:sg-bounce 2.4s ease-in-out infinite;pointer-events:none}
.m1{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:6px 12px 12px}
.m1::before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(#3d2b73 0,rgba(61,43,115,.55) 45%,rgba(61,43,115,0) 85%);opacity:var(--storm,1);transition:opacity .5s;pointer-events:none}
.m1>*{position:relative}
.m1-top{position:relative;flex:0 0 auto;width:min(100%,560px);height:min(25vh,190px)}
.m1-top>svg{width:100%;height:100%;overflow:visible}
.m1-top i{position:absolute;width:clamp(26px,4.4vmin,38px);animation:sg-bounce 1.3s ease-in-out infinite}
.m1-left{position:absolute;right:4%;bottom:6%;padding:5px 12px;border:3px solid var(--sg-ink);border-radius:999px;background:#fff;font:900 14px/1 var(--sg-font)}
.m1-desk{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;width:100%}
.m1-mail{width:min(100%,470px);border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 8px 0 var(--sg-ink);overflow:hidden;cursor:grab;text-align:left;animation:m1-in .38s cubic-bezier(.2,1.3,.4,1)}
@keyframes m1-in{from{transform:translateY(-90%) scale(.3) rotate(-14deg);opacity:0}to{transform:none;opacity:1}}
.m1-mail-top{display:flex;align-items:center;gap:8px;padding:7px 12px;background:var(--sg-sun);border-bottom:4px solid var(--sg-ink);font:900 14px/1.2 var(--sg-font)}
.m1-mail-top svg{width:24px;height:24px;flex:0 0 auto}
.m1-mail-top b{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.m1-mail-body{padding:10px 14px 13px}
.m1-mail-body b{display:block;font:900 clamp(18px,2.7vmin,23px)/1.2 var(--sg-font)}
.m1-mail-body p{margin-top:5px;font:600 clamp(13.5px,1.9vmin,15.5px)/1.4 var(--sg-font);color:#5d5578}
.m1-help{flex:0 0 auto;width:min(100%,760px);min-height:2.5em;display:flex;align-items:center;justify-content:center;padding:6px 14px;border:3px solid var(--sg-ink);border-radius:16px;background:#fff;font:800 14.5px/1.3 var(--sg-font);text-align:center}
.m1-help.sg-bad{background:#ffe2e2;color:#a11d2e}.m1-help.sg-ok{background:#d9f8e1;color:#14693a}
.m1-bins{flex:0 0 auto;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;width:min(100%,760px)}
.m1-bins .sg-bin em{position:absolute;top:-10px;right:-6px;min-width:26px;padding:2px 6px;border:3px solid var(--sg-ink);border-radius:999px;background:#fff;font:900 13px/1.2 var(--sg-font);font-style:normal}
.m1-talking .m1-desk,.m1-talking .m1-help,.m1-talking .m1-bins{visibility:hidden}
.m1-board{justify-content:safe center;gap:12px;padding-top:10px;overflow-y:auto}
.m1-say{flex:0 0 auto;display:flex;align-items:center;gap:10px;width:min(100%,900px);padding:8px 12px;border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 6px 0 rgba(43,33,71,.3);font:800 clamp(15px,2.2vmin,18px)/1.3 var(--sg-font)}
.m1-say.sg-bad{background:#ffe2e2}.m1-say.sg-ok{background:#d9f8e1}
.m1-say .sg-face{background:#c9f7ee}
.m1-cols{flex:0 0 auto;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;width:min(100%,900px)}
.m1-col{display:flex;flex-direction:column;gap:7px;min-height:150px;padding:8px;border:4px solid var(--sg-ink);border-radius:22px;background:#f4f1ff;background:color-mix(in srgb,var(--c) 30%,#fff)}
.sg .m1-head{position:relative;display:flex;align-items:center;justify-content:center;gap:6px;padding:7px 6px;border:3px solid var(--sg-ink);border-radius:14px;background:var(--c);font:900 15px/1.1 var(--sg-font)}
.sg .m1-head:disabled{opacity:1}
.sg .m1-head:not(:disabled){box-shadow:0 4px 0 var(--sg-ink);animation:sg-pulse 1s ease-in-out infinite}
.m1-head svg{width:20px;height:20px}
.m1-head kbd{position:absolute;top:-10px;left:-8px}
.m1-col .sg-chip{width:100%;font-size:14px;padding:8px 10px;animation:sg-pop .25s}
@media (max-width:700px){.m1-cols{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.m1-col{min-height:0;padding:6px;border-radius:18px}.m1-col .sg-chip{font-size:13px;padding:7px 8px}.m1-bins{gap:6px}.m1-bins .sg-bin{font-size:13.5px;padding:8px 4px;min-height:76px}}
`;
  const envelope = () => { const i = h("i"); i.appendChild(A.svg(sh.at(24, 24, 1, A.prop("envelope")), { box: "0 0 48 48" })); return i; };
  /* Clutter riding a storm cloud. Used over HQ in the briefing and at the top of the showdown. */
  const stormCloud = (mood) => A.svg(sh.at(64, 0, 0.86, A.characterMarkup("clutter", { mood: mood })) + sh.at(150, 212, 2.3, A.prop("cloud", { color: "#a79fd0" })), { box: "0 0 300 250" });

  // ── the showdown: Sort the storm ──
  /* play(kit, done) is the whole mini-game. The engine hands over an empty stage (kit.stage) and the
     kit; call done() when the bandit is beaten. Nothing needs cleaning up: when the screen changes,
     every kit timer, key map, drag and style goes with it. */
  async function sortTheStorm(kit, done) {
    const emails = ((OH.sample && OH.sample.inbox && OH.sample.inbox.emails) || []).filter((e) => MAIL[e.id]);
    kit.backdrop("hq", { gray: true });
    kit.style(CSS);

    // Round 1 · sort twelve emails by hand: drag the card, tap a bin, or press 1 to 4
    const top = h("div", { class: "m1-top" }), left = h("span", { class: "m1-left" }), desk = h("div", { class: "m1-desk" }), help = h("div", { class: "m1-help", role: "status", "aria-live": "polite" });
    const counts = BINS.map(() => h("em", null, "0"));
    const bins = BINS.map((b, n) => h("button", { class: "sg-bin", type: "button", style: "--c:" + b.color, onclick: () => send(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), A.icon(b.icon), h("b", null, b.label), counts[n]));
    const wrap = h("div", { class: "m1" }, top, desk, help, h("div", { class: "m1-bins" }, bins));
    kit.stage.appendChild(wrap);
    const say = (text, tone) => { help.textContent = text; help.className = "m1-help" + (tone ? " sg-" + tone : ""); };
    const clock = kit.timer({ up: true });
    let i = 0, busy = false, card = null, sorted = () => {};
    function storm() {                                 // the cloud thins out, and Clutter gets nervous, as the pile shrinks
      const rest = emails.length - i;
      top.innerHTML = ""; top.appendChild(stormCloud(rest > 7 ? "glad" : rest > 3 ? "sneaky" : "surprised"));
      for (let n = 0; n < rest - 1; n++) { const e = envelope(), a = Math.PI * (0.08 + 0.84 * n / 10); e.style.left = (46 - Math.cos(a) * 46) + "%"; e.style.top = (58 - Math.sin(a) * 52) + "%"; e.style.animationDelay = (n * 0.13) + "s"; top.appendChild(e); }
      left.textContent = rest === 1 ? "Last one" : rest + " to go"; top.appendChild(left);
      wrap.style.setProperty("--storm", String(Math.max(0.12, rest / emails.length)));
    }
    function deal() {
      const e = emails[i];
      card = h("div", { class: "m1-mail" }, h("div", { class: "m1-mail-top" }, A.icon("envelope"), h("b", null, sender(e)), h("span", null, (i + 1) + " of " + emails.length)),
        h("div", { class: "m1-mail-body" }, h("b", null, e.subject), h("p", null, clip(e.body, 130))));
      desk.innerHTML = ""; desk.appendChild(card); busy = false; storm(); S.play("whoosh");
      kit.drag(card, { zones: bins, disabled: () => busy, onDrop: (zone) => (zone ? send(bins.indexOf(zone), true) : false) });
    }
    function send(n, dropped) {
      if (busy || !card) return false;
      const info = MAIL[emails[i].id];
      if (info.ok.indexOf(BINS[n].key) < 0) { kit.score.wrong(); kit.fx.shake(card); say(info.why, "bad"); return false; }   // a wrong pick: the engine counts it
      busy = true; kit.score.right(); counts[n].textContent = String(+counts[n].textContent + 1); kit.fx.pop(bins[n]); say("Into " + BINS[n].label + ".", "ok");
      const next = () => { i++; if (i >= emails.length) { card = null; desk.innerHTML = ""; storm(); sorted(); } else deal(); };
      if (dropped) { card.style.opacity = "0"; kit.after(140, next); } else kit.fx.fly(card, bins[n], next);
      return true;
    }
    const offKeys = kit.keys({ "1": () => send(0), "2": () => send(1), "3": () => send(2), "4": () => send(3) });
    say("Where does this one go? Drag it, tap a bin, or press 1 to 4.");
    await new Promise((resolve) => { sorted = resolve; if (emails.length) deal(); else resolve(); });
    offKeys(); clock.stop();
    const took = clock.value(), mine = Math.floor(took / 60) + ":" + String(took % 60).padStart(2, "0");

    // Round 2 · Clutter laughs, and Sprout has a go
    wrap.classList.add("m1-talking");
    kit.cast([{ who: "clutter", side: "left", mood: "glad" }, { who: "sprout", side: "right", mood: "happy" }]);
    await kit.say([
      { who: "clutter", mood: "glad", say: "Hee hee. That took you " + mine + ". I will dump twelve more tomorrow. And the day after!" },
      { who: "sprout", mood: "glad", pose: "cheer", say: "My turn. I have the job and the rules now. Stand back!" }
    ]);
    kit.hush(); kit.cast([]); clock.hide();
    const face = h("span", { class: "sg-face" }), words = h("span"), note = h("div", { class: "m1-say", role: "status", "aria-live": "polite" }, face, words);
    const tell = (text, mood, tone) => { words.textContent = text; face.innerHTML = ""; face.appendChild(A.avatar("sprout", { mood: mood })); note.className = "m1-say" + (tone ? " sg-" + tone : ""); kit.fx.pop(note); };
    const lists = {}, heads = BINS.map((b, n) => h("button", { class: "m1-head", type: "button", disabled: true }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), A.icon(b.icon), b.label));
    const cols = h("div", { class: "m1-cols" }, BINS.map((b, n) => { lists[b.key] = h("div", { class: "m1-col", style: "--c:" + b.color }, heads[n]); return lists[b.key]; }));
    wrap.className = "m1 m1-board"; wrap.style.setProperty("--storm", "0.25"); wrap.innerHTML = ""; wrap.appendChild(note); wrap.appendChild(cols);
    tell("Sorting...", "think");
    const chips = [];
    await new Promise((resolve) => {                   // twelve chips zip into Sprout's four piles
      let n = 0;
      const stop = kit.every(150, () => {
        const e = emails[n], chip = h("button", { class: "sg-chip", type: "button", disabled: true }, MAIL[e.id].short);
        chips.push({ id: e.id, el: chip }); lists[MAIL[e.id].sprout].appendChild(chip); S.play("zip");
        if (++n >= emails.length) { stop(); kit.after(450, resolve); }
      });
    });
    tell("Done. You took " + mine + ". I took two seconds. All perfect. Probably.", "proud");
    await kit.wait(1700);

    // Round 3 · which one is wrong? Then put it where it belongs.
    tell("Sprout sounds very sure. One of these is in the wrong pile. Tap it.", "proud");
    let tries = 0;
    const found = await new Promise((resolve) => {
      chips.forEach((c) => { c.el.disabled = false; c.el.onclick = () => {
        if (c.id !== WRONG) { tries++; kit.score.wrong(); kit.fx.shake(c.el); c.el.disabled = true; c.el.classList.add("sg-okay"); tell("\"" + MAIL[c.id].short + "\" is in the right pile. Look again.", "proud", "bad"); return; }
        chips.forEach((x) => { x.el.disabled = true; }); c.el.classList.add("sg-found"); kit.score.right();
        kit.score.sprout(tries === 0);                 // the second star: Sprout's slip caught on the first try
        resolve(c);
      }; });
      kit.focus(chips[0].el);
    });
    tell("Oops. Money owed to Greenline is never just FYI. Where should it go?", "oops", "ok");
    await new Promise((resolve) => {
      const pick = (n) => {
        if (MAIL[WRONG].ok.indexOf(BINS[n].key) < 0) { kit.score.wrong(); kit.fx.shake(heads[n]); tell(BINS[n].key === "fyi" ? "It is sitting there now. That is the trouble." : "Not junk. Greenline is owed that money.", "oops", "bad"); return; }
        heads.forEach((b) => { b.disabled = true; }); off(); lists[BINS[n].key].appendChild(found.el); found.el.className = "sg-chip sg-yes"; kit.fx.pop(found.el); kit.score.right(); resolve();
      };
      heads.forEach((b, n) => { b.disabled = false; b.onclick = () => pick(n); });
      const off = kit.keys({ "1": () => pick(0), "2": () => pick(1), "3": () => pick(2), "4": () => pick(3) });
      kit.focus(heads[0]);
    });
    tell("Fixed. I will remember that rule tomorrow, if you write it down for me.", "glad", "ok");
    await kit.wait(1500);
    kit.cast([{ who: "clutter", side: "left", mood: "surprised" }, { who: "sprout", side: "right", mood: "proud", pose: "hips" }]);
    await kit.say([
      { who: "clutter", mood: "surprised", say: "You CHECKED its work? Nobody checks. That is not fair!" },
      { who: "sprout", mood: "proud", pose: "cheer", say: "I draft. The detective decides. Get the net!" }
    ]);
    done();
  }

  // ── the case ──
  OH.game.mission({
    week: 1,
    title: "The Morning Storm",                        // the case name: 34 characters or fewer
    badge: { name: "Inbox Tamer" },                    // the sticker. The icon and color come from the story bible.
    reward: { hours: 4, leads: 0, money: 0 },          // story numbers: small, whole, and they fit the sample data
    maxWrong: 4,                                       // wrong picks allowed for the third star (the default is 3)

    /* The briefing at Greenline HQ. Each line: who speaks, a mood, an optional pose, and one short sentence or two. */
    briefing: {
      setup: (kit) => {                                // extra art for this scene: Clutter on a cloud, raining envelopes on HQ
        kit.style(CSS);
        const sky = h("div", { class: "m1-sky" });
        for (let n = 0; n < 12; n++) { const e = envelope(); e.style.left = (4 + n * 8) + "%"; e.style.animationDelay = ((n * 7) % 12) * 0.28 + "s"; sky.appendChild(e); }
        kit.stage.appendChild(sky); kit.stage.appendChild(h("div", { class: "m1-boss" }, stormCloud("glad")));
      },
      lines: [
        { who: "jordan", mood: "worried", pose: "shrug", say: "Detective! Good, you are here. Look at this place." },
        { who: "jordan", mood: "worried", pose: "point", say: "Clutter hit us overnight. Twelve emails, dumped all over the morning." },
        { who: "jordan", mood: "worried", pose: "idle", say: "One is from Dana. Her crew never showed up. One is a scam. I can't tell which is which from the truck." },
        { who: "sprout", mood: "glad", pose: "wave", say: "Hi! I'm Sprout. I read fast. Really fast. I also started today." },
        { who: "jordan", mood: "happy", say: "Sprout is our AI helper. Quick as lightning, and wrong about exactly one thing a day." },
        { who: "sprout", mood: "proud", pose: "hips", say: "Only one!" },
        { who: "jordan", mood: "happy", pose: "point", say: "Three people in town know how to work with a helper like that. Get their clues. Then we stop Clutter." }
      ]
    },

    /* Three clue stops. Each: a place, who is there, a few lines, a quick challenge, and the clue it earns.
       A clue is one real idea from the class, said in a sentence or two. */
    stops: [
      { place: "garden", who: "dana",
        lines: [
          { who: "dana", mood: "grumpy", pose: "hips", say: "I took the morning off for a hedge trim. Nobody came. Nobody called." },
          { who: "sprout", mood: "oops", say: "Your email is under eleven others. Sorry. I can find it in one second." },
          { who: "dana", mood: "surprised", pose: "idle", say: "One second? My nephew is like that at the garden shop. Fast hands. No idea where anything goes." },
          { who: "dana", mood: "happy", pose: "point", say: "A fast new hire. Brilliant at some jobs, lost without you at others. See if you can tell which." }
        ],
        challenge: { type: "sort", ask: "Which jobs suit a fast new hire like Sprout?",
          bins: [{ key: "fast", label: "Sprout is quick at this", icon: "bolt", color: A.C.green }, { key: "you", label: "Sprout needs you for this", icon: "hand", color: A.C.pink }],
          items: [
            { text: "Reading a big pile, fast", bin: "fast", why: "Reading fast is what it does best." },
            { text: "Knowing your customers", bin: "you", why: "It only knows what you tell it." },
            { text: "Sorting and labeling", bin: "fast", why: "Sorting is a fine job to hand over." },
            { text: "Knowing when it is wrong", bin: "you", why: "It sounds just as sure when it is wrong." },
            { text: "Writing a first draft", bin: "fast", why: "A first draft, in seconds. You finish it." },
            { text: "Remembering last week", bin: "you", why: "No notes, no memory. Write it down for it." }
          ] },
        clue: { title: "A fast new hire", text: "AI is a very fast new hire on day one. Great at reading, sorting and first drafts. It knows nothing about your business until you tell it." } },

      { place: "grind", who: "bea",
        lines: [
          { who: "bea", mood: "glad", pose: "wave", say: "Morning, detective! Cocoa for you, and one drop of oil for the little one." },
          { who: "bea", mood: "happy", pose: "idle", say: "I train a new hire every summer. I never just say \"help with the coffee.\"" },
          { who: "bea", mood: "proud", pose: "point", say: "I hand over five things. The job. The context. The rules. One good example. And a check." },
          { who: "sprout", mood: "surprised", say: "Nobody gave me any of those! I got \"help with email.\"" }
        ],
        challenge: { type: "tap", ask: "Pack Sprout's first-day kit. Tap the five things a new hire needs.",
          items: [
            { text: "The job, said plainly", ok: true, why: "One task. Not \"help with email.\"" },
            { text: "A pep talk", ok: false, why: "Kind, but it will not sort an inbox." },
            { text: "The context: your real documents", ok: true, why: "Your price list. Replies you liked." },
            { text: "The rules: what it must never do", ok: true, why: "Never make up a price. Never promise a date." },
            { text: "CAPITAL LETTERS, so it listens", ok: false, why: "Shouting does not help a new hire. Or a robot." },
            { text: "One good example", ok: true, why: "An answer you would be proud to send." },
            { text: "A check: you read it first", ok: true, why: "Nothing leaves without your eyes on it." },
            { text: "Good luck", ok: false, why: "Luck is not a plan." }
          ] },
        clue: { title: "The new-hire rule", text: "Hand over five things: the job, the context, the rules, a good example, and a check. A bad answer usually means one is missing." } },

      { place: "post", who: "nell",
        lines: [
          { who: "nell", mood: "happy", say: "Sprout sorted my shelves this morning. Two seconds flat. Looked perfect." },
          { who: "sprout", mood: "proud", pose: "hips", say: "It WAS perfect!" },
          { who: "nell", mood: "think", say: "It sounded sure. It always sounds sure. So I never ask \"is it right?\"" },
          { who: "nell", mood: "happy", pose: "point", say: "I ask \"which one is wrong?\" Then I go and look. Your turn." }
        ],
        challenge: { type: "spot", ask: "Sprout sorted the shelves. Which one is wrong? Tap it.", nope: "That one is where it belongs. Keep looking.",
          groups: [
            { label: "Letters", color: A.C.blue, items: [{ text: "Postcard" }, { text: "Birthday card" }, { text: "Bag of mulch", wrong: true, why: "A bag of mulch is not a letter. Sprout was very sure about it, too." }] },
            { label: "Parcels", color: A.C.orange, items: [{ text: "Shoe box" }, { text: "Box of seeds" }, { text: "Garden gnome" }] },
            { label: "Posters to print", color: A.C.pink, items: [{ text: "Yard sale" }, { text: "Lost cat" }, { text: "Bake sale" }] }
          ] },
        clue: { title: "Which one is wrong?", text: "AI sounds just as sure when it is wrong. So do not ask \"is it right?\" Ask \"which one is wrong?\" and go look. It drafts. You decide." } }
    ],

    /* Crack the case: three cards, exactly one with right: true. A wrong card gets a reaction and another try.
       art is SVG for a 120 by 120 box (or give icon: "name" instead). */
    crack: {
      lines: [{ who: "sprout", mood: "glad", pose: "cheer", say: "Three clues in the case book. So how do we stop Clutter?" }],
      ask: "What is the move?",
      cards: [
        { title: "Read every email yourself", text: "All twelve. Every morning. Forever.", color: A.C.pink,
          art: sh.at(44, 80, 1.3, A.prop("envelope")) + sh.at(76, 62, 1.3, A.prop("envelope")) + sh.at(58, 42, 1.3, A.prop("envelope")) + sh.at(70, 70, 0.9, A.iconMarkup("clock")),
          react: { who: "clutter", mood: "glad", say: "Yes, do that! I will bring twelve more tomorrow. Hee hee." } },
        { title: "Sprout sorts, Sprout sends", text: "Hand over the whole inbox and go fishing.", color: A.C.sun,
          art: sh.at(6, 4, 0.4, A.characterMarkup("sprout", { mood: "glad", pose: "point" })) + sh.rect(70, 64, 46, 30, 12, A.C.red) + sh.text(93, 85, "SEND", 13, "#fff"),
          react: { who: "sprout", mood: "oops", say: "I am fast, but I get one thing wrong and I sound sure about it. Please do not let me press send." } },
        { title: "Sprout sorts, you check", text: "Four piles in seconds. Then you ask which one is wrong.", color: A.C.teal, right: true,
          art: sh.at(2, 4, 0.4, A.characterMarkup("sprout", { mood: "proud" })) + sh.at(84, 60, 1.1, A.prop("magnifier")),
          react: { who: "jordan", mood: "glad", say: "That's it. Sprout drafts. You decide. Now go and get Clutter." } }
      ]
    },

    /* The showdown: a title, two or three lines of how to play, and the mini-game itself. */
    showdown: {
      title: "Sort the storm",
      how: ["Clutter throws twelve emails. Send each one to the right pile.", "Drag it, tap a bin, or press 1, 2, 3 or 4.", "Then Sprout has a go. Check its work."],
      play: sortTheStorm
    },

    /* After the catch: two lines. The second is one thing to try for real, tonight. */
    debrief: [
      { who: "jordan", mood: "glad", pose: "cheer", say: "Twelve emails, four piles, and nothing sent to anybody. Dana gets a call from me today." },
      { who: "sprout", mood: "proud", pose: "wave", say: "I drafted. You decided. Tonight, try the same thing on ten of your own emails." }
    ],
    next: "Next case: a new lead came in at 9 PM. Nobody saw it."   // one line; case 8 has none
  });
})();
