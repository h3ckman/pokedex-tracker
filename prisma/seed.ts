import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../lib/auth/password";
import { seedCharacterPresets } from "./seed-presets";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type Role = "ADMIN" | "SITE_MANAGER" | "TECHNICIAN" | "VIEWER";

type SeedUser = {
  email: string;
  name: string;
  password: string;
  role: Role;
};

const users: SeedUser[] = [
  {
    email: "admin@example.com",
    name: "Admin User",
    password: "password",
    role: "ADMIN",
  },
];

async function upsertUser(user: SeedUser): Promise<void> {
  const passwordHash = await hashPassword(user.password);
  await prisma.user.upsert({
    where: { email: user.email },
    update: { name: user.name, role: user.role },
    create: {
      email: user.email,
      name: user.name,
      passwordHash,
      role: user.role,
    },
  });
  console.log(`Seeded user: ${user.email} / ${user.password}`);
}

async function main() {
  for (const user of users) {
    await upsertUser(user);
  }
  const userCount = await prisma.user.count();
  console.log(`Seeded ${userCount} users`);
  await seedCharacterPresets(prisma);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
