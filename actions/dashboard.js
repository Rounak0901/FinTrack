"use server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authenticateUser } from "@/actions/accounts";

const serializedTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }

  return serialized;
};

export async function createAccount(data) {
  try {
    const user = await authenticateUser();

    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance");
    }

    const existingAccounts = await db.account.findMany({
      where: {
        userId: user.id,
      },
    });

    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      // update other accounts as not default
      await db.account.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        balance: balanceFloat,
      },
    });

    if (!account) {
      throw new Error("Account not created");
    }

    const serializedAccount = serializedTransaction(account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getUserAccounts() {
  try {
    const user = await authenticateUser();

    const accounts = await db.account.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    const serializedAccounts = accounts.map(serializedTransaction);
    return serializedAccounts;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDashboardData() {
  try {
    const user = await authenticateUser();
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return transactions.map(serializedTransaction);
  } catch (error) {
    throw new Error(error.message);
  }
}
