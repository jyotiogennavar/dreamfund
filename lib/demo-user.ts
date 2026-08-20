import { connection } from "next/server";

import { prisma } from "@/lib/db";

export const DEMO_USER_EMAIL = "demo@dreamfund.app";

export async function getDemoUser() {
  await connection();

  const existing = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });

  if (existing) {
    return existing;
  }

  return prisma.user.create({
    data: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
      currency: "INR",
    },
  });
}
