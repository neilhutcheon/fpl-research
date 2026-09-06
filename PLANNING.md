# FPL Research Desk

A local research tool for Fantasy Premier League. It pulls live data from the unofficial FPL API and helps decide who to start and who to trade.

## Goals

- Fetch current-season player, team, fixture, and gameweek data.
- Browse player results **by Premier League team**.
- Browse player results **by matchup** (a specific fixture).
- Surface start/sit and trade signals: form, expected points, fixture difficulty, xG/xA, ownership, and availability.
- Load **Draft league 41653** (FPL 26/27): H2H table, matchups, rosters, waiver order, free agents, draft board.

## Architecture

- **Frontend:** React 19 + Vite (JavaScript).
- **Proxy:** Vite dev server forwards `/api/fpl/*` to `https://fantasy.premierleague.com/api/*` and `/api/draft/*` to `https://draft.premierleague.com/api/*` to avoid browser CORS blocks.
- **Data sources (same endpoints as the Analytics Vidhya article, plus live scores):**
  - `bootstrap-static/` — players, teams, positions, gameweeks
  - `fixtures/` — full fixture list with FDR
  - `event/{id}/live/` — per-player gameweek returns
  - `element-summary/{id}/` — per-player history, upcoming fixtures, past seasons
  - `https://draft.premierleague.com/api/league/{id}/details` — draft league, teams, H2H matches
  - `league/{id}/element-status` — who owns each player / free agents
  - `draft/{id}/choices` — full draft board
  - `entry/{id}/event/{gw}` — that manager’s XI and bench
- **Tests:** Vitest, under `/tests`, mirroring `src/lib`.

## Style

- Dark, data-dense research UI (navy + FPL green).
- ES6 modules, named exports, small files (< 500 lines).
- Relative imports within `src`.
- Pure helpers in `src/lib` for ranking and fixture math so they can be unit-tested without the network.

## Constraints

- The FPL API is unofficial, unpaid, and rate-limited by courtesy. Cache in memory for the session; do not hammer `element-summary` until a player is opened.
- No official branding assets beyond publicly served player photos and club badges.
