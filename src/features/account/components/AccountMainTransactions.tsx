import React from "react";
import Transactions from "@/features/transactions/Transactions";

interface Account {
  ledger_id: string;
  account_id: string;
}

interface AccountMainTransactionsProps {
  account: Account;
  onAddTransaction: () => void;
  onTransactionDeleted: () => void;
}

const AccountMainTransactions: React.FC<AccountMainTransactionsProps> = ({
  account,
  onAddTransaction,
  onTransactionDeleted,
}) => {
  return (
    <Transactions
      accountId={account.account_id}
      onAddTransaction={onAddTransaction}
      onTransactionDeleted={onTransactionDeleted}
    />
  );
};

export default AccountMainTransactions;
