import { describe, expect, it } from "vitest";

import {
  readSortOrder,
  sortDirection,
  toggleSortOrder,
} from "./sorting";

describe("readSortOrder", () => {
  it("defaults to newest first", () => {
    expect(readSortOrder(undefined)).toBe("newest");
    expect(readSortOrder("newest")).toBe("newest");
    expect(readSortOrder("invalid")).toBe("newest");
    expect(readSortOrder(["oldest"])).toBe("newest");
  });

  it("reads the oldest-first option", () => {
    expect(readSortOrder("oldest")).toBe("oldest");
  });
});

describe("sortDirection", () => {
  it("maps newest to descending and oldest to ascending", () => {
    expect(sortDirection("newest")).toBe("desc");
    expect(sortDirection("oldest")).toBe("asc");
  });
});

describe("toggleSortOrder", () => {
  it("switches between newest and oldest", () => {
    expect(toggleSortOrder("newest")).toBe("oldest");
    expect(toggleSortOrder("oldest")).toBe("newest");
  });
});
