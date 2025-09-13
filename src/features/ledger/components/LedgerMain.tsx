import { FC, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import api from "@/lib/api";
import { AlignLeft, CreditCard, Coins } from "lucide-react";
import useLedgerStore from "@/components/shared/store";

// Map tab names to indices
const tabMap = {
  accounts: 0,
  transactions: 1,
  assets: 2,
};

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
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial tab from URL params, default to accounts (0)
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    return tabParam && tabMap[tabParam as keyof typeof tabMap] !== undefined
      ? tabMap[tabParam as keyof typeof tabMap]
      : 0;
  };

  const [tabIndex, setTabIndex] = useState(getInitialTab);

  // Update tabIndex when URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const newTabIndex = tabParam && tabMap[tabParam as keyof typeof tabMap] !== undefined
      ? tabMap[tabParam as keyof typeof tabMap]
      : 0;
    setTabIndex(newTabIndex);
  }, [searchParams]);

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
    // Update URL with the selected tab
    const tabNames = ['accounts', 'transactions', 'assets'];
    const newSearchParams = new URLSearchParams(searchParams);

    // Set the main tab
    newSearchParams.set('tab', tabNames[index]);

    // If switching away from assets tab, clear subtab parameter
    if (index !== 2) {
      newSearchParams.delete('subtab');
    }

    setSearchParams(newSearchParams);
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
           <Box
             p={{ base: 2, md: 4 }}
             borderBottom="1px solid"
             borderColor="gray.200"
           >
             <Box
               overflowX={{ base: "auto", md: "visible" }}
               css={{
                 '&::-webkit-scrollbar': {
                   display: 'none'
                 },
                 scrollbarWidth: 'none',
                 msOverflowStyle: 'none'
               }}
             >
               <TabList
                 minW={{ base: "max-content", md: "auto" }}
                 borderBottom="none"
               >
                 <Tab
                   px={{ base: 3, md: 6 }}
                   py={3}
                   fontWeight="medium"
                   borderRadius="md"
                   whiteSpace="nowrap"
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
                   whiteSpace="nowrap"
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
                 <Tab
                   px={{ base: 3, md: 6 }}
                   py={3}
                   fontWeight="medium"
                   borderRadius="md"
                   whiteSpace="nowrap"
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
                     <Icon as={Coins} mr={2} />
                     <Text>Physical Assets</Text>
                   </Flex>
                 </Tab>
               </TabList>
             </Box>
           </Box>
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
            <TabPanel p={{ base: 2, md: 4 }}>
              <PhysicalAssets />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default LedgerMain;
