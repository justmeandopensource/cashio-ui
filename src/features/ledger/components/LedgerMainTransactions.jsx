import Transactions from "@/features/transactions/Transactions";

const LedgerMainTransactions = ({
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
