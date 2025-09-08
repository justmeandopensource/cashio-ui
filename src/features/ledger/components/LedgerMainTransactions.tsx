import React from "react";
import Transactions from "@/features/transactions/Transactions";

interface LedgerMainTransactionsProps {
  onAddTransaction: (accountId?: string, transaction?: any) => void;
  onTransactionDeleted: () => void;
  onTransactionUpdated: () => void;
  onCopyTransaction: (transaction: any) => void;
  shouldFetch?: boolean;
}

const LedgerMainTransactions: React.FC<LedgerMainTransactionsProps> = ({
  onAddTransaction,
  onTransactionDeleted,
  onTransactionUpdated,
  onCopyTransaction,
  shouldFetch = false,
}) => {
  return (
    <Transactions
      accountId={undefined}
      onAddTransaction={() => onAddTransaction(undefined, undefined)}
      onTransactionDeleted={onTransactionDeleted}
      onTransactionUpdated={onTransactionUpdated}
      onCopyTransaction={onCopyTransaction}
      shouldFetch={shouldFetch}
    />
  );
};

export default LedgerMainTransactions;
