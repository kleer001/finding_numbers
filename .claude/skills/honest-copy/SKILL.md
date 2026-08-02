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

Throughout, *the subject* is whatever the copy is about — a program, a document,
a dataset, a product, a body of work — and the source of truth is the subject
itself, plus whatever record stands behind it. The tests below say things like
"go to the part of the subject the claim rests on." What that part is depends on
what you are auditing: a function, a chapter, a column, a clause, a figure. The
operation does not change. Check the claim against the thing, not against your
memory of the thing, and not against another description of it.

---

## The Six Tests

**1. First-person experience claims**
Any sentence starting with "I", "I've", "Every time I", "I got tired of", etc.
Ask: is this verifiably true from the record behind the subject — its history,
its correspondence, its source material — or something the author has explicitly
stated? If not, flag it.

> Bad: "The one I got tired of rebuilding from scratch"
> Bad: "Every time I hit this, I'd write the same workaround again"
> OK: "The built-in version handles only one of the two cases" ← verifiable fact
>   about the subject

**2. Ordinal and superlative claims**
"First release", "the first of its kind", "most complete", "the only". Verify
any ordinal claim against the subject's own record of releases, editions or
publications, by whatever means it has. Flag unsupported superlatives.

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

**5. Claims the subject does not keep**
The other four tests catch invented experience. This one catches claims that
were true of the subject once, or are true of part of it, and are now doing more
work than the subject supports. For every claim about what the subject *is* or
*does*, go to the part of it the claim rests on and check the claim across its
whole range — not just the first case.

Three shapes to watch for:

- **True of the named part, false in what it defers to.** Naming a place — a
  function, a section, a source, a figure — does not bound the claim to that
  place. It is a claim about everything that place relies on in turn, so follow
  what it defers to: the call it makes, the passage it cites, the table a number
  came from, the definition a term leans on. Check the defaults and the units at
  each step. A falsehood placed one step down survives a reading that stops
  where the copy pointed, especially when the thing it points to is named for
  exactly the right idea. Follow the reference, not the name.
- **True early, false later.** A progression described from its opening steps
  ("each one gets its own treatment") when it only holds for the authored head
  and is generalized past it. Check the last case, not the first.
- **True when written, outgrown since.** A quantity described as always climbing
  ("more of it the further you go") when the subject caps it early and holds
  flat for the rest of the range. Find where the value is fixed; find where it
  stops moving.

Numbers, counts, dates, real-world references, and named external facts get
verified against a primary source, not against memory. If the copy borrows
credibility from something real — a published spec, a standard, a historical
event, a named external system — the audience for that copy contains people who
know the real thing better than you do. An invented detail there costs more
than the sentence was worth.

> Bad: "N of them, each harder than the last" when the last several share one spec
> OK: "N of them" when the source says N
> Fix shape: narrow the claim to what the subject keeps, or change the subject

**6. Negative and exclusivity claims**
Any claim asserting an absence or a sole path. The obvious markers are "cannot",
"can't", "only", "requires", "must", "there is no", "no way to", "impossible
without" — but the shape matters more than the vocabulary, and the same
assertion often arrives carrying none of them: "one way", "nowhere else",
"everything goes through", "self-contained", "always", "never". Match on what
the sentence claims, not on which words it used to claim it.

The other five tests check a claim against its own referent. These have none —
nothing implements an absence, so "go to the part that supports it" returns
nothing and the claim passes by default. Worse, the obvious check *confirms* it:
look up the subject of a "cannot X without Y" claim and you land on Y, which
corroborates every word. Refuting it means looking for something the copy never
mentions.

So invert the procedure. Do not look for what supports the claim. Enumerate what
would falsify it:

- Walk every variant that could come out differently — options, editions,
  versions, contexts, documented exceptions, the other routes a reader or user
  might take. Each is a case the claim has to survive. Read the list of them,
  not the one the claim names.
- Look for the alternative rather than the subject: what happens in the case the
  claim excludes.
- Ask what someone who lacks the named thing actually gets. If something exists
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

Before anything ships this audit is mandatory, and it covers the outward-facing
copy as well as the work itself — the no-fabrication rule runs all the way out
to the pitch.
A claim that survives this audit should be one you would be comfortable having
checked by someone who already knows the subject.
