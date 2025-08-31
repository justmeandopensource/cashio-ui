import React, { useState } from "react";
import { formatDate, formatNumberAsCurrency } from "@/components/shared/utils";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  Popover,
  PopoverContent,
  PopoverBody,
  Stack,
  Box,
  Text,
  PopoverTrigger,
  Square,
  PopoverArrow,
  Flex,
  PopoverHeader,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { CreditCard, Trash2, Edit, X } from "lucide-react";
import { Link } from "react-router-dom";
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
  notes?: string;
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
  account_id?: string;
  account_name?: string;
  tags?: TagItem[];
  is_split: boolean;
  is_transfer: boolean;
  notes?: string;
  credit: number;
  debit: number;
  transfer_id?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  // eslint-disable-next-line no-unused-vars
  fetchSplitTransactions: (transactionId: string) => void;
  // eslint-disable-next-line no-unused-vars
  fetchTransferDetails: (transferId: string) => void;
  isSplitLoading: boolean;
  splitTransactions: SplitTransaction[];
  isTransferLoading: boolean;
  transferDetails?: TransferDetails;
  // eslint-disable-next-line no-unused-vars
  onDeleteTransaction: (transactionId: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  onEditTransaction: (transaction: Transaction) => void;
  showAccountName?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  fetchSplitTransactions,
  fetchTransferDetails,
  isSplitLoading,
  splitTransactions,
  isTransferLoading,
  transferDetails,
  onDeleteTransaction,
  onEditTransaction,
  showAccountName = false,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  const { currencySymbol } = useLedgerStore();

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!selectedTransactionId) return;
    try {
      await onDeleteTransaction(selectedTransactionId);
      onClose();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th width="8%">Date</Th>
            <Th width="15%">Category</Th>
            {showAccountName && <Th width="12%">Account</Th>}
            <Th width="20%">Tags</Th>
            <Th width="3%">Type</Th>
            <Th>Notes</Th>
            <Th width="10%" isNumeric>
              Credit
            </Th>
            <Th width="10%" isNumeric>
              Debit
            </Th>
            <Th width="2%">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions.map((transaction) => (
            <Tr
              key={transaction.transaction_id}
              _hover={{ bg: "gray.100" }}
              sx={{
                "&:hover .action-icons": {
                  opacity: 1,
                },
              }}
            >
              <Td width="8%">{formatDate(transaction.date)}</Td>
              <Td width="15%">{transaction.category_name}</Td>
              {showAccountName && (
                <Td width="12%">
                  {transaction.account_name && transaction.account_id && (
                    <ChakraLink as={Link} to={`/account/${transaction.account_id}`} color="blue.500">
                      {transaction.account_name}
                    </ChakraLink>
                  )}
                </Td>
              )}
              <Td width="20%">
                <Wrap spacing={2}>
                  {transaction.tags?.map((tag) => (
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
              </Td>
              <Td width="3%">
                {transaction.is_split && (
                  <Popover
                    onOpen={() =>
                      fetchSplitTransactions(transaction.transaction_id)
                    }
                    strategy="fixed"
                    placement="right"
                    gutter={10}
                  >
                    <PopoverTrigger>
                      <Box display="inline-block" p={1}>
                        <Square
                          size="10px"
                          bg="purple.400"
                          cursor="pointer"
                          borderRadius="md"
                          data-testid="transactiontable-split-indicator"
                        />
                      </Box>
                    </PopoverTrigger>
                    <PopoverContent
                      bg="teal.100"
                      color="white"
                      minW="400px"
                      maxW="800px"
                      width="auto"
                      overflow="hidden"
                    >
                      <PopoverArrow bg="teal.100" />
                      <PopoverBody p={0}>
                        {isSplitLoading ? (
                          <Flex justify="center" align="center" minH="100px">
                            <SplitTransactionSkeleton />
                          </Flex>
                        ) : (
                          <Box>
                            <Flex
                              bgGradient="linear(to-r, teal.400, teal.600)"
                              p={2}
                              fontWeight="bold"
                            >
                              <Box flex="2" color="white">
                                Category
                              </Box>
                              <Box flex="1" textAlign="right" color="white">
                                Amount
                              </Box>
                              <Box flex="3" ml={4} color="white">
                                Notes
                              </Box>
                            </Flex>
                            {splitTransactions.map((split) => (
                              <Flex
                                key={split.split_id}
                                p={3}
                                borderBottomWidth="1px"
                                borderColor="teal.200"
                                _hover={{ bg: "teal.50" }}
                                align="center"
                              >
                                <Box
                                  flex="2"
                                  color="teal.900"
                                  fontWeight="medium"
                                >
                                  {split.category_name}
                                </Box>
                                <Box
                                  flex="1"
                                  textAlign="right"
                                  color="teal.900"
                                  fontWeight="bold"
                                >
                                  {formatNumberAsCurrency(
                                    split.debit,
                                    currencySymbol as string,
                                  )}
                                </Box>
                                <Box flex="3" ml={4} color="teal.900">
                                  {split.notes || "-"}
                                </Box>
                              </Flex>
                            ))}
                          </Box>
                        )}
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                )}
                {transaction.is_transfer && (
                  <Popover
                    onOpen={() =>
                      fetchTransferDetails(transaction.transfer_id!)
                    }
                  >
                    <PopoverTrigger>
                      <Box display="inline-block" p={1}>
                        <Square
                          size="10px"
                          bg="blue.400"
                          cursor="pointer"
                          borderRadius="md"
                          data-testid="transactiontable-transfer-indicator"
                        />
                      </Box>
                    </PopoverTrigger>
                    <PopoverContent bg="teal.100" color="white" maxW="300px">
                      <PopoverArrow bg="teal.100" />
                      <PopoverHeader
                        bgGradient="linear(to-r, teal.400, teal.600)"
                        color="white"
                        borderTopRadius="md"
                        py={3}
                        px={4}
                      >
                        <Flex align="center">
                          <Icon as={CreditCard} mr={2} />
                          <Text fontWeight="bold">
                            {transaction.debit > 0
                              ? "Funds transferred to"
                              : "Funds transferred from"}
                          </Text>
                        </Flex>
                      </PopoverHeader>
                      <PopoverBody>
                        {isTransferLoading ? (
                          <Flex justify="center" align="center" minH="100px">
                            <TransferDetailsSkeleton />
                          </Flex>
                        ) : transferDetails ? (
                          <Stack spacing={4} py={2}>
                            <Box
                              p={4}
                              borderWidth="1px"
                              borderRadius="md"
                              bg="teal.50"
                              boxShadow="sm"
                              textAlign="center"
                            >
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="teal.900"
                                mb={2}
                              >
                                {transaction.debit > 0
                                  ? transferDetails.destination_account_name ||
                                    "N/A"
                                  : transferDetails.source_account_name ||
                                    "N/A"}
                              </Text>
                              <Text fontSize="sm" color="teal.700">
                                {transaction.debit > 0
                                  ? transferDetails.destination_ledger_name ||
                                    "N/A"
                                  : transferDetails.source_ledger_name || "N/A"}
                              </Text>
                            </Box>
                          </Stack>
                        ) : (
                          <Text color="teal.900">
                            No transfer details available.
                          </Text>
                        )}
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                )}
              </Td>
              <Td>{transaction.notes}</Td>
              <Td width="10%" isNumeric>
                {transaction.credit !== 0 && (
                  <Text color="teal.500">
                    {formatNumberAsCurrency(
                      transaction.credit,
                      currencySymbol as string,
                    )}
                  </Text>
                )}
              </Td>
              <Td width="10%" isNumeric>
                {transaction.debit !== 0 && (
                  <Text color="red.500">
                    {formatNumberAsCurrency(
                      transaction.debit,
                      currencySymbol as string,
                    )}
                  </Text>
                )}
              </Td>
              <Td width="2%">
                <Flex
                  gap={2}
                  opacity={0}
                  transition="opacity 0.2s"
                  className="action-icons"
                >
                  {!transaction.is_transfer && (
                    <ChakraLink
                      onClick={() => onEditTransaction(transaction)}
                      _hover={{ textDecoration: "none" }}
                    >
                      <Icon
                        as={Edit}
                        boxSize={4}
                        color="blue.500"
                        _hover={{ color: "blue.600" }}
                        transition="opacity 0.2s"
                        data-testid="transactiontable-edit-icon"
                      />
                    </ChakraLink>
                  )}
                  <ChakraLink
                    onClick={() => {
                      setSelectedTransactionId(transaction.transaction_id);
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
                      data-testid="transactiontable-trash-icon"
                    />
                  </ChakraLink>
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this transaction?
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} leftIcon={<X size={18} />}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete} leftIcon={<Trash2 size={18} />}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TransactionTable;
