# Claude working rules for this repo

Read first on any session that touches this repo.

## This is the public game, not the training game

The training game lives in a different project and has real HBGreenhouses trade data (FRAMEPARTS, GASKETS, CUTS, SITES, pane dimensions, gasket lengths). None of that belongs here. Public-safe or it doesn't ship. If a change proposes anything resembling real build specs, stop and ask.

## Working style

- Small verified slices. One scene per PR when possible.
- Content (`src/data/*.json`) and engine code change in separate PRs.
- Run `npm run verify && npm run smoke` before every merge. Both green or the merge doesn't happen.
- Setbacks, not failure screens. Nothing kills the player. Every rejection message teaches the rule it just enforced.
- Say plainly when something is a guess or couldn't be tested.

## Technical rules

- Save state via `localStorage` wrapped in try/catch. The game must play with storage blocked.
- All UI strings go through `t('key.subkey')` reading `src/i18n/en.json`. No English hard-coded in components.
- Stylized 2D illustration, single bible. No photoreal, no cartoon. Phone UI stays vector.
- Brand colors locked in `src/ui/tokens.css`. Reference them, don't duplicate.
- One PR per folder when possible. Avoid mixing engine and content.

## Design doc

The source of truth is `docs/DESIGN.md` v0.2. If a change contradicts the doc, update the doc in the same PR or stop and ask.

## Phase order

Phase 1: vertical slice (character creation → lock → Phone → Jefferson voicemail)
Phase 2: morning triage (Messages, Mail, Weather)
Phase 3: drive and site visit
Phase 4: quote, response, install day
Phase 5: end of day, persistence, Day 2
Phase 6+: content, progression, art bible, native wrappers

Don't skip ahead.
