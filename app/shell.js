/* Office Hours demo · the shell.
   A tiny app with no framework and no server: open index.html and it runs. Each week of the course
   is one module in app/modules/. The shell gives every module the same small toolbox (OH.*), keeps
   what you type in this browser only (localStorage), and draws the home screen and the runbook.
   How to write a module: MODULES.md. */
(function () {
  "use strict";
  const C = window.OH_COURSE, M = window.OH_MANIFEST;
  const OH = (window.OH = { course: C, manifest: M, modules: {}, runbooks: {} });
  window.OH_SAMPLE = window.OH_SAMPLE || {};
  OH.sample = window.OH_SAMPLE;

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
    set(key, value) { try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch (e) { /* private window: keep going */ } },
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

  /* OH.bars([{label, value}], {unit: "dollars"}) : a horizontal bar chart made of plain boxes */
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
    const ta = h("textarea", { style: "min-height:" + (o.height || 190) + "px" }); ta.value = o.prompt;
    const data = () => (typeof o.data === "function" ? o.data() : o.data || "");
    const el = h("div", null, ta,
      h("div", { class: "row", style: "margin-top:8px" },
        h("button", { class: "primary", onclick: () => OH.copy(ta.value + "\n\n" + data(), "Prompt and " + (o.dataLabel || "data") + " copied") }, "Copy the prompt and the " + (o.dataLabel || "data")),
        h("button", { onclick: () => OH.copy(ta.value, "Prompt copied") }, "Copy the prompt only"),
        h("span", { class: "spacer" }),
        h("a", { class: "btn", href: "https://claude.ai/new", target: "_blank", rel: "noopener" }, "Open Claude"),
        h("a", { class: "btn", href: "https://chatgpt.com/", target: "_blank", rel: "noopener" }, "Open ChatGPT")),
      h("div", { class: "mut", style: "font-size:13px;margin-top:6px" }, "Paste it into the AI chat you use. Leave out anything with a password or a card number."));
    return { el: el, text: () => ta.value };
  };

  /* OH.pasteBox({label, placeholder, sample, onUse}) : where the AI's answer comes back in. */
  OH.pasteBox = function (o) {
    const ta = h("textarea", { placeholder: o.placeholder || "Paste the AI's answer here" });
    return h("div", null, o.label ? h("label", { class: "f" }, o.label) : null, ta,
      h("div", { class: "row", style: "margin-top:8px" },
        h("button", { class: "primary", onclick: () => { if (!ta.value.trim()) return OH.toast("Paste the answer first, or load the sample answer"); o.onUse(ta.value); } }, o.useLabel || "Use this answer"),
        o.sample ? h("button", { onclick: () => { ta.value = typeof o.sample === "function" ? o.sample() : o.sample; o.onUse(ta.value); } }, "No AI handy? Load the sample answer") : null));
  };

  OH.today = function () { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  OH.niceDate = function (iso) { const d = new Date(iso + "T12:00:00"); return isNaN(d) ? iso : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); };

  // ── modules ──
  OH.register = function (mod) { OH.modules[mod.week] = mod; };

  // ── the game (optional): app/game/game.js builds on this, each mission file adds one mission. See GAME.md. ──
  OH.game = { missions: {}, mission: function (data) { if (data && data.week) OH.game.missions[data.week] = data; } };

  function load(src) {                                // async=false: fetched together, run in the order added
    return new Promise((res) => { const s = document.createElement("script"); s.src = src; s.async = false; s.onload = res; s.onerror = res; document.body.appendChild(s); });
  }

  function nav(week) {
    const n = document.getElementById("nav"); n.innerHTML = "";
    n.appendChild(h("a", { href: "#/", class: week ? "" : "on" }, "Home"));
    C.sessions.forEach((s) => { if (OH.modules[s.week]) n.appendChild(h("a", { href: "#/w" + s.week, class: week === s.week ? "on" : "" }, "Week " + s.week)); });
    if (OH.game.render) n.appendChild(h("a", { href: "#/game", class: "play" + (week === "game" ? " on" : "") }, "Play"));
  }

  function home() {
    const v = document.getElementById("view"); v.innerHTML = "";
    document.getElementById("runbookBtn").hidden = true; closeRunbook();
    const have = C.sessions.filter((s) => OH.modules[s.week]);
    v.appendChild(h("div", { class: "kicker" }, C.series + " · the demo project"));
    v.appendChild(h("h1", null, "One screen for the whole business"));
    v.appendChild(h("p", { class: "lead" }, "A small command center for a made-up company, " + C.business.name + ". It grows by one tool every Wednesday. Each tool does the job we covered that week, with sample data first and then your own."));
    if (OH.game.homeEntry) { try { v.appendChild(OH.game.homeEntry()); } catch (e) { /* the tools work without the game */ } }
    const stats = have.map((s) => { try { const x = OH.modules[s.week].summary && OH.modules[s.week].summary(); return x ? OH.stat(x.label, x.value, "Week " + s.week + " · " + s.tool, x.tone) : null; } catch (e) { return null; } }).filter(Boolean);
    if (stats.length) v.appendChild(h("div", { class: "grid g4", style: "margin-bottom:18px" }, stats));
    v.appendChild(h("div", { class: "grid g3" }, C.sessions.map((s) => {
      const on = !!OH.modules[s.week];
      return h(on ? "a" : "div", { class: "tile" + (on ? "" : " locked"), href: on ? "#/w" + s.week : null },
        h("div", { class: "ico" }, s.icon), h("b", null, "Week " + s.week + " · " + s.tool), h("small", null, s.title),
        h("div", { class: "num" }, on ? h("span", { class: "badge blue" }, "Open the tool") : h("span", { class: "badge" }, "Arrives " + OH.niceDate(s.date))));
    })));
    v.appendChild(h("p", { class: "mut", style: "margin-top:18px" }, "The class is free: ", h("a", { href: C.subscribe, target: "_blank", rel: "noopener" }, "subscribe for the weekly link"), ". " + C.when + "."));
    nav(0);
  }

  function moduleView(week) {
    const mod = OH.modules[week], s = C.sessions.find((x) => x.week === week);
    if (!mod) return home();
    const v = document.getElementById("view"); v.innerHTML = "";
    v.appendChild(h("div", { class: "row" }, h("div", null, h("div", { class: "kicker" }, "Week " + week + " · " + s.title), h("h1", null, mod.title || s.tool)), h("span", { class: "spacer" }),
      h("button", { class: "small", onclick: () => { if (mod.reset) mod.reset(); OH.store.clear("w" + week + ":"); OH.toast("Back to the sample data"); moduleView(week); } }, "Start over with the sample data")));
    if (mod.intro) v.appendChild(h("p", { class: "lead" }, mod.intro));
    const root = h("div", null); v.appendChild(root);
    mod.render(root, { week: week, session: s, redraw: () => moduleView(week) });
    const rb = document.getElementById("runbookBtn"); rb.hidden = !OH.runbooks[week]; rb.onclick = () => openRunbook(week);
    nav(week); window.scrollTo(0, 0);
  }

  // ── the runbook drawer: the 15-minute follow-along for the week, with ticks ──
  function closeRunbook() { document.getElementById("runbook").hidden = true; }
  function openRunbook(week) {
    const r = OH.runbooks[week], d = document.getElementById("runbook"); if (!r) return;
    const ticks = OH.store.get("runbook:" + week, {});
    d.innerHTML = ""; d.hidden = false;
    d.appendChild(h("h2", null, "Follow along · " + r.minutes + " minutes", h("button", { class: "small", onclick: closeRunbook }, "Close")));
    d.appendChild(h("p", { class: "mut" }, r.goal));
    if (r.you_need) d.appendChild(h("div", { class: "chips" }, r.you_need.map((x) => h("span", null, x))));
    r.steps.forEach((st, i) => {
      const box = h("div", { class: "rb" + (ticks[i] ? " done" : "") });
      box.appendChild(h("label", null, h("input", { type: "checkbox", checked: !!ticks[i], onchange: (ev) => { ticks[i] = ev.target.checked; OH.store.set("runbook:" + week, ticks); box.className = "rb" + (ticks[i] ? " done" : ""); } }),
        h("span", null, h("span", { class: "at" }, st.at + " · " + st.min + " min"), h("b", { style: "display:block" }, st.do), st.see ? h("small", null, "You should see: " + st.see) : null, st.tip ? h("small", null, "Tip: " + st.tip) : null)));
      d.appendChild(box);
    });
    if (r.real_life && r.real_life.length) d.appendChild(h("div", null, h("h3", { style: "margin-top:16px" }, "Now with your own business"), h("ul", null, r.real_life.map((x) => h("li", null, x)))));
    if (r.if_it_breaks && r.if_it_breaks.length) d.appendChild(h("div", null, h("h3", { style: "margin-top:16px" }, "If something goes wrong"), h("ul", null, r.if_it_breaks.map((x) => h("li", null, x)))));
  }
  OH.openRunbook = openRunbook;

  // ── the game's pages: drawn by app/game/game.js into the same view ──
  function gameView(path) {
    const v = document.getElementById("view"); v.innerHTML = "";
    document.getElementById("runbookBtn").hidden = true; closeRunbook();
    nav("game");
    try { OH.game.render(v, path); }
    catch (e) { if (window.console) console.error(e); v.innerHTML = ""; v.appendChild(OH.note("The game could not open. The tools still work: use the links at the top.", "warn")); }
  }

  function route() {
    const hash = location.hash || "";
    if (OH.game.leave) OH.game.leave();              // stops the game's once-a-second objectives check
    const g = /^#\/game(?:\/([\w-]*))?$/.exec(hash);
    if (g && OH.game.render) return gameView(g[1] || "");
    const m = /^#\/w(\d+)/.exec(hash);
    if (m) moduleView(+m[1]); else home();
  }

  (async function boot() {
    const name = OH.store.get("bizname", "");
    if (name) document.getElementById("bizname").textContent = name;
    const files = ["app/data/runbooks.js"];
    M.modules.forEach((id) => { files.push("app/data/" + id + ".js", "app/modules/" + id + ".js"); });
    files.push("app/game/game.js");                    // the game comes after the tools it plays; a missing file is skipped
    M.modules.forEach((id) => { const week = parseInt(id.slice(1), 10); if (week) files.push("app/game/missions/m" + week + ".js"); });
    await Promise.all(files.map(load));
    window.addEventListener("hashchange", route);
    route();
  })();
})();
