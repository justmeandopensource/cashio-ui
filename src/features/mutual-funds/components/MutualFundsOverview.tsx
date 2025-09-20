 import { FC, useState, useMemo } from "react";
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
   Collapse,
   IconButton,
   Divider,
   SimpleGrid,
   Flex,
   Icon,
   useColorModeValue,
   Switch,
   FormControl,
   FormLabel,
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
  calculateFundPnL,
  splitCurrencyForDisplay,
  splitPercentageForDisplay,
} from "../utils";
import useLedgerStore from "../../../components/shared/store";
import FundCard from "./FundCard";

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
  const { currencySymbol } = useLedgerStore();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedColor = useColorModeValue("gray.600", "gray.400");

   // State for expanded AMCs and funds
   const [expandedAmc, setExpandedAmc] = useState<number | null>(null);
   const [expandedFunds, setExpandedFunds] = useState<Set<number>>(new Set());
   const [showAllAmcs, setShowAllAmcs] = useState(false);

  // Calculate overall portfolio metrics
  const totalInvested = mutualFunds.reduce(
    (sum, fund) => sum + fund.total_invested_cash,
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

   // Filter AMCs based on toggle and funds with non-zero value
   const filteredAmcs = useMemo(() => {
     if (showAllAmcs) return amcs;
     return amcs.filter((amc) => {
       const amcFunds = mutualFunds.filter((fund) => fund.amc_id === amc.amc_id);
       return amcFunds.some((fund) => fund.current_value > 0);
     });
   }, [amcs, mutualFunds, showAllAmcs]);

   // Check if there are AMCs with zero balance (no funds or all funds have zero value)
   const hasZeroBalanceAmcs = useMemo(() => {
     return amcs.some((amc) => {
       const amcFunds = mutualFunds.filter((fund) => fund.amc_id === amc.amc_id);
       return amcFunds.length === 0 || amcFunds.every((fund) => fund.current_value === 0);
     });
   }, [amcs, mutualFunds]);

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





  return (
    <Box>
      <VStack spacing={6} align="stretch">
          {/* Header with Portfolio Summary - Only show if there are AMCs */}
          {amcs.length > 0 && (
            <Box
              p={{ base: 4, md: 6 }}
              bg="white"
              borderRadius="lg"
              boxShadow="sm"
            >
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
              </Flex>
           </Flex>

            {/* Portfolio Stats */}
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
                 {/* AMC Filter Toggle */}
                 {hasZeroBalanceAmcs && (
                   <Box mt={4} display="flex" justifyContent="flex-start" alignItems="center" gap={3}>
                     <Text fontSize="sm" color="gray.600" fontWeight="medium">
                       Show zero balance AMCs
                     </Text>
                     <Switch
                       id="show-all-amcs"
                       isChecked={showAllAmcs}
                       onChange={(e) => setShowAllAmcs(e.target.checked)}
                       colorScheme="teal"
                       size="md"
                     />
                   </Box>
                 )}
              </Box>
           )}

         {/* AMC and Fund Details */}
         {filteredAmcs.length === 0 ? (
           <Box
             p={12}
             textAlign="center"
             bg={useColorModeValue("gray.50", "gray.800")}
             borderRadius="lg"
             border="2px dashed"
             borderColor="gray.300"
           >
             <VStack spacing={4}>
               <Icon as={TrendingUp} boxSize={16} color="gray.400" />
               <VStack spacing={2}>
                 <Text fontSize="xl" fontWeight="semibold" color="gray.700">
                   {amcs.length === 0 ? "No AMCs Created Yet" : showAllAmcs ? "No AMCs Available" : "No AMCs with Active Funds"}
                 </Text>
                 <Text fontSize="md" color={useColorModeValue("gray.600", "gray.400")} maxW="400px">
                   {amcs.length === 0
                     ? "Create your first Asset Management Company to start tracking mutual fund investments"
                     : showAllAmcs
                     ? "There are no AMCs in your portfolio"
                     : "Toggle 'Show All AMCs' to view all companies or create funds with value"
                   }
                 </Text>
               </VStack>
               {amcs.length === 0 && (
                 <Button colorScheme="teal" onClick={onCreateAmc} size="lg">
                   Create Your First AMC
                 </Button>
               )}
             </VStack>
           </Box>
        ) : (
           <VStack spacing={4} align="stretch">
             {filteredAmcs
               .map((amc) => {
                const amcFunds = mutualFunds.filter(
                  (fund) => fund.amc_id === amc.amc_id,
                );
                  const amcInvested = amcFunds.reduce(
                    (sum, fund) => sum + fund.total_invested_cash,
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
                 const isExpanded = expandedAmc === amc.amc_id && amc.amcFunds.length > 0;

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
                    <CardHeader pt={2} pb={2}>
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
                                        currencySymbol || "₹",
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
                                        currencySymbol || "₹",
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
                                        currencySymbol || "₹",
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
                                        currencySymbol || "₹",
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
                                        currencySymbol || "₹",
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
                                        currencySymbol || "₹",
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
                                          currencySymbol || "₹",
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
                                          currencySymbol || "₹",
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

                     <Collapse in={isExpanded} transition={{ enter: { duration: 0 }, exit: { duration: 0 } }} animateOpacity={false}>
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
                                  : splitCurrencyForDisplay(amc.amcInvested, currencySymbol || "₹")
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
                                      currencySymbol || "₹",
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
                                      currencySymbol || "₹",
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
                                      currencySymbol || "₹",
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
                                 <FundCard
                                   fund={fund}
                                   isExpanded={expandedFunds.has(fund.mutual_fund_id)}
                                   onToggleExpansion={toggleFundExpansion}
                                   onTradeUnits={onTradeUnits}
                                   onTransferUnits={onTransferUnits}
                                   onUpdateNav={onUpdateNav}
                                   onCloseFund={onCloseFund}
                                 />
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

