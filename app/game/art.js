/* Save Greenline · the art.
   Every picture in the game is drawn here, in code: inline SVG built by small helper functions.
   No image files, no web fonts, no libraries. A mission may add its own characters, places and
   props with A.addCharacter, A.addPlace and A.props (GAME.md has the full list).

   The pieces, from small to large:
     shapes      A.shape.path / rect / ellipse / group / at / text / line / cluster   strings of SVG
     props       A.prop("truck"), "tree", "cloud", "envelope", "net", ...             strings of SVG
     icons       A.icon("envelope")                                                   an <svg> element
     characters  A.character("sprout", {mood, pose})                                  an <svg> element
     places      A.scene("garden", {gray})   a whole backdrop                         an <svg> element
     the town    A.townMap("wide" or "tall", {gray, peek})                            an object, see below

   One look for everything: a thick dark outline (C.ink), flat bright fills, round corners. */
(function () {
  "use strict";
  if (!window.OH || !OH.game) return;
  const NS = "http://www.w3.org/2000/svg";
  const A = (OH.game.art = {});

  // ── the palette ──
  const C = (A.C = {
    ink: "#2b2147", white: "#ffffff", cream: "#fff3d1",
    sky: "#58c8ff", skyLow: "#d2f4ff", sun: "#ffd83d",
    grass: "#86dd5a", grassDark: "#5cc043", hill: "#a6ea73", hillFar: "#c4f29a",
    road: "#7d7696", roadLine: "#fff1a8", sand: "#f6e3a5", water: "#5ec8ff",
    green: "#34c26b", greenDark: "#1f9a4d", leaf: "#58d36c",
    red: "#ff5d5d", orange: "#ff9f2e", yellow: "#ffd83d", blue: "#4d96ff", purple: "#9b6bff",
    pink: "#ff7fc1", teal: "#22cdb8", brown: "#a8693f", wood: "#c98b52", glass: "#c4efff", gray: "#b9b6c9"
  });
  const FONT = "ui-rounded,'SF Pro Rounded','Arial Rounded MT Bold','Varela Round','Nunito','Segoe UI',system-ui,sans-serif";
  A.FONT = FONT;

  // ── shapes: each returns a string of SVG. `w` is the outline width (5 by default, 0 for none). ──
  const st = (w) => (w === 0 ? "" : ' stroke="' + C.ink + '" stroke-width="' + (w || 5) + '" stroke-linejoin="round" stroke-linecap="round"');
  const P = (d, fill, w, x) => '<path d="' + d + '" fill="' + (fill || "none") + '"' + st(w) + (x ? " " + x : "") + "/>";
  const R = (x, y, w, h, r, fill, sw, ex) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (r || 0) + '" fill="' + fill + '"' + st(sw) + (ex ? " " + ex : "") + "/>";
  const E = (cx, cy, rx, ry, fill, sw, ex) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + (fill || "none") + '"' + st(sw) + (ex ? " " + ex : "") + "/>";
  const G = (inner, attrs) => "<g" + (attrs ? " " + attrs : "") + ">" + inner + "</g>";
  const at = (x, y, s, inner, extra) => G(inner, 'transform="translate(' + x + "," + y + ")" + (s != null && s !== 1 ? " scale(" + s + ")" : "") + '"' + (extra ? " " + extra : ""));
  const T = (x, y, text, size, fill, ex) => '<text x="' + x + '" y="' + y + '" font-family="' + FONT + '" font-weight="900" font-size="' + size + '" text-anchor="middle" fill="' + (fill || C.ink) + '"' + (ex ? " " + ex : "") + ">" + text + "</text>";
  const line = (d, color, w) => '<path d="' + d + '" fill="none" stroke="' + (color || C.ink) + '" stroke-width="' + (w || 5) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  /* Several overlapping ellipses that read as one outlined blob (a cloud, a tree top, a bush). */
  const cluster = (list, fill, w) => list.map((c) => E(c[0], c[1], c[2], c[3] || c[2], fill, (w || 5) * 2)).join("") + list.map((c) => E(c[0], c[1], c[2], c[3] || c[2], fill, 0)).join("");
  /* A line with an outline: used for arms, steam and rope. */
  const tube = (d, color, w) => line(d, C.ink, w + 9) + line(d, color, w);
  const hex6 = (c) => (c.length === 4 ? "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c);
  function mix(a, b, t) { const pa = parseInt(hex6(a).slice(1), 16), pb = parseInt(hex6(b).slice(1), 16); return "#" + [16, 8, 0].map((s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t).toString(16).padStart(2, "0")).join(""); }
  const dark = (c, t) => mix(c, "#1a1030", t == null ? 0.25 : t), light = (c, t) => mix(c, "#ffffff", t == null ? 0.45 : t);
  function starPath(cx, cy, r, inner) { let d = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? (inner || r * 0.46) : r; d += (i ? "L" : "M") + (cx + Math.cos(a) * rr).toFixed(1) + "," + (cy + Math.sin(a) * rr).toFixed(1); } return d + "Z"; }
  const leaf = (x, y, s, rot, fill, w) => G(P("M0,0 C-13,-7 -13,-23 0,-30 C13,-23 13,-7 0,0 Z", fill || C.leaf, w == null ? 4 : w) + line("M0,-4 V-22", dark(fill || C.leaf, 0.3), 2.5), 'transform="translate(' + x + "," + y + ") rotate(" + (rot || 0) + ") scale(" + (s || 1) + ')"');
  A.shape = { path: P, rect: R, ellipse: E, group: G, at: at, text: T, line: line, tube: tube, cluster: cluster, star: starPath, leaf: leaf, dark: dark, light: light, mix: mix };

  /* Turn a string of SVG into an element. opts: box ("0 0 200 280"), class, fit (preserveAspectRatio), label. */
  A.svg = function (markup, o) {
    o = o || {};
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", o.box || "0 0 200 280");
    s.setAttribute("preserveAspectRatio", o.fit || "xMidYMid meet");
    s.setAttribute("class", "sg-art" + (o.class ? " " + o.class : ""));
    s.setAttribute("focusable", "false");
    if (o.label) { s.setAttribute("role", "img"); s.setAttribute("aria-label", o.label); } else s.setAttribute("aria-hidden", "true");
    s.innerHTML = markup;
    return s;
  };
  /* Shared paint the pictures point at: the sky, the gray filter for a place a bandit still holds,
     and the net. The engine puts this in the page once, while the game is on. */
  A.defs = function () {
    const s = A.svg('<defs>' +
      '<linearGradient id="sg-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.sky + '"/><stop offset="1" stop-color="' + C.skyLow + '"/></linearGradient>' +
      '<filter id="sg-gray" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/>' +
      '<feComponentTransfer><feFuncR type="linear" slope=".78" intercept=".17"/><feFuncG type="linear" slope=".78" intercept=".17"/><feFuncB type="linear" slope=".78" intercept=".21"/></feComponentTransfer></filter>' +
      '<pattern id="sg-net" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="20" height="20" fill="rgba(255,243,209,.28)"/><path d="M0,0 H20 M0,0 V20" stroke="#b9772f" stroke-width="4"/></pattern>' +
      "</defs>", { box: "0 0 1 1", class: "sg-defs" });
    s.setAttribute("width", "0"); s.setAttribute("height", "0");
    return s;
  };

  // ── props: small things drawn around the origin (0,0 is where the thing stands) ──
  const PROPS = (A.props = {});
  PROPS.cloud = (o) => cluster([[0, 0, 36, 24], [-32, 8, 24, 17], [32, 8, 26, 17], [-10, -15, 24, 19], [16, -10, 20, 16]], (o && o.color) || "#fff");
  PROPS.sun = () => G([0, 45, 90, 135, 180, 225, 270, 315].map((a) => G(R(-5, -74, 10, 20, 5, C.sun, 4), 'transform="rotate(' + a + ')"')).join(""), 'class="sg-spin"') + E(0, 0, 42, 42, C.sun) + E(-14, -4, 4, 6, C.ink, 0) + E(14, -4, 4, 6, C.ink, 0) + line("M-12,12 Q0,24 12,12", C.ink, 4);
  PROPS.tree = (o) => R(-9, -48, 18, 50, 5, C.brown) + cluster([[0, -96, 40, 36], [-30, -68, 28, 26], [30, -68, 28, 26], [0, -62, 30, 24]], (o && o.color) || C.leaf);
  PROPS.pine = () => R(-7, -24, 14, 26, 4, C.brown) + P("M0,-126 L32,-76 H16 L40,-36 H-40 L-16,-76 H-32 Z", C.greenDark);
  PROPS.bush = (o) => cluster([[0, -20, 28, 22], [-26, -11, 19, 14], [26, -11, 19, 14]], (o && o.color) || C.grassDark);
  PROPS.flower = (o) => line("M0,0 V-24", C.greenDark, 4) + [0, 72, 144, 216, 288].map((a) => G(E(0, -9, 6, 8, (o && o.color) || C.pink, 3), 'transform="translate(0,-30) rotate(' + a + ')"')).join("") + E(0, -30, 5, 5, C.sun, 3);
  PROPS.envelope = (o) => R(-22, -15, 44, 30, 5, (o && o.color) || "#fff", 4) + P("M-22,-13 L0,4 L22,-13", "none", 4);
  PROPS.star = (o) => P(starPath(0, 0, (o && o.r) || 20), (o && o.color) || C.sun, 4);
  PROPS.lamp = () => R(-4, -90, 8, 90, 3, "#5b5475", 4) + E(0, -98, 13, 13, C.sun, 4);
  PROPS.bench = () => R(-30, -24, 60, 9, 4, C.wood, 4) + R(-30, -38, 60, 9, 4, C.wood, 4) + line("M-22,-15 V0 M22,-15 V0", C.ink, 5);
  PROPS.fence = (o) => { let s = line("M0,-20 H" + ((o && o.w) || 80), C.ink, 9) + line("M0,-20 H" + ((o && o.w) || 80), "#fff", 4); for (let x = 4; x < ((o && o.w) || 80); x += 15) s += P("M" + x + ",0 V-30 L" + (x + 5) + ",-37 L" + (x + 10) + ",-30 V0 Z", "#fff", 3); return s; };
  PROPS.pot = () => cluster([[0, -30, 15, 13], [-12, -22, 10], [12, -22, 10]], C.leaf, 4) + P("M-13,0 L-17,-20 H17 L13,0 Z", C.orange, 4);
  PROPS.sign = (o) => R(-3, -40, 6, 40, 2, C.wood, 3) + R(-((o && o.w) || 60) / 2, -64, (o && o.w) || 60, 28, 8, "#fff", 4) + T(0, -44, (o && o.text) || "", 14);
  PROPS.magnifier = () => line("M14,14 L34,34", C.ink, 13) + line("M14,14 L34,34", C.wood, 7) + E(0, 0, 20, 20, C.glass, 6) + line("M-10,-6 Q-6,-12 0,-12", "#fff", 4);
  PROPS.casebook = () => R(-26, -34, 52, 68, 8, C.red) + R(-18, -34, 44, 68, 6, C.cream, 4) + R(-10, -22, 28, 14, 4, "#fff", 3) + line("M-8,4 H16 M-8,16 H10", C.ink, 3);
  PROPS.coin = () => E(0, 0, 16, 16, C.sun) + P(starPath(0, 0, 8), "#fff", 2.5);
  /* The green truck, facing right, wheels on the origin line. Luis is at the wheel. */
  PROPS.truck = () =>
    E(0, 3, 100, 8, "rgba(43,33,71,.18)", 0) +
    cluster([[-70, -92, 18, 15], [-48, -98, 16, 14], [-28, -90, 15, 13]], C.leaf, 4) + line("M-6,-78 V-112", C.wood, 5) + P("M-14,-112 H2 V-122 H-14 Z", C.gray, 3) +
    R(-100, -80, 118, 58, 9, C.green) + R(-100, -48, 118, 11, 0, C.greenDark, 0) + line("M-100,-80 H18", C.ink, 5) +
    T(-41, -57, "GREENLINE", 15, "#fff", 'textLength="92" lengthAdjust="spacingAndGlyphs"') +
    P("M16,-22 V-72 Q16,-96 40,-96 H60 Q74,-96 80,-84 L94,-56 Q100,-52 100,-42 V-22 Z", C.green) +
    P("M32,-82 H58 Q66,-82 70,-74 L80,-56 H32 Z", C.glass, 4) +
    E(50, -65, 9, 9, "#eeb98a", 3) + P("M41,-68 Q42,-80 54,-79 Q64,-78 62,-69 Z", C.orange, 3) +
    E(95, -38, 5, 7, C.sun, 3) + R(-104, -26, 208, 11, 5, "#efeaf8", 4) +
    [-58, 54].map((x) => at(x, -12, 1, G(E(0, 0, 19, 19, "#3a3350") + E(0, 0, 8, 8, "#cfcbe0", 0) + E(0, -12, 3, 3, "#cfcbe0", 0) + E(0, 12, 3, 3, "#cfcbe0", 0), 'class="sg-wheel"'))).join("");
  /* A net, sized to drop over a bandit drawn in its 200 by 220 box. */
  PROPS.net = () => P("M12,208 C4,96 40,10 100,10 C160,10 196,96 188,208 Z", "url(#sg-net)", 6) + line("M12,208 H188", C.ink, 12) + line("M12,208 H188", C.wood, 6) + E(100, 10, 12, 9, C.wood, 4);
  PROPS.bin = (o) => { const c = (o && o.color) || C.blue; return P("M-34,-56 H34 L27,0 H-27 Z", c) + R(-40, -66, 80, 14, 6, light(c, 0.25)) + line("M-14,-44 L-11,-10 M0,-44 V-10 M14,-44 L11,-10", dark(c, 0.3), 4); };
  A.prop = function (name, o) { return PROPS[name] ? PROPS[name](o || {}) : ""; };

  // ── icons: 48 by 48, for buttons, stickers and pins ──
  const ICONS = (A.icons = {
    envelope: (c) => R(6, 12, 36, 25, 5, c || "#fff", 4) + P("M6,14 L24,28 L42,14", "none", 4),
    bolt: (c) => P("M27,4 L10,27 H22 L19,44 L38,19 H26 Z", c || C.sun, 4),
    sign: (c) => R(21, 26, 6, 18, 2, C.wood, 3) + R(6, 6, 36, 22, 6, c || "#fff", 4) + line("M13,14 H35 M13,21 H28", C.ink, 3),
    pin: (c) => P("M24,44 C12,30 9,24 9,18 A15,15 0 0 1 39,18 C39,24 36,30 24,44 Z", c || C.red, 4) + E(24, 18, 6, 6, "#fff", 3),
    pencil: (c) => P("M8,40 L11,29 L32,8 L40,16 L19,37 Z", c || C.sun, 4) + line("M28,12 L36,20", C.ink, 3) + P("M8,40 L11,29 L19,37 Z", "#fff", 3),
    chat: (c) => P("M7,10 Q7,6 11,6 H37 Q41,6 41,10 V28 Q41,32 37,32 H22 L12,42 V32 H11 Q7,32 7,28 Z", c || "#fff", 4) + E(16, 19, 2.5, 2.5, C.ink, 0) + E(24, 19, 2.5, 2.5, C.ink, 0) + E(32, 19, 2.5, 2.5, C.ink, 0),
    coins: (c) => E(18, 30, 13, 13, c || C.sun, 4) + E(31, 17, 13, 13, c || C.sun, 4) + P(starPath(31, 17, 6), "#fff", 2),
    shield: (c) => P("M24,5 L41,11 V24 C41,34 33,41 24,44 C15,41 7,34 7,24 V11 Z", c || C.blue, 4) + line("M16,24 L22,30 L33,17", "#fff", 5),
    star: (c) => P(starPath(24, 25, 20), c || C.sun, 4),
    lock: (c) => P("M15,22 V15 A9,9 0 0 1 33,15 V22", "none", 5) + R(9, 21, 30, 23, 6, c || C.gray, 4) + E(24, 32, 3.5, 3.5, C.ink, 0),
    clock: (c) => E(24, 24, 18, 18, c || "#fff", 4) + line("M24,13 V24 L32,29", C.ink, 4),
    check: (c) => line("M9,26 L20,36 L40,12", C.ink, 12) + line("M9,26 L20,36 L40,12", c || C.green, 6),
    cross: (c) => line("M12,12 L36,36 M36,12 L12,36", C.ink, 12) + line("M12,12 L36,36 M36,12 L12,36", c || C.red, 6),
    exit: () => line("M21,8 H10 V40 H21", C.ink, 5) + line("M20,24 H40 M32,15 L41,24 L32,33", C.ink, 5),
    book: (c) => R(8, 6, 32, 36, 5, c || C.red, 4) + R(14, 6, 26, 36, 4, C.cream, 4) + line("M20,16 H33 M20,24 H30", C.ink, 3),
    sound: () => P("M7,19 H15 L25,10 V38 L15,29 H7 Z", "#fff", 4) + line("M31,17 Q36,24 31,31 M36,11 Q45,24 36,37", C.ink, 4),
    mute: () => P("M7,19 H15 L25,10 V38 L15,29 H7 Z", "#fff", 4) + line("M31,18 L42,30 M42,18 L31,30", C.ink, 4),
    play: (c) => P("M15,8 L39,24 L15,40 Z", c || "#fff", 4),
    menu: () => line("M10,14 H38 M10,24 H38 M10,34 H38", C.ink, 5),
    magnifier: () => at(19, 19, 0.72, PROPS.magnifier()),
    leaf: (c) => leaf(24, 42, 1.25, 20, c || C.leaf),
    trash: (c) => P("M12,16 H36 L33,42 H15 Z", c || C.gray, 4) + line("M8,15 H40 M19,9 H29", C.ink, 5),
    eye: (c) => P("M5,24 Q24,6 43,24 Q24,42 5,24 Z", c || "#fff", 4) + E(24, 24, 7, 7, C.ink, 0),
    truck: () => at(24, 36, 0.21, PROPS.truck()),
    hand: (c) => P("M17,44 Q8,34 10,22 L15,22 L17,28 V10 Q17,6 21,6 Q25,6 25,10 V22 L37,25 Q41,27 40,32 L37,44 Z", c || "#fff", 4),
    keys: () => R(5, 14, 17, 17, 4, "#fff", 4) + R(26, 14, 17, 17, 4, "#fff", 4) + T(13.5, 27, "1", 12) + T(34.5, 27, "2", 12),
    home: (c) => P("M7,24 L24,8 L41,24 V41 H29 V30 H19 V41 H7 Z", c || "#fff", 4),
    printer: () => R(13, 6, 22, 12, 3, "#fff", 4) + R(6, 17, 36, 17, 5, C.gray, 4) + R(13, 28, 22, 14, 3, "#fff", 4)
  });
  A.iconMarkup = function (name, color) { return (ICONS[name] || ICONS.star)(color); };
  A.icon = function (name, o) { return A.svg(A.iconMarkup(name, o && o.color), { box: "0 0 48 48", class: "sg-icon" + (o && o.class ? " " + o.class : "") }); };
  /* A sticker badge: a scalloped white edge, a bright middle, one icon. */
  A.stickerMarkup = function (icon, color) {
    const ring = []; for (let i = 0; i < 14; i++) { const a = i * Math.PI * 2 / 14; ring.push([60 + Math.cos(a) * 45, 60 + Math.sin(a) * 45, 11]); }
    return cluster([[60, 60, 46]].concat(ring), "#fff", 4) + E(60, 60, 38, 38, color || C.green, 4) + line("M34,48 Q40,32 56,28", "rgba(255,255,255,.7)", 5) + at(33, 33, 1.12, A.iconMarkup(icon || "star"));
  };
  A.sticker = function (icon, color, o) { return A.svg(A.stickerMarkup(icon, color), { box: "0 0 120 120", class: "sg-sticker" + (o && o.class ? " " + o.class : "") }); };
  /* Big cartoon lettering with an outline, sized to fit its box. */
  A.wordMarkup = function (text, x, y, size, fill, width) {
    const fit = width ? ' textLength="' + width + '" lengthAdjust="spacingAndGlyphs"' : "", edge = ' stroke="' + C.ink + '" stroke-width="' + Math.round(size * 0.2) + '" stroke-linejoin="round" paint-order="stroke"';
    return T(x, y + size * 0.085, text, size, C.ink, edge + fit) + T(x, y, text, size, fill || "#fff", edge + fit);
  };
  A.word = function (text, o) {
    o = o || {}; const size = 84, w = Math.min(560, Math.round(String(text).length * size * 0.66)), box = w + 44;
    return A.svg(A.wordMarkup(text, box / 2, 96, size, o.color || C.sun, w), { box: "0 0 " + box + " 130", class: "sg-word" + (o.class ? " " + o.class : ""), label: text });
  };
  A.logo = function () {
    return A.svg(A.wordMarkup("SAVE", 320, 108, 112, C.sun, 300) + A.wordMarkup("GREENLINE", 320, 222, 106, "#fff", 590) + leaf(482, 44, 1.5, 28, C.leaf, 5) +
      P("M66,252 H574 L556,277 L574,302 H66 L84,277 Z", C.red) + T(320, 286, "The Case of the Busywork Bandits", 25, "#fff", 'textLength="430" lengthAdjust="spacingAndGlyphs"'),
      { box: "0 0 640 312", class: "sg-logo", label: "Save Greenline: The Case of the Busywork Bandits" });
  };

  // ── characters ──
  /* One mood word works for every kind of character. Each kind draws it in its own way. */
  const MOODS = (A.moods = {
    happy: { eyes: "open", mouth: "smile" },
    glad: { eyes: "arc", mouth: "grin" },
    proud: { eyes: "arc", mouth: "smile", sparkle: true },
    worried: { eyes: "open", brows: "worried", mouth: "frown", sweat: true },
    surprised: { eyes: "wide", brows: "raised", mouth: "o" },
    oops: { eyes: "wide", brows: "worried", mouth: "wavy", sweat: true },
    grumpy: { eyes: "open", brows: "angry", mouth: "frown" },
    think: { eyes: "up", brows: "raised", mouth: "flat" },
    sleepy: { eyes: "shut", mouth: "flat" },
    sneaky: { eyes: "open", brows: "angry", mouth: "smirk" },
    caught: { eyes: "wide", brows: "worried", mouth: "wavy", sweat: true }
  });
  const SKIN = (A.SKIN = { light: "#ffd9b8", tan: "#eeb98a", brown: "#c98a5e", deep: "#8e5b3c" });
  const sweat = (x, y) => P("M" + x + "," + y + " q-7,12 0,16 q7,-4 0,-16 Z", C.water, 3);
  const sparkle = (x, y, s) => P(starPath(x, y, 11 * (s || 1), 4 * (s || 1)), "#fff", 3, 'class="sg-twinkle"');

  /* A person: 200 by 280, feet at the bottom. Poses move the arms. */
  const ARMS = {
    idle: { l: ["M66,158 Q48,184 54,208", 54, 211], r: ["M134,158 Q152,184 146,208", 146, 211] },
    wave: { l: ["M66,158 Q48,184 54,208", 54, 211], r: ["M134,158 Q166,148 170,110", 171, 104], wave: true },
    point: { l: ["M66,158 Q48,184 54,208", 54, 211], r: ["M134,160 Q162,162 184,152", 189, 150] },
    cheer: { l: ["M66,158 Q34,142 30,106", 29, 100], r: ["M134,158 Q166,142 170,106", 171, 100] },
    hips: { l: ["M66,158 Q32,178 60,198", 63, 200], r: ["M134,158 Q168,178 140,198", 137, 200] },
    shrug: { l: ["M66,160 Q40,170 28,148", 26, 142], r: ["M134,160 Q160,170 172,148", 174, 142] }
  };
  function personFace(m, d) {
    let s = "";
    const eye = (x) => m.eyes === "arc" ? line("M" + (x - 8) + ",91 Q" + x + ",79 " + (x + 8) + ",91", C.ink, 5)
      : m.eyes === "shut" ? line("M" + (x - 8) + ",88 Q" + x + ",94 " + (x + 8) + ",88", C.ink, 4)
      : m.eyes === "wide" ? E(x, 88, 11, 12, "#fff", 4) + E(x, 89, 5, 5.5, C.ink, 0)
      : E(x + (m.eyes === "up" ? 2 : 0), m.eyes === "up" ? 85 : 88, 6.5, 8.5, C.ink, 0) + E(x + 2, 85, 2.2, 2.6, "#fff", 0);
    s += G(eye(82) + eye(118), 'class="sg-blink"');
    if (d.glasses) s += E(82, 88, 15, 15, "rgba(255,255,255,.3)", 4) + E(118, 88, 15, 15, "rgba(255,255,255,.3)", 4) + line("M97,88 H103", C.ink, 4);
    if (m.brows === "worried") s += line("M71,73 L90,67 M110,67 L129,73", C.ink, 4);
    if (m.brows === "angry") s += line("M71,67 L90,74 M110,74 L129,67", C.ink, 4);
    if (m.brows === "raised") s += line("M72,68 Q81,61 90,67 M110,67 Q119,61 128,68", C.ink, 4);
    s += E(68, 104, 8, 6, "rgba(255,93,125,.38)", 0) + E(132, 104, 8, 6, "rgba(255,93,125,.38)", 0);
    const mouth = m.mouth === "grin" ? P("M83,104 Q100,131 117,104 Z", "#7a1f3d", 4) + E(100, 117, 8, 4.5, "#ff8a9a", 0)
      : m.mouth === "frown" ? line("M88,117 Q100,107 112,117", C.ink, 5)
      : m.mouth === "o" ? E(100, 113, 7, 9, "#7a1f3d", 4)
      : m.mouth === "wavy" ? line("M85,113 Q90,106 95,113 T105,113 T115,113", C.ink, 4)
      : m.mouth === "flat" ? line("M90,113 H110", C.ink, 5)
      : m.mouth === "smirk" ? line("M88,109 Q104,120 114,105", C.ink, 5)
      : line("M86,107 Q100,121 114,107", C.ink, 5);
    s += G(mouth, 'class="sg-mouth"');
    if (d.mustache) s += P("M80,104 Q90,95 100,103 Q110,95 120,104 Q110,112 100,106 Q90,112 80,104 Z", d.hair, 3);
    if (m.sweat) s += sweat(150, 50);
    if (m.sparkle) s += sparkle(160, 46) + sparkle(36, 60, 0.7);
    return s;
  }
  function outfit(d) {
    const o = d.outfit;
    if (o === "apron") return line("M82,152 L72,138 M118,152 L128,138", C.ink, 4) + R(76, 150, 48, 70, 10, d.trim || C.cream, 4) + R(88, 182, 24, 18, 6, dark(d.trim || C.cream, 0.12), 3);
    if (o === "vest") return P("M70,137 H86 L96,176 V220 H70 Z", C.sun, 4) + P("M130,137 H114 L104,176 V220 H130 Z", C.sun, 4) + line("M72,198 H94 M106,198 H128", "#fff", 5);
    if (o === "overalls") return tube("M82,166 L74,140", d.trim || C.blue, 6) + tube("M118,166 L126,140", d.trim || C.blue, 6) + R(76, 162, 48, 60, 8, d.trim || C.blue, 4) + E(83, 170, 3.5, 3.5, C.sun, 2) + E(117, 170, 3.5, 3.5, C.sun, 2) + R(90, 184, 20, 14, 4, dark(d.trim || C.blue, 0.15), 3);
    if (o === "sash") return P("M63,152 L74,138 L140,206 L130,220 Z", d.trim || C.sun, 4) + P(starPath(104, 180, 8), "#fff", 2.5);
    if (o === "suit") return P("M84,136 L100,174 L116,136 Z", "#fff", 4) + P("M100,146 L88,138 V154 Z", d.trim || C.red, 3) + P("M100,146 L112,138 V154 Z", d.trim || C.red, 3) + E(100, 146, 4, 4, d.trim || C.red, 3);
    if (o === "coat") return P("M84,136 L100,168 L116,136", "none", 4) + line("M100,168 V220", C.ink, 4) + R(58, 190, 84, 11, 0, dark(d.top, 0.18), 0) + line("M58,190 H142 M58,201 H142", C.ink, 3) + R(93, 188, 14, 15, 3, C.sun, 3);
    if (o === "logo") return E(118, 162, 11, 11, "#fff", 3) + leaf(118, 170, 0.5, 15, C.leaf, 3);
    return "";
  }
  function hat(d) {
    const c = d.hatColor || C.greenDark, t = d.hat;
    if (t === "cap") return P("M50,70 Q50,24 100,24 Q150,24 150,70 Z", c) + P("M144,60 Q188,56 192,71 Q168,79 146,72 Z", dark(c, 0.2)) + E(100, 48, 11, 11, "#fff", 3) + leaf(100, 56, 0.5, 15, C.leaf, 3);
    if (t === "sunhat") return E(100, 58, 76, 17, c) + P("M62,56 Q62,14 100,14 Q138,14 138,56 Z", c) + line("M63,52 Q100,62 137,52", C.pink, 7) + E(132, 40, 9, 9, C.red, 3) + E(132, 40, 3.5, 3.5, C.sun, 0);
    if (t === "tophat") return R(52, 40, 96, 13, 6, c) + R(68, 4, 64, 42, 8, c) + R(68, 30, 64, 10, 0, C.red, 0) + line("M68,30 H132 M68,40 H132", C.ink, 3);
    if (t === "visor") return P("M52,66 Q52,34 100,34 Q148,34 148,66 Q100,54 52,66 Z", c) + P("M56,66 Q100,50 144,66 Q150,84 100,76 Q50,84 56,66 Z", light(c, 0.3));
    if (t === "fedora") return E(100, 56, 70, 14, c) + P("M62,54 Q60,18 84,20 Q100,30 116,20 Q140,18 138,54 Z", c) + line("M63,50 Q100,60 137,50", C.ink, 8) + line("M63,50 Q100,60 137,50", C.red, 4);
    if (t === "hardhat") return P("M50,66 Q50,22 100,22 Q150,22 150,66 Z", c) + R(44, 62, 112, 11, 5, c) + R(94, 20, 12, 44, 5, light(c, 0.3), 3);
    if (t === "bandana") return P("M50,70 Q50,28 100,28 Q150,28 150,70 Q100,56 50,70 Z", c) + P("M148,62 L172,56 L164,74 L176,84 L150,74 Z", c, 4);
    return "";
  }
  function person(d, o) {
    const m = MOODS[o.mood] || MOODS.happy, arms = ARMS[o.pose] || ARMS.idle;
    const skin = d.skin || SKIN.tan, top = d.top || C.blue, pants = d.pants || "#4a5596", hair = d.hair || "#3a2a22", hs = d.hairStyle || "short";
    const arm = (a) => tube(a[0], d.sleeve || top, 15) + E(a[1], a[2], 10.5, 10.5, skin, 4);
    let s = E(100, 270, 56, 8, "rgba(43,33,71,.18)", 0);
    if (hs === "long") s += P("M44,92 Q36,22 100,22 Q164,22 156,92 L162,150 Q146,160 132,148 H68 Q54,160 38,150 Z", hair);
    if (hs === "bun") s += E(100, 26, 20, 18, hair);
    if (hs === "tail") s += P("M144,58 Q186,62 178,124 Q160,112 150,88 Z", hair);
    s += R(72, 204, 25, 56, 10, pants) + R(103, 204, 25, 56, 10, pants) + E(80, 262, 20, 10, d.shoes || "#4a3b63") + E(120, 262, 20, 10, d.shoes || "#4a3b63");
    s += R(89, 118, 22, 28, 8, skin) + R(58, 134, 84, 88, 30, top) + outfit(d);
    s += E(51, 90, 9, 10, skin) + E(149, 90, 9, 10, skin) + E(100, 84, 50, 50, skin);
    if (d.beard) s += P("M54,92 Q56,142 100,144 Q144,142 146,92 Q132,118 100,118 Q68,118 54,92 Z", hair);
    if (hs === "short" || hs === "bun" || hs === "tail") s += P("M50,86 Q44,28 100,28 Q156,28 150,86 Q146,58 122,52 Q100,64 70,52 Q54,60 50,86 Z", hair);
    if (hs === "long") s += P("M52,82 Q50,30 100,30 Q150,30 148,82 Q136,54 104,56 Q84,72 52,82 Z", hair);
    if (hs === "buzz") s += P("M52,76 Q52,32 100,32 Q148,32 148,76 Q130,52 100,52 Q70,52 52,76 Z", hair);
    if (hs === "curly") s += cluster([[60, 58, 21], [84, 40, 23], [114, 38, 23], [138, 56, 21], [50, 82, 14], [150, 82, 14]], hair, 4);
    if (hs === "sides") s += cluster([[53, 78, 12, 17], [147, 78, 12, 17]], hair, 4);
    s += personFace(m, d) + hat(d);
    s += G(arm(arms.l));
    s += G(arm(arms.r) + (d.holds && (o.pose === "point" || o.pose === "wave") ? at(arms.r[1], arms.r[2] - 4, 0.5, PROPS[d.holds] ? PROPS[d.holds]() : "") : ""), arms.wave ? 'class="sg-wave" style="transform-origin:134px 158px"' : "");
    return G(s, 'class="sg-bob"');
  }

  /* Sprout: a small robot with a leaf antenna. Same 200 by 280 box as a person, so it stands lower. */
  const RARMS = {
    idle: { l: ["M68,210 Q52,218 50,234", 50, 237], r: ["M132,210 Q148,218 150,234", 150, 237] },
    wave: { l: ["M68,210 Q52,218 50,234", 50, 237], r: ["M132,208 Q158,200 162,174", 163, 169], wave: true },
    point: { l: ["M68,210 Q52,218 50,234", 50, 237], r: ["M132,210 Q156,212 174,202", 178, 200] },
    cheer: { l: ["M68,208 Q42,200 38,174", 37, 169], r: ["M132,208 Q158,200 162,174", 163, 169] },
    hips: { l: ["M68,210 Q46,220 62,238", 64, 239], r: ["M132,210 Q154,220 138,238", 136, 239] },
    shrug: { l: ["M68,210 Q46,214 36,198", 34, 194], r: ["M132,210 Q154,214 164,198", 166, 194] }
  };
  function robotFace(m, glow) {
    const lit = (d, w) => line(d, glow, w || 5);
    const eye = (x, dir) => m.eyes === "arc" ? lit("M" + (x - 10) + ",156 Q" + x + ",141 " + (x + 10) + ",156")
      : m.eyes === "shut" ? lit("M" + (x - 9) + ",152 H" + (x + 9))
      : m.eyes === "wide" && m.mouth === "wavy" ? lit("M" + (x - 8 * dir) + ",143 L" + (x + 8 * dir) + ",151 L" + (x - 8 * dir) + ",159")
      : m.eyes === "wide" ? '<ellipse cx="' + x + '" cy="151" rx="10" ry="11" fill="none" stroke="' + glow + '" stroke-width="5"/>'
      : E(x + (m.eyes === "up" ? 2 : 0), m.eyes === "up" ? 146 : 151, 8, 11, glow, 0);
    let s = G(eye(80, 1) + eye(120, -1), 'class="sg-blink"');
    if (m.brows === "worried") s += lit("M70,136 L88,131 M112,131 L130,136", 4);
    if (m.brows === "angry") s += lit("M70,131 L88,137 M112,137 L130,131", 4);
    s += G(m.mouth === "grin" ? P("M90,167 Q100,181 110,167 Z", glow, 0)
      : m.mouth === "frown" ? lit("M91,174 Q100,167 109,174", 4)
      : m.mouth === "o" ? E(100, 172, 5, 6, glow, 0)
      : m.mouth === "wavy" ? lit("M88,172 Q92,167 96,172 T104,172 T112,172", 4)
      : m.mouth === "flat" ? lit("M92,172 H108", 4)
      : lit("M90,168 Q100,177 110,168", 4), 'class="sg-mouth"');
    return s;
  }
  function robot(d, o) {
    const m = MOODS[o.mood] || MOODS.happy, arms = RARMS[o.pose] || RARMS.idle;
    const body = d.body || "#f6fffa", trim = d.trim || C.green, glow = d.glow || "#7dfbff";
    const arm = (a) => tube(a[0], body, 11) + E(a[1], a[2], 10, 10, trim, 4);
    let s = E(100, 270, 46, 8, "rgba(43,33,71,.18)", 0);
    s += R(72, 244, 56, 22, 11, "#4a4466") + E(86, 255, 5, 5, "#cfcbe0", 0) + E(114, 255, 5, 5, "#cfcbe0", 0);
    s += G(arm(arms.l));
    s += R(66, 190, 68, 60, 24, body) + E(100, 222, 12, 12, trim, 4) + leaf(100, 230, 0.48, 0, "#fff", 2.5);
    s += R(34, 142, 14, 26, 6, trim) + R(152, 142, 14, 26, 6, trim) + R(42, 106, 116, 92, 36, body) + R(56, 121, 88, 64, 26, "#1d2a55", 4);
    s += robotFace(m, glow) + E(64, 190, 7, 4, "rgba(255,127,193,.55)", 0) + E(136, 190, 7, 4, "rgba(255,127,193,.55)", 0);
    s += G(line("M100,106 Q96,92 103,80", C.ink, 9) + line("M100,106 Q96,92 103,80", trim, 4) + leaf(103, 82, 1, -62, C.leaf) + leaf(103, 82, 1.15, 48, C.leaf), 'class="sg-antenna" style="transform-origin:100px 106px"');
    s += G(arm(arms.r), arms.wave ? 'class="sg-wave" style="transform-origin:132px 208px"' : "");
    if (m.sweat) s += sweat(166, 100);
    if (m.sparkle) s += sparkle(172, 100) + sparkle(30, 118, 0.7);
    return G(s, 'class="sg-bob sg-hover"');
  }

  /* A Busywork Bandit: a gremlin in a 200 by 220 box. `shape` picks the body, `back` and `front`
     add what makes each one itself. */
  const GBODY = {
    blob: "M100,38 C152,38 174,92 170,142 C167,186 140,203 100,203 C60,203 33,186 30,142 C26,92 48,38 100,38 Z",
    slug: "M100,74 C158,74 186,120 182,160 C180,192 150,203 100,203 C50,203 20,192 18,160 C14,120 42,74 100,74 Z",
    paper: "M56,34 H126 L158,66 V192 Q158,203 147,203 H56 Q45,203 45,192 V45 Q45,34 56,34 Z",
    ghost: "M100,34 C150,34 168,80 168,130 V200 L150,186 L134,202 L117,186 L100,202 L83,186 L66,202 L50,186 L32,200 V130 C32,80 50,34 100,34 Z"
  };
  function gremlinFace(m, d) {
    const look = m.mouth === "grin" ? "laugh" : m.eyes === "wide" && m.sweat ? "caught" : m.eyes === "wide" ? "shock" : m.eyes === "shut" ? "sleepy" : "sneaky";
    let s = P("M38,92 Q100,68 162,92 Q168,116 150,122 Q100,106 50,122 Q32,116 38,92 Z", C.ink, 0);
    const eye = (x, dir) => look === "laugh" ? line("M" + (x - 12) + ",106 Q" + x + ",90 " + (x + 12) + ",106", "#fff", 6)
      : look === "caught" ? E(x, 101, 15, 16, "#fff", 0) + line("M" + (x - 7) + ",94 L" + (x + 7) + ",108 M" + (x + 7) + ",94 L" + (x - 7) + ",108", C.ink, 4)
      : look === "shock" ? E(x, 100, 17, 18, "#fff", 0) + E(x, 101, 4.5, 5, C.ink, 0)
      : look === "sleepy" ? E(x, 104, 14, 7, "#fff", 0) + E(x, 105, 4, 4, C.ink, 0)
      : E(x, 101, 15, 16, "#fff", 0) + E(x + 5 * dir, 103, 6.5, 7.5, C.ink, 0) + P("M" + (x - 17) + ",84 H" + (x + 17) + " V" + (93 + (dir > 0 ? 0 : 0)) + " Q" + x + ",99 " + (x - 17) + ",93 Z", C.ink, 0);
    s += G(eye(78, 1) + eye(122, 1), 'class="sg-blink"');
    const mouth = d.scribble ? line("M70,146 L78,138 L86,150 L94,138 L102,150 L110,138 L118,150 L128,140", C.ink, 5)
      : look === "laugh" ? P("M68,138 Q100,184 132,138 Z", "#5a1030", 4) + E(100, 162, 12, 7, "#ff8a9a", 0) + P("M82,140 l7,10 l7,-10 Z", "#fff", 0) + P("M104,140 l7,10 l7,-10 Z", "#fff", 0)
      : look === "shock" ? E(100, 150, 10, 13, "#5a1030", 4)
      : look === "caught" ? line("M76,148 Q84,140 92,148 T108,148 T124,148", C.ink, 5) + P("M104,150 q2,14 10,10 q4,-6 -2,-11 Z", "#ff8a9a", 3)
      : look === "sleepy" ? E(100, 148, 6, 5, "#5a1030", 3)
      : P("M70,140 Q100,168 130,140 Q100,152 70,140 Z", "#5a1030", 4) + P("M86,147 l6,9 l6,-8 Z", "#fff", 0);
    return s + G(mouth, 'class="sg-mouth"') + (m.sweat ? sweat(174, 60) : "");
  }
  function oneGremlin(d, o, m) {
    const shape = d.shape || "blob", color = d.color || C.purple, deep = dark(color, 0.28), fy = shape === "slug" ? 30 : 0;
    const up = o.pose === "cheer" || m.mouth === "grin";
    const arm = (side) => { const x = side < 0 ? 36 : 164, k = side < 0 ? -1 : 1, y = 134 + fy * 0.6;
      const p = up ? "M" + x + "," + y + " Q" + (x + 24 * k) + "," + (y - 18) + " " + (x + 22 * k) + "," + (y - 44) : "M" + x + "," + y + " Q" + (x + 22 * k) + "," + (y + 8) + " " + (x + 18 * k) + "," + (y + 28);
      return tube(p, color, 11) + E(x + (up ? 22 : 18) * k, y + (up ? -47 : 31), 9, 9, color, 4); };
    let s = d.back ? d.back(color, o) : "";
    if (shape === "blob") s += P("M52,84 L22,38 Q54,44 78,58 Z", color) + P("M148,84 L178,38 Q146,44 122,58 Z", color) + P("M48,70 L34,48 Q50,52 62,60 Z", light(color), 0) + P("M152,70 L166,48 Q150,52 138,60 Z", light(color), 0);
    if (shape !== "ghost") s += E(76, 204, 21, 10, deep) + E(124, 204, 21, 10, deep);
    s += arm(-1) + arm(1);
    s += P(GBODY[shape], color, 5, d.opacity ? 'fill-opacity="' + d.opacity + '"' : "");
    if (shape === "blob" || shape === "slug") s += E(100, 168, 38, 26, light(color), 0);
    if (shape === "paper") s += P("M126,34 V66 H158 Z", light(color, 0.1) === "#ffffff" ? "#dfe8f7" : light(color), 4);
    s += at(0, fy, 1, gremlinFace(m, d));
    return s + (d.front ? d.front(color, o, m) : "");
  }
  function gremlin(d, o) {
    const m = MOODS[o.mood] || MOODS[d.mood] || MOODS.sneaky;
    let s = E(100, 210, 62, 9, "rgba(43,33,71,.18)", 0);
    if (d.twins) s += G(oneGremlin(d, o, m), 'transform="translate(-14,76) scale(.66)"') + G(oneGremlin(Object.assign({}, d, { color: d.color2 || light(d.color, 0.3) }), o, m), 'transform="translate(214,76) scale(-.66,.66)"') + T(52, 196, "2", 20, "#fff") + T(148, 196, "2", 20, "#fff");
    else s += oneGremlin(d, o, m);
    if (o.net) s += PROPS.net();
    return G(s, 'class="sg-bob"');
  }

  const CAST = (A.cast = {});
  /* Add a character. kind: "person", "robot", "gremlin", or give draw(opts) that returns SVG for a 200 by 280 box. */
  A.addCharacter = function (key, def) { CAST[key] = Object.assign({ kind: "person", name: key, tag: C.blue }, def); };
  A.characterMarkup = function (key, o) {
    const d = CAST[key] || CAST.sprout; o = o || {};
    const inner = d.draw ? d.draw(o) : d.kind === "robot" ? robot(d, o) : d.kind === "gremlin" ? gremlin(d, o) : person(d, o);
    return o.flip ? G(inner, 'transform="translate(200,0) scale(-1,1)"') : inner;
  };
  const boxOf = (d) => d.box || (d.kind === "gremlin" ? "0 0 200 220" : "0 0 200 280");
  A.character = function (key, o) {
    const d = CAST[key] || CAST.sprout;
    return A.svg(A.characterMarkup(key, o), { box: boxOf(d), class: "sg-char sg-char-" + (d.kind || "person") + (o && o.class ? " " + o.class : ""), fit: "xMidYMax meet" });
  };
  /* Just the head, for name tags, pins and small cards. */
  A.avatar = function (key, o) {
    const d = CAST[key] || CAST.sprout;
    return A.svg(A.characterMarkup(key, o), { box: d.head || (d.kind === "gremlin" ? "14 20 172 172" : d.kind === "robot" ? "30 62 140 140" : "30 6 140 140"), class: "sg-avatar" + (o && o.class ? " " + o.class : "") });
  };

  // the people of Cedar Hollow
  A.addCharacter("jordan", { name: "Jordan", role: "Owns Greenline. The chief.", tag: C.green, skin: SKIN.brown, hair: "#2e211c", top: C.green, pants: "#6b5a4a", hat: "cap", hatColor: C.greenDark, outfit: "logo" });
  A.addCharacter("luis", { name: "Luis", role: "Crew lead. Drives the truck.", tag: C.orange, skin: SKIN.tan, hair: "#1f1a17", hairStyle: "buzz", top: C.orange, outfit: "vest", hat: "bandana", hatColor: C.red, mustache: true });
  A.addCharacter("dana", { name: "Dana", role: "Dana's Garden", tag: C.pink, skin: SKIN.light, hair: "#c9562f", hairStyle: "long", top: C.pink, pants: "#3f8f6a", hat: "sunhat", hatColor: "#ffe08a" });
  A.addCharacter("bea", { name: "Bea", role: "The Daily Grind", tag: C.brown, skin: SKIN.deep, hair: "#2b1b14", hairStyle: "curly", top: C.red, outfit: "apron" });
  A.addCharacter("maple", { name: "Mayor Maple", role: "Town Square", tag: C.purple, skin: SKIN.tan, hair: "#f3f1fa", hairStyle: "sides", top: "#7a5ad6", outfit: "sash", hat: "tophat", hatColor: "#4a3b8f", mustache: true });
  A.addCharacter("nell", { name: "Nell", role: "Print and Post", tag: C.blue, skin: SKIN.light, hair: "#a9a6c2", hairStyle: "bun", top: C.blue, outfit: "apron", trim: "#fff", glasses: true });
  A.addCharacter("penny", { name: "Penny", role: "Cedar Hollow Savings", tag: C.teal, skin: SKIN.brown, hair: "#1f1a17", hairStyle: "tail", top: C.teal, pants: "#3b4a7a", outfit: "suit", trim: C.sun, glasses: true });
  A.addCharacter("gus", { name: "Gus", role: "The Workshop", tag: C.red, skin: SKIN.light, hair: "#c0621f", hairStyle: "sides", beard: true, top: C.sun, outfit: "overalls", trim: C.blue });
  A.addCharacter("detective", { name: "You", role: "Greenline's office detective", tag: C.sun, skin: SKIN.tan, hair: "#3a2a22", top: "#d9a441", pants: "#5b4a8f", outfit: "coat", hat: "fedora", hatColor: "#8a5a3c", holds: "magnifier" });
  A.addCharacter("sprout", { kind: "robot", name: "Sprout", role: "Your helper robot. The AI.", tag: C.teal });

  // the Busywork Bandits, in mission order
  const env = (x, y, r, s) => G(PROPS.envelope(), 'transform="translate(' + x + "," + y + ") rotate(" + r + ") scale(" + (s || 0.7) + ')"');
  A.addCharacter("clutter", { kind: "gremlin", name: "Clutter", role: "Buries the morning under email.", tag: C.purple, color: "#9b6bff",
    back: () => line("M84,42 Q78,22 66,18 M100,38 Q100,16 106,10 M116,42 Q124,24 136,22", C.ink, 5) + env(26, 150, -24) + env(176, 158, 20),
    front: () => env(60, 186, -12, 0.62) + env(146, 60, 24, 0.55) + env(100, 190, 8, 0.5) });
  A.addCharacter("slowpoke", { kind: "gremlin", name: "Slowpoke", role: "Makes every new lead wait.", tag: C.teal, color: "#2ec9b4", shape: "slug", mood: "sleepy",
    back: () => E(150, 128, 46, 46, C.orange) + line("M150,128 m-26,0 a26,26 0 1 1 26,26 a16,16 0 1 1 -16,-16 a7,7 0 1 1 7,7", dark(C.orange, 0.35), 5),
    front: () => P("M52,112 Q64,66 116,74 Q146,78 166,56 Q160,94 140,112 Q96,96 52,112 Z", C.blue) + E(168, 54, 10, 10, "#fff", 4) + T(30, 70, "z", 26, C.ink) + T(16, 46, "z", 18, C.ink) });
  A.addCharacter("mumbles", { kind: "gremlin", name: "Mumbles", role: "Scrambles the sign so nobody understands it.", tag: C.orange, color: "#ff9f2e", scribble: true,
    front: () => P("M128,6 H186 Q194,6 194,14 V40 Q194,48 186,48 H160 L148,62 V48 H128 Q120,48 120,40 V14 Q120,6 128,6 Z", "#fff", 4) + line("M130,22 L138,16 L146,26 L154,16 L162,26 L170,16 L180,24 M132,36 L142,32 L150,38 L162,32", C.ink, 3.5) + T(22, 60, "?", 30, C.ink) });
  A.addCharacter("hideseek", { kind: "gremlin", name: "Hide-and-Seek", role: "Hides Greenline from the town map.", tag: "#8fbf2f", color: "#b7d94a",
    back: () => cluster([[100, 34, 34, 26], [66, 44, 24, 20], [134, 44, 24, 20]], C.greenDark, 4),
    front: () => cluster([[100, 40, 30, 20], [70, 50, 20, 15], [130, 50, 20, 15]], C.greenDark, 4) + leaf(74, 42, 0.8, -30, C.leaf) + leaf(126, 40, 0.8, 30, C.leaf) + leaf(100, 30, 0.9, 0, C.leaf) + at(16, 196, 0.8, PROPS.bush({ color: C.leaf })) });
  A.addCharacter("blankpage", { kind: "gremlin", name: "Blank Page", role: "Steals the ideas so the marketing stops.", tag: "#8aa6d6", color: "#ffffff", shape: "paper",
    front: () => line("M62,150 H140 M62,166 H140 M62,182 H118", "#cfe0f7", 4) + G(R(-16, -10, 32, 20, 5, C.pink, 4) + R(-16, -10, 12, 20, 0, C.blue, 0) + line("M-4,-10 V10", C.ink, 3), 'transform="translate(182,150) rotate(-20)"') });
  A.addCharacter("ghoster", { kind: "gremlin", name: "The Ghoster", role: "Makes leads go quiet.", tag: "#a58bff", color: "#e9e1ff", shape: "ghost", opacity: 0.94,
    front: () => R(118, 2, 70, 36, 18, "#fff", 4) + E(138, 20, 5, 5, C.gray, 0) + E(153, 20, 5, 5, C.gray, 0) + E(168, 20, 5, 5, C.gray, 0) });
  A.addCharacter("doubletrouble", { kind: "gremlin", name: "Double Trouble", role: "Copies rows so the numbers disagree.", tag: C.pink, color: "#ff5d8f", color2: "#ff9fc0", twins: true });
  A.addCharacter("chaos", { kind: "gremlin", name: "Captain Chaos", role: "Breaks things on Friday afternoon.", tag: C.red, color: "#e5484d",
    back: () => "",
    front: () => P("M36,64 Q100,-14 164,64 Q100,44 36,64 Z", C.ink) + line("M44,60 Q100,42 156,60", C.sun, 5) + P("M104,14 L90,36 H100 L96,52 L112,30 H102 Z", C.sun, 3) +
      P("M70,128 Q86,116 100,127 Q114,116 130,128 Q114,140 100,131 Q86,140 70,128 Z", "#3a2a22", 3) + P("M92,172 L100,164 L108,172 L104,200 L100,206 L96,200 Z", C.sun, 4) });

  // ── places ──
  const win = (x, y, w, h) => R(x, y, w, h, 8, C.glass) + line("M" + (x + w / 2) + "," + y + " V" + (y + h) + " M" + x + "," + (y + h / 2) + " H" + (x + w), C.ink, 4) + line("M" + (x + 7) + "," + (y + 14) + " L" + (x + 14) + "," + (y + 7), "#fff", 4);
  const gear = (cx, cy, r, fill) => { let d = ""; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, rr = i % 2 ? r : r * 0.74; d += (i ? "L" : "M") + (cx + Math.cos(a - 0.12) * rr).toFixed(1) + "," + (cy + Math.sin(a - 0.12) * rr).toFixed(1) + "L" + (cx + Math.cos(a + 0.12) * rr).toFixed(1) + "," + (cy + Math.sin(a + 0.12) * rr).toFixed(1); } return P(d + "Z", fill, 4) + E(cx, cy, r * 0.3, r * 0.3, "#fff", 4); };
  const PLACES = (A.places = {});
  /* Add a place. building() draws it around the origin: about 260 wide, up to 220 tall, standing on y = 0. */
  A.addPlace = function (key, def) { PLACES[key] = Object.assign({ name: key, host: null }, def); };

  A.addPlace("hq", { name: "Greenline HQ", host: "jordan", building: () =>
    R(-112, -128, 224, 128, 10, C.green) + P("M-126,-128 L-100,-178 H100 L126,-128 Z", C.greenDark) +
    R(-88, -172, 176, 38, 12, "#fff") + leaf(-68, -142, 0.8, 20, C.leaf, 3) + T(10, -145, "GREENLINE", 21, C.greenDark, 'textLength="124" lengthAdjust="spacingAndGlyphs"') +
    R(-24, -82, 48, 82, 10, C.sun) + E(13, -40, 4, 4, C.ink, 0) + win(-94, -102, 50, 46) + win(44, -102, 50, 46) +
    at(-112, 0, 1, PROPS.pot()) + at(112, 0, 1, PROPS.pot()) });
  A.addPlace("garden", { name: "Dana's Garden", host: "dana", building: () =>
    at(-104, -4, 0.8, PROPS.tree()) + R(36, -168, 22, 44, 4, C.orange) + R(-72, -104, 144, 104, 10, "#ffc6de") + P("M-94,-100 L0,-180 L94,-100 Z", "#ff5d7d") + E(0, -130, 15, 15, C.glass) +
    P("M-20,0 V-52 Q-20,-74 0,-74 Q20,-74 20,-52 V0 Z", C.teal) + E(10, -34, 3.5, 3.5, C.ink, 0) + win(-60, -78, 30, 34) + win(30, -78, 30, 34) +
    at(-130, 0, 1, PROPS.fence({ w: 52 })) + at(78, 0, 1, PROPS.fence({ w: 52 })) +
    at(-118, 0, 0.8, PROPS.flower({ color: C.red })) + at(-96, 0, 0.9, PROPS.flower({ color: C.sun })) + at(96, 0, 0.9, PROPS.flower({ color: C.purple })) + at(118, 0, 0.8, PROPS.flower({ color: C.orange })) });
  A.addPlace("grind", { name: "The Daily Grind", host: "bea", building: () => {
    let awning = "";
    for (let i = 0; i < 8; i++) { const x = -112 + i * 28; awning += P("M" + (x * 0.93) + ",-100 H" + ((x + 28) * 0.93) + " L" + (x + 28) + ",-70 Q" + (x + 14) + ",-56 " + x + ",-70 Z", i % 2 ? "#fff" : C.red, 4); }
    return R(-104, -124, 208, 124, 10, C.cream) + R(-114, -148, 228, 28, 8, C.brown) + T(0, -127, "DAILY GRIND", 16, "#fff", 'textLength="120" lengthAdjust="spacingAndGlyphs"') +
      G(tube("M-8,-196 Q-16,-206 -8,-216", "#fff", 4) + tube("M8,-196 Q0,-206 8,-216", "#fff", 4), 'class="sg-steam"') +
      P("M-24,-190 H24 L18,-156 Q16,-150 9,-150 H-9 Q-16,-150 -18,-156 Z", "#fff") + line("M24,-182 Q42,-180 38,-166 Q34,-158 21,-162", C.ink, 5) + E(0, -149, 32, 6, "#fff", 4) + E(0, -172, 8, 8, C.brown, 3) +
      R(-88, -60, 96, 44, 8, C.glass) + line("M-40,-60 V-16", C.ink, 4) + line("M-80,-46 L-70,-54", "#fff", 4) + R(30, -66, 46, 66, 8, C.brown) + E(53, -44, 9, 9, C.glass, 3) + E(66, -28, 3, 3, C.ink, 0) + awning; } });
  A.addPlace("square", { name: "Town Square", host: "maple", building: () =>
    R(-106, -66, 12, 66, 3, C.wood) + R(-36, -66, 12, 66, 3, C.wood) + R(-128, -176, 130, 114, 10, "#fff") + R(-118, -166, 110, 82, 6, "#bfeaff", 3) +
    E(-28, -146, 11, 11, C.sun, 3) + P("M-118,-104 Q-90,-130 -62,-108 Q-36,-124 -8,-104 V-84 H-118 Z", C.grass, 3) + T(-63, -68, "GREENLINE", 13, C.greenDark, 'textLength="84" lengthAdjust="spacingAndGlyphs"') +
    E(-100, -180, 6, 6, C.sun, 3) + E(-63, -180, 6, 6, C.sun, 3) + E(-26, -180, 6, 6, C.sun, 3) +
    R(40, -96, 80, 96, 10, C.sun) + P("M28,-96 L80,-142 L132,-96 Z", C.red) + R(52, -82, 56, 44, 6, "#fff", 4) +
    '<path d="M60,-48 Q72,-70 84,-58 T100,-66" fill="none" stroke="' + C.blue + '" stroke-width="3.5" stroke-dasharray="5 5" stroke-linecap="round"/>' + at(88, -82, 0.42, ICONS.pin()) +
    E(80, -116, 9, 9, "#fff", 3) + T(80, -111, "i", 13) + at(14, 0, 0.72, PROPS.lamp()) });
  A.addPlace("post", { name: "Print and Post", host: "nell", building: () =>
    R(-3, -176, 6, 34, 2, C.wood, 3) + at(0, -182, 1.25, PROPS.envelope()) + R(-104, -118, 208, 118, 10, "#69b1ff") + R(-114, -144, 228, 30, 10, "#3577e0") + T(0, -123, "PRINT AND POST", 15, "#fff", 'textLength="150" lengthAdjust="spacingAndGlyphs"') +
    R(-22, -72, 44, 72, 8, C.sun) + E(12, -36, 3.5, 3.5, C.ink, 0) + R(-92, -88, 56, 52, 8, C.glass) + R(-84, -80, 18, 24, 3, C.red, 3) + R(-62, -80, 18, 24, 3, C.sun, 3) + R(-84, -52, 40, 10, 3, C.green, 3) +
    R(36, -88, 56, 52, 8, C.glass) + at(40, -84, 1, ICONS.printer()) + R(-126, -14, 8, 14, 2, C.ink, 0) + R(-136, -56, 28, 42, 12, C.red) + line("M-130,-40 H-114", C.ink, 4) });
  A.addPlace("bank", { name: "Cedar Hollow Savings", host: "penny", building: () =>
    R(-118, -12, 236, 12, 4, "#d8d2e6") + R(-108, -24, 216, 13, 4, "#e9e4f3") + R(-98, -112, 196, 90, 6, C.cream) + R(-13, -76, 26, 54, 8, "#7a5ad6") +
    [-84, -46, 28, 66].map((x) => R(x, -104, 18, 82, 7, "#fff") + R(x - 3, -108, 24, 9, 3, "#fff", 4) + R(x - 3, -30, 24, 9, 3, "#fff", 4)).join("") +
    R(-106, -124, 212, 18, 4, "#fff") + T(0, -110, "SAVINGS", 12, C.ink, 'textLength="60" lengthAdjust="spacingAndGlyphs"') + P("M-118,-124 L0,-182 L118,-124 Z", C.teal) + at(0, -146, 1, PROPS.coin()) });
  A.addPlace("workshop", { name: "The Workshop", host: "gus", building: () =>
    R(54, -178, 18, 40, 4, C.road) + G(cluster([[64, -192, 10], [74, -204, 12], [62, -212, 9]], "#fff", 3), 'class="sg-steam"') +
    R(-98, -108, 196, 108, 8, C.red) + P("M-112,-104 L-72,-156 L0,-182 L72,-156 L112,-104 Z", "#b5384a") + gear(0, -134, 20, C.sun) +
    R(-58, -82, 116, 82, 8, C.cream) + line("M-58,-62 H58 M-58,-42 H58 M-58,-22 H58", C.wood, 4) + R(-10, -16, 20, 7, 3, C.ink, 0) +
    R(80, -22, 40, 22, 5, C.blue) + line("M90,-22 Q100,-36 110,-22", C.ink, 5) + E(-116, -17, 17, 17, "#3a3350") + E(-116, -17, 7, 7, "#cfcbe0", 0) });
  A.addPlace("park", { name: "Hollow Park", host: null, building: () =>
    E(14, -22, 92, 26, C.water) + line("M-30,-26 H-8 M26,-16 H54", "#fff", 4) + at(-84, -16, 1.15, PROPS.tree()) + at(92, -34, 0.8, PROPS.pine()) +
    G(at(34, -26, 1, E(0, 0, 14, 10, C.sun, 4) + E(11, -10, 8, 8, C.sun, 4) + P("M18,-11 L28,-8 L18,-5 Z", C.orange, 3) + E(13, -12, 1.8, 1.8, C.ink, 0)), 'class="sg-float"') +
    at(-10, 4, 0.9, PROPS.bench()) + at(-124, 2, 0.8, PROPS.flower({ color: C.pink })) + at(124, 2, 0.8, PROPS.flower({ color: C.sun })) });

  /* The sky, hills and grass every backdrop shares. 800 by 600, and it is cropped to fill the stage
     ("slice"), so keep what matters between x = 250 and x = 550 and below y = 130. */
  function land(o) {
    return R(-20, -20, 840, 640, 0, "url(#sg-sky)", 0) + at(676, 222, 1, PROPS.sun()) +
      G(at(120, 196, 1.1, PROPS.cloud()), 'class="sg-drift"') + G(at(540, 176, 0.8, PROPS.cloud()), 'class="sg-drift sg-drift-b"') + G(at(310, 150, 0.7, PROPS.cloud()), 'class="sg-drift sg-drift-c"') +
      P("M-20,440 Q90,300 250,372 T520,356 T820,340 V460 H-20 Z", C.hillFar) + P("M-20,450 Q160,372 330,420 T640,404 T820,420 V470 H-20 Z", C.hill) +
      R(-20, 436, 840, 190, 0, C.grass, 0) + line("M-20,436 H820", C.ink, 5) + (o && o.noPath ? "" : P("M352,438 Q372,520 300,620 H520 Q452,520 452,438 Z", C.sand, 4)) +
      [[60, 520], [200, 566], [610, 548], [740, 500], [690, 580], [120, 590]].map((p) => line("M" + p[0] + "," + p[1] + " l6,-12 M" + (p[0] + 9) + "," + p[1] + " l-2,-13 M" + (p[0] + 17) + "," + p[1] + " l-7,-11", C.grassDark, 4)).join("");
  }
  A.sceneMarkup = function (key, o) {
    o = o || {}; const d = PLACES[key] || PLACES.hq;
    const b = at(400, 442, 1.55, d.building());
    return land(o) + at(70, 474, 1.5, PROPS.tree()) + at(742, 466, 1.3, PROPS.tree({ color: C.grassDark })) + at(168, 456, 1, PROPS.bush()) + at(640, 456, 1, PROPS.bush({ color: C.leaf })) +
      (o.gray ? G(b, 'filter="url(#sg-gray)" class="sg-zone"') : G(b, 'class="sg-zone"')) + (d.decor ? d.decor(o) : "");
  };
  A.scene = function (key, o) { return A.svg(A.sceneMarkup(key, o), { box: "0 0 800 600", fit: "xMidYMax slice", class: "sg-scene" + (o && o.class ? " " + o.class : "") }); };
  /* The title screen: the town on the hills, a road in front. The truck, Sprout and the bandit are
     separate pictures the engine lays over it, so they stay in view on a wide or a tall screen. */
  A.titleScene = function () {
    return A.svg(land({ noPath: true }) +
      at(34, 438, 0.44, PLACES.post.building()) + at(766, 438, 0.44, PLACES.square.building()) + at(146, 438, 0.46, PLACES.bank.building()) + at(654, 438, 0.46, PLACES.workshop.building()) +
      at(268, 438, 0.5, PLACES.grind.building()) + at(532, 438, 0.5, PLACES.garden.building()) + at(400, 438, 0.62, PLACES.hq.building()) +
      R(-20, 486, 840, 74, 0, C.road, 0) + line("M-20,486 H820 M-20,560 H820", C.ink, 5) + '<path d="M-20,523 H820" stroke="' + C.roadLine + '" stroke-width="6" stroke-dasharray="34 26" fill="none"/>',
      { box: "0 0 800 600", fit: "xMidYMax slice", class: "sg-scene" });
  };

  // ── the town map ──
  /* Two layouts: "wide" for a laptop, "tall" for a phone held upright. One ring road, a stop on it
     for every place, and the park in the middle. x and y are where a building stands. */
  const LAYOUTS = {
    wide: { w: 1000, h: 600, scale: 0.6, truck: 0.36,
      road: "M285,222 H715 Q785,222 785,292 V348 Q785,418 715,418 H285 Q215,418 215,348 V292 Q215,222 285,222 Z",
      places: { bank: { x: 262, y: 184, stop: [262, 222] }, square: { x: 500, y: 182, stop: [500, 222] }, post: { x: 738, y: 184, stop: [738, 222] },
        hq: { x: 106, y: 386, stop: [215, 336] }, grind: { x: 894, y: 386, stop: [785, 336] },
        garden: { x: 318, y: 568, stop: [318, 418] }, workshop: { x: 682, y: 568, stop: [682, 418] }, park: { x: 500, y: 352, stop: [500, 418], s: 0.8 } },
      trees: [[52, 150, 0.5], [950, 140, 0.5], [44, 566, 0.55], [958, 566, 0.55], [122, 92, 0.4], [880, 86, 0.4], [150, 540, 0.4], [850, 544, 0.4], [382, 84, 0.36], [620, 84, 0.36]] },
    tall: { w: 560, h: 900, scale: 0.5, truck: 0.34, label: 1.18,
      road: "M265,250 H295 Q355,250 355,310 V740 Q355,800 295,800 H265 Q205,800 205,740 V310 Q205,250 265,250 Z",
      places: { square: { x: 280, y: 216, stop: [280, 250] }, bank: { x: 100, y: 404, stop: [205, 366] }, post: { x: 460, y: 404, stop: [355, 366] },
        hq: { x: 100, y: 614, stop: [205, 574] }, grind: { x: 460, y: 614, stop: [355, 574] },
        garden: { x: 100, y: 824, stop: [205, 738] }, workshop: { x: 460, y: 824, stop: [355, 738] }, park: { x: 280, y: 548, stop: [280, 800], s: 0.62 } },
      trees: [[60, 190, 0.5], [500, 180, 0.5], [130, 120, 0.4], [430, 110, 0.4], [280, 690, 0.42], [280, 400, 0.4]] }
  };
  A.layouts = LAYOUTS;
  const plate = (x, y, name, k) => { const w = Math.round((name.length * 6.6 + 18) * k); return R(x - w / 2, y, w, 21 * k, 9 * k, "#fff", 3) + T(x, y + 15 * k, name, 12 * k, C.ink, 'textLength="' + Math.round(w - 16 * k) + '" lengthAdjust="spacingAndGlyphs"'); };
  /* A.townMap(layout, {gray: {place: true}, peek: {place: "banditKey"}}) returns
       el            the <svg>
       w, h          its size in map units
       pin(place)    {x, y} just above that place, for a button laid over the map
       stop(place)   how far along the ring road that place's stop is
       truckTo(d)    put the truck at distance d along the road (it faces the way it is moving)
       path(a, b)    the short way round from stop a to stop b, as a signed distance
       reveal(place) bring a gray place back: returns the clip circle to grow, and a function to finish */
  A.townMap = function (layout, o) {
    const L = LAYOUTS[layout] || LAYOUTS.wide, gray = (o && o.gray) || {}, peek = (o && o.peek) || {};
    const zone = (key) => { const p = L.places[key]; return at(p.x, p.y, L.scale * (p.s || 1), PLACES[key].building()) + plate(p.x, p.y + 6, PLACES[key].name, L.label || 1); };
    let s = R(0, 0, L.w, L.h, 0, C.grass, 0);
    for (let i = 0; i < 26; i++) { const x = (i * 197 + 61) % L.w, y = (i * 131 + 47) % L.h; s += i % 3 ? line("M" + x + "," + y + " l5,-10 M" + (x + 8) + "," + y + " l-1,-11 M" + (x + 15) + "," + y + " l-6,-9", C.grassDark, 3.5) : E(x, y, 30, 12, C.hill, 0); }
    s += L.trees.map((t) => at(t[0], t[1], t[2], t[0] % 2 ? PROPS.pine() : PROPS.tree())).join("");
    s += line(L.road, C.ink, 40) + '<path class="sg-roadline" d="' + L.road + '" fill="none" stroke="' + C.road + '" stroke-width="30"/>' + '<path d="' + L.road + '" fill="none" stroke="' + C.roadLine + '" stroke-width="3.5" stroke-dasharray="14 12"/>';
    Object.keys(L.places).forEach((key) => {
      const p = L.places[key];
      if (peek[key]) s += G(at(p.x + (key === "park" ? -14 : (p.peek || 16) * L.scale * 2), p.y - (key === "park" ? 150 : 250) * L.scale * (p.s || 1), 0.24, A.characterMarkup(peek[key], { mood: "sneaky" })), 'class="sg-peek" data-peek="' + key + '"');
      s += G(zone(key), 'data-zone="' + key + '"' + (gray[key] ? ' filter="url(#sg-gray)"' : ""));
    });
    s += '<clipPath id="sg-reveal"><circle cx="0" cy="0" r="0"/></clipPath><g class="sg-revealed" clip-path="url(#sg-reveal)"></g>';
    s += G(G(PROPS.truck(), 'class="sg-truckbody"'), 'class="sg-maptruck"');
    const el = A.svg(s, { box: "0 0 " + L.w + " " + L.h, class: "sg-mapart" });
    const road = el.querySelector(".sg-roadline"), truck = el.querySelector(".sg-maptruck");
    let len = 0, stops = null, here = 0;
    function measure() {                                 // the road can only be measured once it is on the page
      if (stops) return; len = road.getTotalLength(); stops = {};
      Object.keys(L.places).forEach((key) => { const t = L.places[key].stop; let best = 0, bd = 1e9;
        for (let i = 0; i <= 400; i++) { const q = road.getPointAtLength(len * i / 400), dd = (q.x - t[0]) * (q.x - t[0]) + (q.y - t[1]) * (q.y - t[1]); if (dd < bd) { bd = dd; best = len * i / 400; } }
        stops[key] = best; });
    }
    const map = { el: el, w: L.w, h: L.h, layout: LAYOUTS[layout] ? layout : "wide", places: L.places,
      pin: (key) => { const p = L.places[key]; return { x: p.x - (key === "park" ? 0 : 70 * L.scale), y: p.y - (key === "park" ? 190 : 216) * L.scale * (p.s || 1) }; },
      stop: (key) => { measure(); return stops[key] || 0; },
      path: (a, b) => { measure(); return ((stops[b] - stops[a] + len * 1.5) % len) - len / 2; },
      truckTo: (d, dir) => { measure(); here = ((d % len) + len) % len; const p = road.getPointAtLength(here), q = road.getPointAtLength((here + (dir || 1) * 6 + len) % len), left = q.x < p.x - 0.01 || (Math.abs(q.x - p.x) <= 0.01 && map._left);
        map._left = left; truck.setAttribute("transform", "translate(" + p.x.toFixed(1) + "," + (p.y + 6).toFixed(1) + ") scale(" + (left ? -L.truck : L.truck) + "," + L.truck + ")"); },
      where: () => here,
      reveal: (key) => { const p = L.places[key], g = el.querySelector(".sg-revealed"), c = el.querySelector("#sg-reveal circle"), old = el.querySelector('[data-zone="' + key + '"]');
        g.innerHTML = zone(key); c.setAttribute("cx", p.x); c.setAttribute("cy", p.y - 50); c.setAttribute("r", 0);
        return { circle: c, max: 190, x: p.x, y: p.y - 50, finish: () => { if (old) old.removeAttribute("filter"); g.innerHTML = ""; c.setAttribute("r", 0); } }; } };
    return map;
  };
})();
