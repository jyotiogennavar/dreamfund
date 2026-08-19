import { prisma } from "@/lib/db";

export const DEMO_USER_EMAIL = "demo@dreamfund.app";

export async function getDemoUser() {
  const existing = await prisma.user.findFirst({
    orderBy: { id: "asc" },
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
