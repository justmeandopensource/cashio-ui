import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Flex,
  useColorModeValue,
  Select,
  FormControl,
  FormLabel,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { FiPieChart, FiBarChart2, FiChevronDown } from "react-icons/fi";
import config from "@/config";

interface Ledger {
  ledger_id: string;
  name: string;
}

interface InsightsMainHeaderProps {
  selectedLedgerId?: string;
  selectedVisualization?: string;
  // eslint-disable-next-line no-unused-vars
  onLedgerChange: (ledgerId: string) => void;
  // eslint-disable-next-line no-unused-vars
  onVisualizationChange: (visualization: string) => void;
}

const visualizationOptions = [
  {
    value: "income-expense-trend",
    label: "Income vs Expense Trend",
    icon: FiBarChart2,
  },
  {
    value: "category-visualization",
    label: "Spending Categories",
    icon: FiPieChart,
  },
];

const InsightsMainHeader: React.FC<InsightsMainHeaderProps> = ({
  selectedLedgerId,
  selectedVisualization = "income-expense-trend",
  onLedgerChange,
  onVisualizationChange,
}) => {
  // Color modes
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.300");

  const [localSelectedLedger, setLocalSelectedLedger] = useState<
    string | undefined
  >(selectedLedgerId);

  // Fetch ledgers
  const { data: ledgers, isLoading } = useQuery<Ledger[]>({
    queryKey: ["ledgers"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${config.apiBaseUrl}/ledger/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch ledgers");
      }

      return response.json();
    },
  });

  useEffect(() => {
    setLocalSelectedLedger(selectedLedgerId);
  }, [selectedLedgerId]);

  const handleLedgerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ledgerId = e.target.value;
    setLocalSelectedLedger(ledgerId);
    onLedgerChange(ledgerId);
  };

  const handleVisualizationChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onVisualizationChange(e.target.value);
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      p={{ base: 4, md: 6 }}
      boxShadow="lg"
      mb={8}
    >
      <Flex
        justifyContent="space-between"
        alignItems="flex-start"
        flexDirection={{ base: "column", lg: "row" }}
        gap={4}
      >
        <VStack align="flex-start" spacing={1} flex={1}>
          <Heading as="h2" size="lg" color="teal.500">
            Financial Insights
          </Heading>
          <Text color={secondaryTextColor} fontSize="sm">
            Explore and analyze your financial data
          </Text>
        </VStack>

        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={4}
          width={{ base: "full", md: "auto" }}
        >
          <Box width={{ base: "full", md: "250px" }}>
            <FormControl>
              <FormLabel color={secondaryTextColor} fontSize="sm" mb={1}>
                Select Ledger
              </FormLabel>
              <Select
                value={localSelectedLedger || ""}
                onChange={handleLedgerChange}
                isDisabled={isLoading}
                icon={<FiChevronDown />}
                variant="filled"
                bg={cardBg}
              >
                <option value="">Select a ledger</option>
                {ledgers?.map((ledger) => (
                  <option key={ledger.ledger_id} value={ledger.ledger_id}>
                    {ledger.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box width={{ base: "full", md: "250px" }}>
            <FormControl>
              <FormLabel color={secondaryTextColor} fontSize="sm" mb={1}>
                Visualization Type
              </FormLabel>
              <Select
                value={selectedVisualization}
                onChange={handleVisualizationChange}
                icon={<FiChevronDown />}
                variant="filled"
                bg={cardBg}
              >
                {visualizationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default InsightsMainHeader;
