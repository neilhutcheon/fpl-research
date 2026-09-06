const BASE = "/api/fpl";

async function getJson(path) {
  const response = await fetch(`${BASE}${path}`);
  if (!response.ok) {
    throw new Error(`FPL request failed (${response.status}): ${path}`);
  }
  return response.json();
}

export function fetchBootstrap() {
  return getJson("/bootstrap-static/");
}

export function fetchFixtures() {
  return getJson("/fixtures/");
}

export function fetchEventLive(eventId) {
  return getJson(`/event/${eventId}/live/`);
}

export function fetchPlayerSummary(playerId) {
  return getJson(`/element-summary/${playerId}/`);
}

export function playerPhotoUrl(player) {
  if (!player?.code) return "";
  return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.code}.png`;
}

export function teamBadgeUrl(team) {
  if (!team?.code) return "";
  return `https://resources.premierleague.com/premierleague/badges/70/t${team.code}.png`;
}
