import { getAccountWithTransactions } from "@/actions/accounts";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import TransactionsTable from "../_components/transactions_table";
import { BarLoader } from "react-spinners";
import AccountChart from "../_components/account_chart";

const Account = async ({ params }) => {
  const accountData = await getAccountWithTransactions(params.id);

  if (!accountData) {
    redirect("/not-found");
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="container mx-auto my-32">
      {/* Heading */}
      <div>
        <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalize">
          {account.name}
        </h1>
        <p className="text-muted-foreground">
          {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
        </p>
      </div>

      <div className="text-right pb-2">
        <div className="text-xl sm:text-2xl font:bold">
          ${parseFloat(account.balance).toFixed(2)}
        </div>
        <p className="text-sm text-muted-foreground">
          {account._count.transactions} Transactions
        </p>
      </div>

      {/* Chart Section */}
      <Suspense
        fallback={
          <BarLoader className="mt-4" width={"100%"} color={"#9333ea"} />
        }
      >
        <AccountChart transactions={transactions} />
      </Suspense>
      {/* Transaction table */}
      <Suspense
        fallback={
          <BarLoader className="mt-4" width={"100%"} color={"#9333ea"} />
        }
      >
        <TransactionsTable transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default Account;
