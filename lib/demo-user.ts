import { prisma } from "@/lib/db";

export const DEMO_USER_EMAIL = "demo@dreamfund.app";

export async function getDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
      currency: "INR",
    },
  });
}
