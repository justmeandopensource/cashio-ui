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
  Icon,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, BarChart } from "lucide-react";
import config from "@/config";
import useLedgerStore from "@/components/shared/store";

interface Ledger {
  ledger_id: string;
  name: string;
  currency_symbol: string;
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
  },
  {
    value: "current-month-overview",
    label: "Current Month Overview",
  },
  {
    value: "category-trend",
    label: "Category Trend",
  },
  {
    value: "tag-trend",
    label: "Tag Trend",
  },
];

const InsightsMainHeader: React.FC<InsightsMainHeaderProps> = ({
  selectedLedgerId,
  selectedVisualization = "current-month-overview",
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

  const { setLedger } = useLedgerStore();

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
    const selectedLedger = ledgers?.find(
      (ledger) => ledger.ledger_id == ledgerId,
    );
    console.log(`DEBUG: ${selectedLedger}`);
    if (selectedLedger) {
      setLedger(
        selectedLedger.ledger_id,
        selectedLedger.name,
        selectedLedger.currency_symbol,
        selectedLedger.description,
        selectedLedger.notes,
        selectedLedger.created_at,
        selectedLedger.updated_at,
      );
    }
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
          <Flex alignItems="center" gap={3}>
            <Icon as={BarChart} w={8} h={8} color="teal.500" />
            <Heading as="h2" size="lg" color="teal.500">
              Financial Insights
            </Heading>
          </Flex>
          <Text color={secondaryTextColor} fontSize="sm" pl={12}>
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
                icon={<ChevronDown />}
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
                icon={<ChevronDown />}
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
