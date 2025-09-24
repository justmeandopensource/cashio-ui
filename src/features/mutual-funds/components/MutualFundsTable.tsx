import React, { useState, useMemo } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Button,
  HStack,
  Collapse,
  IconButton,
  Select,
  Flex,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShoppingCart,
  ArrowRightLeft,
  RefreshCw,
  XCircle,
  List,
} from "lucide-react";
import { MutualFund, Amc } from "../types";
import {
  calculateFundPnL,
  splitCurrencyForDisplay,
  splitPercentageForDisplay,
  formatUnits,
  formatNav,
  calculateHighestPurchaseCost,
  calculateLowestPurchaseCost,
} from "../utils";

// Helper function to convert string|number to number
const toNumber = (value: number | string): number => typeof value === 'string' ? parseFloat(value) : value;
import { useFundTransactions } from "../api";
import useLedgerStore from "../../../components/shared/store";

// Expanded Fund Row Component
interface ExpandedFundRowProps {
  fund: MutualFund & { amc_name: string; invested: number; unrealized_pnl_percentage: number };
  currencySymbol: string | undefined;
  mutedColor: string;
  isExpanded: boolean;
  onTradeUnits: (fundId: number) => void;
  onTransferUnits: (fundId: number) => void;
  onUpdateNav: (fund: MutualFund) => void;
  onCloseFund: (fundId: number) => void;
  onViewTransactions: (fundId: number) => void;
}

const ExpandedFundRow: React.FC<ExpandedFundRowProps> = ({
  fund,
  currencySymbol,
  mutedColor,
  isExpanded,
  onTradeUnits,
  onTransferUnits,
  onUpdateNav,
  onCloseFund,
  onViewTransactions,
}) => {
  const { unrealizedPnl, realizedPnl } = calculateFundPnL(fund);
  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useFundTransactions(fund.ledger_id, fund.mutual_fund_id, {
      enabled: isExpanded,
    });

  // Convert transactions for cost calculations
  const purchaseTransactions = transactions.map((t) => ({
    transaction_type: t.transaction_type,
    nav_per_unit: toNumber(t.nav_per_unit),
  }));

  const highestPurchaseCost = calculateHighestPurchaseCost(purchaseTransactions);
  const lowestPurchaseCost = calculateLowestPurchaseCost(purchaseTransactions);
  const boxBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      py={{ base: 2, md: 3 }}
      px={{ base: 2, md: 3 }}
      pl={{ md: "4.5rem" }}
      bg={boxBg}
      borderTop="1px solid"
      borderColor={borderColor}
    >
      <Flex
        wrap="wrap"
        align="center"
        justify="space-between"
        columnGap={4}
        rowGap={3}
      >
        <HStack spacing={{ base: 3, md: 5 }} wrap="wrap">
          <Stat size="sm">
            <StatLabel fontSize="2xs" color={mutedColor} whiteSpace="nowrap">
              Lowest Cost
            </StatLabel>
            <HStack spacing={0} align="baseline">
              <StatNumber fontSize="sm">
                {isLoadingTransactions
                  ? "..."
                  : lowestPurchaseCost !== null
                  ? splitCurrencyForDisplay(
                      lowestPurchaseCost,
                      currencySymbol || "₹",
                    ).main
                  : "--"}
              </StatNumber>
              <Text fontSize="xs" opacity={0.7}>
                {isLoadingTransactions
                  ? ""
                  : lowestPurchaseCost !== null
                  ? splitCurrencyForDisplay(
                      lowestPurchaseCost,
                      currencySymbol || "₹",
                    ).decimals
                  : ""}
              </Text>
            </HStack>
          </Stat>
          <Stat size="sm">
            <StatLabel fontSize="2xs" color={mutedColor} whiteSpace="nowrap">
              Avg. Cost
            </StatLabel>
            <HStack spacing={0} align="baseline">
              <StatNumber fontSize="sm">
                {
                  splitCurrencyForDisplay(
                    toNumber(fund.average_cost_per_unit),
                    currencySymbol || "₹",
                  ).main
                }
              </StatNumber>
              <Text fontSize="xs" opacity={0.7}>
                {
                  splitCurrencyForDisplay(
                    toNumber(fund.average_cost_per_unit),
                    currencySymbol || "₹",
                  ).decimals
                }
              </Text>
            </HStack>
          </Stat>
          <Stat size="sm">
            <StatLabel fontSize="2xs" color={mutedColor} whiteSpace="nowrap">
              Highest Cost
            </StatLabel>
            <HStack spacing={0} align="baseline">
              <StatNumber fontSize="sm">
                {isLoadingTransactions
                  ? "..."
                  : highestPurchaseCost !== null
                  ? splitCurrencyForDisplay(
                      highestPurchaseCost,
                      currencySymbol || "₹",
                    ).main
                  : "--"}
              </StatNumber>
              <Text fontSize="xs" opacity={0.7}>
                {isLoadingTransactions
                  ? ""
                  : highestPurchaseCost !== null
                  ? splitCurrencyForDisplay(
                      highestPurchaseCost,
                      currencySymbol || "₹",
                    ).decimals
                  : ""}
              </Text>
            </HStack>
          </Stat>
          <Stat size="sm">
            <StatLabel fontSize="2xs" color={mutedColor} whiteSpace="nowrap">
              Realized P&L
            </StatLabel>
            <HStack spacing={0} align="baseline">
              <StatNumber
                fontSize="sm"
                color={realizedPnl >= 0 ? "green.500" : "red.500"}
              >
                {
                  splitCurrencyForDisplay(
                    Math.abs(realizedPnl),
                    currencySymbol || "₹",
                  ).main
                }
              </StatNumber>
              <Text
                fontSize="xs"
                color={realizedPnl >= 0 ? "green.500" : "red.500"}
                opacity={0.7}
              >
                {
                  splitCurrencyForDisplay(
                    Math.abs(realizedPnl),
                    currencySymbol || "₹",
                  ).decimals
                }
              </Text>
            </HStack>
          </Stat>
        </HStack>

        <HStack spacing={2}>
           <Button
             size="xs"
             variant="outline"
             leftIcon={<Icon as={ShoppingCart} boxSize={3} />}
             onClick={() => onTradeUnits(fund.mutual_fund_id)}
           >
             Buy/Sell
           </Button>
           <Button
             size="xs"
             variant="outline"
             leftIcon={<Icon as={ArrowRightLeft} boxSize={3} />}
             onClick={() => onTransferUnits(fund.mutual_fund_id)}
             isDisabled={toNumber(fund.total_units) <= 0}
           >
             Transfer
           </Button>
           <Button
             size="xs"
             variant="outline"
             leftIcon={<Icon as={List} boxSize={3} />}
             onClick={() => onViewTransactions(fund.mutual_fund_id)}
           >
             Transactions
           </Button>
           <Button
             size="xs"
             variant="outline"
             leftIcon={<Icon as={RefreshCw} boxSize={3} />}
             onClick={() => onUpdateNav(fund)}
           >
             Update NAV
           </Button>
           <Button
             size="xs"
             variant="outline"
             colorScheme="red"
             leftIcon={<Icon as={XCircle} boxSize={3} />}
             onClick={() => onCloseFund(fund.mutual_fund_id)}
             isDisabled={toNumber(fund.total_units) > 0}
           >
             Close
           </Button>
         </HStack>
      </Flex>
    </Box>
  );
};

interface MutualFundsTableProps {
  amcs: Amc[];
  mutualFunds: MutualFund[];
  onTradeUnits: (fundId: number) => void;
  onTransferUnits: (fundId: number) => void;
  onUpdateNav: (fund: MutualFund) => void;
  onCloseFund: (fundId: number) => void;
  onViewTransactions: (fundId: number) => void;
}

type SortField =
  | "amc"
  | "fund"
  | "invested"
  | "value"
  | "unrealized_pnl"
  | "unrealized_pnl_percentage";

type SortDirection = "asc" | "desc";

const MutualFundsTable: React.FC<MutualFundsTableProps> = ({
  amcs,
  mutualFunds,
  onTradeUnits,
  onTransferUnits,
  onUpdateNav,
  onCloseFund,
  onViewTransactions,
}) => {
  const { currencySymbol } = useLedgerStore();
  const mutedColor = useColorModeValue("gray.600", "gray.400");

  // State for sorting
  const [sortField, setSortField] =
    useState<SortField>("unrealized_pnl_percentage");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // State for filtering
  const [selectedAmc, setSelectedAmc] = useState<string>("all");
  const [showZeroBalance, setShowZeroBalance] = useState(false);

  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Helper to get plan initials
  const getPlanInitials = (plan: string | null | undefined): string => {
    if (plan === "Direct Growth") return "DG";
    if (plan === "Regular Growth") return "RG";
    return "";
  };

  // Prepare data with AMC names
  const fundsWithAmc = useMemo(() => {
    return mutualFunds.map((fund) => {
      const amc = amcs.find((amc) => amc.amc_id === fund.amc_id);
      const investedNum =
        toNumber(fund.total_invested_cash) ||
        toNumber(fund.total_units) * toNumber(fund.average_cost_per_unit);
      const currentValueNum = toNumber(fund.current_value);
      const { unrealizedPnl } = calculateFundPnL(fund);
      const unrealizedPnlPercentage =
        investedNum > 0 ? (unrealizedPnl / investedNum) * 100 : 0;

      return {
        ...fund,
        amc_name: amc?.name || "Unknown AMC",
        invested: investedNum,
        current_value: currentValueNum,
        unrealized_pnl: unrealizedPnl,
        unrealized_pnl_percentage: unrealizedPnlPercentage,
      };
    });
  }, [mutualFunds, amcs]);

  // Filter funds based on selected AMC and zero balance toggle
  const filteredFunds = useMemo(() => {
    let funds = fundsWithAmc;

    // AMC filter
    if (selectedAmc !== "all") {
      funds = funds.filter((fund) => fund.amc_name === selectedAmc);
    }

    // Zero balance filter
    if (!showZeroBalance) {
      funds = funds.filter((fund) => toNumber(fund.total_units) > 0);
    }

    return funds;
  }, [fundsWithAmc, selectedAmc, showZeroBalance]);

  // Sort funds
  const sortedFunds = useMemo(() => {
    return [...filteredFunds].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "amc":
          aValue = a.amc_name.toLowerCase();
          bValue = b.amc_name.toLowerCase();
          break;
        case "fund":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "invested":
          aValue = a.invested;
          bValue = b.invested;
          break;
        case "value":
          aValue = a.current_value;
          bValue = b.current_value;
          break;
        case "unrealized_pnl":
          aValue = a.unrealized_pnl;
          bValue = b.unrealized_pnl;
          break;
        case "unrealized_pnl_percentage":
          aValue = a.unrealized_pnl_percentage;
          bValue = b.unrealized_pnl_percentage;
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortDirection === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [filteredFunds, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleRowExpansion = (fundId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(fundId)) {
      newExpanded.delete(fundId);
    } else {
      newExpanded.add(fundId);
    }
    setExpandedRows(newExpanded);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} />;
    return sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const renderExpandedRow = (
    fund: MutualFund & {
      amc_name: string;
      invested: number;
      unrealized_pnl: number;
      unrealized_pnl_percentage: number;
    },
  ) => {
    return (
      <Tr key={`expanded-${fund.mutual_fund_id}`}>
        <Td colSpan={9} p={0}>
          <Collapse in={expandedRows.has(fund.mutual_fund_id)} animateOpacity>
            <ExpandedFundRow
              fund={fund}
              currencySymbol={currencySymbol}
              mutedColor={mutedColor}
              isExpanded={expandedRows.has(fund.mutual_fund_id)}
              onTradeUnits={onTradeUnits}
              onTransferUnits={onTransferUnits}
              onUpdateNav={onUpdateNav}
              onCloseFund={onCloseFund}
              onViewTransactions={onViewTransactions}
            />
          </Collapse>
        </Td>
      </Tr>
    );
  };

  return (
    <Box>
      {/* Filter Controls */}
      <Flex mb={4} gap={4} align="center" wrap="wrap" justify="space-between">
        <Select
          value={selectedAmc}
          onChange={(e) => setSelectedAmc(e.target.value)}
          size="sm"
          maxW="200px"
        >
          <option value="all">All AMCs</option>
          {amcs
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((amc) => (
              <option key={amc.amc_id} value={amc.name}>
                {amc.name}
              </option>
            ))}
        </Select>
        <FormControl display="flex" alignItems="center" w="auto">
          <FormLabel
            htmlFor="show-zero-balance"
            mb="0"
            fontSize="sm"
            whiteSpace="nowrap"
          >
            Show Zero Balance
          </FormLabel>
          <Switch
            id="show-zero-balance"
            isChecked={showZeroBalance}
            onChange={(e) => setShowZeroBalance(e.target.checked)}
            size="sm"
            colorScheme="teal"
          />
        </FormControl>
      </Flex>

      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" size="sm" minW="800px">
          <Thead>
            <Tr>
              <Th width="2%"></Th>
              <Th width="12%" cursor="pointer" onClick={() => handleSort("amc")}>
                <Flex align="center" gap={1}>
                  AMC {getSortIcon("amc")}
                </Flex>
              </Th>
              <Th
                width="28%"
                cursor="pointer"
                onClick={() => handleSort("fund")}
              >
                <Flex align="center" gap={1}>
                  Fund {getSortIcon("fund")}
                </Flex>
              </Th>
              <Th
                width="8%"
                isNumeric
                display={{ base: "none", lg: "table-cell" }}
              >
                NAV
              </Th>
              <Th
                width="8%"
                isNumeric
                display={{ base: "none", md: "table-cell" }}
              >
                Units
              </Th>
              <Th
                width="10%"
                isNumeric
                cursor="pointer"
                onClick={() => handleSort("invested")}
                display={{ base: "none", md: "table-cell" }}
              >
                <Flex align="center" gap={1} justify="flex-end">
                  Invested {getSortIcon("invested")}
                </Flex>
              </Th>
              <Th
                width="10%"
                isNumeric
                cursor="pointer"
                onClick={() => handleSort("value")}
              >
                <Flex align="center" gap={1} justify="flex-end">
                  Value {getSortIcon("value")}
                </Flex>
              </Th>
              <Th
                width="12%"
                isNumeric
                cursor="pointer"
                onClick={() => handleSort("unrealized_pnl")}
              >
                <Flex align="center" gap={1} justify="flex-end">
                  P&L {getSortIcon("unrealized_pnl")}
                </Flex>
              </Th>
              <Th
                width="8%"
                isNumeric
                cursor="pointer"
                onClick={() => handleSort("unrealized_pnl_percentage")}
              >
                <Flex align="center" gap={1} justify="flex-end">
                  P&L % {getSortIcon("unrealized_pnl_percentage")}
                </Flex>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedFunds.map((fund) => (
              <React.Fragment key={fund.mutual_fund_id}>
                <Tr
                  _hover={{ bg: "gray.50", cursor: "pointer" }}
                  onClick={() => toggleRowExpansion(fund.mutual_fund_id)}
                >
                  <Td>
                    <IconButton
                      icon={
                        expandedRows.has(fund.mutual_fund_id) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )
                      }
                      variant="ghost"
                      size="xs"
                      aria-label="Expand row"
                    />
                  </Td>
                  <Td fontWeight="medium">{fund.amc_name}</Td>
                  <Td>
                    <HStack spacing={1} align="baseline">
                      <Text fontWeight="medium" noOfLines={1}>
                        {fund.name}
                      </Text>
                      {getPlanInitials(fund.plan) && (
                        <Text
                          as="span"
                          fontSize="xs"
                          color="gray.500"
                          fontWeight="normal"
                        >
                          ({getPlanInitials(fund.plan)})
                        </Text>
                      )}
                    </HStack>
                  </Td>
                  <Td isNumeric display={{ base: "none", lg: "table-cell" }}>
                    {currencySymbol || "₹"}
                    {formatNav(fund.latest_nav)}
                  </Td>
                  <Td isNumeric display={{ base: "none", md: "table-cell" }}>
                    {formatUnits(fund.total_units)}
                  </Td>
                  <Td isNumeric display={{ base: "none", md: "table-cell" }}>
                    <HStack spacing={0} align="baseline" justify="flex-end">
                      <Text fontSize="sm">
                        {
                          splitCurrencyForDisplay(
                            fund.invested,
                            currencySymbol || "₹",
                          ).main
                        }
                      </Text>
                      <Text fontSize="xs" opacity={0.7}>
                        {
                          splitCurrencyForDisplay(
                            fund.invested,
                            currencySymbol || "₹",
                          ).decimals
                        }
                      </Text>
                    </HStack>
                  </Td>
                  <Td isNumeric>
                    <HStack spacing={0} align="baseline" justify="flex-end">
                      <Text fontSize="sm">
                        {
                          splitCurrencyForDisplay(
                            fund.current_value,
                            currencySymbol || "₹",
                          ).main
                        }
                      </Text>
                      <Text fontSize="xs" opacity={0.7}>
                        {
                          splitCurrencyForDisplay(
                            fund.current_value,
                            currencySymbol || "₹",
                          ).decimals
                        }
                      </Text>
                    </HStack>
                  </Td>
                  <Td isNumeric>
                    <HStack spacing={0} align="baseline" justify="flex-end">
                      <Text
                        fontSize="sm"
                        color={fund.unrealized_pnl >= 0 ? "green.500" : "red.500"}
                      >
                        {
                          splitCurrencyForDisplay(
                            Math.abs(fund.unrealized_pnl),
                            currencySymbol || "₹",
                          ).main
                        }
                      </Text>
                      <Text
                        fontSize="xs"
                        color={fund.unrealized_pnl >= 0 ? "green.500" : "red.500"}
                        opacity={0.7}
                      >
                        {
                          splitCurrencyForDisplay(
                            Math.abs(fund.unrealized_pnl),
                            currencySymbol || "₹",
                          ).decimals
                        }
                      </Text>
                    </HStack>
                  </Td>
                  <Td isNumeric>
                    <HStack spacing={0} align="baseline" justify="flex-end">
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={
                          fund.unrealized_pnl_percentage >= 0
                            ? "green.500"
                            : "red.500"
                        }
                      >
                        {
                          splitPercentageForDisplay(
                            fund.unrealized_pnl_percentage,
                          ).main
                        }
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color={
                          fund.unrealized_pnl_percentage >= 0
                            ? "green.500"
                            : "red.500"
                        }
                        opacity={0.7}
                      >
                        {
                          splitPercentageForDisplay(
                            fund.unrealized_pnl_percentage,
                          ).decimals
                        }
                      </Text>
                    </HStack>
                  </Td>
                </Tr>
                {renderExpandedRow(fund)}
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
      </Box>

      {sortedFunds.length === 0 && (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">
            No mutual funds found matching the current filter.
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default MutualFundsTable;