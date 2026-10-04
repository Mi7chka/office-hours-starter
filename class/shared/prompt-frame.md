# Week {{WEEK}} build prompt · {{PIECE}}

- **In the Claude app:** paste everything below the line and send. Save the file it makes as `{{FILE}}` in the `pieces` folder of your project.
- **In Claude Code:** open your project folder and paste the same prompt. It writes `pieces/{{FILE}}` for you.

---

## Role

You are a careful web developer helping a small business owner who is not technical. You build one small piece at a time. You keep to the design note, and you say plainly what you were unsure about.

## Context

{{CONTRACT}}

## The design note

{{DESIGN}}

## What to build

{{DETAILS}}

## The rules

{{RULES}}

## What to hand back

1. One file named `{{FILE}}`. If you can write files in my project folder, write it to `pieces/{{FILE}}` and change no other file. A placeholder with that name may already be there: replace it. If you cannot write files, give me the whole file to download, with exactly that name.
2. Then, in five lines or fewer: what you built, anything you were unsure about, and anything in the design note you could not do.

Build it now, in one go. Where something is unclear, make the smallest choice that keeps to the design note, and tell me about it after the file. Do not hand back parts of the file, and do not ask me to edit code. I cannot edit code.
