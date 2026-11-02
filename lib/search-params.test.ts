import { describe, expect, it } from "vitest";

import { readSearchTerm } from "./search-params";

describe("readSearchTerm", () => {
  it("trims surrounding whitespace", () => {
    expect(readSearchTerm("  coffee  ")).toBe("coffee");
  });

  it("ignores repeated or missing parameters", () => {
    expect(readSearchTerm(["coffee", "mug"])).toBe("");
    expect(readSearchTerm(undefined)).toBe("");
  });

  it("caps very long search terms", () => {
    expect(readSearchTerm("a".repeat(150))).toHaveLength(100);
  });
});
