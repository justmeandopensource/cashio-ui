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
import PhysicalAssets from "@features/physical-assets/PhysicalAssets";
import MutualFunds from "@features/mutual-funds/MutualFunds";
import api from "@/lib/api";
import { AlignLeft, CreditCard, Coins, TrendingUp } from "lucide-react";
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

  const handleCopyTransaction = async (transaction: any) => {
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
          size={{ base: "md", md: "md" }}
          index={tabIndex}
          onChange={handleTabChange}
        >
           <Box
             p={{ base: 2, md: 4 }}
             borderBottom="1px solid"
             borderColor="gray.200"
           >
              <Box>
                <TabList
                  minW={{ base: "auto", md: "auto" }}
                  borderBottom="none"
                  justifyContent={{ base: "space-around", md: "flex-start" }}
                >
                  <Tab
                    px={{ base: 4, md: 6 }}
                    py={4}
                    fontWeight="medium"
                    borderRadius="md"
                    whiteSpace="nowrap"
                    flex={{ base: 1, md: "none" }}
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
                    <Flex align="center" justify="center">
                      <Icon as={CreditCard} mr={{ base: 0, md: 2 }} />
                      <Text display={{ base: "none", md: "block" }}>Accounts</Text>
                      {accountsCount > 0 && (
                        <Badge ml={{ base: 0, md: 2 }} colorScheme="teal" borderRadius="full" px={2} display={{ base: "none", md: "inline-flex" }}>
                          {accountsCount}
                        </Badge>
                      )}
                    </Flex>
                  </Tab>
                  <Tab
                    px={{ base: 4, md: 6 }}
                    py={4}
                    fontWeight="medium"
                    borderRadius="md"
                    whiteSpace="nowrap"
                    flex={{ base: 1, md: "none" }}
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
                    <Flex align="center" justify="center">
                      <Icon as={AlignLeft} mr={{ base: 0, md: 2 }} />
                      <Text display={{ base: "none", md: "block" }}>Transactions</Text>
                    </Flex>
                  </Tab>
                   <Tab
                     px={{ base: 4, md: 6 }}
                     py={4}
                     fontWeight="medium"
                     borderRadius="md"
                     whiteSpace="nowrap"
                     flex={{ base: 1, md: "none" }}
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
                     <Flex align="center" justify="center">
                       <Icon as={Coins} mr={{ base: 0, md: 2 }} />
                       <Text display={{ base: "none", md: "block" }}>Physical Assets</Text>
                     </Flex>
                   </Tab>
                   <Tab
                     px={{ base: 4, md: 6 }}
                     py={4}
                     fontWeight="medium"
                     borderRadius="md"
                     whiteSpace="nowrap"
                     flex={{ base: 1, md: "none" }}
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
                     <Flex align="center" justify="center">
                       <Icon as={TrendingUp} mr={{ base: 0, md: 2 }} />
                       <Text display={{ base: "none", md: "block" }}>Mutual Funds</Text>
                     </Flex>
                   </Tab>
                </TabList>
             </Box>
           </Box>
           <TabPanels>
             <TabPanel p={{ base: 2, md: 4 }}>
               {tabIndex === 0 && (
                 <LedgerMainAccounts
                   accounts={accounts || []}
                   isLoading={isLoading}
                   onAddTransaction={onAddTransaction}
                   onTransferFunds={onTransferFunds}
                 />
               )}
             </TabPanel>
             <TabPanel p={{ base: 2, md: 4 }}>
               {tabIndex === 1 && (
                 <LedgerMainTransactions
                   onAddTransaction={onAddTransaction}
                    onTransactionDeleted={async () => {
                      await refreshAccountsData();
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
               )}
             </TabPanel>
              <TabPanel p={{ base: 2, md: 4 }}>
               {tabIndex === 2 && <PhysicalAssets />}
              </TabPanel>
               <TabPanel p={{ base: 2, md: 4 }}>
               {tabIndex === 3 && <MutualFunds onAccountDataChange={refreshAccountsData} />}
               </TabPanel>
            </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default LedgerMain;
