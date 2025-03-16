import React from "react";
import Transactions from "@/features/transactions/Transactions";

interface Account {
  ledger_id: string;
  account_id: string;
}

interface AccountMainTransactionsProps {
  account: Account;
  currencySymbolCode: string;
  onAddTransaction: () => void;
  onTransactionDeleted: () => void;
}

const AccountMainTransactions: React.FC<AccountMainTransactionsProps> = ({
  account,
  currencySymbolCode,
  onAddTransaction,
  onTransactionDeleted,
}) => {
  return (
    <Transactions
      ledgerId={account.ledger_id}
      accountId={account.account_id}
      currencySymbolCode={currencySymbolCode}
      onAddTransaction={onAddTransaction}
      onTransactionDeleted={onTransactionDeleted}
    />
  );
};

export default AccountMainTransactions;
