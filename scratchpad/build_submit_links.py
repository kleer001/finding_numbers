#!/usr/bin/env python3
"""Regenerate submit-links.html — one prefilled submit page per channel.

Reddit's submit form reads `title` and `url` from the query string and nothing
else: there is no body parameter, so self-post text and first comments stay on
copy buttons here. Nothing in this file posts anything; every row opens a
composer for a human to check and send.

Words come from OUTREACH-COPY.md via build_copy_page's parser.
"""

import html
from pathlib import Path
from urllib.parse import quote

from build_copy_page import ROOT, SOURCE, esc, parse_blocks, split_sections

OUTPUT = Path(__file__).resolve().parent / "submit-links.html"
GAME_URL = "https://kleer001.itch.io/finding-numbers"

# kind: "link"  — Reddit prefills title AND url; body is a follow-up comment.
#       "text"  — Reddit prefills title only; body is pasted into the composer.
#       "image" — the attachment must be dragged in, so only the title prefills.
# checks: what has to be set by hand in the composer before sending.
# posted: date this went up, which several subs measure their repost windows from.
CHANNELS = [
    {
        "section": "r/WebGames",
        "sub": "WebGames",
        "kind": "link",
        "posted": "2026-08-01",
        "checks": ["Title must still BEGIN with finding_numbers",
                   "No repost inside three months — next window opens 2026-11-01"],
    },
    {
        "section": "r/itchio",
        "sub": "itchio",
        "kind": "text",
        "posted": "2026-08-01",
        "checks": ["No NSFW flag needed here"],
    },
    {
        "section": "r/playmygame",
        "sub": "playmygame",
        "kind": "text",
        "posted": "2026-08-01",
        "checks": ["Set flair: [Web] / PC (Web)",
                   "NSFW-flag it as horror",
                   "Game link stays above every other link",
                   "One post per game per month — next window opens 2026-09-01"],
    },
    {
        "section": "r/analoghorror",
        "sub": "analoghorror",
        "kind": "image",
        "posted": "2026-08-01",
        "checks": ["Switch the composer to Images & Video and drag the GIF in",
                   "Own the post as the dev — stealth promo is banned"],
    },
    {
        "section": "r/numberstations",
        "sub": "numberstations",
        "kind": "image",
        "posted": "2026-08-01",
        "checks": ["Attach or link the jukebox clip",
                   "The live post's title says 'synthesized, not recorded' — true of the "
                   "build it was posted against, false since the voice recast. Correcting "
                   "it means deleting and reposting; Reddit cannot edit a title."],
    },
]

BOARD = {
    "section": "itch.io Release Announcements board",
    "url": "https://itch.io/board/10022/release-announcements",
    "posted": "2026-08-01",
    "checks": ["Needs the page link, a summary, and one embedded image or video",
               "Embed clips/out/core-loop.gif"],
}

KIND_NOTE = {
    "link": ("Link post", "Title and URL arrive prefilled. "
                          "Post it, then paste the first comment below."),
    "text": ("Text post", "Title arrives prefilled. Paste the body into the composer — "
                          "Reddit has no body parameter."),
    "image": ("Image post", "Title arrives prefilled. Attach the file by hand, "
                            "then paste the body."),
}


def submit_url(sub, title, link=None):
    base = f"https://www.reddit.com/r/{sub}/submit?title={quote(title, safe='')}"
    return base + (f"&url={quote(link, safe='')}" if link else "")


def blocks_by_label(section_lines):
    return {label: body for label, body in parse_blocks(section_lines)[1]}


def asset_for(section_lines):
    """The clip a section says to attach, as an absolute path for drag-and-drop."""
    text = "\n".join(section_lines)
    for name in ("core-loop.gif", "jukebox.mp4", "pulse.gif"):
        if name in text:
            path = ROOT / "clips" / "out" / name
            return str(path), path.exists()
    return None, False


def render_block(label, body, block_id):
    return f"""
        <div class="block">
          <div class="block-head">
            <span class="label">{esc(label)}</span>
            <span class="chars">{len(body)} chars</span>
            <button class="copy" data-target="{block_id}">Copy</button>
          </div>
          <pre id="{block_id}">{esc(body)}</pre>
        </div>"""


def build():
    sections = split_sections(SOURCE.read_text())
    rows = []

    for order, channel in enumerate(CHANNELS, start=1):
        lines = sections[channel["section"]]
        blocks = blocks_by_label(lines)
        title = blocks.get("Title", "")
        kind = channel["kind"]
        kind_label, kind_note = KIND_NOTE[kind]

        link = GAME_URL if kind == "link" else None
        url = submit_url(channel["sub"], title, link)

        body_label = "First comment" if kind == "link" else "Body"
        body = blocks.get(body_label, "")
        slug = channel["sub"].lower()

        asset_path, asset_ok = asset_for(lines) if kind == "image" else (None, False)
        asset_html = ""
        if asset_path:
            state = "present" if asset_ok else "missing"
            glyph = "✓" if asset_ok else "✗"
            asset_html = (
                f'<p class="attach {state}"><span class="glyph">{glyph}</span>'
                f"Attach <code>{esc(asset_path)}</code></p>"
            )

        checks = "".join(f"<li>{esc(c)}</li>" for c in channel["checks"])
        prefilled = (
            f'<p class="prefill">Prefilled: <code>title</code>'
            f'{" + <code>url</code>" if link else ""} — '
            f'<span class="muted">{esc(kind_note)}</span></p>'
        )

        posted = channel.get("posted")
        done = " done" if posted else ""
        badge = f'<span class="posted">Posted {esc(posted)}</span>' if posted else ""
        button = (
            f'<a class="open reopen" href="{esc(url)}" target="_blank" rel="noopener">'
            f"Open the composer again ↗</a>"
            if posted else
            f'<a class="open" href="{esc(url)}" target="_blank" rel="noopener">'
            f"Open prefilled submit page ↗</a>"
        )

        rows.append(f"""
      <article class="card{done}" id="{slug}">
        <header>
          <span class="order">{order}</span>
          <h3>r/{esc(channel["sub"])}</h3>
          {badge}
          <span class="kind kind-{kind}">{esc(kind_label)}</span>
        </header>
        {button}
        {prefilled}
        {asset_html}
        <h4>{"What this post needed" if posted else "Set by hand before sending"}</h4>
        <ul class="checks">{checks}</ul>
        {render_block("Title", title, f"{slug}-title")}
        {render_block(body_label, body, f"{slug}-body") if body else ""}
      </article>""")

    board_lines = sections[BOARD["section"]]
    board_blocks = blocks_by_label(board_lines)
    board_checks = "".join(f"<li>{esc(c)}</li>" for c in BOARD["checks"])
    rows.append(f"""
      <article class="card done" id="itch-board">
        <header>
          <span class="order">6</span>
          <h3>itch.io Release Announcements</h3>
          <span class="posted">Posted {BOARD["posted"]}</span>
          <span class="kind kind-text">Forum post</span>
        </header>
        <a class="open reopen" href="{esc(BOARD["url"])}" target="_blank" rel="noopener">
          Open the board again ↗</a>
        <p class="prefill">Prefilled: <span class="muted">nothing — itch has no
          prefill parameters, so both fields are copy buttons.</span></p>
        <h4>What this post needed</h4>
        <ul class="checks">{board_checks}</ul>
        {render_block("Subject", board_blocks.get("Subject", ""), "board-subject")}
        {render_block("Body", board_blocks.get("Body", ""), "board-body")}
      </article>""")

    return PAGE.format(cards="".join(rows), game_url=GAME_URL)


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>finding_numbers — prefilled submit links</title>
<style>
  :root {{
    --ink: #1a1a1a; --bg: #fafafa; --card: #fff; --line: #e2e2e0;
    --muted: #6b6b68; --accent: #7a3b00; --warn: #a3252b; --ok: #1f6b3a;
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0; background: var(--bg); color: var(--ink);
    font: 16px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }}
  .wrap {{ max-width: 52rem; margin: 0 auto; padding: 2rem 1.25rem 6rem; }}
  h1 {{ font-size: 1.55rem; margin: 0 0 .3rem; }}
  .sub {{ color: var(--muted); margin: 0 0 1.25rem; }}
  .sub a {{ color: var(--accent); }}
  .banner {{
    border: 1px solid var(--line); border-left: 3px solid var(--accent);
    background: var(--card); border-radius: 6px; padding: .8rem 1rem;
    margin-bottom: 2rem; font-size: .9rem;
  }}
  .banner p {{ margin: 0 0 .4rem; }}
  .banner p:last-child {{ margin: 0; }}
  .card {{
    background: var(--card); border: 1px solid var(--line); border-radius: 8px;
    padding: 1.1rem 1.25rem; margin-bottom: 1.25rem;
  }}
  .card header {{ display: flex; align-items: center; gap: .6rem; margin-bottom: .8rem; }}
  .card h3 {{ font-size: 1.15rem; margin: 0; }}
  .card.done {{ background: #f5f5f3; border-color: #d8d8d4; }}
  .card.done h3 {{ color: var(--muted); text-decoration: line-through; }}
  .card.done .order {{ background: var(--muted); }}
  .card.done a.open, .card.done pre, .card.done ul.checks {{ opacity: .55; }}
  .card.done a.open:hover, .card.done:hover pre, .card.done:hover ul.checks {{ opacity: 1; }}
  .posted {{
    font-size: .72rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .05em; color: var(--ok); border: 1px solid var(--ok);
    border-radius: 999px; padding: .15rem .6rem; margin-right: auto;
  }}
  .card header .kind {{ margin-left: auto; }}
  .card.done header .kind {{ margin-left: 0; }}
  .order {{
    font-variant-numeric: tabular-nums; font-size: .75rem; font-weight: 700;
    color: var(--card); background: var(--ink); border-radius: 4px; padding: .1rem .4rem;
  }}
  .kind {{
    font-size: .72rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .05em; border: 1px solid var(--line); border-radius: 999px;
    padding: .15rem .6rem; color: var(--muted);
  }}
  a.open {{
    display: inline-block; background: var(--ink); color: var(--card);
    text-decoration: none; border-radius: 6px; padding: .5rem .9rem;
    font-size: .9rem; font-weight: 600;
  }}
  a.open:hover {{ background: var(--accent); }}
  .prefill {{ font-size: .85rem; margin: .6rem 0 .2rem; }}
  .muted {{ color: var(--muted); }}
  .attach {{ font-size: .85rem; margin: .4rem 0; }}
  .attach .glyph {{ margin-right: .35rem; }}
  .attach.present .glyph {{ color: var(--ok); }}
  .attach.missing {{ color: var(--warn); }}
  code {{ font-size: .84em; background: #f1f1ef; padding: .05rem .3rem; border-radius: 3px; }}
  h4 {{
    font-size: .72rem; text-transform: uppercase; letter-spacing: .07em;
    color: var(--muted); margin: .9rem 0 .35rem; font-weight: 700;
  }}
  ul.checks {{ margin: 0; padding-left: 1.1rem; }}
  ul.checks li {{ font-size: .88rem; margin-bottom: .15rem; }}
  .block {{ margin-top: .8rem; }}
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
    white-space: pre-wrap; word-wrap: break-word;
  }}
</style>
</head>
<body>
<div class="wrap">
  <h1>Prefilled submit links</h1>
  <p class="sub">Each button opens a composer with the title filled in. Nothing sends
    until you press post. Game: <a href="{game_url}">{game_url}</a></p>

  <div class="banner">
    <p><strong>Reddit prefills <code>title</code> and <code>url</code>, and nothing
      else.</strong> There is no body parameter, so every self-post body and first
      comment below is a copy button rather than a prefill.</p>
    <p>Flair, NSFW flags and attachments cannot be prefilled either — each card lists
      what to set by hand.</p>
  </div>

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
