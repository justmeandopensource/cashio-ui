import { useState } from "react";
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
  Spinner,
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
} from "react-icons/fi";
import {
  formatAmount,
  formatDate,
  formatNumberAsCurrency,
} from "@/components/shared/utils";

const TransactionCard = ({
  transaction,
  currencySymbolCode,
  isExpanded,
  toggleExpand,
  fetchSplitTransactions,
  splitTransactions,
  fetchTransferDetails,
  transferDetails,
  isSplitLoading,
  isTransferLoading,
  onDeleteTransaction,
}) => {
  const amount = formatAmount(
    transaction.credit,
    transaction.debit,
    currencySymbolCode,
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
                  <Flex justify="center" align="center" h="100px">
                    <Spinner />
                  </Flex>
                ) : (
                  splitTransactions.length > 0 && (
                    <Box
                      borderWidth="1px"
                      borderRadius="md"
                      p={2}
                      bg="purple.50"
                    >
                      {splitTransactions.map((split) => (
                        <Flex
                          key={split.split_id}
                          justify="space-between"
                          p={2}
                          borderBottomWidth={
                            splitTransactions.indexOf(split) !==
                            splitTransactions.length - 1
                              ? "1px"
                              : "0"
                          }
                        >
                          <Text fontSize="sm" fontWeight="medium">
                            {split.category_name}
                          </Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {formatNumberAsCurrency(
                              split.debit,
                              currencySymbolCode,
                            )}
                          </Text>
                        </Flex>
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
                    fetchTransferDetails(transaction.transfer_id);
                  }}
                  mb={2}
                >
                  View Transfer Details
                </Button>

                {isTransferLoading ? (
                  <Flex justify="center" align="center" h="100px">
                    <Spinner />
                  </Flex>
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
