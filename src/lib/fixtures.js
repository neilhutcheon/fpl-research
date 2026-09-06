export function fixturesForTeam(fixtures, teamId) {
  return fixtures.filter((fx) => fx.team_h === teamId || fx.team_a === teamId);
}

export function annotateFixture(fixture, teamId) {
  const isHome = fixture.team_h === teamId;
  return {
    ...fixture,
    isHome,
    opponentId: isHome ? fixture.team_a : fixture.team_h,
    difficulty: isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty,
  };
}

export function upcomingFixtures(fixtures, teamId, fromEvent, count = 5) {
  return fixturesForTeam(fixtures, teamId)
    .filter((fx) => fx.event != null && fx.event >= fromEvent && !fx.finished)
    .sort((a, b) => {
      if (a.event !== b.event) return a.event - b.event;
      return String(a.kickoff_time ?? "").localeCompare(String(b.kickoff_time ?? ""));
    })
    .slice(0, count)
    .map((fx) => annotateFixture(fx, teamId));
}

export function fixtureForEvent(fixtures, teamId, eventId) {
  const match = fixturesForTeam(fixtures, teamId).find((fx) => fx.event === eventId);
  return match ? annotateFixture(match, teamId) : null;
}

export function averageFdr(upcoming) {
  if (!upcoming.length) return null;
  const total = upcoming.reduce((sum, fx) => sum + Number(fx.difficulty || 3), 0);
  return total / upcoming.length;
}

export function fixturesByEvent(fixtures, eventId) {
  return fixtures
    .filter((fx) => fx.event === eventId)
    .sort((a, b) => String(a.kickoff_time ?? "").localeCompare(String(b.kickoff_time ?? "")));
}

export function scoreline(fixture) {
  if (fixture.team_h_score == null || fixture.team_a_score == null) return null;
  return `${fixture.team_h_score}–${fixture.team_a_score}`;
}
