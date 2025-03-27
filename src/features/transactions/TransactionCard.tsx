import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  Icon,
  Square,
  Tooltip,
  VStack,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiTag,
  FiInfo,
  FiCreditCard,
  FiTrash2,
  FiMessageSquare,
} from "react-icons/fi";
import {
  formatAmount,
  formatDate,
  formatNumberAsCurrency,
} from "@/components/shared/utils";
import { SplitTransactionSkeleton, TransferDetailsSkeleton } from "./Skeletons";
import useLedgerStore from "@/components/shared/store";

interface TagItem {
  tag_id: string;
  name: string;
}

interface SplitTransaction {
  split_id: string;
  category_name: string;
  debit: number;
  notes?: string; // Added notes field to SplitTransaction
}

interface TransferDetails {
  destination_account_name?: string;
  source_account_name?: string;
  destination_ledger_name?: string;
  source_ledger_name?: string;
}

interface Transaction {
  transaction_id: string;
  date: string;
  category_name: string;
  notes?: string;
  account_name?: string;
  is_split: boolean;
  is_transfer: boolean;
  credit: number;
  debit: number;
  tags?: TagItem[];
  transfer_id?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  isExpanded: boolean;
  // eslint-disable-next-line no-unused-vars
  toggleExpand: (e: React.MouseEvent) => void;
  // eslint-disable-next-line no-unused-vars
  fetchSplitTransactions: (transactionId: string) => void;
  splitTransactions: SplitTransaction[];
  // eslint-disable-next-line no-unused-vars
  fetchTransferDetails: (transferId: string) => void;
  transferDetails?: TransferDetails;
  isSplitLoading: boolean;
  isTransferLoading: boolean;
  // eslint-disable-next-line no-unused-vars
  onDeleteTransaction: (transactionId: string) => Promise<void>;
  showAccountName?: boolean;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  isExpanded,
  toggleExpand,
  fetchSplitTransactions,
  splitTransactions,
  fetchTransferDetails,
  transferDetails,
  isSplitLoading,
  isTransferLoading,
  onDeleteTransaction,
  showAccountName = false,
}) => {
  const { currencySymbol } = useLedgerStore();
  const amount = formatAmount(
    transaction.credit,
    transaction.debit,
    currencySymbol as string,
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const modalSize = useBreakpointValue({ base: "full", md: "md" });
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDeleteTransaction(transaction.transaction_id);
      onClose();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="lg"
        mb={3}
        bg="white"
        boxShadow="sm"
        onClick={toggleExpand}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ bg: "gray.50" }}
      >
        {/* Main row with essential info */}
        <Flex justify="space-between" align="flex-start">
          {/* Left side with date, category and notes */}
          <VStack align="flex-start" spacing={1} maxW="70%">
            <HStack spacing={2}>
              <Icon as={FiCalendar} color="gray.500" />
              <Text fontSize="sm" color="gray.600">
                {formatDate(transaction.date)}
              </Text>

              {/* Transaction type indicators */}
              {(transaction.is_split || transaction.is_transfer) && (
                <HStack spacing={1}>
                  {transaction.is_split && (
                    <Tooltip label="Split Transaction">
                      <Square size="8px" bg="purple.400" borderRadius="md" />
                    </Tooltip>
                  )}
                  {transaction.is_transfer && (
                    <Tooltip label="Transfer">
                      <Square size="8px" bg="blue.400" borderRadius="md" />
                    </Tooltip>
                  )}
                </HStack>
              )}
            </HStack>

            <Text fontWeight="medium">{transaction.category_name}</Text>

            {/* Notes section - visible by default */}
            {transaction.notes && (
              <Text fontSize="sm" color="gray.600" mt={1} noOfLines={2}>
                {transaction.notes}
              </Text>
            )}

            {/* Account name - displayed when showAccountName is true */}
            {showAccountName && transaction.account_name && (
              <Text fontSize="sm" color="blue.500" mt={1}>
                {transaction.account_name}
              </Text>
            )}
          </VStack>

          {/* Right side with amount */}
          <Box textAlign="right">
            <Text fontWeight="bold" fontSize="lg" color={amount.color}>
              {amount.prefix}
              {amount.value}
            </Text>
          </Box>
        </Flex>

        {/* Expandable section */}
        {isExpanded && (
          <Box mt={4} pt={3} borderTopWidth="1px">
            {/* Tags section */}
            {transaction.tags && transaction.tags.length > 0 && (
              <Box mt={1}>
                <HStack mb={1}>
                  <Icon as={FiTag} color="gray.500" />
                  <Text fontSize="xs" fontWeight="medium" color="gray.600">
                    TAGS
                  </Text>
                </HStack>
                <Wrap spacing={2} ml={6}>
                  {transaction.tags.map((tag) => (
                    <WrapItem key={tag.tag_id}>
                      <Tag
                        size="sm"
                        borderRadius="md"
                        variant="subtle"
                        colorScheme="teal"
                      >
                        <TagLabel>{tag.name}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}

            {/* Split transaction details */}
            {transaction.is_split && (
              <Box mt={3}>
                <Button
                  size="xs"
                  leftIcon={<FiInfo />}
                  colorScheme="purple"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchSplitTransactions(transaction.transaction_id);
                  }}
                  mb={2}
                >
                  View Split Details
                </Button>

                {isSplitLoading ? (
                  <SplitTransactionSkeleton />
                ) : (
                  splitTransactions.length > 0 && (
                    <Box
                      borderWidth="1px"
                      borderRadius="md"
                      p={2}
                      bg="purple.50"
                    >
                      {splitTransactions.map((split) => (
                        <Box
                          key={split.split_id}
                          p={2}
                          borderBottomWidth={
                            splitTransactions.indexOf(split) !==
                            splitTransactions.length - 1
                              ? "1px"
                              : "0"
                          }
                        >
                          {/* Split main row with category and amount */}
                          <Flex justify="space-between">
                            <Text fontSize="sm" fontWeight="medium">
                              {split.category_name}
                            </Text>
                            <Text fontSize="sm" fontWeight="bold">
                              {formatNumberAsCurrency(
                                split.debit,
                                currencySymbol as string,
                              )}
                            </Text>
                          </Flex>

                          {/* Split notes row - only displayed if notes exist */}
                          {split.notes && (
                            <Flex align="center" mt={1}>
                              <Icon
                                as={FiMessageSquare}
                                color="gray.500"
                                mr={1}
                                fontSize="xs"
                              />
                              <Text
                                fontSize="xs"
                                color="gray.600"
                                noOfLines={2}
                              >
                                {split.notes}
                              </Text>
                            </Flex>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )
                )}
              </Box>
            )}

            {/* Transfer details */}
            {transaction.is_transfer && (
              <Box mt={3}>
                <Button
                  size="xs"
                  leftIcon={<FiCreditCard />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchTransferDetails(transaction.transfer_id!);
                  }}
                  mb={2}
                >
                  View Transfer Details
                </Button>

                {isTransferLoading ? (
                  <TransferDetailsSkeleton />
                ) : (
                  transferDetails && (
                    <Box borderWidth="1px" borderRadius="md" p={3} bg="blue.50">
                      <Text fontSize="sm" fontWeight="medium" mb={1}>
                        {transaction.debit > 0
                          ? "Transferred to:"
                          : "Transferred from:"}
                      </Text>
                      <Text fontSize="md" fontWeight="bold">
                        {transaction.debit > 0
                          ? transferDetails.destination_account_name || "N/A"
                          : transferDetails.source_account_name || "N/A"}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {transaction.debit > 0
                          ? transferDetails.destination_ledger_name || "N/A"
                          : transferDetails.source_ledger_name || "N/A"}
                      </Text>
                    </Box>
                  )
                )}
              </Box>
            )}
            {/* Delete Icon */}
            <Flex justify="flex-end" mt={3}>
              <Button
                size="md"
                variant="ghost"
                colorScheme="red"
                leftIcon={<Icon as={FiTrash2} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
                data-testid="transactioncard-delete-icon"
              />
            </Flex>
          </Box>
        )}
      </Box>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={modalSize}
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent
          margin={isMobile ? 0 : "auto"}
          borderRadius={isMobile ? 0 : "md"}
        >
          <ModalHeader>Delete Transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this transaction?</Text>
            <Box mt={4} p={3} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold">{transaction.category_name}</Text>
              <Text>{formatDate(transaction.date)}</Text>
              <Text fontWeight="bold" color={amount.color}>
                {amount.prefix}
                {amount.value}
              </Text>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={onClose}
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDelete}
              isLoading={isDeleting}
              loadingText="Deleting"
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TransactionCard;
