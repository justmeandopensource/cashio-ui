import { FC, useState } from "react";
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Collapse,
  IconButton,
  Divider,
  SimpleGrid,
  Flex,
} from "@chakra-ui/react";
import {
  TrendingUp,
  PieChart,
  ChevronDown,
  ChevronRight,
  Building2,
} from "lucide-react";
import { Amc, MutualFund } from "../types";
import {
  formatUnits,
  formatNav,
  calculateFundPnL,
  splitCurrencyForDisplay,
  splitPercentageForDisplay,
  calculateHighestPurchaseCost,
  calculateLowestPurchaseCost,
} from "../utils";
import { useFundTransactions } from "../api";

interface MutualFundsOverviewProps {
  amcs: Amc[];
  mutualFunds: MutualFund[];
  onCreateAmc: () => void;
  onCreateFund: (amcId?: number) => void;
  onTradeUnits: (fundId: number) => void;
  onTransferUnits: (fundId: number) => void;
  onUpdateNav: (fund: MutualFund) => void;
  onCloseFund: (fundId: number) => void;
  onDeleteAmc: (amcId: number) => void;
}

const MutualFundsOverview: FC<MutualFundsOverviewProps> = ({
  amcs,
  mutualFunds,
  onCreateAmc,
  onCreateFund,
  onTradeUnits,
  onTransferUnits,
  onUpdateNav,
  onCloseFund,
  onDeleteAmc,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedColor = useColorModeValue("gray.600", "gray.400");

  // State for expanded AMCs and funds
  const [expandedAmc, setExpandedAmc] = useState<number | null>(null);
  const [expandedFunds, setExpandedFunds] = useState<Set<number>>(new Set());

  // Calculate overall portfolio metrics
  const totalInvested = mutualFunds.reduce(
    (sum, fund) => sum + fund.external_cash_invested,
    0,
  );
  const totalCurrentValue = mutualFunds.reduce(
    (sum, fund) => sum + fund.current_value,
    0,
  );
  const totalRealizedGain = mutualFunds.reduce(
    (sum, fund) => sum + (fund.total_realized_gain || 0),
    0,
  );
  const totalUnrealizedPnL = mutualFunds.reduce((sum, fund) => {
    const { unrealizedPnl } = calculateFundPnL(fund);
    return sum + unrealizedPnl;
  }, 0);

  const totalPnLPercentage =
    totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0;

  const toggleAmcExpansion = (amcId: number) => {
    const currentlyExpanded = expandedAmc;
    const nextExpanded = currentlyExpanded === amcId ? null : amcId;

    if (currentlyExpanded !== null && currentlyExpanded !== nextExpanded) {
      const fundsToCollapse = mutualFunds
        .filter((fund) => fund.amc_id === currentlyExpanded)
        .map((fund) => fund.mutual_fund_id);

      if (fundsToCollapse.length > 0) {
        const newExpandedFunds = new Set(expandedFunds);
        fundsToCollapse.forEach((fundId) => newExpandedFunds.delete(fundId));
        setExpandedFunds(newExpandedFunds);
      }
    }

    setExpandedAmc(nextExpanded);
  };

  const toggleFundExpansion = (fundId: number) => {
    const newExpanded = new Set(expandedFunds);
    if (newExpanded.has(fundId)) {
      newExpanded.delete(fundId);
    } else {
      newExpanded.add(fundId);
    }
    setExpandedFunds(newExpanded);
  };

  const FundCard: FC<{ fund: MutualFund }> = ({ fund }) => {
    const { unrealizedPnl, realizedPnl } = calculateFundPnL(fund);
    const isExpanded = expandedFunds.has(fund.mutual_fund_id);
    const costBasis = fund.total_invested_cash || (fund.total_units * fund.average_cost_per_unit);
    const invested = fund.total_invested_cash || (fund.total_units * fund.average_cost_per_unit);
    const unrealizedPercentage =
      costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;

    // Fetch transactions for cost calculations
    const { data: transactions = [] } = useFundTransactions(fund.ledger_id, fund.mutual_fund_id);
    const highestPurchaseCost = calculateHighestPurchaseCost(transactions);
    const lowestPurchaseCost = calculateLowestPurchaseCost(transactions);

    const handleCardClick = (e: MouseEvent) => {
      // Prevent expansion if clicking on interactive elements
      if ((e.target as HTMLElement).closest("button")) {
        return;
      }
      toggleFundExpansion(fund.mutual_fund_id);
    };

    return (
      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderWidth={1}
        size="sm"
        cursor="pointer"
        onClick={handleCardClick}
        shadow="sm"
        _hover={{ shadow: "md", borderColor: "teal.300" }}
        transition="all 0.2s"
      >
        <CardBody>
          <HStack justify="space-between" align="start" mb={3}>
            <VStack align="start" spacing={1} flex={1}>
              <Text
                fontSize="md"
                fontWeight="semibold"
                color="gray.700"
                noOfLines={1}
              >
                {fund.name}
              </Text>
              <HStack spacing={{ base: 4, md: 6 }} color={mutedColor} align="start">
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color={mutedColor}>
                    Units
                  </Text>
                  <HStack spacing={0} align="baseline">
                    <Text fontSize="md">
                      {formatUnits(fund.total_units).split(".")[0]}.
                    </Text>
                    <Text fontSize="sm" opacity={0.7}>
                      {formatUnits(fund.total_units).split(".")[1]}
                    </Text>
                  </HStack>
                </VStack>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color={mutedColor}>
                    Invested
                  </Text>
                  <HStack spacing={0} align="baseline">
                    <Text fontSize="md">
                      {splitCurrencyForDisplay(invested, "₹").main}
                    </Text>
                    <Text fontSize="sm" opacity={0.7}>
                      {splitCurrencyForDisplay(invested, "₹").decimals}
                    </Text>
                  </HStack>
                </VStack>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color={mutedColor}>
                    Value
                  </Text>
                  <HStack spacing={0} align="baseline">
                    <Text fontSize="md">
                      {splitCurrencyForDisplay(fund.current_value, "₹").main}
                    </Text>
                    <Text fontSize="sm" opacity={0.7}>
                      {
                        splitCurrencyForDisplay(fund.current_value, "₹")
                          .decimals
                      }
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            </VStack>
            <Badge
              colorScheme={unrealizedPnl >= 0 ? "green" : "red"}
              size="sm"
              fontWeight="medium"
              px={2}
              py={0.5}
              borderRadius="md"
            >
              <HStack spacing={0} align="baseline">
                <Text fontSize="sm" fontWeight="semibold">
                  {splitPercentageForDisplay(unrealizedPercentage).main}
                </Text>
                <Text fontSize="xs" fontWeight="semibold" opacity={0.7}>
                  {splitPercentageForDisplay(unrealizedPercentage).decimals}%
                </Text>
              </HStack>
            </Badge>
          </HStack>

            <Collapse in={isExpanded} animateOpacity>
             <Box pt={2}>
               <Divider mb={3} />
               <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mb={3}>
                 <Stat size="sm">
                   <StatLabel fontSize="xs" color={mutedColor}>
                     NAV
                   </StatLabel>
                   <StatNumber fontSize="sm" color="gray.600">
                     ₹{formatNav(fund.latest_nav)}
                   </StatNumber>
                 </Stat>
                 <Stat size="sm">
                   <StatLabel fontSize="xs" color={mutedColor}>
                     Realized P&L
                   </StatLabel>
                   <HStack spacing={0} align="baseline">
                     <StatNumber
                       fontSize="sm"
                       color={realizedPnl >= 0 ? "green.500" : "red.500"}
                     >
                       {splitCurrencyForDisplay(Math.abs(realizedPnl), "₹").main}
                     </StatNumber>
                     <Text
                       fontSize="xs"
                       color={realizedPnl >= 0 ? "green.500" : "red.500"}
                       opacity={0.7}
                     >
                       {
                         splitCurrencyForDisplay(Math.abs(realizedPnl), "₹")
                           .decimals
                       }
                     </Text>
                   </HStack>
                 </Stat>
                 <Stat size="sm">
                   <StatLabel fontSize="xs" color={mutedColor}>
                     Unrealized P&L
                   </StatLabel>
                   <HStack spacing={0} align="baseline">
                     <StatNumber
                       fontSize="sm"
                       color={unrealizedPnl >= 0 ? "green.500" : "red.500"}
                     >
                       {
                         splitCurrencyForDisplay(Math.abs(unrealizedPnl), "₹")
                           .main
                       }
                     </StatNumber>
                     <Text
                       fontSize="xs"
                       color={unrealizedPnl >= 0 ? "green.500" : "red.500"}
                       opacity={0.7}
                     >
                       {
                         splitCurrencyForDisplay(Math.abs(unrealizedPnl), "₹")
                           .decimals
                       }
                     </Text>
                   </HStack>
                 </Stat>
               </SimpleGrid>
               <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mb={3}>
                 <Stat size="sm">
                   <StatLabel fontSize="xs" color={mutedColor}>
                     Avg. Cost
                   </StatLabel>
                   <HStack spacing={0} align="baseline">
                     <StatNumber fontSize="sm" color="gray.600">
                       {
                         splitCurrencyForDisplay(fund.average_cost_per_unit, "₹")
                           .main
                       }
                     </StatNumber>
                     <Text fontSize="xs" color="gray.600" opacity={0.7}>
                       {
                         splitCurrencyForDisplay(fund.average_cost_per_unit, "₹")
                           .decimals
                       }
                     </Text>
                   </HStack>
                 </Stat>
                 <Stat size="sm">
                   <StatLabel fontSize="xs" color={mutedColor}>
                     Lowest Cost
                   </StatLabel>
                   <HStack spacing={0} align="baseline">
                     <StatNumber fontSize="sm" color="gray.600">
                       {lowestPurchaseCost !== null
                         ? splitCurrencyForDisplay(lowestPurchaseCost, "₹").main
                         : "--"}
                     </StatNumber>
                     <Text fontSize="xs" color="gray.600" opacity={0.7}>
                       {lowestPurchaseCost !== null
                         ? splitCurrencyForDisplay(lowestPurchaseCost, "₹").decimals
                         : ""}
                     </Text>
                   </HStack>
                 </Stat>
                 <Stat size="sm">
                   <StatLabel fontSize="xs" color={mutedColor}>
                     Highest Cost
                   </StatLabel>
                   <HStack spacing={0} align="baseline">
                     <StatNumber fontSize="sm" color="gray.600">
                       {highestPurchaseCost !== null
                         ? splitCurrencyForDisplay(highestPurchaseCost, "₹").main
                         : "--"}
                     </StatNumber>
                     <Text fontSize="xs" color="gray.600" opacity={0.7}>
                       {highestPurchaseCost !== null
                         ? splitCurrencyForDisplay(highestPurchaseCost, "₹").decimals
                         : ""}
                     </Text>
                   </HStack>
                 </Stat>
               </SimpleGrid>

              <Divider mb={3} />

               <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2} w="full">
                 <Button
                   size="sm"
                   colorScheme="teal"
                   variant="outline"
                   onClick={(e) => {
                     e.stopPropagation();
                     onTradeUnits(fund.mutual_fund_id);
                   }}
                   sx={{ fontSize: "xs" }}
                   w="full"
                 >
                   Buy/Sell
                 </Button>
                 <Button
                   size="sm"
                   colorScheme="purple"
                   variant="outline"
                   onClick={(e) => {
                     e.stopPropagation();
                     onTransferUnits(fund.mutual_fund_id);
                   }}
                   sx={{ fontSize: "xs" }}
                   isDisabled={fund.total_units <= 0}
                   w="full"
                 >
                   Transfer
                 </Button>
                 <Button
                   size="sm"
                   colorScheme="orange"
                   variant="outline"
                   onClick={(e) => {
                     e.stopPropagation();
                     onUpdateNav(fund);
                   }}
                   sx={{ fontSize: "xs" }}
                   w="full"
                 >
                   Update NAV
                 </Button>
                 <Button
                   size="sm"
                   colorScheme="red"
                   variant="outline"
                   onClick={(e) => {
                     e.stopPropagation();
                     onCloseFund(fund.mutual_fund_id);
                   }}
                   isDisabled={fund.total_units > 0}
                   sx={{ fontSize: "xs" }}
                   w="full"
                 >
                   Close Fund
                 </Button>
               </SimpleGrid>
            </Box>
          </Collapse>
        </CardBody>
      </Card>
    );
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header with Portfolio Summary */}
        <Box
          mb={6}
          p={{ base: 4, md: 6 }}
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "start", md: "center" }}
            mb={mutualFunds.length > 0 ? 6 : 0}
            gap={{ base: 4, md: 0 }}
          >
            <Flex align="center" mb={{ base: 2, md: 0 }}>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="semibold"
                color="gray.700"
                mr={3}
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
            </Flex>
          </Flex>

           {/* Portfolio Stats - Only show if there are funds */}
           {mutualFunds.length > 0 && (
             <>
               {/* Mobile: Full grid with all metrics */}
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
                         {splitCurrencyForDisplay(totalInvested, "₹").main}
                       </Text>
                       <Text
                         fontSize={{ base: "md", md: "lg" }}
                         fontWeight="semibold"
                         color="gray.600"
                         opacity={0.7}
                       >
                         {splitCurrencyForDisplay(totalInvested, "₹").decimals}
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
                         {splitCurrencyForDisplay(totalCurrentValue, "₹").main}
                       </Text>
                       <Text
                         fontSize={{ base: "md", md: "lg" }}
                         fontWeight="semibold"
                         color="teal.600"
                         opacity={0.7}
                       >
                         {splitCurrencyForDisplay(totalCurrentValue, "₹").decimals}
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
                           splitCurrencyForDisplay(Math.abs(totalRealizedGain), "₹")
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
                           splitCurrencyForDisplay(Math.abs(totalRealizedGain), "₹")
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
                               "₹",
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
                               "₹",
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
                         {mutualFunds.length}
                       </Text>
                       <Text fontSize="xs" color="gray.500">
                         Across {amcs.length} AMC{amcs.length !== 1 ? "s" : ""}
                       </Text>
                     </VStack>
                   </Box>
                 </SimpleGrid>
               </Box>

               {/* Desktop: All metrics in Flex layout like physical assets */}
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
                         {splitCurrencyForDisplay(totalInvested, "₹").main}
                       </Text>
                       <Text
                         fontSize={{ base: "md", md: "lg" }}
                         fontWeight="semibold"
                         color="gray.600"
                         opacity={0.7}
                       >
                         {splitCurrencyForDisplay(totalInvested, "₹").decimals}
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
                         {splitCurrencyForDisplay(totalCurrentValue, "₹").main}
                       </Text>
                       <Text
                         fontSize={{ base: "md", md: "lg" }}
                         fontWeight="semibold"
                         color="teal.600"
                         opacity={0.7}
                       >
                         {splitCurrencyForDisplay(totalCurrentValue, "₹").decimals}
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
                           splitCurrencyForDisplay(Math.abs(totalRealizedGain), "₹")
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
                           splitCurrencyForDisplay(Math.abs(totalRealizedGain), "₹")
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
                               "₹",
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
                               "₹",
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
                         {mutualFunds.length}
                       </Text>
                       <Text fontSize="xs" color="gray.500">
                         Across {amcs.length} AMC{amcs.length !== 1 ? "s" : ""}
                       </Text>
                     </VStack>
                   </Box>
                 </Flex>
               </Box>
             </>
           )}
        </Box>

        {/* AMC and Fund Details */}
        {amcs.length === 0 ? (
          <Card
            bg={cardBg}
            borderColor={borderColor}
            borderWidth={1}
            shadow="sm"
          >
            <CardBody textAlign="center" py={12}>
              <VStack spacing={4}>
                <TrendingUp size={48} color="gray" />
                <Text fontSize="lg" color="gray.500">
                  No AMCs created yet
                </Text>
                <Text color="gray.400">
                  Create your first Asset Management Company to start tracking
                  mutual fund investments
                </Text>
                <Button colorScheme="teal" onClick={onCreateAmc} size="lg">
                  Create Your First AMC
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={4} align="stretch">
            {amcs
              .map((amc) => {
                const amcFunds = mutualFunds.filter(
                  (fund) => fund.amc_id === amc.amc_id,
                );
                 const amcInvested = amcFunds.reduce(
                   (sum, fund) => sum + fund.external_cash_invested,
                   0,
                 );
                const amcCurrentValue = amcFunds.reduce(
                  (sum, fund) => sum + fund.current_value,
                  0,
                );
                const amcRealizedGain = amcFunds.reduce(
                  (sum, fund) => sum + (fund.total_realized_gain || 0),
                  0,
                );
                const amcUnrealizedPnL = amcFunds.reduce((sum, fund) => {
                  const { unrealizedPnl } = calculateFundPnL(fund);
                  return sum + unrealizedPnl;
                }, 0);
                const amcPnL = amcUnrealizedPnL + amcRealizedGain;
                return {
                  ...amc,
                  amcFunds,
                  amcInvested,
                  amcCurrentValue,
                  amcRealizedGain,
                  amcUnrealizedPnL,
                  amcPnL,
                };
              })
              .sort((a, b) => b.amcPnL - a.amcPnL)
              .map((amc) => {
                const amcPnLPercentage =
                  amc.amcInvested > 0
                    ? (amc.amcUnrealizedPnL / amc.amcInvested) * 100
                    : 0;
                const isExpanded = expandedAmc === amc.amc_id;

                return (
                  <Card
                    key={amc.amc_id}
                    bg={cardBg}
                    borderColor={borderColor}
                    borderWidth={1}
                    shadow="sm"
                    _hover={{ shadow: "md", borderColor: "teal.300" }}
                    transition="all 0.2s"
                  >
                    <CardHeader pb={2}>
                      <HStack justify="space-between" align="center" w="full">
                        <HStack spacing={3}>
                          <IconButton
                            icon={
                              isExpanded ? (
                                <ChevronDown size={20} />
                              ) : (
                                <ChevronRight size={20} />
                              )
                            }
                            variant="ghost"
                            size="sm"
                            aria-label="Expand AMC"
                            onClick={() =>
                              amc.amcFunds.length > 0 &&
                              toggleAmcExpansion(amc.amc_id)
                            }
                            isDisabled={amc.amcFunds.length === 0}
                            opacity={amc.amcFunds.length === 0 ? 0.5 : 1}
                          />
                          <Box flex={1}>
                            <HStack
                              justify="space-between"
                              align="center"
                              spacing={3}
                            >
                              <VStack align="start" spacing={0}>
                                <Text
                                  fontSize="xl"
                                  fontWeight="semibold"
                                  color="gray.700"
                                >
                                  {amc.name}
                                </Text>
                                {amc.description && (
                                  <Text color="gray.600" fontSize="md">
                                    {amc.description}
                                  </Text>
                                )}
                              </VStack>
                              <HStack spacing={2}>
                                <Button
                                  size="xs"
                                  colorScheme="teal"
                                  variant="ghost"
                                  onClick={() => onCreateFund(amc.amc_id)}
                                >
                                  Create Fund
                                </Button>
                                {amc.amcFunds.length === 0 && (
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => onDeleteAmc(amc.amc_id)}
                                  >
                                    Delete AMC
                                  </Button>
                                )}
                              </HStack>
                            </HStack>
                          </Box>
                        </HStack>
                        <HStack spacing={6} align="center" display={{ base: "none", lg: "flex" }}>
                          <VStack align="end" spacing={1}>
                            {amc.amcInvested === 0 ? (
                              <>
                                <Text
                                  fontSize="lg"
                                  color="gray.400"
                                  fontWeight="medium"
                                >
                                  --
                                </Text>
                                <Text fontSize="xs" color={mutedColor}>
                                  Invested
                                </Text>
                              </>
                            ) : (
                              <>
                                <HStack spacing={0} align="baseline">
                                  <Text
                                    fontSize="lg"
                                    color={mutedColor}
                                    fontWeight="medium"
                                  >
                                    {
                                      splitCurrencyForDisplay(
                                        amc.amcInvested,
                                        "₹",
                                      ).main
                                    }
                                  </Text>
                                  <Text
                                    fontSize="md"
                                    color={mutedColor}
                                    fontWeight="medium"
                                    opacity={0.7}
                                  >
                                    {
                                      splitCurrencyForDisplay(
                                        amc.amcInvested,
                                        "₹",
                                      ).decimals
                                    }
                                  </Text>
                                </HStack>
                                <Text fontSize="xs" color={mutedColor}>
                                  Invested
                                </Text>
                              </>
                            )}
                          </VStack>
                          <VStack align="end" spacing={1}>
                            {amc.amcCurrentValue === 0 ? (
                              <>
                                <Text
                                  fontSize="lg"
                                  color="gray.400"
                                  fontWeight="medium"
                                >
                                  --
                                </Text>
                                <Text
                                  fontSize="xs"
                                  color={mutedColor}
                                  fontWeight="medium"
                                >
                                  Value
                                </Text>
                              </>
                            ) : (
                              <>
                                <HStack spacing={0} align="baseline">
                                  <Text
                                    fontSize="lg"
                                    fontWeight="semibold"
                                    color="teal.600"
                                  >
                                    {
                                      splitCurrencyForDisplay(
                                        amc.amcCurrentValue,
                                        "₹",
                                      ).main
                                    }
                                  </Text>
                                  <Text
                                    fontSize="md"
                                    fontWeight="semibold"
                                    color="teal.600"
                                    opacity={0.7}
                                  >
                                    {
                                      splitCurrencyForDisplay(
                                        amc.amcCurrentValue,
                                        "₹",
                                      ).decimals
                                    }
                                  </Text>
                                </HStack>
                                <Text
                                  fontSize="xs"
                                  color={mutedColor}
                                  fontWeight="medium"
                                >
                                  Value
                                </Text>
                              </>
                            )}
                          </VStack>
                          <VStack align="end" spacing={1}>
                            {amc.amcFunds.length === 0 ||
                            amc.amcRealizedGain === 0 ? (
                              <>
                                <Text
                                  fontSize="lg"
                                  color="gray.400"
                                  fontWeight="medium"
                                >
                                  --
                                </Text>
                                <Text fontSize="xs" color={mutedColor}>
                                  Realized Gain
                                </Text>
                              </>
                            ) : (
                              <>
                                <HStack spacing={0} align="baseline">
                                  <Text
                                    fontSize="lg"
                                    fontWeight="semibold"
                                    color={
                                      amc.amcRealizedGain >= 0
                                        ? "green.500"
                                        : "red.500"
                                    }
                                  >
                                    {
                                      splitCurrencyForDisplay(
                                        Math.abs(amc.amcRealizedGain),
                                        "₹",
                                      ).main
                                    }
                                  </Text>
                                  <Text
                                    fontSize="md"
                                    fontWeight="semibold"
                                    color={
                                      amc.amcRealizedGain >= 0
                                        ? "green.500"
                                        : "red.500"
                                    }
                                    opacity={0.7}
                                  >
                                    {
                                      splitCurrencyForDisplay(
                                        Math.abs(amc.amcRealizedGain),
                                        "₹",
                                      ).decimals
                                    }
                                  </Text>
                                </HStack>
                                <Text fontSize="xs" color={mutedColor}>
                                  Realized Gain
                                </Text>
                              </>
                            )}
                          </VStack>
                          <VStack align="end" spacing={1}>
                            {amc.amcFunds.length === 0 ||
                            amc.amcUnrealizedPnL === 0 ? (
                              <>
                                <Text
                                  fontSize="lg"
                                  color="gray.400"
                                  fontWeight="medium"
                                >
                                  --
                                </Text>
                                <Text fontSize="xs" color={mutedColor}>
                                  Unrealized P&L
                                </Text>
                              </>
                            ) : (
                              <>
                                <HStack spacing={2} align="baseline">
                                  <HStack spacing={0} align="baseline">
                                    <Text
                                      fontSize="lg"
                                      fontWeight="semibold"
                                      color={
                                        amc.amcUnrealizedPnL >= 0
                                          ? "green.500"
                                          : "red.500"
                                      }
                                    >
                                      {
                                        splitCurrencyForDisplay(
                                          Math.abs(amc.amcUnrealizedPnL),
                                          "₹",
                                        ).main
                                      }
                                    </Text>
                                    <Text
                                      fontSize="md"
                                      fontWeight="semibold"
                                      color={
                                        amc.amcUnrealizedPnL >= 0
                                          ? "green.500"
                                          : "red.500"
                                      }
                                      opacity={0.7}
                                    >
                                      {
                                        splitCurrencyForDisplay(
                                          Math.abs(amc.amcUnrealizedPnL),
                                          "₹",
                                        ).decimals
                                      }
                                    </Text>
                                  </HStack>
                                  <Badge
                                    colorScheme={
                                      amc.amcUnrealizedPnL >= 0
                                        ? "green"
                                        : "red"
                                    }
                                    size="sm"
                                    fontWeight="medium"
                                    px={1.5}
                                    py={0.25}
                                    borderRadius="md"
                                  >
                                    <HStack spacing={0} align="baseline">
                                      <Text fontSize="xs" fontWeight="semibold">
                                        {
                                          splitPercentageForDisplay(
                                            amcPnLPercentage,
                                          ).main
                                        }
                                      </Text>
                                      <Text
                                        fontSize="xs"
                                        fontWeight="semibold"
                                        opacity={0.7}
                                      >
                                        {
                                          splitPercentageForDisplay(
                                            amcPnLPercentage,
                                          ).decimals
                                        }
                                        %
                                      </Text>
                                    </HStack>
                                  </Badge>
                                </HStack>
                                <Text fontSize="xs" color={mutedColor}>
                                  Unrealized P&L
                                </Text>
                              </>
                            )}
                          </VStack>
                          <VStack align="end" spacing={1}>
                            {amc.amcFunds.length === 0 ? (
                              <>
                                <Text
                                  fontSize="md"
                                  color="gray.400"
                                  fontWeight="medium"
                                >
                                  --
                                </Text>
                                <Text fontSize="xs" color={mutedColor}>
                                  Funds
                                </Text>
                              </>
                            ) : (
                              <>
                                <Text
                                  fontSize="md"
                                  fontWeight="semibold"
                                  color="blue.600"
                                >
                                  {amc.amcFunds.length}
                                </Text>
                                <Text fontSize="xs" color={mutedColor}>
                                  Fund{amc.amcFunds.length !== 1 ? "s" : ""}
                                </Text>
                              </>
                            )}
                          </VStack>
                        </HStack>
                      </HStack>
                    </CardHeader>

                    <Collapse in={isExpanded} animateOpacity>
                      <CardBody pt={0}>
                        <Box display={{ base: "block", lg: "none" }} mb={4}>
                          <Divider mb={4} />
                          <SimpleGrid columns={3} spacingX={4} spacingY={3}>
                            <Stat size="sm">
                              <StatLabel fontSize="xs" color={mutedColor}>
                                Invested
                              </StatLabel>
                              <StatNumber fontSize="md" color={mutedColor}>
                                {amc.amcInvested === 0
                                  ? "--"
                                  : splitCurrencyForDisplay(amc.amcInvested, "₹")
                                      .main}
                              </StatNumber>
                            </Stat>
                            <Stat size="sm">
                              <StatLabel fontSize="xs" color={mutedColor}>
                                Value
                              </StatLabel>
                              <StatNumber fontSize="md" color="teal.600">
                                {amc.amcCurrentValue === 0
                                  ? "--"
                                  : splitCurrencyForDisplay(
                                      amc.amcCurrentValue,
                                      "₹",
                                    ).main}
                              </StatNumber>
                            </Stat>
                            <Stat size="sm">
                              <StatLabel fontSize="xs" color={mutedColor}>
                                Realized Gain
                              </StatLabel>
                              <StatNumber
                                fontSize="md"
                                color={
                                  amc.amcRealizedGain >= 0
                                    ? "green.500"
                                    : "red.500"
                                }
                              >
                                {amc.amcRealizedGain === 0
                                  ? "--"
                                  : splitCurrencyForDisplay(
                                      Math.abs(amc.amcRealizedGain),
                                      "₹",
                                    ).main}
                              </StatNumber>
                            </Stat>
                            <Stat size="sm">
                              <StatLabel fontSize="xs" color={mutedColor}>
                                Unrealized P&L
                              </StatLabel>
                              <StatNumber
                                fontSize="md"
                                color={
                                  amc.amcUnrealizedPnL >= 0
                                    ? "green.500"
                                    : "red.500"
                                }
                              >
                                {amc.amcUnrealizedPnL === 0
                                  ? "--"
                                  : splitCurrencyForDisplay(
                                      Math.abs(amc.amcUnrealizedPnL),
                                      "₹",
                                    ).main}
                              </StatNumber>
                            </Stat>
                            <Stat size="sm">
                              <StatLabel fontSize="xs" color={mutedColor}>
                                Funds
                              </StatLabel>
                              <StatNumber fontSize="md" color="blue.600">
                                {amc.amcFunds.length}
                              </StatNumber>
                            </Stat>
                          </SimpleGrid>
                          <Divider mt={4} />
                        </Box>
                        {amc.amcFunds.length === 0 ? (
                          <Box textAlign="center" py={6}>
                            <Text color="gray.500">No funds to display</Text>
                          </Box>
                        ) : (
                          <Grid
                            templateColumns={{
                              base: "1fr",
                              md: "repeat(2, 1fr)",
                              lg: "repeat(3, 1fr)",
                              xl: "repeat(3, 1fr)",
                            }}
                            gap={4}
                            w="full"
                          >
                            {amc.amcFunds.map((fund) => (
                              <GridItem key={fund.mutual_fund_id}>
                                <FundCard fund={fund} />
                              </GridItem>
                            ))}
                          </Grid>
                        )}
                      </CardBody>
                    </Collapse>
                  </Card>
                );
              })}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default MutualFundsOverview;

