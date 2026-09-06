# FPL Research Desk

A local webpage for researching Fantasy Premier League starts, sitters, and trades. It uses the same public FPL API described in [Getting started with Fantasy Premier League data](https://medium.com/analytics-vidhya/getting-started-with-fantasy-premier-league-data-56d3b9be8c32).

## What you can do

- **Our draft** — H2H draft league 41653: live table, matchups, rosters, waiver order, free agents, draft board.
- **This week** — upcoming fixtures, a research XI, differentials, and injury flags.
- **By team** — every squad with form, xG/xA, expected points, and the next five fixture difficulties.
- **By matchup** — pick a gameweek fixture and compare both teams’ player returns (live GW stats when available).
- **Trades** — compare two or three players side by side.
- Click any player for gameweek history, upcoming FDR, and previous seasons.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite proxy forwards `/api/fpl` to `https://fantasy.premierleague.com/api` and `/api/draft` to `https://draft.premierleague.com/api` so the browser is not blocked by CORS.

## Tests

```bash
npm test
```

## Data notes

The FPL API is unofficial and free for personal use. Player photos and club badges are loaded from `resources.premierleague.com`. Rankings are research helpers, not official expected-points models.
