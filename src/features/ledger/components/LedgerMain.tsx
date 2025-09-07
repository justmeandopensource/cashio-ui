import { FC, useState } from "react";
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
  Button,
} from "@chakra-ui/react";
import LedgerMainAccounts from "./LedgerMainAccounts";
import LedgerMainTransactions from "./LedgerMainTransactions";
import CreateTransactionModal from "@components/modals/CreateTransactionModal";
import TransferFundsModal from "@components/modals/TransferFundsModal";
import api from "@/lib/api";
import { AlignLeft, CreditCard, Plus, ArrowRightLeft } from "lucide-react";
import useLedgerStore from "@/components/shared/store";
import { toastDefaults } from "@/components/shared/utils";

interface Account {
  account_id: string;
  name: string;
  type: "asset" | "liability";
  is_group: boolean;
}

const LedgerMain: FC = () => {
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
  const [transactionToCopy, setTransactionToCopy] = useState<any | undefined>(
    undefined,
  );

  const handleCopyTransaction = (transaction: any) => {
    setTransactionToCopy(transaction);
    setSelectedAccountId(transaction.account_id);
    if (transaction.is_transfer) {
      setIsTransferModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  // Fetch accounts for the ledger
  const {
    data: accounts,
    isLoading: isAccountsLoading,
    isError: isAccountsError,
  } = useQuery<Account[]>({
    queryKey: ["accounts", ledgerId],
    queryFn: async () => {
      const response = await api.get(`/ledger/${ledgerId}/accounts`);
      return response.data;
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

  if (isAccountsError) {
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
      {/* Tabs for Accounts and Transactions */}
      <Box borderRadius="lg" boxShadow="lg" bg="white" overflow="hidden">
        <Tabs
          variant="soft-rounded"
          colorScheme="teal"
          size={{ base: "sm", md: "md" }}
          index={tabIndex}
          onChange={handleTabChange}
        >
          <Flex
            justifyContent="space-between"
            alignItems="center"
            p={{ base: 2, md: 4 }}
            borderBottom="1px solid"
            borderColor="gray.200"
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
            <Flex gap={2}>
              <Button
                leftIcon={<Plus />}
                size="sm"
                variant="outline"
                colorScheme="teal"
                onClick={() => handleAddTransaction(undefined)}
                display={{ base: "none", md: "flex" }}
              >
                Add Transaction
              </Button>
              <Button
                leftIcon={<ArrowRightLeft />}
                size="sm"
                variant="outline"
                colorScheme="teal"
                onClick={() => handleTransferFunds(undefined)}
                display={{ base: "none", md: "flex" }}
              >
                Transfer Funds
              </Button>
            </Flex>
          </Flex>
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
                    queryKey: [`transactions-count`, ledgerId],
                  })
                }
                onTransactionUpdated={refreshAccountsData}
                onCopyTransaction={handleCopyTransaction}
                shouldFetch={tabIndex === 1}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setTransactionToCopy(undefined);
        }}
        accountId={selectedAccountId}
        onTransactionAdded={() => {
          refreshAccountsData();
          refreshTransactionsData();
        }}
        initialData={transactionToCopy}
      />

      {/* Transfer Funds Modal */}
      <TransferFundsModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransactionToCopy(undefined);
        }}
        accountId={selectedAccountId}
        onTransferCompleted={() => {
          refreshAccountsData();
          refreshTransactionsData();
        }}
        initialData={transactionToCopy}
      />
    </Box>
  );
};

export default LedgerMain;
