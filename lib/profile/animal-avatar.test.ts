import { describe, expect, it } from "vitest";

import {
  animalAvatarFor,
  customAvatarImage,
  isLegacyDefaultAvatar,
} from "./animal-avatar";

describe("animalAvatarFor", () => {
  it("is deterministic for the same seed", () => {
    expect(animalAvatarFor("admin@example.com")).toEqual(
      animalAvatarFor("admin@example.com"),
    );
  });

  it("normalizes case and surrounding whitespace", () => {
    expect(animalAvatarFor("  ADMIN@example.com  ")).toEqual(
      animalAvatarFor("admin@example.com"),
    );
  });

  it("returns a valid animal face", () => {
    const avatar = animalAvatarFor("user@example.com");

    expect(avatar.label.length).toBeGreaterThan(0);
    expect(avatar.face).toMatch(/^[\x20-\x7E\n]+$/);
    expect(avatar.face.split("\n")).toHaveLength(3);
  });

  it("varies across different seeds", () => {
    const avatars = new Set(
      [
        "admin@example.com",
        "user@example.com",
        "new@example.com",
        "someone@example.com",
        "another@example.com",
      ].map((seed) => animalAvatarFor(seed).id),
    );

    expect(avatars.size).toBeGreaterThan(1);
  });
});

describe("isLegacyDefaultAvatar", () => {
  it("treats missing images and legacy silhouettes as defaults", () => {
    expect(isLegacyDefaultAvatar(null)).toBe(true);
    expect(isLegacyDefaultAvatar(undefined)).toBe(true);
    expect(isLegacyDefaultAvatar("")).toBe(true);
    expect(isLegacyDefaultAvatar("/avatars/admin.svg")).toBe(true);
    expect(isLegacyDefaultAvatar("/avatars/user.svg")).toBe(true);
  });

  it("does not classify custom images as defaults", () => {
    expect(isLegacyDefaultAvatar("https://example.com/me.png")).toBe(false);
    expect(isLegacyDefaultAvatar("/avatars/animals/fox.svg")).toBe(false);
  });
});

describe("customAvatarImage", () => {
  it("returns undefined for defaults", () => {
    expect(customAvatarImage(null)).toBeUndefined();
    expect(customAvatarImage("/avatars/user.svg")).toBeUndefined();
  });

  it("returns trimmed custom URLs", () => {
    expect(customAvatarImage("  https://example.com/me.png  ")).toBe(
      "https://example.com/me.png",
    );
  });
});
