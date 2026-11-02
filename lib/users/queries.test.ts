import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: mocks.findMany,
    },
  },
}));

import { getUsers } from "./queries";

describe("getUsers", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("searches by name or email when a term is provided", async () => {
    mocks.findMany.mockResolvedValue([]);

    await getUsers("ada");

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { name: { contains: "ada", mode: "insensitive" } },
            { email: { contains: "ada", mode: "insensitive" } },
          ],
        },
        select: expect.objectContaining({ name: true, email: true }),
      }),
    );
  });

  it("lists every user when the search is blank", async () => {
    mocks.findMany.mockResolvedValue([]);

    await getUsers("   ");

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });
});
