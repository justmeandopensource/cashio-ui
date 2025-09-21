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
  Icon,
} from "@chakra-ui/react";
import { Plus, ChevronLeft, ChevronRight, Filter, AlignLeft } from "lucide-react";

import api from "@/lib/api";
import TransactionCard from "./TransactionCard";
import TransactionTable from "./TransactionTable";
import TransactionFilter from "./TransactionFilter";
import { AxiosError } from "axios";
import useLedgerStore from "@/components/shared/store";
import { toastDefaults } from "@/components/shared/utils";
import EditTransactionModal from "@components/modals/EditTransactionModal/EditTransactionModal";

interface Transaction {
  transaction_id: string;
  date: string;
  category_name: string;
  account_id?: string;
  account_name?: string;
  is_split: boolean;
  is_transfer: boolean;
  is_asset_transaction: boolean;
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
  accountId?: string;
  onAddTransaction: () => void;
  onTransactionDeleted?: () => void;
  onTransactionUpdated?: () => void;
  // eslint-disable-next-line no-unused-vars
  onCopyTransaction: (tx: Transaction) => void;
  shouldFetch?: boolean;
}

const Transactions: React.FC<TransactionsProps> = ({
  accountId,
  onAddTransaction,
  onTransactionDeleted,
  onTransactionUpdated,
  onCopyTransaction,
  shouldFetch = true,
}) => {
  const { ledgerId } = useLedgerStore();
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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(
    null,
  );

  const [filters, setFilters] = useState<Filters>({});
  const [pagination, setPagination] = useState<Pagination>({
    total_pages: 1,
    current_page: 1,
  });

  // Add state to track if filters are active
  const hasActiveFilters = Object.keys(filters).length > 0;

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleTransactionUpdated = () => {
    setIsEditModalOpen(false);
    if (onTransactionUpdated) {
      onTransactionUpdated();
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
    queryClient.refetchQueries({ queryKey: ["account", accountId] });
  };

  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useQuery<Transaction[]>({
    queryKey: [
      "transactions",
      ledgerId,
      accountId,
      pagination.current_page,
      { ...filters },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", pagination.current_page.toString());
      params.append("per_page", "50");

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

      const response = await api.get(`/ledger/${ledgerId}/transactions`, { params });

      setPagination({
        total_pages: response.data.total_pages,
        current_page: response.data.current_page,
      });
      return response.data.transactions;
    },
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      const response = await api.get(
        `/ledger/${ledgerId}/transaction/${transactionId}/splits`,
      );
      setSplitTransactions(response.data);
    } finally {
      setIsSplitLoading(false);
    }
  };

  const fetchTransferDetails = async (transferId: string) => {
    setIsTransferLoading(true);
    try {
      const response = await api.get(`/ledger/transfer/${transferId}`);
      setTransferDetails(response.data);
    } finally {
      setIsTransferLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await api.delete(
        `/ledger/${ledgerId}/transaction/${transactionId}`,
      );

      if (onTransactionDeleted) {
        onTransactionDeleted();
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
      queryClient.refetchQueries({ queryKey: ["account", accountId] });

      toast({
        description: "Transaction deleted",
        status: "success",
        ...toastDefaults,
      });
    } catch (error) {
      // Let the global interceptor handle 401 errors
      const axiosError = error as AxiosError<{ detail: string }>;
      toast({
        description:
          axiosError.response?.data?.detail || "Failed to delete transaction.",
        status: "error",
        ...toastDefaults,
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

  if (isTransactionsError) {
    toast({
      description: "Failed to fetch transactions",
      status: "error",
      ...toastDefaults,
    });
    return null;
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
            {hasActiveFilters
              ? "No Matching Transactions"
              : "No Transactions Found"}
          </Text>
          <Text color="secondaryTextColor" mb={6}>
            {hasActiveFilters
              ? "No transactions match your filter criteria."
              : "You do not have any transactions for this account yet."}
          </Text>

          {/* Show different actions based on whether filters are active */}
          {hasActiveFilters ? (
            <Button
              leftIcon={<Filter />}
              colorScheme="teal"
              onClick={handleResetFilters}
              mr={3}
            >
              Reset Filters
            </Button>
          ) : (
            <Button
              leftIcon={<Plus />}
              colorScheme="teal"
              onClick={onAddTransaction}
            >
              Add Transaction
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={2}>
              <Icon as={AlignLeft} size={24} color="gray.600" />
              <Text fontSize={{ base: "lg", lg: "xl" }} fontWeight="bold" color="primaryTextColor">
                Transactions
              </Text>
            </Flex>
            <TransactionFilter
              ledgerId={ledgerId as string}
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
              fetchSplitTransactions={fetchSplitTransactions}
              fetchTransferDetails={fetchTransferDetails}
              isSplitLoading={isSplitLoading}
              splitTransactions={splitTransactions}
              isTransferLoading={isTransferLoading}
              transferDetails={transferDetails || undefined}
              onDeleteTransaction={handleDeleteTransaction}
              onEditTransaction={handleEditTransaction}
              onCopyTransaction={onCopyTransaction}
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
                  onEditTransaction={handleEditTransaction} // Add this line
                  onCopyTransaction={onCopyTransaction}
                  showAccountName={!accountId}
                />
              ))}
            </VStack>
          </Box>

          {pagination.total_pages > 1 && (
            <Flex justifyContent="center" mt={6} alignItems="center">
              <IconButton
                icon={<ChevronLeft />}
                isDisabled={pagination.current_page === 1}
                onClick={() => handlePageChange(pagination.current_page - 1)}
                variant="ghost"
                size={{ base: "sm", lg: "md" }}
                aria-label="Previous page"
                data-testid="transactions-prev-page-icon"
              />
              <Text mx={4} fontSize={{ base: "sm", lg: "md" }}>
                {pagination.current_page} / {pagination.total_pages}
              </Text>
              <IconButton
                icon={<ChevronRight />}
                isDisabled={pagination.current_page === pagination.total_pages}
                onClick={() => handlePageChange(pagination.current_page + 1)}
                variant="ghost"
                size={{ base: "sm", lg: "md" }}
                aria-label="Next page"
                data-testid="transactions-next-page-icon"
              />
            </Flex>
          )}
        </>
      )}
      {isEditModalOpen && selectedTransaction && ( <EditTransactionModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} transaction={selectedTransaction} onTransactionUpdated={handleTransactionUpdated} /> )}
    </Box>
  );
};

export default Transactions;
