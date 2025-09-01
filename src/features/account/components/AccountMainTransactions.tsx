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
  onTransactionUpdated: () => void;
  onCopyTransaction: (transaction: any) => void;
}

const AccountMainTransactions: React.FC<AccountMainTransactionsProps> = ({
  account,
  onAddTransaction,
  onTransactionDeleted,
  onTransactionUpdated,
  onCopyTransaction,
}) => {
  return (
    <Transactions
      accountId={account.account_id}
      onAddTransaction={onAddTransaction}
      onTransactionDeleted={onTransactionDeleted}
      onTransactionUpdated={onTransactionUpdated}
      onCopyTransaction={onCopyTransaction}
    />
  );
};

export default AccountMainTransactions;
Transactions;
