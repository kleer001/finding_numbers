# Worked shapes

Examples for each test in `SKILL.md`. They are illustrations, not a catalogue —
the shapes recur, the particulars never do. Match on the shape.

## Contents

- [Test 1 — first-person and implied experience](#test-1)
- [Test 3 — filler](#test-3)
- [Test 4 — claims the subject does not keep](#test-4)
- [Test 5 — negative and exclusivity claims](#test-5)
- [Why the sources get audited too](#sources)

---

<a name="test-1"></a>
## Test 1 — first-person and implied experience

> Bad: "The one I got tired of rebuilding from scratch"
> Bad: "Every time I hit this, I'd write the same workaround again"
> OK: "The built-in version handles only one of the two cases" ← verifiable fact
>   about the subject

The second is the shape worth naming: "every time" and "I always ended up"
assert a pattern of events, and a pattern is a factual claim about someone's
life. It needs a source like any other.

---

<a name="test-3"></a>
## Test 3 — filler

The line between this and `humanized-copy` is that filler can carry a *claim*.
"Finally" asserts a wait. "The first tool that just works" asserts a comparison.
Cut those here. Stock metaphor and stiff rhythm are the other skill's job.

Check whose voice the sentiment is in before flagging it. A banned word inside a
faithful quotation belongs to the speaker, not to the copy, and cutting it
falsifies the quote to satisfy a style rule.

---

<a name="test-4"></a>
## Test 4 — claims the subject does not keep

> Bad: "N of them, each harder than the last" when the last several share one spec
> OK: "N of them" when the source says N
> Fix shape: narrow the claim to what the subject keeps, or change the subject

### True of the named part, false in what it defers to

The falsehood sits one step past where the copy pointed. It survives review
because the place the copy names checks out, and because the thing that place
relies on is itself named for exactly the right idea.

The tell is a sentence that names a location and makes a claim about a *value*:
"§3 establishes X", "`compute()` returns the interval between A and B", "the
figure in Table 2 is drawn from the 1998 census". Go to the named place, then
keep going. Read what it hands off to — the call, the citation, the appendix, the
column, the definition — and check the defaults and the units at every step. A
default argument one call down, or a footnote that revises the body, will not
appear at the place the copy sent you.

Two habits close it: never stop at the first location that confirms the claim,
and treat a named helper's *name* as a claim needing its own check.

### True early, false later

A progression stated from its opening steps, generalized past where it holds.
Check the last case. Where the copy volunteers a boundary example — "even at a
setting of 1" — check that one first: authors reach for the extreme they never
tested, and off-by-one errors are total there and invisible in the middle of the
range.

### True when written, outgrown since

A quantity described as always climbing when the subject caps it early and holds
flat. Find where the value stops moving, not where it starts.

### Numbers and borrowed credibility

Three ways a number passes a careless check:

- **The arithmetic confirms it.** "Nine from the standard plus three of our own"
  against a table of twelve. Counting agrees; the composition can still be wrong,
  with an item silently substituted from an adjacent section of the standard.
  Verify membership, not just the total.
- **The constant is recognisable.** A cap cited as "24 hours" beside a constant
  reading `86400` — correct in seconds, wrong by a thousand in a module working
  in milliseconds. Naming the constant is what ends the reader's check.
- **The sub-totals are internally consistent.** A breakdown that sums to its own
  stated total, where the total came from a stale summary rather than the record
  the summary describes.

Copy that borrows credibility from something real — a published spec, a standard,
a historical event — is read by people who know the real thing better than you
do. Check it against the source, not against the copy's own restatement of it.

---

<a name="test-5"></a>
## Test 5 — negative and exclusivity claims

> Bad: "cannot be used without X" when an option delivers the same result
>   without X
> OK: "X is how it is built to be used" — the intent, with the option named for
>   anyone who needs it
> Fix shape: keep the intent, drop the barrier, name the escape hatch

### The shape arrives without the marker words

Exclusivity asserted while avoiding every obvious trigger:

- "Records leave one way: an explicit acknowledgement."
- "State lives in the directory you name and nowhere else."
- "Everything funnels through a single decision point."
- "Every question routes through one function."

None contains "cannot", "only", "must" or "there is no". Each is a universal
claim about paths through the subject, and each is refuted by a path the sentence
never mentions — often one the copy documents elsewhere as a feature.

### Clearing a true one is the harder half

The procedure has to pass claims that merely *look* false, or it produces noise
and gets ignored. Clear them the same way you refute them: by enumeration, not by
confirmation.

For an absence claim, list every surface that could introduce the thing being
denied — every setting, every dependency, every entry point — and show none does.
For a count-of-paths claim ("two things are permanent"), enumerate every
operation of that kind and show the count is exact. A clear backed by an
enumeration survives challenge; a clear backed by "I looked and didn't see it"
does not.

### Individually true, jointly false

A claim can live in the join rather than in any sentence. Three sentences, each
verifiable, arranged so the paragraph asserts something none of them says:

> All forty-one were recorded. Every one now in the archive has been digitised.
> Digitised copies are supplied on request.

If some were destroyed before reaching the archive, all three sentences stay
true — the second is true *because* the missing ones are not there to be counted
— and the paragraph still promises forty-one. Read the paragraph as a claim, not
only the sentences in it. The give-away is a set named in one sentence and
silently narrowed in the next.

---

<a name="sources"></a>
## Why the sources get audited too

A false line in a facts block or a claims ledger is a template, not one bad
sentence. Written as an instruction — "the page says X" — it is copied faithfully
into every post, README and store page generated from it, and each copy looks
independently sourced. The instruction form is what disguises it: these documents
read like premises, so they get audited *against* rather than audited.

Audit them first, before the copy they produce. A claim written as an instruction
is still a claim.
