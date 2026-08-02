---
name: honest-copy
description: >-
  Audit public-facing copy for false, unverifiable, or fabricated claims —
  store pages, READMEs, release notes, announcement posts, trailer narration.
  TRIGGER when the user asks to check, audit, or honest-check any copy, when
  writing or reviewing an announcement, and at the release gate before a store
  page goes live.
argument-hint: "[path/to/copy.md or inline copy]"
allowed-tools: Read, Glob, Grep, Bash
effort: max
---

Audit the copy at **$ARGUMENTS** for honesty.

Read the file. Then go line by line through every claim and flag anything that
fails one of these tests.

---

## The Six Tests

**1. First-person experience claims**
Any sentence starting with "I", "I've", "Every time I", "I got tired of", etc.
Ask: is this verifiably true from the git history, the issue tracker, or
something the user has explicitly stated? If not, flag it.

> Bad: "The tool I got tired of rebuilding from scratch"
> Bad: "Every time I hit this, I'd write the same workaround again"
> OK: "The built-in version handles only one of the two cases" ← verifiable fact
>   about the software

**2. Ordinal and superlative claims**
"First release", "the first of its kind", "most complete", "the only". Verify
any ordinal claim against the project's own release history, by whatever means
the project has. Flag unsupported superlatives.

**3. Implied repeated personal experience**
Narrative framing like "every time", "I kept having to", "I always ended up"
implies something happened repeatedly. This is fabricated unless the user has
said so. Rephrase as a description of the problem in second or third person.

**4. Emotional/rhetorical filler**
"which feels right", "that's the way it should be", "finally", "at last" — these
add sentiment without adding information. Flag and suggest cutting.

Also reduce extra metaphors. Stock figures like "papercut", "tedious dance",
"shuffle" hide the actual mechanism — describe the literal behavior instead.
("Friction" and "pain point" are fine; they're plain industry terms.)

**5. Claims the build does not keep**
The other four tests catch invented experience. This one catches claims that
were true of the code once, or are true of part of it, and are now doing more
work than the build supports. For every claim about what the software *does*,
open the code that implements it and check the claim across its whole range —
not just the first case.

Three shapes to watch for:

- **True of the named function, false in what it calls.** Naming a function in
  the copy does not bound the claim to that function's body — it is a claim
  about everything the body delegates to. Read the helpers, their default
  arguments, and their units. A falsehood placed one call deep survives a
  reading that stops at the named function, especially when the helper's own
  name advertises the right thing and its file is named for something else.
  Follow the call, not the name.
- **True early, false later.** A progression described from its opening steps
  ("each one gets its own treatment") when the implementation only holds for the
  authored head and generalizes past it. Check the last case, not the first.
- **True when written, outgrown since.** A dial described as always climbing
  ("more of it the further you go") when the code caps it early and holds flat
  for the rest of the range. Find the constant; find where it stops moving.

Numbers, counts, dates, real-world references, and named external facts get
verified against a primary source, not against memory. If the copy borrows
credibility from something real — a published spec, a standard, a historical
event, a named external system — the audience for that copy contains people who
know the real thing better than you do. An invented detail there costs more
than the sentence was worth.

> Bad: "N of them, each harder than the last" when the last several share one spec
> OK: "N of them" when the constant says N
> Fix shape: narrow the claim to what the build keeps, or change the build

**6. Negative and exclusivity claims**
Any claim asserting an absence or a sole path: "cannot", "can't", "only",
"requires", "must", "there is no", "no way to", "impossible without".

The other five tests check a claim against its own referent. These have none —
there is no code implementing an absence, so "open the code that implements it"
returns nothing and the claim passes by default. Worse, the obvious search
*confirms* it: grep the subject of a "cannot X without Y" claim and you land in
the code implementing Y, which corroborates every word. Refuting it means
searching for something the copy never mentions.

So invert the procedure. Do not look for the code that implements the claim.
Enumerate what would falsify it:

- Walk every surface that changes behavior — settings, flags, configuration,
  saved state. Each is a path the claim has to survive. Read the list of
  options, not the feature the claim names.
- Search for the alternative rather than the subject: the branch that runs when
  the named thing is absent.
- Ask what a user who lacks the named thing actually gets. If something exists
  for exactly them, the claim is false, not merely overstated.

A claim in this shape is nearly always an intent that hardened into a fact — and
it hardens most often just after a default flips, when "off by default" gets
written down as "not there." The intent is usually true and worth keeping. The
barrier is the part that breaks. Say the intent.

> Bad: "cannot be used without X" when an option delivers the same result
>   without X
> OK: "X is how it is built to be used" — the intent, with the option named for
>   anyone who needs it
> Fix shape: keep the intent, drop the barrier, name the escape hatch

---

## Output Format

List each flagged item as:

```
LINE: [quote the sentence]
PROBLEM: [which test it fails and why]
EVIDENCE: [the source, file:line, or command output that settles it]
FIX: [a replacement that says the same thing honestly, or "cut it"]
```

`EVIDENCE` is required for test-5 flags and for any factual dispute — a flag
without it is an opinion, and opinions do not survive an argument with the
person who wrote the copy.

If nothing is flagged, say so explicitly: "No issues found."

After the audit, ask the user which fixes to apply, then edit the file.

---

## When to Run This

Run it on any copy before it reaches an audience: store-page descriptions,
release notes, announcement posts, README feature lists, trailer narration.

Run it also on the documents that *generate* copy: any facts block, claims
ledger, messaging spec, or style guide that tells a page what to assert. A false
line there is not one bad sentence; it is a template, and it reaches every post
written from it. These read like premises rather than claims, which is exactly
why they get audited *against* instead of audited — so audit them first, before
the copy they produce. A claim written as an instruction ("the page says so") is
still a claim.

At the release gate this audit is mandatory and covers the store page as well
as the repo — the no-fabrication rule runs all the way to the marketing copy.
A claim that survives this audit should be one you would be comfortable having
checked by someone who already knows the subject.
