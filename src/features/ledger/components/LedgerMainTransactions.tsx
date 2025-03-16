import React from "react";
import Transactions from "@/features/transactions/Transactions";

interface LedgerMainTransactionsProps {
  ledgerId: string;
  currencySymbolCode: string;
  onAddTransaction: () => void;
  onTransactionDeleted: () => void;
  shouldFetch?: boolean;
}

const LedgerMainTransactions: React.FC<LedgerMainTransactionsProps> = ({
  ledgerId,
  currencySymbolCode,
  onAddTransaction,
  onTransactionDeleted,
  shouldFetch = false,
}) => {
  return (
    <Transactions
      ledgerId={ledgerId}
      accountId={null}
      currencySymbolCode={currencySymbolCode}
      onAddTransaction={onAddTransaction}
      onTransactionDeleted={onTransactionDeleted}
      shouldFetch={shouldFetch}
    />
  );
};

export default LedgerMainTransactions;
