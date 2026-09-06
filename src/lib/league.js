export const DRAFT_LEAGUE_ID = 41653;
export const OUR_ENTRY_ID = 528256;

export function indexEntries(leagueEntries) {
  const byLeagueEntry = {};
  const byEntryId = {};
  for (const entry of leagueEntries) {
    byLeagueEntry[entry.id] = entry;
    byEntryId[entry.entry_id] = entry;
  }
  return { byLeagueEntry, byEntryId };
}

export function matchesForEvent(matches, eventId) {
  return (matches ?? []).filter((match) => match.event === eventId);
}

export function matchForEntry(matches, leagueEntryId, eventId) {
  return (
    (matches ?? []).find(
      (match) =>
        match.event === eventId &&
        (match.league_entry_1 === leagueEntryId || match.league_entry_2 === leagueEntryId),
    ) ?? null
  );
}

export function gwScore(match, leagueEntryId) {
  if (!match) return null;
  return match.league_entry_1 === leagueEntryId
    ? match.league_entry_1_points
    : match.league_entry_2_points;
}

export function opponentLeagueEntry(match, leagueEntryId) {
  if (!match) return null;
  return match.league_entry_1 === leagueEntryId ? match.league_entry_2 : match.league_entry_1;
}

/**
 * Projected H2H table from finished + in-progress matches.
 * Official standings stay 0-0 until the gameweek is processed.
 */
export function liveStandings(entries, matches, { win = 3, draw = 1, lose = 0 } = {}) {
  const table = {};
  for (const entry of entries) {
    table[entry.id] = {
      leagueEntryId: entry.id,
      entry,
      won: 0,
      drawn: 0,
      lost: 0,
      played: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      total: 0,
    };
  }
  for (const match of matches ?? []) {
    if (!match.started && !match.finished) continue;
    const home = table[match.league_entry_1];
    const away = table[match.league_entry_2];
    if (!home || !away) continue;
    const hp = Number(match.league_entry_1_points || 0);
    const ap = Number(match.league_entry_2_points || 0);
    home.played += 1;
    away.played += 1;
    home.pointsFor += hp;
    away.pointsFor += ap;
    home.pointsAgainst += ap;
    away.pointsAgainst += hp;
    if (hp > ap) {
      home.won += 1;
      home.total += win;
      away.lost += 1;
      away.total += lose;
    } else if (ap > hp) {
      away.won += 1;
      away.total += win;
      home.lost += 1;
      home.total += lose;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.total += draw;
      away.total += draw;
    }
  }
  return Object.values(table).sort(
    (a, b) =>
      b.total - a.total ||
      b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst) ||
      b.pointsFor - a.pointsFor,
  );
}

export function recordString(row) {
  return `${row.won}-${row.drawn}-${row.lost}`;
}

export function waiverOrder(entries) {
  return [...entries].sort((a, b) => a.waiver_pick - b.waiver_pick);
}

export function rosterIds(elementStatus, entryId) {
  return (elementStatus ?? []).filter((row) => row.owner === entryId).map((row) => row.element);
}

export function freeAgentIds(elementStatus) {
  return (elementStatus ?? [])
    .filter((row) => row.owner == null)
    .map((row) => row.element);
}

export function ownerByElement(elementStatus) {
  const map = {};
  for (const row of elementStatus ?? []) {
    if (row.owner != null) map[row.element] = row.owner;
  }
  return map;
}

export function starterPoints(picks, liveByPlayerId) {
  let total = 0;
  for (const pick of picks ?? []) {
    if (pick.position > 11) continue;
    const pts = liveByPlayerId[pick.element]?.stats?.total_points ?? 0;
    total += pts * (pick.multiplier || 1);
  }
  return total;
}

export async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      out[current] = await fn(items[current], current);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) || 1 }, worker);
  await Promise.all(workers);
  return out;
}
