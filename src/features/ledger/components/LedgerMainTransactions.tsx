import React from "react";
import Transactions from "@/features/transactions/Transactions";

interface LedgerMainTransactionsProps {
  onAddTransaction: () => void;
  onTransactionDeleted: () => void;
  shouldFetch?: boolean;
}

const LedgerMainTransactions: React.FC<LedgerMainTransactionsProps> = ({
  onAddTransaction,
  onTransactionDeleted,
  shouldFetch = false,
}) => {
  return (
    <Transactions
      accountId={undefined}
      onAddTransaction={onAddTransaction}
      onTransactionDeleted={onTransactionDeleted}
      shouldFetch={shouldFetch}
    />
  );
};

export default LedgerMainTransactions;
