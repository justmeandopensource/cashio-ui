import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@components/Layout";
import AccountMain from "@features/account/components/AccountMain";
import PageContainer from "@components/shared/PageContainer";
import PageHeader from "@components/shared/PageHeader";
import { Button, Box, Text } from "@chakra-ui/react";
import { Settings, Wallet } from "lucide-react";
import config from "@/config";
import useLedgerStore from "@/components/shared/store";
import UpdateAccountModal from "@components/modals/UpdateAccountModal";
import CreateTransactionModal from "@components/modals/CreateTransactionModal";
import TransferFundsModal from "@components/modals/TransferFundsModal";

interface AccountData {
  ledger_id: string;
  account_id: string;
  name: string;
  type: "asset" | "liability";
  net_balance: number;
  opening_balance: number;
  parent_account_id: string;
}

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { accountId } = useParams<{ accountId: string }>();
  const { ledgerId } = useLedgerStore();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] =
    useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [transactionToCopy, setTransactionToCopy] = useState<any | undefined>(
    undefined,
  );

  const handleCopyTransaction = (transaction: any) => {
    setTransactionToCopy(transaction);
    if (transaction.is_transfer) {
      setIsTransferModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  // handle logout
  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  // Fetch account
  const fetchAccount = async (): Promise<AccountData> => {
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

  const { data: account, isError } = useQuery<AccountData, Error>({
    queryKey: ["account", accountId],
    queryFn: fetchAccount,
    enabled: !!accountId,
  });

  const refreshAccountData = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ["account", accountId] });
  };

  const refreshTransactionsData = async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: ["transactions"],
    });
  };

  if (isError) {
    return (
      <Layout handleLogout={handleLogout}>
        <PageContainer>
          <Box textAlign="center" py={10} px={6}>
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              Failed to load account data.
            </Text>
          </Box>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout handleLogout={handleLogout}>
      <PageHeader
        title={account?.name || "Account"}
        subtitle={`Type: ${account?.type}`}
        icon={Wallet}
        actions={
          <Button
            leftIcon={<Settings size={20} />}
            color="white"
            variant="ghost"
            onClick={() => setIsUpdateModalOpen(true)}
            _hover={{ bg: "whiteAlpha.200" }}
          >
            Update
          </Button>
        }
      />
      <Box flex={1} overflowY="auto">
        <PageContainer>
          {account && (
            <AccountMain
              account={account}
              onCopyTransaction={handleCopyTransaction}
              onAddTransaction={() => setIsCreateModalOpen(true)}
            />
          )}
        </PageContainer>
      </Box>

      {account && (
        <>
          <CreateTransactionModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setTransactionToCopy(undefined);
            }}
            accountId={accountId as string}
            onTransactionAdded={() => {
              refreshAccountData();
              refreshTransactionsData();
            }}
            initialData={transactionToCopy}
          />

          <TransferFundsModal
            isOpen={isTransferModalOpen}
            onClose={() => {
              setIsTransferModalOpen(false);
              setTransactionToCopy(undefined);
            }}
            accountId={accountId as string}
            onTransferCompleted={() => {
              refreshAccountData();
              refreshTransactionsData();
            }}
            initialData={transactionToCopy}
          />

          <UpdateAccountModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            account={account}
            onUpdateCompleted={refreshAccountData}
          />
        </>
      )}
    </Layout>
  );
};

export default Account;
