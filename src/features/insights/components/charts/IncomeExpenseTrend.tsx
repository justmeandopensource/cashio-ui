import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Select,
  useColorModeValue,
  Flex,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
} from "@chakra-ui/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { FiTrendingUp, FiTrendingDown, FiChevronDown } from "react-icons/fi";
import config from "@/config";

// Interfaces
interface TrendData {
  period: string;
  income: number;
  expense: number;
}

interface SummaryData {
  income: {
    total: number;
    highest: {
      period: string;
      amount: number;
    };
    average: number;
  };
  expense: {
    total: number;
    highest: {
      period: string;
      amount: number;
    };
    average: number;
  };
}

interface InsightsData {
  trend_data: TrendData[];
  summary: SummaryData;
}

interface IncomeExpenseTrendProps {
  ledgerId?: string;
}

// Period options
const periodOptions = [
  { value: "last_12_months", label: "Last 12 Months" },
  { value: "monthly_since_beginning", label: "Monthly Overview" },
  { value: "yearly_since_beginning", label: "Yearly Snapshot" },
];

// Utility functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPeriod = (period: string) => {
  if (period.includes("-")) {
    const [year, month] = period.split("-");
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
      "en-US",
      {
        month: "short",
        year: "numeric",
      },
    );
  }
  return period;
};

const IncomeExpenseTrend: React.FC<IncomeExpenseTrendProps> = ({
  ledgerId,
}) => {
  const [periodType, setPeriodType] = useState<string>("last_12_months");

  // Color modes
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const primaryTextColor = useColorModeValue("gray.800", "white");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.300");
  const gridStroke = useColorModeValue("#e2e8f0", "#2d3748");
  const axisTickColor = useColorModeValue("#718096", "#cbd5e0");
  const tooltipBg = useColorModeValue("#fff", "#2d3748");

  // Fetch data
  const { data, isLoading, isError } = useQuery<InsightsData>({
    queryKey: ["insights", ledgerId, periodType],
    queryFn: async () => {
      if (!ledgerId) return null;

      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${config.apiBaseUrl}/ledger/${ledgerId}/insights/income-expense-trend?period_type=${periodType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch insights data");
      }

      return response.json();
    },
    enabled: !!ledgerId,
    staleTime: 1000 * 60 * 5,
  });

  // Render loading or error states
  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch" bg={cardBg} p={6} borderRadius="xl">
        <Text color={secondaryTextColor}>Loading financial insights...</Text>
      </VStack>
    );
  }

  if (isError) {
    return (
      <VStack spacing={4} align="center" bg={cardBg} p={6} borderRadius="xl">
        <Icon as={FiTrendingDown} color="red.500" boxSize={10} mb={4} />
        <Text color="red.500" fontWeight="bold" fontSize="lg">
          Unable to load financial insights
        </Text>
      </VStack>
    );
  }

  return (
    <Box bg={bgColor} borderRadius="lg" p={{ base: 4, md: 6 }} boxShadow="lg">
      {/* Header with Period Selector */}
      <VStack spacing={4} align="stretch" mb={6}>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          flexDirection={{ base: "column", md: "row" }}
          gap={4}
        >
          <VStack align="flex-start" spacing={1} flex={1}>
            <Heading size="md" color={primaryTextColor}>
              Income vs Expense Trend
            </Heading>
            <Text color={secondaryTextColor} fontSize="sm">
              {periodOptions.find((opt) => opt.value === periodType)?.label}
            </Text>
          </VStack>

          <Select
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value)}
            maxW={{ base: "full", md: "250px" }}
            icon={<FiChevronDown />}
            variant="filled"
            bg={cardBg}
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Flex>
      </VStack>

      {/* Chart Section */}
      <Box height={{ base: "300px", md: "400px" }} width="full">
        {data?.trend_data?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.trend_data}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="period"
                tickFormatter={formatPeriod}
                tick={{
                  fontSize: "0.7rem",
                  fill: axisTickColor,
                }}
              />
              <YAxis
                tickFormatter={(value) =>
                  value === 0 ? "" : formatCurrency(value).replace("£", "")
                }
                tick={{
                  fontSize: "0.7rem",
                  fill: axisTickColor,
                }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={formatPeriod}
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderRadius: "10px",
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#38B2AC"
                fill="#38B2AC"
                fillOpacity={0.3}
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#E53E3E"
                fill="#E53E3E"
                fillOpacity={0.3}
                name="Expense"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Flex height="full" alignItems="center" justifyContent="center">
            <Text color={secondaryTextColor}>
              No data available for selected period
            </Text>
          </Flex>
        )}
      </Box>

      {/* Summary Cards */}
      {data?.summary && (
        <VStack spacing={4} mt={6} width="full">
          <HStack
            spacing={4}
            width="full"
            flexDirection={{ base: "column", md: "row" }}
          >
            {/* Income Summary */}
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              width="full"
              boxShadow="md"
            >
              <VStack align="stretch" spacing={4}>
                <HStack justifyContent="space-between">
                  <Heading size="md" color="teal.500">
                    Income
                  </Heading>
                  <Icon as={FiTrendingUp} color="teal.500" boxSize={6} />
                </HStack>

                <Stat>
                  <StatLabel color={secondaryTextColor}>Total Income</StatLabel>
                  <StatNumber color={primaryTextColor}>
                    {formatCurrency(data.summary.income.total)}
                  </StatNumber>
                  <StatHelpText>
                    <Badge colorScheme="teal" variant="subtle">
                      Avg: {formatCurrency(data.summary.income.average)}
                    </Badge>
                  </StatHelpText>
                </Stat>

                <Box>
                  <Text fontSize="sm" color={secondaryTextColor}>
                    Highest:{" "}
                    {formatCurrency(data.summary.income.highest.amount)} in{" "}
                    {formatPeriod(data.summary.income.highest.period)}
                  </Text>
                </Box>
              </VStack>
            </Box>

            {/* Expense Summary */}
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              width="full"
              boxShadow="md"
            >
              <VStack align="stretch" spacing={4}>
                <HStack justifyContent="space-between">
                  <Heading size="md" color="red.500">
                    Expenses
                  </Heading>
                  <Icon as={FiTrendingDown} color="red.500" boxSize={6} />
                </HStack>

                <Stat>
                  <StatLabel color={secondaryTextColor}>
                    Total Expenses
                  </StatLabel>
                  <StatNumber color={primaryTextColor}>
                    {formatCurrency(data.summary.expense.total)}
                  </StatNumber>
                  <StatHelpText>
                    <Badge colorScheme="red" variant="subtle">
                      Avg: {formatCurrency(data.summary.expense.average)}
                    </Badge>
                  </StatHelpText>
                </Stat>

                <Box>
                  <Text fontSize="sm" color={secondaryTextColor}>
                    Highest:{" "}
                    {formatCurrency(data.summary.expense.highest.amount)} in{" "}
                    {formatPeriod(data.summary.expense.highest.period)}
                  </Text>
                </Box>
              </VStack>
            </Box>
          </HStack>
        </VStack>
      )}
    </Box>
  );
};

export default IncomeExpenseTrend;
