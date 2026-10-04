/* Office Hours · the shell.
   A tiny app with no framework and no server: open index.html and it runs.

   The command center is eight pieces, built one a week. Each piece is ONE file in the pieces folder
   with a fixed name (pieces/week-1-today.js and so on). When the file is there, the piece shows.
   Nobody edits a list. The shell gives every piece the same small toolbox (OH.*), keeps what you
   type in this browser only (localStorage), and draws the home screen, the build page and the runbook.

   The eight tools from version 1 of the class are still here as the Toolbox (app/modules/), and so
   is the game (app/game/). How to write a piece or a tool: MODULES.md. */
(function () {
  "use strict";
  const C = window.OH_COURSE, M = window.OH_MANIFEST;
  const OH = (window.OH = { course: C, manifest: M, modules: {}, pieces: {}, pieceState: {}, runbooks: {}, toolRunbooks: {}, classKit: {} });
  window.OH_SAMPLE = window.OH_SAMPLE || {};
  OH.sample = window.OH_SAMPLE;
  OH.sample.cc = OH.sample.cc || {};
  const PIECES = C.pieces || [];
  const pieceInfo = (n) => PIECES.find((p) => p.week === n);

  // ── small DOM builder: OH.h("div", {class: "card", onclick: fn}, "text", childNode, [more]) ──
  OH.h = function (tag, attrs) {
    const n = document.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (k === "value") n.value = v;
      else if (k === "checked") n.checked = !!v;
      else n.setAttribute(k, v === true ? "" : v);
    }
    const add = (c) => { if (c == null || c === false) return; if (Array.isArray(c)) return c.forEach(add); n.appendChild(c.nodeType ? c : document.createTextNode(String(c))); };
    for (let i = 2; i < arguments.length; i++) add(arguments[i]);
    return n;
  };
  const h = OH.h;

  // ── storage: this browser only, never sent anywhere ──
  const NS = "oh-demo:";
  OH.store = {
    get(key, fallback) { try { const v = localStorage.getItem(NS + key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set(key, value) { try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch (e) { /* private window or a full store: keep going */ } },
    remove(key) { try { localStorage.removeItem(NS + key); } catch (e) { /* nothing to remove */ } },
    /* Everything this app keeps in this browser, as one object. Used for the backup file. */
    all() { const out = {}; try { Object.keys(localStorage).forEach((k) => { if (k.indexOf(NS) === 0) { try { out[k.slice(NS.length)] = JSON.parse(localStorage.getItem(k)); } catch (e) { /* skip one bad entry */ } } }); } catch (e) { /* nothing kept */ } return out; },
    putAll(obj) { Object.keys(obj || {}).forEach((k) => OH.store.set(k, obj[k])); brand(); },
    clear(prefix) { try { Object.keys(localStorage).filter((k) => k.indexOf(NS + prefix) === 0).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* nothing to clear */ } }
  };

  OH.toast = function (msg) {
    const t = document.getElementById("toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(OH._tt); OH._tt = setTimeout(() => { t.hidden = true; }, 1900);
  };
  OH.copy = function (text, what) {
    const done = () => OH.toast((what || "Copied") + ". Paste it where you need it.");
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    fallbackCopy(text, done);
  };
  function fallbackCopy(text, done) {
    const ta = h("textarea", { style: "position:fixed;left:-9999px" }); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { OH.toast("Select the text and copy it by hand"); }
    ta.remove();
  }
  OH.download = function (filename, text, type) {
    const a = h("a", { href: URL.createObjectURL(new Blob([text], { type: type || "text/plain" })), download: filename });
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  // ── CSV in and out (handles quotes, commas inside quotes, tabs pasted from a spreadsheet) ──
  OH.parseCSV = function (text) {
    text = String(text || "").replace(/\r\n?/g, "\n");
    const first = text.split("\n")[0] || "";
    const sep = first.split("\t").length > first.split(",").length ? "\t" : ",";
    const rows = []; let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
      else if (ch === '"') q = true;
      else if (ch === sep) { row.push(cell); cell = ""; }
      else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += ch;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
  };
  OH.toCSV = function (rows, sep) {
    sep = sep || ",";
    return rows.map((r) => r.map((c) => { c = c == null ? "" : String(c); return /["\n]/.test(c) || c.indexOf(sep) >= 0 ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(sep)).join("\n");
  };
  /* OH.rows(text) : a CSV or a pasted sheet as a list of objects, keyed by the header row in lower case. */
  OH.rows = function (text) {
    const all = OH.parseCSV(text); if (all.length < 2) return [];
    const head = all[0].map((c) => String(c).trim().toLowerCase());
    return all.slice(1).map((r) => { const o = {}; head.forEach((k, i) => { if (k) o[k] = String(r[i] == null ? "" : r[i]).trim(); }); return o; });
  };

  // ── widgets ──
  OH.card = function (title) { return h("div", { class: "card" }, title ? h("h2", null, title) : null, Array.prototype.slice.call(arguments, 1)); };
  OH.step = function (title) { return h("section", { class: "step" }, h("h2", null, title), Array.prototype.slice.call(arguments, 1)); };
  OH.stat = function (k, v, d, tone) { return h("div", { class: "stat" }, h("div", { class: "k" }, k), h("div", { class: "v " + (tone || "") }, String(v)), d ? h("div", { class: "d" }, d) : null); };
  OH.badge = function (text, tone) { return h("span", { class: "badge " + (tone || "") }, text); };
  OH.note = function (text, tone) { return h("div", { class: "note " + (tone || "") }, text); };

  /* OH.table([{h: "Name", f: row => cell, s: row => sortValue}], rows, {rowClass: row => "hot", empty: "Nothing yet"}) */
  OH.table = function (cols, rows, opts) {
    opts = opts || {};
    let sortBy = opts.sort != null ? opts.sort : -1, dir = 1;
    const wrap = h("div", { class: "wrap" });
    function draw() {
      let list = rows.slice();
      if (sortBy >= 0) { const key = cols[sortBy].s || cols[sortBy].f; list.sort((a, b) => { const x = key(a), y = key(b); return (x > y ? 1 : x < y ? -1 : 0) * dir; }); }
      wrap.innerHTML = "";
      wrap.appendChild(h("table", null,
        h("thead", null, h("tr", null, cols.map((c, i) => h("th", { onclick: () => { dir = sortBy === i ? -dir : 1; sortBy = i; draw(); } }, c.h + (sortBy === i ? (dir > 0 ? " ▲" : " ▼") : ""))))),
        h("tbody", null, list.length ? list.map((r) => h("tr", { class: opts.rowClass ? opts.rowClass(r) : "" }, cols.map((c) => h("td", null, c.f(r)))))
          : h("tr", null, h("td", { colspan: cols.length, class: "mut" }, opts.empty || "Nothing here yet.")))));
    }
    draw();
    return wrap;
  };

  /* OH.bars([{label, value}], {unit: "clicks"}) : a horizontal bar chart made of plain boxes */
  OH.bars = function (items, opts) {
    opts = opts || {};
    const max = Math.max.apply(null, items.map((i) => i.value).concat([1]));
    return h("div", { class: "bars" }, items.map((i) => h("div", { class: "barrow" }, h("span", null, i.label),
      h("div", { class: "bartrack" }, h("div", { class: "barfill", style: "width:" + Math.max(2, Math.round(i.value / max * 100)) + "%" })),
      h("b", null, (opts.fmt ? opts.fmt(i.value) : i.value.toLocaleString()) + (opts.unit ? " " + opts.unit : "")))));
  };

  /* OH.promptBox({prompt, data, dataLabel}) : shows a prompt you can edit, with copy buttons and links to an AI chat.
     Returns {el, text()}. `data` is what gets pasted under the prompt (a string or a function returning one). */
  OH.promptBox = function (o) {
    const ta = h("textarea", { style: "min-height:" + (o.height || 190) + "px", "aria-label": "The prompt. You can change it." }); ta.value = o.prompt;
    const data = () => (typeof o.data === "function" ? o.data() : o.data || "");
    const season = /^#\/p\d/.test(location.hash);          // inside a piece of the command center: the class uses the Claude app and Claude Code
    const el = h("div", null, ta,
      h("div", { class: "row", style: "margin-top:8px" },
        h("button", { class: "primary", onclick: () => OH.copy(ta.value + "\n\n" + data(), "Prompt and " + (o.dataLabel || "data") + " copied") }, "Copy the prompt and the " + (o.dataLabel || "data")),
        h("button", { onclick: () => OH.copy(ta.value, "Prompt copied") }, "Copy the prompt only"),
        h("span", { class: "spacer" }),
        h("a", { class: "btn", href: "https://claude.ai/new", target: "_blank", rel: "noopener" }, "Open Claude"),
        season ? null : h("a", { class: "btn", href: "https://chatgpt.com/", target: "_blank", rel: "noopener" }, "Open ChatGPT")),
      h("div", { class: "mut", style: "font-size:13px;margin-top:6px" }, (season ? "Paste it into the Claude app or Claude Code." : "Paste it into the AI chat you use.") + " Leave out anything with a password or a card number."));
    return { el: el, text: () => ta.value };
  };

  /* OH.pasteBox({label, placeholder, sample, onUse}) : where the AI's answer comes back in. */
  OH.pasteBox = function (o) {
    const ta = h("textarea", { placeholder: o.placeholder || "Paste the AI's answer here", "aria-label": o.label || "Paste the AI's answer here" });
    return h("div", null, o.label ? h("label", { class: "f" }, o.label) : null, ta,
      h("div", { class: "row", style: "margin-top:8px" },
        h("button", { class: "primary", onclick: () => { if (!ta.value.trim()) return OH.toast("Paste the answer first, or load the sample answer"); o.onUse(ta.value); } }, o.useLabel || "Use this answer"),
        o.sample ? h("button", { onclick: () => { ta.value = typeof o.sample === "function" ? o.sample() : o.sample; o.onUse(ta.value); } }, o.sampleLabel || "No AI handy? Load the sample answer") : null));
  };

  /* OH.check(text, done, onChange, extra) : one line with a tick box. */
  OH.check = function (text, done, onChange, extra) {
    return h("label", { class: "check" + (done ? " done" : "") }, h("input", { type: "checkbox", checked: !!done, onchange: (ev) => onChange(ev.target.checked) }), h("span", null, text, extra ? h("small", null, extra) : null));
  };

  /* OH.field("Label", inputNode, "hint") : a labelled form control. */
  let fid = 0;
  OH.field = function (label, control, hint) {
    if (!control.id) control.id = "ohf" + (++fid);
    return h("div", { class: "field" }, h("label", { class: "f", for: control.id }, label), control, hint ? h("div", { class: "mut", style: "font-size:12.5px;margin-top:3px" }, hint) : null);
  };

  /* OH.tabs("key", [{id, label, count, render(panel)}]) : tabs inside a piece. The open tab is remembered. */
  OH.tabs = function (key, tabs) {
    const sk = "tab:" + key; let cur = OH.store.get(sk, tabs[0].id); if (!tabs.some((t) => t.id === cur)) cur = tabs[0].id;
    const bar = h("div", { class: "tabs", role: "tablist" }), panel = h("div", { class: "tabpanel", role: "tabpanel" });
    function draw() {
      bar.innerHTML = "";
      tabs.forEach((t) => { const n = typeof t.count === "function" ? t.count() : t.count;
        bar.appendChild(h("button", { role: "tab", "aria-selected": t.id === cur ? "true" : "false", class: t.id === cur ? "on" : "", onclick: () => { cur = t.id; OH.store.set(sk, cur); draw(); } }, t.label, n != null && n !== "" ? h("span", { class: "badge" }, n) : null)); });
      panel.innerHTML = ""; tabs.find((t) => t.id === cur).render(panel);
    }
    draw();
    return h("div", null, bar, panel);
  };

  /* OH.bringIn({label, hint, placeholder, accept, sample, sampleLabel, useLabel, onText(text, fileName)})
     The no-connector way in: drop a file, choose a file, or paste the text. Nothing leaves this computer.
     With image: true it takes a picture instead and calls onImage(dataUrl, fileName). */
  OH.bringIn = function (o) {
    const ta = o.image ? null : h("textarea", { placeholder: o.placeholder || "Or paste the text here", "aria-label": o.label || "Paste the text here", style: "margin-top:8px" });
    const take = (f) => {
      if (!f) return;
      const r = new FileReader();
      if (o.image) {
        r.onload = () => { const img = new Image(); img.onload = () => {
          const k = Math.min(1, 900 / Math.max(img.width, img.height)), c = h("canvas", { width: Math.round(img.width * k), height: Math.round(img.height * k) });
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); o.onImage(c.toDataURL("image/jpeg", 0.82), f.name); };
          img.onerror = () => OH.toast("That file is not a picture this page can show"); img.src = r.result; };
        r.readAsDataURL(f);
      } else { r.onload = () => { ta.value = String(r.result || ""); o.onText(ta.value, f.name); }; r.readAsText(f); }
    };
    const file = h("input", { type: "file", accept: o.accept || (o.image ? "image/*" : ".csv,.tsv,.txt,.md,.json,text/*"), style: "display:none", "aria-hidden": "true", tabindex: "-1", onchange: (ev) => { take(ev.target.files[0]); ev.target.value = ""; } });
    const zone = h("div", { class: "drop",
      ondragover: (ev) => { ev.preventDefault(); zone.classList.add("over"); }, ondragleave: () => zone.classList.remove("over"),
      ondrop: (ev) => { ev.preventDefault(); zone.classList.remove("over"); take(ev.dataTransfer && ev.dataTransfer.files[0]); } },
      h("b", null, o.label || "Bring it in"), o.hint ? h("div", { class: "mut", style: "font-size:13.5px" }, o.hint) : null,
      h("div", { class: "row", style: "margin-top:8px" },
        h("button", { onclick: () => file.click() }, o.image ? "Choose a picture" : "Choose a file"),
        h("span", { class: "mut", style: "font-size:13px" }, "or drop it on this box"),
        o.sample && !o.image ? h("button", { class: "small", onclick: () => { ta.value = typeof o.sample === "function" ? o.sample() : o.sample; ta.focus(); } }, o.sampleLabel || "Load the sample file") : null),
      file, ta,
      ta ? h("div", { class: "row", style: "margin-top:8px" }, h("button", { class: "primary", onclick: () => { if (!ta.value.trim()) return OH.toast("Choose a file, drop one here, or paste the text first"); o.onText(ta.value, ""); } }, o.useLabel || "Use this")) : null);
    return zone;
  };

  /* OH.md(text) : a small markdown reader for the class notes: headings, lists, bold, `code`, paragraphs. */
  OH.md = function (text) {
    const out = h("div", { class: "md" }); let list = null, para = [];
    const inline = (s) => { const span = h("span"); s.split(/(\*\*[^*]+\*\*|`[^`]+`)/).forEach((t) => {
      if (/^\*\*.+\*\*$/.test(t)) span.appendChild(h("b", null, t.slice(2, -2))); else if (/^`.+`$/.test(t)) span.appendChild(h("code", null, t.slice(1, -1))); else if (t) span.appendChild(document.createTextNode(t)); }); return span; };
    const flush = () => { if (para.length) { out.appendChild(h("p", null, inline(para.join(" ")))); para = []; } };
    String(text || "").split("\n").forEach((line) => {
      const t = line.trim(); let m;
      if (!t) { flush(); list = null; return; }
      if ((m = /^(#{1,3})\s+(.*)$/.exec(t))) { flush(); list = null; out.appendChild(h(m[1].length === 1 ? "h2" : "h3", null, inline(m[2]))); return; }
      if ((m = /^(?:[-*]|(\d+)\.)\s+(.*)$/.exec(t))) { flush(); const tag = m[1] ? "ol" : "ul"; if (!list || list.tagName.toLowerCase() !== tag) { list = h(tag); out.appendChild(list); } list.appendChild(h("li", null, inline(m[2]))); return; }
      list = null; para.push(t);
    });
    flush();
    return out;
  };

  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  OH.today = function () { return iso(new Date()); };
  OH.day = function (n) { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + (n || 0)); return iso(d); };     // today plus n days
  OH.daysBetween = function (from, to) { return Math.round((Date.parse(to + "T12:00:00") - Date.parse(from + "T12:00:00")) / 86400000); };
  OH.niceDate = function (isoDate) { const d = new Date(isoDate + "T12:00:00"); return isNaN(d) ? isoDate : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); };

  // ── the command center's data: one place every piece reads and writes ──
  /* Two sets of data, never mixed. "sample" is the made-up company. "own" is what the person brought in.
     In "own", a name that was never brought in is null, and the piece says "Needs setup" instead of showing a number. */
  const cck = (name, own) => "cc:" + (own ? "o:" : "s:") + name;
  const clone = (v) => (v == null ? null : JSON.parse(JSON.stringify(v)));
  OH.sample.cc.biz = { name: C.business.name, owner: C.business.owner, town: C.business.town };
  OH.cc = {
    mode: function () { return OH.store.get("cc:mode", "sample") === "own" ? "own" : "sample"; },
    own: function () { return OH.cc.mode() === "own"; },
    setMode: function (m) { OH.store.set("cc:mode", m === "own" ? "own" : "sample"); brand(); },
    get: function (name) { const own = OH.cc.own(), v = OH.store.get(cck(name, own), null); if (v != null) return v; return own ? null : clone(OH.sample.cc[name]); },
    set: function (name, value) { OH.store.set(cck(name, OH.cc.own()), value); if (name === "biz") brand(); },
    has: function (name) { return OH.cc.get(name) != null; },
    reset: function (names) { (names || []).forEach((n) => OH.store.remove(cck(n, OH.cc.own()))); },
    biz: function () { return OH.cc.get("biz") || { name: OH.store.get("bizname", "") || "", owner: "", town: "" }; },
    log: function (what, why, who, decision) { const list = OH.cc.get("log") || []; list.push({ at: OH.today(), who: who || "You", what: String(what || ""), why: String(why || ""), decision: !!decision }); OH.cc.set("log", list); },
    tag: function () { return OH.cc.own() ? OH.badge("Your own data", "ok") : OH.badge("Sample data, made up", "blue"); },
    /* The "Needs setup" block. what = one sentence, steps = how to bring it in. */
    setup: function (what, steps) { return h("div", { class: "note warn setup" }, h("b", null, "Needs setup"), h("div", null, what), steps && steps.length ? h("ol", null, steps.map((s) => h("li", null, s))) : null); }
  };
  /* What each piece adds to the one screen. One line per piece, built or not. */
  OH.pieceSummaries = function () {
    return PIECES.map((p) => { const mod = OH.pieces[p.week]; let s = null;
      if (mod && typeof mod.summary === "function") { try { s = mod.summary(); } catch (e) { s = null; } }
      return { week: p.week, name: p.piece, nav: p.nav, date: p.date, built: !!mod, label: s ? s.label : "", value: s ? s.value : "", tone: s ? s.tone || "" : "" }; });
  };
  /* The runbook lines written at the Ship step of each week, oldest first. */
  OH.runbookLines = function () {
    return PIECES.map((p) => { const l = OH.store.get("build:" + p.week + ":ship", null); return l && (l.step || l.sign || l.undo) ? { week: p.week, piece: p.piece, step: l.step || "", sign: l.sign || "", undo: l.undo || "" } : null; }).filter(Boolean);
  };

  // ── pieces and tools ──
  /* A file in the pieces folder is a piece, and its number comes from its file name, so a piece cannot
     land in the wrong place. Anything else that registers is a Toolbox tool, keyed by its week. */
  const waiting = {};
  OH.register = function (mod) {
    if (!mod) return;
    const cs = document.currentScript, m = cs && /pieces\/week-(\d)-[\w-]+\.js(?:$|\?)/.exec(cs.src || "");
    const n = m ? +m[1] : mod.piece;
    if (n) { mod.piece = n; OH.pieces[n] = mod; return; }
    OH.modules[mod.week] = mod;
  };
  OH.waiting = function (n) { waiting[n] = true; };     // the placeholder file of a piece that is not built yet calls this

  // ── the game (optional): the files in app/game/ build on this, each mission file adds one case. See GAME.md. ──
  OH.game = { missions: {}, mission: function (data) { if (data && data.week) OH.game.missions[data.week] = data; } };
  const GAME_FILES = ["art", "sound", "kit", "game"];   // in this order: the pictures, the sound, the toolbox, the engine

  function load(src) {                                // async=false: fetched together, run in the order added
    return new Promise((res) => { const s = document.createElement("script"); s.src = src; s.async = false; s.onload = () => res(true); s.onerror = () => res(false); document.body.appendChild(s); });
  }

  const view = () => document.getElementById("view");
  function brand() {
    const own = OH.cc.own(), biz = OH.cc.biz(), b = document.getElementById("bizname"), s = document.getElementById("bizsub");
    if (b) b.textContent = own ? biz.name || "My business" : C.business.name;
    if (s) s.textContent = own ? "your own data · kept in this browser" : "sample business · every name is made up";
  }
  function modeSwitch(after) {
    const own = OH.cc.own();
    const b = (m, label) => h("button", { class: (m === "own") === own ? "on" : "", "aria-pressed": (m === "own") === own ? "true" : "false", onclick: () => { OH.cc.setMode(m); after(); } }, label);
    return h("div", { class: "mode", role: "group", "aria-label": "Whose data to show" }, b("sample", "Sample business"), b("own", "My business"));
  }

  function nav(on) {
    const n = document.getElementById("nav"); n.innerHTML = "";
    n.appendChild(h("a", { href: "#/", class: on === "home" ? "on" : "" }, "Home"));
    PIECES.forEach((p) => { if (OH.pieces[p.week]) n.appendChild(h("a", { href: "#/p" + p.week, class: on === "p" + p.week ? "on" : "" }, p.nav)); });
    if (Object.keys(OH.modules).length) n.appendChild(h("a", { href: "#/toolbox", class: on === "toolbox" ? "on" : "" }, "Toolbox"));
    if (OH.game.render) n.appendChild(h("a", { href: "#/game", class: "play" + (on === "game" ? " on" : "") }, "Play"));
  }

  // ── home: the command center ──
  function pieceTile(p) {
    const st = OH.pieceState[p.week], mod = OH.pieces[p.week];
    const top = [h("div", { class: "ico" }, p.icon), h("b", null, p.piece), h("small", null, "Week " + p.week + " · " + p.short)];
    if (st === "built") {
      let s = null; try { s = mod.summary && mod.summary(); } catch (e) { s = null; }
      return h("a", { class: "tile", href: "#/p" + p.week }, top, s ? h("div", { class: "what" }, s.label, h("div", { class: "big " + (s.tone || "") }, String(s.value))) : h("div", { class: "num" }, OH.badge("Open", "blue")));
    }
    if (st === "later") return h("div", { class: "tile locked" }, top, h("div", { class: "num" }, OH.badge("Not built yet"), h("div", { class: "mut", style: "font-weight:400;margin-top:4px" }, "We build it in week " + p.week + ", " + OH.niceDate(p.date) + ".")));
    return h("a", { class: "tile todo", href: "#/p" + p.week }, top, h("div", { class: "num" }, st === "broken" ? OH.badge("The file needs a fix", "bad") : OH.badge("Not built yet", "warn"), h("div", { style: "font-weight:400;margin-top:4px" }, "Build it now: week " + p.week + ", six steps.")));
  }
  function toolTiles() {
    return h("div", { class: "pgrid" }, C.sessions.filter((s) => OH.modules[s.week]).map((s) =>
      h("a", { class: "tile tool", href: "#/w" + s.week }, h("div", { class: "ico" }, s.icon), h("b", null, s.tool), h("small", null, "Version 1, week " + s.week), h("div", { class: "what" }, s.title))));
  }
  function section(title, sub) { return h("div", { class: "sec" }, h("h2", null, title), sub ? h("small", null, sub) : null); }

  function home() {
    const v = view(); v.innerHTML = "";
    document.getElementById("runbookBtn").hidden = true; closeRunbook();
    const own = OH.cc.own();
    v.appendChild(h("div", { class: "kicker" }, C.series + " · " + C.season));
    v.appendChild(h("div", { class: "row" }, h("h1", { style: "margin:0" }, "One screen for the whole business"), h("span", { class: "spacer" }), modeSwitch(home)));
    v.appendChild(h("p", { class: "lead", style: "margin-top:8px" }, own
      ? "This is your own command center. A piece shows only what you brought in. Where nothing is brought in yet, it says Needs setup."
      : "A command center for a made-up company, " + C.business.name + ". You build it one piece a week for eight weeks, and every piece goes through the same six steps."));
    v.appendChild(h("div", { class: "chips", "aria-label": "The six steps" }, C.steps.map((s, i) => h("span", { title: s.makes + ". " + s.line }, (i + 1) + ". " + s.name))));

    const next = PIECES.find((p) => { const st = OH.pieceState[p.week]; return st !== "built" && st !== "later"; });
    if (next) v.appendChild(h("div", { class: "card thisweek" }, h("div", { class: "kicker" }, "This week · week " + next.week + ", " + next.short), h("h2", { style: "margin-top:4px" }, "Build: " + next.piece),
      h("p", { class: "mut", style: "margin:0 0 10px" }, next.promise), h("a", { class: "btn primary", href: "#/p" + next.week }, "Start the six steps")));

    v.appendChild(section("Your command center", "Eight pieces. One a week."));
    v.appendChild(h("div", { class: "pgrid" }, PIECES.map(pieceTile)));

    if (Object.keys(OH.modules).length) {
      v.appendChild(section("Toolbox", "Eight tools from version 1 of the class. They are extras: the command center works without them."));
      v.appendChild(toolTiles());
    }
    if (OH.game.homeEntry) { try { const g = OH.game.homeEntry(); v.appendChild(section("The game", "Optional. The class and every piece work without it.")); v.appendChild(g); } catch (e) { /* the pieces work without the game */ } }
    v.appendChild(h("p", { class: "mut", style: "margin-top:18px" }, "The class is free: ", h("a", { href: C.subscribe, target: "_blank", rel: "noopener" }, "subscribe for the weekly link"), ". " + C.when + "."));
    nav("home");
  }

  function toolbox() {
    const v = view(); v.innerHTML = "";
    document.getElementById("runbookBtn").hidden = true; closeRunbook();
    v.appendChild(h("div", { class: "kicker" }, "Version 1 of the class"));
    v.appendChild(h("h1", null, "Toolbox"));
    v.appendChild(h("p", { class: "lead" }, "Eight tools, each for one job, with sample data first and then your own. They are extras: the command center works without them."));
    v.appendChild(toolTiles());
    nav("toolbox"); window.scrollTo(0, 0);
  }

  /* Redraw without losing your place: the scroll position and the keyboard focus stay where they were. */
  function keepPlace(fn) {
    const sel = "a[href],button,input,select,textarea", v = view(), a = document.activeElement;
    const i = a && v.contains(a) ? Array.prototype.indexOf.call(v.querySelectorAll(sel), a) : -1, y = window.scrollY;
    fn(); window.scrollTo(0, y);
    if (i >= 0) { const el = view().querySelectorAll(sel)[i]; if (el) { try { el.focus({ preventScroll: true }); } catch (e) { /* focus is a nicety */ } } }
  }

  // ── a piece of the command center ──
  function pieceView(n, sub, again) {
    const p = pieceInfo(n), mod = OH.pieces[n];
    if (!p || OH.pieceState[n] === "later") return home();
    if (!mod || sub === "build") return buildView(n, again);
    const v = view(); v.innerHTML = "";
    const own = OH.cc.own(), redraw = () => keepPlace(() => pieceView(n, sub, true));
    const startOver = () => {
      if (own && !window.confirm("This clears what you brought into this piece, in this browser only. Files on your computer are not touched. Go on?")) return;
      OH.cc.reset(mod.data); if (mod.reset) mod.reset(); OH.store.clear("p" + n + ":");
      OH.toast(own ? "This piece is empty again" : "Back to the sample data"); pieceView(n, sub);
    };
    v.appendChild(h("div", { class: "row" }, h("div", null, h("div", { class: "kicker" }, "Week " + n + " · " + p.short), h("h1", null, mod.title || p.piece)), h("span", { class: "spacer" }),
      modeSwitch(() => pieceView(n, sub)),
      h("a", { class: "btn small", href: "#/p" + n + "/build" }, "How it was built"),
      h("button", { class: "small", onclick: startOver }, own ? "Start this piece over" : "Start over with the sample data")));
    if (mod.intro) v.appendChild(h("p", { class: "lead" }, mod.intro));
    v.appendChild(h("p", { style: "margin:-8px 0 14px" }, OH.cc.tag(), " ", h("span", { class: "mut", style: "font-size:13px" }, own ? "Only what you brought in. Nothing here is made up." : C.business.name + ", " + C.business.town + ". No real people.")));
    const root = h("div", null); v.appendChild(root);
    try { mod.render(root, { week: n, piece: p, session: p, redraw: redraw }); }
    catch (e) {
      if (window.console) console.error(e);
      root.innerHTML = ""; root.appendChild(OH.note("This piece hit a problem and could not draw itself: " + (e && e.message ? e.message : e) + ". Copy that sentence to the AI that built it and ask for the whole file again.", "warn"));
    }
    v.appendChild(h("p", { class: "paid" }, "In class you run this piece yourself, and it is free. The paid version: " + p.paid + ". AI drafts. You decide. ", h("a", { href: C.paidUrl, target: "_blank", rel: "noopener" }, "One flat price, on the page.")));
    const rb = document.getElementById("runbookBtn"); rb.hidden = !OH.runbooks[n]; rb.onclick = () => openRunbook(n, "piece");
    nav("p" + n); if (!again) window.scrollTo(0, 0);
  }

  // ── the build page: one week, six steps, with the class materials in it ──
  function buildView(n, again) {
    const p = pieceInfo(n), kit = OH.classKit[n], st = OH.pieceState[n], v = view(); v.innerHTML = "";
    const file = p.file + ".js", bk = "build:" + n + ":", redraw = () => keepPlace(() => buildView(n, true));
    v.appendChild(h("div", { class: "kicker" }, "Week " + n + " · " + OH.niceDate(p.date) + " · this week's focus: " + p.focus));
    v.appendChild(h("h1", null, "Build: " + p.piece));
    v.appendChild(h("p", { class: "lead" }, p.promise));
    if (st === "built") v.appendChild(h("div", { class: "note ok" }, "This piece is built. ", h("a", { href: "#/p" + n }, "Open it"), ". Below is how it was made, step by step."));
    else if (st === "broken") v.appendChild(OH.note("The file " + file + " is in the pieces folder, but the app could not use it. Tell the AI: the page did not show, check the file against the prompt and send the whole file again. You can also take the finished file from the complete project.", "warn"));
    else v.appendChild(OH.note("Not built yet. Follow the six steps. It takes about 15 minutes, and the Runbook button at the top walks you through it.", "warn"));
    if (!kit) { v.appendChild(OH.note("The class notes for this week are not in this copy. They come with the class starter for week " + n + ".", "")); nav(st === "built" ? "p" + n : "home"); return; }

    const steps = h("div", { class: "steps" }); v.appendChild(steps);
    // 1 · design
    steps.appendChild(OH.step("Design: the design note", h("p", { class: "mut" }, "Four questions, answered before any building. To change an answer for your own business, change it in the prompt in step 2: the design note is inside it."), OH.md(kit.design),
      kit.rules ? h("details", { style: "margin-top:10px" }, h("summary", null, "The rules file for the AI"), OH.md(kit.rules)) : null));
    // 2 · prompt
    const ta = h("textarea", { style: "min-height:230px", "aria-label": "The build prompt. You can change it." }); ta.value = OH.store.get(bk + "prompt", kit.prompt);
    ta.addEventListener("change", () => OH.store.set(bk + "prompt", ta.value));
    steps.appendChild(OH.step("Prompt: the build prompt",
      h("p", { class: "mut" }, "One prompt makes this week's piece. It holds the role, the context, the design note, the rules and what to hand back."), ta,
      h("div", { class: "row", style: "margin-top:8px" },
        h("button", { class: "primary", onclick: () => OH.copy(ta.value, "Build prompt copied") }, "Copy the build prompt"),
        h("button", { onclick: () => { ta.value = kit.prompt; OH.store.remove(bk + "prompt"); OH.toast("Back to the class prompt"); } }, "Put the class prompt back"),
        h("span", { class: "spacer" }), h("a", { class: "btn", href: "https://claude.ai/new", target: "_blank", rel: "noopener" }, "Open Claude")),
      h("ul", { style: "margin:12px 0 0;padding-left:20px" },
        h("li", null, h("b", null, "In the Claude app: "), "paste the prompt and send. Save the file it makes into the ", h("code", null, "pieces"), " folder of this project."),
        h("li", null, h("b", null, "In Claude Code: "), "open this project folder and paste the same prompt. It writes the file for you.")),
      OH.note("The file must be named exactly " + file + ". " + (st === "missing" ? "Save it in the pieces folder, next to the other pieces."
        : (st === "built" ? "The finished piece is already in the pieces folder under that name." : "A file with that name is already in the pieces folder, holding the place.") + " Your computer asks whether to replace it. Say yes. If it does not ask, the name is not right."), "")));
    // 3 · review
    steps.appendChild(OH.step("Review: read it against the design note",
      h("p", null, "When the file is saved, press the button. The piece shows by itself: there is no list to edit."),
      h("div", { class: "row" }, h("button", { class: "primary", onclick: () => location.reload() }, "I saved the file. Look again"), st === "built" ? h("a", { class: "btn", href: "#/p" + n }, "Open the piece") : null),
      h("p", { class: "mut", style: "margin:10px 0 0" }, "Then read the page with the design note beside it. Do not ask whether it is right. Ask which one thing it got wrong.")));
    // 4 · test
    const ticks = OH.store.get(bk + "checks", {});
    steps.appendChild(OH.step("Test: three checks",
      h("p", { class: "mut" }, "Written before the build. Run them with the sample data, and tick each one you saw with your own eyes."),
      (kit.checks || []).map((c, i) => h("label", { class: "check" + (ticks[i] ? " done" : "") }, h("input", { type: "checkbox", checked: !!ticks[i], onchange: (ev) => { ticks[i] = ev.target.checked; OH.store.set(bk + "checks", ticks); redraw(); } }), OH.md(c))),
      (kit.checks || []).length && (kit.checks || []).every((c, i) => ticks[i]) ? OH.note("Three checks passed.", "ok") : null));
    // 5 · ship
    const ship = OH.store.get(bk + "ship", { step: "", sign: "", undo: "" });
    const fld = (k, label, ph) => { const inp = h("input", { type: "text", value: ship[k] || "", placeholder: ph, onchange: (ev) => { ship[k] = ev.target.value; OH.store.set(bk + "ship", ship); } }); return OH.field(label, inp); };
    steps.appendChild(OH.step("Ship: one runbook line",
      h("p", { class: "mut" }, "Write the line you will follow tomorrow morning with your real data. It is saved as you type."),
      h("div", { class: "grid g3" }, fld("step", "The step", kit.ship ? kit.ship.step : "What you do"), fld("sign", "The sign it worked", kit.ship ? kit.ship.sign : "What you see"), fld("undo", "How to undo it", kit.ship ? kit.ship.undo : "How to go back"))));
    // 6 · log
    const mine = OH.store.get("cc:o:log", []), what = h("input", { type: "text", placeholder: "What changed. For example: Built " + p.piece.charAt(0).toLowerCase() + p.piece.slice(1) }), why = h("input", { type: "text", placeholder: "Why. One short reason" });
    const dec = h("input", { type: "checkbox" });
    steps.appendChild(OH.step("Log: one change log line",
      h("p", { class: "mut" }, "What changed and why. Tick the box when a choice was made, so the decision is written down."),
      h("div", { class: "grid g2" }, OH.field("What changed", what), OH.field("Why", why)),
      h("label", { class: "check" }, dec, h("span", null, "A choice was made here. Mark this line as a decision.")),
      h("div", { class: "row", style: "margin-top:8px" }, h("button", { class: "primary", onclick: () => {
        if (!what.value.trim()) return OH.toast("Say what changed first");
        mine.push({ at: OH.today(), who: "You", what: what.value.trim(), why: why.value.trim(), decision: dec.checked }); OH.store.set("cc:o:log", mine); OH.toast("Added to your change log"); redraw(); } }, "Add to my change log")),
      h("p", { class: "mut", style: "margin:10px 0 0" }, "Your change log has " + mine.length + (mine.length === 1 ? " line" : " lines") + ". It is kept with your own data, under My business." + (OH.pieces[2] ? "" : " Week 2 builds the page that shows it.")),
      mine.length ? h("ul", { class: "mut", style: "margin:6px 0 0;padding-left:20px" }, mine.slice(-3).reverse().map((l) => h("li", null, OH.niceDate(l.at) + " · " + l.what + (l.why ? " · " + l.why : "")))) : null));

    const rb = document.getElementById("runbookBtn"); rb.hidden = !OH.runbooks[n]; rb.onclick = () => openRunbook(n, "piece");
    nav(st === "built" ? "p" + n : "home"); if (!again) window.scrollTo(0, 0);
  }

  // ── a Toolbox tool (version 1) ──
  function moduleView(week) {
    const mod = OH.modules[week], s = C.sessions.find((x) => x.week === week);
    if (!mod) return home();
    const v = view(); v.innerHTML = "";
    v.appendChild(h("div", { class: "row" }, h("div", null, h("div", { class: "kicker" }, "Toolbox · " + s.title), h("h1", null, mod.title || s.tool)), h("span", { class: "spacer" }),
      h("button", { class: "small", onclick: () => { if (mod.reset) mod.reset(); OH.store.clear("w" + week + ":"); OH.toast("Back to the sample data"); moduleView(week); } }, "Start over with the sample data")));
    if (mod.intro) v.appendChild(h("p", { class: "lead" }, mod.intro));
    const root = h("div", null); v.appendChild(root);
    mod.render(root, { week: week, session: s, redraw: () => moduleView(week) });
    const rb = document.getElementById("runbookBtn"); rb.hidden = !OH.toolRunbooks[week]; rb.onclick = () => openRunbook(week);
    nav("toolbox"); window.scrollTo(0, 0);
  }

  // ── the runbook drawer: the 15-minute follow-along, with ticks. kind "piece" = this season, otherwise a Toolbox tool. ──
  function closeRunbook() { document.getElementById("runbook").hidden = true; }
  function openRunbook(week, kind) {
    const piece = kind === "piece", r = (piece ? OH.runbooks : OH.toolRunbooks)[week], d = document.getElementById("runbook"); if (!r) return;
    const key = "runbook:" + (piece ? "p" : "") + week, ticks = OH.store.get(key, {});
    d.innerHTML = ""; d.hidden = false;
    const close = h("button", { class: "small", onclick: closeRunbook }, "Close");
    d.appendChild(h("h2", null, (piece ? "Build together · " : "Follow along · ") + r.minutes + " minutes", close));
    d.appendChild(h("p", { class: "mut" }, r.goal));
    if (r.you_need) d.appendChild(h("div", { class: "chips" }, r.you_need.map((x) => h("span", null, x))));
    r.steps.forEach((st, i) => {
      const box = h("div", { class: "rb" + (ticks[i] ? " done" : "") });
      box.appendChild(h("label", null, h("input", { type: "checkbox", checked: !!ticks[i], onchange: (ev) => { ticks[i] = ev.target.checked; OH.store.set(key, ticks); box.className = "rb" + (ticks[i] ? " done" : ""); } }),
        h("span", null, h("span", { class: "at" }, st.at + " · " + st.min + " min"), h("b", { style: "display:block" }, st.do), st.see ? h("small", null, "You should see: " + st.see) : null, st.tip ? h("small", null, "Tip: " + st.tip) : null)));
      d.appendChild(box);
    });
    if (r.real_life && r.real_life.length) d.appendChild(h("div", null, h("h3", { style: "margin-top:16px" }, "Now with your own business"), h("ul", null, r.real_life.map((x) => h("li", null, x)))));
    if (r.if_it_breaks && r.if_it_breaks.length) d.appendChild(h("div", null, h("h3", { style: "margin-top:16px" }, "If something goes wrong"), h("ul", null, r.if_it_breaks.map((x) => h("li", null, x)))));
    close.focus();
  }
  OH.openRunbook = openRunbook;
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && !document.getElementById("runbook").hidden) closeRunbook(); });

  // ── the game: app/game/game.js draws it over the whole window (it hides this page's header and footer while it is on) ──
  function gameView(path) {
    const v = view(); v.innerHTML = "";
    document.getElementById("runbookBtn").hidden = true; closeRunbook();
    nav("game");
    try { OH.game.render(v, path); }
    catch (e) { if (window.console) console.error(e); if (OH.game.leave) OH.game.leave(); v.innerHTML = ""; v.appendChild(OH.note("The game could not open. The pieces and the tools still work: use the links at the top.", "warn")); }
  }

  function route() {
    const hash = location.hash || "";
    const g = /^#\/game(?:\/([\w-]*))?$/.exec(hash);
    if (g && OH.game.render) return gameView(g[1] || "");
    if (OH.game.leave) OH.game.leave();              // any other page: the game packs up its stage, its timers and its music
    closeRunbook();
    let m = /^#\/p(\d)(?:\/(build))?/.exec(hash);
    if (m) return pieceView(+m[1], m[2] || "");
    m = /^#\/w(\d+)/.exec(hash);
    if (m) return moduleView(+m[1]);
    if (/^#\/toolbox/.test(hash) && Object.keys(M.modules || []).length) return toolbox();
    home();
  }
  OH.redraw = route;

  (async function boot() {
    brand();
    const inCopy = PIECES.filter((p) => p.week <= (M.week || 0)), got = {};
    const files = ["app/data/runbooks.js", "app/data/class.js"];
    (M.modules || []).forEach((id) => { files.push("app/data/" + id + ".js", "app/modules/" + id + ".js"); });
    inCopy.forEach((p) => files.push("app/data/" + p.file + ".js"));                 // the sample data of every piece in this copy
    inCopy.forEach((p) => files.push("pieces/" + p.file + ".js"));                   // the pieces: there, or a placeholder, or not built
    GAME_FILES.forEach((f) => files.push("app/game/" + f + ".js"));                  // the game comes last; a missing file is skipped
    (M.modules || []).forEach((id) => { const week = parseInt(id.slice(1), 10); if (week) files.push("app/game/missions/m" + week + ".js"); });
    await Promise.all(files.map((f) => load(f).then((ok) => { got[f] = ok; })));
    PIECES.forEach((p) => { const n = p.week;
      OH.pieceState[n] = n > (M.week || 0) ? "later" : OH.pieces[n] ? "built" : waiting[n] ? "waiting" : got["pieces/" + p.file + ".js"] ? "broken" : "missing"; });
    window.addEventListener("hashchange", route);
    route();
  })();
})();
