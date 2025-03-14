import { useState } from "react";
import {
  Box,
  Text,
  Button,
  Flex,
  useToast,
  VStack,
  IconButton,
} from "@chakra-ui/react";
import { FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import config from "@/config";
import TransactionCard from "./TransactionCard";
import TransactionTable from "./TransactionTable";

const AccountMainTransactions = ({
  transactions,
  account,
  currencySymbolCode,
  fetchTransactions,
  pagination,
  onAddTransaction,
  onTransactionDeleted,
}) => {
  const toast = useToast();

  // State to store split transactions and transfer details
  const [splitTransactions, setSplitTransactions] = useState([]);
  const [transferDetails, setTransferDetails] = useState(null);
  const [expandedTransaction, setExpandedTransaction] = useState(null);

  // Loading states
  const [isSplitLoading, setIsSplitLoading] = useState(false);
  const [isTransferLoading, setIsTransferLoading] = useState(false);

  // Destructure pagination data
  const { total_pages, current_page } = pagination;

  // Function to handle page change
  const handlePageChange = (page) => {
    fetchTransactions(page);
  };

  // Toggle expanded transaction on tap
  const toggleExpand = (transactionId, e) => {
    // Don't toggle if clicking on buttons inside the card
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

  // Fetch split transactions using fetch
  const fetchSplitTransactions = async (transactionId) => {
    setIsSplitLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${config.apiBaseUrl}/ledger/${account.ledger_id}/transaction/${transactionId}/splits`,
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

  // Fetch transfer details using fetch
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
        `${config.apiBaseUrl}/ledger/${account.ledger_id}/transaction/${transactionId}`,
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

      // Refresh the transactions and account data
      await onTransactionDeleted();

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

  return (
    <Box bg="gray.50" p={{ base: 3, lg: 6 }} borderRadius="lg">
      {/* No Transactions State */}
      {!transactions || transactions.length === 0 ? (
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
              transactions={transactions}
              currencySymbolCode={currencySymbolCode}
              fetchSplitTransactions={fetchSplitTransactions}
              fetchTransferDetails={fetchTransferDetails}
              isSplitLoading={isSplitLoading}
              splitTransactions={splitTransactions}
              isTransferLoading={isTransferLoading}
              transferDetails={transferDetails}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </Box>

          {/* Card View (Mobile & Tablet Portrait) */}
          <Box display={{ base: "block", lg: "none" }}>
            <VStack spacing={1} align="stretch">
              {transactions.map((transaction) => (
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
                />
              ))}
            </VStack>
          </Box>

          {/* Pagination Controls */}
          {total_pages > 1 && (
            <Flex justifyContent="center" mt={6} alignItems="center">
              <IconButton
                icon={<FiChevronLeft />}
                isDisabled={current_page === 1}
                onClick={() => handlePageChange(current_page - 1)}
                variant="ghost"
                size={{ base: "sm", lg: "md" }}
                aria-label="Previous page"
              />
              <Text mx={4} fontSize={{ base: "sm", lg: "md" }}>
                {current_page} / {total_pages}
              </Text>
              <IconButton
                icon={<FiChevronRight />}
                isDisabled={current_page === total_pages}
                onClick={() => handlePageChange(current_page + 1)}
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

export default AccountMainTransactions;
