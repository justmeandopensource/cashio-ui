import Transactions from "@/features/transactions/Transactions";

const AccountMainTransactions = ({
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
