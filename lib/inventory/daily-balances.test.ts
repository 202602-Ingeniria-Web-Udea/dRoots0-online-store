import { describe, expect, it } from "vitest";

import { buildDailyBalances, computeCurrentBalance, toDayKey } from "./balance";

// Explicit -05:00 offsets = America/Bogota wall-clock time.
const at = (iso: string) => new Date(iso);

describe("buildDailyBalances", () => {
  it("returns an empty series when there are no movements", () => {
    expect(buildDailyBalances("100", [])).toEqual([]);
  });

  it("builds a multi-day series and fills the days without movements", () => {
    const series = buildDailyBalances("100", [
      { type: "INCOMING", quantity: "50", occurredAt: at("2026-10-20T10:00:00-05:00") },
      { type: "OUTGOING", quantity: "30", occurredAt: at("2026-10-22T09:00:00-05:00") },
    ]);
    expect(series).toEqual([
      { date: "2026-10-20", balance: "150" },
      { date: "2026-10-21", balance: "150" },
      { date: "2026-10-22", balance: "120" },
    ]);
  });

  it("applies the mixed movements of one day chronologically", () => {
    const series = buildDailyBalances("10", [
      { type: "OUTGOING", quantity: "4", occurredAt: at("2026-10-20T15:00:00-05:00") },
      { type: "INCOMING", quantity: "5", occurredAt: at("2026-10-20T08:00:00-05:00") },
    ]);
    expect(series).toEqual([{ date: "2026-10-20", balance: "11" }]);
  });

  it("groups by the Bogota calendar day, not by UTC", () => {
    // 02:00Z on Oct 21 is still 21:00 on Oct 20 in Bogota.
    expect(toDayKey(at("2026-10-21T02:00:00Z"))).toBe("2026-10-20");
    const series = buildDailyBalances("0", [
      { type: "INCOMING", quantity: "1", occurredAt: at("2026-10-21T02:00:00Z") },
    ]);
    expect(series[0].date).toBe("2026-10-20");
  });

  it("ends on the same balance as computeCurrentBalance", () => {
    const movements = [
      { type: "INCOMING" as const, quantity: "0.1", occurredAt: at("2026-10-20T10:00:00-05:00") },
      { type: "INCOMING" as const, quantity: "0.2", occurredAt: at("2026-10-21T10:00:00-05:00") },
      { type: "OUTGOING" as const, quantity: "0.05", occurredAt: at("2026-10-23T10:00:00-05:00") },
    ];
    const series = buildDailyBalances("5", movements);
    expect(series[series.length - 1].balance).toBe(
      computeCurrentBalance("5", movements).toFixed(),
    );
    expect(series[series.length - 1].balance).toBe("5.25");
  });

  it("extends the series up to the `until` day repeating the last balance", () => {
    const series = buildDailyBalances(
      "10",
      [{ type: "INCOMING", quantity: "5", occurredAt: at("2026-10-20T10:00:00-05:00") }],
      { until: at("2026-10-22T20:00:00-05:00") },
    );
    expect(series.map((day) => day.date)).toEqual(["2026-10-20", "2026-10-21", "2026-10-22"]);
    expect(series.map((day) => day.balance)).toEqual(["15", "15", "15"]);
  });

  it("ignores an `until` earlier than the last movement", () => {
    const series = buildDailyBalances(
      "10",
      [{ type: "INCOMING", quantity: "5", occurredAt: at("2026-10-20T10:00:00-05:00") }],
      { until: at("2026-10-01T10:00:00-05:00") },
    );
    expect(series).toEqual([{ date: "2026-10-20", balance: "15" }]);
  });

  it("does not mutate the input array", () => {
    const movements = [
      { type: "OUTGOING" as const, quantity: "1", occurredAt: at("2026-10-21T10:00:00-05:00") },
      { type: "INCOMING" as const, quantity: "9", occurredAt: at("2026-10-20T10:00:00-05:00") },
    ];
    const copy = [...movements];
    buildDailyBalances("0", movements);
    expect(movements).toEqual(copy);
  });

  it("rejects invalid dates", () => {
    expect(() =>
      buildDailyBalances("0", [
        { type: "INCOMING", quantity: "1", occurredAt: new Date("not a date") },
      ]),
    ).toThrow(RangeError);
  });
});