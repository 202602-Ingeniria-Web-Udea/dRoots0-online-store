export type AnimalAvatar = {
  id: string;
  label: string;
  face: string;
};

const ANIMAL_AVATARS: AnimalAvatar[] = [
  {
    id: "cat",
    label: "Cat",
    face: ["/\\_/\\", "(o.o)", " >^< "].join("\n"),
  },
  {
    id: "dog",
    label: "Dog",
    face: [" / \\ ", "(o.o)", "(___)"].join("\n"),
  },
  {
    id: "fox",
    label: "Fox",
    face: ["/\\  /\\", "(o.o)", " \\__/ "].join("\n"),
  },
  {
    id: "owl",
    label: "Owl",
    face: ["(o,o)", "(> <)", "(___)"].join("\n"),
  },
  {
    id: "rabbit",
    label: "Rabbit",
    face: ["(\\ /)", "(o.o)", "(___)"].join("\n"),
  },
  {
    id: "panda",
    label: "Panda",
    face: ["(o.o)", "(._.)", "(___)"].join("\n"),
  },
  {
    id: "frog",
    label: "Frog",
    face: ["(o.o)", "(w w)", "(___)"].join("\n"),
  },
  {
    id: "penguin",
    label: "Penguin",
    face: ["(o.o)", "(> <)", "(___)"].join("\n"),
  },
];

const LEGACY_DEFAULT_AVATARS = new Set([
  "",
  "/avatars/admin.svg",
  "/avatars/user.svg",
]);

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

/**
 * Picks a stable animal avatar for a user. The same seed always produces the
 * same animal, so server and client renders agree and the avatar does not
 * change between requests.
 */
export function animalAvatarFor(seed: string): AnimalAvatar {
  const normalized = seed.trim().toLowerCase() || "anonymous";
  const index = hashSeed(normalized) % ANIMAL_AVATARS.length;

  return ANIMAL_AVATARS[index];
}

/** True when the stored value is a legacy silhouette or no image at all. */
export function isLegacyDefaultAvatar(
  image: string | null | undefined,
): boolean {
  if (!image) return true;

  return LEGACY_DEFAULT_AVATARS.has(image.trim());
}

/** Returns the image URL only when the user has a custom avatar. */
export function customAvatarImage(
  image: string | null | undefined,
): string | undefined {
  if (!image) return undefined;

  const normalized = image.trim();
  if (!normalized || LEGACY_DEFAULT_AVATARS.has(normalized)) {
    return undefined;
  }

  return normalized;
}
