import { describe, expect, it } from "vitest";
import {
  freeAgentIds,
  gwScore,
  liveStandings,
  matchForEntry,
  opponentLeagueEntry,
  recordString,
  rosterIds,
  starterPoints,
  waiverOrder,
} from "../src/lib/league.js";

const entries = [
  { id: 1, entry_id: 10, entry_name: "Haggis", waiver_pick: 6 },
  { id: 2, entry_id: 20, entry_name: "Grealish", waiver_pick: 1 },
];

const matches = [
  {
    event: 3,
    started: true,
    finished: false,
    league_entry_1: 1,
    league_entry_1_points: 15,
    league_entry_2: 2,
    league_entry_2_points: 25,
  },
];

describe("liveStandings", () => {
  it("awards H2H win points from live scores before the GW is official", () => {
    const table = liveStandings(entries, matches);
    expect(table[0].entry.entry_name).toBe("Grealish");
    expect(table[0].total).toBe(3);
    expect(table[0].won).toBe(1);
    expect(table[1].lost).toBe(1);
    expect(table[1].total).toBe(0);
    expect(recordString(table[0])).toBe("1-0-0");
  });

  it("ignores unstarted fixtures", () => {
    const table = liveStandings(entries, [{ ...matches[0], started: false, finished: false, league_entry_1_points: 0 }]);
    expect(table.every((row) => row.played === 0)).toBe(true);
  });

  it("counts a draw as one point each", () => {
    const table = liveStandings(entries, [{ ...matches[0], league_entry_1_points: 20, league_entry_2_points: 20 }]);
    expect(table.every((row) => row.total === 1 && row.drawn === 1)).toBe(true);
  });
});

describe("match helpers", () => {
  it("finds the opponent and GW score for a league entry", () => {
    const match = matchForEntry(matches, 1, 3);
    expect(gwScore(match, 1)).toBe(15);
    expect(opponentLeagueEntry(match, 1)).toBe(2);
  });

  it("returns null when that team does not play the event", () => {
    expect(matchForEntry(matches, 1, 4)).toBeNull();
  });
});

describe("rosters and waivers", () => {
  const status = [
    { element: 426, owner: 10, status: "o" },
    { element: 367, owner: null, status: "a" },
    { element: 1, owner: 20, status: "o" },
  ];

  it("lists a manager roster and free agents", () => {
    expect(rosterIds(status, 10)).toEqual([426]);
    expect(freeAgentIds(status)).toEqual([367]);
  });

  it("orders waiver priority", () => {
    expect(waiverOrder(entries).map((e) => e.entry_name)).toEqual(["Grealish", "Haggis"]);
  });
});

describe("starterPoints", () => {
  it("sums live points for the starting XI only", () => {
    const picks = [
      { element: 1, position: 1, multiplier: 1 },
      { element: 2, position: 12, multiplier: 1 },
    ];
    const live = { 1: { stats: { total_points: 7 } }, 2: { stats: { total_points: 12 } } };
    expect(starterPoints(picks, live)).toBe(7);
  });
});
