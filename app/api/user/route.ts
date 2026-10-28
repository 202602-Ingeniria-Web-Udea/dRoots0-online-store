import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/auth/api";

const safeUserSelect = {
  id: true,
  name: true,
  lastName: true,
  email: true,
  enabled: true,
  deleted: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  lastName: z.string().trim().max(100).optional(),
  email: z.email(),
  role: z.enum(["ADMIN", "USER"]),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireApiAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const userId = request.nextUrl.searchParams.get("id");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: safeUserSelect,
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireApiAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body?.user ?? body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
  }

  try {
    // Legacy prototype default; the Users management feature will replace this
    // flow. The value is hashed and never stored in plaintext.
    const passwordHash = await hash("123", 12);

    const created = await prisma.user.create({
      data: {
        name: parsed.data.name,
        lastName: parsed.data.lastName || null,
        email: parsed.data.email,
        role: parsed.data.role,
        password: passwordHash,
      },
      select: safeUserSelect,
    });

    return NextResponse.json({ user: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating user", error);
    return NextResponse.json(
      { error: "Unable to create user. The email may already be in use." },
      { status: 400 }
    );
  }
}
