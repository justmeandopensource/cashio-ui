import React, { useState, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
  Flex,
  Icon,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  Select,
  FormControl,
} from "@chakra-ui/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import useLedgerStore from "@/components/shared/store";
import { formatNumberAsCurrency } from "@/components/shared/utils";
import { getAmcSummaries, getMutualFunds } from "@/features/mutual-funds/api";
import { AmcSummary, MutualFund } from "@/features/mutual-funds/types";

// Color palette for pie chart segments
const COLORS = [
  "#38B2AC", // teal
  "#3182CE", // blue
  "#805AD5", // purple
  "#D53F8C", // pink
  "#E53E3E", // red
  "#DD6B20", // orange
  "#38A169", // green
  "#4299E1", // light blue
  "#9F7AEA", // light purple
  "#ED64A6", // light pink
];

interface MutualFundsAllocationProps {
  ledgerId?: string;
}

interface ChartData {
  name: string;
  value: number;
  percentage: number;
}

const MutualFundsAllocation: React.FC<MutualFundsAllocationProps> = ({
  ledgerId,
}) => {
  const { currencySymbol } = useLedgerStore();
  const [selectedOwner, setSelectedOwner] = useState<string>("all");

  // Color modes
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const primaryTextColor = useColorModeValue("gray.800", "white");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.300");
  const tooltipBg = useColorModeValue("#fff", "#2d3748");

  // Fetch mutual funds data
  const { data: mutualFunds = [], isLoading: isLoadingFunds } = useQuery<MutualFund[]>({
    queryKey: ["mutual-funds", ledgerId],
    queryFn: () => getMutualFunds(ledgerId!),
    enabled: !!ledgerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch AMC summaries
  const { data: amcSummaries, isLoading: isLoadingSummaries, isError } = useQuery<AmcSummary[]>({
    queryKey: ["amc-summaries", ledgerId],
    queryFn: () => getAmcSummaries(ledgerId!),
    enabled: !!ledgerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isLoading = isLoadingFunds || isLoadingSummaries;

  // Filter funds by owner
  const filteredFunds = useMemo(() => {
    if (selectedOwner === "all") {
      return mutualFunds;
    }
    return mutualFunds.filter((fund) => fund.owner === selectedOwner);
  }, [mutualFunds, selectedOwner]);

  // Get unique owners for dropdown
  const availableOwners = useMemo(() => {
    const owners = Array.from(new Set(mutualFunds.map(fund => fund.owner).filter(Boolean))).sort();
    return owners;
  }, [mutualFunds]);

  // Calculate AMC summaries from filtered funds
  const filteredAmcSummaries = useMemo(() => {
    if (!filteredFunds.length || !amcSummaries) return [];

    const toNumber = (value: number | string): number =>
      typeof value === "string" ? parseFloat(value) : value;

    return amcSummaries.map(amc => {
      const amcFunds = filteredFunds.filter(fund => fund.amc_id === amc.amc_id);
      const totalUnits = amcFunds.reduce((sum, fund) => sum + toNumber(fund.total_units), 0);
      const totalInvested = amcFunds.reduce((sum, fund) => sum + toNumber(fund.total_invested_cash), 0);
      const currentValue = amcFunds.reduce((sum, fund) => sum + toNumber(fund.current_value), 0);
      const totalRealizedGain = amcFunds.reduce((sum, fund) => sum + toNumber(fund.total_realized_gain || 0), 0);

      return {
        amc_id: amc.amc_id,
        name: amc.name,
        total_funds: amcFunds.length,
        total_units: totalUnits,
        average_cost_per_unit: totalUnits > 0 ? totalInvested / totalUnits : 0,
        latest_nav: 0, // Would need to calculate weighted average
        current_value: currentValue,
        total_invested: totalInvested,
        total_realized_gain: totalRealizedGain,
        unrealized_pnl: currentValue - totalInvested,
        unrealized_pnl_percentage: totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0,
      };
    });
  }, [filteredFunds, amcSummaries]);

  // Process data for chart
  const chartData: ChartData[] = React.useMemo(() => {
    if (!filteredAmcSummaries || filteredAmcSummaries.length === 0) return [];

    // Include AMCs with current value > 0
    const dataWithValues = filteredAmcSummaries
      .filter(amc => Number(amc.current_value) > 0)
      .map((amc) => ({
        name: amc.name,
        value: Number(amc.current_value),
      }))
      .sort((a, b) => b.value - a.value);

    const totalValue = dataWithValues.reduce((sum, item) => sum + item.value, 0);

    return dataWithValues.map(item => ({
      ...item,
      percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    }));
  }, [filteredAmcSummaries]);

  const totalPortfolioValue = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          bg={tooltipBg}
          p={3}
          borderRadius="md"
          boxShadow="md"
          border="1px solid"
          borderColor="gray.200"
        >
          <Text fontWeight="bold" color={primaryTextColor}>
            {data.name}
          </Text>
          <Text color={secondaryTextColor}>
            Value: {formatNumberAsCurrency(data.value, currencySymbol as string)}
          </Text>
          <Text color={secondaryTextColor}>
            Share: {data.percentage.toFixed(1)}%
          </Text>
        </Box>
      );
    }
    return null;
  };

  // Render loading state
  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch" bg={cardBg} p={6} borderRadius="lg">
        <Text color={secondaryTextColor}>Loading mutual funds allocation...</Text>
      </VStack>
    );
  }

  // Render error state
  if (isError) {
    return (
      <VStack spacing={4} align="center" bg={cardBg} p={6} borderRadius="lg">
        <Icon as={TrendingUp} color="red.500" boxSize={6} mb={4} />
        <Text color="red.500" fontWeight="bold" fontSize="lg">
          Unable to load mutual funds data
        </Text>
      </VStack>
    );
  }

  return (
    <Box bg={bgColor} borderRadius="lg" p={{ base: 4, md: 6 }} boxShadow="lg">
      {/* Header */}
      <VStack spacing={4} align="stretch" mb={6}>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <VStack align="start" spacing={1} flex={1}>
            <Flex alignItems="center" gap={3}>
              <Icon as={PieChartIcon} w={5} h={5} color={primaryTextColor} />
              <Heading as="h2" size="md" color={primaryTextColor}>
                Mutual Funds - Value by AMC
              </Heading>
            </Flex>
            <Text color={secondaryTextColor} fontSize="sm" pl="2rem">
              Current value distribution of mutual funds across Asset Management Companies
            </Text>
          </VStack>

          {availableOwners.length > 0 && (
            <FormControl maxW={{ base: "full", md: "200px" }}>
              <Select
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                size="sm"
                bg={cardBg}
              >
                <option value="all">All Owners</option>
                {availableOwners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
        </Flex>
      </VStack>

      {/* Chart Section */}
      <Box height={{ base: "300px", md: "400px" }} width="full">
        {chartData.length > 0 ? (
          <Flex height="100%">
            <Box flex={2}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) =>
                      percentage > 5 ? `${name}: ${percentage.toFixed(1)}%` : ""
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box flex={1} pl={4} overflowY="auto">
              <Text fontSize="sm" fontWeight="bold" color={primaryTextColor} mb={2}>
                Legend
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                {chartData.map((item, idx) => (
                  <Flex key={item.name} align="center" mb={1}>
                    <Box
                      w={3}
                      h={3}
                      bg={COLORS[idx % COLORS.length]}
                      borderRadius="full"
                      mr={2}
                      flexShrink={0}
                    />
                    <Text fontSize="xs" color={secondaryTextColor} lineHeight="tight">
                      {item.name} ({item.percentage.toFixed(1)}%)
                    </Text>
                  </Flex>
                ))}
              </Grid>
            </Box>
          </Flex>
        ) : (
          <Center
            height="full"
            bg={bgColor}
            borderRadius="lg"
            flexDirection="column"
            textAlign="center"
            p={6}
          >
            <Icon as={PieChartIcon} boxSize={6} color="tertiaryTextColor" mb={4} />
            <Heading size="md" mb={2} color={secondaryTextColor}>
              No Mutual Funds Data Available
            </Heading>
            <Text color={secondaryTextColor} fontSize="sm">
              Add mutual fund investments to see your portfolio allocation.
            </Text>
          </Center>
        )}
      </Box>



      {/* Summary Stats */}
      {chartData.length > 0 && (
        <VStack spacing={4} mt={6} width="full">
          <HStack
            spacing={4}
            width="full"
            flexDirection={{ base: "column", md: "row" }}
          >
            <Box
              bg={cardBg}
              p={6}
              borderRadius="lg"
              width="full"
              boxShadow="md"
            >
              <Stat>
                <StatLabel color={secondaryTextColor}>Total Portfolio Value</StatLabel>
                <StatNumber color={primaryTextColor}>
                  {formatNumberAsCurrency(totalPortfolioValue, currencySymbol as string)}
                </StatNumber>
              </Stat>
            </Box>

            <Box
              bg={cardBg}
              p={6}
              borderRadius="lg"
              width="full"
              boxShadow="md"
            >
              <Stat>
                <StatLabel color={secondaryTextColor}>AMCs Invested In</StatLabel>
                <StatNumber color={primaryTextColor}>
                  {chartData.length}
                </StatNumber>
              </Stat>
            </Box>
          </HStack>
        </VStack>
      )}
    </Box>
  );
};

export default React.memo(MutualFundsAllocation);