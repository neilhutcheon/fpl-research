import { parseNum } from "./format.js";

export function availabilityMultiplier(player) {
  const status = player.status;
  if (status === "u" || status === "n" || status === "s") return 0;
  if (status === "i") return 0.15;
  const chance = player.chance_of_playing_next_round;
  if (chance == null) return status === "d" ? 0.6 : 1;
  return chance / 100;
}

/**
 * Blend FPL expected points, recent form, fixture ease, and minutes.
 * Higher is better for start/sit research.
 */
export function startScore(player, nextFixtureDifficulty = 3) {
  const ep = parseNum(player.ep_next);
  const form = parseNum(player.form);
  const fdrBoost = (5 - Number(nextFixtureDifficulty || 3)) * 0.45;
  const minutesBoost = player.minutes > 0 ? Math.min(player.minutes, 270) / 270 : 0;
  const xgi = parseNum(player.expected_goal_involvements);
  const raw = ep * 1.25 + form * 0.7 + fdrBoost + minutesBoost + xgi * 0.15;
  return raw * availabilityMultiplier(player);
}

export function tradeDelta(keepPlayer, buyPlayer, keepDiff = 3, buyDiff = 3) {
  return startScore(buyPlayer, buyDiff) - startScore(keepPlayer, keepDiff);
}

export function pickResearchXi(players, difficultyByTeam) {
  const ranked = [...players].sort(
    (a, b) =>
      startScore(b, difficultyByTeam[b.team] ?? 3) -
      startScore(a, difficultyByTeam[a.team] ?? 3),
  );
  const xi = [];
  const quotas = { 1: 1, 2: 4, 3: 4, 4: 2 };
  const used = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const teamCount = {};
  for (const player of ranked) {
    const pos = player.element_type;
    const fromClub = teamCount[player.team] || 0;
    if (used[pos] < quotas[pos] && fromClub < 3) {
      xi.push(player);
      used[pos] += 1;
      teamCount[player.team] = fromClub + 1;
    }
    if (xi.length === 11) break;
  }
  return xi.sort((a, b) => a.element_type - b.element_type || b.total_points - a.total_points);
}

export function differentials(players, difficultyByTeam, { maxOwn = 8, minForm = 4, limit = 8 } = {}) {
  return [...players]
    .filter(
      (p) =>
        availabilityMultiplier(p) >= 0.75 &&
        parseNum(p.selected_by_percent) <= maxOwn &&
        parseNum(p.form) >= minForm &&
        p.minutes >= 90,
    )
    .sort(
      (a, b) =>
        startScore(b, difficultyByTeam[b.team] ?? 3) -
        startScore(a, difficultyByTeam[a.team] ?? 3),
    )
    .slice(0, limit);
}
