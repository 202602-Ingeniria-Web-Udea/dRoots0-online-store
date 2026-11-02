import { describe, expect, it } from "vitest";

import { createMasterSchema, createMovementSchema } from "./schemas";

describe("createMovementSchema", () => {
  const base = { masterId: "cmabc123", type: "INCOMING" as const };

  it.each(["1", "0.5", "10.250", "99999999999.999"])("accepts quantity %s", (quantity) => {
    expect(createMovementSchema.safeParse({ ...base, quantity }).success).toBe(true);
  });

  it.each(["0", "0.0", "-1", "abc", "", "1e3", "Infinity", "NaN", "1,5", "1.2345", "123456789012"])(
    "rejects quantity %p",
    (quantity) => {
      expect(createMovementSchema.safeParse({ ...base, quantity }).success).toBe(false);
    },
  );

  it("rejects unknown movement types and empty masters", () => {
    expect(createMovementSchema.safeParse({ ...base, type: "OTHER", quantity: "1" }).success).toBe(false);
    expect(createMovementSchema.safeParse({ ...base, masterId: " ", quantity: "1" }).success).toBe(false);
  });
});

describe("createMasterSchema", () => {
  it("accepts a valid master", () => {
    expect(createMasterSchema.safeParse({ name: "Widget", initialBalance: "0" }).success).toBe(true);
  });

  it("rejects short names and invalid balances", () => {
    expect(createMasterSchema.safeParse({ name: "a", initialBalance: "0" }).success).toBe(false);
    expect(createMasterSchema.safeParse({ name: "Widget", initialBalance: "-1" }).success).toBe(false);
    expect(createMasterSchema.safeParse({ name: "Widget", initialBalance: "abc" }).success).toBe(false);
  });

  it("trims the name", () => {
    const parsed = createMasterSchema.parse({ name: "  Widget  ", initialBalance: "5" });
    expect(parsed.name).toBe("Widget");
  });
});