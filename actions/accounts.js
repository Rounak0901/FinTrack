"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function authenticateUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unautorized user");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new "User not found"();

  return user;
}

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }

  return serialized;
};

export async function updateDefaultAccount(accountId) {
  try {
    const user = await authenticateUser();

    // First, unset any existing default account
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Then set the new default account
    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAccountWithTransactions(accountId) {
  const user = await authenticateUser();

  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });
  if (!account) return null;

  // Construct the final response object:
  //   - Serialize the account details using the 'serializeTransaction' function.
  //   - Map over the transactions array to serialize each transaction using the 'serializeTransaction' function.
  //   - return object with account serialized and array of transactions serialized.
  return {
    ...serializeTransaction(account),
    transactions: account.transactions.map(serializeTransaction),
  };
}

export async function bulkDeleteTransactions(transactionIds) {
  try {
    {
      const user = await authenticateUser();

      const transactions = await db.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      const accountBalanceChanges = transactions.reduce((acc, transaction) => {
        const change =
          transaction.type === "EXPENSE"
            ? transaction.amount
            : -transaction.amount;

        acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
        return acc;
      }, {});

      await db.$transaction(async (tx) => {
        await tx.transaction.deleteMany({
          where: {
            id: { in: transactionIds },
            userId: user.id,
          },
        });

        for (const [accountId, balanceChange] of Object.entries(
          accountBalanceChanges
        )) {
          await tx.account.update({
            where: { id: accountId },
            data: { balance: { increment: balanceChange } },
          });
        }
      });

      revalidatePath("/dashboard");
      revalidatePath("/account/[id]");
      return { success: true };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
