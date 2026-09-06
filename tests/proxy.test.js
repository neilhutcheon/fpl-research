import { describe, expect, it } from "vitest";
import { resolveProxy } from "../src/lib/proxy.js";

describe("resolveProxy", () => {
  it("rewrites FPL bootstrap onto the official API host", () => {
    expect(resolveProxy("/api/fpl/bootstrap-static/")).toEqual({
      origin: "https://fantasy.premierleague.com",
      pathname: "/api/bootstrap-static/",
    });
  });

  it("rewrites draft league details", () => {
    expect(resolveProxy("/api/draft/league/41653/details")).toEqual({
      origin: "https://draft.premierleague.com",
      pathname: "/api/league/41653/details",
    });
  });

  it("returns null for app routes that should be served statically", () => {
    expect(resolveProxy("/")).toBeNull();
    expect(resolveProxy("/assets/index.js")).toBeNull();
  });
});
