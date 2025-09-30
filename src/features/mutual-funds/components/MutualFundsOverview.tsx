import { FC, useState, useMemo } from "react";
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Flex,
  Icon,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  TrendingUp,
  PieChart,
  Building2,
  RefreshCw,
} from "lucide-react";
import { Amc, MutualFund } from "../types";
import {
  calculateFundPnL,
  splitCurrencyForDisplay,
  splitPercentageForDisplay,
} from "../utils";
import useLedgerStore from "../../../components/shared/store";
import MutualFundsTable from "./MutualFundsTable";
import BulkNavUpdateModal from "./modals/BulkNavUpdateModal";

/* eslint-disable no-unused-vars */
interface MutualFundsOverviewProps {
  amcs: Amc[];
  mutualFunds: MutualFund[];
  onCreateAmc: () => void;
  onCreateFund: (amcId?: number) => void;
  onTradeUnits: (fundId: number) => void;
  onTransferUnits: (fundId: number) => void;
  onUpdateNav: (fund: MutualFund) => void;
  onCloseFund: (fundId: number) => void;
  onViewTransactions: (fundId: number) => void;
  filters: {
    selectedAmc: string;
    selectedOwner: string;
    showZeroBalance: boolean;
  };
  onFiltersChange: (filters: {
    selectedAmc: string;
    selectedOwner: string;
    showZeroBalance: boolean;
  }) => void;
}
/* eslint-enable no-unused-vars */

const MutualFundsOverview: FC<MutualFundsOverviewProps> = ({
  amcs,
  mutualFunds,
  onCreateAmc,
  onCreateFund,
  onTradeUnits,
  onTransferUnits,
  onUpdateNav,
  onCloseFund,
  onViewTransactions,
  filters,
  onFiltersChange,
}) => {
  const { currencySymbol } = useLedgerStore();
  const [isBulkNavModalOpen, setIsBulkNavModalOpen] = useState(false);
  const toast = useToast();
  const emptyStateBg = useColorModeValue("gray.50", "gray.800");
  const emptyStateTextColor = useColorModeValue("gray.600", "gray.400");

  const toNumber = (value: number | string): number =>
    typeof value === "string" ? parseFloat(value) : value;

  const filteredMutualFunds = useMemo(() => {
    if (filters.selectedOwner === "all") {
      return mutualFunds;
    }
    return mutualFunds.filter((fund) => fund.owner === filters.selectedOwner);
  }, [mutualFunds, filters.selectedOwner]);

  const totalInvested = filteredMutualFunds.reduce(
    (sum, fund) => sum + toNumber(fund.total_invested_cash),
    0
  );
  const totalCurrentValue = filteredMutualFunds.reduce(
    (sum, fund) => sum + toNumber(fund.current_value),
    0
  );
  const totalRealizedGain = filteredMutualFunds.reduce(
    (sum, fund) => sum + toNumber(fund.total_realized_gain || 0),
    0
  );
  const totalUnrealizedPnL = filteredMutualFunds.reduce((sum, fund) => {
    const { unrealizedPnl } = calculateFundPnL(fund);
    return sum + unrealizedPnl;
  }, 0);

  const totalPnLPercentage =
    totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0;

  const fundsWithCodes = useMemo(() => {
    return mutualFunds.filter(
      (fund) =>
        fund.code && fund.code.trim() !== "" && toNumber(fund.total_units) > 0
    );
  }, [mutualFunds]);

  const handleOpenBulkNavModal = () => {
    if (fundsWithCodes.length === 0) {
      toast({
        title: "No Funds to Update",
        description:
          "No mutual funds with a positive balance and scheme code were found.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsBulkNavModalOpen(true);
  };

  const handleBulkNavSuccess = () => {
    toast({
      title: "NAVs Updated",
      description: "Mutual fund NAVs have been successfully updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {amcs.length > 0 && (
          <Box p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="sm">
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "start", md: "center" }}
              mb={4}
              gap={{ base: 4, md: 0 }}
            >
              <Flex align="center" mb={{ base: 2, md: 0 }}>
                <Icon as={TrendingUp} mr={2} color="teal.500" />
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="semibold"
                  color="gray.700"
                >
                  Mutual Funds Portfolio
                </Text>
              </Flex>
              <Flex gap={2} width={{ base: "full", md: "auto" }}>
                <Button
                  leftIcon={<Building2 size={16} />}
                  colorScheme="teal"
                  variant="outline"
                  size={{ base: "md", md: "sm" }}
                  onClick={onCreateAmc}
                  flex={{ base: 1, md: "none" }}
                >
                  Create AMC
                </Button>
                <Button
                  leftIcon={<PieChart size={16} />}
                  colorScheme="teal"
                  variant={amcs.length === 0 ? "outline" : "solid"}
                  size={{ base: "md", md: "sm" }}
                  onClick={() => onCreateFund()}
                  title={
                    amcs.length === 0
                      ? "Create an AMC first"
                      : "Create a new mutual fund"
                  }
                  flex={{ base: 1, md: "none" }}
                >
                  Create Fund
                </Button>
                {fundsWithCodes.length > 0 && (
                  <Button
                    leftIcon={<RefreshCw size={16} />}
                    colorScheme="teal"
                    variant="outline"
                    size={{ base: "md", md: "sm" }}
                    onClick={handleOpenBulkNavModal}
                    title={`Update NAVs for ${fundsWithCodes.length} funds`}
                    flex={{ base: 1, md: "none" }}
                  >
                    Update NAVs
                  </Button>
                )}
              </Flex>
            </Flex>

            <>
              <Box display={{ base: "block", md: "none" }}>
                <SimpleGrid
                  columns={{ base: 2, sm: 3 }}
                  spacing={{ base: 4, md: 8 }}
                >
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Total Invested
                    </Text>
                    <HStack spacing={0} align="baseline">
                      <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        fontWeight="semibold"
                        color="gray.600"
                      >
                        {splitCurrencyForDisplay(totalInvested, currencySymbol || "₹").main}
                      </Text>
                      <Text
                        fontSize={{ base: "md", md: "lg" }}
                        fontWeight="semibold"
                        color="gray.600"
                        opacity={0.7}
                      >
                        {splitCurrencyForDisplay(totalInvested, currencySymbol || "₹").decimals}
                      </Text>
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Total Value
                    </Text>
                    <HStack spacing={0} align="baseline">
                      <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        fontWeight="semibold"
                        color="teal.600"
                      >
                        {splitCurrencyForDisplay(totalCurrentValue, currencySymbol || "₹").main}
                      </Text>
                      <Text
                        fontSize={{ base: "md", md: "lg" }}
                        fontWeight="semibold"
                        color="teal.600"
                        opacity={0.7}
                      >
                        {splitCurrencyForDisplay(totalCurrentValue, currencySymbol || "₹").decimals}
                      </Text>
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Total Realized Gain
                    </Text>
                    <HStack spacing={0} align="baseline">
                      <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        fontWeight="semibold"
                        color={totalRealizedGain >= 0 ? "green.500" : "red.500"}
                      >
                        {
                          splitCurrencyForDisplay(Math.abs(totalRealizedGain), currencySymbol || "₹")
                            .main
                        }
                      </Text>
                      <Text
                        fontSize={{ base: "md", md: "lg" }}
                        fontWeight="semibold"
                        color={totalRealizedGain >= 0 ? "green.500" : "red.500"}
                        opacity={0.7}
                      >
                        {
                          splitCurrencyForDisplay(Math.abs(totalRealizedGain), currencySymbol || "₹")
                            .decimals
                        }
                      </Text>
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Total Unrealized P&L
                    </Text>
                    <VStack align="start" spacing={0}>
                      <HStack spacing={0} align="baseline">
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="semibold"
                          color={totalUnrealizedPnL >= 0 ? "green.500" : "red.500"}
                        >
                          {
                            splitCurrencyForDisplay(
                              Math.abs(totalUnrealizedPnL),
                              currencySymbol || "₹",
                            ).main
                          }
                        </Text>
                        <Text
                          fontSize={{ base: "md", md: "lg" }}
                          fontWeight="semibold"
                          color={totalUnrealizedPnL >= 0 ? "green.500" : "red.500"}
                          opacity={0.7}
                        >
                          {
                            splitCurrencyForDisplay(
                              Math.abs(totalUnrealizedPnL),
                              currencySymbol || "₹",
                            ).decimals
                          }
                        </Text>
                      </HStack>
                      <HStack spacing={0} align="baseline">
                        <Text
                          fontSize="sm"
                          color={totalUnrealizedPnL >= 0 ? "green.500" : "red.500"}
                        >
                          {splitPercentageForDisplay(totalPnLPercentage).main}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={totalUnrealizedPnL >= 0 ? "green.500" : "red.500"}
                          opacity={0.7}
                        >
                          {splitPercentageForDisplay(totalPnLPercentage).decimals}%
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                   <Box>
                     <Text fontSize="sm" color="gray.600" mb={1}>
                       Total Funds
                     </Text>
                     <VStack align="start" spacing={0}>
                       <Text
                         fontSize={{ base: "xl", md: "2xl" }}
                         fontWeight="bold"
                         color="blue.600"
                       >
                         {filteredMutualFunds.filter(fund => toNumber(fund.total_units) > 0).length}
                       </Text>
                       <Text fontSize="xs" color="gray.500">
                         Across {amcs.length} AMC{amcs.length !== 1 ? "s" : ""}
                       </Text>
                     </VStack>
                   </Box>
                </SimpleGrid>
              </Box>
              <Box display={{ base: "none", md: "block" }}>
                <Flex
                  direction={{ base: "column", md: "row" }}
                  gap={{ base: 4, md: 6 }}
                  wrap="wrap"
                >
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Total Invested
                    </Text>
                    <HStack spacing={0} align="baseline">
                      <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        fontWeight="semibold"
                        color="gray.600"
                      >
                        {splitCurrencyForDisplay(totalInvested, currencySymbol || "₹").main}
                      </Text>
                      <Text
                        fontSize={{ base: "md", md: "lg" }}
                        fontWeight="semibold"
                        color="gray.600"
                        opacity={0.7}
                      >
                        {splitCurrencyForDisplay(totalInvested, currencySymbol || "₹").decimals}
                      </Text>
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Total Value
                    </Text>
                    <HStack spacing={0} align="baseline">
                      <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        fontWeight="semibold"
                        color="teal.600"
                      >
                        {splitCurrencyForDisplay(totalCurrentValue, currencySymbol || "₹").main}
                      </Text>
                      <Text
                        fontSize={{ base: "md", md: "lg" }}
                        fontWeight="semibold"
                        color="teal.600"
                        opacity={0.7}
                      >
                        {splitCurrencyForDisplay(totalCurrentValue, currencySymbol || "₹").decimals}
                      </Text>
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Total Realized Gain
                    </Text>
                    <HStack spacing={0} align="baseline">
                      <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        fontWeight="semibold"
                        color={totalRealizedGain >= 0 ? "green.500" : "red.500"}
                      >
                        {
                          splitCurrencyForDisplay(Math.abs(totalRealizedGain), currencySymbol || "₹")
                            .main
                        }
                      </Text>
                      <Text
                        fontSize={{ base: "md", md: "lg" }}
                        fontWeight="semibold"
                        color={totalRealizedGain >= 0 ? "green.500" : "red.500"}
                        opacity={0.7}
                      >
                        {
                          splitCurrencyForDisplay(Math.abs(totalRealizedGain), currencySymbol || "₹")
                            .decimals
                        }
                      </Text>
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Total Unrealized P&L
                    </Text>
                    <VStack align="start" spacing={0}>
                      <HStack spacing={0} align="baseline">
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="semibold"
                          color={totalUnrealizedPnL >= 0 ? "green.500" : "red.500"}
                        >
                          {
                            splitCurrencyForDisplay(
                              Math.abs(totalUnrealizedPnL),
                              currencySymbol || "₹",
                            ).main
                          }
                        </Text>
                        <Text
                          fontSize={{ base: "md", md: "lg" }}
                          fontWeight="semibold"
                          color={totalUnrealizedPnL >= 0 ? "green.500" : "red.500"}
                          opacity={0.7}
                        >
                          {
                            splitCurrencyForDisplay(
                              Math.abs(totalUnrealizedPnL),
                              currencySymbol || "₹",
                            ).decimals
                          }
                        </Text>
                      </HStack>
                      <HStack spacing={0} align="baseline">
                        <Text
                          fontSize="sm"
                          color={totalUnrealizedPnL >= 0 ? "green.500" : "red.500"}
                        >
                          {splitPercentageForDisplay(totalPnLPercentage).main}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={totalUnrealizedPnL >= 0 ? "green.500" : "red.500"}
                          opacity={0.7}
                        >
                          {splitPercentageForDisplay(totalPnLPercentage).decimals}%
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                   <Box>
                     <Text fontSize="sm" color="gray.600" mb={1}>
                       Total Funds
                     </Text>
                     <VStack align="start" spacing={0}>
                       <Text
                         fontSize={{ base: "xl", md: "2xl" }}
                         fontWeight="bold"
                         color="blue.600"
                       >
                         {filteredMutualFunds.filter(fund => toNumber(fund.total_units) > 0).length}
                       </Text>
                       <Text fontSize="xs" color="gray.500">
                         Across {amcs.length} AMC{amcs.length !== 1 ? "s" : ""}
                       </Text>
                     </VStack>
                   </Box>
                </Flex>
              </Box>
            </>
          </Box>
        )}

          {amcs.length === 0 ? (
            <Box
              p={12}
              textAlign="center"
              bg={emptyStateBg}
              borderRadius="lg"
              border="2px dashed"
              borderColor="gray.300"
            >
              <VStack spacing={4}>
                <Icon as={TrendingUp} boxSize={16} color="gray.400" />
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="semibold" color="gray.700">
                    No AMCs Created Yet
                  </Text>
                  <Text fontSize="md" color={emptyStateTextColor} maxW="400px">
                    Create your first Asset Management Company to start tracking mutual fund investments
                  </Text>
                </VStack>
                <Button colorScheme="teal" onClick={onCreateAmc} size="lg">
                  Create Your First AMC
                </Button>
              </VStack>
            </Box>
          ) : mutualFunds.length === 0 ? (
            <Box
              p={12}
              textAlign="center"
              bg={emptyStateBg}
              borderRadius="lg"
              border="2px dashed"
              borderColor="gray.300"
            >
             {/* Empty State for no funds but AMCs exist */}
           </Box>
         ) : (
            <MutualFundsTable
              amcs={amcs}
              mutualFunds={mutualFunds}
              onTradeUnits={onTradeUnits}
              onTransferUnits={onTransferUnits}
              onUpdateNav={onUpdateNav}
              onCloseFund={onCloseFund}
              onViewTransactions={onViewTransactions}
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
         )}
      </VStack>
      <BulkNavUpdateModal
        isOpen={isBulkNavModalOpen}
        onClose={() => setIsBulkNavModalOpen(false)}
        mutualFunds={fundsWithCodes}
        onSuccess={handleBulkNavSuccess}
      />
    </Box>
  );
};

export default MutualFundsOverview;