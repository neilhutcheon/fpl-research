const BASE = "/api/draft";

async function getJson(path) {
  const response = await fetch(`${BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Draft request failed (${response.status}): ${path}`);
  }
  return response.json();
}

export function fetchDraftDetails(leagueId) {
  return getJson(`/league/${leagueId}/details`);
}

export function fetchDraftElementStatus(leagueId) {
  return getJson(`/league/${leagueId}/element-status`);
}

export function fetchDraftChoices(leagueId) {
  return getJson(`/draft/${leagueId}/choices`);
}

export function fetchDraftGame() {
  return getJson("/game");
}

export function fetchDraftPicks(entryId, eventId) {
  return getJson(`/entry/${entryId}/event/${eventId}`);
}

export function fetchDraftHistory(entryId) {
  return getJson(`/entry/${entryId}/history`);
}
