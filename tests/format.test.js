import { describe, expect, it } from "vitest";
import { fdrClass, formatPrice, parseNum, positionShort } from "../src/lib/format.js";

describe("formatPrice", () => {
  it("converts FPL tenths into millions", () => {
    expect(formatPrice(71)).toBe("£7.1m");
  });

  it("keeps a trailing decimal for round numbers", () => {
    expect(formatPrice(50)).toBe("£5.0m");
  });
});

describe("parseNum", () => {
  it("parses numeric strings from the API", () => {
    expect(parseNum("8.3")).toBe(8.3);
  });

  it("returns 0 for null, blank, and non-numeric values", () => {
    expect(parseNum(null)).toBe(0);
    expect(parseNum("")).toBe(0);
    expect(parseNum("nope")).toBe(0);
  });
});

describe("positionShort", () => {
  it("maps element types to FPL codes", () => {
    expect(positionShort(3)).toBe("MID");
  });

  it("returns a placeholder for unknown types", () => {
    expect(positionShort(99)).toBe("?");
  });
});

describe("fdrClass", () => {
  it("caps easy fixtures at fdr-1", () => {
    expect(fdrClass(0)).toBe("fdr-1");
  });
});
