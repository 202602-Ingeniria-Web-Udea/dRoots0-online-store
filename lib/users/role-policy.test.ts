import { describe, expect, it } from "vitest";

import { validateRoleChange } from "./role-policy";

describe("validateRoleChange", () => {
  it("rejects changing your own role", () => {
    expect(validateRoleChange({ actorId: "user-1", targetId: "user-1" })).toBe(
      "You cannot change your own role."
    );
  });

  it("allows changing another user's role", () => {
    expect(validateRoleChange({ actorId: "admin-1", targetId: "user-2" })).toBeNull();
  });
});
