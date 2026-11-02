import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: mocks.findMany,
      count: mocks.count,
    },
  },
}));

import { getUsers } from "./queries";

describe("getUsers", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("searches by name or email when a term is provided", async () => {
    mocks.count.mockResolvedValue(0);
    mocks.findMany.mockResolvedValue([]);

    await getUsers({ search: "ada" });

    const expectedWhere = {
      OR: [
        { name: { contains: "ada", mode: "insensitive" } },
        { email: { contains: "ada", mode: "insensitive" } },
      ],
    };

    expect(mocks.count).toHaveBeenCalledWith({ where: expectedWhere });
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expectedWhere,
        select: expect.objectContaining({ name: true, email: true }),
      }),
    );
  });

  it("lists every user when the search is blank", async () => {
    mocks.count.mockResolvedValue(0);
    mocks.findMany.mockResolvedValue([]);

    await getUsers({ search: "   " });

    expect(mocks.count).toHaveBeenCalledWith({ where: undefined });
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it("requests only the current page of ten rows", async () => {
    mocks.count.mockResolvedValue(25);
    mocks.findMany.mockResolvedValue([]);

    const result = await getUsers({ page: 3 });

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
    expect(result.pagination).toEqual({
      page: 3,
      pageSize: 10,
      total: 25,
      totalPages: 3,
    });
  });

  it("clamps an out-of-range page to the last page", async () => {
    mocks.count.mockResolvedValue(13);
    mocks.findMany.mockResolvedValue([]);

    const result = await getUsers({ page: 99 });

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 13,
      totalPages: 2,
    });
  });
});
