# finding_numbers

A liminal horror maze navigated by ear. A shortwave number station reads digits
through the static; a correct turn adds a number to the broadcast and a wrong one
adds nothing, so the readout is the only compass. Some rooms move their exit before
settling. Browser game, vanilla ES modules, no build step.

Live: <https://kleer001.itch.io/finding-numbers>

## Studio tie

A daughter of [Trace ROM Studio](https://github.com/kleer001/trace_rom_studio) — the
house platform, code conventions and release gates come from there.
`.trace_rom_studio_version` pins which studio version this game has taken.

```sh
python3 ../trace_rom_studio/scripts/check_updates.py .   # directives since the pin
```

Each directive is a **proposal to raise with the user**, never auto-applied.
`--mark-read` advances the pin once they are resolved.

## Quick commands

- Run: `./run.sh [port]` — local no-cache dev server, opens `http://localhost:8000`
- Test: `npm test` — game-logic tests via `node --test`

## Project structure

- `index.html` — entry point; loads `src/main.js` as an ES module
- `src/` — game modules (`audio/`, `core/`, `game/`, `maze/`, `render/`)
- `tests/` — `*.test.js` suites run with `node --test`
- `run.sh` — dev server (uses system `python3` only as a static file server)
- `.scaffold.json` — record of how this repo was generated (do not edit by hand)

## Testing

Run `npm test` from repo root. Tests live in `tests/` as `*.test.js` (`node --test`). New features need at least one test that fails before the change and passes after.

## Code style

- No build step: vanilla ES modules, HTML, CSS.
- Naming: `camelCase` functions/vars, `PascalCase` classes, `UPPER_SNAKE` module constants.
- Imports: ES modules; group third-party before local relative imports.
- Comments: explain *why*, not *what*. Skip them on self-evident code.

## Git

Atomic commits. Conventional Commits: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`.

## Boundaries

- Don't touch `.scaffold.json` by hand.
- Trust internal functions; validate at boundaries (CLI args, file inputs, network responses).
- One path, no fallbacks. Fail loudly. (See `~/.claude/CLAUDE.md` for the full philosophy.)
