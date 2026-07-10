# finding_numbers

TODO: describe finding_numbers

## Quick commands

- Run: `./run.sh [port]` — local no-cache dev server, opens `http://localhost:8000`
- Test: `npm test` — game-logic tests via `node --test`

## Project structure

- `index.html` — entry point; loads `src/main.js` as an ES module
- `src/` — game modules (`audio/`, `core/`, `game/`, `maze/`, `render/`)
- `tests/` — `*.test.mjs` suites run with `node --test`
- `run.sh` — dev server (uses system `python3` only as a static file server)
- `.scaffold.json` — record of how this repo was generated (do not edit by hand)

## Testing

Run `npm test` from repo root. Tests live in `tests/` as `*.test.mjs` (`node --test`). New features need at least one test that fails before the change and passes after.

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
