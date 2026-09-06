# knowledge/ — what the assistant knows

Everything in this folder is what the assistant can say. Nothing else. If a fact
is not written here, the assistant will tell the visitor it does not know rather
than guess — that is deliberate, and it is what keeps this safe to put in front
of a recruiter.

## The one command

After changing anything in here:

```bash
npm run ingest
```

That rebuilds `data/index.json`. The assistant picks up the change immediately on
localhost, and on the next deploy in production.

## Which files to edit

| File | Who writes it |
|---|---|
| `00-resume.md` | **Generated — never edit.** Rebuilt from `config/content.js` every ingest. Fix the CV there instead. |
| `10-how-i-work.md` | You |
| `20-faq.md` | You |
| `30-projects-in-depth.md` | You |
| anything else you add | You |

You can add as many `.md` files as you like. Number the filenames so the order
stays readable. Plain `.txt` works too.

## How to write them

The retrieval splits your documents **at every heading**, so a heading is the
unit the assistant reaches for. Two rules follow from that:

1. **One idea per heading.** A heading with six unrelated facts under it gets
   retrieved for one of them and drags the other five along as noise.
2. **Write the heading as the question someone would ask.** "Can he code?" is a
   better heading than "Technical background", because it matches what a visitor
   actually types.

Write in whatever voice you like — the assistant rephrases. But **every fact it
can state has to exist here in plain words.** It cannot infer.

### Good

```markdown
## Can he code?

No, and he does not claim to. He specifies the system, directs AI-assisted
development, and verifies every output before it ships. He has shipped an SEO
audit tool, a lead-generation engine and this website that way.
```

### Bad

```markdown
## Technical

Very technical. Good with tools. Built lots of things.
```

The second one is unusable: nothing in it is a fact the assistant can repeat, so
it will either refuse or paraphrase vagueness back at a recruiter.

## Honesty rules that apply here too

These come from the résumé and they are not optional:

- No traffic, ranking or engagement numbers.
- Leads are **sourced and qualified** — never "converted" or "closed".
- The 43 → 65 site health score was **implemented by the client** acting on his
  findings.
- Skill ratings are his own self-assessment, not a measured metric.

If you write a number in here, the assistant will state it as fact to a
recruiter. Only write numbers you can defend.

## What not to put in here

Anything in this folder ends up in a public API response if someone asks the
right question. Treat it as published.

- No passwords, keys or client credentials.
- No client information you have not been cleared to share.
- No home address, no ID numbers.
- Nothing about a named third party that they have not agreed to.
