import { FC, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  VStack,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  Link as ChakraLink,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  useDisclosure,
  useToast,
  useBreakpointValue,
  HStack,
  Tooltip,
  Square,
} from "@chakra-ui/react";
import { AlertTriangle, Trash2, X, Calendar } from "lucide-react";
import { useAllAssetTransactions, useDeleteAssetTransaction } from "../api";
import { AssetTransactionHistoryProps } from "../types";
import {
  formatCurrencyWithSymbol,
  formatDate,
  getPnLColor,
  formatQuantity,
  splitCurrencyForDisplay,
} from "../utils";
import useLedgerStore from "@/components/shared/store";
import { toastDefaults } from "@/components/shared/utils";
import AssetTransactionNotesPopover from "./AssetTransactionNotesPopover";


const AssetTransactionHistory: FC<AssetTransactionHistoryProps> = () => {
  const { currencySymbol } = useLedgerStore();
  const { ledgerId } = useLedgerStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const toast = useToast();

  // Responsive breakpoint
  const isMobile = useBreakpointValue({ base: true, md: false });

  const {
    data: transactions = [],
    isLoading,
    error,
  } = useAllAssetTransactions(Number(ledgerId) || 0);

  const deleteAssetTransactionMutation = useDeleteAssetTransaction();

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!selectedTransactionId || !ledgerId) return;
    try {
      await deleteAssetTransactionMutation.mutateAsync({
        ledgerId: Number(ledgerId),
        assetTransactionId: selectedTransactionId,
      });
      onClose();
      toast({
        ...toastDefaults,
        title: "Transaction Deleted",
        description: "The asset transaction has been successfully deleted.",
        status: "success",
      });
    } catch (error) {
      console.error("Error deleting asset transaction:", error);
      toast({
        ...toastDefaults,
        title: "Error",
        description: "Failed to delete the asset transaction.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Sort transactions by date (newest first) and then by ID for consistent ordering
  const sortedTransactions = [...transactions].sort((a, b) => {
    // First sort by transaction date (newest first)
    const dateA = new Date(a.transaction_date).getTime();
    const dateB = new Date(b.transaction_date).getTime();

    if (dateA !== dateB) {
      return dateB - dateA; // Newest first
    }

    // If dates are the same, sort by transaction ID (highest first for consistency)
    return b.asset_transaction_id - a.asset_transaction_id;
  });

  // Handle card expansion
  const handleCardToggle = (transactionId: number) => {
    setExpandedCardId(expandedCardId === transactionId ? null : transactionId);
  };

  // Handle popover functions (for desktop table)
  const handlePopoverOpen = (transactionId: number) => {
    setOpenPopoverId(transactionId);
  };

  const handlePopoverClose = () => {
    setOpenPopoverId(null);
  };

  const handleRowMouseLeave = () => {
    setOpenPopoverId(null);
  };

  // Render mobile card view
  const renderMobileCards = () => (
    <VStack spacing={3} align="stretch">
      {sortedTransactions.map((transaction) => {
        const isExpanded = expandedCardId === transaction.asset_transaction_id;
        const isBuy = transaction.transaction_type === "buy";

        return (
          <Box
            key={transaction.asset_transaction_id}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            bg="white"
            boxShadow="sm"
            onClick={() => handleCardToggle(transaction.asset_transaction_id)}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: "gray.50" }}
          >
            {/* Main row with essential info */}
            <Flex justify="space-between" align="flex-start">
              {/* Left side with date and asset */}
              <VStack align="flex-start" spacing={1} maxW="70%">
                <HStack spacing={2}>
                  <Icon as={Calendar} color="gray.500" />
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(transaction.transaction_date)}
                  </Text>
                  <Tooltip label={isBuy ? "Buy Transaction" : "Sell Transaction"}>
                    <Square
                      size="6px"
                      bg={isBuy ? "green.400" : "red.400"}
                      borderRadius="md"
                    />
                  </Tooltip>
                </HStack>

                <Text fontWeight="medium">
                  {transaction.physical_asset?.name || "N/A"}
                </Text>

                <ChakraLink
                  as={Link}
                  to={`/account/${transaction.account_id}`}
                  color="blue.500"
                  fontSize="sm"
                  fontWeight="medium"
                  _hover={{ textDecoration: "underline" }}
                >
                  {transaction.account_name || `Account ${transaction.account_id}`}
                </ChakraLink>
              </VStack>

              {/* Right side with amount and quantity */}
              <VStack align="flex-end" spacing={1}>
                 <HStack spacing={0} align="baseline" justify="flex-end">
                   <Text
                     fontSize="sm"
                     fontWeight="semibold"
                     color={getPnLColor(
                       isBuy ? -transaction.total_amount : transaction.total_amount
                     )}
                   >
                     {splitCurrencyForDisplay(transaction.total_amount, currencySymbol || "$").main}
                   </Text>
                   <Text
                     fontSize="xs"
                     fontWeight="semibold"
                     opacity={0.7}
                     color={getPnLColor(
                       isBuy ? -transaction.total_amount : transaction.total_amount
                     )}
                   >
                     {splitCurrencyForDisplay(transaction.total_amount, currencySymbol || "$").decimals}
                   </Text>
                 </HStack>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  {formatQuantity(transaction.quantity)}{" "}
                  {transaction.physical_asset?.asset_type?.unit_symbol || ""}
                </Text>
                <Box
                  bg="gray.100"
                  color="gray.700"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="medium"
                  display="inline-block"
                  _dark={{
                    bg: "gray.700",
                    color: "gray.300"
                  }}
                >
                  {formatCurrencyWithSymbol(
                    transaction.price_per_unit,
                    currencySymbol || "$"
                  )}/{transaction.physical_asset?.asset_type?.unit_symbol || ""}
                </Box>
              </VStack>
            </Flex>

            {/* Expandable section */}
            {isExpanded && (
              <Box
                mt={transaction.notes ? 4 : 2}
                pt={transaction.notes ? 3 : 1}
                pb={transaction.notes ? 2 : -1}
                borderTopWidth="1px"
              >
                {/* Notes section - only show if notes exist */}
                {transaction.notes && (
                  <Box mb={2}>
                    <Text
                      fontSize="sm"
                      color="gray.700"
                      bg="gray.50"
                      p={2}
                      borderRadius="md"
                      whiteSpace="pre-wrap"
                    >
                      {transaction.notes}
                    </Text>
                  </Box>
                )}

                {/* Action buttons - compact spacing */}
                <Flex justify="flex-end" mt={transaction.notes ? 1 : 0} gap={2} mb={-1}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    leftIcon={<Trash2 size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTransactionId(transaction.asset_transaction_id);
                      onOpen();
                    }}
                    aria-label="Delete transaction"
                  />
                </Flex>
              </Box>
            )}
          </Box>
        );
      })}
    </VStack>
  );

  if (isLoading) {
    return (
      <Center p={8}>
        <VStack spacing={4}>
          <Spinner size="lg" color="teal.500" />
          <Text color="gray.600">Loading transaction history...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error" borderRadius="md">
          <AlertIcon as={AlertTriangle} />
          <AlertTitle>Failed to Load Transactions!</AlertTitle>
          <AlertDescription>
            Unable to load transaction history for this asset. Please try
            refreshing the page or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  if (sortedTransactions.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <VStack spacing={3}>
          <Icon as={AlertTriangle} boxSize={8} color="gray.400" />
          <Text fontSize="lg" color="gray.600" fontWeight="medium">
            No Transactions Yet
          </Text>
          <Text color="gray.500" maxW="400px">
            This asset doesn&#39;t have any buy or sell transactions yet. Use
            the &quot;Buy/Sell&quot; button to start tracking your investments.
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      {isMobile ? (
        renderMobileCards()
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Asset</Th>
                <Th>Type</Th>
                <Th isNumeric>Quantity</Th>
                <Th isNumeric>Price/Unit</Th>
                <Th isNumeric>Total Amount</Th>
                <Th>Account</Th>
                <Th width="2%">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedTransactions.map((transaction) => (
                <Tr
                  key={transaction.asset_transaction_id}
                  _hover={{ bg: "gray.100" }}
                  onMouseLeave={handleRowMouseLeave}
                  sx={{
                    "&:hover .action-icons": {
                      opacity: 1,
                    },
                  }}
                >
                  <Td>
                    <Text fontWeight="medium">
                      {formatDate(transaction.transaction_date)}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontWeight="medium">
                      {transaction.physical_asset?.name || "N/A"}
                    </Text>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        transaction.transaction_type === "buy" ? "green" : "red"
                      }
                      variant="subtle"
                    >
                      {transaction.transaction_type.toUpperCase()}
                    </Badge>
                  </Td>
                  <Td isNumeric>
                    <Text fontWeight="medium">
                      {formatQuantity(transaction.quantity)}{" "}
                      {transaction.physical_asset?.asset_type?.unit_symbol || ""}
                    </Text>
                  </Td>
                  <Td isNumeric>
                    <Text fontWeight="medium">
                      {formatCurrencyWithSymbol(
                        transaction.price_per_unit,
                        currencySymbol || "$",
                      )}
                    </Text>
                  </Td>
                   <Td isNumeric>
                     <HStack spacing={0} align="baseline" justify="flex-end">
                       <Text
                         fontSize="sm"
                         fontWeight="semibold"
                         color={getPnLColor(
                           transaction.transaction_type === "buy"
                             ? -transaction.total_amount
                             : transaction.total_amount,
                         )}
                       >
                         {splitCurrencyForDisplay(transaction.total_amount, currencySymbol || "$").main}
                       </Text>
                       <Text
                         fontSize="xs"
                         fontWeight="semibold"
                         opacity={0.7}
                         color={getPnLColor(
                           transaction.transaction_type === "buy"
                             ? -transaction.total_amount
                             : transaction.total_amount,
                         )}
                       >
                         {splitCurrencyForDisplay(transaction.total_amount, currencySymbol || "$").decimals}
                       </Text>
                     </HStack>
                   </Td>
                  <Td>
                    <ChakraLink
                      as={Link}
                      to={`/account/${transaction.account_id}`}
                      color="blue.500"
                      fontSize="sm"
                    >
                      {transaction.account_name ||
                        `Account ${transaction.account_id}`}
                    </ChakraLink>
                  </Td>
                  <Td width="2%">
                    <Flex
                      gap={2}
                      opacity={0}
                      transition="opacity 0.2s"
                      className="action-icons"
                    >
                      <AssetTransactionNotesPopover
                        transaction={transaction}
                        isOpen={openPopoverId === transaction.asset_transaction_id}
                        onOpen={() =>
                          handlePopoverOpen(transaction.asset_transaction_id)
                        }
                        onClose={handlePopoverClose}
                      />
                      <ChakraLink
                        onClick={() => {
                          setSelectedTransactionId(
                            transaction.asset_transaction_id,
                          );
                          onOpen();
                        }}
                        _hover={{ textDecoration: "none" }}
                      >
                        <Icon
                          as={Trash2}
                          boxSize={4}
                          color="red.500"
                          _hover={{ color: "red.600" }}
                          transition="opacity 0.2s"
                          data-testid="asset-transaction-delete-icon"
                        />
                      </ChakraLink>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={isMobile ? "full" : "md"}
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent
          margin={isMobile ? 0 : "auto"}
          borderRadius={isMobile ? 0 : "md"}
        >
          <ModalHeader>Delete Asset Transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Are you sure you want to delete this asset transaction? This will
              also delete the associated financial transaction and cannot be
              undone.
            </Text>
            {selectedTransactionId && (
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold">
                  {sortedTransactions.find(t => t.asset_transaction_id === selectedTransactionId)?.physical_asset?.name || "Asset"}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {selectedTransactionId && formatDate(
                    sortedTransactions.find(t => t.asset_transaction_id === selectedTransactionId)?.transaction_date || ""
                  )}
                </Text>
                 <HStack spacing={0} align="baseline">
                   <Text fontSize="sm" fontWeight="semibold" color={
                     sortedTransactions.find(t => t.asset_transaction_id === selectedTransactionId)?.transaction_type === "buy"
                       ? "red.500"
                       : "green.500"
                   }>
                     {selectedTransactionId && splitCurrencyForDisplay(
                       sortedTransactions.find(t => t.asset_transaction_id === selectedTransactionId)?.total_amount || 0,
                       currencySymbol || "$"
                     ).main}
                   </Text>
                   <Text fontSize="xs" fontWeight="semibold" opacity={0.7} color={
                     sortedTransactions.find(t => t.asset_transaction_id === selectedTransactionId)?.transaction_type === "buy"
                       ? "red.500"
                       : "green.500"
                   }>
                     {selectedTransactionId && splitCurrencyForDisplay(
                       sortedTransactions.find(t => t.asset_transaction_id === selectedTransactionId)?.total_amount || 0,
                       currencySymbol || "$"
                     ).decimals}
                   </Text>
                 </HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={onClose}
              leftIcon={<X size={18} />}
              isDisabled={deleteAssetTransactionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDelete}
              isLoading={deleteAssetTransactionMutation.isPending}
              loadingText="Deleting..."
              leftIcon={<Trash2 size={18} />}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AssetTransactionHistory;

