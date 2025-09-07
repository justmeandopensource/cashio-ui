import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Select,
  FormControl,
  FormLabel,
  useColorModeValue,
} from "@chakra-ui/react";
import InsightsMainCharts from "./InsightsMainCharts";
import useLedgerStore from "@/components/shared/store";
import { useQuery } from "@tanstack/react-query";
import config from "@/config";
import { ChevronDown } from "lucide-react";

interface Ledger {
  ledger_id: string;
  name: string;
  currency_symbol: string;
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

const InsightsMain = () => {
  const { ledgerId, setLedger } = useLedgerStore();
  const [selectedLedgerId, setSelectedLedgerId] = useState<string | undefined>(
    ledgerId,
  );
  const [selectedVisualization, setSelectedVisualization] = useState<string>(
    "current-month-overview",
  );

  const cardBg = useColorModeValue("gray.50", "gray.700");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.300");

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
    setSelectedLedgerId(ledgerId);
  }, [ledgerId]);

  const handleLedgerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLedgerId = e.target.value;
    const selectedLedger = ledgers?.find(
      (ledger) => ledger.ledger_id == newLedgerId,
    );
    if (selectedLedger) {
      setLedger(
        selectedLedger.ledger_id,
        selectedLedger.name,
        selectedLedger.currency_symbol,
      );
    }
    setSelectedLedgerId(newLedgerId);
  };

  return (
    <Box>
      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={4}
        mb={8}
        width={{ base: "full", md: "auto" }}
      >
        <Box width={{ base: "full", md: "250px" }}>
          <FormControl>
            <FormLabel color={secondaryTextColor} fontSize="sm" mb={1}>
              Select Ledger
            </FormLabel>
            <Select
              value={selectedLedgerId || ""}
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
              onChange={(e) => setSelectedVisualization(e.target.value)}
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
      <Box>
        <InsightsMainCharts
          ledgerId={selectedLedgerId}
          visualization={selectedVisualization}
        />
      </Box>
    </Box>
  );
};

export default InsightsMain;
