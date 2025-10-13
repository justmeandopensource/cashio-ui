import React, { useState } from "react";
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
  Select,
  FormControl,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, TrendingUp } from "lucide-react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import useLedgerStore from "@/components/shared/store";
import { formatNumberAsCurrency } from "@/components/shared/utils";
import config from "@/config";

interface ExpenseCalendarData {
  date: string;
  amount: number;
}

interface ExpenseCalendarResponse {
  expenses: ExpenseCalendarData[];
  total_expense: number;
}

interface ExpenseCalendarHeatmapProps {
  ledgerId?: string;
}

const ExpenseCalendarHeatmap: React.FC<ExpenseCalendarHeatmapProps> = ({ ledgerId }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [hoveredValue, setHoveredValue] = useState<any>(null);
  const { currencySymbol } = useLedgerStore();

  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const primaryTextColor = useColorModeValue("gray.800", "white");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.300");

  // Generate year options (current year and previous 4 years)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch expense calendar data
  const { data, isLoading, isError } = useQuery<ExpenseCalendarResponse>({
    queryKey: ["expenseCalendar", ledgerId, selectedYear],
    queryFn: async () => {
      if (!ledgerId) return null;

      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${config.apiBaseUrl}/ledger/${ledgerId}/insights/expense-calendar?year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch expense calendar data");
      }

      return response.json();
    },
    enabled: !!ledgerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });



  // Transform data for the heatmap
  const heatmapValues = data?.expenses.map((expense) => ({
    date: new Date(expense.date),
    count: expense.amount,
  })) || [];

  // Define color classes based on expense amount
  const getClassForValue = (value: any) => {
    if (!value) {
      return "color-github-0";
    }
    const amount = value.count;
    if (amount <= 0) return "color-github-0";
    if (amount < 10) return "color-github-1";
    if (amount < 50) return "color-github-2";
    if (amount < 100) return "color-github-3";
    if (amount < 200) return "color-github-4";
    if (amount < 500) return "color-github-5";
    if (amount < 1000) return "color-github-6";
    return "color-github-7"; // $1000+
  };

  // Custom tooltip
  const titleForValue = (value: any) => {
    if (!value) return "No expenses";
    const dateStr = value.date instanceof Date
      ? value.date.toISOString().split('T')[0]
      : value.date;
    return `${dateStr}: ${formatNumberAsCurrency(value.count, currencySymbol as string)}`;
  };

  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch" bg={cardBg} p={6} borderRadius="lg">
        <Text color={secondaryTextColor}>Loading expense calendar data...</Text>
      </VStack>
    );
  }

  if (isError) {
    return (
      <VStack spacing={4} align="center" bg={cardBg} p={6} borderRadius="lg">
        <Icon as={TrendingUp} color="red.500" boxSize={6} mb={4} />
        <Text color="red.500" fontWeight="bold" fontSize="lg">
          Unable to load expense calendar data
        </Text>
      </VStack>
    );
  }

  return (
    <Box bg={bgColor} borderRadius="lg" p={{ base: 4, md: 6 }} boxShadow="lg">
      <VStack spacing={4} align="stretch" mb={6}>
        <Flex justifyContent="space-between" alignItems="center" direction={{ base: "column", md: "row" }} gap={4}>
          <VStack align="start" spacing={1} flex={1}>
            <Flex alignItems="center" gap={3}>
              <Icon as={Calendar} w={5} h={5} color={primaryTextColor} />
              <Heading as="h2" size="md" color={primaryTextColor}>
                Expense Calendar
              </Heading>
            </Flex>
            <Text color={secondaryTextColor} fontSize="sm" pl="2rem">
              Daily expense heatmap for {selectedYear}
            </Text>
          </VStack>
          <FormControl maxW={{ base: "full", md: "150px" }}>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              size="sm"
              bg={cardBg}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </FormControl>
        </Flex>
      </VStack>

      <Box height={{ base: "300px", md: "400px" }} width="full" mb={8}>
        {heatmapValues.length > 0 ? (
          <Center>
            <Box className="react-calendar-heatmap" minH="300px" w="full">
              <CalendarHeatmap
                startDate={new Date(selectedYear, 0, 1)}
                endDate={new Date(selectedYear, 11, 31)}
                values={heatmapValues}
                classForValue={getClassForValue}
                onMouseOver={(event, value) => setHoveredValue(value)}
                onMouseLeave={(event, value) => setHoveredValue(null)}
                showWeekdayLabels
                gutterSize={2}
              />
            </Box>
          </Center>
        ) : (
          <Center height="full" bg={bgColor} borderRadius="lg" flexDirection="column" textAlign="center" p={6}>
            <Icon as={Calendar} boxSize={6} color="tertiaryTextColor" mb={4} />
            <Heading size="md" mb={2} color={secondaryTextColor}>
              No Expense Data Available
            </Heading>
            <Text color={secondaryTextColor} fontSize="sm">
              No expense transactions found for {selectedYear}.
            </Text>
          </Center>
        )}
      </Box>

      {/* Hover Tooltip - Always rendered to prevent layout shifts */}
      <Center mt={2} minH="60px">
        <Box
          bg={cardBg}
          borderRadius="lg"
          p={3}
          boxShadow="md"
          border="1px solid"
          borderColor="gray.200"
          _dark={{ borderColor: "gray.600" }}
          opacity={hoveredValue ? 1 : 0}
          transition="opacity 0.2s ease-in-out"
          pointerEvents={hoveredValue ? "auto" : "none"}
        >
          <VStack spacing={1} align="center">
            <Text fontSize="sm" color={secondaryTextColor}>
              {hoveredValue ? (
                hoveredValue.date instanceof Date
                  ? hoveredValue.date.toISOString().split('T')[0]
                  : hoveredValue.date
              ) : "Hover over a cell"}
            </Text>
            <Text fontSize="lg" fontWeight="bold" color={primaryTextColor}>
              {hoveredValue
                ? formatNumberAsCurrency(hoveredValue.count, currencySymbol as string)
                : "$0.00"
              }
            </Text>
          </VStack>
        </Box>
      </Center>

      {/* Legend */}
      <Box mb={6}>
        <Text fontSize="sm" fontWeight="bold" color={primaryTextColor} mb={3}>
          Legend
        </Text>
        <HStack spacing={4} wrap="wrap">
          <HStack spacing={2}>
            <Box w={3} h={3} bg="#eeeeee" borderRadius="sm" />
            <Text fontSize="xs" color={secondaryTextColor}>$0</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={3} h={3} bg="#d6e685" borderRadius="sm" />
            <Text fontSize="xs" color={secondaryTextColor}>$1-9</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={3} h={3} bg="#8cc665" borderRadius="sm" />
            <Text fontSize="xs" color={secondaryTextColor}>$10-49</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={3} h={3} bg="#44a340" borderRadius="sm" />
            <Text fontSize="xs" color={secondaryTextColor}>$50-99</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={3} h={3} bg="#1e6823" borderRadius="sm" />
            <Text fontSize="xs" color={secondaryTextColor}>$100-199</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={3} h={3} bg="#006d32" borderRadius="sm" />
            <Text fontSize="xs" color={secondaryTextColor}>$200-499</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={3} h={3} bg="#00441b" borderRadius="sm" />
            <Text fontSize="xs" color={secondaryTextColor}>$500-999</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={3} h={3} bg="#003d1a" borderRadius="sm" />
            <Text fontSize="xs" color={secondaryTextColor}>$1000+</Text>
          </HStack>
        </HStack>
      </Box>

      {/* Custom CSS for additional heatmap colors */}
      <style dangerouslySetInnerHTML={{
        __html: '.react-calendar-heatmap .color-github-5 { fill: #006d32; } .react-calendar-heatmap .color-github-6 { fill: #00441b; } .react-calendar-heatmap .color-github-7 { fill: #003d1a; }'
      }} />

    </Box>
  );
};

export default React.memo(ExpenseCalendarHeatmap);