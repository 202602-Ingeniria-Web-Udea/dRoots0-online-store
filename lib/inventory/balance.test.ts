import { describe, expect, it } from "vitest";

import { computeCurrentBalance } from "./balance";

describe("computeCurrentBalance", () => {
  it("returns the initial balance when there are no movements", () => {
    expect(computeCurrentBalance("100", []).toFixed()).toBe("100");
  });

  it("adds incoming movements", () => {
    const result = computeCurrentBalance("10", [
      { type: "INCOMING", quantity: "5" },
      { type: "INCOMING", quantity: "2.5" },
    ]);
    expect(result.toFixed()).toBe("17.5");
  });

  it("subtracts outgoing movements", () => {
    const result = computeCurrentBalance("10", [
      { type: "OUTGOING", quantity: "3" },
      { type: "OUTGOING", quantity: "2" },
    ]);
    expect(result.toFixed()).toBe("5");
  });

  it("handles mixed movements", () => {
    const result = computeCurrentBalance("50", [
      { type: "INCOMING", quantity: "20" },
      { type: "OUTGOING", quantity: "15" },
      { type: "INCOMING", quantity: "5" },
    ]);
    expect(result.toFixed()).toBe("60");
  });

  it("works with a zero initial balance", () => {
    const result = computeCurrentBalance("0", [
      { type: "INCOMING", quantity: "8" },
      { type: "OUTGOING", quantity: "3" },
    ]);
    expect(result.toFixed()).toBe("5");
  });

  it("does not drift with floating point (0.1 + 0.2)", () => {
    const result = computeCurrentBalance("0", [
      { type: "INCOMING", quantity: "0.1" },
      { type: "INCOMING", quantity: "0.2" },
    ]);
    expect(result.toFixed()).toBe("0.3");
  });

  it("accepts Decimal-like objects such as Prisma.Decimal", () => {
    const decimalLike = { toString: () => "12.345" };
    const result = computeCurrentBalance(decimalLike, [
      { type: "OUTGOING", quantity: decimalLike },
    ]);
    expect(result.toFixed()).toBe("0");
  });

  it("never counts the initial balance twice", () => {
    const result = computeCurrentBalance("100", [{ type: "INCOMING", quantity: "0" }]);
    expect(result.toFixed()).toBe("100");
  });

  it("rejects invalid data defensively", () => {
    expect(() => computeCurrentBalance("abc", [])).toThrow(RangeError);
    expect(() => computeCurrentBalance("", [])).toThrow(RangeError);
    expect(() =>
      computeCurrentBalance("1", [{ type: "INCOMING", quantity: "-1" }]),
    ).toThrow(RangeError);
    expect(() =>
      computeCurrentBalance("1", [{ type: "INCOMING", quantity: Number.NaN }]),
    ).toThrow(RangeError);
    expect(() =>
      computeCurrentBalance("1", [{ type: "INCOMING", quantity: Number.POSITIVE_INFINITY }]),
    ).toThrow(RangeError);
    expect(() =>
      computeCurrentBalance("1", [{ type: "OTHER" as never, quantity: "1" }]),
    ).toThrow(RangeError);
  });
});