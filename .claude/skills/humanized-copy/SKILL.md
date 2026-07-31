---
name: humanized-copy
description: >-
  Rewrite public-facing copy so it reads like a person wrote it — store pages,
  forum posts, captions, release notes, emails. Strips machine tells, fixes
  stiff grammar, and holds an 8th-grade reading level with varied sentence
  length. TRIGGER when the user asks to humanize, de-slop, tighten, or
  plain-language any copy, when copy reads stilted or AI-written, and at the
  release gate alongside honest-copy.
argument-hint: "[path/to/copy.md or inline copy]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

Rewrite the copy at **$ARGUMENTS** so a person would say it out loud.

This is the companion to `honest-copy`, not a replacement. That skill asks *is this
true*. This one asks *would anyone say this*. Copy ships only when both pass, and
`honest-copy` runs last — a rewrite for rhythm can quietly change a claim.

## Scope

Public copy: store pages, forum and social posts, video captions, release notes,
cold emails, README intros. Short-form, second person, read once.

Not fiction. Prose drafts belong to `book_loom` — `reference/prose_rendering_reference.md`
and its longer ban list in `reference/voice_template.md`, which covers
show-don't-tell, interiority and emotional-channel rotation. None of that applies to
a Reddit post.

## 1. Measure first

```sh
.claude/skills/humanized-copy/check.py --fenced path/to/copy.md
```

Drop `--fenced` for ordinary prose. Use it when the copy lives in ``` blocks; each
block is then scored as its own post, so two posts may open the same way and one
post may not.

The script reports reading grade, mean sentence length, length spread, and hits
against `banned.md`. It exits 1 on a hard failure. Fix what it names before reading
for taste — arguing about a sentence that measures 53 words is arguing about the
wrong thing.

Rules live in `banned.md`, not in the script. Add a ban by editing that file. Keep a
banned word only by adding it to `## Exceptions` with the reason it is load-bearing;
an exception is a decision on the record.

## 2. The tells

Ranked by how strongly readers weight them. The first two are `honest-copy`'s
department and are listed only so the split is clear.

1. **Invented facts and sources** — `honest-copy`.
2. **Fabricated citations** — `honest-copy`.
3. **Unnatural polish.** Professors rank "no errors at all" among the strongest
   signals of machine authorship: prose with no contraction, no fragment, no
   sentence that starts with *And*. Uniform correctness reads as nobody.
4. **Repetition of shape.** The same sentence pattern three times running. Every
   paragraph opening on the same construction. `check.py` flags repeated openings.
5. **Formulaic structure.** Generic opener, three body beats, summary close that
   restates the opener. Real posts start in the middle and stop when done.
6. **Complex syntax.** Nested subordinate clauses and nominalizations — a verb
   wearing a noun costume. *"Sixteen levels are the game as designed"* is this
   failure at full strength: a noun-pile appositive nobody would say aloud.
7. **Difficult words.** Advanced vocabulary where a plain word is more precise.
   `banned.md` carries the list.

Structural habits the measured signature adds:

- **Uniform sentence length.** Machine drafts cluster at 15–20 words. Human writing
  varies hard. This is the single strongest rhythm tell, and `check.py` measures it.
- **Tricolon.** Ideas grouped in threes, endlessly. Use two. Use four. Use seven.
- **Uniform hedging.** Everything qualified to the same mild degree. Commit somewhere.
- **Em-dash asides** doing work a sentence should do.
- **Adjective inflation** on abstract nouns.
- **The connector.** *"It's not just X, it's Y."* Banned outright.

## 3. Grammar and reading level

**Flesch–Kincaid grade 9 is the ceiling**, and 8 is the number to aim at. That is not
writing for a child; it is where most published journalism sits.

A low grade is not a failure on its own. Plain words and short sentences score low, and
so does a lot of writing people admire. What makes low copy read as baby talk is a low
score *with no variety* — every sentence the same clipped length. So `check.py` fails
only on a grade over 9, or on a flat length spread. Under 6 with a healthy spread it
prints a note and asks you to re-read for anything clipped, which is a judgment the
formula cannot make.

- **Mean sentence 12–18 words**, but the spread matters more than the mean. Every
  paragraph wants one sentence under 9 words. Something has to land.
- **Nothing over 32 words.** Break it, or make it a list.
- **One idea per sentence.** Two clauses is the ceiling.
- **Concrete subject, active verb.** Say who does what.
- **Prefer the short everyday word.** Not its second cousin.
- **Cut adjectives and adverbs** wherever the noun and verb survive alone.
- **Contractions.** People use them.
- **Never lift a source comment into copy.** Code comments are written for one
  reader who already has the context. That is where the noun-pile above came from.

The craft rules behind these live in `../writing_advice/master_list.md`, sections
**Words** and **Sentences & sound** — Twain, Orwell, Strunk, Le Guin, Maugham,
Leonard. The rest of that file is fiction craft and does not apply here.

## 4. Rewrite

One pass per problem, in this order. Mixing them produces mush.

1. **Cut.** Delete every stock phrase `check.py` named. Do not replace them yet —
   most sentences read better with the phrase simply gone.
2. **Break the rhythm.** Split the long sentences. Then find a place for a short
   one. Read the paragraph and listen for the metronome.
3. **Replace precisely.** Now fill the gaps left by step 1. Choose the word this
   sentence needs. A single substitute applied everywhere is just a new tic —
   the cure becomes the disease.
4. **Add what only you know.** A number, a name, a decision and its cost. Specifics
   cannot be generated, which is exactly why they read as human.

## 5. Read it aloud

Literally. Every sentence you stumble on is broken, and it is broken at the place
you stumbled. This catches what no measurement does.

Then ask: would the author say this to somebody in a bar? If it would embarrass
them to say out loud, it will embarrass them in print.

## Output

Re-run `check.py` and show the before/after numbers. List what changed and why,
grouped by the pass that caught it. Then run `honest-copy` over the result — a
rewrite can turn a careful claim into a confident one.

Leave a sentence alone when its precision earns its stiffness. Say which sentences
those are and what they are buying.

## Sources

- [Key Features to Distinguish Between Human- and AI-Generated Texts: Perspectives
  from University Professors](https://www.mdpi.com/3042-8130/2/1/2) — the seven
  ranked features in §2.
- [Signs of AI Writing: 27 Red Flags](https://vrid.ai/blog/signs-of-ai-writing) and
  [How to Spot AI Writing Tells](https://www.oliviacal.com/post/ai-writing-tells) —
  the structural habits and uniform-cadence measurements.
- [How to Break Free from GPT's Rule of Three](https://gptzero.me/news/the-rule-of-three/) — the tricolon.
- [The most overused ChatGPT words](https://plusai.com/blog/the-most-overused-chatgpt-words/) — the vocabulary, cross-checked against `banned.md`'s upstream.
- [Flesch Reading Ease and Flesch–Kincaid Grade Level](https://readable.com/readability/flesch-reading-ease-flesch-kincaid-grade-level/) — the grade target.
