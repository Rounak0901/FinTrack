"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function authenticateUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unautorized user");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new "User not found"();

  return user;
}

export async function getCurrentBudget(accountId) {
  try {
    const user = await authenticateUser();

    const budget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    const currentDate = new Date();
    const monthStartDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const monthEndDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: monthStartDate,
          lte: monthEndDate,
        },
        accountId,
      },
      _sum: {
        amount: true,
      },
    });

    return {
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      expenses: expenses._sum.amount ? expenses._sum.amount.toNumber() : 0,
    };
  } catch (e) {
    console.error("Error fetching current budget:", e);
    throw new Error("Failed to fetch current budget");
  }
}

export async function updateBudget(amount) {
  try {
    const user = await authenticateUser();

    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        amount: amount,
      },
      update: {
        amount: amount,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      date: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (e) {
    console.error("Error updating budget:", e);
    throw new Error("Failed to update budget");
  }
}
