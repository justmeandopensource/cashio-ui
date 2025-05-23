import React, { PureComponent, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Center,
  Grid,
  GridItem,
  Collapse,
  Flex,
} from "@chakra-ui/react";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiBarChart2,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";
import config from "@/config";
import useLedgerStore from "@/components/shared/store";
import { formatNumberAsCurrency } from "@/components/shared/utils";

// Soft, pleasant color palette
const INCOME_COLORS = [
  "#6FD6B0", // Soft Teal
  "#5ECBBC", // Mint Green
  "#4EBFB9", // Sea Green
  "#3EB3B5", // Aqua
  "#2EA7B1", // Turquoise
  "#1E9BAD", // Blue-Green
];

const EXPENSE_COLORS = [
  "#F5845A", // Warm Coral
  "#E97B4E", // Burnt Orange
  "#EB6D3F", // Deep Tangerine
  "#F4A460", // Sandy Brown
  "#E67E51", // Soft Terracotta
  "#F1B16D", // Muted Apricot
  "#D4694C", // Rust
  "#F08080", // Light Coral
  "#CD5C5C", // Indian Red
  "#E99B6C", // Soft Copper
  "#C76D5D", // Dark Salmon
  "#F3A062", // Warm Amber
];

interface CategoryData {
  name: string;
  value: number;
  color?: string;
  children?: CategoryData[] | null;
}

interface CurrentMonthOverviewData {
  total_income: number;
  total_expense: number;
  income_categories_breakdown: CategoryData[];
  expense_categories_breakdown: CategoryData[];
}

interface CustomizedTreemapContentProps {
  root?: {
    name?: string;
    value?: number;
    children?: any[];
  };
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  colors: string[];
}

const NestedCategoryBreakdown: React.FC<{
  categories: CategoryData[];
  type: "income" | "expense";
  currencySymbol: string;
}> = ({ categories, type, currencySymbol }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName],
    );
  };

  const renderCategory = (category: CategoryData, level = 0) => {
    const isExpanded = expandedCategories.includes(category.name);
    const hasChildren = category.children && category.children.length > 0;

    const textColor =
      level === 0 ? `${type === "income" ? "teal" : "red"}.700` : "gray.800";

    return (
      <Box key={category.name}>
        <Flex
          align="center"
          p={2}
          borderRadius="md"
          mb={1}
          pl={`${level * 15 + 10}px`}
          cursor={hasChildren ? "pointer" : "default"}
          onClick={
            hasChildren ? () => toggleCategory(category.name) : undefined
          }
          _hover={
            hasChildren || level === 0
              ? { bg: `${type === "income" ? "teal" : "red"}.100` }
              : { bg: "gray.200" }
          }
        >
          {hasChildren && (
            <Icon
              as={isExpanded ? FiChevronDown : FiChevronRight}
              mr={2}
              color={textColor}
            />
          )}
          <Box flex={1}>
            <Text fontWeight="medium" color={textColor} fontSize="sm">
              {category.name}
            </Text>
          </Box>
          <Text color={textColor}>
            {formatNumberAsCurrency(category.value, currencySymbol)}
          </Text>
        </Flex>
        {hasChildren && isExpanded && (
          <Collapse in={isExpanded}>
            <Box pl={`${level * 15 + 25}px`}>
              {category.children?.map((child) =>
                renderCategory(child, level + 1),
              )}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Heading
        size="sm"
        color={useColorModeValue(
          `${type === "income" ? "teal" : "red"}.600`,
          `${type === "income" ? "teal" : "red"}.300`,
        )}
        mb={4}
        display="flex"
        alignItems="center"
      >
        <Icon
          as={FiBarChart2}
          mr={2}
          color={type === "income" ? "teal.500" : "red.500"}
        />
        {type === "income" ? "Income" : "Expense"} Categories
      </Heading>
      <VStack
        align="stretch"
        spacing={2}
        bg={useColorModeValue("gray.50", "gray.700")}
        p={4}
        borderRadius="lg"
      >
        {categories.map((category) => renderCategory(category))}
      </VStack>
    </Box>
  );
};

class CustomizedTreemapContent extends PureComponent<CustomizedTreemapContentProps> {
  render() {
    const {
      root,
      depth = 0,
      x = 0,
      y = 0,
      width = 0,
      height = 0,
      index = 0,
      colors,
    } = this.props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill:
              depth < 2
                ? colors[
                    Math.floor(
                      (index / (root?.children?.length || 1)) * colors.length,
                    )
                  ]
                : "#ffffff00",
            stroke: "#fff",
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
      </g>
    );
  }
}

// Main Component
const CurrentMonthOverview: React.FC = () => {
  // Color modes
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const primaryTextColor = useColorModeValue("gray.800", "white");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.300");
  const customToolTipBorderColor = useColorModeValue("gray.200", "gray.600");

  // Currency symbol from global store
  const { ledgerId, currencySymbol } = useLedgerStore();

  // Fetch data
  const { data, isLoading, isError } = useQuery<CurrentMonthOverviewData>({
    queryKey: ["current-month-overview", ledgerId],
    queryFn: async () => {
      if (!ledgerId) return null;

      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${config.apiBaseUrl}/ledger/${ledgerId}/insights/current-month-overview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch current month overview");
      }

      return response.json();
    },
    enabled: !!ledgerId,
    staleTime: 1000 * 60 * 5,
  });

  // Render loading state
  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch" bg={cardBg} p={6} borderRadius="xl">
        <Text color={secondaryTextColor}>Loading financial insights...</Text>
      </VStack>
    );
  }

  // Render error state
  if (isError || !data) {
    return (
      <VStack spacing={4} align="center" bg={cardBg} p={6} borderRadius="xl">
        <Icon as={FiTrendingDown} color="red.500" boxSize={10} mb={4} />
        <Text color="red.500" fontWeight="bold" fontSize="lg">
          Unable to load financial insights
        </Text>
      </VStack>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalValue = data.root?.value || data.value;
      const parentName = data.root?.name;
      return (
        <Box
          bg={bgColor}
          p={3}
          borderRadius="md"
          boxShadow="md"
          border="1px solid"
          borderColor={customToolTipBorderColor}
        >
          <Text fontWeight="bold" color={primaryTextColor}>
            {data.name}
          </Text>
          {parentName && (
            <Text fontSize="sm" color={secondaryTextColor}>
              {parentName}
            </Text>
          )}
          <Text fontWeight="bold" color={secondaryTextColor}>
            {formatNumberAsCurrency(data.value, currencySymbol as string)}
          </Text>
          <Text fontSize="sm" color={secondaryTextColor}>
            {((data.value / totalValue) * 100).toFixed(1)}%{" "}
            {parentName
              ? `of ${parentName} ${formatNumberAsCurrency(totalValue, currencySymbol as string)}`
              : ""}
          </Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box bg={bgColor} borderRadius="lg" p={{ base: 4, md: 6 }} boxShadow="lg">
      <VStack align="flex-start" spacing={1} flex={1}>
        <Heading size="md" color={primaryTextColor}>
          Current Month Overview
        </Heading>
        <Text color={secondaryTextColor} fontSize="sm">
          Your financial snapshot for the current month
        </Text>
      </VStack>

      {/* Summary Cards */}
      <HStack
        spacing={4}
        mt={6}
        mb={10}
        flexDirection={{ base: "column", md: "row" }}
      >
        {/* Income Card */}
        <Box bg={cardBg} p={6} borderRadius="lg" width="full" boxShadow="md">
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
                {formatNumberAsCurrency(
                  data.total_income,
                  currencySymbol as string,
                )}
              </StatNumber>
              <StatHelpText>
                <Badge colorScheme="teal" variant="subtle">
                  This Month
                </Badge>
              </StatHelpText>
            </Stat>
          </VStack>
        </Box>

        {/* Expense Card */}
        <Box bg={cardBg} p={6} borderRadius="lg" width="full" boxShadow="md">
          <VStack align="stretch" spacing={4}>
            <HStack justifyContent="space-between">
              <Heading size="md" color="red.500">
                Expenses
              </Heading>
              <Icon as={FiTrendingDown} color="red.500" boxSize={6} />
            </HStack>

            <Stat>
              <StatLabel color={secondaryTextColor}>Total Expenses</StatLabel>
              <StatNumber color={primaryTextColor}>
                {formatNumberAsCurrency(
                  data.total_expense,
                  currencySymbol as string,
                )}
              </StatNumber>
              <StatHelpText>
                <Badge colorScheme="red" variant="subtle">
                  This Month
                </Badge>
              </StatHelpText>
            </Stat>
          </VStack>
        </Box>
      </HStack>

      {/* Treemap Visualizations with Side-by-Side Layout */}
      {(data.income_categories_breakdown.length > 0 ||
        data.expense_categories_breakdown.length > 0) && (
        <Grid
          templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
          gap={6}
          width="full"
        >
          {/* Income Treemap */}
          {data.income_categories_breakdown.length > 0 && (
            <GridItem>
              <Box width="full">
                <Heading
                  size="sm"
                  color={primaryTextColor}
                  mb={4}
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={FiPieChart} mr={2} color="teal.500" />
                  Income Breakdown
                </Heading>
                <Box height="300px" width="full">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={data.income_categories_breakdown}
                      dataKey="value"
                      aspectRatio={4 / 3}
                      stroke="#fff"
                      content={
                        <CustomizedTreemapContent colors={INCOME_COLORS} />
                      }
                    >
                      <Tooltip content={<CustomTooltip />} />
                    </Treemap>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </GridItem>
          )}

          {/* Expense Treemap */}
          {data.expense_categories_breakdown.length > 0 && (
            <GridItem>
              <Box width="full">
                <Heading
                  size="sm"
                  color={primaryTextColor}
                  mb={4}
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={FiPieChart} mr={2} color="red.500" />
                  Expense Breakdown
                </Heading>
                <Box height="300px" width="full">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={data.expense_categories_breakdown}
                      dataKey="value"
                      aspectRatio={4 / 3}
                      stroke="#fff"
                      content={
                        <CustomizedTreemapContent colors={EXPENSE_COLORS} />
                      }
                    >
                      <Tooltip content={<CustomTooltip />} />
                    </Treemap>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </GridItem>
          )}

          {/* Nested Category Breakdown Section */}
          {data.income_categories_breakdown.length > 0 && (
            <GridItem>
              <NestedCategoryBreakdown
                categories={data.income_categories_breakdown}
                type="income"
                currencySymbol={currencySymbol as string}
              />
            </GridItem>
          )}

          {data.expense_categories_breakdown.length > 0 && (
            <GridItem>
              <NestedCategoryBreakdown
                categories={data.expense_categories_breakdown}
                type="expense"
                currencySymbol={currencySymbol as string}
              />
            </GridItem>
          )}
        </Grid>
      )}

      {/* No Data State */}
      {data.income_categories_breakdown.length === 0 &&
        data.expense_categories_breakdown.length === 0 && (
          <Center
            height="300px"
            bg={bgColor}
            borderRadius="lg"
            flexDirection="column"
            textAlign="center"
            p={6}
          >
            <Icon as={FiBarChart2} boxSize={16} color="gray.400" mb={4} />
            <Heading size="md" mb={2} color={secondaryTextColor}>
              No Financial Data Available
            </Heading>
            <Text color={secondaryTextColor} fontSize="sm">
              Add some transactions to see your current month breakdown
            </Text>
          </Center>
        )}
    </Box>
  );
};

export default CurrentMonthOverview;
