# Worked shapes

Examples for each test in `SKILL.md`. The case studies are real — every one is a
claim that survived a reading and was caught on a later pass, which is why the
shape is written down.

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

One case worth keeping in mind: a quotation containing "at last" is not filler
in the copy — it is the speaker's word, faithfully reported. Check whether the
sentiment belongs to the copy or to a source before flagging it.

---

<a name="test-4"></a>
## Test 4 — claims the subject does not keep

> Bad: "N of them, each harder than the last" when the last several share one spec
> OK: "N of them" when the source says N
> Fix shape: narrow the claim to what the subject keeps, or change the subject

### True of the named part, false in what it defers to

The falsehood sits one step past where the copy pointed, and it survives review
because the thing it points to is named for exactly the right idea.

**Case — software.** Copy: *"`freshnessLifetime()` … falls back to the interval
between the response's own `Date` and `Expires` headers."* The named function's
own logic was correct. It called a helper, `expiresLifetime`, whose second
parameter defaulted to the current wall clock — so the interval was measured
from *now*, never from the `Date` header. The helper's name advertised the right
thing and it lived in a file named for a different concern. Two audits verified
the surrounding paragraph and cleared the region before a third followed the
call.

**Case — prose.** A catalogue entry gave a station count taken from the study's
own body text. The study's errata appendix recorded that figure as stale and
named itself the authority. Same shape: the copy cited a real place in the
subject, and the place deferred to something that contradicted it.

The operation is identical in both. Follow the citation, the call, the table a
number came from. Check defaults and units at each step.

### True early, false later

**Case.** *"It keeps 64 entries by default, and a store built with `capacity: 1`
keeps exactly the most recent response and nothing older."* The eviction loop
used `>=` where it needed `>`. The default kept 63; at `capacity: 1` the store
kept nothing at all, discarding the entry it had just inserted. Checking the
first case confirms the claim. Checking the boundary the copy itself chose to
illustrate destroys it.

### True when written, outgrown since

**Case.** A level progression described as always widening — *"more of it the
further you go"* — when the generator capped variety at level 12 and held flat
for the twenty levels after. Find the constant; find where it stops moving.

### Numbers and borrowed credibility

**Case.** *"The parser recognises all ten response directives from RFC 9111
§5.2.2, plus two from RFC 5861."* Ten plus two matched a table of twelve, so the
arithmetic confirmed the sentence. The table was missing one §5.2.2 directive
and padded with a *request* directive from a different section. Only the
published spec refutes it, and the audience for that sentence is people who know
the spec.

**Case.** *"capped at 24 hours (`HEURISTIC_CAP`)."* The constant read `86400` —
correct for 24 hours in seconds — in a module working entirely in milliseconds.
The real ceiling was 86.4 seconds. Naming the constant is what let it survive:
a reader opens the file, recognises the number, and stops.

---

<a name="test-5"></a>
## Test 5 — negative and exclusivity claims

> Bad: "cannot be used without X" when an option delivers the same result
>   without X
> OK: "X is how it is built to be used" — the intent, with the option named for
>   anyone who needs it
> Fix shape: keep the intent, drop the barrier, name the escape hatch

### The shape arrives without the marker words

Two independent adversaries, both given this checklist in advance, tried the
same evasion: assert exclusivity while avoiding every listed trigger word.

- *"Records leave the live spool one way: an explicit ack."* — three other paths
  removed records.
- *"State lives in the spool directory you name and nowhere else on the
  filesystem."* — a lock file in the system temp directory.
- *"All freshness questions funnel through one function."* — the store never
  called it.

None contains "cannot", "only", "must" or "there is no". Match the shape.

### Clearing a true one is the harder half

The procedure has to pass claims that merely *look* false, or it is useless.
Worked example of a correct clear: *"tally never sends your data anywhere."*
Enumerate the falsifiers rather than the subject — every config key, the
dependency list, every import, a transport grep. No network surface exists and
no setting could enable one. The claim survives.

Same for exclusivity: *"Two things are permanent."* Verified by listing every
operation that writes to the store — two destroy without recovery, four don't.
Exactly two. Claim holds.

### Individually true, jointly false

A claim can live in the join rather than in any sentence:

> Fieldwork ran from 1998 to 2004. All forty-one interviews were recorded on
> quarter-inch tape. Every tape in the archive has been digitised and can be
> supplied on request.

Each sentence is true. Three tapes were destroyed before transcription, so they
are not in the archive to be counted — which is precisely why the third sentence
is true. The paragraph asserts that all forty-one are available. A reader gets
thirty-eight. Read the paragraph as a claim, not only the sentences in it.

---

<a name="sources"></a>
## Why the sources get audited too

A false line in a facts block or a claims ledger is a template. One such line —
"the page cannot be played without sound", written into a store-page spec as an
instruction rather than a claim — reached six community posts, a README, a
landing page and a store description before anyone checked it against the
preferences menu, where the setting that refuted it had been shipped all along.

These documents read like premises, which is exactly why they get audited
*against* instead of audited. Audit them first.
