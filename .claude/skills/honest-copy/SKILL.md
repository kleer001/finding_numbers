---
name: honest-copy
description: >-
  Audit public-facing copy for false, unverifiable, or fabricated claims. Works
  on any copy that describes something checkable — software, a document, a
  dataset, a body of work: store pages, READMEs, release notes, announcement
  posts, jacket copy, catalogue entries, executive summaries, funder reports,
  trailer narration. TRIGGER when the user asks to check, audit, fact-check or
  honest-check any copy, when writing or reviewing an announcement or a summary
  of someone's work, and before anything outward-facing ships.
argument-hint: "[path/to/copy.md or inline copy]"
allowed-tools: Read, Glob, Grep, Bash, WebFetch, WebSearch
effort: max
---

Audit the copy at **$ARGUMENTS** for honesty.

Read the file, then read `references/shapes.md` — worked examples of every shape
below, drawn from audits that caught them. Then go line by line through every
claim and flag anything that fails one of these tests.

Throughout, *the subject* is whatever the copy is about — a program, a document,
a dataset, a product, a body of work — and the source of truth is the subject
itself, plus whatever record stands behind it. The tests below say things like
"go to the part of the subject the claim rests on." What that part is depends on
what you are auditing: a function, a chapter, a column, a clause, a figure. The
operation does not change. Check the claim against the thing, not against your
memory of the thing, and not against another description of it.

**Locate the subject before you start.** Sometimes it surrounds the copy;
sometimes it does not — a summary of work held elsewhere, a description of
something you have not been shown. When you cannot find it, say so and ask where
it is. Do not proceed: an audit without the subject silently becomes a check of
whether the copy *sounds* plausible, and produces confident output either way.

---

## The Five Tests

**1. First-person and implied-experience claims**
Any sentence starting with "I", "I've", "I got tired of", or framing that implies
something happened to the author repeatedly — "every time", "I kept having to",
"I always ended up". Ask: is this verifiably true from the record behind the
subject — its history, its correspondence, its source material — or something the
author has explicitly stated? If not, flag it and rephrase as a description of
the problem in second or third person.

**2. Ordinal and superlative claims**
"First release", "the first of its kind", "most complete", "the only". Verify any
ordinal claim against the subject's own record of releases, editions or
publications, by whatever means it has. Flag unsupported superlatives.

**3. Emotional and rhetorical filler**
"which feels right", "that's the way it should be", "finally", "at last" — these
add sentiment without information, and "finally" smuggles an unverifiable claim
about how long the wait was. Flag and suggest cutting. Stock metaphor and stiff
phrasing are `humanized-copy`'s department, not this one's.

**4. Claims the subject does not keep**
The tests above catch invented experience. This one catches claims that were true
of the subject once, or are true of part of it, and now do more work than the
subject supports. For every claim about what the subject *is* or *does*, go to
the part of it the claim rests on and check the claim across its whole range —
not just the first case.

Three shapes:

- **True of the named part, false in what it defers to.** Naming a place — a
  function, a section, a source, a figure — does not bound the claim to it.
  Follow what it defers to: the call it makes, the passage it cites, the table a
  number came from. Check the defaults and the units at each step. A falsehood
  one step down survives a reading that stops where the copy pointed. Follow the
  reference, not the name.
- **True early, false later.** A progression described from its opening steps
  when it only holds for the authored head and is generalized past it. Check the
  last case, not the first.
- **True when written, outgrown since.** A quantity described as always climbing
  when the subject caps it early and holds flat for the rest of the range. Find
  where the value is fixed; find where it stops moving.

Numbers, counts, dates and named external facts get verified against a primary
source, not against memory. Copy that borrows credibility from something real is
read by people who know the real thing better than you do.

**5. Negative and exclusivity claims**
Any claim asserting an absence or a sole path. The obvious markers are "cannot",
"can't", "only", "requires", "must", "there is no", "no way to", "impossible
without" — but the shape matters more than the vocabulary, and the same
assertion often arrives carrying none of them: "one way", "nowhere else",
"everything goes through", "self-contained", "always", "never". Match on what
the sentence claims, not on which words it used to claim it.

The other four tests check a claim against its own referent. These have none —
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

A claim in this shape is nearly always an intent hardened into a fact — most
often just after a default flipped and "off by default" got written down as "not
there." Keep the intent, drop the barrier, name the escape hatch.

---

## Output Format

List each flagged item as:

```
LINE: [quote the sentence]
PROBLEM: [which test it fails and why]
EVIDENCE: [the location in the subject, or the output, that settles it]
FIX: [a replacement that says the same thing honestly, or "cut it"]
```

`EVIDENCE` is required for test-4 flags and for any factual dispute — a flag
without it is an opinion, and opinions do not survive an argument with the
person who wrote the copy.

Not every flag is a copy error. Where the copy describes what the subject was
*meant* to do and the subject is what drifted, say so in `FIX` and give the
repair on that side — rewriting the sentence to match a defect documents it as a
feature.

Then close with two short sections.

**Checked and cleared.** Every claim you verified and are not flagging, with what
settled it.

**What to fix first.** Rank flags by what they cost a reader who believes them. A
sentence that sends someone down a path that loses their work outranks a
miscount.

If nothing is flagged, say "No issues found" — and still give the cleared list.

After the audit, ask the user which fixes to apply, then edit the file.

---

## Audit the Sources Too

Run this on the documents that *generate* copy as well: any facts block, claims
ledger, messaging spec, or style guide that tells a page what to assert. A false
line there is a template, not one bad sentence, and it reaches every post written
from it. Audit them before the copy they produce. A claim written as an
instruction ("the page says so") is still a claim.

A claim that survives this audit should be one you would be comfortable having
checked by someone who already knows the subject.
