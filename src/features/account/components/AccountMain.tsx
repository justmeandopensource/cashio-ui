import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Text } from "@chakra-ui/react";
import AccountMainHeader from "./AccountMainHeader";
import AccountMainHeaderSkeleton from "./AccountMainHeaderSkeleton";
import AccountMainTransactions from "./AccountMainTransactions";
import CreateTransactionModal from "@components/modals/CreateTransactionModal";
import TransferFundsModal from "@components/modals/TransferFundsModal";
import UpdateAccountModal from "@components/modals/UpdateAccountModal";
import { CurrencyCode, currencySymbols } from "@components/shared/utils";
import config from "@/config";

interface AccountMainProps {
  currencySymbolCode: string;
}

interface Account {
  ledger_id: string;
  account_id: string;
  name: string;
  type: "asset" | "liability";
  net_balance: number;
  opening_balance: number;
  parent_account_id: string;
}

const AccountMain: React.FC<AccountMainProps> = ({ currencySymbolCode }) => {
  const { ledgerId, accountId } = useParams<{
    ledgerId: string;
    accountId: string;
  }>();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] =
    useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Fetch account
  const fetchAccount = async (): Promise<Account> => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `${config.apiBaseUrl}/ledger/${ledgerId}/account/${accountId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch account details");
    }

    return response.json();
  };

  // Fetch account
  const {
    data: account,
    isLoading: isAccountLoading,
    isError: isAccountError,
  } = useQuery<Account, Error>({
    queryKey: ["account", accountId],
    queryFn: fetchAccount,
    // Don't run the query if accountId is undefined
    enabled: !!accountId,
  });

  // Function to refresh account data
  const refreshAccountData = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ["account", accountId] });
  };

  // Show error message if account or transactions fetch fails
  if (isAccountError) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Text fontSize="xl" fontWeight="bold" mb={2}>
          Failed to load account data.
        </Text>
      </Box>
    );
  }

  if (isAccountLoading || !account) {
    return (
      <Box>
        <AccountMainHeaderSkeleton />
      </Box>
    );
  }

  return (
    <Box>
      {/* Account Details Section */}
      <AccountMainHeader
        account={account}
        currencySymbolCode={currencySymbolCode}
        onAddTransaction={() => setIsCreateModalOpen(true)}
        onTransferFunds={() => setIsTransferModalOpen(true)}
        onUpdateAccount={() => setIsUpdateModalOpen(true)}
      />

      {/* Transactions Section */}
      <AccountMainTransactions
        account={account}
        currencySymbolCode={currencySymbolCode}
        onAddTransaction={() => setIsCreateModalOpen(true)}
        onTransactionDeleted={refreshAccountData}
      />

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        ledgerId={ledgerId as string}
        accountId={accountId as string}
        currencySymbol={currencySymbols[currencySymbolCode as CurrencyCode]}
        onTransactionAdded={refreshAccountData}
      />

      {/* Transfer Funds Modal */}
      <TransferFundsModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        ledgerId={ledgerId as string}
        accountId={accountId as string}
        currencySymbol={currencySymbols[currencySymbolCode as CurrencyCode]}
        onTransferCompleted={refreshAccountData}
      />

      {/* Update Account Modal */}
      <UpdateAccountModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        account={account}
        currencySymbol={currencySymbols[currencySymbolCode as CurrencyCode]}
        onUpdateCompleted={refreshAccountData}
      />
    </Box>
  );
};

export default AccountMain;
