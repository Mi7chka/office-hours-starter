"""Turn runbooks/session-NN.json into runbooks/session-NN.md (to read on GitHub) and
app/data/runbooks.js (what the demo's Runbook button shows). Standard library only.

    python3 tools/build_runbooks.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main():
    out = {}
    for p in sorted((ROOT / "runbooks").glob("session-*.json")):
        r = json.loads(p.read_text(encoding="utf-8"))
        total = sum(s["min"] for s in r["steps"])
        if total != r["minutes"]:
            print(f"  note: {p.name}: steps add up to {total} minutes, runbook says {r['minutes']}")
        out[r["week"]] = r
        md = [f"# Session {r['session']} · {r['title']}", "", f"**{r['minutes']} minutes.** {r['goal']}", "",
              "**You need:** " + "; ".join(r.get("you_need", [])) + ".", "",
              "| At | Minutes | Do this | You should see | Tip |", "|---|---|---|---|---|"]
        for s in r["steps"]:
            md.append(f"| {s['at']} | {s['min']} | {s['do']} | {s.get('see', '')} | {s.get('tip', '')} |")
        if r.get("real_life"):
            md += ["", "## Now with your own business", ""] + [f"- {x}" for x in r["real_life"]]
        if r.get("if_it_breaks"):
            md += ["", "## If something goes wrong", ""] + [f"- {x}" for x in r["if_it_breaks"]]
        p.with_suffix(".md").write_text("\n".join(md) + "\n", encoding="utf-8")
    js = ("/* Built by tools/build_runbooks.py from runbooks/session-NN.json. Do not edit by hand. */\n"
          "window.OH = window.OH || {}; window.OH.runbooks = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
    (ROOT / "app" / "data" / "runbooks.js").write_text(js, encoding="utf-8")
    print(f"runbooks: {len(out)} built")


if __name__ == "__main__":
    main()
