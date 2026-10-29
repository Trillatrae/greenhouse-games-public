# Greenhouse Games — public

A day-in-the-life game about running HBGreenhouses. Phone-first fiction, illustrated scene cards, stylized 2D. Setbacks not failures. See `docs/DESIGN.md` for the full design doc (v0.2).

## Working on it

```bash
npm install
npm run dev
```

Open the URL Vite prints. Edit, save, refresh.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run verify` | Content validator (data/*.json integrity) |
| `npm run smoke` | Headless playthrough test |

Run `npm run verify && npm run smoke` before every merge. Both green or the merge doesn't happen. That's the rule.

## Layout

```
src/
  engine/     game loop, time, save/load — rarely touched
  data/       leads.json, events.json, clients.json — content
  phone/      home, lock, status bar
  apps/       phone/, messages/, mail/, weather/, maps/,
              calendar/, camera/, reviews/, bank/
  scenes/     drive/, site-visit/, install/, end-of-day/
  ui/         buttons, callouts, cards — shared primitives
  state/      player, calendar, reviews, upgrades
  i18n/       t() + locales/en.json
  art/        references the illustration bundle
tools/
  verify.mjs  content validator (runs on commit)
  smoke.mjs   headless playthrough test
assets/       images, audio, fonts
locales/      en.json (es.json etc. later)
```

Rule: one PR touches one folder when possible. Content (data/*.json) PRs run verify.mjs on commit.

## Working rules

Lifted from the design doc. Enforced in code review.

1. **Save state is on.** localStorage try/catch, game plays with storage blocked.
2. **Setbacks, not failure screens.** Nothing kills the player.
3. **Every rejection teaches the rule.**
4. **Verify every scene has an exit.** No softlocks.
5. **Public-safe or it doesn't ship.** No trade specifics from the training game.
6. **Stylized 2D illustration, one bible.** No photoreal mixing.
7. **OS voice is one voice.** House style enforced across every callout.
8. **Localized strings from day 1.** No English hard-coded.
9. **One PR per folder.** Content and engine never mixed.
10. **verify + smoke green before merge.** No exceptions.
11. **Say plainly what's a guess.** Mark it in docs and code.

## Brand

Colors: Dark `#0a0a0a` · HB Green `#22863a` · Accent Green `#4ade80` · Light BG `#f5f5f0` · White · Grey `#666666`
Fonts: Inter (UI/body) · Permanent Marker (logo/display)
See `src/ui/tokens.css` for the exact values.

## Status

Phase 1 — vertical slice. Lock screen → home → Phone → Jefferson voicemail → "Unlocked by listening." No save state yet; just a playable click-through.

Owner: HBGreenhouses LLC.
