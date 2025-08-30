import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Box,
  Flex,
  Text,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
} from "@chakra-ui/react";
import LedgerMainHeader from "./LedgerMainHeader";
import LedgerMainHeaderSkeleton from "./LedgerMainHeaderSkeleton";
import LedgerMainAccounts from "./LedgerMainAccounts";
import LedgerMainTransactions from "./LedgerMainTransactions";
import CreateTransactionModal from "@components/modals/CreateTransactionModal";
import TransferFundsModal from "@components/modals/TransferFundsModal";
import config from "@/config";
import { AlignLeft, CreditCard } from "lucide-react";
import useLedgerStore from "@/components/shared/store";
import { toastDefaults } from "@/components/shared/utils";

interface Account {
  account_id: string;
  name: string;
  type: "asset" | "liability";
  is_group: boolean;
}

const LedgerMain = () => {
  const { ledgerId } = useLedgerStore();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Add state to track the active tab index
  const [tabIndex, setTabIndex] = useState(0);

  // State for modals and selected account
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<
    string | undefined
  >(undefined);

  // Fetch accounts for the ledger
  const {
    data: accounts,
    isLoading: isAccountsLoading,
    isError: isAccountsError,
  } = useQuery<Account[]>({
    queryKey: ["accounts", ledgerId],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${config.apiBaseUrl}/ledger/${ledgerId}/accounts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const data = await response.json();
      return data;
    },
  });

  const handleAddTransaction = (accountId: string | undefined = undefined) => {
    setSelectedAccountId(accountId);
    setIsCreateModalOpen(true);
  };

  const handleTransferFunds = (accountId: string | undefined = undefined) => {
    setSelectedAccountId(accountId);
    setIsTransferModalOpen(true);
  };

  const refreshAccountsData = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ["accounts", ledgerId] });
  };

  const refreshTransactionsData = async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: ["transactions"],
    });
  };

  if (isAccountsLoading) {
    return (
      <Box>
        <LedgerMainHeaderSkeleton />
      </Box>
    );
  }

  if (isAccountsError) {
    toast({
      description: "Failed to fetch ledger or account details.",
      status: "error",
      ...toastDefaults,
    });
    return null;
  }

  // Handle tab change
  const handleTabChange = (index: number) => {
    setTabIndex(index);
  };

  const accountsCount = accounts
    ? accounts.filter((account) => !account.is_group).length
    : 0;

  return (
    <Box>
      {/* Ledger Details Section */}
      <LedgerMainHeader
        onAddTransaction={() => handleAddTransaction(undefined)}
        onTransferFunds={() => handleTransferFunds(undefined)}
        hasAccounts={accounts ? accounts.length > 0 : false}
      />

      {/* Tabs for Accounts and Transactions */}
      <Box mt={6} borderRadius="lg" boxShadow="lg" bg="white" overflow="hidden">
        <Tabs
          variant="soft-rounded"
          colorScheme="teal"
          size={{ base: "sm", md: "md" }}
          p={{ base: 2, md: 4 }}
          index={tabIndex}
          onChange={handleTabChange}
        >
          <TabList>
            <Tab
              px={{ base: 3, md: 6 }}
              py={3}
              fontWeight="medium"
              _selected={{
                color: "teal.700",
                bg: "teal.50",
                fontWeight: "semibold",
                border: "1px solid",
                borderColor: "teal.400",
              }}
            >
              <Flex align="center">
                <Icon as={CreditCard} mr={2} />
                <Text>Accounts</Text>
                {accountsCount > 0 && (
                  <Badge ml={2} colorScheme="teal" borderRadius="full" px={2}>
                    {accountsCount}
                  </Badge>
                )}
              </Flex>
            </Tab>
            <Tab
              px={{ base: 3, md: 6 }}
              py={3}
              fontWeight="medium"
              _selected={{
                color: "teal.700",
                bg: "teal.50",
                fontWeight: "semibold",
                border: "1px solid",
                borderColor: "teal.400",
              }}
            >
              <Flex align="center">
                <Icon as={AlignLeft} mr={2} />
                <Text>Transactions</Text>
              </Flex>
            </Tab>
          </TabList>
          <TabPanels>
            {/* Accounts Tab */}
            <TabPanel p={{ base: 2, md: 4 }}>
              <LedgerMainAccounts
                accounts={accounts || []}
                onAddTransaction={handleAddTransaction}
                onTransferFunds={handleTransferFunds}
              />
            </TabPanel>
            {/* Transactions Tab */}
            <TabPanel p={{ base: 2, md: 4 }}>
              <LedgerMainTransactions
                onAddTransaction={() => handleAddTransaction(undefined)}
                onTransactionDeleted={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["transactions-count", ledgerId],
                  })
                }
                onTransactionUpdated={refreshAccountsData}
                shouldFetch={tabIndex === 1}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        accountId={selectedAccountId}
        onTransactionAdded={() => {
          refreshAccountsData();
          refreshTransactionsData();
        }}
      />

      {/* Transfer Funds Modal */}
      <TransferFundsModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accountId={selectedAccountId}
        onTransferCompleted={() => {
          refreshAccountsData();
          refreshTransactionsData();
        }}
      />
    </Box>
  );
};

export default LedgerMain;
