/* Save Greenline · the sound.
   Every sound is made in code with the Web Audio API: a short cheerful tune that loops quietly and
   a handful of effects. No audio files. A browser only allows sound after a tap, a click or a key,
   so nothing plays until the engine calls S.unlock() from Press Start. The on or off choice is
   remembered under "game:sound".

     S.unlock()            call from a tap or a key; safe to call again
     S.play("pop")         an effect by name (the names are the keys of FX below)
     S.tone(freq, dur, o)  one note of your own: o = {type, vol, at, to}  (at: seconds from now, to: slide to this pitch)
     S.noise(dur, o)       a puff of noise: o = {vol, at, from, to}        (a filter sweep, for a whoosh)
     S.music(true | false) start or stop the tune
     S.mute(true | false)  and S.muted()                                                              */
(function () {
  "use strict";
  if (!window.OH || !OH.game) return;
  const S = (OH.game.sound = {});
  let ctx = null, master = null, band = null, timer = null, wanted = false, step = 0, due = 0;
  let muted = OH.store ? OH.store.get("game:sound", "on") === "off" : false;

  S.muted = () => muted;
  S.unlock = function () {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        ctx = new AC();
        master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
        band = ctx.createGain(); band.gain.value = 0.5; band.connect(master);
      }
      if (ctx.state === "suspended") ctx.resume();
    } catch (e) { ctx = null; }                       // no sound on this machine: the game plays on without it
  };
  S.mute = function (yes) {
    muted = !!yes;
    if (OH.store) OH.store.set("game:sound", muted ? "off" : "on");
    if (ctx && master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.03);
    if (!muted) S.unlock();
  };

  S.tone = function (freq, dur, o) {
    if (!ctx || muted) return;
    o = o || {};
    try {
      const t = ctx.currentTime + (o.at || 0), osc = ctx.createOscillator(), g = ctx.createGain(), vol = o.vol == null ? 0.16 : o.vol;
      osc.type = o.type || "triangle"; osc.frequency.setValueAtTime(freq, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(o.out || master); osc.start(t); osc.stop(t + dur + 0.03);
    } catch (e) { /* a sound that fails is not worth stopping the game for */ }
  };
  S.noise = function (dur, o) {
    if (!ctx || muted) return;
    o = o || {};
    try {
      const t = ctx.currentTime + (o.at || 0), n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = buf; f.type = "bandpass"; f.frequency.setValueAtTime(o.from || 500, t); f.frequency.exponentialRampToValueAtTime(o.to || 2400, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol == null ? 0.12 : o.vol, t + dur * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t + dur + 0.02);
    } catch (e) { /* as above */ }
  };

  const N = { C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784, A5: 880, B5: 987.8, C6: 1046.5,
    C3: 130.8, D3: 146.8, E3: 164.8, F3: 174.6, G3: 196, A3: 220, G2: 98, A2: 110 };
  const run = (notes, gap, o) => notes.forEach((f, i) => S.tone(f, (o && o.dur) || gap * 1.6, Object.assign({ at: i * gap }, o)));
  const FX = (S.fx = {
    pop: () => S.tone(520, 0.09, { to: 880, vol: 0.14 }),
    click: () => S.tone(700, 0.05, { type: "square", vol: 0.05 }),
    blip: () => S.tone(900 + Math.random() * 140, 0.035, { type: "square", vol: 0.022 }),
    correct: () => run([N.E5, N.G5, N.C6], 0.08, { vol: 0.14 }),
    wrong: () => { S.tone(220, 0.16, { type: "sawtooth", to: 150, vol: 0.09 }); S.tone(180, 0.2, { type: "sawtooth", to: 110, vol: 0.09, at: 0.13 }); },
    oops: () => run([N.E4, N.D4, N.C4], 0.09, { type: "square", vol: 0.05 }),
    whoosh: () => S.noise(0.28, { from: 400, to: 3200, vol: 0.1 }),
    drop: () => S.tone(480, 0.14, { to: 190, vol: 0.14 }),
    truck: () => { for (let i = 0; i < 9; i++) S.tone(82 + (i % 2) * 9, 0.11, { type: "sawtooth", vol: 0.05, at: i * 0.12 }); S.tone(620, 0.1, { type: "square", vol: 0.05, at: 0.02 }); S.tone(620, 0.16, { type: "square", vol: 0.05, at: 0.16 }); },
    start: () => run([N.C5, N.E5, N.G5, N.C6, N.E5 * 2], 0.07, { type: "square", vol: 0.07 }),
    star: () => { S.tone(N.A5, 0.12, { vol: 0.13 }); S.tone(N.E5 * 2, 0.22, { vol: 0.13, at: 0.09 }); },
    sticker: () => { S.noise(0.08, { from: 200, to: 600, vol: 0.2 }); S.tone(150, 0.12, { to: 80, vol: 0.2 }); },
    clue: () => run([N.G4, N.B4, N.D5, N.G5], 0.07, { vol: 0.12 }),
    caught: () => { run([N.C5, N.C5, N.C5, N.E5, N.G5, N.E5, N.G5], 0.11, { type: "square", vol: 0.07 }); S.tone(N.C6, 0.6, { type: "square", vol: 0.08, at: 0.8 }); S.tone(N.E5, 0.6, { vol: 0.12, at: 0.8 }); S.tone(N.G5, 0.6, { vol: 0.1, at: 0.8 }); },
    color: () => { S.noise(0.5, { from: 300, to: 5000, vol: 0.08 }); run([N.C5, N.D5, N.E5, N.G5, N.A5, N.C6], 0.05, { vol: 0.1 }); },
    tick: () => S.tone(1200, 0.03, { type: "square", vol: 0.03 }),
    zip: () => S.tone(300, 0.07, { to: 1500, type: "square", vol: 0.04 }),
    // Agent Mode: logging in, the boot lines, a skill gain, a level, the owner's stamp
    login: () => run([N.G4, N.C5, N.E5, N.G5], 0.06, { vol: 0.1 }),
    boot: () => S.tone(660, 0.05, { type: "square", vol: 0.035, to: 990 }),
    gain: () => { S.tone(N.G5, 0.07, { vol: 0.1 }); S.tone(N.C6, 0.13, { vol: 0.1, at: 0.06 }); },
    level: () => { run([N.C5, N.E5, N.G5, N.C6], 0.09, { type: "square", vol: 0.06 }); S.tone(N.E5 * 2, 0.5, { vol: 0.11, at: 0.38 }); S.tone(N.C6, 0.5, { vol: 0.09, at: 0.38 }); },
    stamp: () => { S.noise(0.07, { from: 180, to: 500, vol: 0.2 }); S.tone(120, 0.14, { to: 70, vol: 0.2 }); }
  });
  S.play = function (name) { if (!ctx || muted) return; (FX[name] || FX.pop)(); };

  // ── the tune: eight bars, a melody over a two-note bass, scheduled a little ahead of time ──
  const BEAT = 0.3;
  const TUNE = ["C5", "E5", "G5", "E5", "A5", "G5", "E5", "", "D5", "F5", "A5", "F5", "G5", "E5", "C5", "",
    "C5", "E5", "G5", "C6", "B5", "G5", "E5", "G5", "A5", "F5", "D5", "F5", "E5", "D5", "C5", ""];
  const BASS = ["C3", "A2", "D3", "G2", "C3", "E3", "F3", "G2"];
  function schedule() {
    if (!ctx || !wanted) return;
    while (due < ctx.currentTime + 0.5) {
      const at = Math.max(0, due - ctx.currentTime), note = TUNE[step % TUNE.length];
      if (note) S.tone(N[note], BEAT * 0.9, { type: "triangle", vol: 0.075, at: at, out: band });
      if (step % 2 === 0) S.tone(N[BASS[Math.floor(step / 4) % BASS.length]], BEAT * 1.5, { type: "sine", vol: 0.1, at: at, out: band });
      if (step % 2 === 1) S.noise(0.04, { from: 6000, to: 8000, vol: 0.012, at: at });
      step++; due += BEAT;
    }
  }
  S.music = function (yes) {
    wanted = !!yes;
    if (timer) { clearInterval(timer); timer = null; }
    if (!wanted || !ctx) return;
    step = 0; due = ctx.currentTime + 0.1;
    timer = setInterval(schedule, 120); schedule();
  };
  S.playing = () => wanted;
  document.addEventListener("visibilitychange", () => { if (!ctx) return; try { if (document.hidden) ctx.suspend(); else if (wanted || !muted) ctx.resume(); } catch (e) { /* nothing to do */ } });
})();
