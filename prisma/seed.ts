import "dotenv/config";
import { hash } from "bcryptjs";

import { prisma } from "../lib/prisma";

type SeedAccount = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
};

// Defaults are for local development only. Override them with the SEED_*
// variables and never reuse these credentials for a public deployment.
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin1234!";
const userEmail = process.env.SEED_USER_EMAIL ?? "user@example.com";
const userPassword = process.env.SEED_USER_PASSWORD ?? "User1234!";

const accounts: SeedAccount[] = [
  {
    name: "Administrator",
    email: adminEmail,
    password: adminPassword,
    role: "ADMIN",
  },
  {
    name: "Test User",
    email: userEmail,
    password: userPassword,
    role: "USER",
  },
];

async function upsertAccount(account: SeedAccount) {
  const passwordHash = await hash(account.password, 12);
  const data = {
    name: account.name,
    password: passwordHash,
    role: account.role,
    enabled: true,
    deleted: false,
  };

  const user = await prisma.user.upsert({
    where: { email: account.email },
    update: data,
    create: { email: account.email, ...data },
  });

  const image =
    account.role === "ADMIN" ? "/avatars/admin.svg" : "/avatars/user.svg";

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: { image },
    create: {
      userId: user.id,
      image,
      address: "",
      phone: "",
    },
  });
}

async function main() {
  for (const account of accounts) {
    await upsertAccount(account);
  }

  console.log("Seeded test accounts:");
  for (const account of accounts) {
    console.log(`- ${account.email} (${account.role})`);
  }
  console.log("Passwords come from SEED_*_PASSWORD or the documented defaults.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
