import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, useToast, Text } from "@chakra-ui/react";
import AccountMainHeader from "./AccountMainHeader";
import AccountMainHeaderSkeleton from "./AccountMainHeaderSkeleton";
import AccountMainTransactions from "./AccountMainTransactions";
import CreateTransactionModal from "@components/modals/CreateTransactionModal";
import TransferFundsModal from "@components/modals/TransferFundsModal";
import UpdateAccountModal from "@components/modals/UpdateAccountModal";
import { currencySymbols } from "@components/shared/utils";
import config from "@/config";

const AccountMain = ({ currencySymbolCode }) => {
  const { ledgerId, accountId } = useParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  // Fetch account
  const fetchAccount = async () => {
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
  } = useQuery({
    queryKey: ["account", accountId],
    queryFn: fetchAccount,
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to fetch account details.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // Function to refresh account data
  const refreshAccountData = async () => {
    await queryClient.invalidateQueries(["account", accountId]);
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

  if (isAccountLoading) {
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
        ledgerId={ledgerId}
        accountId={accountId}
        currencySymbol={currencySymbols[currencySymbolCode]}
        onTransactionAdded={refreshAccountData}
      />

      {/* Transfer Funds Modal */}
      <TransferFundsModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        ledgerId={ledgerId}
        accountId={accountId}
        currencySymbol={currencySymbols[currencySymbolCode]}
        onTransferCompleted={refreshAccountData}
      />

      {/* Update Account Modal */}
      <UpdateAccountModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        account={account}
        currencySymbol={currencySymbols[currencySymbolCode]}
        onUpdateCompleted={refreshAccountData}
      />
    </Box>
  );
};

export default AccountMain;
