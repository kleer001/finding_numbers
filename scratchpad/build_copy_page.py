#!/usr/bin/env python3
"""Regenerate copy-review.html — the posting board for OUTREACH-COPY.md.

One card per channel in posting order, each with its gate rules, the assets it
needs (checked against disk) and every paste-ready block behind a copy button.
OUTREACH-COPY.md stays the single source of the words; this file only arranges
them and adds the per-channel gate notes.
"""

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "OUTREACH-COPY.md"
OUTPUT = Path(__file__).resolve().parent / "copy-review.html"

GAME_URL = "https://kleer001.itch.io/finding-numbers"

# Presentation metadata per section: posting group, the gate in one line, and
# the hazard worth seeing at the moment of posting. Section titles must match
# the `## ` headings in OUTREACH-COPY.md.
CHANNELS = [
    ("r/WebGames", "Genre communities", [
        "Title must BEGIN with the game name; [HORROR][HTML5] may precede it",
        "Direct link to the game — the itch page, not a writeup",
        "No repost inside three months",
        "Link goes in the post; the copy below is the FIRST COMMENT",
    ]),
    ("r/itchio", "Genre communities", [
        "No sidebar gate — devs post their own pages routinely",
        "No NSFW",
    ]),
    ("r/playmygame", "Genre communities", [
        "Flair required: [Web] / PC (Web)",
        "NSFW-flag it as horror",
        "Game link before any other link",
        "One post per game per month",
        "Post from an account with ordinary comment history",
    ]),
    ("r/analoghorror", "Genre communities", [
        "Stealth promo banned — own the post as the dev",
        "Feed is video series; expect reach, not conversion",
    ]),
    ("r/numberstations", "Genre communities", [
        "This audience knows real station audio — say tribute-not-recording in the title",
        "Small and slow (~18k); no self-promo rule stated",
    ]),
    ("r/IndieGaming", "Genre communities", [
        "One submission every two weeks",
        "Account must be a week old with ordinary posting history",
        "A text post with footage is in scope; Let's Plays and streams are not",
    ]),
    ("r/indiegames", "Genre communities", [
        "The post MUST carry an image, GIF or video of the game",
        "Two posts a week is the ceiling",
        "Dressing promo as a request for feedback is against the rules",
    ]),
    ("Haunted PS1 Discord", "Genre communities", [
        "Initiation must clear first; do not ping mods while it is pending",
        "Rule 12 forbids advocating for AI — state provenance and stop",
        "Rule 15 governs art posted here: captures are renderer output, not model output",
    ]),
    ("itch.io Release Announcements board", "Genre communities", [
        "itch.io/board/10022/release-announcements",
        "Needs page link + summary + at least one embedded image or video",
    ]),
    ("itch devlog", "Devlog", [
        "Descriptions take images, not video — GIFs are the only motion",
        "Names no level number, no threshold, no effect: tease, don't explain",
    ]),
    ("YouTube trailer — three packages to test", "Social", [
        "Three title + thumbnail packages on the one video, up to two weeks",
        "Watch time picks the winner, not click-through rate",
    ]),
    ("Short video", "Social", [
        "NEVER the itch trailer slot — a 9:16 upload becomes a Short, and Shorts can't be A/B tested",
    ]),
    ("Curator and streamer pitches", "Curators", [
        "One email each, then move on — none of these has a queue you can jump",
        "Jupiter Hadley is not a pitch: enter a jam she is covering",
    ]),
]

REFERENCE_SECTIONS = ["The claim floor", "Naming the genre"]

BLOCK_LABEL = re.compile(r"^\*\*(.+?)\*\*[:：]?\s*(.*)$")
ASSET_REF = re.compile(r"clips/out/[\w./-]+\.\w+")


def split_sections(text):
    """Return {heading: [lines]} for every `## ` section, in file order."""
    sections, current, body = {}, None, []
    for line in text.splitlines():
        if line.startswith("## "):
            if current:
                sections[current] = body
            current, body = line[3:].strip(), []
        elif current:
            body.append(line)
    if current:
        sections[current] = body
    return sections


def parse_blocks(lines):
    """Split a section into (notes, [(label, fenced_text)]).

    A `**Label:**` line names the fenced block that follows it; text outside any
    fence is a note. Trailing prose after the last fence stays in notes.
    """
    notes, blocks = [], []
    label, fence, buf = "Copy", False, []
    for line in lines:
        if line.startswith("```"):
            if fence:
                blocks.append((label, "\n".join(buf)))
                buf, label = [], "Copy"
            fence = not fence
            continue
        if fence:
            buf.append(line)
        elif line.startswith("**"):
            match = BLOCK_LABEL.match(line.strip())
            if match:
                label = match.group(1).strip().rstrip(":")
                trailing = match.group(2).strip()
                if trailing:
                    notes.append(f"{label}: {trailing}")
            else:
                notes.append(line.strip())
        elif line.strip():
            notes.append(line.strip())
    return notes, blocks


def find_assets(lines):
    """Asset paths a section names, each checked against disk."""
    seen = []
    for path in ASSET_REF.findall("\n".join(lines)):
        if path not in seen:
            seen.append(path)
    return [(p, (ROOT / p).exists()) for p in seen]


def esc(text):
    return html.escape(text, quote=True)


def render_notes(notes):
    if not notes:
        return ""
    items = "".join(f"<li>{esc(n)}</li>" for n in notes)
    return f'<ul class="notes">{items}</ul>'


def render_rules(rules):
    items = "".join(f"<li>{esc(r)}</li>" for r in rules)
    return f'<ul class="rules">{items}</ul>'


def render_assets(assets):
    if not assets:
        return ""
    rows = []
    for path, exists in assets:
        mark = "present" if exists else "missing"
        glyph = "✓" if exists else "✗"
        rows.append(
            f'<li class="asset {mark}"><span class="glyph">{glyph}</span>'
            f"<code>{esc(path)}</code></li>"
        )
    return f'<ul class="assets">{"".join(rows)}</ul>'


def render_blocks(blocks, card_id):
    out = []
    for index, (label, body) in enumerate(blocks):
        block_id = f"{card_id}-b{index}"
        chars = len(body)
        out.append(f"""
      <div class="block">
        <div class="block-head">
          <span class="label">{esc(label)}</span>
          <span class="chars">{chars} chars</span>
          <button class="copy" data-target="{block_id}">Copy</button>
        </div>
        <pre id="{block_id}">{esc(body)}</pre>
      </div>""")
    return "".join(out)


def build():
    sections = split_sections(SOURCE.read_text())

    missing = [name for name, _, _ in CHANNELS if name not in sections]
    if missing:
        sys.exit(f"OUTREACH-COPY.md has no section for: {', '.join(missing)}")

    reference = []
    for name in REFERENCE_SECTIONS:
        notes, _ = parse_blocks(sections[name])
        reference.append(
            f'<section class="ref"><h3>{esc(name)}</h3>{render_notes(notes)}</section>'
        )

    cards, nav, group = [], [], None
    for order, (name, bucket, rules) in enumerate(CHANNELS, start=1):
        lines = sections[name]
        notes, blocks = parse_blocks(lines)
        assets = find_assets(lines)
        card_id = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

        if bucket != group:
            group = bucket
            cards.append(f'<h2 class="group">{esc(bucket)}</h2>')

        nav.append(f'<a href="#{card_id}">{esc(name)}</a>')
        cards.append(f"""
    <article class="card" id="{card_id}">
      <header>
        <span class="order">{order}</span>
        <h3>{esc(name)}</h3>
      </header>
      <div class="gate">
        <h4>Before you paste</h4>
        {render_rules(rules)}
      </div>
      {f'<div class="attach"><h4>Attach</h4>{render_assets(assets)}</div>' if assets else ''}
      {f'<div class="ctx">{render_notes(notes)}</div>' if notes else ''}
      {render_blocks(blocks, card_id)}
    </article>""")

    return PAGE.format(
        game_url=GAME_URL,
        reference="".join(reference),
        nav="".join(nav),
        cards="".join(cards),
    )


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>finding_numbers — posting board</title>
<style>
  :root {{
    --ink: #1a1a1a; --bg: #fafafa; --card: #ffffff; --line: #e2e2e0;
    --muted: #6b6b68; --accent: #7a3b00; --warn: #a3252b; --ok: #1f6b3a;
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0; background: var(--bg); color: var(--ink);
    font: 16px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }}
  .wrap {{ max-width: 60rem; margin: 0 auto; padding: 2rem 1.25rem 6rem; }}
  h1 {{ font-size: 1.6rem; margin: 0 0 .3rem; letter-spacing: -.01em; }}
  .sub {{ color: var(--muted); margin: 0 0 1.5rem; }}
  .sub a {{ color: var(--accent); }}
  nav {{
    position: sticky; top: 0; z-index: 5; background: var(--bg);
    border-bottom: 1px solid var(--line); padding: .6rem 0; margin-bottom: 1.5rem;
    display: flex; flex-wrap: wrap; gap: .4rem;
  }}
  nav a {{
    font-size: .78rem; text-decoration: none; color: var(--muted);
    border: 1px solid var(--line); border-radius: 999px; padding: .18rem .6rem;
    background: var(--card); white-space: nowrap;
  }}
  nav a:hover {{ color: var(--ink); border-color: var(--muted); }}
  details.floor {{
    background: var(--card); border: 1px solid var(--line); border-radius: 8px;
    padding: .8rem 1rem; margin-bottom: 2rem;
  }}
  details.floor summary {{ cursor: pointer; font-weight: 600; }}
  .ref h3 {{ font-size: .95rem; margin: 1rem 0 .4rem; }}
  .group {{
    font-size: .8rem; text-transform: uppercase; letter-spacing: .08em;
    color: var(--muted); margin: 2.5rem 0 .75rem; font-weight: 600;
  }}
  .card {{
    background: var(--card); border: 1px solid var(--line); border-radius: 8px;
    padding: 1.1rem 1.25rem; margin-bottom: 1.25rem;
  }}
  .card header {{ display: flex; align-items: baseline; gap: .6rem; margin-bottom: .8rem; }}
  .card h3 {{ font-size: 1.15rem; margin: 0; }}
  .order {{
    font-variant-numeric: tabular-nums; font-size: .75rem; font-weight: 700;
    color: var(--card); background: var(--ink); border-radius: 4px;
    padding: .1rem .4rem; flex: none;
  }}
  h4 {{
    font-size: .72rem; text-transform: uppercase; letter-spacing: .07em;
    color: var(--muted); margin: 0 0 .35rem; font-weight: 700;
  }}
  .gate {{
    border-left: 3px solid var(--warn); padding: .1rem 0 .1rem .75rem; margin-bottom: .9rem;
  }}
  ul {{ margin: 0; padding-left: 1.1rem; }}
  .rules li {{ font-size: .88rem; margin-bottom: .15rem; }}
  .notes li {{ font-size: .86rem; color: var(--muted); margin-bottom: .15rem; }}
  .attach {{ margin-bottom: .9rem; }}
  .assets {{ list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: .4rem; }}
  .asset {{
    font-size: .8rem; border: 1px solid var(--line); border-radius: 5px;
    padding: .15rem .5rem; display: flex; align-items: center; gap: .35rem;
  }}
  .asset code {{ font-size: .78rem; }}
  .asset.present .glyph {{ color: var(--ok); }}
  .asset.missing {{ border-color: var(--warn); }}
  .asset.missing .glyph {{ color: var(--warn); }}
  .ctx {{ margin-bottom: .9rem; }}
  .block {{ margin-top: .9rem; }}
  .block-head {{ display: flex; align-items: center; gap: .6rem; margin-bottom: .3rem; }}
  .label {{ font-size: .82rem; font-weight: 700; }}
  .chars {{ font-size: .74rem; color: var(--muted); margin-right: auto; }}
  button.copy {{
    font: inherit; font-size: .76rem; cursor: pointer; border: 1px solid var(--line);
    background: var(--bg); border-radius: 5px; padding: .2rem .65rem; color: var(--ink);
  }}
  button.copy:hover {{ border-color: var(--muted); }}
  button.copy.done {{ color: var(--ok); border-color: var(--ok); }}
  pre {{
    margin: 0; background: #f4f4f2; border: 1px solid var(--line); border-radius: 6px;
    padding: .7rem .85rem; font-size: .84rem; line-height: 1.5;
    white-space: pre-wrap; word-wrap: break-word; overflow-x: auto;
  }}
</style>
</head>
<body>
<div class="wrap">
  <h1>finding_numbers — posting board</h1>
  <p class="sub">What goes where, in posting order. Words come from
    <code>OUTREACH-COPY.md</code>; regenerate with <code>build_copy_page.py</code>.
    Game: <a href="{game_url}">{game_url}</a></p>

  <nav>{nav}</nav>

  <details class="floor">
    <summary>The claim floor and the genre rules — read once before the first post</summary>
    {reference}
  </details>

  {cards}
</div>
<script>
  document.querySelectorAll('button.copy').forEach(function (btn) {{
    btn.addEventListener('click', function () {{
      var text = document.getElementById(btn.dataset.target).textContent;
      navigator.clipboard.writeText(text).then(function () {{
        btn.textContent = 'Copied';
        btn.classList.add('done');
        setTimeout(function () {{
          btn.textContent = 'Copy';
          btn.classList.remove('done');
        }}, 1400);
      }});
    }});
  }});
</script>
</body>
</html>
"""


if __name__ == "__main__":
    OUTPUT.write_text(build())
    print(f"wrote {OUTPUT}")
