import React from "react";
import Transactions from "@/features/transactions/Transactions";

interface LedgerMainTransactionsProps {
  onAddTransaction: () => void;
  onTransactionDeleted: () => void;
  onTransactionUpdated: () => void;
  shouldFetch?: boolean;
}

const LedgerMainTransactions: React.FC<LedgerMainTransactionsProps> = ({
  onAddTransaction,
  onTransactionDeleted,
  onTransactionUpdated,
  shouldFetch = false,
}) => {
  return (
    <Transactions
      accountId={undefined}
      onAddTransaction={onAddTransaction}
      onTransactionDeleted={onTransactionDeleted}
      onTransactionUpdated={onTransactionUpdated}
      shouldFetch={shouldFetch}
    />
  );
};

export default LedgerMainTransactions;
