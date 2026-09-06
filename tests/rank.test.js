import { describe, expect, it } from "vitest";
import { availabilityMultiplier, differentials, pickResearchXi, startScore, tradeDelta } from "../src/lib/rank.js";

const base = {
  web_name: "Test",
  team: 1,
  element_type: 3,
  status: "a",
  chance_of_playing_next_round: 100,
  ep_next: "6.0",
  form: "5.0",
  minutes: 270,
  expected_goal_involvements: "2.0",
  selected_by_percent: "12.0",
  total_points: 20,
};

describe("startScore", () => {
  it("scores an available in-form player higher than a blank FDR 5", () => {
    const easy = startScore(base, 2);
    const hard = startScore(base, 5);
    expect(easy).toBeGreaterThan(hard);
    expect(easy).toBeGreaterThan(8);
  });

  it("near-zeros an injured or unavailable player", () => {
    const available = startScore(base, 2);
    const injured = startScore({ ...base, status: "i" }, 2);
    expect(injured).toBeLessThan(available * 0.2);
    expect(availabilityMultiplier({ status: "u" })).toBe(0);
    expect(startScore({ ...base, status: "s" }, 2)).toBe(0);
  });
});

describe("tradeDelta", () => {
  it("is positive when the incoming player is the better start", () => {
    const keep = { ...base, ep_next: "3.0", form: "2.0" };
    const buy = { ...base, ep_next: "8.0", form: "9.0" };
    expect(tradeDelta(keep, buy, 4, 2)).toBeGreaterThan(0);
  });
});

describe("pickResearchXi", () => {
  it("fills a 1-4-4-2 from mixed positions", () => {
    const players = [];
    for (let pos = 1; pos <= 4; pos += 1) {
      for (let i = 0; i < 6; i += 1) {
        players.push({
          ...base,
          id: pos * 10 + i,
          element_type: pos,
          team: i + 1,
          ep_next: String(10 - i),
          total_points: 30 - i,
        });
      }
    }
    const difficultyByTeam = Object.fromEntries(players.map((p) => [p.team, 3]));
    const xi = pickResearchXi(players, difficultyByTeam);
    const counts = xi.reduce((acc, p) => {
      acc[p.element_type] = (acc[p.element_type] || 0) + 1;
      return acc;
    }, {});
    expect(xi).toHaveLength(11);
    expect(counts).toEqual({ 1: 1, 2: 4, 3: 4, 4: 2 });
  });

  it("keeps at most three players from one club", () => {
    const players = [];
    for (let i = 0; i < 8; i += 1) {
      players.push({
        ...base,
        id: i + 1,
        element_type: 2,
        team: 14,
        ep_next: String(9 - i),
        total_points: 25 - i,
      });
    }
    for (let i = 0; i < 8; i += 1) {
      players.push({
        ...base,
        id: 20 + i,
        element_type: i < 1 ? 1 : i < 5 ? 3 : 4,
        team: i + 1,
        ep_next: "4.0",
        total_points: 10,
      });
    }
    const xi = pickResearchXi(players, { 14: 2, 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3 });
    expect(xi.filter((p) => p.team === 14).length).toBeLessThanOrEqual(3);
    expect(xi.length).toBeGreaterThanOrEqual(6);
  });
});

describe("differentials", () => {
  it("drops highly owned or unused players", () => {
    const pool = [
      { ...base, id: 1, selected_by_percent: "3.0", form: "6.0", minutes: 180 },
      { ...base, id: 2, selected_by_percent: "40.0", form: "9.0", minutes: 180 },
      { ...base, id: 3, selected_by_percent: "2.0", form: "6.0", minutes: 0 },
    ];
    const result = differentials(pool, { 1: 2 });
    expect(result.map((p) => p.id)).toEqual([1]);
  });
});
