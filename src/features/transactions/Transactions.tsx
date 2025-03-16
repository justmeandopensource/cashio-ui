import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Text,
  Button,
  Flex,
  useToast,
  VStack,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import config from "@/config";
import TransactionCard from "./TransactionCard";
import TransactionTable from "./TransactionTable";
import TransactionFilter from "./TransactionFilter";
import { AxiosError } from "axios";

interface Transaction {
  transaction_id: string;
  date: string;
  category_name: string;
  account_name?: string;
  is_split: boolean;
  is_transfer: boolean;
  notes?: string;
  credit: number;
  debit: number;
  transfer_id?: string;
}

interface TransferDetails {
  // Define the structure of transfer details
}

interface SplitTransaction {
  split_id: string;
  category_name: string;
  debit: number;
  notes?: string;
}

interface Filters {
  [key: string]: any;
}

interface Pagination {
  total_pages: number;
  current_page: number;
}

interface TransactionsProps {
  ledgerId: string;
  accountId?: string;
  currencySymbolCode: string;
  onAddTransaction: () => void;
  onTransactionDeleted?: () => void;
  shouldFetch?: boolean;
}

const Transactions: React.FC<TransactionsProps> = ({
  ledgerId,
  accountId,
  currencySymbolCode,
  onAddTransaction,
  onTransactionDeleted,
  shouldFetch = true,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [splitTransactions, setSplitTransactions] = useState<
    SplitTransaction[]
  >([]);
  const [transferDetails, setTransferDetails] =
    useState<TransferDetails | null>(null);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(
    null,
  );

  const [isSplitLoading, setIsSplitLoading] = useState(false);
  const [isTransferLoading, setIsTransferLoading] = useState(false);

  const [filters, setFilters] = useState<Filters>({});
  const [pagination, setPagination] = useState<Pagination>({
    total_pages: 1,
    current_page: 1,
  });

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery<
    Transaction[]
  >({
    queryKey: [
      "transactions",
      ledgerId,
      accountId,
      pagination.current_page,
      { ...filters },
    ],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");

      const params = new URLSearchParams();
      params.append("page", pagination.current_page.toString());

      if (accountId) {
        params.append("account_id", accountId);
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (key === "tags" && Array.isArray(value)) {
          value.forEach((tag) => {
            params.append("tags", tag);
          });
        } else if (value !== null && value !== undefined && value !== "") {
          params.append(key, value);
        }
      });

      const url = `${config.apiBaseUrl}/ledger/${ledgerId}/transactions?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setPagination({
        total_pages: data.total_pages,
        current_page: data.current_page,
      });
      return data.transactions;
    },
    enabled: shouldFetch,
  });

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
  };

  const toggleExpand = (transactionId: string, e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLButtonElement ||
      (e.target instanceof Element && e.target.closest("button")) ||
      e.target instanceof SVGElement ||
      e.target instanceof SVGPathElement
    ) {
      return;
    }

    if (expandedTransaction === transactionId) {
      setExpandedTransaction(null);
      setTransferDetails(null);
      setSplitTransactions([]);
    } else {
      setExpandedTransaction(transactionId);
      setTransferDetails(null);
      setSplitTransactions([]);
    }
  };

  const fetchSplitTransactions = async (transactionId: string) => {
    setIsSplitLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${config.apiBaseUrl}/ledger/${ledgerId}/transaction/${transactionId}/splits`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch split transactions");
      }

      const data = await response.json();
      setSplitTransactions(data);
    } catch (error) {
      console.error("Error fetching split transactions:", error);
      const axiosError = error as AxiosError<{ detail: string }>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data?.detail ||
          "Failed to fetch split transactions.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSplitLoading(false);
    }
  };

  const fetchTransferDetails = async (transferId: string) => {
    setIsTransferLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${config.apiBaseUrl}/ledger/transfer/${transferId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transfer details");
      }

      const data = await response.json();
      setTransferDetails(data);
    } catch (error) {
      console.error("Error fetching transfer details:", error);
      const axiosError = error as AxiosError<{ detail: string }>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data?.detail ||
          "Failed to fetch transfer details.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTransferLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${config.apiBaseUrl}/ledger/${ledgerId}/transaction/${transactionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      if (onTransactionDeleted) {
        await onTransactionDeleted();
      }

      queryClient.invalidateQueries({
        queryKey: [
          "transactions",
          ledgerId,
          accountId,
          pagination.current_page,
          { ...filters },
        ],
      });

      toast({
        title: "Transaction deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      const axiosError = error as AxiosError<{ detail: string }>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data?.detail || "Failed to delete transaction.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (shouldFetch && isTransactionsLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Box>
    );
  }

  return (
    <Box bg="gray.50" p={{ base: 3, lg: 6 }} borderRadius="lg">
      {!shouldFetch || !transactionsData || transactionsData.length === 0 ? (
        <Box
          textAlign="center"
          py={{ base: 6, lg: 10 }}
          px={{ base: 3, lg: 6 }}
        >
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            No Transactions Found
          </Text>
          <Text color="gray.600" mb={6}>
            You do not have any transactions for this account yet.
          </Text>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="teal"
            onClick={onAddTransaction}
          >
            Add Transaction
          </Button>
        </Box>
      ) : (
        <>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize={{ base: "lg", lg: "xl" }} fontWeight="bold">
              Transactions
            </Text>
            <TransactionFilter
              ledgerId={ledgerId}
              accountId={accountId}
              initialFilters={filters}
              onApplyFilters={handleApplyFilters}
              currentFilters={filters}
              onResetFilters={handleResetFilters}
            />
          </Flex>

          <Box display={{ base: "none", lg: "block" }}>
            <TransactionTable
              transactions={transactionsData}
              currencySymbolCode={currencySymbolCode}
              fetchSplitTransactions={fetchSplitTransactions}
              fetchTransferDetails={fetchTransferDetails}
              isSplitLoading={isSplitLoading}
              splitTransactions={splitTransactions}
              isTransferLoading={isTransferLoading}
              transferDetails={transferDetails || undefined}
              onDeleteTransaction={handleDeleteTransaction}
              showAccountName={!accountId}
            />
          </Box>

          <Box display={{ base: "block", lg: "none" }}>
            <VStack spacing={1} align="stretch">
              {transactionsData.map((transaction) => (
                <TransactionCard
                  key={transaction.transaction_id}
                  transaction={transaction}
                  isExpanded={
                    expandedTransaction === transaction.transaction_id
                  }
                  currencySymbolCode={currencySymbolCode}
                  toggleExpand={(e) =>
                    toggleExpand(transaction.transaction_id, e)
                  }
                  fetchSplitTransactions={() =>
                    fetchSplitTransactions(transaction.transaction_id)
                  }
                  splitTransactions={splitTransactions}
                  fetchTransferDetails={() =>
                    transaction.transfer_id
                      ? fetchTransferDetails(transaction.transfer_id)
                      : undefined
                  }
                  transferDetails={transferDetails || undefined}
                  isSplitLoading={isSplitLoading}
                  isTransferLoading={isTransferLoading}
                  onDeleteTransaction={handleDeleteTransaction}
                  showAccountName={!accountId}
                />
              ))}
            </VStack>
          </Box>

          {pagination.total_pages > 1 && (
            <Flex justifyContent="center" mt={6} alignItems="center">
              <IconButton
                icon={<FiChevronLeft />}
                isDisabled={pagination.current_page === 1}
                onClick={() => handlePageChange(pagination.current_page - 1)}
                variant="ghost"
                size={{ base: "sm", lg: "md" }}
                aria-label="Previous page"
              />
              <Text mx={4} fontSize={{ base: "sm", lg: "md" }}>
                {pagination.current_page} / {pagination.total_pages}
              </Text>
              <IconButton
                icon={<FiChevronRight />}
                isDisabled={pagination.current_page === pagination.total_pages}
                onClick={() => handlePageChange(pagination.current_page + 1)}
                variant="ghost"
                size={{ base: "sm", lg: "md" }}
                aria-label="Next page"
              />
            </Flex>
          )}
        </>
      )}
    </Box>
  );
};

export default Transactions;
