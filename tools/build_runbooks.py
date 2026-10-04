"""Build what the app shows from the files people write. Standard library only.

    python3 tools/build_runbooks.py

It reads:
    runbooks/session-NN.json           the 15-minute build of each week (this season, the command center)
    runbooks/toolbox/session-NN.json   the follow-alongs of the eight Toolbox tools (version 1)
    class/week-NN/                     design-note.md, build-details.md, checks.md (and rules.md in week 1)
    class/shared/                      prompt-frame.md and contract-card.md, the two parts every build prompt shares

It writes:
    runbooks/session-NN.md, runbooks/toolbox/session-NN.md    to read on GitHub
    class/week-NN/runbook.md                                  the same runbook, beside the week's other notes
    class/week-NN/build-prompt.md                             the build prompt, put together from its parts
    app/data/runbooks.js                                      what the Runbook button shows
    app/data/class.js                                         what the build page shows

Only the weeks that are in this copy are built, so it works the same in the class starter."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def runbook_md(r):
    md = [f"# Session {r['session']} · {r['title']}", "", f"**{r['minutes']} minutes.** {r['goal']}", "",
          "**You need:** " + "; ".join(r.get("you_need", [])) + ".", "",
          "| At | Minutes | Do this | You should see | Tip |", "|---|---|---|---|---|"]
    for s in r["steps"]:
        md.append(f"| {s['at']} | {s['min']} | {s['do']} | {s.get('see', '')} | {s.get('tip', '')} |")
    if r.get("real_life"):
        md += ["", "## Now with your own business", ""] + [f"- {x}" for x in r["real_life"]]
    if r.get("if_it_breaks"):
        md += ["", "## If something goes wrong", ""] + [f"- {x}" for x in r["if_it_breaks"]]
    return "\n".join(md) + "\n"


def runbooks(folder, season):
    """Every session-NN.json in a folder, as {week: runbook}. Writes the .md beside each one."""
    out = {}
    for p in sorted(folder.glob("session-*.json")):
        r = json.loads(p.read_text(encoding="utf-8"))
        total, clock = sum(s["min"] for s in r["steps"]), 0
        if total != r["minutes"]:
            print(f"  note: {p.name}: steps add up to {total} minutes, runbook says {r['minutes']}")
        for s in r["steps"]:
            if s["at"] != f"{clock // 60}:{clock % 60:02d}":
                print(f"  note: {p.name}: the step at {s['at']} should start at {clock // 60}:{clock % 60:02d}")
            clock += s["min"]
        if season and not 6 <= len(r["steps"]) <= 8:
            print(f"  note: {p.name}: {len(r['steps'])} steps. This season's runbooks have six to eight.")
        out[r["week"]] = r
        md = runbook_md(r)
        p.with_suffix(".md").write_text(md, encoding="utf-8")
        week_folder = ROOT / "class" / f"week-{r['week']:02d}"
        if season and week_folder.is_dir():
            (week_folder / "runbook.md").write_text(md, encoding="utf-8")
    return out


def body(text):
    """A note without its first heading line."""
    lines = text.strip().split("\n")
    if lines and lines[0].startswith("# "):
        lines = lines[1:]
    return "\n".join(lines).strip()


def section(text, heading):
    """The lines under one '## heading', up to the next one."""
    m = re.search(r"^## " + re.escape(heading) + r"\s*\n(.*?)(?=^## |\Z)", text, re.S | re.M)
    return m.group(1).strip() if m else ""


def class_kit():
    """The class notes of every week in this copy, and each week's build prompt put together."""
    shared, kit = ROOT / "class" / "shared", {}
    if not shared.is_dir():
        return kit
    frame = (shared / "prompt-frame.md").read_text(encoding="utf-8")
    card = (shared / "contract-card.md").read_text(encoding="utf-8").strip()
    rules_file = ROOT / "class" / "week-01" / "rules.md"
    rules_text = rules_file.read_text(encoding="utf-8") if rules_file.exists() else ""
    rules = section(rules_text, "The rules")
    pieces = dict(re.findall(r'week: (\d), .*?file: "([\w-]+)"', (ROOT / "app" / "course.js").read_text(encoding="utf-8")))
    names = dict(re.findall(r'week: (\d), .*?piece: "([^"]+)"', (ROOT / "app" / "course.js").read_text(encoding="utf-8")))
    for folder in sorted((ROOT / "class").glob("week-0[1-8]")):
        n = str(int(folder.name[-2:]))
        need = [folder / "design-note.md", folder / "build-details.md", folder / "checks.md"]
        if not all(p.exists() for p in need) or n not in pieces:
            print(f"  note: {folder.name} is missing one of design-note.md, build-details.md, checks.md")
            continue
        design, details, checks = (p.read_text(encoding="utf-8") for p in need)
        found = re.findall(r"^\d\.\s+(.*)$", checks, re.M)
        if len(found) != 3:
            print(f"  note: {folder.name}/checks.md has {len(found)} numbered checks. It should have three.")
        prompt = (frame.replace("{{CONTRACT}}", card).replace("{{DESIGN}}", body(design)).replace("{{DETAILS}}", body(details))
                  .replace("{{RULES}}", rules).replace("{{WEEK}}", n).replace("{{FILE}}", pieces[n] + ".js")
                  .replace("{{ID}}", pieces[n]).replace("{{PIECE}}", names[n]))
        (folder / "build-prompt.md").write_text(prompt, encoding="utf-8")
        paste = prompt.split("\n---\n", 1)[1].strip() if "\n---\n" in prompt else prompt.strip()   # what goes to the AI: below the line
        kit[n] = {"file": pieces[n] + ".js", "design": body(design), "prompt": paste, "checks": found}
        if n == "1" and rules_text:
            kit[n]["rules"] = body(rules_text)
    return kit


def main():
    season = runbooks(ROOT / "runbooks", True)
    tools = runbooks(ROOT / "runbooks" / "toolbox", False)
    js = ("/* Built by tools/build_runbooks.py from runbooks/session-NN.json and runbooks/toolbox/session-NN.json. Do not edit by hand. */\n"
          "window.OH = window.OH || {};\n"
          "window.OH.runbooks = " + json.dumps(season, ensure_ascii=False, indent=1) + ";\n"
          "window.OH.toolRunbooks = " + json.dumps(tools, ensure_ascii=False, indent=1) + ";\n")
    (ROOT / "app" / "data" / "runbooks.js").write_text(js, encoding="utf-8")
    kit = class_kit()
    (ROOT / "app" / "data" / "class.js").write_text(
        "/* Built by tools/build_runbooks.py from the class folder. Do not edit by hand. */\n"
        "window.OH = window.OH || {};\n"
        "window.OH.classKit = " + json.dumps(kit, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"runbooks: {len(season)} for the command center, {len(tools)} for the Toolbox. Build prompts: {len(kit)}")


if __name__ == "__main__":
    main()
