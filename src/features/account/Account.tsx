import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@components/Layout";
import AccountMain from "@features/account/components/AccountMain";
import PageContainer from "@components/shared/PageContainer";
import PageHeader from "@components/shared/PageHeader";
import {
  Button,
  Box,
  Text,
  HStack,
  IconButton,
  Icon,
  Badge,
  Flex,
} from "@chakra-ui/react";
import {
  Building,
  ShieldAlert,
  Edit,
  ChevronLeft,
  Info,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatNumberAsCurrency } from "@components/shared/utils";
import config from "@/config";
import useLedgerStore from "@/components/shared/store";
import UpdateAccountModal from "@components/modals/UpdateAccountModal";
import CreateTransactionModal from "@components/modals/CreateTransactionModal";
import TransferFundsModal from "@components/modals/TransferFundsModal";
import AccountDetailsModal from "@components/modals/AccountDetailsModal";
import { useDisclosure } from "@chakra-ui/react";

interface AccountData {
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

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { accountId } = useParams<{ accountId: string }>();
  const { ledgerId, currencySymbol } = useLedgerStore();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] =
    useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

  // Function to get balance color based on balance value and account type
  const getBalanceStyling = (balance: number, accountType?: string) => {
    // For asset accounts: Positive = Good (green), Negative = Bad (red)
    // For liability accounts: Positive = Bad (red), Negative = Good (green)
    const isPositiveGood = accountType !== "liability";

    if (balance > 0) {
      return isPositiveGood
        ? { color: "green.500", bgColor: "green.50", borderColor: "green.200" }
        : { color: "red.500", bgColor: "red.50", borderColor: "red.200" };
    } else if (balance < 0) {
      return isPositiveGood
        ? { color: "red.500", bgColor: "red.50", borderColor: "red.200" }
        : { color: "green.500", bgColor: "green.50", borderColor: "green.200" };
    } else {
      return { color: "gray.500", bgColor: "gray.50", borderColor: "gray.200" };
    }
  };

  // Modal state for account details
  const {
    isOpen: isDetailsModalOpen,
    onOpen: onDetailsModalOpen,
    onClose: onDetailsModalClose,
  } = useDisclosure();
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
        title={
          account ? (
            <HStack spacing={3} align="center">
              <Text fontSize={{ base: "md", md: "lg" }}>{account.name}</Text>
              <Badge
                variant="subtle"
                bg={
                  getBalanceStyling(account.net_balance, account.type).bgColor
                }
                color={
                  getBalanceStyling(account.net_balance, account.type).color
                }
                border="1px solid"
                borderColor={
                  getBalanceStyling(account.net_balance, account.type)
                    .borderColor
                }
                borderRadius="md"
                px={2}
                py={1}
                fontSize="sm"
                fontWeight="semibold"
              >
                {formatNumberAsCurrency(account.net_balance, currencySymbol)}
              </Badge>
            </HStack>
          ) : (
            "Account"
          )
        }
        subtitle={
          account?.description ||
          `${account?.type === "asset" ? "Asset" : "Liability"} account`
        }
        icon={account?.type === "asset" ? Building : ShieldAlert}
        backIcon={ChevronLeft}
        backOnClick={() => navigate("/ledger")}
        actions={
          <Flex
            direction={{ base: "column", md: "row" }}
            alignItems={{ base: "flex-start", md: "center" }}
            gap={2}
            width="100%"
          >
            <HStack spacing={2}>
              <IconButton
                aria-label="View account details"
                icon={<Info size={20} />}
                variant="ghost"
                color="white"
                onClick={onDetailsModalOpen}
                _hover={{ bg: "whiteAlpha.200" }}
              />
              <IconButton
                aria-label="Update account"
                icon={<Edit size={20} />}
                variant="ghost"
                color="white"
                onClick={() => setIsUpdateModalOpen(true)}
                _hover={{ bg: "whiteAlpha.200" }}
              />
            </HStack>
            <HStack spacing={2}>
              <Button
                color="white"
                variant="ghost"
                bg="whiteAlpha.100"
                onClick={() => setIsCreateModalOpen(true)}
                _hover={{ bg: "whiteAlpha.300" }}
              >
                Add Transaction
              </Button>
              <Button
                color="white"
                variant="ghost"
                bg="whiteAlpha.100"
                onClick={() => setIsTransferModalOpen(true)}
                _hover={{ bg: "whiteAlpha.300" }}
              >
                Transfer Funds
              </Button>
            </HStack>
          </Flex>
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

          <AccountDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={onDetailsModalClose}
            accountName={account.name}
            accountType={account.type}
            openingBalance={account.opening_balance}
            netBalance={account.net_balance}
            currencySymbol={currencySymbol}
            description={account.description}
            notes={account.notes}
            createdAt={account.created_at}
            updatedAt={account.updated_at}
          />
        </>
      )}
    </Layout>
  );
};

export default Account;
