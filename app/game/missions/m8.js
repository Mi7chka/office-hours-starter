/* Save Greenline · case 8, the boss: The Friday the Card Reader Died. Bandit: Captain Chaos, who
   breaks things at 4:45 on a Friday and presses every panic button in town.
   What it teaches (session 8 of the class): ask the calm questions before you touch anything (what
   changed, one person or everyone, can you make it happen again, the exact words on the screen) ·
   your email is the master key, so it gets the strongest lock (a password manager and two-step
   login), and a trick shows itself by pressure, a link, or a request for a password or a payment ·
   one printed page says who owns each login and who to call. Never a password on it.

   AGENT MODE: the player IS the AI, Greenline's new agent. So every line here is written to the
   agent ("you") or by the agent ("I"). Sprout is the trainer, the agent who had the job before, and
   its one wrong shortcut (a guess at the cause, in the support request) is the thing to catch. The
   agent never sends, pays or gives out a password: it asks, checks and drafts, and the engine's
   handoff takes the work to Jordan. When "the boss" asks the agent for a password, the agent does
   not act on it. It checks with the real Jordan.

   The showdown is a boss fight in three rounds, each a different kind of play:
     1. Stay calm          panic buttons pop up all over the wall; tap only the calm questions
        Sprout's shortcut  Sprout drafts the support request and guesses the cause; catch it, fix it
     2. Lock the doors     Captain Chaos knocks in disguise; tag the signs of a trick and the door slams
     3. Who do we call?    snap the right card onto each broken tool, then print the draft page
   The last case has no `next`. Everything in it is made up. GAME.md explains every kit call. */
(function () {
  "use strict";
  if (!window.OH || !OH.game || !OH.game.mission || !OH.game.art) return;
  const h = OH.h, A = OH.game.art, S = OH.game.sound, sh = A.shape, C = A.C;
  const sample = (OH.sample && OH.sample.breaks) || {};
  /* The words Luis reads off the screen when somebody finally asks him (app/data/w8-breaks.js). */
  const WORDS = (sample.reply && sample.reply.words) || "Reader not connected. Check your connection and try again.";

  // ── sounds and icons of this mission's own ──
  if (S && S.fx) {
    S.fx.m8alarm = () => { S.tone(880, 0.09, { type: "square", vol: 0.045 }); S.tone(660, 0.12, { type: "square", vol: 0.045, at: 0.1 }); };
    S.fx.m8off = () => S.tone(700, 0.32, { to: 170, vol: 0.1 });
    S.fx.m8clack = () => { S.tone(330, 0.05, { type: "square", vol: 0.07 }); S.tone(190, 0.08, { type: "square", vol: 0.07, at: 0.05 }); };
    S.fx.m8knock = () => { [0, 0.13, 0.26].forEach((at) => S.tone(170, 0.06, { to: 110, vol: 0.13, at: at })); };
    S.fx.m8slam = () => { S.noise(0.18, { from: 900, to: 110, vol: 0.15 }); S.tone(105, 0.24, { to: 50, vol: 0.15 }); };
    S.fx.m8buzz = () => { [0, 0.11, 0.22].forEach((at) => S.tone(150, 0.07, { type: "sawtooth", vol: 0.05, at: at })); };
    S.fx.m8print = () => { for (let i = 0; i < 7; i++) S.tone(400 + (i % 2) * 70, 0.05, { type: "square", vol: 0.03, at: i * 0.07 }); };
    S.fx.m8stamp = () => { S.noise(0.1, { from: 320, to: 90, vol: 0.15 }); S.tone(92, 0.22, { to: 58, vol: 0.15 }); };
  }
  A.icons.m8ask = () => sh.ellipse(24, 24, 19, 19, "#fff", 4) + sh.text(24, 34, "?", 28);
  A.icons.m8link = () => sh.rect(4, 16, 23, 16, 8, "none", 5) + sh.rect(21, 16, 23, 16, 8, "none", 5);
  A.icons.m8key = (c) => sh.line("M22,24 H43 M36,24 V32 M43,24 V31", C.ink, 5) + sh.ellipse(14, 24, 10, 10, c || C.sun, 4) + sh.ellipse(14, 24, 3, 3, C.ink, 0);
  A.icons.m8reader = (c) => sh.rect(11, 4, 26, 40, 6, c || "#fff", 4) + sh.rect(16, 9, 16, 11, 3, C.glass, 3) +
    [0, 1, 2].map((i) => sh.ellipse(18 + i * 6, 27, 1.8, 1.8, C.ink, 0) + sh.ellipse(18 + i * 6, 33, 1.8, 1.8, C.ink, 0)).join("") + sh.line("M17,39 H31", C.green, 3);

  /* Captain Chaos at his panic console. level 0 to 3: the more rounds he loses, the more frazzled he
     gets. away: only the console, for when he has jumped down to talk. */
  const LOOKS = ["glad", "sneaky", "surprised", "caught"];
  function bossArt(level, away) {
    const on = level < 3, red = on ? C.red : "#b9b6c9";
    let s = "";
    if (!away) {
      let body = A.characterMarkup("chaos", { mood: LOOKS[level] });
      if (level === 1) body += sh.path("M24,72 q-7,12 0,16 q7,-4 0,-16 Z", C.water, 3);
      if (level >= 2) body += sh.group(sh.cluster([[12, 68, 10], [3, 54, 8]], "#fff", 3), 'class="sg-steam"') + sh.group(sh.cluster([[188, 68, 10], [197, 54, 8]], "#fff", 3), 'class="sg-steam"');
      if (level >= 3) body += [[44, 22, 10], [100, -2, 12], [158, 22, 10]].map((p) => sh.path(sh.star(p[0], p[1], p[2]), C.sun, 3, 'class="sg-twinkle"')).join("");
      s += sh.group(sh.at(50, -8, 1, body), 'class="m8-bossbody"');
    }
    s += sh.rect(14, 172, 272, 58, 14, "#6c6690") + sh.rect(4, 160, 292, 24, 12, "#8d87ad");
    s += [[84, 158, 24], [150, 154, 30], [216, 158, 24]].map((b) => sh.ellipse(b[0], b[1] + 5, b[2], b[2] * 0.46, sh.dark(red, 0.3)) + sh.ellipse(b[0], b[1], b[2], b[2] * 0.46, red) +
      sh.line("M" + (b[0] - b[2] * 0.55) + "," + (b[1] - 3) + " Q" + (b[0] - b[2] * 0.2) + "," + (b[1] - b[2] * 0.36) + " " + (b[0] + b[2] * 0.2) + "," + (b[1] - b[2] * 0.34), "rgba(255,255,255,.75)", 3)).join("");
    s += [42, 72, 228, 258].map((x, i) => sh.ellipse(x, 207, 7, 7, on ? [C.sun, C.green, C.blue, C.sun][i] : "#cfcbe0", 3)).join("") +
      sh.rect(102, 198, 96, 18, 7, "#3a3350", 3) + sh.text(150, 212, on ? "PANIC" : "pfff", 12, on ? C.sun : "#cfcbe0");
    return A.svg(s, { box: "0 0 300 232" });
  }
  /* An alarm light: spinning and red, or switched off with a tick. */
  const alarmArt = (on) => A.svg((on ? sh.group(sh.path("M30,26 L-8,8 V44 Z", "rgba(255,216,61,.85)", 0) + sh.path("M30,26 L68,8 V44 Z", "rgba(255,216,61,.85)", 0), 'class="m8-beam"') : "") +
    sh.rect(10, 40, 40, 13, 5, "#5b5475", 4) + sh.path("M15,40 V28 A15,15 0 0 1 45,28 V40 Z", on ? C.red : "#b9e8c6", 4) +
    (on ? sh.line("M22,26 Q23,18 30,17", "rgba(255,255,255,.8)", 3) : sh.line("M23,30 L28,35 L37,24", C.greenDark, 4)), { box: "-10 0 80 56" });

  // ── the showdown's data ──
  /* Round 1. The calm questions, in the order they come up, and what Luis answers (the facts in the
     week 8 sample data). The last answer is the gap Sprout fills with a guess. */
  const QUESTIONS = [
    { text: "What changed?", note: "Luis: The tablet updated itself at lunch. And the signal is weak out here." },
    { text: "Is it one person or everyone?", note: "Luis: Just my reader. Ana's truck took a card at 2:10." },
    { text: "Can you make it happen again?", note: "Luis: Three tries, the same thing each time. I have stopped pressing." },
    { text: "What are the exact words on the screen?", note: "Luis: It spins, then says something about connection??" }
  ];
  const PANIC = [
    { text: "Restart everything!", why: "If I restart it all, the words on the screen go with it. I ask first." },
    { text: "Buy a new one!", why: "A new one could break the very same way. And buying is Jordan's call, not mine." },
    { text: "Try five fixes at once!", why: "Five at once hides the one that worked. One at a time, later." },
    { text: "Unplug it all!", why: "That is restarting everything, with more crawling under desks." },
    { text: "Press it harder!", why: "Luis pressed it three times already. It noticed." },
    { text: "Call everybody!", why: "\"It's broken, call me\" gets a slow answer. My questions come first." },
    { text: "Throw it in the pond!", why: "The duck in Hollow Park does not take cards." },
    { text: "Panic!", why: "Panicking is Captain Chaos's job. Mine is asking." }
  ];
  /* Sprout's shortcut. The support request Sprout drafts, a line at a time. Exactly one line is a guess. */
  const REQUEST = [
    { text: "One of our two card readers stopped taking payments this afternoon.", why: "That line is a fact. It says what stopped working." },
    { text: "The other reader, on the same account, still works.", why: "A fact. Ana's truck took a card at 2:10." },
    { text: "It fails every time. Three tries, the same result.", why: "A fact. Luis tried three times, then stopped pressing." },
    { text: "Since this morning: the tablet updated, and the truck moved to weak signal.", why: "Facts. Two things changed, and that line blames neither." },
    { text: "The update broke it. Please undo the update.", guess: true },
    { text: "Jordan is on the office phone until 6 PM.", why: "A fact, and a handy one. Support knows who to reach." }
  ];
  const FIXES = [
    { text: "\"The weak signal broke it.\"", why: "Still a guess. Two things changed and nobody knows which one did it." },
    { text: "The exact words on the screen. I ask Luis.", right: true },
    { text: "Nothing. Support can work it out.", why: "The exact words are the first thing support asks for. Then everybody waits." }
  ];
  /* Round 2. The three signs of a trick, and four messages at the door: three from Captain Chaos in
     a disguise, one real. A bit with a `sign` is a sign of a trick; a bit without one is harmless. */
  const SIGNS = {
    pressure: { label: "Pressure", icon: "clock", tag: "PRESSURE", found: "Pressure. A real message can wait while I check." },
    link: { label: "A link", icon: "m8link", tag: "A LINK", found: "A link. I do not tap it. Jordan goes to the site the usual way instead." },
    ask: { label: "Password or money", icon: "m8key", tag: "ASKS", found: "It asks for a password or a payment. Real support never needs a password. I give neither." }
  };
  const MESSAGES = [
    { from: "Parcel Desk", who: "chaos", tag: "DELIVERY",
      bits: [{ text: "A parcel is waiting for Greenline." }, { text: "Tap this link to see it.", sign: "link" }, { text: "A small fee is due first. Card number, please.", sign: "ask" }],
      done: "SLAM! A link and a payment. A real parcel does not need a card number. I pay nothing." },
    { from: "Nell, at Print and Post", who: "nell", real: true,
      bits: [{ text: "Hi Jordan, Nell here." }, { text: "The big printer is free this afternoon." }, { text: "Bring your page over whenever you like." }],
      done: "No pressure, no link, nothing asked for. That one is just Nell." },
    { from: "Account Security Team", who: "chaos", tag: "SECURITY",
      bits: [{ text: "Your account closes in one hour!", sign: "pressure" }, { text: "Click here to keep it open.", sign: "link" }, { text: "Then type your email password.", sign: "ask" }],
      done: "SLAM! All three signs at once. The email stays locked." },
    { from: "Jordan, the boss (new phone)", who: "chaos", tag: "THE BOSS",
      bits: [{ text: "Hope your Friday is going well, {name}." }, { text: "Text me the email password.", sign: "ask" }, { text: "Right now! No time to call!", sign: "pressure" }],
      done: "SLAM! Pressure and a password. I do nothing it says. I check with the real Jordan first." }
  ];
  /* The disguises: a cap pulled over his own hat, and a prop. Drawn in the bandit's 200 by 220 box. */
  const cap = (color) => sh.path("M42,60 Q42,6 100,6 Q158,6 158,60 Z", color) + sh.path("M150,46 Q194,42 198,58 Q176,68 152,60 Z", sh.dark(color, 0.25));
  const DISGUISE = {
    "DELIVERY": cap(C.brown) + sh.rect(8, 150, 62, 48, 6, C.wood) + sh.line("M39,150 V198", C.cream, 7),
    "SECURITY": cap("#3b4a7a") + sh.path(sh.star(100, 34, 14), C.sun, 3),
    "THE BOSS": cap(C.greenDark) + sh.ellipse(100, 34, 12, 12, "#fff", 3) + sh.leaf(100, 43, 0.55, 15, C.leaf, 3)
  };
  const visitorArt = (m) => (m.real ? A.avatar(m.who, { mood: "happy" }) : A.svg(A.characterMarkup(m.who, { mood: "sneaky" }) + (DISGUISE[m.tag] || ""), { box: "8 -2 184 196", class: "sg-avatar" }));
  /* Round 3. The tools, in the order Captain Chaos breaks them, and the cards in the player's hand.
     A card with no `tool` never goes on the page. Names match the filled-in sheet in the sample data. */
  const TOOLS = [
    { key: "reader", name: "The card reader", icon: "m8reader" },
    { key: "email", name: "Email", icon: "envelope" },
    { key: "site", name: "The website", icon: "sign" },
    { key: "books", name: "The accounting app", icon: "coins" }
  ];
  const CARDS = [
    { tool: "site", own: "Owner: Jordan, then Casey", call: "Call Nico, who built it" },
    { tool: null, own: "So nobody forgets:", call: "The password, in big letters", why: "Never a password on the page. Passwords live in the password manager." },
    { tool: "reader", own: "Owner: Jordan, not the crews", call: "Call the reader help line" },
    { tool: "books", own: "Owner: Jordan, then Casey", call: "Call Helen, the bookkeeper" },
    { tool: null, own: "Owner: not sure", call: "Call whoever picks up", why: "That is how Friday got like this. The page needs a name and a number." },
    { tool: "email", own: "Owner: Jordan, then Casey", call: "Call the email help line" }
  ];

  /* This mission's own styles, all under m8-. kit.style() takes them away when the screen changes.
     One trap: `.sg button` sets the font and color of every button, so a button's lettering is
     styled as `.sg .m8-x`; an animation stays on the bare class so the kit's shake can replace it. */
  const CSS = `
.m8-brief{position:absolute;top:2%;left:0;right:0;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:1.4vmin 5vmin;padding:0 12px;pointer-events:none}
.m8-text{display:flex;align-items:center;gap:10px;width:min(100%,390px);padding:9px 13px;border:4px solid var(--sg-ink);border-radius:22px 22px 22px 6px;background:#fff;box-shadow:0 6px 0 rgba(43,33,71,.3);text-align:left;animation:m8-buzz 2.6s ease-in-out infinite}
.m8-text small{display:block;font:900 11.5px/1.3 var(--sg-font);letter-spacing:.6px;text-transform:uppercase;color:#7a4be0}
.m8-text p{font:700 clamp(13px,1.9vmin,15.5px)/1.3 var(--sg-font)}
.m8-text .sg-face{background:#ffd9a8}
@keyframes m8-buzz{0%,84%,100%{transform:none}87%{transform:translateX(-4px) rotate(-1deg)}90%{transform:translateX(4px) rotate(1deg)}93%{transform:translateX(-3px)}96%{transform:translateX(2px)}}
.m8-brief-boss{position:relative;flex:0 0 auto;width:min(27vh,46vw,230px)}
.m8-brief-boss svg{width:100%;overflow:visible}
.m8-shout{position:absolute;padding:4px 10px;border:3px solid var(--sg-ink);border-radius:999px;background:var(--sg-red);color:#fff;font:900 clamp(11px,1.7vmin,14px)/1.1 var(--sg-font);white-space:nowrap;opacity:0;animation:m8-shout 3.6s ease-in-out infinite;animation-delay:calc(var(--n)*1.2s)}
.m8-shout:nth-of-type(1){right:80%;top:2%}.m8-shout:nth-of-type(2){left:80%;top:16%}.m8-shout:nth-of-type(3){right:76%;top:40%}
@keyframes m8-shout{0%{opacity:0;transform:scale(.4)}6%,30%{opacity:1;transform:scale(1) rotate(-3deg)}36%,100%{opacity:0;transform:scale(.8)}}
@media (prefers-reduced-motion:reduce){.m8-shout{opacity:1}}
@media (min-width:701px){.m8-brief{display:block;padding:0}.m8-text{position:absolute;left:16px;top:0;width:min(31vw,390px)}.m8-brief-boss{position:absolute;left:64.5%;top:0;width:min(25vh,210px)}}

.m8-keys{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.m8-inbox{grid-column:1/-1;justify-self:center;display:flex;align-items:center;gap:10px;min-width:min(100%,250px);padding:8px 16px;border:4px solid var(--sg-ink);border-radius:20px;background:var(--sg-sun);box-shadow:0 5px 0 var(--sg-ink)}
.m8-inbox.sg-pop{animation:sg-pop .32s cubic-bezier(.2,1.4,.4,1)}
.m8-inbox>svg{width:42px;height:42px;flex:0 0 auto}
.m8-inbox b{display:block;font:900 19px/1.1 var(--sg-font)}
.m8-inbox small{display:block;font:800 13px/1.2 var(--sg-font)}
.m8-inbox span{display:flex;gap:2px;margin-left:auto}
.m8-inbox span svg{width:30px;height:30px;animation:sg-pop .32s cubic-bezier(.2,1.4,.4,1)}
.m8-inbox.m8-safe{background:#c9f5d5}
.sg .m8-doorbtn{position:relative;display:grid;grid-template-columns:34px 1fr;column-gap:8px;align-items:center;padding:9px 10px;border:3px solid var(--sg-ink);border-radius:16px;background:#fff;box-shadow:0 4px 0 var(--sg-ink);text-align:left;font:900 15px/1.15 var(--sg-font)}
.sg .m8-doorbtn:hover:not(:disabled){background:#fff7cf}
.m8-doorbtn>svg{grid-row:1/3;width:34px;height:34px}
.m8-doorbtn kbd{position:absolute;top:-10px;left:-8px}
.m8-doorbtn small{font:800 12.5px/1.2 var(--sg-font);color:#7a4be0;text-decoration:underline}
.sg .m8-doorbtn.m8-sent{background:#ece9f5;box-shadow:none}
.m8-doorbtn.m8-sent small{color:#6a6288;text-decoration:none}
.m8-flykey{position:absolute;right:8px;top:50%;width:30px;height:30px;margin-top:-15px;pointer-events:none}
.m8-flykey svg{width:100%;height:100%}

.m8{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:6px 10px 10px;background:linear-gradient(rgba(58,30,92,.62),rgba(58,30,92,.3) 55%,rgba(58,30,92,.12))}
.m8::before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(rgba(255,70,70,.6),rgba(255,70,70,0) 75%);opacity:var(--alarm,0);pointer-events:none;animation:m8-flash 1.4s ease-in-out infinite}
@keyframes m8-flash{0%,100%{opacity:var(--alarm,0)}50%{opacity:calc(var(--alarm,0)*.35)}}
.m8>*{position:relative}
.m8-top{flex:0 0 auto;display:flex;flex-direction:column;gap:2px;width:min(100%,820px)}
.m8-bar{display:flex;align-items:center;justify-content:space-between;gap:8px}
.m8-round,.m8-clock{padding:5px 12px;border:3px solid var(--sg-ink);border-radius:999px;background:#fff;font:900 13.5px/1.1 var(--sg-font);white-space:nowrap}
.m8-round{background:var(--sg-sun)}
.m8-round.sg-pop,.m8-clock.sg-pop{animation:sg-pop .32s cubic-bezier(.2,1.4,.4,1)}
.m8-ring{display:flex;align-items:flex-start;justify-content:center;height:min(24vh,196px)}
.m8-alarms{flex:1;display:flex;justify-content:space-evenly;align-items:flex-start;padding-top:2px}
.m8-alarm{display:block;width:clamp(42px,10vmin,86px)}
.m8-alarm svg{width:100%;overflow:visible}
.m8-alarm.sg-pop{animation:sg-pop .32s cubic-bezier(.2,1.4,.4,1)}
.sg-art .m8-beam{transform-box:fill-box;transform-origin:center;animation:m8-beam 1s ease-in-out infinite}
@keyframes m8-beam{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.12)}}
.m8-bosswrap{position:relative;flex:0 0 auto;height:100%;aspect-ratio:300/232}
.m8-bosswrap.sg-shake{animation:sg-shake .38s}
.m8-boss{height:100%}
.m8-boss svg{width:100%;height:100%;overflow:visible}
.m8-boss.sg-pop{animation:sg-pop .32s cubic-bezier(.2,1.4,.4,1)}
.m8-slam .m8-bossbody{animation:m8-slam .34s ease-in}
@keyframes m8-slam{0%,100%{transform:translateY(0)}45%{transform:translateY(-16px)}75%{transform:translateY(12px)}}
.m8-hp{position:absolute;left:50%;bottom:-5px;translate:-50% 0;display:flex;align-items:center;gap:3px;padding:3px 9px;border:3px solid var(--sg-ink);border-radius:999px;background:#fff;white-space:nowrap;font:900 12.5px/1 var(--sg-font)}
.m8-hp b{margin-right:3px}
.m8-yell{position:absolute;left:77%;top:3%;z-index:2;width:max-content;max-width:min(150px,33vw);padding:5px 10px;border:3px solid var(--sg-ink);border-radius:14px 14px 14px 3px;background:#fff;color:var(--sg-ink);font:900 clamp(11.5px,1.8vmin,14px)/1.15 var(--sg-font);text-align:center;pointer-events:none;animation:sg-pop .3s cubic-bezier(.2,1.4,.4,1)}
.m8-hp i{width:19px;height:19px;transition:filter .3s,opacity .3s,transform .3s}
.m8-hp i svg{width:100%;height:100%}
.m8-hp i.m8-out{filter:grayscale(1);opacity:.3;transform:scale(.8) rotate(25deg)}
.m8-help{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:min(100%,760px);min-height:2.9em;padding:6px 14px;border:3px solid var(--sg-ink);border-radius:16px;background:#fff;font:800 14.5px/1.3 var(--sg-font);text-align:center}
.m8-help.sg-bad{background:#ffe2e2;color:#a11d2e}.m8-help.sg-ok{background:#d9f8e1;color:#14693a}
.m8-help.sg-pop{animation:sg-pop .32s cubic-bezier(.2,1.4,.4,1)}
.m8-field{position:relative;flex:1;min-height:0;width:min(100%,1080px)}
.m8-talking .m8-help,.m8-talking .m8-field{visibility:hidden}
.m8 .m8-splash{position:absolute;left:50%;top:52%;z-index:3;translate:-50% -50%;display:flex;flex-direction:column;align-items:center;gap:2px;padding:14px 34px;border:5px solid var(--sg-ink);border-radius:28px;background:var(--sg-sun);box-shadow:0 10px 0 var(--sg-ink);rotate:-3deg;white-space:nowrap;animation:m8-splash .45s cubic-bezier(.2,1.5,.4,1)}
.m8-splash small{font:900 15px/1 var(--sg-font);letter-spacing:3px;text-transform:uppercase;color:#7a4be0}
.m8-splash b{font:900 clamp(30px,7vmin,54px)/1.05 var(--sg-font)}
@keyframes m8-splash{from{transform:scale(2.6);opacity:0}}

.sg .m8-pop{position:absolute;translate:-50% -50%;rotate:var(--r,0deg);display:flex;align-items:center;gap:8px;width:min(46%,250px);min-height:58px;padding:9px 12px;border:4px solid var(--sg-ink);border-radius:20px;box-shadow:0 6px 0 var(--sg-ink);text-align:left;font:900 clamp(14px,2.1vmin,17px)/1.2 var(--sg-font)}
.m8-pop{animation:m8-popin .3s cubic-bezier(.2,1.5,.4,1)}
@keyframes m8-popin{from{transform:scale(0) rotate(-30deg)}}
.m8-pop kbd{position:absolute;top:-11px;left:-8px;text-shadow:none;text-decoration:none}
.m8-pop>svg{flex:0 0 auto;width:30px;height:30px}
.sg .m8-panic{justify-content:center;border-radius:999px;background:var(--sg-red);color:#fff;text-align:center;text-shadow:1px 1px 0 var(--sg-ink),-1px 1px 0 var(--sg-ink),1px -1px 0 var(--sg-ink),-1px -1px 0 var(--sg-ink)}
.m8-panic{animation:m8-popin .3s cubic-bezier(.2,1.5,.4,1),m8-jig .46s .3s ease-in-out infinite alternate}
@keyframes m8-jig{from{transform:rotate(-2.5deg) scale(1)}to{transform:rotate(2.5deg) scale(1.04)}}
.sg .m8-panic:hover:not(:disabled){filter:brightness(1.1)}
.sg .m8-panic:disabled{background:#cfcbe0;color:#6f6889;box-shadow:none;text-shadow:none;text-decoration:line-through;animation:none}
.sg .m8-calm{background:#d6f6ff}
.sg .m8-calm:hover{background:#fff}
.m8-pop.sg-shake{animation:sg-shake .38s}
.sg .m8-pop.m8-fizz{pointer-events:none;animation:m8-fizz .45s ease-in forwards}
@keyframes m8-fizz{to{transform:scale(0) rotate(50deg);opacity:0}}

.m8-r2,.m8-r3{display:flex;align-items:center;justify-content:center;gap:clamp(10px,3vmin,34px)}
.m8-doorway{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:8px}
.m8-doorway.sg-shake{animation:sg-shake .38s}
.m8-frame{position:relative;height:min(38vh,290px);aspect-ratio:10/13;border:5px solid var(--sg-ink);border-bottom-width:9px;border-radius:18px 18px 0 0;background:#2f2257;overflow:hidden}
.m8-visitor{position:absolute;left:24%;right:-4%;top:14%;bottom:0;animation:sg-bounce 1.1s ease-in-out infinite}
.m8-visitor svg{width:100%;height:100%}
.m8-visitor em{position:absolute;left:50%;bottom:7%;translate:-50% 0;rotate:-6deg;padding:2px 7px;border:2.5px solid var(--sg-ink);border-radius:6px;background:#fff;color:var(--sg-ink);font:900 clamp(9px,1.5vmin,12px)/1.15 var(--sg-font);font-style:normal;text-align:center;white-space:nowrap}
.m8-leaf{position:absolute;top:0;left:0;bottom:0;width:100%;border-right:5px solid var(--sg-ink);background:#c98b52;transform-origin:0 50%;transform:scaleX(.36);transition:transform .15s cubic-bezier(.4,1.9,.6,1)}
.m8-leaf::before,.m8-leaf::after{content:"";position:absolute;left:14%;right:16%;height:36%;border:4px solid #a8693f;border-radius:8px}
.m8-leaf::before{top:8%}.m8-leaf::after{bottom:8%}
.m8-leaf b{position:absolute;right:5%;top:50%;width:16px;height:16px;margin-top:-8px;border:3px solid var(--sg-ink);border-radius:50%;background:var(--sg-sun)}
.m8-shut .m8-leaf{transform:scaleX(1.03)}
.m8-open .m8-leaf{transform:scaleX(.09)}
.m8-open .m8-visitor{left:6%;right:6%}
.m8-padlock{position:absolute;left:50%;top:50%;width:36%;translate:-50% -50%;opacity:0;transform:scale(.3)}
.m8-padlock svg{width:100%}
.m8-shut .m8-padlock{opacity:1;transform:none;transition:opacity .15s .25s,transform .3s .25s cubic-bezier(.2,1.6,.4,1)}
.m8-slamword{position:absolute;left:50%;top:22%;width:112%;translate:-50% -50%;opacity:0;pointer-events:none}
.m8-shut .m8-slamword{animation:m8-slamword 1s ease-out both}
@keyframes m8-slamword{0%{opacity:0;transform:scale(.3) rotate(-14deg)}14%{opacity:1;transform:scale(1.15) rotate(-6deg)}22%,75%{opacity:1;transform:scale(1) rotate(-6deg)}100%{opacity:0;transform:scale(1) rotate(-6deg)}}
.m8-bolts{display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
.m8-bolt{display:flex;align-items:center;gap:5px;padding:4px 10px 4px 5px;border:3px solid var(--sg-ink);border-radius:999px;background:#ece9f5;color:#6f6889;font:900 12.5px/1.1 var(--sg-font);white-space:nowrap}
.m8-bolt svg{width:21px;height:21px}
.m8-bolt.m8-lit{background:var(--sg-red);color:#fff}
.m8-bolt.sg-pop{animation:sg-pop .32s cubic-bezier(.2,1.4,.4,1)}
.m8-msg{flex:0 1 470px;min-width:0;display:flex;flex-direction:column;border:4px solid var(--sg-ink);border-radius:22px;background:#fff;box-shadow:0 8px 0 var(--sg-ink);overflow:hidden}
.m8-msg.sg-pop{animation:sg-pop .32s cubic-bezier(.2,1.4,.4,1)}
.m8-msg-top{display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:4px solid var(--sg-ink);background:var(--sg-sun);font:900 14px/1.2 var(--sg-font)}
.m8-msg-top svg{flex:0 0 auto;width:24px;height:24px}
.m8-msg-top b{flex:1;min-width:0}
.m8-msg-top span{white-space:nowrap}
.m8-bits{display:grid;gap:8px;padding:11px 12px 6px}
.sg .m8-bit{display:flex;align-items:center;gap:9px;width:100%;padding:10px 12px;border:3px solid var(--sg-ink);border-radius:16px;background:#fff;box-shadow:0 4px 0 var(--sg-ink);text-align:left;font:800 clamp(14.5px,2.1vmin,16.5px)/1.25 var(--sg-font)}
.sg .m8-bit:hover:not(:disabled){background:#fff7cf}
.m8-bit>span{flex:1;min-width:0}
.m8-bit em{flex:0 0 auto;padding:3px 8px;border-radius:999px;background:var(--sg-red);color:#fff;font:900 11px/1.2 var(--sg-font);font-style:normal;letter-spacing:.6px;white-space:nowrap}
.sg .m8-bit.m8-sign{background:#ffe2e2;box-shadow:none;outline:3px solid var(--sg-red);outline-offset:1px}
.sg .m8-bit.m8-fine{background:#ece9f5;color:#6f6889;box-shadow:none}
.m8-bit.sg-shake,.m8-let.sg-shake{animation:sg-shake .38s}
.m8 .m8-let{margin:6px 12px 13px}

.m8-sheet{position:relative;flex:0 1 450px;min-width:0;padding:10px 12px 9px;border:4px solid var(--sg-ink);border-radius:8px 22px 22px 22px;background:#fffdf3;box-shadow:0 8px 0 rgba(43,33,71,.35);rotate:-1deg}
.m8-sheet-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding-bottom:5px;border-bottom:3px dashed var(--sg-ink)}
.m8-sheet-top b{font:900 18px/1.1 var(--sg-font)}
.m8-sheet-top small,.m8-sheet-foot{font:800 12px/1.2 var(--sg-font);color:#6a6288}
.m8-sheet-foot{display:block;margin-top:6px;text-align:center}
.m8-row{position:relative;display:grid;grid-template-columns:36px minmax(0,.72fr) minmax(0,1.5fr);align-items:center;gap:8px;margin-top:7px;padding:5px 7px;border:3px solid var(--sg-ink);border-radius:14px;background:#f2effa}
.m8-row .sg-face{width:36px;height:36px;background:#fff}
.m8-row>b{font:900 14.5px/1.15 var(--sg-font)}
.m8-slot{display:flex;flex-direction:column;justify-content:center;min-height:42px;padding:3px 8px;border:3px dashed #a39cc0;border-radius:10px;font:900 13.5px/1.2 var(--sg-font);color:#8a84a3}
.m8-slot small{font:700 11.5px/1.2 var(--sg-font);color:#5d5578}
.m8-row.m8-down{background:#ffe2e2;animation:m8-down .8s ease-in-out infinite}
.m8-row.m8-down .m8-slot{border-color:var(--sg-red);color:#a11d2e}
@keyframes m8-down{0%,100%{box-shadow:0 0 0 0 rgba(255,93,93,0)}50%{box-shadow:0 0 0 7px rgba(255,93,93,.6)}}
.m8-row.sg-over{outline:4px dashed var(--sg-ink);outline-offset:2px}
.m8-row.m8-ok{background:#d9f8e1}
.m8-row.m8-ok .m8-slot{border-style:solid;border-color:var(--sg-ink);background:#fff;color:var(--sg-ink)}
.m8-row.sg-pop{animation:sg-pop .32s cubic-bezier(.2,1.4,.4,1)}
.m8-hand{flex:0 1 430px;min-width:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px 9px;align-content:center}
.sg .m8-card{position:relative;display:flex;flex-direction:column;justify-content:center;gap:2px;min-height:62px;padding:8px 10px 7px 16px;border:3px solid var(--sg-ink);border-radius:14px;background:var(--sg-cream);box-shadow:0 5px 0 var(--sg-ink);text-align:left;cursor:grab;font:900 14px/1.2 var(--sg-font)}
.sg .m8-card:hover:not(:disabled){background:#fff}
.m8-card small{font:700 11.5px/1.2 var(--sg-font);color:#5d5578}
.m8-card kbd{position:absolute;top:-11px;left:-9px;text-decoration:none}
.m8-card.sg-shake{animation:sg-shake .38s}
.sg .m8-card.m8-used{border-style:dashed;border-color:#a39cc0;background:rgba(255,255,255,.35);box-shadow:none;cursor:default}
.m8-card.m8-used>*{visibility:hidden}
.m8-hand.m8-done .m8-used{display:none}
.sg .m8-card.m8-never{background:#ece9f5;color:#8a84a3;box-shadow:none;text-decoration:line-through;cursor:default}
.m8-printbox{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:8px}
.m8-stamp{position:absolute;left:50%;top:50%;z-index:2;translate:-50% -50%;rotate:-12deg;padding:6px 18px;border:6px solid #1f9a4d;border-radius:14px;background:rgba(255,255,255,.93);color:#1f9a4d;font:900 clamp(30px,6.4vmin,48px)/1 var(--sg-font);letter-spacing:3px;animation:m8-stamp .34s cubic-bezier(.2,1.4,.4,1)}
@keyframes m8-stamp{from{transform:scale(3.2);opacity:0}}
.m8-sheet.m8-printed{animation:m8-printed .5s ease-out}
@keyframes m8-printed{0%{transform:translateY(-10px)}30%{transform:translateY(6px) rotate(1deg)}100%{transform:none}}

.m8-letter{display:grid;gap:6px;padding:9px 10px 10px;border:3px solid var(--sg-ink);border-radius:6px 18px 18px 18px;background:#fffdf3}
.m8-letter-top{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 10px;padding-bottom:5px;border-bottom:3px dashed #cfc8e6;font:900 13px/1.2 var(--sg-font)}
.m8-letter-top span{color:#6a6288}
.sg .m8-line{position:relative;display:flex;align-items:center;gap:9px;width:100%;padding:7px 10px;border:3px solid var(--sg-ink);border-radius:13px;background:#fff;box-shadow:0 3px 0 var(--sg-ink);text-align:left;font:700 clamp(13.5px,2vmin,15.5px)/1.3 var(--sg-font)}
.m8-line{animation:sg-pop .25s}
.sg .m8-line:hover:not(:disabled){background:#fff7cf}
.sg .m8-line.m8-fact{background:#e6f9eb;color:#3f7d55;box-shadow:none}
.sg .m8-line.m8-guess{background:var(--sg-sun);box-shadow:none;outline:4px solid var(--sg-red);outline-offset:1px}
.sg .m8-line.m8-fixed{background:#c9f5d5;box-shadow:none;font-weight:900}
.m8-line.sg-shake,.m8-fix.sg-shake{animation:sg-shake .38s}
.m8-fixes{display:grid;gap:8px;margin-top:10px}
.sg .m8-fix{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border:3px solid var(--sg-ink);border-radius:16px;background:#fff;box-shadow:0 4px 0 var(--sg-ink);text-align:left;font:800 15px/1.3 var(--sg-font)}
.sg .m8-fix:hover:not(:disabled){background:#fff7cf}
.sg .m8-fix:disabled{background:#ece9f5;color:#8a84a3;box-shadow:none;text-decoration:line-through}
.m8-photo{display:flex;align-items:center;gap:10px;margin-top:10px;padding:8px 10px;border:3px solid var(--sg-ink);border-radius:18px 18px 18px 6px;background:#fff;animation:sg-pop .32s cubic-bezier(.2,1.4,.4,1)}
.m8-photo .sg-face{background:#ffd9a8}
.m8-photo>div{flex:1;min-width:0}
.m8-photo small{display:block;margin-bottom:3px;font:900 11.5px/1.2 var(--sg-font);letter-spacing:.5px;text-transform:uppercase;color:#7a4be0}
.m8-screen{display:block;padding:8px 11px;border:3px solid var(--sg-ink);border-radius:10px;background:#1d2a55;color:#7dfbff;font:800 14.5px/1.3 var(--sg-font)}
.m8-sendrow{display:flex;justify-content:center;margin-top:10px}

@media (max-height:700px){
  .m8-ring{height:min(20vh,128px)}
  .m8-tight .m8-ring{height:min(14vh,92px)}
  .m8-alarm{width:clamp(34px,8vmin,56px)}
}
@media (max-width:700px){
  .m8-brief{top:1%}
  .m8-brief-boss{width:min(22vh,42vw,190px)}
  .m8{padding:5px 8px 8px;gap:5px}
  .m8-ring{height:min(18.5vh,156px)}
  .m8-tight .m8-ring{height:min(13vh,110px)}
  .m8-tight .m8-alarm{width:34px}
  .m8-round,.m8-clock{padding:4px 10px;font-size:12.5px}
  .m8-help{min-height:3.2em;padding:5px 10px;font-size:13.5px}
  .sg .m8-pop{width:47%;min-height:54px;padding:8px 9px;font-size:14px;gap:6px}
  .m8-pop>svg{width:24px;height:24px}
  .m8-r2,.m8-r3{flex-direction:column;justify-content:flex-start;gap:8px}
  .m8-doorway{flex-direction:row;gap:10px}
  .m8-frame{height:min(18vh,152px)}
  .m8-bolts{flex-direction:column;align-items:flex-start}
  .m8-msg{flex:0 0 auto;width:100%}
  .m8-bits{gap:7px;padding:9px 10px 4px}
  .sg .m8-bit{padding:8px 10px;font-size:14.5px}
  .m8 .m8-let{margin:5px 10px 10px;padding:9px 14px;font-size:16px}
  .m8-sheet{flex:0 0 auto;width:100%;padding:7px 9px 6px;rotate:0deg}
  .m8-sheet-top b{font-size:16px}
  .m8-row{grid-template-columns:30px minmax(0,.7fr) minmax(0,1.5fr);gap:6px;margin-top:5px;padding:3px 5px}
  .m8-row .sg-face{width:30px;height:30px}
  .m8-row>b{font-size:13px}
  .m8-slot{min-height:38px;padding:2px 6px;font-size:12.5px}
  .m8-slot small{font-size:11px}
  .m8-sheet-foot{margin-top:4px;font-size:11.5px}
  .m8-hand{flex:0 0 auto;width:100%;gap:9px 7px}
  .sg .m8-card{min-height:56px;padding:6px 8px 5px 13px;font-size:13px}
  .m8-card small{font-size:11px}
  .sg .m8-line{padding:6px 9px}
}
`;
  /* What the caught screen gains for the last case: the seven bandits already in the net come back
     to watch. This sits in the stage itself (styles and all), so it leaves when the screen does. */
  const GANG_CSS = `
.m8-gang{position:absolute;left:0;right:0;bottom:60.5%;z-index:1;display:flex;align-items:flex-end;justify-content:center;height:min(13.5vh,112px);pointer-events:none}
.m8-gang-l,.m8-gang-r{flex:1;display:flex;align-items:flex-end;gap:2px;height:100%}
.m8-gang-l{justify-content:flex-end}
.m8-gang-gap{flex:0 0 calc(min(34vh,260px)*.93)}
.m8-gang i{display:block;height:100%;aspect-ratio:200/220;animation:m8-gangin .55s cubic-bezier(.2,1.5,.4,1) both;animation-delay:calc(1s + var(--i)*.14s)}
.m8-gang svg{width:100%;height:100%;overflow:visible}
@keyframes m8-gangin{from{transform:translateY(-160%) scale(.4);opacity:0}}
.m8-gang-tag{position:absolute;left:50%;top:calc(100% + min(21vh,160px));translate:-50% 0;padding:5px 14px;border:3px solid var(--sg-ink);border-radius:999px;background:var(--sg-sun);font:900 14px/1.1 var(--sg-font);white-space:nowrap;animation:m8-gangin .55s 2s cubic-bezier(.2,1.5,.4,1) both}
@media (max-width:700px){
  .m8-gang{bottom:47%;height:auto;justify-content:space-between;padding:0 3px}
  .m8-gang-l,.m8-gang-r{flex:0 0 auto;flex-direction:column;align-items:center;gap:0;width:min(17vw,70px);height:auto}
  .m8-gang-gap{display:none}
  .m8-gang i{width:100%;height:auto}
  .m8-gang-tag{top:auto;bottom:calc(min(34vh,260px) - 3vh + 6px);font-size:13px;padding:4px 12px}
}
`;
  function grandCatch(stage) {
    try {
      if (!stage || !stage.classList.contains("sg-s-caught") || !OH.game.bandits) return;
      const keys = Object.keys(OH.game.bandits).map(Number).sort((a, b) => a - b).filter((w) => w !== 8).map((w) => OH.game.bandits[w].key).filter((k) => A.cast[k]);
      const one = (k, i) => h("i", { style: "--i:" + i }, A.character(k, { mood: "caught", net: true }));
      const half = Math.ceil(keys.length / 2);
      stage.appendChild(h("div", { class: "m8-gang", "aria-hidden": "true" }, h("style", null, GANG_CSS),
        h("div", { class: "m8-gang-l" }, keys.slice(0, half).map(one)), h("div", { class: "m8-gang-gap" }),
        h("div", { class: "m8-gang-r" }, keys.slice(half).map((k, i) => one(k, i + half))), h("b", { class: "m8-gang-tag" }, "All eight, in the net")));
    } catch (e) { /* the catch is still a catch without the extras */ }
  }

  // ── the briefing's extra art: Luis's text, and Captain Chaos at his panic console ──
  function briefArt(kit) {
    kit.style(CSS);
    const shout = (text, n) => h("span", { class: "m8-shout", style: "--n:" + n }, text);
    kit.stage.appendChild(h("div", { class: "m8-brief" },
      h("div", { class: "m8-text" }, h("span", { class: "sg-face" }, A.avatar("luis", { mood: "worried" })),
        h("div", null, h("small", null, "Luis · Friday, 4:41 PM"), h("p", null, "hey boss the card thing isnt working again. it just spins and then says something about connection??"))),
      h("div", { class: "m8-brief-boss" }, bossArt(0), shout("Restart everything!", 0), shout("Buy a new one!", 1), shout("Five fixes at once!", 2))));
  }

  // ── stop 2's own challenge: every "forgot password" link lands in one inbox. Then pick its locks. ──
  /* Penny's practice board. The agent watches where each reset link goes, then picks the two locks
     Jordan should put on that inbox. Nothing here takes a password, and nothing must. */
  const DOORS = [["The bank", "coins"], ["The books", "book"], ["The website", "sign"], ["The card reader", "m8reader"]];
  const LOCKS = [
    { text: "A password manager", ok: true, why: "Jordan remembers one long password. It remembers the rest." },
    { text: "The dog's name, plus 1", ok: false, why: "Biscuit1 is the first thing anybody tries." },
    { text: "Two-step login", ok: true, why: "A password, then a code from Jordan's phone. Jordan prints the backup codes." },
    { text: "The same password as the bank", ok: false, why: "Then one leak opens both doors." },
    { text: "A sticky note on the screen", ok: false, why: "Easy to remember. Easy to read, too." }
  ];
  function masterKey(kit, spec, done) {
    kit.style(CSS);
    const p = kit.panel({ kicker: "My turn", title: kit.fill(spec.ask), who: spec.who }), title = p.el.querySelector("h2");
    const count = h("small", null, "No reset links yet"), locks = h("span"), inbox = h("div", { class: "m8-inbox" }, A.icon("envelope"), h("div", null, h("b", null, "Jordan's email"), count), locks);
    const grid = h("div", { class: "m8-keys" }, inbox);
    let got = 0;
    const doors = DOORS.map((d, n) => h("button", { class: "m8-doorbtn", type: "button", onclick: () => knock(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), A.icon(d[1]), h("b", null, d[0]), h("small", null, "Forgot password?")));
    doors.forEach((b) => grid.appendChild(b)); p.body.appendChild(grid);
    function knock(n) {
      const b = doors[n]; if (b.disabled) return;
      b.disabled = true; b.classList.add("m8-sent"); b.querySelector("small").textContent = "Its link went to the email";
      const key = h("i", { class: "m8-flykey" }, A.icon("m8key")); b.appendChild(key); S.play("zip");
      kit.fx.fly(key, inbox, () => {
        key.remove(); got++; count.textContent = got + (got === 1 ? " reset link" : " reset links") + " in here"; kit.fx.pop(inbox); S.play("pop");
        if (got === DOORS.length) { p.say("Four doors, one inbox. Whoever opens the email can open them all.", "ok"); kit.after(1500, lockIt); }
      });
    }
    let offKeys = kit.keys({ "1": () => knock(0), "2": () => knock(1), "3": () => knock(2), "4": () => knock(3) });
    kit.focus(doors[0]);
    function lockIt() {
      offKeys(); doors.forEach((b) => b.remove());
      title.textContent = "Which locks should Jordan put on that inbox? Tap the two strongest."; kit.fx.pop(title); p.say("");
      let found = 0;
      const chips = LOCKS.map((l, n) => h("button", { class: "sg-chip", type: "button", onclick: () => pick(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), h("span", null, l.text)));
      function pick(n) {
        const l = LOCKS[n], b = chips[n]; if (b.disabled || found >= 2) return;
        b.disabled = true;
        if (!l.ok) { b.classList.add("sg-no"); kit.fx.shake(b); kit.score.wrong(); return p.say(l.why, "bad"); }
        b.classList.add("sg-yes"); found++; kit.score.right(); locks.appendChild(A.icon("lock", { color: C.sun })); kit.fx.pop(inbox); p.say(l.why, "ok");
        if (found >= 2) { inbox.classList.add("m8-safe"); count.textContent = "Locked twice"; kit.after(1500, () => { p.close(); done(); }); }
      }
      const row = h("div", { class: "sg-chips", style: "grid-column:1/-1" }, chips); grid.appendChild(row);
      offKeys = kit.keys({ "1": () => pick(0), "2": () => pick(1), "3": () => pick(2), "4": () => pick(3), "5": () => pick(4) });
      kit.focus(chips[0]);
    }
  }

  // ── the showdown: the Friday showdown, a boss fight in three rounds ──
  /* play(kit, done) is the whole fight. The engine hands over an empty stage and the kit; nothing
     needs cleaning up, because every kit timer, key map, drag and style leaves with the screen. */
  async function fridayShowdown(kit, done) {
    kit.backdrop("workshop", { gray: true });
    kit.style(CSS);

    // what every round shares: the round and the clock, Captain Chaos at his console, four alarms, a line of help, the field
    const roundTag = h("span", { class: "m8-round" }), clockTag = h("span", { class: "m8-clock" });
    const bossEl = h("div", { class: "m8-boss" }), pips = [0, 1, 2].map(() => h("i", null, A.icon("bolt")));
    const bossWrap = h("div", { class: "m8-bosswrap" }, bossEl, h("div", { class: "m8-hp" }, h("b", null, "Captain Chaos"), pips));
    const lamps = [0, 1, 2, 3].map(() => h("i", { class: "m8-alarm" }));
    const help = h("div", { class: "m8-help", role: "status", "aria-live": "polite" }), field = h("div", { class: "m8-field" });
    const wrap = h("div", { class: "m8" }, h("div", { class: "m8-top" }, h("div", { class: "m8-bar" }, roundTag, clockTag),
      h("div", { class: "m8-ring" }, h("div", { class: "m8-alarms" }, lamps[0], lamps[1]), bossWrap, h("div", { class: "m8-alarms" }, lamps[2], lamps[3]))), help, field);
    kit.stage.appendChild(wrap);
    const say = (text, tone) => { help.textContent = text; help.className = "m8-help" + (tone ? " sg-" + tone : ""); kit.fx.pop(help); };
    const clock = (t) => { clockTag.textContent = "Friday, " + t + " PM"; kit.fx.pop(clockTag); };
    const lamp = (n, on) => { lamps[n].innerHTML = ""; lamps[n].appendChild(alarmArt(on)); if (!on) kit.fx.pop(lamps[n]); };
    let level = 0, away = false, yell = null;
    const boss = {
      draw: () => { bossEl.innerHTML = ""; bossEl.appendChild(bossArt(level, away)); },
      slam: () => { bossEl.classList.remove("m8-slam"); void bossEl.offsetWidth; bossEl.classList.add("m8-slam"); S.play("m8alarm"); },
      hop: () => kit.fx.pop(bossEl),
      shout: (text) => { if (yell) yell.remove(); yell = null; if (away) return; const mine = (yell = h("span", { class: "m8-yell" }, text)); bossWrap.appendChild(mine); kit.after(1700, () => mine.remove()); },
      hit: () => { if (pips[level]) pips[level].classList.add("m8-out"); level = Math.min(3, level + 1); boss.draw(); kit.fx.shake(bossWrap); S.play("oops"); },
      step: (yes) => { away = yes; if (yes && yell) yell.remove(); boss.draw(); }                        // he jumps down from the console to talk, and back up again
    };
    const round = (text) => { roundTag.textContent = text; kit.fx.pop(roundTag); };
    function splash(n, name) {
      round("Round " + n + " of 3 · " + name); field.className = "m8-field"; field.innerHTML = ""; help.textContent = ""; help.className = "m8-help";
      const el = h("div", { class: "m8-splash" }, h("small", null, "Round " + n), h("b", null, name));
      wrap.appendChild(el); S.play("whoosh");
      return kit.wait(1150).then(() => el.remove());
    }
    /* A few lines of talk between rounds: the field steps aside and the actors come on. */
    async function talk(cast, lines) {
      const withBoss = cast.some((c) => c.who === "chaos");
      wrap.classList.add("m8-talking"); if (withBoss) boss.step(true);
      kit.cast(cast); await kit.say(lines); kit.hush(); kit.cast([]);
      if (withBoss) boss.step(false); wrap.classList.remove("m8-talking");
    }
    lamps.forEach((l, n) => lamp(n, true)); boss.draw(); clock("4:48"); round("Friday, 4:48 PM");

    // Round 1 · Stay calm: panic buttons pop up all over the wall. Leave them. Tap the calm questions.
    await splash(1, "Stay calm");
    await new Promise((finish) => {
      field.className = "m8-field m8-wall"; wrap.style.setProperty("--alarm", "1");
      const cols = field.clientWidth < 640 ? 2 : 4, rows = cols === 2 ? 5 : 3, free = [], live = {};
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) free.push([(c + 0.5) / cols, (r + 0.5) / rows]);
      const jitter = (k) => (Math.random() - 0.5) * k;
      let busy = true, step = 0;
      function pop(kind, data) {                       // a new button lands on a free spot of the wall, with the lowest free number
        const spot = free.splice(Math.floor(Math.random() * free.length), 1)[0]; let n = 1; while (live[n]) n++;
        const el = h("button", { class: "m8-pop m8-" + kind, type: "button", onclick: () => press(n),
          style: "left:" + ((spot[0] + jitter(0.03)) * 100).toFixed(1) + "%;top:" + ((spot[1] + jitter(0.05)) * 100).toFixed(1) + "%;--r:" + jitter(kind === "calm" ? 3 : 9).toFixed(1) + "deg" },
          h("kbd", { "aria-hidden": "true" }, String(n)), kind === "calm" ? A.icon("m8ask") : null, h("span", null, data.text));
        live[n] = { el: el, kind: kind, data: data, spot: spot }; field.appendChild(el); S.play("pop");
      }
      function wave() {                                // Captain Chaos slams the console: two more panic buttons, and one calm question among them
        busy = true; boss.slam(); boss.shout(["Press something!", "Anything! Quick!", "Why so calm?!", "Stop asking!"][step]);
        const order = Math.random() < 0.5 ? ["panic", "calm", "panic"] : ["calm", "panic", "panic"]; let p = step * 2;
        order.forEach((kind, i) => kit.after(240 + i * 170, () => pop(kind, kind === "calm" ? QUESTIONS[step] : PANIC[p++])));
        kit.after(240 + order.length * 170, () => { busy = false; let n = 1; while (n < 10 && !(live[n] && !live[n].el.disabled)) n++; if (live[n]) kit.focus(live[n].el); });
      }
      function press(n) {
        const b = live[n]; if (!b || busy || b.el.disabled) return;
        if (b.kind === "panic") { b.el.disabled = true; kit.score.wrong(); kit.fx.shake(b.el); boss.hop(); boss.shout("Hee hee! More!"); return say(b.data.why, "bad"); }   // a wrong pick: the engine counts it
        busy = true; delete live[n]; free.push(b.spot); kit.score.right();
        kit.fx.fly(b.el, lamps[step], () => {
          b.el.remove(); lamp(step, false); S.play("m8off"); say(b.data.note, "ok");
          step++; wrap.style.setProperty("--alarm", String(1 - step / QUESTIONS.length));
          if (step < QUESTIONS.length) return kit.after(1500, wave);
          offKeys(); Object.keys(live).forEach((k) => live[k].el.classList.add("m8-fizz"));   // the last alarm is off: every panic button fizzles out
          kit.after(1300, () => { boss.hit(); boss.shout("My alarms!"); clock("4:51"); kit.after(1500, finish); });
        });
      }
      const keys = {}; for (let n = 1; n <= 9; n++) keys[String(n)] = () => press(n);
      const offKeys = kit.keys(keys);
      say("Captain Chaos is popping panic buttons. I leave them alone. Tap the calm question, or press its number.");
      wave();
    });

    // Sprout's shortcut · Sprout, the trainer, drafts the support request in two seconds, and guesses the cause. Catch it, then fix it.
    round("Sprout's shortcut");
    await talk([{ who: "chaos", side: "left", mood: "sneaky" }, { who: "sprout", side: "right", mood: "happy" }], [
      { who: "chaos", mood: "sneaky", say: "Four questions and not one restart? Fine. You still do not know WHY it broke. Hee hee." },
      { who: "sprout", mood: "proud", pose: "cheer", say: "I do! Watch my shortcut, {name}. A request for support in two seconds, cause and all. Copy me!" }
    ]);
    wrap.classList.add("m8-talking");
    const p = kit.panel({ kicker: "Sprout's shortcut", title: "Sprout drafts the request for card reader support...", who: "sprout" }), title = p.el.querySelector("h2");
    const lines = REQUEST.map((r, n) => h("button", { class: "m8-line", type: "button", disabled: true }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), h("span", null, r.text)));
    const letter = h("div", { class: "m8-letter" }, h("div", { class: "m8-letter-top" }, h("b", null, "Draft · To: card reader support"), h("span", null, "From: Greenline")));
    p.body.appendChild(letter);
    await new Promise((resolve) => {                   // six lines zip onto the page
      let n = 0;
      const stop = kit.every(190, () => { letter.appendChild(lines[n]); S.play("zip"); if (++n >= lines.length) { stop(); kit.after(500, resolve); } });
    });
    title.textContent = "I check before I copy. One line is a guess, not a fact. Tap it."; kit.fx.pop(title);
    p.say("Sprout: Done. Two seconds! Copy it. I am very sure about the cause.");
    let tries = 0;
    const found = await new Promise((resolve) => {
      const pick = (n) => {
        const el = lines[n]; if (el.disabled) return;
        if (!REQUEST[n].guess) { tries++; el.disabled = true; el.classList.add("m8-fact"); kit.score.wrong(); kit.fx.shake(el); return p.say(REQUEST[n].why + " I look again.", "bad"); }
        off(); lines.forEach((x) => { x.disabled = true; }); el.classList.add("m8-guess"); kit.score.right();
        kit.score.sprout(tries === 0);                 // the second star: Sprout's slip caught on the first try
        resolve(el);
      };
      lines.forEach((el, n) => { el.disabled = false; el.onclick = () => pick(n); });
      const keys = {}; lines.forEach((el, n) => { keys[String(n + 1)] = () => pick(n); });
      const off = kit.keys(keys); kit.focus(lines[0]);
    });
    title.textContent = "Two things changed, and Sprout blamed one. What do I put on that line instead?"; kit.fx.pop(title);
    p.say("Sprout: Oops. I guessed. My shortcut skipped the proof.", "ok");
    const fixes = h("div", { class: "m8-fixes" }); p.body.appendChild(fixes);
    await new Promise((resolve) => {
      const opts = FIXES.map((f, n) => h("button", { class: "m8-fix", type: "button", onclick: () => pick(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), h("span", null, f.text)));
      const pick = (n) => {
        const b = opts[n]; if (b.disabled) return;
        if (!FIXES[n].right) { b.disabled = true; kit.score.wrong(); kit.fx.shake(b); return p.say(FIXES[n].why, "bad"); }
        off(); kit.score.right(); resolve();
      };
      opts.forEach((b) => fixes.appendChild(b));
      const off = kit.keys({ "1": () => pick(0), "2": () => pick(1), "3": () => pick(2) }); kit.focus(opts[0]);
    });
    fixes.remove(); S.play("m8buzz");                  // Luis sends a photo of the screen, and the guess becomes the exact words
    p.body.appendChild(h("div", { class: "m8-photo" }, h("span", { class: "sg-face" }, A.avatar("luis", { mood: "glad" })), h("div", null, h("small", null, "Luis sent a photo of the screen"), h("b", { class: "m8-screen" }, WORDS))));
    found.className = "m8-line m8-fixed"; found.querySelector("span").textContent = "The screen says: \"" + WORDS + "\""; kit.fx.pop(found);
    title.textContent = "The exact words, and not one guess. Ready for Jordan to send."; kit.fx.pop(title);
    p.say("Sprout: Good catch. My shortcut skipped the exact words. No more guessing the cause.", "ok");
    await new Promise((resolve) => {
      const send = h("button", { class: "sg-btn sg-primary", type: "button", onclick: () => { S.play("whoosh"); resolve(); } }, A.icon("envelope"), "Save the draft for Jordan");
      p.body.appendChild(h("div", { class: "m8-sendrow" }, send)); kit.focus(send);
    });
    p.close(); wrap.classList.remove("m8-talking"); clock("4:53");

    // Round 2 · Lock the doors: Captain Chaos knocks in disguise. Tag every sign of a trick and the door slams.
    await talk([{ who: "chaos", side: "left", mood: "sneaky" }, { who: "sprout", side: "right", mood: "happy" }], [
      { who: "chaos", mood: "sneaky", say: "Exact words. Pah! Who needs the card reader? I will stroll in through the email." },
      { who: "sprout", mood: "think", say: "The email is the master key. Watch for pressure, a link, or a request for a password or money." }
    ]);
    await splash(2, "Lock the doors");
    await new Promise((finish) => {
      field.className = "m8-field m8-r2";
      const visitor = h("div", { class: "m8-visitor" }), frame = h("div", { class: "m8-frame" }, visitor, h("div", { class: "m8-leaf" }, h("b")),
        h("div", { class: "m8-padlock" }, A.icon("lock", { color: C.sun })), h("div", { class: "m8-slamword" }, A.word("SLAM!", { color: "#fff" })));
      const bolt = {}, boltRow = h("div", { class: "m8-bolts" }, Object.keys(SIGNS).map((k) => (bolt[k] = h("span", { class: "m8-bolt" }, A.icon(SIGNS[k].icon), SIGNS[k].label))));
      const doorway = h("div", { class: "m8-doorway" }, frame, boltRow);
      const from = h("b"), nth = h("span"), bits = h("div", { class: "m8-bits" });
      const letBtn = h("button", { class: "sg-btn m8-let", type: "button" }, h("kbd", { "aria-hidden": "true" }, "L"), "No tricks here. Let it in");
      const msg = h("div", { class: "m8-msg" }, h("div", { class: "m8-msg-top" }, A.icon("envelope"), from, nth), bits, letBtn);
      field.appendChild(doorway); field.appendChild(msg);
      function knock(i) {
        const m = MESSAGES[i]; let left = m.bits.filter((b) => b.sign).length, over = false;
        frame.className = "m8-frame"; visitor.innerHTML = ""; visitor.appendChild(visitorArt(m)); if (m.tag) visitor.appendChild(h("em", null, m.tag));
        boss.step(!m.real);                            // he is at the door in a disguise, so his console is empty (and he is back at it while Nell knocks)
        Object.keys(bolt).forEach((k) => bolt[k].classList.remove("m8-lit"));
        from.textContent = "From: " + m.from; nth.textContent = (i + 1) + " of " + MESSAGES.length; bits.innerHTML = "";
        const chips = m.bits.map((b, n) => h("button", { class: "m8-bit", type: "button", onclick: () => tap(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), h("span", null, kit.fill(b.text))));
        chips.forEach((c) => bits.appendChild(c)); letBtn.disabled = false; kit.fx.pop(msg); S.play("m8knock");
        if (i) say("Knock, knock. Message " + (i + 1) + " of " + MESSAGES.length + ". Do I see a sign of a trick?");
        const next = () => { off(); chips.forEach((c) => { c.disabled = true; }); letBtn.disabled = true; kit.after(1900, () => (i + 1 < MESSAGES.length ? knock(i + 1) : finish())); };
        function tap(n) {
          const b = m.bits[n], el = chips[n]; if (over || el.disabled) return;
          el.disabled = true;
          if (!b.sign) { el.classList.add("m8-fine"); kit.score.wrong(); kit.fx.shake(el); return say(m.real ? "Nothing wrong with that bit. No pressure, no link, nothing asked for." : "That bit is harmless. I look for pressure, a link, or a request.", "bad"); }
          el.classList.add("m8-sign"); el.appendChild(h("em", null, SIGNS[b.sign].tag)); bolt[b.sign].classList.add("m8-lit"); kit.fx.pop(bolt[b.sign]); S.play("m8clack");
          if (--left > 0) return say(SIGNS[b.sign].found, "ok");
          over = true; frame.classList.add("m8-shut"); S.play("m8slam"); kit.score.right(); kit.fx.shake(doorway); boss.hop(); say(m.done, "ok"); next();   // every sign tagged: the door slams
        }
        function letIn() {
          if (over || letBtn.disabled) return;
          if (!m.real) { kit.score.wrong(); kit.fx.shake(letBtn); boss.hop(); return say("Hold the door! There is a trick in that one. I look for pressure, a link, or a request.", "bad"); }
          over = true; frame.classList.add("m8-open"); kit.score.right(); say(m.done, "ok"); next();
        }
        letBtn.onclick = letIn;
        const off = kit.keys({ "1": () => tap(0), "2": () => tap(1), "3": () => tap(2), l: letIn });
        kit.focus(chips[0]);
      }
      say("I check every message before I act on it. Tap each sign of a trick and the door slams. No signs? Let it in.");
      knock(0);
    });
    boss.step(false); boss.hit(); clock("4:56"); await kit.wait(1000);

    // Round 3 · Who do we call? He breaks the tools one by one. Snap the right card onto each row, then print the page.
    await talk([{ who: "chaos", side: "left", mood: "surprised" }, { who: "sprout", side: "right", mood: "happy" }], [
      { who: "chaos", mood: "surprised", say: "Locked out! Then I will break EVERYTHING. And who will you call? WHO?" },
      { who: "sprout", mood: "think", pose: "shrug", say: "Um. Good question. I never wrote it down, {name}. So draft the page: who owns it, who to call." }
    ]);
    await splash(3, "Who do we call?");
    await new Promise((finish) => {
      field.className = "m8-field m8-r3"; wrap.classList.add("m8-tight");
      const rows = TOOLS.map((t) => { const slot = h("div", { class: "m8-slot" }, "Who do we call?"); return { tool: t, slot: slot, el: h("div", { class: "m8-row" }, h("span", { class: "sg-face" }, A.icon(t.icon)), h("b", null, t.name), slot) }; });
      const sheet = h("div", { class: "m8-sheet" }, h("div", { class: "m8-sheet-top" }, h("b", null, "When it breaks"), h("small", null, "Greenline, one page")), rows.map((r) => r.el), h("small", { class: "m8-sheet-foot" }, "Never a password on this page."));
      const hand = h("div", { class: "m8-hand" });
      const cards = CARDS.map((c, n) => h("button", { class: "m8-card", type: "button", onclick: () => play(n) }, h("kbd", { "aria-hidden": "true" }, String(n + 1)), h("small", null, c.own), h("b", null, c.call)));
      cards.forEach((el) => hand.appendChild(el)); field.appendChild(sheet); field.appendChild(hand);
      let cur = -1, busy = true;
      const nameOf = (key) => TOOLS.find((t) => t.key === key).name.toLowerCase();
      function breakNext() {                           // the next tool goes down, and its row flashes
        cur++;
        if (cur >= rows.length) return print();
        boss.slam(); boss.shout(["The reader is down!", "Now the email!", "The website too!", "And the books!"][cur]); rows[cur].el.classList.add("m8-down"); busy = false;
        say(rows[cur].tool.name + " is down! Who owns it, and who gets the call?" + (cur ? "" : " Drag a card to the row, tap it, or press its number."));
        kit.focus(cards.find((el) => !el.disabled));
      }
      function play(n, dropped) {
        const c = CARDS[n], el = cards[n], row = rows[cur]; if (busy || el.disabled || !row) return false;
        if (c.tool !== row.tool.key) {                 // a wrong pick: the card goes back, with a line of help
          kit.score.wrong(); kit.fx.shake(el); boss.hop();
          if (!c.tool) { el.disabled = true; el.classList.add("m8-never"); }
          say(c.why || "That card is for " + nameOf(c.tool) + ". The one that is down is " + row.tool.name.toLowerCase() + ".", "bad"); return false;
        }
        busy = true; el.disabled = true; kit.score.right();
        const land = () => {
          el.classList.add("m8-used"); row.el.classList.remove("m8-down"); row.el.classList.add("m8-ok"); row.slot.innerHTML = "";
          row.slot.appendChild(h("small", null, c.own)); row.slot.appendChild(document.createTextNode(c.call)); kit.fx.pop(row.el); S.play("m8clack");
          say(row.tool.name + ": " + c.call.replace(/^Call /, "call ") + ". It is on the page now.", "ok"); kit.after(1200, breakNext);
        };
        if (dropped) land(); else kit.fx.fly(el, row.slot, land);
        return true;
      }
      cards.forEach((el, n) => kit.drag(el, { zones: () => rows.map((r) => r.el), disabled: () => busy || el.disabled, onDrop: (zone) => {
        if (!zone) return false;
        if (zone !== rows[cur].el) { say("That tool is fine for now. The flashing row is the one that is down."); return false; }
        play(n, true); return false;                   // the card springs back to the hand either way: right, and its place there goes empty
      } }));
      const keys = {}; cards.forEach((el, n) => { keys[String(n + 1)] = () => play(n); });
      const offKeys = kit.keys(keys);
      function print() {                               // four rows filled: the leftovers never go on the page, and the page gets printed
        offKeys(); busy = true; hand.classList.add("m8-done"); cards.forEach((el) => { el.disabled = true; if (!el.classList.contains("m8-used")) el.classList.add("m8-never"); });
        say("Four rows, four names, and not one password. On paper, it works on the day the internet is down.", "ok");
        const go = h("button", { class: "sg-btn sg-primary sg-huge", type: "button", onclick: () => stamp() }, A.icon("printer"), "Print the draft for Jordan");
        const box = h("div", { class: "m8-printbox" }, go); hand.appendChild(box); kit.focus(go);
        let printed = false;
        function stamp() {
          if (printed) return; printed = true; go.disabled = true; S.play("m8print");
          kit.after(520, () => {
            box.remove(); sheet.classList.add("m8-printed"); sheet.appendChild(h("div", { class: "m8-stamp" }, "PRINTED")); S.play("m8stamp"); kit.fx.confetti(34);
            boss.hit(); boss.shout("My buttons do nothing!"); clock("4:59"); say("Printed. Jordan checks it. Then one copy for the workshop wall, and one for the truck.", "ok"); kit.after(2100, finish);
          });
        }
      }
      breakNext();
    });

    // the end of the fight: one fix, and it works. Captain Chaos has nothing left to press.
    round("Done before five");
    await talk([{ who: "luis", side: "left", mood: "glad", pose: "cheer" }, { who: "sprout", side: "right", mood: "glad" }], [
      { who: "luis", mood: "glad", pose: "cheer", say: "One fix at a time, like the page says. I moved to the porch for signal. It took the card!" }
    ]);
    await talk([{ who: "chaos", side: "left", mood: "caught" }, { who: "sprout", side: "right", mood: "proud", pose: "hips" }], [
      { who: "chaos", mood: "caught", say: "Calm questions? A locked inbox? A printed PAGE? You wrote it all DOWN. That is not fair!" },
      { who: "sprout", mood: "proud", pose: "cheer", say: "You draft. Jordan decides. And you log what fixed it. Take it to Jordan, {name}!" }
    ]);
    done();                                            // the handoff is next; the other seven come back at the catch (`caught.setup`, below)
  }

  // ── the case ──
  OH.game.mission({
    week: 8,
    title: "The Friday the Card Reader Died",          // the case name: 34 characters or fewer
    badge: { name: "The Calm One" },                   // the sticker. The icon and color come from the story bible.
    reward: { hours: 2, leads: 0, money: 0 },          // story numbers: the same as this case has always had
    maxWrong: 4,                                       // a long showdown: four wrong picks still earn the third star
    task: "Learn three things. Press nothing yet.",    // Jordan's task line in the visor while the agent is learning: 60 characters or fewer

    /* The briefing at Greenline HQ. The extra art: Luis's text, and Captain Chaos at his console.
       Jordan and Sprout talk to the agent. {agent} becomes "Agent Ivy" and {name} becomes "Ivy".
       who: "you" is the agent's own thought, shown as visor text with no actor. */
    briefing: {
      setup: briefArt,
      lines: [
        { who: "jordan", mood: "worried", pose: "shrug", say: "{agent}! It is 4:45 on a Friday. Of course it is." },
        { who: "jordan", mood: "worried", pose: "point", say: "Luis just texted from the Whitfield house. The card reader in his truck has stopped." },
        { who: "sprout", mood: "think", say: "His text says it spins, then says \"something about connection.\" That is all we know." },
        { who: "you", say: "A spinner and half an error message. I do not know what broke yet." },
        { who: "jordan", mood: "worried", pose: "idle", say: "Mrs. Whitfield is waiting to pay. And Captain Chaos is pressing every panic button in town." },
        { who: "sprout", mood: "glad", pose: "cheer", say: "My Friday shortcut, {name}: press every button. All of them! At once!" },
        { who: "jordan", mood: "happy", pose: "point", say: "Not one button. Three people in town know how to keep a cool head. Learn from them first." }
      ]
    },

    /* Three stops. Gus is in the park because Captain Chaos has his workshop. Each piece of knowledge
       (`clue`) is one real idea from the class, said as something the agent now knows about its work. */
    stops: [
      { place: "park", who: "gus",
        lines: [
          { who: "gus", mood: "grumpy", pose: "hips", say: "Captain Chaos locked me out of my own workshop. He is in there pressing my buttons." },
          { who: "gus", mood: "happy", pose: "idle", say: "Forty years of fixing things. You know what I touch first? Nothing. I ask four questions." },
          { who: "sprout", mood: "surprised", say: "Before pressing anything? My shortcut always starts with a restart. Just a tiny one!" },
          { who: "gus", mood: "proud", pose: "point", say: "Not even a tiny one. Here is what Jordan knows so far. Match each fact to its question." }
        ],
        challenge: { type: "sort", ask: "I have five facts. Which calm question does each one answer?",
          bins: [{ key: "changed", label: "What changed?", icon: "bolt", color: C.sun }, { key: "who", label: "One person or everyone?", icon: "truck", color: C.blue },
            { key: "again", label: "Does it happen again?", icon: "hand", color: C.pink }, { key: "words", label: "The exact words?", icon: "eye", color: C.teal }],
          items: [
            { text: "The tablet updated itself at lunch", bin: "changed", why: "That is new since this morning. It answers: what changed?" },
            { text: "Ana's truck took a card at 2:10", bin: "who", why: "One reader is stuck and the other works. So it is not everyone." },
            { text: "Three tries, the same thing each time", bin: "again", why: "It fails every time. Good to know. Now Luis can stop pressing." },
            { text: "The truck moved to a house with weak signal", bin: "changed", why: "A second thing that changed. I write down both. I blame neither yet." },
            { text: "\"Something about connection??\"", bin: "words", why: "Close, but not exact. Somebody has to read the real words off the screen." }
          ] },
        clue: { title: "I ask before I touch", text: "I ask before I press anything: what changed, is it one person or everyone, does it happen again, and what are the exact words on the screen?" } },

      { place: "bank", who: "penny",
        lines: [
          { who: "penny", mood: "happy", pose: "wave", say: "{agent}. I guard a vault all day. Let me show you the door that matters more." },
          { who: "penny", mood: "think", pose: "idle", say: "Forget a password, almost anywhere, and where does the reset link go? Jordan's email. Every time." },
          { who: "sprout", mood: "surprised", say: "So whoever gets into the email can open the bank, the books and the website? I never checked that!" },
          { who: "penny", mood: "proud", pose: "point", say: "One inbox, all the doors. Try it on my practice board. Then pick my two best locks for that inbox." }
        ],
        challenge: { ask: "Where does a reset link go? Tap each door and watch.", play: masterKey },
        clue: { title: "The master key", text: "Almost every reset link lands in Jordan's email, so I treat that email as the master key. It gets the strongest lock: a password manager and two-step login." } },

      { place: "post", who: "nell",
        lines: [
          { who: "nell", mood: "happy", pose: "wave", say: "{agent}! The printer is warm. What are we printing?" },
          { who: "nell", mood: "think", pose: "idle", say: "The day it all breaks is the day nobody can look anything up. So the answer goes on paper first." },
          { who: "nell", mood: "proud", pose: "point", say: "One page. A row for every tool the business runs on. Who owns the login, and who to call." },
          { who: "sprout", mood: "glad", say: "I never wrote any of it down, {name}. It was faster. Until a Friday like this one." }
        ],
        challenge: { type: "tap", ask: "I draft the one page. Tap the four things that belong on it.",
          items: [
            { text: "Who owns each login", ok: true, why: "A name, and a second person in case the first is up a ladder." },
            { text: "Every password, in big letters", ok: false, why: "Never. Passwords live in the password manager, not on paper." },
            { text: "Who to call when it breaks", ok: true, why: "A name and a number, found before the bad day." },
            { text: "What to do while it is down", ok: true, why: "The crew writes the name and the amount on the job sheet. The invoice comes later." },
            { text: "The card number, to be safe", ok: false, why: "That is the opposite of safe." },
            { text: "When it renews", ok: true, why: "If the website's name lapses, the site and the email both stop." },
            { text: "Captain Chaos's phone number", ok: false, why: "He would only tell me to restart everything." }
          ] },
        clue: { title: "One page, printed", text: "I draft one page for Jordan to print, with a row for every tool Greenline depends on: who owns the login, who to call, and what to do while it is down. I never put a password on it." } }
    ],

    /* The plan: three cards, exactly one with right: true. The cards are the agent's own options, so
       they say "I". None of the three pictures draws the agent, so the art is as it was. */
    crack: {
      lines: [{ who: "sprout", mood: "glad", pose: "cheer", say: "Three things learned, {name}, and it is 4:47. So how do we stop Captain Chaos?" }],
      ask: "What is my plan?",
      cards: [
        { title: "I press everything at once", text: "I restart it all. I unplug it all. Five fixes together.", color: C.pink,
          art: sh.at(-4, -14, 0.62, A.characterMarkup("chaos", { mood: "glad" })) + sh.ellipse(60, 112, 42, 11, sh.dark(C.red, 0.3)) + sh.ellipse(60, 105, 42, 13, C.red),
          react: { who: "chaos", mood: "glad", say: "Yes! Five fixes at once! Then nobody knows which one worked. Hee hee." } },
        { title: "I ask the one person who knows", text: "And I hope they pick up. At 4:47 on a Friday.", color: C.sun,
          art: sh.at(-22, -2, 0.62, A.characterMarkup("jordan", { mood: "worried", pose: "shrug" })) + sh.at(66, -4, 1.2, A.iconMarkup("m8ask")),
          react: { who: "jordan", mood: "worried", say: "That one person is me, and I do not know either. It should be written down." } },
        { title: "I ask. I lock. I write it down.", text: "Calm questions first. The email stays locked. I draft one page that says who to call.", color: C.teal, right: true,
          art: sh.at(-4, -2, 1.25, A.iconMarkup("m8ask")) + sh.at(64, -2, 1.25, A.iconMarkup("lock", C.sun)) + sh.at(28, 58, 1.3, A.iconMarkup("printer")),
          react: { who: "jordan", mood: "glad", say: "That's it. Questions, a lock and a page. Captain Chaos hates all three." } }
      ]
    },

    /* The showdown: a title, the task line Jordan gives (it shows in the visor), three lines of how to
       play in the agent's own words, and the fight itself. */
    showdown: {
      title: "The Friday showdown",
      task: "Ask. Lock. Write it down. Send nothing.",
      how: ["Three rounds. I stay calm, I lock the doors, then I write down who to call.", "Tap or drag. Or use the number keys.", "After round one, Sprout shows me its shortcut. I check it before I copy it."],
      play: fridayShowdown
    },

    /* The handoff: the agent never sends. After the showdown the engine takes the work to Jordan.
       ask: Jordan's line. work: three short lines of what the agent did. approve: Jordan's yes. */
    handoff: {
      ask: "Done before five, {agent}. What have you got for me?",
      work: ["Four calm questions, and a support request with no guess in it.", "Three tricks kept out of the email. One page drafted: who to call.", "Nothing sent. Nothing paid. No password given to anybody."],
      approve: "Approved. Support hears from me, and the page goes on the wall."
    },

    /* Extra art for the engine's caught screen: the other seven bandits come back to watch, in their nets. */
    caught: { setup: (kit) => grandCatch(kit.stage) },

    /* After the catch: two lines. The second steps out of the story: one thing for the person playing
       to try for real, tonight. It starts "For the person behind the visor:". The last case has no `next`. */
    debrief: [
      { who: "jordan", mood: "glad", pose: "cheer", say: "All eight bandits, in the net. The whole business is on one screen, and I get my evenings back." },
      { who: "sprout", mood: "proud", pose: "wave", say: "For the person behind the visor: tonight, turn on two-step login for your own email. The town has a surprise." }
    ]
  });
})();
