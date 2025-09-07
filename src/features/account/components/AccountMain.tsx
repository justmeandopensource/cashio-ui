import React from "react";
import { Box } from "@chakra-ui/react";
import AccountMainTransactions from "./AccountMainTransactions";

interface Account {
  ledger_id: string;
  account_id: string;
  name: string;
  type: "asset" | "liability";
  net_balance: number;
  opening_balance: number;
  parent_account_id: string;
  balance: number;
  description?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface AccountMainProps {
  account: Account;
  onCopyTransaction: (transaction: any) => void;
  onAddTransaction: () => void;
}

const AccountMain: React.FC<AccountMainProps> = ({
  account,
  onCopyTransaction,
  onAddTransaction
}) => {
  return (
    <Box>
      {/* Transactions Section */}
      <AccountMainTransactions
        account={account}
        onAddTransaction={onAddTransaction}
        onTransactionDeleted={() => {}}
        onTransactionUpdated={() => {}}
        onCopyTransaction={onCopyTransaction}
      />
    </Box>
  );
};

export default AccountMain;
