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
  Spinner,
  PopoverHeader,
  Icon,
} from "@chakra-ui/react";
import { FiCreditCard } from "react-icons/fi";

const TransactionTable = ({
  transactions,
  currencySymbolCode,
  fetchSplitTransactions,
  fetchTransferDetails,
  isSplitLoading,
  splitTransactions,
  isTransferLoading,
  transferDetails,
}) => {
  return (
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th width="8%">Date</Th>
          <Th width="15%">Category</Th>
          <Th width="20%">Tags</Th>
          <Th width="3%">Type</Th>
          <Th>Notes</Th>
          <Th width="10%" isNumeric>
            Credit
          </Th>
          <Th width="10%" isNumeric>
            Debit
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {transactions.map((transaction) => (
          <Tr key={transaction.transaction_id} _hover={{ bg: "gray.100" }}>
            <Td width="8%">{formatDate(transaction.date)}</Td>
            <Td width="15%">{transaction.category_name}</Td>
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
                >
                  <PopoverTrigger>
                    <Box display="inline-block" p={1}>
                      <Square
                        size="10px"
                        bg="purple.400"
                        cursor="pointer"
                        borderRadius="md"
                      />
                    </Box>
                  </PopoverTrigger>
                  <PopoverContent bg="teal.100" color="white">
                    <PopoverArrow bg="teal.100" />
                    <PopoverBody>
                      {isSplitLoading ? (
                        <Flex justify="center" align="center" minH="100px">
                          <Spinner />
                        </Flex>
                      ) : (
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr bgGradient="linear(to-r, teal.400, teal.600)">
                              <Th color="white">Category</Th>
                              <Th color="white" isNumeric>
                                Debit
                              </Th>
                              <Th color="white">Notes</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {splitTransactions.map((split) => (
                              <Tr
                                key={split.split_id}
                                _hover={{ bg: "teal.50" }}
                              >
                                <Td color="teal.900">{split.category_name}</Td>
                                <Td color="teal.900" isNumeric>
                                  {formatNumberAsCurrency(
                                    split.debit,
                                    currencySymbolCode,
                                  )}
                                </Td>
                                <Td color="teal.900">{split.notes}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      )}
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              )}
              {transaction.is_transfer && (
                <Popover
                  onOpen={() => fetchTransferDetails(transaction.transfer_id)}
                >
                  <PopoverTrigger>
                    <Box display="inline-block" p={1}>
                      <Square
                        size="10px"
                        bg="blue.400"
                        cursor="pointer"
                        borderRadius="md"
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
                        <Icon as={FiCreditCard} mr={2} />
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
                          <Spinner />
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
                                : transferDetails.source_account_name || "N/A"}
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
                    currencySymbolCode,
                  )}
                </Text>
              )}
            </Td>
            <Td width="10%" isNumeric>
              {transaction.debit !== 0 && (
                <Text color="red.500">
                  {formatNumberAsCurrency(
                    transaction.debit,
                    currencySymbolCode,
                  )}
                </Text>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default TransactionTable;
