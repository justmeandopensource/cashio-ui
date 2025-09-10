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
} from "@chakra-ui/react";
import LedgerMainAccounts from "./LedgerMainAccounts";
import LedgerMainTransactions from "./LedgerMainTransactions";
import api from "@/lib/api";
import { AlignLeft, CreditCard } from "lucide-react";
import useLedgerStore from "@/components/shared/store";

interface Account {
  account_id: string;
  name: string;
  type: "asset" | "liability";
  is_group: boolean;
}

interface LedgerMainProps {
  // eslint-disable-next-line no-unused-vars
  onAddTransaction: (accountId?: string, transaction?: any) => void;
  // eslint-disable-next-line no-unused-vars
  onTransferFunds: (accountId?: string, transaction?: any) => void;
}

const LedgerMain: FC<LedgerMainProps> = ({ onAddTransaction, onTransferFunds }) => {
  const { ledgerId } = useLedgerStore();
  const queryClient = useQueryClient();

  const [tabIndex, setTabIndex] = useState(0);

  const handleCopyTransaction = (transaction: any) => {
    onAddTransaction(undefined, transaction);
  };

  const { data: accounts, isError, isLoading } = useQuery<Account[]>({
    queryKey: ["accounts", ledgerId],
    queryFn: async () => {
      const response = await api.get(`/ledger/${ledgerId}/accounts`);
      return response.data;
    },
  });

  const refreshAccountsData = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ["accounts", ledgerId] });
  };

  const refreshInsightsData = async (): Promise<void> => {
    // Invalidate insights queries to refresh charts after transaction changes
    await queryClient.invalidateQueries({
      queryKey: ["current-month-overview"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["insights"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["categoryTrend"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["tag-trend"],
    });
  };

  if (isError) {
    return null;
  }

  const handleTabChange = (index: number) => {
    setTabIndex(index);
  };

  const accountsCount = accounts
    ? accounts.filter((account) => !account.is_group).length
    : 0;

  return (
    <Box>
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
                borderRadius="md"
                _selected={{
                  color: "teal.700",
                  bg: "teal.50",
                  fontWeight: "semibold",
                  border: "1px solid",
                  borderColor: "teal.400",
                }}
                _hover={{
                  bg: "teal.25",
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
                borderRadius="md"
                _selected={{
                  color: "teal.700",
                  bg: "teal.50",
                  fontWeight: "semibold",
                  border: "1px solid",
                  borderColor: "teal.400",
                }}
                _hover={{
                  bg: "teal.25",
                }}
              >
                <Flex align="center">
                  <Icon as={AlignLeft} mr={2} />
                  <Text>Transactions</Text>
                </Flex>
              </Tab>
            </TabList>
          </Flex>
          <TabPanels>
            <TabPanel p={{ base: 2, md: 4 }}>
              <LedgerMainAccounts
                accounts={accounts || []}
                isLoading={isLoading}
                onAddTransaction={onAddTransaction}
                onTransferFunds={onTransferFunds}
              />
            </TabPanel>
            <TabPanel p={{ base: 2, md: 4 }}>
               <LedgerMainTransactions
                 onAddTransaction={onAddTransaction}
                 onTransactionDeleted={async () => {
                   await queryClient.invalidateQueries({
                     queryKey: [`transactions-count`, ledgerId],
                   });
                   await refreshInsightsData();
                 }}
                 onTransactionUpdated={async () => {
                   await refreshAccountsData();
                   await refreshInsightsData();
                 }}
                 onCopyTransaction={handleCopyTransaction}
                 shouldFetch={tabIndex === 1}
               />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default LedgerMain;
