import { describe, expect, it } from "vitest";

import {
  buildPagination,
  getVisiblePages,
  PAGE_SIZE,
  readPage,
} from "./pagination";

describe("readPage", () => {
  it("reads positive integer page parameters", () => {
    expect(readPage("3")).toBe(3);
    expect(readPage("10")).toBe(10);
  });

  it("falls back to page 1 for invalid values", () => {
    expect(readPage(undefined)).toBe(1);
    expect(readPage(["2", "3"])).toBe(1);
    expect(readPage("0")).toBe(1);
    expect(readPage("-1")).toBe(1);
    expect(readPage("2abc")).toBe(1);
    expect(readPage("1.5")).toBe(1);
  });
});

describe("buildPagination", () => {
  it("uses ten rows per page by default", () => {
    expect(PAGE_SIZE).toBe(10);
    expect(buildPagination(25, 1)).toEqual({
      page: 1,
      pageSize: 10,
      total: 25,
      totalPages: 3,
    });
  });

  it("clamps pages above the last page", () => {
    expect(buildPagination(12, 99)).toEqual({
      page: 2,
      pageSize: 10,
      total: 12,
      totalPages: 2,
    });
  });

  it("clamps pages below the first page", () => {
    expect(buildPagination(12, 0).page).toBe(1);
  });

  it("returns a single empty page when there are no rows", () => {
    expect(buildPagination(0, 5)).toEqual({
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 1,
    });
  });
});

describe("getVisiblePages", () => {
  it("lists every page when there are at most seven", () => {
    expect(getVisiblePages(1, 1)).toEqual([1]);
    expect(getVisiblePages(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("adds ellipses around the current page for long ranges", () => {
    expect(getVisiblePages(5, 10)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ]);
    expect(getVisiblePages(1, 10)).toEqual([1, 2, "ellipsis", 10]);
    expect(getVisiblePages(10, 10)).toEqual([1, "ellipsis", 9, 10]);
  });
});
