import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Add TanStack Query
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

const Transactions = ({
  ledgerId,
  accountId,
  currencySymbolCode,
  onAddTransaction,
  onTransactionDeleted,
  queryParams = {},
  shouldFetch = true,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  // State to store split transactions and transfer details
  const [splitTransactions, setSplitTransactions] = useState([]);
  const [transferDetails, setTransferDetails] = useState(null);
  const [expandedTransaction, setExpandedTransaction] = useState(null);

  // Loading states
  const [isSplitLoading, setIsSplitLoading] = useState(false);
  const [isTransferLoading, setIsTransferLoading] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    total_pages: 1,
    current_page: 1,
  });

  // Fetch transactions using TanStack Query
  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useQuery({
    queryKey: [
      "transactions",
      ledgerId,
      accountId,
      pagination.current_page,
      queryParams,
    ], // Include queryParams in the query key
    queryFn: async () => {
      const token = localStorage.getItem("access_token");

      // Construct query parameters
      const params = new URLSearchParams({
        page: pagination.current_page,
        ...queryParams, // Spread additional query parameters
      });

      // Add account_id only if it is provided
      if (accountId) {
        params.append("account_id", accountId);
      }

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
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch transactions.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // Function to handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
  };

  // Toggle expanded transaction on tap
  const toggleExpand = (transactionId, e) => {
    if (
      e.target.tagName === "BUTTON" ||
      e.target.closest("button") ||
      e.target.tagName === "svg" ||
      e.target.tagName === "path"
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

  // Fetch split transactions
  const fetchSplitTransactions = async (transactionId) => {
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
      toast({
        title: "Error",
        description: error.message || "Failed to fetch split transactions.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSplitLoading(false);
    }
  };

  // Fetch transfer details
  const fetchTransferDetails = async (transferId) => {
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
      toast({
        title: "Error",
        description: error.message || "Failed to fetch transfer details.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTransferLoading(false);
    }
  };

  // Function to delete a transaction
  const handleDeleteTransaction = async (transactionId) => {
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

      // Invalidate the transactions query to refetch data
      queryClient.invalidateQueries([
        "transactions",
        ledgerId,
        accountId,
        pagination.current_page,
        queryParams,
      ]);

      toast({
        title: "Transaction deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction.",
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
      {/* No Transactions State */}
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
          </Flex>

          {/* Table View (Desktop) */}
          <Box display={{ base: "none", lg: "block" }}>
            <TransactionTable
              transactions={transactionsData}
              currencySymbolCode={currencySymbolCode}
              fetchSplitTransactions={fetchSplitTransactions}
              fetchTransferDetails={fetchTransferDetails}
              isSplitLoading={isSplitLoading}
              splitTransactions={splitTransactions}
              isTransferLoading={isTransferLoading}
              transferDetails={transferDetails}
              onDeleteTransaction={handleDeleteTransaction}
              showAccountName={!accountId}
            />
          </Box>

          {/* Card View (Mobile & Tablet Portrait) */}
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
                    fetchTransferDetails(transaction.transfer_id)
                  }
                  transferDetails={transferDetails}
                  isSplitLoading={isSplitLoading}
                  isTransferLoading={isTransferLoading}
                  onDeleteTransaction={handleDeleteTransaction}
                  showAccountName={!accountId}
                />
              ))}
            </VStack>
          </Box>

          {/* Pagination Controls */}
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
