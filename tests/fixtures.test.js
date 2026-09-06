import { describe, expect, it } from "vitest";
import {
  averageFdr,
  fixtureForEvent,
  fixturesByEvent,
  scoreline,
  upcomingFixtures,
} from "../src/lib/fixtures.js";

const fixtures = [
  { id: 1, event: 3, team_h: 14, team_a: 12, team_h_difficulty: 2, team_a_difficulty: 4, finished: true, kickoff_time: "2026-09-04T19:00:00Z", team_h_score: 2, team_a_score: 0 },
  { id: 2, event: 4, team_h: 14, team_a: 10, team_h_difficulty: 2, team_a_difficulty: 4, finished: false, kickoff_time: "2026-09-12T14:00:00Z", team_h_score: null, team_a_score: null },
  { id: 3, event: 5, team_h: 6, team_a: 14, team_h_difficulty: 3, team_a_difficulty: 4, finished: false, kickoff_time: "2026-09-19T14:00:00Z", team_h_score: null, team_a_score: null },
  { id: 4, event: 4, team_h: 1, team_a: 2, team_h_difficulty: 2, team_a_difficulty: 4, finished: false, kickoff_time: "2026-09-12T11:30:00Z", team_h_score: null, team_a_score: null },
];

describe("upcomingFixtures", () => {
  it("returns the next unfinished fixtures for a team with home/away and FDR", () => {
    const next = upcomingFixtures(fixtures, 14, 4, 5);
    expect(next).toHaveLength(2);
    expect(next[0]).toMatchObject({ id: 2, isHome: true, opponentId: 10, difficulty: 2 });
    expect(next[1]).toMatchObject({ id: 3, isHome: false, opponentId: 6, difficulty: 4 });
  });

  it("returns an empty list when the team has no remaining fixtures", () => {
    expect(upcomingFixtures(fixtures, 99, 4, 5)).toEqual([]);
  });
});

describe("fixtureForEvent", () => {
  it("annotates the matching gameweek fixture", () => {
    expect(fixtureForEvent(fixtures, 14, 4).opponentId).toBe(10);
  });

  it("returns null when that team does not play the event", () => {
    expect(fixtureForEvent(fixtures, 14, 99)).toBeNull();
  });
});

describe("averageFdr", () => {
  it("averages difficulties", () => {
    expect(averageFdr([{ difficulty: 2 }, { difficulty: 4 }])).toBe(3);
  });

  it("returns null for an empty run", () => {
    expect(averageFdr([])).toBeNull();
  });
});

describe("fixturesByEvent and scoreline", () => {
  it("orders a gameweek by kickoff", () => {
    const gw4 = fixturesByEvent(fixtures, 4);
    expect(gw4.map((fx) => fx.id)).toEqual([4, 2]);
  });

  it("formats a finished score and hides an upcoming one", () => {
    expect(scoreline(fixtures[0])).toBe("2–0");
    expect(scoreline(fixtures[1])).toBeNull();
  });
});
