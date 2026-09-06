import { parseNum, positionShort } from "./format.js";
import { fixtureForEvent, upcomingFixtures } from "./fixtures.js";
import { startScore } from "./rank.js";

export function enrichPlayers(bootstrap, fixtures, researchEventId) {
  const teamsById = Object.fromEntries(bootstrap.teams.map((t) => [t.id, t]));
  const typesById = Object.fromEntries(bootstrap.element_types.map((t) => [t.id, t]));

  return bootstrap.elements.map((player) => {
    const team = teamsById[player.team];
    const nextFx = fixtureForEvent(fixtures, player.team, researchEventId);
    const upcoming = upcomingFixtures(fixtures, player.team, researchEventId, 5);
    const difficulty = nextFx?.difficulty ?? 3;
    return {
      ...player,
      teamName: team?.name ?? "",
      teamShort: team?.short_name ?? "",
      teamCode: team?.code,
      position: positionShort(player.element_type),
      positionName: typesById[player.element_type]?.singular_name ?? "",
      price: player.now_cost / 10,
      formNum: parseNum(player.form),
      epNext: parseNum(player.ep_next),
      own: parseNum(player.selected_by_percent),
      xg: parseNum(player.expected_goals),
      xa: parseNum(player.expected_assists),
      xgi: parseNum(player.expected_goal_involvements),
      nextFixture: nextFx,
      upcoming,
      startScore: startScore(player, difficulty),
    };
  });
}

export function difficultyByTeam(players) {
  const map = {};
  for (const player of players) {
    if (map[player.team] == null && player.nextFixture) {
      map[player.team] = player.nextFixture.difficulty;
    }
  }
  return map;
}

export function sortPlayers(players, key, dir = "desc") {
  const factor = dir === "asc" ? 1 : -1;
  return [...players].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === "string" || typeof bv === "string") {
      return factor * String(av ?? "").localeCompare(String(bv ?? ""));
    }
    return factor * (parseNum(av) - parseNum(bv));
  });
}
